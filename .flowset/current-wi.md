# Current WI

WI id: WI-CX0048-test

Category: test

Title: Runtime Snapshot Validator

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0048-test-runtime-snapshot-validator

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, and first Layer 2 target-project scaffold generation.

## Scope

Install a repo-visible runtime snapshot and validator for Codex app control-plane evidence: parent thread, goal state, automation config, runner discovery, runner receiver result, and worktree isolation status.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: treat runtime control-plane evidence as required proof before fresh-run, handoff receiver, A2/A3, or Layer 2 confidence claims.
- Validator stance: require `.flowset/runtime-snapshot.json`, runtime snapshot schema/spec registration, runner query-gap evidence, duplicate-stop receiver evidence, not-proven receiver/isolation statuses, and preserved hard stops.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `.flowset/runtime-snapshot.json`.
- Add `docs/specifications/runtime-snapshot.md`.
- Add `docs/records/validation-wi-cx0048-test.md`.
- Register snapshot/spec/record in the manifest and indexes.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to WI-CX0049-docs.
- Add validator coverage for the runtime snapshot and generalize WI-CX0047 audit validation now that its repayment WI is complete.
- Run `node --check scripts/validate-repo.mjs`, `npm run validate`, `npm run typecheck`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `.flowset/runtime-snapshot.json`
- `docs/specifications/runtime-snapshot.md`
- `docs/records/validation-wi-cx0048-test.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- WI-CX0049-docs should define the A2 handoff receiver contract before generalized A2/A3 autonomy expansion.
- WI-CX0050-test should verify worktree isolation before first Layer 2 target-project scaffold confidence claims.
- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.