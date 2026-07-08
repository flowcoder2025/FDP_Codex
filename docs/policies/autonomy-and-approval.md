# Autonomy and Approval Policy

Status: lock candidate.

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

## Session Continuation Mapping

Same-thread heartbeat:

- Preserves current thread context.
- Useful for polling or long-running checks.
- Not the default for context-hygiene-sensitive WI progression.

Fresh-run automation:

- Starts an independent automation run.
- Uses handoff and `docs/manifest.yaml` as the bootloader.
- Rebuilds the context pack from manifest metadata.
- Preferred for autonomous WI progression.

New thread creation:

- May be used when a user-approved envelope allows Codex to create background threads.
- Must avoid unlimited thread fan-out.
- Must write enough handoff context for the user to inspect the new thread.

## UX Rule

Ask once for the envelope, then avoid repeated prompts inside that envelope. Ask again only at a hard stop, when the envelope expires, or when evidence contradicts the envelope assumptions.

## Decision Needed

- Default autonomy mode for FDP_Codex after bootstrap.
- Whether A2 may create new Codex threads or only standalone/project automations.
- Whether A3 is in scope before the local git repository is repaired.