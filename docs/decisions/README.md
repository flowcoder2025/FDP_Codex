# Decisions

Decision records capture time-bound choices, context, consequences, and supersession.

Current decisions:

- `docs/decisions/2026-07-08-fdp-codex-operating-foundation.md`: accepted-v0 operating foundation for FDP_Codex.
- `docs/decisions/2026-07-08-repository-license-binding.md`: accepted repository remote and Apache-2.0 license.
- `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`: accepted bootstrap publication envelope for GitHub Actions, labels, public visibility, PR merge, and branch deletion.
- `docs/decisions/2026-07-08-public-readiness-boundary.md`: accepted public bootstrap, pre-release boundary.
- `docs/decisions/2026-07-08-evaluation-surface-baseline.md`: accepted evaluation execution surface boundary.
- `docs/decisions/2026-07-08-context-pack-command-surface.md`: accepted stdout-default and explicit ledger-append context pack command surface.

Decision Needed:

- Chunk id scope: global, per-layer, or per-target-project.
- Layer 2 project scope code rule.
- Release category policy.
- KI id severity encoding.
- Default autonomy mode after bootstrap.
- A2/A3 git and continuation scope.
- Branch deletion automation default after squash merge.
- Whether portfolio guardrails become deterministic validator rules.
- Whether every KI must become a GitHub Issue after public release.
- Whether the validator should adopt a strict YAML parser later.
- Whether context pack selection should remain heuristic or move to a stricter rule table.
- Whether handoff maximum line count should be 220, 300, or profile-dependent.
- Whether current WI and handoff should be split into stricter machine-readable state later.
