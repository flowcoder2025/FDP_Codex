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

function assertObservedCleanupPartition(result) {
  const observedPids = [result.root_pid, ...result.observed_descendant_pids]
    .sort((a, b) => a - b);
  const atomicChildPid = result.containment.atomic_child_pid;
  assert(Number.isInteger(atomicChildPid) && atomicChildPid > 0);
  assert.equal(typeof result.containment.atomic_child_started_at, 'string');
  assert(result.observed_descendant_pids.includes(atomicChildPid));
  const classifiedPids = [
    ...result.cleanup.confirmed_gone_pids,
    ...result.cleanup.identity_mismatch_pids,
    ...result.cleanup.alive_after_cleanup,
  ].sort((a, b) => a - b);

  assert.equal(
    new Set(classifiedPids).size,
    classifiedPids.length,
    'cleanup classified a PID more than once: ' + JSON.stringify(result.cleanup),
  );
  assert.deepEqual(classifiedPids, observedPids);
  return true;
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
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  return { ...result, cleanup_partition_verified: cleanupPartitionVerified };
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
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    return { ...result, cleanup_partition_verified: cleanupPartitionVerified };
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

async function runAtomicWrapperKillCase() {
  const events = [];
  let wrapperPid = null;
  let atomicChildPid = null;
  let wrapperKilled = false;
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    env: { FDP_JOB_TEST_PAUSE_AFTER_ATOMIC_CREATE: '1' },
    timeoutMs: 5000,
    pollIntervalMs: 100,
    verificationTimeoutMs: 5000,
    onEvent: (event) => {
      events.push(event);
      if (event.type === 'worker.started') wrapperPid = event.root_pid;
      if (event.type === 'worker.atomic_child') {
        atomicChildPid = event.pid;
        assert(Number.isInteger(wrapperPid) && wrapperPid > 0);
        process.kill(wrapperPid, 'SIGTERM');
        wrapperKilled = true;
      }
    },
  });
  assert.equal(wrapperKilled, true);
  assert.equal(result.status, 'containment_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.containment.assigned, true);
  assert.equal(result.containment.drained, false);
  assert.equal(result.containment.verified, false);
  assert.equal(result.containment.atomic_child_pid, atomicChildPid);
  const confirmedWrapperPid = Number(wrapperPid);
  const confirmedAtomicChildPid = Number(atomicChildPid);
  assert(Number.isInteger(confirmedWrapperPid) && confirmedWrapperPid > 0);
  assert(Number.isInteger(confirmedAtomicChildPid) && confirmedAtomicChildPid > 0);
  assert.equal(isProcessAlive(confirmedWrapperPid), false);
  assert.equal(isProcessAlive(confirmedAtomicChildPid), false);
  assert.equal(events.some((event) => (
    event.type === 'worker.stdout' && event.payload?.fixture === 'complete'
  )), false);
  return { ...result, wrapper_pid: wrapperPid };
}

async function runObservationHangTimeoutCase() {
  const previousDelay = process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS;
  process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS = '10000';
  const startedAt = Date.now();
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'root'],
      timeoutMs: 750,
      pollIntervalMs: 100,
      terminationGraceMs: 100,
      verificationTimeoutMs: 1000,
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.timed_out, true);
    assert(elapsedMs < 5000, `observation hang exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(isProcessAlive(result.root_pid), false);
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    return {
      ...result,
      elapsed_ms: elapsedMs,
      cleanup_partition_verified: cleanupPartitionVerified,
    };
  } finally {
    if (previousDelay === undefined) delete process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS;
    else process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS = previousDelay;
  }
}

async function runObservationHangInterruptionCase() {
  const previousDelay = process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS;
  process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS = '10000';
  const abortController = new AbortController();
  const abortTimer = setTimeout(() => abortController.abort('observer-hang-test'), 750);
  const startedAt = Date.now();
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'root'],
      timeoutMs: 10000,
      pollIntervalMs: 100,
      terminationGraceMs: 100,
      verificationTimeoutMs: 1000,
      signal: abortController.signal,
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.interrupted, true);
    assert(elapsedMs < 5000, `observation hang interruption exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(isProcessAlive(result.root_pid), false);
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    return {
      ...result,
      elapsed_ms: elapsedMs,
      cleanup_partition_verified: cleanupPartitionVerified,
    };
  } finally {
    clearTimeout(abortTimer);
    if (previousDelay === undefined) delete process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS;
    else process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS = previousDelay;
  }
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
  atomicWrapperKill: await runAtomicWrapperKillCase(),
  observationHangTimeout: await runObservationHangTimeoutCase(),
  observationHangInterruption: await runObservationHangInterruptionCase(),
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
        cleanup_partition_verified: windowsCases.timeout.cleanup_partition_verified,
        atomic_child_observed: windowsCases.timeout.observed_descendant_pids
          .includes(windowsCases.timeout.containment.atomic_child_pid),
      },
      interruption: {
        status: windowsCases.interruption.status,
        observed_descendant_count: windowsCases.interruption.observed_descendant_pids.length,
        cleanup_verified: windowsCases.interruption.cleanup.verified,
        cleanup_partition_verified: windowsCases.interruption.cleanup_partition_verified,
        atomic_child_observed: windowsCases.interruption.observed_descendant_pids
          .includes(windowsCases.interruption.containment.atomic_child_pid),
      },
      orphan_containment: {
        status: windowsCases.orphanContainment.status,
        containment_mode: windowsCases.orphanContainment.containment.mode,
        containment_verified: windowsCases.orphanContainment.containment.verified,
      },
      atomic_wrapper_kill: {
        status: windowsCases.atomicWrapperKill.status,
        wrapper_pid: windowsCases.atomicWrapperKill.wrapper_pid,
        atomic_child_pid: windowsCases.atomicWrapperKill.containment.atomic_child_pid,
        containment_assigned: windowsCases.atomicWrapperKill.containment.assigned,
        containment_verified: windowsCases.atomicWrapperKill.containment.verified,
      },
      observation_hang_timeout: {
        status: windowsCases.observationHangTimeout.status,
        elapsed_ms: windowsCases.observationHangTimeout.elapsed_ms,
        timed_out: windowsCases.observationHangTimeout.timed_out,
        atomic_child_pid: windowsCases.observationHangTimeout.containment.atomic_child_pid,
        cleanup_partition_verified: windowsCases.observationHangTimeout.cleanup_partition_verified,
        atomic_child_observed: windowsCases.observationHangTimeout.observed_descendant_pids
          .includes(windowsCases.observationHangTimeout.containment.atomic_child_pid),
      },
      observation_hang_interruption: {
        status: windowsCases.observationHangInterruption.status,
        elapsed_ms: windowsCases.observationHangInterruption.elapsed_ms,
        interrupted: windowsCases.observationHangInterruption.interrupted,
        atomic_child_pid: windowsCases.observationHangInterruption.containment.atomic_child_pid,
        cleanup_partition_verified: windowsCases.observationHangInterruption.cleanup_partition_verified,
        atomic_child_observed: windowsCases.observationHangInterruption.observed_descendant_pids
          .includes(windowsCases.observationHangInterruption.containment.atomic_child_pid),
      },
      fast_parent_exit: {
        status: windowsCases.fastParentExit.status,
        containment_mode: windowsCases.fastParentExit.containment.mode,
        containment_verified: windowsCases.fastParentExit.containment.verified,
      },
    },
  },
}, null, 2));
