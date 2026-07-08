# Decision: Tooling TypeScript Baseline

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0028-chore.

## Context

FDP_Codex repository tooling is currently a small Node ESM surface: `scripts/validate-repo.mjs`, `scripts/build-context-pack.mjs`, and `scripts/lib/manifest.mjs`.

The project needs better tooling confidence before adding more automation, but converting source files from JavaScript to TypeScript now would add migration risk without changing user-facing behavior.

## Decision

Adopt a TypeScript tooling baseline without converting runtime source files.

The baseline uses `tsconfig.json` with `allowJs`, `checkJs`, and `noEmit` so existing `.mjs` scripts remain the runtime source of truth while TypeScript checks them.

Add `typescript` and `@types/node` as development dependencies only. `@types/node` follows the repository minimum runtime target, Node 20, rather than the newest available Node type major.

Expose `npm run typecheck` for local checks and run it in GitHub Actions before `npm run validate`.

Keep `npm run validate` mapped to `node scripts/validate-repo.mjs` so the existing repository validator contract remains stable.

## Consequences

CI now installs development dependencies with `npm ci` before typechecking and validation.

The baseline catches JavaScript tooling regressions without changing runtime entrypoints or requiring a build output directory.

Future source conversion from `.mjs` to `.ts`, strict-mode tightening, or emitted build artifacts should be a separate WI with its own validation evidence.

## Exclusions

This decision does not change runtime behavior, publish a package, deploy, publish a release, submit an OSS program application, add production dependencies, change public API or external contract behavior, or authorize A3 publication behavior.