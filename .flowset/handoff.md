# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0059-fix Ephemeral Worker Process Lifecycle Guard. The guard is validated; repository-backed model execution remains separately policy-blocked by KI-CX-PROVIDER-001.

WI-CX0054-fix is merged through PR #38 at commit `5402082266ca9ab464a779abea74947cbe50c266`. WI-CX0038-docs is merged through PR #39 at commit `a5ae05cdbd35d89de35f84748004a8e677b5201d`. WI-CX0055-feat is merged through PR #40 at commit `dbb915c2f647f0c8403975eb77de28b2435a9a2b`. WI-CX0056-test is merged through PR #41 at commit `753ff25820a4a65596ec87b6ba23be3560597c32`. WI-CX0057-docs is merged through PR #42 at commit `de267d5f7ffb24a927fd4713bc7540f9a80ac6f4`. WI-CX0058-fix is merged through PR #43 at commit `3da0475ad70e5282a6273c6d63479e830aa411c8`.

WI-CX0050 verified that this A2 runner did not prove an isolated per-run worktree. WI-CX0051 defines the minimal repair gate: a later receiver must start outside `C:\dev\FDP_Codex`, prove its git toplevel is the receiver worktree, preserve the canonical repository, start clean, rebuild context, pass duplicate branch/PR guards, and record repo-visible validation before worktree isolation can be marked proven.

Machine-readable flow-state snapshot is available at `.flowset/state.json` and is validator-checked against `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

Runtime snapshot remains `.flowset/runtime-snapshot.json` as a `historical-superseded` WI-CX0048 capture. Its original duplicate-stop and `not_proven` observations remain intact; `.flowset/state.json` now owns the current proven receiver and worktree isolation status through WI-CX0052 evidence.

A2 handoff receiver contract is accepted at `docs/specifications/a2-handoff-receiver-contract.md` and `docs/records/validation-wi-cx0049-docs.md`.

A2 worktree isolation repair is repaid by WI-CX0052-test. WI-CX0054-fix reconciles that result with the historical runtime snapshot before the first dogfood scaffold.

The user selected a separate dogfood target at `C:\dev\FDP_Codex_Dogfood`; WI-CX0038 accepts project id `fdp-codex-dogfood`, mnemonic code `FCD`, and target WI pattern `WI-FCDNNNN-category`.

Layer 2 chunk id scope is resolved as per-target-project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

The first Layer 2 scaffold is generated and validated at `C:\dev\FDP_Codex_Dogfood`. It is a separate local Git repository on branch `WI-FCD0002-test` at head `a2702ab4fd370f37af1e804cb6b7e4977ea98f6a` with no remote. Fresh-context continuation is proven, and target debt `VD-FCD0001` is repaid by qualified evidence `target:FCD:docs/records/validation-wi-fcd0002-test.md`.

WI-CX0057 accepts one visible control task plus `codex exec --ephemeral` workers. The controller owns branch creation, staged review, commit, push, PR, merge, and approvals; workers own SSOT reconstruction, worktree edits, and validation. Workers must not create persistent app tasks or receive `danger-full-access` solely for Git metadata. KI-CX-DOGFOOD-001 is repaid by this boundary, while runner reactivation remains separately gated and unapproved.

WI-CX0058 replaces generic token intersection with exact changed-source references and exact specialized intent tags. Equivalent selection fell from 76 to 18 for WI-CX0058 and from 120 to 29 for WI-CX0057. The historical WI-CX0056 request is rejected before append at 41 total chunks instead of writing another 123 entries. KI-CX-CONTEXT-001 is repaid.

Two dogfood `codex exec --ephemeral` attempts produced no visible events, left one incomplete builder edit, and left observed process ids 61312, 40280, and 60288 alive after wrapper termination until exact cleanup. KI-CX-WORKER-001 records this process-lifecycle gap and blocks generalized unattended worker use or runner reactivation until WI-CX0059-fix.

WI-CX0059 implements `scripts/run-ephemeral-worker.mjs` with stdin-only prompts, JSONL event streaming, finite timeout, interruption handling, pid/start-time identity tracking, POSIX process-group tracking, descendant-first cleanup, and post-cleanup verification. Deterministic normal, timeout, interruption, and observed-residual cases pass; an exact post-test process query found no fixture process; and a no-model `codex exec --help` smoke passes through the supervisor. KI-CX-WORKER-001 is repaid.

The repository-backed read-only model smoke was rejected before execution and again after the user explicitly approved the stated transmission risk. Codex did not bypass the policy. KI-CX-PROVIDER-001 now owns that external-provider trust boundary and blocks dogfood continuation, generalized unattended model workers, and runner reactivation.

Automation runner S2 review packet is available at `docs/records/automation-runner-s2-review-packet-2026-07-08.md`. It prepares S2 but does not satisfy E2 by itself.

Post-bootstrap automation cadence handback is available at `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`. It prepares a user decision and does not change automation settings or authority.

Release publication, deployment, package publication, and OSS program submission were not performed.

## Completed WIs

- WI-CX0001-docs through WI-CX0049-docs: bootstrap foundation, reconciliation, OSS baseline, CI, evaluation, context pack surfaces, decision policies, runner installation, flow/runtime snapshots, S2/cadence handbacks, control-plane audit, and A2 handoff receiver contract. Evidence: matching `docs/decisions/`, `docs/specifications/`, and `docs/records/validation-wi-*.md` files registered in `docs/manifest.yaml`.
- WI-CX0050-test: Worktree Isolation Verification. Evidence: `docs/records/validation-wi-cx0050-test.md`. Result: blocked, not proven.
- WI-CX0051-test: Worktree Isolation Repair Gate. Evidence: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md` and `docs/records/validation-wi-cx0051-test.md`.
- WI-CX0052-test: A2 Worktree Isolation Repair Validation. Evidence: `docs/records/validation-wi-cx0052-test.md`. Result: worktree isolation repair gate satisfied.
- WI-CX0053-docs: Strategic Goal Steering Contract. Evidence: `docs/records/validation-wi-cx0053-docs.md`. Result: collaboration instructions require goal steering, not obedient agreement, and require Codex to apply a brake when a user-suggested path conflicts with the final goal or operating boundaries.
- WI-CX0054-fix: Runtime Snapshot State Reconciliation. Evidence: `docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md` and `docs/records/validation-wi-cx0054-fix.md`. Result: historical snapshot and current WI-CX0052 proof are validator-linked.
- WI-CX0038-docs: Layer 2 Scope Code Accepted Decision. Evidence: `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md` and `docs/records/validation-wi-cx0038-docs.md`. Result: `FCD` is accepted for `fdp-codex-dogfood`.
- WI-CX0055-feat: First Layer 2 Dogfood Scaffold Generation. Evidence: `docs/records/validation-wi-cx0055-feat.md`. Result: reusable generator and validator pass generic smoke; separate FCD target is locally committed and validated.
- WI-CX0056-test: Layer 2 Fresh-Context Handoff Continuation Proof. Evidence: `docs/records/validation-wi-cx0056-test.md`. Result: a minimal prompt reconstructed the next target WI and debt, the target continued without prior conversation bodies, and VD-FCD0001 is repaid.
- WI-CX0057-docs: Ephemeral Worker Controller Boundary Contract. Evidence: `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md` and `docs/records/validation-wi-cx0057-docs.md`. Result: a single visible controller owns Git and user interaction while ephemeral workers reconstruct, edit, and validate without app task fan-out.
- WI-CX0058-fix: Context Pack Selection Breadth Guard. Evidence: `docs/decisions/2026-07-10-context-selection-breadth-guard.md` and `docs/records/validation-wi-cx0058-fix.md`. Result: exact matching and fail-before-append limits repay KI-CX-CONTEXT-001.

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
- Runtime snapshot state reconciliation: `docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md` and `docs/records/validation-wi-cx0054-fix.md`.
- Layer 2 dogfood scope code: `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md` and `docs/records/validation-wi-cx0038-docs.md`.
- Layer 2 generator and validator: `scripts/generate-layer2-scaffold.mjs` and `scripts/validate-layer2-scaffold.mjs`.
- First scaffold evidence: `docs/records/validation-wi-cx0055-feat.md`.
- Fresh-context dogfood evidence: `docs/records/validation-wi-cx0056-test.md`.
- Ephemeral worker controller boundary: `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md` and `docs/records/validation-wi-cx0057-docs.md`.
- Context selection breadth guard: `docs/decisions/2026-07-10-context-selection-breadth-guard.md` and `docs/records/validation-wi-cx0058-fix.md`.
- Ephemeral worker lifecycle guard: `docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md`, `docs/specifications/ephemeral-worker-runner.md`, and `docs/records/validation-wi-cx0059-fix.md`.
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
- `.flowset/runtime-snapshot.json` is historical WI-CX0048 evidence; `.flowset/state.json` owns current control-plane status and must link superseding records.
- Layer 2 target-project facts, WIs, KIs, handoffs, and ledgers remain separate from Layer 1 facts unless explicitly imported by Layer 1 decision.
- Layer 2 target chunk ids are scoped per target project; cross-manifest references must be qualified.
- Fresh-context continuation is validated and `VD-FCD0001` is repaid. WI-CX0057 repays KI-CX-DOGFOOD-001 with a single visible controller, ephemeral workers, and controller-owned Git operations; this does not reactivate the runner.
- WI-CX0058 repays KI-CX-CONTEXT-001 with exact specialized-tag matching, explicit source references, and dynamic 24/total 40 fail-before-append limits.
- KI-CX-WORKER-001 is repaid by WI-CX0059's deterministic OS process-tree cleanup, no-residual proof, and installed Codex CLI local smoke.
- KI-CX-PROVIDER-001 records the policy-rejected repository-to-model trust boundary. Do not resume dogfood, generalized unattended model workers, or the runner until the execution environment establishes the provider as trusted and permits the managed smoke.
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
- WI-CX0037-docs: Layer 2 Scope Code Decision Handback. At handback time, the Layer 2 project scope code rule remained user-gated and the recommended answer was `A, use <CODE>`. WI-CX0038 later resolved it as `FCD`.
- WI-CX0047-test: Session Orchestration Control-Plane Audit. It records parent thread, automation, runner ids, duplicate-stop evidence, and the validation gap.
- WI-CX0048-test: Runtime Snapshot Validator. Runtime snapshot: `.flowset/runtime-snapshot.json`.
- WI-CX0049-docs: A2 Handoff Receiver Contract. Start WI-CX0050-test Worktree Isolation Verification was the next action before WI-CX0050 completed.
- WI-CX0051-test: Worktree Isolation Repair Gate. Evidence: `docs/decisions/2026-07-08-a2-worktree-isolation-repair-gate.md` and `docs/records/validation-wi-cx0051-test.md`.
- WI-CX0053-docs: Strategic Goal Steering Contract. Evidence: `docs/records/validation-wi-cx0053-docs.md`. Result: collaboration instructions require goal steering, not obedient agreement, and require Codex to apply a brake when a user-suggested path conflicts with the final goal or operating boundaries.
- WI-CX0052-test: A2 Worktree Isolation Repair Validation. Evidence: `docs/records/validation-wi-cx0052-test.md`.
- WI-CX0054-fix: Runtime Snapshot State Reconciliation. Historical runtime evidence is marked superseded and current proof links to WI-CX0052.
- WI-CX0031-chore: Context Ledger Dedupe Policy. Source ledger remains append-only audit evidence. Evidence: `docs/records/validation-wi-cx0031-chore.md`.
- Actual first fresh-run output review remains triggered by future standalone A2 runner output.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. Automation cadence handback: `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md`. Post-bootstrap automation cadence and authority remains user-gated.
- WI-CX0037-docs boundary marker: No release publication, deployment, package publication, OSS program submission, public API or external contract change, production dependency addition, destructive filesystem or git operation occurred, or first Layer 2 scaffold generation occurred.
## Git State

- Remote `main` is the repository standard after completed PR merges.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`.
- Active WI branch for this cycle: `wi/cx0059-fix-ephemeral-worker-process-lifecycle-guard`.

## Next Action

Publish and merge the validated WI-CX0059 guard inside the active envelope. WI-CX0060-test Trusted Ephemeral Worker End-to-End Proof remains blocked on KI-CX-PROVIDER-001; do not retry the rejected repository-backed model smoke, resume dogfood, or reactivate the runner through a workaround.

## Blocked Work

- KI-CX-PROVIDER-001 blocks dogfood continuation, generalized unattended model worker use, and runner reactivation until the configured model destination is established as trusted by the execution environment.
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
6. Finish WI-CX0059 publication if still pending, then stop at KI-CX-PROVIDER-001. Do not retry the policy-rejected repository-backed model smoke, run direct unmanaged `codex exec`, resume dogfood, or reactivate the runner through a workaround. Stop at target remote creation, target push, runner reactivation, release, deployment, package publication, OSS submission, automation authority expansion, S2 execution, separate reviewer creation, or destructive operations unless explicitly approved.
