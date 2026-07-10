# Context Selection Breadth Guard

Status: accepted-v0.

Date: 2026-07-10.

WI: WI-CX0058-fix.

## Context

The v1 dynamic matcher tokenized WI ids, current titles, intent text, and changed paths, then selected every manifest chunk whose `loads_for` list shared any token. As the repository accumulated validation records, generic tokens such as `validation` and `handoff` selected 123 chunks for WI-CX0056, 120 for WI-CX0057, and 76 for the initial WI-CX0058 context build.

Metadata-only storage prevented body carryover, but the selection volume still weakened context hygiene, audit clarity, repeated-run efficiency, and the user's intended clean-worker UX.

## Decision

The dynamic portion of `manifest.loads-for-token-match` now accepts only exact specialized tags explicitly present in `--intent`. Generic single terms, WI ids, the current title, and changed-path tokens do not drive dynamic manifest matching.

Changed paths select only chunks with an exact source-path match under `manifest.explicit-reference-match`. Explicit chunk ids, source paths, and WI ids in the intent also select their exact chunks.

Dynamic `loads_for` selection is limited to 24 chunks. Total selection is limited to 40 chunks. An over-broad request is rejected before any ledger append and is never silently truncated.

Successful packs expose metadata-only `breadth_guard` evidence. The existing always-on, WI flow, risk baseline, static intent, stdout-default, explicit-append, and append-only ledger contracts remain in force.

## Supersession

This decision supersedes only the token-intersection behavior of `manifest.loads-for-token-match` in `docs/decisions/2026-07-08-context-selection-rule-table.md`. Stable rule ids and the rest of that decision remain accepted.

## Consequences

Equivalent WI-CX0057 input selects 29 chunks instead of 120. The initial WI-CX0058 input selects 18 instead of 76. The historical WI-CX0056 request is rejected at an expected 41 total chunks rather than appending another 123-entry pack.

KI-CX-CONTEXT-001 is repaid when repository validation locks these regressions and the flow state points to this decision and WI-CX0058 evidence.

## Boundary

This decision changes only Layer 1 context-selection metadata behavior. It does not store chunk bodies, rewrite the append-only ledger, change a public API or external contract, add a production dependency, reactivate or reconfigure the runner, touch the Layer 2 target, expand A2/A3 authority, execute S2 review, create a reviewer, publish a release, deploy, publish a package, submit to an OSS program, or authorize destructive operations.
