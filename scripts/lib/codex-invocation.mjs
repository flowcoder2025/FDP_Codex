import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const MANAGED_WORKER_EXEC_POLICY = path.join('.codex', 'rules', 'fdp-managed-worker.rules');

const forbiddenReentryCases = [
  ['codex', 'exec'],
  ['codex.exe', 'exec'],
  [process.execPath, 'C:\\path\\to\\codex.js', 'exec'],
  ['npx', 'codex'],
  ['npm.cmd', 'exec', 'codex'],
  ['pnpm', 'dlx', 'codex'],
  ['bunx', '@openai/codex'],
  ['powershell.exe', '-Command', 'codex exec'],
  ['cmd.exe', '/c', 'codex exec'],
  ['python.exe', '-c', "import subprocess; subprocess.run(['codex', 'exec'])"],
  ['bash', '-c', 'codex exec'],
  ['wsl.exe', 'sh', '-c', 'codex exec'],
];

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

function checkExecPolicy(invocation, rulePath, cwd, command) {
  const stdout = execFileSync(invocation.command, [
    ...invocation.argsPrefix,
    'execpolicy',
    'check',
    '--rules', rulePath,
    '--resolve-host-executables',
    ...command,
  ], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
    windowsHide: true,
  });
  return JSON.parse(stdout);
}

export function verifyManagedWorkerExecPolicy({ invocation, cwd }) {
  const rulePath = path.join(cwd, MANAGED_WORKER_EXEC_POLICY);
  if (!existsSync(rulePath)) {
    throw new Error(`managed worker exec-policy is required: ${rulePath}`);
  }

  for (const command of forbiddenReentryCases) {
    const evaluation = checkExecPolicy(invocation, rulePath, cwd, command);
    if (evaluation.decision !== 'forbidden') {
      throw new Error(`managed worker exec-policy did not forbid: ${command.join(' ')}`);
    }
  }

  const allowedControl = checkExecPolicy(invocation, rulePath, cwd, ['npm.cmd', 'run', 'validate']);
  if (allowedControl.decision === 'forbidden') {
    throw new Error('managed worker exec-policy forbids the declared package-script path');
  }

  return {
    rule_path: rulePath,
    forbidden_case_count: forbiddenReentryCases.length,
    package_script_control: 'not-forbidden',
  };
}