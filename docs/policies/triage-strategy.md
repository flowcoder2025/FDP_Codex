# Triage Strategy Policy

Status: accepted-v0.

## Purpose

Choose the next WI and evaluation strategy without overfitting to one kind of work.

Triage is not a simple priority queue. Triage is a portfolio governor that balances safety, progress, debt repayment, project maturity, and user intent.

## Inputs

A triage decision should consider:

- current fix_plan candidates
- active WI status
- KI severity
- Decision Needed items
- dependencies and blockers
- R0-R3 risk level
- Layer 1 / Layer 2 boundary
- project state code
- work track code
- recent track concentration
- verification debt
- OSS readiness impact
- context hygiene impact
- approval envelope and hard stops

## Project State Codes

P0 Bootstrap:

- repository structure, basic docs, and operating surfaces are still forming.

P1 Foundation:

- policies, SSOT, handoff, fix_plan, and knowledge model are being stabilized.

P2 Tooling:

- validators, hooks, context pack builders, and automation surfaces are being implemented.

P3 Integration:

- separate tools and policies are wired into a usable workflow.

P4 Hardening:

- adversarial paths, edge cases, policy gaps, and failure behavior are strengthened.

P5 Release Candidate:

- public release, OSS readiness, license, contribution, security, and demo evidence are prepared.

P6 Maintenance:

- debt repayment, compatibility, documentation refresh, and incremental improvements dominate.

## Work Track Codes

FND Foundation:

- policy, SSOT, documentation architecture, handoff, fix_plan, naming, and operating decisions.

VAL Validator:

- deterministic gates, CI, manifest validation, ledger validation, naming validation, and hygiene checks.

AUTO Automation:

- approval envelopes, fresh-run automation, hooks, context pack builder, and autonomous continuation.

KNOW Knowledge:

- Layer 1 / Layer 2 knowledge model, chunk taxonomy, context packs, and generated target-project artifacts.

OSS OSS Readiness:

- license, README, contribution guide, security policy, roadmap, demo, and public positioning.

EVAL Evaluation:

- evaluator strategies, review rubrics, blind review, adversarial review, and release-readiness judgment.

DEBT Debt Repayment:

- KI repayment, verification debt repayment, stale decision cleanup, and hardening backlog.

Detailed evaluator and validator role separation is defined in `docs/policies/evaluation-strategy.md`.

## Evaluation Strategy Codes

E0 Validator Only:

- Deterministic checks are enough for low-risk structural work.

E1 Rubric Review:

- Apply a written criteria checklist.

E2 Blind Independent Review:

- A reviewer evaluates the artifact without relying on the implementer's narrative or self-grade.

E3 Adversarial Review:

- A reviewer actively searches for bypasses, abuse paths, false-green cases, context poisoning, and edge-case failures.

E4 Goal-Fit Review:

- Check whether the work matches the user's intent and product direction.

E5 Portfolio Balance Review:

- Check whether the selected next WI avoids over-concentrating on one track while starving another.

E6 Evidence Trace Review:

- Check whether claims are backed by files, validation results, records, or explicit decisions.

E7 Release Readiness Review:

- Check public readiness, licensing, contribution, security, reproducibility, and demo evidence.

## Mandatory Strategy Rules

E5 Portfolio Balance Review is required for every triage decision.

E6 Evidence Trace Review is required for every R2 or R3 WI and every policy LOCK.

E2 Blind Independent Review is required when:

- the WI is R3,
- the WI enables A2 or A3 autonomy,
- the WI changes hard stops,
- the WI affects release, public PR merge, publication, license, security, external contract, data, or public API behavior,
- the work could self-grade its own readiness,
- prior evidence is ambiguous or disputed.

E3 Adversarial Review is required when:

- the WI touches security, filesystem boundaries, git publication, command execution, network access, dependency installation, or external contracts,
- the WI creates or modifies validators, hooks, automation, context pack selection, or ledger handling,
- bypass or false-green behavior would be more costly than delay,
- context poisoning or stale-context carryover is plausible.

E7 Release Readiness Review is required before public release, OSS program submission, tagged release, or external publication.

## Triage Output Contract

A triage result must record:

- selected WI id
- selected project state code
- selected work track code
- risk level
- chosen evaluation strategy codes
- selected context chunks
- why this WI was selected
- why other candidates were deferred
- dependency status
- hard stop status
- verification plan
- expected handoff update

## Portfolio Guardrails

Do not pick only the easiest next WI.

Do not run more than two consecutive WIs in the same work track unless:

- a Critical KI requires it,
- a dependency chain blocks all other tracks,
- the user explicitly approves the concentration,
- or a release boundary requires it.

If a track is deferred three times in a row, triage must record why it remains deferred.

## Current FDP_Codex Default

Current project state: P1 Foundation.

Current preferred next move after this policy: keep GitHub workflow and KI issue governance ahead of validator work when branch or issue rules are not yet locked. Then move to P2 Tooling with the Manifest Validator unless the user changes direction or a Critical KI appears.

Default strategy for the next validator WI:

- PSC: P2
- WTC: VAL
- Risk: R2
- ESC: E1 + E3 + E5 + E6

Rationale: validators are deterministic gates, but validator implementation can create false-green behavior, so adversarial review is required.

## Decision Needed

- Whether blind review must be performed by a separate Codex thread, a separate model role, or a human reviewer.
- Whether adversarial review should have a standard checklist per surface type.
- Whether portfolio guardrails should become a deterministic validator rule or remain evaluator judgment.