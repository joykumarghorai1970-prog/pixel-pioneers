import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {loadEnv} from './env.js';
import {opportunitySchema} from './notion-schema.js';
import {checkConnection, createOpportunity, getOpportunities, mapOpportunityPage, notionRequest, updateOpportunityDeadline} from './notion.js';
import {createCampusServer} from './server.js';
import {mergeNotionOpportunities} from './domain.js';

const ds = '11111111-1111-1111-1111-111111111111', pid = '22222222-2222-2222-2222-222222222222';
const schema = {id: ds, properties: Object.fromEntries(Object.entries(opportunitySchema).map(([name, value]) => [name, {type: Object.keys(value)[0]}]))};
const page = (properties = {}) => ({id: pid, url: `https://www.notion.so/${pid}`, parent: {data_source_id: ds}, last_edited_time: '2026-10-03T12:00:00.000Z', properties: {
  Title: {type: 'title', title: [{plain_text: 'Campus event'}]}, Published: {type: 'checkbox', checkbox: true},
  'Application ID': {type: 'rich_text', rich_text: [{plain_text: 'event-1'}]},
  Deadline: {id: 'deadline', type: 'date', date: {start: '2026-10-08'}},
  'Event date': {type: 'date', date: {start: '2026-10-10T19:00:00+05:30'}}, ...properties}});
const event = {id: 'event-1', title: 'Campus event', date: '2026-10-10', deadline: '2026-10-08', published: true, requirements: ['Bring laptop', 'Register']};
function setup(t, handler) {
  const old = {...process.env};
  process.env.NOTION_API_KEY = 'test-secret-not-real'; process.env.NOTION_OPPORTUNITIES_DATA_SOURCE_ID = ds;
  t.mock.method(globalThis, 'fetch', handler);
  t.after(() => {for (const key of ['NOTION_API_KEY','NOTION_OPPORTUNITIES_DATA_SOURCE_ID','NOTION_VERSION']) {
    if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];
  }});
}
const response = (body, status=200, headers={}) => new Response(JSON.stringify(body), {status, headers});

test('environment loads local settings first and does not override shell values', async () => {
  const folder = await mkdtemp(path.join(os.tmpdir(), 'campusnext-env-'));
  try {
    await writeFile(path.join(folder,'.env'), 'A=base\nB=base\nC=base\n');
    await writeFile(path.join(folder,'.env.local'), 'A="local"\nB=local\n');
    const env={B:'shell'};await loadEnv(folder,env);assert.deepEqual(env,{A:'local',B:'shell',C:'base'});
  } finally {await rm(folder,{recursive:true,force:true});}
});
test('Notion mapping handles checkbox publication, exact statuses, multiline requirements and dates', () => {
  assert.equal(mapOpportunityPage(page()).published,true);
  for(const status of ['Unpublished','Not approved','Not live','Draft']) {
    assert.equal(mapOpportunityPage(page({Published:{type:'status',status:{name:status}}})).published,false);
  }
  assert.equal(mapOpportunityPage({...page(),in_trash:true}).published,false);
  const mapped=mapOpportunityPage(page({Requirements:{type:'rich_text',rich_text:[{plain_text:'Laptop\nRegister'}]}}));
  assert.deepEqual(mapped.requirements,['Laptop','Register']);assert.equal(mapped.date,'2026-10-10');
});
test('sync follows all cursors and refuses incomplete pagination', async t => {
  const calls=[];setup(t,async(url,options)=>{calls.push(JSON.parse(options.body));return response(calls.length===1?{results:[page()],has_more:true,next_cursor:'next'}:{results:[],has_more:false});});
  assert.equal((await getOpportunities()).length,1);assert.equal(calls[1].start_cursor,'next');
  globalThis.fetch=async()=>response({results:[],has_more:true,next_cursor:null});
  await assert.rejects(getOpportunities(),/pagination/);
});
test('configuration uses the loaded API version and never returns credentials',async t=>{
  setup(t,async(url,options)=>{assert.equal(options.headers['Notion-Version'],'2025-09-03');return response(schema);});
  process.env.NOTION_VERSION='2025-09-03';const status=await checkConnection();
  assert.equal(status.connected,true);assert.equal(status.canPublish,true);assert.ok(!JSON.stringify(status).includes(process.env.NOTION_API_KEY));
  process.env.NOTION_OPPORTUNITIES_DATA_SOURCE_ID='your_data_source_id';assert.equal((await checkConnection()).configured,false);
});
test('publishing writes the schema and concurrent retries return one Notion page',async t=>{
  let created=false,creates=0;
  setup(t,async(url,options)=>{
    if(url.endsWith('/query'))return response({results:created?[page()]:[]});
    if(url.endsWith('/pages')){
      creates++;const body=JSON.parse(options.body);assert.equal(body.parent.data_source_id,ds);
      assert.equal(body.properties.Published.checkbox,true);assert.equal(body.properties.Requirements.rich_text[0].text.content,'Bring laptop\nRegister');
      created=true;return response(page());
    }
    return response(schema);
  });
  const result=await Promise.all([createOpportunity(event),createOpportunity(event)]);
  assert.equal(creates,1);assert.equal(result[0].notionPageId,result[1].notionPageId);
  await assert.rejects(createOpportunity({...event,deadline:'2026-02-30'}),/valid date/);
});
test('deadline writes refuse stale revisions and pages outside the connected data source',async t=>{
  let current=page(),patches=0;
  setup(t,async(url,options)=>{if(options.method==='PATCH'){patches++;assert.deepEqual(JSON.parse(options.body),{properties:{deadline:{date:{start:'2026-10-09'}}}});}return response(current);});
  await assert.rejects(updateOpportunityDeadline(pid,{deadline:'2026-10-09',expectedRevision:'stale'}),e=>e.code==='NOTION_CONFLICT');
  current={...page(),parent:{data_source_id:'33333333-3333-3333-3333-333333333333'}};
  await assert.rejects(updateOpportunityDeadline(pid,{deadline:'2026-10-09',expectedRevision:current.last_edited_time}),e=>e.status===403);
  assert.equal(patches,0);current=page();await updateOpportunityDeadline(pid,{deadline:'2026-10-09',expectedRevision:current.last_edited_time});assert.equal(patches,1);
});
test('sync preserves local records and stable plan IDs, creates one notice and hides missing remote events',()=>{
  const old={...mapOpportunityPage(page()),id:'kept-local-id'},local={id:'local',published:true};
  const incoming={...old,id:'new-app-id',deadline:'2026-10-09',notionRevision:'new'};
  const merged=mergeNotionOpportunities([local,old],[],[incoming]);
  assert.equal(merged.events[1].id,'kept-local-id');assert.equal(merged.events[0].id,'local');assert.equal(merged.changes.length,1);
  assert.equal(mergeNotionOpportunities(merged.events,merged.changes,[incoming]).changes.length,1);
  const removed=mergeNotionOpportunities(merged.events,merged.changes,[]);
  assert.equal(removed.events[0].published,true);assert.equal(removed.events[1].published,false);assert.equal(removed.events[1].unavailable,true);
});
test('explicit rate limits retry, but uncertain writes are never blindly replayed',async t=>{
  let calls=0;setup(t,async()=>++calls===1?response({message:'rate limited'},429,{'retry-after':'0'}):response({id:pid}));
  await notionRequest('/pages',{method:'POST',body:{}});assert.equal(calls,2);
  calls=0;globalThis.fetch=async()=>{calls++;throw new Error('offline');};
  await assert.rejects(notionRequest('/pages',{method:'POST',body:{}}),/may have completed/);assert.equal(calls,1);
});
test('local server serves only browser assets and rejects cross-origin writes',async t=>{
  const server=createCampusServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url=`http://127.0.0.1:${server.address().port}`;
  for(const file of ['.env.local','notion.js','server.js','package.json'])assert.equal((await fetch(`${url}/${file}`)).status,404);
  assert.equal((await fetch(`${url}/app.js`)).status,200);
  assert.equal((await fetch(`${url}/api/notion/opportunities`,{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(`${url}/api/notion/opportunities`,{method:'POST',body:'{}'})).status,415);
});
