# Current WI

WI id: WI-CX0030-test

Category: test

Title: Automation Runner Post-Merge Smoke

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0030-test-automation-runner-post-merge-smoke

Approval envelope: user delegated autonomous FDP_Codex process work through `/goal`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive filesystem or git operations, public API or external contract changes, and A3 publication behavior.

## Scope

Verify after WI-CX0029 reached `origin/main` that the installed Codex app worktree runner still has its startup gate, duplicate branch/PR gate, hard stops, worktree execution surface, and no hidden local setup script. Repair any document hygiene issue found while smoke-checking the handoff path evidence.

## Triage

- PSC: P2
- WTC: AUTO
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: post-merge automation safety smoke and evidence trace.
- Validator stance: deterministic repository evidence for automation smoke, handoff control-character hygiene, manifest registration, and existing `npm run ci:check`.

## Verification Plan

- Confirm `origin/main` contains WI-CX0029 accepted decision and validation evidence.
- Inspect the Codex app automation file and app-rendered automation card.
- Confirm no WI-CX0030 duplicate branch or open PR exists before starting work.
- Confirm the automation is cron, active, worktree-based, and rooted at the repository path.
- Confirm startup, duplicate branch/PR, hard-stop, and validation-command prompt gates remain present.
- Confirm no hidden local setup script or local environment config file is configured.
- Confirm `.flowset/handoff.md` contains no non-newline control characters.
- Run `npm run ci:check`.
- Record validation evidence in `docs/records/validation-wi-cx0030-test.md`.

## Completion Evidence

- `docs/records/validation-wi-cx0030-test.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `scripts/validate-repo.mjs`

## Decision Needed

- Long-lived post-bootstrap automation cadence and S2 blind review debt remain in `.flowset/fix_plan.md`.
