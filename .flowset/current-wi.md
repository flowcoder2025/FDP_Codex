# Current WI

WI id: WI-CX0062-fix

Category: fix

Title: Control-Plane Integrity Reconciliation

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0062-fix-control-plane-integrity-reconciliation

Approval envelope: the user approved the recommended full control-plane integrity reset. This WI may backfill truthful GitHub Issue and PR metadata, archive runner tasks, retire the hourly worktree automation, remove exact verified stale worktrees/directories and merged branches, implement the live audit, publish and merge the reconciliation PR, and close KI-CX-CONTROL-001 only after post-merge audit evidence. Existing exclusions remain: dogfood continuation, provider-policy workaround, target remote or publication, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, A2/A3 authority expansion, S2 execution, and separate reviewer creation.

## Scope

Restore the live WI/KI/PR/branch/worktree/task lifecycle to the original single-controller FDP_Codex goal and install an executable audit that prevents file-only false-green completion.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: trust live GitHub, Git, Codex task, automation, and worktree evidence over narrative completion claims.
- Validator stance: require linked Issue state, PR metadata, exact branch/worktree retention, retired automation, truthful backfill disclosure, and post-merge closeout while preserving provider, dogfood, release, authority, dependency, API, and external-contract boundaries.

## Verification Plan

- Backfill all historical KI Issues with explicit non-contemporaneous disclosure and close only evidence-proven repayments.
- Backfill PR #33 through #45 labels with explicit historical comments.
- Archive all retired runner tasks, delete the hourly automation, and remove only verified clean/empty worktree state.
- Delete local and remote merged branches only after exact PR-head verification and prune stale refs.
- Add `npm run audit:control-plane` with working, PR, and post-merge phases.
- Run repository, type, diff, live GitHub, branch, worktree, Issue, PR-label, and post-merge checks before completion.

## Completion Evidence

- Context pack `ctx-wi-cx0062-fix-20260710131943`; timestamp `2026-07-10T13:19:43.723Z`; 16 metadata-only ledger entries; no chunk bodies.
- Historical KI Issues #46 through #55 exist; #46 through #54 are closed with repayment evidence and #55 remains open.
- KI-CX-CONTROL-001 is open as Issue #56 and is repaid on merge only after the post-merge audit passes.
- PR #33 through #45 carry reconstructed workflow labels plus comments that disclose the metadata was absent at merge time.
- Thirty-two retired runner tasks were archived, the hourly automation was deleted, residual Codex worktree directories are zero, and local/remote branches contain only the active lifecycle set.
- Accepted decision `docs/decisions/2026-07-10-control-plane-operational-integrity.md` and validation record `docs/records/validation-wi-cx0062-fix.md` define the repair and evidence.

## Open Known Issues

- KI-CX-PROVIDER-001 / Issue #55 remains open and blocks WI-CX0060-test, dogfood continuation, unattended model workers, and runner reactivation.
- KI-CX-CONTROL-001 / Issue #56 remains open until this WI merges, branch/task closeout completes, and the post-merge audit evidence is attached.

## Boundary

The legacy hourly A2 runner is retired. The Layer 2 target was not touched. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation reactivation, replacement automation creation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. Destructive cleanup was limited to the user-approved, pre-verified retired tasks, empty worktree shells, and exact merged branch heads recorded in Issue #56.
