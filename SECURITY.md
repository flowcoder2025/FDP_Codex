# Security Policy

Status: public baseline.

FDP_Codex is public but pre-release. No tagged release, package, deployment, or downstream compatibility promise exists yet.

## Supported Versions

| Version | Supported |
| --- | --- |
| `main` | Best-effort policy and tooling hardening |
| Tagged releases | None yet |

## Reporting

Do not post secrets, credentials, exploit chains, private FDP_APP material, or sensitive operational details in public issues.

If GitHub private vulnerability reporting is available for this repository, use it for sensitive reports. If it is not available, open a minimal Contribution Intake issue titled `Security contact request` and include only non-sensitive routing information.

For non-sensitive security policy gaps, use the Known Issue form and mark the severity clearly.

## Maintainer Handling

Security-impacting work is R3 by default. R3 work requires immediate verification and must stop for approval when it touches:

- authentication or authorization
- secrets
- filesystem writes outside the workspace
- network access or downloads
- public APIs or external contracts
- release, package publication, deployment, or irreversible repository behavior
- data deletion, migration, or destructive automation

Security reports are operational records. Policy changes still require a merged decision or policy update before they override the repository SSOT.