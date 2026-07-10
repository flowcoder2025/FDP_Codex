# WI-CX0058-fix Validation Record

Status: validated.

Date: 2026-07-10.

Title: Context Pack Selection Breadth Guard.

## Context Evidence

- Initial pack: `ctx-wi-cx0058-fix-20260710081912`.
- Initial timestamp: `2026-07-10T08:19:12.097Z`.
- Initial result: 76 metadata-only ledger entries.
- `contains_chunk_bodies: false`.
- The initial request used a precise intent and four changed files, yet v1 still selected 76 chunks because tokenized intent, WI, prior title, and paths intersected generic `loads_for` terms.

## Root Cause

The v1 matcher flattened semantic tags into individual words and accepted any intersection. Generic terms such as `validation`, `handoff`, `context`, and path fragments therefore accumulated historical records as the manifest grew. The rule had no deterministic dynamic or total selection limit.

## Implementation

- `manifest.explicit-reference-match` selects exact changed sources and explicitly named chunk ids, sources, or WI ids.
- `manifest.loads-for-token-match` now uses only exact specialized tags explicitly present in `--intent`.
- Generic single terms, WI ids, current titles, and changed-path tokens no longer drive dynamic `loads_for` matching.
- Dynamic matching is limited to 24 chunks and complete packs to 40 chunks.
- Over-broad requests return `context_selection_breadth_guard_rejected` before ledger append and are not silently truncated.
- Successful output exposes `breadth_guard` metadata.

## Regression Evidence

| Input | Before | After |
| --- | ---: | ---: |
| Equivalent WI-CX0058 precise request | 76 | 18 |
| Equivalent WI-CX0057 session-boundary request with changed handoff | 120 | 29 |
| Equivalent WI-CX0056 multi-tag request | 123 appended | rejected before append at dynamic 29 and total 41 |

The 18- and 29-chunk outputs retain always-on, WI flow, R2 policy baseline, static intent, changed-source, and exact specialized-tag selections. No source bodies are included.

## Ephemeral Worker Dogfood

- The controller pre-created `wi/cx0058-fix-context-pack-selection-breadth-guard` and launched two `codex exec --ephemeral --sandbox workspace-write` attempts without creating app tasks.
- Neither attempt produced visible events before the controller timeout.
- After wrapper termination, observed process ids 61312, 40280, and 60288 remained alive until exact `Stop-Process` cleanup.
- One attempt left an incomplete builder-only partial edit that declared exact-match constants without wiring selection behavior. The controller inspected that diff and completed the implementation without discarding it.
- The observed process ids were confirmed terminated. No runner configuration or Layer 2 target file was changed.

## Known Issues

- KI-CX-CONTEXT-001 is repaid by `docs/decisions/2026-07-10-context-selection-breadth-guard.md` and the regression validator.
- KI-CX-WORKER-001 is open. Severity: Medium. Owner: CODEX.
- Trigger: ephemeral worker attempts produced no visible events, left a partial edit, and left observed processes alive after wrapper termination.
- Defer reason: the controller terminated the exact processes, reviewed the partial diff, and continued safely in the one visible control task.
- Repayment condition: WI-CX0059-fix adds bounded timeout, event/error capture, and verified descendant cleanup before controller fallback.
- Hard stop: before generalized unattended ephemeral worker use or runner reactivation.

## Strategy

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: compare the exact historical requests and reject any fix that merely hides counts or drops always-on safety coverage.
- Validator stance: execute passing and rejecting samples, verify fail-before-append ordering, require metadata-only output, and preserve all control-plane hard stops.

## Verification Results

- `node --check scripts/build-context-pack.mjs`: passed.
- `node --check scripts/validate-repo.mjs`: passed.
- Equivalent WI-CX0058, WI-CX0057, and WI-CX0056 regression samples: passed.
- Rejected `--append-ledger` proof: exit code 1, `context_selection_breadth_guard_rejected`, and ledger line count unchanged at 4714 before and after.
- `npm.cmd run validate`: passed.
- `npm.cmd run ci:check`: passed.
- `git diff --check`: passed.
- Local runner status: `PAUSED`.

## Boundary

The A2 runner remains paused and no automation prompt, schedule, or status change occurred. The Layer 2 target was not touched and no first Layer 2 scaffold generation occurred. No target remote, target push, or target PR occurred. No release publication, deployment, package publication, OSS program submission, A3 publication behavior, production dependency addition, public API or external contract change, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No destructive filesystem or git operation occurred.
