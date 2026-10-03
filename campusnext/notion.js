import {setTimeout as delay} from 'node:timers/promises';
import {missingSchemaFields} from './notion-schema.js';

const NOTION_API = 'https://api.notion.com/v1';
const apiError = (message, status = 503, code = 'NOTION_UNAVAILABLE') => Object.assign(new Error(message), {status, code});
export function cleanId(value) {
  const raw = String(value || '').trim().replace(/[{}]/g, '');
  if (!/^(?:[a-f\d]{32}|[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})$/i.test(raw)) return '';
  return raw.replace(/-/g, '').toLowerCase().replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
const config = () => ({token: String(process.env.NOTION_API_KEY || '').trim(),
  dataSourceId: cleanId(process.env.NOTION_OPPORTUNITIES_DATA_SOURCE_ID), version: process.env.NOTION_VERSION || '2026-03-11'});
export function notionConfigStatus() {
  const c = config();
  return {configured: Boolean(c.token && c.dataSourceId), hasToken: Boolean(c.token),
    hasOpportunitiesDataSource: Boolean(c.dataSourceId), opportunitiesDataSourceId: c.dataSourceId || null, notionVersion: c.version};
}
function dataSourceId() {
  const id = config().dataSourceId;
  if (!id) throw apiError('Set a valid NOTION_OPPORTUNITIES_DATA_SOURCE_ID in .env.local, then restart the server.', 503, 'NOTION_SETUP_REQUIRED');
  return id;
}
export async function notionRequest(path, options = {}) {
  const c = config();
  if (!c.token) throw apiError('Set NOTION_API_KEY on the server.', 503, 'NOTION_SETUP_REQUIRED');
  for (let attempt = 0; attempt < 3; attempt++) {
    let response;
    try {
      response = await fetch(`${NOTION_API}${path}`, {method: options.method || 'GET',
        headers: {Authorization: `Bearer ${c.token}`, 'Notion-Version': c.version, 'Content-Type': 'application/json'},
        body: options.body === undefined ? undefined : JSON.stringify(options.body), signal: AbortSignal.timeout(15000)});
    } catch {
      throw apiError('Notion could not be reached. A write may have completed; sync before retrying.', 503, 'NOTION_NETWORK_ERROR');
    }
    // Retry explicit throttling only, never blindly replay an uncertain write.
    if (response.status === 429 && attempt < 2) {
      const seconds = Number(response.headers.get('retry-after') || 1);
      if (Number.isFinite(seconds) && seconds >= 0 && seconds <= 10) {
        await response.arrayBuffer(); await delay(seconds * 1000); continue;
      }
    }
    let payload;
    try { payload = await response.json(); }
    catch { throw apiError('Notion returned an unreadable response. Sync before retrying a write.'); }
    if (!response.ok) throw apiError(String(payload.message || `Notion request failed (${response.status}).`).split(c.token).join('[redacted]'), response.status, payload.code);
    return payload;
  }
}
const property = (page, names) => {
  for (const name of names) {
    const entry = Object.entries(page?.properties || {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (entry) return entry[1];
  }
};
function plain(prop) {
  if (!prop) return '';
  if (['title', 'rich_text'].includes(prop.type)) return (prop[prop.type] || []).map(x => x.plain_text ?? x.text?.content ?? '').join('');
  if (['select', 'status'].includes(prop.type)) return prop[prop.type]?.name || '';
  if (prop.type === 'multi_select') return prop.multi_select.map(x => x.name).join('\n');
  if (prop.type === 'date') return prop.date?.start?.slice(0, 10) || '';
  if (prop.type === 'url') return prop.url || '';
  if (prop.type === 'number') return prop.number == null ? '' : String(prop.number);
  if (prop.type === 'checkbox') return prop.checkbox ? 'true' : 'false';
  if (prop.type === 'formula') return plain(prop.formula);
  if (prop.type === 'string') return prop.string || '';
  if (prop.type === 'boolean') return String(prop.boolean);
  return '';
}
const bool = prop => /^(true|yes|published|approved|live|verified)$/i.test(plain(prop).trim());
export function mapOpportunityPage(page) {
  const read = (...names) => plain(property(page, names));
  const title = read('Title', 'Name', 'Opportunity') || 'Untitled opportunity';
  const perk = name => ({status: read(`${name} status`, name) || 'Not announced',
    details: read(`${name} details`, `${name} description`) || 'Not announced', condition: read(`${name} conditions`, `${name} condition`),
    availability: read(`${name} availability`) || 'Unknown', verified: bool(property(page, [`${name} verified`, `${name} verification`])),
    type: read(`${name} type`) || 'Included benefit'});
  return {
    id: /^[\w-]{1,100}$/.test(read('Application ID')) ? read('Application ID') : page.id, notionPageId: page.id, title, shortTitle: title,
    category: read('Category', 'Type') || 'Opportunity', club: read('Club', 'Organizer', 'Organizing club') || 'Campus organizer',
    date: read('Event date', 'Date', 'Event'), deadline: read('Registration deadline', 'Deadline', 'Apply by'),
    venue: read('Venue', 'Location') || 'Not announced', eligibility: read('Eligibility', 'Who can join') || 'Unknown — ask the organizer',
    requirements: read('Requirements', 'Prerequisites').split(/\r?\n|,/).map(x => x.trim()).filter(Boolean),
    food: perk('Food'), goodies: perk('Goodies'), teamNeed: read('Team need', 'Open roles') || 'Not announced',
    source: read('Source', 'Source reference', 'Announcement source') || 'Notion opportunity', sourceText: read('Source text'),
    sourceUrl: page.url, notionRevision: page.last_edited_time, updated: page.last_edited_time || '',
    published: !page.in_trash && !page.archived && !page.is_archived && bool(property(page, ['Published', 'Publication status', 'Status'])),
    sourceMode: 'notion', tagline: title.toUpperCase(), cover: 'open', description: read('Description', 'Summary') || title,
    reason: 'From your campus Notion database'
  };
}
export async function getOpportunities() {
  const id = dataSourceId(), pages = [], cursors = new Set();
  let cursor;
  do {
    const result = await notionRequest(`/data_sources/${id}/query`, {method: 'POST', body: {page_size: 100, ...(cursor ? {start_cursor: cursor} : {})}});
    if (!Array.isArray(result.results)) throw apiError('Notion returned an invalid opportunities list.');
    pages.push(...result.results); cursor = result.has_more ? result.next_cursor : null;
    if (result.has_more && (!cursor || cursors.has(cursor))) throw apiError('Notion pagination did not advance. Please retry sync.');
    if (cursor) cursors.add(cursor);
  } while (cursor);
  const events = pages.map(mapOpportunityPage);
  if (new Set(events.map(e => e.id)).size !== events.length) throw apiError('Duplicate Application IDs in Notion. Give each opportunity a unique Application ID.');
  return events;
}
export async function checkConnection() {
  try {
    const dataSource = await notionRequest(`/data_sources/${dataSourceId()}`), missingFields = missingSchemaFields(dataSource);
    return {connected: true, ...notionConfigStatus(), canPublish: !missingFields.length, missingFields,
      dataSource: {id: dataSource.id, title: dataSource.title?.map(x => x.plain_text || x.text?.content || '').join('') || 'Opportunities & Events', url: dataSource.url}};
  } catch (error) { return {connected: false, ...notionConfigStatus(), canPublish: false, reason: error.message, statusCode: error.status || 500}; }
}
const rich = value => {
  const text = String(value || '');
  return Array.from({length: Math.ceil(text.length / 2000)}, (_, i) => ({text: {content: text.slice(i * 2000, (i + 1) * 2000)}}));
};
function validDate(value, name) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)
    throw apiError(`${name} must be a valid date (YYYY-MM-DD).`, 400, 'INVALID_OPPORTUNITY');
}
function buildProperties(event) {
  if (!event || typeof event !== 'object' || !/^[\w-]{1,100}$/.test(event.id || '')) throw apiError('A stable Application ID is required.', 400, 'INVALID_OPPORTUNITY');
  if (typeof event.title !== 'string' || !event.title.trim() || event.title.length > 2000) throw apiError('A title of 1–2000 characters is required.', 400, 'INVALID_OPPORTUNITY');
  validDate(event.date, 'Event date'); validDate(event.deadline, 'Deadline');
  if (event.deadline > event.date) throw apiError('Registration deadline must be on or before the event date.', 400, 'INVALID_OPPORTUNITY');
  const textFields = {'Application ID': event.id, Organizer: event.club, Description: event.description,
    Venue: event.venue, Eligibility: event.eligibility, Requirements: Array.isArray(event.requirements) ? event.requirements.join('\n') : event.requirements,
    Source: event.source, 'Source text': event.sourceText, 'Team need': event.teamNeed};
  for (const [name, value] of Object.entries(textFields)) {
    if (value != null && (typeof value !== 'string' || value.length > 10000)) throw apiError(`${name} must be text up to 10,000 characters.`, 400, 'INVALID_OPPORTUNITY');
  }
  const result = {Title: {title: rich(event.title.trim())}, 'Event date': {date: {start: event.date}}, Deadline: {date: {start: event.deadline}},
    Published: {checkbox: event.published === true}, Category: {select: {name: String(event.category || 'Opportunity')}},
    ...Object.fromEntries(Object.entries(textFields).map(([key, value]) => [key, {rich_text: rich(value)}]))};
  for (const name of ['Food', 'Goodies']) {
    const perk = event[name.toLowerCase()] || {};
    result[`${name} status`] = {select: {name: perk.status || 'Not announced'}};
    result[`${name} details`] = {rich_text: rich(perk.details)};
    result[`${name} conditions`] = {rich_text: rich(perk.condition)};
    result[`${name} availability`] = {select: {name: perk.availability || 'Unknown'}};
    result[`${name} verified`] = {checkbox: perk.verified === true};
    result[`${name} type`] = {select: {name: perk.type || 'Included benefit'}};
  }
  return result;
}
// Serialize local writes so simultaneous submissions cannot both pass the deduplication query.
let writes = Promise.resolve();
const serializeWrite = action => {const next = writes.then(action); writes = next.catch(() => {}); return next;};
export function createOpportunity(event) {
  return serializeWrite(async () => {
    const properties = buildProperties(event), id = dataSourceId();
    const missing = missingSchemaFields(await notionRequest(`/data_sources/${id}`));
    if (missing.length) throw apiError(`This data source needs the CampusNext schema. Missing: ${missing.join(', ')}.`, 422, 'NOTION_SCHEMA_MISMATCH');
    const existing = await notionRequest(`/data_sources/${id}/query`, {method: 'POST', body: {filter: {property: 'Application ID', rich_text: {equals: event.id}}, page_size: 2}});
    if (existing.results?.length > 1) throw apiError('Duplicate Application IDs exist in Notion; resolve them before publishing.', 409, 'NOTION_CONFLICT');
    // Retried creates return the acknowledged record; they never overwrite a newer edit.
    if (existing.results?.length) return mapOpportunityPage(existing.results[0]);
    return mapOpportunityPage(await notionRequest('/pages', {method: 'POST', body: {parent: {type: 'data_source_id', data_source_id: id}, properties}}));
  });
}
export function updateOpportunityDeadline(pageId, input) {
  return serializeWrite(async () => {
    if (!cleanId(pageId)) throw apiError('Invalid Notion page ID.', 400, 'INVALID_OPPORTUNITY');
    validDate(input?.deadline, 'Deadline');
    if (!input.expectedRevision) throw apiError('Sync the opportunity before updating it.', 409, 'NOTION_CONFLICT');
    const page = await notionRequest(`/pages/${cleanId(pageId)}`);
    if (cleanId(page.parent?.data_source_id) !== dataSourceId() || page.in_trash || page.archived || page.is_archived) throw apiError('Opportunity is not in the connected data source.', 403, 'NOTION_SCOPE_MISMATCH');
    if (page.last_edited_time !== input.expectedRevision) throw apiError('This opportunity changed in Notion. Sync and review it before saving again.', 409, 'NOTION_CONFLICT');
    const event = mapOpportunityPage(page);
    if (event.date && input.deadline > event.date) throw apiError('Deadline must be on or before the event date.', 400, 'INVALID_OPPORTUNITY');
    const deadline = property(page, ['Registration deadline', 'Deadline', 'Apply by']);
    if (deadline?.type !== 'date') throw apiError('The Notion Deadline property must be a date.', 422, 'NOTION_SCHEMA_MISMATCH');
    return mapOpportunityPage(await notionRequest(`/pages/${cleanId(pageId)}`, {method: 'PATCH', body: {properties: {[deadline.id]: {date: {start: input.deadline}}}}}));
  });
}
