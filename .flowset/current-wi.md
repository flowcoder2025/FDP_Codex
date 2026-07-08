# Current WI

WI id: WI-CX0031-chore

Category: chore

Title: Context Ledger Dedupe Policy

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0031-chore-context-ledger-dedupe-policy

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

## Scope

Decide how FDP_Codex treats repeated context ledger appends. Preserve context hygiene by keeping `.flowset/context-ledger.jsonl` append-only while allowing metadata-only dedupe as a derived view or report.

## Triage

- PSC: P2
- WTC: KNOW
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: ledger auditability, context hygiene, and false-green review.
- Validator stance: deterministic checks for append-only ledger policy, derived-view-only dedupe, manifest registration, and existing `npm run ci:check`.

## Verification Plan

- Confirm existing ledger contract forbids body storage and uses explicit append.
- Decide whether compaction rewrites are allowed.
- Update context hygiene and context pack specification with the dedupe/compaction boundary.
- Add validator coverage so future changes cannot claim in-place ledger compaction as normal WI work.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0031-chore.md`.

## Completion Evidence

- `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md`
- `docs/records/validation-wi-cx0031-chore.md`
- `docs/policies/context-hygiene.md`
- `docs/specifications/context-pack-builder.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0031-chore.
