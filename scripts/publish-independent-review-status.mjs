#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const context = 'independent-review';

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

function readAudit(prNumber) {
  const commandArgs = [
    'scripts/audit-independent-review.mjs',
    '--pr', String(prNumber),
    '--allow-merge-approved',
  ];
  try {
    return JSON.parse(run(process.execPath, commandArgs));
  } catch (caught) {
    const stdout = caught?.stdout?.toString?.().trim() || '';
    try {
      return JSON.parse(stdout);
    } catch {
      return {
        ok: false,
        head: null,
        latest_review_id: null,
        errors: [{
          id: 'audit.execution_failed',
          detail: caught?.stderr?.toString?.().trim() || caught?.message || String(caught),
        }],
      };
    }
  }
}

function isStablePass(first, latest) {
  return first?.ok === true
    && latest?.ok === true
    && first.head === latest.head
    && first.latest_review_id === latest.latest_review_id
    && first.reviewed_head === latest.reviewed_head
    && first.verdict === 'PASS'
    && latest.verdict === 'PASS';
}

function selfTest() {
  const pass = {
    ok: true,
    head: '1111111111111111111111111111111111111111',
    latest_review_id: 10,
    reviewed_head: '1111111111111111111111111111111111111111',
    verdict: 'PASS',
  };
  const result = {
    schema_version: 1,
    kind: 'fdp-independent-review-status-publisher-self-test',
    cases: {
      stable_pass_accepted: isStablePass(pass, { ...pass }),
      newer_failure_rejected: !isStablePass(pass, {
        ...pass,
        ok: false,
        latest_review_id: 11,
        verdict: 'FAIL',
      }),
      changed_review_rejected: !isStablePass(pass, { ...pass, latest_review_id: 11 }),
      changed_head_rejected: !isStablePass(pass, {
        ...pass,
        head: '2222222222222222222222222222222222222222',
      }),
      initial_failure_rejected: !isStablePass({ ...pass, ok: false }, pass),
    },
  };
  result.ok = Object.values(result.cases).every(Boolean);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function publishStatus(repo, head, state, description, targetUrl) {
  const commandArgs = [
    'api', '--method', 'POST',
    `repos/${repo}/statuses/${head}`,
    '-f', `state=${state}`,
    '-f', `context=${context}`,
    '-f', `description=${description}`,
  ];
  if (targetUrl) commandArgs.push('-f', `target_url=${targetUrl}`);
  run('gh', commandArgs);
}

if (args.includes('--self-test')) {
  selfTest();
} else {
  const prNumber = Number(valueAfter('--pr'));
  if (!prNumber) throw new Error('--pr is required');
  const targetUrl = valueAfter('--target-url') || '';
  const repo = run('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
  const pullRequest = JSON.parse(run('gh', [
    'pr', 'view', String(prNumber),
    '--json', 'headRefOid,url',
  ]));

  publishStatus(repo, pullRequest.headRefOid, 'pending', 'Independent review audit in progress', targetUrl);
  const first = readAudit(prNumber);
  const latest = readAudit(prNumber);
  const stablePass = isStablePass(first, latest);
  const latestHead = latest.head || pullRequest.headRefOid;
  const headStable = latestHead === pullRequest.headRefOid;
  const success = stablePass && headStable;
  const reviewId = latest.latest_review_id || 'none';
  publishStatus(
    repo,
    pullRequest.headRefOid,
    success ? 'success' : 'failure',
    success
      ? `Independent review ${reviewId} passed current head`
      : 'Independent review missing, changed, stale, or blocking',
    targetUrl,
  );

  const report = {
    schema_version: 1,
    kind: 'fdp-independent-review-status-publication',
    ok: success,
    pr_number: prNumber,
    pr_url: pullRequest.url,
    head: pullRequest.headRefOid,
    context,
    first_audit: first,
    latest_audit: latest,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
