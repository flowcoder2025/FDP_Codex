# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0019-docs Evaluation Surface Baseline.

WI-CX0019-docs status: validated.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0013-docs: bootstrap foundation. Evidence: `docs/records/validation-wi-*.md`.
- WI-CX0014-chore: Bootstrap Reconciliation Execution. Evidence: `docs/records/validation-wi-cx0014-chore.md`, PR #1, PR #2, and merged `main` validation.
- WI-CX0015-docs: OSS Readiness Baseline. Evidence: `docs/decisions/2026-07-08-public-readiness-boundary.md`, `docs/records/validation-wi-cx0015-docs.md`, and PR #3.
- WI-CX0017-ci: Validator CI Follow-Up. Evidence: `docs/records/validation-wi-cx0017-ci.md` and PR #4.
- WI-CX0019-docs: Evaluation Surface Baseline. Evidence: `docs/decisions/2026-07-08-evaluation-surface-baseline.md` and `docs/records/validation-wi-cx0019-docs.md`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Public boundary: `docs/decisions/2026-07-08-public-readiness-boundary.md`.
- Evaluation surface boundary: `docs/decisions/2026-07-08-evaluation-surface-baseline.md`.

## Locked For This Scaffold

- Context bodies are ephemeral and ledger records metadata only.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Public status is `public bootstrap, pre-release`.
- E2 Blind Independent Review requires S2 Separate Blind Review.
- S1 Same-Thread Structured Review does not satisfy E2.
- H1 Human Maintainer Gate is mandatory before release, deployment, package publication, or OSS submission.
- Validate workflow covers Node 20 and Node 24.
- Release publication, deployment, and OSS program submission remain outside the approval envelope.

## Git State

- Remote `main` is the repository standard after PR #1 through PR #4.
- Work after WI-CX0014 continued in `C:\tmp\fdp-codex-bootstrap-reconciliation` because `C:\dev\FDP_Codex` still has no local commits.
- Do not treat `C:\dev\FDP_Codex` Git metadata as canonical until a dedicated realignment WI handles it.

## Next Action

Follow `.flowset/fix_plan.md`.

Immediate next WI:

- WI-CX0020-feat Context Pack Command Surface.

## Blocked Work

- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- `C:\dev\FDP_Codex` realignment may require destructive Git or filesystem approval.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Build a fresh context pack for the next WI.
4. Run `npm run validate` before declaring repository policy work complete.
5. Stop at release, deployment, package publication, OSS submission, or destructive local realignment boundaries unless explicitly approved.