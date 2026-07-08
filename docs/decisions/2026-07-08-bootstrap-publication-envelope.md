# Decision: Bootstrap Publication Envelope

Status: accepted.

Date: 2026-07-08.

## Context

FDP_Codex completed autonomous bootstrap foundation work locally with no local commit yet.

The user accepted the recommended bootstrap reconciliation path and then expanded the approval envelope.

## Approved Scope

The user approved:

- clean temporary worktree reconciliation,
- first bootstrap commit,
- branch push,
- PR creation,
- PR merge,
- branch deletion after merge,
- GitHub Actions workflow addition,
- remote GitHub label mutation,
- repository visibility change from private to public.

## Excluded Scope

The user did not approve:

- deployment,
- release publication,
- OSS program submission.

Those remain hard stops.

## Required Guardrails

- Run `npm run validate` before commit and before merge.
- Use PR workflow rather than direct push to `main`.
- Keep GitHub label changes aligned with `.github/labels.yml`.
- Do not add release or deployment automation in this envelope.
- Do not submit the OpenAI OSS program form in this envelope.

## Consequences

The next WI may execute bootstrap reconciliation and GitHub publication steps within this envelope.

Public visibility is allowed only after the merged repository still passes validation and the user has not interrupted the direction.
