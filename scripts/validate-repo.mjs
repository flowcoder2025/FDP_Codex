#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const errors = [];
const warnings = [];
const checks = {};

const hasActiveWiStatus = (text) => /^Status: (?:validated|validation-blocked|blocked-external)$/m.test(text);

const hasSingleExactClaim = (text, exactClaim, mention) => text.includes(exactClaim)
  && text.split(mention).length === 2;

const allowedCategories = new Set([
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'perf',
  'ci',
  'revert',
]);

/**
 * @typedef {{id: string, source?: string}} ValidatorAlwaysOn
 * @typedef {{id: string, source?: string, type?: string, status?: string, body_carryover?: string}} ValidatorManifestChunk
 */

const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'ROADMAP.md',
  'LICENSE',
  'docs/index.md',
  'docs/manifest.yaml',
  'docs/policies/context-hygiene.md',
  'docs/policies/work-item-lifecycle.md',
  'docs/policies/naming-and-commits.md',
  'docs/policies/git-workflow.md',
  'docs/policies/github-issue-governance.md',
  'docs/policies/autonomy-and-approval.md',
  'docs/policies/triage-strategy.md',
  'docs/policies/evaluation-strategy.md',
  'docs/policies/verification-economy.md',
  'docs/policies/decision-queue.md',
  'docs/specifications/knowledge-system.md',
  'docs/specifications/context-pack-builder.md',
  'docs/decisions/2026-07-08-fdp-codex-operating-foundation.md',
  'docs/decisions/2026-07-08-repository-license-binding.md',
  'docs/decisions/2026-07-08-bootstrap-publication-envelope.md',
  'docs/decisions/2026-07-08-public-readiness-boundary.md',
  'docs/decisions/2026-07-08-evaluation-surface-baseline.md',
  'docs/decisions/2026-07-08-context-pack-command-surface.md',
  'docs/decisions/2026-07-08-context-selection-rule-table.md',
  'docs/decisions/2026-07-08-decision-queue-state-codes.md',
  'docs/decisions/2026-07-08-ki-identity-severity-policy.md',
  'docs/decisions/2026-07-08-handoff-size-policy.md',
  'docs/decisions/2026-07-08-autonomy-default-options-packet.md',
  'docs/decisions/2026-07-08-operating-policy-lock.md',
  'docs/decisions/2026-07-08-collaboration-response-contract.md',
  'docs/decisions/2026-07-08-session-boundary-automation-contract.md',
  'docs/decisions/2026-07-08-tooling-typescript-baseline.md',
  'docs/decisions/2026-07-08-tooling-strictness-probe.md',
  'docs/decisions/2026-07-08-automation-run-surface-installation.md',
  'docs/decisions/2026-07-08-context-ledger-dedupe-policy.md',
  'docs/decisions/2026-07-08-flow-state-readable-snapshot.md',
  'docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md',
  'docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md',
  'docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md',
  'docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md',
  'docs/decisions/2026-07-10-context-selection-breadth-guard.md',
  'docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md',
  'docs/decisions/2026-07-10-control-plane-operational-integrity.md',
  'docs/decisions/2026-07-10-independent-blind-adversarial-review-gate.md',
  'docs/specifications/independent-review-evidence.md',
  'docs/specifications/ephemeral-worker-runner.md',
  'docs/specifications/managed-worker-exec-policy.rules',
  '.flowset/current-wi.md',
  '.flowset/fix_plan.md',
  '.flowset/handoff.md',
  '.flowset/state.json',
  '.flowset/context-ledger.jsonl',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/known_issue.yml',
  '.github/ISSUE_TEMPLATE/contribution_intake.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/labels.yml',
  '.github/workflows/validate.yml',
  '.github/workflows/independent-review.yml',
  'package-lock.json',
  'tsconfig.json',
  'docs/runbooks/github-label-setup.md',
  'docs/runbooks/bootstrap-reconciliation.md',
  'package.json',
  'scripts/lib/manifest.mjs',
  'scripts/validate-repo.mjs',
  'scripts/build-context-pack.mjs',
  'scripts/report-type-strictness.mjs',
  'scripts/generate-layer2-scaffold.mjs',
  'scripts/validate-layer2-scaffold.mjs',
  'scripts/lib/codex-invocation.mjs',
  'scripts/lib/managed-process.mjs',
  'scripts/windows-job-runner.ps1',
  'scripts/run-ephemeral-worker.mjs',
  'scripts/smoke-ephemeral-worker-cli.mjs',
  'scripts/test-ephemeral-worker-lifecycle.mjs',
  'scripts/fixtures/managed-worker-tree.mjs',
  'scripts/audit-control-plane.mjs',
  'scripts/audit-independent-review.mjs',
  'scripts/publish-independent-review-status.mjs',
  'docs/records/validation-wi-cx0055-feat.md',
  'docs/records/validation-wi-cx0056-test.md',
  'docs/records/validation-wi-cx0057-docs.md',
  'docs/records/validation-wi-cx0058-fix.md',
  'docs/records/validation-wi-cx0059-fix.md',
  'docs/records/validation-wi-cx0060-test.md',
  'docs/records/validation-wi-cx0061-fix.md',
  'docs/records/validation-wi-cx0062-fix.md',
  'docs/records/validation-wi-cx0063-feat.md',
  'docs/records/validation-wi-cx0020-feat.md',
  'docs/records/validation-wi-cx0021-feat.md',
  'docs/records/validation-wi-cx0022-docs.md',
  'docs/records/validation-wi-cx0023-docs.md',
  'docs/records/validation-wi-cx0024-docs.md',
  'docs/records/validation-wi-cx0025-docs.md',
  'docs/records/validation-wi-cx0016-docs.md',
  'docs/records/validation-wi-cx0026-docs.md',
  'docs/records/validation-wi-cx0027-docs.md',
  'docs/records/validation-wi-cx0018-chore.md',
  'docs/records/validation-wi-cx0028-chore.md',
  'docs/records/validation-wi-cx0029-chore.md',
  'docs/records/validation-wi-cx0030-test.md',
  'docs/records/validation-wi-cx0031-chore.md',
  'docs/records/validation-wi-cx0032-docs.md',
  'docs/records/validation-wi-cx0033-test.md',
  'docs/records/layer-2-scope-code-options-2026-07-08.md',
  'docs/records/validation-wi-cx0034-docs.md',
  'docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md',
  'docs/records/validation-wi-cx0036-docs.md',
  'docs/records/layer-2-scope-code-decision-handback-2026-07-08.md',
  'docs/records/validation-wi-cx0037-docs.md',
  'docs/records/validation-wi-cx0039-docs.md',
  'docs/records/validation-wi-cx0040-chore.md',
  'docs/records/automation-runner-s2-review-packet-2026-07-08.md',
  'docs/records/validation-wi-cx0041-docs.md',
  'docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md',
  'docs/records/validation-wi-cx0043-docs.md',
  'docs/records/validation-wi-cx0045-test.md',
  'docs/records/validation-wi-cx0046-test.md',
  'docs/records/session-orchestration-control-plane-audit-2026-07-08.md',
  'docs/records/validation-wi-cx0047-test.md',
  '.flowset/runtime-snapshot.json',
  'docs/specifications/runtime-snapshot.md',
  'docs/specifications/a2-handoff-receiver-contract.md',
  'docs/records/validation-wi-cx0048-test.md',
  'docs/records/validation-wi-cx0049-docs.md',
  'docs/records/validation-wi-cx0050-test.md',
  'docs/records/validation-wi-cx0051-test.md',
];

const requiredAlwaysOnIds = [
  'root.agents',
  'registry.manifest',
];

const requiredChunkIds = [
  'decision.bootstrap-publication-envelope',
  'decision.public-readiness-boundary',
  'decision.evaluation-surface-baseline',
  'decision.context-pack-command-surface',
  'decision.context-selection-rule-table',
  'decision.decision-queue-state-codes',
  'decision.ki-identity-severity-policy',
  'decision.handoff-size-policy',
  'decision.autonomy-default-options-packet',
  'decision.operating-policy-lock',
  'decision.collaboration-response-contract',
  'decision.session-boundary-automation-contract',
  'decision.tooling-typescript-baseline',
  'decision.tooling-strictness-probe',
  'decision.automation-run-surface-installation',
  'decision.context-ledger-dedupe-policy',
  'decision.flow-state-readable-snapshot',
  'decision.portfolio-guardrail-validator-baseline',
  'decision.autonomous-work-exhaustion-stop-gate',
  'decision.a2-worktree-isolation-repair-gate',
  'decision.control-plane-operational-integrity',
  'tool.audit-control-plane',
  'record.validation-wi-cx0062-fix',
  'github.workflow.independent-review',
  'decision.independent-blind-adversarial-review-gate',
  'spec.independent-review-evidence',
  'tool.audit-independent-review',
  'tool.publish-independent-review-status',
  'record.validation-wi-cx0063-feat',
  'record.validation-wi-cx0060-test',
  'record.session-orchestration-control-plane-audit',
  'record.validation-wi-cx0047-test',
  'spec.runtime-snapshot',
  'spec.a2-handoff-receiver-contract',
  'flow.runtime-snapshot',
  'record.validation-wi-cx0048-test',
  'record.validation-wi-cx0049-docs',
  'record.validation-wi-cx0050-test',
  'record.validation-wi-cx0051-test',
  'public.readme',
  'public.contributing',
  'public.security',
  'public.roadmap',
  'policy.context-hygiene',
  'policy.work-item-lifecycle',
  'policy.naming-and-commits',
  'policy.git-workflow',
  'policy.github-issue-governance',
  'policy.autonomy-and-approval',
  'policy.triage-strategy',
  'policy.evaluation-strategy',
  'policy.decision-queue',
  'policy.verification-economy',
  'spec.knowledge-system',
  'spec.context-pack-builder',
  'flow.current-wi',
  'flow.state-snapshot',
  'flow.fix-plan',
  'flow.handoff',
  'record.context-ledger',
  'github.pr-template',
  'github.issue-template.known-issue',
  'github.issue-template.contribution-intake',
  'github.issue-template.config',
  'github.labels',
  'github.workflow.validate',
  'runbook.github-label-setup',
  'runbook.bootstrap-reconciliation',
  'tool.manifest-lib',
  'tool.build-context-pack',
  'tool.package',
  'tool.package-lock',
  'tool.tsconfig',
  'tool.type-strictness-report',
  'record.validation-wi-cx0020-feat',
  'record.validation-wi-cx0021-feat',
  'record.validation-wi-cx0022-docs',
  'record.validation-wi-cx0023-docs',
  'record.validation-wi-cx0024-docs',
  'record.validation-wi-cx0025-docs',
  'record.validation-wi-cx0016-docs',
  'record.validation-wi-cx0026-docs',
  'record.validation-wi-cx0027-docs',
  'record.validation-wi-cx0018-chore',
  'record.validation-wi-cx0028-chore',
  'record.validation-wi-cx0029-chore',
  'record.validation-wi-cx0030-test',
  'record.validation-wi-cx0031-chore',
  'record.validation-wi-cx0032-docs',
  'record.validation-wi-cx0033-test',
  'record.layer-2-scope-code-options',
  'record.validation-wi-cx0034-docs',
  'decision.layer-2-chunk-id-scope-policy',
  'record.validation-wi-cx0036-docs',
  'record.layer-2-scope-code-decision-handback',
  'record.validation-wi-cx0037-docs',
  'record.validation-wi-cx0039-docs',
  'record.validation-wi-cx0040-chore',
  'record.automation-runner-s2-review-packet',
  'record.validation-wi-cx0041-docs',
  'record.post-bootstrap-automation-cadence-decision-handback',
  'record.validation-wi-cx0043-docs',
  'record.validation-wi-cx0045-test',
  'record.validation-wi-cx0046-test',
  'decision.ephemeral-worker-process-lifecycle-guard',
  'spec.ephemeral-worker-runner',
  'spec.managed-worker-exec-design',
  'tool.codex-invocation',
  'tool.managed-process',
  'tool.run-ephemeral-worker',
  'tool.smoke-ephemeral-worker-cli',
  'tool.test-ephemeral-worker-lifecycle',
  'fixture.managed-worker-tree',
  'record.validation-wi-cx0059-fix',
  'record.validation-wi-cx0061-fix',
];

const requiredLabels = [
  'fdp:triage-needed',
  'fdp:accepted',
  'fdp:approved-work',
  'fdp:blocked-user-decision',
  'fdp:ki',
  'fdp:debt',
  'ki:critical',
  'ki:high',
  'ki:medium',
  'ki:low',
  'risk:R0',
  'risk:R1',
  'risk:R2',
  'risk:R3',
  'needs:user-approval',
  'needs:blind-review',
  'needs:adversarial-review',
  'needs:validator',
  'needs:wi-link',
  'pr:needs-validation',
  'pr:ready-for-review',
  'pr:blocked-policy',
  'pr:approved-merge',
  'pr:independent-review-passed',
  'external-contribution',
  'good-first-issue',
  'help-wanted',
  'do-not-start',
];

function relPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function exists(relativePath) {
  return existsSync(relPath(relativePath));
}

function read(relativePath) {
  return readFileSync(relPath(relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function error(id, message, detail = undefined) {
  errors.push({ id, message, detail });
}

function warning(id, message, detail = undefined) {
  warnings.push({ id, message, detail });
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (err) {
    error('json.parse_failed', `${relativePath} must contain valid JSON.`, err.message);
    return {};
  }
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    warning('git.command_failed', `git ${args.join(' ')} failed`, err.stderr?.toString().trim() || err.message);
    return null;
  }
}

/**
 * @param {string} manifestText
 * @returns {ValidatorAlwaysOn[]}
 */
function parseManifestAlwaysOn(manifestText) {
  /** @type {ValidatorAlwaysOn[]} */
  const alwaysOn = [];
  let inAlwaysOn = false;
  /** @type {ValidatorAlwaysOn | null} */
  let current = null;

  for (const line of manifestText.split('\n')) {
    if (line === 'always_on:') {
      inAlwaysOn = true;
      continue;
    }
    if (inAlwaysOn && /^[a-z_]+:/.test(line)) {
      if (current) alwaysOn.push(current);
      break;
    }
    if (!inAlwaysOn) continue;

    const idMatch = /^  - id: (.+)$/.exec(line);
    if (idMatch) {
      if (current) alwaysOn.push(current);
      current = { id: idMatch[1].trim() };
      continue;
    }
    if (!current) continue;

    const sourceMatch = /^    source: (.+)$/.exec(line);
    if (sourceMatch) current.source = sourceMatch[1].trim();
  }

  return alwaysOn;
}

/**
 * @param {string} manifestText
 * @returns {ValidatorManifestChunk[]}
 */
function parseManifestChunks(manifestText) {
  /** @type {ValidatorManifestChunk[]} */
  const chunks = [];
  let inChunks = false;
  /** @type {ValidatorManifestChunk | null} */
  let current = null;

  for (const line of manifestText.split('\n')) {
    if (line === 'chunks:') {
      inChunks = true;
      continue;
    }
    if (inChunks && /^[a-z_]+:/.test(line)) {
      if (current) chunks.push(current);
      break;
    }
    if (!inChunks) continue;

    const idMatch = /^  - id: (.+)$/.exec(line);
    if (idMatch) {
      if (current) chunks.push(current);
      current = { id: idMatch[1].trim() };
      continue;
    }
    if (!current) continue;

    const sourceMatch = /^    source: (.+)$/.exec(line);
    if (sourceMatch) current.source = sourceMatch[1].trim();

    const typeMatch = /^    type: (.+)$/.exec(line);
    if (typeMatch) current.type = typeMatch[1].trim();

    const statusMatch = /^    status: (.+)$/.exec(line);
    if (statusMatch) current.status = statusMatch[1].trim();

    const carryMatch = /^    body_carryover: (.+)$/.exec(line);
    if (carryMatch) current.body_carryover = carryMatch[1].trim();
  }

  return chunks;
}

function validateRequiredFiles() {
  const missing = requiredFiles.filter((file) => !exists(file));
  checks.required_files_missing = missing;
  if (missing.length) error('files.required_missing', 'Required files are missing.', missing);
}

function validateManifest() {
  const manifestText = read('docs/manifest.yaml');
  const alwaysOn = parseManifestAlwaysOn(manifestText);
  const chunks = parseManifestChunks(manifestText);
  const alwaysOnIds = alwaysOn.map((item) => item.id);
  const ids = chunks.map((chunk) => chunk.id);
  const seen = new Set();
  const duplicates = ids.filter((id) => {
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });
  const missingAlwaysOn = requiredAlwaysOnIds.filter((id) => !alwaysOnIds.includes(id));
  const missingRequired = requiredChunkIds.filter((id) => !seen.has(id));
  const missingAlwaysOnSources = alwaysOn
    .filter((item) => !item.source || !exists(item.source))
    .map((item) => ({ id: item.id, source: item.source ?? null }));
  const missingSources = chunks
    .filter((chunk) => !chunk.source || !exists(chunk.source))
    .map((chunk) => ({ id: chunk.id, source: chunk.source ?? null }));
  const nonForbiddenCarryover = chunks
    .filter((chunk) => chunk.body_carryover !== 'forbidden')
    .map((chunk) => chunk.id);

  checks.manifest_always_on_count = alwaysOn.length;
  checks.manifest_chunk_count = chunks.length;
  checks.manifest_duplicate_ids = duplicates;
  checks.manifest_missing_always_on_ids = missingAlwaysOn;
  checks.manifest_missing_required_ids = missingRequired;
  checks.manifest_missing_always_on_sources = missingAlwaysOnSources;
  checks.manifest_missing_sources = missingSources;
  checks.manifest_non_forbidden_body_carryover = nonForbiddenCarryover;
  checks.manifest_hook_builder = manifestText.includes('implementation: scripts/build-context-pack.mjs');
  checks.manifest_hook_top_level = /^hook_contract:$/m.test(manifestText);
  checks.manifest_hook_status = /^  status: (.+)$/m.exec(manifestText.split('hook_contract:')[1] ?? '')?.[1] ?? null;

  if (duplicates.length) error('manifest.duplicate_ids', 'Manifest chunk ids must be unique.', duplicates);
  if (missingAlwaysOn.length) error('manifest.always_on_ids_missing', 'Required always_on ids are missing.', missingAlwaysOn);
  if (missingRequired.length) error('manifest.required_ids_missing', 'Required manifest chunk ids are missing.', missingRequired);
  if (missingAlwaysOnSources.length) error('manifest.always_on_sources_missing', 'Manifest always_on source paths must exist.', missingAlwaysOnSources);
  if (missingSources.length) error('manifest.sources_missing', 'Manifest chunk source paths must exist.', missingSources);
  if (nonForbiddenCarryover.length) {
    error('manifest.body_carryover_not_forbidden', 'Manifest chunks must forbid body carryover.', nonForbiddenCarryover);
  }
  if (!checks.manifest_hook_builder) {
    error('manifest.hook_builder_missing', 'Manifest hook contract must point to scripts/build-context-pack.mjs.');
  }
  if (!checks.manifest_hook_top_level) {
    error('manifest.hook_contract_not_top_level', 'Manifest hook_contract must be a top-level YAML section.');
  }
}

function validateLedger() {
  const allowedFields = new Set(['timestamp', 'wi_id', 'chunk_id', 'source', 'hash', 'load_reason', 'decision_ref', 'actor']);
  const forbiddenFields = [];
  const invalidJson = [];
  const missingHash = [];
  const missingSources = [];
  const lines = read('.flowset/context-ledger.jsonl').split('\n').filter((line) => line.trim().length > 0);

  lines.forEach((line, index) => {
    const lineNo = index + 1;
    let record;
    try {
      record = JSON.parse(line);
    } catch (err) {
      invalidJson.push(lineNo);
      return;
    }

    for (const key of Object.keys(record)) {
      if (!allowedFields.has(key)) forbiddenFields.push(`${lineNo}:${key}`);
    }

    const bootstrapSentinel = record.chunk_id === 'ledger.initialized' && record.hash === null;
    if (!bootstrapSentinel && !/^sha256:[0-9a-f]{64}$/.test(record.hash || '')) {
      missingHash.push(lineNo);
    }
    if (record.source && !exists(record.source)) {
      missingSources.push(`${lineNo}:${record.source}`);
    }
  });

  checks.ledger_line_count = lines.length;
  checks.ledger_forbidden_fields = forbiddenFields;
  checks.ledger_invalid_json_lines = invalidJson;
  checks.ledger_missing_hash_lines = missingHash;
  checks.ledger_missing_sources = missingSources;

  if (invalidJson.length) error('ledger.invalid_json', 'Ledger lines must be valid JSON.', invalidJson);
  if (forbiddenFields.length) error('ledger.forbidden_fields', 'Ledger must not store body or unknown fields.', forbiddenFields);
  if (missingHash.length) error('ledger.missing_hash', 'Ledger records need sha256 hashes except the bootstrap sentinel.', missingHash);
  if (missingSources.length) error('ledger.sources_missing', 'Ledger source paths must exist.', missingSources);
}

function validateNaming() {
  const currentWi = read('.flowset/current-wi.md');
  const wiMatch = /^WI id: (WI-CX\d{4}-([a-z]+))$/m.exec(currentWi);
  const branchMatch = /^Branch: (.+)$/m.exec(currentWi);
  const currentStatus = /^Status: (.+)$/m.exec(currentWi)?.[1]?.trim() ?? null;
  const wiIds = [...read('.flowset/fix_plan.md').matchAll(/WI-CX\d{4}-([a-z]+)/g)].map((match) => match[0]);
  const invalidWiIds = wiIds.filter((wiId) => {
    const category = wiId.split('-').at(-1);
    return !allowedCategories.has(category);
  });

  checks.current_wi = wiMatch?.[1] ?? null;
  checks.current_wi_category = wiMatch?.[2] ?? null;
  checks.current_wi_branch = branchMatch?.[1] ?? null;
  checks.fix_plan_wi_count = wiIds.length;
  checks.fix_plan_invalid_wi_ids = invalidWiIds;

  if (!wiMatch) error('naming.current_wi_invalid', 'Current WI id must use WI-CXNNNN-category.');
  if (wiMatch && !allowedCategories.has(wiMatch[2])) {
    error('naming.current_wi_category_invalid', 'Current WI category is not allowed.', wiMatch[2]);
  }
  if (invalidWiIds.length) error('naming.fix_plan_invalid_wi_ids', 'fix_plan contains invalid WI categories.', invalidWiIds);

  const gitBranch = git(['branch', '--show-current']);
  const currentBranch = gitBranch || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '';
  let hasHead = true;
  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: repoRoot, stdio: 'ignore' });
  } catch {
    hasHead = false;
  }

  const branchPattern = /^wi\/cx\d{4}-(feat|fix|docs|style|refactor|test|chore|perf|ci|revert)-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const mainBranchAllowed = currentBranch === 'main' && currentStatus === 'validated';
  checks.git_branch = currentBranch;
  checks.git_branch_source = gitBranch ? 'git' : (process.env.GITHUB_HEAD_REF ? 'GITHUB_HEAD_REF' : (process.env.GITHUB_REF_NAME ? 'GITHUB_REF_NAME' : 'none'));
  checks.git_has_head = hasHead;
  checks.git_branch_format_ok = currentBranch ? (branchPattern.test(currentBranch) || mainBranchAllowed) : false;
  checks.git_main_branch_allowed = mainBranchAllowed;

  if (!currentBranch || (!branchPattern.test(currentBranch) && !mainBranchAllowed)) {
    error('git.branch_invalid', 'Current git branch must use wi/cxNNNN-category-short-slug, or main with a validated current WI.', currentBranch);
  }

  if (wiMatch && currentBranch && hasHead && !mainBranchAllowed) {
    const expectedPrefix = `wi/cx${wiMatch[1].slice(5, 9)}-${wiMatch[2]}-`;
    if (!currentBranch.startsWith(expectedPrefix)) {
      error('git.branch_wi_mismatch', 'Current branch must match current WI after bootstrap commits exist.', {
        currentBranch,
        expectedPrefix,
      });
    }
  }

  if (!hasHead) {
    warning('git.bootstrap_unborn_branch', 'Repository has no local commit yet; branch-to-WI mismatch is allowed only until bootstrap reconciliation.');
  }
}

function validateFlowState() {
  const currentWiText = read('.flowset/current-wi.md');
  const fixPlanText = read('.flowset/fix_plan.md');
  const handoffText = read('.flowset/handoff.md');
  const manifestText = read('docs/manifest.yaml');
  const stateSnapshot = readJson('.flowset/state.json');

  const currentWiId = /^WI id: (WI-CX\d{4}-[a-z]+)$/m.exec(currentWiText)?.[1] ?? null;
  const currentStatus = /^Status: (.+)$/m.exec(currentWiText)?.[1]?.trim() ?? null;
  const currentBranch = /^Branch: (.+)$/m.exec(currentWiText)?.[1]?.trim() ?? null;
  const currentPriorityBlock = /## Current Priority\n\n([\s\S]*?)(?:\n## |$)/.exec(fixPlanText)?.[1] ?? '';
  const currentPriorityItems = [...currentPriorityBlock.matchAll(/^- \[ \] (.+)$/gm)].map((match) => match[1].trim());
  const currentPriorityMatches = currentPriorityItems
    .map((item) => /^(WI-CX\d{4}-[a-z]+)\b/.exec(item)?.[1] ?? null)
    .filter(Boolean);
  const currentPriorityWaitsForUserDecision = currentPriorityItems.length === 1
    && /^Waiting for user decision: .+/.test(currentPriorityItems[0]);
  const currentPriorityDescriptor = currentPriorityMatches[0]
    ?? (currentPriorityWaitsForUserDecision ? currentPriorityItems[0].replace(/\.$/, '') : null);
  const currentPriorityWiId = currentPriorityMatches[0] ?? null;
  const completedCheckboxes = [...fixPlanText.matchAll(/^- \[[xX]\] /gm)].map((match) => match[0]);
  const handoffLines = handoffText.split('\n').length;
  const handoffControlCharacters = [...handoffText].filter((char) => {
    const code = char.charCodeAt(0);
    return code < 32 && code !== 10 && code !== 13;
  });
  const requiredHandoffSections = [
    '## Current State',
    '## Completed WIs',
    '## Orientation SSOT',
    '## Git State',
    '## Next Action',
    '## New Session Procedure',
  ];
  const missingHandoffSections = requiredHandoffSections.filter((section) => !handoffText.includes(section));
  const pendingMarkers = [...currentWiText.matchAll(/\bPending\b|Pending:/g)].map((match) => match[0]);
  const expectedRecordPath = currentWiId ? `docs/records/validation-${currentWiId.toLowerCase()}.md` : null;
  const expectedRecordId = currentWiId ? `record.validation-${currentWiId.toLowerCase()}` : null;
  const validationRecordExists = expectedRecordPath ? exists(expectedRecordPath) : false;
  const validationRecordRegistered = expectedRecordId ? manifestText.includes(`id: ${expectedRecordId}`) : false;
  const handoffMentionsCurrent = currentWiId ? handoffText.includes(currentWiId) : false;
  const nextActionMatchesFixPlan = currentPriorityMatches.length === 1
    ? handoffText.includes(currentPriorityMatches[0])
    : currentPriorityWaitsForUserDecision
      && (
        (handoffText.includes('choose the Layer 2 project scope code rule')
          && handoffText.includes('A, use <CODE>'))
        || handoffText.includes('user/control-plane repair of the A2 worktree execution surface')
      );

  const snapshotCurrentWi = stateSnapshot.current_wi ?? {};
  const snapshotPriority = stateSnapshot.current_priority ?? {};
  const snapshotTriggeredWork = Array.isArray(stateSnapshot.triggered_work) ? stateSnapshot.triggered_work : [];
  const snapshotHardStops = Array.isArray(stateSnapshot.hard_stops) ? stateSnapshot.hard_stops : [];
  const requiredHardStops = [
    'release_publication',
    'deployment',
    'package_publication',
    'oss_submission',
    'a3_publication_behavior',
    'public_api_or_external_contract_change',
    'production_dependency_addition',
    'destructive_filesystem_or_git_operation',
  ];
  const snapshotBlocks = Array.isArray(snapshotPriority.blocks) ? snapshotPriority.blocks : [];
  const snapshotHasTriggeredA2 = snapshotTriggeredWork.some((item) => item.wi_id === 'WI-CX0035-test'
    && item.status === 'blocked-until-trigger'
    && String(item.trigger ?? '').includes('fdp-codex-a2-worktree-wi-runner'));

  checks.flow_state_snapshot_schema = stateSnapshot.schema_version === 1
    && stateSnapshot.kind === 'fdp-codex-flow-state'
    && stateSnapshot.layer === 'layer1';
  checks.flow_state_snapshot_current_wi = snapshotCurrentWi.id === currentWiId
    && snapshotCurrentWi.status === currentStatus
    && snapshotCurrentWi.branch === currentBranch
    && snapshotCurrentWi.validation_record === expectedRecordPath;
  const snapshotPriorityMatchesLayer2Decision = snapshotPriority.kind === 'user_decision'
    && snapshotPriority.item === 'Layer 2 project scope code rule'
    && snapshotPriority.state === 'DQ-USER'
    && snapshotPriority.owner_gate === 'USER'
    && snapshotPriority.lock_blocker === 'conditional'
    && snapshotPriority.prompt === 'docs/records/layer-2-scope-code-decision-handback-2026-07-08.md'
    && snapshotPriority.recommended_answer_shape === 'A, use <CODE>'
    && snapshotBlocks.includes('WI-CX0038-docs')
    && snapshotBlocks.includes('first Layer 2 target-project scaffold generation')
    && currentPriorityWaitsForUserDecision
    && fixPlanText.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
    && handoffText.includes('A, use <CODE>');
  const snapshotPriorityMatchesA2RepairDecision = snapshotPriority.kind === 'user_decision'
    && snapshotPriority.item === 'A2 worktree isolation repair'
    && snapshotPriority.state === 'waiting'
    && snapshotPriority.owner_gate === 'USER'
    && snapshotPriority.lock_blocker === 'no'
    && snapshotPriority.decision_record === 'docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md'
    && snapshotBlocks.includes('first Layer 2 target-project scaffold confidence claims')
    && snapshotBlocks.includes('generalized A2/A3 autonomy expansion')
    && currentPriorityWaitsForUserDecision
    && fixPlanText.includes('A2 worktree isolation repair. | DQ-USER | USER | conditional')
    && handoffText.includes('user/control-plane repair of the A2 worktree execution surface');
  const snapshotPriorityMatchesUserDecision = snapshotPriorityMatchesLayer2Decision || snapshotPriorityMatchesA2RepairDecision;
  const snapshotPriorityMatchesExternalBlockedWi = snapshotPriority.kind === 'wi'
    && snapshotPriority.wi_id === currentPriorityWiId
    && snapshotPriority.state === 'blocked-external'
    && snapshotPriority.owner_gate === 'H1'
    && snapshotPriority.lock_blocker === 'yes'
    && snapshotPriority.strategy?.PSC
    && snapshotPriority.strategy?.WTC
    && snapshotPriority.strategy?.Risk
    && snapshotPriority.strategy?.ESC
    && currentPriorityMatches.length === 1
    && snapshotBlocks.includes('dogfood continuation')
    && snapshotBlocks.includes('runner reactivation')
    && fixPlanText.includes(`${snapshotPriority.wi_id} ${snapshotPriority.item}`)
    && handoffText.includes(snapshotPriority.wi_id);
  const snapshotPriorityMatchesUserBlockedWi = snapshotPriority.kind === 'wi'
    && snapshotPriority.wi_id === currentPriorityWiId
    && snapshotPriority.state === 'blocked-user-approval'
    && snapshotPriority.owner_gate === 'USER'
    && snapshotPriority.lock_blocker === 'yes'
    && snapshotPriority.strategy?.PSC
    && snapshotPriority.strategy?.WTC
    && snapshotPriority.strategy?.Risk
    && snapshotPriority.strategy?.ESC
    && currentPriorityMatches.length === 1
    && snapshotBlocks.includes('dogfood continuation')
    && snapshotBlocks.includes('runner reactivation')
    && fixPlanText.includes(`${snapshotPriority.wi_id} ${snapshotPriority.item}`)
    && handoffText.includes(snapshotPriority.wi_id)
    && handoffText.includes('explicit user approval');
  const snapshotPriorityMatchesWi = snapshotPriority.kind === 'wi'
    && snapshotPriority.wi_id === currentPriorityWiId
    && snapshotPriority.state === 'ready'
    && snapshotPriority.owner_gate === 'CODEX'
    && snapshotPriority.lock_blocker === 'no'
    && snapshotPriority.strategy?.PSC
    && snapshotPriority.strategy?.WTC
    && snapshotPriority.strategy?.Risk
    && snapshotPriority.strategy?.ESC
    && currentPriorityMatches.length === 1
    && fixPlanText.includes(`${snapshotPriority.wi_id} ${snapshotPriority.item}`)
    && handoffText.includes(snapshotPriority.wi_id);
  checks.flow_state_snapshot_priority = snapshotPriorityMatchesUserDecision
    || snapshotPriorityMatchesWi
    || snapshotPriorityMatchesExternalBlockedWi
    || snapshotPriorityMatchesUserBlockedWi;
  const snapshotHasRetiredRunner = snapshotTriggeredWork.length === 0
    && stateSnapshot.control_plane?.automation?.status === 'RETIRED'
    && fixPlanText.includes('The hourly worktree runner is retired')
    && handoffText.includes('The hourly worktree runner is retired');
  checks.flow_state_snapshot_triggered_work = snapshotHasTriggeredA2
    || snapshotHasRetiredRunner;
  checks.flow_state_snapshot_hard_stops = requiredHardStops.every((item) => snapshotHardStops.includes(item));
  checks.flow_state_snapshot_hygiene = stateSnapshot.hygiene?.body_storage === 'forbidden'
    && stateSnapshot.hygiene?.context_bodies_carried === false
    && String(stateSnapshot.hygiene?.snapshot_role ?? '').includes('not a context body store');

  checks.flow_current_status = currentStatus;
  checks.flow_current_priority_count = currentPriorityItems.length;
  checks.flow_current_priority_wi_count = currentPriorityMatches.length;
  checks.flow_current_priority_waits_for_user_decision = currentPriorityWaitsForUserDecision;
  checks.flow_current_priority = currentPriorityDescriptor;
  checks.flow_fix_plan_completed_checkboxes = completedCheckboxes.length;
  checks.flow_handoff_line_count = handoffLines;
  checks.flow_handoff_control_characters = handoffControlCharacters.length;
  checks.flow_missing_handoff_sections = missingHandoffSections;
  checks.flow_current_wi_pending_markers = pendingMarkers.length;
  checks.flow_validation_record_exists = validationRecordExists;
  checks.flow_validation_record_registered = validationRecordRegistered;
  checks.flow_handoff_mentions_current_wi = handoffMentionsCurrent;
  checks.flow_next_action_matches_fix_plan = nextActionMatchesFixPlan;
  checks.flow_state_snapshot_registered = manifestText.includes('id: flow.state-snapshot')
    && manifestText.includes('source: .flowset/state.json');

  if (currentPriorityItems.length !== 1) {
    error('flow.fix_plan_current_priority_count', 'fix_plan must have exactly one current priority item.', currentPriorityItems);
  }
  if (currentPriorityMatches.length !== 1 && !currentPriorityWaitsForUserDecision) {
    error('flow.fix_plan_current_priority_kind', 'fix_plan current priority must be either one WI item or one explicit user-decision wait item.', currentPriorityItems);
  }
  if (!checks.flow_state_snapshot_schema) {
    error('flow.state_snapshot_schema', '.flowset/state.json must use the Layer 1 flow-state snapshot schema.');
  }
  if (!checks.flow_state_snapshot_current_wi) {
    error('flow.state_snapshot_current_wi_mismatch', '.flowset/state.json current_wi must match .flowset/current-wi.md.', snapshotCurrentWi);
  }
  if (!checks.flow_state_snapshot_priority) {
    error('flow.state_snapshot_priority_mismatch', '.flowset/state.json current_priority must match the fix_plan and handoff current priority.', snapshotPriority);
  }
  if (!checks.flow_state_snapshot_triggered_work) {
    error('flow.state_snapshot_triggered_work_missing', '.flowset/state.json must preserve a valid live trigger or the explicit retired-runner replacement state.');
  }
  if (!checks.flow_state_snapshot_hard_stops) {
    error('flow.state_snapshot_hard_stops_missing', '.flowset/state.json must preserve the active hard stops.', snapshotHardStops);
  }
  if (!checks.flow_state_snapshot_hygiene) {
    error('flow.state_snapshot_hygiene_missing', '.flowset/state.json must remain a metadata-only snapshot, not a context body store.');
  }
  if (!checks.flow_state_snapshot_registered) {
    error('flow.state_snapshot_manifest_missing', 'Manifest must register .flowset/state.json as flow.state-snapshot.');
  }
  if (completedCheckboxes.length) {
    error('flow.fix_plan_completed_history', 'fix_plan must not store completed-history checkboxes.', completedCheckboxes.length);
  }
  if (missingHandoffSections.length) {
    error('flow.handoff_sections_missing', 'handoff is missing required operational sections.', missingHandoffSections);
  }
  if (handoffControlCharacters.length) {
    error('flow.handoff_control_characters', 'handoff must not contain control characters other than line breaks.', handoffControlCharacters.map((char) => char.charCodeAt(0)));
  }
  if (handoffLines > 220) {
    error('flow.handoff_too_long', 'handoff must remain compact and should point to SSOT instead of copying it.', handoffLines);
  }
  if (!nextActionMatchesFixPlan) {
    error('flow.next_action_mismatch', 'handoff next action must mention the fix_plan current priority.', {
      currentPriority: currentPriorityDescriptor,
    });
  }

  if (currentStatus === 'validated') {
    if (pendingMarkers.length) {
      error('flow.current_wi_pending_markers', 'validated current WI must not contain pending markers.', pendingMarkers.length);
    }
    if (!validationRecordExists) {
      error('flow.validation_record_missing', 'validated current WI must have a validation record.', expectedRecordPath);
    }
    if (!validationRecordRegistered) {
      error('flow.validation_record_unregistered', 'validated current WI validation record must be registered in manifest.', expectedRecordId);
    }
    if (currentPriorityMatches.includes(currentWiId)) {
      error('flow.fix_plan_not_advanced', 'fix_plan current priority must advance beyond a validated current WI.', currentWiId);
    }
    if (!handoffMentionsCurrent) {
      error('flow.handoff_current_wi_missing', 'handoff must mention the validated current WI.', currentWiId);
    }
  }
}
function validateFlowStateReadableSnapshotContract() {
  const state = readJson('.flowset/state.json');
  const decision = read('docs/decisions/2026-07-08-flow-state-readable-snapshot.md');
  const record = read('docs/records/validation-wi-cx0039-docs.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const builder = read('scripts/build-context-pack.mjs');

  let sample = null;
  try {
    const output = execFileSync(process.execPath, [
      'scripts/build-context-pack.mjs',
      '--wi', 'WI-CX0039-docs',
      '--intent', 'flow state machine readable snapshot validation handoff',
      '--risk', 'R1',
      '--changed', '.flowset/state.json',
    ], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    sample = JSON.parse(output);
  } catch (err) {
    error('flow_state_snapshot.sample_failed', 'Context pack builder must emit parseable JSON for the flow-state snapshot sample.', err.stderr?.toString().trim() || err.message);
  }

  checks.flow_state_snapshot_decision = decision.includes('Add `.flowset/state.json` as a compact machine-readable Layer 1 flow-state snapshot')
    && decision.includes('validator must check that `.flowset/state.json` agrees')
    && decision.includes('not a hidden memory store')
    && decision.includes('Decision Needed debt item about stricter machine-readable current WI and handoff state is closed');
  checks.flow_state_snapshot_manifest = manifest.includes('id: flow.state-snapshot')
    && manifest.includes('source: .flowset/state.json')
    && manifest.includes('id: decision.flow-state-readable-snapshot')
    && manifest.includes('docs/decisions/2026-07-08-flow-state-readable-snapshot.md')
    && manifest.includes('id: record.validation-wi-cx0039-docs')
    && manifest.includes('docs/records/validation-wi-cx0039-docs.md');
  checks.flow_state_snapshot_indexes = docsIndex.includes('.flowset/state.json')
    && docsIndex.includes('docs/decisions/2026-07-08-flow-state-readable-snapshot.md')
    && docsIndex.includes('docs/records/validation-wi-cx0039-docs.md')
    && decisionsReadme.includes('docs/decisions/2026-07-08-flow-state-readable-snapshot.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0039-docs.md');
  checks.flow_state_snapshot_builder = builder.includes("chunkIds: ['flow.state-snapshot', 'flow.current-wi', 'flow.fix-plan', 'flow.handoff']")
    && Array.isArray(sample?.selected_chunk_ids)
    && sample.selected_chunk_ids.includes('flow.state-snapshot');
  checks.flow_state_snapshot_queue = !fixPlan.includes('Whether current WI and handoff should be split into stricter machine-readable state later')
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')));
  checks.flow_state_snapshot_record = record.includes('WI: WI-CX0039-docs')
    && record.includes('Machine-readable flow-state snapshot exists and is validator-backed')
    && record.includes('No Layer 2 project scope code rule was chosen')
    && record.includes('No Layer 2 target-project scaffold generation occurred');
  checks.flow_state_snapshot_handoff = handoff.includes('WI-CX0039-docs: Flow State Readable Snapshot')
    && handoff.includes('Machine-readable flow snapshot: `.flowset/state.json`')
    && handoff.includes('.flowset/state.json` is a compact operating-state snapshot');
  checks.flow_state_snapshot_boundary = decision.includes('does not choose the Layer 2 project scope code rule')
    && decision.includes('generate a Layer 2 target-project scaffold')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && state.hygiene?.body_storage === 'forbidden'
    && state.hygiene?.context_bodies_carried === false;

  if (!checks.flow_state_snapshot_decision) error('flow_state_snapshot.decision_missing', 'Decision must define snapshot role, validator coherence, and debt closure.');
  if (!checks.flow_state_snapshot_manifest) error('flow_state_snapshot.manifest_missing', 'Manifest must register snapshot decision, flow chunk, and validation record.');
  if (!checks.flow_state_snapshot_indexes) error('flow_state_snapshot.index_missing', 'Indexes must include snapshot decision, state file, and validation record.');
  if (!checks.flow_state_snapshot_builder) error('flow_state_snapshot.builder_missing', 'WI-start context selection must include flow.state-snapshot.');
  if (!checks.flow_state_snapshot_queue) error('flow_state_snapshot.queue_not_repaid', 'The machine-readable flow-state DQ-DEBT row must be removed while user-gated scope code remains live.');
  if (!checks.flow_state_snapshot_record) error('flow_state_snapshot.record_missing', 'WI-CX0039 record must capture validation result and Layer 2 boundary preservation.');
  if (!checks.flow_state_snapshot_handoff) error('flow_state_snapshot.handoff_missing', 'Handoff must point to .flowset/state.json and WI-CX0039 evidence.');
  if (!checks.flow_state_snapshot_boundary) error('flow_state_snapshot.boundary_missing', 'Snapshot work must preserve context-hygiene and hard-stop boundaries.');
}

function validateGitHubGovernance() {
  const issuePolicy = read('docs/policies/github-issue-governance.md');
  const gitPolicy = read('docs/policies/git-workflow.md');
  const labels = read('.github/labels.yml');
  const prTemplate = read('.github/PULL_REQUEST_TEMPLATE.md');
  const workflow = read('.github/workflows/validate.yml');
  const contributionTemplate = read('.github/ISSUE_TEMPLATE/contribution_intake.yml');
  const knownIssueTemplate = read('.github/ISSUE_TEMPLATE/known_issue.yml');

  const missingLabels = requiredLabels.filter((label) => !labels.includes(`name: ${label}`));
  checks.github_missing_labels = missingLabels;
  checks.github_approved_work_gate = issuePolicy.includes('fdp:approved-work') && issuePolicy.includes('External Issues and PRs are not automatic work authorization');
  checks.github_pr_template_has_wi = prTemplate.includes('## WI');
  checks.github_pr_template_has_validation = prTemplate.includes('## Validation');
  checks.github_known_issue_has_repayment = knownIssueTemplate.includes('repayment');
  checks.github_contribution_template_has_triage_label = contributionTemplate.includes('fdp:triage-needed');
  checks.git_policy_has_hard_stops = gitPolicy.includes('## Git Hard Stops');
  checks.github_workflow_has_node20 = workflow.includes('20.x');
  checks.github_workflow_has_node24 = workflow.includes('24.x');
  checks.github_workflow_has_dispatch = workflow.includes('workflow_dispatch:');
  checks.github_workflow_read_only = workflow.includes('contents: read');

  if (missingLabels.length) error('github.labels_missing', 'Local label definitions are missing required labels.', missingLabels);
  if (!checks.github_approved_work_gate) error('github.approval_gate_missing', 'Issue governance must require explicit work approval.');
  if (!checks.github_pr_template_has_wi || !checks.github_pr_template_has_validation) {
    error('github.pr_template_incomplete', 'PR template must include WI and validation sections.');
  }
  if (!checks.github_known_issue_has_repayment) error('github.ki_template_incomplete', 'Known Issue template must include repayment fields.');
  if (!checks.github_contribution_template_has_triage_label) {
    error('github.contribution_template_incomplete', 'Contribution template must default to triage-needed.');
  }
  if (!checks.git_policy_has_hard_stops) error('git.policy_hard_stops_missing', 'Git workflow policy must define hard stops.');
  if (!checks.github_workflow_has_node20) error('github.workflow_node20_missing', 'Validate workflow must test the minimum supported Node 20 runtime.');
  if (!checks.github_workflow_has_node24) error('github.workflow_node24_missing', 'Validate workflow must test the current Node 24 runtime.');
  if (!checks.github_workflow_has_dispatch) error('github.workflow_dispatch_missing', 'Validate workflow must allow manual workflow_dispatch reruns.');
  if (!checks.github_workflow_read_only) error('github.workflow_permissions_not_read_only', 'Validate workflow must keep read-only contents permission.');
}

function validatePublicReadiness() {
  const readme = read('README.md');
  const contributing = read('CONTRIBUTING.md');
  const security = read('SECURITY.md');
  const roadmap = read('ROADMAP.md');
  const issueConfig = read('.github/ISSUE_TEMPLATE/config.yml');
  const decision = read('docs/decisions/2026-07-08-public-readiness-boundary.md');

  checks.public_status_pre_release = readme.includes('public bootstrap, pre-release');
  checks.public_readme_no_submission_claim = readme.includes('has not published a tagged release') && readme.includes('OpenAI OSS program submission');
  checks.public_contributing_intake_gate = contributing.includes('Intake is not automatic work authorization');
  checks.public_security_no_release_support = security.includes('No tagged release') || security.includes('Tagged releases | None yet');
  checks.public_roadmap_not_release_schedule = roadmap.includes('not a release schedule');
  checks.public_blank_issues_disabled = issueConfig.includes('blank_issues_enabled: false');
  checks.public_decision_excludes_release = decision.includes('does not authorize release publication') && decision.includes('OSS program submission');

  if (!checks.public_status_pre_release) error('public.readme_status_missing', 'README must state the public bootstrap pre-release status.');
  if (!checks.public_readme_no_submission_claim) error('public.readme_boundary_missing', 'README must state that no tagged release or OSS submission has occurred.');
  if (!checks.public_contributing_intake_gate) error('public.contributing_gate_missing', 'CONTRIBUTING must state that intake is not automatic work authorization.');
  if (!checks.public_security_no_release_support) error('public.security_release_boundary_missing', 'SECURITY must state that tagged releases are not supported yet.');
  if (!checks.public_roadmap_not_release_schedule) error('public.roadmap_schedule_boundary_missing', 'ROADMAP must not read as an authorized release schedule.');
  if (!checks.public_blank_issues_disabled) error('public.blank_issues_enabled', 'Blank public issues must remain disabled for the public baseline.');
  if (!checks.public_decision_excludes_release) error('public.decision_boundary_missing', 'Public readiness decision must exclude release and OSS submission.');
}

function validateEvaluationSurface() {
  const evaluation = read('docs/policies/evaluation-strategy.md');
  const triage = read('docs/policies/triage-strategy.md');
  const decision = read('docs/decisions/2026-07-08-evaluation-surface-baseline.md');

  checks.evaluation_has_surface_section = evaluation.includes('## Review Execution Surfaces');
  checks.evaluation_e2_requires_s2 = evaluation.includes('E2 Blind Independent Review requires S2') || decision.includes('E2 Blind Independent Review requires S2');
  checks.evaluation_h1_release_gate = evaluation.includes('H1 Human Maintainer Gate') && decision.includes('H1 is mandatory before first public release');
  checks.evaluation_adversarial_not_keyword_gate = evaluation.includes('not validator keyword gates') || decision.includes('Adversarial checklists remain evaluator prompts');
  checks.triage_points_to_evaluation_surface = triage.includes('evaluation-surface-baseline');

  if (!checks.evaluation_has_surface_section) error('evaluation.surface_section_missing', 'Evaluation policy must define review execution surfaces.');
  if (!checks.evaluation_e2_requires_s2) error('evaluation.e2_s2_missing', 'Evaluation policy must state that E2 requires S2.');
  if (!checks.evaluation_h1_release_gate) error('evaluation.h1_gate_missing', 'Evaluation policy must keep H1 release and OSS submission gate.');
  if (!checks.evaluation_adversarial_not_keyword_gate) error('evaluation.adversarial_gate_ambiguous', 'Evaluation policy must keep adversarial checklists as evaluator prompts by default.');
  if (!checks.triage_points_to_evaluation_surface) error('triage.evaluation_surface_link_missing', 'Triage policy must link to the evaluation surface decision.');
}
function validateContextPackCommandSurface() {
  const builder = read('scripts/build-context-pack.mjs');
  const spec = read('docs/specifications/context-pack-builder.md');
  const hygiene = read('docs/policies/context-hygiene.md');
  const manifest = read('docs/manifest.yaml');
  const decision = read('docs/decisions/2026-07-08-context-pack-command-surface.md');

  let sample = null;
  try {
    const output = execFileSync(process.execPath, [
      'scripts/build-context-pack.mjs',
      '--wi', 'WI-CX0020-feat',
      '--intent', 'context-pack-building',
      '--risk', 'R2',
      '--changed', 'scripts/build-context-pack.mjs',
    ], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    sample = JSON.parse(output);
  } catch (err) {
    error('context_pack.sample_failed', 'Context pack builder must emit parseable JSON in default mode.', err.stderr?.toString().trim() || err.message);
  }

  checks.context_pack_builder_has_append_flag = builder.includes("args['append-ledger']") && builder.includes('appendLedger(');
  checks.context_pack_spec_stdout_default = spec.includes('stdout-only by default');
  checks.context_pack_spec_append_explicit = spec.includes('--append-ledger') && spec.includes('Ledger append is explicit');
  checks.context_pack_spec_has_ledger_append_output = spec.includes('ledger_append');
  checks.context_pack_hygiene_append_procedure = hygiene.includes('--append-ledger') && hygiene.includes('ledger_append');
  checks.context_pack_decision_stdout_default = decision.includes('stdout-only by default');
  checks.context_pack_decision_append_explicit = decision.includes('only when `--append-ledger` is present');
  checks.context_pack_manifest_hook_status = /^  status: implemented-v2$/m.test(manifest.split('hook_contract:')[1] ?? '');
  checks.context_pack_manifest_output_ledger_append = manifest.includes('    - ledger_append');
  checks.context_pack_manifest_output_breadth_guard = manifest.includes('    - breadth_guard');
  checks.context_pack_sample_no_append = sample?.ledger_append?.requested === false && sample?.ledger_append?.status === 'not_requested';
  checks.context_pack_sample_no_bodies = sample?.contains_chunk_bodies === false && sample?.body_storage === 'forbidden';
  checks.context_pack_sample_selects_builder = Array.isArray(sample?.selected_chunk_ids) && sample.selected_chunk_ids.includes('tool.build-context-pack');
  checks.context_pack_sample_breadth_guard = sample?.breadth_guard?.status === 'passed'
    && sample.breadth_guard.total_selected_chunk_count === sample?.selected_chunk_ids?.length;

  if (!checks.context_pack_builder_has_append_flag) error('context_pack.builder_append_missing', 'Builder must implement explicit --append-ledger handling.');
  if (!checks.context_pack_spec_stdout_default) error('context_pack.spec_stdout_default_missing', 'Context pack spec must state stdout-only default.');
  if (!checks.context_pack_spec_append_explicit) error('context_pack.spec_append_explicit_missing', 'Context pack spec must state explicit ledger append mode.');
  if (!checks.context_pack_spec_has_ledger_append_output) error('context_pack.spec_ledger_append_missing', 'Context pack spec must include ledger_append output.');
  if (!checks.context_pack_hygiene_append_procedure) error('context_pack.hygiene_append_missing', 'Context hygiene policy must include explicit append-ledger procedure.');
  if (!checks.context_pack_decision_stdout_default || !checks.context_pack_decision_append_explicit) {
    error('context_pack.decision_contract_missing', 'Context pack command decision must lock stdout default and explicit append.');
  }
  if (!checks.context_pack_manifest_hook_status) error('context_pack.manifest_status_missing', 'Manifest hook contract must be implemented-v2.');
  if (!checks.context_pack_manifest_output_ledger_append) error('context_pack.manifest_ledger_append_missing', 'Manifest hook output must include ledger_append.');
  if (!checks.context_pack_manifest_output_breadth_guard) error('context_pack.manifest_breadth_guard_missing', 'Manifest hook output must include breadth_guard.');
  if (!checks.context_pack_sample_no_append) error('context_pack.default_mutates_ledger', 'Default context pack run must report no ledger append.');
  if (!checks.context_pack_sample_no_bodies) error('context_pack.body_contract_failed', 'Context pack output must forbid chunk bodies.');
  if (!checks.context_pack_sample_selects_builder) error('context_pack.selection_missing_builder', 'Context pack sample should select the builder chunk for builder work.');
  if (!checks.context_pack_sample_breadth_guard) error('context_pack.breadth_guard_missing', 'Context pack sample must expose a passing breadth guard consistent with selected chunks.');
}
function validateContextSelectionRuleTable() {
  const builder = read('scripts/build-context-pack.mjs');
  const spec = read('docs/specifications/context-pack-builder.md');
  const manifest = read('docs/manifest.yaml');
  const decision = read('docs/decisions/2026-07-08-context-selection-rule-table.md');
  const expectedRuleIds = [
    'always-on.reference',
    'flow.wi-state',
    'risk.r2-r3-policy-baseline',
    'changed.manifest',
    'changed.tooling',
    'intent.context-pack',
    'intent.github',
    'intent.validation',
    'manifest.explicit-reference-match',
    'manifest.loads-for-token-match',
  ];

  let sample = null;
  try {
    const output = execFileSync(process.execPath, [
      'scripts/build-context-pack.mjs',
      '--wi', 'WI-CX0021-feat',
      '--intent', 'github issue validation context-pack-building',
      '--risk', 'R2',
      '--changed', 'docs/manifest.yaml',
      '--changed', 'scripts/build-context-pack.mjs',
    ], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    sample = JSON.parse(output);
  } catch (err) {
    error('context_selection.sample_failed', 'Context pack builder must emit parseable JSON with rule-table metadata.', err.stderr?.toString().trim() || err.message);
  }

  const sampleRuleIds = sample?.selection_rule_ids ?? [];
  const missingBuilderRules = expectedRuleIds.filter((ruleId) => !builder.includes(ruleId));
  const missingSpecRules = expectedRuleIds.filter((ruleId) => !spec.includes(`\`${ruleId}\``));
  const missingSampleRules = expectedRuleIds.filter((ruleId) => !sampleRuleIds.includes(ruleId));
  const chunksWithoutRules = (sample?.selected_chunks ?? [])
    .filter((chunk) => !Array.isArray(chunk.selection_rules) || chunk.selection_rules.length === 0)
    .map((chunk) => chunk.id);

  checks.context_selection_missing_builder_rules = missingBuilderRules;
  checks.context_selection_missing_spec_rules = missingSpecRules;
  checks.context_selection_missing_sample_rules = missingSampleRules;
  checks.context_selection_chunks_without_rules = chunksWithoutRules;
  checks.context_selection_manifest_outputs = manifest.includes('    - selection_rule_ids') && manifest.includes('    - selection_rules');
  checks.context_selection_decision_stable_rules = decision.includes('stable rule ids') && decision.includes('selection_rule_ids');
  checks.context_selection_sample_no_append = sample?.ledger_append?.requested === false;
  checks.context_selection_sample_no_bodies = sample?.contains_chunk_bodies === false && sample?.body_storage === 'forbidden';
  checks.context_selection_sample_breadth_guard = sample?.breadth_guard?.status === 'passed'
    && sample.breadth_guard.dynamic_loads_for_chunk_count <= 24
    && sample.breadth_guard.total_selected_chunk_count <= 40;

  if (missingBuilderRules.length) error('context_selection.builder_rules_missing', 'Builder must define all required context selection rule ids.', missingBuilderRules);
  if (missingSpecRules.length) error('context_selection.spec_rules_missing', 'Context pack spec must document all required context selection rule ids.', missingSpecRules);
  if (missingSampleRules.length) error('context_selection.sample_rules_missing', 'Sample context pack must exercise all required selection rule ids.', missingSampleRules);
  if (chunksWithoutRules.length) error('context_selection.chunk_rules_missing', 'Every selected chunk must include selection_rules metadata.', chunksWithoutRules);
  if (!checks.context_selection_manifest_outputs) error('context_selection.manifest_outputs_missing', 'Manifest hook output must include selection rule metadata fields.');
  if (!checks.context_selection_decision_stable_rules) error('context_selection.decision_contract_missing', 'Context selection decision must lock stable rule ids and output metadata.');
  if (!checks.context_selection_sample_no_append) error('context_selection.default_append_failed', 'Rule-table sample must keep default no-append behavior.');
  if (!checks.context_selection_sample_no_bodies) error('context_selection.body_contract_failed', 'Rule-table sample must forbid chunk bodies.');
  if (!checks.context_selection_sample_breadth_guard) error('context_selection.breadth_guard_failed', 'Rule-table sample must satisfy the dynamic and total selection limits.');
}
function validateDecisionQueue() {
  const policy = read('docs/policies/decision-queue.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const decisionsIndex = read('docs/decisions/README.md');
  const decision = read('docs/decisions/2026-07-08-decision-queue-state-codes.md');
  const allowedStates = ['DQ-USER', 'DQ-POLICY', 'DQ-DEBT', 'DQ-EXTERNAL', 'DQ-ACCEPTED'];
  const allowedOwnerGates = ['CODEX', 'USER', 'H1', 'REPO'];
  const allowedLockBlockers = ['yes', 'no', 'conditional'];

  const missingPolicyStates = allowedStates.filter((state) => !policy.includes(`\`${state}\``));
  const queueBlock = /## Decision Needed Queue\n\n([\s\S]*?)(?:\n## |$)/.exec(fixPlan)?.[1] ?? '';
  const rowMatches = [...queueBlock.matchAll(/^\| (?!---)(.+?) \| (DQ-[A-Z]+) \| ([A-Z0-9+]+) \| (yes|no|conditional) \| (.+?) \|$/gm)];
  const rows = rowMatches.map((match) => ({
    item: match[1],
    state: match[2],
    ownerGate: match[3],
    lockBlocker: match[4],
    trigger: match[5],
  }));
  const invalidStates = rows.filter((row) => !allowedStates.includes(row.state)).map((row) => `${row.item}:${row.state}`);
  const invalidOwners = rows.filter((row) => !allowedOwnerGates.includes(row.ownerGate)).map((row) => `${row.item}:${row.ownerGate}`);
  const invalidBlockers = rows.filter((row) => !allowedLockBlockers.includes(row.lockBlocker)).map((row) => `${row.item}:${row.lockBlocker}`);
  const debtWithoutTrigger = rows
    .filter((row) => row.state === 'DQ-DEBT' && (!row.trigger || row.trigger.length < 12))
    .map((row) => row.item);
  const acceptedRows = rows.filter((row) => row.state === 'DQ-ACCEPTED').map((row) => row.item);
  const yesLockBlockers = rows.filter((row) => row.lockBlocker === 'yes').map((row) => row.item);

  checks.decision_queue_policy_missing_states = missingPolicyStates;
  checks.decision_queue_row_count = rows.length;
  checks.decision_queue_invalid_states = invalidStates;
  checks.decision_queue_invalid_owner_gates = invalidOwners;
  checks.decision_queue_invalid_lock_blockers = invalidBlockers;
  checks.decision_queue_debt_without_trigger = debtWithoutTrigger;
  checks.decision_queue_has_lock_blocker = yesLockBlockers.length > 0;
  checks.decision_queue_yes_lock_blocker_count = yesLockBlockers.length;
  checks.decision_queue_accepted_rows = acceptedRows;
  checks.decision_queue_index_points_to_fix_plan = decisionsIndex.includes('`.flowset/fix_plan.md`') && decisionsIndex.includes('docs/policies/decision-queue.md');
  checks.decision_queue_index_not_duplicated = !decisionsIndex.includes('Chunk id scope: global');
  checks.decision_queue_decision_accepts_codes = decision.includes('DQ-USER') && decision.includes('DQ-ACCEPTED');

  if (missingPolicyStates.length) error('decision_queue.policy_states_missing', 'Decision queue policy must define all state codes.', missingPolicyStates);
  if (rows.length < 1) error('decision_queue.empty', 'Decision Needed queue must remain a state-coded table while unresolved items exist.', rows.length);
  if (invalidStates.length) error('decision_queue.invalid_states', 'Decision Needed rows contain invalid state codes.', invalidStates);
  if (invalidOwners.length) error('decision_queue.invalid_owner_gates', 'Decision Needed rows contain invalid owner gates.', invalidOwners);
  if (invalidBlockers.length) error('decision_queue.invalid_lock_blockers', 'Decision Needed rows contain invalid lock blocker values.', invalidBlockers);
  if (debtWithoutTrigger.length) error('decision_queue.debt_without_trigger', 'DQ-DEBT rows must include repayment triggers.', debtWithoutTrigger);
  if (acceptedRows.length) error('decision_queue.accepted_rows_live', 'Accepted Decision Needed items should leave the live queue and move to decisions or records.', acceptedRows);
  if (!checks.decision_queue_index_points_to_fix_plan) error('decision_queue.index_pointer_missing', 'Decisions README must point to the live fix_plan queue and policy.');
  if (!checks.decision_queue_index_not_duplicated) error('decision_queue.index_duplicates_live_queue', 'Decisions README must not duplicate the live queue.');
  if (!checks.decision_queue_decision_accepts_codes) error('decision_queue.decision_codes_missing', 'Decision record must accept the state-code set.');
}
function validatePortfolioGuardrailValidatorBaseline() {
  const decision = read('docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md');
  const policy = read('docs/policies/triage-strategy.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsIndex = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const activeValidationPath = state.current_wi?.validation_record ?? '';
  const activeValidationRecord = activeValidationPath ? read(activeValidationPath) : '';
  const decisionPath = 'docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md';
  const recordPath = 'docs/records/validation-wi-cx0045-test.md';
  const portfolioValidationRecord = read(recordPath);
  const strategyCodes = ['FND', 'VAL', 'AUTO', 'KNOW', 'OSS', 'EVAL', 'DEBT', 'SPEC'];

  const hasStrategyFields = (body) => {
    const psc = /- PSC: P[0-6]\b/.test(body);
    const wtc = new RegExp(`- WTC: (${strategyCodes.join('|')})\\b`).test(body);
    const risk = /- Risk: R[0-3]\b/.test(body);
    const esc = /- ESC: [^\r\n]*\bE5\b/.test(body);
    return psc && wtc && risk && esc;
  };

  checks.portfolio_guardrail_decision = decision.includes('Status: accepted')
    && decision.includes('Starting with WI-CX0045-test')
    && decision.includes('current-and-forward enforcement')
    && decision.includes('does not rewrite historical validation records')
    && decision.includes('ESC with E5 included')
    && decision.includes('portfolio guardrail DQ-POLICY row leaves the live Decision Needed queue');
  checks.portfolio_guardrail_policy = policy.includes('## Portfolio Guardrail Validator Baseline')
    && policy.includes('Starting with WI-CX0045-test')
    && policy.includes('ESC must include E5 Portfolio Balance Review')
    && policy.includes('does not rewrite or reinterpret historical validation records');
  checks.portfolio_guardrail_current_wi_strategy = hasStrategyFields(currentWi)
    && currentWi.includes('Primary evaluator stance')
    && currentWi.includes('Validator stance');
  checks.portfolio_guardrail_current_record_strategy = activeValidationPath !== ''
    && hasStrategyFields(activeValidationRecord)
    && activeValidationRecord.includes('Primary evaluator stance')
    && activeValidationRecord.includes('Validator stance')
    && portfolioValidationRecord.includes('Portfolio guardrails are deterministic for current and future active WIs')
    && portfolioValidationRecord.includes('Historical validation records were not rewritten')
    && portfolioValidationRecord.includes('WTC: VAL')
    && portfolioValidationRecord.includes('ESC: E1+E3+E5+E6');
  checks.portfolio_guardrail_queue_repaid = !fixPlan.includes('Whether portfolio guardrails become deterministic validator rules')
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')))
    && fixPlan.includes('Strict TypeScript source conversion or strict-mode tightening. | DQ-DEBT | CODEX | no');
  checks.portfolio_guardrail_manifest = manifest.includes('id: decision.portfolio-guardrail-validator-baseline')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0045-test')
    && manifest.includes(recordPath);
  checks.portfolio_guardrail_indexes = docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && decisionsIndex.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.portfolio_guardrail_flow = ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && handoff.includes('WI-CX0045-test: Portfolio Guardrail Validator Baseline')
    && handoff.includes('Portfolio guardrail validator baseline is accepted')
    && handoff.includes('Current and future active WIs must record PSC, WTC, Risk, and ESC with E5 included');
  checks.portfolio_guardrail_boundary = decision.includes('does not choose the Layer 2 project scope code rule')
    && decision.includes('does not change automation cadence, A2/A3 authority, merge authority, or publication authority')
    && activeValidationRecord.includes('No release publication, deployment, package publication, OSS program submission')
    && activeValidationRecord.includes('A3 publication behavior')
    && activeValidationRecord.includes('production dependency addition')
    && activeValidationRecord.includes('public API or external contract change')
    && activeValidationRecord.includes('first Layer 2 scaffold generation')
    && activeValidationRecord.includes('destructive filesystem or git operation occurred');

  if (!checks.portfolio_guardrail_decision) error('portfolio_guardrail.decision_missing', 'Portfolio guardrail decision must define current-and-forward enforcement, E5 requirement, and no historical rewrite.');
  if (!checks.portfolio_guardrail_policy) error('portfolio_guardrail.policy_missing', 'Triage policy must document the validator baseline.');
  if (!checks.portfolio_guardrail_current_wi_strategy) error('portfolio_guardrail.current_wi_strategy_missing', 'Current WI must record PSC, WTC, Risk, ESC with E5, and evaluator/validator stances.');
  if (!checks.portfolio_guardrail_current_record_strategy) error('portfolio_guardrail.current_record_strategy_missing', 'Current validation record must record PSC, WTC, Risk, ESC with E5 and current-forward scope.');
  if (!checks.portfolio_guardrail_queue_repaid) error('portfolio_guardrail.queue_not_repaid', 'Portfolio guardrail DQ-POLICY row must leave the live queue while user/debt rows remain.');
  if (!checks.portfolio_guardrail_manifest) error('portfolio_guardrail.manifest_missing', 'Manifest must register the portfolio guardrail decision and WI-CX0045 validation record.');
  if (!checks.portfolio_guardrail_indexes) error('portfolio_guardrail.index_missing', 'Documentation indexes must include the portfolio guardrail decision and validation record.');
  if (!checks.portfolio_guardrail_flow) error('portfolio_guardrail.flow_missing', 'Flow state and handoff must record WI-CX0045 and preserve the user-decision priority.');
  if (!checks.portfolio_guardrail_boundary) error('portfolio_guardrail.boundary_missing', 'WI-CX0045 must preserve Layer 2, automation authority, publication, dependency, public API, and destructive-operation boundaries.');
}
function validateAutonomousWorkExhaustionStopGate() {
  const decision = read('docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md');
  const policy = read('docs/policies/autonomy-and-approval.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsIndex = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const recordPath = 'docs/records/validation-wi-cx0046-test.md';
  const decisionPath = 'docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md';
  const record = read(recordPath);

  checks.autonomous_exhaustion_decision = decision.includes('Status: accepted')
    && decision.includes('must stop autonomous WI creation and hand back the decision surface')
    && decision.includes('the current user decision that blocks the primary path')
    && decision.includes('triggered work that is waiting for external evidence')
    && decision.includes('separate-reviewer availability')
    && decision.includes('must not start another independent WI merely to avoid stopping');
  checks.autonomous_exhaustion_policy = policy.includes('## Autonomous Work Exhaustion Stop Gate')
    && policy.includes('Codex must stop autonomous WI creation and hand back the decision surface')
    && policy.includes('Codex must not start another independent WI merely to avoid stopping')
    && policy.includes('A new autonomous WI may start only when the user supplies a decision or approval');
  checks.autonomous_exhaustion_current_wi = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && (currentWi.includes('ESC: E1+E3+E5+E6')
      || currentWi.includes('ESC: E1+E2+E3+E5+E6'))
    && record.includes('WI: WI-CX0046-test')
    && record.includes('Autonomous work exhaustion is now a validator-backed handback point');
  checks.autonomous_exhaustion_record = record.includes('Autonomous work exhaustion is now a validator-backed handback point')
    && record.includes('The persistent `/goal` remains active')
    && record.includes('S2 review remains blocked until a separate reviewer is available')
    && record.includes('Post-bootstrap automation cadence remains user-gated')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('separate reviewer creation')
    && record.includes('destructive filesystem or git operation occurred');
  const retiredRunnerFlow = state.control_plane?.automation?.status === 'RETIRED'
    && Array.isArray(state.triggered_work)
    && state.triggered_work.length === 0
    && fixPlan.includes('The hourly worktree runner is retired');
  checks.autonomous_exhaustion_flow = /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && Array.isArray(state.triggered_work)
    && (state.triggered_work.some((item) => item.wi_id === 'WI-CX0035-test' && item.status === 'blocked-until-trigger')
      || retiredRunnerFlow)
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')))
    && ((fixPlan.includes('WI-CX0042-test Automation Runner S2 Review Execution')
      && fixPlan.includes('WI-CX0044-docs Post-Bootstrap Automation Cadence Accepted Decision'))
      || (retiredRunnerFlow
        && (fixPlan.includes('None while KI-CX-PROVIDER-001 / Issue #55 blocks the goal-critical worker proof')
          || fixPlan.includes('None while WI-CX0060-test is active')
          || fixPlan.includes('None while WI-CX0060-test is externally blocked')
          || fixPlan.includes('WI-CX0064-docs Local v0.1 Self-Hosting Completion Contract'))));
  checks.autonomous_exhaustion_handoff = handoff.includes('Autonomous work exhaustion stop gate is accepted')
    && handoff.includes('No further independent autonomous WI should start unless')
    && (handoff.includes('WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked')
      || handoff.includes('The hourly worktree runner is retired'))
    && ((handoff.includes('Generalized A2/A3 expansion is blocked')
      && handoff.includes('Long-lived post-bootstrap automation cadence and authority is blocked'))
      || (handoff.includes('Generalized A2/A3 expansion remains blocked on KI-CX-PROVIDER-001')
        && handoff.includes('old cadence decision inactive')));
  checks.autonomous_exhaustion_manifest = manifest.includes('id: decision.autonomous-work-exhaustion-stop-gate')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0046-test')
    && manifest.includes(recordPath);
  checks.autonomous_exhaustion_indexes = docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && decisionsIndex.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.autonomous_exhaustion_boundary = decision.includes('does not mark the persistent `/goal` complete')
    && decision.includes('does not choose the Layer 2 project scope code rule')
    && decision.includes('does not choose the post-bootstrap automation cadence')
    && decision.includes('does not execute S2 review or create a separate reviewer')
    && decision.includes('does not change automation schedule, prompt, merge authority, A2/A3 authority')
    && record.includes('first Layer 2 scaffold generation')
    && record.includes('automation cadence change')
    && record.includes('merge authority change');

  if (!checks.autonomous_exhaustion_decision) error('autonomous_exhaustion.decision_missing', 'Stop gate decision must define autonomous exhaustion and handback conditions.');
  if (!checks.autonomous_exhaustion_policy) error('autonomous_exhaustion.policy_missing', 'Autonomy policy must document the stop gate rule.');
  if (!checks.autonomous_exhaustion_current_wi) error('autonomous_exhaustion.current_wi_missing', 'Current WI must record AUTO/R2/E5 strategy and no-further-independent-WI handback.');
  if (!checks.autonomous_exhaustion_record) error('autonomous_exhaustion.record_missing', 'WI-CX0046 validation record must capture stop-gate result and boundaries.');
  if (!checks.autonomous_exhaustion_flow) error('autonomous_exhaustion.flow_missing', 'Flow and fix_plan must preserve user-decision priority, triggered work, and gated next candidates.');
  if (!checks.autonomous_exhaustion_handoff) error('autonomous_exhaustion.handoff_missing', 'Handoff must expose the stop gate, current user decision, triggered work, and gated work.');
  if (!checks.autonomous_exhaustion_manifest) error('autonomous_exhaustion.manifest_missing', 'Manifest must register the stop gate decision and WI-CX0046 validation record.');
  if (!checks.autonomous_exhaustion_indexes) error('autonomous_exhaustion.index_missing', 'Documentation indexes must include the stop gate decision and validation record.');
  if (!checks.autonomous_exhaustion_boundary) error('autonomous_exhaustion.boundary_missing', 'Stop gate must preserve goal, Layer 2, S2, automation cadence, authority, publication, and destructive-operation boundaries.');
}

function validateKiIdentityPolicy() {
  const lifecycle = read('docs/policies/work-item-lifecycle.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const decision = read('docs/decisions/2026-07-08-ki-identity-severity-policy.md');

  checks.ki_identity_rule_section = lifecycle.includes('## KI Identity Rule');
  checks.ki_identity_no_severity_in_id = lifecycle.includes('KI ids are stable identifiers. They must not encode severity.') && decision.includes('KI ids must not encode severity.');
  checks.ki_identity_severity_field_only = lifecycle.includes('Severity is a field-only classification') && decision.includes('Severity remains a field-only classification.');
  checks.ki_identity_queue_removed = !fixPlan.includes('| KI id severity encoding. |');
  checks.ki_identity_future_namespace_allowed = decision.includes('namespace, sequence, or category rules') && lifecycle.includes('namespace, sequence, or category');

  if (!checks.ki_identity_rule_section) error('ki_identity.rule_section_missing', 'Work item lifecycle policy must include KI Identity Rule.');
  if (!checks.ki_identity_no_severity_in_id) error('ki_identity.severity_in_id_not_forbidden', 'Policy and decision must forbid severity in KI ids.');
  if (!checks.ki_identity_severity_field_only) error('ki_identity.field_only_missing', 'Policy and decision must keep severity as a field-only classification.');
  if (!checks.ki_identity_queue_removed) error('ki_identity.queue_item_not_closed', 'KI id severity encoding item must leave the live Decision Needed queue after accepted decision.');
  if (!checks.ki_identity_future_namespace_allowed) error('ki_identity.future_namespace_missing', 'Decision should preserve room for non-severity namespace or sequence naming rules.');
}
function validateHandoffSizePolicy() {
  const hygiene = read('docs/policies/context-hygiene.md');
  const handoff = read('.flowset/handoff.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const decision = read('docs/decisions/2026-07-08-handoff-size-policy.md');
  const handoffLines = handoff.split('\n').length;

  checks.handoff_size_policy_section = hygiene.includes('## Handoff Size Rule');
  checks.handoff_size_policy_limit = hygiene.includes('must not exceed 220 lines') && decision.includes('maximum of 220 lines');
  checks.handoff_size_validator_aligned = handoffLines <= 220;
  checks.handoff_size_queue_removed = !fixPlan.includes('Whether handoff maximum line count should be 220');
  checks.handoff_size_profile_future = decision.includes('Profile-dependent or larger limits are out of scope');

  if (!checks.handoff_size_policy_section) error('handoff_size.policy_section_missing', 'Context hygiene policy must include Handoff Size Rule.');
  if (!checks.handoff_size_policy_limit) error('handoff_size.limit_missing', 'Policy and decision must state the 220-line Layer 1 handoff limit.');
  if (!checks.handoff_size_validator_aligned) error('handoff_size.current_handoff_too_long', 'Current handoff must satisfy the accepted 220-line limit.', handoffLines);
  if (!checks.handoff_size_queue_removed) error('handoff_size.queue_item_not_closed', 'Handoff maximum line-count item must leave the live Decision Needed queue after accepted decision.');
  if (!checks.handoff_size_profile_future) error('handoff_size.future_profile_missing', 'Decision must reserve larger profile-specific limits for future policy work.');
}
function validateAutonomyDefaultOptionsPacket() {
  const policy = read('docs/policies/autonomy-and-approval.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const decision = read('docs/decisions/2026-07-08-autonomy-default-options-packet.md');

  checks.autonomy_default_options_section = policy.includes('## Post-Bootstrap Default Options');
  checks.autonomy_default_a1_fallback = policy.includes('Durable default without an active approval envelope: A1 Assisted') && decision.includes('Durable default without an active approval envelope: A1 Assisted');
  checks.autonomy_default_a2_envelope = policy.includes('A2 Supervised Autopilot may continue while the user-approved envelope is active') && decision.includes('A2 is envelope-scoped');
  checks.autonomy_default_a3_not_default = policy.includes('A3 is not a default mode') && decision.includes('A3 is not a default mode');
  checks.autonomy_default_no_unattended_thread_claim = policy.includes('does not imply unattended new Codex thread creation') && decision.includes('does not claim fully user-invisible Codex session creation');
  checks.autonomy_default_queue_removed = !fixPlan.includes('| Default autonomy mode after bootstrap. |');
  checks.autonomy_default_exclusions = decision.includes('No deployment, release publication, package publication, or OSS program submission');

  if (!checks.autonomy_default_options_section) error('autonomy_default.options_section_missing', 'Autonomy policy must include post-bootstrap default options.');
  if (!checks.autonomy_default_a1_fallback) error('autonomy_default.a1_fallback_missing', 'Policy and decision must set A1 Assisted as the no-envelope fallback.');
  if (!checks.autonomy_default_a2_envelope) error('autonomy_default.a2_envelope_missing', 'Policy and decision must keep A2 envelope-scoped.');
  if (!checks.autonomy_default_a3_not_default) error('autonomy_default.a3_default_ambiguous', 'Policy and decision must state A3 is not a default mode.');
  if (!checks.autonomy_default_no_unattended_thread_claim) error('autonomy_default.thread_claim_ambiguous', 'Policy and decision must not overclaim unattended Codex session creation.');
  if (!checks.autonomy_default_queue_removed) error('autonomy_default.queue_item_not_closed', 'Default autonomy mode item must leave the live Decision Needed queue after accepted decision.');
  if (!checks.autonomy_default_exclusions) error('autonomy_default.exclusions_missing', 'Decision must preserve deployment, release, package publication, and OSS submission exclusions.');
}
function validateOperatingPolicyLock() {
  const fixPlan = read('.flowset/fix_plan.md');
  const decision = read('docs/decisions/2026-07-08-operating-policy-lock.md');
  const policyFiles = [
    'docs/policies/context-hygiene.md',
    'docs/policies/work-item-lifecycle.md',
    'docs/policies/naming-and-commits.md',
    'docs/policies/git-workflow.md',
    'docs/policies/github-issue-governance.md',
    'docs/policies/autonomy-and-approval.md',
    'docs/policies/triage-strategy.md',
    'docs/policies/evaluation-strategy.md',
    'docs/policies/verification-economy.md',
    'docs/policies/decision-queue.md',
  ];
  const pointerPolicyFiles = policyFiles.filter((file) => file !== 'docs/policies/decision-queue.md');
  const statuses = policyFiles.map((file) => ({
    file,
    status: /^Status: (.+)$/m.exec(read(file))?.[1]?.trim() ?? null,
  }));
  const unaccepted = statuses.filter((item) => item.status !== 'accepted-v0.').map((item) => `${item.file}:${item.status}`);
  const manifestChunks = parseManifestChunks(read('docs/manifest.yaml'));
  const manifestPolicyStatusMismatches = policyFiles
    .map((file) => {
      const chunk = manifestChunks.find((item) => item.source === file);
      return chunk?.status === 'accepted-v0' ? null : `${file}:${chunk?.status ?? 'missing'}`;
    })
    .filter(Boolean);
  const queueBlock = /## Decision Needed Queue\n\n([\s\S]*?)(?:\n## |$)/.exec(fixPlan)?.[1] ?? '';
  const yesBlockers = [...queueBlock.matchAll(/^\| (.+?) \| DQ-[A-Z]+ \| [A-Z0-9+]+ \| yes \| .+? \|$/gm)].map((match) => match[1]);
  const missingPointers = pointerPolicyFiles
    .filter((file) => !read(file).includes('Live unresolved policy items are tracked only in `.flowset/fix_plan.md`'));

  checks.operating_lock_unaccepted_policies = unaccepted;
  checks.operating_lock_manifest_policy_status_mismatches = manifestPolicyStatusMismatches;
  checks.operating_lock_yes_blockers = yesBlockers;
  checks.operating_lock_policy_decision_pointers_missing = missingPointers;
  checks.operating_lock_decision_accepts_v0 = decision.includes('operating policies are locked as accepted-v0');
  checks.operating_lock_live_queue_ssot = decision.includes('The live Decision Needed SSOT is `.flowset/fix_plan.md`');
  checks.operating_lock_exclusions = decision.includes('does not authorize release publication, deployment, package publication, OSS program submission')
    && decision.includes('destructive local realignment');
  checks.operating_lock_next_wi = (/## Current Priority\n\n- \[ \] WI-CX\d{4}-[a-z]+/m.test(fixPlan)
    || /## Current Priority\n\n- \[ \] Waiting for user decision: .+/m.test(fixPlan))
    && !fixPlan.includes('WI-CX0016-docs Operating Policy LOCK');

  if (unaccepted.length) error('operating_lock.unaccepted_policies', 'All Layer 1 operating policy files must be accepted-v0.', unaccepted);
  if (manifestPolicyStatusMismatches.length) error('operating_lock.manifest_policy_status_mismatch', 'Manifest policy chunks must match accepted-v0 operating lock status.', manifestPolicyStatusMismatches);
  if (yesBlockers.length) error('operating_lock.yes_blockers_remaining', 'Operating Policy LOCK requires no live yes lock blockers.', yesBlockers);
  if (missingPointers.length) error('operating_lock.policy_queue_pointer_missing', 'Policy files must point to fix_plan as the live Decision Needed queue SSOT.', missingPointers);
  if (!checks.operating_lock_decision_accepts_v0) error('operating_lock.decision_v0_missing', 'Operating lock decision must accept the policy set as accepted-v0.');
  if (!checks.operating_lock_live_queue_ssot) error('operating_lock.live_queue_ssot_missing', 'Operating lock decision must keep fix_plan as the live Decision Needed SSOT.');
  if (!checks.operating_lock_exclusions) error('operating_lock.exclusions_missing', 'Operating lock decision must preserve release, deployment, package, OSS, and destructive realignment exclusions.');
  if (!checks.operating_lock_next_wi) error('operating_lock.next_wi_missing', 'fix_plan should keep a live current priority after policy lock validation and must not regress to WI-CX0016.');
}
function validateCollaborationResponseContract() {
  const agents = read('AGENTS.md');
  const policy = read('docs/policies/autonomy-and-approval.md');
  const decision = read('docs/decisions/2026-07-08-collaboration-response-contract.md');

  checks.collaboration_response_agents_section = agents.includes('## User-Facing Decision Framing');
  checks.collaboration_response_policy_section = policy.includes('## Decision Framing UX');
  checks.collaboration_response_options = agents.includes('Present options as A/B/C with tradeoffs')
    && policy.includes('Options A/B/C with tradeoffs');
  checks.collaboration_response_recommendation = agents.includes("Codex's recommendation")
    && policy.includes('Recommendation');
  checks.collaboration_response_approval = agents.includes('approval needed to proceed')
    && policy.includes('approval needed');
  checks.collaboration_response_goal_steering = agents.includes('Codex must provide goal steering, not obedient agreement')
    && agents.includes('apply a brake')
    && agents.includes('project identity, context hygiene, verification integrity, UX, priority order, or public-readiness boundaries')
    && policy.includes('## Goal Steering UX')
    && policy.includes('Codex must provide goal steering, not obedient agreement')
    && decision.includes('Codex must not optimize for agreement')
    && decision.includes('Codex must apply a brake');
  checks.collaboration_response_korean_tone = agents.includes('conversational')
    && agents.includes('\uD560\uAC8C')
    && agents.includes('\uD558\uACA0\uB2E4')
    && decision.includes('conversational Korean tone');
  checks.collaboration_response_boundaries = decision.includes('does not authorize release publication, deployment, package publication, OSS program submission')
    && decision.includes('destructive local realignment');

  if (!checks.collaboration_response_agents_section) error('collaboration_response.agents_section_missing', 'AGENTS.md must define the user-facing decision framing contract.');
  if (!checks.collaboration_response_policy_section) error('collaboration_response.policy_section_missing', 'Autonomy policy must define the decision framing UX rule.');
  if (!checks.collaboration_response_options) error('collaboration_response.options_missing', 'Decision-bearing replies must present options and tradeoffs.');
  if (!checks.collaboration_response_recommendation) error('collaboration_response.recommendation_missing', 'Decision-bearing replies must state Codex recommendation.');
  if (!checks.collaboration_response_approval) error('collaboration_response.approval_missing', 'Decision-bearing replies must state next action and approval needed.');
  if (!checks.collaboration_response_goal_steering) error('collaboration_response.goal_steering_missing', 'Decision-bearing replies must synthesize the accumulated goal and apply a brake when the user path conflicts with project identity or safety constraints.');
  if (!checks.collaboration_response_korean_tone) error('collaboration_response.korean_tone_missing', 'AGENTS and decision must preserve the conversational Korean tone instruction.');
  if (!checks.collaboration_response_boundaries) error('collaboration_response.boundaries_missing', 'Decision must preserve release, deployment, package, OSS, and destructive realignment exclusions.');
}
function validateSessionBoundaryAutomationContract() {
  const autonomy = read('docs/policies/autonomy-and-approval.md');
  const hygiene = read('docs/policies/context-hygiene.md');
  const decision = read('docs/decisions/2026-07-08-session-boundary-automation-contract.md');
  const fixPlan = read('.flowset/fix_plan.md');

  checks.session_boundary_policy_section = autonomy.includes('## Session Boundary Automation Contract');
  checks.session_boundary_auto_compact = autonomy.includes('Auto-compact is not a clean session boundary')
    && hygiene.includes('Auto-compact is not a new WI boundary, fresh run, fresh session, or context hygiene reset')
    && decision.includes('auto-compact as same-thread continuation');
  checks.session_boundary_thread_automation = autonomy.includes('Thread automation')
    && autonomy.includes('Is a heartbeat-style wake-up attached to the current thread')
    && decision.includes('Thread automation is same-thread heartbeat behavior');
  checks.session_boundary_standalone_automation = autonomy.includes('Standalone or project automation')
    && autonomy.includes('Starts fresh runs on a schedule')
    && autonomy.includes('dedicated worktree by default')
    && decision.includes('preferred Codex app surface for independent autonomous WI progression');
  checks.session_boundary_new_thread = autonomy.includes('New local thread')
    && autonomy.includes('must not claim it invisibly created a new user-owned thread unless the creation is verified')
    && decision.includes('New local thread creation remains user-owned visible UI state');
  checks.session_boundary_goal_mode = autonomy.includes('Goal mode')
    && /does not by itself create a fresh session or prevent auto-compact/i.test(autonomy);
  checks.session_boundary_fixplan_a2_resolved = !fixPlan.includes('A2/A3 git and continuation scope')
    && fixPlan.includes('A3 publication/merge envelope beyond the current bootstrap approval scope');
  checks.session_boundary_boundaries = decision.includes('does not create a live automation')
    && decision.includes('create a new user-owned local thread')
    && decision.includes('destructive local realignment');

  if (!checks.session_boundary_policy_section) error('session_boundary.policy_section_missing', 'Autonomy policy must define the session boundary automation contract.');
  if (!checks.session_boundary_auto_compact) error('session_boundary.auto_compact_boundary_missing', 'Auto-compact must be classified as same-thread continuation, not a fresh boundary.');
  if (!checks.session_boundary_thread_automation) error('session_boundary.thread_automation_missing', 'Thread automation must be same-thread heartbeat behavior.');
  if (!checks.session_boundary_standalone_automation) error('session_boundary.standalone_automation_missing', 'Standalone/project automation must be the fresh-run continuation surface.');
  if (!checks.session_boundary_new_thread) error('session_boundary.new_thread_boundary_missing', 'New local thread creation must not be overclaimed.');
  if (!checks.session_boundary_goal_mode) error('session_boundary.goal_mode_boundary_missing', 'Goal mode must not be treated as a fresh session.');
  if (!checks.session_boundary_fixplan_a2_resolved) error('session_boundary.fixplan_a2_not_resolved', 'fix_plan must resolve A2 fresh-run ambiguity while preserving A3 scope.');
  if (!checks.session_boundary_boundaries) error('session_boundary.boundaries_missing', 'Decision must preserve live automation, new-thread, release, and destructive realignment boundaries.');
}
function validateLocalWorkspaceRealignment() {
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const record = read('docs/records/validation-wi-cx0018-chore.md');
  const localRoot = String.raw`C:\dev\FDP_Codex`;
  const backupPath = String.raw`C:\tmp\fdp-codex-dev-backup-20260708-140739`;

  checks.local_realign_record_wi = record.includes('WI: WI-CX0018-chore')
    && record.includes('Status: evidence')
    && record.includes(localRoot);
  checks.local_realign_backup_recorded = record.includes(backupPath)
    && handoff.includes(backupPath);
  checks.local_realign_head_recorded = record.includes('aeac5d0dc3406aeb8d441bc7e5b9bd1061591760')
    && handoff.includes('aeac5d0dc3406aeb8d441bc7e5b9bd1061591760');
  checks.local_realign_canonical_handoff = handoff.includes('`' + localRoot + '` is canonical after WI-CX0018 realignment')
    && !handoff.includes('Do not treat `' + localRoot + '` Git metadata as canonical');
  checks.local_realign_backlog_advanced = !/^- \[ \] WI-CX0018-chore\b/m.test(fixPlan)
    && handoff.includes('WI-CX0018-chore: Local Workspace Realignment');
  checks.local_realign_boundary = record.includes('Destructive local realignment occurred only after explicit user approval')
    && record.includes('No release publication, deployment, package publication, OSS program submission');

  if (!checks.local_realign_record_wi) error('local_realign.record_wi_missing', 'WI-CX0018 evidence record must preserve the completed local realignment facts.');
  if (!checks.local_realign_backup_recorded) error('local_realign.backup_missing', 'Realignment backup path must be recorded.');
  if (!checks.local_realign_head_recorded) error('local_realign.head_missing', 'Realigned HEAD must be recorded.');
  if (!checks.local_realign_canonical_handoff) error('local_realign.canonical_handoff_missing', `Handoff must mark ${localRoot} canonical after realignment.`);
  if (!checks.local_realign_backlog_advanced) error('local_realign.backlog_not_advanced', 'Completed WI-CX0018 must not remain the live fix_plan current priority.');
  if (!checks.local_realign_boundary) error('local_realign.boundary_missing', 'Validation record must preserve destructive approval and publication boundaries.');
}
function validateToolingTypeScriptBaseline() {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const tsconfig = JSON.parse(read('tsconfig.json'));
  const workflow = read('.github/workflows/validate.yml');
  const decision = read('docs/decisions/2026-07-08-tooling-typescript-baseline.md');
  const record = read('docs/records/validation-wi-cx0028-chore.md');
  const compilerOptions = tsconfig.compilerOptions ?? {};
  const workflowTypecheckIndex = workflow.indexOf('run: npm run typecheck');
  const workflowValidateIndex = workflow.indexOf('run: npm run validate');

  checks.ts_baseline_dev_dependencies = pkg.devDependencies?.typescript === '^6.0.3'
    && pkg.devDependencies?.['@types/node'] === '^20.19.43';
  checks.ts_baseline_lockfile = lock.lockfileVersion === 3
    && lock.packages?.['node_modules/typescript']?.version === '6.0.3'
    && lock.packages?.['node_modules/@types/node']?.version === '20.19.43';
  checks.ts_baseline_scripts = pkg.scripts?.typecheck === 'tsc --project tsconfig.json --noEmit'
    && pkg.scripts?.['ci:check'] === 'npm run typecheck && npm run validate'
    && pkg.scripts?.validate === 'node scripts/validate-repo.mjs';
  checks.ts_baseline_tsconfig = compilerOptions.allowJs === true
    && compilerOptions.checkJs === true
    && compilerOptions.noEmit === true
    && compilerOptions.module === 'NodeNext'
    && compilerOptions.moduleResolution === 'NodeNext'
    && compilerOptions.types?.includes('node')
    && tsconfig.include?.includes('scripts/**/*.mjs');
  checks.ts_baseline_workflow = workflow.includes('cache: npm')
    && workflow.includes('run: npm ci')
    && workflowTypecheckIndex >= 0
    && workflowValidateIndex > workflowTypecheckIndex;
  checks.ts_baseline_runtime_preserved = exists('scripts/validate-repo.mjs')
    && exists('scripts/build-context-pack.mjs')
    && exists('scripts/lib/manifest.mjs')
    && !exists('scripts/validate-repo.ts')
    && !exists('scripts/build-context-pack.ts');
  checks.ts_baseline_decision = decision.includes('Adopt a TypeScript tooling baseline without converting runtime source files')
    && decision.includes('development dependencies only')
    && decision.includes('Keep `npm run validate` mapped to `node scripts/validate-repo.mjs`');
  checks.ts_baseline_record = record.includes('WI: WI-CX0028-chore')
    && record.includes('npm run typecheck')
    && record.includes('npm run validate')
    && record.includes('No runtime source conversion');

  if (!checks.ts_baseline_dev_dependencies) error('ts_baseline.dev_dependencies_missing', 'TypeScript baseline must pin TypeScript and Node 20 type devDependencies.');
  if (!checks.ts_baseline_lockfile) error('ts_baseline.lockfile_missing', 'TypeScript baseline lockfile entries must be present and reproducible.');
  if (!checks.ts_baseline_scripts) error('ts_baseline.scripts_missing', 'package.json must expose typecheck and ci:check without changing validate.');
  if (!checks.ts_baseline_tsconfig) error('ts_baseline.tsconfig_invalid', 'tsconfig must check existing .mjs scripts with allowJs/checkJs/noEmit.');
  if (!checks.ts_baseline_workflow) error('ts_baseline.workflow_missing', 'Validate workflow must install deps, typecheck, then validate.');
  if (!checks.ts_baseline_runtime_preserved) error('ts_baseline.runtime_changed', 'TypeScript baseline must preserve existing .mjs runtime entrypoints.');
  if (!checks.ts_baseline_decision) error('ts_baseline.decision_missing', 'TypeScript baseline decision must preserve runtime and dependency boundaries.');
  if (!checks.ts_baseline_record) error('ts_baseline.record_missing', 'WI-CX0028 validation record must include typecheck and validation evidence.');
}
function validateToolingStrictnessProbe() {
  const pkg = JSON.parse(read('package.json'));
  const tsconfig = JSON.parse(read('tsconfig.json'));
  const script = read('scripts/report-type-strictness.mjs');
  const decision = read('docs/decisions/2026-07-08-tooling-strictness-probe.md');
  const record = read('docs/records/validation-wi-cx0040-chore.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');

  let report = null;
  try {
    const output = execFileSync(process.execPath, ['scripts/report-type-strictness.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    report = JSON.parse(output);
  } catch (err) {
    error('ts_strictness_probe.execution_failed', 'Strictness probe must execute and emit JSON.', err.message);
  }

  const probeById = new Map((report?.probes ?? []).map((probe) => [probe.id, probe]));
  const strict = probeById.get('strict');
  const noImplicitAny = probeById.get('noImplicitAny');
  const strictNullChecks = probeById.get('strictNullChecks');
  const compilerOptions = tsconfig.compilerOptions ?? {};

  checks.ts_strictness_probe_script = pkg.scripts?.['typecheck:strict-probe'] === 'node scripts/report-type-strictness.mjs'
    && script.includes("kind: 'fdp-codex-type-strictness-report'")
    && script.includes("{ id: 'strict', flags: ['--strict', 'true'] }")
    && script.includes("{ id: 'noImplicitAny', flags: ['--noImplicitAny', 'true'] }")
    && script.includes("{ id: 'strictNullChecks', flags: ['--strictNullChecks', 'true'] }")
    && script.includes("status: result.status === 0 ? 'pass' : 'type-debt'")
    && script.includes('script_exits_zero_on_type_debt: true');
  checks.ts_strictness_probe_report = report?.kind === 'fdp-codex-type-strictness-report'
    && report?.baseline?.strict_enabled === false
    && report?.baseline?.type_debt_is_gating_failure === false
    && strict?.status === 'type-debt'
    && noImplicitAny?.status === 'type-debt'
    && strictNullChecks?.status === 'type-debt'
    && strict?.diagnostic_count > 0
    && noImplicitAny?.diagnostic_count > 0
    && strictNullChecks?.diagnostic_count > 0;
  checks.ts_strictness_probe_top_codes = strict?.top_error_codes?.some((item) => item.code === 'TS2339')
    && noImplicitAny?.top_error_codes?.some((item) => item.code === 'TS7006')
    && strictNullChecks?.top_error_codes?.some((item) => item.code === 'TS2345');
  checks.ts_strictness_probe_baseline_preserved = compilerOptions.strict === false
    && pkg.scripts?.typecheck === 'tsc --project tsconfig.json --noEmit'
    && pkg.scripts?.['ci:check'] === 'npm run typecheck && npm run validate'
    && !exists('scripts/validate-repo.ts')
    && !exists('scripts/build-context-pack.ts')
    && !exists('scripts/report-type-strictness.ts');
  checks.ts_strictness_probe_decision = decision.includes('Add a non-gating TypeScript strictness probe')
    && decision.includes('Type debt discovered by the probe is reported as `type-debt` and does not fail the script')
    && decision.includes('Keep `npm run typecheck` and `npm run ci:check` as the gating baseline')
    && decision.includes('does not enable TypeScript strict mode');
  checks.ts_strictness_probe_record = record.includes('WI: WI-CX0040-chore')
    && record.includes('TypeScript strictness debt is now measurable and repeatable')
    && record.includes('| `strict` | 2 | 582 |')
    && record.includes('| `noImplicitAny` | 2 | 531 |')
    && record.includes('| `strictNullChecks` | 2 | 47 |')
    && record.includes('No release publication, deployment, package publication, OSS program submission');
  checks.ts_strictness_probe_manifest = manifest.includes('id: decision.tooling-strictness-probe')
    && manifest.includes('docs/decisions/2026-07-08-tooling-strictness-probe.md')
    && manifest.includes('id: tool.type-strictness-report')
    && manifest.includes('scripts/report-type-strictness.mjs')
    && manifest.includes('id: record.validation-wi-cx0040-chore')
    && manifest.includes('docs/records/validation-wi-cx0040-chore.md');
  checks.ts_strictness_probe_indexes = docsIndex.includes('docs/decisions/2026-07-08-tooling-strictness-probe.md')
    && docsIndex.includes('docs/records/validation-wi-cx0040-chore.md')
    && docsIndex.includes('scripts/report-type-strictness.mjs')
    && decisionsReadme.includes('docs/decisions/2026-07-08-tooling-strictness-probe.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0040-chore.md');
  checks.ts_strictness_probe_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && fixPlan.includes('Strict TypeScript source conversion or strict-mode tightening. | DQ-DEBT | CODEX | no | Probe installed by WI-CX0040')
    && handoff.includes('WI-CX0040-chore: Tooling Strictness Probe')
    && handoff.includes('npm run typecheck:strict-probe')
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && ['user_decision', 'wi'].includes(state.current_priority?.kind);
  checks.ts_strictness_probe_boundary = record.includes('Strict mode was not enabled')
    && record.includes('Runtime `.mjs` source files were not converted to `.ts`')
    && record.includes('CI gating was not expanded to fail on known strictness debt')
    && decision.includes('does not enable TypeScript strict mode, convert runtime source files');

  if (!checks.ts_strictness_probe_script) error('ts_strictness_probe.script_missing', 'package.json and report script must expose the non-gating strictness probe.');
  if (!checks.ts_strictness_probe_report) error('ts_strictness_probe.report_invalid', 'Strictness probe must emit JSON showing current strictness type debt without failing execution.');
  if (!checks.ts_strictness_probe_top_codes) error('ts_strictness_probe.top_codes_missing', 'Strictness probe report must preserve diagnostic code summaries.');
  if (!checks.ts_strictness_probe_baseline_preserved) error('ts_strictness_probe.baseline_changed', 'Strictness probe must not alter the gating TypeScript baseline or convert runtime sources.');
  if (!checks.ts_strictness_probe_decision) error('ts_strictness_probe.decision_missing', 'Strictness probe decision must capture non-gating behavior and boundaries.');
  if (!checks.ts_strictness_probe_record) error('ts_strictness_probe.record_missing', 'WI-CX0040 validation record must capture measured probe results and boundaries.');
  if (!checks.ts_strictness_probe_manifest) error('ts_strictness_probe.manifest_missing', 'Manifest must register the strictness probe decision, tool, and validation record.');
  if (!checks.ts_strictness_probe_indexes) error('ts_strictness_probe.index_missing', 'Documentation indexes must include the strictness probe artifacts.');
  if (!checks.ts_strictness_probe_flow) error('ts_strictness_probe.flow_missing', 'Flow state must preserve user-decision priority while recording WI-CX0040 completion.');
  if (!checks.ts_strictness_probe_boundary) error('ts_strictness_probe.boundary_missing', 'Strictness probe must preserve strict-mode, conversion, CI gating, publication, and external-contract boundaries.');
}
function validateAutomationRunSurfaceInstallation() {
  const automationId = 'fdp-codex-a2-worktree-wi-runner';
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const decision = read('docs/decisions/2026-07-08-automation-run-surface-installation.md');
  const record = read('docs/records/validation-wi-cx0029-chore.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const docsIndex = read('docs/index.md');

  checks.automation_surface_decision = decision.includes('Install a Codex app standalone worktree cron automation')
    && decision.includes(automationId)
    && decision.includes('not a same-thread heartbeat')
    && decision.includes('not a new user-owned local thread');
  checks.automation_surface_startup_gate = decision.includes('WI-CX0029-chore is still current')
    && decision.includes('origin/main')
    && decision.includes('stop without making repository changes')
    && decision.includes('open PRs')
    && decision.includes('duplicate work');
  checks.automation_surface_bootstrap = decision.includes('AGENTS.md')
    && decision.includes('docs/manifest.yaml')
    && decision.includes('.flowset/handoff.md')
    && decision.includes('work on exactly one Current Priority WI')
    && decision.includes('context pack command and ledger metadata append');
  checks.automation_surface_hard_stops = decision.includes('release publication')
    && decision.includes('deployment')
    && decision.includes('package publication')
    && decision.includes('OSS program submission')
    && decision.includes('new production dependencies')
    && decision.includes('destructive filesystem or git operations')
    && decision.includes('public API or external contract changes')
    && decision.includes('A3 publication behavior');
  checks.automation_surface_record = record.includes('WI: WI-CX0029-chore')
    && record.includes('codex_app.automation_update')
    && record.includes(automationId)
    && record.includes('Execution environment: worktree')
    && record.includes('Status after creation: active')
    && record.includes('not a same-thread heartbeat')
    && record.includes('metadata-only ledger entries')
    && record.includes('duplicate work')
    && record.includes('S1 Adversarial Review');
  checks.automation_surface_manifest = manifest.includes('decision.automation-run-surface-installation')
    && manifest.includes('docs/decisions/2026-07-08-automation-run-surface-installation.md')
    && manifest.includes('record.validation-wi-cx0029-chore')
    && manifest.includes('docs/records/validation-wi-cx0029-chore.md');
  checks.automation_surface_indexes = decisionsReadme.includes('2026-07-08-automation-run-surface-installation.md')
    && recordsReadme.includes('validation-wi-cx0029-chore.md')
    && docsIndex.includes('2026-07-08-automation-run-surface-installation.md')
    && docsIndex.includes('validation-wi-cx0029-chore.md');
  checks.automation_surface_flow = !currentWi.includes('WI id: WI-CX0029-chore')
    && handoff.includes('WI-CX0029-chore: Automation Run Surface Installation')
    && handoff.includes(automationId)
    && !/^- \[ \] WI-CX0029-chore\b/m.test(fixPlan);
  checks.automation_surface_evaluation = record.includes('ESC: E1+E2+E3+E5+E6')
    && record.includes('S1 adversarial review')
    && record.includes('E2/S2 blind review');
  checks.automation_surface_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('new user-owned local thread creation')
    && record.includes('destructive local realignment occurred');

  if (!checks.automation_surface_decision) error('automation_surface.decision_missing', 'Automation run surface decision must name the installed worktree automation and avoid heartbeat/new-thread overclaiming.');
  if (!checks.automation_surface_startup_gate) error('automation_surface.startup_gate_missing', 'Automation must gate itself until WI-CX0029 is merged and accepted on origin/main.');
  if (!checks.automation_surface_bootstrap) error('automation_surface.bootstrap_missing', 'Automation must boot from repository SSOT and rebuild context metadata.');
  if (!checks.automation_surface_hard_stops) error('automation_surface.hard_stops_missing', 'Automation decision must preserve the hard stops.');
  if (!checks.automation_surface_record) error('automation_surface.record_missing', 'WI-CX0029 validation record must capture tool evidence and safety controls.');
  if (!checks.automation_surface_manifest) error('automation_surface.manifest_missing', 'Manifest must register the automation decision and validation record chunks.');
  if (!checks.automation_surface_indexes) error('automation_surface.index_missing', 'Documentation indexes must include the WI-CX0029 decision and record.');
  if (!checks.automation_surface_flow) error('automation_surface.flow_not_advanced', 'Flow state must keep WI-CX0029 evidence while advancing the live backlog beyond WI-CX0029.');
  if (!checks.automation_surface_evaluation) error('automation_surface.evaluation_missing', 'Automation WI must record evaluator strategy and blind/adversarial review handling.');
  if (!checks.automation_surface_boundary) error('automation_surface.boundary_missing', 'Automation WI record must preserve excluded release, dependency, thread, and destructive boundaries.');
}
function validateAutomationRunnerPostMergeSmoke() {
  const record = read('docs/records/validation-wi-cx0030-test.md');
  const currentWi = read('.flowset/current-wi.md');
  const manifest = read('docs/manifest.yaml');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const automationId = 'fdp-codex-a2-worktree-wi-runner';

  checks.automation_smoke_record = record.includes('WI: WI-CX0030-test')
    && record.includes(automationId)
    && record.includes('kind: `cron`')
    && record.includes('status: `ACTIVE`')
    && record.includes('execution environment: `worktree`')
    && record.includes('local environment setup path: absent');
  checks.automation_smoke_gates = record.includes('Startup gate')
    && record.includes('Duplicate work gate')
    && record.includes('Hard stops')
    && record.includes('Validation gate')
    && record.includes('npm run ci:check')
    && record.includes('npm run validate');
  const handoffBackupPath = String.raw`C:\tmp\fdp-codex-dev-backup-20260708-140739`;
  const handoffControlCharacters = [...handoff].filter((char) => {
    const code = char.charCodeAt(0);
    return code < 32 && code !== 10 && code !== 13;
  });
  checks.automation_smoke_handoff_hygiene = record.includes('non-newline control character')
    && handoff.includes(handoffBackupPath)
    && handoffControlCharacters.length === 0;
  checks.automation_smoke_manifest = manifest.includes('record.validation-wi-cx0030-test')
    && manifest.includes('docs/records/validation-wi-cx0030-test.md');
  checks.automation_smoke_indexes = docsIndex.includes('validation-wi-cx0030-test.md')
    && recordsReadme.includes('validation-wi-cx0030-test.md');
  checks.automation_smoke_flow = !currentWi.includes('WI id: WI-CX0030-test')
    && handoff.includes('WI-CX0030-test')
    && handoff.includes('docs/records/validation-wi-cx0030-test.md')
    && !/^- \[ \] WI-CX0030-test\b/m.test(fixPlan);
  checks.automation_smoke_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('destructive local realignment occurred');

  if (!checks.automation_smoke_record) error('automation_smoke.record_missing', 'WI-CX0030 smoke record must capture automation status and setup absence.');
  if (!checks.automation_smoke_gates) error('automation_smoke.gates_missing', 'WI-CX0030 smoke record must prove startup, duplicate, hard-stop, and validation gates.');
  if (!checks.automation_smoke_handoff_hygiene) error('automation_smoke.handoff_hygiene_missing', 'WI-CX0030 must repair and record handoff Windows path hygiene.');
  if (!checks.automation_smoke_manifest) error('automation_smoke.manifest_missing', 'Manifest must register WI-CX0030 validation record.');
  if (!checks.automation_smoke_indexes) error('automation_smoke.index_missing', 'Record indexes must include WI-CX0030 validation record.');
  if (!checks.automation_smoke_flow) error('automation_smoke.flow_missing', 'Flow state must preserve WI-CX0030 handoff evidence while advancing beyond WI-CX0030.');
  if (!checks.automation_smoke_boundary) error('automation_smoke.boundary_missing', 'WI-CX0030 record must preserve excluded publication, dependency, and destructive boundaries.');
}
function validateContextLedgerDedupePolicy() {
  const hygiene = read('docs/policies/context-hygiene.md');
  const spec = read('docs/specifications/context-pack-builder.md');
  const decision = read('docs/decisions/2026-07-08-context-ledger-dedupe-policy.md');
  const record = read('docs/records/validation-wi-cx0031-chore.md');
  const manifest = read('docs/manifest.yaml');
  const fixPlan = read('.flowset/fix_plan.md');
  const currentWi = read('.flowset/current-wi.md');
  const handoff = read('.flowset/handoff.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const docsIndex = read('docs/index.md');

  checks.ledger_dedupe_decision = decision.includes('Do not compact, rewrite, delete, or deduplicate `.flowset/context-ledger.jsonl` in place')
    && decision.includes('append-only audit evidence')
    && decision.includes('metadata-only derived view or report')
    && decision.includes('must not store chunk bodies')
    && decision.includes('must not become the source of truth');
  checks.ledger_dedupe_policy = hygiene.includes('## Append-Only Ledger And Dedupe Views')
    && hygiene.includes('append-only audit evidence')
    && hygiene.includes('Do not compact, rewrite, delete, or deduplicate the source ledger in place')
    && hygiene.includes('metadata-only derived view or report')
    && hygiene.includes('must not replace the append-only ledger');
  checks.ledger_dedupe_spec = spec.includes('## Ledger Dedupe Contract')
    && spec.includes('must not deduplicate before append')
    && spec.includes('must not rewrite, compact, or delete existing ledger lines')
    && spec.includes('read-only with respect to `.flowset/context-ledger.jsonl`')
    && spec.includes('derived metadata-only report');
  checks.ledger_dedupe_record = record.includes('WI: WI-CX0031-chore')
    && record.includes('Source ledger `.flowset/context-ledger.jsonl` remains append-only audit evidence')
    && record.includes('Dedupe is allowed only as a metadata-only derived view or report')
    && record.includes('No source ledger rewrite');
  checks.ledger_dedupe_manifest = manifest.includes('decision.context-ledger-dedupe-policy')
    && manifest.includes('docs/decisions/2026-07-08-context-ledger-dedupe-policy.md')
    && manifest.includes('record.validation-wi-cx0031-chore')
    && manifest.includes('docs/records/validation-wi-cx0031-chore.md');
  checks.ledger_dedupe_indexes = decisionsReadme.includes('2026-07-08-context-ledger-dedupe-policy.md')
    && recordsReadme.includes('validation-wi-cx0031-chore.md')
    && docsIndex.includes('2026-07-08-context-ledger-dedupe-policy.md')
    && docsIndex.includes('validation-wi-cx0031-chore.md');
  checks.ledger_dedupe_flow = !currentWi.includes('WI id: WI-CX0031-chore')
    && handoff.includes('WI-CX0031-chore: Context Ledger Dedupe Policy')
    && handoff.includes('append-only audit evidence')
    && handoff.includes('docs/records/validation-wi-cx0031-chore.md')
    && !/^- \[ \] WI-CX0031-chore\b/m.test(fixPlan);
  checks.ledger_dedupe_boundary = decision.includes('does not rewrite `.flowset/context-ledger.jsonl`')
    && decision.includes('delete historical ledger entries')
    && record.includes('No source ledger rewrite')
    && record.includes('destructive local realignment occurred');

  if (!checks.ledger_dedupe_decision) error('ledger_dedupe.decision_missing', 'Ledger dedupe decision must forbid in-place compaction and allow derived metadata-only views.');
  if (!checks.ledger_dedupe_policy) error('ledger_dedupe.policy_missing', 'Context hygiene policy must define append-only source ledger and derived-view-only dedupe.');
  if (!checks.ledger_dedupe_spec) error('ledger_dedupe.spec_missing', 'Context pack spec must preserve append-only append behavior and read-only dedupe reports.');
  if (!checks.ledger_dedupe_record) error('ledger_dedupe.record_missing', 'WI-CX0031 validation record must capture the dedupe decision.');
  if (!checks.ledger_dedupe_manifest) error('ledger_dedupe.manifest_missing', 'Manifest must register the ledger dedupe decision and validation record.');
  if (!checks.ledger_dedupe_indexes) error('ledger_dedupe.index_missing', 'Decision and record indexes must include WI-CX0031 artifacts.');
  if (!checks.ledger_dedupe_flow) error('ledger_dedupe.flow_missing', 'Flow state must preserve WI-CX0031 handoff evidence while advancing beyond WI-CX0031.');
  if (!checks.ledger_dedupe_boundary) error('ledger_dedupe.boundary_missing', 'Ledger dedupe policy must preserve source ledger and hard-stop boundaries.');
}
function validateLayer2KnowledgeScaffoldContract() {
  const spec = read('docs/specifications/layer-2-knowledge-scaffold.md');
  const knowledge = read('docs/specifications/knowledge-system.md');
  const record = read('docs/records/validation-wi-cx0032-docs.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');

  checks.layer2_scaffold_spec_boundary = spec.includes('This specification is a Layer 1 contract about future Layer 2 artifacts')
    && spec.includes('does not generate a target-project scaffold')
    && spec.includes('does not publish an external contract')
    && spec.includes('Do not use this draft specification to claim a stable public API or external contract');
  checks.layer2_scaffold_roles = spec.includes('Target manifest')
    && spec.includes('Target current WI')
    && spec.includes('Target fix plan')
    && spec.includes('Target handoff')
    && spec.includes('Target context ledger')
    && spec.includes('Target KI registry or issue bridge')
    && spec.includes('Target verification debt registry')
    && spec.includes('Layer 1 provenance record');
  checks.layer2_scaffold_separation = spec.includes('Target-project WIs must use a target-project namespace')
    && spec.includes('must not reuse Layer 1 `WI-CXNNNN-category` identifiers')
    && spec.includes('Target-project KIs must remain separate from Layer 1 KIs')
    && spec.includes('KI severity remains a field-only classification');
  checks.layer2_scaffold_context_hygiene = spec.includes('A target context pack is temporary')
    && spec.includes('rebuilt from the target manifest for each target WI')
    && spec.includes('metadata only: timestamp, target WI id, chunk id, source, hash, load reason, decision reference, and actor')
    && spec.includes('append-only')
    && spec.includes('Layer 1 must not carry Layer 2 context bodies');
  checks.layer2_scaffold_provenance = spec.includes('FDP_Codex repository URL')
    && spec.includes('FDP_Codex commit or release reference')
    && spec.includes('Layer 1 WI id')
    && spec.includes('Manifest chunk ids')
    && spec.includes('target-project identifier and scope code');
  checks.layer2_scaffold_generation_gates = spec.includes('Do not generate a Layer 2 target-project scaffold until its project scope code is resolved')
    && spec.includes('docs/decisions/2026-07-10-layer-2-scope-code-accepted.md')
    && spec.includes('Chunk id scope is resolved as per-target-project')
    && spec.includes('docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md')
    && (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'))
    && !fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
    && !fixPlan.includes('Chunk id scope: global, per-layer, or per-target-project. | DQ-POLICY | CODEX | conditional');
  checks.layer2_scaffold_knowledge_link = knowledge.includes('docs/specifications/layer-2-knowledge-scaffold.md')
    && knowledge.includes('target manifests, handoffs, context ledgers, target WIs, target KIs, verification debt')
    && knowledge.includes('Layer 1 provenance')
    && knowledge.includes('per-target-project chunk id namespaces')
    && knowledge.includes('The first dogfood target scope code is accepted as `FCD`');
  checks.layer2_scaffold_manifest = manifest.includes('spec.layer-2-knowledge-scaffold')
    && manifest.includes('docs/specifications/layer-2-knowledge-scaffold.md')
    && manifest.includes('record.validation-wi-cx0032-docs')
    && manifest.includes('docs/records/validation-wi-cx0032-docs.md');
  checks.layer2_scaffold_indexes = docsIndex.includes('docs/specifications/layer-2-knowledge-scaffold.md')
    && docsIndex.includes('docs/records/validation-wi-cx0032-docs.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0032-docs.md');
  checks.layer2_scaffold_record = record.includes('WI: WI-CX0032-docs')
    && record.includes('target manifest, current WI, fix plan, handoff, context ledger, KI registry or issue bridge, verification debt registry, and Layer 1 provenance record')
    && record.includes('No target-project scaffold generation')
    && record.includes('S1 adversarial review');
  checks.layer2_scaffold_flow = !/^- \[ \] WI-CX0032-docs\b/m.test(fixPlan)
    && handoff.includes('WI-CX0032-docs: Layer 2 Knowledge Scaffold Contract')
    && handoff.includes('docs/specifications/layer-2-knowledge-scaffold.md')
    && handoff.includes('WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate');
  checks.layer2_scaffold_boundary = record.includes('No target-project scaffold generation')
    && record.includes('public API or external contract stabilization')
    && record.includes('destructive local realignment occurred')
    && spec.includes('does not authorize release, deployment, package publication, OSS program submission, or A3 publication behavior');

  if (!checks.layer2_scaffold_spec_boundary) error('layer2_scaffold.boundary_missing', 'Layer 2 scaffold spec must remain draft/pre-generation and avoid public API or external contract claims.');
  if (!checks.layer2_scaffold_roles) error('layer2_scaffold.roles_missing', 'Layer 2 scaffold spec must name all required scaffold roles.');
  if (!checks.layer2_scaffold_separation) error('layer2_scaffold.separation_missing', 'Layer 2 scaffold spec must separate target WI/KI namespaces from Layer 1.');
  if (!checks.layer2_scaffold_context_hygiene) error('layer2_scaffold.context_hygiene_missing', 'Layer 2 scaffold spec must preserve context hygiene and metadata-only ledgers.');
  if (!checks.layer2_scaffold_provenance) error('layer2_scaffold.provenance_missing', 'Layer 2 scaffold spec must require Layer 1 provenance.');
  if (!checks.layer2_scaffold_generation_gates) error('layer2_scaffold.generation_gates_missing', 'Layer 2 scaffold generation must stay gated on the remaining scope-code decision while using the accepted chunk namespace policy.');
  if (!checks.layer2_scaffold_knowledge_link) error('layer2_scaffold.knowledge_link_missing', 'Knowledge system spec must link to the Layer 2 scaffold contract.');
  if (!checks.layer2_scaffold_manifest) error('layer2_scaffold.manifest_missing', 'Manifest must register Layer 2 scaffold spec and validation record.');
  if (!checks.layer2_scaffold_indexes) error('layer2_scaffold.index_missing', 'Documentation indexes must include the Layer 2 scaffold spec and validation record.');
  if (!checks.layer2_scaffold_record) error('layer2_scaffold.record_missing', 'WI-CX0032 validation record must capture contract evidence.');
  if (!checks.layer2_scaffold_flow) error('layer2_scaffold.flow_missing', 'Flow state must advance to the automation fresh-run evidence WI while preserving WI-CX0032 handoff evidence.');
  if (!checks.layer2_scaffold_boundary) error('layer2_scaffold.boundary_not_preserved', 'Layer 2 scaffold WI must preserve generation, publication, public API, and destructive boundaries.');
}
function validateAutomationRunnerFreshRunEvidenceGate() {
  const record = read('docs/records/validation-wi-cx0033-test.md');
  const currentWi = read('.flowset/current-wi.md');
  const manifest = read('docs/manifest.yaml');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const automationId = 'fdp-codex-a2-worktree-wi-runner';

  checks.automation_fresh_run_gate_record = record.includes('WI: WI-CX0033-test')
    && record.includes('No standalone A2 runner fresh-run output was found')
    && record.includes('must not be treated as the first fresh-run output review')
    && record.includes('guardian subagent session')
    && record.includes('thread_source: subagent');
  checks.automation_fresh_run_gate_evidence = record.includes('codex_app.list_threads')
    && record.includes('query `FDP_Codex`')
    && record.includes('returned only the current user-owned thread')
    && record.includes('query `fdp-codex-a2-worktree-wi-runner` returned no threads')
    && record.includes('gh pr list --state open')
    && record.includes('returned `[]`')
    && record.includes('git ls-remote --heads origin wi/cx0033-test-automation-runner-fresh-run-evidence-gate');
  checks.automation_fresh_run_gate_trigger = fixPlan.includes('## Triggered Work')
    && ((fixPlan.includes('WI-CX0035-test Automation Runner First Fresh-Run Output Review')
      && fixPlan.includes('Trigger only when a new FDP_Codex runner thread, branch, PR, or recorded output exists')
      && fixPlan.includes(automationId)
      && handoff.includes('Actual first fresh-run output review remains triggered by future standalone A2 runner output'))
      || (fixPlan.includes('The hourly worktree runner is retired')
        && handoff.includes('The hourly worktree runner is retired')));
  checks.automation_fresh_run_gate_manifest = manifest.includes('record.validation-wi-cx0033-test')
    && manifest.includes('docs/records/validation-wi-cx0033-test.md');
  checks.automation_fresh_run_gate_indexes = docsIndex.includes('docs/records/validation-wi-cx0033-test.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0033-test.md');
  checks.automation_fresh_run_gate_flow = !/^- \[ \] WI-CX0033-test\b/m.test(fixPlan)
    && handoff.includes('WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate')
    && (handoff.includes('WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked')
      || handoff.includes('The hourly worktree runner is retired'));
  checks.automation_fresh_run_gate_boundary = record.includes('No automation authority expansion occurred')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('destructive local realignment occurred');

  if (!checks.automation_fresh_run_gate_record) error('automation_fresh_run_gate.record_missing', 'WI-CX0033 record must distinguish absence evidence from actual fresh-run output review.');
  if (!checks.automation_fresh_run_gate_evidence) error('automation_fresh_run_gate.evidence_missing', 'WI-CX0033 record must capture thread, PR, and branch evidence for no fresh-run output.');
  if (!checks.automation_fresh_run_gate_trigger) error('automation_fresh_run_gate.trigger_missing', 'Actual first fresh-run output review must move to triggered work without expanding automation authority.');
  if (!checks.automation_fresh_run_gate_manifest) error('automation_fresh_run_gate.manifest_missing', 'Manifest must register WI-CX0033 validation record.');
  if (!checks.automation_fresh_run_gate_indexes) error('automation_fresh_run_gate.index_missing', 'Documentation indexes must include WI-CX0033 validation record.');
  if (!checks.automation_fresh_run_gate_flow) error('automation_fresh_run_gate.flow_missing', 'Flow state must record WI-CX0033 and advance current priority to WI-CX0034.');
  if (!checks.automation_fresh_run_gate_boundary) error('automation_fresh_run_gate.boundary_missing', 'WI-CX0033 must preserve automation, publication, dependency, public API, and destructive boundaries.');
}
function validateAutomationRunnerS2ReviewPacket() {
  const packet = read('docs/records/automation-runner-s2-review-packet-2026-07-08.md');
  const record = read('docs/records/validation-wi-cx0041-docs.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const automationId = 'fdp-codex-a2-worktree-wi-runner';
  const packetPath = 'docs/records/automation-runner-s2-review-packet-2026-07-08.md';

  checks.automation_s2_packet_scope = packet.includes('Status: review-needed')
    && packet.includes('This packet is for a separate reviewer')
    && packet.includes('It does not complete E2')
    && packet.includes('does not repay S2 debt by itself')
    && packet.includes('without relying on the implementer')
    && packet.includes('separate S2 review result record');
  checks.automation_s2_packet_sources = packet.includes('docs/decisions/2026-07-08-automation-run-surface-installation.md')
    && packet.includes('docs/records/validation-wi-cx0029-chore.md')
    && packet.includes('docs/records/validation-wi-cx0033-test.md')
    && packet.includes('.flowset/state.json')
    && packet.includes(automationId)
    && packet.includes('automation.toml');
  checks.automation_s2_packet_questions = packet.includes('Does the runner boot from repository SSOT')
    && packet.includes('unresolved Decision Needed items')
    && packet.includes('preserve hard stops')
    && packet.includes('false green')
    && packet.includes('absence of runner output')
    && packet.includes('A3 automerge/publication');
  checks.automation_s2_packet_result_shape = packet.includes('pass, conditional pass, blocked, or request-changes verdict')
    && packet.includes('P0/P1/P2 findings')
    && packet.includes('whether E2/S2 is satisfied')
    && packet.includes('whether the DQ-DEBT row can be removed or must remain');
  checks.automation_s2_packet_non_completion = packet.includes('This packet does not satisfy E2 Blind Independent Review')
    && packet.includes('must remain open until a separate Codex thread, separate reviewer, or human reviewer completes the review');
  checks.automation_s2_packet_record = record.includes('WI: WI-CX0041-docs')
    && record.includes('S2 blind review is prepared but not completed')
    && record.includes('E2 is not claimed as satisfied')
    && record.includes('The S2 DQ-DEBT row remains open')
    && record.includes('No automation authority expansion occurred')
    && record.includes('S2 status: not executed in this WI');
  checks.automation_s2_packet_manifest = manifest.includes('id: record.automation-runner-s2-review-packet')
    && manifest.includes(packetPath)
    && manifest.includes('status: historical-obsolete')
    && manifest.includes('id: record.validation-wi-cx0041-docs')
    && manifest.includes('docs/records/validation-wi-cx0041-docs.md');
  checks.automation_s2_packet_indexes = docsIndex.includes(packetPath)
    && docsIndex.includes('docs/records/validation-wi-cx0041-docs.md')
    && recordsReadme.includes(packetPath)
    && recordsReadme.includes('docs/records/validation-wi-cx0041-docs.md');
  const obsoleteRunnerReview = state.control_plane?.automation?.status === 'RETIRED'
    && !fixPlan.includes('WI-CX0042-test Automation Runner S2 Review Execution')
    && !fixPlan.includes('S2 blind review repayment for the automation runner')
    && handoff.includes('WI-CX0042 is obsolete rather than passed');
  checks.automation_s2_packet_flow = /^WI id: WI-CX\d{4}-(?:feat|fix|docs|style|refactor|test|chore|perf|ci|revert)$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && handoff.includes('WI-CX0041-docs: Automation Runner S2 Review Packet')
    && handoff.includes(packetPath)
    && /^WI-CX\d{4}-(?:feat|fix|docs|style|refactor|test|chore|perf|ci|revert)$/.test(state.current_wi?.id ?? '')
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && (obsoleteRunnerReview || fixPlan.includes('WI-CX0042-test Automation Runner S2 Review Execution'));
  checks.automation_s2_packet_debt_retained = obsoleteRunnerReview
    || (fixPlan.includes('S2 blind review repayment for the automation runner. | DQ-DEBT | CODEX | conditional')
      && !record.includes('S2 blind review is complete')
      && !record.includes('E2 is satisfied')
      && !packet.includes('This packet satisfies E2'));
  checks.automation_s2_packet_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('A3 publication behavior')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('first Layer 2 scaffold generation')
    && record.includes('destructive filesystem or git operation');

  if (!checks.automation_s2_packet_scope) error('automation_s2_packet.scope_missing', 'S2 packet must define separate reviewer scope and avoid overclaiming E2 completion.');
  if (!checks.automation_s2_packet_sources) error('automation_s2_packet.sources_missing', 'S2 packet must point to automation, flow, and local config evidence sources.');
  if (!checks.automation_s2_packet_questions) error('automation_s2_packet.questions_missing', 'S2 packet must include blind/adversarial automation review questions.');
  if (!checks.automation_s2_packet_result_shape) error('automation_s2_packet.result_shape_missing', 'S2 packet must define required separate review result fields.');
  if (!checks.automation_s2_packet_non_completion) error('automation_s2_packet.non_completion_missing', 'S2 packet must explicitly state it does not satisfy E2.');
  if (!checks.automation_s2_packet_record) error('automation_s2_packet.record_missing', 'WI-CX0041 record must capture S2 preparation without claiming completion.');
  if (!checks.automation_s2_packet_manifest) error('automation_s2_packet.manifest_missing', 'Manifest must register the S2 packet and WI-CX0041 validation record.');
  if (!checks.automation_s2_packet_indexes) error('automation_s2_packet.index_missing', 'Documentation indexes must include the S2 packet and validation record.');
  if (!checks.automation_s2_packet_flow) error('automation_s2_packet.flow_missing', 'Flow state must preserve user-decision priority while recording WI-CX0041 completion.');
  if (!checks.automation_s2_packet_debt_retained) error('automation_s2_packet.debt_closed_too_early', 'S2 debt must remain open until a separate review result exists.');
  if (!checks.automation_s2_packet_boundary) error('automation_s2_packet.boundary_missing', 'WI-CX0041 must preserve publication, A3, dependency, API, Layer 2, and destructive-operation boundaries.');
}
function validatePostBootstrapAutomationCadenceHandback() {
  const handback = read('docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md');
  const record = read('docs/records/validation-wi-cx0043-docs.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const handbackPath = 'docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md';
  const recordPath = 'docs/records/validation-wi-cx0043-docs.md';
  const automationId = 'fdp-codex-a2-worktree-wi-runner';

  checks.automation_cadence_handback_scope = handback.includes('Status: user-decision-needed')
    && handback.includes('Decision target: Long-lived post-bootstrap automation cadence and authority')
    && handback.includes(automationId)
    && handback.includes('must not silently become a permanent authority model after bootstrap')
    && handback.includes('does not change the automation schedule, automation prompt, merge authority, A2/A3 authority');
  checks.automation_cadence_handback_options = handback.includes('Option A: Pause After Bootstrap')
    && handback.includes('Option B: Continue A2 With Narrowed PR-Only Authority')
    && handback.includes('Option C: Continue Current A2 Envelope Temporarily')
    && handback.includes('Option D: Define A3 Release/Publication Envelope Later')
    && handback.includes('Recommended primary choice: Option A until S2 review is completed')
    && handback.includes('Recommended operational fallback: Option B after S2 review')
    && handback.includes('Avoid Option C unless the user explicitly wants a short extension and names an expiration condition');
  checks.automation_cadence_handback_prompt = handback.includes('## Decision Prompt')
    && handback.includes('A: pause after bootstrap and fall back to A1')
    && handback.includes('B: continue A2 runner as PR-only automation')
    && handback.includes('C: temporarily continue the current A2 envelope with an expiration condition')
    && handback.includes('If choosing C, provide the expiration condition')
    && handback.includes('B after S2 review')
    && handback.includes('C until WI-CX0050 or until I stop it');
  checks.automation_cadence_handback_record = record.includes('WI: WI-CX0043-docs')
    && record.includes('Post-Bootstrap Automation Cadence Decision Handback')
    && record.includes('no update was made')
    && record.includes('Added validator coverage for the handback, decision queue retention, and no-authority-change boundary')
    && record.includes('The DQ-USER row remains open')
    && record.includes('No automation schedule, prompt, merge authority, A2 authority, or A3 authority was changed')
    && record.includes('WI-CX0035 remains triggered work because no standalone runner output exists yet');
  checks.automation_cadence_handback_manifest = manifest.includes('id: record.post-bootstrap-automation-cadence-decision-handback')
    && manifest.includes(handbackPath)
    && manifest.includes('status: historical-obsolete')
    && manifest.includes('id: record.validation-wi-cx0043-docs')
    && manifest.includes(recordPath);
  checks.automation_cadence_handback_indexes = docsIndex.includes(handbackPath)
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(handbackPath)
    && recordsReadme.includes(recordPath);
  const retiredCadenceHandback = state.control_plane?.automation?.status === 'RETIRED'
    && !fixPlan.includes('WI-CX0044-docs Post-Bootstrap Automation Cadence Accepted Decision')
    && !fixPlan.includes('Long-lived post-bootstrap automation cadence and authority. | DQ-USER')
    && handoff.includes('old cadence decision inactive');
  checks.automation_cadence_handback_flow = /^WI id: WI-CX\d{4}-(?:feat|fix|docs|style|refactor|test|chore|perf|ci|revert)$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && handoff.includes('WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback')
    && /^WI-CX\d{4}-(?:feat|fix|docs|style|refactor|test|chore|perf|ci|revert)$/.test(state.current_wi?.id ?? '')
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && (retiredCadenceHandback
      || (fixPlan.includes('WI-CX0044-docs Post-Bootstrap Automation Cadence Accepted Decision')
        && fixPlan.includes(`Handback \`${handbackPath}\``)
        && handoff.includes(`Automation cadence handback: \`${handbackPath}\``)
        && handoff.includes('Post-bootstrap automation cadence and authority remains user-gated')));
  checks.automation_cadence_handback_no_authority_change = handback.includes('This handback does not change the automation schedule')
    && handback.includes('Do not use Option D as an immediate implementation step')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('A3 publication behavior')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('first Layer 2 scaffold generation')
    && record.includes('destructive filesystem or git operation occurred');

  if (!checks.automation_cadence_handback_scope) error('automation_cadence_handback.scope_missing', 'Automation cadence handback must identify the runner, user-decision target, and no-authority-change scope.');
  if (!checks.automation_cadence_handback_options) error('automation_cadence_handback.options_missing', 'Automation cadence handback must present A/B/C/D options with recommendations and expiration caution.');
  if (!checks.automation_cadence_handback_prompt) error('automation_cadence_handback.prompt_missing', 'Automation cadence handback must include concrete user decision prompts and examples.');
  if (!checks.automation_cadence_handback_record) error('automation_cadence_handback.record_missing', 'WI-CX0043 validation record must capture evidence, DQ retention, and no-authority-change result.');
  if (!checks.automation_cadence_handback_manifest) error('automation_cadence_handback.manifest_missing', 'Manifest must register the automation cadence handback and WI-CX0043 validation record.');
  if (!checks.automation_cadence_handback_indexes) error('automation_cadence_handback.index_missing', 'Documentation indexes must include the automation cadence handback and validation record.');
  if (!checks.automation_cadence_handback_flow) error('automation_cadence_handback.flow_missing', 'Flow state must record WI-CX0043 while preserving the user-decision priority.');
  if (!checks.automation_cadence_handback_no_authority_change) error('automation_cadence_handback.authority_changed', 'WI-CX0043 must not change automation settings, merge authority, A2/A3 authority, or hard-stop boundaries.');
}
function validateLayer2ScopeCodeOptionsPacket() {
  const packet = read('docs/records/layer-2-scope-code-options-2026-07-08.md');
  const record = read('docs/records/validation-wi-cx0034-docs.md');
  const currentWi = read('.flowset/current-wi.md');
  const manifest = read('docs/manifest.yaml');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');

  checks.layer2_scope_code_packet_boundary = packet.includes('This packet does not choose the Layer 2 project scope code rule')
    && packet.includes('No target-project scaffold is generated by this packet')
    && packet.includes('No public API or external contract is stabilized by this packet')
    && packet.includes('Until the user chooses, first Layer 2 target-project scaffold generation remains blocked');
  checks.layer2_scope_code_packet_options = packet.includes('## Option A: User-Chosen Mnemonic Code')
    && packet.includes('## Option B: Temporary Generic Code')
    && packet.includes('## Option C: Repository-Derived Code')
    && packet.includes('## Option D: Long Explicit Project Slug')
    && packet.includes('Recommended primary choice: Option A')
    && packet.includes('Recommended fallback: Option B');
  checks.layer2_scope_code_packet_rule = packet.includes('WI-<PROJECT_CODE><NNNN>-<category>')
    && packet.includes('`PROJECT_CODE` is 2-6 uppercase alphanumeric characters')
    && packet.includes('`PROJECT_CODE` is not `CX`')
    && packet.includes('project_scope_code')
    && packet.includes('scope_code_decision_ref');
  checks.layer2_scope_code_queue = !fixPlan.includes('Chunk id scope: global, per-layer, or per-target-project. | DQ-POLICY | CODEX | conditional')
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || (fixPlan.includes('docs/decisions/2026-07-10-layer-2-scope-code-accepted.md')
        && (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'))));
  checks.layer2_scope_code_manifest = manifest.includes('record.layer-2-scope-code-options')
    && manifest.includes('docs/records/layer-2-scope-code-options-2026-07-08.md')
    && manifest.includes('record.validation-wi-cx0034-docs')
    && manifest.includes('docs/records/validation-wi-cx0034-docs.md');
  checks.layer2_scope_code_indexes = docsIndex.includes('docs/records/layer-2-scope-code-options-2026-07-08.md')
    && docsIndex.includes('docs/records/validation-wi-cx0034-docs.md')
    && recordsReadme.includes('docs/records/layer-2-scope-code-options-2026-07-08.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0034-docs.md');
  checks.layer2_scope_code_record = record.includes('WI: WI-CX0034-docs')
    && record.includes('Recommended primary choice is Option A')
    && record.includes('Recommended fallback is Option B')
    && record.includes('DQ-USER | USER | conditional')
    && record.includes('No Layer 2 target-project scaffold generation occurred');
  checks.layer2_scope_code_flow = !/^- \[ \] WI-CX0034-docs\b/m.test(fixPlan)
    && handoff.includes('WI-CX0034-docs: Layer 2 Scope Code Options Packet')
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || handoff.includes('WI-CX0038 later resolved it as `FCD`'));
  checks.layer2_scope_code_boundary = record.includes('No public API or external contract was stabilized')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('destructive local realignment occurred')
    && (handoff.includes('First Layer 2 target-project scaffold generation is blocked')
      || handoff.includes('no target directory or Layer 2 files are created by WI-CX0038')
      || handoff.includes('The first Layer 2 scaffold is generated and validated at `C:\\dev\\FDP_Codex_Dogfood`'));

  if (!checks.layer2_scope_code_packet_boundary) error('layer2_scope_code.boundary_missing', 'Scope code options packet must preserve the user decision and generation boundary.');
  if (!checks.layer2_scope_code_packet_options) error('layer2_scope_code.options_missing', 'Scope code options packet must contain options A-D plus primary and fallback recommendations.');
  if (!checks.layer2_scope_code_packet_rule) error('layer2_scope_code.rule_missing', 'Scope code options packet must include the proposed acceptance rule fields.');
  if (!checks.layer2_scope_code_queue) error('layer2_scope_code.queue_missing', 'Decision queue must keep scope code user-gated after chunk id scope is resolved.');
  if (!checks.layer2_scope_code_manifest) error('layer2_scope_code.manifest_missing', 'Manifest must register the options packet and validation record.');
  if (!checks.layer2_scope_code_indexes) error('layer2_scope_code.index_missing', 'Indexes must include the options packet and validation record.');
  if (!checks.layer2_scope_code_record) error('layer2_scope_code.record_missing', 'WI-CX0034 validation record must capture recommendations and boundaries.');
  if (!checks.layer2_scope_code_flow) error('layer2_scope_code.flow_missing', 'Flow state must record WI-CX0034 and advance current priority to WI-CX0036.');
  if (!checks.layer2_scope_code_boundary) error('layer2_scope_code.boundary_not_preserved', 'WI-CX0034 must preserve generation, publication, public API, dependency, and destructive boundaries.');
}
function validateLayer2ChunkIdScopePolicy() {
  const decision = read('docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md');
  const record = read('docs/records/validation-wi-cx0036-docs.md');
  const spec = read('docs/specifications/layer-2-knowledge-scaffold.md');
  const knowledge = read('docs/specifications/knowledge-system.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');

  checks.layer2_chunk_id_decision = decision.includes('Layer 2 chunk ids are scoped per target project')
    && decision.includes('Each Layer 2 target manifest owns its local chunk id namespace')
    && decision.includes('Layer 1 chunk ids remain scoped to the FDP_Codex Layer 1 manifest')
    && decision.includes('layer1:<chunk_id>')
    && decision.includes('target:<project_scope_code>:<chunk_id>');
  checks.layer2_chunk_id_rejections = decision.includes('Global chunk ids were rejected')
    && decision.includes('Per-layer chunk ids were rejected')
    && decision.includes('multiple Layer 2 target projects')
    && decision.includes('central registry burden');
  checks.layer2_chunk_id_spec = spec.includes('## Chunk Id Namespace')
    && spec.includes('Layer 2 chunk ids are scoped per target project')
    && spec.includes('Local target chunk ids must be unique within that target manifest')
    && spec.includes('Cross-manifest references must be qualified')
    && spec.includes('target:<project_scope_code>:<chunk_id>')
    && spec.includes('Chunk id scope is resolved as per-target-project');
  checks.layer2_chunk_id_knowledge = knowledge.includes('per-target-project chunk id namespaces')
    && knowledge.includes('Layer 2 chunk id scope is resolved as per-target-project')
    && (knowledge.includes('Layer 2 project scope code remains user-gated')
      || knowledge.includes('The first dogfood target scope code is accepted as `FCD`'));
  checks.layer2_chunk_id_queue = !fixPlan.includes('Chunk id scope: global, per-layer, or per-target-project. | DQ-POLICY | CODEX | conditional')
    && (fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')));
  checks.layer2_chunk_id_manifest = manifest.includes('decision.layer-2-chunk-id-scope-policy')
    && manifest.includes('docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md')
    && manifest.includes('record.validation-wi-cx0036-docs')
    && manifest.includes('docs/records/validation-wi-cx0036-docs.md');
  checks.layer2_chunk_id_indexes = docsIndex.includes('docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md')
    && docsIndex.includes('docs/records/validation-wi-cx0036-docs.md')
    && decisionsReadme.includes('docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0036-docs.md');
  checks.layer2_chunk_id_record = record.includes('WI: WI-CX0036-docs')
    && record.includes('Decision accepts per-target-project chunk id scope')
    && record.includes('The live Decision Needed queue no longer contains the chunk id scope row')
    && record.includes('No Layer 2 target-project scaffold generation occurred');
  checks.layer2_chunk_id_flow = !/^- \[ \] WI-CX0036-docs\b/m.test(fixPlan)
    && handoff.includes('WI-CX0036-docs: Chunk Id Scope Policy')
    && handoff.includes('WI-CX0037-docs: Layer 2 Scope Code Decision Handback');
  checks.layer2_chunk_id_boundary = decision.includes('This decision does not generate a Layer 2 target-project scaffold')
    && decision.includes('does not choose the Layer 2 project scope code rule')
    && record.includes('No public API or external contract was stabilized')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && (handoff.includes('First Layer 2 target-project scaffold generation is blocked on the Layer 2 project scope code rule')
      || handoff.includes('First Layer 2 target-project scaffold generation remains blocked until WI-CX0054 is merged and WI-CX0038 records `FCD`')
      || handoff.includes('WI-CX0055-feat may generate the first dogfood scaffold after WI-CX0038 merges')
      || handoff.includes('The first Layer 2 scaffold is generated and validated at `C:\\dev\\FDP_Codex_Dogfood`'));

  if (!checks.layer2_chunk_id_decision) error('layer2_chunk_id.decision_missing', 'Chunk id scope decision must accept per-target-project scope and qualified references.');
  if (!checks.layer2_chunk_id_rejections) error('layer2_chunk_id.rejections_missing', 'Chunk id scope decision must reject global and per-layer alternatives with rationale.');
  if (!checks.layer2_chunk_id_spec) error('layer2_chunk_id.spec_missing', 'Layer 2 scaffold spec must include the per-target-project chunk id namespace rule.');
  if (!checks.layer2_chunk_id_knowledge) error('layer2_chunk_id.knowledge_missing', 'Knowledge system spec must reflect resolved chunk id scope and remaining user gate.');
  if (!checks.layer2_chunk_id_queue) error('layer2_chunk_id.queue_missing', 'Decision queue must remove chunk id scope and keep scope code user-gated.');
  if (!checks.layer2_chunk_id_manifest) error('layer2_chunk_id.manifest_missing', 'Manifest must register the chunk id decision and validation record.');
  if (!checks.layer2_chunk_id_indexes) error('layer2_chunk_id.index_missing', 'Indexes must include the chunk id decision and validation record.');
  if (!checks.layer2_chunk_id_record) error('layer2_chunk_id.record_missing', 'WI-CX0036 validation record must capture decision evidence.');
  if (!checks.layer2_chunk_id_flow) error('layer2_chunk_id.flow_missing', 'Flow state must record WI-CX0036 and advance current priority to WI-CX0037.');
  if (!checks.layer2_chunk_id_boundary) error('layer2_chunk_id.boundary_missing', 'WI-CX0036 must preserve generation, scope-code, publication, and external-contract boundaries.');
}
function validateLayer2ScopeCodeDecisionHandback() {
  const handback = read('docs/records/layer-2-scope-code-decision-handback-2026-07-08.md');
  const record = read('docs/records/validation-wi-cx0037-docs.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');

  checks.layer2_scope_handback_boundary = handback.includes('Status: resolved-by-WI-CX0038')
    && handback.includes('## Historical Boundary At Handback')
    && handback.includes('No Layer 2 target-project scaffold is generated by this handback')
    && handback.includes('Still user-gated at the time')
    && handback.includes('Which project scope code rule Layer 2 target WIs use');
  checks.layer2_scope_handback_recommendation = handback.includes('Recommended choice: A, user-chosen mnemonic code')
    && handback.includes('Fallback choice: B, temporary `TG` code')
    && handback.includes('Required debt if B is chosen')
    && handback.includes('scope_code_status: temporary');
  checks.layer2_scope_handback_prompt = handback.includes('## Historical Decision Prompt')
    && handback.includes('A: user-chosen mnemonic code. Recommended')
    && handback.includes('If choosing A, provide the exact project code')
    && handback.includes('A, use FS');
  checks.layer2_scope_handback_chunk = handback.includes('Layer 2 chunk ids are scoped per target project')
    && handback.includes('target:<project_scope_code>:<chunk_id>');
  checks.layer2_scope_handback_queue = !fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
    && fixPlan.includes('docs/records/layer-2-scope-code-decision-handback-2026-07-08.md')
    && fixPlan.includes('docs/decisions/2026-07-10-layer-2-scope-code-accepted.md')
    && (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'));
  checks.layer2_scope_handback_manifest = manifest.includes('record.layer-2-scope-code-decision-handback')
    && manifest.includes('docs/records/layer-2-scope-code-decision-handback-2026-07-08.md')
    && manifest.includes('record.validation-wi-cx0037-docs')
    && manifest.includes('docs/records/validation-wi-cx0037-docs.md');
  checks.layer2_scope_handback_indexes = docsIndex.includes('docs/records/layer-2-scope-code-decision-handback-2026-07-08.md')
    && docsIndex.includes('docs/records/validation-wi-cx0037-docs.md')
    && recordsReadme.includes('docs/records/layer-2-scope-code-decision-handback-2026-07-08.md')
    && recordsReadme.includes('docs/records/validation-wi-cx0037-docs.md');
  checks.layer2_scope_handback_record = record.includes('WI: WI-CX0037-docs')
    && record.includes('Handback preserves the user-gated Layer 2 project scope code rule')
    && record.includes('No Layer 2 project scope code rule was chosen')
    && record.includes('No Layer 2 target-project scaffold generation occurred');
  checks.layer2_scope_handback_flow = !/^- \[ \] WI-CX0037-docs\b/m.test(fixPlan)
    && handoff.includes('WI-CX0037-docs: Layer 2 Scope Code Decision Handback')
    && handoff.includes('C:\\dev\\FDP_Codex_Dogfood')
    && handoff.includes('WI-CX0038 later resolved it as `FCD`')
    && /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi);
  checks.layer2_scope_handback_boundary2 = record.includes('No public API or external contract was stabilized')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('destructive local realignment occurred')
    && (handoff.includes('The Layer 2 scope-code gate is resolved')
      || handoff.includes('The first Layer 2 scaffold is generated and validated at `C:\\dev\\FDP_Codex_Dogfood`'));

  if (!checks.layer2_scope_handback_boundary) error('layer2_scope_handback.boundary_missing', 'Handback must preserve user decision and scaffold-generation boundary.');
  if (!checks.layer2_scope_handback_recommendation) error('layer2_scope_handback.recommendation_missing', 'Handback must include recommended A and fallback B with debt.');
  if (!checks.layer2_scope_handback_prompt) error('layer2_scope_handback.prompt_missing', 'Handback must include explicit decision prompt and example answer.');
  if (!checks.layer2_scope_handback_chunk) error('layer2_scope_handback.chunk_missing', 'Handback must reference accepted per-target-project chunk id scope.');
  if (!checks.layer2_scope_handback_queue) error('layer2_scope_handback.queue_missing', 'Fix plan must keep the Layer 2 user decision queued and point to CX0038 after choice.');
  if (!checks.layer2_scope_handback_manifest) error('layer2_scope_handback.manifest_missing', 'Manifest must register the handback and validation record.');
  if (!checks.layer2_scope_handback_indexes) error('layer2_scope_handback.index_missing', 'Indexes must include the handback and validation record.');
  if (!checks.layer2_scope_handback_record) error('layer2_scope_handback.record_missing', 'WI-CX0037 validation record must capture scope and boundary evidence.');
  if (!checks.layer2_scope_handback_flow) error('layer2_scope_handback.flow_missing', 'Flow state must preserve WI-CX0037 handback evidence and keep CX0038 blocked until user choice.');
  if (!checks.layer2_scope_handback_boundary2) error('layer2_scope_handback.boundary_not_preserved', 'WI-CX0037 must preserve generation, publication, public API, dependency, and destructive boundaries.');
}
function validateLayer2ScopeCodeAcceptedDecision() {
  const decisionPath = 'docs/decisions/2026-07-10-layer-2-scope-code-accepted.md';
  const recordPath = 'docs/records/validation-wi-cx0038-docs.md';
  const handbackPath = 'docs/records/layer-2-scope-code-decision-handback-2026-07-08.md';
  const targetRoot = 'C:\\dev\\FDP_Codex_Dogfood';
  const decision = read(decisionPath);
  const record = read(recordPath);
  const handback = read(handbackPath);
  const naming = read('docs/policies/naming-and-commits.md');
  const knowledge = read('docs/specifications/knowledge-system.md');
  const scaffold = read('docs/specifications/layer-2-knowledge-scaffold.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');

  checks.layer2_scope_accepted_decision = decision.includes('Status: accepted')
    && decision.includes('target project identifier: `fdp-codex-dogfood`')
    && decision.includes('target root: `C:\\dev\\FDP_Codex_Dogfood`')
    && decision.includes('project scope code: `FCD`')
    && decision.includes('target WI pattern: `WI-FCDNNNN-category`')
    && decision.includes('project_scope_code: FCD')
    && decision.includes('scope_code_status: accepted')
    && decision.includes('scope_code_decision_ref: layer1:decision.layer-2-scope-code-accepted');
  checks.layer2_scope_accepted_constraints = decision.includes('2-6 uppercase alphanumeric characters')
    && decision.includes('starts with a letter')
    && decision.includes('is not `CX`')
    && naming.includes('WI-FCDNNNN-category')
    && naming.includes('It must not be used for the accepted dogfood target');
  checks.layer2_scope_accepted_specs = knowledge.includes('The first dogfood target scope code is accepted as `FCD`')
    && scaffold.includes('first dogfood target satisfies this gate')
    && scaffold.includes('accepted code `FCD`')
    && handback.includes('Status: resolved-by-WI-CX0038')
    && handback.includes('Resolution: the user selected Option A with code `FCD`');
  checks.layer2_scope_accepted_state = /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && ['WI-CX0055-feat', 'WI-CX0056-test', 'WI-CX0057-docs', 'WI-CX0058-fix', 'WI-CX0059-fix', 'WI-CX0060-test'].includes(state.current_priority?.wi_id)
    && state.layer2_target?.project_id === 'fdp-codex-dogfood'
    && state.layer2_target?.root === targetRoot
    && state.layer2_target?.project_scope_code === 'FCD'
    && state.layer2_target?.scope_code_status === 'accepted'
    && state.layer2_target?.scope_code_decision_ref === decisionPath
    && state.layer2_target?.wi_pattern === 'WI-FCDNNNN-category'
    && ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status);
  checks.layer2_scope_accepted_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'))
    && !fixPlan.includes('Layer 2 project scope code rule. | DQ-USER | USER | conditional')
    && handoff.includes('WI-CX0038-docs is merged through PR #39')
    && handoff.includes('C:\\dev\\FDP_Codex_Dogfood');
  checks.layer2_scope_accepted_registration = manifest.includes('id: decision.layer-2-scope-code-accepted')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0038-docs')
    && manifest.includes(recordPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && decisionsReadme.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.layer2_scope_accepted_record = record.includes('Status: validated')
    && record.includes('Context pack: `ctx-wi-cx0038-docs-20260710040429`')
    && record.includes('No Layer 2 scaffold was generated')
    && record.includes('was not created by this WI')
    && record.includes('The A2 runner remains paused')
    && record.includes('PSC: P1')
    && record.includes('WTC: KNOW')
    && record.includes('Risk: R1')
    && record.includes('ESC: E1+E3+E5+E6');
  checks.layer2_scope_accepted_boundary = !state.hard_stops.includes('first_layer2_target_project_scaffold_generation')
    && (state.current_priority?.blocks?.includes('generation before WI-CX0038 merge')
      || ['generated-validated-local', 'fresh-context-validated-local'].includes(state.layer2_target?.scaffold_status))
    && decision.includes('does not itself create the dogfood directory or generate Layer 2 files')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation reactivation')
    && record.includes('first Layer 2 scaffold generation occurred')
    && record.includes('destructive filesystem or git operation occurred');

  if (!checks.layer2_scope_accepted_decision) error('layer2_scope_accepted.decision_missing', 'WI-CX0038 must accept the exact dogfood target, FCD code, WI pattern, and target-manifest fields.');
  if (!checks.layer2_scope_accepted_constraints) error('layer2_scope_accepted.constraints_missing', 'Accepted FCD naming must satisfy the mnemonic constraints and replace TG for this target.');
  if (!checks.layer2_scope_accepted_specs) error('layer2_scope_accepted.specs_missing', 'Layer 2 specifications and historical handback must reflect the resolved FCD decision.');
  if (!checks.layer2_scope_accepted_state) error('layer2_scope_accepted.state_missing', 'Flow state must expose the accepted FCD target, paused automation, and WI-CX0055 priority.');
  if (!checks.layer2_scope_accepted_flow) error('layer2_scope_accepted.flow_missing', 'Live flow files must remove the scope-code queue row and advance to WI-CX0055.');
  if (!checks.layer2_scope_accepted_registration) error('layer2_scope_accepted.registration_missing', 'Manifest and indexes must register the WI-CX0038 decision and validation record.');
  if (!checks.layer2_scope_accepted_record) error('layer2_scope_accepted.record_missing', 'WI-CX0038 validation record must capture context, strategy, result, and no-generation evidence.');
  if (!checks.layer2_scope_accepted_boundary) error('layer2_scope_accepted.boundary_missing', 'WI-CX0038 must unlock only post-merge scaffold generation while preserving all unrelated hard stops.');
}
function validateSessionOrchestrationControlPlaneAudit() {
  const agents = read('AGENTS.md');
  const policy = read('docs/policies/autonomy-and-approval.md');
  const auditPath = 'docs/records/session-orchestration-control-plane-audit-2026-07-08.md';
  const recordPath = 'docs/records/validation-wi-cx0047-test.md';
  const audit = read(auditPath);
  const record = read(recordPath);
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');

  checks.session_orchestration_agent_guidance = agents.includes('Do not narrow strategic replies to only the latest user-stated issue')
    && agents.includes('accumulated objective, locked constraints, verified current state, and the newest concern')
    && agents.includes('symptom of a broader system gap')
    && agents.includes('Codex must provide goal steering, not obedient agreement')
    && agents.includes('apply a brake');
  checks.session_orchestration_policy = policy.includes('## Control-Plane Runtime Validation')
    && policy.includes('Fresh-run claims must be backed by control-plane evidence')
    && policy.includes('parent thread id and title')
    && policy.includes('runner thread ids and titles')
    && policy.includes('only duplicate-stop evidence')
    && policy.includes('do not generalize A2/A3 autonomy')
    && policy.includes('proceed to first Layer 2 scaffold generation on that assumption');
  checks.session_orchestration_audit_evidence = audit.includes('Status: accepted-audit')
    && audit.includes('019f3d8b-76ae-7420-9337-d26582b51678')
    && audit.includes('fdp-codex-a2-worktree-wi-runner')
    && audit.includes('019f40a6-8574-79a2-b322-ee6e42a2fcc5')
    && audit.includes('019f40dd-7758-7b23-b837-f3199c99b7ee')
    && audit.includes('019f4115-caf6-7061-a1b8-9c08062c939c')
    && audit.includes('Duplicate-stop')
    && audit.includes('control-plane validation gap')
    && audit.includes('parent')
    && audit.includes('thread continued');
  checks.session_orchestration_ki_repayment = audit.includes('KI-CX-AUTO-001')
    && audit.includes('KI-CX-AUTO-002')
    && audit.includes('KI-CX-AUTO-003')
    && audit.includes('KI-CX-AUTO-004')
    && audit.includes('KI-CX-AUTO-005')
    && audit.includes('WI-CX0048-test Runtime Snapshot Validator')
    && audit.includes('WI-CX0049-docs A2 Handoff Receiver Contract')
    && audit.includes('WI-CX0050-test Worktree Isolation Verification');
  checks.session_orchestration_priority = audit.includes('WI-CX0048-test Runtime Snapshot Validator')
    && handoff.includes('WI-CX0048-test: Runtime Snapshot Validator')
    && handoff.includes('WI-CX0049-docs: A2 Handoff Receiver Contract')
    && (fixPlan.includes('WI-CX0050-test Worktree Isolation Verification') || fixPlan.includes('WI-CX0051-test Worktree Isolation Repair Gate') || fixPlan.includes('Waiting for user decision: repair the A2 worktree execution surface') || fixPlan.includes('WI-CX0052-test A2 Worktree Isolation Repair Validation')
      || state.control_plane?.worktree_isolation?.status === 'proven')
    && (handoff.includes('Start WI-CX0050-test Worktree Isolation Verification') || handoff.includes('Start WI-CX0051-test Worktree Isolation Repair Gate') || handoff.includes('user/control-plane repair of the A2 worktree execution surface') || handoff.includes('WI-CX0052-test')
      || handoff.includes('WI-CX0054-fix: Runtime Snapshot State Reconciliation'))
    && exists('.flowset/runtime-snapshot.json');
  checks.session_orchestration_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && state.current_priority?.owner_gate
    && ['E1+E3+E5+E6', 'E1+E2+E3+E5+E6'].includes(state.current_priority?.strategy?.ESC);
  checks.session_orchestration_manifest = manifest.includes('id: record.session-orchestration-control-plane-audit')
    && manifest.includes(auditPath)
    && manifest.includes('status: accepted-audit')
    && manifest.includes('id: record.validation-wi-cx0047-test')
    && manifest.includes(recordPath);
  checks.session_orchestration_indexes = docsIndex.includes(auditPath)
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(auditPath)
    && recordsReadme.includes(recordPath);
  checks.session_orchestration_validation_record = record.includes('WI: WI-CX0047-test')
    && record.includes('Status: validated')
    && record.includes('ctx-wi-cx0047-test-20260708103057')
    && record.includes('Generalized validators')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.session_orchestration_boundary = audit.includes('does not change automation schedule')
    && audit.includes('automation prompt')
    && audit.includes('A2/A3 authority')
    && audit.includes('OSS program submission')
    && audit.includes('production dependencies')
    && audit.includes('destructive filesystem or git behavior')
    && audit.includes('S2 execution')
    && audit.includes('separate reviewer creation')
    && audit.includes('first Layer 2 target-project scaffold generation')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.session_orchestration_agent_guidance) error('session_orchestration.agent_guidance_missing', 'AGENTS must prevent strategic replies from narrowing to only the latest issue.');
  if (!checks.session_orchestration_policy) error('session_orchestration.policy_missing', 'Autonomy policy must require control-plane runtime validation before fresh-run claims.');
  if (!checks.session_orchestration_audit_evidence) error('session_orchestration.audit_evidence_missing', 'Audit record must capture parent thread, automation, runner ids, duplicate-stop evidence, and the validation gap.');
  if (!checks.session_orchestration_ki_repayment) error('session_orchestration.ki_repayment_missing', 'Audit record must register KI debt and repayment WIs.');
  if (!checks.session_orchestration_priority) error('session_orchestration.priority_missing', 'Fix plan and handoff must preserve WI-CX0047 audit evidence and advance to the next control-plane repayment WI.');
  if (!checks.session_orchestration_flow) error('session_orchestration.flow_missing', 'Current WI and state snapshot must preserve a validated flow state after WI-CX0047.');
  if (!checks.session_orchestration_manifest) error('session_orchestration.manifest_missing', 'Manifest must register the session orchestration audit and validation record.');
  if (!checks.session_orchestration_indexes) error('session_orchestration.index_missing', 'Documentation indexes must include the session orchestration audit and validation record.');
  if (!checks.session_orchestration_validation_record) error('session_orchestration.validation_record_missing', 'WI-CX0047 validation record must capture context pack evidence, result, and strategy.');
  if (!checks.session_orchestration_boundary) error('session_orchestration.boundary_missing', 'WI-CX0047 must preserve automation, publication, dependency, S2, reviewer, destructive-operation, and Layer 2 boundaries.');
}
function validateRuntimeSnapshotValidator() {
  const snapshotPath = '.flowset/runtime-snapshot.json';
  const specPath = 'docs/specifications/runtime-snapshot.md';
  const recordPath = 'docs/records/validation-wi-cx0048-test.md';
  const snapshot = readJson(snapshotPath);
  const spec = read(specPath);
  const record = read(recordPath);
  const repairRecordPath = 'docs/records/validation-wi-cx0052-test.md';
  const reconciliationDecisionPath = 'docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md';
  const reconciliationRecordPath = 'docs/records/validation-wi-cx0054-fix.md';
  const repairRecord = read(repairRecordPath);
  const reconciliationDecision = read(reconciliationDecisionPath);
  const reconciliationRecord = read(reconciliationRecordPath);
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const runnerResults = Array.isArray(snapshot.runner_results) ? snapshot.runner_results : [];
  const runnerIds = Array.isArray(snapshot.runner_discovery?.runner_thread_ids) ? snapshot.runner_discovery.runner_thread_ids : [];
  const duplicateStops = runnerResults.filter((item) => item.receiver_result === 'duplicate-stop');
  const hardStops = Array.isArray(snapshot.hard_stops_preserved) ? snapshot.hard_stops_preserved : [];
  const requiredHardStops = [
    'release_publication',
    'deployment',
    'package_publication',
    'oss_submission',
    'a3_publication_behavior',
    'public_api_or_external_contract_change',
    'production_dependency_addition',
    'destructive_filesystem_or_git_operation',
    'first_layer2_target_project_scaffold_generation',
  ];

  checks.runtime_snapshot_schema = snapshot.schema_version === 1
    && snapshot.kind === 'fdp-codex-runtime-snapshot'
    && snapshot.layer === 'layer1'
    && snapshot.snapshot_status === 'historical-superseded'
    && snapshot.superseded_by?.wi_id === 'WI-CX0052-test'
    && snapshot.superseded_by?.record === repairRecordPath
    && snapshot.superseded_by?.result === 'worktree_isolation_proven'
    && snapshot.wi_id === 'WI-CX0048-test'
    && snapshot.repo?.path === String.raw`C:\dev\FDP_Codex`
    && snapshot.repo?.branch === 'wi/cx0048-test-runtime-snapshot-validator'
    && String(snapshot.repo?.base_main_commit ?? '').startsWith('614e966');
  checks.runtime_snapshot_parent_goal = snapshot.parent_thread?.id === '019f3d8b-76ae-7420-9337-d26582b51678'
    && snapshot.parent_thread?.cwd === String.raw`C:\dev\FDP_Codex`
    && snapshot.parent_thread?.status === 'active'
    && snapshot.parent_thread?.role === 'goal-carrier-parent-thread'
    && snapshot.goal?.thread_id === snapshot.parent_thread?.id
    && snapshot.goal?.status === 'blocked'
    && Array.isArray(snapshot.goal?.objective_contains)
    && snapshot.goal.objective_contains.includes('FDP_Codex');
  checks.runtime_snapshot_automation = snapshot.automation?.id === 'fdp-codex-a2-worktree-wi-runner'
    && snapshot.automation?.name === 'FDP_Codex A2 Worktree WI Runner'
    && snapshot.automation?.kind === 'cron'
    && snapshot.automation?.status === 'ACTIVE'
    && snapshot.automation?.execution_environment === 'worktree'
    && Array.isArray(snapshot.automation?.cwds)
    && snapshot.automation.cwds.includes(String.raw`C:\dev\FDP_Codex`)
    && String(snapshot.automation?.config_path ?? '').includes('automation.toml')
    && String(snapshot.automation?.memory_path ?? '').includes('memory.md');
  checks.runtime_snapshot_runner_discovery = snapshot.runner_discovery?.title_query === 'FDP_Codex A2 Worktree'
    && snapshot.runner_discovery?.title_query_count >= 4
    && snapshot.runner_discovery?.automation_id_query === 'fdp-codex-a2-worktree-wi-runner'
    && snapshot.runner_discovery?.automation_id_query_count === 0
    && String(snapshot.runner_discovery?.query_gap ?? '').includes('direct automation-id thread search returned no thread summaries')
    && snapshot.runner_discovery?.latest_runner_thread_id === '019f414e-1d1f-75f1-9070-111e535c29ef'
    && runnerIds.includes('019f414e-1d1f-75f1-9070-111e535c29ef')
    && runnerIds.includes('019f4115-caf6-7061-a1b8-9c08062c939c')
    && runnerIds.includes('019f40dd-7758-7b23-b837-f3199c99b7ee')
    && runnerIds.includes('019f40a6-8574-79a2-b322-ee6e42a2fcc5');
  checks.runtime_snapshot_runner_results = duplicateStops.length >= 4
    && runnerResults.some((item) => item.thread_id === '019f414e-1d1f-75f1-9070-111e535c29ef'
      && item.receiver_result === 'duplicate-stop'
      && String(item.receiver_evidence ?? '').includes('WI-CX0047-test')
      && item.repository_changes === 'none')
    && runnerResults.some((item) => item.thread_id === '019f4115-caf6-7061-a1b8-9c08062c939c'
      && item.receiver_result === 'duplicate-stop'
      && String(item.receiver_evidence ?? '').includes('WI-CX0046')
      && item.repository_changes === 'none');
  checks.runtime_snapshot_receiver_state = snapshot.handoff_receiver_assessment?.status === 'not_proven'
    && String(snapshot.handoff_receiver_assessment?.reason ?? '').includes('did not produce a branch, PR, output record')
    && Array.isArray(snapshot.handoff_receiver_assessment?.blocks)
    && snapshot.handoff_receiver_assessment.blocks.includes('generalized A2/A3 autonomy expansion')
    && snapshot.handoff_receiver_assessment.blocks.includes('first Layer 2 target-project scaffold confidence claims')
    && Array.isArray(snapshot.handoff_receiver_assessment?.repayment_wis)
    && snapshot.handoff_receiver_assessment.repayment_wis.includes('WI-CX0049-docs')
    && snapshot.handoff_receiver_assessment.repayment_wis.includes('WI-CX0050-test')
    && !runnerResults.some((item) => item.receiver_result === 'success');
  checks.runtime_snapshot_worktree_isolation = snapshot.worktree_isolation?.status === 'not_proven'
    && String(snapshot.worktree_isolation?.reason ?? '').includes('existing local WI branches')
    && snapshot.worktree_isolation?.repayment_wi === 'WI-CX0050-test';
  checks.runtime_snapshot_spec = spec.includes('Status: draft')
    && spec.includes('point-in-time Codex app control-plane evidence')
    && spec.includes('metadata-only evidence')
    && spec.includes('`.flowset/runtime-snapshot.json`')
    && spec.includes('parent_thread.id')
    && spec.includes('runner_discovery.title_query_count')
    && spec.includes('No runner result claims effective handoff receiver success')
    && spec.includes('Receiver result labels follow `docs/specifications/a2-handoff-receiver-contract.md`')
    && spec.includes('snapshot_status: historical-superseded')
    && spec.includes('place the current status plus evidence reference in `.flowset/state.json`');
  checks.runtime_snapshot_manifest = manifest.includes('id: spec.runtime-snapshot')
    && manifest.includes(specPath)
    && manifest.includes('id: flow.runtime-snapshot')
    && manifest.includes(snapshotPath)
    && manifest.includes('status: historical-superseded')
    && manifest.includes('id: record.validation-wi-cx0048-test')
    && manifest.includes(recordPath)
    && manifest.includes('id: decision.runtime-snapshot-state-reconciliation')
    && manifest.includes(reconciliationDecisionPath)
    && manifest.includes('id: record.validation-wi-cx0054-fix')
    && manifest.includes(reconciliationRecordPath);
  checks.runtime_snapshot_indexes = docsIndex.includes(specPath)
    && docsIndex.includes(snapshotPath)
    && docsIndex.includes(recordPath)
    && docsIndex.includes(reconciliationDecisionPath)
    && docsIndex.includes(reconciliationRecordPath)
    && recordsReadme.includes(snapshotPath)
    && recordsReadme.includes(recordPath)
    && recordsReadme.includes(reconciliationRecordPath);
  checks.runtime_snapshot_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.current_wi?.validation_record
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && state.current_priority?.owner_gate
    && (fixPlan.includes('WI-CX0050-test Worktree Isolation Verification')
      || fixPlan.includes('WI-CX0051-test Worktree Isolation Repair Gate')
      || fixPlan.includes('Waiting for user decision: repair the A2 worktree execution surface')
      || fixPlan.includes('WI-CX0052-test A2 Worktree Isolation Repair Validation')
      || fixPlan.includes('WI-CX0054-fix Runtime Snapshot State Reconciliation')
      || state.control_plane?.worktree_isolation?.status === 'proven')
    && handoff.includes('WI-CX0048-test: Runtime Snapshot Validator')
    && handoff.includes('Runtime snapshot: `.flowset/runtime-snapshot.json`');
  checks.runtime_snapshot_record = record.includes('WI: WI-CX0048-test')
    && record.includes('Status: validated')
    && record.includes('ctx-wi-cx0048-test-20260708105523')
    && record.includes('Runner title query')
    && record.includes('Automation-id query')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.runtime_snapshot_reconciliation = repairRecord.includes('Worktree isolation may now be treated as proven for FDP_Codex control-plane purposes')
    && snapshot.snapshot_status === 'historical-superseded'
    && snapshot.handoff_receiver_assessment?.status === 'not_proven'
    && snapshot.worktree_isolation?.status === 'not_proven'
    && state.control_plane?.runtime_snapshot?.status === 'historical-superseded'
    && state.control_plane?.runtime_snapshot?.captured_wi === 'WI-CX0048-test'
    && state.control_plane?.runtime_snapshot?.superseded_by === repairRecordPath
    && state.control_plane?.handoff_receiver?.status === 'proven'
    && state.control_plane?.handoff_receiver?.evidence === repairRecordPath
    && state.control_plane?.worktree_isolation?.status === 'proven'
    && state.control_plane?.worktree_isolation?.evidence === repairRecordPath
    && state.control_plane?.automation?.id === 'fdp-codex-a2-worktree-wi-runner'
    && ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && reconciliationDecision.includes('Runtime snapshots are point-in-time evidence')
    && reconciliationDecision.includes('`.flowset/state.json` owns the current control-plane status')
    && reconciliationRecord.includes('WI: WI-CX0054-fix')
    && reconciliationRecord.includes('Status: validated')
    && reconciliationRecord.includes('No Layer 2 scaffold or dogfood target directory was generated')
    && handoff.includes('WI-CX0054-fix: Runtime Snapshot State Reconciliation');
  checks.runtime_snapshot_hard_stops = requiredHardStops.every((item) => hardStops.includes(item))
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('A3 publication behavior')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('destructive filesystem or git operation occurred')
    && record.includes('first Layer 2 scaffold generation occurred')
    && spec.includes('does not create or update Codex app automations')
    && spec.includes('generate a Layer 2 target-project scaffold');

  if (!checks.runtime_snapshot_schema) error('runtime_snapshot.schema_missing', 'Runtime snapshot must use the Layer 1 runtime snapshot schema and record repo branch/base evidence.');
  if (!checks.runtime_snapshot_parent_goal) error('runtime_snapshot.parent_goal_missing', 'Runtime snapshot must record parent goal thread identity and blocked goal status.');
  if (!checks.runtime_snapshot_automation) error('runtime_snapshot.automation_missing', 'Runtime snapshot must record A2 automation identity, status, and worktree config.');
  if (!checks.runtime_snapshot_runner_discovery) error('runtime_snapshot.runner_discovery_missing', 'Runtime snapshot must record runner discovery, thread ids, latest runner, and query gap.');
  if (!checks.runtime_snapshot_runner_results) error('runtime_snapshot.runner_results_missing', 'Runtime snapshot must record duplicate-stop receiver results for observed runners.');
  if (!checks.runtime_snapshot_receiver_state) error('runtime_snapshot.receiver_state_invalid', 'The historical WI-CX0048 snapshot must preserve its original not_proven receiver evidence.');
  if (!checks.runtime_snapshot_worktree_isolation) error('runtime_snapshot.worktree_isolation_invalid', 'The historical WI-CX0048 snapshot must preserve its original not_proven worktree evidence.');
  if (!checks.runtime_snapshot_spec) error('runtime_snapshot.spec_missing', 'Runtime snapshot spec must separate point-in-time evidence from current flow state.');
  if (!checks.runtime_snapshot_manifest) error('runtime_snapshot.manifest_missing', 'Manifest must register runtime snapshot, spec, and validation record.');
  if (!checks.runtime_snapshot_indexes) error('runtime_snapshot.index_missing', 'Indexes must include runtime snapshot artifacts.');
  if (!checks.runtime_snapshot_flow) error('runtime_snapshot.flow_missing', 'Flow state and handoff must preserve WI-CX0048 evidence and maintain a valid current flow state.');
  if (!checks.runtime_snapshot_record) error('runtime_snapshot.record_missing', 'WI-CX0048 validation record must capture evidence, result, and strategy.');
  if (!checks.runtime_snapshot_reconciliation) error('runtime_snapshot.current_state_mismatch', 'Current control-plane state must link WI-CX0052 proven evidence while preserving the historical WI-CX0048 capture.');
  if (!checks.runtime_snapshot_hard_stops) error('runtime_snapshot.boundary_missing', 'WI-CX0048 must preserve hard stops and avoid automation authority or Layer 2 generation changes.');
}
function validateA2HandoffReceiverContract() {
  const contractPath = 'docs/specifications/a2-handoff-receiver-contract.md';
  const recordPath = 'docs/records/validation-wi-cx0049-docs.md';
  const contract = read(contractPath);
  const record = read(recordPath);
  const snapshot = readJson('.flowset/runtime-snapshot.json');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const runnerResults = Array.isArray(snapshot.runner_results) ? snapshot.runner_results : [];

  checks.a2_receiver_contract_terms = contract.includes('Parent thread:')
    && contract.includes('Receiver:')
    && contract.includes('Receiver record:')
    && contract.includes('repo-visible control-plane evidence')
    && contract.includes('must not rely on copied context bodies or prompt dumps');
  checks.a2_receiver_contract_taxonomy = contract.includes('`success`')
    && contract.includes('`duplicate-stop`')
    && contract.includes('`blocked-handback`')
    && contract.includes('`failed`')
    && contract.includes('`stale-or-unknown`')
    && contract.includes('This is a valid safety stop, not a successful handoff')
    && contract.includes('keep the handoff receiver assessment `not_proven`');
  checks.a2_receiver_contract_evidence = contract.includes('## Required Receiver Evidence')
    && contract.includes('`wi_id`')
    && contract.includes('`expected_next_wi`')
    && contract.includes('`parent_thread_id`')
    && contract.includes('`runner_thread_id`')
    && contract.includes('`automation_id`')
    && contract.includes('`context_pack_id`')
    && contract.includes('`repository_changes`')
    && contract.includes('`validation_summary`')
    && contract.includes('`hard_stops_preserved`');
  checks.a2_receiver_contract_parent_handback = contract.includes('## Parent Thread Handback Rules')
    && contract.includes('must not treat the handoff as a fresh-session success')
    && contract.includes('record KI debt and schedule repayment')
    && contract.includes('must not start another independent WI merely to avoid a handback point');
  checks.a2_receiver_contract_validation_rules = contract.includes('`npm run validate` must fail')
    && contract.includes('The runtime snapshot remains `not_proven` while observed runners only have `duplicate-stop` results')
    && contract.includes('live flow advances to WI-CX0050-test Worktree Isolation Verification');
  checks.a2_receiver_contract_runtime_state = snapshot.handoff_receiver_assessment?.status === 'not_proven'
    && runnerResults.some((item) => item.receiver_result === 'duplicate-stop')
    && !runnerResults.some((item) => item.receiver_result === 'success');
  checks.a2_receiver_contract_manifest = manifest.includes('id: spec.a2-handoff-receiver-contract')
    && manifest.includes(contractPath)
    && manifest.includes('id: record.validation-wi-cx0049-docs')
    && manifest.includes(recordPath);
  checks.a2_receiver_contract_indexes = docsIndex.includes(contractPath)
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.a2_receiver_contract_flow = hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.current_wi?.validation_record
    && ['user_decision', 'wi'].includes(state.current_priority?.kind)
    && (state.current_priority?.strategy?.WTC === 'VAL'
      || state.control_plane?.handoff_receiver?.status === 'proven')
    && (fixPlan.includes('WI-CX0050-test Worktree Isolation Verification') || fixPlan.includes('WI-CX0051-test Worktree Isolation Repair Gate') || fixPlan.includes('Waiting for user decision: repair the A2 worktree execution surface') || fixPlan.includes('WI-CX0052-test A2 Worktree Isolation Repair Validation')
      || state.control_plane?.handoff_receiver?.status === 'proven')
    && handoff.includes('WI-CX0049-docs: A2 Handoff Receiver Contract');
  checks.a2_receiver_contract_record = record.includes('WI: WI-CX0049-docs')
    && record.includes('Status: validated')
    && record.includes('ctx-wi-cx0049-docs-20260708110849')
    && record.includes('does not claim that any A2 runner has succeeded as a receiver')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.a2_receiver_contract_boundary = contract.includes('does not create or update Codex app automations')
    && contract.includes('generate a Layer 2 target-project scaffold')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('automation prompt change')
    && record.includes('A2/A3 authority change')
    && record.includes('S2 execution')
    && record.includes('separate reviewer creation')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.a2_receiver_contract_terms) error('a2_receiver_contract.terms_missing', 'A2 handoff receiver contract must define parent, receiver, receiver record, and context-body boundaries.');
  if (!checks.a2_receiver_contract_taxonomy) error('a2_receiver_contract.taxonomy_missing', 'A2 handoff receiver contract must define success, duplicate-stop, blocked-handback, failed, and stale-or-unknown results.');
  if (!checks.a2_receiver_contract_evidence) error('a2_receiver_contract.evidence_missing', 'A2 handoff receiver contract must define required repo-visible receiver evidence fields.');
  if (!checks.a2_receiver_contract_parent_handback) error('a2_receiver_contract.parent_handback_missing', 'A2 handoff receiver contract must define parent-thread handback behavior.');
  if (!checks.a2_receiver_contract_validation_rules) error('a2_receiver_contract.validation_rules_missing', 'A2 handoff receiver contract must define validator expectations and WI-CX0050 flow advancement.');
  if (!checks.a2_receiver_contract_runtime_state) error('a2_receiver_contract.runtime_state_invalid', 'Runtime snapshot must not claim receiver success while observed runner results are duplicate-stop only.');
  if (!checks.a2_receiver_contract_manifest) error('a2_receiver_contract.manifest_missing', 'Manifest must register the A2 handoff receiver contract and validation record.');
  if (!checks.a2_receiver_contract_indexes) error('a2_receiver_contract.index_missing', 'Documentation indexes must include the A2 handoff receiver contract and validation record.');
  if (!checks.a2_receiver_contract_flow) error('a2_receiver_contract.flow_missing', 'Flow state and handoff must record WI-CX0049 and advance to WI-CX0050.');
  if (!checks.a2_receiver_contract_record) error('a2_receiver_contract.record_missing', 'WI-CX0049 validation record must capture evidence, result, and strategy.');
  if (!checks.a2_receiver_contract_boundary) error('a2_receiver_contract.boundary_missing', 'WI-CX0049 must preserve automation, publication, dependency, S2, reviewer, destructive-operation, and Layer 2 boundaries.');
}
function validateWorktreeIsolationVerification() {
  const recordPath = 'docs/records/validation-wi-cx0050-test.md';
  const record = read(recordPath);
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');

  checks.worktree_isolation_record = record.includes('WI: WI-CX0050-test')
    && record.includes('Status: validated-blocked')
    && record.includes('ctx-wi-cx0050-test-20260708113922')
    && record.includes('Worktree isolation is blocked, not proven')
    && record.includes('canonical repository path')
    && record.includes('Escalated `git switch -c wi/cx0050-test-worktree-isolation-verification` succeeded')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.worktree_isolation_duplicate_guard = record.includes('gh pr list --state open')
    && record.includes('returned `[]`')
    && record.includes('returned no existing WI-CX0050 branch')
    && record.includes('returned no existing WI-CX0050 commit')
    && record.includes('confirmed the WI-CX0029 decision on `origin/main`')
    && record.includes('confirmed the WI-CX0029 validation record on `origin/main`');
  checks.worktree_isolation_manifest = manifest.includes('id: record.validation-wi-cx0050-test')
    && manifest.includes(recordPath);
  checks.worktree_isolation_indexes = docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.worktree_isolation_flow = hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.control_plane?.worktree_isolation?.status === 'proven'
    && state.control_plane?.worktree_isolation?.evidence === 'docs/records/validation-wi-cx0052-test.md'
    && handoff.includes('WI-CX0050-test: Worktree Isolation Verification')
    && handoff.includes('WI-CX0051-test: Worktree Isolation Repair Gate')
    && handoff.includes('WI-CX0052-test: A2 Worktree Isolation Repair Validation');
  checks.worktree_isolation_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('automation prompt change')
    && record.includes('A2/A3 authority change')
    && record.includes('S2 execution')
    && record.includes('separate reviewer creation')
    && record.includes('destructive filesystem or git operation')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.worktree_isolation_record) error('worktree_isolation.record_missing', 'WI-CX0050 validation record must capture blocked isolation evidence, result, and strategy.');
  if (!checks.worktree_isolation_duplicate_guard) error('worktree_isolation.duplicate_guard_missing', 'WI-CX0050 must record duplicate-work and WI-CX0029 origin/main guards before starting.');
  if (!checks.worktree_isolation_manifest) error('worktree_isolation.manifest_missing', 'Manifest must register the WI-CX0050 validation record.');
  if (!checks.worktree_isolation_indexes) error('worktree_isolation.index_missing', 'Documentation indexes must include the WI-CX0050 validation record.');
  if (!checks.worktree_isolation_flow) error('worktree_isolation.flow_missing', 'Flow state and handoff must record WI-CX0050 and advance to WI-CX0051.');
  if (!checks.worktree_isolation_boundary) error('worktree_isolation.boundary_missing', 'WI-CX0050 must preserve automation, publication, dependency, S2, reviewer, destructive-operation, and Layer 2 boundaries.');
}
function validateA2WorktreeIsolationRepairGate() {
  const decisionPath = 'docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md';
  const recordPath = 'docs/records/validation-wi-cx0051-test.md';
  const decision = read(decisionPath);
  const record = read(recordPath);
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const snapshot = readJson('.flowset/runtime-snapshot.json');

  checks.a2_worktree_repair_gate_decision = decision.includes('WI: WI-CX0051-test')
    && decision.includes('runner `cwd` is not `C:\\dev\\FDP_Codex`')
    && decision.includes('`git rev-parse --show-toplevel` resolves to the runner `cwd`')
    && decision.includes('canonical repository path remains on its pre-run branch')
    && decision.includes('origin/main contains the WI-CX0029 automation installation decision and validation record')
    && decision.includes('local and remote branch plus open PR checks')
    && decision.includes('context is rebuilt from `docs/manifest.yaml`')
    && decision.includes('marks worktree isolation as `proven` only after the evidence above is present')
    && decision.includes('keep `worktree_isolation.status` as `not_proven`');
  checks.a2_worktree_repair_gate_record = record.includes('WI: WI-CX0051-test')
    && record.includes('Status: validated')
    && record.includes('ctx-wi-cx0051-test-20260708123914')
    && record.includes('returned no existing WI-CX0051 branch')
    && record.includes('returned no existing remote WI-CX0051 branch')
    && record.includes('returned `[]`')
    && record.includes('Escalated `git switch -c wi/cx0051-test-worktree-isolation-repair-gate` succeeded')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.a2_worktree_repair_gate_manifest = manifest.includes('id: decision.a2-worktree-isolation-repair-gate')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0051-test')
    && manifest.includes(recordPath);
  checks.a2_worktree_repair_gate_indexes = docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  const repairValidationPath = 'docs/records/validation-wi-cx0052-test.md';
  const repairValidation = exists(repairValidationPath) ? read(repairValidationPath) : '';
  const repairGateWaiting = currentWi.includes('WI id: WI-CX0051-test')
    && hasActiveWiStatus(currentWi)
    && state.current_wi?.id === 'WI-CX0051-test'
    && state.current_wi?.validation_record === recordPath
    && state.current_priority?.kind === 'user_decision'
    && state.current_priority?.owner_gate === 'USER'
    && state.current_priority?.decision_record === decisionPath
    && fixPlan.includes('Waiting for user decision: repair the A2 worktree execution surface')
    && handoff.includes('WI-CX0051-test Worktree Isolation Repair Gate')
    && handoff.includes('user/control-plane repair');
  const repairGateRepaid = hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.control_plane?.worktree_isolation?.status === 'proven'
    && state.control_plane?.worktree_isolation?.evidence === repairValidationPath
    && repairValidation.includes('Worktree isolation repair gate is satisfied')
    && handoff.includes('WI-CX0052-test: A2 Worktree Isolation Repair Validation');
  checks.a2_worktree_repair_gate_flow = repairGateWaiting || repairGateRepaid;
  checks.a2_worktree_repair_gate_blocks = (snapshot.worktree_isolation?.status === 'not_proven'
    && decision.includes('first Layer 2 target-project scaffold confidence blocked')
    && decision.includes('generalized A2/A3 expansion blocked')
    && state.current_priority?.blocks?.includes('first Layer 2 target-project scaffold confidence claims')
    && state.current_priority?.blocks?.includes('generalized A2/A3 autonomy expansion'))
    || (repairValidation.includes('Worktree isolation may now be treated as proven')
      && repairValidation.includes('First Layer 2 target-project scaffold generation remains blocked')
      && repairValidation.includes('Generalized A2/A3 expansion remains blocked'));
  checks.a2_worktree_repair_gate_boundary = decision.includes('does not create or update Codex app automations')
    && decision.includes('change automation schedule or prompt')
    && decision.includes('change A2/A3 authority')
    && decision.includes('publish a release')
    && decision.includes('generate a Layer 2 target-project scaffold')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('automation prompt change')
    && record.includes('A2/A3 authority change')
    && record.includes('S2 execution')
    && record.includes('separate reviewer creation')
    && record.includes('destructive filesystem or git operation')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.a2_worktree_repair_gate_decision) error('a2_worktree_repair_gate.decision_missing', 'WI-CX0051 must define the minimal evidence gate for proving A2 worktree isolation.');
  if (!checks.a2_worktree_repair_gate_record) error('a2_worktree_repair_gate.record_missing', 'WI-CX0051 validation record must capture duplicate guards, branch creation evidence, result, and strategy.');
  if (!checks.a2_worktree_repair_gate_manifest) error('a2_worktree_repair_gate.manifest_missing', 'Manifest must register the WI-CX0051 decision and validation record.');
  if (!checks.a2_worktree_repair_gate_indexes) error('a2_worktree_repair_gate.index_missing', 'Documentation indexes must include the WI-CX0051 decision and validation record.');
  if (!checks.a2_worktree_repair_gate_flow) error('a2_worktree_repair_gate.flow_missing', 'Flow state and handoff must record WI-CX0051 and wait for user/control-plane repair.');
  if (!checks.a2_worktree_repair_gate_blocks) error('a2_worktree_repair_gate.blocks_missing', 'WI-CX0051 must keep worktree isolation not_proven and block Layer 2/A2 confidence until the gate is satisfied.');
  if (!checks.a2_worktree_repair_gate_boundary) error('a2_worktree_repair_gate.boundary_missing', 'WI-CX0051 must preserve automation, publication, dependency, S2, reviewer, destructive-operation, and Layer 2 boundaries.');
}

function validateA2WorktreeIsolationRepairValidation() {
  const recordPath = 'docs/records/validation-wi-cx0052-test.md';
  const record = read(recordPath);
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');

  checks.a2_worktree_repair_validation_record = record.includes('WI: WI-CX0052-test')
    && record.includes('Status: validated')
    && record.includes('ctx-wi-cx0052-test-20260709145815')
    && record.includes('Receiver cwd: `C:\\Users\\User\\.codex\\worktrees\\9c45\\FDP_Codex`')
    && record.includes('git toplevel was the receiver worktree')
    && record.includes('Canonical repository `C:\\dev\\FDP_Codex` remained on `main`')
    && record.includes('Worktree isolation repair gate is satisfied')
    && record.includes('Worktree isolation may now be treated as proven')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.a2_worktree_repair_validation_manifest = manifest.includes('id: record.validation-wi-cx0052-test')
    && manifest.includes(recordPath);
  checks.a2_worktree_repair_validation_indexes = docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.a2_worktree_repair_validation_flow = hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.control_plane?.worktree_isolation?.status === 'proven'
    && state.control_plane?.worktree_isolation?.evidence === recordPath
    && (state.current_priority?.wi_id === 'WI-CX0038-docs'
      || state.current_priority?.wi_id === 'WI-CX0055-feat'
      || state.current_priority?.wi_id === 'WI-CX0056-test'
      || state.current_priority?.wi_id === 'WI-CX0057-docs'
      || state.current_priority?.wi_id === 'WI-CX0058-fix'
      || state.current_priority?.wi_id === 'WI-CX0059-fix'
      || state.current_priority?.wi_id === 'WI-CX0060-test'
      || state.current_priority?.item === 'Layer 2 project scope code rule')
    && (fixPlan.includes('WI-CX0038-docs Layer 2 Scope Code Accepted Decision')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'))
      || fixPlan.includes('Waiting for user decision: choose the Layer 2 project scope code rule'))
    && handoff.includes('A2 worktree isolation repair is repaid by WI-CX0052-test')
    && (handoff.includes('A, use <CODE>') || handoff.includes('code is `FCD`'));
  checks.a2_worktree_repair_validation_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('automation prompt change')
    && record.includes('automation authority change')
    && record.includes('S2 execution')
    && record.includes('separate reviewer creation')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.a2_worktree_repair_validation_record) error('a2_worktree_repair_validation.record_missing', 'WI-CX0052 must prove the A2 worktree isolation repair gate from receiver evidence.');
  if (!checks.a2_worktree_repair_validation_manifest) error('a2_worktree_repair_validation.manifest_missing', 'Manifest must register the WI-CX0052 validation record.');
  if (!checks.a2_worktree_repair_validation_indexes) error('a2_worktree_repair_validation.index_missing', 'Documentation indexes must include the WI-CX0052 validation record.');
  if (!checks.a2_worktree_repair_validation_flow) error('a2_worktree_repair_validation.flow_missing', 'Flow state and handoff must advance from A2 repair wait to the Layer 2 scope code user decision.');
  if (!checks.a2_worktree_repair_validation_boundary) error('a2_worktree_repair_validation.boundary_missing', 'WI-CX0052 must preserve publication, automation, S2, reviewer, destructive-operation, and Layer 2 scaffold boundaries.');
}

function validateStrategicGoalSteeringContract() {
  const agents = read('AGENTS.md');
  const policy = read('docs/policies/autonomy-and-approval.md');
  const decision = read('docs/decisions/2026-07-08-collaboration-response-contract.md');
  const recordPath = 'docs/records/validation-wi-cx0053-docs.md';
  const record = exists(recordPath) ? read(recordPath) : '';
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');

  checks.goal_steering_agents = agents.includes('Codex must provide goal steering, not obedient agreement')
    && agents.includes('Treat each new user message as input to the accumulated objective')
    && agents.includes('apply a brake');
  checks.goal_steering_policy = policy.includes('## Goal Steering UX')
    && policy.includes('newest user message')
    && policy.includes('apply a brake');
  checks.goal_steering_decision = decision.includes('Codex must not optimize for agreement')
    && decision.includes('accumulated objective, project identity, locked constraints, verified operating state')
    && decision.includes('Codex must apply a brake');
  checks.goal_steering_record = record.includes('WI: WI-CX0053-docs')
    && record.includes('ctx-wi-cx0053-docs-20260709153455')
    && record.includes('goal steering, not obedient agreement')
    && record.includes('apply a brake')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance');
  checks.goal_steering_manifest = manifest.includes('id: record.validation-wi-cx0053-docs')
    && manifest.includes(recordPath);
  checks.goal_steering_indexes = docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.goal_steering_flow = hasActiveWiStatus(currentWi)
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && (state.current_priority?.wi_id === 'WI-CX0038-docs'
      || state.current_priority?.wi_id === 'WI-CX0055-feat'
      || state.current_priority?.wi_id === 'WI-CX0056-test'
      || state.current_priority?.wi_id === 'WI-CX0057-docs'
      || state.current_priority?.wi_id === 'WI-CX0058-fix'
      || state.current_priority?.wi_id === 'WI-CX0059-fix'
      || state.current_priority?.wi_id === 'WI-CX0060-test'
      || state.current_priority?.item === 'Layer 2 project scope code rule')
    && (fixPlan.includes('WI-CX0038-docs Layer 2 Scope Code Accepted Decision')
      || (fixPlan.includes('WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation')
      || fixPlan.includes('WI-CX0056-test Layer 2 Fresh-Context Handoff Continuation Proof')
      || fixPlan.includes('WI-CX0057-docs Ephemeral Worker Controller Boundary Contract')
      || fixPlan.includes('WI-CX0058-fix Context Pack Selection Breadth Guard')
      || fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard'))
      || fixPlan.includes('Layer 2 project scope code rule'))
    && handoff.includes('WI-CX0052-test')
    && handoff.includes('WI-CX0053-docs: Strategic Goal Steering Contract');
  checks.goal_steering_boundary = record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation schedule change')
    && record.includes('automation prompt change')
    && record.includes('automation status change')
    && record.includes('push or merge occurred')
    && record.includes('first Layer 2 scaffold generation occurred');

  if (!checks.goal_steering_agents) error('goal_steering.agents_missing', 'AGENTS must require goal steering and brake behavior.');
  if (!checks.goal_steering_policy) error('goal_steering.policy_missing', 'Autonomy policy must define Goal Steering UX.');
  if (!checks.goal_steering_decision) error('goal_steering.decision_missing', 'Collaboration response decision must require non-obedient goal steering.');
  if (!checks.goal_steering_record) error('goal_steering.record_missing', 'WI-CX0053 validation record must capture context, evaluator stance, validator stance, and brake behavior.');
  if (!checks.goal_steering_manifest) error('goal_steering.manifest_missing', 'Manifest must register the WI-CX0053 validation record.');
  if (!checks.goal_steering_indexes) error('goal_steering.index_missing', 'Documentation indexes must include the WI-CX0053 validation record.');
  if (!checks.goal_steering_flow) error('goal_steering.flow_missing', 'Flow state must advance to WI-CX0053 and then return priority to WI-CX0052.');
  if (!checks.goal_steering_boundary) error('goal_steering.boundary_missing', 'WI-CX0053 must preserve publication, automation, git, and Layer 2 scaffold boundaries.');
}

function validateLayer2ScaffoldGenerator() {
  const generatorPath = 'scripts/generate-layer2-scaffold.mjs';
  const scaffoldValidatorPath = 'scripts/validate-layer2-scaffold.mjs';
  const recordPath = 'docs/records/validation-wi-cx0055-feat.md';
  const generator = read(generatorPath);
  const scaffoldValidator = read(scaffoldValidatorPath);
  const managedWorkerPolicy = read('docs/specifications/managed-worker-exec-policy.rules');
  const spec = read('docs/specifications/layer-2-knowledge-scaffold.md');
  const pkg = JSON.parse(read('package.json'));
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const record = read(recordPath);
  let generated = null;
  let validated = null;
  let overwriteRejected = false;
  let smokeError = null;
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'fdp-codex-layer2-'));
  const outputRoot = path.join(tempRoot, 'smoke-target');
  const generatorArgs = [
    generatorPath,
    '--output', outputRoot,
    '--project-id', 'smoke-target',
    '--project-name', 'Smoke Target',
    '--scope-code', 'SMK',
    '--source-repo', 'https://github.com/flowcoder2025/FDP_Codex.git',
    '--source-commit', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '--generation-wi', 'WI-CX0055-feat',
    '--decision-ref', 'layer1:decision.layer-2-scope-code-accepted',
  ];
  try {
    generated = JSON.parse(execFileSync(process.execPath, generatorArgs, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }));
    validated = JSON.parse(execFileSync(process.execPath, [scaffoldValidatorPath, '--root', outputRoot], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }));
    try {
      execFileSync(process.execPath, generatorArgs, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch {
      overwriteRejected = true;
    }
  } catch (error) {
    smokeError = error.stderr?.toString().trim() || error.message;
  } finally {
    const resolvedTemp = path.resolve(tempRoot);
    const resolvedBase = path.resolve(tmpdir()) + path.sep;
    if (!resolvedTemp.startsWith(resolvedBase)) {
      error('layer2_generator.temp_cleanup_guard', 'Temporary scaffold path escaped the OS temp directory.', resolvedTemp);
    } else {
      rmSync(resolvedTemp, { recursive: true, force: true });
    }
  }

  checks.layer2_generator_scripts = generator.includes('Refusing to overwrite non-empty output directory')
    && generator.includes("add('.flowset/context-ledger.jsonl'")
    && generator.includes("add('docs/manifest.yaml'")
    && generator.includes("add('docs/policies/managed-worker-boundary.md'")
    && scaffoldValidator.includes('manifest_hash_failures')
    && scaffoldValidator.includes('forbiddenLedgerKeys')
    && scaffoldValidator.includes('verification_debt_registry')
    && scaffoldValidator.includes('layer1_provenance')
    && scaffoldValidator.includes('managed_worker_boundary')
    && managedWorkerPolicy.includes('Design fixture only. Codex does not auto-load this path');
  checks.layer2_generator_command_surface = pkg.scripts?.['layer2:generate'] === 'node scripts/generate-layer2-scaffold.mjs'
    && pkg.scripts?.['layer2:validate'] === 'node scripts/validate-layer2-scaffold.mjs'
    && spec.includes('## Command Surface')
    && spec.includes('The generator must refuse a non-empty output directory')
    && spec.includes('Git initialization, remotes, push, publication, release, and deployment remain separate approval-bound operations');
  checks.layer2_generator_smoke = smokeError === null
    && generated?.ok === true
    && generated?.project_scope_code === 'SMK'
    && generated?.file_count >= 15
    && validated?.ok === true
    && validated?.checks?.managed_worker_boundary === true
    && Array.isArray(validated?.checks?.manifest_hash_failures)
    && validated.checks.manifest_hash_failures.length === 0
    && overwriteRejected;
  checks.layer2_generator_registration = manifest.includes('id: tool.generate-layer2-scaffold')
    && manifest.includes(generatorPath)
    && manifest.includes('id: tool.validate-layer2-scaffold')
    && manifest.includes(scaffoldValidatorPath)
    && manifest.includes('id: spec.managed-worker-exec-design')
    && manifest.includes('docs/specifications/managed-worker-exec-policy.rules')
    && manifest.includes('id: record.validation-wi-cx0055-feat')
    && manifest.includes(recordPath)
    && docsIndex.includes(generatorPath)
    && docsIndex.includes(scaffoldValidatorPath)
    && docsIndex.includes('docs/specifications/managed-worker-exec-policy.rules')
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.layer2_generator_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')
    && handoff.includes('The first Layer 2 scaffold is generated and validated at `C:\\dev\\FDP_Codex_Dogfood`')
    && state.current_priority?.wi_id === 'WI-CX0060-test'
    && state.layer2_target?.scaffold_status === 'fresh-context-validated-local'
    && state.layer2_target?.git_head === 'a2702ab4fd370f37af1e804cb6b7e4977ea98f6a'
    && state.layer2_target?.remote_configured === false
    && state.layer2_target?.verification_debt === 'VD-FCD0001'
    && state.layer2_target?.verification_debt_status === 'repaid';
  checks.layer2_generator_record = record.includes('Status: validated')
    && record.includes('ctx-wi-cx0055-feat-20260710042421')
    && record.includes('a5ae05cdbd35d89de35f84748004a8e677b5201d')
    && record.includes('935e0679f22655b2293acf7ee06311c17ff0fd35')
    && record.includes('09d0e0d9c32f57ce721482d2ea7f2efb7497e3a9')
    && record.includes('The target repository has no configured remote')
    && record.includes('Fresh-context continuation is not yet proven')
    && record.includes('PSC: P1')
    && record.includes('WTC: FND')
    && record.includes('Risk: R2')
    && record.includes('ESC: E1+E3+E5+E6');
  checks.layer2_generator_boundary = ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && record.includes('No target remote, target push, target PR')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('Layer 1 push or merge occurred: no');

  if (!checks.layer2_generator_scripts) error('layer2_generator.scripts_missing', 'Layer 2 generator and validator must implement overwrite, hash, ledger, debt, and provenance safeguards.');
  if (!checks.layer2_generator_command_surface) error('layer2_generator.command_surface_missing', 'Package and specification must expose the Layer 2 generator and validator commands.');
  if (!checks.layer2_generator_smoke) error('layer2_generator.smoke_failed', 'Generic Layer 2 scaffold generation, validation, or overwrite refusal failed.', smokeError);
  if (!checks.layer2_generator_registration) error('layer2_generator.registration_missing', 'Manifest and indexes must register WI-CX0055 tools and evidence.');
  if (!checks.layer2_generator_flow) error('layer2_generator.flow_missing', 'Flow state must preserve the validated FCD target through the current WI transition.');
  if (!checks.layer2_generator_record) error('layer2_generator.record_missing', 'WI-CX0055 record must capture context, source, target commit, strategy, and fresh-context debt.');
  if (!checks.layer2_generator_boundary) error('layer2_generator.boundary_missing', 'WI-CX0055 must preserve runner, publication, dependency, and external-contract boundaries.');
}
function validateLayer2FreshContextContinuation() {
  const recordPath = 'docs/records/validation-wi-cx0056-test.md';
  const record = read(recordPath);
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const recordsReadme = read('docs/records/README.md');
  const state = readJson('.flowset/state.json');
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
  const wiContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0056-test'
    && entry.timestamp === '2026-07-10T07:09:51.988Z');
  const target = state.layer2_target ?? {};
  const approvedTargetRoot = 'C:\\dev\\FDP_Codex_Dogfood';
  const proof = target.fresh_context_proof ?? {};
  const knownIssues = Array.isArray(state.known_issues) ? state.known_issues : [];
  const dogfoodKi = knownIssues.find((item) => item.id === 'KI-CX-DOGFOOD-001');
  const contextKi = knownIssues.find((item) => item.id === 'KI-CX-CONTEXT-001');
  const completeKiFields = (item) => item?.severity === 'Medium'
    && item.owner === 'CODEX'
    && Boolean(item.trigger)
    && Boolean(item.defer_reason)
    && Boolean(item.repayment_condition)
    && Boolean(item.hard_stop);

  checks.layer2_fresh_context_registration = manifest.includes('id: record.validation-wi-cx0056-test')
    && manifest.includes(recordPath)
    && docsIndex.includes(recordPath)
    && recordsReadme.includes(recordPath);
  checks.layer2_fresh_context_ledger = wiContextPackEntries.length === 123
    && wiContextPackEntries.every((entry) => entry.source && !entry.source.includes('FDP_Codex_Dogfood'))
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && record.includes('123 metadata-only ledger entries')
    && record.includes('contains_chunk_bodies: false');
  checks.layer2_fresh_context_record = record.includes('Status: validated')
    && record.includes('ctx-wi-cx0056-test-20260710070951')
    && record.includes('019f4ad7-d478-7ae1-809c-19c19d20780b')
    && record.includes('received no WI id or debt id')
    && record.includes('019f4acb-3066-7c12-b39e-ce3b2e371294')
    && record.includes('a2702ab4fd370f37af1e804cb6b7e4977ea98f6a')
    && record.includes('target:FCD:docs/records/validation-wi-fcd0002-test.md')
    && record.includes('VD-FCD0001 is repaid')
    && record.includes('controller pre-created the target branch')
    && record.includes('does not support a claim that the worker can own the full Git lifecycle');
  checks.layer2_fresh_context_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')
    && handoff.includes('WI-CX0056-test: Layer 2 Fresh-Context Handoff Continuation Proof')
    && handoff.includes('Fresh-context continuation is proven')
    && handoff.includes('WI-CX0057-docs: Ephemeral Worker Controller Boundary Contract')
    && handoff.includes('WI-CX0058-fix: Context Pack Selection Breadth Guard')
    && state.current_priority?.wi_id === 'WI-CX0060-test';
  checks.layer2_fresh_context_state = target.project_id === 'fdp-codex-dogfood'
    && target.root === approvedTargetRoot
    && target.project_scope_code === 'FCD'
    && target.scaffold_status === 'fresh-context-validated-local'
    && target.current_wi === 'WI-FCD0002-test'
    && target.next_wi === null
    && target.verification_debt === 'VD-FCD0001'
    && target.verification_debt_status === 'repaid'
    && target.verification_debt_evidence === 'target:FCD:docs/records/validation-wi-fcd0002-test.md'
    && target.git_branch === 'WI-FCD0002-test'
    && target.git_head === 'a2702ab4fd370f37af1e804cb6b7e4977ea98f6a'
    && target.remote_configured === false
    && proof.execution_surface === 'codex-cli-ephemeral'
    && proof.bootstrap_commit === '09d0e0d9c32f57ce721482d2ea7f2efb7497e3a9'
    && proof.minimal_prompt_session_id === '019f4ad7-d478-7ae1-809c-19c19d20780b'
    && proof.continuation_session_id === '019f4acb-3066-7c12-b39e-ce3b2e371294'
    && proof.controller_precreated_branch === true
    && proof.controller_created_commit === true
    && proof.previous_conversation_bodies_carried === false
    && proof.target_commit === target.git_head;
  checks.layer2_fresh_context_known_issues = completeKiFields(dogfoodKi)
    && dogfoodKi.status === 'repaid'
    && dogfoodKi.repaid_by === 'WI-CX0057-docs'
    && dogfoodKi.decision_ref === 'docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md'
    && dogfoodKi.evidence === 'docs/records/validation-wi-cx0057-docs.md'
    && completeKiFields(contextKi)
    && contextKi.status === 'repaid'
    && contextKi.repaid_by === 'WI-CX0058-fix'
    && contextKi.decision_ref === 'docs/decisions/2026-07-10-context-selection-breadth-guard.md'
    && contextKi.evidence === 'docs/records/validation-wi-cx0058-fix.md'
    && !fixPlan.includes('KI-CX-DOGFOOD-001 Ephemeral worker Git-metadata ownership')
    && !fixPlan.includes('KI-CX-CONTEXT-001 Context-pack selection breadth')
    && fixPlan.includes('KI-CX-PROVIDER-001 / Issue #55 Repository-backed model worker trust boundary')
    && record.includes('## Known Issues')
    && record.includes('Hard stop: before reactivating the runner')
    && record.includes('Hard stop: before generalized automated WI cadence');
  checks.layer2_fresh_context_separation = !manifest.includes('source: C:\\dev\\FDP_Codex_Dogfood')
    && record.includes('Layer 1 records import only qualified target metadata and evidence pointers')
    && record.includes('not target SSOT bodies or prompt bodies')
    && state.hygiene?.body_storage === 'forbidden'
    && state.hygiene?.context_bodies_carried === false;
  checks.layer2_fresh_context_boundary = ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && target.remote_configured === false
    && record.includes('No target remote, target push, or target PR occurred')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('automation reactivation')
    && record.includes('A3 publication behavior')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('No destructive filesystem or git operation occurred');

  let localTargetStatus = 'not-present';
  let localTargetError = null;
  const targetRoot = target.root;
  if (targetRoot !== approvedTargetRoot) {
    localTargetStatus = 'invalid-root';
  } else if (existsSync(targetRoot)) {
    try {
      const gitAtTarget = (...args) => execFileSync('git', ['-C', targetRoot, ...args], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
      const targetHead = gitAtTarget('rev-parse', 'HEAD');
      const targetBranch = gitAtTarget('branch', '--show-current');
      const targetStatus = gitAtTarget('status', '--porcelain');
      const targetRemotes = gitAtTarget('remote');
      execFileSync(process.execPath, ['scripts/validate-scaffold.mjs'], { cwd: targetRoot, stdio: 'ignore' });
      execFileSync(process.execPath, ['scripts/validate-scaffold.mjs', '--wi', 'WI-FCD0002-test'], { cwd: targetRoot, stdio: 'ignore' });
      const targetRecordExists = existsSync(path.join(targetRoot, 'docs/records/validation-wi-fcd0002-test.md'));
      localTargetStatus = targetHead === target.git_head
        && targetBranch === target.git_branch
        && targetStatus === ''
        && targetRemotes === ''
        && targetRecordExists
        ? 'validated'
        : 'mismatch';
    } catch (validationError) {
      localTargetStatus = 'failed';
      localTargetError = validationError.stderr?.toString().trim() || validationError.message;
    }
  }
  checks.layer2_fresh_context_local_target_status = localTargetStatus;
  checks.layer2_fresh_context_local_target = ['not-present', 'validated'].includes(localTargetStatus);

  if (!checks.layer2_fresh_context_registration) error('layer2_fresh_context.registration_missing', 'Manifest and indexes must register WI-CX0056 qualified evidence.');
  if (!checks.layer2_fresh_context_ledger) error('layer2_fresh_context.ledger_missing', 'WI-CX0056 must preserve its 123-entry metadata-only Layer 1 context selection evidence.');
  if (!checks.layer2_fresh_context_record) error('layer2_fresh_context.record_missing', 'WI-CX0056 must record minimal-prompt reconstruction, real continuation, controller boundary, debt repayment, and target commit evidence.');
  if (!checks.layer2_fresh_context_flow) error('layer2_fresh_context.flow_missing', 'Flow state must preserve WI-CX0056 proof and advance through the controller-boundary contract.');
  if (!checks.layer2_fresh_context_state) error('layer2_fresh_context.state_missing', 'Layer 1 state must expose qualified FCD continuation evidence without target bodies.');
  if (!checks.layer2_fresh_context_known_issues) error('layer2_fresh_context.known_issues_missing', 'Dogfood Git ownership must be repaid by WI-CX0057 while context breadth remains an open Medium KI.');
  if (!checks.layer2_fresh_context_separation) error('layer2_fresh_context.separation_missing', 'Layer 1 must import only qualified target metadata and evidence pointers.');
  if (!checks.layer2_fresh_context_boundary) error('layer2_fresh_context.boundary_missing', 'WI-CX0056 must preserve target remote, runner, publication, dependency, and external-contract hard stops.');
  if (!checks.layer2_fresh_context_local_target) error('layer2_fresh_context.local_target_mismatch', 'When the local FCD target exists, its branch, head, clean state, remote boundary, evidence, and validation must match Layer 1 state.', localTargetError ?? localTargetStatus);
}

function validateEphemeralWorkerControllerBoundary() {
  const decisionPath = 'docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md';
  const recordPath = 'docs/records/validation-wi-cx0057-docs.md';
  const decision = read(decisionPath);
  const record = read(recordPath);
  const autonomy = read('docs/policies/autonomy-and-approval.md');
  const gitPolicy = read('docs/policies/git-workflow.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
  const wiContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0057-docs'
    && entry.timestamp === '2026-07-10T07:35:24.654Z');
  const topology = state.control_plane?.worker_topology ?? {};
  const knownIssues = Array.isArray(state.known_issues) ? state.known_issues : [];
  const dogfoodKi = knownIssues.find((item) => item.id === 'KI-CX-DOGFOOD-001');
  const contextKi = knownIssues.find((item) => item.id === 'KI-CX-CONTEXT-001');
  const runnerConfigPath = 'C:\\Users\\User\\.codex\\automations\\fdp-codex-a2-worktree-wi-runner\\automation.toml';
  let liveRunnerStatus = 'not-present';
  if (existsSync(runnerConfigPath)) {
    const runnerConfig = readFileSync(runnerConfigPath, 'utf8');
    liveRunnerStatus = /^status\s*=\s*"PAUSED"\s*$/m.test(runnerConfig) ? 'paused' : 'not-paused';
  }

  checks.ephemeral_worker_registration = manifest.includes('id: decision.ephemeral-worker-controller-boundary')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0057-docs')
    && manifest.includes(recordPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && decisionsReadme.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.ephemeral_worker_ledger = wiContextPackEntries.length === 120
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && wiContextPackEntries.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry))
    && record.includes('120 metadata-only ledger entries')
    && record.includes('contains_chunk_bodies: false')
    && record.includes('general `handoff` token')
    && record.includes('KI-CX-CONTEXT-001 and WI-CX0058-fix');
  checks.ephemeral_worker_policy = autonomy.includes('### Controller And Ephemeral Worker Split')
    && autonomy.includes('one visible control task')
    && autonomy.includes('codex exec --ephemeral')
    && autonomy.includes('The controller owns repository-supplied script execution and canonical validation')
    && autonomy.includes('The worker owns repository reconstruction and worktree edits')
    && autonomy.includes('This is not runtime command confinement')
    && autonomy.includes('visible controller runs canonical validation after worker exit')
    && autonomy.includes('must not create user-owned Codex app tasks')
    && autonomy.includes('must not use `danger-full-access` solely to write Git metadata')
    && (autonomy.includes('A2 runner remains paused') || autonomy.includes('A2 runner was paused'))
  checks.ephemeral_worker_git_policy = gitPolicy.includes('## Controller-Owned Git Boundary For Ephemeral Workers')
    && gitPolicy.includes('The controller owns repository validation, branch creation, staged review, commit, push, PR, and merge')
    && gitPolicy.includes('worker owns repository reconstruction and worktree edits')
    && gitPolicy.includes('is instructed not to execute repository-supplied scripts or package managers')
    && gitPolicy.includes('This is not runtime command confinement')
    && gitPolicy.includes('controller owns repository validation')
    && gitPolicy.includes('Do not grant `danger-full-access` solely')
    && gitPolicy.includes('not an exception that permits implementation on `main`');
  checks.ephemeral_worker_decision = decision.includes('Status: accepted-v0')
    && decision.includes('one visible control task plus ephemeral CLI workers')
    && decision.includes('codex exec --ephemeral')
    && decision.includes('without creating a user-owned Codex app task')
    && decision.includes('The controller owns repository-supplied script execution and canonical validation')
    && decision.includes('worker owns repository reconstruction and worktree edits')
    && decision.includes('controller owns repository-supplied script execution and canonical validation')
    && decision.includes('workspace-write worker could rewrite any allowed validation script')
    && decision.includes('project-local deny rules also restrict the visible controller')
    && decision.includes('must not use `danger-full-access` solely to write Git metadata')
    && decision.includes('without persistent app task fan-out')
    && decision.includes('repays KI-CX-DOGFOOD-001');
  checks.ephemeral_worker_record = record.includes('Status: validated')
    && record.includes('ctx-wi-cx0057-docs-20260710073524')
    && record.includes('019f4ad7-d478-7ae1-809c-19c19d20780b')
    && record.includes('019f4acb-3066-7c12-b39e-ce3b2e371294')
    && record.includes('a2702ab4fd370f37af1e804cb6b7e4977ea98f6a')
    && record.includes('status = "PAUSED"')
    && record.includes('PSC: P1')
    && record.includes('WTC: AUTO')
    && record.includes('Risk: R2')
    && record.includes('ESC: E1+E3+E5+E6')
    && record.includes('Primary evaluator stance')
    && record.includes('Validator stance')
    && record.includes('node --check scripts/validate-repo.mjs')
    && record.includes('npm.cmd run validate')
    && record.includes('ephemeral_worker_live_runner_status: paused')
    && record.includes('npm.cmd run ci:check')
    && record.includes('git diff --check');
  checks.ephemeral_worker_flow = fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')
    && !fixPlan.includes('KI-CX-DOGFOOD-001 Ephemeral worker Git-metadata ownership')
    && handoff.includes('- WI-CX0057-docs: Ephemeral Worker Controller Boundary Contract')
    && handoff.includes('KI-CX-DOGFOOD-001 is repaid')
    && topology.mode === 'single-visible-controller-ephemeral-workers';
  checks.ephemeral_worker_topology = topology.mode === 'single-visible-controller-ephemeral-workers'
    && topology.controller_task_count === 1
    && topology.worker_surface === 'codex-cli-ephemeral'
    && topology.worker_sandbox === 'workspace-write'
    && JSON.stringify(topology.controller_git_ownership) === JSON.stringify(['branch', 'stage', 'commit', 'push', 'pr', 'merge'])
    && JSON.stringify(topology.controller_validation_ownership) === JSON.stringify(['repository-supplied-scripts', 'canonical-validation'])
    && JSON.stringify(topology.worker_ownership) === JSON.stringify(['reconstruct', 'edit'])
    && topology.app_task_fanout === 'forbidden'
    && topology.decision_ref === decisionPath;
  checks.ephemeral_worker_known_issues = dogfoodKi?.status === 'repaid'
    && dogfoodKi.repaid_by === 'WI-CX0057-docs'
    && dogfoodKi.decision_ref === decisionPath
    && dogfoodKi.evidence === recordPath
    && contextKi?.status === 'repaid'
    && contextKi.repaid_by === 'WI-CX0058-fix'
    && contextKi.repayment_condition.includes('WI-CX0058-fix')
    && contextKi.trigger.includes('123 metadata chunks')
    && contextKi.trigger.includes('120');
  checks.ephemeral_worker_boundary = ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && state.layer2_target?.remote_configured === false
    && decision.includes('does not reactivate it, change its prompt or schedule')
    && record.includes('No target remote, target push, or target PR occurred')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('A3 publication behavior')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('first Layer 2 scaffold generation')
    && record.includes('No destructive filesystem or git operation occurred');
  checks.ephemeral_worker_live_runner_status = liveRunnerStatus;
  checks.ephemeral_worker_live_runner = ['not-present', 'paused'].includes(liveRunnerStatus);

  if (!checks.ephemeral_worker_registration) error('ephemeral_worker.registration_missing', 'Manifest and indexes must register the WI-CX0057 decision and evidence.');
  if (!checks.ephemeral_worker_ledger) error('ephemeral_worker.ledger_missing', 'WI-CX0057 must preserve its 120-entry metadata-only selection and context-breadth evidence.');
  if (!checks.ephemeral_worker_policy) error('ephemeral_worker.policy_missing', 'Autonomy policy must define one controller, ephemeral workers, role ownership, sandbox limits, and runner pause.');
  if (!checks.ephemeral_worker_git_policy) error('ephemeral_worker.git_policy_missing', 'Git policy must keep branch-first execution and controller-owned Git operations.');
  if (!checks.ephemeral_worker_decision) error('ephemeral_worker.decision_missing', 'Decision must define the accepted controller and ephemeral worker topology.');
  if (!checks.ephemeral_worker_record) error('ephemeral_worker.record_missing', 'WI-CX0057 evidence must record context, dogfood inputs, strategy, and runner state.');
  if (!checks.ephemeral_worker_flow) error('ephemeral_worker.flow_missing', 'Flow state must validate WI-CX0057 and advance to WI-CX0058.');
  if (!checks.ephemeral_worker_topology) error('ephemeral_worker.topology_missing', 'Machine-readable state must expose controller, worker, sandbox, Git, and app task boundaries.');
  if (!checks.ephemeral_worker_known_issues) error('ephemeral_worker.known_issues_missing', 'KI-CX-DOGFOOD-001 must be repaid while KI-CX-CONTEXT-001 remains open for WI-CX0058.');
  if (!checks.ephemeral_worker_boundary) error('ephemeral_worker.boundary_missing', 'WI-CX0057 must retain runner, target remote, publication, authority, dependency, API, and destructive-operation hard stops.');
  if (!checks.ephemeral_worker_live_runner) error('ephemeral_worker.runner_not_paused', 'When the local runner config exists, it must remain PAUSED.', liveRunnerStatus);
}

function validateContextSelectionBreadthGuard() {
  const decisionPath = 'docs/decisions/2026-07-10-context-selection-breadth-guard.md';
  const recordPath = 'docs/records/validation-wi-cx0058-fix.md';
  const builderPath = 'scripts/build-context-pack.mjs';
  const decision = read(decisionPath);
  const record = read(recordPath);
  const builder = read(builderPath);
  const spec = read('docs/specifications/context-pack-builder.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
  const wiContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0058-fix'
    && entry.timestamp === '2026-07-10T08:19:12.097Z');
  const runBuilder = (args) => JSON.parse(execFileSync(process.execPath, [builderPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }));

  let currentSample = null;
  let wi0057Sample = null;
  let genericSample = null;
  let rejectedSample = null;
  let sampleError = null;
  try {
    currentSample = runBuilder([
      '--wi', 'WI-CX0058-fix',
      '--risk', 'R2',
      '--intent', 'deterministic context selection breadth guard exact token provenance cap',
      '--changed', 'scripts/build-context-pack.mjs',
      '--changed', 'docs/specifications/context-pack-builder.md',
      '--changed', 'docs/decisions/2026-07-08-context-selection-rule-table.md',
      '--changed', 'scripts/validate-repo.mjs',
    ]);
    wi0057Sample = runBuilder([
      '--wi', 'WI-CX0057-docs',
      '--risk', 'R2',
      '--intent', 'session-boundary ephemeral-worker controller-owned branch commit',
      '--changed', 'docs/policies/autonomy-and-approval.md',
      '--changed', 'docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md',
      '--changed', 'docs/manifest.yaml',
      '--changed', 'scripts/validate-repo.mjs',
      '--changed', '.flowset/handoff.md',
    ]);
    genericSample = runBuilder([
      '--wi', 'WI-CX0058-fix',
      '--risk', 'R2',
      '--intent', 'handoff validation',
      '--changed', '.flowset/handoff.md',
    ]);
    try {
      runBuilder([
        '--wi', 'WI-CX0056-test',
        '--risk', 'R2',
        '--intent', 'fresh-run-continuation session-boundary layer-2 target handoff validation wi-start git pull-request',
        '--changed', '.flowset/current-wi.md',
        '--changed', '.flowset/fix_plan.md',
        '--changed', '.flowset/handoff.md',
        '--changed', '.flowset/state.json',
        '--changed', 'docs/manifest.yaml',
        '--changed', 'docs/records/validation-wi-cx0056-test.md',
      ]);
    } catch (rejectionError) {
      rejectedSample = JSON.parse(rejectionError.stderr?.toString() ?? '{}');
    }
  } catch (validationError) {
    sampleError = validationError.stderr?.toString().trim() || validationError.message;
  }

  const knownIssues = Array.isArray(state.known_issues) ? state.known_issues : [];
  const contextKi = knownIssues.find((item) => item.id === 'KI-CX-CONTEXT-001');
  const workerKi = knownIssues.find((item) => item.id === 'KI-CX-WORKER-001');
  const topology = state.control_plane?.worker_topology ?? {};

  checks.context_breadth_registration = manifest.includes('id: decision.context-selection-breadth-guard')
    && manifest.includes(decisionPath)
    && manifest.includes('id: record.validation-wi-cx0058-fix')
    && manifest.includes(recordPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && decisionsReadme.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.context_breadth_ledger = wiContextPackEntries.length === 76
    && wiContextPackEntries.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry))
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && record.includes('76 metadata-only ledger entries')
    && record.includes('contains_chunk_bodies: false');
  checks.context_breadth_builder = builder.includes("policy: 'exact-specialized-intent-tags-v1'")
    && builder.includes('manifest.explicit-reference-match')
    && builder.includes('loads_for exactly matched intent tags')
    && builder.includes('maxDynamicLoadsForChunks = 24')
    && builder.includes('maxSelectedChunks = 40')
    && builder.includes('context_selection_breadth_guard_rejected')
    && builder.indexOf("breadthGuard.status === 'rejected'") < builder.indexOf("args['append-ledger']");
  checks.context_breadth_spec = spec.includes('Status: implemented-v2')
    && spec.includes('## Breadth Guard')
    && spec.includes('Generic single terms')
    && spec.includes('limited to 24 chunks')
    && spec.includes('limited to 40 chunks')
    && spec.includes('exit before ledger append')
    && spec.includes('must not silently truncate');
  checks.context_breadth_decision = decision.includes('Status: accepted-v0')
    && decision.includes('123 chunks for WI-CX0056')
    && decision.includes('120 for WI-CX0057')
    && decision.includes('76 for the initial WI-CX0058')
    && decision.includes('exact specialized tags')
    && decision.includes('rejected before any ledger append')
    && decision.includes('supersedes only the token-intersection behavior');
  checks.context_breadth_samples = sampleError === null
    && currentSample?.selected_chunk_ids?.length === 18
    && currentSample?.breadth_guard?.status === 'passed'
    && currentSample?.breadth_guard?.total_selected_chunk_count === 18
    && wi0057Sample?.selected_chunk_ids?.length === 29
    && wi0057Sample?.breadth_guard?.dynamic_loads_for_chunk_count === 14
    && genericSample?.breadth_guard?.dynamic_loads_for_chunk_count === 0
    && !genericSample?.selection_rule_ids?.includes('manifest.loads-for-token-match')
    && rejectedSample?.error === 'context_selection_breadth_guard_rejected'
    && rejectedSample?.breadth_guard?.dynamic_loads_for_chunk_count === 29
    && rejectedSample?.breadth_guard?.total_selected_chunk_count === 41
    && rejectedSample?.breadth_guard?.status === 'rejected';
  checks.context_breadth_record = record.includes('Status: validated')
    && record.includes('ctx-wi-cx0058-fix-20260710081912')
    && record.includes('| Equivalent WI-CX0058 precise request | 76 | 18 |')
    && record.includes('| Equivalent WI-CX0057 session-boundary request with changed handoff | 120 | 29 |')
    && record.includes('rejected before append at dynamic 29 and total 41')
    && record.includes('ledger line count unchanged at 4714 before and after')
    && record.includes('observed process ids 61312, 40280, and 60288')
    && record.includes('incomplete builder-only partial edit')
    && record.includes('PSC: P1')
    && record.includes('WTC: VAL')
    && record.includes('Risk: R2')
    && record.includes('ESC: E1+E3+E5+E6');
  checks.context_breadth_flow = fixPlan.includes('WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard')
    && !fixPlan.includes('KI-CX-CONTEXT-001 Context-pack selection breadth')
    && fixPlan.includes('KI-CX-PROVIDER-001 / Issue #55 Repository-backed model worker trust boundary')
    && handoff.includes('- WI-CX0058-fix: Context Pack Selection Breadth Guard')
    && state.context_selection?.policy === 'exact-specialized-intent-tags-v1';
  checks.context_breadth_known_issues = contextKi?.status === 'repaid'
    && contextKi.repaid_by === 'WI-CX0058-fix'
    && contextKi.decision_ref === decisionPath
    && contextKi.evidence === recordPath
    && workerKi?.severity === 'Medium'
    && workerKi.owner === 'CODEX'
    && workerKi.repayment_condition.includes('WI-CX0059-fix')
    && workerKi.status === 'repaid'
    && workerKi.repaid_by === 'WI-CX0059-fix';
  checks.context_breadth_worker_evidence = JSON.stringify(topology.last_attempt?.observed_process_ids) === JSON.stringify([61312, 40280, 60288])
    && topology.last_attempt?.process_ids_confirmed_terminated === true
    && topology.last_attempt?.repayment_wi === 'WI-CX0059-fix';
  checks.context_breadth_boundary = ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && state.layer2_target?.remote_configured === false
    && state.hygiene?.context_bodies_carried === false
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('production dependency addition')
    && record.includes('public API or external contract change')
    && record.includes('first Layer 2 scaffold generation occurred')
    && record.includes('No destructive filesystem or git operation occurred');

  if (!checks.context_breadth_registration) error('context_breadth.registration_missing', 'Manifest and indexes must register the WI-CX0058 decision and evidence.');
  if (!checks.context_breadth_ledger) error('context_breadth.ledger_missing', 'WI-CX0058 must preserve its initial 76-entry metadata-only context evidence.');
  if (!checks.context_breadth_builder) error('context_breadth.builder_missing', 'Builder must implement exact references, exact specialized tags, limits, and fail-before-append ordering.');
  if (!checks.context_breadth_spec) error('context_breadth.spec_missing', 'Context pack v2 specification must document exact matching and deterministic limits.');
  if (!checks.context_breadth_decision) error('context_breadth.decision_missing', 'Decision must supersede broad token intersection and retain existing context contracts.');
  if (!checks.context_breadth_samples) error('context_breadth.samples_failed', 'Equivalent 76/120/123 cases and generic-token regression must satisfy v2 counts and rejection behavior.', sampleError);
  if (!checks.context_breadth_record) error('context_breadth.record_missing', 'WI-CX0058 record must capture regression, worker dogfood, strategy, and process cleanup evidence.');
  if (!checks.context_breadth_flow) error('context_breadth.flow_missing', 'Flow state must validate WI-CX0058 and advance to WI-CX0059.');
  if (!checks.context_breadth_known_issues) error('context_breadth.known_issues_missing', 'Context breadth must be repaid while worker process lifecycle remains a complete Medium KI.');
  if (!checks.context_breadth_worker_evidence) error('context_breadth.worker_evidence_missing', 'State must record bounded metadata about the worker process-lifecycle failure and cleanup.');
  if (!checks.context_breadth_boundary) error('context_breadth.boundary_missing', 'WI-CX0058 must preserve runner, target, publication, authority, dependency, API, and destructive-operation boundaries.');
}

function validateEphemeralWorkerProcessLifecycleGuard() {
  const decisionPath = 'docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md';
  const specPath = 'docs/specifications/ephemeral-worker-runner.md';
  const recordPath = 'docs/records/validation-wi-cx0059-fix.md';
  const proofRecordPath = 'docs/records/validation-wi-cx0060-test.md';
  const temporalRecordPath = 'docs/records/validation-wi-cx0061-fix.md';
  const decision = read(decisionPath);
  const spec = read(specPath);
  const record = read(recordPath);
  const proofRecord = read(proofRecordPath);
  const temporalRecord = read(temporalRecordPath);
  const autonomy = read('docs/policies/autonomy-and-approval.md');
  const managedProcess = read('scripts/lib/managed-process.mjs');
  const windowsJobRunner = read('scripts/windows-job-runner.ps1');
  const codexInvocation = read('scripts/lib/codex-invocation.mjs');
  const managedWorkerPolicy = read('docs/specifications/managed-worker-exec-policy.rules');
  const runner = read('scripts/run-ephemeral-worker.mjs');
  const localSmoke = read('scripts/smoke-ephemeral-worker-cli.mjs');
  const lifecycleTest = read('scripts/test-ephemeral-worker-lifecycle.mjs');
  const fixture = read('scripts/fixtures/managed-worker-tree.mjs');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsReadme = read('docs/decisions/README.md');
  const recordsReadme = read('docs/records/README.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const pkg = readJson('package.json');
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
  const wiContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0059-fix'
    && entry.timestamp === '2026-07-10T09:50:04.441Z');
  const temporalContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0061-fix'
    && entry.timestamp === '2026-07-10T10:52:06.771Z');
  const proofContextPackEntries = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0060-test'
    && entry.timestamp === '2026-07-10T17:32:49.743Z');
  const knownIssues = Array.isArray(state.known_issues) ? state.known_issues : [];
  const workerKi = knownIssues.find((item) => item.id === 'KI-CX-WORKER-001');
  const providerKi = knownIssues.find((item) => item.id === 'KI-CX-PROVIDER-001');
  const temporalKi = knownIssues.find((item) => item.id === 'KI-CX-WORKER-002');
  const reusedParentKi = knownIssues.find((item) => item.id === 'KI-CX-WORKER-004');
  const confinementKi = knownIssues.find((item) => item.id === 'KI-CX-WORKER-003');
  const dogfoodKi = knownIssues.find((item) => item.id === 'KI-CX-DOGFOOD-002');
  const reviewAvailabilityKi = knownIssues.find((item) => item.id === 'KI-CX-REVIEW-002');
  const topology = state.control_plane?.worker_topology ?? {};
  const guard = topology.managed_guard ?? {};
  const noProviderWorkaroundBoundary = '- No release, deployment, package publication, OSS submission, production dependency, public API or external contract change, A2/A3 authority expansion, destructive operation, or provider-policy workaround occurred.';
  const providerWorkaroundMentions = proofRecord.match(/provider-policy workaround occurred/g) ?? [];
  const reviewAttempts = state.control_plane?.independent_review?.last_local_review_attempts ?? [];
  const runnerConfigPath = 'C:\\Users\\User\\.codex\\automations\\fdp-codex-a2-worktree-wi-runner\\automation.toml';
  let liveRunnerStatus = 'not-present';
  if (existsSync(runnerConfigPath)) {
    const runnerConfig = readFileSync(runnerConfigPath, 'utf8');
    liveRunnerStatus = /^status\s*=\s*"PAUSED"\s*$/m.test(runnerConfig) ? 'paused' : 'not-paused';
  }

  let testResult = null;
  let testError = null;
  try {
    testResult = JSON.parse(execFileSync(process.execPath, ['scripts/test-ephemeral-worker-lifecycle.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    }));
  } catch (validationError) {
    testError = validationError.stderr?.toString().trim() || validationError.message;
  }

  checks.worker_lifecycle_registration = manifest.includes('id: decision.ephemeral-worker-process-lifecycle-guard')
    && manifest.includes(decisionPath)
    && manifest.includes('id: spec.ephemeral-worker-runner')
    && manifest.includes(specPath)
    && manifest.includes('id: spec.managed-worker-exec-design')
    && manifest.includes('id: tool.codex-invocation')
    && manifest.includes('id: tool.managed-process')
    && manifest.includes('id: tool.windows-job-runner')
    && manifest.includes('scripts/windows-job-runner.ps1')
    && docsIndex.includes('scripts/windows-job-runner.ps1')
    && manifest.includes('id: tool.run-ephemeral-worker')
    && manifest.includes('id: tool.smoke-ephemeral-worker-cli')
    && manifest.includes('id: tool.test-ephemeral-worker-lifecycle')
    && manifest.includes('id: fixture.managed-worker-tree')
    && manifest.includes('id: record.validation-wi-cx0059-fix')
    && manifest.includes(recordPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(specPath)
    && docsIndex.includes(recordPath)
    && decisionsReadme.includes(decisionPath)
    && recordsReadme.includes(recordPath);
  checks.worker_temporal_identity_registration = manifest.includes('id: record.validation-wi-cx0061-fix')
    && manifest.includes(temporalRecordPath)
    && docsIndex.includes(temporalRecordPath)
    && recordsReadme.includes(temporalRecordPath);
  checks.worker_proof_registration = manifest.includes('id: record.validation-wi-cx0060-test')
    && manifest.includes(proofRecordPath)
    && docsIndex.includes(proofRecordPath)
    && recordsReadme.includes(proofRecordPath);
  checks.worker_lifecycle_ledger = wiContextPackEntries.length === 17
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && wiContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && wiContextPackEntries.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry))
    && record.includes('17 metadata-only ledger entries')
    && record.includes('contains_chunk_bodies: false');
  checks.worker_temporal_identity_ledger = temporalContextPackEntries.length === 17
    && temporalContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && temporalContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && temporalContextPackEntries.some((entry) => entry.chunk_id === 'tool.managed-process')
    && temporalContextPackEntries.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry))
    && temporalRecord.includes('17 metadata-only entries')
    && temporalRecord.includes('contains_chunk_bodies: false');
  checks.worker_proof_ledger = proofContextPackEntries.length === 27
    && proofContextPackEntries.some((entry) => entry.chunk_id === 'root.agents')
    && proofContextPackEntries.some((entry) => entry.chunk_id === 'registry.manifest')
    && proofContextPackEntries.some((entry) => entry.chunk_id === 'tool.run-ephemeral-worker')
    && proofContextPackEntries.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry))
    && proofRecord.includes('27 metadata-only ledger entries')
    && proofRecord.includes('contains_chunk_bodies: false');
  checks.worker_lifecycle_supervisor = managedProcess.includes('Get-CimInstance Win32_Process')
    && managedProcess.includes('managedProcessPlatformSupport')
    && managedProcess.includes('DEFAULT_OBSERVATION_COMMAND_TIMEOUT_MS')
    && managedProcess.includes('const initialOutcome = await Promise.race')
    && managedProcess.includes('await stopRootWrapper()')
    && managedProcess.includes("mode: 'unsupported-fail-closed'")
    && managedProcess.indexOf('if (!platformSupport.supported)') < managedProcess.indexOf('const child = spawn(')
    && managedProcess.includes('started_at')
    && managedProcess.includes('process.kill(entry.pid, signal)')
    && managedProcess.includes("type: 'worker.timeout'")
    && managedProcess.includes("type: 'worker.interrupted'")
    && managedProcess.includes('worker.${streamName}')
    && managedProcess.includes('alive_after_cleanup')
    && managedProcess.includes('const confirmedGone = [...options.observed.keys()]')
    && managedProcess.includes('!mismatchPids.includes(pid)')
    && managedProcess.includes('shell: false')
    && managedProcess.includes('residual-processes-after-root-exit')
    && managedProcess.includes('const observationVerified = observationSucceeded')
    && managedProcess.includes('containment.verified');
  checks.worker_temporal_identity_implementation = managedProcess.includes('function isNotOlderThan(candidate, ancestor)')
    && managedProcess.includes('candidateStartedAt >= ancestorStartedAt')
    && managedProcess.includes('const belongsToObservedParent = parentPids.has(entry.ppid)')
    && managedProcess.includes('currentParent !== undefined')
    && managedProcess.includes('isNotOlderThan(entry, observedRoot)')
    && lifecycleTest.includes('function runTemporalIdentityCase()')
    && lifecycleTest.includes('assert.equal(observed.has(50001), false)')
    && lifecycleTest.includes('assert.equal(observed.has(50002), true)')
    && lifecycleTest.includes('assert.equal(observed.has(50003), true)')
    && managedProcess.includes('sameIdentity(parent, currentParent)')
    && managedProcess.includes("containmentMode: 'windows-job-object'")
    && managedProcess.includes('containment.drained')
    && windowsJobRunner.includes('CREATE_SUSPENDED')
    && windowsJobRunner.includes('JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE')
    && windowsJobRunner.includes('PROC_THREAD_ATTRIBUTE_JOB_LIST')
    && windowsJobRunner.includes('EXTENDED_STARTUPINFO_PRESENT')
    && windowsJobRunner.includes('InitializeProcThreadAttributeList')
    && windowsJobRunner.includes('UpdateProcThreadAttribute')
    && !windowsJobRunner.includes('AssignProcessToJobObject')
    && windowsJobRunner.includes('FDP_JOB_RUNNER_ATOMIC_CHILD:')
    && windowsJobRunner.includes('FDP_JOB_RUNNER_DRAINED')
    && lifecycleTest.includes('reused_parent_identity_excluded: true');
  checks.worker_lifecycle_runner = runner.includes("const ALLOWED_SANDBOXES = new Set(['read-only', 'workspace-write'])")
    && runner.includes('buildEphemeralWorkerArgs')
    && runner.includes('stdinText: prompt')
    && runner.includes('prompt must be piped through stdin')
    && runner.includes('AbortController')
    && !runner.includes('danger-full-access')
    && codexInvocation.includes('CODEX_CLI_PATH')
    && codexInvocation.includes("'@openai'")
    && codexInvocation.includes("'exec'")
    && codexInvocation.includes("'--ephemeral'")
    && codexInvocation.includes("'--json'")
    && codexInvocation.includes("'--disable', 'multi_agent'")
    && codexInvocation.includes("'--sandbox'")
    && codexInvocation.includes("'-'")
    && !codexInvocation.includes('execpolicy')
    && !runner.includes('verifyManagedWorkerExecPolicy')
    && !runner.includes('worker.exec_policy_verified')
    && managedWorkerPolicy.includes('Design fixture only. Codex does not auto-load this path')
    && !existsSync(path.join(repoRoot, '.codex', 'rules', 'fdp-managed-worker.rules'))
    && localSmoke.includes('buildEphemeralWorkerArgs')
    && localSmoke.includes('workerArgs.slice(0, -1)')
    && localSmoke.includes("'--help'")
    && !localSmoke.includes('execpolicy')
    && !localSmoke.includes("'exec', '--help'");
  checks.worker_lifecycle_tests = testError === null
    && testResult?.ok === true
    && testResult?.cases?.builtin_fanout_flag?.multi_agent_disabled === true
    && testResult?.cases?.platform_support?.windows === 'supported'
    && testResult?.cases?.platform_support?.posix === 'unsupported-fail-closed'
    && testResult?.cases?.temporal_identity?.stale_excluded === true
    && testResult?.cases?.temporal_identity?.reused_parent_identity_excluded === true
    && testResult?.cases?.temporal_identity?.descendant_count === 2
    && (process.platform === 'win32'
      ? (testResult?.cases?.windows_lifecycle?.normal?.status === 'completed'
        && testResult?.cases?.windows_lifecycle?.normal?.stdout_line_count === 1
        && testResult?.cases?.windows_lifecycle?.normal?.stderr_line_count === 1
        && testResult?.cases?.windows_lifecycle?.timeout?.status === 'timed_out'
        && testResult?.cases?.windows_lifecycle?.timeout?.observed_descendant_count >= 2
        && testResult?.cases?.windows_lifecycle?.timeout?.cleanup_verified === true
        && testResult?.cases?.windows_lifecycle?.timeout?.cleanup_partition_verified === true
        && testResult?.cases?.windows_lifecycle?.interruption?.status === 'interrupted'
        && testResult?.cases?.windows_lifecycle?.interruption?.observed_descendant_count >= 2
        && testResult?.cases?.windows_lifecycle?.interruption?.cleanup_verified === true
        && testResult?.cases?.windows_lifecycle?.interruption?.cleanup_partition_verified === true
        && testResult?.cases?.windows_lifecycle?.orphan_containment?.containment_mode === 'windows-job-object'
        && testResult?.cases?.windows_lifecycle?.orphan_containment?.containment_verified === true
        && testResult?.cases?.windows_lifecycle?.atomic_wrapper_kill?.status === 'containment_failed'
        && testResult?.cases?.windows_lifecycle?.atomic_wrapper_kill?.wrapper_pid > 0
        && testResult?.cases?.windows_lifecycle?.atomic_wrapper_kill?.atomic_child_pid > 0
        && testResult?.cases?.windows_lifecycle?.atomic_wrapper_kill?.containment_assigned === true
        && testResult?.cases?.windows_lifecycle?.atomic_wrapper_kill?.containment_verified === false
        && testResult?.cases?.windows_lifecycle?.observation_hang_timeout?.status === 'cleanup_failed'
        && testResult?.cases?.windows_lifecycle?.observation_hang_timeout?.elapsed_ms < 5000
        && testResult?.cases?.windows_lifecycle?.observation_hang_timeout?.timed_out === true
        && testResult?.cases?.windows_lifecycle?.observation_hang_timeout?.atomic_child_pid > 0
        && testResult?.cases?.windows_lifecycle?.observation_hang_timeout?.cleanup_partition_verified === true
        && testResult?.cases?.windows_lifecycle?.observation_hang_interruption?.status === 'cleanup_failed'
        && testResult?.cases?.windows_lifecycle?.observation_hang_interruption?.elapsed_ms < 5000
        && testResult?.cases?.windows_lifecycle?.observation_hang_interruption?.interrupted === true
        && testResult?.cases?.windows_lifecycle?.observation_hang_interruption?.atomic_child_pid > 0
        && testResult?.cases?.windows_lifecycle?.observation_hang_interruption?.cleanup_partition_verified === true
        && testResult?.cases?.windows_lifecycle?.fast_parent_exit?.status === 'completed'
        && testResult?.cases?.windows_lifecycle?.fast_parent_exit?.containment_mode === 'windows-job-object'
        && testResult?.cases?.windows_lifecycle?.fast_parent_exit?.containment_verified === true)
      : (testResult?.cases?.unsupported_platform?.status === 'unsupported_platform'
        && testResult?.cases?.unsupported_platform?.containment_mode === 'unsupported-fail-closed'
        && testResult?.cases?.windows_lifecycle === null))
    && lifecycleTest.includes("fixturePath, 'fast-orphan-root'")
    && lifecycleTest.includes("assert.equal(result.status, 'unsupported_platform')")
    && lifecycleTest.includes('FDP_JOB_TEST_PAUSE_AFTER_ATOMIC_CREATE')
    && lifecycleTest.includes('FDP_JOB_TEST_OBSERVATION_DELAY_MS')
    && lifecycleTest.includes('function runObservationHangInterruptionCase()')
    && lifecycleTest.includes('function assertObservedCleanupPartition(result)')
    && lifecycleTest.includes("assert.equal(isProcessAlive(confirmedAtomicChildPid), false)")
    && lifecycleTest.includes("assert.equal(isProcessAlive(result.containment.atomic_child_pid), false)")
    && lifecycleTest.includes('containment.verified')
    && fixture.includes("mode === 'grandchild'")
    && fixture.includes("mode === 'fast-orphan-root'");
  checks.worker_lifecycle_package = pkg.scripts?.['worker:run'] === 'node scripts/run-ephemeral-worker.mjs'
    && pkg.scripts?.['worker:smoke-local'] === 'node scripts/smoke-ephemeral-worker-cli.mjs'
    && pkg.scripts?.['worker:test'] === 'node scripts/test-ephemeral-worker-lifecycle.mjs'
    && pkg.dependencies === undefined;
  checks.worker_lifecycle_policy = autonomy.includes('### Ephemeral Worker Process Lifecycle')
    && autonomy.includes('must run through `scripts/run-ephemeral-worker.mjs`')
    && autonomy.includes('stops the exact wrapper first so Job-handle close terminates all atomically assigned members')
    && autonomy.includes('Targeted residual cleanup after a normal root exit signals deepest observed descendants before parents')
    && autonomy.includes('An observation, containment, or cleanup result that cannot be verified is a failure')
    && autonomy.includes('kill-on-close Job Object')
    && autonomy.includes('fail closed before spawning a worker')
    && autonomy.includes('assigned at creation through `STARTUPINFOEX` and `PROC_THREAD_ATTRIBUTE_JOB_LIST`')
    && autonomy.includes('armed before the first process observation')
    && autonomy.includes('each process-table command must have its own timeout')
    && autonomy.includes('passed through stdin')
    && autonomy.includes('must not create persistent Codex app tasks')
    && autonomy.includes('Live model execution remains subject to the active data and network approval boundary');
  checks.worker_lifecycle_decision = decision.includes('Status: accepted-v0')
    && decision.includes('codex exec --ephemeral --json')
    && decision.includes('default timeout is 120 seconds')
    && decision.includes('pids, parent pids, executable names, and start times')
    && decision.includes('kill-on-close Job Object')
    && decision.includes('Other platforms fail closed before spawning')
    && decision.includes('assigns the suspended worker to the Job Object atomically')
    && decision.includes('armed before the first process-table query')
    && decision.includes('each query has its own finite timeout')
    && decision.includes('the exact wrapper is stopped first')
    && decision.includes('targeted residual cleanup after normal root exit signals deepest observed descendants before parents')
    && decision.includes('cleanup that cannot be observed or verified is a failure')
    && decision.includes('repay KI-CX-WORKER-001')
    && decision.includes('KI-CX-PROVIDER-001 records that separate provider trust boundary');
  checks.worker_lifecycle_spec = spec.includes('Status: implemented-v1')
    && spec.includes('prompt is required on stdin')
    && spec.includes('danger-full-access` is not accepted')
    && spec.includes('worker.result')
    && spec.includes('pid reuse')
    && spec.includes('Exit codes are 0')
    && spec.includes('124 for timeout')
    && spec.includes('130 for interruption')
    && spec.includes('npm run worker:test')
    && spec.includes('npm run worker:smoke-local')
    && spec.includes('## Agent Confinement')
    && spec.includes('blocks built-in collaboration fan-out')
    && spec.includes('not a runtime command boundary')
    && spec.includes('Project-local `.codex/rules` cannot supply a worker-only fix')
    && spec.includes('non-active design fixture')
    && spec.includes('command re-entry confinement as an open KI')
    && spec.includes('Windows Job Object')
    && spec.includes('zero-active-process drain marker')
    && spec.includes('Unsupported platforms return an `unsupported_platform` result before spawning a worker')
    && spec.includes('assigned to the kill-on-close Job Object atomically at process creation')
    && spec.includes('armed before the first query')
    && spec.includes('every query has a separate finite command timeout')
    && spec.includes('visible controller');
  checks.worker_temporal_identity_spec = spec.includes('earlier than its observed parent or root')
    && spec.includes('rejected as stale parent-pid metadata');
  checks.worker_lifecycle_record = record.includes('Status: validated')
    && record.includes('PSC: P1')
    && record.includes('WTC: AUTO')
    && record.includes('Risk: R2')
    && record.includes('ESC: E1+E3+E5+E6')
    && record.includes('root exit with observed residual descendants triggered verified cleanup')
    && record.includes('root pid 49612 completed with exit code 0')
    && record.includes('rejected before execution')
    && record.includes('Codex did not bypass either rejection')
    && record.includes('The user then explicitly approved that stated transmission risk')
    && record.includes('KI-CX-WORKER-001 is repaid by this WI')
    && record.includes('KI-CX-PROVIDER-001 now owns the separate external-provider trust boundary');
  checks.worker_lifecycle_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && fixPlan.includes('WI-CX0060-test Trusted Ephemeral Worker End-to-End Proof')
    && state.current_priority?.wi_id === 'WI-CX0060-test'
    && ['blocked-external', 'blocked-user-approval', 'validated-awaiting-publication'].includes(state.current_priority?.state)
    && state.current_priority?.lock_blocker === 'yes';
  checks.worker_lifecycle_state = [
    'managed-guard-validated-provider-smoke-policy-blocked',
    'managed-guard-temporal-identity-validated-provider-smoke-policy-blocked',
    'managed-guard-confined-public-preflight-passed-dogfood-approval-blocked',
    'managed-guard-builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked',
  ].includes(topology.runtime_status)
    && [
      'validated-provider-smoke-policy-blocked',
      'validated-temporal-identity-provider-smoke-policy-blocked',
      'confined-public-preflight-passed-dogfood-approval-blocked',
      'builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked',
    ].includes(guard.status)
    && guard.supervisor === 'scripts/run-ephemeral-worker.mjs'
    && guard.default_timeout_ms === 120000
    && JSON.stringify(guard.allowed_sandboxes) === JSON.stringify(['read-only', 'workspace-write'])
    && guard.prompt_transport === 'stdin'
    && String(guard.deterministic_cases?.normal).startsWith('passed')
    && String(guard.deterministic_cases?.timeout_descendant_cleanup).startsWith('passed')
    && String(guard.deterministic_cases?.interruption_descendant_cleanup).startsWith('passed')
    && String(guard.deterministic_cases?.residual_after_root_exit_cleanup).startsWith('passed')
    && guard.containment?.windows === 'job-object-atomic-create-kill-on-close'
    && guard.containment?.posix === 'unsupported-fail-closed-before-spawn'
    && String(guard.deterministic_cases?.posix_platform_guard).startsWith('static-contract-passed')
    && guard.containment?.normal_completion_requires_verified_drain === true
    && String(guard.deterministic_cases?.windows_fast_parent_exit_containment).startsWith('passed')
    && String(guard.deterministic_cases?.windows_atomic_wrapper_kill_containment).startsWith('passed')
    && String(guard.deterministic_cases?.windows_observation_hang_timeout).startsWith('passed')
    && String(guard.deterministic_cases?.windows_observation_hang_interruption).startsWith('passed')
    && guard.local_cli_smoke?.result === 'passed-no-model-request'
    && guard.local_cli_smoke?.observation_verified === true
    && guard.local_cli_smoke?.containment_mode === 'windows-job-object'
    && guard.local_cli_smoke?.containment_verified === true
    && (guard.live_model_smoke?.result === 'policy-rejected-after-user-approval'
      || guard.live_model_smoke?.public_repository_preflight?.result === 'passed');
  checks.worker_temporal_identity_record = temporalRecord.includes('Status: validated')
    && temporalRecord.includes('PSC: P1')
    && temporalRecord.includes('WTC: AUTO')
    && temporalRecord.includes('Risk: R2')
    && temporalRecord.includes('ESC: E1+E3+E5+E6')
    && temporalRecord.includes('intermittently reported `residual_processes`')
    && temporalRecord.includes('Five consecutive full lifecycle runs passed')
    && temporalRecord.includes('KI-CX-WORKER-002 Windows stale parent-pid descendant false positive');
  checks.worker_temporal_identity_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && hasActiveWiStatus(currentWi)
    && handoff.includes('WI-CX0061 rejects candidates that started before their observed parent')
    && /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && state.current_priority?.wi_id === 'WI-CX0060-test'
    && ['blocked-external', 'blocked-user-approval', 'validated-awaiting-publication'].includes(state.current_priority?.state);
  checks.worker_temporal_identity_state = [
    'managed-guard-temporal-identity-validated-provider-smoke-policy-blocked',
    'managed-guard-confined-public-preflight-passed-dogfood-approval-blocked',
    'managed-guard-builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked',
  ].includes(topology.runtime_status)
    && [
      'validated-temporal-identity-provider-smoke-policy-blocked',
      'confined-public-preflight-passed-dogfood-approval-blocked',
      'builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked',
    ].includes(guard.status)
    && guard.deterministic_cases?.temporal_stale_parent_pid_exclusion === 'passed-repeated-5'
    && guard.deterministic_cases?.parent_pid_reuse_identity_exclusion === 'passed-repeated-5'
    && guard.deterministic_cases?.normal === 'passed-repeated-5'
    && guard.deterministic_cases?.timeout_descendant_cleanup === 'passed-repeated-5'
    && guard.deterministic_cases?.interruption_descendant_cleanup === 'passed-repeated-5'
    && guard.deterministic_cases?.residual_after_root_exit_cleanup === 'passed-repeated-5'
    && guard.post_merge_validation?.trigger_commit === 'b905fc6cd0db825dcf91edbaa19688ba2a0d44ec'
    && guard.post_merge_validation?.repayment_wi === 'WI-CX0061-fix';
  checks.worker_lifecycle_known_issue = workerKi?.status === 'repaid'
    && workerKi.severity === 'Medium'
    && workerKi.owner === 'CODEX'
    && workerKi.repaid_by === 'WI-CX0059-fix'
    && workerKi.decision_ref === decisionPath
    && workerKi.evidence === recordPath
    && providerKi?.status === 'open'
    && providerKi.severity === 'Medium'
    && providerKi.owner.includes('H1')
    && providerKi.trigger.includes('explicit user approval')
    && providerKi.repayment_condition.includes('trusted model destination')
    && providerKi.hard_stop.includes('dogfood continuation');
  checks.worker_temporal_identity_known_issue = temporalKi?.status === 'repaid'
    && temporalKi.severity === 'High'
    && temporalKi.owner === 'CODEX'
    && temporalKi.repaid_by === 'WI-CX0061-fix'
    && temporalKi.trigger.includes('stale Windows parent-pid metadata')
    && temporalKi.repayment_condition.includes('temporal descendant filtering')
    && temporalKi.hard_stop.includes('before dogfood continuation')
    && temporalKi.evidence === temporalRecordPath;
  checks.worker_reused_parent_known_issue = reusedParentKi?.status === 'open'
    && reusedParentKi.severity === 'High'
    && reusedParentKi.owner === 'CODEX'
    && reusedParentKi.github_issue_number === 64
    && reusedParentKi.trigger.includes('parent PID reuse')
    && reusedParentKi.trigger.includes('detached child')
    && reusedParentKi.trigger.includes('unbounded process-table observation')
    && reusedParentKi.trigger.includes('creation-to-assignment window')
    && reusedParentKi.repayment_condition.includes('Windows Job Object containment')
    && reusedParentKi.repayment_condition.includes('atomic wrapper-kill containment')
    && reusedParentKi.repayment_condition.includes('observer-hang finite timeout')
    && reusedParentKi.repayment_condition.includes('post-merge control-plane audit')
    && reusedParentKi.hard_stop.includes('before post-merge WI closeout')
    && reusedParentKi.evidence === proofRecordPath;
  checks.worker_lifecycle_boundary = ['not-present', 'paused'].includes(liveRunnerStatus)
    && ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && state.layer2_target?.remote_configured === false
    && state.hygiene?.context_bodies_carried === false
    && record.includes('The Layer 2 target was not touched')
    && record.includes('No release publication, deployment, package publication, OSS program submission')
    && record.includes('No production dependency addition, public API or external contract change occurred')
    && record.includes('No destructive filesystem or git operation occurred');
  checks.worker_lifecycle_live_runner_status = liveRunnerStatus;
  checks.worker_temporal_identity_boundary = ['not-present', 'paused'].includes(liveRunnerStatus)
    && ['PAUSED', 'RETIRED'].includes(state.control_plane?.automation?.status)
    && state.layer2_target?.remote_configured === false
    && temporalRecord.includes('The Layer 2 target was not touched')
    && temporalRecord.includes('No live model smoke or provider-policy workaround was attempted')
    && temporalRecord.includes('No destructive filesystem or git operation occurred');
  checks.worker_proof_implementation = codexInvocation.includes('export function buildEphemeralWorkerArgs')
    && codexInvocation.includes("'--disable', 'multi_agent'")
    && lifecycleTest.includes('function runBuiltinFanoutFlagCase()')
    && lifecycleTest.includes('function runPlatformSupportCase()')
    && lifecycleTest.includes('multi_agent_disabled: true')
    && !lifecycleTest.includes('runExecPolicyContractCase')
    && !codexInvocation.includes('forbiddenReentryCases')
    && !codexInvocation.includes('verifyManagedWorkerExecPolicy')
    && managedWorkerPolicy.includes('Design fixture only. Codex does not auto-load this path')
    && !existsSync(path.join(repoRoot, '.codex', 'rules', 'fdp-managed-worker.rules'))
    && testResult?.cases?.builtin_fanout_flag?.multi_agent_disabled === true
    && testResult?.cases?.platform_support?.posix === 'unsupported-fail-closed';
  checks.worker_proof_record = proofRecord.includes('Status: blocked-external')
    && proofRecord.includes('PSC: P1')
    && proofRecord.includes('WTC: AUTO')
    && proofRecord.includes('Risk: R2')
    && proofRecord.includes('ESC: E1+E2+E3+E5+E6')
    && proofRecord.includes('FDP_CODEX_PROVIDER_TRUST_SMOKE_OK')
    && proofRecord.includes('alive_after_cleanup: []')
    && proofRecord.includes('even with explicit user approval')
    && proofRecord.includes('019f4dc3-db87-7043-b699-b1d1c4145217')
    && proofRecord.includes('fresh controller session loaded the project rule')
    && proofRecord.includes('removed the active rule')
    && proofRecord.includes('non-active design fixture')
    && proofRecord.includes('kill-on-close Job Object')
    && proofRecord.includes('fresh final-head reviewer');
  checks.worker_proof_flow = currentWi.includes('WI id: WI-CX0060-test')
    && currentWi.includes('Status: blocked-external')
    && currentWi.includes('ESC: E1+E2+E3+E5+E6')
    && fixPlan.includes('land a truthful `blocked-external` evidence checkpoint, not a completed proof')
    && fixPlan.includes('policy-rejected even after current explicit user approval')
    && currentWi.includes('that merge does not complete the live proof or repay Issues #55 and #61')
    && proofRecord.includes('land through the normal supervised PR lifecycle as a non-completion checkpoint')
    && handoff.includes('Current WI: WI-CX0060-test Trusted Ephemeral Worker End-to-End Proof')
    && handoff.includes('land it as a non-completion checkpoint')
    && state.current_wi?.id === 'WI-CX0060-test'
    && state.current_wi?.status === 'blocked-external'
    && state.current_priority?.state === 'blocked-external'
    && state.current_priority?.owner_gate === 'H1';
  checks.worker_proof_state = topology.runtime_status === 'managed-guard-builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked'
    && guard.status === 'builtin-fanout-disabled-command-reentry-open-provider-smoke-policy-blocked'
    && guard.nested_agent_confinement?.status === 'builtin-fanout-disabled-command-reentry-unenforced'
    && guard.nested_agent_confinement?.cli_flag === '--disable multi_agent'
    && guard.nested_agent_confinement?.deterministic_test === 'builtin-fanout-flag-passed'
    && guard.nested_agent_confinement?.command_reentry?.runtime_enforced === false
    && guard.nested_agent_confinement?.command_reentry?.active_project_rule === false
    && guard.nested_agent_confinement?.command_reentry?.design_fixture === 'docs/specifications/managed-worker-exec-policy.rules'
    && guard.nested_agent_confinement?.command_reentry?.controller_validation_owner === 'visible-controller'
    && guard.live_model_smoke?.public_repository_preflight?.result === 'passed'
    && guard.live_model_smoke?.layer2_dogfood_first_attempt?.result === 'timed-out-after-target-validation'
    && guard.live_model_smoke?.layer2_dogfood_first_attempt?.cleanup_verified === true
    && JSON.stringify(guard.live_model_smoke?.layer2_dogfood_first_attempt?.alive_after_cleanup) === '[]'
    && guard.live_model_smoke?.post_fix_retry?.result === 'policy-rejected-after-current-explicit-user-approval'
    && guard.live_model_smoke?.post_fix_retry?.user_approval_recorded === true;
  checks.worker_proof_known_issues = confinementKi?.severity === 'High'
    && confinementKi?.owner === 'CODEX'
    && confinementKi?.status === 'open'
    && confinementKi?.github_issue_number === 61
    && confinementKi?.hard_stop.includes('before completing WI-CX0060-test')
    && confinementKi?.defer_reason.includes('provider Issue #55')
    && confinementKi?.repayment_condition.includes('repository-backed read-only dogfood run')
    && dogfoodKi?.severity === 'High'
    && dogfoodKi?.owner === 'CODEX'
    && dogfoodKi?.status === 'open'
    && dogfoodKi?.github_issue_number === 62
    && dogfoodKi?.hard_stop.includes('before claiming target operating state is current')
    && state.layer2_target?.observed_inconsistency?.layer1_ki === 'KI-CX-DOGFOOD-002'
    && state.layer2_target?.observed_inconsistency?.github_issue_number === 62
    && reviewAvailabilityKi?.severity === 'High'
    && reviewAvailabilityKi?.owner.includes('execution platform')
    && reviewAvailabilityKi?.status === 'open'
    && reviewAvailabilityKi?.github_issue_number === 63
    && reviewAvailabilityKi?.hard_stop.includes('before marking WI-CX0060 validated')
    && reviewAvailabilityKi?.trigger.includes('7696fbb')
    && reviewAvailabilityKi?.trigger.includes('c86b9f0')
    && reviewAvailabilityKi?.trigger.includes('71576c0')
    && reviewAvailabilityKi?.defer_reason.includes('each remediated head requires a fresh review generation')
    && reviewAvailabilityKi?.repayment_condition.includes('PASS with no unresolved P0, P1, or P2 finding')
    && state.control_plane?.independent_review?.availability_issue === 63
    && reviewAttempts.some((attempt) => attempt.agent_id === '019f4d43-2090-7711-ae34-05aaa264bf22' && attempt.result.includes('no-verdict'))
    && reviewAttempts.some((attempt) => attempt.agent_id === '019f4d6b-f84f-7c30-b759-038b6183cf70' && attempt.reviewed_head === 'b63bbca2552d6fe071812c279143a046683d0ac1' && attempt.result.includes('fail-two-p2'))
    && reviewAttempts.some((attempt) => attempt.agent_id === '019f4d78-ea57-73d1-9843-dd2d473cea12' && attempt.reviewed_head === '7696fbb' && attempt.result.includes('github-drift'))
    && reviewAttempts.some((attempt) => attempt.agent_id === '019f4d85-063e-7a10-a5a2-8584e247de8c' && attempt.reviewed_head === 'c86b9f036e823986d78d825c97408b70dcd444b1' && attempt.result.includes('shell-reentry'))
    && reviewAttempts.some((attempt) => attempt.agent_id === '019f4db0-018f-7db1-b8e4-81c8e1aa92fc' && attempt.reviewed_head === '71576c01ca9a1db1fb59031c01a398bb13e9cba8' && attempt.result.includes('package-script'));
  checks.worker_proof_boundary = ['not-present', 'paused'].includes(liveRunnerStatus)
    && state.control_plane?.automation?.status === 'RETIRED'
    && state.layer2_target?.remote_configured === false
    && proofRecord.includes('The dogfood target was not edited')
    && proofRecord.includes('No target branch, commit, remote, push, or PR was created')
    && proofRecord.includes('No release publication, deployment, package publication, OSS program submission')
    && hasSingleExactClaim(proofRecord, noProviderWorkaroundBoundary, 'provider-policy workaround occurred');
  checks.worker_proof_boundary_false_positive_guard = !hasSingleExactClaim(
    'A provider-policy workaround occurred.',
    noProviderWorkaroundBoundary,
    'provider-policy workaround occurred',
  ) && !hasSingleExactClaim(
    `${noProviderWorkaroundBoundary}\nA provider-policy workaround occurred.`,
    noProviderWorkaroundBoundary,
    'provider-policy workaround occurred',
  ) && providerWorkaroundMentions.length === 1;

  if (!checks.worker_lifecycle_registration) error('worker_lifecycle.registration_missing', 'Manifest and indexes must register the WI-CX0059 decision, specification, tools, fixture, and record.');
  if (!checks.worker_lifecycle_ledger) error('worker_lifecycle.ledger_missing', 'WI-CX0059 must retain its 17-entry metadata-only fresh context evidence.');
  if (!checks.worker_lifecycle_supervisor) error('worker_lifecycle.supervisor_missing', 'Managed process supervisor must observe identities, stream events, clean descendants, and fail closed.');
  if (!checks.worker_lifecycle_runner) error('worker_lifecycle.runner_missing', 'Worker runner must use the fixed ephemeral JSONL surface, stdin prompt, bounded sandboxes, and interruption handling.');
  if (!checks.worker_lifecycle_tests) error('worker_lifecycle.tests_failed', 'Normal, timeout, and interruption process-tree cases must pass with verified cleanup.', testError);
  if (!checks.worker_lifecycle_package) error('worker_lifecycle.package_missing', 'Package scripts must expose run, local smoke, and lifecycle tests without a production dependency.');
  if (!checks.worker_lifecycle_policy) error('worker_lifecycle.policy_missing', 'Autonomy policy must require the managed worker process lifecycle and data boundary.');
  if (!checks.worker_lifecycle_decision) error('worker_lifecycle.decision_missing', 'Decision must lock timeout, observability, identity, cleanup, and live-smoke repayment.');
  if (!checks.worker_lifecycle_spec) error('worker_lifecycle.spec_missing', 'Specification must define CLI input, events, process tracking, cleanup, exit codes, and local verification.');
  if (!checks.worker_lifecycle_record) error('worker_lifecycle.record_missing', 'WI-CX0059 record must capture strategy, local proofs, approval rejection, and remaining KI gate.');
  if (!checks.worker_lifecycle_flow) error('worker_lifecycle.flow_missing', 'Flow state must expose WI-CX0059 as verification-blocked on explicit user approval.');
  if (!checks.worker_lifecycle_state) error('worker_lifecycle.state_missing', 'Machine state must expose local guard results and the rejected-before-execution live smoke.');
  if (!checks.worker_lifecycle_known_issue) error('worker_lifecycle.known_issue_missing', 'WI-CX0059 must repay the process KI while retaining the separate provider-trust KI and hard stops.');
  if (!checks.worker_reused_parent_known_issue) error('worker_lifecycle.reused_parent_ki_missing', 'WI-CX0060 must record and repay the Windows reused-parent false-descendant KI with Issue #64 evidence.');
  if (!checks.worker_lifecycle_boundary) error('worker_lifecycle.boundary_missing', 'WI-CX0059 must preserve runner, target, publication, authority, dependency, API, and destructive-operation boundaries.', liveRunnerStatus);
  if (!checks.worker_temporal_identity_registration) error('worker_temporal_identity.registration_missing', 'Manifest and indexes must register the WI-CX0061 validation record.');
  if (!checks.worker_temporal_identity_ledger) error('worker_temporal_identity.ledger_missing', 'WI-CX0061 must retain its 17-entry metadata-only fresh context evidence.');
  if (!checks.worker_temporal_identity_implementation) error('worker_temporal_identity.implementation_missing', 'Descendant discovery must reject candidates older than the observed parent or process-group root and retain deterministic coverage.');
  if (!checks.worker_temporal_identity_spec) error('worker_temporal_identity.spec_missing', 'Worker specification must define stale parent-pid temporal filtering.');
  if (!checks.worker_temporal_identity_record) error('worker_temporal_identity.record_missing', 'WI-CX0061 record must capture the post-merge trigger, strategy, repeated proof, KI repayment, and boundaries.');
  if (!checks.worker_temporal_identity_flow) error('worker_temporal_identity.flow_missing', 'Flow state must expose validated WI-CX0061 and retain the blocked provider proof as next priority.');
  if (!checks.worker_temporal_identity_state) error('worker_temporal_identity.state_missing', 'Machine state must expose the repeated temporal identity result and post-merge trigger commit.');
  if (!checks.worker_temporal_identity_known_issue) error('worker_temporal_identity.known_issue_missing', 'KI-CX-WORKER-002 must record severity, ownership, repayment, evidence, and hard stop.');
  if (!checks.worker_temporal_identity_boundary) error('worker_temporal_identity.boundary_missing', 'WI-CX0061 must preserve runner, target, provider, publication, and destructive-operation boundaries.', liveRunnerStatus);
  if (!checks.worker_proof_registration) error('worker_proof.registration_missing', 'Manifest and indexes must register the WI-CX0060 validation record.');
  if (!checks.worker_proof_ledger) error('worker_proof.ledger_missing', 'WI-CX0060 must retain exactly 27 metadata-only fresh-context entries.');
  if (!checks.worker_proof_implementation) error('worker_proof.confinement_missing', 'Managed workers must disable nested multi-agent collaboration and retain deterministic argument coverage.');
  if (!checks.worker_proof_record) error('worker_proof.record_missing', 'WI-CX0060 must record the public preflight, first dogfood failure, cleanup, KIs, and approval gate.');
  if (!checks.worker_proof_flow) error('worker_proof.flow_missing', 'Flow state must expose WI-CX0060 as externally blocked after explicit user approval was insufficient.');
  if (!checks.worker_proof_state) error('worker_proof.state_missing', 'Machine state must expose preflight success, dogfood timeout cleanup, confinement, and the rejected retry.');
  if (!checks.worker_proof_known_issues) error('worker_proof.known_issues_missing', 'Issues #61 and #62 must preserve complete High KI fields and the qualified target finding.');
  if (!checks.worker_proof_boundary) error('worker_proof.boundary_missing', 'WI-CX0060 must keep the target read-only and preserve runner, publication, authority, dependency, API, and destructive-operation boundaries.');
  if (!checks.worker_proof_boundary_false_positive_guard) error('worker_proof.boundary_false_positive', 'Provider-workaround boundary evidence must reject positive or contradictory claims.');
}

function validateControlPlaneOperationalIntegrity() {
  const decisionPath = 'docs/decisions/2026-07-10-control-plane-operational-integrity.md';
  const recordPath = 'docs/records/validation-wi-cx0062-fix.md';
  const auditPath = 'scripts/audit-control-plane.mjs';
  const decision = read(decisionPath);
  const record = read(recordPath);
  const audit = read(auditPath);
  const agents = read('AGENTS.md');
  const autonomy = read('docs/policies/autonomy-and-approval.md');
  const gitPolicy = read('docs/policies/git-workflow.md');
  const issuePolicy = read('docs/policies/github-issue-governance.md');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const pkg = readJson('package.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsIndex = read('docs/decisions/README.md');
  const recordsIndex = read('docs/records/README.md');
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const wiLedger = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0062-fix'
    && entry.timestamp === '2026-07-10T13:19:43.723Z');
  const issues = Array.isArray(state.known_issues) ? state.known_issues : [];
  const issueNumbers = issues.map((item) => item.github_issue_number).sort((a, b) => a - b);
  const expectedHistoricalIssueNumbers = Array.from({ length: 11 }, (_, index) => index + 46);
  const control = issues.find((item) => item.id === 'KI-CX-CONTROL-001');
  const provider = issues.find((item) => item.id === 'KI-CX-PROVIDER-001');
  const integrity = state.control_plane?.operational_integrity ?? {};

  checks.control_integrity_registration = manifest.includes('id: decision.control-plane-operational-integrity')
    && manifest.includes(decisionPath)
    && manifest.includes('id: tool.audit-control-plane')
    && manifest.includes(auditPath)
    && manifest.includes('id: record.validation-wi-cx0062-fix')
    && manifest.includes(recordPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(recordPath)
    && docsIndex.includes(auditPath)
    && decisionsIndex.includes(decisionPath)
    && recordsIndex.includes(recordPath);
  checks.control_integrity_final_report_contract = agents.includes('for final user-facing reports only')
    && agents.includes('Interim working updates should stay concise')
    && agents.includes('`최종 완성 목표`')
    && agents.includes('`진행상황 및 현재 상태`')
    && agents.includes('`다음 할 일`')
    && agents.includes('accumulated project-level outcome');
  checks.control_integrity_policy = agents.includes('## Control-Plane Integrity')
    && agents.includes('one visible controller task')
    && agents.includes('Every KI in this public repository must have a linked GitHub Issue')
    && issuePolicy.includes('every new KI must have a GitHub Issue before a related public PR merges')
    && issuePolicy.includes('Historical backfill must say explicitly')
    && gitPolicy.includes('## Post-Merge Closeout')
    && gitPolicy.includes('re-query the Codex app task surface')
    && gitPolicy.includes('--expect-control-closed')
    && autonomy.includes('## Retired Worktree Cron Boundary')
    && autonomy.includes('Do not recreate or reactivate a task-spawning worktree cron');
  checks.control_integrity_decision = decision.includes('Status: accepted-v0')
    && decision.includes('live control-plane state as a first-class verification surface')
    && decision.includes('Historical backfill is explicitly marked as backfill')
    && decision.includes('one visible controller plus bounded workers')
    && decision.includes('repository script has no app-task API')
    && decision.includes('--expect-control-closed')
    && decision.includes('KI-CX-PROVIDER-001 remains open as Issue #55');
  checks.control_integrity_ledger = wiLedger.length === 16
    && wiLedger.some((entry) => entry.chunk_id === 'root.agents')
    && wiLedger.some((entry) => entry.chunk_id === 'registry.manifest')
    && wiLedger.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry));
  checks.control_integrity_issue_state = new Set(issueNumbers).size === issueNumbers.length
    && expectedHistoricalIssueNumbers.every((number) => issueNumbers.includes(number))
    && issues.every((item) => item.id
      && item.severity
      && item.owner
      && item.trigger
      && item.repayment_condition
      && item.hard_stop
      && item.github_issue_number
      && item.github_issue === `https://github.com/flowcoder2025/FDP_Codex/issues/${item.github_issue_number}`)
    && issues.filter((item) => item.github_issue_number >= 46 && item.github_issue_number <= 54)
      .every((item) => item.status === 'repaid')
    && provider?.github_issue_number === 55
    && provider?.status === 'open'
    && control?.github_issue_number === 56
    && ['repaid-on-merge', 'repaid'].includes(control?.status)
    && control?.repayment_condition.includes('post-merge control-plane audit passes');
  checks.control_integrity_state = /^WI-CX\d{4}-[a-z]+$/.test(state.current_wi?.id ?? '')
    && ['validated', 'validation-blocked', 'blocked-external'].includes(state.current_wi?.status)
    && state.control_plane?.automation?.status === 'RETIRED'
    && ['repaid-on-merge', 'repaid'].includes(integrity.status)
    && integrity.control_issue === 56
    && JSON.stringify(integrity.historical_ki_issue_range) === JSON.stringify([46, 55])
    && integrity.runner_tasks_archived === 32
    && integrity.retired_runner_visible_tasks === 0
    && integrity.residual_worktree_directories === 0
    && integrity.registered_worktree_count === 1
    && Array.isArray(state.triggered_work)
    && state.triggered_work.length === 0;
  checks.control_integrity_flow = /^WI id: WI-CX\d{4}-[a-z]+$/m.test(currentWi)
    && /^Status: (?:validated|validation-blocked|blocked-external)$/m.test(currentWi)
    && fixPlan.includes('KI-CX-PROVIDER-001 / Issue #55')
    && fixPlan.includes('The hourly worktree runner is retired')
    && !fixPlan.includes('WI-CX0035-test Automation Runner First Fresh-Run Output Review')
    && handoff.includes('WI-CX0062-fix: Control-Plane Integrity Reconciliation')
    && handoff.includes('WI-CX0063 merged through PR #58')
    && handoff.includes('Issue #56')
    && handoff.includes('Issue #55');
  checks.control_integrity_audit = pkg.scripts?.['audit:control-plane'] === 'node scripts/audit-control-plane.mjs'
    && audit.includes("new Set(['working', 'pr', 'post-merge'])")
    && audit.includes("['ls-remote', '--heads', 'origin']")
    && audit.includes("['issue', 'list'")
    && audit.includes("['pr', 'list'")
    && audit.includes("args.includes('--expect-control-closed')")
    && audit.includes("'codex.recorded_runner_task_closeout'")
    && audit.includes("'fdp:approved-work'")
    && audit.includes("label.startsWith('track:')")
    && audit.includes("'worktrees'")
    && audit.includes("'fdp-codex-a2-worktree-wi-runner', 'automation.toml'")
    && audit.includes("kind: 'fdp-codex-control-plane-audit'");
  checks.control_integrity_record = record.includes('Status: validated')
    && record.includes('Repository KIs identified: 10. GitHub Issues: 0.')
    && record.includes('PR #33 through #45 were merged with no workflow labels')
    && record.includes('32 `FDP_Codex A2 Worktree WI Runner` tasks')
    && record.includes('Created historical KI Issues #46 through #55')
    && record.includes('Left KI-CX-PROVIDER-001 open as Issue #55')
    && record.includes('Opened KI-CX-CONTROL-001 as Issue #56')
    && record.includes('Archived all 32 exact-title runner tasks')
    && record.includes('cannot query Codex app task visibility directly')
    && record.includes('--expect-control-closed')
    && record.includes('Destructive operations were limited to the user-approved');
  checks.control_integrity_boundary = state.current_priority?.wi_id === 'WI-CX0060-test'
    && ['blocked-external', 'blocked-user-approval', 'validated-awaiting-publication'].includes(state.current_priority?.state)
    && ['H1', 'USER', 'CODEX'].includes(state.current_priority?.owner_gate)
    && state.layer2_target?.remote_configured === false
    && state.hygiene?.context_bodies_carried === false
    && decision.includes('does not resume dogfood')
    && record.includes('The retired hourly runner was not replaced or reactivated')
    && record.includes('No release publication, deployment, package publication, OSS program submission');

  if (!checks.control_integrity_registration) error('control_integrity.registration_missing', 'Control-plane decision, audit tool, and validation record must be registered in the manifest and indexes.');
  if (!checks.control_integrity_final_report_contract) error('control_integrity.final_report_contract_missing', 'Final-only reporting structure and accumulated-goal framing must be explicit in AGENTS.md.');
  if (!checks.control_integrity_policy) error('control_integrity.policy_missing', 'Issue, post-merge, retired-runner, and one-controller policies must define the operational lifecycle.');
  if (!checks.control_integrity_decision) error('control_integrity.decision_missing', 'Decision must define live control-plane verification, truthful backfill, topology, closeout, and provider boundary.');
  if (!checks.control_integrity_ledger) error('control_integrity.ledger_missing', 'WI-CX0062 must retain exactly 16 metadata-only fresh-context entries.');
  if (!checks.control_integrity_issue_state) error('control_integrity.issue_state_missing', 'Every machine-state KI must link truthful GitHub Issue metadata and preserve historical Issue #46 through #56 coverage.');
  if (!checks.control_integrity_state) error('control_integrity.state_missing', 'Machine state must expose WI-CX0062, retired automation, reconciliation counts, and empty triggered work.');
  if (!checks.control_integrity_flow) error('control_integrity.flow_missing', 'Current WI, fix plan, and handoff must expose reconciliation, live GitHub lookup, and the remaining provider gate.');
  if (!checks.control_integrity_audit) error('control_integrity.audit_missing', 'Audit command must inspect live Git, GitHub, worktree, automation, PR, and KI state across closeout phases.');
  if (!checks.control_integrity_record) error('control_integrity.record_missing', 'Validation record must capture pre-state, truthful backfill, cleanup, two-pass closeout, and destructive scope.');
  if (!checks.control_integrity_boundary) error('control_integrity.boundary_missing', 'Reconciliation must preserve provider, dogfood, Layer 2 remote, release, dependency, API, and authority hard stops.');
}

function validateIndependentBlindAdversarialReviewGate() {
  const decisionPath = 'docs/decisions/2026-07-10-independent-blind-adversarial-review-gate.md';
  const specPath = 'docs/specifications/independent-review-evidence.md';
  const auditPath = 'scripts/audit-independent-review.mjs';
  const workflowPath = '.github/workflows/independent-review.yml';
  const publisherPath = 'scripts/publish-independent-review-status.mjs';
  const recordPath = 'docs/records/validation-wi-cx0063-feat.md';
  const decision = read(decisionPath);
  const spec = read(specPath);
  const audit = read(auditPath);
  const record = read(recordPath);
  const agents = read('AGENTS.md');
  const evaluation = read('docs/policies/evaluation-strategy.md');
  const gitPolicy = read('docs/policies/git-workflow.md');
  const issuePolicy = read('docs/policies/github-issue-governance.md');
  const prTemplate = read('.github/PULL_REQUEST_TEMPLATE.md');
  const labels = read('.github/labels.yml');
  const currentWi = read('.flowset/current-wi.md');
  const fixPlan = read('.flowset/fix_plan.md');
  const handoff = read('.flowset/handoff.md');
  const state = readJson('.flowset/state.json');
  const pkg = readJson('package.json');
  const manifest = read('docs/manifest.yaml');
  const docsIndex = read('docs/index.md');
  const decisionsIndex = read('docs/decisions/README.md');
  const recordsIndex = read('docs/records/README.md');
  const controlAudit = read('scripts/audit-control-plane.mjs');
  const workflow = read(workflowPath);
  const publisher = read(publisherPath);
  const manifestChunks = parseManifestChunks(manifest);
  const ledgerEntries = read('.flowset/context-ledger.jsonl')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const wiLedger = ledgerEntries.filter((entry) => entry.wi_id === 'WI-CX0063-feat'
    && entry.timestamp === '2026-07-10T14:31:15.585Z');
  let selfTest = null;
  let selfTestError = null;
  let publisherSelfTest = null;
  let publisherSelfTestError = null;
  try {
    selfTest = JSON.parse(execFileSync(process.execPath, [auditPath, '--self-test'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }));
  } catch (caught) {
    selfTestError = caught?.stderr?.toString?.() || caught?.message || String(caught);
  }
  try {
    publisherSelfTest = JSON.parse(execFileSync(process.execPath, [publisherPath, '--self-test'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }));
  } catch (caught) {
    publisherSelfTestError = caught?.stderr?.toString?.() || caught?.message || String(caught);
  }
  const reviewState = state.control_plane?.independent_review ?? {};
  const reviewIssue = state.known_issues?.find((item) => item.id === 'KI-CX-REVIEW-001');
  const statusIssue = state.known_issues?.find((item) => item.id === 'KI-CX-STATUS-001');
  const oldRunnerReview = manifestChunks.find((item) => item.id === 'record.automation-runner-s2-review-packet');
  const oldCadence = manifestChunks.find((item) => item.id === 'record.post-bootstrap-automation-cadence-decision-handback');

  checks.independent_review_registration = manifest.includes('id: decision.independent-blind-adversarial-review-gate')
    && manifest.includes(decisionPath)
    && manifest.includes('id: spec.independent-review-evidence')
    && manifest.includes(specPath)
    && manifest.includes('id: tool.audit-independent-review')
    && manifest.includes(auditPath)
    && manifest.includes('id: record.validation-wi-cx0063-feat')
    && manifest.includes(recordPath)
    && manifest.includes('id: github.workflow.independent-review')
    && manifest.includes(workflowPath)
    && manifest.includes('id: tool.publish-independent-review-status')
    && manifest.includes(publisherPath)
    && docsIndex.includes(decisionPath)
    && docsIndex.includes(specPath)
    && docsIndex.includes(auditPath)
    && docsIndex.includes(workflowPath)
    && docsIndex.includes(publisherPath)
    && docsIndex.includes(recordPath)
    && decisionsIndex.includes(decisionPath)
    && recordsIndex.includes(recordPath);
  checks.independent_review_agents = agents.includes('## Independent Verification Gate')
    && agents.includes('Every non-trivial R1, R2, or R3 WI')
    && agents.includes('fork_context: false')
    && agents.includes('Any PR head change invalidates the prior review')
    && agents.includes('PASS with no unresolved P0, P1, or P2 finding');
  checks.independent_review_policy = evaluation.includes('Every R1, R2, or R3 WI requires E2 + E3 on S2 before merge')
    && evaluation.includes('Agent-based S2 must start from clean context')
    && evaluation.includes('Any head change invalidates the review')
    && gitPolicy.includes('## Independent Review Merge Gate')
    && gitPolicy.includes('open the PR without')
    && gitPolicy.includes('discard the prior result and repeat the separate review')
    && gitPolicy.includes('only after the audit and required status pass');
  checks.independent_review_decision = decision.includes('Status: accepted-v0')
    && decision.includes('Every non-trivial R1, R2, or R3 WI requires E2 Blind Independent Review and E3 Adversarial Review before merge')
    && decision.includes('fork_context: false')
    && decision.includes('Any implementation or policy change after review invalidates the result')
    && decision.includes('WI-CX0042 and its runner-specific S2 debt are closed as obsolete, not passed')
    && decision.includes('required `main` branch protection check')
    && decision.includes('controller-attested `orchestrator_receipt`')
    && decision.includes('KI-CX-REVIEW-001 / Issue #59');
  checks.independent_review_spec = spec.includes('Status: implemented-v1')
    && spec.includes('The controller must not provide implementation chat')
    && spec.includes('reviewer_agent_id')
    && spec.includes('implementation_context_received: false')
    && spec.includes('orchestrator_receipt')
    && spec.includes('not a signed execution-platform identity')
    && spec.includes('must both equal the live PR head')
    && spec.includes('Any change to the PR head invalidates the prior review');
  checks.independent_review_self_test = selfTestError === null
    && selfTest?.ok === true
    && selfTest?.cases?.valid_passes === true
    && selfTest?.cases?.stale_head_rejected === true
    && selfTest?.cases?.inherited_context_rejected === true
    && selfTest?.cases?.missing_orchestrator_receipt_rejected === true
    && selfTest?.cases?.whitespace_reviewer_id_rejected === true
    && selfTest?.cases?.controller_variant_rejected === true
    && selfTest?.cases?.blocking_finding_rejected === true
    && selfTest?.cases?.p3_without_disposition_rejected === true
    && selfTest?.cases?.ambiguous_multiple_payload_rejected === true
    && selfTest?.cases?.pre_marker_payload_rejected === true
    && selfTest?.cases?.malformed_evidence_members_rejected === true
    && selfTest?.cases?.disposition_only_p3_rejected === true
    && selfTest?.cases?.review_101_latest_failure_wins === true
    && selfTest?.cases?.missing_label_rejected === true
    && selfTest?.cases?.premature_merge_approval_rejected === true
    && publisherSelfTestError === null
    && publisherSelfTest?.ok === true
    && publisherSelfTest?.cases?.stable_pass_accepted === true
    && publisherSelfTest?.cases?.newer_failure_rejected === true
    && publisherSelfTest?.cases?.changed_review_rejected === true
    && publisherSelfTest?.cases?.changed_head_rejected === true
    && publisherSelfTest?.cases?.initial_failure_rejected === true;
  checks.independent_review_audit = audit.includes("const marker = '<!-- fdp-independent-review:v1 -->'")
    && audit.includes("'review.github_head_anchor'")
    && audit.includes("payload.context_mode === 'blind-clean'")
    && audit.includes('payload.fork_context === false')
    && audit.includes('payload.implementation_context_received === false')
    && audit.includes("'review.orchestrator_receipt_attested'")
    && audit.includes("source.slice(0, markerIndex).trim() !== ''")
    && audit.includes('reviewerAgentId === reviewerAgentId.trim()')
    && audit.includes("reviewerAgentId.toLowerCase() !== 'controller'")
    && audit.includes('isNonEmptyStringArray(payload.reviewed_files)')
    && audit.includes('isValidFinding(finding, { requireDisposition: true })')
    && audit.includes("'--paginate', '--slurp'")
    && audit.includes("['P0', 'P1', 'P2']")
    && audit.includes("payload?.verdict === 'PASS'")
    && audit.includes("'pr.merge_approval_absent'")
    && audit.includes("'review.p3_dispositions'")
    && audit.includes("'pr:independent-review-passed'")
    && pkg.scripts?.['audit:independent-review'] === 'node scripts/audit-independent-review.mjs';
  checks.independent_review_github_surface = labels.includes('name: pr:independent-review-passed')
    && prTemplate.includes('Independent reviewer used a clean context')
    && prTemplate.includes('review payload')
    && prTemplate.includes('pr:approved-merge')
    && issuePolicy.includes('`pr:independent-review-passed`')
    && controlAudit.includes('independentReviewBaselinePr')
    && controlAudit.includes('requiredIndependentReviewLabels')
    && controlAudit.includes('inspectIndependentReview')
    && controlAudit.includes("'--allow-merged'")
    && controlAudit.includes("'github.main_branch_protection'")
    && controlAudit.includes("check.app_id === 15368")
    && controlAudit.includes("creator?.login === 'github-actions[bot]'")
    && controlAudit.includes('status.target_url === bootstrapStatusRun.url')
    && controlAudit.includes("bootstrapStatusRun?.event === 'pull_request'")
    && controlAudit.includes("bootstrapStatusRun?.conclusion === 'success'")
    && workflow.includes('pull_request_target:')
    && workflow.includes('pull_request_review:')
    && workflow.includes('workflow_dispatch:')
    && !workflow.includes('\n  pull_request:\n')
    && workflow.includes('statuses: write')
    && workflow.includes('cancel-in-progress: true')
    && workflow.includes('Checkout trusted default branch')
    && workflow.includes('github.event.repository.default_branch')
    && !workflow.includes('github.event.pull_request.number == 58')
    && workflow.includes(publisherPath)
    && publisher.includes("const context = 'independent-review'")
    && publisher.includes("'pending'")
    && publisher.includes('const first = readAudit(prNumber)')
    && publisher.includes('const latest = readAudit(prNumber)')
    && publisher.includes('first.latest_review_id === latest.latest_review_id');
  checks.independent_review_state = reviewState.status === 'required-before-merge'
    && reviewState.pr_baseline_from === 58
    && JSON.stringify(reviewState.required_risks) === JSON.stringify(['R1', 'R2', 'R3'])
    && JSON.stringify(reviewState.required_evaluators) === JSON.stringify(['E2', 'E3'])
    && reviewState.multi_agent_fork_context === false
    && reviewState.head_change_invalidates_review === true
    && reviewState.pass_label === 'pr:independent-review-passed'
    && reviewState.required_check === 'independent-review'
    && reviewState.status_publisher === publisherPath
    && reviewState.status_publisher_app_id === 15368
    && reviewState.status_role === 'defense-in-depth'
    && reviewState.workflow_identity_enforcement === 'unavailable-github-free'
    && reviewState.workflow_identity_issue === 60
    && reviewState.status_publication === 'pending-then-stable-double-read'
    && reviewState.status_concurrency === 'per-pr-cancel-in-progress'
    && reviewState.branch_protection === 'required-github-actions-app-bound'
    && reviewState.merged_candidate_trigger === false
    && reviewState.bootstrap_status_run === 29104125595
    && reviewState.bootstrap_status_source_head === 'c7ee6b6ff4f44496088892e10d69c01b08e6defe'
    && reviewState.bootstrap_status_mode === 'one-time-rerun-after-final-pass'
    && reviewState.provenance_mode === 'controller-attested'
    && reviewState.provenance_issue === 59
    && reviewIssue?.severity === 'High'
    && reviewIssue?.status === 'open'
    && reviewIssue?.github_issue_number === 59
    && statusIssue?.severity === 'High'
    && statusIssue?.status === 'open'
    && statusIssue?.github_issue_number === 60;
  checks.independent_review_ledger = wiLedger.length === 19
    && wiLedger.some((entry) => entry.chunk_id === 'root.agents')
    && wiLedger.some((entry) => entry.chunk_id === 'registry.manifest')
    && wiLedger.every((entry) => !('body' in entry) && !('content' in entry) && !('text' in entry));
  checks.independent_review_flow = fixPlan.includes('Independent verification authority')
    && !fixPlan.includes('WI-CX0042-test Automation Runner S2 Review Execution')
    && !fixPlan.includes('WI-CX0044-docs Post-Bootstrap Automation Cadence Accepted Decision')
    && !fixPlan.includes('S2 blind review repayment for the automation runner')
    && oldRunnerReview?.status === 'historical-obsolete'
    && oldCadence?.status === 'historical-obsolete'
    && handoff.includes('WI-CX0063 merged through PR #58')
    && handoff.includes('WI-CX0042 is obsolete rather than passed')
    && handoff.includes('Issue #55')
    && handoff.includes('Issue #59');
  checks.independent_review_record = record.includes('Status: validated')
    && record.includes('ctx-wi-cx0063-feat-20260710143115')
    && record.includes('19 metadata-only ledger entries')
    && record.includes('stale-head replay rejected')
    && record.includes('inherited implementation context rejected')
    && record.includes('missing controller-attested orchestrator receipt rejected')
    && record.includes('P2 blocking finding rejected')
    && record.includes('ambiguous multiple-payload review rejected')
    && record.includes('a contradictory pre-marker payload rejected')
    && record.includes('a 101st, newer failing review overrides an older passing review')
    && record.includes('premature pr:approved-merge rejected')
    && record.includes('Any finding-driven edit changes the head and requires a new independent reviewer pass')
    && record.includes('returned FAIL')
    && record.includes('4672749444')
    && record.includes('4673022662')
    && record.includes('4673105127')
    && record.includes('4673210128')
    && record.includes('KI-CX-STATUS-001 / Issue #60')
    && record.includes('null/empty evidence members and disposition-only P3 findings rejected')
    && record.includes('final merged workflow contains no write-capable `pull_request` event')
    && record.includes('29104125595')
    && record.includes('GitHub Actions app id `15368`')
    && record.includes('KI-CX-REVIEW-001 / Issue #59');
  checks.independent_review_boundary = state.current_priority?.wi_id === 'WI-CX0060-test'
    && ['blocked-external', 'blocked-user-approval', 'validated-awaiting-publication'].includes(state.current_priority?.state)
    && ['H1', 'USER', 'CODEX'].includes(state.current_priority?.owner_gate)
    && state.control_plane?.automation?.status === 'RETIRED'
    && state.layer2_target?.remote_configured === false
    && reviewIssue?.hard_stop.includes('unattended or generalized automated merge')
    && statusIssue?.hard_stop.includes('unattended or generalized automated merge')
    && decision.includes('does not authorize dogfood continuation')
    && record.includes('No dogfood continuation or provider-policy workaround occurred')
    && record.includes('No release publication, deployment, package publication, OSS program submission');

  if (!checks.independent_review_registration) error('independent_review.registration_missing', 'Independent review decision, specification, audit, and record must be registered.');
  if (!checks.independent_review_agents) error('independent_review.agents_missing', 'AGENTS must require clean-context independent current-head review for non-trivial work.');
  if (!checks.independent_review_policy) error('independent_review.policy_missing', 'Evaluation and Git policies must define E2+E3 S2 execution and merge ordering.');
  if (!checks.independent_review_decision) error('independent_review.decision_missing', 'Decision must define scope, independence, invalidation, findings, and obsolete runner debt.');
  if (!checks.independent_review_spec) error('independent_review.spec_missing', 'Evidence specification must define blind inputs, result schema, and current-head binding.');
  if (!checks.independent_review_self_test) error('independent_review.self_test_failed', 'Independent review audit and status publisher negative and positive fixtures must pass.', selfTestError || publisherSelfTestError);
  if (!checks.independent_review_audit) error('independent_review.audit_missing', 'Audit must inspect live marker, GitHub head anchor, context separation, verdict, labels, and blocking findings.');
  if (!checks.independent_review_github_surface) error('independent_review.github_surface_missing', 'PR template, labels, and control-plane audit must expose the new gate.');
  if (!checks.independent_review_state) error('independent_review.state_missing', 'Machine state must expose the independent review baseline and invalidation contract.');
  if (!checks.independent_review_ledger) error('independent_review.ledger_missing', 'WI-CX0063 must retain exactly 19 metadata-only fresh-context entries.');
  if (!checks.independent_review_flow) error('independent_review.flow_missing', 'Current flow must activate WI-CX0063 and retire stale runner-specific review candidates.');
  if (!checks.independent_review_record) error('independent_review.record_missing', 'Validation record must capture strategy, fresh context, negative tests, and review sequence.');
  if (!checks.independent_review_boundary) error('independent_review.boundary_missing', 'Independent review work must preserve provider, dogfood, runner, Layer 2, release, and authority boundaries.');
}

function validatePackage() {
  const pkg = JSON.parse(read('package.json'));
  checks.package_validate_script = pkg.scripts?.validate ?? null;
  checks.package_context_pack_script = pkg.scripts?.['context:pack'] ?? null;
  checks.package_worker_run_script = pkg.scripts?.['worker:run'] ?? null;
  checks.package_worker_test_script = pkg.scripts?.['worker:test'] ?? null;
  checks.package_independent_review_audit_script = pkg.scripts?.['audit:independent-review'] ?? null;
  checks.package_license = pkg.license ?? null;
  checks.package_private = pkg.private === true;

  if (pkg.scripts?.validate !== 'node scripts/validate-repo.mjs') {
    error('package.validate_script_missing', 'package.json must expose the repository validator through npm run validate.');
  }
  if (pkg.scripts?.['context:pack'] !== 'node scripts/build-context-pack.mjs') {
    error('package.context_pack_script_missing', 'package.json must expose the context pack builder through npm run context:pack.');
  }
  if (pkg.scripts?.['worker:run'] !== 'node scripts/run-ephemeral-worker.mjs') {
    error('package.worker_run_script_missing', 'package.json must expose the managed ephemeral worker runner.');
  }
  if (pkg.scripts?.['worker:test'] !== 'node scripts/test-ephemeral-worker-lifecycle.mjs') {
    error('package.worker_test_script_missing', 'package.json must expose the worker lifecycle regression test.');
  }
  if (pkg.scripts?.['audit:independent-review'] !== 'node scripts/audit-independent-review.mjs') {
    error('package.independent_review_audit_script_missing', 'package.json must expose the independent review live audit.');
  }
  if (pkg.license !== 'Apache-2.0') error('package.license_invalid', 'package.json license must match repository license.');
  if (pkg.private !== true) error('package.private_required_pre_release', 'package.json must remain private during the public pre-release baseline.');
}

validateRequiredFiles();
validateManifest();
validateLedger();
validateNaming();
validateFlowState();
validateFlowStateReadableSnapshotContract();
validateGitHubGovernance();
validatePublicReadiness();
validateEvaluationSurface();
validateContextPackCommandSurface();
validateContextSelectionRuleTable();
validateDecisionQueue();
validatePortfolioGuardrailValidatorBaseline();
validateAutonomousWorkExhaustionStopGate();
validateKiIdentityPolicy();
validateHandoffSizePolicy();
validateAutonomyDefaultOptionsPacket();
validateOperatingPolicyLock();
validateCollaborationResponseContract();
validateSessionBoundaryAutomationContract();
validateLocalWorkspaceRealignment();
validateToolingTypeScriptBaseline();
validateToolingStrictnessProbe();
validateAutomationRunSurfaceInstallation();
validateAutomationRunnerPostMergeSmoke();
validateContextLedgerDedupePolicy();
validateLayer2KnowledgeScaffoldContract();
validateAutomationRunnerFreshRunEvidenceGate();
validateAutomationRunnerS2ReviewPacket();
validatePostBootstrapAutomationCadenceHandback();
validateLayer2ScopeCodeOptionsPacket();
validateLayer2ChunkIdScopePolicy();
validateLayer2ScopeCodeDecisionHandback();
validateLayer2ScopeCodeAcceptedDecision();
validateSessionOrchestrationControlPlaneAudit();
validateRuntimeSnapshotValidator();
validateA2HandoffReceiverContract();
validateWorktreeIsolationVerification();
validateA2WorktreeIsolationRepairGate();
validateA2WorktreeIsolationRepairValidation();
validateStrategicGoalSteeringContract();
validateLayer2ScaffoldGenerator();
validateLayer2FreshContextContinuation();
validateEphemeralWorkerControllerBoundary();
validateContextSelectionBreadthGuard();
validateEphemeralWorkerProcessLifecycleGuard();
validateControlPlaneOperationalIntegrity();
validateIndependentBlindAdversarialReviewGate();
validatePackage();

const result = {
  ok: errors.length === 0,
  checks,
  warnings,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length > 0) process.exit(1);
