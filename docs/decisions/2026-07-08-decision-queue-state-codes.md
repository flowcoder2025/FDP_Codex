# Decision: Decision Queue State Codes

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0022-docs.

## Context

FDP_Codex had a growing Decision Needed list. A plain bullet list was not enough to distinguish user-choice blockers, policy WIs, deferred debt, and release-gated items.

That ambiguity could make `WI-CX0016-docs Operating Policy LOCK` either over-blocked or falsely green.

## Decision

FDP_Codex adopts state-coded Decision Needed rows.

The live queue remains in `.flowset/fix_plan.md`.

`docs/policies/decision-queue.md` defines state codes, owner gates, required fields, and lock blocker values.

`docs/decisions/README.md` must not duplicate the live queue. It points to the live queue and the policy instead.

The state codes are `DQ-USER`, `DQ-POLICY`, `DQ-DEBT`, `DQ-EXTERNAL`, and `DQ-ACCEPTED`.

## Consequences

Operating Policy LOCK can distinguish true blockers from explicit debt.

Codex can continue policy WIs where `CODEX` is the owner gate and must stop where `USER`, `H1`, or `REPO` gates apply.

The validator can check queue shape without deciding the unresolved policy items.

## Exclusions

This decision does not resolve the queued items, publish a release, deploy, publish a package, submit an OSS program application, or authorize A3 behavior.
