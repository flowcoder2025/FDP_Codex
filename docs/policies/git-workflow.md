# Git Workflow Policy

Status: draft.

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

## PR Readiness

A PR is not ready for merge until:

- the PR title uses the canonical WI id,
- the branch name matches the WI,
- the PR body links the WI scope and validation evidence,
- all R2/R3 verification debt required before merge is repaid,
- required blind or adversarial review is complete when policy requires it,
- relevant KI issues are linked or explicitly deferred,
- no Decision Needed item blocks the merge,
- `pr:approved-merge` or an equivalent maintainer approval signal is present.

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

## Evidence

Each completed WI should leave evidence in at least one of:

- `docs/records/validation-*.md`,
- PR body or review record,
- commit history,
- `.flowset/handoff.md`,
- linked GitHub issues for KI repayment.

`fix_plan.md` remains a compact live backlog. It must not become the completed-history store.

## Decision Needed

- Whether FDP_Codex should allow A2 autopilot to push draft PR branches after local validation.
- Whether branch deletion may be automatic after squash merge.
- Whether first bootstrap publication should be a direct reconciliation PR or a protected bootstrap exception.
