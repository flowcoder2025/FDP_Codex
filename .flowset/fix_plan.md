# FDP_Codex Fix Plan

Status: live backlog.

Authority: `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`, `docs/decisions/2026-07-08-repository-license-binding.md`, `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`, `docs/decisions/2026-07-08-public-readiness-boundary.md`, `docs/decisions/2026-07-08-evaluation-surface-baseline.md`, `docs/decisions/2026-07-08-context-pack-command-surface.md`, `docs/decisions/2026-07-08-context-selection-rule-table.md`, `docs/decisions/2026-07-08-decision-queue-state-codes.md`, `docs/decisions/2026-07-08-ki-identity-severity-policy.md`, `docs/decisions/2026-07-08-handoff-size-policy.md`, `docs/decisions/2026-07-08-autonomy-default-options-packet.md`, `docs/decisions/2026-07-08-operating-policy-lock.md`, `docs/decisions/2026-07-08-session-boundary-automation-contract.md`, `docs/decisions/2026-07-08-tooling-typescript-baseline.md`, `docs/decisions/2026-07-08-automation-run-surface-installation.md`, `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md`, `docs/policies/decision-queue.md`, `docs/manifest.yaml`, and current policy docs.

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

- [ ] WI-CX0032-docs Layer 2 Knowledge Scaffold Contract: define the portable target-project scaffold contract for manifests, handoffs, ledgers, and WI/KI separation before generating Layer 2 artifacts. Expected strategy: PSC=P3, WTC=KNOW, Risk=R2, ESC=E1+E3+E5+E6.

## Next Candidates

- WI-CX0033-test Automation Runner First Fresh-Run Evidence: inspect the next actual standalone runner output once Codex app produces it, without expanding automation authority.

## Decision Needed Queue

| Item | State | Owner gate | Lock blocker | Repayment trigger |
| --- | --- | --- | --- | --- |
| Chunk id scope: global, per-layer, or per-target-project. | DQ-POLICY | CODEX | conditional | Before Layer 2 generation or manifest namespace expansion. |
| Layer 2 project scope code rule. | DQ-POLICY | USER | conditional | Before first Layer 2 target-project scaffold. |
| Release category policy. | DQ-EXTERNAL | H1 | no | Before release candidate, tag, package publication, deployment, or OSS submission. |
| A3 publication/merge envelope beyond the current bootstrap approval scope. | DQ-USER | USER | conditional | Before A3 publication, release, deployment, package publication, OSS submission, or generalized automerge behavior. |
| Branch deletion automation default after squash merge. | DQ-USER | USER | no | Before making branch deletion the default outside the current approval envelope. |
| Whether portfolio guardrails become deterministic validator rules. | DQ-POLICY | CODEX | no | After repeated portfolio imbalance findings or before release-readiness scoring. |
| Whether every KI must become a GitHub Issue after public release. | DQ-EXTERNAL | H1 | no | Before first public release or external contributor operating mode. |
| Whether the validator should adopt a strict YAML parser later. | DQ-DEBT | CODEX | no | When manifest grammar exceeds the current parser or parser drift is observed. |
| Whether current WI and handoff should be split into stricter machine-readable state later. | DQ-DEBT | CODEX | no | When handoff or current WI parsing becomes ambiguous or repeated validator exceptions appear. |
| Strict TypeScript source conversion or strict-mode tightening. | DQ-DEBT | CODEX | no | When repository scripts grow beyond the `.mjs` checkJs baseline or before release-candidate tooling lock. |
| Long-lived post-bootstrap automation cadence and authority. | DQ-USER | USER | conditional | Before the bootstrap envelope expires, release-candidate readiness, or changing the runner beyond the current bounded A2 prompt. |
| S2 blind review repayment for the automation runner. | DQ-DEBT | CODEX | conditional | Before generalized A2/A3 autonomy expansion, release-candidate readiness, public release, or OSS submission. |
