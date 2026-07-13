#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const state = JSON.parse(readFileSync(path.join(repoRoot, '.flowset', 'state.json'), 'utf8'));
const args = process.argv.slice(2);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] ?? null;
}

const phase = valueAfter('--phase') || 'working';
const prNumber = Number(valueAfter('--pr')) || null;
const expectControlClosed = args.includes('--expect-control-closed');
const allowedPhases = new Set(['working', 'pr', 'post-merge']);
if (!allowedPhases.has(phase)) throw new Error('--phase must be working, pr, or post-merge');
if ((phase === 'pr' || phase === 'post-merge') && !prNumber) throw new Error('--pr is required for pr and post-merge phases');

function run(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim();
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameValues(actual, expected) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function latestStatusForContext(statuses, context) {
  return statuses
    .filter((item) => item.context === context)
    .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))[0] || null;
}

function inspectIndependentReview(reviewPrNumber, { allowMerged = false } = {}) {
  const commandArgs = [
    'scripts/audit-independent-review.mjs',
    '--pr', String(reviewPrNumber),
    '--allow-merge-approved',
  ];
  if (allowMerged) commandArgs.push('--allow-merged');

  try {
    return JSON.parse(run(process.execPath, commandArgs));
  } catch (caught) {
    const stdout = caught?.stdout?.toString?.().trim() || '';
    try {
      return JSON.parse(stdout);
    } catch {
      return {
        ok: false,
        errors: [{
          id: 'audit.execution_failed',
          detail: caught?.stderr?.toString?.().trim() || caught?.message || String(caught),
        }],
      };
    }
  }
}

const checks = {};
const errors = [];
const addCheck = (id, ok, detail) => {
  checks[id] = { ok, detail };
  if (!ok) errors.push({ id, detail });
};

const activeBranch = state.current_wi?.branch;
const expectedCheckoutBranch = phase === 'post-merge' ? 'main' : activeBranch;
const checkoutBranch = run('git', ['branch', '--show-current']);
addCheck('git.checkout_branch', checkoutBranch === expectedCheckoutBranch, { checkoutBranch, expectedCheckoutBranch });

const dirtyPaths = run('git', ['status', '--porcelain']).split(/\r?\n/).filter(Boolean);
addCheck('git.clean', dirtyPaths.length === 0, dirtyPaths);

const localBranches = run('git', ['for-each-ref', '--format=%(refname:short)', 'refs/heads'])
  .split(/\r?\n/).filter(Boolean);
const expectedBranches = phase === 'post-merge' ? ['main'] : ['main', activeBranch];
addCheck('git.local_branches', sameValues(localBranches, expectedBranches), { localBranches, expectedBranches });

const remoteBranches = run('git', ['ls-remote', '--heads', 'origin'])
  .split(/\r?\n/).filter(Boolean)
  .map((line) => line.split(/\s+/)[1]?.replace('refs/heads/', ''))
  .filter(Boolean);
const expectedRemoteBranches = phase === 'pr' ? ['main', activeBranch] : ['main'];
addCheck('git.remote_branches', sameValues(remoteBranches, expectedRemoteBranches), { remoteBranches, expectedRemoteBranches });

const worktreePaths = run('git', ['worktree', 'list', '--porcelain'])
  .split(/\r?\n/)
  .filter((line) => line.startsWith('worktree '))
  .map((line) => path.resolve(line.slice('worktree '.length)));
addCheck('git.single_worktree', worktreePaths.length === 1 && worktreePaths[0] === path.resolve(repoRoot), worktreePaths);

const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const worktreeRoot = path.join(codexHome, 'worktrees');
const residualWorktreeDirectories = existsSync(worktreeRoot)
  ? readdirSync(worktreeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  : [];
addCheck('codex.worktree_directories', residualWorktreeDirectories.length === 0, residualWorktreeDirectories);

const retiredAutomationPath = path.join(codexHome, 'automations', 'fdp-codex-a2-worktree-wi-runner', 'automation.toml');
addCheck('codex.retired_automation_absent', !existsSync(retiredAutomationPath), retiredAutomationPath);
const integrityState = state.control_plane?.operational_integrity ?? {};
addCheck('codex.recorded_runner_task_closeout', integrityState.runner_tasks_archived === 32
  && integrityState.retired_runner_visible_tasks === 0, {
  archived: integrityState.runner_tasks_archived,
  recorded_visible: integrityState.retired_runner_visible_tasks,
  live_app_query_required: true,
});

const repo = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
const branchProtection = JSON.parse(run('gh', ['api', `repos/${repo}/branches/main/protection`]));
const protectionChecks = branchProtection.required_status_checks?.checks || [];
const expectedProtectedContexts = [
  'validate (node 20.x)',
  'validate (node 24.x)',
  'independent-review',
];
addCheck('github.main_branch_protection', branchProtection.required_status_checks?.strict === true
  && branchProtection.enforce_admins?.enabled === true
  && branchProtection.required_conversation_resolution?.enabled === true
  && branchProtection.allow_force_pushes?.enabled === false
  && branchProtection.allow_deletions?.enabled === false
  && expectedProtectedContexts.every((context) => protectionChecks.some((check) => check.context === context
    && check.app_id === 15368)), {
  strict: branchProtection.required_status_checks?.strict,
  enforce_admins: branchProtection.enforce_admins?.enabled,
  conversation_resolution: branchProtection.required_conversation_resolution?.enabled,
  allow_force_pushes: branchProtection.allow_force_pushes?.enabled,
  allow_deletions: branchProtection.allow_deletions?.enabled,
  checks: protectionChecks,
});

const independentReviewState = state.control_plane?.independent_review ?? {};
const bootstrapStatusRunId = independentReviewState.bootstrap_status_run || null;
const bootstrapStatusRun = bootstrapStatusRunId
  ? JSON.parse(run('gh', [
    'run', 'view', String(bootstrapStatusRunId),
    '--json', 'databaseId,event,headSha,status,conclusion,url',
  ]))
  : null;

function statusSourceMatches(pullRequestNumber, status) {
  const actionsStatus = status?.creator?.login === 'github-actions[bot]';
  if (!actionsStatus || pullRequestNumber !== 58) return actionsStatus;
  return bootstrapStatusRun?.databaseId === bootstrapStatusRunId
    && bootstrapStatusRun?.event === 'pull_request'
    && bootstrapStatusRun?.headSha === independentReviewState.bootstrap_status_source_head
    && bootstrapStatusRun?.status === 'completed'
    && bootstrapStatusRun?.conclusion === 'success'
    && status.target_url === bootstrapStatusRun.url;
}

const issues = JSON.parse(run('gh', ['issue', 'list', '--state', 'all', '--limit', '200', '--json', 'number,title,state,body,labels,url']));
for (const knownIssue of state.known_issues || []) {
  const issue = issues.find((candidate) => candidate.number === knownIssue.github_issue_number);
  const labels = issue?.labels?.map((label) => label.name) || [];
  const expectedState = knownIssue.status === 'open'
    ? 'OPEN'
    : knownIssue.status === 'repaid-on-merge' && !expectControlClosed
      ? 'OPEN'
      : 'CLOSED';
  const severityLabel = `ki:${String(knownIssue.severity || '').toLowerCase()}`;
  addCheck(`ki.${knownIssue.id}`, Boolean(issue)
    && issue.title.includes(knownIssue.id)
    && issue.state === expectedState
    && labels.includes('fdp:ki')
    && labels.includes(severityLabel), {
    issue_number: knownIssue.github_issue_number,
    actual_state: issue?.state || null,
    expected_state: expectedState,
    labels,
    severity_label: severityLabel,
  });
}

const workerFinalResultIssue = (state.known_issues || [])
  .find((knownIssue) => knownIssue.id === 'KI-CX-WORKER-003');
const liveWorkerFinalResultIssue = issues
  .find((issue) => issue.number === workerFinalResultIssue?.github_issue_number);
const pinnedCandidateShas = liveWorkerFinalResultIssue?.body?.match(/\b[0-9a-f]{40}\b/gi) ?? [];
addCheck('ki.KI-CX-WORKER-003.live_pr_reference', Boolean(liveWorkerFinalResultIssue)
  && liveWorkerFinalResultIssue.body.includes('PR #65')
  && liveWorkerFinalResultIssue.body.includes('query the live PR head')
  && pinnedCandidateShas.length === 0, {
  issue_number: workerFinalResultIssue?.github_issue_number || null,
  references_pr_65: liveWorkerFinalResultIssue?.body?.includes('PR #65') || false,
  requires_live_head_query: liveWorkerFinalResultIssue?.body?.includes('query the live PR head') || false,
  pinned_candidate_shas: pinnedCandidateShas,
});

const pullRequests = JSON.parse(run('gh', ['pr', 'list', '--state', 'all', '--limit', '200', '--json', 'number,state,headRefName,headRefOid,labels,url']));
const baselinePr = state.control_plane?.operational_integrity?.github_pr_label_baseline_from ?? 33;
const independentReviewBaselinePr = state.control_plane?.independent_review?.pr_baseline_from ?? Number.POSITIVE_INFINITY;
const requiredPrLabels = ['fdp:approved-work', 'needs:validator', 'pr:ready-for-review', 'pr:approved-merge'];
const requiredIndependentReviewLabels = ['needs:blind-review', 'needs:adversarial-review', 'pr:independent-review-passed'];
for (const pullRequest of pullRequests.filter((candidate) => candidate.number >= baselinePr && candidate.number !== prNumber)) {
  const labels = pullRequest.labels.map((label) => label.name);
  const riskLabels = labels.filter((label) => /^risk:R[0-3]$/.test(label));
  const trackLabels = labels.filter((label) => label.startsWith('track:'));
  addCheck(`pr.${pullRequest.number}.metadata`, pullRequest.state === 'MERGED'
    && riskLabels.length === 1
    && trackLabels.length >= 1
    && (pullRequest.number < independentReviewBaselinePr
      || labels.includes('risk:R0')
      || requiredIndependentReviewLabels.every((label) => labels.includes(label)))
    && requiredPrLabels.every((label) => labels.includes(label)), { state: pullRequest.state, labels });
  if (pullRequest.number >= independentReviewBaselinePr && !labels.includes('risk:R0')) {
    const independentReview = inspectIndependentReview(pullRequest.number, { allowMerged: true });
    addCheck(`pr.${pullRequest.number}.independent_review`, independentReview.ok === true, independentReview);
    const statuses = JSON.parse(run('gh', ['api', `repos/${repo}/statuses/${pullRequest.headRefOid}`]));
    const independentStatus = latestStatusForContext(statuses, 'independent-review');
    addCheck(`pr.${pullRequest.number}.independent_review_status`, independentStatus?.state === 'success'
      && statusSourceMatches(pullRequest.number, independentStatus), {
      status: independentStatus || null,
      bootstrap_run: pullRequest.number === 58 ? bootstrapStatusRun : null,
    });
  }
}

if (prNumber) {
  const currentPr = pullRequests.find((candidate) => candidate.number === prNumber);
  const expectedPrState = phase === 'post-merge' ? 'MERGED' : 'OPEN';
  const labels = currentPr?.labels?.map((label) => label.name) || [];
  addCheck('pr.current', Boolean(currentPr)
    && currentPr.state === expectedPrState
    && currentPr.headRefName === activeBranch
    && labels.filter((label) => /^risk:R[0-3]$/.test(label)).length === 1
    && labels.some((label) => label.startsWith('track:'))
    && (prNumber < independentReviewBaselinePr
      || labels.includes('risk:R0')
      || requiredIndependentReviewLabels.every((label) => labels.includes(label)))
    && requiredPrLabels.every((label) => labels.includes(label)), {
    prNumber,
    actual_state: currentPr?.state || null,
    expected_state: expectedPrState,
    head: currentPr?.headRefName || null,
    expected_head: activeBranch,
    labels,
  });
  if (currentPr && prNumber >= independentReviewBaselinePr && !labels.includes('risk:R0')) {
    const independentReview = inspectIndependentReview(prNumber, { allowMerged: phase === 'post-merge' });
    addCheck('pr.current_independent_review', independentReview.ok === true, independentReview);
    const statuses = JSON.parse(run('gh', ['api', `repos/${repo}/statuses/${currentPr.headRefOid}`]));
    const independentStatus = latestStatusForContext(statuses, 'independent-review');
    addCheck('pr.current_independent_review_status', independentStatus?.state === 'success'
      && statusSourceMatches(prNumber, independentStatus), {
      status: independentStatus || null,
      bootstrap_run: prNumber === 58 ? bootstrapStatusRun : null,
    });
  }
}

const report = {
  schema_version: 1,
  kind: 'fdp-codex-control-plane-audit',
  phase,
  ok: errors.length === 0,
  current_wi: state.current_wi?.id,
  pr_number: prNumber,
  expect_control_closed: expectControlClosed,
  checks,
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
