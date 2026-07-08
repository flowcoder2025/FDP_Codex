# Handoff

Status: live.

## Current State

FDP_Codex autonomous bootstrap foundation is complete up to the decision boundary.

Current WI: WI-CX0013-docs Decision Packet and Approval Envelope.

WI-CX0013-docs status: validated.

Active local branch: `wi/cx0007-docs-github-workflow-governance`.

Branch note: bootstrap stack exception. The repository has no local commit yet, so current validated bootstrap WIs are still carried in one working tree until the first remote reconciliation path is approved.

## Completed WIs

- WI-CX0001-docs: Context Hygiene Scaffold. Evidence: `docs/records/validation-wi-0001.md`.
- WI-CX0002-docs: Naming and Commit Policy. Evidence: `docs/records/validation-wi-cx0002-docs.md`.
- WI-CX0003-docs: Autonomy and Approval Envelope Policy. Evidence: `docs/records/validation-wi-cx0003-docs.md`.
- WI-CX0004-docs: Operating Foundation Synthesis and Fix Plan. Evidence: `docs/records/validation-wi-cx0004-docs.md`.
- WI-CX0005-docs: Triage Strategy Policy. Evidence: `docs/records/validation-wi-cx0005-docs.md`.
- WI-CX0006-docs: Repository and License Binding. Evidence: `docs/records/validation-wi-cx0006-docs.md`.
- WI-CX0007-docs: GitHub Workflow and Issue Governance. Evidence: `docs/records/validation-wi-cx0007-docs.md`.
- WI-CX0008-ci: Manifest Validator. Evidence: `docs/records/validation-wi-cx0008-ci.md`.
- WI-CX0009-feat: Context Pack Builder Contract. Evidence: `docs/records/validation-wi-cx0009-feat.md`.
- WI-CX0010-ci: Handoff/Fix Plan Hygiene Gate. Evidence: `docs/records/validation-wi-cx0010-ci.md`.
- WI-CX0011-docs: Evaluation Strategy Matrix. Evidence: `docs/records/validation-wi-cx0011-docs.md`.
- WI-CX0012-docs: Bootstrap Reconciliation Plan. Evidence: `docs/records/validation-wi-cx0012-docs.md`.
- WI-CX0013-docs: Decision Packet and Approval Envelope. Evidence: `docs/records/validation-wi-cx0013-docs.md`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Decision packet: `docs/records/decision-packet-2026-07-08.md`.
- Bootstrap reconciliation: `docs/runbooks/bootstrap-reconciliation.md`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Core policies: `docs/policies/context-hygiene.md`, `docs/policies/git-workflow.md`, `docs/policies/github-issue-governance.md`, `docs/policies/evaluation-strategy.md`.

## Locked For This Scaffold

- Context bodies are ephemeral and ledger records metadata only.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Context pack builder output is metadata only and must not include chunk bodies.
- Validator enforces manifest, ledger, naming, GitHub governance, package scripts, hook contract, and flow-state hygiene.
- Layer 1 and Layer 2 are separated.
- Layer 1 WI ids use `WI-CXNNNN-category`.
- Branches use `wi/cxNNNN-category-short-slug`.
- GitHub Issues are the operational KI and external intake surface, not policy SSOT.
- External Issues and PRs do not authorize implementation without user instruction or an approved work envelope.
- R3, public release, destructive action, unapproved git publication, new production dependency, and context hygiene violation are hard stops.
- `.flowset/fix_plan.md` is a compact live backlog and must not become completed-history storage.
- Blind independent review and adversarial review triggers are defined in `docs/policies/evaluation-strategy.md`.
- Repository visibility: private during bootstrap.
- License: Apache-2.0.

## Not Yet Locked

- Bootstrap reconciliation execution and first commit shape.
- Git publication envelope for push and draft PR creation.
- First public release scope boundary.
- Default verification project profile.
- Hook implementation final form, chunk id scope, Layer 2 project code, release category, and KI id severity encoding.
- A2/A3 git and continuation scope.
- Branch deletion automation after squash merge.
- Blind review execution surface and adversarial checklist granularity.
- GitHub public-release issue and label policy finalization.
- Validator CI workflow approval.
- Strict YAML parser adoption.
- Context pack output persistence and ledger append behavior.
- Handoff maximum line count and machine-readable flow-state split.

## Git State

- Local repository initialized.
- Active branch is `wi/cx0007-docs-github-workflow-governance`.
- `origin` is `https://github.com/flowcoder2025/FDP_Codex.git`.
- Remote `main` exists and contains only the initial Apache-2.0 `LICENSE` commit by tree inspection.
- Local and remote `LICENSE` normalize to equivalent Apache-2.0 text.
- No local commit has been created yet.
- No reset, push, merge, tag, release, publication, remote label mutation, GitHub Actions workflow, or visibility change has been performed.

## Next Action

Follow `.flowset/fix_plan.md`.

Immediate next WI:

- WI-CX0014-chore Bootstrap Reconciliation Execution: blocked on user approval. Expected action is to choose clean temporary worktree or current-worktree reconciliation, then optionally allow local commit, push, and draft PR inside a bounded git envelope.

## Blocked Work

- Bootstrap reconciliation execution is blocked on user approval.
- OSS readiness is blocked on first public release scope boundary.
- Operating policy LOCK is blocked on unresolved Decision Needed items.
- Validator CI envelope is blocked on approval for remote CI behavior.

## New Session Procedure

1. Start rooted at `C:\dev\FDP_Codex`.
2. Read `AGENTS.md`, `docs/manifest.yaml`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Read `docs/records/decision-packet-2026-07-08.md` before any git publication work.
4. Build a fresh context pack from `docs/manifest.yaml`; do not reuse prior active context bodies.
5. Run `npm run context:pack` when selecting chunks mechanically.
6. Run `npm run validate` before declaring repository policy work complete.
7. Append metadata-only context ledger records for selected chunks.
8. Stop at hard stops listed in `docs/policies/autonomy-and-approval.md`.