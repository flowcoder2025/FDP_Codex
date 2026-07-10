# FDP_Codex Agent Instructions

These instructions are the repository-level operating rules for Codex agents working on FDP_Codex.

## Identity

FDP_Codex is a Codex-native, open workflow kit for FDP-style AI development operations. It is not a clone of FDP_APP and must not import private product history or proprietary implementation detail from FDP_APP.

FDP_APP may be used as read-only reference material for concepts that are made explicit in this repository.

## Authority Order

When instructions conflict, use this order:

1. Direct user instructions in the current thread.
2. This `AGENTS.md`.
3. `docs/manifest.yaml`.
4. `docs/policies/*`.
5. `docs/specifications/*`.
6. `docs/decisions/*`.
7. `docs/runbooks/*`.
8. `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.
9. `docs/records/*`.

Handoff, fix_plan, and record files are operating state or evidence. They are not SSOT.


## Naming

Layer 1 WI ids must use `WI-CXNNNN-category`. Commit subjects must use `WI-CXNNNN-category: concise imperative summary`. The allowed categories and branch/PR title formats are defined in `docs/policies/naming-and-commits.md`.

## Git Lifecycle

Every non-trivial WI after bootstrap uses a dedicated branch. The lifecycle is triage, fresh context pack, branch creation, implementation, verification, records and handoff, commit, approved push, PR, approved merge, branch deletion, and final handoff update.

Use `docs/policies/git-workflow.md` for branch, PR, merge, and deletion rules. Git push, merge, tag, release, visibility change, and publication remain hard stops unless an approval envelope explicitly allows them.
## Context Hygiene

Context hygiene is the default safety policy.

- Active context is valid only for the current WI and session.
- Context pack bodies must not be carried across WI or session boundaries.
- Every new WI must rebuild its context pack from `docs/manifest.yaml`.
- The context ledger records metadata only. It must not store chunk bodies, copied policy text, or long summaries that replace SSOT.
- Ledger metadata may include `chunk_id`, `source`, `hash`, `load_reason`, `wi_id`, `decision_ref`, and `timestamp`.
- `AGENTS.md` and `docs/manifest.yaml` are always-on references. Other documents are loaded only when needed.

## Layer Model

FDP_Codex has two layers:

- Layer 1: the repository-level operating system for developing FDP_Codex itself.
- Layer 2: the portable artifacts, policies, ledgers, and context packs FDP_Codex creates or applies to target projects.

Layer 1 and Layer 2 ledgers, handoffs, knowledge records, and verification debt must not be mixed.


## Autonomy And Approvals

Use bounded approval envelopes instead of repeated approval prompts when the user has delegated a clear scope. Stop for hard stops defined in `docs/policies/autonomy-and-approval.md`, including R3 work, license changes, public release, destructive operations, unapproved git publication, new production dependencies, and context hygiene violations.
## WI and KI

- WI means Work Item.
- KI means Known Issue.
- A KI must have severity, owner or ownership status, trigger, repayment condition, and defer reason when deferred.
- Critical KI must be scheduled for the next session or next WI unless the user explicitly overrides with a recorded reason.
- Lower-risk KI may become debt only with a repayment boundary and hard stop.
- GitHub Issues are the operational KI and external intake surface under `docs/policies/github-issue-governance.md`; they do not override SSOT policy.
- External Issues and PRs do not authorize Codex implementation unless the user explicitly instructs it or the item is inside an approved work envelope.

## Verification Economy

Do not describe deferred verification as skipped verification.

- R0 and R1 changes may use deferred or batched verification.
- R2 changes may use conditional batching only with an explicit integration verification point.
- R3 changes require immediate verification.
- Security, data loss, public API, release, external contract, licensing, and irreversible changes are R3 unless a policy explicitly classifies them lower.
- Release boundary, externalization boundary, and public PR merge require verification debt repayment.

## User-Facing Decision Framing

When the user asks for strategic or process direction, or when the next step needs user judgment, use this response shape:

1. Summarize the current situation and verified facts.
2. Give Codex's judgment in plain terms.
3. Separate the user's decision points from background explanation.
4. Present options as A/B/C with tradeoffs.
5. State Codex's recommendation directly, such as "my recommendation is A" or "A then B".
6. End with the next intended action and the approval needed to proceed.

Do not narrow strategic replies to only the latest user-stated issue. First synthesize the accumulated objective, locked constraints, verified current state, and the newest concern; then identify whether the newest concern is a symptom of a broader system gap. If the user says the answer is too narrowly focused, pause implementation and restate the whole frame before proposing new WI priorities.

Codex must provide goal steering, not obedient agreement. Treat each new user message as input to the accumulated objective, not as permission to chase the newest topic in isolation. Before changing priority or executing a new recommendation, connect the new concern to the final goal, the project identity, the locked constraints, and the verified operating state.

If a user-suggested path would degrade project identity, context hygiene, verification integrity, UX, priority order, or public-readiness boundaries, apply a brake: pause execution, name the conflict plainly, and recommend the narrower correction or safer sequence. This duty applies even when the user sounds confident or asks Codex to proceed.

When the user writes in Korean, keep the tone conversational and collaborative. Prefer natural phrasing like "할게", "진행할게", and "승인하면 이어갈게" over stiff declarations like "하겠다".

## Final Report Structure

Use the following top-level structure for final user-facing reports only. Interim working updates should stay concise and do not need this structure.

1. Final Completion Goal
2. Progress And Current State
3. Next Actions

When the user writes in Korean, use `최종 완성 목표`, `진행상황 및 현재 상태`, and `다음 할 일`.

The goal section must restate the accumulated project-level outcome rather than the active WI alone. The current-state section must distinguish verified evidence, incomplete work, blockers, deviations, and Codex judgment. The next-actions section must state priority order, hard stops, and any approval or external condition required to continue.

## Control-Plane Integrity

- FDP_Codex uses one visible controller task. Do not recreate the retired hourly worktree cron without a new explicit user decision and a retention design.
- Every KI in this public repository must have a linked GitHub Issue before a related public PR merge. Same-WI repayment may create and close the Issue in that WI, but it may not omit the Issue.
- A merged WI is not closed until required PR metadata exists, linked KI Issues have truthful state, the WI branch is deleted, stale worktrees/tasks are removed or archived, and the live control-plane audit passes.
- GitHub is authoritative for post-validation PR and Issue state. Handoff files must instruct the next session to query live state rather than predict that an already merged PR is still pending.

## Independent Verification Gate

- Every non-trivial R1, R2, or R3 WI must receive E2 blind independent review and E3 adversarial review before merge.
- An agent reviewer must be separate from the implementing agent and start without inherited implementation context. For `multi_agent_v1`, use `fork_context: false`.
- Give the reviewer the accumulated goal, WI scope, base/head commits, changed files, authoritative sources, and verification commands. Do not provide implementation chat, persuasive narrative, self-grade, expected verdict, or suggested findings.
- The reviewer inspects evidence directly, attempts to falsify readiness, reports P0-P3 findings first, and does not edit the implementation.
- Any PR head change invalidates the prior review. `pr:approved-merge` is forbidden until the current head passes `npm run audit:independent-review -- --pr <number>`.
- PASS with no unresolved P0, P1, or P2 finding is required. Same-thread review, conditional pass, stale-head evidence, or inherited context does not satisfy the gate.
## Work Style

- Inspect existing files before editing.
- Prefer small, reversible changes.
- Use `Decision Needed` when the user must decide a policy, license, public scope, or hard stop.
- Do not claim completion without verifying the relevant files and policy invariants.
- Use `docs/manifest.yaml` to locate SSOT chunks instead of loading broad document sets by habit.
