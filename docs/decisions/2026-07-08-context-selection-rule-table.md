# Decision: Context Selection Rule Table

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0021-feat.

## Context

FDP_Codex already rebuilt context packs from `docs/manifest.yaml`, but the selection logic still lived as unnamed heuristics inside the builder.

Unnamed heuristics make future validator work and blind review harder because a reviewer can see selected chunks but cannot tell which stable rule selected them.

## Decision

Context pack selection moves to a stable rule table.

Static selection logic must be represented by stable rule ids in `scripts/build-context-pack.mjs` and `docs/specifications/context-pack-builder.md`.

The builder must emit top-level `selection_rule_ids` and per-chunk `selection_rules` metadata.

The dynamic `loads_for` token match remains supported, but it is also named as `manifest.loads-for-token-match`.

The stdout-only default and explicit `--append-ledger` boundary from `docs/decisions/2026-07-08-context-pack-command-surface.md` remain unchanged.

## Consequences

Validator checks can assert rule-table coverage without reading chunk bodies.

Future selection changes must add or modify a named rule instead of silently changing branch logic.

The remaining context-selection Decision Needed item is closed for v1.

## Exclusions

This decision does not introduce AI memory, persist chunk bodies, write context pack body files, publish a release, deploy, publish a package, or submit an OSS program application.