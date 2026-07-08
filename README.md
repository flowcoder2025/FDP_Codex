# FDP_Codex

FDP_Codex is a Codex-native open workflow kit for running FDP-style AI development work with explicit context hygiene, SSOT-backed documentation, WI/KI lifecycle management, and risk-aware verification.

This repository is not a public dump of FDP_APP. FDP_APP is read-only reference material for the original workflow idea; FDP_Codex defines its own open, Apache-2.0, Codex-compatible structure.

## Status

Status: public bootstrap, pre-release.

The repository is public for inspection, issue intake, and process hardening. It has not published a tagged release, package, deployment, or OpenAI OSS program submission.

Current baseline:

- Apache-2.0 license is selected and published.
- `docs/manifest.yaml` is the machine-readable SSOT and chunk registry.
- Context packs are metadata-only and must not carry chunk bodies across WI or session boundaries.
- WI/KI lifecycle, branch-first Git workflow, GitHub issue governance, and risk-aware verification policies exist as draft or accepted-v0 policy surfaces.
- GitHub Actions runs `npm run validate` for PRs and `main` pushes.
- Public issues and PRs are treated as intake until triaged and approved.

Not in scope yet:

- release tags or release notes
- npm or package publication
- deployment automation
- OpenAI OSS program application or submission
- compatibility promises for downstream projects
- private FDP_APP implementation history

## Repository Structure

```text
AGENTS.md
README.md
CONTRIBUTING.md
SECURITY.md
ROADMAP.md
LICENSE
docs/
  index.md
  manifest.yaml
  policies/
  specifications/
  decisions/
  runbooks/
  records/
.flowset/
  current-wi.md
  fix_plan.md
  context-ledger.jsonl
  handoff.md
.github/
  ISSUE_TEMPLATE/
  workflows/
```

## Operating Model

Codex agents start with `AGENTS.md`, then `docs/manifest.yaml`, then only the chunks required for the current WI.

Work proceeds through WI triage, design, implementation, verification, documentation and handoff, GitHub PR, merge, and fresh-session continuation. GitHub Issues are used for KI repayment and contributor intake, but external submissions do not become Codex work until they are explicitly approved by policy or maintainer instruction.

Context packs are ephemeral. The ledger stores metadata only: chunk id, source, hash, load reason, decision reference, actor, and timestamp. Chunk bodies and active context must not be carried across WI or session boundaries.

## Validation

```bash
npm run validate
```

The validator uses Node.js standard libraries only and does not install production dependencies.

## Context Pack Metadata

```bash
npm run context:pack -- --wi WI-CX0015-docs --intent oss-readiness --risk R2 --changed README.md
```

The context pack builder outputs metadata only. It does not output chunk bodies.

## Contributing

Read `CONTRIBUTING.md` before opening issues or PRs. Public submissions are welcome as intake, but they are not automatic work authorization for Codex or maintainers.

## Security

Read `SECURITY.md` before reporting security-sensitive behavior. Do not post secrets, exploit details, or private FDP_APP material in public issues.

## License

FDP_Codex is licensed under the Apache License 2.0. See `LICENSE`.

Repository: https://github.com/flowcoder2025/FDP_Codex.git