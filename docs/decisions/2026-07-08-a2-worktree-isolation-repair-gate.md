# Decision: A2 Worktree Isolation Repair Gate

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0051-test.

## Context

WI-CX0050-test verified that A2 worktree isolation is blocked, not proven. The observed runner started in the canonical repository path `C:\dev\FDP_Codex`, and branch creation required `.git` write escalation after sandboxed branch creation failed.

The repair must be proven before FDP_Codex claims fresh A2 worktree confidence, first Layer 2 target-project scaffold confidence, or generalized A2/A3 expansion.

## Decision

Adopt a minimal repair gate for A2 worktree isolation.

Worktree isolation may be marked proven only when a later receiver run records all of this evidence:

- runner `cwd` is not `C:\dev\FDP_Codex`;
- `git rev-parse --show-toplevel` resolves to the runner `cwd`;
- the runner path is a dedicated A2 worktree path for the run or selected WI;
- the canonical repository path remains on its pre-run branch with no new WI changes from the receiver;
- `git status --short --branch` is clean before the receiver creates its WI branch;
- origin/main contains the WI-CX0029 automation installation decision and validation record before the receiver starts work;
- local and remote branch plus open PR checks show no existing branch or PR for the selected WI before work starts;
- context is rebuilt from `docs/manifest.yaml` in the receiver worktree with a metadata-only context-ledger append;
- the receiver records its branch, base commit, context pack id, changed paths, validation summary, and preserved hard stops in repo-visible evidence;
- `.flowset/runtime-snapshot.json` or a validation record explicitly marks worktree isolation as `proven` only after the evidence above is present.

Until that evidence exists, FDP_Codex must keep `worktree_isolation.status` as `not_proven`, keep first Layer 2 target-project scaffold confidence blocked, and keep generalized A2/A3 expansion blocked.

## Consequences

The next action is not another autonomous implementation WI. It is a user or control-plane repair decision for the Codex app worktree execution surface, followed by a future validation WI that proves the gate from repo-visible evidence.

This gate permits a future repair to use the Codex app or control-plane configuration surface, but this WI does not change automation cadence, automation prompt, automation authority, merge authority, or A2/A3 authority.

## Boundary

This decision does not create or update Codex app automations, change automation schedule or prompt, change merge authority, change A2/A3 authority, publish a release, deploy, publish a package, submit to an OSS program, add a production dependency, change a public API or external contract, execute S2 review, create a separate reviewer, perform destructive filesystem or git operations, or generate a Layer 2 target-project scaffold.
