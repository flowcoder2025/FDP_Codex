# WI-CX0060-test Validation Record

Status: blocked-external.

Date: 2026-07-11.

## Scope

Prove the trusted managed ephemeral worker end to end against the separate Layer 2 dogfood target without restoring persistent runner tasks or weakening the provider boundary.

## Strategy

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: falsify provider trust, clean-context reconstruction, final-result delivery, nested-agent confinement, process cleanup, and target handoff truthfulness.
- Validator stance: require built-in fan-out disabling, package-manager prohibition, controller-owned validation, a completed live dogfood result, verified zero residual processes, repository CI, and a separate blind adversarial review before merge.

## Context Evidence

- Context pack: `ctx-wi-cx0060-test-20260710173249`.
- Timestamp: `2026-07-10T17:32:49.743Z`.
- 27 metadata-only ledger entries.
- `contains_chunk_bodies: false`.

## Provider Preflight

- Local configuration selects model `gpt-5.6-sol` without a custom `model_provider`.
- `codex login status` returned `Logged in using ChatGPT`.
- A managed 90-second `read-only` run read public-repository `AGENTS.md` and returned exactly `FDP_CODEX_PROVIDER_TRUST_SMOKE_OK`.
- Worker thread: `019f4d15-e5c5-7d83-a3a0-6bf86d775334`.
- Managed result: `completed`, exit code 0, observation verified, cleanup not required.

## First Dogfood Attempt

- Target: `C:\dev\FDP_Codex_Dogfood`, read only.
- Target branch: `WI-FCD0002-test`.
- Target head: `a2702ab4fd370f37af1e804cb6b7e4977ea98f6a`.
- Worker thread: `019f4d18-0d31-7d03-9962-817fb2c11e44`.
- The prompt supplied no target WI id or verification-debt id.
- The worker reconstructed `fdp-codex-dogfood`, scope code `FCD`, current WI `WI-FCD0002-test`, repaid debt `VD-FCD0001`, clean Git state, no remote, and the two canonical validation commands.
- `npm run validate`: passed.
- `npm run validate:wi-fcd0002`: passed.
- The worker found that handoff still instructed the controller to review and commit even though the worktree was clean and HEAD already contained that commit. Both validators accepted the stale claim.
- The worker attempted an unsupported collaboration spawn/wait, then timed out at 180 seconds before emitting the required final JSON.
- Managed timeout cleanup targeted the complete matched process tree, confirmed every target gone, reported `alive_after_cleanup: []`, and returned `cleanup.verified: true`.

## Remediation

- KI-CX-WORKER-003 / Issue #61 records the nested-collaboration timeout.
- `scripts/lib/codex-invocation.mjs` now builds the fixed worker argument list with `--disable multi_agent` and verifies the target exec-policy before reading a prompt.
- `scripts/run-ephemeral-worker.mjs` uses that centralized argument builder.
- `scripts/test-ephemeral-worker-lifecycle.mjs` asserts the confinement flag exactly once and validates the supported exec-policy contract.
- `.codex/rules/fdp-managed-worker.rules` forbids supported direct Codex, runtime, package-executor, and nested-shell re-entry prefixes. This is explicitly not universal OS process isolation.
- `npm.cmd run worker:test`: passed invocation confinement, temporal stale-row exclusion, normal completion, timeout cleanup, interruption cleanup, and residual cleanup.
- `npm.cmd run worker:smoke-local`: passed 12 real CLI exec-policy checks, then passed the real builder argument path with `--disable multi_agent`, read-only sandbox, cwd, ephemeral/json flags, and `--help` substituted for the final stdin prompt marker; no model request occurred.
- KI-CX-DOGFOOD-002 / Issue #62 records the generated target handoff false green without mixing target state into Layer 1.

## Final External Gate

The user explicitly approved transmission of the local-only dogfood repository contents to the configured external model service for one managed read-only proof. The exact post-fix command was still rejected before execution. The execution-policy result stated that the external destination is not established as trusted and that the data-exfiltration rule forbids the transfer even with explicit user approval.

The end-to-end live-proof claim remains blocked externally until the execution platform establishes a trusted model destination and permits that managed repository-backed proof. Codex did not retry through another model surface, indirect command, or workaround. The truthful blocked-outcome candidate may still receive current-head independent review and land through the normal supervised PR lifecycle, after which Strategy A continues local v0.1 self-hosting work without claiming the missing live proof.

## Independent Review Attempts

- Reviewer `019f4d43-2090-7711-ae34-05aaa264bf22` started with `fork_context: false`, read-only scope, base `0621049268e4633d260f64d555e35959c8c7dcba`, and local head `9ecea1e`. It returned no verdict after two six-minute waits and was stopped.
- A narrower reviewer, `019f4d4f-0a95-73b3-a77e-96d1c181c6fd`, also started with `fork_context: false`, read-only scope, and the same candidate head. It returned no verdict after a focused five-minute wait and was stopped.
- Neither incomplete attempt was treated as PASS or independent-review evidence.
- Reviewer `019f4d6a-765a-7263-8bca-7ebede40f725` failed before inspection because the selected model was at capacity; it produced no verdict.
- Reviewer `019f4d6b-f84f-7c30-b759-038b6183cf70` then reviewed local head `b63bbca2552d6fe071812c279143a046683d0ac1` with `fork_context: false` and returned FAIL with two P2 findings.
- The P2 findings identified an overstated `live-proof` status and a false-positive provider-workaround boundary check. Both were remediated before the next review generation.
- The FAIL is not PASS evidence, and any later head still requires a fresh blind review.
- Reviewer `019f4d78-ea57-73d1-9843-dd2d473cea12` reviewed head `7696fbb` and returned FAIL with two P2 live-GitHub drift findings plus one P3 CLI-smoke gap.
- Issue #61 and Issue #63 titles and bodies were updated to the current supported-command, provider-block, intermittent-review, and final-head-review facts.
- The CLI smoke was strengthened to build the real worker arguments and replace only the stdin prompt marker with `--help`; the changed head remains unreviewed.
- Reviewer `019f4d85-063e-7a10-a5a2-8584e247de8c` reviewed head `c86b9f036e823986d78d825c97408b70dcd444b1` and returned FAIL with one P1 supported-command shell-reentry bypass and one P2 Issue #55 live-body drift finding.
- Issue #55 was synchronized. The remediation adds a fail-before-prompt exec-policy preflight, blocks the tested direct and wrapper forms, generates the rule into new Layer 2 scaffolds, and removes the overstated universal deterministic-confinement claim.
- Repeated host lifecycle runs then reproduced a separate false `residual_processes` result in the no-child normal fixture. The observer could accept a new child under a reused Windows parent PID without confirming the current parent identity.
- KI-CX-WORKER-004 / Issue #64 records the defect. `mergeObservedTree` now requires the live parent row to match the observed parent PID and start time before adding a descendant; deterministic reused-parent coverage and five consecutive full host lifecycle runs passed.
- A missing target exec-policy was rejected with `worker.wrapper_error` before stdin was read or a model process started.
- Post-remediation `npm.cmd run worker:smoke-local`, `npm.cmd run worker:test` repeated five times, `npm.cmd run ci:check`, and `git diff --check` passed in the host process environment.
- Reviewer `019f4db0-018f-7db1-b8e4-81c8e1aa92fc` reviewed head `71576c01ca9a1db1fb59031c01a398bb13e9cba8` and returned FAIL with two P1 and two P2 findings.
- The P1 package-script bypass is remediated by forbidding all npm, pnpm, Bun, Yarn, and Corepack execution inside the worker; repository-supplied validation now belongs to the visible controller after worker exit.
- Issue #64 was reopened and labeled `fdp:ki`, `fdp:debt`, and `ki:high`; its state is `repaid-on-merge` until PR validation, merge, and post-merge audit complete. Issue #63 and Strategy A publication wording were repaired.
- `npm.cmd run audit:control-plane -- --phase working` passed on the clean remediation head, including Issue #64 OPEN/expected-OPEN state and required KI severity labels.
- KI-CX-REVIEW-002 / Issue #63 records the reviewer-surface availability boundary.
- A fresh final-head reviewer and GitHub-anchored independent-review audit remain mandatory before PR readiness or merge.

## Boundaries

- The retired hourly runner remains absent.
- The dogfood target was not edited.
- No target branch, commit, remote, push, or PR was created.
- No release, deployment, package publication, OSS submission, production dependency, public API or external contract change, A2/A3 authority expansion, destructive operation, or provider-policy workaround occurred.
- No release publication, deployment, package publication, OSS program submission, A3 publication behavior, production dependency addition, public API or external contract change, first Layer 2 scaffold generation, or destructive filesystem or git operation occurred.
