# Handoff

Status: live.

## Current State

FDP_Codex bootstrap reconciliation has been executed and is in closeout.

Current WI: WI-CX0014-chore Bootstrap Reconciliation Execution.

WI-CX0014-chore status: validated.

Repository is public. Release publication, deployment, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0013-docs: bootstrap foundation. Evidence: `docs/records/validation-wi-*.md`.
- WI-CX0014-chore: Bootstrap Reconciliation Execution. Evidence: `docs/records/validation-wi-cx0014-chore.md`, PR #1, and merge commit `2068cb8116979f2efecf87d2809c131ee6ea0f7f`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Bootstrap publication decision: `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`.

## Locked For This Scaffold

- Context bodies are ephemeral and ledger records metadata only.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Validator enforces manifest, ledger, naming, GitHub governance, package scripts, hook contract, and flow-state hygiene.
- GitHub Issues are the operational KI and external intake surface, not policy SSOT.
- Release publication, deployment, and OSS program submission remain outside the approval envelope.

## Git State

- PR #1 merged into `main`.
- Merge commit: `2068cb8116979f2efecf87d2809c131ee6ea0f7f`.
- Bootstrap PR branch was deleted from origin.
- Repository visibility verified as public.
- Remote labels were applied from `.github/labels.yml`.
- GitHub Actions validate workflow exists.
- A closeout branch updates main-branch validator behavior and final flow-state records.

## Next Action

Follow `.flowset/fix_plan.md`.

Immediate next WI:

- WI-CX0015-docs OSS Readiness Baseline: blocked on first public release scope boundary.

## Blocked Work

- Release publication is not approved.
- Deployment is not approved.
- OSS program submission is not approved.
- OSS readiness needs a first public release scope decision.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Run `npm run validate` before declaring repository policy work complete.
4. Stop at release, deployment, or OSS submission boundaries unless explicitly approved.