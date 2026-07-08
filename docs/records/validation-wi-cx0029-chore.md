# Validation Record: WI-CX0029-chore Automation Run Surface Installation

Status: evidence.

Date: 2026-07-08.

WI: WI-CX0029-chore.

## Scope

Install and record a supported Codex app standalone worktree automation surface for fresh-run FDP_Codex continuation.

## Tool Surface Evidence

- `tool_search` for automation tools exposed `codex_app.automation_update`.
- Existing automation scan found no prior FDP_Codex automation file before creation.
- Created Codex app automation id: `fdp-codex-a2-worktree-wi-runner`.
- Automation kind: cron.
- Execution environment: worktree.
- Destination: worktree.
- Status after creation: active.
- Config evidence path on this machine: `C:\Users\User\.codex\automations\fdp-codex-a2-worktree-wi-runner\automation.toml`.

## Safety Controls

- The automation prompt gates itself until WI-CX0029-chore is merged and accepted on `origin/main`.
- The automation is not a same-thread heartbeat and not a new user-owned local thread.
- The automation must boot from `AGENTS.md`, `docs/manifest.yaml`, `.flowset/handoff.md`, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
- The automation must check branches and open PRs for the selected WI before making changes.
- The automation must stop without starting duplicate work when a branch, PR, or incomplete run already covers the selected WI.
- The automation must rebuild context with `npm run context:pack` and append metadata-only ledger entries.
- The automation may work on exactly one Current Priority WI per run.
- The automation must stop for R3, context hygiene ambiguity, license changes, release publication, deployment, package publication, OSS program submission, A3 publication behavior, destructive filesystem or git operations, public API or external contract changes, new production dependencies, security, secrets, data loss, or unresolved Decision Needed items.

## Commands

- `tool_search`: automation tool discovery.
- `Get-ChildItem "$env:USERPROFILE\.codex\automations" -Recurse -Filter automation.toml`
- `npm run context:pack -- --wi WI-CX0029-chore --intent automation-run-surface-installation --risk R2 --changed .flowset/current-wi.md --changed .flowset/fix_plan.md --changed .flowset/handoff.md --changed docs/policies/autonomy-and-approval.md --changed docs/policies/context-hygiene.md --changed docs/decisions/2026-07-08-session-boundary-automation-contract.md --changed docs/manifest.yaml --changed scripts/validate-repo.mjs --append-ledger --actor codex`
- `codex_app.automation_update` create for `fdp-codex-a2-worktree-wi-runner`.
- `codex_app.automation_update` update for duplicate branch/PR/incomplete-run gate.
- `Get-Content "$env:USERPROFILE\.codex\automations\fdp-codex-a2-worktree-wi-runner\automation.toml"`

## S1 Adversarial Review

- Duplicate-run risk: an hourly worktree runner could start duplicate WI branches or PRs. Mitigation: prompt now checks local and remote branches plus open PRs before making changes and stops when an existing branch, PR, or incomplete run covers the selected WI.
- Context carryover risk: heartbeat and auto-compact do not create a clean boundary. Mitigation: the installed surface is standalone worktree automation and must rebuild context from manifest metadata.
- Remote mutation risk: the runner can push and merge only inside the active approval envelope and after required checks pass. Mitigation: hard stops remain explicit in the prompt and decision.
- False-green risk: CI cannot read the local Codex app automation file. Mitigation: validator checks repo decision and record invariants, while this record preserves local tool evidence.
- Blind-review gap: S2 was not executed in this same-thread cycle. E2/S2 remains debt before generalized A2/A3 expansion or release-candidate readiness.

## Evaluation

- PSC: P2.
- WTC: AUTO.
- Risk: R2.
- ESC: E1+E2+E3+E5+E6.
- S1 adversarial review required before merge.
- E2/S2 blind review is tracked as relevant debt for generalized A2/A3 expansion and release-candidate readiness unless a separate reviewer is used before this PR merges.

## Boundary

No release publication, deployment, package publication, OSS program submission, license change, production dependency addition, A3 publication behavior, new user-owned local thread creation, public API or external contract change, or destructive local realignment occurred.

## Validation Results

- Final context pack: `ctx-wi-cx0029-chore-20260708064401`.
- Final context ledger append count: 72 metadata entries.
- Final context pack body check: `contains_chunk_bodies=False`.
- `npm run typecheck`: passed.
- `npm run validate`: passed with `manifest_chunk_count=81`, `ledger_line_count=1094`, `flow_current_priority=WI-CX0030-test`, and no warnings or errors.
- `npm run ci:check`: passed.
- `git diff --check`: passed; Git reported line-ending normalization warnings only.

## Residual Risk

- S2 blind independent review was not executed in this same-thread cycle because no separate reviewer was used. The debt is recorded in `.flowset/fix_plan.md` and must be repaid before generalized A2/A3 expansion, release-candidate readiness, public release, or OSS submission.
- The deterministic validator verifies repository evidence for the automation contract. It does not prove the external Codex app scheduler will run successfully; WI-CX0030-test is scheduled next as the post-merge smoke.
