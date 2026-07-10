# Handoff

Status: live.

## Current State

FDP_Codex is public and in a public bootstrap, pre-release state.

Current WI: WI-CX0060-test Trusted Ephemeral Worker End-to-End Proof on branch `wi/cx0060-test-trusted-ephemeral-worker-end-to-end-proof`. It is blocked externally: the exact managed read-only dogfood retry was rejected even after the user explicitly approved the disclosed local repository transmission.

The official ChatGPT-login managed preflight passed. The first dogfood run reconstructed the target and passed both target validators, then timed out after entering unsupported nested collaboration; managed cleanup verified zero residual processes. The runner now enforces `--disable multi_agent`, and deterministic lifecycle tests pass.

KI-CX-WORKER-003 / Issue #61 tracks the missing final-result failure. KI-CX-DOGFOOD-002 / Issue #62 tracks the stale target handoff that both target validators accepted. KI-CX-PROVIDER-001 / Issue #55 remains open until the approved post-fix dogfood proof completes.

Two clean-context read-only pre-publication reviewers returned no verdict within bounded waits and were stopped. KI-CX-REVIEW-002 / Issue #63 blocks treating this branch as independently reviewed.

WI-CX0054-fix is merged through PR #38 at commit `5402082266ca9ab464a779abea74947cbe50c266`. WI-CX0038-docs is merged through PR #39 at commit `a5ae05cdbd35d89de35f84748004a8e677b5201d`. WI-CX0055-feat is merged through PR #40 at commit `dbb915c2f647f0c8403975eb77de28b2435a9a2b`. WI-CX0056-test is merged through PR #41 at commit `753ff25820a4a65596ec87b6ba23be3560597c32`. WI-CX0057-docs is merged through PR #42 at commit `de267d5f7ffb24a927fd4713bc7540f9a80ac6f4`. WI-CX0058-fix is merged through PR #43 at commit `3da0475ad70e5282a6273c6d63479e830aa411c8`. WI-CX0059-fix is merged through PR #44 at commit `b905fc6cd0db825dcf91edbaa19688ba2a0d44ec`. WI-CX0061-fix is merged through PR #45 at commit `7b5187e720c9c82087cde941d61c252d07f73115`.

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

Required post-merge validation of WI-CX0059 intermittently classified an older Windows process row with a stale parent pid as a live descendant after the root pid was reused. WI-CX0061 rejects candidates that started before their observed parent or process-group root and adds a deterministic stale-row test. Five consecutive full lifecycle runs passed, repaying KI-CX-WORKER-002 before dogfood or runner reactivation.

The control-plane integrity audit found ten historical KIs with zero GitHub Issues, thirteen unlabeled merged PRs, four retained merged remote branches, thirty-two persistent runner tasks, ten registered stale worktrees, twelve empty worktree shells, and stale handoff closeout text. The approved reconciliation backfilled Issues #46 through #55, kept Issue #55 open, opened control Issue #56, applied truthful historical metadata to PR #33 through #45, archived all runner tasks, retired the hourly worktree cron, removed verified residue, and installed `npm run audit:control-plane`.

PR #57 merged WI-CX0062 at `48f2a88daba2bf307022901aa5d2d76beb56ac0d`. Its two-pass post-merge audit passed and Issue #56 is closed.

WI-CX0063 merged through PR #58 at `0621049268e4633d260f64d555e35959c8c7dcba`. It adds a live GitHub review audit, GitHub Actions app-bound `independent-review` status, and branch-protection gate. Separate-agent review uses clean context, binds both GitHub `commit_id` and payload `reviewed_head` to the current PR head, and is invalidated by any later head change.

The first independent reviewer, agent `019f4c80-ff2c-75a0-82a8-be3751794767`, returned FAIL on PR #58 head `028f5530b824fff8c76d0b408cddb57e0d4378de`. Its unchanged GitHub review `4672572326` found missing required-check enforcement, forgeable provenance, active obsolete manifest chunks, multiple-payload parsing, and review pagination gaps. Remediation retains the FAIL as evidence and requires a fresh reviewer on the new head.

The second independent reviewer, agent `019f4c97-a251-7282-9478-3606432ddb82`, returned FAIL on head `04b78c0c7f3fa6fe77fedc6647d45901492ce27b` in GitHub review `4672749444`. It found a stale-success workflow race, an unbound status publisher, and pre-marker payload ambiguity. The next candidate adds PR concurrency cancellation, pending-first stable double-read publication, GitHub Actions app id `15368` binding, complete-body parsing, and control-plane verification of remote protection and status creator.

The next clean reviewer found that the PR #58-only write-capable `pull_request` trigger would remain editable by future same-repository candidate branches. Agent `019f4cb4-39df-72a2-9e16-934560004ab7` returned FAIL on head `c7ee6b6ff4f44496088892e10d69c01b08e6defe` in GitHub review `4673022662`. The final workflow removes that trigger entirely. PR #58's supervised bootstrap uses one rerun of fixed Actions run `29104125595` only after an exact-head PASS; future publication is default-branch-controlled.

Agent `019f4cc5-6f2e-7bd3-bd06-5a5ddcff4a31` returned FAIL on head `e56c5b642dc8191c7a959fed201cc18b85048ca2` in GitHub review `4673105127`. Null evidence members and a disposition-only P3 could pass the evidence-shape check, and the issue-governance label taxonomy omitted the independent-pass label. The next candidate validates every evidence/finding member and synchronizes the policy taxonomy.

Agent `019f4cd0-8a3d-7663-8baa-1f3ddb12a84d` returned FAIL on head `3fd65a17af0b38617584ba58f9159e1429aac5db` in GitHub review `4673210128`. It found whitespace-only reviewer ids and proved that shared GitHub Actions app binding is not one-workflow identity. Reviewer ids are now canonicalized and UUID-checked for `multi_agent_v1`. KI-CX-STATUS-001 / Issue #60 records the GitHub Free workflow-identity limit and blocks unattended/generalized merge and release-boundary authority; supervised PR #58 still requires fixed-run evidence, exact-head review, live audit, and user approval.

KI-CX-REVIEW-001 / Issue #59 records that the current execution surface provides no signed multi-agent identity receipt. Controller-attested receipts can support supervised work with actual clean-agent execution, live receipt inspection, current-head evidence, and active user approval, but they do not authorize unattended/generalized automated merge, A2/A3 expansion, release candidates, public release, or OSS submission.

The repository-backed read-only model smoke was rejected before execution and again after the user explicitly approved the stated transmission risk. Codex did not bypass the policy. KI-CX-PROVIDER-001 now owns that external-provider trust boundary and blocks dogfood continuation, generalized unattended model workers, and runner reactivation.

The old automation runner S2 packet at `docs/records/automation-runner-s2-review-packet-2026-07-08.md` is historical. Its target cron is retired, so WI-CX0042 is obsolete rather than passed; any replacement must pass the general independent review gate.

Post-bootstrap automation cadence handback at `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md` is historical-obsolete with its retired target and does not change automation settings or authority.

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
- WI-CX0059-fix: Ephemeral Worker Process Lifecycle Guard. Evidence: `docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md` and `docs/records/validation-wi-cx0059-fix.md`. Result: managed timeout, interruption, process-tree cleanup, and no-model CLI smoke repay KI-CX-WORKER-001.
- WI-CX0061-fix: Worker Descendant Temporal Identity Guard. Evidence: `docs/records/validation-wi-cx0061-fix.md`. Result: temporal descendant identity filtering repays KI-CX-WORKER-002.
- WI-CX0062-fix: Control-Plane Integrity Reconciliation. Evidence: `docs/decisions/2026-07-10-control-plane-operational-integrity.md`, `docs/records/validation-wi-cx0062-fix.md`, PR #57, and closed Issue #56. Result: live Issue/PR/branch/worktree/task closeout is restored.

## Orientation SSOT

- Manifest: `docs/manifest.yaml`.
- Machine-readable flow snapshot: `.flowset/state.json`.
- Runtime snapshot: `.flowset/runtime-snapshot.json`.
- Live backlog: `.flowset/fix_plan.md`.
- Current WI: `.flowset/current-wi.md`.
- Validator: `scripts/validate-repo.mjs` via `npm run validate`.
- Context pack builder: `scripts/build-context-pack.mjs` via `npm run context:pack`.
- Independent review gate: `docs/decisions/2026-07-10-independent-blind-adversarial-review-gate.md`, `docs/specifications/independent-review-evidence.md`, and `npm run audit:independent-review`.
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
- Control-plane operational integrity: `docs/decisions/2026-07-10-control-plane-operational-integrity.md`, `docs/records/validation-wi-cx0062-fix.md`, and `npm run audit:control-plane`.
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
- KI-CX-WORKER-002 is repaid by WI-CX0061's temporal descendant identity rule, deterministic stale-row test, and five repeated lifecycle passes.
- Historical KIs are linked to GitHub Issues #46 through #54 and closed with explicit backfill disclosure. KI-CX-PROVIDER-001 / Issue #55 remains open.
- The hourly worktree runner is retired. Do not recreate it from its historical trigger or cadence handback; any replacement requires a new user decision, retention design, and control-plane proof.
- KI-CX-CONTROL-001 / Issue #56 is repaid and closed after PR #57 closeout and two-pass post-merge audit evidence.
- Independent E2+E3 review is a current-head merge gate for every non-trivial R1/R2/R3 WI.
- KI-CX-REVIEW-001 / Issue #59 blocks unattended/generalized automated merge and release-boundary use until reviewer provenance is machine-verifiable.
- KI-CX-STATUS-001 / Issue #60 blocks the same authority until required checks can identify one trusted workflow or a dedicated publisher.
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
- WI-CX0041-docs: Automation Runner S2 Review Packet. The packet is historical; its retired target makes WI-CX0042 obsolete, not passed.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. The retired target makes the old cadence decision inactive.
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
- The historical first-output trigger is canceled with the retired runner.
- WI-CX0043-docs: Post-Bootstrap Automation Cadence Decision Handback. Handback `docs/records/post-bootstrap-automation-cadence-decision-handback-2026-07-08.md` is historical and does not authorize a replacement.
- WI-CX0037-docs boundary marker: No release publication, deployment, package publication, OSS program submission, public API or external contract change, production dependency addition, destructive filesystem or git operation occurred, or first Layer 2 scaffold generation occurred.
## Git State

- Remote `main` is the repository standard after completed PR merges.
- `C:\dev\FDP_Codex` is canonical after WI-CX0018 realignment to `origin/main`.
- Active WI branch for this cycle: `wi/cx0060-test-trusted-ephemeral-worker-end-to-end-proof`.

## Next Action

Wait until the execution platform establishes a trusted model destination that permits the managed repository-backed proof. Then rerun the same read-only WI-CX0060 command with nested agents disabled; do not substitute another model surface or indirect command.

## Blocked Work

- KI-CX-PROVIDER-001 blocks the post-fix dogfood proof until the execution platform establishes the configured model destination as trusted; current explicit user approval was not sufficient.
- KI-CX-WORKER-003 blocks completion of WI-CX0060 until the post-fix run returns a final result before timeout with verified zero residuals.
- KI-CX-DOGFOOD-002 blocks further target progression and target-handoff correctness claims until a qualified target fix and validator regression exist.
- KI-CX-REVIEW-002 blocks validation, PR readiness, and merge until a bounded clean-context reviewer returns a current-head verdict.
- KI-CX-REVIEW-001 blocks unattended/generalized automated merge, A2/A3 expansion, release candidates, public release, and OSS submission until reviewer provenance is machine-verifiable.
- The historical WI-CX0035 runner trigger is canceled because the task-spawning hourly automation is retired.
- Release publication is not approved.
- Deployment is not approved.
- Package publication is not approved.
- OSS program submission is not approved.
- Generalized A2/A3 expansion remains blocked on KI-CX-PROVIDER-001, the new independent review gate, and a future authority decision.

## New Session Procedure

1. Start rooted at the merged repository.
2. Read `AGENTS.md`, `docs/manifest.yaml`, `.flowset/state.json`, `.flowset/runtime-snapshot.json`, this handoff, `.flowset/current-wi.md`, and `.flowset/fix_plan.md`.
3. Gather or validate control-plane evidence before claiming a fresh run, handoff receiver, or clean session boundary.
4. Build a fresh context pack for the next WI.
5. Run `npm run validate` before declaring repository policy work complete.
6. For WI-CX0060, verify that the execution platform now recognizes a trusted model destination before any retry; do not use direct unmanaged `codex exec`, another model surface, target edits, runner recreation, or authority expansion as a workaround.
