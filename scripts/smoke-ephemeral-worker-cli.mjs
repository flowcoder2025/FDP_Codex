#!/usr/bin/env node
import { resolveCodexInvocation } from './lib/codex-invocation.mjs';
import { runManagedProcess } from './lib/managed-process.mjs';

const invocation = resolveCodexInvocation();
const result = await runManagedProcess({
  command: invocation.command,
  args: [...invocation.argsPrefix, 'exec', '--help'],
  cwd: process.cwd(),
  timeoutMs: 15000,
  onEvent: (event) => process.stdout.write(`${JSON.stringify(event)}\n`),
});

if (!result.ok) process.exitCode = result.status === 'timed_out' ? 124 : 1;
