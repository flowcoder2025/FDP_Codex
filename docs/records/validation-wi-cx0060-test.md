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
- Primary evaluator stance: falsify provider trust, clean-context reconstruction, final-result delivery, built-in fan-out disabling, command-boundary claims, process cleanup, and target handoff truthfulness.
- Validator stance: distinguish end-to-end completion from a blocked-evidence checkpoint. End-to-end completion requires a live dogfood final result, controller-owned validation, verified zero residual processes, repository CI, and current-head blind review. A supervised PR may instead land only the truthful `blocked-external` evidence with the built-in fan-out flag, no active controller-restricting project rule, bounded cleanup evidence, open KI state, repository CI, and current-head blind review; that merge is not proof completion and does not repay Issues #55 and #61.

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
- `scripts/lib/codex-invocation.mjs` builds the fixed worker argument list with `--disable multi_agent`.
- `scripts/run-ephemeral-worker.mjs` uses that centralized argument builder.
- `scripts/test-ephemeral-worker-lifecycle.mjs` asserts the built-in fan-out flag exactly once and validates process lifecycle containment.
- No active project-local command rule is installed. `docs/specifications/managed-worker-exec-policy.rules` is a non-active design fixture; command re-entry remains unenforced while Windows process lifetime is separately contained by a kill-on-close Job Object.
- `npm.cmd run worker:test`: passed the built-in fan-out flag check, unsupported-platform fail-closed contract, temporal stale-row exclusion, and Windows normal, timeout, interruption, orphan, wrapper-hard-kill, observer-hang, and fast-parent-exit lifecycle cases.
- `npm.cmd run worker:smoke-local`: passed the real builder argument path with `--disable multi_agent`, read-only sandbox, cwd, ephemeral/json flags, and `--help` substituted for the final stdin prompt marker; no model request occurred.
- KI-CX-DOGFOOD-002 / Issue #62 records the generated target handoff false green without mixing target state into Layer 1.

## Final External Gate

The user explicitly approved transmission of the local-only dogfood repository contents to the configured external model service for one managed read-only proof. The exact post-fix command was still rejected before execution. The execution-policy result stated that the external destination is not established as trusted and that the data-exfiltration rule forbids the transfer even with explicit user approval.

The end-to-end live-proof claim remains blocked externally until the execution platform establishes a trusted model destination and permits that managed repository-backed proof. Codex did not retry through another model surface, indirect command, or workaround. The truthful `blocked-external` evidence may still receive current-head independent review and land through the normal supervised PR lifecycle as a non-completion checkpoint. Such a merge leaves Issues #55 and #61 open and does not mark the live proof complete. Strategy A may then continue local v0.1 self-hosting work without claiming the missing live proof.

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
- Issue #55 was synchronized. A project-local exec-policy preflight and generated rule were attempted, but later fresh-session evidence invalidated them as worker-only enforcement.
- Repeated host lifecycle runs then reproduced a separate false `residual_processes` result in the no-child normal fixture. The observer could accept a new child under a reused Windows parent PID without confirming the current parent identity.
- KI-CX-WORKER-004 / Issue #64 records the defect. `mergeObservedTree` now requires the live parent row to match the observed parent PID and start time before adding a descendant; deterministic reused-parent coverage and five consecutive full host lifecycle runs passed.
- Historical missing-policy rejection evidence is retained only as an invalidated attempt; the runner no longer presents a project rule as worker-only enforcement.
- Post-remediation `npm.cmd run worker:smoke-local`, `npm.cmd run worker:test` repeated five times, `npm.cmd run ci:check`, and `git diff --check` passed in the host process environment.
- Reviewer `019f4db0-018f-7db1-b8e4-81c8e1aa92fc` reviewed head `71576c01ca9a1db1fb59031c01a398bb13e9cba8` and returned FAIL with two P1 and two P2 findings.
- The P1 package-script finding led to an attempted project rule, but fresh controller-session evidence proved that rule also forbids controller commands. The active rule was removed; repository validation remains controller-owned and command re-entry remains open.
- Issue #64 was reopened and labeled `fdp:ki`, `fdp:debt`, and `ki:high`. At that earlier candidate head it was classified `repaid-on-merge`; the later `faa06a3` assignment-failure finding invalidated that classification and returned it to `open`. Issue #63 and Strategy A publication wording were also repaired.
- `npm.cmd run audit:control-plane -- --phase working` passed on the clean remediation head, including Issue #64 OPEN/expected-OPEN state and required KI severity labels.
- Reviewer `019f4dc3-db87-7043-b699-b1d1c4145217` reviewed head `b46b0b745db4f9bde2dcd031e5e11d5d8b54d7cf` and returned FAIL with one P1, one P2, and one P3 finding.
- The P1 proved polling alone could miss a detached child when its real parent exited before the next poll. The remediation starts the real Windows worker suspended, assigns it to a kill-on-close Job Object, resumes only after assignment, and requires a verified zero-active-process drain marker.
- The deterministic `fast-orphan-root` regression starts a detached child and exits immediately. Five consecutive full lifecycle runs returned `completed`, `containment.mode: windows-job-object`, and `containment.verified: true`; each emitted child pid was no longer alive when its result returned.
- That earlier P2 was remediated by aligning the hard stop with post-merge WI closeout or generalized managed-worker use rather than PR readiness. The later P1 reopened implementation completeness without changing that hard-stop boundary.
- The P3 wording was corrected, then superseded when the active project rule itself was removed as an invalid worker-only control.
- The Job Object remediation passed five consecutive full lifecycle runs and CLI assignment/drain smoke. Those results remain valid for process containment; command-policy results are not treated as enforcement.
- Reviewer `019f4ddd-f42b-76f2-b00c-4ef1abab51aa` started with `fork_context: false` on head `311c582eba00745dec4c49d5f740585fc2c90cf3` but was lost without a verdict when the task was interrupted. It is not PASS evidence.
- After interruption, a fresh controller session loaded the project rule and blocked controller-owned `npm` and `codex` commands. FDP_Codex removed the active rule from Layer 1 and generated targets, retained only a non-active design fixture, and expanded KI-CX-WORKER-003 / Issue #61 to cover the missing worker-only command boundary.
- With the active project rule absent, `npm.cmd run typecheck`, `npm.cmd run worker:test`, `npm.cmd run worker:smoke-local`, `npm.cmd run ci:check`, all targeted `node --check` commands, and `git diff --check` passed from the visible controller.
- Verification agent `019f4df3-0ccf-7f92-954c-02e7a2aa6f69` failed before inspection at the account usage limit and produced no verdict; it is not PASS evidence.
- Reviewer `019f501f-d6b1-7d90-83d3-eefff9308330` inspected exact head `6d447816ed1ba42f7ca15e5812b48e32ff8c9891` with `fork_context: false` and returned FAIL: P1 POSIX detached-descendant escape, P2 stale worker-validation ownership in the live handoff, and P3 confinement wording beyond test coverage.
- Remediation fails closed before process spawn on unsupported platforms, asserts the platform support contract, restores controller-owned validation in current and historical handoff summaries, and renames the test evidence to the built-in fan-out flag plus Windows process-lifecycle containment.
- Reviewer `019f503a-d883-70e3-888f-e5f456f1869c` inspected exact head `faa06a3d1b8a23e8787dce6f02d8ae577be7df6e` with `fork_context: false` and returned FAIL with one P1: if `AssignProcessToJobObject` failed after `CreateProcess`, the finally block closed handles without terminating the still-suspended unassigned process.
- The first forced-assignment-failure remediation created a real suspended PID and cleaned it during normal exception flow. Reviewer `019f5048-a6dd-72b0-9f46-9e1bb1ac4c82` later proved that hard wrapper termination could bypass that path, so this evidence is retained as superseded rather than complete.
- Reviewer `019f5048-a6dd-72b0-9f46-9e1bb1ac4c82` inspected exact head `bf3195302796bb1ee825ed8ace3893e0a50a6e12` with `fork_context: false` and returned FAIL with two P1 findings and one P2 finding: unbounded observation before timeout, a hard-kill creation-to-assignment window, and incomplete KI/validator claims.
- The remediation now uses `STARTUPINFOEX` plus `PROC_THREAD_ATTRIBUTE_JOB_LIST` so the child is in the kill-on-close Job atomically at creation. A hard-kill regression pauses immediately after atomic creation, kills the wrapper, and confirms both wrapper and child PIDs are gone. Separate regressions delay CIM for 10 seconds, prove both the 750 ms timeout and a 750 ms abort signal are armed before observation, return non-success in under 5 seconds, and confirm wrapper and atomic child PIDs are gone. KI-CX-WORKER-004 remains open pending fresh exact-head review, PR validation, merge, and post-merge audit. The updated `worker:test`, `worker:smoke-local`, `typecheck`, `validate`, `ci:check`, and `git diff --check` pass on the host.
- Reviewer `019f505d-8c00-76a1-abe1-f29f41f09aeb` was mistakenly given nonexistent SHA `4720c4517e4fb2b22170f10072f02677f5fc5100` by the controller. It inspected actual clean head `4720c45cedae0f7e241590963e08a0daafc0eb14` and returned FAIL: P1 cleanup evidence omitted an observed wrapper already gone before the first cleanup observation; P2 Windows wrapper-first Job shutdown contradicted generic descendant-first SSOT; and P2 the portability plan ambiguously requested a managed-worker exec policy even though generation intentionally installs no project rule.
- The remediation computes `confirmed_gone_pids` from every observed identity rather than only signaled PIDs, records Windows wrapper-first Job shutdown separately from targeted residual descendant-first cleanup, and changes the portability proof to an instruction-only boundary policy with an explicit no-project-rule requirement. A new reviewer must receive the exact SHA queried from `git rev-parse HEAD`. `worker:test` then passed three independent direct invocations with timeout, interruption, observer-hang, wrapper-hard-kill, orphan, and fast-parent-exit cases. `typecheck`, `worker:smoke-local`, standalone `ci:check`, and `git diff --check` also passed.
- Reviewer `019f506e-8d9c-73d3-89a8-99e24c825301` inspected exact head `46fd0fed236bde8296048544b617c62337cf6406` with `fork_context: false` and returned FAIL: P2 the completed-live-result merge gate contradicted the blocked-outcome landing plan; P3 all-observed-PID classification lacked a direct set-partition regression assertion.
- The remediation explicitly separates end-to-end completion from a supervised `blocked-external` evidence checkpoint and adds a behavioral assertion that the root plus every observed descendant appears exactly once across gone, identity-mismatch, or alive cleanup classifications. The changed head requires fresh exact-head review.
- Post-remediation `worker:test` passed three successful executions including the repository-CI invocation; `typecheck`, `worker:smoke-local`, and `ci:check` passed. The working-phase control-plane audit read live GitHub and local topology successfully and reported only the expected pre-commit `git.clean` failure.
- Reviewer `019f5083-7cfb-72b3-9104-b77da85bde46` inspected exact head `63abaac80dacee0df844843fd388d1f8bc689962` with `fork_context: false` and returned FAIL with two P2 findings: the native atomic worker PID was known but absent from the cleanup partition when process observation stalled, and the record plus state claimed current residual-after-root-exit coverage that the suite no longer runs.
- The remediation makes the native wrapper emit the atomic worker PID plus start time, registers that identity in the observed set before process-table polling, asserts its exact terminal classification in timeout, interruption, and stalled-observer cases, and removes the unsupported current residual-test claim. The changed head requires fresh exact-head review.
- The atomic-identity remediation passed `worker:test` three times through one direct invocation, standalone repository validation, and full CI. Timeout, interruption, observer-hang timeout, and observer-hang interruption each reported `atomic_child_observed: true` and an exact cleanup partition. `typecheck`, `worker:smoke-local`, `validate`, and `ci:check` passed.
- KI-CX-REVIEW-002 / Issue #63 records the reviewer-surface availability boundary.
- A fresh final-head reviewer and GitHub-anchored independent-review audit remain mandatory before PR readiness or merge.

## Boundaries

- The retired hourly runner remains absent.
- The dogfood target was not edited.
- No target branch, commit, remote, push, or PR was created.
- No release, deployment, package publication, OSS submission, production dependency, public API or external contract change, A2/A3 authority expansion, destructive operation, or provider-policy workaround occurred.
- No release publication, deployment, package publication, OSS program submission, A3 publication behavior, production dependency addition, public API or external contract change, first Layer 2 scaffold generation, or destructive filesystem or git operation occurred.
