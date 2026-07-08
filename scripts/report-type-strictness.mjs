#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const probes = [
  { id: 'strict', flags: ['--strict', 'true'] },
  { id: 'noImplicitAny', flags: ['--noImplicitAny', 'true'] },
  { id: 'strictNullChecks', flags: ['--strictNullChecks', 'true'] },
];

function countDiagnostics(output) {
  return output.match(/error TS\d+:/g)?.length ?? 0;
}

function countLines(output) {
  const trimmed = output.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\r?\n/).length;
}

function summarizeErrorCodes(output) {
  const counts = new Map();
  for (const match of output.matchAll(/error (TS\d+):/g)) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([code, count]) => ({ code, count }));
}

function firstDiagnostics(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => /error TS\d+:/.test(line))
    .slice(0, 10);
}

function readTsconfigStrictFlag() {
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
  return tsconfig.compilerOptions?.strict === true;
}

function runProbe(probe) {
  const args = [
    tscBin,
    '--project',
    'tsconfig.json',
    '--noEmit',
    '--pretty',
    'false',
    ...probe.flags,
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error) {
    return {
      id: probe.id,
      command: `tsc --project tsconfig.json --noEmit --pretty false ${probe.flags.join(' ')}`,
      status: 'execution-error',
      pass: false,
      exit_code: null,
      diagnostic_count: 0,
      line_count: 0,
      top_error_codes: [],
      first_diagnostics: [],
      error: result.error.message,
    };
  }

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return {
    id: probe.id,
    command: `tsc --project tsconfig.json --noEmit --pretty false ${probe.flags.join(' ')}`,
    status: result.status === 0 ? 'pass' : 'type-debt',
    pass: result.status === 0,
    exit_code: result.status,
    diagnostic_count: countDiagnostics(output),
    line_count: countLines(output),
    top_error_codes: summarizeErrorCodes(output),
    first_diagnostics: firstDiagnostics(output),
  };
}

if (!existsSync(tscBin)) {
  console.error(`Missing local TypeScript compiler: ${tscBin}`);
  process.exit(1);
}

const summaries = probes.map((probe) => runProbe(probe));
const report = {
  schema_version: 1,
  kind: 'fdp-codex-type-strictness-report',
  generated_at: new Date().toISOString(),
  baseline: {
    tsconfig: 'tsconfig.json',
    strict_enabled: readTsconfigStrictFlag(),
    script_exits_zero_on_type_debt: true,
    type_debt_is_gating_failure: false,
  },
  probes: summaries,
};

console.log(JSON.stringify(report, null, 2));

if (summaries.some((summary) => summary.status === 'execution-error')) {
  process.exit(1);
}
