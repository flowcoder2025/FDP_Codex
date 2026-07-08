# Runtime Snapshot

Status: draft.
Layer: Layer 1.

## Purpose

The runtime snapshot records Codex app control-plane evidence that cannot be proven by repository documents alone.

It is a metadata-only operating snapshot. It must not store conversation bodies, chunk bodies, prompt dumps, secrets, or long substituted SSOT text.

## File

Layer 1 runtime snapshot path: `.flowset/runtime-snapshot.json`.

The snapshot is repo-visible evidence for local validation. It is not a replacement for `docs/manifest.yaml`, `.flowset/state.json`, `.flowset/handoff.md`, or validation records.

## Required Fields

A valid Layer 1 runtime snapshot must include:

- `schema_version: 1`.
- `kind: fdp-codex-runtime-snapshot`.
- `layer: layer1`.
- `captured_at`, `captured_by`, and `wi_id`.
- `repo.path`, `repo.branch`, and `repo.base_main_commit`.
- `capture_sources` listing the control-plane and file evidence sources used.
- `parent_thread.id`, `parent_thread.title`, `parent_thread.cwd`, `parent_thread.status`, and `parent_thread.role`.
- `goal.thread_id`, `goal.status`, and summary evidence tying the goal to the parent thread.
- `automation.id`, `automation.status`, `automation.kind`, `automation.execution_environment`, `automation.cwds`, `automation.config_path`, and `automation.memory_path`.
- `runner_discovery.title_query`, `runner_discovery.title_query_count`, `runner_discovery.automation_id_query`, `runner_discovery.automation_id_query_count`, `runner_discovery.runner_thread_ids`, and `runner_discovery.latest_runner_thread_id`.
- `runner_results[]` entries with `thread_id`, `title`, `thread_status`, `cwd`, `receiver_result`, `receiver_evidence`, and `repository_changes`.
- `handoff_receiver_assessment.status`, `reason`, `blocks`, and `repayment_wis`.
- `worktree_isolation.status`, `reason`, and `repayment_wi`.
- `hard_stops_preserved`.

## Validation Rules

`npm run validate` must fail when the snapshot is missing, malformed, or inconsistent with the current control-plane debt state.

The validator must check at least:

- The parent thread id equals the active goal thread id recorded for the audit cycle.
- The parent thread title is recorded as `안녕`.
- The goal status is recorded and the blocked `/goal` state is not mistaken for a fresh-session boundary.
- The A2 automation id is `fdp-codex-a2-worktree-wi-runner` and the execution environment is `worktree`.
- Runner discovery records both broad title search and automation-id search results, including the observed query gap.
- The latest runner thread is recorded and at least one runner result is `duplicate-stop`.
- No runner result claims effective handoff receiver success while `handoff_receiver_assessment.status` is `not_proven`.
- Receiver result labels follow `docs/specifications/a2-handoff-receiver-contract.md`.
- Worktree isolation remains `not_proven` until WI-CX0050-test repays it.
- Generalized A2/A3 expansion and first Layer 2 target-project scaffold confidence remain blocked while receiver and isolation statuses are not proven.

## Boundary

This specification does not create or update Codex app automations, create user-owned threads, execute S2 review, change A2/A3 authority, publish a release, deploy, publish a package, submit to an OSS program, add production dependencies, stabilize a public API or external contract, perform destructive filesystem or git operations, or generate a Layer 2 target-project scaffold.