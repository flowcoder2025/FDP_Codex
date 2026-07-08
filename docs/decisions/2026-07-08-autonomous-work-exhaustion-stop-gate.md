# Autonomous Work Exhaustion Stop Gate

Status: accepted.

WI: WI-CX0046-test.

## Context

FDP_Codex can continue autonomously inside a bounded A2 bootstrap envelope, but autonomy must not turn into low-value process churn when all meaningful next work is gated.

At this point the live fix plan has a user-decision current priority, one triggered runner-output review that has no trigger evidence, and next candidates that require either user choice or a separate reviewer.

Without a stop gate, Codex could keep creating policy WIs simply because they are locally possible, even when the better product behavior is to hand control back to the user.

## Decision

When all executable next work is gated by user decision, external state, or separate-reviewer availability, FDP_Codex must stop autonomous WI creation and hand back the decision surface.

The handback must name:

- the current user decision that blocks the primary path,
- triggered work that is waiting for external evidence,
- next candidates that are blocked by user or reviewer gates,
- hard stops that remain outside the approval envelope,
- the recommended user response shape when one exists.

A same-thread goal continuation may still finish the active WI, poll checks, merge an approved PR, or verify a just-completed cycle. It must not start another independent WI merely to avoid stopping.

A new WI is allowed only when one of these becomes true:

- the user supplies the needed decision or approval,
- new runner output, branch, PR, or recorded evidence triggers the queued WI,
- a separate reviewer or explicitly created fresh review surface becomes available,
- a concrete defect, failed validation, or new critical/high KI appears,
- a repayment trigger recorded in the live Decision Needed queue is actually reached.

## Non-Goals

This decision does not mark the persistent `/goal` complete.

This decision does not choose the Layer 2 project scope code rule.

This decision does not choose the post-bootstrap automation cadence.

This decision does not execute S2 review or create a separate reviewer.

This decision does not change automation schedule, prompt, merge authority, A2/A3 authority, release, deployment, package publication, or OSS submission boundaries.

## Consequences

The repository now has a deterministic guard against autonomous filler work after all meaningful paths are gated.

Future autonomous runs can distinguish productive continuation from a handback point.

The next expected action is user discussion or a user decision, not another independent Codex-selected WI unless a new trigger appears.
