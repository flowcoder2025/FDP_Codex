# Decision Queue Policy

Status: draft.

## Purpose

Keep unresolved Decision Needed items visible without letting them contaminate active WI context.

The live queue lives in `.flowset/fix_plan.md`. This policy defines the state codes and required fields for that queue.

## State Codes

`DQ-USER`:

- A user or maintainer preference is required before the item can be closed.
- Codex may draft options, but must not silently choose the final policy.

`DQ-POLICY`:

- A scoped policy WI can propose and validate the answer.
- Codex may proceed inside the approved autonomy envelope when the item does not cross a hard stop.

`DQ-DEBT`:

- The item is acknowledged debt with a repayment trigger.
- It does not block current operating lock unless the trigger is reached.

`DQ-EXTERNAL`:

- The item depends on release, publication, external collaboration, GitHub state, or H1 human maintainer gate.
- It must not be resolved by local implementation alone.

`DQ-ACCEPTED`:

- The item is closed by an accepted decision or policy.
- Accepted items should leave the live queue and move to decisions or records.

## Owner Gates

`CODEX` means Codex may draft and implement the next scoped WI inside the approved envelope.

`USER` means the user must choose or approve the policy direction.

`H1` means a human maintainer gate is required before closure.

`REPO` means repository state, GitHub behavior, or external contribution flow must exist before closure.

## Required Live Queue Fields

Each live Decision Needed row must include:

- item
- state
- owner gate
- lock blocker
- repayment trigger

Lock blocker values are:

- `yes`: blocks `WI-CX0016-docs Operating Policy LOCK`.
- `no`: does not block policy lock.
- `conditional`: blocks only the named target, trigger, or future mode.

## Rules

1. Do not keep free-form Decision Needed bullets in `.flowset/fix_plan.md`.
2. Use a compact table and stable state codes.
3. Do not duplicate the live queue in `docs/decisions/README.md`.
4. A `DQ-USER`, `DQ-EXTERNAL`, or `DQ-ACCEPTED` item must not be closed by validator text alone.
5. A `DQ-DEBT` item must include a repayment trigger.
6. A `DQ-POLICY` item should become a focused WI when it blocks lock or repeated work.

## Decision Needed

- None for the v0 state-code policy.
