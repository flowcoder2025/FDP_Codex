# A2 Handoff Receiver Contract

Status: draft.
Layer: Layer 1.

## Purpose

Define when a Codex app A2 runner counts as an effective handoff receiver.

This contract exists because a visible runner thread, green repository validators, or an auto-compact boundary does not prove that context-hygiene-sensitive work moved to a fresh receiver. Receiver success requires repo-visible control-plane evidence.

## Terms

Parent thread:

- The thread carrying the user goal, discussion, or current supervisory decision surface.
- The parent may finish an active WI, poll checks, merge an approved PR, or answer the user.
- The parent must not claim a fresh-session handoff success without receiver evidence.

Receiver:

- A standalone or project automation run intended to start from repository SSOT and continue the next WI.
- A receiver must boot from `AGENTS.md`, `docs/manifest.yaml`, `.flowset/handoff.md`, `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/state.json`.
- A receiver must rebuild its context pack from `docs/manifest.yaml`.
- A receiver must not rely on copied context bodies or prompt dumps.

Receiver record:

- Repo-visible metadata proving the receiver result.
- It may be recorded in `.flowset/runtime-snapshot.json`, a `docs/records/*` file, or both.
- It must not store conversation bodies, chunk bodies, prompt dumps, secrets, or long substituted SSOT text.

## Receiver Result Taxonomy

`success`:

- The receiver started from the expected repository or dedicated worktree.
- The receiver identified the expected WI from repo SSOT.
- The receiver produced repo-visible output: a branch, commit, PR, validation record, decision record, or explicit handback record.
- The receiver recorded parent thread id, runner thread id, automation id, cwd or worktree path, base commit, selected context pack id, result, changed paths or `none`, validation summary, and output pointers.
- The receiver did not silently continue from stale parent context.
- The parent thread did not continue implementing the same independent WI after the receiver took ownership.

`duplicate-stop`:

- The receiver detected an existing active WI branch, uncommitted WI evidence, already-produced output, or conflicting local state and stopped without making repository changes.
- This is a valid safety stop, not a successful handoff.
- The result must preserve repo-visible evidence and keep the handoff receiver assessment `not_proven`.
- Repeated duplicate-stop evidence triggers control-plane debt repayment, normally through WI-CX0050-test Worktree Isolation Verification or a later repair WI.

`blocked-handback`:

- The receiver reached a user decision, hard stop, missing reviewer, missing external evidence, or policy gate before implementation.
- The receiver must record the blocker, owner gate, repayment trigger, and whether the parent thread should resume discussion.
- This is not handoff success unless the requested receiver output was only a handback record.

`failed`:

- The receiver attempted work but hit failed validation, contradictory repo state, invalid manifest state, or an unexpected tool/runtime error.
- The receiver must record failure evidence and any KI or repayment WI created.
- The parent may resume only after the failure is visible in repo state or a handback message.

`stale-or-unknown`:

- No observable runner output exists, the thread cannot be inspected, required control-plane metadata is missing, or the runner result cannot be tied to the expected WI.
- This must be treated as not proven.

## Required Receiver Evidence

A receiver result must include:

- `wi_id`.
- `expected_next_wi`.
- `result` using the taxonomy in this contract.
- `parent_thread_id` and parent title when visible.
- `runner_thread_id` and runner title when visible.
- `automation_id` when automation is involved.
- `cwd` or dedicated worktree path.
- `base_commit` and current branch.
- `context_pack_id`.
- `repository_changes`: branch, commit, PR, record paths, or `none`.
- `validation_summary`: commands run, skipped/deferred validation, or blocker reason.
- `handback_required`: `true` or `false`.
- `hard_stops_preserved`.

## Parent Thread Handback Rules

When the receiver result is `success`, the parent may rely on the receiver output only through repo-visible artifacts or a verified receiver record.

When the receiver result is `duplicate-stop`, `blocked-handback`, `failed`, or `stale-or-unknown`, the parent must not treat the handoff as a fresh-session success. It must either:

- continue the already-active WI only when that is explicitly still in the parent scope,
- hand the blocker back to the user,
- record KI debt and schedule repayment,
- or start the next allowed repair WI inside the existing approval envelope.

The parent must not start another independent WI merely to avoid a handback point.

## Validation Rules

`npm run validate` must fail when FDP_Codex claims A2 handoff receiver success without the evidence required by this contract.

The validator must ensure:

- `docs/specifications/a2-handoff-receiver-contract.md` is registered in `docs/manifest.yaml`.
- The runtime snapshot remains `not_proven` while observed runners only have `duplicate-stop` results.
- WI-CX0049-docs does not change automation schedule, automation prompt, merge authority, A2/A3 authority, release, deployment, package publication, OSS submission, production dependencies, public API or external contract behavior, S2 execution, separate reviewer creation, destructive filesystem or git behavior, or first Layer 2 target-project scaffold generation.
- The live flow advances to WI-CX0050-test Worktree Isolation Verification after this contract is installed.

## Boundary

This contract does not create or update Codex app automations, create user-owned threads, execute S2 review, change A2/A3 authority, publish a release, deploy, publish a package, submit to an OSS program, add production dependencies, stabilize a public API or external contract, perform destructive filesystem or git operations, or generate a Layer 2 target-project scaffold.
