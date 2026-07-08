# WI-CX0050-test Validation Record

WI: WI-CX0050-test.
Title: Worktree Isolation Verification.
Status: validated-blocked.
Branch: `wi/cx0050-test-worktree-isolation-verification`.
Date: 2026-07-08.

## Evidence

- Base main before start: `fefac391ff5edc2c19ea3a36629f93daf9288a1c`, PR #33 merged WI-CX0049.
- Initial context pack: `ctx-wi-cx0050-test-20260708113922`, 99 entries, metadata-only ledger append.
- Final context pack: `ctx-wi-cx0050-test-20260708114750`, 106 entries, metadata-only ledger append with changed-path metadata.
- `git fetch origin` completed before WI start.
- `gh pr list --state open --limit 20 --json number,title,headRefName,baseRefName,url,isDraft` returned `[]`.
- `git branch --all --list *cx0050*` returned no existing WI-CX0050 branch before this run.
- `git log --oneline --decorate --max-count 10 --all --grep WI-CX0050` returned no existing WI-CX0050 commit before this run.
- `git cat-file -e origin/main:docs/decisions/2026-07-08-automation-run-surface-installation.md` confirmed the WI-CX0029 decision on `origin/main`.
- `git cat-file -e origin/main:docs/records/validation-wi-cx0029-chore.md` confirmed the WI-CX0029 validation record on `origin/main`.
- Branch creation inside the managed sandbox first failed with `fatal: cannot lock ref 'refs/heads/wi/cx0050-test-worktree-isolation-verification': unable to create directory for .git/refs/heads/wi/cx0050-test-worktree-isolation-verification`.
- Ref inspection showed no local `wi` branch conflict: `.git/refs/heads` contained only `main`; `git branch --list wi` returned empty.
- Escalated `git switch -c wi/cx0050-test-worktree-isolation-verification` succeeded.

## Result

- Worktree isolation is blocked, not proven.
- This run did not start in an isolated per-run worktree path. It started in `C:\dev\FDP_Codex`, the canonical repository path recorded by prior runtime evidence.
- The runner could continue only after creating a branch in the canonical repository and escalating `.git` writes.
- This evidence is enough to prevent first Layer 2 target-project scaffold confidence claims and generalized A2/A3 expansion.
- The next repair gate is WI-CX0051-test Worktree Isolation Repair Gate.

## Evaluator Strategy

- PSC: P1.
- WTC: VAL.
- Risk: R2.
- ESC: E1+E3+E5+E6.
- Primary evaluator stance: distinguish a safe blocked isolation result from a proven clean worktree receiver.
- Validator stance: fail if FDP_Codex treats WI-CX0050 as successful worktree isolation proof or advances Layer 2/A2 confidence while isolation remains blocked.

## Commands

- `git fetch origin`
- `gh pr list --state open --limit 20 --json number,title,headRefName,baseRefName,url,isDraft`
- `git branch --all --list *cx0050*`
- `git log --oneline --decorate --max-count 10 --all --grep WI-CX0050`
- `git cat-file -e origin/main:docs/decisions/2026-07-08-automation-run-surface-installation.md`
- `git cat-file -e origin/main:docs/records/validation-wi-cx0029-chore.md`
- `git switch -c wi/cx0050-test-worktree-isolation-verification`
- `npm.cmd run context:pack -- --wi WI-CX0050-test --intent worktree-isolation-verification --risk R2 --append-ledger --actor codex`
- `npm.cmd run context:pack -- --wi WI-CX0050-test --intent worktree-isolation-verification-final-validation --risk R2 --changed ... --append-ledger --actor codex`
- `node --check scripts\validate-repo.mjs`
- `npm.cmd run validate`
- `npm.cmd run typecheck`
- `npm.cmd run ci:check`
- `git diff --check`
## Boundary

No release publication, deployment, package publication, OSS program submission, automation schedule change, automation prompt change, merge authority change, A2/A3 authority change, A3 publication behavior, production dependency addition, public API or external contract change, S2 execution, separate reviewer creation, destructive filesystem or git operation occurred, or first Layer 2 scaffold generation occurred.
