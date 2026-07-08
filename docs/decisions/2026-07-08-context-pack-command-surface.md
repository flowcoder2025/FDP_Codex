# Decision: Context Pack Command Surface

Status: accepted.

Date: 2026-07-08.

WI: WI-CX0020-feat.

## Context

FDP_Codex needs a Codex-native context hygiene surface that can rebuild selected SSOT chunks for each WI without carrying bodies forward.

The first builder already selected metadata from `docs/manifest.yaml`, but the contract did not settle whether runs should mutate the context ledger or remain stdout-only.

## Decision

The context pack builder is stdout-only by default.

`npm run context:pack` writes metadata JSON to stdout and includes selected chunk ids, source paths, hashes, load reasons, decision refs, and `ledger_append` status.

Ledger mutation is explicit. The builder appends records to `.flowset/context-ledger.jsonl` only when `--append-ledger` is present.

The append mode records one metadata-only ledger line per selected chunk using the allowed ledger fields in `docs/manifest.yaml`.

The command accepts `--actor`, defaulting to `codex`, for ledger records.

Context pack body files are not part of v0. The builder must not write chunk bodies or reusable body dumps to disk.

## Consequences

WI start can record selected context by using `--append-ledger`, while exploratory runs can inspect stdout without mutating repository state.

The validator can enforce the command contract without relying on large context dumps.

Future work can tighten selection rules without changing the stdout-default and explicit-append boundary.

## Exclusions

This decision does not publish a release, deploy, publish a package, submit an OSS program application, create a hidden memory store, or authorize context body carryover.
