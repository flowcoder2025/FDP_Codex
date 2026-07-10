import { execFile, spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

/**
 * @typedef {{pid: number, ppid: number, pgid: number | null, name: string, started_at: string | null}} ProcessInfo
 * @typedef {{type: string, timestamp: string, [key: string]: unknown}} ManagedProcessEvent
 * @typedef {{
 *   required: boolean,
 *   reason: string | null,
 *   requested_pids: number[],
 *   confirmed_gone_pids: number[],
 *   identity_mismatch_pids: number[],
 *   alive_after_cleanup: number[],
 *   verified: boolean,
 *   errors: string[]
 * }} CleanupResult
 */

const DEFAULT_MAX_BUFFER = 8 * 1024 * 1024;

/** @param {number} milliseconds */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<string>}
 */
function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      encoding: 'utf8',
      maxBuffer: DEFAULT_MAX_BUFFER,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || '').trim();
        reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
        return;
      }
      resolve(String(stdout));
    });
  });
}

/** @returns {Promise<ProcessInfo[]>} */
async function listWindowsProcesses() {
  const systemRoot = process.env.SystemRoot || 'C:\\Windows';
  const powershell = path.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const script = [
    "$ErrorActionPreference = 'Stop'",
    '$items = @(Get-CimInstance Win32_Process | ForEach-Object {',
    '  $started = if ($null -ne $_.CreationDate) { $_.CreationDate.ToUniversalTime().ToString(\'o\') } else { $null }',
    '  [PSCustomObject]@{ pid = [int]$_.ProcessId; ppid = [int]$_.ParentProcessId; name = [string]$_.Name; started_at = $started }',
    '})',
    'ConvertTo-Json -Compress -InputObject $items',
  ].join('; ');
  const output = (await execFileText(powershell, [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-Command', script,
  ])).trim();
  if (!output) return [];
  const parsed = JSON.parse(output);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows.map((row) => ({
    pid: Number(row.pid),
    ppid: Number(row.ppid),
    pgid: null,
    name: String(row.name || ''),
    started_at: row.started_at ? String(row.started_at) : null,
  })).filter((row) => Number.isInteger(row.pid) && row.pid > 0);
}

/** @returns {Promise<ProcessInfo[]>} */
async function listPosixProcesses() {
  const output = await execFileText('ps', ['-eo', 'pid=,ppid=,pgid=,lstart=,comm=']);
  /** @type {ProcessInfo[]} */
  const rows = [];
  for (const line of output.split(/\r?\n/)) {
    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+\s+\S+\s+\d+\s+\S+\s+\d+)\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const parsedStart = new Date(match[4]);
    rows.push({
      pid: Number(match[1]),
      ppid: Number(match[2]),
      pgid: Number(match[3]),
      name: match[5],
      started_at: Number.isNaN(parsedStart.getTime()) ? match[4] : parsedStart.toISOString(),
    });
  }
  return rows;
}

/** @returns {Promise<ProcessInfo[]>} */
export function listProcessTable() {
  return process.platform === 'win32' ? listWindowsProcesses() : listPosixProcesses();
}

/**
 * @param {ProcessInfo} expected
 * @param {ProcessInfo} current
 */
function sameIdentity(expected, current) {
  if (expected.pid !== current.pid) return false;
  if (expected.started_at && current.started_at) return expected.started_at === current.started_at;
  if (expected.name && current.name) {
    return path.basename(expected.name).toLowerCase() === path.basename(current.name).toLowerCase();
  }
  return false;
}

/**
 * @param {ProcessInfo} candidate
 * @param {ProcessInfo | undefined} ancestor
 */
function isNotOlderThan(candidate, ancestor) {
  if (!candidate.started_at || !ancestor?.started_at) return true;
  const candidateStartedAt = Date.parse(candidate.started_at);
  const ancestorStartedAt = Date.parse(ancestor.started_at);
  if (!Number.isFinite(candidateStartedAt) || !Number.isFinite(ancestorStartedAt)) return true;
  return candidateStartedAt >= ancestorStartedAt;
}

/**
 * @param {ProcessInfo[]} table
 * @param {number} rootPid
 * @param {Map<number, ProcessInfo>} observed
 */
export function mergeObservedTree(table, rootPid, observed) {
  const byPid = new Map(table.map((entry) => [entry.pid, entry]));
  const root = byPid.get(rootPid);
  const expectedRoot = observed.get(rootPid);
  const matchesSpawnedRoot = root
    && root.ppid === process.pid
    && (process.platform === 'win32' || root.pgid === rootPid);
  const needsInitialIdentity = expectedRoot && expectedRoot.started_at === null;
  if (root && (
    !expectedRoot
    || (needsInitialIdentity && matchesSpawnedRoot)
    || sameIdentity(expectedRoot, root)
  )) {
    observed.set(rootPid, root);
  }

  const parentPids = new Set(observed.keys());
  parentPids.add(rootPid);
  let changed = true;
  while (changed) {
    changed = false;
    for (const entry of table) {
      const parent = observed.get(entry.ppid);
      const currentParent = byPid.get(entry.ppid);
      const observedRoot = observed.get(rootPid);
      const belongsToObservedParent = parentPids.has(entry.ppid)
        && parent !== undefined
        && currentParent !== undefined
        && sameIdentity(parent, currentParent)
        && isNotOlderThan(entry, parent);
      const belongsToPosixGroup = process.platform !== 'win32'
        && entry.pgid === rootPid
        && isNotOlderThan(entry, observedRoot);
      if (entry.pid === process.pid || (!belongsToObservedParent && !belongsToPosixGroup) || observed.has(entry.pid)) continue;
      observed.set(entry.pid, entry);
      parentPids.add(entry.pid);
      changed = true;
    }
  }
}

/**
 * @param {Map<number, ProcessInfo>} observed
 * @param {ProcessInfo[]} table
 */
function classifyObserved(observed, table) {
  const byPid = new Map(table.map((entry) => [entry.pid, entry]));
  /** @type {ProcessInfo[]} */
  const alive = [];
  /** @type {number[]} */
  const identityMismatches = [];
  for (const expected of observed.values()) {
    const current = byPid.get(expected.pid);
    if (!current) continue;
    if (sameIdentity(expected, current)) alive.push(current);
    else identityMismatches.push(expected.pid);
  }
  return { alive, identityMismatches };
}

/**
 * @param {ProcessInfo} entry
 * @param {Map<number, ProcessInfo>} observed
 */
function processDepth(entry, observed) {
  let depth = 0;
  let cursor = entry;
  const seen = new Set([entry.pid]);
  while (observed.has(cursor.ppid) && !seen.has(cursor.ppid)) {
    depth += 1;
    seen.add(cursor.ppid);
    cursor = /** @type {ProcessInfo} */ (observed.get(cursor.ppid));
  }
  return depth;
}

/**
 * @param {ProcessInfo[]} entries
 * @param {string} signal
 * @param {string[]} errors
 */
function signalProcesses(entries, signal, errors) {
  for (const entry of entries) {
    try {
      process.kill(entry.pid, signal);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ESRCH') continue;
      errors.push(`pid ${entry.pid}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * @param {{
 *   observed: Map<number, ProcessInfo>,
 *   observeNow: () => Promise<ProcessInfo[]>,
 *   reason: string,
 *   graceMs: number,
 *   verifyMs: number,
 * }} options
 * @returns {Promise<CleanupResult>}
 */
async function terminateObservedTree(options) {
  const errors = [];
  let table;
  try {
    table = await options.observeNow();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return {
      required: true,
      reason: options.reason,
      requested_pids: [...options.observed.keys()].sort((a, b) => a - b),
      confirmed_gone_pids: [],
      identity_mismatch_pids: [],
      alive_after_cleanup: [...options.observed.keys()].sort((a, b) => a - b),
      verified: false,
      errors,
    };
  }

  let classified = classifyObserved(options.observed, table);
  const requested = classified.alive
    .sort((a, b) => processDepth(b, options.observed) - processDepth(a, options.observed))
    .map((entry) => entry.pid);
  const requestedEntries = requested
    .map((pid) => options.observed.get(pid))
    .filter((entry) => entry !== undefined);

  signalProcesses(requestedEntries, 'SIGTERM', errors);
  await sleep(options.graceMs);

  try {
    table = await options.observeNow();
    classified = classifyObserved(options.observed, table);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  if (classified.alive.length > 0) {
    const forceSignal = process.platform === 'win32' ? 'SIGTERM' : 'SIGKILL';
    const forceEntries = classified.alive
      .sort((a, b) => processDepth(b, options.observed) - processDepth(a, options.observed));
    signalProcesses(forceEntries, forceSignal, errors);
  }

  const deadline = Date.now() + options.verifyMs;
  while (Date.now() < deadline) {
    await sleep(100);
    try {
      table = await options.observeNow();
      classified = classifyObserved(options.observed, table);
      if (classified.alive.length === 0) break;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      break;
    }
  }

  const aliveAfter = classified.alive.map((entry) => entry.pid).sort((a, b) => a - b);
  const mismatchPids = [...new Set(classified.identityMismatches)].sort((a, b) => a - b);
  return {
    required: true,
    reason: options.reason,
    requested_pids: [...requested].sort((a, b) => a - b),
    confirmed_gone_pids: requested.filter((pid) => !aliveAfter.includes(pid)).sort((a, b) => a - b),
    identity_mismatch_pids: mismatchPids,
    alive_after_cleanup: aliveAfter,
    verified: aliveAfter.length === 0 && errors.length === 0,
    errors,
  };
}

/**
 * @param {NodeJS.ReadableStream} stream
 * @param {'stdout' | 'stderr'} streamName
 * @param {(event: ManagedProcessEvent) => void} emit
 */
function captureLines(stream, streamName, emit) {
  let count = 0;
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });
  reader.on('line', (line) => {
    count += 1;
    /** @type {unknown} */
    let payload = line;
    if (streamName === 'stdout') {
      try {
        payload = JSON.parse(line);
      } catch {
        payload = line;
      }
    }
    emit({
      type: `worker.${streamName}`,
      timestamp: new Date().toISOString(),
      sequence: count,
      payload,
    });
  });
  return () => count;
}

/**
 * Run one child process with observable output, a hard deadline, and verified
 * cleanup of the exact root and descendant process identities seen at runtime.
 *
 * @param {{
 *   command: string,
 *   args?: string[],
 *   cwd?: string,
 *   env?: NodeJS.ProcessEnv,
 *   stdinText?: string,
 *   timeoutMs: number,
 *   pollIntervalMs?: number,
 *   terminationGraceMs?: number,
 *   verificationTimeoutMs?: number,
 *   residualGraceMs?: number,
 *   signal?: AbortSignal,
 *   onEvent?: (event: ManagedProcessEvent) => void,
 * }} options
 */
export async function runManagedProcess(options) {
  if (!options.command) throw new Error('command is required');
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1) {
    throw new Error('timeoutMs must be a positive integer');
  }

  const emit = options.onEvent || (() => {});
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const terminationGraceMs = options.terminationGraceMs ?? 500;
  const verificationTimeoutMs = options.verificationTimeoutMs ?? 5000;
  const residualGraceMs = options.residualGraceMs ?? 300;
  /** @type {Map<number, ProcessInfo>} */
  const observed = new Map();
  const observationErrors = new Set();
  let observationSucceeded = false;

  const child = spawn(options.command, options.args || [], {
    cwd: options.cwd,
    env: options.env,
    detached: process.platform !== 'win32',
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const stdoutCount = captureLines(child.stdout, 'stdout', emit);
  const stderrCount = captureLines(child.stderr, 'stderr', emit);
  const closePromise = new Promise((resolve) => {
    child.once('close', (code, signal) => resolve({ kind: 'exit', code, signal }));
  });
  const spawnResult = await new Promise((resolve) => {
    child.once('spawn', () => resolve({ ok: true }));
    child.once('error', (error) => resolve({ ok: false, error }));
  });

  if (!spawnResult.ok || !child.pid) {
    const message = 'error' in spawnResult && spawnResult.error instanceof Error
      ? spawnResult.error.message
      : 'child process did not provide a pid';
    const result = {
      schema_version: 1,
      kind: 'managed-worker-result',
      status: 'spawn_failed',
      ok: false,
      root_pid: null,
      observed_descendant_pids: [],
      timed_out: false,
      interrupted: false,
      exit_code: null,
      signal: null,
      stdout_line_count: stdoutCount(),
      stderr_line_count: stderrCount(),
      observation_verified: false,
      observation_errors: [message],
      cleanup: {
        required: false,
        reason: null,
        requested_pids: [],
        confirmed_gone_pids: [],
        identity_mismatch_pids: [],
        alive_after_cleanup: [],
        verified: false,
        errors: [],
      },
    };
    emit({ type: 'worker.result', timestamp: new Date().toISOString(), result });
    return result;
  }

  const rootPid = child.pid;
  observed.set(rootPid, {
    pid: rootPid,
    ppid: process.pid,
    pgid: process.platform === 'win32' ? null : rootPid,
    name: path.basename(options.command),
    started_at: null,
  });
  emit({
    type: 'worker.started',
    timestamp: new Date().toISOString(),
    root_pid: rootPid,
    command: path.basename(options.command),
    timeout_ms: options.timeoutMs,
  });

  if (options.stdinText !== undefined) child.stdin.end(options.stdinText);
  else child.stdin.end();

  /** @type {Promise<ProcessInfo[]> | null} */
  let observeInFlight = null;
  const observeNow = () => {
    if (observeInFlight) return observeInFlight;
    observeInFlight = listProcessTable()
      .then((table) => {
        mergeObservedTree(table, rootPid, observed);
        observationSucceeded = true;
        return table;
      })
      .catch((error) => {
        observationSucceeded = false;
        const message = error instanceof Error ? error.message : String(error);
        observationErrors.add(message);
        emit({ type: 'worker.observation_error', timestamp: new Date().toISOString(), message });
        throw error;
      })
      .finally(() => {
        observeInFlight = null;
      });
    return observeInFlight;
  };

  try {
    await observeNow();
  } catch {
    // A later observation may recover. Cleanup verification remains mandatory.
  }

  const poll = setInterval(() => {
    void observeNow().catch(() => {});
  }, pollIntervalMs);
  poll.unref();

  /** @type {NodeJS.Timeout | undefined} */
  let timeoutHandle;
  const timeoutPromise = new Promise((resolve) => {
    timeoutHandle = setTimeout(() => resolve({ kind: 'timeout' }), options.timeoutMs);
  });

  /** @type {(() => void) | null} */
  let removeAbortListener = null;
  const abortPromise = new Promise((resolve) => {
    if (!options.signal) return;
    const onAbort = () => resolve({ kind: 'interrupted', reason: options.signal?.reason });
    if (options.signal.aborted) onAbort();
    else {
      options.signal.addEventListener('abort', onAbort, { once: true });
      removeAbortListener = () => options.signal?.removeEventListener('abort', onAbort);
    }
  });

  const outcome = await Promise.race([closePromise, timeoutPromise, abortPromise]);
  clearInterval(poll);
  if (timeoutHandle) clearTimeout(timeoutHandle);
  if (removeAbortListener) removeAbortListener();

  let cleanup = {
    required: false,
    reason: null,
    requested_pids: [],
    confirmed_gone_pids: [],
    identity_mismatch_pids: [],
    alive_after_cleanup: [],
    verified: true,
    errors: [],
  };
  let status = 'completed';
  let exitCode = null;
  let exitSignal = null;
  let timedOut = false;
  let interrupted = false;

  if (outcome && outcome.kind === 'timeout') {
    timedOut = true;
    status = 'timed_out';
    emit({ type: 'worker.timeout', timestamp: new Date().toISOString(), root_pid: rootPid, timeout_ms: options.timeoutMs });
    cleanup = await terminateObservedTree({
      observed,
      observeNow,
      reason: 'timeout',
      graceMs: terminationGraceMs,
      verifyMs: verificationTimeoutMs,
    });
  } else if (outcome && outcome.kind === 'interrupted') {
    interrupted = true;
    status = 'interrupted';
    emit({ type: 'worker.interrupted', timestamp: new Date().toISOString(), root_pid: rootPid });
    cleanup = await terminateObservedTree({
      observed,
      observeNow,
      reason: 'interrupted',
      graceMs: terminationGraceMs,
      verifyMs: verificationTimeoutMs,
    });
  } else if (outcome && outcome.kind === 'exit') {
    exitCode = outcome.code;
    exitSignal = outcome.signal;
    await sleep(residualGraceMs);
    try {
      const table = await observeNow();
      const residuals = classifyObserved(observed, table).alive.filter((entry) => entry.pid !== rootPid);
      if (residuals.length > 0) {
        status = 'residual_processes';
        cleanup = await terminateObservedTree({
          observed,
          observeNow,
          reason: 'residual-processes-after-root-exit',
          graceMs: terminationGraceMs,
          verifyMs: verificationTimeoutMs,
        });
      }
    } catch {
      status = 'observation_failed';
      cleanup.verified = false;
    }
  }

  if (cleanup.required && !cleanup.verified) status = 'cleanup_failed';
  const descendantPids = [...observed.keys()].filter((pid) => pid !== rootPid).sort((a, b) => a - b);
  const observationVerified = observationSucceeded && (!cleanup.required || cleanup.verified);
  const ok = status === 'completed' && exitCode === 0 && observationVerified;
  const result = {
    schema_version: 1,
    kind: 'managed-worker-result',
    status,
    ok,
    root_pid: rootPid,
    observed_descendant_pids: descendantPids,
    timed_out: timedOut,
    interrupted,
    exit_code: exitCode,
    signal: exitSignal,
    stdout_line_count: stdoutCount(),
    stderr_line_count: stderrCount(),
    observation_verified: observationVerified,
    observation_errors: [...observationErrors],
    cleanup,
  };
  emit({ type: 'worker.result', timestamp: new Date().toISOString(), result });
  return result;
}
