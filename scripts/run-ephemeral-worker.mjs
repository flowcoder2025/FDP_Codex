#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildEphemeralWorkerArgs, resolveCodexInvocation } from './lib/codex-invocation.mjs';
import { runManagedProcess } from './lib/managed-process.mjs';

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

async function readPrompt() {
  if (process.stdin.isTTY) throw new Error('worker prompt must be piped through stdin');
  process.stdin.setEncoding('utf8');
  let prompt = '';
  for await (const chunk of process.stdin) {
    prompt += chunk;
    if (Buffer.byteLength(prompt, 'utf8') > MAX_PROMPT_BYTES) {
      throw new Error(`worker prompt exceeds ${MAX_PROMPT_BYTES} bytes`);
    }
  }
  if (!prompt.trim()) throw new Error('worker prompt on stdin is empty');
  return prompt;
}

function emitJson(event) {
  process.stdout.write(`${JSON.stringify(event)}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const invocation = resolveCodexInvocation();
  const prompt = await readPrompt();
  const abortController = new AbortController();
  const onSigint = () => abortController.abort('SIGINT');
  const onSigterm = () => abortController.abort('SIGTERM');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  try {
    const result = await runManagedProcess({
      command: invocation.command,
      args: buildEphemeralWorkerArgs({
        argsPrefix: invocation.argsPrefix,
        sandbox: args.sandbox,
        cwd: args.cwd,
      }),
      cwd: args.cwd,
      stdinText: prompt,
      timeoutMs: args.timeoutMs,
      pollIntervalMs: 100,
      signal: abortController.signal,
      onEvent: emitJson,
    });
    if (result.ok) return;
    if (result.status === 'timed_out') process.exitCode = 124;
    else if (result.status === 'interrupted') process.exitCode = 130;
    else process.exitCode = 1;
  } finally {
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
