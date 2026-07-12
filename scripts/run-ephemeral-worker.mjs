#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildEphemeralWorkerArgs, resolveCodexInvocation } from './lib/codex-invocation.mjs';
import { managedProcessPlatformSupport, runManagedProcess } from './lib/managed-process.mjs';

const MAX_PROMPT_BYTES = 1024 * 1024;
const ALLOWED_SANDBOXES = new Set(['read-only', 'workspace-write']);

function usage() {
  return [
    'Usage: npm run worker:run -- --cwd <path> [--timeout-ms <ms>] [--sandbox read-only|workspace-write]',
    '',
    'The worker prompt is required on stdin. The prompt is never placed in argv or written by this wrapper.',
  ].join('\n');
}

/** @param {string[]} argv */
function parseArgs(argv) {
  const result = {
    cwd: process.cwd(),
    timeoutMs: 120000,
    sandbox: 'workspace-write',
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      result.help = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
    if (token === '--cwd') result.cwd = path.resolve(value);
    else if (token === '--timeout-ms') result.timeoutMs = Number(value);
    else if (token === '--sandbox') result.sandbox = value;
    else throw new Error(`unknown option: ${token}`);
    index += 1;
  }
  if (!Number.isInteger(result.timeoutMs) || result.timeoutMs < 1000 || result.timeoutMs > 1800000) {
    throw new Error('--timeout-ms must be an integer between 1000 and 1800000');
  }
  if (!ALLOWED_SANDBOXES.has(result.sandbox)) {
    throw new Error('--sandbox must be read-only or workspace-write');
  }
  if (!existsSync(result.cwd)) throw new Error(`--cwd does not exist: ${result.cwd}`);
  return result;
}

class PromptBoundaryError extends Error {
  constructor(kind, reason) {
    super(kind === 'timeout'
      ? 'worker prompt read timed out'
      : 'worker prompt read interrupted: ' + String(reason || 'signal'));
    this.kind = kind;
    this.reason = reason;
  }
}

function readPrompt(deadlineAt, signal) {
  if (process.stdin.isTTY) return Promise.reject(new Error('worker prompt must be piped through stdin'));
  process.stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let prompt = '';
    let settled = false;
    let timeoutHandle;

    const cleanup = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      process.stdin.removeListener('data', onData);
      process.stdin.removeListener('end', onEnd);
      process.stdin.removeListener('error', onError);
      signal.removeEventListener('abort', onAbort);
    };
    const finish = (callback, value, destroy = false) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (destroy) {
        process.stdin.pause();
        process.stdin.destroy();
      }
      callback(value);
    };
    const onData = (chunk) => {
      prompt += chunk;
      if (Buffer.byteLength(prompt, 'utf8') > MAX_PROMPT_BYTES) {
        finish(reject, new Error('worker prompt exceeds ' + MAX_PROMPT_BYTES + ' bytes'), true);
      }
    };
    const onEnd = () => {
      if (!prompt.trim()) {
        finish(reject, new Error('worker prompt on stdin is empty'));
        return;
      }
      finish(resolve, prompt);
    };
    const onError = (error) => finish(reject, error);
    const onAbort = () => finish(
      reject,
      new PromptBoundaryError('interrupted', signal.reason),
      true,
    );
    const remainingMs = deadlineAt - Date.now();
    const onTimeout = () => finish(
      reject,
      new PromptBoundaryError('timeout', 'prompt-read-deadline'),
      true,
    );

    process.stdin.on('data', onData);
    process.stdin.once('end', onEnd);
    process.stdin.once('error', onError);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) {
      onAbort();
      return;
    }
    if (remainingMs <= 0) {
      queueMicrotask(onTimeout);
      return;
    }
    timeoutHandle = setTimeout(onTimeout, remainingMs);
    process.stdin.resume();
  });
}
function emitJson(event) {
  process.stdout.write(JSON.stringify(event) + '\n');
}

function emitPromptBoundaryResult(kind, timeoutMs, reason) {
  const timedOut = kind === 'timeout';
  const status = timedOut ? 'timed_out' : 'interrupted';
  const timestamp = new Date().toISOString();
  emitJson({
    type: timedOut ? 'worker.timeout' : 'worker.interrupted',
    timestamp,
    root_pid: null,
    ...(timedOut ? { timeout_ms: timeoutMs } : {}),
  });
  const platformSupport = managedProcessPlatformSupport();
  const message = timedOut
    ? 'worker prompt read exceeded the invocation deadline'
    : 'worker prompt read interrupted: ' + String(reason || 'signal');
  const result = {
    schema_version: 1,
    kind: 'managed-worker-result',
    status,
    ok: false,
    root_pid: null,
    observed_descendant_pids: [],
    timed_out: timedOut,
    interrupted: !timedOut,
    exit_code: null,
    signal: null,
    stdout_line_count: 0,
    stderr_line_count: 0,
    event_errors: [],
    stdin_errors: [],
    observation_verified: false,
    observation_errors: [message],
    containment: {
      mode: platformSupport.mode,
      assigned: false,
      drained: false,
      verified: false,
      controller_watchdog_armed: false,
      wrapper_closed: false,
      root_started_at: null,
      atomic_child_pid: null,
      atomic_child_started_at: null,
      errors: [],
    },
    cleanup: {
      required: false,
      reason: null,
      requested_pids: [],
      confirmed_gone_pids: [],
      identity_mismatch_pids: [],
      alive_after_cleanup: [],
      unknown_after_cleanup: [],
      verified: true,
      errors: [],
    },
  };
  emitJson({ type: 'worker.result', timestamp: new Date().toISOString(), result });
  return result;
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage() + '\n');
    return;
  }

  const deadlineAt = Date.now() + args.timeoutMs;
  const abortController = new AbortController();
  const testAbortAfterMs = process.env.NODE_ENV === 'test'
    ? Number.parseInt(process.env.FDP_WORKER_TEST_ABORT_AFTER_MS || '', 10)
    : Number.NaN;
  const testAbortTimer = Number.isInteger(testAbortAfterMs) && testAbortAfterMs > 0
    ? setTimeout(() => abortController.abort('test-interruption'), testAbortAfterMs)
    : null;
  const onSigint = () => abortController.abort('SIGINT');
  const onSigterm = () => abortController.abort('SIGTERM');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);

  try {
    const invocation = resolveCodexInvocation();
    let prompt;
    try {
      prompt = await readPrompt(deadlineAt, abortController.signal);
    } catch (error) {
      if (!(error instanceof PromptBoundaryError)) throw error;
      const result = emitPromptBoundaryResult(error.kind, args.timeoutMs, error.reason);
      process.exitCode = result.timed_out ? 124 : 130;
      return;
    }

    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      emitPromptBoundaryResult('timeout', args.timeoutMs, 'prompt-read-deadline');
      process.exitCode = 124;
      return;
    }

    const result = await runManagedProcess({
      command: invocation.command,
      args: buildEphemeralWorkerArgs({
        argsPrefix: invocation.argsPrefix,
        sandbox: args.sandbox,
        cwd: args.cwd,
      }),
      cwd: args.cwd,
      stdinText: prompt,
      timeoutMs: remainingMs,
      pollIntervalMs: 100,
      signal: abortController.signal,
      onEvent: emitJson,
    });
    if (result.ok) return;
    if (result.timed_out) process.exitCode = 124;
    else if (result.interrupted) process.exitCode = 130;
    else process.exitCode = 1;
  } finally {
    if (testAbortTimer) clearTimeout(testAbortTimer);
    process.removeListener('SIGINT', onSigint);
    process.removeListener('SIGTERM', onSigterm);
  }
}
main().catch((error) => {
  emitJson({
    type: 'worker.wrapper_error',
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
