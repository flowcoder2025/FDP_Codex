# Context Pack Builder Specification

Status: implemented-v2.

## Purpose

Define the FDP_Codex context pack selection surface.

The builder helps Codex select the right SSOT chunks for a WI without carrying document bodies across WI or session boundaries.

## Command

Default metadata-only stdout mode:

```bash
npm run context:pack -- --wi WI-CX0021-feat --intent context-selection-rule-table --risk R2 --changed scripts/build-context-pack.mjs
```

Explicit ledger append mode:

```bash
npm run context:pack -- --wi WI-CX0021-feat --intent context-selection-rule-table --risk R2 --changed scripts/build-context-pack.mjs --append-ledger --actor codex
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
- `selection_rule_ids`
- `selected_chunks`
- `hash`
- `load_reasons`
- `selection_rules`
- `breadth_guard`
- `decision_ref`
- `ledger_append`
- `body_storage`
- `contains_chunk_bodies`

Forbidden output:

- chunk body text
- copied policy content
- long SSOT replacement summaries
- prior context pack body reuse

## Selection Rule Table

Static selection behavior must be represented by stable rule ids.

| Rule id | Trigger | Selected chunks | Load reason |
| --- | --- | --- | --- |
| `always-on.reference` | `always_on` manifest entries | `AGENTS.md`, `docs/manifest.yaml` | `always-on reference` |
| `flow.wi-state` | WI start or any context pack build | `flow.current-wi`, `flow.fix-plan`, `flow.handoff` | `WI start flow state` |
| `risk.r2-r3-policy-baseline` | risk is `R2` or `R3` | context hygiene, lifecycle, naming, autonomy, triage, verification economy policies | `<risk> policy baseline` |
| `changed.manifest` | changed path includes `docs/manifest.yaml` | manifest, context hygiene, knowledge system | `manifest changed` |
| `changed.tooling` | changed path includes `scripts/**` or `package.json` | package metadata, validator | `tooling changed` |
| `intent.context-pack` | request tokens include `context`, `pack`, or `building` | knowledge system, context hygiene | `context pack request` |
| `intent.github` | request tokens include `github`, `issue`, or `pr` | git workflow, GitHub issue governance | GitHub/issue request |
| `intent.validation` | request tokens include `validation`, `validator`, or `ci` | validator | `validation request` |
| `manifest.explicit-reference-match` | changed path exactly matches a chunk source, or intent explicitly names a chunk id, source, or WI id | explicitly referenced chunk | exact-reference reason |
| `manifest.loads-for-token-match` | an explicit multi-part `--intent` tag exactly matches a chunk `loads_for` tag | matched chunk | `loads_for exactly matched intent tags: ...` |

The rule table is not a permission system. It only selects SSOT metadata for the active WI.

## Breadth Guard

Dynamic `loads_for` selection uses exact specialized intent tags. A specialized tag contains multiple parts joined by punctuation, such as `session-boundary` or `context-pack-building`. Generic single terms such as `validation`, `handoff`, `audit`, and `wi-start` do not trigger dynamic manifest selection.

WI ids, current-WI titles, and tokenized changed paths do not feed dynamic `loads_for` matching. Changed paths instead select only the manifest chunk whose source path exactly matches. Explicit chunk ids, source paths, and WI ids in `--intent` also select their exact chunks.

The dynamic `loads_for` contribution is limited to 24 chunks and the complete context pack is limited to 40 chunks. If either limit would be exceeded, the builder must return `context_selection_breadth_guard_rejected` and exit before ledger append. It must not silently truncate a pack.

Successful output includes a `breadth_guard` object with the policy id, limits, dynamic count, explicit-reference count, total count, and `passed` status.

## Contract

The context pack is metadata only.

A context pack may be written to disk only as metadata. It must not contain source document bodies.

The builder must not write context pack body files. `.flowset/context-packs/` remains out of scope.

Ledger append is explicit. The builder mutates `.flowset/context-ledger.jsonl` only when `--append-ledger` is present.

Every selected chunk in stdout metadata must include at least one `selection_rules` entry.

The top-level `selection_rule_ids` list must summarize the unique rule ids that selected the context pack.

The `ledger_append` object must report whether append was requested, the ledger path, actor, status, and appended entry count.

## Ledger Dedupe Contract

The builder append mode must keep `.flowset/context-ledger.jsonl` append-only.

The builder must not deduplicate before append and must not rewrite, compact, or delete existing ledger lines.

Any future ledger dedupe command must be read-only with respect to `.flowset/context-ledger.jsonl` and must emit a derived metadata-only report outside the source ledger.

A dedupe report may group records by `wi_id`, `chunk_id`, `source`, and `hash`, or by `chunk_id`, `source`, and `hash` for cross-WI reporting. It must be reproducible from the source ledger and `docs/manifest.yaml`.
## Decision Needed

- None for the implemented v1 rule table.
