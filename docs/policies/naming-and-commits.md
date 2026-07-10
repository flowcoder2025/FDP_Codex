# Naming and Commit Policy

Status: accepted-v0.

## Purpose

Keep WI names, branches, PR titles, and commit subjects sortable and auditable.

This policy adapts the category-based FDP_APP convention for FDP_Codex without copying FDP_APP's private stage numbering.

## WI Identifier

Canonical Layer 1 WI id:

```text
WI-CXNNNN-category
```

Example:

```text
WI-CX0002-docs
```

Parts:

- `WI`: Work Item.
- `CX`: FDP_Codex repository scope.
- `NNNN`: zero-padded sequence number.
- `category`: one allowed work category.

Bootstrap exception:

- `WI-0001` is a pre-policy bootstrap alias for `WI-CX0001-docs`.
- New references should use the canonical category-bearing form.
- New WIs must not use the old short form.

Layer 2 generated target projects use the project scope code accepted by their target manifest and Layer 1 provenance decision:

```text
WI-<PROJECT_CODE><NNNN>-<category>
```

The first dogfood target `fdp-codex-dogfood` uses `WI-FCDNNNN-category`.

`TG` is only a temporary fallback for a target whose manifest explicitly records `scope_code_status: temporary`. It must not be used for the accepted dogfood target.

## Allowed Categories

Use the FDP-compatible category set:

- `feat`: user-facing or workflow capability
- `fix`: defect correction
- `docs`: documentation, policy, specification, decision, handoff, or record work
- `style`: formatting-only change
- `refactor`: internal restructuring without intended behavior change
- `test`: tests or validation assets
- `chore`: maintenance with no product or policy contract change
- `perf`: performance improvement
- `ci`: CI, automation, or repository gate behavior
- `revert`: revert of prior work

Security-impacting work remains R3 under verification policy. Do not invent a `security` category unless a later decision locks it.

## Commit Subject

Commit subject format:

```text
WI-CXNNNN-category: concise imperative summary
```

Examples:

```text
WI-CX0002-docs: add naming and commit policy
WI-CX0003-ci: add manifest validator
```

## PR Title

PR title format:

```text
WI-CXNNNN-category concise summary
```

Example:

```text
WI-CX0002-docs naming and commit policy
```

## Branch Name

Branch format:

```text
wi/cxNNNN-category-short-slug
```

Example:

```text
wi/cx0002-docs-naming-commit-policy
```

Branch lifecycle, PR readiness, merge approval, and branch deletion rules are defined in `docs/policies/git-workflow.md`.

## Handoff Rule

Handoff entries should refer to the canonical WI id first. Avoid title-only references.

## Decision Needed

Live unresolved policy items are tracked only in `.flowset/fix_plan.md` under the Decision Needed Queue.
