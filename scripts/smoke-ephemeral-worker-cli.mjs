#!/usr/bin/env node
import { buildEphemeralWorkerArgs, resolveCodexInvocation, verifyManagedWorkerExecPolicy } from './lib/codex-invocation.mjs';
import { runManagedProcess } from './lib/managed-process.mjs';

const invocation = resolveCodexInvocation();
const execPolicy = verifyManagedWorkerExecPolicy({ invocation, cwd: process.cwd() });
process.stdout.write(`${JSON.stringify({ type: 'worker.exec_policy_verified', ...execPolicy })}\n`);
const workerArgs = buildEphemeralWorkerArgs({
  argsPrefix: invocation.argsPrefix,
  sandbox: 'read-only',
  cwd: process.cwd(),
});
const result = await runManagedProcess({
  command: invocation.command,
  args: [...workerArgs.slice(0, -1), '--help'],
  cwd: process.cwd(),
  timeoutMs: 15000,
  onEvent: (event) => process.stdout.write(`${JSON.stringify(event)}\n`),
});

if (!result.ok) process.exitCode = result.status === 'timed_out' ? 124 : 1;
