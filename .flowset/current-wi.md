# Current WI

WI id: WI-CX0040-chore

Category: chore

Title: Tooling Strictness Probe

Layer: Layer 1

Risk: R1

Status: validated

Branch: wi/cx0040-chore-tooling-strictness-probe

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Add a non-gating TypeScript strictness probe that measures current strict, noImplicitAny, and strictNullChecks debt without enabling strict mode, converting runtime `.mjs` sources, or expanding CI gating.

## Triage

- PSC: P2
- WTC: TOOL
- Risk: R1
- ESC: E1+E3+E6
- Primary evaluator stance: prevent broad TypeScript migration drift while making strictness debt auditable.
- Validator stance: deterministic probe execution and registry/flow coherence checks without treating expected strictness debt as a gating failure.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `scripts/report-type-strictness.mjs` and `npm run typecheck:strict-probe`.
- Register the decision, validation record, and probe tool in the manifest and indexes.
- Preserve the existing `npm run typecheck` and `npm run ci:check` gating baseline.
- Add validator coverage for the strictness probe output and flow coherence.
- Run `npm run typecheck:strict-probe`, `npm run typecheck`, `npm run validate`, and `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0040-chore.md`.

## Completion Evidence

- `scripts/report-type-strictness.mjs`
- `docs/decisions/2026-07-08-tooling-strictness-probe.md`
- `docs/records/validation-wi-cx0040-chore.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `.flowset/state.json`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`
- `package.json`

## Decision Needed

- The user must still choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
- Strict TypeScript source conversion or strict-mode tightening remains DQ-DEBT until a later WI either repays it or explicitly accepts residual debt at tooling lock.
