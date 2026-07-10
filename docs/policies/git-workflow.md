# Git Workflow Policy

Status: accepted-v0.

## Purpose

Keep FDP_Codex work auditable from WI selection through branch creation, verification, PR review, merge, branch deletion, and handoff.

This policy fills the lifecycle gap left by the naming policy. `docs/policies/naming-and-commits.md` defines names. This policy defines when and how those names are used.

## Scope

This policy applies to Layer 1 work in this repository.

Layer 2 target projects may reuse this policy, but they must record their own branch, issue, merge, and publication rules in the target project manifest or handoff.

## Branch-First Rule

Every non-trivial WI after bootstrap must use a dedicated branch.

Branch format is defined in `docs/policies/naming-and-commits.md`:

```text
wi/cxNNNN-category-short-slug
```

Work on `main` is allowed only for:

- repository bootstrap before this policy exists,
- read-only inspection,
- explicit user-approved repair,
- merge commits created by the hosting platform after approval.

The current bootstrap exception is recorded because local scaffold files were created before this policy was locked. Before any push or PR, the local branch must reconcile with `origin/main`.

## Lifecycle

1. Triage selects one WI from `.flowset/fix_plan.md`.
2. Build a fresh context pack from `docs/manifest.yaml`.
3. Fetch the remote default branch when network permission allows it.
4. Check the working tree and identify unrelated local changes.
5. Create a WI branch from `main`, `origin/main`, or another recorded approved base.
6. Record the branch in `.flowset/current-wi.md`.
7. Implement the WI.
8. Verify according to `docs/policies/verification-economy.md` and `docs/policies/triage-strategy.md`.
9. Update SSOT files, records, handoff, and context ledger metadata.
10. Commit with the subject format from `docs/policies/naming-and-commits.md`.
11. Push only when an approval envelope explicitly allows git publication.
12. Open a draft PR unless the approval envelope allows a ready PR.
13. Keep the PR linked to the WI, validation record, related KI issues, and Decision Needed items.
14. Move the PR out of draft only after required validation and review evidence exists.
15. Merge only after user or maintainer approval, required labels, and verification debt repayment.
16. Delete the branch after merge.
17. Record the merge, branch deletion, or pending branch state in handoff.

## Post-Merge Closeout

GitHub owns live PR and Issue state after the validation commit is created. Repository handoff files must not claim that a validated WI still needs publication without first querying the live PR.

After merge, the controller must:

1. verify the PR is merged and required labels are present;
2. verify every related KI Issue has truthful open or closed state and repayment evidence;
3. delete the merged remote and local WI branch;
4. remove or archive the WI worktree and user-visible worker task, then re-query the Codex app task surface for zero retired runner tasks;
5. prune stale remote-tracking refs;
6. return the canonical checkout to clean `main` equal to `origin/main`;
7. run `npm run audit:control-plane -- --phase post-merge --pr <number>`;
8. attach the audit result to the control-plane Issue or PR before closing the WI repayment Issue;
9. close the repayment Issue with that evidence and rerun the audit with `--expect-control-closed`.

The closeout evidence is operational GitHub evidence. A new repository commit solely to say that the preceding PR merged is not required.

## PR Readiness

A PR is not ready for merge until:

- the PR title uses the canonical WI id,
- the branch name matches the WI,
- the PR body links the WI scope and validation evidence,
- all R2/R3 verification debt required before merge is repaid,
- required blind or adversarial review is complete when policy requires it,
- `needs:blind-review`, `needs:adversarial-review`, and `pr:independent-review-passed` are present for non-trivial R1/R2/R3 work,
- `npm run audit:independent-review -- --pr <number>` passes against the current PR head,
- the required `independent-review` commit status succeeds against the current PR head,
- branch protection binds that status to the GitHub Actions app and the control-plane audit verifies the binding,
- relevant KI issues are linked or explicitly deferred,
- no Decision Needed item blocks the merge,
- `pr:approved-merge` or an equivalent maintainer approval signal is present.

## Independent Review Merge Gate

For every non-trivial R1, R2, or R3 WI:

1. finish implementation and deterministic validation;
2. push the final candidate head and open the PR without `pr:approved-merge`;
3. start a separate blind reviewer with no inherited implementation context;
4. attach the structured result as a GitHub PR review anchored to the candidate head;
5. resolve every P0, P1, and P2 finding;
6. if the head changes, discard the prior result and repeat the separate review;
7. apply `pr:independent-review-passed` only for PASS with no blocking finding;
8. run `npm run audit:independent-review -- --pr <number>`;
9. require the protected `independent-review` commit status to succeed;
10. only after the audit and required status pass, apply `pr:approved-merge`.

The status publisher uses per-PR concurrency with superseded-run cancellation, publishes `pending` before evaluation, reads live review evidence twice, and publishes success only when both reads identify the same passing head and review id. A status from an unbound publisher does not satisfy the gate.

The implementing controller may relay the independent agent's exact result to GitHub when the reviewer has no GitHub identity, but it must record the reviewer agent id and may not rewrite the verdict or findings. A relayed review is not independent evidence unless the result declares clean context and the GitHub review is anchored to the current head.

The current orchestrator receipt is controller-attested rather than signed by the execution platform. KI-CX-REVIEW-001 blocks unattended or generalized automated merge, A2/A3 authority expansion, and release-boundary use until reviewer provenance is machine-verifiable.

Public PR merge is a verification debt repayment boundary.

## Git Hard Stops

Stop before:

- pushing without an approval envelope,
- merging without explicit user or maintainer approval,
- deleting a remote branch before merge evidence exists,
- force pushing or rewriting shared history,
- tagging or publishing a release,
- changing repository visibility,
- changing license files or license policy,
- overwriting unrelated local changes.

## Dirty Worktree Rule

When local changes exist, classify them before editing:

- current WI changes,
- prior bootstrap changes,
- user changes,
- generated or temporary files,
- unknown changes.

Do not revert user or unknown changes unless the user explicitly asks for it.

If unrelated changes block safe work, record the blocker in handoff and stop.

## Controller-Owned Git Boundary For Ephemeral Workers

An ephemeral CLI worker running under `workspace-write` may implement and validate a WI on a dedicated branch that the controller created before delegation. This is still branch-first work and is not an exception that permits implementation on `main`.

The worker owns repository reconstruction, worktree edits, and validation. The controller owns branch creation, staged review, commit, push, PR, and merge. Before creating the commit, the controller must inspect the complete diff, verify that the worker stayed inside the approved WI, and rerun the relevant repository validation.

Do not grant `danger-full-access` solely so an ephemeral worker can modify `.git`. A separately installed Codex app worktree automation may own Git operations only when its own approved contract and runtime capability evidence explicitly allow them.

## Evidence

Each completed WI should leave evidence in at least one of:

- `docs/records/validation-*.md`,
- PR body or review record,
- commit history,
- `.flowset/handoff.md`,
- linked GitHub issues for KI repayment.

For public FDP_Codex KI work, linked GitHub Issue evidence is mandatory rather than optional.

`fix_plan.md` remains a compact live backlog. It must not become the completed-history store.

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.
