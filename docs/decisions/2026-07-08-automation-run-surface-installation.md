# Decision: Automation Run Surface Installation

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0029-chore.

## Context

FDP_Codex already distinguishes auto-compact, same-thread heartbeat automation, standalone/project automation, and visible user-owned local threads.

The current user-approved bootstrap envelope allows bounded A2 supervised work, including branch-first WI work, validation, push, PR creation, PR merge, and branch deletion when policy and required checks allow it. It still excludes release publication, deployment, package publication, OSS program submission, license changes, production dependency additions, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

Codex app tool discovery exposed a supported `automation_update` surface. No existing FDP_Codex automation configuration was found before installation.

## Decision

Install a Codex app standalone worktree cron automation for FDP_Codex A2 continuation.

Automation id:

```text
fdp-codex-a2-worktree-wi-runner
```

The automation is a worktree execution surface, not a same-thread heartbeat and not a new user-owned local thread.

The automation is active, but it has a startup gate: if WI-CX0029-chore is still current, unmerged, or missing accepted decision and validation evidence on `origin/main`, the automation must stop without making repository changes and report that it is waiting for the installation PR to merge.

After that gate is satisfied, each standalone run must:

- read `AGENTS.md`, `docs/manifest.yaml`, `.flowset/handoff.md`, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`;
- check local and remote branches plus open PRs for the selected WI before making changes;
- stop without starting duplicate work when a branch, PR, or incomplete run already covers the selected WI;
- rebuild context from `docs/manifest.yaml` with the context pack command and ledger metadata append;
- work on exactly one Current Priority WI;
- use a dedicated WI branch;
- remain inside R0, R1, and R2 work;
- stop for R3, context hygiene ambiguity, license changes, release publication, deployment, package publication, OSS program submission, A3 publication behavior, destructive filesystem or git operations, public API or external contract changes, new production dependencies, security, secrets, data loss, or unresolved Decision Needed items;
- run `npm run ci:check` and `npm run validate` before PR merge;
- report exact evidence commands and PR/check URLs.

## Consequences

This installs the preferred fresh-run continuation surface from the session boundary automation contract.

It does not make auto-compact a clean context boundary, and it does not make heartbeat automation suitable for context-hygiene-sensitive WI-to-WI progression.

It does not remove the need for handoff and manifest bootstrapping. The automation must treat repository SSOT as the bootloader.

E2 blind independent review remains relevant for generalized A2/A3 expansion and release-candidate readiness. This WI records that the installed runner is bounded by the current bootstrap envelope and startup gate.

## Boundary

This decision does not publish a release, deploy, publish a package, submit the OSS program application, change the license, add a production dependency, authorize A3 publication behavior, create a new user-owned local thread, or authorize destructive local realignment.

## Decision Needed

Long-lived post-bootstrap automation cadence and authority must be revisited before the bootstrap envelope expires or before release-candidate readiness.
