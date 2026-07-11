#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--root');
const root = path.resolve(rootIndex >= 0 ? args[rootIndex + 1] : process.cwd());
const errors = [];
const checks = {};

const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'package.json',
  'docs/policies/managed-worker-boundary.md',
  'docs/index.md',
  'docs/manifest.yaml',
  'docs/records/layer-1-provenance.md',
  '.flowset/current-wi.md',
  '.flowset/fix_plan.md',
  '.flowset/handoff.md',
  '.flowset/context-ledger.jsonl',
  '.flowset/known-issues.yaml',
  '.flowset/verification-debt.yaml',
  'scripts/validate-scaffold.mjs',
];

function fail(id, message, detail = null) {
  errors.push({ id, message, ...(detail === null ? {} : { detail }) });
}

function resolve(relativePath) {
  return path.join(root, ...relativePath.split('/'));
}

function read(relativePath) {
  return readFileSync(resolve(relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function sha256(body) {
  return `sha256:${createHash('sha256').update(body).digest('hex')}`;
}

function scalar(body, key) {
  return new RegExp(`^  ${key}: (.+)$`, 'm').exec(body)?.[1]?.trim() ?? null;
}

function parseChunks(manifest) {
  const chunksBody = manifest.split(/\nchunks:\n/, 2)[1] ?? '';
  const chunks = [];
  for (const block of chunksBody.split(/^  - id: /m).slice(1)) {
    const [idLine, ...fieldLines] = block.split('\n');
    const chunk = { id: idLine.trim() };
    for (const line of fieldLines) {
      const field = /^    ([a-z_]+): (.+)$/.exec(line);
      if (field) chunk[field[1]] = field[2].trim();
    }
    chunks.push(chunk);
  }
  return chunks;
}

const missingFiles = requiredFiles.filter((relativePath) => !existsSync(resolve(relativePath)));
checks.required_files_missing = missingFiles;
if (missingFiles.length) fail('scaffold.required_files_missing', 'Layer 2 scaffold is missing required files.', missingFiles);

if (missingFiles.length === 0) {
  const manifest = read('docs/manifest.yaml');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const ledger = read('.flowset/context-ledger.jsonl');
  const knownIssues = read('.flowset/known-issues.yaml');
  const verificationDebt = read('.flowset/verification-debt.yaml');
  const provenance = read('docs/records/layer-1-provenance.md');
  const pkg = JSON.parse(read('package.json'));
  const managedWorkerBoundary = read('docs/policies/managed-worker-boundary.md');
  const chunks = parseChunks(manifest);
  const chunkIds = chunks.map((chunk) => chunk.id);
  const duplicateChunkIds = chunkIds.filter((id, index) => chunkIds.indexOf(id) !== index);
  const requiredChunkIds = [
    'policy.managed-worker-boundary',
    'flow.current-wi',
    'flow.fix-plan',
    'flow.handoff',
    'record.context-ledger',
    'registry.known-issues',
    'registry.verification-debt',
    'record.layer1-provenance',
    'record.bootstrap-validation',
    'tool.scaffold-validator',
  ];

  const projectId = scalar(manifest, 'id');
  const scopeCode = scalar(manifest, 'project_scope_code');
  const scopeStatus = scalar(manifest, 'scope_code_status');
  const scopeDecisionRef = scalar(manifest, 'scope_code_decision_ref');
  const wiPattern = scalar(manifest, 'target_wi_pattern');
  const bootstrapValidationSource = chunks.find((chunk) => chunk.id === 'record.bootstrap-validation')?.source ?? '';
  const validationRecord = bootstrapValidationSource && existsSync(resolve(bootstrapValidationSource))
    ? read(bootstrapValidationSource)
    : '';
  const scopeCodePattern = /^[A-Z][A-Z0-9]{1,5}$/;

  checks.manifest_identity = manifest.includes('kind: fdp-codex-layer2-manifest')
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId ?? '')
    && scopeCodePattern.test(scopeCode ?? '')
    && scopeCode !== 'CX'
    && scopeStatus === 'accepted'
    && /^layer1:[a-z0-9.-]+$/.test(scopeDecisionRef ?? '')
    && wiPattern === `WI-${scopeCode}NNNN-category`
    && manifest.includes('chunk_id_scope: per-target-project')
    && manifest.includes(`chunk_ref_prefix: target:${scopeCode}`);
  checks.managed_worker_boundary = managedWorkerBoundary.includes('does not install a worker-only command rule')
    && managedWorkerBoundary.includes('Built-in multi-agent fan-out is disabled')
    && managedWorkerBoundary.includes('Command re-entry confinement remains open')
    && managedWorkerBoundary.includes('visible controller owns repository validation');
  checks.manifest_always_on = manifest.includes('id: root.agents')
    && manifest.includes('id: registry.manifest');
  checks.manifest_chunk_ids = duplicateChunkIds.length === 0
    && requiredChunkIds.every((id) => chunkIds.includes(id));

  const hashFailures = [];
  for (const chunk of chunks) {
    if (!chunk.source || !chunk.hash || !existsSync(resolve(chunk.source))) {
      hashFailures.push({ id: chunk.id, source: chunk.source ?? null, reason: 'missing source or hash' });
      continue;
    }
    const actual = sha256(read(chunk.source));
    if (actual !== chunk.hash) hashFailures.push({ id: chunk.id, source: chunk.source, expected: chunk.hash, actual });
  }
  checks.manifest_hash_failures = hashFailures;

  const wiPatternRegex = new RegExp(`^WI-${scopeCode}\\d{4}-(?:feat|fix|docs|style|refactor|test|chore|perf|ci|revert)$`);
  const currentWiId = /^WI id: (.+)$/m.exec(currentWi)?.[1]?.trim() ?? '';
  const priorityWiId = new RegExp(`^- \\[ \\] (WI-${scopeCode}\\d{4}-[a-z]+)\\b`, 'm').exec(fixPlan)?.[1] ?? '';
  checks.target_wi_namespace = wiPatternRegex.test(currentWiId)
    && wiPatternRegex.test(priorityWiId)
    && !currentWi.includes('WI-CX')
    && !fixPlan.includes('WI-CX')
    && !handoff.includes('WI-CX');
  checks.target_flow = currentWi.includes('Status: validated')
    && currentWi.includes(`WI-${scopeCode}0001-docs`)
    && priorityWiId === `WI-${scopeCode}0002-test`
    && handoff.includes(`WI-${scopeCode}0002-test`)
    && handoff.split('\n').length <= 120;

  const ledgerErrors = [];
  const forbiddenLedgerKeys = ['body', 'chunk_body', 'content', 'prompt', 'text'];
  const allowedLedgerKeys = ['timestamp', 'wi_id', 'chunk_id', 'source', 'hash', 'load_reason', 'decision_ref', 'actor'];
  const ledgerLines = ledger.split('\n').filter(Boolean);
  for (let index = 0; index < ledgerLines.length; index += 1) {
    try {
      const entry = JSON.parse(ledgerLines[index]);
      const missing = allowedLedgerKeys.filter((key) => !(key in entry));
      const forbidden = forbiddenLedgerKeys.filter((key) => key in entry);
      const unknown = Object.keys(entry).filter((key) => !allowedLedgerKeys.includes(key));
      const sourceExists = typeof entry.source === 'string' && existsSync(resolve(entry.source));
      const hashMatches = sourceExists && entry.hash === sha256(read(entry.source));
      if (missing.length || forbidden.length || unknown.length || !wiPatternRegex.test(entry.wi_id) || !hashMatches) {
        ledgerErrors.push({ line: index + 1, missing, forbidden, unknown, wi_id: entry.wi_id ?? null, source_exists: sourceExists, hash_matches: hashMatches });
      }
    } catch (error) {
      ledgerErrors.push({ line: index + 1, parse_error: error.message });
    }
  }
  checks.context_ledger = ledgerLines.length >= 2 && ledgerErrors.length === 0;

  checks.known_issue_registry = knownIssues.includes('kind: target-known-issues')
    && knownIssues.includes(`project_scope_code: ${scopeCode}`)
    && knownIssues.includes('severity_classification: field-only')
    && knownIssues.includes('repayment_condition')
    && knownIssues.includes('defer_reason');
  checks.verification_debt_registry = verificationDebt.includes('kind: target-verification-debt')
    && verificationDebt.includes(`id: VD-${scopeCode}0001`)
    && verificationDebt.includes('risk: R2')
    && verificationDebt.includes('owner: CODEX')
    && verificationDebt.includes(`repayment_wi: WI-${scopeCode}0002-test`)
    && verificationDebt.includes('hard_stop:')
    && verificationDebt.includes('defer_reason:')
    && verificationDebt.includes('status: open');
  checks.layer1_provenance = provenance.includes('FDP_Codex repository: https://github.com/flowcoder2025/FDP_Codex.git')
    && /FDP_Codex source commit: `[0-9a-f]{40}`/.test(provenance)
    && /Layer 1 generation WI: WI-CX\d{4}-[a-z]+/.test(provenance)
    && provenance.includes('layer1:spec.layer-2-knowledge-scaffold')
    && provenance.includes('layer1:decision.layer-2-chunk-id-scope-policy')
    && provenance.includes(`Layer 1 scope decision: \`${scopeDecisionRef}\``)
    && provenance.includes(`- \`${scopeDecisionRef}\``)
    && provenance.includes(`Target project: ${projectId} (\`${scopeCode}\`)`);
  checks.bootstrap_validation = validationRecord.includes(`WI: WI-${scopeCode}0001-docs`)
    && validationRecord.includes('Status: validated')
    && validationRecord.includes('npm run validate')
    && validationRecord.includes('No remote repository, release, deployment, or publication was created');
  checks.package = pkg.private === true
    && pkg.type === 'module'
    && pkg.scripts?.validate === 'node scripts/validate-scaffold.mjs';

  if (!checks.manifest_identity) fail('scaffold.manifest_identity', 'Target manifest identity or FCD scope fields are invalid.');
  if (!checks.managed_worker_boundary) fail('scaffold.managed_worker_boundary', 'Target scaffold must state the worker command-boundary limitation without installing a controller-wide project rule.');
  if (!checks.manifest_always_on) fail('scaffold.manifest_always_on', 'Target manifest must name AGENTS and itself as always-on references.');
  if (!checks.manifest_chunk_ids) fail('scaffold.manifest_chunk_ids', 'Target manifest chunk ids are missing or duplicated.', { duplicateChunkIds, requiredChunkIds });
  if (hashFailures.length) fail('scaffold.manifest_hashes', 'Target manifest hashes must match every registered chunk source.', hashFailures);
  if (!checks.target_wi_namespace) fail('scaffold.target_wi_namespace', 'Target flow files must use only the WI-FCD namespace.');
  if (!checks.target_flow) fail('scaffold.target_flow', 'Target current WI, priority, and handoff do not form a valid bootstrap flow.');
  if (!checks.context_ledger) fail('scaffold.context_ledger', 'Target context ledger must be append-only metadata with required fields only.', ledgerErrors);
  if (!checks.known_issue_registry) fail('scaffold.known_issues', 'Target KI registry must define field-only severity and repayment fields.');
  if (!checks.verification_debt_registry) fail('scaffold.verification_debt', 'Target verification debt must record risk, owner, repayment, hard stop, and defer reason.');
  if (!checks.layer1_provenance) fail('scaffold.layer1_provenance', 'Target must record qualified Layer 1 generation provenance.');
  if (!checks.bootstrap_validation) fail('scaffold.bootstrap_validation', 'Target bootstrap validation record is incomplete.');
  if (!checks.package) fail('scaffold.package', 'Target package.json must expose the standalone validator and remain private.');
}

const result = { ok: errors.length === 0, root, checks, errors };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
