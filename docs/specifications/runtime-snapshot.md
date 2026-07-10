# Runtime Snapshot

Status: draft.
Layer: Layer 1.

## Purpose

The runtime snapshot records point-in-time Codex app control-plane evidence that cannot be proven by repository documents alone.

It is metadata-only evidence. It must not store conversation bodies, chunk bodies, prompt dumps, secrets, or long substituted SSOT text.

The snapshot does not silently become current forever. When later repo-visible evidence changes a captured status, the snapshot must be marked `historical-superseded`, name the superseding WI and record, and preserve its original observations. `.flowset/state.json` owns the current operating status.

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

A superseded snapshot must also include:

- `snapshot_status: historical-superseded`.
- `superseded_by.wi_id`, `superseded_by.record`, and `superseded_by.result`.
- Original captured observations unchanged as historical evidence.

## Validation Rules

`npm run validate` must fail when the snapshot is missing, malformed, or presented as current after later evidence supersedes it.

The validator must check at least:

- The parent thread id equals the active goal thread id recorded for the audit cycle.
- The parent thread title is recorded as `안녕`.
- The goal status is recorded and the blocked `/goal` state is not mistaken for a fresh-session boundary.
- The A2 automation id is `fdp-codex-a2-worktree-wi-runner` and the execution environment is `worktree`.
- Runner discovery records both broad title search and automation-id search results, including the observed query gap.
- The latest runner thread is recorded and at least one runner result is `duplicate-stop`.
- No runner result claims effective handoff receiver success while `handoff_receiver_assessment.status` is `not_proven`.
- Receiver result labels follow `docs/specifications/a2-handoff-receiver-contract.md`.
- The WI-CX0048 capture preserves its original `not_proven` receiver and isolation observations.
- Later proof must mark that capture `historical-superseded`, keep the original observations intact, and place the current status plus evidence reference in `.flowset/state.json`.
- Generalized A2/A3 expansion remains blocked by its own review and approval debt even after worktree isolation is proven.
- First Layer 2 target-project scaffold generation remains blocked until its separate scope-code and generation gates are repaid.

## Boundary

This specification does not create or update Codex app automations, create user-owned threads, execute S2 review, change A2/A3 authority, publish a release, deploy, publish a package, submit to an OSS program, add production dependencies, stabilize a public API or external contract, perform destructive filesystem or git operations, or generate a Layer 2 target-project scaffold.