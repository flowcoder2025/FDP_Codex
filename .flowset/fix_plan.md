# FDP_Codex Fix Plan

Status: live backlog.

Reconciliation authority: `docs/decisions/2026-07-10-control-plane-operational-integrity.md` and `docs/records/validation-wi-cx0062-fix.md`.

Independent verification authority: `docs/decisions/2026-07-10-independent-blind-adversarial-review-gate.md` and `docs/specifications/independent-review-evidence.md`.

Authority: `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`, `docs/decisions/2026-07-08-repository-license-binding.md`, `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`, `docs/decisions/2026-07-08-public-readiness-boundary.md`, `docs/decisions/2026-07-08-evaluation-surface-baseline.md`, `docs/decisions/2026-07-08-context-pack-command-surface.md`, `docs/decisions/2026-07-08-context-selection-rule-table.md`, `docs/decisions/2026-07-08-decision-queue-state-codes.md`, `docs/decisions/2026-07-08-ki-identity-severity-policy.md`, `docs/decisions/2026-07-08-handoff-size-policy.md`, `docs/decisions/2026-07-08-autonomy-default-options-packet.md`, `docs/decisions/2026-07-08-operating-policy-lock.md`, `docs/decisions/2026-07-08-session-boundary-automation-contract.md`, `docs/decisions/2026-07-08-tooling-typescript-baseline.md`, `docs/decisions/2026-07-08-tooling-strictness-probe.md`, `docs/decisions/2026-07-08-automation-run-surface-installation.md`, `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md`, `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`, `docs/decisions/2026-07-08-flow-state-readable-snapshot.md`, `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md`, `docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md`, `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md`, `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md`, `docs/decisions/2026-07-10-context-selection-breadth-guard.md`, `docs/records/validation-wi-cx0055-feat.md`, `docs/records/validation-wi-cx0057-docs.md`, `docs/records/validation-wi-cx0058-fix.md`, `.flowset/state.json`, `.flowset/runtime-snapshot.json`, `docs/specifications/runtime-snapshot.md`, `docs/specifications/a2-handoff-receiver-contract.md`, `docs/records/layer-2-scope-code-options-2026-07-08.md`, `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`, `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`, `docs/records/validation-wi-cx0048-test.md`, `docs/records/validation-wi-cx0049-docs.md`, `docs/records/validation-wi-cx0050-test.md`, `docs/records/validation-wi-cx0051-test.md`, `docs/records/validation-wi-cx0052-test.md`, `docs/records/validation-wi-cx0053-docs.md`, `docs/records/validation-wi-cx0054-fix.md`, `docs/records/validation-wi-cx0038-docs.md`, `docs/specifications/layer-2-knowledge-scaffold.md`, `docs/policies/decision-queue.md`, `docs/manifest.yaml`, and current policy docs.

Discipline:

- Use one focused WI at a time unless an approval envelope explicitly allows batching.
- Use category-bearing WI ids: `WI-CXNNNN-category`.
- Do not store completed task detail here.
- Completed evidence belongs in `docs/records/`, `docs/decisions`, git history, PRs, or `.flowset/handoff.md` summaries.
- Keep this file compact and live.
- Triage must choose both the next WI and the evaluator strategy codes.
- Non-trivial work proceeds through the branch-first lifecycle in `docs/policies/git-workflow.md`.
- External Issues and PRs require triage and approval under `docs/policies/github-issue-governance.md` before implementation starts.
- Decision Needed items use `docs/policies/decision-queue.md` state codes.
- Every non-trivial R1/R2/R3 WI requires a clean-context independent adversarial review of the current PR head before `pr:approved-merge`.

## Current Priority

- [ ] WI-CX0060-test Trusted Ephemeral Worker End-to-End Proof: blocked externally. The public-repository preflight passed and worker confinement passes locally, but the exact post-fix dogfood retry was policy-rejected even after current explicit user approval. Do not retry through another surface or workaround.

## Triggered Work

- None. The hourly worktree runner is retired; its historical first-output trigger must not reactivate or recreate it.

## Next Candidates

- None while WI-CX0060-test is externally blocked. Do not start the target handoff repair or lower-priority work merely to avoid the trusted-destination boundary.

## Known Issue Debt

| Item | Severity | Owner | Trigger | Defer reason | Repayment condition | Hard stop | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KI-CX-PROVIDER-001 / Issue #55 Repository-backed model worker trust boundary. | Medium | H1 / execution platform | The public-repository preflight passed, but the exact post-fix local dogfood retry was policy-rejected even after current explicit user approval; the configured external destination is not established as trusted. | WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard repaid process cleanup, and WI-CX0060 preserves the public preflight, failed dogfood run, verified cleanup, and deterministic confinement without bypassing disclosure policy. | The execution platform establishes a trusted model destination and permits the managed repository-backed dogfood proof. | Before completing WI-CX0060-test, dogfood continuation, generalized unattended model worker use, or runner reactivation. | open |
| KI-CX-WORKER-003 / Issue #61 Managed worker nested-collaboration timeout. | High | CODEX | The first dogfood run completed target reconstruction and validation, then entered an unsupported collaboration wait and timed out before final output. | None; timeout cleanup succeeded but does not prove end-to-end completion. | The runner disables `multi_agent`, deterministic confinement passes, and a live dogfood run returns a final result before timeout with verified zero residuals. | Before completing WI-CX0060-test, dogfood continuation beyond diagnosis, generalized unattended workers, or runner replacement. | open |
| KI-CX-DOGFOOD-002 / Issue #62 Generated target stale-handoff false green. | High | CODEX | The clean committed target still instructed the controller to review and commit, while both target validators passed. | The finding was discovered read-only and Layer 1 must not silently rewrite Layer 2 state. | The generated target workflow records truthful post-commit state, its validator rejects the stale pattern, the target carries qualified fix evidence, and a clean worker confirms it. | Before claiming target operating state is current, starting another target WI, or generalizing target handoff correctness. | open |
| KI-CX-REVIEW-001 / Issue #59 Independent reviewer provenance boundary. | High | H1 / execution platform | The repository can validate a controller-attested receipt but cannot verify a signed `multi_agent_v1` reviewer identity. | The current supervised WI uses an actual clean-context agent, live controller inspection, current-head GitHub review evidence, and active user approval without claiming cryptographic provenance. | The execution surface supplies a signed orchestrator attestation or a distinct independently authenticated reviewer identity that the repository can verify. | Before unattended/generalized automated merge, A2/A3 authority expansion, release candidate, public release, or OSS submission. | open |
| KI-CX-STATUS-001 / Issue #60 Trusted workflow identity boundary. | High | H1 / GitHub plan or dedicated publisher | GitHub Free required checks can bind the context to the shared Actions app but not to one workflow file or event. | Supervised merge requires the exact expected Actions run, exact-head independent review, live audit, and active user approval; the status is defense in depth only. | Enable an organization/enterprise required-workflow ruleset or install a dedicated authenticated publisher identity unavailable to candidate workflows. | Before unattended/generalized automated merge, A2/A3 authority expansion, release candidate, public release, or OSS submission. | open |

## Decision Needed Queue

| Item | State | Owner gate | Lock blocker | Repayment trigger |
| --- | --- | --- | --- | --- |
| Release category policy. | DQ-EXTERNAL | H1 | no | Before release candidate, tag, package publication, deployment, or OSS submission. |
| A3 publication/merge envelope beyond the current bootstrap approval scope. | DQ-USER | USER | conditional | Before A3 publication, release, deployment, package publication, OSS submission, or generalized automerge behavior. |
| Whether the validator should adopt a strict YAML parser later. | DQ-DEBT | CODEX | no | When manifest grammar exceeds the current parser or parser drift is observed. |
| Strict TypeScript source conversion or strict-mode tightening. | DQ-DEBT | CODEX | no | Probe installed by WI-CX0040; repay before release-candidate tooling lock or when probe counts are small enough for a focused strictness WI. |
