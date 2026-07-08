# Current WI

WI id: WI-CX0023-docs

Category: docs

Title: KI Identity Severity Policy

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0023-docs-ki-identity-severity-policy

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Decide whether KI severity belongs in the KI id or remains a field-only classification, then update lifecycle policy and validator expectations.

## Verification Plan

- Build a fresh context pack for KI identity severity policy.
- Record the accepted KI identity/severity decision.
- Update work item lifecycle policy and the live Decision Needed queue.
- Register the decision and validation record in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the KI identity contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `docs/decisions/2026-07-08-ki-identity-severity-policy.md`
- `docs/policies/work-item-lifecycle.md`
- `docs/records/validation-wi-cx0023-docs.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0023-docs.