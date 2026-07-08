# Context Pack Builder Specification

Status: implemented-v0.

## Purpose

Define the first FDP_Codex context pack selection surface.

The builder helps Codex select the right SSOT chunks for a WI without carrying document bodies across WI or session boundaries.

## Command

Default metadata-only stdout mode:

```bash
npm run context:pack -- --wi WI-CX0020-feat --intent context-pack-building --risk R2 --changed scripts/build-context-pack.mjs
```

Explicit ledger append mode:

```bash
npm run context:pack -- --wi WI-CX0020-feat --intent context-pack-building --risk R2 --changed scripts/build-context-pack.mjs --append-ledger --actor codex
```

## Inputs

- `--wi`: optional WI id. Defaults to `.flowset/current-wi.md`.
- `--intent`: task intent string. Defaults to the current WI title.
- `--risk`: risk level. Defaults to the current WI risk.
- `--changed`: repeatable changed path.
- `--append-ledger`: explicit opt-in to append selected chunk metadata to `.flowset/context-ledger.jsonl`.
- `--actor`: optional actor name for appended ledger records. Defaults to `codex`.

## Output

The command is stdout-only by default. It writes JSON metadata to stdout and does not append ledger records unless `--append-ledger` is present.

Allowed output fields include:

- `context_pack_id`
- `wi_id`
- `risk_level`
- `task_intent`
- `changed_paths`
- `selected_chunk_ids`
- `selected_chunks`
- `hash`
- `load_reasons`
- `decision_ref`
- `ledger_append`
- `body_storage`
- `contains_chunk_bodies`

Forbidden output:

- chunk body text
- copied policy content
- long SSOT replacement summaries
- prior context pack body reuse

## Selection Rules

The v0 builder always selects:

- `AGENTS.md`
- `docs/manifest.yaml`
- current WI state
- fix_plan
- handoff

For R2 and R3 work, it also selects the core policy baseline:

- context hygiene
- work item lifecycle
- naming and commits
- autonomy and approval
- triage strategy
- verification economy

Additional chunks are selected when request tokens match manifest `loads_for` values or when changed paths imply a policy surface.

## Contract

The context pack is metadata only.

A context pack may be written to disk only as metadata. It must not contain source document bodies.

The builder must not write context pack body files. `.flowset/context-packs/` remains out of scope for v0.

Ledger append is explicit. The builder mutates `.flowset/context-ledger.jsonl` only when `--append-ledger` is present.

The `ledger_append` object must report whether append was requested, the ledger path, actor, status, and appended entry count.

## Decision Needed

- Whether selection rules should become a strict policy table instead of heuristics.
