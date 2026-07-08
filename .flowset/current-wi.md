# Current WI

WI id: WI-CX0018-chore

Category: chore

Title: Local Workspace Realignment

Layer: Layer 1

Risk: R3

Status: validated

Branch: wi/cx0018-chore-local-workspace-realignment

Approval envelope: user explicitly approved `C:\dev\FDP_Codex` backup and destructive local realignment to `origin/main`. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, and A3 publication behavior.

## Scope

Back up the noncanonical `C:\dev\FDP_Codex` checkout and realign it to remote `main` so future FDP_Codex work can use `C:\dev\FDP_Codex` as the canonical local workspace.

## Verification Plan

- Confirm `C:\dev\FDP_Codex` resolved path before realignment.
- Back up the full pre-realignment checkout to `C:\tmp`.
- Fetch `origin/main`.
- Force-align the local checkout to `origin/main`.
- Verify local `HEAD` equals `origin/main`.
- Run `npm run validate`.
- Record backup path, HEAD, and validation evidence.

## Completion Evidence

- Backup: `C:\tmp\fdp-codex-dev-backup-20260708-140739`
- Realigned workspace: `C:\dev\FDP_Codex`
- HEAD: `aeac5d0dc3406aeb8d441bc7e5b9bd1061591760`
- `docs/records/validation-wi-cx0018-chore.md`
- `.flowset/handoff.md`

## Decision Needed

- None for WI-CX0018-chore.