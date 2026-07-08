# FDP_Codex Fix Plan

Status: live backlog.

Authority: `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`, `docs/decisions/2026-07-08-repository-license-binding.md`, `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`, `docs/manifest.yaml`, and current policy docs.

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

- [ ] WI-CX0015-docs OSS Readiness Baseline: define the first public release scope, then align README, CONTRIBUTING, SECURITY, roadmap, issue forms, and contributor guidance for public use. Blocked on public release scope boundary. Expected strategy: PSC=P5, WTC=OSS, Risk=R2, ESC=E2+E3+E4+E5+E6+E7.

## Next Candidates

- [ ] WI-CX0016-docs Operating Policy LOCK: convert accepted scaffold policies into formal decisions after unresolved Decision Needed items are answered. Blocked on Decision Needed queue. Expected strategy: P1/FND/R2/E4+E5+E6.
- [ ] WI-CX0017-ci Validator CI Follow-Up: inspect GitHub Actions on `main` after closeout merge and harden workflow if needed. Expected strategy: P2/VAL/R2/E2+E3+E5+E6.

## Decision Needed Queue

- [ ] First public release scope boundary.
- [ ] Default verification project profile for FDP_Codex itself.
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
- [ ] Whether GitHub label names are locked as written or shortened before public release.
- [ ] Whether GitHub issue forms become required for all public submissions.
- [ ] Whether the validator should adopt a strict YAML parser later.
- [ ] Whether context pack output should be written to `.flowset/context-packs/` metadata files or remain stdout-only by default. Recommended: stdout-only.
- [ ] Whether context pack builder runs should append ledger records automatically or require a separate explicit command. Recommended: explicit.
- [ ] Whether context pack selection should remain heuristic or move to a stricter rule table.
- [ ] Whether handoff maximum line count should be 220, 300, or profile-dependent.
- [ ] Whether current WI and handoff should be split into stricter machine-readable state later.