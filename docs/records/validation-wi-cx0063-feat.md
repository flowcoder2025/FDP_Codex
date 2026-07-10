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
- `scripts/publish-independent-review-status.mjs` sets pending, performs two current-generation audits, and only then publishes the GitHub Actions app-bound result.
- `scripts/audit-control-plane.mjs` reruns the live independent-review audit for non-R0 PR #58 and later instead of trusting labels alone.

## Deterministic Evidence

`node scripts/audit-independent-review.mjs --self-test` passed:

- valid current-head clean-context PASS accepted;
- stale-head replay rejected;
- inherited implementation context rejected;
- missing controller-attested orchestrator receipt rejected;
- P2 blocking finding rejected;
- ambiguous multiple-payload review rejected;
- a contradictory pre-marker payload rejected;
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

Independent agent `019f4c97-a251-7282-9478-3606432ddb82` then reviewed head `04b78c0c7f3fa6fe77fedc6647d45901492ce27b` and returned FAIL in GitHub review `4672749444`. It found an out-of-order status overwrite race, an unbound required-status publisher, and acceptance of a contradictory pre-marker payload. That head was not marked passed. The next remediation adds PR concurrency cancellation, pending-before-audit publication, stable double-read generation checks, complete-body parsing, GitHub Actions app binding, and live control-plane checks for protection and status creator.

Independent agent `019f4cb4-39df-72a2-9e16-934560004ab7` reviewed head `c7ee6b6ff4f44496088892e10d69c01b08e6defe` and returned FAIL in GitHub review `4673022662`. It found that retaining a write-capable `pull_request` bootstrap trigger in the merged workflow would let future same-repository candidate workflow code publish the protected context. That head was not marked passed. The final candidate removes `pull_request` entirely and keeps only default-branch-controlled `pull_request_target`, `pull_request_review`, and `workflow_dispatch` publication.

## Bootstrap Enforcement

PR #58 introduces the trusted default-branch workflow, so the final merged workflow contains no write-capable `pull_request` event. After an actual independent PASS on the exact final head, the controller may rerun the already fixed GitHub Actions run `29104125595` once. That immutable run resolves PR #58's live head and publishes the app-bound status, while its candidate trigger is absent from the final merged workflow. `main` protection binds Node 20, Node 24, and `independent-review` to GitHub Actions app id `15368`. Future publication uses only the trusted default-branch workflow. This supervised bootstrap does not remove the KI-CX-REVIEW-001 reviewer-provenance boundary.

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
