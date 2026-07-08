# FDP_Codex Operating Foundation

Status: accepted-v0.

Date: 2026-07-08.

WI: WI-CX0004-docs.

## Purpose

This decision record consolidates the initial FDP_Codex direction that was established through discussion before implementation.

It exists to prevent drift: policies may be split across focused files, but this record explains why those files exist and how they fit together.

## Decision

FDP_Codex is a Codex-native open FDP workflow kit. It is not a public clone of FDP_APP and must not import private product history or proprietary implementation detail.

FDP_APP remains a read-only reference for process concepts that are explicitly re-expressed in FDP_Codex.

## Product Direction

FDP_Codex should provide a reusable operating system for Codex work:

- repository guidance for agents
- SSOT manifest and chunk registry
- context hygiene and context pack rules
- Layer 1 and Layer 2 knowledge boundaries
- WI and KI lifecycle
- risk-aware verification economy
- autonomy and approval envelopes
- handoff and ledger discipline
- future hooks, validators, and context pack tooling

The first goal is not OSS program submission. The first goal is a trustworthy foundation that can later support public release and OSS program application.

## Documentation Architecture

The public documentation root is `docs/`, not `design/`.

Standard public categories are:

- `docs/policies/`
- `docs/specifications/`
- `docs/decisions/`
- `docs/runbooks/`
- `docs/records/`

`docs/manifest.yaml` is the machine-readable registry. `docs/index.md` is the human navigation index.

Handoff and fix_plan files are not SSOT. They are live operating surfaces.

## Context Hygiene

Context hygiene is the default policy.

Active context and context packs are ephemeral. Chunk bodies must not cross WI or session boundaries.

The context ledger records metadata only:

- chunk id
- source
- hash or version
- load reason
- WI id
- decision reference
- timestamp
- actor

A new WI must rebuild its context pack from `docs/manifest.yaml` instead of reusing previous active context bodies.

## Layer Model

Layer 1 is FDP_Codex itself: this repository, its policies, validators, hooks, docs, and release process.

Layer 2 is what FDP_Codex applies to or generates for target projects: target manifests, handoffs, KI ledgers, verification debt ledgers, context pack contracts, and related artifacts.

Layer 1 and Layer 2 knowledge, handoffs, ledgers, and verification debt must not be mixed.

Layer 1 policies may generate or constrain Layer 2 artifacts, but the crossing must be explicit.

## WI and KI Model

WI means Work Item. KI means Known Issue.

WI ids for FDP_Codex Layer 1 use:

```text
WI-CXNNNN-category
```

Allowed categories are defined in `docs/policies/naming-and-commits.md`.

KI records must include severity, owner or ownership status, trigger, defer reason, repayment condition, hard stop, and current status.

Critical KI must be scheduled for the next session or next WI unless the user explicitly overrides with a recorded reason.

Lower-risk KI may remain as debt only with a repayment boundary and hard stop.

## Verification And Validation

FDP_Codex preserves the V&V distinction.

Validator means deterministic verification gate:

- file exists
- manifest parses
- source paths resolve
- chunk ids are unique
- ledger fields obey schema
- naming follows regex
- required hard-stop terms exist

Evaluator means judgment review:

- user intent fit
- UX quality
- risk envelope adequacy
- OSS readiness
- Layer 1 / Layer 2 conceptual soundness
- whether the project is building the right thing

Validators should be automated first.

Evaluators are not a single rubric. FDP_Codex uses state-code-based evaluation strategy selection. Rubric review, blind independent review, adversarial review, evidence trace review, portfolio balance review, and release readiness review are separate strategy codes that triage chooses according to project state, work track, risk, and hard stops.

Blind independent review and adversarial review are mandatory for high-risk autonomy, release, security, external boundary, false-green, and self-grade-prone work as defined in `docs/policies/triage-strategy.md`.

## Verification Economy

Do not describe deferred verification as skipped verification.

R0/R1 may use deferred or batched verification.

R2 may use conditional batching only with an explicit integration verification point.

R3 requires immediate verification.

Release boundary, externalization boundary, public PR merge, and user-declared hard stops require verification debt repayment.

## Autonomy And Approval

User intervention should be reduced through approval envelopes, not removed by pretending risk is gone.

Operating modes:

- A0 Manual
- A1 Assisted
- A2 Supervised Autopilot
- A3 AutoMerge / Publication

Same-thread heartbeat preserves thread context and is not the default for context-hygiene-sensitive progression.

Fresh-run automation is the preferred autonomous continuation model because it can use handoff and manifest as a bootloader while rebuilding context packs.

Hard stops remain mandatory for R3, license changes, public release, destructive actions, unapproved git publication, new production dependencies, security/data/API/external contract changes, context hygiene violations, manifest ambiguity, and untrusted repository state.

## Fix Plan Discipline

`.flowset/fix_plan.md` is required for live backlog and priority order.

It must not become a completed-history store. Completed evidence belongs in `docs/records/`, `docs/decisions/`, git history, PRs, or handoff summaries.

A missing fix_plan makes work feel scattered even when individual policy files are valid. Therefore FDP_Codex must keep a compact fix_plan from the bootstrap phase onward.

## Triage Strategy

Triage chooses both the next WI and the evaluator strategy. It must balance work tracks instead of selecting only the easiest or most recent track.

The strategy matrix is defined in docs/policies/triage-strategy.md.

## Repository And License

Repository and license binding is defined in docs/decisions/2026-07-08-repository-license-binding.md.

Current locked values:

- GitHub repository: https://github.com/flowcoder2025/FDP_Codex.git.
- Repository visibility: public, after bootstrap publication authorization.
- License: Apache-2.0.

This original operating foundation did not authorize push, merge, tag, release, publication, or public visibility changes. GitHub publication was later authorized by the bootstrap publication envelope; release publication remains excluded.

## Open Decisions

Resolved after this decision:

- Final license: Apache-2.0.
- First public readiness boundary: public bootstrap, pre-release.
- Default verification project profile: Medium during public bootstrap.

Still open:
- First hook implementation surface.
- Chunk id scope.
- Layer 2 project scope code.
- Release category policy.
- KI id severity encoding.
- Default autonomy mode after bootstrap.
- Whether A2 may create new Codex threads or only standalone/project automations.
- Whether A3 is in scope before the local git repository is repaired.
- Local git repository repair or initialization.