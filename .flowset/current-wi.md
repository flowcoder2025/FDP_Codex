# Current WI

WI id: WI-CX0058-fix

Category: fix

Title: Context Pack Selection Breadth Guard

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0058-fix-context-pack-selection-breadth-guard

Approval envelope: the user instructed Codex to proceed with the next recommended WI under the active supervised A2 envelope. This WI may implement, validate, publish, and merge the Layer 1 context-selection fix after checks pass. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation prompt or schedule change, runner reactivation, authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, and destructive operations.

## Scope

Replace broad token-intersection context selection with exact explicit references and specialized intent-tag matching, then reject over-broad packs before ledger append.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: prove materially smaller context selection for the observed 76, 120, and 123 chunk cases without weakening always-on, flow, risk, or explicit-reference coverage.
- Validator stance: require deterministic exact matching, hard limits, fail-before-append behavior, metadata-only output, KI repayment, and retained runner and publication boundaries.

## Verification Plan

- Preserve always-on, WI flow, R2 policy baseline, static intent, and exact changed-source selection.
- Allow dynamic `loads_for` selection only for exact specialized tags explicitly present in `--intent`.
- Limit dynamic selection to 24 chunks and total selection to 40 chunks.
- Reject over-broad requests before ledger append without silent truncation.
- Re-run equivalent WI-CX0056, WI-CX0057, and WI-CX0058 inputs.
- Run syntax, repository, type, diff, and GitHub Actions checks.

## Completion Evidence

- Initial context pack `ctx-wi-cx0058-fix-20260710081912`; timestamp `2026-07-10T08:19:12.097Z`; 76 metadata-only ledger entries; no chunk bodies.
- Accepted decision `docs/decisions/2026-07-10-context-selection-breadth-guard.md`.
- Layer 1 evidence `docs/records/validation-wi-cx0058-fix.md`.
- Equivalent WI-CX0058 selection reduced from 76 to 18.
- Equivalent WI-CX0057 selection reduced from 120 to 29.
- Equivalent WI-CX0056 request is rejected at 41 total chunks instead of appending another 123-entry pack.
- KI-CX-CONTEXT-001 is repaid.

## Open Known Issues

- KI-CX-WORKER-001: ephemeral worker attempts can leave processes alive after wrapper termination; repay through WI-CX0059-fix before generalized unattended ephemeral worker use or runner reactivation.

## Boundary

The A2 runner remains paused. The Layer 2 target was not touched. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation schedule or prompt change, automation reactivation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No destructive filesystem or git operation occurred.
