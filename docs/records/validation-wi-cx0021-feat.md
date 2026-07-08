# Validation Record: WI-CX0021-feat

WI: WI-CX0021-feat.

Status: evidence.

Date: 2026-07-08.

## Scope

Context Selection Rule Table.

## Evidence

- Added stable selection rule ids to `scripts/build-context-pack.mjs`.
- Added top-level `selection_rule_ids` and per-chunk `selection_rules` metadata to context pack stdout.
- Updated `docs/specifications/context-pack-builder.md` with the implemented rule table.
- Added `docs/decisions/2026-07-08-context-selection-rule-table.md` as the accepted rule-table decision.
- Updated `docs/manifest.yaml` hook output and chunk registry for the decision and validation record.
- Extended `scripts/validate-repo.mjs` to verify rule-table coverage and metadata.

## Commands

- `node scripts/build-context-pack.mjs --wi=WI-CX0021-feat --intent="github issue validation context-pack-building" --risk=R2 --changed=docs/manifest.yaml --changed=scripts/build-context-pack.mjs`
- `node scripts/build-context-pack.mjs --wi=WI-CX0021-feat --intent=context-selection-rule-table --risk=R2 --changed=scripts/build-context-pack.mjs --changed=docs/specifications/context-pack-builder.md --changed=docs/manifest.yaml --changed=scripts/validate-repo.mjs`
- `node scripts/build-context-pack.mjs --wi WI-CX0021-feat --intent context-selection-rule-table --risk R2 --changed scripts/build-context-pack.mjs --changed docs/specifications/context-pack-builder.md --changed docs/manifest.yaml --changed scripts/validate-repo.mjs --append-ledger --actor codex`
- `npm run validate`
- `git diff --check`

## Result

Passed after local validation.

The rule-coverage sample exercised all 9 required rule ids: `always-on.reference`, `flow.wi-state`, `risk.r2-r3-policy-baseline`, `changed.manifest`, `changed.tooling`, `intent.context-pack`, `intent.github`, `intent.validation`, and `manifest.loads-for-token-match`.

Default context pack generation left `.flowset/context-ledger.jsonl` unchanged at 235 lines and reported `contains_chunk_bodies=false`.

Explicit append mode changed `.flowset/context-ledger.jsonl` from 235 to 260 lines, reported `entry_count=25`, and reported `contains_chunk_bodies=false`.

The repository validator reported `ok=true` with context selection rule-table checks enabled.

## Boundary Check

No release publication, deployment, package publication, or OSS program submission occurred.