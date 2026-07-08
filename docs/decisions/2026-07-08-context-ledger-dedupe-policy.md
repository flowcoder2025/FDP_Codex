# Decision: Context Ledger Dedupe Policy

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0031-chore.

## Context

Repeated context pack generation appends many ledger entries because the same SSOT chunks are selected across WIs, validation reruns, and handoff updates.

That repetition is noisy, but it is also audit evidence. Rewriting the source ledger would weaken the ability to reconstruct what context was selected at a specific time.

## Decision

Do not compact, rewrite, delete, or deduplicate `.flowset/context-ledger.jsonl` in place during ordinary WI work.

The source context ledger remains append-only audit evidence.

Dedupe is allowed only as a metadata-only derived view or report computed from the ledger. A derived dedupe view may group entries by `wi_id`, `chunk_id`, `source`, and `hash`, or by `chunk_id`, `source`, and `hash` when the view is explicitly cross-WI.

A dedupe view must not store chunk bodies, copied policy text, or long summaries that replace SSOT. It must not become the source of truth and must not be used to erase audit history.

If a future tool emits a dedupe report, the report must be reproducible from `.flowset/context-ledger.jsonl` and `docs/manifest.yaml`, and the report file must be separate from the source ledger.

## Consequences

Large ledgers are acceptable during bootstrap as long as they remain metadata-only and valid JSONL.

The right optimization is a deterministic derived view, not compaction of the audit log.

A future implementation WI may add a read-only ledger report command, but it must preserve the append-only source ledger boundary.

## Boundary

This decision does not rewrite `.flowset/context-ledger.jsonl`, delete historical ledger entries, publish a release, deploy, publish a package, submit the OSS program application, change the license, add a production dependency, authorize A3 publication behavior, or authorize destructive local realignment.

## Decision Needed

None for the Layer 1 source-ledger dedupe policy.
