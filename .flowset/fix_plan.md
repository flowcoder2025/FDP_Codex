# FDP_Codex Fix Plan

Status: live backlog.

Authority: `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`, `docs/decisions/2026-07-08-repository-license-binding.md`, `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`, `docs/decisions/2026-07-08-public-readiness-boundary.md`, `docs/manifest.yaml`, and current policy docs.

Discipline:

- Use one focused WI at a time unless an approval envelope explicitly allows batching.
- Use category-bearing WI ids: `WI-CXNNNN-category`.
- Do not store completed task detail here.
- Completed evidence belongs in `docs/records/`, `docs/decisions`, git history, PRs, or `.flowset/handoff.md` summaries.
- Keep this file compact and live.
- Triage must choose both the next WI and the evaluator strategy codes.
- Non-trivial work proceeds through the branch-first lifecycle in `docs/policies/git-workflow.md`.
- External Issues and PRs require triage and approval under `docs/policies/github-issue-governance.md` before implementation starts.

## Current Priority

- [ ] WI-CX0019-docs Evaluation Surface Baseline: define the accepted blind-review and adversarial-review execution surfaces for pre-release FDP_Codex work, including what must wait for a separate thread or human review before release candidate work. Expected strategy: PSC=P1, WTC=EVAL, Risk=R2, ESC=E1+E3+E4+E5+E6.

## Next Candidates

- [ ] WI-CX0016-docs Operating Policy LOCK: convert accepted scaffold policies into formal decisions after unresolved Decision Needed items are answered. Blocked on remaining Decision Needed queue. Expected strategy: PSC=P1, WTC=FND, Risk=R2, ESC=E2+E4+E5+E6.
- [ ] WI-CX0018-chore Local Workspace Realignment: choose and execute a safe path for making `C:\dev\FDP_Codex` match remote `main`. Blocked if the path requires destructive Git or filesystem operations. Expected strategy: PSC=P1, WTC=FND, Risk=R3, ESC=E2+E3+E5+E6.

## Decision Needed Queue

- [ ] First hook implementation surface final form.
- [ ] Chunk id scope: global, per-layer, or per-target-project.
- [ ] Layer 2 project scope code rule.
- [ ] Release category policy.
- [ ] KI id severity encoding.
- [ ] Default autonomy mode after bootstrap.
- [ ] A2/A3 git and continuation scope.
- [ ] Branch deletion automation default after squash merge.
- [ ] Blind review execution surface. Recommended: separate Codex thread.
- [ ] Adversarial checklist granularity per surface type.
- [ ] Whether portfolio guardrails become deterministic validator rules.
- [ ] Whether every KI must become a GitHub Issue after public release.
- [ ] Whether the validator should adopt a strict YAML parser later.
- [ ] Whether context pack output should be written to `.flowset/context-packs/` metadata files or remain stdout-only by default. Recommended: stdout-only.
- [ ] Whether context pack builder runs should append ledger records automatically or require a separate explicit command. Recommended: explicit.
- [ ] Whether context pack selection should remain heuristic or move to a stricter rule table.
- [ ] Whether handoff maximum line count should be 220, 300, or profile-dependent.
- [ ] Whether current WI and handoff should be split into stricter machine-readable state later.