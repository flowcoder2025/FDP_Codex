# Decision: Runtime Snapshot State Reconciliation

Status: accepted.

Date: 2026-07-10.

WI: WI-CX0054-fix.

## Context

WI-CX0048 captured an A2 control-plane audit where handoff receiver confidence and worktree isolation were `not_proven`. WI-CX0052 later satisfied the repair gate and recorded worktree isolation as proven, but `.flowset/runtime-snapshot.json` still looked like live current state and `.flowset/state.json` did not expose the superseding result.

That mismatch allowed repository validation to pass while two operating surfaces appeared to disagree immediately before the first Layer 2 dogfood scaffold.

## Decision

Runtime snapshots are point-in-time evidence. A later WI may supersede a captured status without rewriting the original observation.

When that happens:

- the old snapshot uses `snapshot_status: historical-superseded`;
- `superseded_by` names the WI, validation record, and result that changed the status;
- the original runner and control-plane observations remain intact;
- `.flowset/state.json` owns the current control-plane status and links to the superseding evidence;
- the repository validator checks the historical snapshot, current state, and superseding record together.

WI-CX0052 is the superseding evidence for worktree isolation. The A2 runner remains paused. Generalized A2/A3 expansion remains blocked by S2 review and future approval gates.

## Consequences

Historical audit evidence remains trustworthy while current flow-state consumers no longer mistake an old failure for the active status.

The Layer 2 project scope-code decision and first scaffold remain separate work. This decision only removes the false-green state contradiction that would make dogfood evidence unreliable.

## Boundary

This decision does not generate a Layer 2 scaffold, create the dogfood target directory, reactivate or modify automation, expand A2/A3 authority, execute S2 review, publish a release, deploy, publish a package, submit to an OSS program, add a production dependency, change a public API or external contract, or authorize push or merge.
