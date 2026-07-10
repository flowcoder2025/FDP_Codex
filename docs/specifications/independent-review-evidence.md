# Independent Review Evidence Specification

Status: implemented-v1.

## Purpose

Define the live GitHub evidence used to record and audit that an independent agent reviewed the current PR head from a clean context and attempted to falsify readiness.

## Reviewer Input

The controller gives the reviewer only:

- accumulated project goal;
- WI id, scope, acceptance criteria, and hard stops;
- repository path or PR;
- base and head commit;
- changed file list;
- authoritative sources selected from `docs/manifest.yaml`;
- verification commands.

The controller must not provide implementation chat, persuasive PR narrative, self-grade, expected verdict, or suggested findings.

The reviewer may inspect any repository source needed to verify a claim. Validation records and handoff claims are untrusted assertions until confirmed against source, diff, tests, and live evidence.

## Reviewer Conduct

- Use a separate agent, separate Codex thread, or human reviewer.
- For `multi_agent_v1`, use `fork_context: false`.
- Do not edit the implementation.
- Review findings first, ordered P0 through P3.
- Cite file and line or live evidence for every actionable finding.
- Attempt concrete bypasses, stale-evidence replay, missing-test cases, scope drift, and false-green paths.
- Return PASS only when P0, P1, and P2 are empty.

## GitHub Review Body

The review body contains this marker followed by one JSON code block:

```text
<!-- fdp-independent-review:v1 -->
```

The JSON object must contain:

- `schema_version: 1`
- `kind: "fdp-independent-blind-adversarial-review"`
- `reviewer_role: "independent-adversarial-reviewer"`
- `reviewer_agent_id`
- `agent_separation_declared: true`
- `execution_surface`: `multi_agent_v1`, `separate_codex_thread`, or `human_reviewer`
- `context_mode: "blind-clean"`
- `fork_context: false`
- `implementation_context_received: false`
- `reviewed_head`
- `verdict`: PASS, CONDITIONAL, BLOCKED, or FAIL
- `findings`: arrays for P0, P1, P2, and P3
- `reviewed_files`
- `evidence`
- `commands`
- `attacks_attempted`
- `residual_risks`
- `orchestrator_receipt`, containing:
  - `provider`, equal to `execution_surface`;
  - `agent_id`, equal to `reviewer_agent_id`;
  - `fork_context: false`;
  - `controller_verified: true`;
  - non-empty `verification_reference` for the live execution-surface receipt inspected by the controller.

Every P3 finding must include a non-empty disposition. The independent review audit runs before pr:approved-merge is applied and fails if that label is already present.

GitHub's review `commit_id` and `reviewed_head` must both equal the live PR head.

## Invalidating Events

Any change to the PR head invalidates the prior review, including implementation, policy, test, flow-state, or evidence-file commits. The controller must request a new clean-context review for the new head.

Comments without the marker, same-thread self-review, inherited implementation context, a stale commit, conditional verdict, or unresolved P0-P2 findings do not satisfy the gate.

The marker must be the first non-whitespace content in the complete review body. Exactly one JSON fence may exist in the complete body, and only whitespace may appear after it. A payload or narrative before the marker is invalid.

## Required Status Publication

`scripts/publish-independent-review-status.mjs` owns the `independent-review` commit status.

- GitHub Actions app id `15368` is the required publisher in branch protection.
- The workflow uses per-PR concurrency and cancels superseded runs.
- Publication sets the current head to `pending` before evaluation.
- The publisher runs the live audit twice and requires the same head, `latest_review_id`, `reviewed_head`, and PASS verdict in both reads.
- A missing, changed, stale, malformed, or blocking generation publishes failure.
- The control-plane audit verifies strict branch protection, admin enforcement, conversation resolution, force-push/deletion denial, required contexts, publisher app id, and the current-head status creator.

## Provenance Limitation

`orchestrator_receipt` is controller-attested metadata, not a signed execution-platform identity. The repository audit can reject missing or inconsistent attestations, but cannot independently prove who created the payload. KI-CX-REVIEW-001 / Issue #59 blocks unattended or generalized automated merge and release-boundary use until the execution surface supplies machine-verifiable reviewer provenance or an independently authenticated reviewer identity.

## Verification

```powershell
npm.cmd run audit:independent-review -- --self-test
node scripts/publish-independent-review-status.mjs --self-test
npm.cmd run audit:independent-review -- --pr <number>
```
