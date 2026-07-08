# Decision: Evaluation Surface Baseline

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0019-docs.

## Context

FDP_Codex uses evaluator and validator roles. The policy already required blind and adversarial review in several cases, but it did not clearly define which execution surface satisfies each requirement.

Prior validation records also showed a practical gap: same-thread adversarial notes were useful, but they were not the same thing as independent blind review.

## Decision

FDP_Codex separates evaluation strategy codes from execution surfaces.

Strategy codes remain E0 through E7 and align with `docs/policies/triage-strategy.md`.

Execution surfaces are:

- S0 Same-Agent Self Check,
- S1 Same-Thread Structured Review,
- S2 Separate Blind Review,
- H1 Human Maintainer Gate.

E2 Blind Independent Review requires S2. S0 and S1 do not satisfy E2.

E3 Adversarial Review may be performed through S1 for R2 pre-release work when the scope is bounded and evidence is recorded. R3, release-candidate, A2/A3 enablement, security, and publication decisions require S2 or H1 as defined by policy.

H1 is mandatory before first public release, tagged release, package publication, deployment, OSS program submission, license change, or material governance externalization.

Adversarial checklists remain evaluator prompts by default. They should become deterministic validator rules only when a later WI extracts a stable invariant from repeated findings.

## Consequences

Validation records must state both strategy codes and execution surface.

A record must not claim E2 was completed unless S2 occurred.

Same-thread review remains useful for momentum, but it must be labeled as S1 rather than blind review.

The next release-readiness or OSS-submission WI must include S2 and H1 evidence before it can be marked ready.

## Exclusions

This decision does not create a new Codex thread, run a human review, publish a release, deploy, publish a package, or submit an OSS program application.