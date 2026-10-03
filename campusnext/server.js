import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {checkConnection, getOpportunities, createOpportunity, updateOpportunityDeadline, notionConfigStatus} from './notion.js';
import {loadEnv} from './env.js';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};

const assets = new Set(['index.html', 'app.js', 'data.js', 'domain.js', 'styles.css', 'onboarding.css', 'refinements.css', 'sync-status.css', 'login.css']);

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.notion.com; frame-ancestors 'self';"
};

const json = (res, status, body) => {
  res.writeHead(status, {...SECURITY_HEADERS, 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
};

async function body(req) {
  let value = '';
  for await (const chunk of req) {
    value += chunk;
    if (value.length > 100_000) throw Object.assign(new Error('Request body is too large.'), {status: 413});
  }
  try { return value ? JSON.parse(value) : {}; }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), {status: 400}); }
}

async function api(req, res, pathname) {
  if (['POST', 'PATCH'].includes(req.method)) {
    const origin = req.headers.origin;
    if ((origin && origin !== `http://${req.headers.host}`) || req.headers['sec-fetch-site'] === 'cross-site') return json(res, 403, {error: 'Cross-origin writes are not allowed.'});
    if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, {error: 'Send application/json.'});
  }
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
  const match = pathname.match(/^\/api\/notion\/opportunities\/([a-f\d-]+)$/i);
  if (req.method === 'PATCH' && match) {
    try { return json(res, 200, {event: await updateOpportunityDeadline(match[1], await body(req))}); }
    catch (error) { return json(res, error.status || 503, {error: error.message, code: error.code || 'NOTION_UNAVAILABLE'}); }
  }
  return false;
}
export function createCampusServer() { return http.createServer(async (req, res) => {
  try {
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) return json(res, 403, {error: 'Use the local CampusNext address.'});
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) {
      const handled = await api(req, res, pathname);
      if (handled !== false) return;
      return json(res, 404, {error: 'API route not found'});
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, {...SECURITY_HEADERS, 'Allow': 'GET, HEAD'});
      res.end('Method not allowed');
      return;
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!assets.has(path.relative(root, file))) { res.writeHead(404, SECURITY_HEADERS); res.end('Not found'); return; }
    const content = await readFile(file);
    res.writeHead(200, {...SECURITY_HEADERS, 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache'});
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(content);
  } catch (error) {
    if (!res.headersSent) json(res, error.status || (error instanceof SyntaxError ? 400 : 500), {error: error.message || 'Request failed'});
    else res.end();
  }
}); }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await loadEnv(root);
  const port = Number(process.env.PORT || 4173);
  createCampusServer().listen(port, '127.0.0.1', () => console.log(`CampusNext is ready at http://127.0.0.1:${port}`));
}
