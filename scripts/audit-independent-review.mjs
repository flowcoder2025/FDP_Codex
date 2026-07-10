#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const marker = '<!-- fdp-independent-review:v1 -->';
const requiredLabels = [
  'needs:blind-review',
  'needs:adversarial-review',
  'pr:independent-review-passed',
];

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] ?? null;
}

function run(command, commandArgs) {
  return execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim();
}

function parseReviewPayload(body) {
  const markerIndex = String(body || '').indexOf(marker);
  if (markerIndex === -1) return null;
  const match = /```json\s*([\s\S]*?)```/i.exec(String(body).slice(markerIndex + marker.length));
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function evaluate({ pullRequest, reviews }) {
  const labels = pullRequest.labels.map((label) => typeof label === 'string' ? label : label.name);
  const markedReviews = reviews
    .map((review) => ({ review, payload: parseReviewPayload(review.body) }))
    .filter((item) => item.payload)
    .sort((left, right) => Number(left.review.id) - Number(right.review.id));
  const latest = markedReviews.at(-1) || null;
  const payload = latest?.payload || null;
  const review = latest?.review || null;
  const findings = payload?.findings || {};
  const blockingFindings = ['P0', 'P1', 'P2']
    .flatMap((severity) => Array.isArray(findings[severity]) ? findings[severity] : []);
  const p3Findings = Array.isArray(findings.P3) ? findings.P3 : [];
  const allowedSurfaces = new Set(['multi_agent_v1', 'separate_codex_thread', 'human_reviewer']);

  const checks = {
    'pr.open': pullRequest.state === 'OPEN',
    'pr.required_labels': requiredLabels.every((label) => labels.includes(label)),
    'pr.merge_approval_absent': !labels.includes('pr:approved-merge'),
    'review.latest_marker_present': Boolean(latest),
    'review.github_head_anchor': Boolean(review)
      && review.commit_id === pullRequest.headRefOid
      && payload?.reviewed_head === pullRequest.headRefOid,
    'review.independent_clean_context': Boolean(payload)
      && payload.kind === 'fdp-independent-blind-adversarial-review'
      && payload.schema_version === 1
      && payload.reviewer_role === 'independent-adversarial-reviewer'
      && typeof payload.reviewer_agent_id === 'string'
      && payload.reviewer_agent_id.length >= 8
      && payload.reviewer_agent_id !== 'controller'
      && payload.agent_separation_declared === true
      && payload.context_mode === 'blind-clean'
      && payload.fork_context === false
      && payload.implementation_context_received === false
      && allowedSurfaces.has(payload.execution_surface),
    'review.evidence_shape': Boolean(payload)
      && Array.isArray(payload.reviewed_files)
      && payload.reviewed_files.length > 0
      && Array.isArray(payload.evidence)
      && payload.evidence.length > 0
      && Array.isArray(payload.commands)
      && payload.commands.length > 0
      && Array.isArray(payload.attacks_attempted)
      && payload.attacks_attempted.length > 0
      && ['P0', 'P1', 'P2', 'P3'].every((severity) => Array.isArray(findings[severity]))
      && Array.isArray(payload.residual_risks),
    'review.verdict_pass': payload?.verdict === 'PASS',
    'review.no_blocking_findings': blockingFindings.length === 0,
    'review.p3_dispositions': p3Findings.every((finding) => typeof finding?.disposition === 'string'
      && finding.disposition.trim().length > 0),
    'review.github_state': ['COMMENTED', 'APPROVED'].includes(review?.state),
  };
  const errors = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([id]) => ({
      id,
      detail: id === 'review.no_blocking_findings' ? blockingFindings : null,
    }));

  return {
    checks,
    errors,
    latest_review_id: review?.id || null,
    reviewer_agent_id: payload?.reviewer_agent_id || null,
    reviewed_head: payload?.reviewed_head || null,
    verdict: payload?.verdict || null,
  };
}

function selfTest() {
  const head = '1111111111111111111111111111111111111111';
  const payload = {
    schema_version: 1,
    kind: 'fdp-independent-blind-adversarial-review',
    reviewer_role: 'independent-adversarial-reviewer',
    reviewer_agent_id: 'agent-12345678',
    agent_separation_declared: true,
    execution_surface: 'multi_agent_v1',
    context_mode: 'blind-clean',
    fork_context: false,
    implementation_context_received: false,
    reviewed_head: head,
    verdict: 'PASS',
    findings: { P0: [], P1: [], P2: [], P3: [] },
    reviewed_files: ['scripts/audit-independent-review.mjs'],
    evidence: ['git diff origin/main...HEAD'],
    commands: ['npm.cmd run ci:check'],
    attacks_attempted: ['stale-head replay'],
    residual_risks: [],
  };
  const pullRequest = {
    state: 'OPEN',
    headRefOid: head,
    labels: requiredLabels.map((name) => ({ name })),
  };
  const review = {
    id: 1,
    state: 'COMMENTED',
    commit_id: head,
    body: `${marker}\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``,
  };
  const valid = evaluate({ pullRequest, reviews: [review] });
  const stale = evaluate({
    pullRequest: { ...pullRequest, headRefOid: '2222222222222222222222222222222222222222' },
    reviews: [review],
  });
  const inherited = evaluate({
    pullRequest,
    reviews: [{
      ...review,
      body: `${marker}\n\n\`\`\`json\n${JSON.stringify({ ...payload, fork_context: true })}\n\`\`\``,
    }],
  });
  const finding = evaluate({
    pullRequest,
    reviews: [{
      ...review,
      body: `${marker}\n\n\`\`\`json\n${JSON.stringify({
        ...payload,
        findings: { ...payload.findings, P2: [{ title: 'bypass' }] },
      })}\n\`\`\``,
    }],
  });
  const p3WithoutDisposition = evaluate({
    pullRequest,
    reviews: [{
      ...review,
      body: `${marker}\n\n\`\`\`json\n${JSON.stringify({
        ...payload,
        findings: { ...payload.findings, P3: [{ title: 'residual' }] },
      })}\n\`\`\``,
    }],
  });
  const missingLabel = evaluate({
    pullRequest: { ...pullRequest, labels: pullRequest.labels.slice(1) },
    reviews: [review],
  });
  const prematureApproval = evaluate({
    pullRequest: { ...pullRequest, labels: [...pullRequest.labels, { name: 'pr:approved-merge' }] },
    reviews: [review],
  });
  const result = {
    schema_version: 1,
    kind: 'fdp-independent-review-audit-self-test',
    ok: valid.errors.length === 0
      && stale.errors.some((item) => item.id === 'review.github_head_anchor')
      && inherited.errors.some((item) => item.id === 'review.independent_clean_context')
      && finding.errors.some((item) => item.id === 'review.no_blocking_findings')
      && p3WithoutDisposition.errors.some((item) => item.id === 'review.p3_dispositions')
      && missingLabel.errors.some((item) => item.id === 'pr.required_labels')
      && prematureApproval.errors.some((item) => item.id === 'pr.merge_approval_absent'),
    cases: {
      valid_passes: valid.errors.length === 0,
      stale_head_rejected: stale.errors.some((item) => item.id === 'review.github_head_anchor'),
      inherited_context_rejected: inherited.errors.some((item) => item.id === 'review.independent_clean_context'),
      blocking_finding_rejected: finding.errors.some((item) => item.id === 'review.no_blocking_findings'),
      p3_without_disposition_rejected: p3WithoutDisposition.errors.some((item) => item.id === 'review.p3_dispositions'),
      missing_label_rejected: missingLabel.errors.some((item) => item.id === 'pr.required_labels'),
      premature_merge_approval_rejected: prematureApproval.errors.some((item) => item.id === 'pr.merge_approval_absent'),
    },
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (args.includes('--self-test')) {
  selfTest();
} else {
  const prNumber = Number(valueAfter('--pr'));
  if (!prNumber) throw new Error('--pr is required');
  const repo = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
  const pullRequest = JSON.parse(run('gh', [
    'pr', 'view', String(prNumber),
    '--json', 'number,state,headRefOid,headRefName,labels,url',
  ]));
  const reviews = JSON.parse(run('gh', [
    'api', '--method', 'GET',
    `repos/${repo}/pulls/${prNumber}/reviews`,
    '-f', 'per_page=100',
  ]));
  const evaluation = evaluate({ pullRequest, reviews });
  const report = {
    schema_version: 1,
    kind: 'fdp-independent-review-audit',
    ok: evaluation.errors.length === 0,
    pr_number: prNumber,
    pr_url: pullRequest.url,
    head: pullRequest.headRefOid,
    ...evaluation,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
