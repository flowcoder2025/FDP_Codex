#!/usr/bin/env node
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildEphemeralWorkerArgs } from './lib/codex-invocation.mjs';
import {
  managedProcessPlatformSupport,
  mergeObservedTree,
  runManagedProcess,
} from './lib/managed-process.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/managed-worker-tree.mjs', import.meta.url));

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EPERM');
  }
}

function runBuiltinFanoutFlagCase() {
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

function runPlatformSupportCase() {
  assert.deepEqual(managedProcessPlatformSupport('win32'), {
    supported: true,
    mode: 'windows-job-object',
    reason: null,
  });
  const posix = managedProcessPlatformSupport('linux');
  assert.equal(posix.supported, false);
  assert.equal(posix.mode, 'unsupported-fail-closed');
  assert.match(posix.reason, /not implemented for platform linux/);
  return { windows: 'supported', posix: posix.mode };
}

async function runUnsupportedPlatformCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'fast-orphan-root'],
    timeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'unsupported_platform');
  assert.equal(result.ok, false);
  assert.equal(result.root_pid, null);
  assert.equal(result.containment.mode, 'unsupported-fail-closed');
  assert.equal(result.containment.verified, false);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'worker.result');
  return result;
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

async function runOrphanContainmentCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'orphan-root'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, true);
  assert.equal(result.containment.mode, 'windows-job-object');
  assert.equal(result.containment.verified, true);
  const fixtureEvent = events.find((event) => event.type === 'worker.stdout'
    && event.payload?.fixture === 'orphan-root');
  assert(fixtureEvent?.payload?.child_pid);
  assert.equal(isProcessAlive(fixtureEvent.payload.child_pid), false);
  return result;
}

async function runAssignmentFailureCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    env: { FDP_JOB_TEST_FORCE_ASSIGNMENT_FAILURE: '1' },
    timeoutMs: 5000,
    pollIntervalMs: 100,
    verificationTimeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'containment_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.containment.assigned, false);
  assert.equal(result.containment.verified, false);
  assert(result.containment.errors.some((error) => (
    error.includes('Forced AssignProcessToJobObject failure after verified cleanup')
  )));
  const cleanupEvent = events.find((event) => (
    event.type === 'worker.stderr'
      && typeof event.payload === 'string'
      && event.payload.startsWith('FDP_JOB_RUNNER_UNASSIGNED_CLEANED:')
  ));
  assert(cleanupEvent);
  const cleanedPid = Number.parseInt(cleanupEvent.payload.split(':')[1], 10);
  assert(Number.isInteger(cleanedPid) && cleanedPid > 0);
  assert.equal(isProcessAlive(cleanedPid), false);
  assert.equal(events.some((event) => (
    event.type === 'worker.stdout' && event.payload?.fixture === 'complete'
  )), false);
  return { ...result, cleaned_pid: cleanedPid };
}

async function runFastParentExitCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'fast-orphan-root'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    verificationTimeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, true);
  assert.equal(result.containment.mode, 'windows-job-object');
  assert.equal(result.containment.assigned, true);
  assert.equal(result.containment.drained, true);
  assert.equal(result.containment.verified, true);
  const fixtureEvent = events.find((event) => event.type === 'worker.stdout'
    && event.payload?.fixture === 'fast-orphan-root');
  assert(fixtureEvent?.payload?.child_pid);
  assert.equal(isProcessAlive(fixtureEvent.payload.child_pid), false);
  return result;
}

const builtinFanoutFlag = runBuiltinFanoutFlagCase();
const platformSupport = runPlatformSupportCase();
const temporalIdentity = runTemporalIdentityCase();
const windowsCases = process.platform === 'win32' ? {
  normal: await runNormalCase(),
  timeout: await runTimeoutCase(),
  interruption: await runInterruptionCase(),
  orphanContainment: await runOrphanContainmentCase(),
  assignmentFailure: await runAssignmentFailureCase(),
  fastParentExit: await runFastParentExitCase(),
} : null;
const unsupportedPlatform = process.platform === 'win32'
  ? null
  : await runUnsupportedPlatformCase();

console.log(JSON.stringify({
  ok: true,
  cases: {
    builtin_fanout_flag: builtinFanoutFlag,
    platform_support: platformSupport,
    temporal_identity: temporalIdentity,
    unsupported_platform: unsupportedPlatform && {
      status: unsupportedPlatform.status,
      containment_mode: unsupportedPlatform.containment.mode,
    },
    windows_lifecycle: windowsCases && {
      normal: {
        status: windowsCases.normal.status,
        stdout_line_count: windowsCases.normal.stdout_line_count,
        stderr_line_count: windowsCases.normal.stderr_line_count,
      },
      timeout: {
        status: windowsCases.timeout.status,
        observed_descendant_count: windowsCases.timeout.observed_descendant_pids.length,
        cleanup_verified: windowsCases.timeout.cleanup.verified,
      },
      interruption: {
        status: windowsCases.interruption.status,
        observed_descendant_count: windowsCases.interruption.observed_descendant_pids.length,
        cleanup_verified: windowsCases.interruption.cleanup.verified,
      },
      orphan_containment: {
        status: windowsCases.orphanContainment.status,
        containment_mode: windowsCases.orphanContainment.containment.mode,
        containment_verified: windowsCases.orphanContainment.containment.verified,
      },
      assignment_failure: {
        status: windowsCases.assignmentFailure.status,
        cleaned_pid: windowsCases.assignmentFailure.cleaned_pid,
        containment_assigned: windowsCases.assignmentFailure.containment.assigned,
        containment_verified: windowsCases.assignmentFailure.containment.verified,
      },
      fast_parent_exit: {
        status: windowsCases.fastParentExit.status,
        containment_mode: windowsCases.fastParentExit.containment.mode,
        containment_verified: windowsCases.fastParentExit.containment.verified,
      },
    },
  },
}, null, 2));
