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
    ...result.cleanup.unknown_after_cleanup,
  ].sort((a, b) => a - b);

  assert.equal(
    new Set(classifiedPids).size,
    classifiedPids.length,
    'cleanup classified a PID more than once: ' + JSON.stringify(result.cleanup),
  );
  assert.deepEqual(classifiedPids, observedPids);
  return true;
}

function assertAtomicIdentityBeforeObservation(events, result) {
  const atomicChildIndex = events.findIndex((event) => event.type === 'worker.atomic_child');
  const observationIndex = events.findIndex((event) => event.type === 'worker.observation_started');
  assert(atomicChildIndex >= 0);
  assert(observationIndex > atomicChildIndex);
  const observation = events[observationIndex];
  assert.equal(observation.atomic_child_registered, true);
  assert.equal(observation.atomic_child_pid, result.containment.atomic_child_pid);
  return true;
}

function busyWait(milliseconds) {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    // Deliberately block to prove user event handlers cannot bypass the absolute deadline outcome.
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

  const uninitializedRootObserved = new Map([[rootPid, {
    pid: rootPid,
    ppid: process.pid,
    pgid: null,
    name: 'powershell.exe',
    started_at: null,
  }]]);
  mergeObservedTree([
    { pid: rootPid, ppid: 12345, pgid: rootPid, name: 'powershell.exe', started_at: '2026-07-10T12:00:00.000Z' },
    { pid: 50005, ppid: rootPid, pgid: rootPid, name: 'unrelated-child', started_at: '2026-07-10T12:00:00.100Z' },
  ], rootPid, uninitializedRootObserved);
  assert.equal(uninitializedRootObserved.get(rootPid)?.started_at, null);
  assert.equal(uninitializedRootObserved.has(50005), false);

  return {
    stale_excluded: true,
    reused_parent_identity_excluded: true,
    uninitialized_root_reuse_excluded: true,
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
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'root'],
    timeoutMs: 2500,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'timed_out');
  assert.equal(result.timed_out, true);
  assert(result.observed_descendant_pids.length >= 2);
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.reason, 'timeout');
  assert.equal(result.cleanup.verified, true);
  assert.deepEqual(result.cleanup.alive_after_cleanup, []);
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  const atomicIdentityBeforeObservation = assertAtomicIdentityBeforeObservation(events, result);
  return {
    ...result,
    cleanup_partition_verified: cleanupPartitionVerified,
    atomic_identity_before_observation: atomicIdentityBeforeObservation,
  };
}

async function runStartedCallbackDeadlineCase() {
  let callbackBlocked = false;
  const startedAt = Date.now();
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 500,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 2000,
    onEvent: (event) => {
      if (event.type === 'worker.started' && !callbackBlocked) {
        callbackBlocked = true;
        busyWait(1500);
      }
    },
  });
  const elapsedMs = Date.now() - startedAt;
  assert.equal(callbackBlocked, true);
  assert.equal(result.status, 'timed_out', JSON.stringify(result, null, 2));
  assert.equal(result.timed_out, true);
  assert.equal(result.ok, false);
  assert(elapsedMs >= 1500 && elapsedMs < 5000);
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  return {
    ...result,
    elapsed_ms: elapsedMs,
    cleanup_partition_verified: cleanupPartitionVerified,
    deadline_outcome_preserved: true,
  };
}

async function runThrowingStartedCallbackCase() {
  let callbackThrew = false;
  let atomicChildPid = null;
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 2000,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 2000,
    onEvent: (event) => {
      if (event.type === 'worker.atomic_child') atomicChildPid = event.pid;
      if (event.type === 'worker.started' && !callbackThrew) {
        callbackThrew = true;
        throw new Error('intentional event sink failure');
      }
    },
  });
  assert.equal(callbackThrew, true);
  assert.equal(result.status, 'event_dispatch_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.reason, 'event-dispatch-failed');
  assert.equal(result.cleanup.verified, true);
  assert(result.event_errors.includes('intentional event sink failure'));
  assert.equal(atomicChildPid, result.containment.atomic_child_pid);
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(atomicChildPid), false);
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  return {
    ...result,
    cleanup_partition_verified: cleanupPartitionVerified,
    event_sink_failure_contained: true,
  };
}

async function runThrowingResultCallbackCase() {
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    onEvent: (event) => {
      if (event.type === 'worker.result') throw new Error('intentional final result sink failure');
    },
  });
  assert.equal(result.status, 'event_dispatch_failed', JSON.stringify(result, null, 2));
  assert.equal(result.terminal_status_before_event_failure, 'completed');
  assert.equal(result.ok, false);
  assert(result.event_errors.includes('intentional final result sink failure'));
  assert.equal(result.containment.verified, true);
  assert.equal(result.cleanup.required, false);
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  return { ...result, previous_status: result.terminal_status_before_event_failure, final_result_failure_reclassified: true };
}

async function runStdinEarlyExitCase() {
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'exit-immediately'],
    stdinText: 'x'.repeat(1024 * 1024),
    timeoutMs: 5000,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 2000,
  });
  assert.equal(result.status, 'stdin_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert(result.stdin_errors.length >= 1);
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.reason, 'stdin-failed');
  assert.equal(result.cleanup.verified, true);
  assert.equal(isProcessAlive(result.root_pid), false);
  if (result.containment.atomic_child_pid !== null) {
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  }
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  return { ...result, cleanup_partition_verified: cleanupPartitionVerified };
}

async function runStdinTimeoutCase() {
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'root'],
    stdinText: 'x'.repeat(1024 * 1024),
    timeoutMs: 750,
    pollIntervalMs: 100,
    terminationGraceMs: 100,
    verificationTimeoutMs: 2000,
  });
  assert.equal(result.status, 'timed_out', JSON.stringify(result, null, 2));
  assert.equal(result.timed_out, true);
  assert(result.stdin_errors.length >= 1);
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.verified, true);
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  return { ...result, cleanup_partition_verified: cleanupPartitionVerified };
}

async function runInterruptionCase() {
  const events = [];
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
      onEvent: (event) => events.push(event),
    });
    assert.equal(result.status, 'interrupted');
    assert.equal(result.interrupted, true);
    assert(result.observed_descendant_pids.length >= 2);
    assert.equal(result.cleanup.reason, 'interrupted');
    assert.equal(result.cleanup.verified, true);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertAtomicIdentityBeforeObservation(events, result);
    return {
      ...result,
      cleanup_partition_verified: cleanupPartitionVerified,
      atomic_identity_before_observation: atomicIdentityBeforeObservation,
    };
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
  const events = [];
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
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.timed_out, true);
    assert(elapsedMs < 5000, `observation hang exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(isProcessAlive(result.root_pid), false);
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    assert(result.cleanup.unknown_after_cleanup.includes(result.root_pid));
    assert(result.cleanup.unknown_after_cleanup.includes(result.containment.atomic_child_pid));
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertAtomicIdentityBeforeObservation(events, result);
    return {
      ...result,
      elapsed_ms: elapsedMs,
      cleanup_partition_verified: cleanupPartitionVerified,
      atomic_identity_before_observation: atomicIdentityBeforeObservation,
    };
  } finally {
    if (previousDelay === undefined) delete process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS;
    else process.env.FDP_JOB_TEST_OBSERVATION_DELAY_MS = previousDelay;
  }
}

async function runObservationHangInterruptionCase() {
  const events = [];
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
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.interrupted, true);
    assert(elapsedMs < 5000, `observation hang interruption exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(isProcessAlive(result.root_pid), false);
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    assert(result.cleanup.unknown_after_cleanup.includes(result.root_pid));
    assert(result.cleanup.unknown_after_cleanup.includes(result.containment.atomic_child_pid));
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertAtomicIdentityBeforeObservation(events, result);
    return {
      ...result,
      elapsed_ms: elapsedMs,
      cleanup_partition_verified: cleanupPartitionVerified,
      atomic_identity_before_observation: atomicIdentityBeforeObservation,
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
  startedCallbackDeadline: await runStartedCallbackDeadlineCase(),
  throwingStartedCallback: await runThrowingStartedCallbackCase(),
  throwingResultCallback: await runThrowingResultCallbackCase(),
  stdinEarlyExit: await runStdinEarlyExitCase(),
  stdinTimeout: await runStdinTimeoutCase(),
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
        atomic_identity_before_observation: windowsCases.timeout.atomic_identity_before_observation,
      },
      started_callback_deadline: {
        status: windowsCases.startedCallbackDeadline.status,
        timed_out: windowsCases.startedCallbackDeadline.timed_out,
        elapsed_ms: windowsCases.startedCallbackDeadline.elapsed_ms,
        deadline_outcome_preserved: windowsCases.startedCallbackDeadline.deadline_outcome_preserved,
        cleanup_partition_verified: windowsCases.startedCallbackDeadline.cleanup_partition_verified,
      },
      throwing_started_callback: {
        status: windowsCases.throwingStartedCallback.status,
        cleanup_verified: windowsCases.throwingStartedCallback.cleanup.verified,
        cleanup_partition_verified: windowsCases.throwingStartedCallback.cleanup_partition_verified,
        event_sink_failure_contained: windowsCases.throwingStartedCallback.event_sink_failure_contained,
        event_error_count: windowsCases.throwingStartedCallback.event_errors.length,
      },
      throwing_result_callback: {
        status: windowsCases.throwingResultCallback.status,
        previous_status: windowsCases.throwingResultCallback.previous_status,
        containment_verified: windowsCases.throwingResultCallback.containment.verified,
        cleanup_required: windowsCases.throwingResultCallback.cleanup.required,
        final_result_failure_reclassified: windowsCases.throwingResultCallback.final_result_failure_reclassified,
        event_error_count: windowsCases.throwingResultCallback.event_errors.length,
      },
      stdin_early_exit: {
        status: windowsCases.stdinEarlyExit.status,
        cleanup_verified: windowsCases.stdinEarlyExit.cleanup.verified,
        cleanup_partition_verified: windowsCases.stdinEarlyExit.cleanup_partition_verified,
        stdin_error_count: windowsCases.stdinEarlyExit.stdin_errors.length,
      },
      stdin_timeout: {
        status: windowsCases.stdinTimeout.status,
        timed_out: windowsCases.stdinTimeout.timed_out,
        cleanup_verified: windowsCases.stdinTimeout.cleanup.verified,
        cleanup_partition_verified: windowsCases.stdinTimeout.cleanup_partition_verified,
        stdin_error_count: windowsCases.stdinTimeout.stdin_errors.length,
      },
      interruption: {
        status: windowsCases.interruption.status,
        observed_descendant_count: windowsCases.interruption.observed_descendant_pids.length,
        cleanup_verified: windowsCases.interruption.cleanup.verified,
        cleanup_partition_verified: windowsCases.interruption.cleanup_partition_verified,
        atomic_child_observed: windowsCases.interruption.observed_descendant_pids
          .includes(windowsCases.interruption.containment.atomic_child_pid),
        atomic_identity_before_observation: windowsCases.interruption.atomic_identity_before_observation,
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
        atomic_identity_before_observation:
          windowsCases.observationHangTimeout.atomic_identity_before_observation,
        alive_after_cleanup_count:
          windowsCases.observationHangTimeout.cleanup.alive_after_cleanup.length,
        unknown_after_cleanup_count:
          windowsCases.observationHangTimeout.cleanup.unknown_after_cleanup.length,
      },
      observation_hang_interruption: {
        status: windowsCases.observationHangInterruption.status,
        elapsed_ms: windowsCases.observationHangInterruption.elapsed_ms,
        interrupted: windowsCases.observationHangInterruption.interrupted,
        atomic_child_pid: windowsCases.observationHangInterruption.containment.atomic_child_pid,
        cleanup_partition_verified: windowsCases.observationHangInterruption.cleanup_partition_verified,
        atomic_child_observed: windowsCases.observationHangInterruption.observed_descendant_pids
          .includes(windowsCases.observationHangInterruption.containment.atomic_child_pid),
        atomic_identity_before_observation:
          windowsCases.observationHangInterruption.atomic_identity_before_observation,
        alive_after_cleanup_count:
          windowsCases.observationHangInterruption.cleanup.alive_after_cleanup.length,
        unknown_after_cleanup_count:
          windowsCases.observationHangInterruption.cleanup.unknown_after_cleanup.length,
      },
      fast_parent_exit: {
        status: windowsCases.fastParentExit.status,
        containment_mode: windowsCases.fastParentExit.containment.mode,
        containment_verified: windowsCases.fastParentExit.containment.verified,
      },
    },
  },
}, null, 2));
