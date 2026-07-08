# Layer 2 Chunk Id Scope Policy

Status: accepted.

WI: WI-CX0036-docs.

Date: 2026-07-08.

## Decision

Layer 2 chunk ids are scoped per target project.

Each Layer 2 target manifest owns its local chunk id namespace. A target chunk id must be unique inside its target manifest, but it does not need to be globally unique across all target projects or across Layer 1.

Layer 1 chunk ids remain scoped to the FDP_Codex Layer 1 manifest.

## Qualified References

When a record crosses a manifest boundary, use a qualified reference instead of treating the local chunk id as globally unique.

Allowed reference forms:

```text
layer1:<chunk_id>
target:<project_scope_code>:<chunk_id>
```

If the target project scope code is not approved yet, do not generate target artifacts. A Layer 1 planning record may refer to the target manifest path or provisional target identifier, but it must not mint final target chunk ids.

## Rationale

Global chunk ids were rejected because they create a central registry burden and increase the chance that Layer 1 records accidentally absorb target-project facts.

Per-layer chunk ids were rejected because they separate Layer 1 from Layer 2 but do not distinguish multiple Layer 2 target projects from each other.

Per-target-project chunk ids match the target manifest SSOT model, keep generated projects portable, and allow multiple target projects to reuse familiar local ids such as `flow.current-wi`, `flow.fix-plan`, and `record.context-ledger` without collision.

## Consequences

- Target manifests must validate local chunk id uniqueness.
- Target context ledgers may store local target chunk ids because the ledger belongs to one target project.
- Layer 1 provenance that references target chunks must qualify the target reference or point to the target manifest record.
- Layer 1 `.flowset/context-ledger.jsonl` must not store Layer 2 chunk bodies and must not treat target local chunk ids as Layer 1 chunk ids.
- Derived reports that aggregate multiple target projects must qualify target chunk ids before joining records.

## Boundary

This decision does not generate a Layer 2 target-project scaffold.

This decision does not choose the Layer 2 project scope code rule. That remains user-gated.

This decision does not publish an external contract, release, deployment, package, OSS submission, or A3 publication behavior.