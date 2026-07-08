# Evaluation Strategy Policy

Status: draft.

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
- template and policy presence checks

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

E0 Self Check:

- Used for R0 and small R1 changes.
- The implementing agent checks its own result.

E1 Deterministic Validator:

- Uses `npm run validate` or an equivalent deterministic gate.
- Required for manifest, ledger, naming, branch, template, and flow-state changes.

E2 Blind Independent Review:

- Reviewer receives the goal, changed surface, and evidence but not the implementer's narrative.
- Required when policy direction, UX tradeoff, evaluator logic, public contribution behavior, or cross-WI process balance is affected.

E3 Adversarial Review:

- Reviewer actively attempts to falsify readiness, find bypasses, and identify hidden coupling.
- Required for automation, validator behavior, public collaboration surfaces, release boundaries, security-sensitive surfaces, and high-impact policy changes.

E4 Human Maintainer Review:

- Required when the decision is product, license, publication, public release, governance, or trust-positioning rather than purely mechanical.

E5 Evidence Trace:

- Requires commands, records, file paths, and validation outputs.
- Required for R1 and above unless explicitly deferred under verification economy rules.

E6 Handoff Review:

- Confirms `.flowset/handoff.md`, `.flowset/fix_plan.md`, and `.flowset/current-wi.md` point to SSOT and do not become SSOT.

E7 OSS Readiness Review:

- Checks external contributor UX, repository hygiene, license consistency, security disclosure, public documentation, and issue/PR intake policy.

## Selection Matrix

Foundation policy:

- Default: E1 + E2 + E5 + E6.
- Add E3 when the policy changes autonomy, GitHub collaboration, context hygiene, or validator behavior.
- Add E4 when the policy locks a user-visible governance decision.

Validator or automation:

- Default: E1 + E3 + E5 + E6.
- Add E2 when the automation chooses priorities, context, or evaluator strategy.
- Add E4 when the automation can push, merge, publish, mutate remote state, or create long-lived background work.

Context pack or knowledge system:

- Default: E1 + E2 + E3 + E5 + E6.
- Focus on body leakage, stale context reuse, missing SSOT, and Layer 1/Layer 2 contamination.

GitHub issue, PR, or label workflow:

- Default: E1 + E2 + E3 + E5 + E6.
- Add E4 before remote label mutation, PR merge, branch deletion automation, release workflow, or visibility change.

OSS readiness:

- Default: E1 + E2 + E3 + E4 + E5 + E6 + E7.
- Public release and OSS program submission require human maintainer review.

Handoff and fix_plan hygiene:

- Default: E1 + E5 + E6.
- Add E3 when the change alters continuation behavior or autonomous work selection.

Documentation-only R0/R1:

- Default: E0 + E5.
- Add E1 when manifest, ledger, or policy registry files change.

## Adversarial Checklists

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
- validation command or reason for deferral,
- blind or adversarial review result when required,
- residual risk,
- Decision Needed items,
- handoff update.

## Decision Needed

- Whether blind independent review uses a separate Codex thread, another model role, or a human reviewer.
- Whether adversarial review checklists become validator-enforced keyword gates or remain evaluator prompts.
- Whether human review is mandatory before first public release even when validator and evaluator pass.
