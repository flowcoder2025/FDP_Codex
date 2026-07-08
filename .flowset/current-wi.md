# Current WI

WI id: WI-CX0029-chore

Category: chore

Title: Automation Run Surface Installation

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0029-chore-automation-run-surface-installation

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

## Scope

Install and record a supported Codex app standalone/worktree automation surface for fresh-run FDP_Codex continuation. The automation must boot from repository SSOT, avoid treating heartbeat or auto-compact as a context hygiene reset, and stop at the existing hard stops.

## Triage

- PSC: P2
- WTC: AUTO
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: automation safety and context-hygiene review.
- Validator stance: deterministic repository evidence for the installed automation contract, plus existing `npm run validate`, `npm run typecheck`, and `npm run ci:check`.

## Verification Plan

- Confirm the Codex app exposes a supported automation tool surface.
- Check for existing FDP_Codex automations before creating a duplicate.
- Install a worktree-based standalone automation only if it can preserve the hard stops and boot from repository SSOT.
- Record the automation id, status, and safety gate without storing raw context bodies.
- Run `npm run typecheck`.
- Run `npm run validate`.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0029-chore.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-automation-run-surface-installation.md`
- `docs/records/validation-wi-cx0029-chore.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Post-bootstrap automation cadence and authority remain a later Decision Needed item.
