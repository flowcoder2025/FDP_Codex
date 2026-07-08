# Current WI

WI id: WI-CX0022-docs

Category: docs

Title: Decision Queue State Codes

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0022-docs-decision-queue-state-codes

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Classify remaining Decision Needed items with explicit state codes, owner gates, and lock blockers so Operating Policy LOCK can proceed without mixing unresolved governance questions into active WI context.

## Verification Plan

- Build a fresh context pack for decision queue state coding.
- Define decision queue state codes and owner gates in a policy document.
- Convert the live Decision Needed queue into a compact state-coded table.
- Register the policy and evidence in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the decision queue contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `docs/policies/decision-queue.md`
- `docs/decisions/2026-07-08-decision-queue-state-codes.md`
- `docs/records/validation-wi-cx0022-docs.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0022-docs.
