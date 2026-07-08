# Session Orchestration Control-Plane Audit

Status: accepted-audit.
WI: WI-CX0047-test.
Date: 2026-07-08.
Layer: Layer 1.

## Scope

Audit the gap between FDP_Codex session-boundary policy and actual Codex app control-plane behavior before any first Layer 2 target-project scaffold work.

This audit is not a release, deployment, package publication, OSS submission, automation authority change, S2 execution, separate reviewer creation, or Layer 2 scaffold generation.

## Evidence Snapshot

Parent `/goal` carrier thread:

- Thread id: `019f3d8b-76ae-7420-9337-d26582b51678`.
- Title: `안녕`.
- Cwd: `C:\dev\FDP_Codex`.
- Evidence source: `functions.get_goal` and `codex_app.list_threads` during the WI-CX0047 audit conversation.

Standalone/project automation:

- Automation id: `fdp-codex-a2-worktree-wi-runner`.
- Config path: `C:\Users\User\.codex\automations\fdp-codex-a2-worktree-wi-runner\automation.toml`.
- Kind: `cron`.
- Status: `ACTIVE`.
- Execution environment: `worktree`.
- Configured cwd list: `C:\dev\FDP_Codex`.

Observed runner threads:

| Thread id | Title signal | Observed result |
| --- | --- | --- |
| `019f40a6-8574-79a2-b322-ee6e42a2fcc5` | `FDP_Codex A2 Worktree ...` | Duplicate-stop on an existing local `WI-CX0033` branch and uncommitted evidence. |
| `019f40dd-7758-7b23-b837-f3199c99b7ee` | `FDP_Codex A2 Worktree ...` | Duplicate-stop on an existing local `WI-CX0040` branch and uncommitted evidence. |
| `019f4115-caf6-7061-a1b8-9c08062c939c` | `FDP_Codex A2 Worktree ...` | Duplicate-stop on an existing local `WI-CX0046` branch and uncommitted evidence. |

Intended model:

- The parent thread supervises.
- Handoff and context pack metadata boot a fresh A2 runner.
- The runner performs independent WI work from repository SSOT.

Observed model:

- The parent `안녕` thread continued context-hygiene-sensitive implementation, PR, and merge work.
- A2 runner threads started, but duplicate-stopped on existing local work instead of becoming effective handoff receivers.
- The control-plane validation gap allowed FDP_Codex to overstate fresh-session safety from repository documents and local validators alone.

## System Gap

The repository validator did not prove:

- parent thread id, title, or goal carrier identity;
- whether auto-compact happened in the parent thread;
- runner receiver status;
- worktree isolation;
- whether the runner produced a branch, PR, output record, or only duplicate-stop evidence;
- whether the parent thread continued implementation after the supposed handoff boundary.

Earlier checks also queried too narrowly by `WI-CX0035` or automation-id terms, which missed visible `FDP_Codex A2 Worktree ...` runner threads. This made the failure detectable by user inspection before the system caught it.

## Known Issues

| KI | Severity | Owner | Trigger | Repayment condition | Defer reason |
| --- | --- | --- | --- | --- | --- |
| KI-CX-AUTO-001 | High | CODEX | Fresh-session boundary was assumed while `/goal` remained on the parent `안녕` thread. | WI-CX0048-test Runtime Snapshot Validator records parent thread, goal thread, automation, runner ids, and receiver result evidence. | Requires Codex app control-plane evidence mapping. |
| KI-CX-AUTO-002 | High | CODEX | A2 runner threads duplicate-stopped and did not become effective handoff receivers. | WI-CX0049-docs A2 Handoff Receiver Contract defines receiver success, duplicate-stop handling, and reporting. | Requires contract refinement before authority expansion. |
| KI-CX-AUTO-003 | Medium | CODEX | Runner discovery used too-narrow queries. | WI-CX0048-test validates broad runner discovery by automation id, title prefix, and output evidence. | Lower immediate risk once High KIs block expansion. |
| KI-CX-AUTO-004 | High | CODEX | Worktree isolation was not proven; runner threads observed existing local incomplete WI branches. | WI-CX0050-test Worktree Isolation Verification proves or blocks the runner isolation model. | Requires runtime snapshot plus worktree evidence. |
| KI-CX-AUTO-005 | Medium | CODEX | Automation memory outside the repository was not linked into repo SSOT or validation. | WI-CX0048-test records the runtime evidence source and repo-visible snapshot expectations. | Lower immediate risk once control-plane evidence is required. |

## Reprioritized Work

1. WI-CX0048-test Runtime Snapshot Validator.
2. WI-CX0049-docs A2 Handoff Receiver Contract.
3. WI-CX0050-test Worktree Isolation Verification.
4. WI-CX0038-docs Layer 2 Scope Code Accepted Decision after the user chooses the scope code and after control-plane confidence checks.

## Boundary

This audit does not change automation schedule, automation prompt, merge authority, A2/A3 authority, release behavior, deployment behavior, package publication, OSS program submission, public API, external contract behavior, production dependencies, destructive filesystem or git behavior, S2 execution, separate reviewer creation, or first Layer 2 target-project scaffold generation.