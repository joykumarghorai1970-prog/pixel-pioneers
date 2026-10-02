const NOTION_API = 'https://api.notion.com/v1';
export const NOTION_VERSION = process.env.NOTION_VERSION || '2026-03-11';

const cleanId = value => String(value || '').trim().replace(/[{}]/g, '');
const config = () => ({
  token: String(process.env.NOTION_API_KEY || '').trim(),
  opportunitiesDataSourceId: cleanId(process.env.NOTION_OPPORTUNITIES_DATA_SOURCE_ID),
  parentPageId: cleanId(process.env.NOTION_PARENT_PAGE_ID)
});

export function notionConfigStatus() {
  const c = config();
  return {
    configured: Boolean(c.token && c.opportunitiesDataSourceId),
    hasToken: Boolean(c.token),
    hasOpportunitiesDataSource: Boolean(c.opportunitiesDataSourceId),
    opportunitiesDataSourceId: c.opportunitiesDataSourceId || null,
    notionVersion: NOTION_VERSION
  };
}

async function notionRequest(path, options = {}) {
  const c = config();
  if (!c.token) throw new Error('NOTION_API_KEY is not configured on the server.');
  const response = await fetch(`${NOTION_API}${path}`, {
    method: options.method || 'GET',
    headers: {Authorization: `Bearer ${c.token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json'},
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = {message: text}; }
  if (!response.ok) {
    const error = new Error(payload.message || `Notion request failed with ${response.status}.`);
    error.status = response.status; error.code = payload.code; throw error;
  }
  return payload;
}

const property = (page, names) => {
  const wanted = names.map(name => name.toLowerCase());
  const entry = Object.entries(page?.properties || {}).find(([key, value]) => wanted.includes(key.toLowerCase()) || wanted.includes(String(value?.name || '').toLowerCase()));
  return entry?.[1];
};
function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(x => x.plain_text || x.text?.content || '').join('');
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(x => x.plain_text || x.text?.content || '').join('');
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'status') return prop.status?.name || '';
  if (prop.type === 'date') return prop.date?.start || '';
  if (prop.type === 'url') return prop.url || '';
  if (prop.type === 'number') return prop.number == null ? '' : String(prop.number);
  if (prop.type === 'checkbox') return prop.checkbox ? 'true' : 'false';
  if (prop.type === 'formula') return plain(prop.formula);
  return '';
}
const bool = prop => prop?.type === 'checkbox' ? Boolean(prop.checkbox) : /^(true|yes|published|verified)$/i.test(plain(prop));
const first = (...values) => values.find(value => value !== undefined && value !== null && String(value).trim() !== '') || '';

export function mapOpportunityPage(page) {
  const title = first(plain(property(page, ['Title', 'Name', 'Opportunity'])), 'Untitled opportunity');
  const status = plain(property(page, ['Published', 'Publication status', 'Status']));
  const event = {
    id: page.id, notionPageId: page.id, title, shortTitle: title,
    category: first(plain(property(page, ['Category', 'Type'])), 'Opportunity'),
    club: first(plain(property(page, ['Club', 'Organizer', 'Organizing club'])), 'Campus organizer'),
    date: first(plain(property(page, ['Event date', 'Date', 'Event'])), ''),
    deadline: first(plain(property(page, ['Registration deadline', 'Deadline', 'Apply by'])), ''),
    venue: first(plain(property(page, ['Venue', 'Location'])), 'Not announced'),
    eligibility: first(plain(property(page, ['Eligibility', 'Who can join'])), 'Unknown — ask the organizer'),
    requirements: plain(property(page, ['Requirements', 'Prerequisites'])).split(/\n|,/).map(x => x.trim()).filter(Boolean),
    food: {status: first(plain(property(page, ['Food status', 'Food'])), 'Not announced'), details: first(plain(property(page, ['Food details', 'Food description'])), 'Not announced'), condition: plain(property(page, ['Food conditions', 'Food condition'])), availability: first(plain(property(page, ['Food availability'])), 'Unknown'), verified: bool(property(page, ['Food verified', 'Food verification']))},
    goodies: {status: first(plain(property(page, ['Goodies status', 'Goodies'])), 'Not announced'), details: first(plain(property(page, ['Goodies details', 'Goodies description'])), 'Not announced'), condition: plain(property(page, ['Goodies conditions', 'Goodies condition'])), availability: first(plain(property(page, ['Goodies availability'])), 'Unknown'), verified: bool(property(page, ['Goodies verified', 'Goodies verification']))},
    teamNeed: first(plain(property(page, ['Team need', 'Open roles'])), 'Not announced'),
    source: first(plain(property(page, ['Source', 'Source reference', 'Announcement source'])), `Notion page ${page.id}`),
    sourceUrl: page.url, updated: page.last_edited_time ? new Date(page.last_edited_time).toLocaleString('en-IN') : '',
    published: status ? /published|approved|live/i.test(status) : true, sourceMode: 'notion'
  };
  event.tagline = title.toUpperCase(); event.cover = 'open'; event.description = first(plain(property(page, ['Description', 'Summary'])), title); event.reason = 'Loaded from your authorized Notion data source';
  return event;
}

export async function getOpportunities() {
  const c = config();
  if (!c.opportunitiesDataSourceId) throw new Error('NOTION_OPPORTUNITIES_DATA_SOURCE_ID is not configured on the server.');
  const pages = []; let cursor;
  do {
    const result = await notionRequest(`/data_sources/${encodeURIComponent(c.opportunitiesDataSourceId)}/query`, {method: 'POST', body: cursor ? {start_cursor: cursor, page_size: 100} : {page_size: 100}});
    pages.push(...(result.results || [])); cursor = result.has_more ? result.next_cursor : null;
  } while (cursor);
  return pages.map(mapOpportunityPage);
}

export async function checkConnection() {
  const c = config();
  if (!c.token || !c.opportunitiesDataSourceId) return {connected: false, ...notionConfigStatus(), reason: 'Missing server configuration.'};
  try {
    const dataSource = await notionRequest(`/data_sources/${encodeURIComponent(c.opportunitiesDataSourceId)}`);
    return {connected: true, ...notionConfigStatus(), dataSource: {id: dataSource.id, title: dataSource.title?.map(x => x.plain_text || '').join('') || dataSource.id}};
  } catch (error) { return {connected: false, ...notionConfigStatus(), reason: error.message, statusCode: error.status || 500}; }
}

export async function createOpportunity(event) {
  const c = config();
  if (!c.opportunitiesDataSourceId) throw new Error('NOTION_OPPORTUNITIES_DATA_SOURCE_ID is not configured on the server.');
  const result = await notionRequest('/pages', {method: 'POST', body: {parent: {data_source_id: c.opportunitiesDataSourceId}, properties: {
    Title: {title: [{text: {content: String(event.title || 'Untitled opportunity')}}]},
    'Event date': {date: event.date ? {start: event.date} : null}, Deadline: {date: event.deadline ? {start: event.deadline} : null},
    Organizer: {rich_text: [{text: {content: String(event.club || '')}}]}, Category: {select: {name: String(event.category || 'Opportunity')}}
  }}});
  return mapOpportunityPage(result);
}
