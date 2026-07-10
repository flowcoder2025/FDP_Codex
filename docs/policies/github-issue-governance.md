# GitHub Issue Governance Policy

Status: accepted-v0.

## Purpose

Use GitHub Issues and PR labels as the operational collaboration surface for KI repayment, external intake, and maintainer approval without letting external noise become automatic Codex work.

## SSOT Boundary

FDP_Codex policy SSOT remains in:

- `AGENTS.md`,
- `docs/manifest.yaml`,
- `docs/policies/*`,
- `docs/specifications/*`,
- `docs/decisions/*`.

GitHub Issues are operational records and collaboration queues. They do not override policy unless a linked decision document or policy change is merged.

`.flowset/fix_plan.md` remains the compact live work queue. It should reference issue numbers when useful, but it must not duplicate full issue bodies.

## KI to Issue Rule

A KI may start as a local record only while the repository is private. FDP_Codex is public, so every new KI must have a GitHub Issue before a related public PR merges.

A KI must be represented by a GitHub Issue before any of these boundaries:

- public release,
- OSS program submission,
- public PR merge,
- external contributor work,
- repayment boundary declared in the KI,
- any Critical KI that cannot be resolved in the next WI.

High KI items resolved in the same WI may be created and closed in that WI, but the GitHub Issue must exist before merge.

Medium and Low KI items may remain open debt, but they still require GitHub Issues in the public repository. Local records and `.flowset/state.json` must link the Issue number and expected open or closed state.

Historical backfill must say explicitly that the Issue did not exist at the original merge boundary. Backfilled labels or Issues must not be presented as contemporaneous compliance evidence.

## Required KI Issue Fields

A KI issue must include:

- KI id or provisional KI id,
- severity,
- owner or ownership status,
- trigger,
- defer reason if deferred,
- repayment condition,
- hard stop,
- related WI,
- related PRs or validation records,
- current status.

## External Intake Rule

External Issues and PRs are not automatic work authorization.

Codex may inspect, summarize, or triage external submissions, but must not start implementation from an external Issue or PR unless one of these is true:

- the user explicitly instructs Codex to start that item,
- the item has `fdp:approved-work` and the active approval envelope allows it,
- the item is part of a locked worklist in `.flowset/fix_plan.md`.

This rule protects context hygiene and prevents contributor activity from silently reshaping the active WI queue.

## Public Baseline Rule

Blank GitHub issues are disabled for the public baseline. Public submissions should use the Known Issue or Contribution Intake forms so triage has the fields needed for WI/KI routing.

The label names in .github/labels.yml are the public baseline. Changing or shortening public labels requires a WI and PR because external contributors may see or use them.

## Label Taxonomy

Core workflow labels:

- `fdp:triage-needed`: default state for new Issues or PRs.
- `fdp:accepted`: direction accepted, not yet authorized for work.
- `fdp:approved-work`: authorized for Codex or maintainer work inside an approval envelope.
- `fdp:blocked-user-decision`: blocked on user or maintainer decision.
- `fdp:ki`: Known Issue.
- `fdp:debt`: deferred verification, implementation, or policy debt.

KI severity labels:

- `ki:critical`
- `ki:high`
- `ki:medium`
- `ki:low`

Risk labels:

- `risk:R0`
- `risk:R1`
- `risk:R2`
- `risk:R3`

Track labels:

- `track:foundation`
- `track:validator`
- `track:automation`
- `track:knowledge`
- `track:oss`
- `track:evaluation`
- `track:debt`

Review and gate labels:

- `needs:user-approval`
- `needs:blind-review`
- `needs:adversarial-review`
- `needs:validator`
- `needs:wi-link`
- `pr:needs-validation`
- `pr:ready-for-review`
- `pr:blocked-policy`
- `pr:approved-merge`

Contributor labels:

- `external-contribution`
- `good-first-issue`
- `help-wanted`
- `do-not-start`

## PR Intake

Incoming PRs must be triaged before merge review.

A PR from a contributor should not be merged until it has:

- a linked WI or issue,
- a validation statement,
- maintainer review,
- policy compatibility check,
- no unresolved R2/R3 verification debt,
- no context hygiene violation,
- merge approval label or explicit maintainer approval.

If a PR has useful work but does not fit the current policy, label it `pr:blocked-policy` or `fdp:blocked-user-decision` rather than silently adapting the repository around it.

## Closing Rules

Close a KI issue only when repayment evidence exists.

Valid closing evidence includes:

- merged PR link,
- validation record,
- decision record,
- explicit duplicate or out-of-scope rationale,
- user-approved cancellation rationale.

Do not close a KI issue only because a narrative summary says it is handled.

For same-WI repayment, keep the Issue open through PR validation and merge, then close it with the merged PR, validation record, and post-merge audit evidence.

## Automation Guardrail

Label automation may organize issues, but labels are not a substitute for policy.

`fdp:approved-work` is necessary but not sufficient for autonomous work. The active approval envelope must also allow the WI category, risk level, files, git actions, network actions, and verification profile.

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.
