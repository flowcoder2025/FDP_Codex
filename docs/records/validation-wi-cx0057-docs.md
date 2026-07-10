# WI-CX0057-docs Validation Record

Status: validated.

Date: 2026-07-10.

Title: Ephemeral Worker Controller Boundary Contract.

## Context Evidence

- Context pack: `ctx-wi-cx0057-docs-20260710073524`.
- Initial ledger timestamp: `2026-07-10T07:35:24.654Z`.
- Selection result: 120 metadata-only ledger entries.
- `contains_chunk_bodies: false`.
- Only directly relevant selected SSOT sources were read; context-pack bodies were not carried across the WI boundary.
- The 120-entry breadth occurred because the changed `.flowset/handoff.md` path contributed a general `handoff` token that matched many historical `loads_for` values. This is direct evidence for KI-CX-CONTEXT-001 and WI-CX0058-fix, not scope for this WI.

## Verified Input

- WI-CX0056 proved a minimal-prompt reconstruction session `019f4ad7-d478-7ae1-809c-19c19d20780b` and a successful continuation session `019f4acb-3066-7c12-b39e-ce3b2e371294`.
- The target remains on `WI-FCD0002-test` at `a2702ab4fd370f37af1e804cb6b7e4977ea98f6a`, with no remote.
- The default `workspace-write` ephemeral worker could edit the worktree but could not write target Git metadata.
- The live runner configuration at `C:\Users\User\.codex\automations\fdp-codex-a2-worktree-wi-runner\automation.toml` was inspected and records `status = "PAUSED"`.

## Contract Result

- The accepted topology is one visible control task plus `codex exec --ephemeral` workers.
- The controller owns branch creation and commit, plus staging, push, PR, merge, and approval handling.
- The worker owns repository reconstruction, worktree edits, and validation.
- Workers must not create user-owned Codex app tasks or use `danger-full-access` solely to write Git metadata.
- The controller must inspect the complete diff and rerun relevant validation before committing worker changes.
- The separately installed Codex app worktree runner remains a distinct execution surface with distinct capability proof.

## Known Issues

- KI-CX-DOGFOOD-001 is repaid by `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md` and validator-backed policy markers.
- KI-CX-CONTEXT-001 remains open. Repayment WI: WI-CX0058-fix. Hard stop: before generalized automated WI cadence or efficiency claims.
- Repaying KI-CX-DOGFOOD-001 does not authorize runner reactivation or a claim that the worker owns the complete WI Git lifecycle.

## Strategy

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: verify that the topology protects the user's stable control surface while preserving clean worker context.
- Validator stance: require explicit role ownership, sandbox limits, no app task fan-out, KI repayment, runner pause, and retained publication boundaries.

## Verification Results

- `node --check scripts/validate-repo.mjs`: passed.
- `npm.cmd run validate`: passed, including `ephemeral_worker_live_runner_status: paused`.
- `npm.cmd run ci:check`: passed TypeScript typecheck and repository validation.
- `git diff --check`: passed.
- Local target check: branch `WI-FCD0002-test`, clean worktree, no configured remote, and target validation passed through the Layer 1 validator.

## Boundary

The A2 runner remains paused and no automation prompt, schedule, or status change occurred. No target remote, target push, or target PR occurred. No release publication, deployment, package publication, OSS program submission, A3 publication behavior, production dependency addition, public API or external contract change, first Layer 2 scaffold generation, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No destructive filesystem or git operation occurred.
