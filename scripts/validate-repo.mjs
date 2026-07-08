#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const errors = [];
const warnings = [];
const checks = {};

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

const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'CONTRIBUTING.md',
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
  'docs/specifications/knowledge-system.md',
  'docs/specifications/context-pack-builder.md',
  'docs/decisions/2026-07-08-fdp-codex-operating-foundation.md',
  'docs/decisions/2026-07-08-repository-license-binding.md',
  'docs/decisions/2026-07-08-bootstrap-publication-envelope.md',
  '.flowset/current-wi.md',
  '.flowset/fix_plan.md',
  '.flowset/handoff.md',
  '.flowset/context-ledger.jsonl',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/known_issue.yml',
  '.github/ISSUE_TEMPLATE/contribution_intake.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/labels.yml',
  '.github/workflows/validate.yml',
  'docs/runbooks/github-label-setup.md',
  'docs/runbooks/bootstrap-reconciliation.md',
  'package.json',
  'scripts/lib/manifest.mjs',
  'scripts/validate-repo.mjs',
  'scripts/build-context-pack.mjs',
];

const requiredAlwaysOnIds = [
  'root.agents',
  'registry.manifest',
];

const requiredChunkIds = [
  'decision.bootstrap-publication-envelope',
  'policy.context-hygiene',
  'policy.work-item-lifecycle',
  'policy.naming-and-commits',
  'policy.git-workflow',
  'policy.github-issue-governance',
  'policy.autonomy-and-approval',
  'policy.triage-strategy',
  'policy.evaluation-strategy',
  'policy.verification-economy',
  'spec.knowledge-system',
  'spec.context-pack-builder',
  'flow.current-wi',
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

function parseManifestAlwaysOn(manifestText) {
  const alwaysOn = [];
  let inAlwaysOn = false;
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

function parseManifestChunks(manifestText) {
  const chunks = [];
  let inChunks = false;
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
  checks.git_branch = currentBranch;
  checks.git_branch_source = gitBranch ? 'git' : (process.env.GITHUB_HEAD_REF ? 'GITHUB_HEAD_REF' : (process.env.GITHUB_REF_NAME ? 'GITHUB_REF_NAME' : 'none'));
  checks.git_has_head = hasHead;
  checks.git_branch_format_ok = currentBranch ? branchPattern.test(currentBranch) : false;

  if (!currentBranch || !branchPattern.test(currentBranch)) {
    error('git.branch_invalid', 'Current git branch must use wi/cxNNNN-category-short-slug.', currentBranch);
  }

  if (wiMatch && currentBranch && hasHead) {
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

  const currentWiId = /^WI id: (WI-CX\d{4}-[a-z]+)$/m.exec(currentWiText)?.[1] ?? null;
  const currentStatus = /^Status: (.+)$/m.exec(currentWiText)?.[1]?.trim() ?? null;
  const currentPriorityBlock = /## Current Priority\n\n([\s\S]*?)(?:\n## |$)/.exec(fixPlanText)?.[1] ?? '';
  const currentPriorityMatches = [...currentPriorityBlock.matchAll(/^- \[ \] (WI-CX\d{4}-[a-z]+)\b/gm)].map((match) => match[1]);
  const completedCheckboxes = [...fixPlanText.matchAll(/^- \[[xX]\] /gm)].map((match) => match[0]);
  const handoffLines = handoffText.split('\n').length;
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
  const nextActionMatchesFixPlan = currentPriorityMatches.length === 1 && handoffText.includes(currentPriorityMatches[0]);

  checks.flow_current_status = currentStatus;
  checks.flow_current_priority_count = currentPriorityMatches.length;
  checks.flow_current_priority = currentPriorityMatches[0] ?? null;
  checks.flow_fix_plan_completed_checkboxes = completedCheckboxes.length;
  checks.flow_handoff_line_count = handoffLines;
  checks.flow_missing_handoff_sections = missingHandoffSections;
  checks.flow_current_wi_pending_markers = pendingMarkers.length;
  checks.flow_validation_record_exists = validationRecordExists;
  checks.flow_validation_record_registered = validationRecordRegistered;
  checks.flow_handoff_mentions_current_wi = handoffMentionsCurrent;
  checks.flow_next_action_matches_fix_plan = nextActionMatchesFixPlan;

  if (currentPriorityMatches.length !== 1) {
    error('flow.fix_plan_current_priority_count', 'fix_plan must have exactly one current priority item.', currentPriorityMatches);
  }
  if (completedCheckboxes.length) {
    error('flow.fix_plan_completed_history', 'fix_plan must not store completed-history checkboxes.', completedCheckboxes.length);
  }
  if (missingHandoffSections.length) {
    error('flow.handoff_sections_missing', 'handoff is missing required operational sections.', missingHandoffSections);
  }
  if (handoffLines > 220) {
    error('flow.handoff_too_long', 'handoff must remain compact and should point to SSOT instead of copying it.', handoffLines);
  }
  if (!nextActionMatchesFixPlan) {
    error('flow.next_action_mismatch', 'handoff next action must mention the fix_plan current priority.', {
      currentPriority: currentPriorityMatches[0] ?? null,
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
function validateGitHubGovernance() {
  const issuePolicy = read('docs/policies/github-issue-governance.md');
  const gitPolicy = read('docs/policies/git-workflow.md');
  const labels = read('.github/labels.yml');
  const prTemplate = read('.github/PULL_REQUEST_TEMPLATE.md');
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
}

function validatePackage() {
  const pkg = JSON.parse(read('package.json'));
  checks.package_validate_script = pkg.scripts?.validate ?? null;
  checks.package_context_pack_script = pkg.scripts?.['context:pack'] ?? null;
  checks.package_license = pkg.license ?? null;
  checks.package_private = pkg.private === true;

  if (pkg.scripts?.validate !== 'node scripts/validate-repo.mjs') {
    error('package.validate_script_missing', 'package.json must expose the repository validator through npm run validate.');
  }
  if (pkg.scripts?.['context:pack'] !== 'node scripts/build-context-pack.mjs') {
    error('package.context_pack_script_missing', 'package.json must expose the context pack builder through npm run context:pack.');
  }
  if (pkg.license !== 'Apache-2.0') error('package.license_invalid', 'package.json license must match repository license.');
}

validateRequiredFiles();
validateManifest();
validateLedger();
validateNaming();
validateFlowState();
validateGitHubGovernance();
validatePackage();

const result = {
  ok: errors.length === 0,
  checks,
  warnings,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length > 0) process.exit(1);
