# WI-CX0003-docs Validation Record

Status: passed.

Scope: Autonomy and Approval Envelope Policy.

## Checks

Autonomy policy file:

- Result: passed.
- Evidence: `docs/policies/autonomy-and-approval.md` exists.

Manifest YAML parsing:

- Result: passed.
- Evidence: PyYAML loaded `docs/manifest.yaml`.

Manifest source paths:

- Result: passed.
- Evidence: validation command reported no missing manifest sources.

Operating modes:

- Result: passed.
- Evidence: policy documents A0 Manual, A1 Assisted, A2 Supervised Autopilot, and A3 AutoMerge / Publication.

Approval envelope and hard stops:

- Result: passed.
- Evidence: policy documents approval envelope fields and hard stop categories.

Handoff update:

- Result: passed.
- Evidence: `.flowset/handoff.md` references `WI-CX0003-docs` and fresh-run automation guidance.

Ledger body storage:

- Result: passed.
- Evidence: validation command reported no forbidden ledger fields.

## Known Limits

- A2 automation is policy-defined but not implemented.
- A3 AutoMerge / Publication is not enabled.
- The local `.git` directory exists but is not a valid git repository.