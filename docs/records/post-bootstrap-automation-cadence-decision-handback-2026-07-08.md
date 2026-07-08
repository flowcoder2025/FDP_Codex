# Post-Bootstrap Automation Cadence Decision Handback

Status: user-decision-needed.

WI: WI-CX0043-docs.

Decision target: Long-lived post-bootstrap automation cadence and authority.

## Current Boundary

FDP_Codex currently has an active bounded A2 bootstrap envelope and an installed worktree automation runner: `fdp-codex-a2-worktree-wi-runner`.

The current automation is useful for fresh-run continuation, but it must not silently become a permanent authority model after bootstrap.

This handback does not change the automation schedule, automation prompt, merge authority, A2/A3 authority, release boundary, deployment boundary, package publication boundary, or OSS submission boundary.

## Already Resolved

- Durable default without an active approval envelope is A1 Assisted.
- A2 is envelope-scoped.
- A3 is not a default mode.
- Standalone/project automation is preferred for context-hygiene-sensitive independent WI progression when available, tested, and inside an approval envelope.
- E2/S2 review debt for the automation runner is prepared by `docs/records/automation-runner-s2-review-packet-2026-07-08.md` but not yet completed.

## Still User-Gated

- Whether the current bootstrap A2 automation continues after bootstrap.
- Whether long-lived automation cadence stays hourly, changes, pauses, or becomes manual.
- Whether merge authority remains inside the current bootstrap envelope, narrows to PR-only, or later expands under a separate A3 envelope.
- Whether S2 review must be completed before any post-bootstrap automation continuation.

## Option A: Pause After Bootstrap

Rule:

- Keep the current A2 runner only for the bootstrap envelope.
- After bootstrap completion or user interruption, pause the automation and fall back to A1 Assisted.
- Restart automation only by explicit user approval.

Tradeoffs:

- Strongest context and authority safety.
- Lowest risk of unattended drift.
- Slower for long-running FDP_Codex hardening.

Recommended use:

- Before release-candidate readiness, public release, OSS submission, or when S2 debt remains open.

## Option B: Continue A2 With Narrowed PR-Only Authority

Rule:

- Continue standalone worktree automation after bootstrap, but remove merge authority.
- The runner may create branches, run validation, push, and open PRs.
- Human or current-thread approval is required before merge.

Tradeoffs:

- Preserves fresh-run context hygiene and implementation speed.
- Reduces remote mutation risk compared with autonomous merge.
- Adds user review friction on every PR.

Recommended use:

- Stable pre-release hardening where fresh-run work remains useful but trust boundaries should tighten.

## Option C: Continue Current A2 Envelope Temporarily

Rule:

- Keep current A2 authority temporarily with explicit expiration.
- Require S2 review completion before release-candidate readiness or any generalized A2/A3 expansion.
- Keep all current hard stops.

Tradeoffs:

- Fastest continuation path.
- Highest risk of normalizing a bootstrap-only permission into a durable default.
- Requires clear expiration and audit discipline.

Recommended use:

- Short, bounded cleanup periods where the user is actively watching and may stop the run.

## Option D: Define A3 Release/Publication Envelope Later

Rule:

- Do not extend A2 now.
- Prepare a future A3 envelope only after S2, release readiness, H1 approval, and explicit publication boundaries are ready.

Tradeoffs:

- Keeps publication authority separate and safer.
- Does not help immediate autonomous development speed.
- Requires a later policy and approval WI.

Recommended use:

- Release-candidate planning, tagged releases, package publication, deployment, or OSS submission.

## Recommended Choice

Recommended primary choice: Option A until S2 review is completed.

Recommended operational fallback: Option B after S2 review if the user wants continued fresh-run speed without autonomous merge.

Avoid Option C unless the user explicitly wants a short extension and names an expiration condition.

Do not use Option D as an immediate implementation step; treat it as a future release-envelope planning track.

## Decision Prompt

Choose one:

- A: pause after bootstrap and fall back to A1.
- B: continue A2 runner as PR-only automation.
- C: temporarily continue the current A2 envelope with an expiration condition.
- D: defer A2 continuation and plan a future A3 release/publication envelope later.

If choosing C, provide the expiration condition.

Example answers:

```text
A
```

```text
B after S2 review
```

```text
C until WI-CX0050 or until I stop it
```

## Next Work After User Choice

After the user chooses, FDP_Codex may create a scoped decision WI that records the accepted post-bootstrap automation cadence and authority.

Until then, long-lived post-bootstrap automation cadence and authority remains DQ-USER, and no automation schedule, prompt, merge authority, or A2/A3 authority is changed by this handback.
