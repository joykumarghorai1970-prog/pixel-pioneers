import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState} from './data.js';
import {availablePerk,filterOpportunities,addCredit,streakSummary,acceptPlan,isBlocked} from './domain.js';
test('both perks require verified AND match; unknown stock is disclosed but permitted',()=>{
 const s=seedState();assert.deepEqual(filterOpportunities(s.events,{food:true,goodies:true}).map(e=>e.id),['hack','open']);
 for(const patch of [{verified:false},{availability:'Exhausted'},{availability:'Withdrawn'},{type:'Competition prize'},{status:'Not announced'}])assert.equal(availablePerk({...s.events[0].goodies,...patch}),false);
});
test('one credit per calendar day and repeated task completion cannot earn again',()=>{
 let credits=addCredit([],{id:'a',status:'completed',qualifying:true});
 credits=addCredit(credits,{id:'a',status:'completed',qualifying:true},'2026-10-04');
 credits=addCredit(credits,{id:'b',status:'completed',qualifying:true});
 assert.equal(credits.length,2);assert.equal(streakSummary(credits).current,1);
 assert.equal(addCredit(credits,{id:'c',status:'review',qualifying:true}).length,2);
});
test('one frozen day preserves count, second missed day resets it',()=>{
 const credits=[{taskId:'a',day:'2026-09-28'}];
 const first=streakSummary(credits,'2026-09-30');assert.equal(first.current,1);assert.deepEqual(first.frozen,['2026-09-29']);assert.equal(first.freeze,0);
 const second=streakSummary(credits,'2026-10-01');assert.equal(second.current,0);assert.equal(second.longest,1);
});
test('delayed credit recalculates original day and freeze without duplication',()=>{
 const credits=[{taskId:'a',day:'2026-09-28'},{taskId:'c',day:'2026-09-30'}];
 assert.equal(streakSummary(credits,'2026-09-30').freeze,0);
 const delayed=addCredit(credits,{id:'b',status:'completed',qualifying:true},'2026-09-29');
 assert.equal(streakSummary(delayed,'2026-09-30').current,3);assert.equal(streakSummary(delayed,'2026-09-30').freeze,1);
});
test('accepted plan is idempotent and dependency blocks until completed',()=>{
 const event=seedState().events[1],tasks=acceptPlan([],event);
 assert.equal(acceptPlan(tasks,event).length,2);assert.equal(isBlocked(tasks[1],tasks),true);
 tasks[0].status='completed';assert.equal(isBlocked(tasks[1],tasks),false);
});
