# Current WI

WI id: WI-CX0060-test

Category: test

Title: Trusted Ephemeral Worker End-to-End Proof

Layer: Layer 1

Risk: R2

Status: blocked-external

Branch: wi/cx0060-test-trusted-ephemeral-worker-end-to-end-proof

Approval envelope: the user instructed Codex to continue the next goal-critical work and explicitly approved transmission of the local-only dogfood repository contents to the configured external model service for one managed read-only proof. The execution policy still rejected that exact run and stated that user approval cannot override the untrusted-destination boundary. This WI may preserve the deterministic confinement fix and failure evidence but must not retry through another surface or workaround.

## Scope

Prove that the managed ephemeral worker can reconstruct and validate the separate Layer 2 dogfood target, return a final result within a finite deadline, and leave no residual process, while preventing nested agent fan-out.

## Triage

- PSC: P1
- WTC: AUTO
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: attempt to falsify provider trust, clean-context reconstruction, final-result delivery, worker confinement, process cleanup, and target handoff truthfulness.
- Validator stance: require deterministic invocation confinement, repository CI, a completed live dogfood result, zero residual processes, and a separate current-head independent review before merge.

## Verification Plan

- Confirm the local Codex CLI uses the configured ChatGPT login without a custom model provider.
- Run a minimal managed read-only public-repository model preflight.
- Run the managed worker against the separate dogfood target without supplying WI or debt identifiers.
- Disable nested `multi_agent` collaboration in the managed worker invocation and enforce it with a deterministic test.
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
- The runner now adds `--disable multi_agent`; `npm.cmd run worker:test` passes invocation confinement plus normal, timeout, interruption, temporal-identity, and residual cleanup cases.
- The user explicitly approved the disclosed local target transmission. The exact post-fix retry was still rejected before execution because the configured external model destination is not established as trusted and approval cannot override that rule. No workaround was attempted.
- Two separate `fork_context: false` read-only pre-publication reviewers returned no verdict within bounded waits and were stopped. Neither result was treated as PASS. KI-CX-REVIEW-002 / Issue #63 records reviewer-surface availability.

## Open Known Issues

- KI-CX-PROVIDER-001 / Issue #55 remains open until the execution platform establishes a trusted model destination that permits the repository-backed dogfood proof.
- KI-CX-WORKER-003 / Issue #61 remains open until the post-fix live run completes with a final result and verified zero residuals.
- KI-CX-DOGFOOD-002 / Issue #62 remains open and blocks further target progression until the stale handoff false-green is fixed.
- KI-CX-REVIEW-002 / Issue #63 remains open and blocks validation, PR readiness, and merge until a bounded clean-context reviewer returns a current-head verdict.
- KI-CX-REVIEW-001 / Issue #59 and KI-CX-STATUS-001 / Issue #60 continue to block unattended/generalized merge and release-boundary authority.

## Boundary

The retired hourly runner remains absent. The dogfood target was read only. No target branch, target edit, remote, push, PR, release, deployment, package publication, OSS submission, production dependency, public API or external contract change, A2/A3 authority expansion, destructive operation, or provider-policy workaround occurred.
