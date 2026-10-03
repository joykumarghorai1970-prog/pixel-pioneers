import {readFile} from 'node:fs/promises';
import path from 'node:path';

export async function loadEnv(root, env = process.env) {
  // Shell settings win, then .env.local, then .env. Never log credentials.
  for (const name of ['.env.local', '.env']) {
    let content;
    try { content = await readFile(path.join(root, name), 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && env[match[1]] === undefined) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}
