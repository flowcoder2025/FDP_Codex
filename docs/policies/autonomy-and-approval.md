# Autonomy and Approval Policy

Status: accepted-v0.

## Purpose

Improve UX by replacing repetitive user approval prompts with bounded approval envelopes.

Risk is not treated as inevitable failure. Risk is treated as a design input that must be controlled by mode, scope, verification, hard stops, and audit records.

## Operating Modes

A0 Manual:

- Codex may inspect, plan, and propose.
- User approves each WI before file edits or external actions.
- Use when scope is unclear or trust is not established.

A1 Assisted:

- User approves a WI once.
- Codex may implement within the approved WI scope.
- Codex must stop for hard stops and Decision Needed items.
- Good default for early FDP_Codex policy work.

A2 Supervised Autopilot:

- User approves an autonomy envelope instead of every WI step.
- Codex may run fresh-run automations or background WIs inside the envelope.
- R0/R1 work may proceed with deferred or batched verification.
- R2 work may proceed only when the envelope declares an integration verification point.
- R3 work stops for approval.
- Handoff, ledger, and verification debt records are mandatory.

A3 AutoMerge / Publication:

- Codex may merge, publish, or externally expose outputs only inside a locked release envelope.
- This mode is not the default.
- It requires explicit user approval, repository health, verification debt repayment, and policy support.
- R3 hard stops still apply unless a future policy explicitly defines a narrower safe path.

## Post-Bootstrap Default Options

Durable default without an active approval envelope: A1 Assisted.

Current bootstrap autonomy envelope: A2 Supervised Autopilot may continue while the user-approved envelope is active. The active envelope allows branch-first WI work, local validation, push, ready PR creation, PR merge, and branch deletion when required checks pass and approval labels are present.

A2 does not imply unattended new Codex thread creation. A fresh run, automation, or new thread must boot from handoff and `docs/manifest.yaml`; user-owned visible thread creation requires explicit user request or supported automation tooling.

A3 is not a default mode. A3 requires a locked release or publication envelope and does not override hard stops for release publication, deployment, package publication, or OSS program submission.

If the envelope expires, contradicting evidence appears, or a hard stop is reached, FDP_Codex falls back to A1 or stops for approval.

## Approval Envelope

An approval envelope must define:

- WI range or worklist source
- allowed categories
- maximum risk level
- allowed file roots
- verification profile
- deferred verification repayment point
- hard stops
- git permissions
- network and dependency permissions
- expiration condition
- handoff and ledger requirements

## Hard Stops

Codex must stop and request user approval when work touches:

- R3 risk
- license selection or license change
- public release or OSS program submission
- git push, merge, tag, or publish when no explicit envelope allows it
- destructive filesystem or git operation
- security, secrets, data loss, public API, or external contract behavior
- new production dependency
- network access outside the approved envelope
- context hygiene violation
- manifest ambiguity that prevents safe chunk selection
- untrusted or invalid repository state

## Session Boundary Automation Contract

Auto-compact is not a clean session boundary. It is a same-thread continuation mechanism that may summarize prior context so a long task can continue. Do not treat compaction as proof that context hygiene was preserved.

Same-thread continuation:

- Preserves current thread context, including any summarized context after auto-compact.
- Useful for short follow-ups, PR/CI polling, local command retries, and finishing the active WI.
- Not the default for context-hygiene-sensitive WI-to-WI autonomous progression.
- Must not be described as a fresh run or fresh session.

Thread automation:

- Is a heartbeat-style wake-up attached to the current thread.
- Preserves the thread context by design.
- Useful when the result should stay in the same conversation.
- Not a context hygiene reset and not the default for independent WI progression.

Standalone or project automation:

- Starts fresh runs on a schedule and reports separate findings.
- Is the preferred Codex app continuation surface for independent autonomous WI progression when available, tested, and inside an approval envelope.
- In Git repositories, should use a dedicated worktree by default to isolate automation changes from unfinished local work.
- Must boot from `.flowset/handoff.md`, `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `docs/manifest.yaml`.
- Must rebuild the context pack from manifest metadata.
- Must use a durable prompt that defines stop conditions, hard stops, validation commands, and reporting expectations.
- Requires the local Codex app machine, selected project, and relevant workspace path to remain available.

New local thread:

- Is user-owned visible UI state unless a supported tool or automation explicitly creates it inside an approved envelope.
- May be opened by the user or through a supported Codex surface.
- Codex may prepare the prompt and handoff payload, but must not claim it invisibly created a new user-owned thread unless the creation is verified.
- Must avoid unlimited thread fan-out.

Goal mode:

- Can keep a persistent objective in the active thread.
- Does not by itself create a fresh session or prevent auto-compact.

FDP_Codex default:

- Finish the active WI in the current thread when already running.
- For the next independent, context-hygiene-sensitive WI, prefer standalone or project automation with a dedicated worktree once that automation is explicitly installed, tested, and inside an approval envelope.
- Until that automation surface is installed and verified, use handoff plus context pack metadata to make a fresh run possible, but do not claim automatic fresh-session execution.

### Controller And Ephemeral Worker Split

The default clean-context UX is one visible control task plus ephemeral CLI workers started with `codex exec --ephemeral`. The control task keeps the accumulated goal, user decisions, approval envelope, and final reporting. Workers reconstruct only the active WI from repository SSOT and must not create user-owned Codex app tasks.

The controller owns repository-supplied script execution and canonical validation in addition to branch creation, staging, commit, push, PR, merge, and any user-facing approval request. The worker owns repository reconstruction and worktree edits. A worker may inspect and recover an interrupted partial diff, but it must not broaden its own authority, configure remotes, publish changes, or claim the complete WI Git lifecycle.

The default ephemeral worker sandbox is `workspace-write`. FDP_Codex must not use `danger-full-access` solely to write Git metadata. When that sandbox cannot write `.git`, the controller pre-creates the dedicated WI branch, independently reviews the worker diff, runs the relevant repository validation after worker exit, and creates the commit.

This split supersedes the retired Codex app worktree cron as the supported direction. The A2 runner was paused when the controller boundary was accepted and is now retired; reactivation or replacement requires a new explicit decision, retention design, and control-plane proof.

### Ephemeral Worker Process Lifecycle

Supervised local ephemeral workers must run through `scripts/run-ephemeral-worker.mjs`. Direct unmanaged `codex exec --ephemeral` use is not allowed for unattended WI execution.

Managed workers are instructed not to execute repository-supplied scripts or package managers, and the visible controller runs canonical validation after worker exit. This is not runtime command confinement. Project-local command rules apply to the visible controller too, so they must not be installed as a worker-only control. Generalized managed-worker use remains blocked until a worker-specific command boundary exists.

The managed wrapper must use a finite timeout, stream JSONL stdout and stderr observably, track the root and descendant process identities, contain Windows workers in a kill-on-close Job Object before resume, and verify containment drain before controller fallback. The absolute timeout deadline and interrupt listener must be armed before spawn and before any event callback; an expired deadline cannot later become a successful result. An event sink exception after spawn must be captured as `event_dispatch_failed`, recorded in `event_errors`, and routed through wrapper-first verified cleanup before the invocation returns. The native Windows creation marker must include the atomically created worker PID and start time. The native wrapper writes that marker before it resumes the already-contained worker; no supervisor acknowledgement is required for resume. The supervisor must register the marker before any process-table query. On Windows timeout or interruption, it stops the exact wrapper first so Job-handle close terminates all atomically assigned members; metadata cleanup then verifies observed identities. Every cleanup result must classify the wrapper, atomic worker, and all other observed descendants exactly once as gone, identity-mismatched, alive, or unknown. Observation failure assigns unobservable identities to unknown and keeps verification failed; it must not label them alive without evidence. Targeted residual cleanup after a normal root exit signals deepest observed descendants before parents. Platforms without equivalent implemented containment must fail closed before spawning a worker. Windows workers must be assigned at creation through `STARTUPINFOEX` and `PROC_THREAD_ATTRIBUTE_JOB_LIST`, eliminating a post-creation assignment window. Each process-table command must have its own timeout. On timeout or interruption, the exact wrapper process is stopped even when observation is unavailable; unverifiable observation or cleanup still returns failure. An observation, containment, or cleanup result that cannot be verified is a failure.

Controllers must use the wrapper's internal timeout or an interrupt signal as the normal stop path. Windows Job Object close kills assigned processes after an external wrapper kill, but the killed wrapper cannot emit a verified final result.

Worker prompts must be passed through stdin instead of argv or a wrapper-created prompt file. The wrapper must not create persistent Codex app tasks, persist an event log by default, accept `danger-full-access`, change the runner, or inherit controller-owned Git and publication authority.

Live model execution remains subject to the active data and network approval boundary. Local process fixtures and non-model CLI help smoke do not authorize repository-content transmission.

## Control-Plane Runtime Validation

Fresh-run claims must be backed by control-plane evidence, not only repository documents or green local validators.

Before treating a Codex automation as a handoff receiver or a clean fresh-run boundary, FDP_Codex must record or validate the parent thread id and title, goal thread id when visible, automation id and status, runner thread ids and titles, execution environment, cwd or worktree path, last-run evidence, and whether the runner produced a branch, PR, output record, or only duplicate-stop evidence.

If control-plane evidence is missing, contradictory, or shows that the parent thread continued context-hygiene-sensitive WI implementation, classify the issue as KI debt and do not generalize A2/A3 autonomy, claim fresh-session handoff success, or proceed to first Layer 2 scaffold generation on that assumption.
## Autonomous Work Exhaustion Stop Gate

When the live fix plan has no executable next WI because remaining work is gated by user decision, external state, or separate-reviewer availability, Codex must stop autonomous WI creation and hand back the decision surface.

The handback must name the blocking user decision, triggered work waiting for evidence, reviewer-gated work, hard stops outside the approval envelope, and the recommended user response shape when one exists.

Codex may still finish the active WI, poll checks, merge an approved PR, or verify a just-completed cycle. Codex must not start another independent WI merely to avoid stopping.

A new autonomous WI may start only when the user supplies a decision or approval, new trigger evidence appears, a separate review surface becomes available, a concrete defect or critical/high KI appears, or a recorded repayment trigger is reached.

## UX Rule

Ask once for the envelope, then avoid repeated prompts inside that envelope. Ask again only at a hard stop, when the envelope expires, or when evidence contradicts the envelope assumptions.

## Decision Framing UX

Decision-bearing replies should make the user decision explicit instead of burying it in a long explanation.

Use this order by default:

1. Current situation.
2. Codex judgment.
3. User Decision Needed.
4. Options A/B/C with tradeoffs.
5. Recommendation.
6. Next action and approval needed.

This rule does not weaken approval gates. It makes the approval surface clearer before Codex proceeds.

## Goal Steering UX

Codex must not treat the newest user message as automatically higher priority than the accumulated goal. Before reprioritizing strategic, process, or approval-bearing work, Codex must connect the newest concern to the final goal, the project identity, the locked constraints, and the verified operating state.

Codex must provide goal steering, not obedient agreement. If a user-suggested path would degrade project identity, context hygiene, verification integrity, UX, priority order, or public-readiness boundaries, Codex must apply a brake: pause execution, name the conflict, and recommend the narrower correction or safer sequence.

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.

## Retired Worktree Cron Boundary

The hourly `fdp-codex-a2-worktree-wi-runner` cron is retired. It created persistent user-visible tasks and worktree residue that conflicted with the accepted single-controller plus ephemeral-worker model.

Do not recreate or reactivate a task-spawning worktree cron without an explicit user decision, a task/worktree retention policy, post-merge cleanup proof, and S2 repayment. The supported direction remains one visible controller with bounded workers that do not create Codex app task fan-out.
