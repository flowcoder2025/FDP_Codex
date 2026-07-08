# Current WI

WI id: WI-CX0051-test

Category: test

Title: Worktree Isolation Repair Gate

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0051-test-worktree-isolation-repair-gate

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, and first Layer 2 target-project scaffold generation.

## Scope

Define the minimal evidence gate required before A2 worktree isolation can be marked proven after WI-CX0050 blocked confidence claims.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: define the minimum proof needed before converting blocked isolation into proven isolation.
- Validator stance: require the WI-CX0051 repair-gate decision and validation record, preserved hard stops, and no Layer 2/A2 confidence advancement while isolation remains blocked.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Confirm origin/main contains WI-CX0029 installation decision and validation record.
- Confirm no existing WI-CX0051 branch or PR exists before starting work.
- Add `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md`.
- Add `docs/records/validation-wi-cx0051-test.md`.
- Register the decision and record in `docs/manifest.yaml`, `docs/index.md`, and `docs/records/README.md`.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to the user/control-plane repair gate.
- Add validator coverage for the repair-gate evidence.
- Run `node --check scripts/validate-repo.mjs`, `npm run validate`, `npm run typecheck`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md`
- `docs/records/validation-wi-cx0051-test.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- A user/control-plane repair must satisfy the WI-CX0051 gate before first Layer 2 target-project scaffold confidence claims.
- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
- Generalized A2/A3 expansion remains blocked until receiver success, worktree isolation, S2 debt, and future user decision gates are satisfied.
