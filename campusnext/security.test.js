import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampusServer} from './server.js';

test('security headers are present on all static and API responses', async t => {
  const server = createCampusServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const base = `http://127.0.0.1:${server.address().port}`;

  // 1. Static asset check
  const staticRes = await fetch(`${base}/index.html`);
  assert.equal(staticRes.status, 200);
  assert.equal(staticRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(staticRes.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(staticRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(staticRes.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(staticRes.headers.get('permissions-policy'), /camera=\(\)/);

  // 2. API response check
  const apiRes = await fetch(`${base}/api/notion/config`);
  assert.equal(apiRes.status, 200);
  assert.equal(apiRes.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(apiRes.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(apiRes.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(apiRes.headers.get('content-security-policy'), /default-src 'self'/);

  // 3. 404 response check
  const notFoundRes = await fetch(`${base}/unknown-file.txt`);
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.headers.get('x-content-type-options'), 'nosniff');
});

test('HTTP methods on static assets are strictly restricted to GET and HEAD', async t => {
  const server = createCampusServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const base = `http://127.0.0.1:${server.address().port}`;

  const headRes = await fetch(`${base}/index.html`, {method: 'HEAD'});
  assert.equal(headRes.status, 200);

  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
    const res = await fetch(`${base}/index.html`, {method});
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('allow'), 'GET, HEAD');
  }
});

test('API guards against oversized payloads, invalid JSON, and disallowed origins', async t => {
  const server = createCampusServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const base = `http://127.0.0.1:${server.address().port}`;

  // Oversized body (>100KB)
  const hugePayload = JSON.stringify({text: 'x'.repeat(105_000)});
  const hugeRes = await fetch(`${base}/api/notion/opportunities`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: hugePayload
  });
  assert.equal(hugeRes.status, 413);

  // Malformed JSON
  const badJsonRes = await fetch(`${base}/api/notion/opportunities`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: '{not valid json}'
  });
  assert.equal(badJsonRes.status, 400);

  // Cross-origin write
  const crossOriginRes = await fetch(`${base}/api/notion/opportunities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://malicious-site.com'
    },
    body: JSON.stringify({title: 'Exploit'})
  });
  assert.equal(crossOriginRes.status, 403);
});
