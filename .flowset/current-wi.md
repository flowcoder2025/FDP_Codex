# Current WI

WI id: WI-CX0060-test

Category: test

Title: Trusted Ephemeral Worker End-to-End Proof

Layer: Layer 1

Risk: R2

Status: blocked-external

Branch: wi/cx0060-test-trusted-ephemeral-worker-end-to-end-proof

Approval envelope: the user instructed Codex to continue the next goal-critical work and explicitly approved transmission of the local-only dogfood repository contents to the configured external model service for one managed read-only proof. The execution policy still rejected that exact run and stated that user approval cannot override the untrusted-destination boundary. This WI may preserve the supported-command confinement gates and failure evidence but must not retry through another surface or workaround.

## Scope

Prove that the managed ephemeral worker can reconstruct the separate Layer 2 dogfood target, return a final result within a finite deadline, and leave no residual process while preventing nested agent fan-out; repository-supplied validation runs only after worker exit under the visible controller.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: attempt to falsify provider trust, clean-context reconstruction, final-result delivery, worker confinement, process cleanup, and target handoff truthfulness.
- Validator stance: require built-in fan-out disabling, package-manager prohibition, supported exec-policy re-entry checks, controller-owned repository CI, a completed live dogfood result, zero residual processes, and a separate current-head independent review before merge.

## Verification Plan

- Confirm the local Codex CLI uses the configured ChatGPT login without a custom model provider.
- Run a minimal managed read-only public-repository model preflight.
- Run the managed worker against the separate dogfood target without supplying WI or debt identifiers; run target validation separately from the visible controller after worker exit.
- Disable nested `multi_agent` collaboration and fail before model execution unless the target exec-policy forbids supported Codex, runtime, package-executor, and nested-shell re-entry paths.
- Preserve timeout cleanup as a failure result rather than accepting partial validation output.
- Register every Layer 1 KI in GitHub and keep Layer 2 findings qualified.
- Run repository CI and then the required separate blind adversarial review on the final PR head.

## Evidence So Far

- Context pack `ctx-wi-cx0060-test-20260710173249`; timestamp `2026-07-10T17:32:49.743Z`; 27 metadata-only ledger entries; no chunk bodies.
- `codex login status` reported `Logged in using ChatGPT`; no custom `model_provider` is configured.
- Managed public-repository preflight completed with marker `FDP_CODEX_PROVIDER_TRUST_SMOKE_OK`, thread `019f4d15-e5c5-7d83-a3a0-6bf86d775334`, verified observation, and no cleanup requirement.
- The first dogfood attempt independently reconstructed target head `a2702ab4fd370f37af1e804cb6b7e4977ea98f6a` and both target validators passed.
- That attempt found the target handoff still instructed the controller to commit although the worktree was clean and the commit already existed. KI-CX-DOGFOOD-002 / Issue #62 records the false-green target handoff.
- The worker then entered an unsupported collaboration wait, timed out at 180 seconds, and emitted no final JSON. Cleanup removed every matched process and verified zero residuals. KI-CX-WORKER-003 / Issue #61 records this failure.
- The runner now adds `--disable multi_agent` and requires `.codex/rules/fdp-managed-worker.rules` before reading the prompt. The real CLI preflight forbids 18 supported direct, package-manager, and wrapper re-entry cases, while `npm.cmd run worker:test` passes the policy contract and process lifecycle cases.
- The user explicitly approved the disclosed local target transmission. The exact post-fix retry was still rejected before execution because the configured external model destination is not established as trusted and approval cannot override that rule. No workaround was attempted.
- Two separate `fork_context: false` read-only pre-publication reviewers returned no verdict within bounded waits and were stopped. Neither result was treated as PASS. KI-CX-REVIEW-002 / Issue #63 records reviewer-surface availability.
- A later clean-context reviewer returned FAIL on head `b63bbca2552d6fe071812c279143a046683d0ac1` with two P2 findings: overstated live-proof state and a false-positive provider-workaround boundary check. Both findings were remediated, but the changed head still requires a fresh review.
- Reviewer `019f4d78-ea57-73d1-9843-dd2d473cea12` then returned FAIL on head `7696fbb` with two P2 GitHub drift findings and one P3 CLI-smoke gap. Issues #61 and #63 were synchronized, the actual builder arguments now pass the no-model CLI smoke, and the changed head still requires a fresh review.
- Reviewer `019f4d85-063e-7a10-a5a2-8584e247de8c` returned FAIL on head `c86b9f036e823986d78d825c97408b70dcd444b1` with one P1 shell-reentry bypass and one P2 Issue #55 drift finding. Issue #55 was synchronized; the runner now verifies the project exec-policy before reading the prompt, and the specification explicitly limits the claim to supported command prefixes rather than universal OS isolation.
- During remediation, repeated host lifecycle tests exposed a separate Windows parent-PID reuse false-descendant defect. KI-CX-WORKER-004 / Issue #64 records it. Descendant discovery now requires the live parent identity to match the observed parent, and five consecutive full lifecycle runs passed.
- Reviewer `019f4db0-018f-7db1-b8e4-81c8e1aa92fc` returned FAIL on head `71576c01ca9a1db1fb59031c01a398bb13e9cba8`: two P1 findings covered package-script re-entry and premature Issue #64 closure; two P2 findings covered truncated Issue #63 and Strategy A publication wording. Package managers are now forbidden inside workers, validation ownership moved to the controller, Issue #64 was reopened with required labels, and the records were reconciled.

## Open Known Issues

- KI-CX-PROVIDER-001 / Issue #55 remains open until the execution platform establishes a trusted model destination that permits the repository-backed dogfood proof.
- KI-CX-WORKER-003 / Issue #61 remains open until the post-fix worker returns a final result and controller-owned validation plus cleanup complete.
- KI-CX-WORKER-004 / Issue #64 remains open as `repaid-on-merge` through PR validation, merge, and post-merge audit.
- KI-CX-DOGFOOD-002 / Issue #62 remains open and blocks further target progression until the stale handoff false-green is fixed.
- KI-CX-REVIEW-002 / Issue #63 remains open and blocks validation, PR readiness, and merge until a bounded clean-context reviewer returns a current-head verdict.
- KI-CX-REVIEW-001 / Issue #59 and KI-CX-STATUS-001 / Issue #60 continue to block unattended/generalized merge and release-boundary authority.

## Boundary

The retired hourly runner remains absent. The dogfood target was read only. No target branch, target edit, remote, push, PR, release, deployment, package publication, OSS submission, production dependency, public API or external contract change, A2/A3 authority expansion, destructive operation, or provider-policy workaround occurred.
