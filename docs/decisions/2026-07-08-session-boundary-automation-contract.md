# Decision: Session Boundary Automation Contract

Status: accepted.

Date: 2026-07-08.

## Context

The user observed that the current same-thread autonomous run still auto-compacts even though prior discussion expected new-session style progression.

The Codex manual describes a thread as a session, says long threads may auto-compact to continue work, and distinguishes thread automations from standalone/project automations. Thread automations preserve the same conversation; standalone automations start fresh runs. New local threads are visible user-owned UI state unless a supported tool or automation explicitly creates them.

FDP_Codex needs a policy that does not overclaim automatic new-session creation while still preserving a path to context-hygiene-sensitive autonomous continuation.

## Decision

FDP_Codex treats auto-compact as same-thread continuation, not as a fresh session or context hygiene reset.

Same-thread continuation may finish the active WI and poll local or remote checks. It is not the default for context-hygiene-sensitive WI-to-WI autonomous progression.

Thread automation is same-thread heartbeat behavior. It is useful for polling and ongoing conversation loops, but it is not a fresh context boundary.

Standalone or project automation is the preferred Codex app surface for independent autonomous WI progression when available, tested, and inside an approval envelope. For Git repositories, dedicated automation worktrees are preferred over modifying the main checkout.

New local thread creation remains user-owned visible UI state unless a supported tool or automation explicitly creates it inside an approved envelope and the creation is verified.

Goal mode may keep a persistent objective, but it does not itself prevent auto-compact or create a fresh session.

## Operating Rule

For the current active thread, Codex may finish the active WI and required validation.

For the next independent context-hygiene-sensitive WI, Codex should prefer a standalone/project automation fresh run with a dedicated worktree once the automation is installed, tested, and inside an approval envelope.

Until that automation surface is installed and verified, Codex should use handoff and context pack metadata to make a fresh run possible, but must not claim automatic fresh-session execution.

## Consequences

This resolves the fresh-run portion of the A2 continuation ambiguity for the public bootstrap baseline.

A3 publication/merge behavior remains outside this decision and still requires a locked release or publication envelope.

`WI-CX0018-chore Local Workspace Realignment` remains next, but destructive local realignment still requires explicit approval.

## Boundary

This decision does not create a live automation, create a new user-owned local thread, publish a release, deploy, publish a package, submit the OSS program application, change the license, add a production dependency, authorize A3 publication behavior, or authorize destructive local realignment.