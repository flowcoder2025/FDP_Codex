# Repository and License Binding

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0006-docs.

## Decision

FDP_Codex uses the following GitHub repository:

```text
https://github.com/flowcoder2025/FDP_Codex.git
```

Initial repository visibility was private during bootstrap. Repository visibility is now public under `docs/decisions/2026-07-08-bootstrap-publication-envelope.md` and `docs/decisions/2026-07-08-public-readiness-boundary.md`.

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

This decision did not authorize push, merge, tag, release, publication, or public visibility changes at the time it was accepted. Public visibility was later authorized by `docs/decisions/2026-07-08-bootstrap-publication-envelope.md`.

The first public readiness boundary is now defined by `docs/decisions/2026-07-08-public-readiness-boundary.md`.

A3 AutoMerge / Publication remains limited to explicit approval envelopes. Release publication, deployment, package publication, and OSS program submission remain excluded.