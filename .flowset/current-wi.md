# Current WI

WI id: WI-CX0027-docs

Category: docs

Title: Session Boundary Automation Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0027-docs-session-boundary-automation-contract

Approval envelope: user approved autonomous process continuation while preserving hard stops. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, destructive local realignment, license changes, new production dependencies, and A3 publication behavior.

## Scope

Lock the FDP_Codex session boundary contract so auto-compact, same-thread continuation, thread automation, standalone/project automation, new local thread creation, and Goal mode are not conflated.

## Verification Plan

- Use the current Codex manual as product evidence for session and automation behavior.
- Build a fresh context pack for session-boundary-automation-contract.
- Update autonomy and context hygiene policies.
- Record the accepted decision.
- Update fix_plan Decision Needed state for A2 fresh-run continuation ambiguity.
- Register the decision and validation record in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.

## Completion Evidence

- `docs/policies/autonomy-and-approval.md`
- `docs/policies/context-hygiene.md`
- `docs/decisions/2026-07-08-session-boundary-automation-contract.md`
- `docs/records/validation-wi-cx0027-docs.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0027-docs.