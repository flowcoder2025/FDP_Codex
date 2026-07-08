# Validation Record: WI-CX0017-ci

WI: WI-CX0017-ci Validator CI Follow-Up.

Date: 2026-07-08.

Status: validated.

## Triage

- PSC: P2 Tooling.
- WTC: VAL.
- Risk: R2.
- ESC: E1 + E3 + E5 + E6.

## Evidence Reviewed

Latest remote `validate` workflow runs before this WI:

- `main` push run `28911347881`: success.
- PR #3 pull_request run `28911326743`: success.
- PR #2 and later `main` runs also succeeded after the WI-CX0014 false-green fix.
- Older failed runs remain as historical evidence and were superseded by later passing runs.

## Gap Found

`package.json` declares Node support as `>=20`, but `.github/workflows/validate.yml` previously ran only on Node 24.

That left the minimum supported Node version untested in CI.

## Changes Verified

- Added `workflow_dispatch` to the validate workflow for explicit manual reruns.
- Changed the validate workflow to a matrix over Node `20.x` and `24.x`.
- Added validator checks that the workflow keeps Node 20, Node 24, and manual dispatch coverage.
- Kept workflow permissions read-only.

## Validation Commands

- `npm run context:pack -- --wi WI-CX0017-ci --intent ci --risk R2 --changed .github/workflows/validate.yml --changed scripts/validate-repo.mjs --changed docs/manifest.yaml`
- `npm run validate`

## Adversarial Notes

- The workflow still only runs the deterministic repository validator; it does not claim release readiness.
- Matrix coverage prevents accidental drift away from the declared minimum Node runtime.
- `workflow_dispatch` improves maintainer UX without adding deployment or publication behavior.
- No secret, write-token, deployment, release, or package publication permission was added.

## Result

WI-CX0017-ci is valid for public merge under the active approval envelope.

No deployment, release publication, package publication, or OSS program submission was performed.