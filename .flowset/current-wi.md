# Current WI

WI id: WI-CX0026-docs

Category: docs

Title: Collaboration Response Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0026-docs-collaboration-response-contract

Approval envelope: user explicitly requested durable instruction update for decision-bearing replies and conversational Korean tone. Existing bootstrap envelope still excludes deployment, release publication, package publication, OSS program submission, destructive local realignment, license changes, and new production dependencies.

## Scope

Persist the collaboration response pattern in repository instructions and policy so future Codex turns expose user decision points, options, tradeoffs, recommendation, and approval needs clearly.

## Verification Plan

- Build a fresh context pack for collaboration-response-contract.
- Update `AGENTS.md` with the response framing and tone rule.
- Update `docs/policies/autonomy-and-approval.md` with the decision-framing UX rule.
- Record the accepted decision.
- Register the decision and validation record in `docs/manifest.yaml`.
- Extend `scripts/validate-repo.mjs` to verify the contract.
- Run context pack default mode and explicit append mode.
- Run `npm run validate`.
- Run `git diff --check`.

## Completion Evidence

- `AGENTS.md`
- `docs/policies/autonomy-and-approval.md`
- `docs/decisions/2026-07-08-collaboration-response-contract.md`
- `docs/records/validation-wi-cx0026-docs.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0026-docs.