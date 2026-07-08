# Current WI

WI id: WI-CX0025-docs

Category: docs

Title: Autonomy Default Options Packet

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0025-docs-autonomy-default-options-packet

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, package publication, and OSS program submission remain excluded.

## Scope

Decide the default post-bootstrap autonomy option set and user-intervention boundaries so Operating Policy LOCK can encode autonomous continuation without overclaiming unattended Codex session creation.

## Verification Plan

- Build a fresh context pack for autonomy default options.
- Record the accepted autonomy default options decision.
- Update autonomy policy and the live Decision Needed queue.
- Register the decision and validation record in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the autonomy options packet.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.

## Completion Evidence

- `docs/decisions/2026-07-08-autonomy-default-options-packet.md`
- `docs/policies/autonomy-and-approval.md`
- `docs/records/validation-wi-cx0025-docs.md`
- `.flowset/fix_plan.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0025-docs.