# Current WI

WI id: WI-CX0054-fix

Category: fix

Title: Runtime Snapshot State Reconciliation

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0054-fix-runtime-snapshot-state-reconciliation

Approval envelope: the user approved the recommended dogfood path using a separate target at `C:\dev\FDP_Codex_Dogfood`. This prerequisite WI may reconcile Layer 1 runtime state, validation, records, and handoff locally. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation reactivation or authority expansion, separate reviewer creation, S2 execution, first Layer 2 target-project scaffold generation, push, and merge.

## Scope

Reconcile the historical WI-CX0048 runtime snapshot with the current WI-CX0052 worktree isolation result before FDP_Codex creates its first Layer 2 dogfood scaffold.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: remove the false-green state contradiction without rewriting historical control-plane evidence.
- Validator stance: require the historical snapshot, current state, and WI-CX0052 superseding evidence to agree.

## Verification Plan

- Preserve the original WI-CX0048 runner and `not_proven` observations.
- Mark the old runtime snapshot as `historical-superseded` by WI-CX0052.
- Record current proven receiver and worktree isolation state in `.flowset/state.json`.
- Preserve the paused automation state and generalized A2/A3 hard stops.
- Update the runtime snapshot specification and repository validator.
- Register the WI-CX0054 decision and validation record.
- Keep WI-CX0038 as the next Layer 2 scope-code decision WI.
- Run `node --check scripts\validate-repo.mjs`, `npm run validate`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md`
- `docs/records/validation-wi-cx0054-fix.md`
- `.flowset/runtime-snapshot.json`
- `.flowset/state.json`
- `.flowset/current-wi.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/specifications/runtime-snapshot.md`
- `docs/manifest.yaml`
- `docs/index.md`
- `docs/records/README.md`
- `scripts/validate-repo.mjs`

## Decision Needed

- The Layer 2 target is `C:\dev\FDP_Codex_Dogfood`; the recommended accepted project scope code is `FCD`, to be recorded by WI-CX0038 after this prerequisite merges.
- First Layer 2 scaffold generation remains blocked until WI-CX0038 records the accepted code.
- S2 blind review repayment remains DQ-DEBT before generalized A2/A3 expansion.
