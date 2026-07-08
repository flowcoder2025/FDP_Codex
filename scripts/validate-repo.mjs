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
  'docs/specifications/knowledge-system.md',
  'docs/specifications/context-pack-builder.md',
  'docs/decisions/2026-07-08-fdp-codex-operating-foundation.md',
  'docs/decisions/2026-07-08-repository-license-binding.md',
  'docs/decisions/2026-07-08-bootstrap-publication-envelope.md',
  'docs/decisions/2026-07-08-public-readiness-boundary.md',
  'docs/decisions/2026-07-08-evaluation-surface-baseline.md',
  'docs/decisions/2026-07-08-context-pack-command-surface.md',
  'docs/decisions/2026-07-08-context-selection-rule-table.md',
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
  'docs/records/validation-wi-cx0020-feat.md',
  'docs/records/validation-wi-cx0021-feat.md',
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
  'record.validation-wi-cx0020-feat',
  'record.validation-wi-cx0021-feat',
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
  checks.context_pack_manifest_hook_status = /^  status: implemented-v1$/m.test(manifest.split('hook_contract:')[1] ?? '');
  checks.context_pack_manifest_output_ledger_append = manifest.includes('    - ledger_append');
  checks.context_pack_sample_no_append = sample?.ledger_append?.requested === false && sample?.ledger_append?.status === 'not_requested';
  checks.context_pack_sample_no_bodies = sample?.contains_chunk_bodies === false && sample?.body_storage === 'forbidden';
  checks.context_pack_sample_selects_builder = Array.isArray(sample?.selected_chunk_ids) && sample.selected_chunk_ids.includes('tool.build-context-pack');

  if (!checks.context_pack_builder_has_append_flag) error('context_pack.builder_append_missing', 'Builder must implement explicit --append-ledger handling.');
  if (!checks.context_pack_spec_stdout_default) error('context_pack.spec_stdout_default_missing', 'Context pack spec must state stdout-only default.');
  if (!checks.context_pack_spec_append_explicit) error('context_pack.spec_append_explicit_missing', 'Context pack spec must state explicit ledger append mode.');
  if (!checks.context_pack_spec_has_ledger_append_output) error('context_pack.spec_ledger_append_missing', 'Context pack spec must include ledger_append output.');
  if (!checks.context_pack_hygiene_append_procedure) error('context_pack.hygiene_append_missing', 'Context hygiene policy must include explicit append-ledger procedure.');
  if (!checks.context_pack_decision_stdout_default || !checks.context_pack_decision_append_explicit) {
    error('context_pack.decision_contract_missing', 'Context pack command decision must lock stdout default and explicit append.');
  }
  if (!checks.context_pack_manifest_hook_status) error('context_pack.manifest_status_missing', 'Manifest hook contract must be implemented-v1.');
  if (!checks.context_pack_manifest_output_ledger_append) error('context_pack.manifest_ledger_append_missing', 'Manifest hook output must include ledger_append.');
  if (!checks.context_pack_sample_no_append) error('context_pack.default_mutates_ledger', 'Default context pack run must report no ledger append.');
  if (!checks.context_pack_sample_no_bodies) error('context_pack.body_contract_failed', 'Context pack output must forbid chunk bodies.');
  if (!checks.context_pack_sample_selects_builder) error('context_pack.selection_missing_builder', 'Context pack sample should select the builder chunk for builder work.');
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

  if (missingBuilderRules.length) error('context_selection.builder_rules_missing', 'Builder must define all required context selection rule ids.', missingBuilderRules);
  if (missingSpecRules.length) error('context_selection.spec_rules_missing', 'Context pack spec must document all required context selection rule ids.', missingSpecRules);
  if (missingSampleRules.length) error('context_selection.sample_rules_missing', 'Sample context pack must exercise all required selection rule ids.', missingSampleRules);
  if (chunksWithoutRules.length) error('context_selection.chunk_rules_missing', 'Every selected chunk must include selection_rules metadata.', chunksWithoutRules);
  if (!checks.context_selection_manifest_outputs) error('context_selection.manifest_outputs_missing', 'Manifest hook output must include selection rule metadata fields.');
  if (!checks.context_selection_decision_stable_rules) error('context_selection.decision_contract_missing', 'Context selection decision must lock stable rule ids and output metadata.');
  if (!checks.context_selection_sample_no_append) error('context_selection.default_append_failed', 'Rule-table sample must keep default no-append behavior.');
  if (!checks.context_selection_sample_no_bodies) error('context_selection.body_contract_failed', 'Rule-table sample must forbid chunk bodies.');
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
  if (pkg.private !== true) error('package.private_required_pre_release', 'package.json must remain private during the public pre-release baseline.');
}

validateRequiredFiles();
validateManifest();
validateLedger();
validateNaming();
validateFlowState();
validateGitHubGovernance();
validatePublicReadiness();
validateEvaluationSurface();
validateContextPackCommandSurface();
validateContextSelectionRuleTable();
validatePackage();

const result = {
  ok: errors.length === 0,
  checks,
  warnings,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length > 0) process.exit(1);
