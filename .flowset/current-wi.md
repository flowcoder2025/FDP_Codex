# Current WI

WI id: WI-CX0045-test

Category: test

Title: Portfolio Guardrail Validator Baseline

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0045-test-portfolio-guardrail-validator-baseline

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Install deterministic validator coverage for current-and-forward portfolio guardrail evidence without rewriting historical validation records or choosing user-gated decisions.

## Triage

- PSC: P2
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: convert an existing portfolio-balance policy into a narrow current-and-forward validator gate without falsifying historical review evidence.
- Validator stance: deterministic checks for current WI strategy fields, current validation record strategy fields, E5 inclusion, DQ-POLICY removal, manifest/index registration, and hard-stop boundaries.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md`.
- Update `docs/policies/triage-strategy.md` with the current-and-forward baseline.
- Register the decision and validation record in the manifest and indexes.
- Remove the portfolio guardrail DQ-POLICY row from the live Decision Needed queue.
- Add validator coverage for current-and-forward portfolio guardrail evidence.
- Run `npm run validate` and `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0045-test.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md`
- `docs/records/validation-wi-cx0045-test.md`
- `docs/policies/triage-strategy.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must still choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- The user must still choose long-lived post-bootstrap automation cadence and authority before the bootstrap envelope expires, release-candidate readiness, or changing the runner beyond the current bounded A2 prompt.
- S2 blind review repayment remains DQ-DEBT until a separate Codex thread, separate reviewer, or human reviewer completes and records the review result.
