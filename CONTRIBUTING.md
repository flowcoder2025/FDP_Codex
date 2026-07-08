# Contributing

Status: public baseline.

FDP_Codex accepts public issues and PRs as intake for an early workflow kit. Intake is not automatic work authorization: maintainers triage submissions against the active WI, risk level, context-hygiene policy, and approval envelope before implementation starts.

## Boundaries

Do not contribute:

- private FDP_APP history or proprietary implementation detail
- secrets, credentials, exploit details, or sensitive operational data
- long-lived context bodies in ledgers, handoff, or records
- release, deployment, package publication, or OSS submission changes without an explicit decision and approval envelope
- broad rewrites that bypass the WI/KI process

## Issue Intake

Use the GitHub issue forms:

- Known Issue: repayment work, defects, policy gaps, or verification debt.
- Contribution Intake: proposed changes, questions, examples, or external suggestions.

Blank issues are disabled for public hygiene. If the forms do not fit, use Contribution Intake and explain the mismatch.

A public issue should include:

- the problem or KI trigger
- the smallest useful change
- affected surface: policy, specification, automation, validation, documentation, or unknown
- suggested verification
- known risk or hard stop

## PR Requirements

Before opening a PR:

1. Link a WI, KI, or triaged issue.
2. Use a branch name compatible with `wi/cxNNNN-category-short-slug` when the work is maintainer-driven.
3. Keep the change scoped to one WI unless the PR states the approved batch envelope.
4. Update `docs/manifest.yaml` when adding or moving policy, specification, decision, runbook, record, public documentation, or GitHub template files.
5. Keep `.flowset/fix_plan.md` compact; completed evidence belongs in records, decisions, PRs, or handoff summaries.
6. Fill out the PR template, including validation and policy checks.

## Validation

Run the repository validator before asking for review:

```bash
npm run validate
```

For policy, manifest, or public-readiness changes, also rebuild a context pack metadata preview for the changed surface:

```bash
npm run context:pack -- --wi WI-CX0000-docs --intent oss-readiness --risk R2 --changed docs/manifest.yaml
```

Do not paste context pack bodies into issues, PRs, handoff, or records. The builder should output metadata only.

## Review and Merge

A PR should not merge until it has:

- a linked WI, KI, or triaged issue
- validation evidence
- no unresolved R2/R3 verification debt that blocks public merge
- no context hygiene violation
- no unapproved release, deployment, license, security, or external contract change
- maintainer approval or an active approval envelope that allows merge

External contributor PRs may be labeled `fdp:triage-needed`, `fdp:accepted`, `fdp:approved-work`, `pr:blocked-policy`, or `do-not-start` depending on triage outcome.