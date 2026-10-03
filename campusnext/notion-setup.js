import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadEnv} from './env.js';
import {notionRequest, cleanId, checkConnection} from './notion.js';
import {opportunitySchema, missingSchemaFields} from './notion-schema.js';

const root = fileURLToPath(new URL('.', import.meta.url));
await loadEnv(root);
try {
  if (process.argv.includes('--check')) {
    const status = await checkConnection();
    console.log(JSON.stringify(status, null, 2));
    if (!status.connected) process.exitCode = 1;
  } else {
    const arg = process.argv[process.argv.indexOf('--parent') + 1];
    const parent = cleanId(process.argv.includes('--parent') ? arg?.split('?')[0].match(/([a-f\d]{32}|[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})$/i)?.[0] : process.env.NOTION_PARENT_PAGE_ID);
    if (!parent) throw new Error('Use npm run notion:setup -- --parent <shared-page-URL-or-ID>.');
    await notionRequest(`/pages/${parent}`);
    const matches = [];
    let cursor;
    do {
      const blocks = await notionRequest(`/blocks/${parent}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ''}`);
      matches.push(...blocks.results.filter(b => b.type === 'child_database' && b.child_database.title === 'Opportunities & Events'));
      cursor = blocks.has_more ? blocks.next_cursor : null;
    } while (cursor);
    if (matches.length > 1) throw new Error('Multiple Opportunities & Events databases exist here. Choose a data-source ID explicitly in .env.local.');
    const database = matches.length ? await notionRequest(`/databases/${matches[0].id}`) : await notionRequest('/databases', {
      method: 'POST', body: {parent: {type: 'page_id', page_id: parent}, title: [{text: {content: 'Opportunities & Events'}}],
        initial_data_source: {properties: opportunitySchema}}
    });
    if (database.data_sources?.length !== 1) throw new Error(`Database ${database.id} needs a specific data-source selection. Set its ID in .env.local.`);
    const source = await notionRequest(`/data_sources/${database.data_sources[0].id}`);
    const missing = missingSchemaFields(source);
    if (missing.length) throw new Error(`Existing database needs these fields: ${missing.join(', ')}. No schema changes were made.`);
    const envFile = path.join(root, '.env.local');
    let content = '';
    try { content = await readFile(envFile, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const [key, value] of Object.entries({NOTION_OPPORTUNITIES_DATA_SOURCE_ID: source.id, NOTION_PARENT_PAGE_ID: parent})) {
      const line = `${key}=${value}`;
      const pattern = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
      content = pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
    }
    await writeFile(envFile, content, 'utf8');
    console.log(JSON.stringify({connected: true, created: !matches.length, databaseUrl: database.url, dataSourceId: source.id, next: 'Restart CampusNext, then sync in Connection health.'}, null, 2));
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
