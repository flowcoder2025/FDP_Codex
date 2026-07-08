# Current WI

WI id: WI-CX0032-docs

Category: docs

Title: Layer 2 Knowledge Scaffold Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0032-docs-layer-2-knowledge-scaffold-contract

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

## Scope

Define the portable Layer 2 target-project knowledge scaffold contract for manifests, handoffs, ledgers, WI/KI separation, verification debt, and Layer 1 provenance before generating any Layer 2 artifacts.

## Triage

- PSC: P3
- WTC: KNOW
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: Layer boundary integrity, target-project portability, and false-green review.
- Validator stance: deterministic checks for Layer 2 contract coverage, generation boundary, manifest registration, and existing `npm run ci:check`.

## Verification Plan

- Inspect the existing knowledge system specification and decision queue blockers.
- Add a Layer 2 scaffold contract without generating target-project artifacts.
- Preserve the unresolved user-gated Layer 2 project scope code rule.
- Update manifest, indexes, handoff, and validation record.
- Add validator coverage for scaffold fields, forbidden Layer 2 body carryover, WI/KI separation, provenance, and generation boundaries.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0032-docs.md`.

## Completion Evidence

- `docs/specifications/layer-2-knowledge-scaffold.md`
- `docs/records/validation-wi-cx0032-docs.md`
- `docs/specifications/knowledge-system.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Layer 2 project scope code rule remains user-gated before the first target-project scaffold.
- Chunk id scope remains policy-gated before manifest namespace expansion.
