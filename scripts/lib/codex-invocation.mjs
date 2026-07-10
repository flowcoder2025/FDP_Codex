import { existsSync } from 'node:fs';
import path from 'node:path';

export function resolveCodexInvocation() {
  const override = process.env.CODEX_CLI_PATH;
  if (override) return { command: override, argsPrefix: [] };
  if (process.platform === 'win32' && process.env.APPDATA) {
    const npmShimTarget = path.join(
      process.env.APPDATA,
      'npm',
      'node_modules',
      '@openai',
      'codex',
      'bin',
      'codex.js',
    );
    if (existsSync(npmShimTarget)) return { command: process.execPath, argsPrefix: [npmShimTarget] };
  }
  return { command: 'codex', argsPrefix: [] };
}

export function buildEphemeralWorkerArgs({ argsPrefix = [], sandbox, cwd }) {
  return [
    ...argsPrefix,
    'exec',
    '--ephemeral',
    '--json',
    '--color', 'never',
    '--disable', 'multi_agent',
    '--sandbox', sandbox,
    '-C', cwd,
    '-',
  ];
}
