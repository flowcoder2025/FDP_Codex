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
- `scripts/audit-control-plane.mjs` requires the new review labels for PR #58 and later.

## Deterministic Evidence

`node scripts/audit-independent-review.mjs --self-test` passed:

- valid current-head clean-context PASS accepted;
- stale-head replay rejected;
- inherited implementation context rejected;
- P2 blocking finding rejected;
- missing required label rejected.
- premature pr:approved-merge rejected.
- P3 findings require an explicit disposition.

Repository CI and diff validation are rerun after integration.

## Independent Review Sequence

The controller publishes the final candidate head without `pr:approved-merge`, starts a separate `multi_agent_v1` reviewer with `fork_context: false`, relays the exact structured result as a GitHub PR review, and runs `npm run audit:independent-review -- --pr <number>`.

Any finding-driven edit changes the head and requires a new independent reviewer pass. The passing live review remains GitHub evidence rather than a repository commit that would invalidate its own reviewed head.

## Historical Runner Review

WI-CX0042 and the runner-specific S2 debt are obsolete, not passed. The hourly worktree cron was retired and deleted. Any replacement is new work subject to this general gate.

## Boundaries

- KI-CX-PROVIDER-001 / Issue #55 remains open.
- No dogfood continuation or provider-policy workaround occurred.
- The retired runner was not recreated.
- The Layer 2 target was not touched.
- No first Layer 2 scaffold generation occurred.
- No destructive filesystem or git operation occurred.
- No A3 publication behavior occurred.
- No release publication, deployment, package publication, OSS program submission, production dependency addition, public API or external contract change, A2/A3 authority expansion, or self-issued independent review occurred.
