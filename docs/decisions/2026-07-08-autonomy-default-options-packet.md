# Decision: Autonomy Default Options Packet

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0025-docs.

## Context

FDP_Codex needs a clear autonomy default before Operating Policy LOCK.

The user approved autonomous continuation for the current bootstrap envelope, including PR merge and branch deletion, while keeping deployment, release publication, package publication, and OSS program submission out of scope.

The durable policy still needs to avoid overclaiming unattended Codex session creation or making A3 publication behavior the default.

## Decision

Durable default without an active approval envelope: A1 Assisted.

A2 is envelope-scoped. The current bootstrap envelope may continue as A2 Supervised Autopilot while the user has not interrupted or narrowed it. Inside that envelope, Codex may perform branch-first WI work, local validation, push, ready PR creation, PR merge, and branch deletion when checks pass and approval labels are present.

A2 does not claim fully user-invisible Codex session creation. A fresh run, automation, or new thread must boot from handoff and `docs/manifest.yaml`; user-owned visible thread creation requires explicit user request or supported automation tooling.

A3 is not a default mode. It requires a separate locked release or publication envelope.

No deployment, release publication, package publication, or OSS program submission is authorized by this decision.

## Option Packet

A0 Manual remains available when scope or repository state is unclear.

A1 Assisted is the durable fallback and the default when no active approval envelope exists.

A2 Supervised Autopilot is the recommended mode for bounded FDP_Codex bootstrap continuation after the user approves an envelope.

A3 AutoMerge / Publication is excluded from default operation and requires a future explicit release or publication decision.

## Consequences

The live Decision Needed item for default autonomy mode after bootstrap is closed.

The conditional questions about generalized A2/A3 git scope and branch deletion outside the current envelope remain live until a later policy WI decides them.

Operating Policy LOCK may treat the default autonomy mode as resolved while preserving hard stops for release, deployment, package publication, OSS submission, destructive local realignment, security, data loss, external contracts, new production dependencies, and context hygiene violations.

## Exclusions

This decision does not create new Codex threads, deploy, publish a release, publish a package, submit an OSS program application, change the license, or repair `C:\dev\FDP_Codex`.