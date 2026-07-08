# Knowledge System Specification

Status: draft.

## Purpose

Define how FDP_Codex organizes knowledge without letting long-lived context contaminate future work.

## Layers

Layer 1 is the repository-level operating system for FDP_Codex itself.

Layer 2 is the portable system FDP_Codex applies to target projects.

Layer 1 may define policies that generate Layer 2 artifacts. Layer 2 records must not be treated as Layer 1 facts unless a Layer 1 policy or decision explicitly imports them.

## Knowledge Types

Policy:

- Normative rule for future work.
- Stored under `docs/policies/`.

Specification:

- Contract or model of a system, artifact, or interface.
- Stored under `docs/specifications/`.

Decision:

- Time-bound choice with context and consequences.
- Stored under `docs/decisions/`.
- May supersede or be superseded.

Runbook:

- Operational procedure.
- Stored under `docs/runbooks/`.

Record:

- Evidence, ledger, result, or historical fact.
- Stored under `docs/records/` or `.flowset/` when it is live session state.

Handoff:

- Session transition aid.
- Not SSOT.
- Must point to SSOT instead of copying it.

Manifest:

- Machine-readable SSOT registry and chunk locator.
- Stored at `docs/manifest.yaml`.

## Freshness

Every normative document should eventually support:

- status
- owner
- created date
- last reviewed date
- supersedes
- superseded by
- related chunks

The v0 scaffold does not require all fields on every document, but the manifest must support adding them.

## Context Pack Selection

A context pack is selected from:

- current WI intent
- risk level
- affected layer
- changed paths
- manifest chunk metadata
- explicit user constraints

The selected pack is temporary. Its body must not be stored in ledgers.

## Layer Crossing

Layer 1 policy can generate Layer 2 artifacts such as:

- target project manifest
- target project handoff
- target project KI ledger
- target project verification debt ledger
- target project context pack contract

Layer crossing must record which Layer 1 policy produced or constrained the Layer 2 artifact.

## Decision Needed

- Whether Layer 2 generated artifacts should use the same folder names or a smaller target-project profile.
- Whether chunk ids should be global, per-layer, or per-target-project scoped.
