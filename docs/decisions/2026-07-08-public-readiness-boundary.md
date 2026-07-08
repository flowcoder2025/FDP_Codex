# Decision: Public Readiness Boundary

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0015-docs.

## Context

The repository is now public, but deployment, release publication, package publication, and OpenAI OSS program submission remain outside the approval envelope.

Public visibility creates a new documentation burden: external readers must be able to tell what is ready, what is intake-only, and what still requires maintainer triage.

## Decision

FDP_Codex adopts a conservative public readiness boundary.

The current public state is `public bootstrap, pre-release`.

This state allows:

- public repository inspection,
- public issue intake through issue forms,
- public PR intake through the PR template,
- GitHub Actions validation on PRs and `main`,
- documentation and policy hardening through WI branches and PRs,
- remote labels defined by `.github/labels.yml`.

This state does not allow:

- tagged release publication,
- package publication,
- deployment,
- OpenAI OSS program submission,
- compatibility guarantees for downstream users,
- importing private FDP_APP implementation history,
- treating public issues or PRs as automatic work authorization.

## First Release Candidate Gate

A first tagged release candidate should wait until these conditions are true:

- public contributor policies are locked or accepted-v0,
- validator behavior covers manifest, flow-state, GitHub template, and handoff hygiene without known release-blocking false-green gaps,
- context pack builder has a stable metadata contract,
- at least one sample WI/KI cycle is documented and validated,
- Critical and High KIs that block public release are repaid or explicitly canceled,
- release notes, tag policy, and artifact boundary are approved in a decision record.

## Public Intake Choices

Blank GitHub issues are disabled for the public baseline. Public submissions should use the Known Issue or Contribution Intake forms so triage has the fields needed for WI/KI routing.

The label names applied during bootstrap remain the public baseline. Label changes require a WI and PR because external contributors may see and use them.

## Verification Profile

For FDP_Codex itself, the default project profile is Medium until a release candidate decision changes it.

- R0 may batch.
- R1 may batch when localized.
- R2 must verify before public PR merge.
- R3 must verify immediately and stop for approval unless a narrower decision explicitly permits it.

## Consequences

README, CONTRIBUTING, SECURITY, ROADMAP, issue forms, PR template, manifest, fix_plan, and handoff must describe the same boundary.

This decision resolves the current Decision Needed items for:

- first public release scope boundary,
- whether GitHub issue forms become required for public submissions,
- whether label names are locked before the first public release,
- default verification project profile for FDP_Codex.

This decision does not authorize release publication, deployment, package publication, or OSS program submission.