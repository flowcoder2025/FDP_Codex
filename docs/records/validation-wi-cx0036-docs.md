# Validation Record: WI-CX0036-docs

WI: WI-CX0036-docs

Title: Chunk Id Scope Policy

Status: validated

Branch: `wi/cx0036-docs-chunk-id-scope-policy`

## Scope

Decide the Layer 2 chunk id namespace rule without generating target-project artifacts.

## Evidence

- Decision created at `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.
- Decision accepts per-target-project chunk id scope.
- Decision rejects global chunk ids because they create a central registry burden and increase Layer 1/Layer 2 contamination risk.
- Decision rejects per-layer chunk ids because they do not distinguish multiple Layer 2 target projects.
- Layer 2 scaffold specification now records the per-target-project chunk namespace rule.
- Knowledge system specification now treats chunk id scope as resolved while the scope code rule remains user-gated.
- The live Decision Needed queue no longer contains the chunk id scope row.

## Result

- No Layer 2 target-project scaffold generation occurred.
- Layer 2 project scope code remains user-gated before first scaffold generation.
- No public API or external contract was stabilized.
- No release publication, deployment, package publication, OSS program submission, A3 publication behavior, production dependency addition, or destructive local realignment occurred.

## Evaluator Strategy

- PSC: P2
- WTC: KNOW
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: namespace collision avoidance and context-contamination prevention.
- Validator stance: deterministic checks for accepted decision, scaffold spec update, queue removal, manifest registration, and generation boundary.

## Validation Commands

- `node scripts/build-context-pack.mjs --wi WI-CX0036-docs --intent "chunk id scope policy per target project namespace layer 2 manifest validation handoff" --risk R2 --changed docs/specifications/layer-2-knowledge-scaffold.md --changed docs/specifications/knowledge-system.md --changed .flowset/fix_plan.md --changed .flowset/current-wi.md --changed .flowset/handoff.md --changed docs/manifest.yaml --append-ledger --actor codex`
- `npm.cmd run validate`
- `npm.cmd run ci:check`