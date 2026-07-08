# Context Pack Builder Specification

Status: draft.

## Purpose

Define the first FDP_Codex context pack selection surface.

The builder helps Codex select the right SSOT chunks for a WI without carrying document bodies across WI or session boundaries.

## Command

```bash
npm run context:pack -- --intent context-pack-building --risk R2 --changed docs/manifest.yaml
```

## Inputs

- `--wi`: optional WI id. Defaults to `.flowset/current-wi.md`.
- `--intent`: task intent string. Defaults to the current WI title.
- `--risk`: risk level. Defaults to the current WI risk.
- `--changed`: repeatable changed path.

## Output

The command writes JSON to stdout.

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

Ledger append remains explicit in v0. The builder does not mutate `.flowset/context-ledger.jsonl`.

## Decision Needed

- Whether context pack output should be stdout-only by default or written to `.flowset/context-packs/`.
- Whether the builder should append ledger records in a future explicit mode.
- Whether selection rules should become a strict policy table instead of heuristics.
