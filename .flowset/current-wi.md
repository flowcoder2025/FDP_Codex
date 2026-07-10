# Current WI

WI id: WI-CX0056-test

Category: test

Title: Layer 2 Fresh-Context Handoff Continuation Proof

Layer: Layer 1 validating qualified Layer 2 evidence

Risk: R2

Status: validated

Branch: wi/cx0056-test-layer-2-fresh-context-handoff-continuation-proof

Approval envelope: the user approved publishing and merging the WI-CX0055 generator work and continuing through a real fresh-context dogfood proof. This WI may run ephemeral Codex CLI sessions against the approved local target, create a local target WI branch and commit, register qualified target evidence in Layer 1, and publish and merge the Layer 1 WI after checks pass. Existing exclusions remain: target remote creation, target push or PR, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, automation reactivation or authority expansion, A3 publication behavior, S2 execution, separate reviewer creation, and unrelated destructive operations.

## Scope

Prove that a session with no prior project conversation can reconstruct the separate FCD target from repository SSOT, identify and execute WI-FCD0002-test, repay VD-FCD0001, and leave auditable evidence without copying target SSOT bodies into Layer 1.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E3+E5+E6
- Primary evaluator stance: test the user's intended clean-session handoff UX, including a minimal-prompt replay that does not disclose the next WI or debt id.
- Validator stance: independently verify target commits, target-local validation, metadata-only evidence, Layer separation, and all retained hard stops.

## Verification Plan

- Reconstruct the bootstrap target in a read-only ephemeral session from `AGENTS.md` and `docs/manifest.yaml` only.
- Require that the minimal prompt independently identifies WI-FCD0002-test, VD-FCD0001, the dedicated-branch rule, runner hard stop, and target validation command.
- Continue the real target WI in a separate ephemeral session and record exact execution boundaries.
- Run target repository validation, WI-specific validation, negative WI argument checks, and diff checks.
- Commit only to the local target branch and keep the target without a remote.
- Import only qualified Layer 2 metadata and evidence pointers into Layer 1.
- Run Layer 1 type, repository, and diff checks.

## Completion Evidence

- Layer 1 context pack `ctx-wi-cx0056-test-20260710070951`; 123 metadata-only ledger entries; no chunk bodies.
- Target bootstrap head `09d0e0d9c32f57ce721482d2ea7f2efb7497e3a9`.
- Minimal-prompt read-only session `019f4ad7-d478-7ae1-809c-19c19d20780b`.
- Successful target continuation session `019f4acb-3066-7c12-b39e-ce3b2e371294`.
- Target WI-FCD0002-test commit `a2702ab4fd370f37af1e804cb6b7e4977ea98f6a`.
- Qualified target evidence `target:FCD:docs/records/validation-wi-fcd0002-test.md`.
- Layer 1 evidence `docs/records/validation-wi-cx0056-test.md`.

## Open Known Issues

- KI-CX-DOGFOOD-001: the default ephemeral worker sandbox cannot write Git metadata; repay through WI-CX0057-docs before runner reactivation.
- KI-CX-CONTEXT-001: broad intent tokens selected 123 metadata chunks; repay through WI-CX0058-fix before generalized automated WI cadence.

## Boundary

The A2 runner remains paused. The target has no remote and no target push or PR occurred. No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, automation schedule or prompt change, automation reactivation, A3 publication behavior, A2/A3 authority expansion, S2 execution, or separate reviewer creation occurred. No new first Layer 2 scaffold generation occurred. No destructive filesystem or git operation occurred outside verified temporary-worktree cleanup.
