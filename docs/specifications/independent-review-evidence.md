# Independent Review Evidence Specification

Status: implemented-v1.

## Purpose

Define the live GitHub evidence required to prove that an independent agent reviewed the current PR head from a clean context and attempted to falsify readiness.

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

Every P3 finding must include a non-empty disposition. The independent review audit runs before pr:approved-merge is applied and fails if that label is already present.

GitHub's review `commit_id` and `reviewed_head` must both equal the live PR head.

## Invalidating Events

Any change to the PR head invalidates the prior review, including implementation, policy, test, flow-state, or evidence-file commits. The controller must request a new clean-context review for the new head.

Comments without the marker, same-thread self-review, inherited implementation context, a stale commit, conditional verdict, or unresolved P0-P2 findings do not satisfy the gate.

## Verification

```powershell
npm.cmd run audit:independent-review -- --self-test
npm.cmd run audit:independent-review -- --pr <number>
```
