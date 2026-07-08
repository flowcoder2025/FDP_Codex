# Validation Record: WI-CX0022-docs

WI: WI-CX0022-docs.

Status: evidence.

Date: 2026-07-08.

## Scope

Decision Queue State Codes.

## Evidence

- Added `docs/policies/decision-queue.md` with state codes, owner gates, lock blocker values, and queue rules.
- Added `docs/decisions/2026-07-08-decision-queue-state-codes.md` as the accepted state-code decision.
- Converted `.flowset/fix_plan.md` Decision Needed Queue from bullets into a state-coded table.
- Updated `docs/decisions/README.md` to point to the live queue instead of duplicating it.
- Registered the policy, decision, and validation record in `docs/manifest.yaml`.
- Extended `scripts/validate-repo.mjs` to verify the decision queue contract.

## Commands

- `node scripts/build-context-pack.mjs --wi=WI-CX0022-docs --intent=decision-queue-state-codes --risk=R2 --changed=.flowset/fix_plan.md --changed=docs/policies/decision-queue.md --changed=docs/manifest.yaml --changed=scripts/validate-repo.mjs`
- `node scripts/build-context-pack.mjs --wi WI-CX0022-docs --intent decision-queue-state-codes --risk R2 --changed .flowset/fix_plan.md --changed docs/policies/decision-queue.md --changed docs/manifest.yaml --changed scripts/validate-repo.mjs --append-ledger --actor codex`
- `npm run validate`
- `git diff --check`

## Result

Passed after local validation.

Default context pack generation left `.flowset/context-ledger.jsonl` unchanged at 278 lines and reported `contains_chunk_bodies=false`.

Explicit append mode changed `.flowset/context-ledger.jsonl` from 278 to 300 lines, reported `entry_count=22`, and reported `contains_chunk_bodies=false`.

The repository validator reported `ok=true` with decision queue checks enabled, 12 state-coded queue rows, and no invalid state, owner, blocker, or debt trigger entries.

## Boundary Check

No release publication, deployment, package publication, or OSS program submission occurred.
