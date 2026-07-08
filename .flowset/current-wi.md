# Current WI

WI id: WI-CX0039-docs

Category: docs

Title: Flow State Readable Snapshot

Layer: Layer 1

Risk: R1

Status: validated

Branch: wi/cx0039-docs-flow-state-readable-snapshot

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, A3 publication behavior, and first Layer 2 target-project scaffold generation.

## Scope

Add a compact machine-readable Layer 1 flow-state snapshot for current WI, current priority, user-decision wait, triggered work, and hard-stop reminders without choosing the Layer 2 project scope code or generating Layer 2 target artifacts.

## Triage

- PSC: P2
- WTC: KNOW
- Risk: R1
- ESC: E1+E3+E6
- Primary evaluator stance: context-hygiene and automation-readability improvement without crossing user-gated Layer 2 boundaries.
- Validator stance: deterministic coherence checks between the JSON snapshot, markdown flow files, manifest registration, context pack selection, and Decision Needed queue repayment.

## Verification Plan

- Rebuild WI context from the manifest and append metadata-only ledger entries.
- Add `.flowset/state.json` as a compact machine-readable flow-state snapshot.
- Register `flow.state-snapshot` in the manifest and documentation indexes.
- Add the snapshot to the WI-start context pack rule.
- Add validator coverage for snapshot coherence and DQ-DEBT repayment.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0039-docs.md`.

## Completion Evidence

- `.flowset/state.json`
- `docs/decisions/2026-07-08-flow-state-readable-snapshot.md`
- `docs/records/validation-wi-cx0039-docs.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `scripts/build-context-pack.mjs`
- `scripts/validate-repo.mjs`

## Decision Needed

- The user must still choose the Layer 2 project scope code rule before first Layer 2 scaffold generation.
