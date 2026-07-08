# Validation Record: WI-CX0031-chore Context Ledger Dedupe Policy

Status: evidence.

Date: 2026-07-08.

WI: WI-CX0031-chore.

## Scope

Decide whether repeated context ledger appends should be compacted or deduplicated without storing chunk bodies.

## Decision Summary

- Source ledger `.flowset/context-ledger.jsonl` remains append-only audit evidence.
- In-place compact, rewrite, delete, or dedupe of the source ledger is not allowed during ordinary WI work.
- Dedupe is allowed only as a metadata-only derived view or report.
- A derived view may group by `wi_id`, `chunk_id`, `source`, and `hash`, or by `chunk_id`, `source`, and `hash` for an explicitly cross-WI report.
- A derived view must not store chunk bodies, copied SSOT text, or long summaries, and must not replace the source ledger.

## Context Pack Evidence

- Start context pack: `ctx-wi-cx0031-chore-20260708070009`.
- Start ledger append count: 72 metadata entries.
- Start context body check: `contains_chunk_bodies=False`.

## Evaluation

- PSC: P2.
- WTC: KNOW.
- Risk: R2.
- ESC: E1+E3+E5+E6.
- S1 adversarial review: in-place compaction would erase audit sequence evidence, so the policy forbids source ledger rewriting and allows only reproducible derived views.

## Validation Results

- Final context pack: `ctx-wi-cx0031-chore-20260708070730`.
- Final context ledger append count: 75 metadata entries.
- Final context pack body check: `contains_chunk_bodies=False`.
- `npm run typecheck`: passed.
- `npm run validate`: passed with `manifest_chunk_count=84`, `ledger_line_count=1313`, and no warnings or errors before the final ledger append.
- `npm run ci:check`: passed after the final ledger append with `ledger_line_count=1388` and no warnings or errors.

## Boundary

No source ledger rewrite, historical ledger deletion, release publication, deployment, package publication, OSS program submission, license change, production dependency addition, A3 publication behavior, public API or external contract change, or destructive local realignment occurred.
