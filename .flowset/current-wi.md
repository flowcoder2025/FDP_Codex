# Current WI

WI id: WI-CX0055-feat

Category: feat

Title: First Layer 2 Dogfood Scaffold Generation

Layer: Layer 1 generating Layer 2 artifacts

Risk: R2

Status: validated

Branch: wi/cx0055-feat-first-layer-2-dogfood-scaffold

Approval envelope: the user approved creating and validating the first separate Layer 2 dogfood target at `C:\dev\FDP_Codex_Dogfood`. This WI may add a reusable dependency-free generator and validator, create the approved target directory, initialize its local Git repository, and make its bootstrap commit. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation reactivation or authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, destructive operations outside verified temporary cleanup, and Layer 1 push or merge without a separate approval.

## Scope

Implement a reusable Layer 2 scaffold generator and standalone validator, prove them with a temporary generic target, generate the accepted FCD dogfood target, validate it independently, and record exact local Git provenance without mixing target facts into Layer 1 SSOT.

## Triage

- PSC: P1
- WTC: FND
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: prove a reusable Layer 2 generation path and a real isolated target, not a one-off copied folder.
- Validator stance: run generic generation in temporary storage, validate the actual target independently, and record exact target Git evidence without making CI depend on the local external path.

## Verification Plan

- Refuse non-empty output directories and use no new dependency.
- Generate every required Layer 2 scaffold role and registered source hashes.
- Validate target WI/KI namespace separation, metadata-only ledger entries, verification debt, and qualified provenance.
- Smoke-test a generic target in verified temporary storage.
- Generate and validate `C:\dev\FDP_Codex_Dogfood` with code `FCD`.
- Initialize the target as a local Git repository with no remote and commit `WI-FCD0001-docs`.
- Keep fresh-context continuation as explicit debt for WI-CX0056-test and target WI-FCD0002-test.
- Run syntax, type, repository, target, and diff checks.

## Completion Evidence

- `scripts/generate-layer2-scaffold.mjs`
- `scripts/validate-layer2-scaffold.mjs`
- `docs/records/validation-wi-cx0055-feat.md`
- `docs/specifications/layer-2-knowledge-scaffold.md`
- `C:\dev\FDP_Codex_Dogfood` local head `09d0e0d9c32f57ce721482d2ea7f2efb7497e3a9` (bootstrap commit `935e0679f22655b2293acf7ee06311c17ff0fd35`)
- `.flowset/state.json`
- `.flowset/current-wi.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `docs/index.md`
- `docs/records/README.md`
- `package.json`
- `scripts/validate-repo.mjs`

## Decision Needed

- Fresh-context continuation must be executed in a new clean target session; it cannot be proven from this generation session.
- Layer 1 push and merge for WI-CX0055 are not included in this local-generation approval.
- Target remote creation and publication remain unapproved.
