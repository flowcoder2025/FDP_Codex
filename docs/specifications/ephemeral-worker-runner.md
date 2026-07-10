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
codex exec --ephemeral --json --color never --disable multi_agent --sandbox <mode> -C <path> -
```

The final `-` makes Codex read the prompt from stdin. The wrapper does not write a prompt file or include the prompt in argv.

## Input Limits

- `--cwd` defaults to the current directory and must exist.
- `--timeout-ms` defaults to 120000 and must be between 1000 and 1800000.
- `--sandbox` defaults to `workspace-write` and accepts only `read-only` or `workspace-write`.
- stdin must contain a non-empty UTF-8 prompt no larger than 1 MiB.
- `CODEX_CLI_PATH` may identify an explicit Codex executable. On Windows, the npm-installed `codex.js` shim target is preferred when present.
- The target must be trusted by Codex and contain `.codex/rules/fdp-managed-worker.rules`.

## Agent Confinement

The managed worker disables the Codex `multi_agent` feature at invocation. Before reading the prompt or making a model request, the wrapper also runs `codex execpolicy check` against the target's `.codex/rules/fdp-managed-worker.rules`. The preflight must verify that supported direct Codex, runtime, package-executor, and nested-shell re-entry forms resolve to `forbidden`; an absent rule or non-forbidden result fails closed.

A worker must finish its assigned task in its own ephemeral process and must not spawn nested agents or enter collaboration wait states. It may reconstruct and edit the target, but it must not execute repository-supplied scripts or package managers. The visible controller runs canonical validation only after the worker exits. This prevents a workspace-write worker from rewriting an allowed validation script into a nested Codex launcher.

The CLI flag and exec-policy preflight enforce the supported command contract rather than relying on prompt wording. This is not a claim of universal operating-system process isolation: arbitrary renamed binaries or undeclared launchers remain outside this rule language's prefix-matching guarantee and therefore block unattended or generalized worker authority.

The controller remains responsible for repository validation and any separate independent reviewer required by repository policy. Disabling nested agents inside an implementation worker does not weaken the independent-review gate.

## Event Stream

The wrapper writes one JSON object per line to stdout. Event types are:

- `worker.started`
- `worker.exec_policy_verified`
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

The first root observation must not depend on a mutable executable label. It confirms the spawned pid against the supervisor parent pid and, on POSIX, the dedicated process group id before recording the operating-system start time and current name. Later observations use the recorded start time first and the executable name only as a fallback, protecting against both runtime title changes and terminating an unrelated process after pid reuse. New descendants of already observed processes are added while the run is active only when the currently live parent row still matches the observed parent identity. This prevents a reused Windows parent PID from attaching an unrelated process to the worker tree. A candidate with a parseable start time earlier than its observed parent or process-group root is also rejected as stale parent-pid metadata.

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

`worker:test` uses a deterministic Node fixture that creates a root, child, and grandchild. It validates the policy contract, normal output capture, timeout cleanup, and interruption cleanup. `worker:smoke-local` first executes the real `execpolicy check` preflight for direct, package-manager, and nested-shell re-entry cases, then builds the real ephemeral worker argument list, replaces only the final stdin prompt marker with `--help`, and verifies that the installed Codex CLI accepts `--disable multi_agent`, sandbox, cwd, and related flags through the same supervisor without sending a repository prompt to a model provider.

A live model smoke is a separate data and network boundary. It must be explicitly approved when the execution environment requires that approval.

The controller must use the wrapper's internal timeout or an interrupt signal as the normal stop path. Force-killing the wrapper itself cannot guarantee that asynchronous cleanup code runs.
