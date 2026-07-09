# Current WI

WI id: WI-CX0053-docs

Category: docs

Title: Strategic Goal Steering Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0053-docs-strategic-goal-steering-contract

Approval envelope: user approved strengthening the collaboration instructions before proceeding with the recommended A2 runner pause and WI-CX0052 draft PR path. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, first Layer 2 target-project scaffold generation, push, and merge.

## Scope

Strengthen the user-facing collaboration contract so Codex must synthesize the accumulated objective, project identity, locked constraints, verified state, and newest concern before reprioritizing, and must apply a brake when a user-suggested path conflicts with the final goal or operating boundaries.

## Triage

- PSC: P1
- WTC: FND
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: correct the collaboration contract so Codex does not obediently chase the latest user-stated issue when that weakens the final goal.
- Validator stance: require AGENTS, autonomy policy, collaboration decision, validation record, and validator coverage for goal steering and brake behavior.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Strengthen `AGENTS.md` user-facing decision framing with goal steering and brake duties.
- Strengthen the collaboration response decision record and autonomy policy.
- Add validator coverage for the goal steering contract.
- Add `docs/records/validation-wi-cx0053-docs.md`.
- Register the record in `docs/manifest.yaml`, `docs/index.md`, and `docs/records/README.md`.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to pause the A2 runner automation before pushing the WI-CX0052 draft PR.
- Run `node --check scripts\validate-repo.mjs`, `npm run validate`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `AGENTS.md`
- `docs/decisions/2026-07-08-collaboration-response-contract.md`
- `docs/policies/autonomy-and-approval.md`
- `docs/records/validation-wi-cx0053-docs.md`
- `.flowset/context-ledger.jsonl`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `docs/index.md`
- `docs/records/README.md`
- `scripts/validate-repo.mjs`

## Decision Needed

- Pause the A2 runner automation before pushing or opening the WI-CX0052 draft PR so additional runner threads do not bury the control-plane thread.
- WI-CX0052 must be integrated before first Layer 2 target-project scaffold confidence claims.
- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
- Generalized A2/A3 expansion remains blocked until receiver success, worktree isolation, S2 debt, and future user decision gates are satisfied.