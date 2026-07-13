import {
  accessSync,
  constants,
  existsSync,
  realpathSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

function environmentValue(env, name, platform) {
  if (typeof env[name] === 'string') return env[name];
  if (platform !== 'win32') return undefined;
  const entry = Object.entries(env).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return entry?.[1];
}

function canonicalFile(candidate, { executable = false } = {}) {
  if (!candidate || !path.isAbsolute(candidate)) return null;
  try {
    const resolved = realpathSync(candidate);
    if (!statSync(resolved).isFile()) return null;
    if (executable) accessSync(resolved, constants.X_OK);
    return resolved;
  } catch {
    return null;
  }
}

function isWithin(root, candidate) {
  if (!root) return false;
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..' + path.sep)
    && relative !== '..'
    && !path.isAbsolute(relative));
}

function canonicalTargetRoot(targetCwd) {
  if (!targetCwd) return null;
  try {
    return realpathSync(targetCwd);
  } catch {
    return path.resolve(targetCwd);
  }
}

function nodeScriptInvocation(scriptPath, execPath, platform) {
  const script = canonicalFile(scriptPath);
  const node = canonicalFile(execPath, { executable: platform !== 'win32' });
  if (!script || !node) return null;
  return { command: node, argsPrefix: [script] };
}

function explicitInvocation(override, execPath, platform, targetRoot) {
  if (!path.isAbsolute(override)) {
    throw new Error('CODEX_CLI_PATH must be an absolute executable or JavaScript shim path');
  }
  if (platform === 'win32' && ['.cmd', '.bat'].includes(path.extname(override).toLowerCase())) {
    throw new Error('CODEX_CLI_PATH must not identify a cmd or bat shim; use an absolute executable or codex.js path');
  }
  if (path.extname(override).toLowerCase() === '.js') {
    const invocation = nodeScriptInvocation(override, execPath, platform);
    if (invocation && !isWithin(targetRoot, invocation.argsPrefix[0])) return invocation;
  } else {
    const command = canonicalFile(override, { executable: platform !== 'win32' });
    if (command && !isWithin(targetRoot, command)) return { command, argsPrefix: [] };
  }
  const canonicalOverride = canonicalFile(override);
  if (canonicalOverride && isWithin(targetRoot, canonicalOverride)) {
    throw new Error('CODEX_CLI_PATH must not resolve inside the target working directory');
  }
  throw new Error('CODEX_CLI_PATH does not identify a readable absolute Codex command');
}

function pathFallback({ env, platform, execPath, targetRoot }) {
  const pathValue = environmentValue(env, 'PATH', platform) || '';
  const executableNames = platform === 'win32' ? ['codex.exe', 'codex.com'] : ['codex'];
  for (const rawDirectory of pathValue.split(path.delimiter)) {
    const directory = rawDirectory.trim().replace(/^"|"$/g, '');
    if (!directory || !path.isAbsolute(directory)) continue;
    for (const executableName of executableNames) {
      const command = canonicalFile(path.join(directory, executableName), {
        executable: platform !== 'win32',
      });
      if (command && !isWithin(targetRoot, command)) return { command, argsPrefix: [] };
    }
    if (platform === 'win32') {
      const npmShimTarget = path.join(
        directory,
        'node_modules',
        '@openai',
        'codex',
        'bin',
        'codex.js',
      );
      const invocation = nodeScriptInvocation(npmShimTarget, execPath, platform);
      if (invocation && !isWithin(targetRoot, invocation.argsPrefix[0])) return invocation;
    }
  }
  return null;
}

export function resolveCodexInvocation({
  env = process.env,
  platform = process.platform,
  execPath = process.execPath,
  targetCwd = process.cwd(),
} = {}) {
  const targetRoot = canonicalTargetRoot(targetCwd);
  const override = environmentValue(env, 'CODEX_CLI_PATH', platform);
  if (override) return explicitInvocation(override, execPath, platform, targetRoot);

  const appData = environmentValue(env, 'APPDATA', platform);
  if (platform === 'win32' && appData && path.isAbsolute(appData)) {
    const npmShimTarget = path.join(
      appData,
      'npm',
      'node_modules',
      '@openai',
      'codex',
      'bin',
      'codex.js',
    );
    if (existsSync(npmShimTarget)) {
      const invocation = nodeScriptInvocation(npmShimTarget, execPath, platform);
      if (invocation && !isWithin(targetRoot, invocation.argsPrefix[0])) return invocation;
    }
  }

  const fallback = pathFallback({ env, platform, execPath, targetRoot });
  if (fallback) return fallback;
  throw new Error('Codex CLI was not found at a trusted absolute path; set CODEX_CLI_PATH to an absolute command');
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
