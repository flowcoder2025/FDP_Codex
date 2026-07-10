# WI-CX0063-feat Validation Record

Status: validated.

Date: 2026-07-10.

## Scope

Install an executable independent blind adversarial review gate for every non-trivial R1/R2/R3 WI and use the gate on this WI before merge.

## Strategy

- PSC: P1
- WTC: VAL
- Risk: R2
- ESC: E1+E2+E3+E5+E6
- Primary evaluator stance: falsify reviewer independence, PR-head identity, blocking-finding handling, and merge-label order.
- Validator stance: require deterministic negative tests and live GitHub review evidence while preserving provider, dogfood, release, authority, dependency, API, and external-contract boundaries.

## Fresh Context

- Context pack: `ctx-wi-cx0063-feat-20260710143115`.
- Timestamp: `2026-07-10T14:31:15.585Z`.
- 19 metadata-only ledger entries.
- `contains_chunk_bodies: false`.

## Implementation

- `AGENTS.md` makes a clean-context separate reviewer mandatory for every non-trivial R1/R2/R3 WI.
- Evaluation and Git policies require E2+E3 on S2, current-head evidence, P0-P2 repayment, and re-review after any head change.
- `docs/specifications/independent-review-evidence.md` defines reviewer inputs, prohibited persuasive context, result schema, and invalidation events.
- `scripts/audit-independent-review.mjs` reads live PR labels, head SHA, and GitHub reviews.
- `pr:approved-merge` is forbidden until `pr:independent-review-passed` exists and the live audit passes.
- `.github/workflows/independent-review.yml` audits trusted default-branch code and publishes the required `independent-review` status against the PR head.
- `scripts/audit-control-plane.mjs` reruns the live independent-review audit for non-R0 PR #58 and later instead of trusting labels alone.

## Deterministic Evidence

`node scripts/audit-independent-review.mjs --self-test` passed:

- valid current-head clean-context PASS accepted;
- stale-head replay rejected;
- inherited implementation context rejected;
- missing controller-attested orchestrator receipt rejected;
- P2 blocking finding rejected;
- ambiguous multiple-payload review rejected;
- a 101st, newer failing review overrides an older passing review;
- missing required label rejected.
- premature pr:approved-merge rejected.
- P3 findings require an explicit disposition.

Repository CI and diff validation are rerun after integration.

## Independent Review Sequence

The controller publishes the final candidate head without `pr:approved-merge`, starts a separate `multi_agent_v1` reviewer with `fork_context: false`, relays the exact structured result as a GitHub PR review, and runs `npm run audit:independent-review -- --pr <number>`.

Any finding-driven edit changes the head and requires a new independent reviewer pass. The passing live review remains GitHub evidence rather than a repository commit that would invalidate its own reviewed head.

## First Independent Review

Independent agent `019f4c80-ff2c-75a0-82a8-be3751794767` reviewed PR #58 head `028f5530b824fff8c76d0b408cddb57e0d4378de` with `fork_context: false` and returned FAIL. The unchanged result is GitHub review `4672572326` anchored to that head.

It found two P1 and three P2 defects: no required GitHub check, no machine-verifiable reviewer provenance, active obsolete runner review chunks, acceptance of multiple JSON payloads, and missing review pagination. The head was not marked passed. This remediation adds required-status enforcement, actual-review re-audit, strict single-payload parsing, pagination, historical-obsolete manifest status, and KI-CX-REVIEW-001 / Issue #59 for the remaining execution-platform provenance limit.

## Bootstrap Enforcement

PR #58 introduces the trusted default-branch workflow, so that workflow cannot govern PR #58 from `main` before it merges. Before the fresh final review, `main` branch protection must require `independent-review` plus both existing Node validation checks. Only after the actual independent PASS on the exact final head may the controller publish the one-time bootstrap `independent-review` success status for that head. Future PRs are evaluated by the trusted default-branch workflow; this bootstrap exception does not remove the KI-CX-REVIEW-001 provenance boundary.

## Historical Runner Review

WI-CX0042 and the runner-specific S2 debt are obsolete, not passed. The hourly worktree cron was retired and deleted. Any replacement is new work subject to this general gate.

## Boundaries

- KI-CX-PROVIDER-001 / Issue #55 remains open.
- KI-CX-REVIEW-001 / Issue #59 remains open. Controller-attested provenance blocks unattended/generalized automated merge, A2/A3 expansion, and release-boundary use until machine-verifiable reviewer identity exists.
- No dogfood continuation or provider-policy workaround occurred.
- The retired runner was not recreated.
- The Layer 2 target was not touched.
- No first Layer 2 scaffold generation occurred.
- No destructive filesystem or git operation occurred.
- No A3 publication behavior occurred.
- No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, A2/A3 authority expansion, or self-issued independent review occurred.
