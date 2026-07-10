#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] || 'complete';
const fixturePath = fileURLToPath(import.meta.url);

if (mode === 'complete') {
  process.stdout.write(`${JSON.stringify({ fixture: 'complete', ok: true })}\n`);
  process.stderr.write('fixture stderr visible\n');
  setTimeout(() => process.exit(0), 50);
} else if (mode === 'root') {
  const child = spawn(process.execPath, [fixturePath, 'child'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
  });
  process.stdout.write(`${JSON.stringify({ fixture: 'root', child_pid: child.pid })}\n`);
  setInterval(() => {}, 1000);
} else if (mode === 'orphan-root') {
  const orphan = spawn(process.execPath, [fixturePath, 'child'], {
    stdio: 'ignore',
    windowsHide: true,
    detached: true,
  });
  orphan.unref();
  process.stdout.write(`${JSON.stringify({ fixture: 'orphan-root' })}\n`);
  setTimeout(() => process.exit(0), 1500);
} else if (mode === 'child') {
  const grandchild = spawn(process.execPath, [fixturePath, 'grandchild'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
  });
  process.stdout.write(`${JSON.stringify({ fixture: 'child', grandchild_pid: grandchild.pid })}\n`);
  setInterval(() => {}, 1000);
} else if (mode === 'grandchild') {
  process.stdout.write(`${JSON.stringify({ fixture: 'grandchild', pid: process.pid })}\n`);
  setInterval(() => {}, 1000);
} else {
  process.stderr.write(`unknown fixture mode: ${mode}\n`);
  process.exit(2);
}
