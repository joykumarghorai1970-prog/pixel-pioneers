import http from 'node:http';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {checkConnection, getOpportunities, createOpportunity, notionConfigStatus} from './notion.js';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};

async function loadEnv(file) {
  try { await access(file); } catch { return; }
  const text = await readFile(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

await loadEnv(path.join(root, '.env'));
await loadEnv(path.join(root, '.env.local'));

const json = (res, status, body) => {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
};

async function body(req) {
  let value = '';
  for await (const chunk of req) {
    value += chunk;
    if (value.length > 1_000_000) throw new Error('Request body is too large.');
  }
  return value ? JSON.parse(value) : {};
}

async function api(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/notion/config') return json(res, 200, notionConfigStatus());
  if (req.method === 'GET' && pathname === '/api/notion/status') return json(res, 200, await checkConnection());
  if (req.method === 'GET' && pathname === '/api/notion/opportunities') {
    try { return json(res, 200, {events: await getOpportunities(), syncedAt: new Date().toISOString()}); }
    catch (error) { return json(res, error.status || 503, {error: error.message, code: error.code || 'NOTION_UNAVAILABLE'}); }
  }
  if (req.method === 'POST' && pathname === '/api/notion/opportunities') {
    try { return json(res, 201, {event: await createOpportunity(await body(req))}); }
    catch (error) { return json(res, error.status || 503, {error: error.message, code: error.code || 'NOTION_UNAVAILABLE'}); }
  }
  return false;
}
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) {
      const handled = await api(req, res, pathname);
      if (handled !== false) return;
      return json(res, 404, {error: 'API route not found'});
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root) || !types[path.extname(file)]) { res.writeHead(404); res.end('Not found'); return; }
    const content = await readFile(file);
    res.writeHead(200, {'Content-Type': types[path.extname(file)], 'Cache-Control':'no-cache'}); res.end(content);
  } catch (error) {
    if (!res.headersSent) json(res, error instanceof SyntaxError ? 400 : 500, {error: error.message || 'Request failed'});
    else res.end();
  }
}).listen(4173, '127.0.0.1', () => console.log('CampusNext is ready at http://127.0.0.1:4173'));
