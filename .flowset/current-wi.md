# Current WI

WI id: WI-CX0038-docs

Category: docs

Title: Layer 2 Scope Code Accepted Decision

Layer: Layer 1

Risk: R1

Status: validated

Branch: wi/cx0038-docs-layer-2-scope-code-accepted-decision

Approval envelope: the user selected the recommended mnemonic-code option and approved recording `FCD` for the separate dogfood target at `C:\dev\FDP_Codex_Dogfood`, publishing and merging this WI, and then generating the first Layer 2 dogfood scaffold through a separate WI. Existing exclusions remain: deployment, release publication, package publication, OSS program submission, license changes, new production dependencies, destructive operations outside the approved target-directory creation, public API or external contract changes, A3 publication behavior, automation reactivation or authority expansion, separate reviewer creation, and S2 execution.

## Scope

Record the accepted Layer 2 dogfood project scope code, target identity, target root, WI namespace, and required target-manifest fields. Resolve the live scope-code decision queue and advance to the first scaffold generation WI without creating Layer 2 files in this WI.

## Triage

- PSC: P1
- WTC: KNOW
- Risk: R1
- ESC: E1+E3+E5+E6
- Primary evaluator stance: accept the user choice while preserving the Layer 1/Layer 2 boundary and staged dogfood sequence.
- Validator stance: require the exact target id, path, code, WI pattern, manifest fields, resolved queue state, next WI, and no-generation boundary.

## Verification Plan

- Record `fdp-codex-dogfood`, `C:\dev\FDP_Codex_Dogfood`, and accepted code `FCD` in a Layer 1 decision.
- Lock the Layer 2 WI pattern to `WI-FCDNNNN-category` for this target.
- Require `project_scope_code`, `scope_code_status`, and `scope_code_decision_ref` in the future target manifest.
- Remove the resolved scope-code row from the live Decision Needed queue.
- Advance the next Layer 1 priority to WI-CX0055-feat First Layer 2 Dogfood Scaffold Generation.
- Keep the A2 runner paused and preserve unrelated publication, dependency, authority, and review hard stops.
- Update historical handback status without rewriting its original recommendation evidence.
- Run `node --check scripts\validate-repo.mjs`, `npm run validate`, `npm run ci:check`, and `git diff --check`.

## Completion Evidence

- `docs/decisions/2026-07-10-layer-2-scope-code-accepted.md`
- `docs/records/validation-wi-cx0038-docs.md`
- `docs/policies/naming-and-commits.md`
- `docs/specifications/knowledge-system.md`
- `docs/specifications/layer-2-knowledge-scaffold.md`
- `docs/records/layer-2-scope-code-decision-handback-2026-07-08.md`
- `.flowset/state.json`
- `.flowset/current-wi.md`
- `.flowset/fix_plan.md`
- `.flowset/handoff.md`
- `docs/manifest.yaml`
- `docs/index.md`
- `docs/decisions/README.md`
- `docs/records/README.md`
- `scripts/validate-repo.mjs`

## Decision Needed

- No Layer 2 scope-code decision remains. `FCD` is accepted for `fdp-codex-dogfood`.
- WI-CX0055-feat may generate the first scaffold only after this WI is merged.
- S2 blind review repayment remains DQ-DEBT before generalized A2/A3 expansion.
