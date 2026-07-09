# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0052-test A2 Worktree Isolation Repair Validation.

WI-CX0051-test status: validated. Evidence: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md` and `docs/records/validation-wi-cx0051-test.md`. WI-CX0052-test status: validated. Evidence: `docs/records/validation-wi-cx0052-test.md`.

WI-CX0050 verified that this A2 runner did not prove an isolated per-run worktree. WI-CX0051 defines the minimal repair gate: a later receiver must start outside `C:\dev\FDP_Codex`, prove its git toplevel is the receiver worktree, preserve the canonical repository, start clean, rebuild context, pass duplicate branch/PR guards, and record repo-visible validation before worktree isolation can be marked proven.

Machine-readable flow-state snapshot is available at `.flowset/state.json` and is validator-checked against `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

Runtime snapshot remains `.flowset/runtime-snapshot.json`. It records the parent thread, blocked goal status, automation `fdp-codex-a2-worktree-wi-runner`, duplicate-stop receiver results, and not-proven worktree isolation evidence from the earlier control-plane audit cycle.

A2 handoff receiver contract is accepted at `docs/specifications/a2-handoff-receiver-contract.md` and `docs/records/validation-wi-cx0049-docs.md`.

A2 worktree isolation repair is repaid by WI-CX0052-test. Next priority is the user decision for the Layer 2 project scope code rule in `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`; recommended answer: `A, use <CODE>`.

Layer 2 scope code decision handback is available at `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`. Recommended answer: `A, use <CODE>`.

Layer 2 chunk id scope is resolved as per-target-project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

First Layer 2 target-project scaffold generation remains blocked on the Layer 2 project scope code rule. Layer 2 scaffold generation remains blocked until the user chooses.

Automation runner S2 review packet is available at `docs/records/automation-runner-s2-review-packet-2026-07-08.md`. It prepares S2 but does not satisfy E2 by itself.

Post-bootstrap automation cadence handback is available at `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`. It prepares a user decision and does not change automation settings or authority.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0049-docs: bootstrap foundation, reconciliation, OSS baseline, CI, evaluation, context pack surfaces, decision policies, runner installation, flow/runtime snapshots, S2/cadence handbacks, control-plane audit, and A2 handoff receiver contract. Evidence: matching `docs/decisions/`, `docs/specifications/`, and `docs/records/validation-wi-*.md` files registered in `docs/manifest.yaml`.
- WI-CX0050-test: Worktree Isolation Verification. Evidence: `docs/records/validation-wi-cx0050-test.md`. Result: blocked, not proven.
- WI-CX0051-test: Worktree Isolation Repair Gate. Evidence: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md` and `docs/records/validation-wi-cx0051-test.md`.
- WI-CX0053-docs: Strategic Goal Steering Contract. Evidence: `docs/records/validation-wi-cx0053-docs.md`. Result: collaboration instructions require goal steering, not obedient agreement, and require Codex to apply a brake when a user-suggested path conflicts with the final goal or operating boundaries.
- WI-CX0052-test: A2 Worktree Isolation Repair Validation. Evidence: `docs/records/validation-wi-cx0052-test.md`. Result: gate defined.
- WI-CX0052-test: A2 Worktree Isolation Repair Validation. Evidence: `docs/records/validation-wi-cx0052-test.md`. Result: worktree isolation repair gate satisfied.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Machine-readable flow snapshot: `.flowset/state.json`.
- Runtime snapshot: `.flowset/runtime-snapshot.json`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Runtime snapshot spec: `docs/specifications/runtime-snapshot.md`.
- A2 handoff receiver contract: `docs/specifications/a2-handoff-receiver-contract.md`.
- Worktree isolation verification: `docs/records/validation-wi-cx0050-test.md`.
- Worktree isolation repair gate: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md`.
- Worktree isolation repair validation: `docs/records/validation-wi-cx0052-test.md`.
- Strategic goal steering contract: `docs/records/validation-wi-cx0053-docs.md`.
- Session orchestration audit: `docs/records/session-orchestration-control-plane-audit-2026-07-08.md`.
- Layer 2 scaffold contract: `docs/specifications/layer-2-knowledge-scaffold.md`.
- Layer 2 scope code handback: `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`.

## Locked For This Scaffold

- Fresh-run, handoff receiver, and clean-session claims require control-plane evidence, not only local green validators.
- Strategic replies must provide goal steering, not obedient agreement; if a user-suggested path conflicts with project identity, context hygiene, verification integrity, UX, priority order, or public-readiness boundaries, Codex must apply a brake before proceeding.
- WI-CX0050 blocked worktree isolation confidence; WI-CX0051 defined the proof gate; WI-CX0052 satisfied the gate from receiver worktree evidence.
- Context bodies are ephemeral and ledger records metadata only.
- `.flowset/context-ledger.jsonl` is append-only audit evidence.
- `.flowset/state.json` and `.flowset/runtime-snapshot.json` are metadata-only snapshots and must not store conversation bodies or prompt dumps.
- Layer 2 target-project facts, WIs, KIs, handoffs, and ledgers remain separate from Layer 1 facts unless explicitly imported by Layer 1 decision.
- Layer 2 target chunk ids are scoped per target project; cross-manifest references must be qualified.
- First Layer 2 target-project scaffold generation is blocked on the scope code decision.
- E2/S2 blind review for the runner remains debt before generalized A2/A3 expansion or release-candidate readiness.
- Strict TypeScript source conversion remains DQ-DEBT; the strictness probe records debt only.
- Release publication, deployment, package publication, and OSS submission remain hard stops.

## Historical Validation Markers

These marker lines preserve validator continuity without replacing SSOT records.

- WI-CX0039-docs: Flow State Readable Snapshot. Machine-readable flow snapshot: `.flowset/state.json`. `.flowset/state.json` is a compact operating-state snapshot and not a context body store.
- WI-CX0045-test: Portfolio Guardrail Validator Baseline. Portfolio guardrail validator baseline is accepted. Current and future active WIs must record PSC, WTC, Risk, and ESC with E5 included.
- Autonomous work exhaustion stop gate is accepted at `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`. No further independent autonomous WI should start unless a user decision, external trigger, reviewer surface, concrete defect/KI, or recorded repayment trigger appears.
- WI-CX0018-chore: Local Workspace Realignment. Evidence: `docs/records/validation-wi-cx0018-chore.md`; backup `C:\tmp\fdp-codex-dev-backup-20260708-140739`; aligned HEAD `aeac5d0dc3406aeb8d441bc7e5b9bd1061591760`.
- WI-CX0040-chore: Tooling Strictness Probe. Strictness probe: `npm run typecheck:strict-probe`; current measured debt is strict=582 diagnostics, noImplicitAny=531 diagnostics, strictNullChecks=47 diagnostics.
- WI-CX0029-chore: Automation Run Surface Installation. Evidence: `docs/decisions/2026-07-08-automation-run-surface-installation.md`, `docs/records/validation-wi-cx0029-chore.md`, and runner `fdp-codex-a2-worktree-wi-runner`.
- WI-CX0030-test: Automation Runner Post-Merge Smoke. Evidence: `docs/records/validation-wi-cx0030-test.md`; handoff Windows path hygiene remains repaired.
- WI-CX0031-chore: Context Ledger Dedupe Policy. Source ledger remains append-only audit evidence.
- WI-CX0032-docs: Layer 2 Knowledge Scaffold Contract. Evidence: `docs/specifications/layer-2-knowledge-scaffold.md` and `docs/records/validation-wi-cx0032-docs.md`; next evidence gate was WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate.
- WI-CX0033-test: Automation Runner Fresh-Run Evidence Gate. Actual first fresh-run output review is triggered work and must not expand automation authority.
- WI-CX0041-docs: Automation Runner S2 Review Packet. S2 blind review repayment remains DQ-DEBT.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. Long-lived post-bootstrap automation cadence and authority remains user-gated.
- WI-CX0034-docs: Layer 2 Scope Code Options Packet. No Layer 2 target-project scaffold generation occurred.
- WI-CX0036-docs: Chunk Id Scope Policy. Per-target-project chunk id scope is accepted.
- WI-CX0037-docs: Layer 2 Scope Code Decision Handback. The Layer 2 project scope code rule remains user-gated; recommended answer: `A, use <CODE>`.
- WI-CX0047-test: Session Orchestration Control-Plane Audit. It records parent thread, automation, runner ids, duplicate-stop evidence, and the validation gap.
- WI-CX0048-test: Runtime Snapshot Validator. Runtime snapshot: `.flowset/runtime-snapshot.json`.
- WI-CX0049-docs: A2 Handoff Receiver Contract. Start WI-CX0050-test Worktree Isolation Verification was the next action before WI-CX0050 completed.
- WI-CX0051-test: Worktree Isolation Repair Gate. Evidence: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md` and `docs/records/validation-wi-cx0051-test.md`.
- WI-CX0053-docs: Strategic Goal Steering Contract. Evidence: `docs/records/validation-wi-cx0053-docs.md`. Result: collaboration instructions require goal steering, not obedient agreement, and require Codex to apply a brake when a user-suggested path conflicts with the final goal or operating boundaries.
- WI-CX0052-test: A2 Worktree Isolation Repair Validation. Evidence: `docs/records/validation-wi-cx0052-test.md`.
- WI-CX0031-chore: Context Ledger Dedupe Policy. Source ledger remains append-only audit evidence. Evidence: `docs/records/validation-wi-cx0031-chore.md`.
- Actual first fresh-run output review remains triggered by future standalone A2 runner output.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. Automation cadence handback: `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`. Post-bootstrap automation cadence and authority remains user-gated.
- WI-CX0037-docs boundary marker: No release publication, deployment, package publication, OSS program submission, public API or external contract change, production dependency addition, destructive filesystem or git operation occurred, or first Layer 2 scaffold generation occurred.
## Git State

- Remote `main` is the repository standard after completed PR merges.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`.
- Active WI branch for this cycle: `wi/cx0052-test-a2-worktree-isolation-repair-validation`.

## Next Action

Wait for the user to choose the Layer 2 project scope code rule from `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`; recommended answer: `A, use <CODE>`.

## Blocked Work

- First Layer 2 target-project scaffold generation is blocked on the Layer 2 project scope code rule.
- WI-CX0038-docs Layer 2 Scope Code Accepted Decision is blocked until the user chooses the scope code rule.
- WI-CX0035-test Automation Runner First Fresh-Run Output Review is blocked until a standalone A2 runner thread, branch, PR, or recorded output exists for `fdp-codex-a2-worktree-wi-runner`.
- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- Generalized A2/A3 expansion is blocked on control-plane KI debt, S2 blind review debt, and a future decision.
- Long-lived post-bootstrap automation cadence and authority is blocked until the user chooses from `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, `.flowset/state.json`, `.flowset/runtime-snapshot.json`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Gather or validate control-plane evidence before claiming a fresh run, handoff receiver, or clean session boundary.
4. Build a fresh context pack for the next WI.
5. Run `npm run validate` before declaring repository policy work complete.
6. Stop at Layer 2 scaffold generation, release, deployment, package publication, OSS submission, automation authority expansion, S2 execution, separate reviewer creation, or destructive local realignment boundaries unless explicitly approved.
