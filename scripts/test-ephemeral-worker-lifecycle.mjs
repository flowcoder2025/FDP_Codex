#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildEphemeralWorkerArgs, MANAGED_WORKER_EXEC_POLICY } from './lib/codex-invocation.mjs';
import { mergeObservedTree, runManagedProcess } from './lib/managed-process.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/managed-worker-tree.mjs', import.meta.url));

function runInvocationConfinementCase() {
  const args = buildEphemeralWorkerArgs({
    argsPrefix: ['codex.js'],
    sandbox: 'read-only',
    cwd: 'C:\\repo',
  });
  assert.deepEqual(args.slice(0, 8), [
    'codex.js',
    'exec',
    '--ephemeral',
    '--json',
    '--color', 'never',
    '--disable', 'multi_agent',
  ]);
  assert.deepEqual(args.slice(8), ['--sandbox', 'read-only', '-C', 'C:\\repo', '-']);
  assert.equal(args.filter((arg) => arg === 'multi_agent').length, 1);
  return { multi_agent_disabled: true };
}

function runExecPolicyContractCase() {
  const policy = readFileSync(MANAGED_WORKER_EXEC_POLICY, 'utf8');
  for (const token of [
    'decision = "forbidden"',
    '"codex.exe"',
    '"node.exe"',
    '"npm.cmd"',
    '"powershell.exe"',
    '"cmd.exe"',
    '"python.exe"',
    '"bash.exe"',
    '"yarn.cmd"',
    '"corepack"',
  ]) {
    assert(policy.includes(token), `managed worker exec-policy is missing ${token}`);
  }
  return { supported_reentry_families_forbidden: true };
}

function runTemporalIdentityCase() {
  const rootPid = 50000;
  const root = {
    pid: rootPid,
    ppid: process.pid,
    pgid: rootPid,
    name: 'node',
    started_at: '2026-07-10T10:00:00.000Z',
  };
  const observed = new Map([[rootPid, root]]);
  mergeObservedTree([
    root,
    {
      pid: 50001,
      ppid: rootPid,
      pgid: rootPid,
      name: 'stale-process',
      started_at: '2026-07-10T09:00:00.000Z',
    },
    {
      pid: 50002,
      ppid: rootPid,
      pgid: rootPid,
      name: 'child',
      started_at: '2026-07-10T10:00:00.100Z',
    },
    {
      pid: 50003,
      ppid: 50002,
      pgid: rootPid,
      name: 'grandchild',
      started_at: '2026-07-10T10:00:00.200Z',
    },
  ], rootPid, observed);
  assert.equal(observed.has(50001), false);
  assert.equal(observed.has(50002), true);
  assert.equal(observed.has(50003), true);

  const reusedRootObserved = new Map([[rootPid, root]]);
  mergeObservedTree([
    {
      pid: rootPid,
      ppid: 12345,
      pgid: rootPid,
      name: 'reused-root',
      started_at: '2026-07-10T11:00:00.000Z',
    },
    {
      pid: 50004,
      ppid: rootPid,
      pgid: rootPid,
      name: 'unrelated-child',
      started_at: '2026-07-10T11:00:00.100Z',
    },
  ], rootPid, reusedRootObserved);
  assert.equal(reusedRootObserved.has(50004), false);

  return {
    stale_excluded: true,
    reused_parent_identity_excluded: true,
    descendant_count: observed.size - 1,
  };
}

async function runNormalCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed', JSON.stringify(result, null, 2));
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

const invocationConfinement = runInvocationConfinementCase();
const execPolicyContract = runExecPolicyContractCase();
const temporalIdentity = runTemporalIdentityCase();
const normal = await runNormalCase();
const timeout = await runTimeoutCase();
const interruption = await runInterruptionCase();
const residual = await runResidualCase();

console.log(JSON.stringify({
  ok: true,
  cases: {
    invocation_confinement: invocationConfinement,
    exec_policy_contract: execPolicyContract,
    temporal_identity: temporalIdentity,
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
