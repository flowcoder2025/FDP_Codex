# Ephemeral Worker Runner

Status: implemented-v1.

## Purpose

Run one ephemeral Codex CLI worker with observable output, a finite deadline, and verified cleanup of its exact process tree.

## Command

```text
npm run worker:run -- --cwd <path> [--timeout-ms <ms>] [--sandbox read-only|workspace-write]
```

The prompt is required on stdin. `danger-full-access` is not accepted. The wrapper invokes:

```text
codex exec --ephemeral --json --color never --sandbox <mode> -C <path> -
```

The final `-` makes Codex read the prompt from stdin. The wrapper does not write a prompt file or include the prompt in argv.

## Input Limits

- `--cwd` defaults to the current directory and must exist.
- `--timeout-ms` defaults to 120000 and must be between 1000 and 1800000.
- `--sandbox` defaults to `workspace-write` and accepts only `read-only` or `workspace-write`.
- stdin must contain a non-empty UTF-8 prompt no larger than 1 MiB.
- `CODEX_CLI_PATH` may identify an explicit Codex executable. On Windows, the npm-installed `codex.js` shim target is preferred when present.

## Event Stream

The wrapper writes one JSON object per line to stdout. Event types are:

- `worker.started`
- `worker.stdout`
- `worker.stderr`
- `worker.timeout`
- `worker.interrupted`
- `worker.observation_error`
- `worker.result`
- `worker.wrapper_error`

Codex JSONL stdout is parsed and nested under the `payload` field. Non-JSON stdout and stderr remain text payloads. The wrapper keeps only counters and observed process metadata in memory; it does not create a persistent event log.

## Process Tracking

The direct child starts with `shell: false` and a hidden window on Windows. The supervisor periodically records the root and descendant process identities:

- pid
- parent pid
- executable name
- process start time
- process group id on POSIX

Windows obtains process metadata from `Get-CimInstance Win32_Process`. POSIX starts the worker in its own process group and obtains metadata from `ps -eo pid=,ppid=,pgid=,lstart=,comm=`. The process group keeps already observed descendants discoverable after the root exits.

The first root observation must not depend on a mutable executable label. It confirms the spawned pid against the supervisor parent pid and, on POSIX, the dedicated process group id before recording the operating-system start time and current name. Later observations use the recorded start time first and the executable name only as a fallback, protecting against both runtime title changes and terminating an unrelated process after pid reuse. New descendants of already observed processes are added while the run is active, but a candidate with a parseable start time earlier than its observed parent or process-group root is rejected as stale parent-pid metadata.

## Completion And Cleanup

Normal completion succeeds only when the root exits with code 0, process observation succeeds, and no observed descendant remains.

Timeout and interruption cleanup:

1. Refresh the observed process tree.
2. Match current processes against observed identities.
3. Signal deepest descendants before parents.
4. Wait for the grace period.
5. Force remaining matched processes where the platform supports a distinct force signal.
6. Re-observe until every matched identity is gone or the verification deadline expires.

The final result contains root and descendant pids, line counts, timeout/interruption flags, exit information, observation errors, cleanup targets, confirmed-gone pids, identity mismatches, residual pids, and cleanup verification status.

Exit codes are 0 for verified normal completion, 124 for timeout, 130 for interruption, and 1 for wrapper, worker, observation, residual-process, or cleanup failure.

## Local Verification

```text
npm run worker:test
npm run worker:smoke-local
```

`worker:test` uses a deterministic Node fixture that creates a root, child, and grandchild. It validates normal output capture, timeout cleanup, and interruption cleanup. `worker:smoke-local` runs `codex exec --help` through the same supervisor without sending a repository prompt to a model provider.

A live model smoke is a separate data and network boundary. It must be explicitly approved when the execution environment requires that approval.

The controller must use the wrapper's internal timeout or an interrupt signal as the normal stop path. Force-killing the wrapper itself cannot guarantee that asynchronous cleanup code runs.
