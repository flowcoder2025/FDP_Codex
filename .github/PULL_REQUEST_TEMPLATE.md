# Pull Request

## WI

- WI:
- Branch:
- Related issue or KI:

## Scope

-

## Validation

- [ ] Validation record or command output is linked.
- [ ] R2/R3 verification debt required before merge is repaid.
- [ ] Blind review completed when required.
- [ ] Adversarial review completed when required.
- [ ] Independent reviewer used a clean context and did not receive implementation narrative or self-grade.
- [ ] GitHub review `commit_id` and review payload `reviewed_head` match the current PR head.
- [ ] Review payload includes a controller-verified orchestrator receipt, and any KI-CX-REVIEW-001 boundary is respected.
- [ ] `npm run audit:independent-review -- --pr <number>` passes.
- [ ] Required `independent-review` status succeeds on the current PR head.
- [ ] Branch protection binds `independent-review` to the GitHub Actions app and the live control-plane audit verifies it.
- [ ] No implementation or policy change occurred after the passing review.

## Policy Checks

- [ ] Context pack was rebuilt from `docs/manifest.yaml`.
- [ ] No chunk bodies were stored in the context ledger.
- [ ] SSOT files were updated when policy, specification, decision, runbook, record, public documentation, or GitHub template files changed.
- [ ] Handoff and fix_plan remain compact operating state, not completed-history storage.
- [ ] No unresolved Decision Needed item blocks merge.

## Public Boundary Checks

- [ ] This PR does not publish a release, package, deployment, or OSS program submission unless an explicit decision authorizes it.
- [ ] This PR does not include private FDP_APP implementation history.
- [ ] Public-facing text does not claim support, compatibility, or release maturity that the repository has not earned.

## Merge Readiness

- [ ] PR title uses `WI-CXNNNN-category concise summary`.
- [ ] Branch uses `wi/cxNNNN-category-short-slug`.
- [ ] Required labels are applied.
- [ ] `pr:approved-merge` was applied only after the independent review audit passed.
- [ ] Maintainer or user approval exists.
