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

- Target manifest: machine-readable SSOT registry for target-project chunks, artifact roles, status, local chunk id namespace, and hashes.
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

## Chunk Id Namespace

Layer 2 chunk ids are scoped per target project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

Each target manifest owns its local chunk id namespace. Local target chunk ids must be unique within that target manifest.

Local target chunk ids do not need to be globally unique across all target projects. Reusable local ids such as `flow.current-wi`, `flow.fix-plan`, and `record.context-ledger` are allowed when each id belongs to a different target manifest.

Cross-manifest references must be qualified instead of assuming global uniqueness:

```text
layer1:<chunk_id>
target:<project_scope_code>:<chunk_id>
```

Layer 1 must not store target chunk bodies or treat target-local chunk ids as Layer 1 chunk ids.

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
- The chunk id scope decision used for target manifest chunk ids.

## Generation Gates

Do not generate a Layer 2 target-project scaffold until its project scope code is resolved or explicitly deferred with a hard stop. The first dogfood target satisfies this gate through `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md` with accepted code `FCD`.

Chunk id scope is resolved as per-target-project by `docs/decisions/2026-07-08-layer-2-chunk-id-scope-policy.md`.

Do not use this draft specification to claim a stable public API or external contract.

Do not publish, deploy, package, submit to the OSS program, or enable A3 publication behavior through Layer 2 scaffold generation.

## Command Surface

Layer 1 provides a dependency-free generator and standalone validator:

```text
npm run layer2:generate -- --output <path> --project-id <id> --project-name <name> --scope-code <code> --source-repo <url> --source-commit <sha> --generation-wi <wi> --decision-ref <layer1:chunk>
npm run layer2:validate -- --root <path>
```

The generator must refuse a non-empty output directory. It creates scaffold files only; Git initialization, remotes, push, publication, release, and deployment remain separate approval-bound operations.

The standalone validator must verify required roles, the target WI namespace, per-target chunk ids, registered source hashes, metadata-only context ledger entries, KI and verification-debt fields, Layer 1 provenance, and bootstrap flow continuity.

## Minimal Validator Coverage

Layer 1 validation for this contract must prove:

- the scaffold roles are named;
- Layer 1 and Layer 2 facts remain separated;
- target WI/KI namespaces are separate from Layer 1 WI/KI records;
- target chunk ids are scoped per target project;
- context bodies remain forbidden in ledgers and handoffs;
- provenance is required;
- unresolved scope code decisions block the affected target scaffold;
- an accepted target code, decision reference, and target root are required before generation.

## Decision State

The live Decision Needed queue remains in `.flowset/fix_plan.md`.

WI-CX0038 resolves the first dogfood target scope code as `FCD`. Future target projects still require their own accepted or explicitly deferred scope-code state.