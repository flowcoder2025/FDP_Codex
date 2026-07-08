# Validation Record: WI-CX0028-chore

WI: WI-CX0028-chore.

Status: evidence.

Date: 2026-07-08.

## Scope

Tooling TypeScript baseline for repository scripts.

## Evidence

- Created branch `wi/cx0028-chore-tooling-typescript-baseline`.
- Built a fresh context pack for WI-CX0028 before implementation.
- Checked npm registry versions: `typescript` latest was `6.0.3`; `@types/node` latest was `26.1.0`.
- Chose `@types/node@20.19.43` to match the repository minimum Node runtime target.
- Added development dependencies only: `typescript` and `@types/node`.
- Added `tsconfig.json` with `allowJs`, `checkJs`, and `noEmit` over `scripts/**/*.mjs`.
- Added `npm run typecheck` while preserving `npm run validate` as `node scripts/validate-repo.mjs`.
- Updated GitHub Actions to run `npm ci`, `npm run typecheck`, and `npm run validate` on Node 20 and Node 24.
- Added JSDoc types to repository manifest parsers so `checkJs` passes without converting `.mjs` runtime sources.
- Updated validator checks so completed WI-CX0018 evidence no longer pins the active current WI.
- Added validator checks for the TypeScript tooling baseline.

## Commands

- `npm run context:pack -- --wi WI-CX0028-chore --intent tooling-typescript-baseline --risk R2 --changed package.json --changed scripts/validate-repo.mjs --changed scripts/build-context-pack.mjs --changed scripts/lib/manifest.mjs --changed .github/workflows/validate.yml --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md`
- `npm view typescript version`
- `npm view @types/node version`
- `npm view @types/node@20 version --json`
- `npm install --save-dev typescript@6.0.3 @types/node@20.19.43`
- `npm run typecheck`
- `npm run validate`
- `npm run ci:check`
- `git diff --check`
- `npm run context:pack -- --wi WI-CX0028-chore --intent tooling-typescript-baseline --risk R2 --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md --changed .github/workflows/validate.yml --changed docs/decisions/2026-07-08-tooling-typescript-baseline.md --changed docs/decisions/README.md --changed docs/manifest.yaml --changed docs/records/README.md --changed docs/records/validation-wi-cx0028-chore.md --changed package.json --changed package-lock.json --changed tsconfig.json --changed scripts/lib/manifest.mjs --changed scripts/validate-repo.mjs`
- `npm run context:pack -- --wi WI-CX0028-chore --intent tooling-typescript-baseline --risk R2 --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md --changed .github/workflows/validate.yml --changed docs/decisions/2026-07-08-tooling-typescript-baseline.md --changed docs/decisions/README.md --changed docs/manifest.yaml --changed docs/records/README.md --changed docs/records/validation-wi-cx0028-chore.md --changed package.json --changed package-lock.json --changed tsconfig.json --changed scripts/lib/manifest.mjs --changed scripts/validate-repo.mjs --append-ledger --actor codex`

## Result

Passed after local typecheck, validation, combined CI check, and whitespace validation.

## Boundary Check

No runtime source conversion, release publication, deployment, package publication, OSS program submission, license change, production dependency, public API or external contract change, destructive operation, or A3 publication behavior occurred.