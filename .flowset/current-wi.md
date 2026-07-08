# Current WI

WI id: WI-CX0028-chore

Category: chore

Title: Tooling TypeScript Baseline

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0028-chore-tooling-typescript-baseline

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

## Scope

Evaluate whether FDP_Codex should adopt a TypeScript tooling baseline for repository scripts, then apply only the minimal repository-local scaffold that improves maintainability without changing runtime behavior.

## Triage

- PSC: P1
- WTC: TOOL
- Risk: R2
- ESC: E1+E3+E5
- Primary evaluator stance: source-bounded tooling review.
- Validator stance: existing `npm run validate`, `npm run typecheck`, `npm run ci:check`, context-pack smoke, and CI matrix preservation.

## Verification Plan

- Inspect current JavaScript tooling, package scripts, CI workflow, and manifest tool chunks.
- Decide whether TS should be adopted now, deferred, or limited to documentation/config only.
- Avoid production dependency additions.
- Preserve Node 20 and Node 24 validation behavior.
- Run `npm run typecheck`.
- Run `npm run validate`.
- Run `npm run ci:check`.
- Run smoke checks for context-pack generation.
- Record validation evidence in `docs/records/validation-wi-cx0028-chore.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-tooling-typescript-baseline.md`
- `tsconfig.json`
- `package-lock.json`
- `.github/workflows/validate.yml`
- `docs/records/validation-wi-cx0028-chore.md`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0028-chore.