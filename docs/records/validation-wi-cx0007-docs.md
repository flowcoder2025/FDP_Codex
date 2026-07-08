# Validation Record: WI-CX0007-docs

Date: 2026-07-08

WI: WI-CX0007-docs GitHub Workflow and Issue Governance

Branch: wi/cx0007-docs-github-workflow-governance

Risk: R2

## Scope Validated

- Added `docs/policies/git-workflow.md`.
- Added `docs/policies/github-issue-governance.md`.
- Added GitHub PR and Issue templates.
- Added `.github/labels.yml` and `docs/runbooks/github-label-setup.md` without mutating remote labels.
- Updated `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `docs/index.md`, and lifecycle references.
- Registered new policy, template, label, and runbook chunks in `docs/manifest.yaml`.
- Reordered `fix_plan` so `WI-CX0008-ci Manifest Validator` validates the GitHub workflow and issue governance policies.

## Commands

```powershell
git branch --show-current
git status --short --branch
git ls-remote --heads origin wi/cx0007-docs-github-workflow-governance
```

Manifest and ledger validation used a PowerShell check for required files, manifest source paths, duplicate chunk ids, forbidden ledger fields, fix_plan ordering, GitHub governance registration, and PR template gates.

## Results

- `current_branch`: `wi/cx0007-docs-github-workflow-governance`
- `branch_ok`: true
- `required_files_missing`: []
- `manifest_sources_missing`: []
- `manifest_duplicate_ids`: []
- `ledger_forbidden_fields`: []
- `fix_plan_reordered`: true
- `git_workflow_registered`: true
- `github_governance_registered`: true
- `github_templates_registered`: true
- `approval_gate_present`: true
- `pr_template_wi_gate_present`: true
- `remote_wi_branch_exists`: false

## Git Boundary

- No commit was created.
- No push was performed.
- No PR was opened.
- No merge, tag, release, visibility change, or remote label mutation was performed.

## Residual Risk

- The GitHub labels are defined locally but not applied to the remote repository.
- The first bootstrap publication still needs a reconciliation path because remote `main` already contains an initial Apache-2.0 `LICENSE` commit.
- The policy remains draft until it is locked by a later operating-policy WI.