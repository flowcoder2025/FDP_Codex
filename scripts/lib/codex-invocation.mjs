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

function canonicalDirectory(candidate) {
  if (!candidate || !path.isAbsolute(candidate)) return null;
  try {
    const resolved = realpathSync(candidate);
    return statSync(resolved).isDirectory() ? resolved : null;
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

function canonicalTargetBoundary(targetCwd) {
  const targetRoot = canonicalTargetRoot(targetCwd);
  let cursor = targetRoot;
  while (cursor) {
    if (existsSync(path.join(cursor, '.git'))) return cursor;
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return targetRoot;
}

function configuredTrustRoots(env, platform, targetBoundary) {
  const candidates = [];
  const configured = environmentValue(env, 'FDP_CODEX_CLI_TRUST_ROOTS', platform) || '';
  candidates.push(...configured.split(path.delimiter));
  const appData = environmentValue(env, 'APPDATA', platform);
  if (platform === 'win32' && appData && path.isAbsolute(appData)) {
    candidates.push(path.join(appData, 'npm', 'node_modules', '@openai', 'codex'));
  }
  return [...new Set(candidates
    .map((candidate) => canonicalDirectory(candidate.trim().replace(/^"|"$/g, '')))
    .filter((candidate) => candidate
      && !isWithin(targetBoundary, candidate)
      && !isWithin(candidate, targetBoundary)))];
}

function isTrustedPath(candidate, trustRoots) {
  return trustRoots.some((root) => isWithin(root, candidate));
}

function nodeScriptInvocation(scriptPath, execPath, platform, targetBoundary, trustRoots) {
  const script = canonicalFile(scriptPath);
  const node = canonicalFile(execPath, { executable: platform !== 'win32' });
  if (!script || !node
    || isWithin(targetBoundary, node)
    || !isTrustedPath(script, trustRoots)) return null;
  return { command: node, argsPrefix: [script] };
}

function explicitInvocation(override, execPath, platform, targetBoundary, trustRoots) {
  if (!path.isAbsolute(override)) {
    throw new Error('CODEX_CLI_PATH must be an absolute executable or JavaScript shim path');
  }
  if (platform === 'win32' && ['.cmd', '.bat'].includes(path.extname(override).toLowerCase())) {
    throw new Error('CODEX_CLI_PATH must not identify a cmd or bat shim; use an absolute executable or codex.js path');
  }
  if (path.extname(override).toLowerCase() === '.js') {
    const invocation = nodeScriptInvocation(
      override,
      execPath,
      platform,
      targetBoundary,
      trustRoots,
    );
    if (invocation) return invocation;
  } else {
    const command = canonicalFile(override, { executable: platform !== 'win32' });
    if (command
      && !isWithin(targetBoundary, command)
      && isTrustedPath(command, trustRoots)) return { command, argsPrefix: [] };
  }
  const canonicalOverride = canonicalFile(override);
  if (canonicalOverride && isWithin(targetBoundary, canonicalOverride)) {
    throw new Error('CODEX_CLI_PATH must not resolve inside the target repository trust boundary');
  }
  if (canonicalOverride) {
    throw new Error(
      'CODEX_CLI_PATH must resolve inside an approved Codex installation or FDP_CODEX_CLI_TRUST_ROOTS',
    );
  }
  throw new Error('CODEX_CLI_PATH does not identify a readable absolute Codex command');
}

function pathFallback({ env, platform, execPath, targetBoundary, trustRoots }) {
  const pathValue = environmentValue(env, 'PATH', platform) || '';
  const executableNames = platform === 'win32' ? ['codex.exe', 'codex.com'] : ['codex'];
  for (const rawDirectory of pathValue.split(path.delimiter)) {
    const directory = rawDirectory.trim().replace(/^"|"$/g, '');
    if (!directory || !path.isAbsolute(directory)) continue;
    for (const executableName of executableNames) {
      const command = canonicalFile(path.join(directory, executableName), {
        executable: platform !== 'win32',
      });
      if (command
        && !isWithin(targetBoundary, command)
        && isTrustedPath(command, trustRoots)) return { command, argsPrefix: [] };
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
      const invocation = nodeScriptInvocation(
        npmShimTarget,
        execPath,
        platform,
        targetBoundary,
        trustRoots,
      );
      if (invocation) return invocation;
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
  const targetBoundary = canonicalTargetBoundary(targetCwd);
  const trustRoots = configuredTrustRoots(env, platform, targetBoundary);
  const override = environmentValue(env, 'CODEX_CLI_PATH', platform);
  if (override) {
    return explicitInvocation(override, execPath, platform, targetBoundary, trustRoots);
  }

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
      const invocation = nodeScriptInvocation(
        npmShimTarget,
        execPath,
        platform,
        targetBoundary,
        trustRoots,
      );
      if (invocation) return invocation;
    }
  }

  const fallback = pathFallback({
    env,
    platform,
    execPath,
    targetBoundary,
    trustRoots,
  });
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
