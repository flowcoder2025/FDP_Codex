# Current WI

WI id: WI-CX0049-docs

Category: docs

Title: A2 Handoff Receiver Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0049-docs-a2-handoff-receiver-contract

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, and first Layer 2 target-project scaffold generation.

## Scope

Define the A2 handoff receiver contract: receiver success criteria, duplicate-stop handling, repo-visible receiver reporting, and parent-thread handback behavior before generalized A2/A3 autonomy expansion.

## Triage

- PSC: P1
- WTC: SPEC
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: distinguish effective receiver proof from duplicate-stop or unknown runner evidence.
- Validator stance: require the contract, manifest/index registration, flow-state advancement to WI-CX0050-test, preserved runtime snapshot not-proven receiver status, and hard-stop preservation.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `docs/specifications/a2-handoff-receiver-contract.md`.
- Add `docs/records/validation-wi-cx0049-docs.md`.
- Register the spec and record in the manifest and indexes.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to WI-CX0050-test.
- Add validator coverage for the handoff receiver contract and generalize WI-CX0048 validation now that WI-CX0049 is complete.
- Run `node --check scripts/validate-repo.mjs`, `npm run validate`, `npm run typecheck`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/specifications/a2-handoff-receiver-contract.md`
- `docs/records/validation-wi-cx0049-docs.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- WI-CX0050-test should verify worktree isolation before first Layer 2 target-project scaffold confidence claims.
- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
- Generalized A2/A3 expansion remains blocked until receiver success, worktree isolation, S2 debt, and future user decision gates are satisfied.