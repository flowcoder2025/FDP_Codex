# Current WI

WI id: WI-CX0063-feat

Category: feat

Title: Independent Blind Adversarial Review Gate

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0063-feat-independent-blind-adversarial-review-gate

Approval envelope: the user explicitly required verification to use an independent agent with blind adversarial review and instructed Codex to continue afterward. This WI may implement the general review gate, create its GitHub label, run a separate clean-context agent review, publish and merge the WI after that review passes, and then reassess the next goal-critical work. Existing exclusions remain: provider-policy bypass, dogfood continuation before its gate is satisfied, retired-runner recreation, release, deployment, package publication, OSS submission, production dependencies, public API or external contract changes, A2/A3 authority expansion, and self-review presented as independent evidence.

## Scope

Make independent blind adversarial review an executable merge gate for every non-trivial R1/R2/R3 WI, anchor evidence to the current PR head, and invalidate stale review evidence after any head change.

## Triage

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: attempt to falsify independence, current-head binding, blocking-finding handling, and merge-label ordering.
- Validator stance: require executable stale-head, inherited-context, blocking-finding, and missing-label rejection plus live GitHub review evidence before merge.

## Verification Plan

- Add a machine-readable independent-review evidence contract.
- Add a live GitHub review audit with deterministic self-tests.
- Add a required `independent-review` GitHub status and branch protection gate.
- Require separate clean-context review and adversarial findings for all non-trivial R1/R2/R3 WIs.
- Forbid `pr:approved-merge` until the current PR head passes the independent review audit.
- Run repository CI, working and PR control-plane audits, and a separate `fork_context: false` reviewer on this WI.
- Treat every code or policy change after review as invalidating evidence and repeat review when needed.

## Completion Evidence

- Context pack `ctx-wi-cx0063-feat-20260710143115`; timestamp `2026-07-10T14:31:15.585Z`; 19 metadata-only ledger entries; no chunk bodies.
- `scripts/audit-independent-review.mjs --self-test` rejects stale head, inherited context, blocking findings, and missing labels while accepting a valid review.
- Decision `docs/decisions/2026-07-10-independent-blind-adversarial-review-gate.md` defines the merge boundary.
- Specification `docs/specifications/independent-review-evidence.md` defines clean reviewer input and live GitHub evidence.
- Validation record `docs/records/validation-wi-cx0063-feat.md` records repository evidence and the required external review sequence.

## Open Known Issues

- KI-CX-PROVIDER-001 / Issue #55 remains open and blocks the existing managed CLI worker proof, dogfood continuation on that surface, and runner reactivation.
- KI-CX-REVIEW-001 / Issue #59 remains open because the execution surface does not provide signed reviewer provenance. Supervised current-head review may continue with an actual clean agent and live tool receipt, but unattended/generalized automated merge, A2/A3 expansion, release candidates, public release, and OSS submission remain blocked.

## Boundary

The retired hourly runner remains absent. The Layer 2 target was not touched. No provider-policy workaround, release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, A2/A3 authority expansion, or self-issued independent review occurred.
