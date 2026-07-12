#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEphemeralWorkerArgs } from './lib/codex-invocation.mjs';
import {
  classifyControllerIdentityLookupCleanup,
  classifyProcessIdentity,
  managedProcessPlatformSupport,
  mergeObservedTree,
  runManagedProcess,
  stopExactWrapperForCleanup,
} from './lib/managed-process.mjs';

const fixturePath = fileURLToPath(new URL('./fixtures/managed-worker-tree.mjs', import.meta.url));
const workerCliPath = fileURLToPath(new URL('./run-ephemeral-worker.mjs', import.meta.url));
const windowsJobRunnerPath = fileURLToPath(new URL('./windows-job-runner.ps1', import.meta.url));
const testScriptPath = fileURLToPath(import.meta.url);
const managedProcessSource = readFileSync(fileURLToPath(new URL('./lib/managed-process.mjs', import.meta.url)), 'utf8');
const windowsJobRunnerSource = readFileSync(windowsJobRunnerPath, 'utf8');
const OBSERVATION_HANG_FINITE_BOUND_MS = 8000;
const STDIN_TIMEOUT_BACKPRESSURE_BYTES = 64 * 1024 * 1024;

async function runControllerWatchdogHelper(preAcquire = false, markerPath = null) {
  await runManagedProcess({
    command: process.execPath,
    args: preAcquire ? [fixturePath, 'write-marker', markerPath] : [fixturePath, 'root'],
    env: preAcquire ? {
      NODE_ENV: 'test',
      FDP_JOB_TEST_CONTROLLER_ACQUIRE_DELAY_MS: '1000',
    } : undefined,
    timeoutMs: 30000,
    pollIntervalMs: 100,
    onEvent: (event) => {
      if (['worker.started', 'worker.root_identity', 'worker.atomic_child'].includes(event.type)) {
        process.stdout.write(JSON.stringify(event) + '\n');
      }
    },
  });
}

if (process.argv[2] === '--controller-watchdog-helper') {
  await runControllerWatchdogHelper();
  process.exit(0);
}
if (process.argv[2] === '--controller-pre-acquire-helper') {
  await runControllerWatchdogHelper(true, process.argv[3]);
  process.exit(0);
}

function runPidOnlySignalGuardCase() {
  assert(managedProcessSource.includes('PID-only signaling is forbidden'));
  assert.equal(managedProcessSource.includes('process.kill(entry.pid'), false);
  assert.equal(managedProcessSource.includes('signalProcesses('), false);
  return { direct_pid_signaling: false, termination_owner: 'exact-wrapper-handle-and-job-object' };
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EPERM');
  }
}

async function waitForProcessGone(pid, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (isProcessAlive(pid) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !isProcessAlive(pid);
}

function assertObservedCleanupPartition(result) {
  const observedPids = [result.root_pid, ...result.observed_descendant_pids]
    .sort((a, b) => a - b);
  const atomicChildPid = result.containment.atomic_child_pid;
  assert.equal(result.containment.controller_watchdog_armed, true);
  assert.equal(result.containment.wrapper_closed, true);
  assert.equal(typeof result.containment.root_started_at, 'string');
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

function assertManagedIdentitiesBeforeObservation(events, result) {
  const rootIdentityIndex = events.findIndex((event) => event.type === 'worker.root_identity');
  const atomicChildIndex = events.findIndex((event) => event.type === 'worker.atomic_child');
  const observationIndex = events.findIndex((event) => event.type === 'worker.observation_started');
  assert(rootIdentityIndex >= 0);
  assert(atomicChildIndex > rootIdentityIndex);
  assert(observationIndex > atomicChildIndex);
  const rootIdentity = events[rootIdentityIndex];
  const observation = events[observationIndex];
  assert.equal(rootIdentity.pid, result.root_pid);
  assert.equal(rootIdentity.started_at, result.containment.root_started_at);
  assert.equal(observation.root_identity_registered, true);
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

function captureChild(child, stdinText = null) {
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += String(chunk);
  });
  child.stderr.on('data', (chunk) => {
    stderr += String(chunk);
  });
  if (stdinText !== null) child.stdin.end(stdinText);
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

async function runDelayedWrapperCloseCase() {
  let killCalled = false;
  const closePromise = new Promise((resolve) => {
    setTimeout(resolve, 75);
  });
  const startedAt = Date.now();
  const result = await stopExactWrapperForCleanup({
    child: {
      exitCode: 0,
      signalCode: null,
      kill: () => {
        killCalled = true;
        return true;
      },
    },
    closePromise,
    terminationGraceMs: 500,
  });
  const elapsedMs = Date.now() - startedAt;
  assert.equal(result.alreadyExited, true);
  assert.equal(result.killAccepted, null);
  assert.equal(result.wrapperClosed, true);
  assert.equal(killCalled, false);
  assert(elapsedMs >= 50, 'wrapper close helper returned from exit state before the close event');
  return {
    exit_state_did_not_substitute_for_close: true,
    elapsed_ms: elapsedMs,
  };
}
async function runWrapperStopFailureCases() {
  const killRejected = await stopExactWrapperForCleanup({
    child: {
      exitCode: null,
      signalCode: null,
      kill: () => false,
    },
    closePromise: new Promise((resolve) => setTimeout(resolve, 20)),
    terminationGraceMs: 200,
  });
  assert.equal(killRejected.alreadyExited, false);
  assert.equal(killRejected.killAccepted, false);
  assert.equal(killRejected.wrapperClosed, true);

  const closeTimedOut = await stopExactWrapperForCleanup({
    child: {
      exitCode: null,
      signalCode: null,
      kill: () => true,
    },
    closePromise: new Promise(() => {}),
    terminationGraceMs: 25,
  });
  assert.equal(closeTimedOut.alreadyExited, false);
  assert.equal(closeTimedOut.killAccepted, true);
  assert.equal(closeTimedOut.wrapperClosed, false);

  return {
    kill_rejection_exposed: true,
    close_timeout_exposed: true,
  };
}
function runIdentityLookupCleanupClassificationCase() {
  const killRejected = classifyControllerIdentityLookupCleanup(41001, {
    alreadyExited: false,
    killAccepted: false,
    wrapperClosed: true,
  });
  assert.equal(killRejected.required, true);
  assert.equal(killRejected.verified, false);
  assert.deepEqual(killRejected.confirmed_gone_pids, [41001]);
  assert(killRejected.errors.includes('controller identity lookup termination request was rejected'));

  const closeTimedOut = classifyControllerIdentityLookupCleanup(41002, {
    alreadyExited: false,
    killAccepted: true,
    wrapperClosed: false,
  });
  assert.equal(closeTimedOut.required, true);
  assert.equal(closeTimedOut.verified, false);
  assert.deepEqual(closeTimedOut.unknown_after_cleanup, [41002]);
  assert(closeTimedOut.errors.includes('controller identity lookup did not close after termination'));

  return {
    kill_rejection_failed_closed: true,
    close_timeout_failed_closed: true,
  };
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

function runControllerSameHandleBindingCase() {
  const openIndex = windowsJobRunnerSource.indexOf('var controllerHandle = OpenProcess(');
  const timeIndex = windowsJobRunnerSource.indexOf('GetProcessTimes(', openIndex);
  const returnIndex = windowsJobRunnerSource.indexOf('return controllerHandle;', timeIndex);
  assert(openIndex >= 0);
  assert(timeIndex > openIndex);
  assert(returnIndex > timeIndex);
  assert(windowsJobRunnerSource.includes('OpenVerifiedControllerProcess(controllerPid, controllerStartFileTime)'));
  assert(!windowsJobRunnerSource.includes('Process.GetProcessById(controllerPid)'));
  return {
    same_native_handle_verified_and_retained: true,
    managed_process_lookup_absent: true,
  };
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

  const missingStartCurrentRoot = {
    pid: rootPid,
    ppid: 12345,
    pgid: rootPid,
    name: 'node',
    started_at: null,
  };
  assert.equal(classifyProcessIdentity(root, missingStartCurrentRoot), 'unknown');
  const missingStartObserved = new Map([[rootPid, root]]);
  mergeObservedTree([
    missingStartCurrentRoot,
    {
      pid: 50006,
      ppid: rootPid,
      pgid: rootPid,
      name: 'unrelated-missing-start-child',
      started_at: null,
    },
  ], rootPid, missingStartObserved);
  assert.equal(missingStartObserved.has(50006), false);

  const startlessDescendantObserved = new Map([[rootPid, root]]);
  const startlessUnknownPids = mergeObservedTree([
    root,
    {
      pid: 50007,
      ppid: rootPid,
      pgid: rootPid,
      name: 'startless-descendant',
      started_at: null,
    },
  ], rootPid, startlessDescendantObserved);
  assert.deepEqual(startlessUnknownPids, [50007]);
  assert.equal(startlessDescendantObserved.has(50007), false);

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

  const sameSupervisorReuseObserved = new Map([[rootPid, {
    pid: rootPid,
    ppid: process.pid,
    pgid: null,
    name: 'powershell.exe',
    started_at: null,
  }]]);
  const sameSupervisorReuse = {
    pid: rootPid,
    ppid: process.pid,
    pgid: null,
    name: 'unrelated.exe',
    started_at: '2026-07-10T13:00:00.000Z',
  };
  assert.equal(classifyProcessIdentity(sameSupervisorReuseObserved.get(rootPid), sameSupervisorReuse), 'unknown');
  mergeObservedTree([
    sameSupervisorReuse,
    {
      pid: 50008,
      ppid: rootPid,
      pgid: null,
      name: 'unrelated-same-supervisor-child',
      started_at: '2026-07-10T13:00:00.100Z',
    },
  ], rootPid, sameSupervisorReuseObserved);
  assert.equal(sameSupervisorReuseObserved.get(rootPid)?.started_at, null);
  assert.equal(sameSupervisorReuseObserved.has(50008), false);

  return {
    stale_excluded: true,
    reused_parent_identity_excluded: true,
    known_start_missing_current_start_unknown: true,
    known_start_missing_current_start_child_excluded: true,
    startless_descendant_unknown: true,
    startless_descendant_excluded: true,
    uninitialized_root_reuse_excluded: true,
    same_supervisor_root_reuse_excluded: true,
    descendant_count: observed.size - 1,
  };
}

function assertNoWorkerSpawnEvents(events) {
  const forbidden = new Set([
    'worker.started',
    'worker.root_identity',
    'worker.atomic_child',
    'worker.stdout',
    'worker.stderr',
  ]);
  assert.deepEqual(events.filter((event) => forbidden.has(event.type)), []);
}

async function runPreSpawnAbortCase() {
  const events = [];
  const abortController = new AbortController();
  abortController.abort('already-aborted');
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    timeoutMs: 5000,
    signal: abortController.signal,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'interrupted', JSON.stringify(result, null, 2));
  assert.equal(result.interrupted, true);
  assert.equal(result.root_pid, null);
  assert.equal(result.cleanup.required, false);
  assert.equal(result.cleanup.verified, true);
  assertNoWorkerSpawnEvents(events);
  return {
    status: result.status,
    wrapper_spawned: false,
    worker_executed: false,
  };
}

async function runControllerIdentityStartFailureCase() {
  const events = [];
  const previousNodeEnv = process.env.NODE_ENV;
  const previousFailure = process.env.FDP_WORKER_TEST_IDENTITY_EXEC_THROW;
  process.env.NODE_ENV = 'test';
  process.env.FDP_WORKER_TEST_IDENTITY_EXEC_THROW = '1';
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'complete'],
      timeoutMs: 5000,
      onEvent: (event) => events.push(event),
    });
    assert.equal(result.status, 'controller_identity_failed', JSON.stringify(result, null, 2));
    assert.equal(result.root_pid, null);
    assert.equal(result.cleanup.required, false);
    assert.equal(result.cleanup.verified, true);
    assert(result.observation_errors.includes('test controller identity helper start failure'));
    assert.equal(events.filter((event) => event.type === 'worker.result').length, 1);
    assertNoWorkerSpawnEvents(events);
    return { status: result.status, structured_result: true, wrapper_spawned: false };
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousFailure === undefined) delete process.env.FDP_WORKER_TEST_IDENTITY_EXEC_THROW;
    else process.env.FDP_WORKER_TEST_IDENTITY_EXEC_THROW = previousFailure;
  }
}

async function runControllerIdentityResultFailureCase() {
  const events = [];
  const previousNodeEnv = process.env.NODE_ENV;
  const previousFailure = process.env.FDP_WORKER_TEST_IDENTITY_RESULT_REJECT;
  process.env.NODE_ENV = 'test';
  process.env.FDP_WORKER_TEST_IDENTITY_RESULT_REJECT = '1';
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'complete'],
      timeoutMs: 5000,
      onEvent: (event) => events.push(event),
    });
    assert.equal(result.status, 'controller_identity_failed', JSON.stringify(result, null, 2));
    assert.equal(result.root_pid, null);
    assert.equal(result.cleanup.required, false);
    assert.equal(result.cleanup.verified, true);
    assert(result.observation_errors.some((error) => error.includes('test controller identity helper result failure')));
    assert.equal(events.filter((event) => event.type === 'worker.result').length, 1);
    assertNoWorkerSpawnEvents(events);
    return { status: result.status, structured_result: true, wrapper_spawned: false };
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousFailure === undefined) delete process.env.FDP_WORKER_TEST_IDENTITY_RESULT_REJECT;
    else process.env.FDP_WORKER_TEST_IDENTITY_RESULT_REJECT = previousFailure;
  }
}

async function runPreSpawnTimeoutCase() {
  const events = [];
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDelay = process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS;
  process.env.NODE_ENV = 'test';
  process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS = '1000';
  const startedAt = Date.now();
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'complete'],
      timeoutMs: 100,
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'timed_out', JSON.stringify(result, null, 2));
    assert.equal(result.timed_out, true);
    assert.equal(result.root_pid, null);
    assert.equal(result.cleanup.required, true);
    assert.equal(result.cleanup.verified, true);
    assert.equal(result.cleanup.requested_pids.length, 1);
    assert.deepEqual(result.cleanup.confirmed_gone_pids, result.cleanup.requested_pids);
    assert.deepEqual(result.cleanup.unknown_after_cleanup, []);
    assert.equal(isProcessAlive(result.cleanup.requested_pids[0]), false);
    assert(elapsedMs < 750, 'controller identity query was not bounded by the timeout guard');
    assertNoWorkerSpawnEvents(events);
    return {
      status: result.status,
      elapsed_ms: elapsedMs,
      wrapper_spawned: false,
      worker_executed: false,
      identity_lookup_closed: true,
    };
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousDelay === undefined) delete process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS;
    else process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS = previousDelay;
  }
}

async function runPreSpawnIdentityAbortCase() {
  const events = [];
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDelay = process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS;
  process.env.NODE_ENV = 'test';
  process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS = '1000';
  const abortController = new AbortController();
  const abortHandle = setTimeout(() => abortController.abort('identity-lookup-abort'), 100);
  const startedAt = Date.now();
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'complete'],
      timeoutMs: 5000,
      signal: abortController.signal,
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'interrupted', JSON.stringify(result, null, 2));
    assert.equal(result.interrupted, true);
    assert.equal(result.root_pid, null);
    assert.equal(result.cleanup.required, true);
    assert.equal(result.cleanup.verified, true);
    assert.equal(result.cleanup.requested_pids.length, 1);
    assert.deepEqual(result.cleanup.confirmed_gone_pids, result.cleanup.requested_pids);
    assert.deepEqual(result.cleanup.unknown_after_cleanup, []);
    assert.equal(isProcessAlive(result.cleanup.requested_pids[0]), false);
    assert(elapsedMs < 750, 'controller identity query was not cancelled after interruption');
    assertNoWorkerSpawnEvents(events);
    return {
      status: result.status,
      elapsed_ms: elapsedMs,
      wrapper_spawned: false,
      worker_executed: false,
      identity_lookup_closed: true,
    };
  } finally {
    clearTimeout(abortHandle);
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousDelay === undefined) delete process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS;
    else process.env.FDP_WORKER_TEST_CONTROLLER_IDENTITY_DELAY_MS = previousDelay;
  }
}

/** @returns {NodeJS.ProcessEnv} */
function delayedInvocationEnvironment(delayMs, onRead = null) {
  /** @type {NodeJS.ProcessEnv} */
  const env = {};
  Object.defineProperty(env, 'FDP_TEST_DELAYED_ENV', {
    enumerable: true,
    get: () => {
      busyWait(delayMs);
      if (onRead) onRead();
      return '1';
    },
  });
  return env;
}

async function runFinalSpawnTimeoutGuardCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    env: delayedInvocationEnvironment(1500),
    timeoutMs: 1000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'timed_out', JSON.stringify(result, null, 2));
  assert.equal(result.root_pid, null);
  assert.equal(result.cleanup.required, false);
  assert.equal(result.cleanup.verified, true);
  assertNoWorkerSpawnEvents(events);
  return { status: result.status, wrapper_spawned: false, worker_executed: false };
}

async function runFinalSpawnAbortGuardCase() {
  const events = [];
  const abortController = new AbortController();
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    env: delayedInvocationEnvironment(25, () => abortController.abort('during-invocation-build')),
    timeoutMs: 5000,
    signal: abortController.signal,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'interrupted', JSON.stringify(result, null, 2));
  assert.equal(result.root_pid, null);
  assert.equal(result.cleanup.required, false);
  assert.equal(result.cleanup.verified, true);
  assertNoWorkerSpawnEvents(events);
  return { status: result.status, wrapper_spawned: false, worker_executed: false };
}
async function runControlEnvironmentIsolationCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'assert-control-env-absent'],
    timeoutMs: 5000,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, true);
  const fixtureEvent = events.find((event) => event.type === 'worker.stdout'
    && event.payload?.fixture === 'assert-control-env-absent');
  assert(fixtureEvent);
  assert.deepEqual(fixtureEvent.payload.inherited, []);
  return {
    status: result.status,
    control_environment_inherited: false,
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
  assertManagedIdentitiesBeforeObservation(events, result);
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
  assert(result.observed_descendant_pids.length >= 2, JSON.stringify(result, null, 2));
  assert.equal(result.cleanup.required, true);
  assert.equal(result.cleanup.reason, 'timeout');
  assert.equal(result.cleanup.verified, true);
  assert.deepEqual(result.cleanup.alive_after_cleanup, []);
  const cleanupPartitionVerified = assertObservedCleanupPartition(result);
  const atomicIdentityBeforeObservation = assertManagedIdentitiesBeforeObservation(events, result);
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

async function runSpawnFailureResultCallbackCase() {
  const missingCwd = path.join(os.tmpdir(), 'fdp-codex-missing-spawn-cwd-' + process.pid + '-' + Date.now());
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'complete'],
    cwd: missingCwd,
    timeoutMs: 5000,
    onEvent: (event) => {
      if (event.type === 'worker.result') throw new Error('spawn-failed-result-sink');
    },
  });
  assert.equal(result.status, 'event_dispatch_failed', JSON.stringify(result, null, 2));
  assert.equal(result.terminal_status_before_event_failure, 'spawn_failed');
  assert.equal(result.ok, false);
  assert(result.event_errors.includes('spawn-failed-result-sink'));
  assert.equal(result.root_pid, null);
  return {
    status: result.status,
    previous_status: result.terminal_status_before_event_failure,
    final_result_failure_reclassified: true,
  };
}
async function runSpoofedAtomicMarkerCase() {
  const spoofedPid = 424242;
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'spoof-marker'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    onEvent: (event) => events.push(event),
  });
  assert.equal(result.status, 'completed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, true);
  assert.notEqual(result.containment.atomic_child_pid, spoofedPid);
  assert.equal(result.observed_descendant_pids.includes(spoofedPid), false);
  assert.equal(result.containment.controller_watchdog_armed, true);
  assert.equal(result.containment.wrapper_closed, true);
  assert.equal(typeof result.containment.root_started_at, 'string');
  assert.deepEqual(result.containment.errors, []);
  assert(events.some((event) => event.type === 'worker.stderr'
    && event.payload === 'FDP_JOB_RUNNER_DRAINED:forged-token'));
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  return { ...result, spoofed_marker_ignored: true };
}

async function runSpoofedDrainWrapperKillCase() {
  const events = [];
  const result = await runManagedProcess({
    command: process.execPath,
    args: [fixturePath, 'spoof-drain-kill-wrapper'],
    timeoutMs: 5000,
    pollIntervalMs: 100,
    onEvent: (event) => events.push(event),
  });
  assert.notEqual(result.status, 'completed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.containment.assigned, true);
  assert.equal(result.containment.drained, false);
  assert.equal(result.containment.controller_watchdog_armed, true);
  assert.equal(result.containment.wrapper_closed, true);
  assert.equal(result.containment.verified, false);
  assert(events.some((event) => event.type === 'worker.stderr'
    && event.payload === 'FDP_JOB_RUNNER_DRAINED:forged-token'));
  assert.equal(isProcessAlive(result.root_pid), false);
  assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
  return { ...result, forged_drain_ignored: true };
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
  const previousNodeEnv = process.env.NODE_ENV;
  const previousInjection = process.env.FDP_WORKER_TEST_STDIN_ERROR_AFTER_TIMEOUT;
  process.env.NODE_ENV = 'test';
  process.env.FDP_WORKER_TEST_STDIN_ERROR_AFTER_TIMEOUT = '1';
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'root'],
      stdinText: 'x'.repeat(1024 * 1024),
      timeoutMs: 5000,
      pollIntervalMs: 100,
      terminationGraceMs: 500,
      verificationTimeoutMs: 5000,
    });
    assert.equal(result.status, 'timed_out', JSON.stringify(result, null, 2));
    assert.equal(result.timed_out, true);
    assert(result.stdin_errors.includes('test stdin failure after timeout selection'));
    assert.equal(result.cleanup.required, true);
    assert.equal(result.cleanup.verified, true);
    assert.equal(isProcessAlive(result.root_pid), false);
    assert.equal(isProcessAlive(result.containment.atomic_child_pid), false);
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    return { ...result, cleanup_partition_verified: cleanupPartitionVerified };
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousInjection === undefined) delete process.env.FDP_WORKER_TEST_STDIN_ERROR_AFTER_TIMEOUT;
    else process.env.FDP_WORKER_TEST_STDIN_ERROR_AFTER_TIMEOUT = previousInjection;
  }
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
    assert(result.observed_descendant_pids.length >= 2, JSON.stringify(result, null, 2));
    assert.equal(result.cleanup.reason, 'interrupted');
    assert.equal(result.cleanup.verified, true);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertManagedIdentitiesBeforeObservation(events, result);
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
  assert.equal(result.status, 'containment_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.containment.mode, 'windows-job-object');
  assert.equal(result.containment.drained, true);
  assert.equal(result.containment.verified, false);
  assert(result.containment.errors.some((error) => error.includes('Worker root exited while')));
  const fixtureEvent = events.find((event) => event.type === 'worker.stdout'
    && event.payload?.fixture === 'orphan-root');
  assert(fixtureEvent?.payload?.child_pid);
  assert.equal(isProcessAlive(fixtureEvent.payload.child_pid), false);
  return result;
}

async function runControllerPreAcquireDeathCase() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'fdp-controller-pre-acquire-'));
  const markerPath = path.join(tempRoot, 'worker-executed.txt');
  let controller = null;
  try {
    controller = spawn(process.execPath, [
      testScriptPath,
      '--controller-pre-acquire-helper',
      markerPath,
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let buffered = '';
    let wrapperPid = null;
    const rootIdentityReady = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('pre-acquire helper did not emit root identity')), 10000);
      controller.stdout.on('data', (chunk) => {
        buffered += String(chunk);
        const lines = buffered.split(/\r?\n/);
        buffered = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.type === 'worker.root_identity') wrapperPid = event.pid;
        }
        if (Number.isInteger(wrapperPid)) {
          clearTimeout(timer);
          resolve();
        }
      });
      controller.once('error', reject);
    });
    await rootIdentityReady;
    assert.equal(controller.kill(), true);
    await new Promise((resolve) => controller.once('close', resolve));
    const deadline = Date.now() + 5000;
    while (isProcessAlive(wrapperPid) && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(isProcessAlive(wrapperPid), false);
    assert.equal(existsSync(markerPath), false, 'worker executed before controller identity acquisition');
    return {
      controller_terminated_before_watchdog: true,
      wrapper_gone: true,
      worker_executed: false,
    };
  } finally {
    if (controller && controller.exitCode === null && controller.signalCode === null) {
      controller.kill();
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
}
async function runControllerDeathWatchdogCase() {
  const controller = spawn(process.execPath, [testScriptPath, '--controller-watchdog-helper'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let buffered = '';
  let wrapperPid = null;
  let atomicChildPid = null;
  const identitiesReady = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('controller watchdog helper did not emit identities')), 10000);
    controller.stdout.on('data', (chunk) => {
      buffered += String(chunk);
      const lines = buffered.split(/\r?\n/);
      buffered = lines.pop() ?? '';
      for (const line of lines) {
        if (!line) continue;
        const event = JSON.parse(line);
        if (event.type === 'worker.started') wrapperPid = event.root_pid;
        if (event.type === 'worker.atomic_child') atomicChildPid = event.pid;
      }
      if (Number.isInteger(wrapperPid) && Number.isInteger(atomicChildPid)) {
        clearTimeout(timer);
        resolve();
      }
    });
    controller.once('error', reject);
  });
  await identitiesReady;
  assert.equal(controller.kill(), true);
  await new Promise((resolve) => controller.once('close', resolve));
  const deadline = Date.now() + 5000;
  while ((isProcessAlive(wrapperPid) || isProcessAlive(atomicChildPid)) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(isProcessAlive(wrapperPid), false);
  assert.equal(isProcessAlive(atomicChildPid), false);
  return {
    controller_terminated: true,
    wrapper_pid: wrapperPid,
    atomic_child_pid: atomicChildPid,
    wrapper_gone: true,
    atomic_child_gone: true,
  };
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
  assert.equal(result.containment.controller_watchdog_armed, true);
  assert.equal(result.containment.wrapper_closed, true);
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
      timeoutMs: 3000,
      pollIntervalMs: 100,
      terminationGraceMs: 500,
      verificationTimeoutMs: 3000,
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.timed_out, true);
    assert(elapsedMs < OBSERVATION_HANG_FINITE_BOUND_MS, `observation hang exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(await waitForProcessGone(result.root_pid), true);
    assert.equal(await waitForProcessGone(result.containment.atomic_child_pid), true);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    assert(result.cleanup.unknown_after_cleanup.includes(result.root_pid));
    assert(result.cleanup.unknown_after_cleanup.includes(result.containment.atomic_child_pid));
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertManagedIdentitiesBeforeObservation(events, result);
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
  const abortTimer = setTimeout(() => abortController.abort('observer-hang-test'), 3000);
  const startedAt = Date.now();
  try {
    const result = await runManagedProcess({
      command: process.execPath,
      args: [fixturePath, 'root'],
      timeoutMs: 10000,
      pollIntervalMs: 100,
      terminationGraceMs: 500,
      verificationTimeoutMs: 3000,
      signal: abortController.signal,
      onEvent: (event) => events.push(event),
    });
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.status, 'cleanup_failed', JSON.stringify(result, null, 2));
    assert.equal(result.ok, false);
    assert.equal(result.interrupted, true);
    assert(elapsedMs < OBSERVATION_HANG_FINITE_BOUND_MS, `observation hang interruption exceeded finite bound: ${elapsedMs}ms`);
    assert(Number.isInteger(result.containment.atomic_child_pid));
    assert.equal(await waitForProcessGone(result.root_pid), true);
    assert.equal(await waitForProcessGone(result.containment.atomic_child_pid), true);
    assert.deepEqual(result.cleanup.alive_after_cleanup, []);
    assert(result.cleanup.unknown_after_cleanup.includes(result.root_pid));
    assert(result.cleanup.unknown_after_cleanup.includes(result.containment.atomic_child_pid));
    assert(result.observation_errors.length > 0, JSON.stringify(result, null, 2));
    const cleanupPartitionVerified = assertObservedCleanupPartition(result);
    const atomicIdentityBeforeObservation = assertManagedIdentitiesBeforeObservation(events, result);
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

function parseWorkerResult(stdout) {
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event.type === 'worker.result') return event.result;
    } catch {
      // Non-JSON fixture output is surfaced separately by the managed worker.
    }
  }
  return null;
}

async function runControllerIdentityMismatchCase() {
  const token = 'b'.repeat(64);
  const systemRoot = process.env.SystemRoot || 'C:\\Windows';
  const powershell = path.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const child = spawn(powershell, [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', windowsJobRunnerPath,
  ], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      FDP_JOB_COMMAND: process.execPath,
      FDP_JOB_ARGS_B64: Buffer.from(JSON.stringify([fixturePath, 'complete']), 'utf8').toString('base64'),
      FDP_JOB_CWD: process.cwd(),
      FDP_JOB_CONTROL_TOKEN: token,
      FDP_JOB_CONTROLLER_PID: String(process.pid),
      FDP_JOB_CONTROLLER_START_FILETIME: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const result = await captureChild(child);
  assert.equal(result.code, 125, JSON.stringify(result, null, 2));
  assert(result.stderr.includes('Controller identity mismatch.'), JSON.stringify(result, null, 2));
  assert.equal(result.stderr.includes('FDP_JOB_RUNNER_ASSIGNED:' + token), false);
  assert.equal(result.stderr.includes('FDP_JOB_RUNNER_ATOMIC_CHILD:' + token), false);
  return {
    exit_code: result.code,
    mismatch_rejected_before_worker_creation: true,
  };
}

async function runCliPrimaryExitCase(expectedExitCode, abortAfterMs = null) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'fdp-worker-cli-exit-'));
  try {
    await writeFile(path.join(tempRoot, 'exec'), 'setInterval(() => {}, 1000);\n', 'utf8');
    /** @type {NodeJS.ProcessEnv} */
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      CODEX_CLI_PATH: process.execPath,
      FDP_JOB_TEST_OBSERVATION_DELAY_MS: '10000',
    };
    delete env.FDP_WORKER_TEST_ABORT_AFTER_MS;
    if (abortAfterMs !== null) {
      env.FDP_WORKER_TEST_ABORT_AFTER_MS = String(abortAfterMs);
    }
    const child = spawn(process.execPath, [
      workerCliPath,
      '--cwd', tempRoot,
      '--timeout-ms', expectedExitCode === 124 ? '1000' : '10000',
      '--sandbox', 'read-only',
    ], {
      cwd: process.cwd(),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const result = await captureChild(child, 'deterministic CLI exit regression\n');
    assert.equal(result.code, expectedExitCode, JSON.stringify(result, null, 2));
    assert.equal(result.signal, null);
    const workerResult = parseWorkerResult(result.stdout);
    assert(workerResult, result.stdout);
    assert.equal(workerResult.status, 'cleanup_failed', JSON.stringify(workerResult, null, 2));
    assert.equal(workerResult.ok, false);
    assert.equal(workerResult.cleanup.verified, false);
    if (expectedExitCode === 124) {
      assert.equal(workerResult.timed_out, true);
      assert.equal(workerResult.interrupted, false);
    } else {
      assert.equal(workerResult.timed_out, false);
      assert.equal(workerResult.interrupted, true);
    }
    return {
      exit_code: result.code,
      detailed_status: workerResult.status,
      cleanup_verified: workerResult.cleanup.verified,
    };
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}
async function runCliPromptBoundaryCase(expectedExitCode, abortAfterMs = null) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'fdp-worker-cli-prompt-boundary-'));
  let child;
  let guardTimer;
  try {
    await writeFile(path.join(tempRoot, 'exec'), 'setInterval(() => {}, 1000);\n', 'utf8');
    /** @type {NodeJS.ProcessEnv} */
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      CODEX_CLI_PATH: process.execPath,
    };
    delete env.FDP_WORKER_TEST_ABORT_AFTER_MS;
    if (abortAfterMs !== null) env.FDP_WORKER_TEST_ABORT_AFTER_MS = String(abortAfterMs);
    child = spawn(process.execPath, [
      workerCliPath,
      '--cwd', tempRoot,
      '--timeout-ms', expectedExitCode === 124 ? '1000' : '10000',
      '--sandbox', 'read-only',
    ], {
      cwd: process.cwd(),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const startedAt = Date.now();
    const result = await Promise.race([
      captureChild(child),
      new Promise((resolve, reject) => {
        guardTimer = setTimeout(() => {
          child.kill();
          reject(new Error('prompt boundary CLI did not terminate'));
        }, 5000);
      }),
    ]);
    const elapsedMs = Date.now() - startedAt;
    assert.equal(result.code, expectedExitCode, JSON.stringify(result, null, 2));
    assert.equal(result.signal, null);
    assert(elapsedMs < 5000, 'prompt boundary exceeded finite guard: ' + elapsedMs + 'ms');
    const workerResult = parseWorkerResult(result.stdout);
    assert(workerResult, result.stdout);
    assert.equal(workerResult.status, expectedExitCode === 124 ? 'timed_out' : 'interrupted');
    assert.equal(workerResult.root_pid, null);
    assert.equal(workerResult.cleanup.required, false);
    assert.equal(workerResult.cleanup.verified, true);
    assert.equal(result.stdout.includes('"type":"worker.started"'), false);
    return {
      exit_code: result.code,
      status: workerResult.status,
      root_pid: workerResult.root_pid,
      wrapper_spawned: false,
      elapsed_ms: elapsedMs,
    };
  } finally {
    if (guardTimer) clearTimeout(guardTimer);
    if (child && child.exitCode === null && child.signalCode === null) child.kill();
    await rm(tempRoot, { recursive: true, force: true });
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
  assert.equal(result.status, 'containment_failed', JSON.stringify(result, null, 2));
  assert.equal(result.ok, false);
  assert.equal(result.containment.mode, 'windows-job-object');
  assert.equal(result.containment.assigned, true);
  assert.equal(result.containment.drained, true);
  assert.equal(result.containment.verified, false);
  assert(result.containment.errors.some((error) => error.includes('Worker root exited while')));
  const fixtureEvent = events.find((event) => event.type === 'worker.stdout'
    && event.payload?.fixture === 'fast-orphan-root');
  assert(fixtureEvent?.payload?.child_pid);
  assert.equal(isProcessAlive(fixtureEvent.payload.child_pid), false);
  return result;
}

const pidOnlySignalGuard = runPidOnlySignalGuardCase();
const delayedWrapperClose = await runDelayedWrapperCloseCase();
const wrapperStopFailures = await runWrapperStopFailureCases();
const identityLookupCleanupClassification = runIdentityLookupCleanupClassificationCase();
const builtinFanoutFlag = runBuiltinFanoutFlagCase();
const platformSupport = runPlatformSupportCase();
const controllerSameHandleBinding = runControllerSameHandleBindingCase();
const temporalIdentity = runTemporalIdentityCase();
const windowsCases = process.platform === 'win32' ? {
  preSpawnAbort: await runPreSpawnAbortCase(),
  controllerIdentityStartFailure: await runControllerIdentityStartFailureCase(),
  controllerIdentityResultFailure: await runControllerIdentityResultFailureCase(),
  preSpawnTimeout: await runPreSpawnTimeoutCase(),
  preSpawnIdentityAbort: await runPreSpawnIdentityAbortCase(),
  finalSpawnTimeout: await runFinalSpawnTimeoutGuardCase(),
  finalSpawnAbort: await runFinalSpawnAbortGuardCase(),
  controlEnvironmentIsolation: await runControlEnvironmentIsolationCase(),
  normal: await runNormalCase(),
  timeout: await runTimeoutCase(),
  startedCallbackDeadline: await runStartedCallbackDeadlineCase(),
  throwingStartedCallback: await runThrowingStartedCallbackCase(),
  throwingResultCallback: await runThrowingResultCallbackCase(),
  spawnFailureResultCallback: await runSpawnFailureResultCallbackCase(),
  spoofedAtomicMarker: await runSpoofedAtomicMarkerCase(),
  spoofedDrainWrapperKill: await runSpoofedDrainWrapperKillCase(),
  stdinEarlyExit: await runStdinEarlyExitCase(),
  stdinTimeout: await runStdinTimeoutCase(),
  interruption: await runInterruptionCase(),
  orphanContainment: await runOrphanContainmentCase(),
  controllerPreAcquireDeath: await runControllerPreAcquireDeathCase(),
  controllerDeathWatchdog: await runControllerDeathWatchdogCase(),
  controllerIdentityMismatch: await runControllerIdentityMismatchCase(),
  cliPromptTimeout: await runCliPromptBoundaryCase(124),
  cliPromptInterruption: await runCliPromptBoundaryCase(130, 750),
  cliTimeoutExit: await runCliPrimaryExitCase(124),
  cliInterruptionExit: await runCliPrimaryExitCase(130, 750),
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
    pid_only_signal_guard: pidOnlySignalGuard,
    delayed_wrapper_close: delayedWrapperClose,
    wrapper_stop_failures: wrapperStopFailures,
    identity_lookup_cleanup_classification: identityLookupCleanupClassification,
    builtin_fanout_flag: builtinFanoutFlag,
    platform_support: platformSupport,
    controller_same_handle_binding: controllerSameHandleBinding,
    temporal_identity: temporalIdentity,
    unsupported_platform: unsupportedPlatform && {
      status: unsupportedPlatform.status,
      containment_mode: unsupportedPlatform.containment.mode,
    },
    windows_lifecycle: windowsCases && {
      pre_spawn_abort: windowsCases.preSpawnAbort,
      controller_identity_start_failure: windowsCases.controllerIdentityStartFailure,
      controller_identity_result_failure: windowsCases.controllerIdentityResultFailure,
      pre_spawn_timeout: windowsCases.preSpawnTimeout,
      pre_spawn_identity_abort: windowsCases.preSpawnIdentityAbort,
      final_spawn_timeout: windowsCases.finalSpawnTimeout,
      final_spawn_abort: windowsCases.finalSpawnAbort,
      control_environment_isolation: windowsCases.controlEnvironmentIsolation,
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
        controller_watchdog_armed: windowsCases.timeout.containment.controller_watchdog_armed,
        wrapper_closed: windowsCases.timeout.containment.wrapper_closed,
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
      spawn_failure_result_callback: windowsCases.spawnFailureResultCallback,
      spoofed_atomic_marker: {
        status: windowsCases.spoofedAtomicMarker.status,
        spoofed_marker_ignored: windowsCases.spoofedAtomicMarker.spoofed_marker_ignored,
        spoofed_pid_observed: windowsCases.spoofedAtomicMarker.observed_descendant_pids.includes(424242),
        containment_verified: windowsCases.spoofedAtomicMarker.containment.verified,
      },
      spoofed_drain_wrapper_kill: {
        status: windowsCases.spoofedDrainWrapperKill.status,
        forged_drain_ignored: windowsCases.spoofedDrainWrapperKill.forged_drain_ignored,
        containment_assigned: windowsCases.spoofedDrainWrapperKill.containment.assigned,
        containment_drained: windowsCases.spoofedDrainWrapperKill.containment.drained,
        containment_verified: windowsCases.spoofedDrainWrapperKill.containment.verified,
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
      controller_pre_acquire_death: windowsCases.controllerPreAcquireDeath,
      controller_death_watchdog: {
        controller_terminated: windowsCases.controllerDeathWatchdog.controller_terminated,
        wrapper_gone: windowsCases.controllerDeathWatchdog.wrapper_gone,
        atomic_child_gone: windowsCases.controllerDeathWatchdog.atomic_child_gone,
      },
      controller_identity_mismatch: windowsCases.controllerIdentityMismatch,
      cli_prompt_timeout: windowsCases.cliPromptTimeout,
      cli_prompt_interruption: windowsCases.cliPromptInterruption,
      cli_timeout_exit: windowsCases.cliTimeoutExit,
      cli_interruption_exit: windowsCases.cliInterruptionExit,
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
        finite_bound_ms: OBSERVATION_HANG_FINITE_BOUND_MS,
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
        finite_bound_ms: OBSERVATION_HANG_FINITE_BOUND_MS,
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
