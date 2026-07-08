# Context Hygiene Policy

Status: accepted-v0.

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
4. Run `npm run context:pack -- --wi <WI> --intent <intent> --risk <risk> --changed <path> --append-ledger --actor codex` when the selected context must be recorded.
5. Load only the selected chunk sources from the generated context pack metadata.
6. Work from the selected active context.

## Auto-Compact Boundary

Auto-compact is not a new WI boundary, fresh run, fresh session, or context hygiene reset. It may preserve summarized same-thread context.

If auto-compact occurs during a long WI, Codex may finish the active WI, but must not use that compacted context as the basis for the next independent WI. The next independent WI must rebuild context from `docs/manifest.yaml` and the live flow-state files.

## Required WI End Procedure

1. Update the relevant SSOT documents.
2. Update records only with evidence or ledger metadata.
3. Update handoff with pointers and next actions, not copied SSOT bodies.
4. Dispose of the active context pack.
5. Do not carry chunk bodies forward.
6. Do not treat auto-compact summaries as reusable context packs.
## Handoff Size Rule

Layer 1 FDP_Codex handoff must remain compact and must not exceed 220 lines.

The handoff should point to SSOT documents, validation records, decisions, PRs, and next actions instead of copying policy bodies.

A larger handoff limit requires a future profile-specific policy WI. Until then, 220 lines is the validator-backed limit.

## Hook Contract

The context pack builder may select chunks and produce a context pack manifest. It must not become a hidden memory store.

Allowed hook output:

- context pack id
- selected chunk ids
- source paths
- hashes
- load reasons
- decision references
- `ledger_append` metadata

Forbidden hook output:

- carried chunk bodies
- long summaries that replace SSOT
- broad unscoped document dumps
- previous context packs reused as new context

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.
