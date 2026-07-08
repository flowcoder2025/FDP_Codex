# Repository and License Binding

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0006-docs.

## Decision

FDP_Codex uses the following GitHub repository:

```text
https://github.com/flowcoder2025/FDP_Codex.git
```

Current repository visibility is private during bootstrap.

FDP_Codex uses Apache License 2.0.

## Evidence

Local git status:

- `git init` completed successfully after filesystem approval.
- `origin` is set to `https://github.com/flowcoder2025/FDP_Codex.git`.
- `git ls-remote --heads origin` returned a `refs/heads/main` head.
- Local working tree has no commits yet.

License evidence:

- `LICENSE` contains Apache License 2.0 text.
- `LICENSE-CANDIDATE.md` is now a historical decision note, not an open candidate.

## Boundaries

This decision does not authorize push, merge, tag, release, publication, or public visibility changes.

The first public release scope remains Decision Needed.

A3 AutoMerge / Publication remains disabled until the relevant policy, validator, repository synchronization, and approval envelope exist.