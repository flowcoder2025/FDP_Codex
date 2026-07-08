# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0040-chore Tooling Strictness Probe.

WI-CX0040-chore status: validated.

Machine-readable flow-state snapshot is available at `.flowset/state.json` and is validator-checked against `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

Strictness probe: `npm run typecheck:strict-probe`; current measured debt is strict=582 diagnostics, noImplicitAny=531 diagnostics, strictNullChecks=47 diagnostics. It is non-gating and records type debt without enabling strict mode.

Layer 2 scope code decision handback is available at `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`.

Layer 2 chunk id scope is resolved as per-target-project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

Layer 2 project scope code remains user-gated. Recommended answer: `A, use <CODE>`.

No standalone A2 runner fresh-run output exists yet. The actual first fresh-run output review remains triggered work and must not be treated as complete until a new runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`.

Layer 2 scaffold generation remains blocked until the user chooses the Layer 2 project scope code rule and the accepted decision is recorded.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0021-feat: bootstrap foundation, reconciliation, OSS baseline, CI, evaluation, and context pack surfaces. Evidence: matching `docs/records/validation-wi-*.md` files.
- WI-CX0022-docs through WI-CX0027-docs: decision queue, KI identity, handoff size, autonomy defaults, collaboration response, and session boundary contracts. Evidence: matching `docs/decisions/` and `docs/records/validation-wi-*.md` files.
- WI-CX0016-docs: Operating Policy LOCK v0. Evidence: `docs/decisions/2026-07-08-operating-policy-lock.md` and `docs/records/validation-wi-cx0016-docs.md`.
- WI-CX0018-chore: Local Workspace Realignment. Evidence: `docs/records/validation-wi-cx0018-chore.md`; backup `C:\tmp\fdp-codex-dev-backup-20260708-140739`; aligned HEAD `aeac5d0dc3406aeb8d441bc7e5b9bd1061591760`.
- WI-CX0028-chore: Tooling TypeScript Baseline. Evidence: `docs/decisions/2026-07-08-tooling-typescript-baseline.md` and `docs/records/validation-wi-cx0028-chore.md`.
- WI-CX0029-chore: Automation Run Surface Installation. Runner: `fdp-codex-a2-worktree-wi-runner`. Evidence: `docs/decisions/2026-07-08-automation-run-surface-installation.md` and `docs/records/validation-wi-cx0029-chore.md`.
- WI-CX0030-test: Automation Runner Post-Merge Smoke. Evidence: `docs/records/validation-wi-cx0030-test.md`.
- WI-CX0031-chore: Context Ledger Dedupe Policy. Evidence: `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md` and `docs/records/validation-wi-cx0031-chore.md`.
- WI-CX0032-docs: Layer 2 Knowledge Scaffold Contract. Evidence: `docs/specifications/layer-2-knowledge-scaffold.md` and `docs/records/validation-wi-cx0032-docs.md`.
- WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate. Evidence: `docs/records/validation-wi-cx0033-test.md`; no standalone runner output was found, so actual output review moved to triggered work.
- WI-CX0034-docs: Layer 2 Scope Code Options Packet. Evidence: `docs/records/layer-2-scope-code-options-2026-07-08.md` and `docs/records/validation-wi-cx0034-docs.md`; final scope code choice remains user-gated.
- WI-CX0036-docs: Chunk Id Scope Policy. Evidence: `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md` and `docs/records/validation-wi-cx0036-docs.md`; per-target-project chunk id scope is accepted.
- WI-CX0037-docs: Layer 2 Scope Code Decision Handback. Evidence: `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md` and `docs/records/validation-wi-cx0037-docs.md`; final scope code choice remains user-gated.
- WI-CX0039-docs: Flow State Readable Snapshot. Evidence: `.flowset/state.json`, `docs/decisions/2026-07-08-flow-state-readable-snapshot.md`, and `docs/records/validation-wi-cx0039-docs.md`.
- WI-CX0040-chore: Tooling Strictness Probe. Evidence: `scripts/report-type-strictness.mjs`, `docs/decisions/2026-07-08-tooling-strictness-probe.md`, and `docs/records/validation-wi-cx0040-chore.md`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Machine-readable flow snapshot: `.flowset/state.json`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Strictness probe: `scripts/report-type-strictness.mjs` via `npm run typecheck:strict-probe`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Layer 2 scaffold contract: `docs/specifications/layer-2-knowledge-scaffold.md`.
- Layer 2 scope code options packet: `docs/records/layer-2-scope-code-options-2026-07-08.md`.
- Layer 2 scope code handback: `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`.
- Layer 2 chunk id scope decision: `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

## Locked For This Scaffold

- Context bodies are ephemeral and ledger records metadata only.
- `.flowset/context-ledger.jsonl` is append-only audit evidence.
- `.flowset/state.json` is a compact operating-state snapshot and must not store context bodies.
- Ledger dedupe must be a derived view/report and must not rewrite, delete, compact, or replace the source ledger.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Layer 2 target-project facts, WIs, KIs, handoffs, and ledgers remain separate from Layer 1 facts unless explicitly imported by Layer 1 decision.
- Layer 2 target chunk ids are scoped per target project; cross-manifest references must be qualified.
- First Layer 2 target-project scaffold generation is blocked on the scope code decision.
- The installed runner is bounded A2 worktree automation and must boot from repository SSOT.
- Actual first fresh-run output review remains triggered by future standalone A2 runner output.
- E2/S2 blind review for the runner remains debt before generalized A2/A3 expansion or release-candidate readiness.
- Strict TypeScript source conversion remains DQ-DEBT; WI-CX0040 installed measurement only and did not enable strict mode.
- Release publication, deployment, package publication, and OSS submission remain hard stops.

## Git State

- Remote `main` is the repository standard after completed PR merges.
- Historical: work after WI-CX0014 continued in `C:\tmp\fdp-codex-bootstrap-reconciliation` while `C:\dev\FDP_Codex` had no local commits.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`; pre-realignment backup is `C:\tmp\fdp-codex-dev-backup-20260708-140739`.
- Active WI branch for this cycle: `wi/cx0040-chore-tooling-strictness-probe`.

## Next Action

Ask the user to choose the Layer 2 project scope code rule using `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`.

Recommended answer shape:

- `A, use <CODE>`.

## Blocked Work

- First Layer 2 target-project scaffold generation is blocked on the Layer 2 project scope code rule.
- WI-CX0038-docs Layer 2 Scope Code Accepted Decision is blocked until the user chooses the scope code rule.
- WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked until a standalone A2 runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`.
- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- Generalized A2/A3 expansion is blocked on S2 blind review debt and a future decision.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, `.flowset/state.json`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Build a fresh context pack for the next WI.
4. Run `npm run validate` before declaring repository policy work complete.
5. Stop at Layer 2 scaffold generation, release, deployment, package publication, OSS submission, or destructive local realignment boundaries unless explicitly approved.
