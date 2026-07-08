# Validation Record: WI-CX0008-ci

Date: 2026-07-08

WI: WI-CX0008-ci Manifest Validator

Branch: wi/cx0007-docs-github-workflow-governance

Risk: R2

## Scope Validated

- Added `package.json` with `npm run validate`.
- Added `scripts/validate-repo.mjs`.
- Registered tool chunks in `docs/manifest.yaml`.
- Validated required file presence.
- Validated manifest always-on entries, chunk ids, source paths, and body carryover policy.
- Validated context ledger JSON lines, allowed fields, hashes, and source paths.
- Validated WI and fix_plan naming categories.
- Validated branch format with unborn-bootstrap exception.
- Validated GitHub governance labels, PR template gates, issue templates, and approval gate.

## Command

```powershell
npm.cmd run validate
```

## Result

`npm run validate` exited 0.

Important output:

```json
{
  "ok": true,
  "required_files_missing": [],
  "manifest_missing_always_on_ids": [],
  "manifest_missing_required_ids": [],
  "manifest_missing_sources": [],
  "manifest_duplicate_ids": [],
  "ledger_forbidden_fields": [],
  "ledger_invalid_json_lines": [],
  "ledger_missing_hash_lines": [],
  "ledger_missing_sources": [],
  "fix_plan_invalid_wi_ids": [],
  "github_missing_labels": [],
  "errors": []
}
```

Warning:

- `git.bootstrap_unborn_branch`: repository has no local commit yet, so branch-to-WI mismatch is allowed only until bootstrap reconciliation.

## Git Boundary

- No local commit was created.
- No push was performed.
- No PR was opened.
- No merge, tag, release, visibility change, remote label mutation, or GitHub Actions workflow was performed.

## Residual Risk

- The validator uses a manifest-subset parser instead of a full YAML parser to avoid adding a dependency during bootstrap.
- The bootstrap branch exception must become a hard error after the first local commit or approved reconciliation path.
- GitHub Actions integration is deferred because it changes remote CI behavior once pushed.