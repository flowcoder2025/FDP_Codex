# Layer 2 Knowledge Scaffold Specification

Status: draft.

WI: WI-CX0032-docs.

## Purpose

Define the portable target-project knowledge scaffold that FDP_Codex may generate or maintain for Layer 2 projects.

This specification is a Layer 1 contract about future Layer 2 artifacts. It does not generate a target-project scaffold, does not publish an external contract, and does not authorize release, deployment, package publication, OSS program submission, or A3 publication behavior.

## Layer Boundary

Layer 1 owns FDP_Codex policies, validators, manifest rules, context-pack tooling, and generation constraints.

Layer 2 owns target-project facts, target-project WIs, target-project KIs, target-project verification debt, target-project handoffs, and target-project ledgers.

Layer 2 records must not be treated as Layer 1 facts unless a Layer 1 policy or decision explicitly imports them.

Layer 1 records must not copy private target-project history or target-project SSOT bodies into `.flowset/context-ledger.jsonl`, Layer 1 validation records, or Layer 1 handoffs.

## Required Scaffold Roles

A generated Layer 2 scaffold must define these roles before target-project work starts:

- Target manifest: machine-readable SSOT registry for target-project chunks, artifact roles, status, and hashes.
- Target current WI: the active target-project work item, separate from Layer 1 `WI-CXNNNN-category` work.
- Target fix plan: compact live target-project backlog, KI repayment queue, and Decision Needed queue.
- Target handoff: session transition aid that points to target SSOT instead of copying target SSOT bodies.
- Target context ledger: append-only metadata ledger for target-project context selection.
- Target KI registry or issue bridge: known issue records with field-only severity and explicit repayment boundaries.
- Target verification debt registry: deferred validation with risk level, repayment point, hard stop, and owner.
- Layer 1 provenance record: the FDP_Codex policy, WI, commit, and manifest chunk that produced or constrained the target scaffold.

## WI And KI Separation

Target-project WIs must use a target-project namespace and must not reuse Layer 1 `WI-CXNNNN-category` identifiers.

Target-project KIs must remain separate from Layer 1 KIs unless the issue affects FDP_Codex tooling, policy, automation, or generated scaffold correctness.

KI severity remains a field-only classification. Severity must not be encoded into KI ids.

A target-project KI may be promoted into a Layer 1 KI only through explicit triage that records the Layer 1 impact and source target-project evidence.

## Context Hygiene

A target context pack is temporary and must be rebuilt from the target manifest for each target WI.

A target context ledger must record metadata only: timestamp, target WI id, chunk id, source, hash, load reason, decision reference, and actor.

A target context ledger must be append-only. Dedupe or reporting must be derived and metadata-only.

Layer 1 must not carry Layer 2 context bodies across WI or session boundaries.

## Provenance

Every generated Layer 2 scaffold must record:

- FDP_Codex repository URL.
- FDP_Codex commit or release reference used for generation.
- Layer 1 WI id that generated or updated the scaffold.
- Manifest chunk ids that constrained generation.
- Whether user decisions were required or deferred.
- The target-project identifier and scope code once that rule is approved.

## Generation Gates

Do not generate the first Layer 2 target-project scaffold until these live Decision Needed items are resolved or explicitly deferred with a hard stop:

- Layer 2 project scope code rule.
- Chunk id scope: global, per-layer, or per-target-project.

Do not use this draft specification to claim a stable public API or external contract.

Do not publish, deploy, package, submit to the OSS program, or enable A3 publication behavior through Layer 2 scaffold generation.

## Minimal Validator Coverage

Layer 1 validation for this contract must prove:

- the scaffold roles are named;
- Layer 1 and Layer 2 facts remain separated;
- target WI/KI namespaces are separate from Layer 1 WI/KI records;
- context bodies remain forbidden in ledgers and handoffs;
- provenance is required;
- unresolved scope and chunk namespace decisions block the first generated target scaffold.

## Decision Needed

The live Decision Needed queue remains in `.flowset/fix_plan.md`.

This WI does not decide the Layer 2 project scope code rule and does not decide chunk id namespace scope.