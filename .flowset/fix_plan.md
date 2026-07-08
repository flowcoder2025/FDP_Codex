# FDP_Codex Fix Plan

Status: live backlog.

Authority: `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`, `docs/decisions/2026-07-08-repository-license-binding.md`, `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`, `docs/decisions/2026-07-08-public-readiness-boundary.md`, `docs/decisions/2026-07-08-evaluation-surface-baseline.md`, `docs/decisions/2026-07-08-context-pack-command-surface.md`, `docs/decisions/2026-07-08-context-selection-rule-table.md`, `docs/decisions/2026-07-08-decision-queue-state-codes.md`, `docs/decisions/2026-07-08-ki-identity-severity-policy.md`, `docs/decisions/2026-07-08-handoff-size-policy.md`, `docs/decisions/2026-07-08-autonomy-default-options-packet.md`, `docs/policies/decision-queue.md`, `docs/manifest.yaml`, and current policy docs.

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

- [ ] WI-CX0016-docs Operating Policy LOCK: convert accepted scaffold policies into formal decisions after unresolved Decision Needed items are answered. Expected strategy: PSC=P1, WTC=FND, Risk=R2, ESC=E2+E4+E5+E6.

## Next Candidates

- [ ] WI-CX0018-chore Local Workspace Realignment: choose and execute a safe path for making `C:\dev\FDP_Codex` match remote `main`. Blocked if the path requires destructive Git or filesystem operations. Expected strategy: PSC=P1, WTC=FND, Risk=R3, ESC=E2+E3+E5+E6.

## Decision Needed Queue

| Item | State | Owner gate | Lock blocker | Repayment trigger |
| --- | --- | --- | --- | --- |
| Chunk id scope: global, per-layer, or per-target-project. | DQ-POLICY | CODEX | conditional | Before Layer 2 generation or manifest namespace expansion. |
| Layer 2 project scope code rule. | DQ-POLICY | USER | conditional | Before first Layer 2 target-project scaffold. |
| Release category policy. | DQ-EXTERNAL | H1 | no | Before release candidate, tag, package publication, deployment, or OSS submission. |
| A2/A3 git and continuation scope. | DQ-USER | USER | conditional | Before A2 fresh-run automation or A3 publication/merge envelope is generalized. |
| Branch deletion automation default after squash merge. | DQ-USER | USER | no | Before making branch deletion the default outside the current approval envelope. |
| Whether portfolio guardrails become deterministic validator rules. | DQ-POLICY | CODEX | no | After repeated portfolio imbalance findings or before release-readiness scoring. |
| Whether every KI must become a GitHub Issue after public release. | DQ-EXTERNAL | H1 | no | Before first public release or external contributor operating mode. |
| Whether the validator should adopt a strict YAML parser later. | DQ-DEBT | CODEX | no | When manifest grammar exceeds the current parser or parser drift is observed. |
| Whether current WI and handoff should be split into stricter machine-readable state later. | DQ-DEBT | CODEX | no | When handoff or current WI parsing becomes ambiguous or repeated validator exceptions appear. |
