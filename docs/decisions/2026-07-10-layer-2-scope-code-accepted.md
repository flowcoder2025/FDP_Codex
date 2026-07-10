# Decision: Layer 2 Dogfood Scope Code Accepted

Status: accepted.

Date: 2026-07-10.

WI: WI-CX0038-docs.

## Context

WI-CX0034 prepared Layer 2 project scope code options and WI-CX0037 handed the remaining choice back to the user. The user selected the recommended mnemonic-code option and named a separate dogfood target so Layer 1 repository facts and Layer 2 target-project facts can remain isolated.

The accepted dogfood target is outside the FDP_Codex repository:

```text
C:\dev\FDP_Codex_Dogfood
```

## Decision

The first Layer 2 dogfood target uses:

- target project identifier: `fdp-codex-dogfood`;
- target root: `C:\dev\FDP_Codex_Dogfood`;
- project scope code: `FCD`;
- scope code status: `accepted`;
- target WI pattern: `WI-FCDNNNN-category`.

`FCD` satisfies the accepted mnemonic-code constraints: it is 2-6 uppercase alphanumeric characters, starts with a letter, is not `CX`, and is reserved for this target within the current FDP_Codex workspace.

The generated target manifest must include:

```yaml
project_scope_code: FCD
scope_code_status: accepted
scope_code_decision_ref: layer1:decision.layer-2-scope-code-accepted
```

Layer 2 chunk ids remain scoped per target project. Cross-manifest references use `layer1:<chunk_id>` or `target:FCD:<chunk_id>`.

## Consequences

The Layer 2 scope-code Decision Needed row is resolved and leaves the live queue. Temporary `TG` examples remain historical fallback examples only and must not be used by the dogfood target.

After this decision is merged, WI-CX0055-feat may generate and validate the first Layer 2 scaffold at the accepted target root. The target's first bootstrap WI will use the `WI-FCDNNNN-category` namespace.

The A2 runner remains paused. Dogfood generation is performed as an explicitly supervised Layer 1 WI and does not reactivate or expand automation authority.

## Boundary

This decision does not itself create the dogfood directory or generate Layer 2 files. It does not publish a release, deploy, publish a package, submit to an OSS program, enable A3 publication behavior, add a production dependency, change a public API or external contract, execute S2 review, create a separate reviewer, or reactivate the A2 runner.
