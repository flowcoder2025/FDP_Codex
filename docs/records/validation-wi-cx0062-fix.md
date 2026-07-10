# WI-CX0062-fix Validation Record

Status: validated.

Date: 2026-07-10.

## Scope

Reconcile the live GitHub, Git, Codex task, worktree, automation, KI, PR metadata, and handoff lifecycle, then install an executable control-plane audit and post-merge closeout contract.

## Strategy

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: trust live operational evidence over file-only completion claims.
- Validator stance: require truthful Issue/PR state, exact branch/worktree retention, retired automation, and live post-merge proof without weakening provider, dogfood, release, dependency, API, external-contract, or authority boundaries.

## Fresh Context

- Context pack: `ctx-wi-cx0062-fix-20260710131943`.
- Timestamp: `2026-07-10T13:19:43.723Z`.
- 16 metadata-only ledger entries.
- `contains_chunk_bodies: false`.

## Pre-Reconciliation Findings

- Repository KIs identified: 10. GitHub Issues: 0.
- PR #33 through #45 were merged with no workflow labels.
- Four live remote branches remained after merged PR #37 through #40. Their remote SHA exactly matched each merged PR head SHA.
- Local Git retained four corresponding merged branches.
- Exact-title Codex query returned 32 `FDP_Codex A2 Worktree WI Runner` tasks, all `notLoaded`.
- Git registered ten historical runner worktrees in addition to the canonical checkout; the worktree root contained 22 directories.
- No matching active FDP_Codex Codex or Node runner process existed.
- The hourly worktree automation was `PAUSED`, but its persistent task/worktree topology conflicted with the accepted single-controller model.
- Handoff still instructed publication of WI-CX0061 after PR #45 had already merged.

## GitHub Reconciliation

- Created historical KI Issues #46 through #55 with every required KI field and an explicit notice that the Issues did not exist at original merge time.
- Closed Issues #46 through #54 only with linked repayment PRs and validation records. Each closure repeats the historical-backfill disclosure.
- Left KI-CX-PROVIDER-001 open as Issue #55.
- Opened KI-CX-CONTROL-001 as Issue #56 for this reconciliation.
- Added reconstructed approval, risk, track, validation, ready, and merge labels to PR #33 through #45.
- Added a comment to every repaired PR stating that labels were absent at merge and that backfill is not contemporaneous gate evidence.
- Attached pre-cleanup live evidence to Issue #56 before destructive cleanup.

## Local And App Reconciliation

- Archived all 32 exact-title runner tasks; a repeated visible-task query returned zero.
- Deleted automation `fdp-codex-a2-worktree-wi-runner`; its final snapshot was an hourly worktree cron.
- Task archival removed all ten registered historical worktrees. `git worktree list --porcelain` now contains only `C:\dev\FDP_Codex`.
- Verified the twelve remaining worktree root directories were inside `C:\Users\User\.codex\worktrees`, contained only one empty `FDP_Codex` child, and had no `.git` metadata before deletion.
- Deleted the four local branches only after checking their exact expected PR-head SHA.
- Deleted the four remote branches only after checking GitHub PR #37 through #40 were merged and their live remote SHA matched the PR head SHA.
- Ran `git fetch --prune origin`; local and remote branch views then contained only `main` before this WI branch was created.

## Executable Guard

- `scripts/audit-control-plane.mjs` checks clean checkout state, phase-specific local and live remote branch sets, single registered worktree, zero residual Codex worktree directories, retired automation absence, every machine-state KI Issue and severity label, PR metadata from baseline PR #33, and current PR state.
- The repository script cannot query Codex app task visibility directly. The controller must repeat the exact-title app task query at post-merge closeout; the script separately verifies the recorded 32 archived / zero visible result and local residue.
- `npm run audit:control-plane -- --phase working` is the pre-publication check.
- `npm run audit:control-plane -- --phase pr --pr <number>` is the ready-PR check.
- `npm run audit:control-plane -- --phase post-merge --pr <number>` verifies merge and cleanup while Issue #56 remains open.
- `npm run audit:control-plane -- --phase post-merge --pr <number> --expect-control-closed` verifies the final Issue closure state.
- Repository validator checks the decision, policy, state, handoff, audit command, manifest registration, and this record. Live GitHub state remains the audit command's responsibility rather than a keyword-only substitute.

## Verification

- `npm.cmd run ci:check`: passed after integration.
- `git diff --check`: passed.
- Working-phase live control-plane audit: passed after commit with only `main` and the WI branch locally, `main` only remotely, one worktree, zero worktree directories, no retired automation, truthful KI Issues, and repaired PR metadata.
- PR-phase and post-merge audit evidence are attached to PR #57 and Issue #56 respectively during closeout.

## Post-Merge Contract

KI-CX-CONTROL-001 uses status `repaid-on-merge`. Issue #56 remains open while the PR is open. After PR merge and branch cleanup, the controller runs the open-Issue post-merge audit, closes Issue #56 with that result, and reruns the audit with `--expect-control-closed`. The merged repository state remains truthful without requiring an additional commit whose sole purpose is to narrate the preceding merge.

## Boundaries

- KI-CX-PROVIDER-001 / Issue #55 remains open.
- WI-CX0060-test, dogfood continuation, and unattended model workers remain blocked.
- The retired hourly runner was not replaced or reactivated.
- The Layer 2 target was not touched.
- No first Layer 2 scaffold generation occurred in this WI.
- No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred.
- Destructive operations were limited to the user-approved, pre-verified retired tasks, empty worktree shells, and exact merged branch heads preserved in Issue #56 evidence.
- No destructive filesystem or git operation occurred outside that user-approved and pre-verified cleanup scope.
