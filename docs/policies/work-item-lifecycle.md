# Work Item Lifecycle Policy

Status: draft.

## Definitions

WI means Work Item. A WI is the smallest planned unit of work with a scope, category, risk level, evidence target, and completion rule.

KI means Known Issue. A KI is a known defect, risk, gap, or unresolved concern that is recorded instead of being hidden in narrative context.

## First-Run Flow

Use this flow when a target project or project area is being established for the first time:

1. Requirements discussion
2. Specification
3. Design or policy decision
4. Implementation
5. Verification
6. Documentation and handoff
7. GitHub or publication step when applicable, using `docs/policies/git-workflow.md`
8. New session with fresh context pack

## Recurring Flow

Use this flow after the initial baseline exists:

1. Triage
2. Design or policy decision
3. Implementation
4. Verification
5. Documentation and handoff
6. GitHub or publication step when applicable, using `docs/policies/git-workflow.md`
7. New session with fresh context pack

## WI Fields

A WI should record:

- id
- category
- title
- layer
- risk level
- scope
- selected context chunks
- verification plan
- completion evidence
- open KI or Decision Needed items

## WI Naming Rule

Layer 1 WI ids must include category:

```text
WI-CXNNNN-category
```

The category set, commit subject, PR title, and branch format are defined in `docs/policies/naming-and-commits.md`.

`WI-0001` is a bootstrap alias for `WI-CX0001-docs`. New WIs must use the category-bearing form.

## KI Fields

A KI should record:

- id
- title
- severity
- owner or ownership status
- trigger
- defer reason
- repayment condition
- hard stop
- current status

GitHub Issue handling for KI repayment and external intake is defined in `docs/policies/github-issue-governance.md`.


## KI Identity Rule

KI ids are stable identifiers. They must not encode severity.

Severity is a field-only classification. It may change during triage without renaming the KI, GitHub Issue, validation record, or repayment reference.

A KI id may encode repository/project namespace, sequence, or category only after a later naming policy explicitly defines that format.

Use severity labels, severity fields, and queue state to express urgency rather than changing the id.

## KI Severity

Critical:

- Must be scheduled for the next session or next WI unless the user explicitly overrides with a recorded reason.

High:

- Must be repaid before release, externalization, public PR merge, or the declared hard stop.

Medium:

- May remain as debt when the defer reason and repayment boundary are explicit.

Low:

- May be batched for later repayment, but must not disappear from records.

Critical and unresolved High KI items should be promoted to GitHub Issues before external collaboration or public merge boundaries.

## Layer Rule

Layer 1 WIs govern FDP_Codex itself.

Layer 2 WIs govern target-project artifacts generated or managed by FDP_Codex.

Do not move a Layer 2 KI into Layer 1 handoff unless it affects the FDP_Codex tool or policy itself.

## Completion Rule

A WI is complete only when the declared evidence exists, verification is completed or recorded as verification debt under policy, SSOT updates are made, and handoff records the next action.

## Decision Needed

- Whether Layer 2 target projects must use `TG` or derive their own two-to-four-letter project code.
- Whether KI ids should include severity in the id or keep severity as a field only.