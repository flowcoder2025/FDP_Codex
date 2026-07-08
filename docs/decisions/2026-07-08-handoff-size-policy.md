# Decision: Handoff Size Policy

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0024-docs.

## Context

FDP_Codex uses handoff as a compact pointer document for fresh sessions. If handoff grows into copied SSOT, it becomes another context body and weakens context hygiene.

The validator already enforced a 220-line handoff limit, but that limit was still listed as Decision Needed.

## Decision

Layer 1 FDP_Codex handoff has a validator-backed maximum of 220 lines.

The handoff must point to SSOT, decisions, validation records, PRs, and next actions instead of copying policy bodies.

Profile-dependent or larger limits are out of scope for the Layer 1 bootstrap scaffold and require a future policy WI.

## Consequences

`WI-CX0016-docs Operating Policy LOCK` can treat handoff size as resolved for Layer 1.

The validator's existing 220-line check is now policy-backed instead of an unexplained implementation choice.

The handoff maximum line-count Decision Needed item is closed and should leave the live queue.

## Exclusions

This decision does not define Layer 2 target-project handoff profiles, publish a release, deploy, publish a package, or submit an OSS program application.