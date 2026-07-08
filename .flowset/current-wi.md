# Current WI

WI id: WI-CX0015-docs

Category: docs

Title: OSS Readiness Baseline

Layer: Layer 1

Risk: R2

Status: validated

Branch: wi/cx0015-docs-oss-readiness-baseline

Approval envelope: user approved autonomous process continuation, GitHub Actions addition, remote label mutation, public visibility conversion, PR merge, and branch deletion. Deployment, release publication, and OSS program submission remain excluded.

## Scope

Define the first public readiness boundary and align public-facing repository documents for external inspection and contributor intake.

## Verification Plan

- Rebuild context pack metadata for `oss-readiness`.
- Run `npm run validate`.
- Run `npm run context:pack` for the changed public-readiness surface.
- Review README, contribution, security, roadmap, issue forms, manifest, fix_plan, and handoff for public-scope consistency.
- Confirm no deployment, release publication, tag creation, package publication, or OSS program submission occurred.

## Completion Evidence

- `docs/decisions/2026-07-08-public-readiness-boundary.md`
- `docs/records/validation-wi-cx0015-docs.md`
- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `ROADMAP.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/known_issue.yml`
- `.github/ISSUE_TEMPLATE/contribution_intake.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `scripts/validate-repo.mjs`

## Decision Needed

- None for WI-CX0015-docs.