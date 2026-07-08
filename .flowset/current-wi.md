# Current WI

WI id: WI-CX0020-feat

Category: feat

Title: Context Pack Command Surface

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0020-feat-context-pack-command-surface

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Define and implement the first explicit context-pack command surface for metadata output and optional ledger append without carrying chunk bodies.

## Verification Plan

- Keep default context pack generation stdout-only.
- Add explicit `--append-ledger` and `--actor` handling.
- Align the context pack builder specification, context hygiene policy, decision record, manifest, and validator.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `scripts/build-context-pack.mjs`
- `docs/specifications/context-pack-builder.md`
- `docs/policies/context-hygiene.md`
- `docs/decisions/2026-07-08-context-pack-command-surface.md`
- `docs/records/validation-wi-cx0020-feat.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Whether context pack selection should remain heuristic or move to a stricter rule table.
