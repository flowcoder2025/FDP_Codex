# Current WI

WI id: WI-CX0047-test

Category: test

Title: Session Orchestration Control-Plane Audit

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0047-test-session-orchestration-control-plane-audit

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, automation authority expansion, separate reviewer creation, S2 execution, and first Layer 2 target-project scaffold generation.

## Scope

Record and validate the control-plane gap between the intended fresh A2 handoff model and the observed Codex app behavior where the parent `안녕` `/goal` thread continued work while A2 runner threads duplicate-stopped.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: treat the user-observed auto-compact and ineffective runner handoff as a control-plane validation defect.
- Validator stance: require repo-visible evidence for parent thread, automation id, runner thread ids, duplicate-stop results, KI repayment, reprioritized fix plan, and preserved hard stops.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`.
- Add `docs/records/validation-wi-cx0047-test.md`.
- Add strategic response framing guidance to `AGENTS.md`.
- Add control-plane runtime validation policy to `docs/policies/autonomy-and-approval.md`.
- Register new records in the manifest and indexes.
- Reprioritize `.flowset/fix_plan.md`, `.flowset/state.json`, and `.flowset/handoff.md` to WI-CX0048-test.
- Add validator coverage for the control-plane audit and generalized current-priority handling.
- Run `node --check scripts/validate-repo.mjs`, `npm run validate`, `npm run typecheck`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`
- `docs/records/validation-wi-cx0047-test.md`
- `AGENTS.md`
- `docs/policies/autonomy-and-approval.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- WI-CX0048-test should run before generalized A2/A3 autonomy expansion or first Layer 2 target-project scaffold confidence claims.
- WI-CX0049-docs and WI-CX0050-test should follow WI-CX0048 unless its evidence changes the repayment order.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.