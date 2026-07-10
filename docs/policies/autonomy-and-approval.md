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

The controller owns branch creation and commit. It also owns staging, push, PR, merge, and any user-facing approval request. The worker owns repository reconstruction, worktree edits, and validation. A worker may inspect and recover an interrupted partial diff, but it must not broaden its own authority, configure remotes, publish changes, or claim the complete WI Git lifecycle.

The default ephemeral worker sandbox is `workspace-write`. FDP_Codex must not use `danger-full-access` solely to write Git metadata. When that sandbox cannot write `.git`, the controller pre-creates the dedicated WI branch, independently reviews the worker diff and validation evidence, reruns the relevant validation, and creates the commit.

This split does not replace the separately verified Codex app worktree automation contract. The A2 runner remains paused until reactivation is separately approved and its remaining cadence, trigger, and review gates are satisfied.

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
