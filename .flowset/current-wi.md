# Current WI

WI id: WI-CX0050-test

Category: test

Title: Worktree Isolation Verification

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0050-test-worktree-isolation-verification

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, and first Layer 2 target-project scaffold generation.

## Scope

Verify whether the A2 worktree runner is operating in an isolated per-run worktree before first Layer 2 target-project scaffold confidence claims.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: distinguish a safe blocked isolation result from a proven clean worktree receiver.
- Validator stance: require the WI-CX0050 evidence record, no duplicate branch/PR start, preserved hard stops, and no Layer 2/A2 confidence advancement while isolation remains blocked.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Confirm origin/main contains WI-CX0029 installation decision and validation record.
- Confirm no existing WI-CX0050 branch, PR, or commit exists before starting work.
- Record whether this runner uses an isolated worktree path or the canonical repository path.
- Add `docs/records/validation-wi-cx0050-test.md`.
- Register the record in `docs/manifest.yaml`, `docs/index.md`, and `docs/records/README.md`.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to the repair gate.
- Add validator coverage for blocked worktree isolation evidence.
- Run `node --check scripts/validate-repo.mjs`, `npm run validate`, `npm run typecheck`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/records/validation-wi-cx0050-test.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Worktree isolation is blocked, not proven; WI-CX0051-test should define the repair gate before first Layer 2 target-project scaffold confidence claims.
- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
- Generalized A2/A3 expansion remains blocked until receiver success, worktree isolation, S2 debt, and future user decision gates are satisfied.
