# Decision: KI Identity Severity Policy

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0023-docs.

## Context

Known Issue severity can change during triage as evidence improves or risk is repaid.

If severity is encoded in the KI id, severity changes would require renaming records, GitHub Issues, labels, handoff references, and repayment links. That makes audit history fragile.

## Decision

KI ids must not encode severity.

Severity remains a field-only classification.

A KI id is a stable reference for records, GitHub Issues, validation evidence, and repayment tracking.

Urgency is expressed through the severity field, labels, queue state, hard stops, and repayment trigger, not by changing the id.

Future KI naming work may define namespace, sequence, or category rules, but it must preserve the field-only severity rule.

## Consequences

Changing severity does not require id churn.

GitHub Issue labels such as `ki:critical`, `ki:high`, `ki:medium`, and `ki:low` remain valid operational severity indicators.

The `KI id severity encoding` Decision Needed item is closed and should leave the live queue.

## Exclusions

This decision does not choose Layer 2 project codes, publish a release, deploy, publish a package, submit an OSS program application, or require every KI to become a GitHub Issue immediately.