# Context Hygiene Policy

Status: lock candidate.

## Purpose

Prevent context contamination while keeping work auditable across sessions.

The policy separates active context, context packs, and context ledgers.

## Definitions

Active context is the material currently loaded for a WI and session.

Context pack is the temporary set of SSOT chunks selected for the active task.

Context ledger is an audit trail of what was loaded and why. It records metadata only.

Chunk is a manifest-addressable unit of policy, specification, decision, runbook, record, or flow state.

## Rules

1. Active context expires at the WI or session boundary.
2. Context pack bodies must not be carried into the next WI or session.
3. Every new WI must rebuild its context pack from `docs/manifest.yaml`.
4. The ledger must not contain chunk bodies.
5. The ledger must not contain long summaries that function as substitute SSOT.
6. The ledger may record `chunk_id`, `source`, `hash`, `load_reason`, `wi_id`, `decision_ref`, `actor`, and `timestamp`.
7. `AGENTS.md` and `docs/manifest.yaml` are always-on references.
8. Other documents are loaded only when they are selected for the current context pack.

## Required WI Start Procedure

1. Read the current WI.
2. Read `AGENTS.md`.
3. Read `docs/manifest.yaml`.
4. Select only chunks needed for the WI intent and risk.
5. Record selected chunk metadata in `.flowset/context-ledger.jsonl`.
6. Work from the selected context pack.

## Required WI End Procedure

1. Update the relevant SSOT documents.
2. Update records only with evidence or ledger metadata.
3. Update handoff with pointers and next actions, not copied SSOT bodies.
4. Dispose of the active context pack.
5. Do not carry chunk bodies forward.

## Hook Contract

The future hook may select chunks and produce a context pack manifest. It must not become a hidden memory store.

Allowed hook output:

- context pack id
- selected chunk ids
- source paths
- hashes
- load reasons
- decision references

Forbidden hook output:

- carried chunk bodies
- long summaries that replace SSOT
- broad unscoped document dumps
- previous context packs reused as new context

## Decision Needed

- Exact hash algorithm and whether hashes are required before every manual context pack build.
- Whether the first implementation should be a shell script, Node script, Codex skill, or app automation.
