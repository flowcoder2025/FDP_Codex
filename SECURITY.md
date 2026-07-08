# Security Policy

Status: scaffold.

Security-impacting changes are R3 by default and require immediate verification.

## R3 Defaults

Classify work as R3 when it touches:

- authentication or authorization
- secrets
- external process execution
- filesystem writes outside the workspace
- network access or downloads
- public APIs or external contracts
- release or publication behavior
- data deletion, migration, or irreversible changes

## Reporting

Until a public security channel is locked, security issues should be recorded as `Decision Needed` in `.flowset/current-wi.md` and triaged before public release.
