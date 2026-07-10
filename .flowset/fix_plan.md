# FDP_Codex Fix Plan

Status: live backlog.

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

## Current Priority

- [ ] WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard: add bounded timeout, observable event/error capture, and verified descendant-process cleanup before controller fallback.

## Triggered Work

- WI-CX0035-test Automation Runner First Fresh-Run Output Review: inspect the next actual standalone A2 worktree runner output after Codex app produces it, without expanding automation authority. Trigger only when a new FDP_Codex runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`. Expected strategy: PSC=P2, WTC=AUTO, Risk=R2, ESC=E1+E2+E3+E5+E6.

## Next Candidates

- WI-CX0042-test Automation Runner S2 Review Execution: start only after a separate Codex thread, separate reviewer, or human reviewer is available to execute `docs/records/automation-runner-s2-review-packet-2026-07-08.md`.
- WI-CX0044-docs Post-Bootstrap Automation Cadence Accepted Decision: start only after the user chooses from `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`.

## Known Issue Debt

| Item | Severity | Owner | Trigger | Defer reason | Repayment condition | Hard stop | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KI-CX-WORKER-001 Ephemeral worker process lifecycle. | Medium | CODEX | Two `codex exec --ephemeral` attempts produced no visible events before timeout, left an incomplete builder edit, and wrapper termination left observed PIDs 61312, 40280, and 60288 running until explicit cleanup. | The controller stopped the exact observed processes, inspected the partial diff, and continued in the one visible control task. | WI-CX0059-fix adds bounded timeout, event/error capture, and verified descendant cleanup before controller fallback. | Before generalized unattended ephemeral worker use or runner reactivation. | open |

## Decision Needed Queue

| Item | State | Owner gate | Lock blocker | Repayment trigger |
| --- | --- | --- | --- | --- |
| Release category policy. | DQ-EXTERNAL | H1 | no | Before release candidate, tag, package publication, deployment, or OSS submission. |
| A3 publication/merge envelope beyond the current bootstrap approval scope. | DQ-USER | USER | conditional | Before A3 publication, release, deployment, package publication, OSS submission, or generalized automerge behavior. |
| Branch deletion automation default after squash merge. | DQ-USER | USER | no | Before making branch deletion the default outside the current approval envelope. |
| Whether every KI must become a GitHub Issue after public release. | DQ-EXTERNAL | H1 | no | Before first public release or external contributor operating mode. |
| Whether the validator should adopt a strict YAML parser later. | DQ-DEBT | CODEX | no | When manifest grammar exceeds the current parser or parser drift is observed. |
| Strict TypeScript source conversion or strict-mode tightening. | DQ-DEBT | CODEX | no | Probe installed by WI-CX0040; repay before release-candidate tooling lock or when probe counts are small enough for a focused strictness WI. |
| Long-lived post-bootstrap automation cadence and authority. | DQ-USER | USER | conditional | Handback `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`; before the bootstrap envelope expires, release-candidate readiness, or changing the runner beyond the current bounded A2 prompt. |
| S2 blind review repayment for the automation runner. | DQ-DEBT | CODEX | conditional | Review packet installed by WI-CX0041; execute with a separate reviewer before generalized A2/A3 expansion, release-candidate readiness, public release, or OSS submission. |
