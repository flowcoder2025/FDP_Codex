# Current WI

WI id: WI-CX0057-docs

Category: docs

Title: Ephemeral Worker Controller Boundary Contract

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0057-docs-ephemeral-worker-controller-boundary

Approval envelope: the user approved the recommendation to formalize the single-control-task and ephemeral-worker boundary and proceed through Layer 1 validation, publication, and merge. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation prompt or schedule change, runner reactivation, authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, and destructive operations.

## Scope

Formalize one visible control task plus ephemeral CLI workers, with controller-owned Git lifecycle operations and worker-owned repository reconstruction, editing, and validation.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: verify that clean-context execution does not create persistent app task fan-out or hide the user's control surface.
- Validator stance: enforce role ownership, sandbox limits, KI repayment, runner pause, and retained hard stops.

## Verification Plan

- Require one visible control task and `codex exec --ephemeral` worker semantics.
- Assign branch creation, staging, commit, push, PR, merge, and approvals to the controller.
- Assign SSOT reconstruction, worktree edits, and validation to the worker.
- Reject `danger-full-access` solely for Git metadata writes and reject worker-created app task fan-out.
- Keep the runner paused and retain all target publication and authority hard stops.
- Run Layer 1 syntax, repository, type, and diff checks.

## Completion Evidence

- Layer 1 context pack `ctx-wi-cx0057-docs-20260710073524`; 120 metadata-only ledger entries; no chunk bodies.
- Accepted decision `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md`.
- Layer 1 evidence `docs/records/validation-wi-cx0057-docs.md`.
- KI-CX-DOGFOOD-001 repaid by a validator-backed controller-owned Git boundary.

## Open Known Issues

- KI-CX-CONTEXT-001: WI-CX0057 selected 120 metadata chunks because a general handoff token matched historical metadata; repay through WI-CX0058-fix before generalized automated WI cadence.

## Boundary

The A2 runner remains paused. The target has no remote and no target push or PR occurred. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation schedule or prompt change, automation reactivation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No new first Layer 2 scaffold generation occurred. No destructive filesystem or git operation occurred.
