# Decisions

Decision records capture time-bound choices, context, consequences, and supersession.

Current decisions:

- `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`: accepted-v0 operating foundation for FDP_Codex.
- `docs/decisions/2026-07-08-repository-license-binding.md`: accepted repository remote and Apache-2.0 license.
- `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`: accepted bootstrap publication envelope for GitHub Actions, labels, public visibility, PR merge, and branch deletion.
- `docs/decisions/2026-07-08-public-readiness-boundary.md`: accepted public bootstrap, pre-release boundary.
- `docs/decisions/2026-07-08-evaluation-surface-baseline.md`: accepted evaluation execution surface boundary.
- `docs/decisions/2026-07-08-context-pack-command-surface.md`: accepted stdout-default and explicit ledger-append context pack command surface.
- `docs/decisions/2026-07-08-context-selection-rule-table.md`: accepted context selection rule table and rule-id metadata.
- `docs/decisions/2026-07-08-decision-queue-state-codes.md`: accepted Decision Needed state codes and live queue shape.
- `docs/decisions/2026-07-08-ki-identity-severity-policy.md`: accepted field-only KI severity classification.
- `docs/decisions/2026-07-08-handoff-size-policy.md`: accepted Layer 1 220-line handoff limit.
- `docs/decisions/2026-07-08-autonomy-default-options-packet.md`: accepted autonomy default options packet and user-intervention boundaries.
- `docs/decisions/2026-07-08-operating-policy-lock.md`: accepted Layer 1 operating policy lock v0.
- `docs/decisions/2026-07-08-collaboration-response-contract.md`: accepted user-facing decision framing and conversational Korean tone contract.
- `docs/decisions/2026-07-08-session-boundary-automation-contract.md`: accepted session boundary automation contract for auto-compact, thread automation, fresh-run automation, new local threads, and Goal mode.
- `docs/decisions/2026-07-08-tooling-typescript-baseline.md`: accepted TypeScript tooling baseline for repository scripts without runtime source conversion.
- `docs/decisions/2026-07-08-tooling-strictness-probe.md`: accepted non-gating strictness probe for measurable TypeScript tooling debt.
- `docs/decisions/2026-07-08-automation-run-surface-installation.md`: accepted Codex app worktree automation runner installation and safety gate.
- `docs/decisions/2026-07-08-context-ledger-dedupe-policy.md`: accepted append-only source ledger and derived-view-only dedupe policy.
- `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`: accepted per-target-project Layer 2 chunk id scope policy.
- `docs/decisions/2026-07-08-flow-state-readable-snapshot.md`: accepted compact machine-readable Layer 1 flow-state snapshot.
- `docs/decisions/2026-07-08-portfolio-guardrail-validator-baseline.md`: accepted current-and-forward portfolio guardrail validator baseline.
- `docs/decisions/2026-07-08-autonomous-work-exhaustion-stop-gate.md`: accepted autonomous work exhaustion stop gate.
- `docs/decisions/2026-07-10-runtime-snapshot-state-reconciliation.md`: accepted historical/runtime current-state reconciliation.
- `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md`: accepted `FCD` scope code for the first Layer 2 dogfood target.
- `docs/decisions/2026-07-10-ephemeral-worker-controller-boundary.md`: accepted one visible control task, ephemeral CLI workers, and controller-owned Git operations.
- `docs/decisions/2026-07-10-context-selection-breadth-guard.md`: accepted exact specialized intent-tag matching and fail-before-append selection limits.
- `docs/decisions/2026-07-10-ephemeral-worker-process-lifecycle-guard.md`: accepted bounded worker timeout, observable events, exact process-tree cleanup, and fail-closed verification.

Decision Needed:

The live Decision Needed queue is maintained in `.flowset/fix_plan.md` using `docs/policies/decision-queue.md`.

Do not duplicate the live queue in this index.
