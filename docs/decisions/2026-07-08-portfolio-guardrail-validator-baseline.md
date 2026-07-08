# Portfolio Guardrail Validator Baseline

Status: accepted.

WI: WI-CX0045-test.

## Context

`docs/policies/triage-strategy.md` already requires E5 Portfolio Balance Review for every triage decision and warns against over-concentrating on one work track.

That rule was policy-only. The validator did not yet enforce that the active WI and its validation record carry project state code, work track code, risk, and evaluator strategy evidence.

Recent bootstrap work also showed why a deterministic baseline is useful: when user-gated Layer 2 work blocks the primary path, autonomous work can drift toward whichever local track is easiest unless the triage evidence is explicit.

## Decision

Starting with WI-CX0045-test, FDP_Codex validator enforcement covers the active WI and its current validation record.

The active WI and current validation record must include:

- PSC: one of P0 through P6.
- WTC: one of FND, VAL, AUTO, KNOW, OSS, EVAL, or DEBT.
- Risk: one of R0 through R3.
- ESC with E5 included.

This baseline is current-and-forward enforcement. It does not rewrite historical validation records and does not claim that earlier records executed E5 if they did not record it.

The validator must also verify that the portfolio guardrail DQ-POLICY row leaves the live Decision Needed queue after this accepted decision.

## Non-Goals

This decision does not create a release-readiness score.

This decision does not choose the Layer 2 project scope code rule.

This decision does not change automation cadence, A2/A3 authority, merge authority, or publication authority.

This decision does not add a production dependency or require a strict YAML parser.

## Consequences

Triage evidence becomes harder to omit in future WIs.

The validator can now catch a future current WI that lacks WTC or E5 evidence before the omission becomes handoff drift.

A richer historical portfolio report can still be added later if repeated imbalance continues, but that is separate from this baseline.

The live DQ-POLICY item for deterministic portfolio guardrails is closed by this decision and WI-CX0045 validation evidence.
