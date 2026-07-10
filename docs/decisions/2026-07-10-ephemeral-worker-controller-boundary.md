# Ephemeral Worker Controller Boundary

Status: accepted-v0.

Date: 2026-07-10.

WI: WI-CX0057-docs.

## Decision

FDP_Codex will use one visible control task plus ephemeral CLI workers as the default clean-context topology for supervised local WI execution.

The control task carries the accumulated goal, project identity, user decisions, approval envelope, and final status. An ephemeral worker is a `codex exec --ephemeral` process that starts without prior conversation bodies, reconstructs the active WI from repository SSOT, edits the assigned worktree, and returns evidence without creating a user-owned Codex app task.

The controller owns repository-supplied script execution and canonical validation in addition to branch creation, staging, commit, push, PR, merge, and approval handling. The worker owns repository reconstruction and worktree edits. A worker does not own remote configuration, publication, authority expansion, or the complete WI Git lifecycle.

Amendment: WI-CX0060-test moves repository-supplied script execution and validation to the visible controller because a workspace-write worker could rewrite any allowed validation script into a nested process launcher.

## Capability Boundary

The default worker sandbox is `workspace-write`. If Git metadata is read-only, the controller pre-creates the dedicated WI branch and later reviews the complete diff, runs repository validation after worker exit, stages, and commits the result. FDP_Codex must not use `danger-full-access` solely to write Git metadata.

Interrupted workers recover from repository SSOT and the actual worktree diff. They do not depend on a previous prompt body or copied context-pack body. Auto-compact and same-thread continuation are not fresh-session evidence.

A separately installed Codex app worktree automation is a different execution surface. It may own Git operations only under its own approved contract and verified runtime capability; that authority is not inherited by ephemeral CLI workers.

## UX Consequence

The user interacts with one stable control task instead of a growing sidebar of runner tasks. Ephemeral worker processes provide clean context without persistent app task fan-out. The controller remains visible and available for intervention while worker results are reviewed before publication.

## Known Issue Repayment

This decision repays KI-CX-DOGFOOD-001 by defining a safe controller-owned Git boundary for the observed `.git` write restriction. It does not prove that an ephemeral worker can own the full Git lifecycle, and it does not authorize broader sandbox access.

KI-CX-CONTEXT-001 remains open for WI-CX0058-fix. The WI-CX0057 context build selected 120 metadata chunks because a changed `handoff` path token matched broad historical `loads_for` metadata; that selection problem is intentionally not mixed into this contract WI.

## Hard Stops

The A2 runner remains `PAUSED`. This decision does not reactivate it, change its prompt or schedule, create target remotes, push the target, create a target PR, expand A2 or A3 authority, execute S2 review, create a separate reviewer, add a production dependency, change a public API or external contract, publish a release, deploy, publish a package, submit to an OSS program, or authorize destructive operations.

## Evidence

- `docs/records/validation-wi-cx0056-test.md`
- `docs/records/validation-wi-cx0057-docs.md`
- `docs/policies/autonomy-and-approval.md`
- `docs/policies/git-workflow.md`
