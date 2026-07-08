# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0030-test Automation Runner Post-Merge Smoke.

WI-CX0030-test status: validated.

Installed Codex app automation: `fdp-codex-a2-worktree-wi-runner`.

The runner is a worktree cron surface, not a heartbeat or hidden local thread. Post-merge smoke confirmed its startup gate, duplicate branch/PR gate, hard stops, repository root, and absence of a local setup script.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0013-docs: bootstrap foundation. Evidence: `docs/records/validation-wi-*.md`.
- WI-CX0014-chore through WI-CX0021-feat: bootstrap reconciliation, OSS baseline, CI follow-up, evaluation surface, context pack command, and selection table. Evidence: matching `docs/records/validation-wi-*.md` files.
- WI-CX0022-docs through WI-CX0027-docs: decision queue, KI identity, handoff size, autonomy defaults, collaboration response, and session boundary contracts. Evidence: matching `docs/decisions/` and `docs/records/validation-wi-*.md` files.
- WI-CX0016-docs: Operating Policy LOCK v0. Evidence: `docs/decisions/2026-07-08-operating-policy-lock.md` and `docs/records/validation-wi-cx0016-docs.md`.
- WI-CX0018-chore: Local Workspace Realignment. Evidence: `docs/records/validation-wi-cx0018-chore.md`; backup `C:\tmp\fdp-codex-dev-backup-20260708-140739`; aligned HEAD `aeac5d0dc3406aeb8d441bc7e5b9bd1061591760`.
- WI-CX0028-chore: Tooling TypeScript Baseline. Evidence: `docs/decisions/2026-07-08-tooling-typescript-baseline.md`, `docs/records/validation-wi-cx0028-chore.md`, `tsconfig.json`, and `package-lock.json`.
- WI-CX0029-chore: Automation Run Surface Installation. Evidence: `docs/decisions/2026-07-08-automation-run-surface-installation.md`, `docs/records/validation-wi-cx0029-chore.md`, and Codex app automation id `fdp-codex-a2-worktree-wi-runner`.
- WI-CX0030-test: Automation Runner Post-Merge Smoke. Evidence: `docs/records/validation-wi-cx0030-test.md`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Automation runner contract: `docs/decisions/2026-07-08-automation-run-surface-installation.md`.

## Locked For This Scaffold

- Context bodies are ephemeral and ledger records metadata only.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Auto-compact is same-thread continuation, not a fresh session or context hygiene reset.
- The installed runner is bounded A2 worktree automation and must boot from repository SSOT.
- E2/S2 blind review for the runner remains debt before generalized A2/A3 expansion or release-candidate readiness.
- Release publication, deployment, package publication, and OSS submission remain hard stops.

## Git State

- Remote `main` is the repository standard after completed PR merges.
- Historical: work after WI-CX0014 continued in `C:\tmp\fdp-codex-bootstrap-reconciliation` while `C:\dev\FDP_Codex` had no local commits.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`; pre-realignment backup is `C:\tmp\fdp-codex-dev-backup-20260708-140739`.
- Active WI branch for this cycle: `wi/cx0030-test-automation-runner-post-merge-smoke`.

## Next Action

Follow `.flowset/fix_plan.md`.

Immediate next WI:

- WI-CX0031-chore Context Ledger Dedupe Policy.

## Blocked Work

- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- Generalized A2/A3 expansion is blocked on S2 blind review debt and a future decision.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Build a fresh context pack for the next WI.
4. Run `npm run validate` before declaring repository policy work complete.
5. Stop at release, deployment, package publication, OSS submission, or destructive local realignment boundaries unless explicitly approved.
