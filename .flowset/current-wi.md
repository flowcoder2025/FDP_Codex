# Current WI

WI id: WI-CX0034-docs

Category: docs

Title: Layer 2 Scope Code Options Packet

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0034-docs-layer-2-scope-code-options-packet

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Prepare user-facing options for the Layer 2 project scope code rule without deciding the final rule or generating Layer 2 artifacts.

## Triage

- PSC: P2
- WTC: KNOW
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: decision-boundary integrity and user-gate preservation.
- Validator stance: deterministic checks for options coverage, live Decision Needed queue state, manifest registration, and generation boundary.

## Verification Plan

- Read the Layer 2 scaffold, knowledge system, decision queue, and naming policies.
- Draft scope-code options without closing the user-gated decision.
- Update live backlog and handoff without authorizing scaffold generation.
- Register the packet and validation evidence in the manifest and indexes.
- Add validator coverage for the options packet and flow state.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0034-docs.md`.

## Completion Evidence

- `docs/records/layer-2-scope-code-options-2026-07-08.md`
- `docs/records/validation-wi-cx0034-docs.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- Chunk id scope remains unresolved before manifest namespace expansion or first scaffold generation.