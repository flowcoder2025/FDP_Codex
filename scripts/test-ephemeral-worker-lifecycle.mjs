#!/usr/bin/env node
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runManagedProcess } from './lib/managed-process.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/managed-worker-tree.mjs', import.meta.url));

async function runNormalCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed');
  assert.equal(result.ok, true);
  assert.equal(result.exit_code, 0);
  assert.equal(result.cleanup.required, false);
  assert.equal(result.observation_verified, true);
  assert(events.some((event) => event.type === 'worker.stdout' && event.payload?.fixture === 'complete'));
  assert(events.some((event) => event.type === 'worker.stderr' && event.payload === 'fixture stderr visible'));
  return result;
}

async function runTimeoutCase() {
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'root'],
    timeoutMs: 2500,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 5000,
  });
  assert.equal(result.status, 'timed_out');
  assert.equal(result.timed_out, true);
  assert(result.observed_descendant_pids.length >= 2);
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.reason, 'timeout');
  assert.equal(result.cleanup.verified, true);
  assert.deepEqual(result.cleanup.alive_after_cleanup, []);
  assert(result.cleanup.confirmed_gone_pids.includes(result.root_pid));
  return result;
}

async function runInterruptionCase() {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort('test-interruption'), 1500);
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'root'],
      timeoutMs: 10000,
      pollIntervalMs: 100,
      terminationGraceMs: 100,
      verificationTimeoutMs: 5000,
      signal: abortController.signal,
    });
    assert.equal(result.status, 'interrupted');
    assert.equal(result.interrupted, true);
    assert(result.observed_descendant_pids.length >= 2);
    assert.equal(result.cleanup.reason, 'interrupted');
    assert.equal(result.cleanup.verified, true);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

async function runResidualCase() {
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'orphan-root'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 5000,
  });
  assert.equal(result.status, 'residual_processes');
  assert.equal(result.ok, false);
  assert(result.observed_descendant_pids.length >= 2);
  assert.equal(result.cleanup.reason, 'residual-processes-after-root-exit');
  assert.equal(result.cleanup.verified, true);
  assert.deepEqual(result.cleanup.alive_after_cleanup, []);
  return result;
}

const normal = await runNormalCase();
const timeout = await runTimeoutCase();
const interruption = await runInterruptionCase();
const residual = await runResidualCase();

console.log(JSON.stringify({
  ok: true,
  cases: {
    normal: {
      status: normal.status,
      stdout_line_count: normal.stdout_line_count,
      stderr_line_count: normal.stderr_line_count,
    },
    timeout: {
      status: timeout.status,
      observed_descendant_count: timeout.observed_descendant_pids.length,
      cleanup_verified: timeout.cleanup.verified,
    },
    interruption: {
      status: interruption.status,
      observed_descendant_count: interruption.observed_descendant_pids.length,
      cleanup_verified: interruption.cleanup.verified,
    },
    residual: {
      status: residual.status,
      observed_descendant_count: residual.observed_descendant_pids.length,
      cleanup_verified: residual.cleanup.verified,
    },
  },
}, null, 2));
