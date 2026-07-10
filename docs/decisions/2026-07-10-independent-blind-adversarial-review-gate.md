# Decision: Independent Blind Adversarial Review Gate

Status: accepted-v0.

Date: 2026-07-10.

## Context

FDP_Codex defined E2 Blind Independent Review and S2 Separate Blind Review, but most WIs could still merge after same-thread validation. A checklist and a prepared review packet did not create an operational gate. This allowed an implementing agent to validate its own interpretation and left independent review as debt.

The user requires the verification stage to use an independent agent that receives a clean, non-persuasive context and reviews from an adversarial perspective before work continues.

## Decision

Every non-trivial R1, R2, or R3 WI requires E2 Blind Independent Review and E3 Adversarial Review before merge.

- The reviewer is a separate agent, separate Codex thread, or human reviewer.
- Agent-based review starts with clean context. Multi-agent review uses `fork_context: false`.
- The reviewer receives the accumulated goal, WI scope, base and head commit, changed files, authoritative sources, and verification commands. It does not receive implementation chat, persuasive PR narrative, or the implementer's self-grade.
- The reviewer inspects source and diff evidence directly, actively attempts to falsify readiness, and does not edit the implementation.
- The result is attached as a GitHub PR review with the machine-readable marker defined by `docs/specifications/independent-review-evidence.md`.
- The GitHub review commit and payload `reviewed_head` must both equal the current PR head.
- Any implementation or policy change after review invalidates the result. A fresh independent review is required.
- PASS with no P0, P1, or P2 finding is required. Conditional pass, blocked, request-changes, or any unresolved P0-P2 finding blocks `pr:approved-merge`.
- P3 findings require an explicit disposition. They may remain as residual risk only when the active boundary permits it.

R0 work may use S0 or S1 when it is genuinely trivial and does not alter policy, workflow, public behavior, verification, context, or external state.

## Operational Gate

`npm run audit:independent-review -- --pr <number>` reads the live PR head, labels, and GitHub reviews. It fails when the review is missing, stale, same-context, structurally incomplete, non-PASS, or contains blocking findings.

Required PR labels are:

- `needs:blind-review`
- `needs:adversarial-review`
- `pr:independent-review-passed`

`pr:approved-merge` is applied only after the independent review audit passes.

The `independent-review` commit status is a required `main` branch protection check bound to GitHub Actions app id `15368`. It is defense in depth rather than proof of one workflow identity. The default-branch workflow audits the live review and publishes that status; the supervised control-plane audit independently reruns the evidence check and verifies expected run evidence rather than trusting labels or status alone.

Status publication is fail-closed and monotonic within the supervised boundary. The workflow cancels superseded runs for the same PR. Its publisher sets `pending`, reads the live audit twice, and publishes success only when both reads identify the same passing head and review id. A changed or failing generation publishes failure.

The merged workflow does not accept a write-capable `pull_request` event. Status publication is controlled by workflow code on the default branch through `pull_request_target`, `pull_request_review`, or `workflow_dispatch`.

GitHub Free branch protection cannot distinguish which workflow file or event used the shared GitHub Actions app, and organization required-workflow rules are unavailable on the current plan. KI-CX-STATUS-001 / Issue #60 records this boundary. It blocks unattended/generalized automated merge, A2/A3 expansion, release candidates, public release, and OSS submission until a workflow-bound ruleset or dedicated publisher identity exists.

## Provenance Boundary

The current execution surface does not expose a repository-verifiable signed receipt for a `multi_agent_v1` worker. The review payload therefore includes a controller-attested `orchestrator_receipt`, but that receipt is not cryptographic proof that the controller did not self-issue it.

KI-CX-REVIEW-001 / Issue #59 owns this limitation. Until it is repaid, supervised work may merge only when the controller actually started a clean-context independent reviewer, inspected the live tool receipt, relayed the unchanged current-head result, and retained active user approval. The limitation blocks unattended or generalized automated merge, A2/A3 authority expansion, release candidates, public release, and OSS submission.

## Historical Runner Debt

WI-CX0042 and its runner-specific S2 debt are closed as obsolete, not passed. The reviewed worktree cron has been retired and deleted. Any future runner replacement is new work and must pass this general gate; the old review packet cannot authorize or validate it.

## Boundary

This decision does not authorize dogfood continuation, provider-policy bypass, runner replacement, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, A2/A3 authority expansion, unattended merge, or S2 self-review.
