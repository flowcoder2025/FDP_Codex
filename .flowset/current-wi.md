# Current WI

WI id: WI-CX0037-docs

Category: docs

Title: Layer 2 Scope Code Decision Handback

Layer: Layer 1

Risk: R1

Status: validated

Branch: wi/cx0037-docs-layer-2-scope-code-decision-handback

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Prepare a concise user handback for the remaining Layer 2 project scope code decision without deciding the final rule or generating target-project artifacts.

## Triage

- PSC: P2
- WTC: KNOW
- Risk: R1
- ESC: E1+E3+E6
- Primary evaluator stance: user-decision clarity and generation-boundary preservation.
- Validator stance: deterministic checks for recommendation, fallback debt, accepted chunk id reference, decision prompt, live queue state, and scaffold-generation boundary.

## Verification Plan

- Read the Layer 2 scope code options packet and chunk id scope decision.
- Draft a concise user handback preserving the user decision gate.
- Update live backlog and handoff without authorizing scaffold generation.
- Register the handback and validation evidence in the manifest and indexes.
- Add validator coverage for the handback and remaining user gate.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0037-docs.md`.

## Completion Evidence

- `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`
- `docs/records/validation-wi-cx0037-docs.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.