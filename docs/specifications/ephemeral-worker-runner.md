# Ephemeral Worker Runner

Status: implemented-v1.

## Purpose

Run one ephemeral Codex CLI worker on Windows with observable output, a finite deadline, and verified process-lifetime containment through a Job Object. Other platforms fail closed before a worker process is spawned.

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
- The target must be trusted by Codex. Generalized managed-worker use remains blocked while command re-entry confinement is unresolved.

## Agent Confinement

The managed worker disables the Codex `multi_agent` feature at invocation. This blocks built-in collaboration fan-out for that CLI process.

A worker is instructed to finish its assigned task in its own ephemeral process and leave repository validation to the visible controller. This instruction is not a runtime command boundary: direct runtime, package-manager, shell, or nested Codex re-entry remains technically possible.

Project-local `.codex/rules` cannot supply a worker-only fix because Codex loads trusted project rules for the visible controller too. The attempted deny rule blocked controller-owned validation after a new session loaded it. FDP_Codex therefore keeps only a non-active design fixture at `docs/specifications/managed-worker-exec-policy.rules`, installs no project rule, and treats command re-entry confinement as an open KI that blocks generalized or unattended worker authority.

The official Codex rules documentation states that Codex scans `rules/` under every active config layer at startup and loads trusted project-local rules. The `codex exec` command exposes `--ignore-rules` to skip user and project rules, but it does not expose a flag that injects one worker-only rule file. See https://learn.chatgpt.com/docs/agent-configuration/rules#create-a-rules-file and https://learn.chatgpt.com/docs/developer-commands#codex-exec.

Process-lifetime containment is separate and is currently implemented only by the Windows Job Object. Unsupported platforms return an `unsupported_platform` result before spawning a worker. The controller remains responsible for repository validation and any independent reviewer required by repository policy.

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

On Windows, the supervisor starts the real worker suspended, assigns it to a Job Object configured with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`, and resumes it only after assignment succeeds. If assignment fails after process creation, the supervisor terminates the still-suspended unassigned process and waits for its exit before returning failure. Descendants of an assigned worker inherit the Job Object, so a parent that creates a child and exits before the next metadata poll cannot leave that child outside the containment boundary. The Job Object is terminated and queried until its active-process count reaches zero before normal completion is accepted.

On supported Windows hosts, the supervisor also records root and descendant process identities for evidence and targeted cleanup:

- pid
- parent pid
- executable name
- process start time

Windows obtains process metadata from `Get-CimInstance Win32_Process`. Metadata polling remains evidence and defense in depth; cleanup completeness comes from the Job Object membership and drain proof rather than polling alone.

The first root observation must not depend on a mutable executable label. It confirms the spawned pid against the supervisor parent pid before recording the operating-system start time and current name. Later observations use the recorded start time first and the executable name only as a fallback, protecting against both runtime title changes and terminating an unrelated process after pid reuse. New descendants of already observed processes are added while the run is active only when the currently live parent row still matches the observed parent identity. This prevents a reused Windows parent PID from attaching an unrelated process to the worker tree. A candidate with a parseable start time earlier than its observed parent or root is also rejected as stale parent-pid metadata.

## Completion And Cleanup

Normal completion succeeds only when the real worker exits with code 0, process observation succeeds, and Windows Job Object containment is verified through successful assignment and a zero-active-process drain marker. Other platforms cannot produce a successful managed-worker result.

Timeout and interruption cleanup:

1. Refresh the observed process tree.
2. Match current processes against observed identities.
3. Signal deepest descendants before parents.
4. Wait for the grace period.
5. Force remaining matched processes where the platform supports a distinct force signal.
6. Re-observe until every matched identity is gone or the verification deadline expires.

The final result contains root and descendant pids, line counts, timeout/interruption flags, exit information, observation errors, containment mode and verification status, cleanup targets, confirmed-gone pids, identity mismatches, residual pids, and cleanup verification status.

Exit codes are 0 for verified normal completion, 124 for timeout, 130 for interruption, and 1 for wrapper, worker, observation, residual-process, or cleanup failure.

## Local Verification

```text
npm run worker:test
npm run worker:smoke-local
```

`worker:test` uses deterministic Node fixtures that create root, child, grandchild, detached-child, and immediate-parent-exit cases. It validates the built-in fan-out flag, normal output capture, timeout cleanup, interruption cleanup, Windows Job Object inheritance, and verified drain after a real parent exits before polling can observe its child. `worker:smoke-local` builds the real ephemeral worker argument list, replaces only the final stdin prompt marker with `--help`, and verifies that the installed Codex CLI accepts `--disable multi_agent`, sandbox, cwd, and related flags through the same supervisor without sending a repository prompt to a model provider. It does not claim command re-entry enforcement.

A live model smoke is a separate data and network boundary. It must be explicitly approved when the execution environment requires that approval.

The controller must use the wrapper's internal timeout or an interrupt signal as the normal stop path. Force-killing the wrapper is not a successful result path. Windows Job Object close still terminates assigned processes, but an externally killed wrapper cannot emit a verified final result; controllers must use the internal timeout or interrupt path.
