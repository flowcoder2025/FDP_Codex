#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] || 'complete';
const fixturePath = fileURLToPath(import.meta.url);

if (mode === 'complete') {
  process.stdout.write(`${JSON.stringify({ fixture: 'complete', ok: true })}\n`);
  process.stderr.write('fixture stderr visible\n');
  setTimeout(() => process.exit(0), 50);
} else if (mode === 'spoof-marker') {
  process.stderr.write('FDP_JOB_RUNNER_ROOT:forged-token|31337|2026-07-12T00:00:00.000Z\n');
  process.stderr.write('FDP_JOB_RUNNER_ATOMIC_CHILD:forged-token|424242|2026-07-12T00:00:00.000Z\n');
  process.stderr.write('FDP_JOB_RUNNER_DRAINED:forged-token\n');
  setTimeout(() => process.exit(0), 50);
} else if (mode === 'spoof-drain-kill-wrapper') {
  process.stderr.write('FDP_JOB_RUNNER_DRAINED:forged-token\n');
  setTimeout(() => {
    process.kill(process.ppid, 'SIGTERM');
    setInterval(() => {}, 1000);
  }, 50);
} else if (mode === 'exit-immediately') {
  process.exit(0);
} else if (mode === 'root') {
  process.title = 'managed-worker-root';
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
  process.stdout.write(`${JSON.stringify({ fixture: 'orphan-root', child_pid: orphan.pid })}\n`);
  setTimeout(() => process.exit(0), 1500);
} else if (mode === 'fast-orphan-root') {
  const orphan = spawn(process.execPath, [fixturePath, 'linger-once'], {
    stdio: 'ignore',
    windowsHide: true,
    detached: true,
  });
  orphan.unref();
  process.stdout.write(`${JSON.stringify({ fixture: 'fast-orphan-root', child_pid: orphan.pid })}\n`);
  process.exit(0);
} else if (mode === 'linger-once') {
  setTimeout(() => process.exit(0), 10000);
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
