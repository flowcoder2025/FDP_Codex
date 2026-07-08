# Validation Record: WI-CX0027-docs

WI: WI-CX0027-docs.

Status: evidence.

Date: 2026-07-08.

## Scope

Session boundary automation contract for auto-compact, same-thread continuation, thread automation, standalone/project automation, new local thread creation, and Goal mode.

## Evidence

- Used the current Codex manual as product evidence for thread model, auto-compact, automations, thread automations, and new-thread surfaces.
- Added `## Session Boundary Automation Contract` to `docs/policies/autonomy-and-approval.md`.
- Added `## Auto-Compact Boundary` to `docs/policies/context-hygiene.md`.
- Added `docs/decisions/2026-07-08-session-boundary-automation-contract.md`.
- Registered the decision and validation record in `docs/manifest.yaml`.
- Updated `.flowset/fix_plan.md` to remove the generalized A2 fresh-run ambiguity while preserving A3 publication/merge scope as a user-gated Decision Needed item.
- Extended `scripts/validate-repo.mjs` to verify the session boundary contract.

## Commands

- `npm run context:pack -- --wi WI-CX0027-docs --intent session-boundary-automation-contract --risk R2 --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md --changed docs/decisions/2026-07-08-session-boundary-automation-contract.md --changed docs/decisions/README.md --changed docs/manifest.yaml --changed docs/policies/autonomy-and-approval.md --changed docs/policies/context-hygiene.md --changed docs/records/README.md --changed docs/records/validation-wi-cx0027-docs.md --changed scripts/validate-repo.mjs`
- `npm run context:pack -- --wi WI-CX0027-docs --intent session-boundary-automation-contract --risk R2 --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md --changed docs/decisions/2026-07-08-session-boundary-automation-contract.md --changed docs/decisions/README.md --changed docs/manifest.yaml --changed docs/policies/autonomy-and-approval.md --changed docs/policies/context-hygiene.md --changed docs/records/README.md --changed docs/records/validation-wi-cx0027-docs.md --changed scripts/validate-repo.mjs --append-ledger --actor codex`
- `npm run validate`
- `git diff --check`

## Result

Passed after local validation.

## Boundary Check

No live automation, new user-owned local thread, release publication, deployment, package publication, OSS program submission, license change, new production dependency, A3 publication behavior, or destructive local realignment occurred.