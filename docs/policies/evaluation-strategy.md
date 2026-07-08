# Evaluation Strategy Policy

Status: accepted-v0.

## Purpose

Define how FDP_Codex chooses validation and evaluation strategies without hardcoding one review style for every project or WI.

The validator answers whether deterministic repository rules pass.

The evaluator answers whether the work is appropriate, balanced, complete, and risk-aware for the current goal.

## Role Split

Validator:

- deterministic checks
- manifest source existence
- schema and naming checks
- ledger metadata hygiene
- branch and flow-state hygiene
- package script and tool contract checks
- template, workflow, and policy presence checks

Evaluator:

- intent fit
- portfolio balance
- risk classification quality
- missing scenario analysis
- blind independent review
- adversarial review
- user-facing tradeoff review
- OSS readiness judgment

The validator may block merge. The evaluator may block progression even when validator passes.

## Strategy Codes

E0 Validator Only:

- Deterministic checks are enough for low-risk structural work.
- Use only when no judgment-heavy claim is being made.

E1 Rubric Review:

- Apply a written criteria checklist.
- Required when a WI changes policy, public documentation, contribution flow, or handoff behavior.

E2 Blind Independent Review:

- A reviewer evaluates the artifact without relying on the implementer's narrative or self-grade.
- Required when policy direction, UX tradeoff, evaluator logic, public contribution behavior, or cross-WI process balance is affected.

E3 Adversarial Review:

- A reviewer actively attempts to falsify readiness, find bypasses, and identify hidden coupling.
- Required for automation, validator behavior, public collaboration surfaces, release boundaries, security-sensitive surfaces, and high-impact policy changes.

E4 Goal-Fit Review:

- Check whether the work matches the user's intent and product direction.
- Required when a WI translates discussion, preference, or strategy into repository policy.

E5 Portfolio Balance Review:

- Check whether the selected next WI avoids over-concentrating on one track while starving another.
- Required for every triage decision.

E6 Evidence Trace Review:

- Check whether claims are backed by files, validation results, records, or explicit decisions.
- Required for R2 or R3 work and every policy LOCK.

E7 Release Readiness Review:

- Check public readiness, licensing, contribution, security, reproducibility, and demo evidence.
- Required before tagged release, public release, external publication, or OSS program submission.

## Review Execution Surfaces

S0 Same-Agent Self Check:

- The implementing agent reviews its own work.
- Allowed for R0/R1 and as a supporting pass for R2.
- Never satisfies E2.

S1 Same-Thread Structured Review:

- The same Codex thread runs a separate checklist pass after implementation.
- Allowed for R2 pre-release work when the risk is bounded, the validator passes, and no release, license, security, or publication decision is being made.
- May satisfy E1, E3, E4, E5, and E6 when the review notes are recorded.
- Does not satisfy E2.

S2 Separate Blind Review:

- A separate Codex thread, separate reviewer, or human reviewer receives the goal, changed files, and evidence without the implementer's persuasive narrative.
- Required to satisfy E2.
- Required before release-candidate decisions, public release, OSS program submission, A2/A3 autonomy enablement, and disputed or ambiguous evidence.

H1 Human Maintainer Gate:

- A human maintainer explicitly approves a trust-positioning or externalization decision.
- Required for license changes, public release, tagged release, deployment, package publication, OSS program submission, and material governance changes.
- H1 is an approval gate, not an E-code.

## Selection Matrix

Foundation policy:

- Default: E1 + E4 + E5 + E6.
- Add E2 when the policy could self-grade its own readiness or affect governance.
- Add E3 when the policy changes autonomy, GitHub collaboration, context hygiene, or validator behavior.

Validator or automation:

- Default: E1 + E3 + E5 + E6.
- Add E2 when the automation chooses priorities, context, or evaluator strategy.
- H1 is required when automation can push, merge, publish, mutate remote state, or create long-lived background work outside an already approved envelope.

Context pack or knowledge system:

- Default: E1 + E2 + E3 + E5 + E6.
- Focus on body leakage, stale context reuse, missing SSOT, and Layer 1/Layer 2 contamination.

GitHub issue, PR, or label workflow:

- Default: E1 + E2 + E3 + E5 + E6.
- H1 is required before remote label mutation, PR merge, branch deletion automation, release workflow, or visibility change unless an active approval envelope already covers that action.

OSS readiness:

- Default: E1 + E2 + E3 + E4 + E5 + E6 + E7.
- Public release and OSS program submission require H1.

Handoff and fix_plan hygiene:

- Default: E1 + E5 + E6.
- Add E3 when the change alters continuation behavior or autonomous work selection.

Documentation-only R0/R1:

- Default: E0 + E6.
- Add E1 when manifest, ledger, or policy registry files change.

## Adversarial Checklists

Adversarial checklists are evaluator prompts by default. They are not validator keyword gates unless a later WI extracts a deterministic invariant from a repeated finding.

Policy:

- Could this rule authorize work the user did not approve?
- Could this rule hide a hard stop behind softer language?
- Does it conflict with AGENTS, manifest, or a higher-authority decision?
- Does it make `.flowset` files act as SSOT?

Validator:

- Can a false green occur because the check only looks for keywords?
- Can a missing source, duplicate id, or malformed ledger line bypass the gate?
- Does the validator allow bootstrap exceptions after bootstrap ends?
- Does a passing validator prove only deterministic hygiene rather than product readiness?

Automation:

- Can it carry context bodies across WI or sessions?
- Can it mutate remote state without an approval envelope?
- Can retries or fresh runs create duplicate work?
- Can it over-prioritize one track and starve another?

GitHub:

- Can external issues or PRs become automatic work without approval?
- Are labels authorization gates or only organizational metadata?
- Can a KI be closed without repayment evidence?
- Can PR merge happen with unpaid verification debt?

OSS readiness:

- Is the repository understandable to a new contributor?
- Are license, contribution, security, issue, and PR paths coherent?
- Is the public story honest about maturity and limitations?
- Are private FDP_APP details excluded?

Handoff and fix_plan:

- Is completed history leaking into the live backlog?
- Is handoff copying SSOT instead of pointing to it?
- Is the next action blocked on user decision but still presented as executable?
- Can a fresh session restart without relying on hidden context?

## Evidence Requirements

Every R2 or higher evaluation must record:

- selected strategy codes,
- execution surface used,
- validation command or reason for deferral,
- blind or adversarial review result when required,
- residual risk,
- Decision Needed items,
- handoff update.

If E2 is required but S2 was not used, the work may continue only when the current boundary does not require E2 completion before merge. The validation record must state that E2 remains unrepaid.

## Decision Status

Resolved by `docs/decisions/2026-07-08-evaluation-surface-baseline.md`:

- E2 requires S2 Separate Blind Review.
- S1 same-thread review may support R2 pre-release work but does not satisfy E2.
- Adversarial checklists remain evaluator prompts by default.
- H1 Human Maintainer Gate is mandatory before first public release, tagged release, package publication, deployment, or OSS program submission.

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.
