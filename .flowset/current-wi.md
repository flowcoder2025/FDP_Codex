# Current WI

WI id: WI-CX0024-docs

Category: docs

Title: Handoff Size Policy

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0024-docs-handoff-size-policy

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Decide the handoff maximum line-count rule and validator profile so Operating Policy LOCK can distinguish compact handoff hygiene from project-size-specific exceptions.

## Verification Plan

- Build a fresh context pack for handoff size policy.
- Record the accepted handoff size decision.
- Update context hygiene and validator expectations.
- Remove the handoff max line count blocker from the live Decision Needed queue.
- Register the decision and validation record in `docs/manifest.yaml`.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `docs/decisions/2026-07-08-handoff-size-policy.md`
- `docs/policies/context-hygiene.md`
- `docs/records/validation-wi-cx0024-docs.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0024-docs.