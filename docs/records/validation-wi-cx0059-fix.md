# WI-CX0059-fix Validation Record

Status: validated.

Date: 2026-07-10.

## Scope

Add a bounded, observable ephemeral worker supervisor that verifies descendant-process cleanup before controller fallback.

## Strategy

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: prove normal output capture, finite timeout, interruption handling, exact process identity tracking, descendant-first cleanup, and post-cleanup absence.
- Validator stance: fail closed when observation or cleanup cannot be verified; reject `danger-full-access`; preserve runner, target, publication, authority, dependency, API, and destructive-operation boundaries.

## Context Evidence

- Context pack: `ctx-wi-cx0059-fix-20260710095004`.
- Timestamp: `2026-07-10T09:50:04.441Z`.
- 17 metadata-only ledger entries.
- `contains_chunk_bodies: false`.

## Implementation Evidence

- `scripts/lib/managed-process.mjs` observes root and descendant identities, captures stdout and stderr, applies timeout or interruption cleanup, and verifies that no matched process remains.
- `scripts/run-ephemeral-worker.mjs` fixes the execution surface to `codex exec --ephemeral --json`, reads prompts from stdin, and accepts only `read-only` or `workspace-write`.
- `scripts/fixtures/managed-worker-tree.mjs` creates a deterministic child and grandchild process tree.
- `scripts/test-ephemeral-worker-lifecycle.mjs` validates normal completion, timeout cleanup, interruption cleanup, and observed residual cleanup after root exit.
- `scripts/smoke-ephemeral-worker-cli.mjs` verifies the installed Codex CLI path with `codex exec --help` without a model request.
- No production dependency was added.

## Local Results

- `npm.cmd run worker:test`: passed after implementation and process-group hardening; normal output captured one stdout and one stderr line; timeout and interruption observed descendants and verified cleanup; root exit with observed residual descendants triggered verified cleanup.
- Exact post-test process query found no `node.exe` process running `managed-worker-tree.mjs`.
- `npm.cmd run worker:smoke-local`: passed; root pid 49612 completed with exit code 0, 102 observable stdout lines, no observed descendants, and `observation_verified: true`.
- `npm.cmd run worker:run -- --sandbox danger-full-access`: rejected before spawn with `--sandbox must be read-only or workspace-write`.
- `npm.cmd run typecheck`: passed after implementation and after the local smoke split.
- `npm.cmd run ci:check`: passed after process-group hardening, KI separation, and the blocked-external WI-CX0060 state update.
- PR #44 initially passed Node 20 and failed Node 24 because the root process label could differ from the spawned executable name before its start-time identity was recorded. The supervisor now bootstraps the root from the exact spawned pid, supervisor parent pid, and POSIX process group, then tracks the operating-system start time. The fixture changes its root process title so this behavior remains covered.
- `npm.cmd run worker:test` and `npm.cmd run ci:check`: passed locally after the Node 24 root-identity correction; the PR matrix rerun is the final cross-version gate.
- Final post-CI process query found no `node.exe` process running `managed-worker-tree.mjs`.

## Approval-Gated Live Smoke

A read-only, 90-second live model smoke was requested through the managed wrapper. The request was rejected before execution: the approval reviewer blocked model execution because reading `AGENTS.md` would transmit repository content to an external model service whose trust boundary was not established for that command.

The user then explicitly approved that stated transmission risk. The execution policy rejected the same managed smoke again and stated that private workspace disclosure remained denied even with user approval. Codex did not bypass either rejection. A process query after the first rejection found only the inspecting PowerShell process and no matching Node or Codex worker process.

The process-lifecycle repayment does not require a model response: the OS process fixture covers normal completion, timeout, interruption, and observed residual descendants, while the installed CLI local smoke covers the real command path and observable exit. KI-CX-WORKER-001 is repaid by this WI.

KI-CX-PROVIDER-001 now owns the separate external-provider trust boundary. It blocks dogfood continuation, generalized unattended model workers, and runner reactivation until the execution environment establishes the configured model service as trusted and permits a repository-backed managed smoke. The rejected command must not be retried through a workaround or indirect user instruction.

## Boundaries

- The A2 runner remains `PAUSED`.
- The Layer 2 target was not touched.
- No first Layer 2 scaffold generation occurred in this WI.
- No target remote, target push, or target PR occurred.
- No release publication, deployment, package publication, OSS program submission, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred.
- No production dependency addition, public API or external contract change occurred.
- No destructive filesystem or git operation occurred.
