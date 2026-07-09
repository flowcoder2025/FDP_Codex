# WI-CX0052-test Validation Record

WI: WI-CX0052-test.
Title: A2 Worktree Isolation Repair Validation.
Status: validated.
Branch: `wi/cx0052-test-a2-worktree-isolation-repair-validation`.
Date: 2026-07-09.

## Evidence

- Receiver thread: `019f4760-3df9-7e12-95c2-4f5053db3bf4`.
- Automation id: `fdp-codex-a2-worktree-wi-runner`.
- Receiver cwd: `C:\Users\User\.codex\worktrees\9c45\FDP_Codex`.
- `git rev-parse --show-toplevel` in the receiver resolved to `C:/Users/User/.codex/worktrees/9c45/FDP_Codex`.
- Receiver start state was clean and detached at `origin/main` before the WI-CX0052 context append and branch creation.
- Receiver HEAD and `origin/main` matched commit `4c7e89db05fd18a51ff37bb09d270aa0b847dcab`.
- Canonical repository `C:\dev\FDP_Codex` remained on `main` at `4c7e89db05fd18a51ff37bb09d270aa0b847dcab` with no receiver WI file changes.
- `git worktree list --porcelain` showed the receiver branch only under `C:/Users/User/.codex/worktrees/9c45/FDP_Codex`.
- The stale local branch `wi/cx0035-test-automation-runner-first-fresh-run-output-review` was verified clean, equal to `main`, then removed from Git branch/worktree registration before this validation.
- `git worktree list --porcelain` no longer showed registered `3c5a` or `cx0035` worktree ownership after cleanup.
- `origin/main` contained the WI-CX0029 automation installation decision and validation record before this validation.
- Duplicate checks found no local branch, remote branch, or open PR for `WI-CX0052-test` before the local validation branch was created.
- Open PR check for `WI-CX0029`, `WI-CX0035`, `WI-CX0051`, and `WI-CX0052` returned `[]` during the receiver validation.
- Context rebuilt from `docs/manifest.yaml` in the receiver worktree as `ctx-wi-cx0052-test-20260709145815`; the ledger append is metadata-only and stores no chunk bodies.
- Initial sandbox branch creation left a stale lock file; the parent verified no live `git` process, removed only that stale lock, and created the local branch.

## Result

Worktree isolation repair gate is satisfied.

The receiver run started outside `C:\dev\FDP_Codex`, proved its git toplevel was the receiver worktree, preserved the canonical repository, started from a clean receiver state, passed duplicate branch/PR guards, rebuilt context from the manifest, and recorded repo-visible validation evidence.

Worktree isolation may now be treated as proven for FDP_Codex control-plane purposes. First Layer 2 target-project scaffold generation remains blocked on the Layer 2 project scope code user decision and any remaining release or expansion gates. Generalized A2/A3 expansion remains blocked by S2 blind review debt and future user decision gates.

## Evaluator Strategy

- PSC: P1.
- WTC: VAL.
- Risk: R2.
- ESC: E1+E3+E5+E6.
- Primary evaluator stance: prove only the WI-CX0051 repair gate from live receiver evidence.
- Validator stance: accept the historical blocked WI-CX0050/WI-CX0051 state while allowing WI-CX0052 to mark worktree isolation proven from repo-visible evidence.

## Commands

- `git fetch origin`
- `git rev-parse --show-toplevel`
- `git status --short --branch`
- `git rev-parse HEAD`
- `git rev-parse origin/main`
- `git worktree list --porcelain`
- `git branch --list "*cx0052*"`
- `git ls-remote --heads origin "*cx0052*"`
- `gh pr list --state open --search "WI-CX0052 OR cx0052 OR worktree isolation repair validation" --json number,title,headRefName,url,state`
- `npm.cmd run context:pack -- --wi WI-CX0052-test --intent "a2 worktree isolation repair validation" --risk R2 --append-ledger --actor codex`
- `git switch -c wi/cx0052-test-a2-worktree-isolation-repair-validation`
- `node --check scripts\validate-repo.mjs`
- `npm.cmd run validate`
- `git diff --check`

## Boundary

No release publication, deployment, package publication, OSS program submission, automation schedule change, automation prompt change, automation authority change, merge authority change, A2/A3 authority expansion, A3 publication behavior, production dependency addition, public API or external contract change, S2 execution, separate reviewer creation, or first Layer 2 scaffold generation occurred. No destructive filesystem or git operation occurred beyond stale empty/lock cleanup with live safety checks.