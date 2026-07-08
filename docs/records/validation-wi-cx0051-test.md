# WI-CX0051-test Validation Record

WI: WI-CX0051-test.
Title: Worktree Isolation Repair Gate.
Status: validated.
Branch: `wi/cx0051-test-worktree-isolation-repair-gate`.
Date: 2026-07-08.

## Evidence

- Base main before start: `8ed21ae`, PR #34 merged WI-CX0050.
- Initial context pack: `ctx-wi-cx0051-test-20260708123914`, 32 entries, metadata-only ledger append.
- Final context pack: `ctx-wi-cx0051-test-20260708125106`, 108 entries, metadata-only ledger append with changed-path metadata.
- `git fetch origin` completed before WI start.
- `git ls-tree -r --name-only origin/main docs/decisions docs/records | Select-String -Pattern '2026-07-08-automation-run-surface-installation.md|validation-wi-cx0029-chore.md'` confirmed the WI-CX0029 decision and validation record on `origin/main`.
- `git branch --all --list "*cx0051*"` returned no existing WI-CX0051 branch before this run.
- `git ls-remote --heads origin "*cx0051*"` returned no existing remote WI-CX0051 branch before this run.
- `gh pr list --state open --search "WI-CX0051 OR cx0051 OR worktree isolation repair" --json number,title,headRefName,url,state` returned `[]`.
- Branch creation inside the managed sandbox first failed with `fatal: cannot lock ref 'refs/heads/wi/cx0051-test-worktree-isolation-repair-gate': unable to create directory for .git/refs/heads/wi/cx0051-test-worktree-isolation-repair-gate`.
- Escalated `git switch -c wi/cx0051-test-worktree-isolation-repair-gate` succeeded.

## Result

- Added `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md`.
- Defined the minimal evidence gate for marking A2 worktree isolation proven.
- Required the runner `cwd` and git toplevel to be outside `C:\dev\FDP_Codex` before worktree isolation can advance.
- Required canonical repository preservation, clean receiver start state, duplicate branch/PR checks, WI-CX0029 origin/main checks, context-pack rebuild, receiver evidence, validation summary, and preserved hard stops.
- Kept worktree isolation `not_proven` until future repo-visible evidence satisfies the gate.
- Reprioritized the live flow to wait for user or control-plane repair before another autonomous WI advances A2 or Layer 2 confidence.

## Evaluator Strategy

- PSC: P1.
- WTC: VAL.
- Risk: R2.
- ESC: E1+E3+E5+E6.
- Primary evaluator stance: define the minimum proof needed before converting blocked isolation into proven isolation.
- Validator stance: fail if FDP_Codex claims A2 worktree isolation proof without the repair-gate evidence or continues autonomous WI progression while the repair remains a control-plane/user gate.

## Commands

- `git fetch origin`
- `git branch --all --list "*cx0051*"`
- `git ls-remote --heads origin "*cx0051*"`
- `gh pr list --state open --search "WI-CX0051 OR cx0051 OR worktree isolation repair" --json number,title,headRefName,url,state`
- `git ls-tree -r --name-only origin/main docs/decisions docs/records | Select-String -Pattern '2026-07-08-automation-run-surface-installation.md|validation-wi-cx0029-chore.md'`
- `git switch -c wi/cx0051-test-worktree-isolation-repair-gate`
- `npm.cmd run context:pack -- --wi WI-CX0051-test --intent "worktree isolation repair gate" --risk R2 --append-ledger --actor codex`
- `npm.cmd run context:pack -- --wi WI-CX0051-test --intent "worktree isolation repair gate final validation" --risk R2 --changed ... --append-ledger --actor codex`
- `node --check scripts\validate-repo.mjs`
- `npm.cmd run validate`
- `npm.cmd run typecheck`
- `npm.cmd run ci:check`
- `git diff --check`

## Boundary

No release publication, deployment, package publication, OSS program submission, automation schedule change, automation prompt change, merge authority change, A2/A3 authority change, A3 publication behavior, production dependency addition, public API or external contract change, S2 execution, separate reviewer creation, destructive filesystem or git operation occurred, or first Layer 2 scaffold generation occurred.
