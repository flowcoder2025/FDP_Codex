# Current WI

WI id: WI-CX0036-docs

Category: docs

Title: Chunk Id Scope Policy

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0036-docs-chunk-id-scope-policy

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Decide the Layer 2 chunk id namespace rule without generating target-project artifacts.

## Triage

- PSC: P2
- WTC: KNOW
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: namespace collision avoidance and context-contamination prevention.
- Validator stance: deterministic checks for accepted decision, scaffold spec update, queue removal, manifest registration, and generation boundary.

## Verification Plan

- Read the Layer 2 scaffold and knowledge system specifications.
- Decide between global, per-layer, and per-target-project chunk id scope.
- Update the Layer 2 scaffold contract and knowledge system.
- Remove the resolved chunk id scope row from the live Decision Needed queue.
- Register the decision and validation evidence in the manifest and indexes.
- Add validator coverage for the accepted decision and remaining generation boundary.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0036-docs.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`
- `docs/records/validation-wi-cx0036-docs.md`
- `docs/specifications/layer-2-knowledge-scaffold.md`
- `docs/specifications/knowledge-system.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Layer 2 project scope code remains user-gated before first Layer 2 scaffold generation.