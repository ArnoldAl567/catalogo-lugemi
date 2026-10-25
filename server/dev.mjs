import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { handle } from './core.mjs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
createServer(handle).listen(4302, '127.0.0.1', () => console.log('API Lugemi en 127.0.0.1:4302'));
