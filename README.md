# FDP_Codex

FDP_Codex is a Codex-native, open workflow kit for running FDP-style AI development work with explicit context hygiene, SSOT-backed documentation, WI/KI lifecycle management, and risk-aware verification.

This repository is not a public dump of FDP_APP. FDP_APP is used only as read-only reference material while this project defines its own open, Codex-compatible structure.

## Current Status

Status: initial scaffold.

The current focus is not feature completeness or OSS program submission. The current focus is to establish the repository operating system:

- context hygiene first
- `docs/manifest.yaml` as a machine-readable SSOT registry
- standard documentation categories under `docs/`
- Layer 1 and Layer 2 knowledge boundaries
- WI/KI lifecycle policy
- branch-first Git and PR lifecycle policy
- GitHub Issue governance for KI repayment and external intake
- deferred and batched verification policy

## Repository Structure

```text
AGENTS.md
README.md
LICENSE-CANDIDATE.md
CONTRIBUTING.md
SECURITY.md
ROADMAP.md
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
  context-ledger.jsonl
  handoff.md
```

## Operating Model

Codex agents should start with `AGENTS.md`, then `docs/manifest.yaml`, then only the chunks required for the current WI.

Context packs are ephemeral. The ledger keeps only metadata about loaded chunks. Chunk bodies and active context must not be carried across WI or session boundaries.

Work proceeds by WI branch, validation, PR review, and handoff. GitHub Issues are used for KI repayment and contributor intake, but external submissions do not become Codex work until they are explicitly approved.

## Validation

```bash
npm run validate
```

The validator uses Node.js standard libraries only and does not install production dependencies.

## Context Pack Metadata

```bash
npm run context:pack -- --intent context-pack-building --risk R2 --changed docs/manifest.yaml
```

The context pack builder outputs metadata only. It does not output chunk bodies.

## License

FDP_Codex is licensed under the Apache License 2.0. See LICENSE.

The GitHub repository is public after bootstrap publication: https://github.com/flowcoder2025/FDP_Codex.git.
