# Current WI

WI id: WI-CX0059-fix

Category: fix

Title: Ephemeral Worker Process Lifecycle Guard

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0059-fix-ephemeral-worker-process-lifecycle-guard

Approval envelope: the user instructed Codex to repair the workflow before further dogfood progression and later instructed Codex to continue after local validation under the active supervised A2 envelope. This WI may implement, validate, publish, and merge the Layer 1 worker lifecycle guard after checks pass. A live model smoke that transmits repository content required explicit approval; the user approved it, but execution policy still rejected it, so the separate provider boundary remains blocked. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation prompt or schedule change, runner reactivation, authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, and destructive operations.

## Scope

Add a bounded and observable ephemeral worker supervisor that tracks and verifies cleanup of the exact root and descendant process identities before controller fallback.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: prove normal output capture, finite timeout, interruption handling, exact process identity tracking, descendant-first cleanup, and post-cleanup absence.
- Validator stance: fail closed when observation or cleanup cannot be verified; reject `danger-full-access`; preserve runner, target, publication, authority, dependency, API, and destructive-operation boundaries.

## Verification Plan

- Stream worker JSONL stdout and stderr without persisting prompt or event bodies.
- Apply a finite timeout and handle controller interruption.
- Track pid, parent pid, executable name, and process start time.
- Terminate matched descendants before parents and verify no matched process remains.
- Validate normal, timeout, interruption, and observed-residual paths with a deterministic process tree.
- Validate the installed Codex CLI path without a model request.
- Attempt a live read-only model smoke only after explicit repository-content transmission approval; if execution policy still rejects it, record the no-bypass provider boundary separately from process cleanup.
- Run syntax, repository, type, diff, and GitHub Actions checks before publication.

## Completion Evidence

- Context pack `ctx-wi-cx0059-fix-20260710095004`; timestamp `2026-07-10T09:50:04.441Z`; 17 metadata-only ledger entries; no chunk bodies.
- Accepted decision `docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md`.
- Implemented specification `docs/specifications/ephemeral-worker-runner.md`.
- Normal, timeout, interruption, and observed-residual fixture cases pass with verified process cleanup and no remaining fixture process.
- Local `codex exec --help` smoke passes through the managed supervisor without a model request.
- The live read-only model smoke was rejected by execution policy before execution and again after explicit user approval; no bypass was attempted.
- KI-CX-WORKER-001 is repaid by deterministic OS process-tree cleanup, no-residual proof, and the installed Codex CLI local smoke.

## Open Known Issues

- KI-CX-PROVIDER-001: repository-backed model execution is policy-blocked in the current environment even after explicit user approval; it blocks dogfood continuation, generalized unattended model workers, and runner reactivation.

## Boundary

The A2 runner remains paused. The Layer 2 target was not touched. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation schedule or prompt change, automation reactivation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No destructive filesystem or git operation occurred.
