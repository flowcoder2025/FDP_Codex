# GitHub Label Setup Runbook

Status: draft.

## Purpose

Apply the label taxonomy from `docs/policies/github-issue-governance.md` to the GitHub repository after the user approves remote label changes.

## Preconditions

- The active approval envelope allows GitHub label mutation.
- The repository remote is `https://github.com/flowcoder2025/FDP_Codex.git`.
- `.github/labels.yml` matches `docs/policies/github-issue-governance.md`.
- No public release or OSS submission is in progress unless the release envelope allows it.

## Procedure

1. Read `docs/policies/github-issue-governance.md`.
2. Read `.github/labels.yml`.
3. Compare existing repository labels with `.github/labels.yml`.
4. Create missing labels.
5. Update descriptions and colors only when the policy label name already matches.
6. Do not delete labels unless a separate cleanup WI authorizes it.
7. Record the command output or GitHub audit evidence in a validation record.

## Suggested Command Surface

Use `gh label list` to inspect labels.

Use `gh label create` or `gh label edit` for approved changes.

Do not run label mutation commands from an unapproved issue or PR.

## Decision Needed

- Whether labels should be applied while the repository is private or immediately before public release.
