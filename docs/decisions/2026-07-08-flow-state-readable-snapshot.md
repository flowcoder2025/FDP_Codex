# Decision: Flow State Readable Snapshot

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0039-docs.

## Context

FDP_Codex currently keeps live flow state in `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

During the Layer 2 scope-code decision boundary, the validator had to distinguish a normal WI current priority from an explicit user-decision wait item. That is valid process state, but relying only on markdown prose makes automation, fresh-session bootstrapping, and validator checks more fragile.

The live Decision Needed queue already carried this as debt: whether current WI and handoff should be split into stricter machine-readable state when parsing becomes ambiguous or repeated validator exceptions appear.

## Decision

Add `.flowset/state.json` as a compact machine-readable Layer 1 flow-state snapshot.

The snapshot records:

- current WI identity and validation record pointer
- current priority kind
- user-decision wait metadata
- triggered work that remains blocked until an external trigger exists
- hard-stop reminders
- context-hygiene flags

The snapshot must be registered in `docs/manifest.yaml` as `flow.state-snapshot` and selected by the WI-start context pack rule.

The validator must check that `.flowset/state.json` agrees with `.flowset/current-wi.md`, `.flowset/fix_plan.md`, and `.flowset/handoff.md`.

## Boundaries

`.flowset/state.json` is an operating-state snapshot, not copied SSOT body content and not a hidden memory store.

It must not store context pack bodies, copied policy text, long summaries, target-project scaffold content, or private FDP_APP product history.

If markdown flow files and the snapshot disagree, validation fails until the active WI restores coherence.

## Consequences

Fresh sessions and automation can load a small structured flow-state chunk before reading larger pointer documents.

The Decision Needed debt item about stricter machine-readable current WI and handoff state is closed for the Layer 1 bootstrap baseline.

Layer 2 project scope code selection remains user-gated.

## Exclusions

This decision does not choose the Layer 2 project scope code rule, generate a Layer 2 target-project scaffold, publish a release, deploy, publish a package, submit an OSS program application, authorize A3 behavior, add a production dependency, change a public API or external contract, or perform destructive filesystem or git operations.
