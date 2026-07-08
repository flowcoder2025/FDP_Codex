# Bootstrap Reconciliation Runbook

Status: draft.

## Purpose

Define the safe path for turning the current local bootstrap scaffold into a PR-ready branch.

Current state:

- local repository exists,
- active branch is `wi/cx0007-docs-github-workflow-governance`,
- local repository has no commit yet,
- `origin/main` exists,
- `origin/main` contains an initial Apache-2.0 `LICENSE` commit,
- local scaffold contains many untracked files created during bootstrap,
- no push, PR, merge, tag, release, label mutation, or visibility change has been performed.

## Constraints

- Do not force push.
- Do not push directly to `main`.
- Do not create unrelated-history root commits for PR publication.
- Do not run `git reset`, branch deletion, or destructive filesystem operations without explicit user approval.
- Do not mutate remote labels, repository visibility, GitHub Actions, or releases inside this runbook.
- Run `npm run validate` before any commit, push, or PR.

## Read-Only Evidence

Read-only inspection found:

- `origin/main` has commit `e32fe6f Initial commit`.
- `origin/main` tree contains `LICENSE`.
- Local and remote `LICENSE` normalize to the same Apache-2.0 text.

## Preferred Path

Use a clean reconciliation workspace or explicitly approved current-worktree operation.

Clean workspace path:

1. Run `npm run validate` in the current workspace.
2. Create a clean temporary clone or worktree from `origin/main`.
3. Create a branch named `wi/cx0012-docs-bootstrap-reconciliation`.
4. Copy the local scaffold files into that clean branch, excluding `.git`, temporary files, dependency folders, caches, and editor files.
5. Run `npm run validate` in the clean branch.
6. Commit with:

```text
WI-CX0012-docs: add FDP_Codex bootstrap scaffold
```

7. Commit body should list included validated WIs: WI-CX0001 through WI-CX0012.
8. Push only after the user approves git publication.
9. Open a draft PR only after push approval.
10. Keep the PR draft until validation evidence and review requirements are attached.

Current-worktree path:

1. Use only if the user explicitly approves index and HEAD reconciliation operations.
2. Set the current branch base to `origin/main` without deleting local scaffold files.
3. Ensure local `LICENSE` remains equivalent to `origin/main:LICENSE`.
4. Stage scaffold files intentionally.
5. Run `npm run validate`.
6. Commit, push, and open PR only inside an approved git envelope.

## Rejected Paths

Do not use:

- force push over `origin/main`,
- direct push to `main`,
- merge with unrelated history,
- root commit unrelated to `origin/main` for PR publication,
- hidden reset or checkout that may overwrite local scaffold files,
- PR without validation record links,
- PR without bootstrap exception explanation.

## Required PR Notes

The first bootstrap PR must explain:

- why the branch contains multiple validated bootstrap WIs,
- why branch-to-WI matching is temporarily a warning,
- that no remote label mutation or GitHub Actions workflow was performed,
- that publication and merge remain separately approved actions.

## Verification

Before commit:

```bash
npm run validate
```

Before push:

- confirm branch is based on `origin/main`,
- confirm no unexpected generated files are staged,
- confirm local `LICENSE` is equivalent to `origin/main:LICENSE`,
- confirm handoff and validation records are current.

Before merge:

- repay required verification debt,
- complete required blind or adversarial review,
- ensure PR title and branch follow policy,
- ensure user or maintainer approval exists.

## Decision Needed

- Whether bootstrap reconciliation should create one combined bootstrap PR or preserve WI granularity in multiple commits.
- Whether the first local commit may be created before explicit user review.
- Whether reconciliation should use a clean temporary worktree or current-worktree operation.
