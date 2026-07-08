# Decision: Operating Policy LOCK v0

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0016-docs.

## Context

FDP_Codex now has a public bootstrap baseline, context hygiene, WI/KI lifecycle, naming, git workflow, GitHub issue governance, autonomy defaults, evaluation strategy, verification economy, and Decision Needed queue policy.

The live Decision Needed queue has no `yes` lock blockers after the autonomy default options decision. Remaining items are conditional, external, no-blocker, or debt items with repayment triggers.

## Decision

Layer 1 FDP_Codex operating policies are locked as accepted-v0 for the public bootstrap pre-release baseline.

The accepted-v0 operating policy set includes:

- `docs/policies/context-hygiene.md`
- `docs/policies/work-item-lifecycle.md`
- `docs/policies/naming-and-commits.md`
- `docs/policies/git-workflow.md`
- `docs/policies/github-issue-governance.md`
- `docs/policies/autonomy-and-approval.md`
- `docs/policies/triage-strategy.md`
- `docs/policies/evaluation-strategy.md`
- `docs/policies/verification-economy.md`
- `docs/policies/decision-queue.md`

The live Decision Needed SSOT is `.flowset/fix_plan.md`. Policy files may point to it, but must not maintain separate free-form unresolved queues.

No `yes` lock blocker remains for `WI-CX0016-docs Operating Policy LOCK`.

## Consequences

Future WIs may treat the operating process as stable enough to run branch-first, manifest-backed, validator-checked work without renegotiating the baseline process every time.

Conditional and no-blocker Decision Needed items remain live debt or future policy work. They do not block the accepted-v0 operating policy lock unless their recorded trigger is reached.

A stricter release-candidate lock may be created later, but it must pass release-readiness evaluation and H1 gates where required.

## Exclusions

This decision does not authorize release publication, deployment, package publication, OSS program submission, license changes, new production dependencies, A3 publication behavior, or destructive local realignment of `C:\dev\FDP_Codex`.