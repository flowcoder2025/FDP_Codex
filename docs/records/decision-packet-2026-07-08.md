# Decision Packet: 2026-07-08 Autonomous Bootstrap

Status: review-needed.

Purpose: summarize the decisions needed after the autonomous FDP_Codex bootstrap work.

This record does not approve execution. It gives the user a compact decision surface.

## Current Confirmed State

- Repository remote: `https://github.com/flowcoder2025/FDP_Codex.git`.
- Repository visibility: private during bootstrap.
- License: Apache-2.0.
- Remote `origin/main` exists and contains an initial Apache-2.0 `LICENSE` commit.
- Local scaffold has no local commit yet.
- Active local branch: `wi/cx0007-docs-github-workflow-governance`.
- `npm run validate` passes.
- `npm run context:pack` outputs metadata only.
- No push, PR, merge, tag, release, visibility change, remote label mutation, GitHub Actions workflow, or reset was performed.

## Recommended Decisions

1. Bootstrap reconciliation execution path

Recommended: use a clean temporary clone or worktree based on `origin/main`.

Reason: it avoids hidden `git reset` or index manipulation in the current no-commit workspace and keeps the PR branch based on remote history.

2. First commit shape

Recommended: one combined bootstrap PR with one or a small number of commits, with the commit body listing WI-CX0001 through the latest validated WI.

Reason: early WIs were created before branch lifecycle policy existed, so preserving perfect WI-per-branch history is less valuable than avoiding unrelated-history PR problems.

3. Git publication envelope

Recommended: approve push of the bootstrap reconciliation branch and creation of a draft PR only. Do not approve merge yet.

Reason: this gives GitHub-visible review without crossing the merge/publication boundary.

4. GitHub labels

Recommended: apply labels while the repository is still private, after the bootstrap PR path is clear.

Reason: labels are operational metadata and should be tested before external contributors can use them.

5. GitHub Actions / CI

Recommended: defer GitHub Actions until after the first bootstrap PR branch exists and `npm run validate` is stable in that branch.

Reason: adding CI changes remote execution behavior once pushed.

6. Public release and OSS readiness

Recommended: do not start OSS readiness until the first public release scope is explicitly defined.

Reason: README, contribution policy, issue intake, and roadmap need a known public promise boundary.

7. Blind and adversarial review surface

Recommended: use a separate Codex thread for blind independent review and keep adversarial review as a checklist-driven reviewer role. Require human maintainer review before public release.

Reason: this gives independence without pretending automated review is equivalent to final governance approval.

8. Context pack output persistence

Recommended: keep context pack output stdout-only by default. Add file output later only for metadata files under an explicit command.

Reason: stdout-only minimizes stale context pack reuse.

9. Ledger append behavior

Recommended: keep ledger append explicit for now.

Reason: automatic ledger append can create misleading evidence if a context pack is generated but not actually used.

10. Strict YAML parser

Recommended: defer adding a YAML dependency until manifest complexity exceeds the local subset parser.

Reason: the current parser is sufficient for the current manifest and avoids a new dependency during bootstrap.

11. Flow-state schema

Recommended: keep Markdown flow-state files for now, but add machine-readable state if handoff/current-wi/fix_plan grow beyond validator-friendly structure.

Reason: the current files are human-readable and validator-checked, but future automation may need stricter structure.

## Approval Envelope Candidate

If the user wants to proceed with GitHub publication work, a narrow safe envelope would be:

- allowed: clean temporary clone or worktree based on `origin/main`,
- allowed: copy current scaffold into a reconciliation branch,
- allowed: run `npm run validate`,
- allowed: create local commit on the reconciliation branch,
- allowed only if explicitly approved: push branch,
- allowed only if explicitly approved: open draft PR,
- not allowed: merge,
- not allowed: release,
- not allowed: visibility change,
- not allowed: remote label mutation unless separately approved,
- not allowed: GitHub Actions workflow unless separately approved.

## Blocked Until User Decision

- Any local commit intended for publication.
- Any push or draft PR.
- Any merge or branch deletion.
- Any remote label creation or edit.
- Any GitHub Actions workflow addition.
- Any public release or OSS program submission.

## Next Suggested User Response

The smallest useful approval is:

```text
Use a clean temporary worktree, create one bootstrap reconciliation commit, push a draft PR, but do not merge or mutate labels/CI.
```

If the user does not want external GitHub changes yet:

```text
Keep all work local and continue policy/tooling only.
```
