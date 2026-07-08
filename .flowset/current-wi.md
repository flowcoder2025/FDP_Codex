# Current WI

WI id: WI-CX0046-test

Category: test

Title: Autonomous Work Exhaustion Stop Gate

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0046-test-autonomous-work-exhaustion-stop-gate

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Install a deterministic stop gate for the point where all meaningful autonomous next work is gated by user decision, external state, or separate-reviewer availability.

## Triage

- PSC: P4
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: prevent autonomous process churn once all meaningful next work is gated.
- Validator stance: deterministic checks for stop rule existence, live blocked-work evidence, decision handback shape, current validation record strategy fields, and hard-stop preservation.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`.
- Update `docs/policies/autonomy-and-approval.md` with the stop gate rule.
- Register the decision and validation record in the manifest and indexes.
- Preserve user-gated Layer 2 scope code, post-bootstrap cadence, and S2 review gates.
- Add validator coverage for stop gate coherence and no-authority-change boundaries.
- Run `npm run validate` and `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0046-test.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`
- `docs/records/validation-wi-cx0046-test.md`
- `docs/policies/autonomy-and-approval.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- The user must choose long-lived post-bootstrap automation cadence and authority before the bootstrap envelope expires, release-candidate readiness, or changing the runner beyond the current bounded A2 prompt.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
- No further independent autonomous WI should start unless a user decision, external trigger, reviewer surface, concrete defect/KI, or recorded repayment trigger appears.
