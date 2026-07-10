# Current WI

WI id: WI-CX0061-fix

Category: fix

Title: Worker Descendant Temporal Identity Guard

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0061-fix-worker-descendant-temporal-identity

Approval envelope: the user instructed Codex to repair the workflow and continue through validated publication under the active supervised A2 envelope. Required post-merge validation of WI-CX0059 exposed a Windows false-descendant defect, so this focused Layer 1 hotfix may implement, validate, publish, and merge before any dogfood progression. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation prompt or schedule change, runner reactivation, authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, and destructive operations.

## Scope

Prevent stale Windows parent-pid metadata from being accepted as a live worker descendant by requiring candidate descendants to start no earlier than their observed parent or POSIX process-group root.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: reproduce the post-merge false-descendant path, prove temporal filtering with deterministic synthetic identities, and repeat the full process-tree suite.
- Validator stance: require temporal identity evidence in executable tests and state while preserving the existing cleanup, provider, runner, target, publication, authority, dependency, API, and destructive-operation boundaries.

## Verification Plan

- Reject a candidate descendant when its recorded start time predates the observed parent or process-group root.
- Preserve fallback behavior when a platform cannot provide parseable start times.
- Add a deterministic synthetic process-table case for a stale parent-pid row, a valid child, and a valid grandchild.
- Repeat normal, timeout, interruption, and observed-residual cleanup paths five times locally.
- Run repository, type, diff, no-residual process, and GitHub Actions checks before publication.

## Completion Evidence

- Context pack `ctx-wi-cx0061-fix-20260710105206`; timestamp `2026-07-10T10:52:06.771Z`; 17 metadata-only ledger entries; no chunk bodies.
- PR #44 merged WI-CX0059 at `b905fc6cd0db825dcf91edbaa19688ba2a0d44ec`; the required post-merge `npm.cmd run ci:check` then exposed the intermittent Windows false-descendant path.
- `mergeObservedTree` now applies process start-time ordering to observed-parent and POSIX process-group candidates.
- The synthetic stale-parent-pid case excludes the stale row and retains the valid child and grandchild.
- Five consecutive full lifecycle runs passed normal, timeout, interruption, residual cleanup, and temporal identity checks.
- KI-CX-WORKER-002 is repaid by this hotfix and validator-backed evidence.

## Open Known Issues

- KI-CX-PROVIDER-001: repository-backed model execution is policy-blocked in the current environment even after explicit user approval; it blocks dogfood continuation, generalized unattended model workers, and runner reactivation.

## Boundary

The A2 runner remains paused. The Layer 2 target was not touched. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation schedule or prompt change, automation reactivation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No destructive filesystem or git operation occurred.
