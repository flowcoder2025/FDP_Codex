# Decision: Collaboration Response Contract

Status: accepted.

Date: 2026-07-08.

## Context

The user asked Codex to keep giving the overall explanation first, but to end decision-bearing replies with clear choices, recommendations, tradeoffs, and the approval needed to proceed.

The user also asked Codex to use a more conversational Korean tone instead of stiff declarations such as "하겠다".

## Decision

FDP_Codex adopts a collaboration response contract for user-facing strategic, process, or approval-bearing replies.

Codex should:

1. summarize the current situation and verified facts,
2. give Codex's judgment,
3. separate User Decision Needed items,
4. present options as A/B/C with tradeoffs,
5. state Codex's recommendation directly,
6. end with the next intended action and approval needed to proceed.

When the user writes in Korean, Codex should use a conversational Korean tone while preserving technical precision.

## Consequences

Decision points become easier for the user to inspect and approve.

The response contract does not bypass hard stops, approval envelopes, verification requirements, context hygiene, or git workflow policy.

## Boundary

This decision does not authorize release publication, deployment, package publication, OSS program submission, license changes, new production dependencies, A3 publication behavior, or destructive local realignment.