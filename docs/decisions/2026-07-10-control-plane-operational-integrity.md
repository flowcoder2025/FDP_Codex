# Decision: Control-Plane Operational Integrity

Status: accepted-v0.

Date: 2026-07-10.

## Context

The repository had strong file-level policies and validators but the live operating lifecycle drifted. Ten historical KIs had no GitHub Issues, PR #33 through #45 had no workflow labels at merge, four merged remote branches remained, 32 hourly runner tasks accumulated, ten registered worktrees and twelve empty worktree shells remained, and handoff state lagged merged PR state.

The user identified that this contradicted the original goal: a trustworthy Codex-native workflow operating system, not a collection of green local documents.

## Decision

FDP_Codex treats live control-plane state as a first-class verification surface.

- Every KI in the public repository has a GitHub Issue before related PR merge.
- Historical backfill is explicitly marked as backfill and never presented as contemporaneous compliance.
- Required PR labels are checked against GitHub, not only against `.github/labels.yml`.
- A WI closeout includes Issue state, PR state, branch deletion, worktree/task cleanup, stale-ref pruning, clean canonical main, and a live control-plane audit.
- Codex app task visibility is re-queried through the app task surface during closeout because the repository script has no app-task API. The script verifies the recorded zero-task result and local residue; both proofs are required.
- Post-validation merge state is read from GitHub. Handoff files point to that live probe instead of requiring an endless repository-only closeout commit.
- The hourly worktree cron is retired. The accepted topology is one visible controller plus bounded workers without app-task fan-out.

The executable audit surface is:

```text
npm run audit:control-plane -- --phase working
npm run audit:control-plane -- --phase pr --pr <number>
npm run audit:control-plane -- --phase post-merge --pr <number>
npm run audit:control-plane -- --phase post-merge --pr <number> --expect-control-closed
```

## Reconciliation

The approved reconciliation backfills Issues #46 through #55, opens control-plane KI #56, adds truthful historical comments and labels to PR #33 through #45, archives 32 runner tasks, deletes the cron automation, removes stale worktrees and directories, and deletes merged branches after exact PR-head verification.

KI-CX-CONTROL-001 is repaid on merge only after the open-Issue post-merge audit passes, Issue #56 is closed with that evidence, and the closed-Issue audit passes. KI-CX-PROVIDER-001 remains open as Issue #55 and continues to block WI-CX0060, dogfood continuation, unattended model workers, and runner reactivation.

## Boundary

This decision does not resume dogfood, authorize a model-provider workaround, publish a release, deploy, publish a package, submit an OSS application, add a production dependency, change a public API or external contract, expand A2/A3 authority, execute S2, or create a separate reviewer.
