# Current WI

WI id: WI-CX0016-docs

Category: docs

Title: Operating Policy LOCK

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0016-docs-operating-policy-lock

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Convert accepted scaffold policies into a Layer 1 accepted-v0 operating policy lock after unresolved Decision Needed `yes` blockers are resolved.

## Verification Plan

- Build a fresh context pack for operating policy lock.
- Record the accepted operating policy lock decision.
- Update policy statuses and Decision Needed SSOT pointers.
- Register the decision and validation record in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the lock contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.

## Completion Evidence

- `docs/decisions/2026-07-08-operating-policy-lock.md`
- `docs/records/validation-wi-cx0016-docs.md`
- `docs/policies/*.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0016-docs.