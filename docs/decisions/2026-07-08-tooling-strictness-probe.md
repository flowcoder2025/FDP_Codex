# Decision: Tooling Strictness Probe

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0040-chore.

## Context

FDP_Codex adopted a TypeScript tooling baseline in WI-CX0028 without converting runtime `.mjs` sources or enabling strict mode.

The repository scripts have now grown beyond the initial small-script baseline. A direct strict-mode switch would mix a broad migration with ordinary FDP process work and obscure whether failures are implementation defects or expected type debt.

## Decision

Add a non-gating TypeScript strictness probe for repository tooling.

The probe is exposed as `npm run typecheck:strict-probe` and implemented by `scripts/report-type-strictness.mjs`.

The probe runs these TypeScript checks against the existing `tsconfig.json` surface:

- `--strict true`
- `--noImplicitAny true`
- `--strictNullChecks true`

The probe emits a JSON report with pass state, compiler exit code, diagnostic count, line count, top error codes, and the first diagnostics for each probe.

Type debt discovered by the probe is reported as `type-debt` and does not fail the script. Execution errors, such as a missing local TypeScript compiler, still fail the script.

Keep `npm run typecheck` and `npm run ci:check` as the gating baseline. Do not enable strict mode, convert `.mjs` sources to `.ts`, or emit build artifacts in this WI.

## Consequences

Strictness debt is now measurable and repeatable without turning every process change into a broad type migration.

The Decision Needed row for strict TypeScript conversion remains open, but it now has concrete probe evidence for future repayment planning.

The release-candidate tooling lock should either repay this debt or explicitly accept the measured residual type debt.

## Exclusions

This decision does not enable TypeScript strict mode, convert runtime source files, publish a release, deploy, publish a package, submit an OSS program application, authorize A3 behavior, add a production dependency, change a public API or external contract, or perform destructive filesystem or git operations.
