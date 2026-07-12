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
- `worker.atomic_child`
- `worker.stdout`
- `worker.stderr`
- `worker.stdin_error`
- `worker.timeout`
- `worker.interrupted`
- `worker.observation_error`
- `worker.observation_started`
- `worker.result`
- `worker.wrapper_error`

Codex JSONL stdout is parsed and nested under the `payload` field. Non-JSON stdout and stderr remain text payloads. The wrapper keeps only counters and observed process metadata in memory; it does not create a persistent event log.

## Process Tracking

On Windows 10 or newer, the supervisor builds a `STARTUPINFOEX` attribute list containing `PROC_THREAD_ATTRIBUTE_JOB_LIST` and passes `EXTENDED_STARTUPINFO_PRESENT` to `CreateProcess`. The real worker is therefore assigned to the kill-on-close Job Object atomically at process creation rather than in a later API call. While the worker is suspended, the native wrapper writes its PID and operating-system start time to the supervisor and then resumes it without waiting for a supervisor acknowledgement; Job containment is already established. Because the native wrapper writes this marker while the worker is still suspended, it is the first same-prefix line on inherited stderr. The supervisor permanently locks the first marker it receives and rejects every later same-prefix stderr line, so worker output cannot replace the registered atomic identity. The supervisor does not start any process-table query until its stderr handler has registered both the immutable root identity and atomic worker identity in the observed set. If the marker never becomes ready, the already-armed timeout, interruption, or wrapper exit wins and process-table observation fails closed. If the wrapper is forcibly terminated after creation, closing its Job handle terminates the atomically assigned child. Descendants inherit the Job Object, so a parent that creates a child and exits before the next metadata poll cannot leave that child outside the containment boundary. The Job Object is terminated and queried until its active-process count reaches zero before normal completion is accepted.

The Windows API basis is the Microsoft documentation for `InitializeProcThreadAttributeList` and `UpdateProcThreadAttribute`; the latter defines `PROC_THREAD_ATTRIBUTE_JOB_LIST` as a list of Job handles assigned to the child process at creation. See https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-initializeprocthreadattributelist and https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute.

On supported Windows hosts, the supervisor also records root and descendant process identities for evidence and targeted cleanup:

- pid
- parent pid
- executable name
- process start time

Windows obtains general process metadata from `Get-CimInstance Win32_Process`; the atomically created real worker identity comes directly from the native creation handle. The absolute timeout deadline and interrupt listener are armed before spawn and before any event callback. All process-table queries require the registered atomic identity, and every query has a separate finite command timeout. `worker.observation_started` records the ordering evidence. A delayed synchronous event callback cannot convert an expired invocation into success; after control returns, the absolute deadline forces timeout cleanup. A throwing event sink is captured as `event_dispatch_failed`, recorded in `event_errors`, and routed through wrapper-first verified cleanup instead of escaping the supervisor. A failure while delivering the final `worker.result` reclassifies the returned result to `event_dispatch_failed` with `ok: false` while preserving the already-verified containment evidence. Stdin stream errors are captured in `stdin_errors`; an error that wins before another terminal guard returns `stdin_failed`, while timeout or interruption remains primary when already selected. On timeout or interruption, the exact spawned wrapper is stopped even if metadata observation is delayed or unavailable. Metadata polling remains evidence and defense in depth; successful cleanup still requires observable proof, while Job membership closes the worker process tree when the wrapper exits.

The native wrapper emits its own PID and operating-system start time before creating the worker. The supervisor accepts only the first root marker, requires its PID to equal the exact spawned wrapper PID, normalizes native start times to CIM-compatible microsecond precision, and records that immutable identity before process-table observation. An uninitialized root is never adopted from process-table parent or executable name; a missing, invalid, duplicate, or mismatched root marker keeps observation unavailable and excludes same-supervisor PID reuse from targeted cleanup. Later observations require the recorded start time to match. If the current row has no start time, identity is unknown rather than matched by executable name; that PID cannot acquire descendants or receive a targeted signal, and verification remains failed. A newly discovered descendant must also provide start-time metadata before entering the observed tree. Otherwise its PID is reported as an unobserved unknown candidate, cannot acquire descendants or receive a targeted signal, and permanently makes observation for that invocation unverified. New descendants of already observed processes are added while the run is active only when the currently live parent row still matches the observed parent identity. This prevents a reused PID on Windows from attaching an unrelated process to the worker tree. A candidate with a parseable start time earlier than its observed parent or root is also rejected as stale parent-pid metadata.

## Completion And Cleanup

Normal completion succeeds only when the real worker exits with code 0, process observation succeeds, and Windows Job Object containment is verified through successful assignment and a zero-active-process drain marker. Other platforms cannot produce a successful managed-worker result.

Windows timeout, interruption, event-dispatch-failure, and stdin-failure cleanup:

1. Stop the exact spawned wrapper so its kill-on-close Job handle terminates every atomically assigned member even when process-table observation is unavailable.
2. Refresh the observed process tree through a command-bounded query.
3. Match current processes against observed identities.
4. Never signal an observed descendant by PID; exact wrapper-handle stop and Job-handle close own termination.
5. Wait for the grace period and re-observe immutable identities until every tracked identity is gone or the verification deadline expires.

The final result contains root and descendant pids, line counts, timeout/interruption flags, exit information, event delivery errors, stdin errors, observation errors, containment mode and verification status, cleanup targets, confirmed-gone pids, identity mismatches, alive pids, unknown pids, and cleanup verification status. On every cleanup result, the wrapper root, the atomically created worker, and every other observed descendant must appear exactly once across confirmed gone, identity mismatch, alive after cleanup, or unknown after cleanup. An observation failure places unobservable identities in `unknown_after_cleanup`, never `alive_after_cleanup`, and keeps cleanup unverified.

Exit codes are 0 for verified normal completion, 124 for timeout, 130 for interruption, and 1 for wrapper, worker, event-dispatch, observation, residual-process, or cleanup failure.

## Local Verification

```text
npm run worker:test
npm run worker:smoke-local
```

`worker:test` uses deterministic Node fixtures that create root, child, grandchild, detached-child, and immediate-parent-exit cases. It validates the built-in fan-out flag, normal output capture, timeout cleanup, interruption cleanup, Windows Job Object inheritance, verified drain after a real parent exits before polling can observe its child, exact terminal classification including unknown observer-failure state, `worker.root_identity` then `worker.atomic_child` before `worker.observation_started` ordering with both identities registered, rejection of a worker-forged duplicate atomic-child marker without adopting its PID, unknown and unverified classification when a known identity loses current start-time metadata, rejection of a newly discovered startless descendant from observation and any PID-only termination path, a blocking `worker.started` callback that cannot bypass the absolute timeout outcome, throwing `worker.started` and final `worker.result` callbacks that both return `event_dispatch_failed` without false success, and 1 MiB stdin cases that cover early worker exit plus timeout while a write remains pending without losing the structured result. `worker:smoke-local` builds the real ephemeral worker argument list, replaces only the final stdin prompt marker with `--help`, and verifies that the installed Codex CLI accepts `--disable multi_agent`, sandbox, cwd, and related flags through the same supervisor without sending a repository prompt to a model provider. It does not claim command re-entry enforcement.

A live model smoke is a separate data and network boundary. It must be explicitly approved when the execution environment requires that approval.

The controller must use the wrapper's internal timeout or an interrupt signal as the normal stop path. Force-killing the wrapper is not a successful result path. Windows Job Object close still terminates assigned processes, but an externally killed wrapper cannot emit a verified final result; controllers must use the internal timeout or interrupt path.
