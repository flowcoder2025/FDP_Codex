# Contributing

Status: scaffold.

Contributions should preserve the repository operating model before adding features.

## Required Discipline

- Do not add private FDP_APP history or proprietary implementation detail.
- Do not add long-lived context bodies to ledgers.
- Update `docs/manifest.yaml` when adding or moving policy, specification, decision, runbook, or record documents.
- Mark unresolved policy choices as `Decision Needed`.
- Classify verification risk before merging or publishing work.
- Use a WI branch for non-trivial work.
- Link PRs to the related WI, validation record, and KI issue when applicable.
- Treat new Issues and PRs as intake until they are triaged and approved for work.

## Expected Flow

1. Define or select a WI.
2. Build a fresh context pack from `docs/manifest.yaml`.
3. Create a branch using the format in `docs/policies/naming-and-commits.md`.
4. Implement or document the change.
5. Verify according to the risk profile.
6. Update records and handoff without turning them into SSOT.
7. Run `npm run validate` when repository policy or manifest files change.
8. Open a PR when git publication is approved.
9. Leave clear next-WI candidates.
