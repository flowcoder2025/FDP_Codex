# WI-CX0061-fix Validation Record

Status: validated.

Date: 2026-07-10.

## Scope

Prevent stale Windows parent-pid metadata from being treated as a live managed-worker descendant.

## Strategy

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: convert the intermittent post-merge failure into deterministic temporal-identity evidence, then repeat the complete lifecycle suite.
- Validator stance: require executable temporal filtering and preserve the existing process cleanup and control-plane boundaries.

## Trigger And Root Cause

- WI-CX0059 merged through PR #44 at `b905fc6cd0db825dcf91edbaa19688ba2a0d44ec` after Node 20 and Node 24 CI passed.
- The required post-merge `npm.cmd run ci:check` intermittently reported `residual_processes` for the normal no-child fixture.
- A direct rerun passed, proving the failure was timing-dependent rather than a persistent child process.
- Windows can retain a parent pid after the parent has exited. A newly spawned root can reuse that pid, causing an older unrelated process row to look like a descendant when parent pid is the only relationship check.

## Implementation Evidence

- `scripts/lib/managed-process.mjs` rejects candidate descendants whose parseable start time predates the observed parent or POSIX process-group root.
- Missing or unparseable timestamps retain the prior relationship fallback so platform observation behavior does not silently disappear.
- `scripts/test-ephemeral-worker-lifecycle.mjs` supplies a deterministic synthetic process table with one stale row, one valid child, and one valid grandchild.
- The same test continues to execute real normal, timeout, interruption, and observed-residual process trees.

## Verification Evidence

- Fresh context pack: `ctx-wi-cx0061-fix-20260710105206` at `2026-07-10T10:52:06.771Z`; 17 metadata-only entries; `contains_chunk_bodies: false`.
- Five consecutive full lifecycle runs passed. Every run reported `temporal_stale_excluded: true`, normal `completed`, and verified timeout, interruption, and residual cleanup.
- `npm.cmd run ci:check`: passed after flow-state and validator integration.
- `git diff --check`: passed.
- Exact post-test process query found no `node.exe` process running `managed-worker-tree.mjs`.

## Known Issue Repayment

- KI: KI-CX-WORKER-002 Windows stale parent-pid descendant false positive.
- Severity: High.
- Owner: CODEX.
- Trigger: post-merge normal-case validation intermittently returned `residual_processes` with no fixture child.
- Defer reason: none; it was handled before dogfood continuation or runner reactivation.
- Repayment condition: temporal descendant filtering, deterministic regression evidence, repeated real process-tree passes, and repository validation.
- Hard stop: before dogfood continuation, generalized unattended worker use, or runner reactivation.
- Status: repaid by WI-CX0061-fix.

KI-CX-PROVIDER-001 remains open and still blocks WI-CX0060-test, dogfood continuation, generalized unattended model workers, and runner reactivation.

## Boundaries

- The A2 runner remains `PAUSED`.
- The Layer 2 target was not touched.
- No first Layer 2 scaffold generation occurred.
- No target remote, target push, or target PR occurred.
- No live model smoke or provider-policy workaround was attempted.
- No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, A3 publication behavior, authority expansion, S2 execution, or separate reviewer creation occurred.
- No destructive filesystem or git operation occurred.
