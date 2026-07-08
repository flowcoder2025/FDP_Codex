# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0049-docs A2 Handoff Receiver Contract.

WI-CX0049-docs status: validated.

Machine-readable flow-state snapshot is available at `.flowset/state.json` and is validator-checked against `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

Machine-readable flow snapshot: `.flowset/state.json`. `.flowset/state.json` is a compact operating-state snapshot and not a context body store.

Runtime snapshot: `.flowset/runtime-snapshot.json`. It records parent thread `019f3d8b-76ae-7420-9337-d26582b51678`, goal status `blocked`, automation `fdp-codex-a2-worktree-wi-runner`, runner discovery, duplicate-stop receiver results, and not-proven worktree isolation.

Strictness probe: `npm run typecheck:strict-probe`; current measured debt is strict=582 diagnostics, noImplicitAny=531 diagnostics, strictNullChecks=47 diagnostics. It is non-gating and records type debt without enabling strict mode.

Session orchestration audit is accepted at `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`. It records that the parent `안녕` thread continued context-hygiene-sensitive work while A2 runner threads duplicate-stopped instead of producing effective handoff receiver output.

Runtime snapshot validator is accepted at `docs/specifications/runtime-snapshot.md`, `.flowset/runtime-snapshot.json`, and `docs/records/validation-wi-cx0048-test.md`. A2 handoff receiver contract is accepted at `docs/specifications/a2-handoff-receiver-contract.md` and `docs/records/validation-wi-cx0049-docs.md`.

Next priority is WI-CX0050-test Worktree Isolation Verification. It must prove or block the A2 worktree isolation model before first Layer 2 target-project scaffold confidence claims.

Layer 2 scope code decision handback is available at `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`. Recommended answer: `A, use <CODE>`.

Layer 2 chunk id scope is resolved as per-target-project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

Layer 2 project scope code remains user-gated. First Layer 2 target-project scaffold generation is blocked on the Layer 2 project scope code rule. Layer 2 scaffold generation remains blocked until the user chooses.

No standalone A2 runner fresh-run output exists yet that can count as effective handoff receiver output. The actual first fresh-run output review remains triggered work and must not be treated as complete until a new runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`.

Automation runner S2 review packet is available at `docs/records/automation-runner-s2-review-packet-2026-07-08.md`. It prepares S2 but does not satisfy E2 by itself.

Post-bootstrap automation cadence handback is available at `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`. It prepares a user decision and does not change automation settings or authority.

Portfolio guardrail validator baseline is accepted at `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md`. Current and future active WIs must record PSC, WTC, Risk, and ESC with E5 included.

Autonomous work exhaustion stop gate is accepted at `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`. No further independent autonomous WI should start unless a user decision, external trigger, reviewer surface, concrete defect/KI, or recorded repayment trigger appears. The runtime snapshot keeps the control-plane KI repayment path active.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0021-feat: bootstrap foundation, reconciliation, OSS baseline, CI, evaluation, and context pack surfaces. Evidence: matching `docs/records/validation-wi-*.md` files.
- WI-CX0022-docs through WI-CX0027-docs: decision queue, KI identity, handoff size, autonomy defaults, collaboration response, and session boundary contracts. Evidence: matching `docs/decisions/` and `docs/records/validation-wi-*.md` files.
- WI-CX0016-docs: Operating Policy LOCK v0. Evidence: `docs/decisions/2026-07-08-operating-policy-lock.md` and `docs/records/validation-wi-cx0016-docs.md`.
- WI-CX0018-chore: Local Workspace Realignment. Evidence: `docs/records/validation-wi-cx0018-chore.md`; backup `C:\tmp\fdp-codex-dev-backup-20260708-140739`; aligned HEAD `aeac5d0dc3406aeb8d441bc7e5b9bd1061591760`.
- WI-CX0028-chore through WI-CX0046-test: TypeScript baseline, A2 runner installation, runner smoke/evidence gates, context ledger, Layer 2 knowledge and decision packets, flow snapshot, strictness probe, S2 packet, cadence handback, portfolio guardrail, and autonomous exhaustion stop gate. Evidence: matching `docs/decisions/`, `docs/specifications/`, and `docs/records/validation-wi-*.md` files.
- WI-CX0029-chore: Automation Run Surface Installation. Evidence: `docs/decisions/2026-07-08-automation-run-surface-installation.md`, `docs/records/validation-wi-cx0029-chore.md`, and runner `fdp-codex-a2-worktree-wi-runner`.
- WI-CX0030-test: Automation Runner Post-Merge Smoke. Evidence: `docs/records/validation-wi-cx0030-test.md`.
- WI-CX0031-chore: Context Ledger Dedupe Policy. Source ledger remains append-only audit evidence. Evidence: `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md` and `docs/records/validation-wi-cx0031-chore.md`.
- WI-CX0032-docs: Layer 2 Knowledge Scaffold Contract. Evidence: `docs/specifications/layer-2-knowledge-scaffold.md` and `docs/records/validation-wi-cx0032-docs.md`; next evidence gate was WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate.
- WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate. Evidence: `docs/records/validation-wi-cx0033-test.md`; WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked.
- WI-CX0039-docs: Flow State Readable Snapshot. Evidence: `.flowset/state.json`, `docs/decisions/2026-07-08-flow-state-readable-snapshot.md`, and `docs/records/validation-wi-cx0039-docs.md`.
- WI-CX0047-test: Session Orchestration Control-Plane Audit. Evidence: `docs/records/session-orchestration-control-plane-audit-2026-07-08.md` and `docs/records/validation-wi-cx0047-test.md`.
- WI-CX0048-test: Runtime Snapshot Validator. Evidence: `.flowset/runtime-snapshot.json`, `docs/specifications/runtime-snapshot.md`, and `docs/records/validation-wi-cx0048-test.md`.
- WI-CX0049-docs: A2 Handoff Receiver Contract. Evidence: `docs/specifications/a2-handoff-receiver-contract.md` and `docs/records/validation-wi-cx0049-docs.md`.
- WI-CX0034-docs: Layer 2 Scope Code Options Packet. Evidence: `docs/records/layer-2-scope-code-options-2026-07-08.md` and `docs/records/validation-wi-cx0034-docs.md`; final scope code choice remains user-gated.
- WI-CX0036-docs: Chunk Id Scope Policy. Evidence: `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md` and `docs/records/validation-wi-cx0036-docs.md`; per-target-project chunk id scope is accepted.
- WI-CX0037-docs: Layer 2 Scope Code Decision Handback. Evidence: `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md` and `docs/records/validation-wi-cx0037-docs.md`; final scope code choice remains user-gated.
- WI-CX0040-chore: Tooling Strictness Probe. Evidence: `scripts/report-type-strictness.mjs`, `docs/decisions/2026-07-08-tooling-strictness-probe.md`, and `docs/records/validation-wi-cx0040-chore.md`.
- WI-CX0041-docs: Automation Runner S2 Review Packet. Evidence: `docs/records/automation-runner-s2-review-packet-2026-07-08.md` and `docs/records/validation-wi-cx0041-docs.md`.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. Evidence: `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md` and `docs/records/validation-wi-cx0043-docs.md`.
- WI-CX0045-test: Portfolio Guardrail Validator Baseline. Evidence: `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md` and `docs/records/validation-wi-cx0045-test.md`.
- WI-CX0046-test: Autonomous Work Exhaustion Stop Gate. Evidence: `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md` and `docs/records/validation-wi-cx0046-test.md`.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Machine-readable flow snapshot: `.flowset/state.json`.
- Runtime snapshot: `.flowset/runtime-snapshot.json`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Runtime snapshot spec: `docs/specifications/runtime-snapshot.md`.
- A2 handoff receiver contract: `docs/specifications/a2-handoff-receiver-contract.md`.
- Session orchestration audit: `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`.
- Strictness probe: `scripts/report-type-strictness.mjs` via `npm run typecheck:strict-probe`.
- Automation runner S2 packet: `docs/records/automation-runner-s2-review-packet-2026-07-08.md`.
- Automation cadence handback: `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`.
- Portfolio guardrail baseline: `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md`.
- Autonomous work exhaustion stop gate: `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Layer 2 scaffold contract: `docs/specifications/layer-2-knowledge-scaffold.md`.
- Layer 2 scope code options packet: `docs/records/layer-2-scope-code-options-2026-07-08.md`.
- Layer 2 scope code handback: `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`.
- Layer 2 chunk id scope decision: `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

## Locked For This Scaffold

- Strategic replies must synthesize accumulated objective, locked constraints, verified current state, and newest concern before reprioritizing.
- Fresh-run, handoff receiver, and clean-session claims require control-plane evidence, not only local green validators.
- `.flowset/runtime-snapshot.json` is required evidence before claiming A2 handoff receiver success.
- KI-CX-AUTO-002 receiver-contract debt is repaid by WI-CX0049; KI-CX-AUTO-004 remains debt until WI-CX0050 repays worktree isolation. Fresh-run success claims still require receiver evidence.
- Context bodies are ephemeral and ledger records metadata only.
- `.flowset/context-ledger.jsonl` is append-only audit evidence.
- `.flowset/state.json` is a compact operating-state snapshot and must not store context bodies.
- `.flowset/runtime-snapshot.json` is metadata-only and must not store conversation bodies or prompt dumps.
- Ledger dedupe must be a derived view/report and must not rewrite, delete, compact, or replace the source ledger.
- `docs/manifest.yaml` is the machine-readable SSOT registry.
- Layer 2 target-project facts, WIs, KIs, handoffs, and ledgers remain separate from Layer 1 facts unless explicitly imported by Layer 1 decision.
- Layer 2 target chunk ids are scoped per target project; cross-manifest references must be qualified.
- First Layer 2 target-project scaffold generation is blocked on the scope code decision and control-plane confidence checks.
- The installed runner is bounded A2 worktree automation and must boot from repository SSOT.
- Actual first fresh-run output review remains triggered by future standalone A2 runner output.
- E2/S2 blind review for the runner remains debt before generalized A2/A3 expansion or release-candidate readiness; WI-CX0041 installed the review packet only.
- Strict TypeScript source conversion remains DQ-DEBT; WI-CX0040 installed measurement only and did not enable strict mode.
- Release publication, deployment, package publication, and OSS submission remain hard stops.
- Post-bootstrap automation cadence and authority remains user-gated; WI-CX0043 installed the handback only.
- Portfolio guardrail evidence is validator-enforced for current and future active WIs; historical validation records were not rewritten.

## Git State

- Remote `main` is the repository standard after completed PR merges.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`; pre-realignment backup is `C:\tmp\fdp-codex-dev-backup-20260708-140739`.
- Active WI branch for this cycle: `wi/cx0049-docs-a2-handoff-receiver-contract`.

## Next Action

Start WI-CX0050-test Worktree Isolation Verification.

## Blocked Work

- First Layer 2 target-project scaffold generation is blocked on the Layer 2 project scope code rule and control-plane confidence checks.
- WI-CX0038-docs Layer 2 Scope Code Accepted Decision is blocked until the user chooses the scope code rule and WI-CX0050 repays worktree confidence debt.
- WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked until a standalone A2 runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`.
- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- Generalized A2/A3 expansion is blocked on control-plane KI debt, S2 blind review debt, and a future decision. Use `docs/records/automation-runner-s2-review-packet-2026-07-08.md` when a separate reviewer is available.
- Long-lived post-bootstrap automation cadence and authority is blocked until the user chooses from `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, `.flowset/state.json`, `.flowset/runtime-snapshot.json`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Gather or validate control-plane evidence before claiming a fresh run, handoff receiver, or clean session boundary.
4. Build a fresh context pack for the next WI.
5. Run `npm run validate` before declaring repository policy work complete.
6. Stop at Layer 2 scaffold generation, release, deployment, package publication, OSS submission, automation authority expansion, S2 execution, separate reviewer creation, or destructive local realignment boundaries unless explicitly approved.