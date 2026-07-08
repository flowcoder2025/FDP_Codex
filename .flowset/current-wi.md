# Current WI

WI id: WI-CX0021-feat

Category: feat

Title: Context Selection Rule Table

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0021-feat-context-selection-rule-table

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Convert context pack selection heuristics into an explicit rule table and validator-backed contract without changing the stdout-only default or explicit ledger append boundary.

## Verification Plan

- Build a fresh context pack for `context-selection-rule-table`.
- Define stable selection rule ids and triggers in the context pack builder specification.
- Refactor `scripts/build-context-pack.mjs` so static selection behavior is driven by the rule table.
- Add rule metadata to context pack output without adding chunk bodies.
- Extend `scripts/validate-repo.mjs` to verify the rule table contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `scripts/build-context-pack.mjs`
- `docs/specifications/context-pack-builder.md`
- `docs/decisions/2026-07-08-context-selection-rule-table.md`
- `docs/records/validation-wi-cx0021-feat.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0021-feat.