import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { handle } from './core.mjs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      const value = match[2].trim();
      process.env[match[1]] = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
    }
  }
}
createServer(handle).listen(4302, '127.0.0.1', () => console.log('API Lugemi en 127.0.0.1:4302'));
