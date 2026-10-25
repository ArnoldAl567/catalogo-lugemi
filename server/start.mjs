import { spawn } from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(process.execPath, ['server/dev.mjs'], { stdio: 'inherit' }),
  spawn(npm, ['run', 'start:front'], { stdio: 'inherit', shell: process.platform === 'win32' }),
];
for (const child of processes) child.on('exit', code => { if (code && code !== 0) process.exitCode = code; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { for (const child of processes) child.kill(signal); });
