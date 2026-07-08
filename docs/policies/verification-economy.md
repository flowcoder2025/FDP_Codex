# Verification Economy Policy

Status: draft.

## Purpose

Scale verification effort to risk and project size without calling deferred verification a skip.

## Risk Levels

R0:

- Documentation formatting
- Typo fixes
- Non-behavioral metadata
- Local comments that do not affect generated artifacts

Default: deferred or batched verification allowed.

R1:

- Low-risk local document changes
- Non-contractual examples
- Minor scaffolding that does not affect execution, security, public API, or release behavior

Default: deferred or batched verification allowed with a repayment point.

R2:

- User-visible workflow changes
- Policy changes that affect future work
- Manifest or SSOT changes
- Cross-document consistency changes

Default: conditional batching allowed only with an explicit integration verification point.

R3:

- Security
- Data loss or data migration
- Public API
- External contract
- Release or publication
- Licensing
- Irreversible filesystem or git behavior
- Network or dependency behavior

Default: immediate verification required.

## Verification Debt

Verification debt is allowed only when:

- the risk level allows deferral,
- the repayment point is recorded,
- the hard stop is recorded,
- the debt is visible in records or handoff.

Verification debt is not allowed past:

- release boundary
- externalization boundary
- public PR merge
- security-impacting publication
- user-declared hard stop

## Project Profiles

Small:

- Prefer batched verification for R0/R1.
- Verify R2 at integration points.
- Verify R3 immediately.

Medium:

- Batch R0.
- Batch R1 when localized.
- Verify R2 before merge or publication boundary.
- Verify R3 immediately.

Large:

- Batch only R0 by default.
- R1 requires explicit repayment point.
- R2 and R3 verify before merge or immediately as policy requires.

Critical:

- R0 may batch only when isolated.
- R1 and above require explicit verification before merge or publication.
- R3 requires immediate verification.

## FDP_Codex Default

FDP_Codex uses the Medium project profile during the public bootstrap pre-release baseline.

Release-candidate work may adopt a stricter profile through a decision record.

## Decision Needed

- Whether public examples should include intentionally deferred verification debt.
