# Ephemeral Worker Process Lifecycle Guard

Status: accepted-v0.

Date: 2026-07-10.

WI: WI-CX0059-fix.

## Context

Two unmanaged `codex exec --ephemeral` attempts produced no visible events before the controller timeout. Stopping the surrounding wrapper did not stop every child process, and the controller later found a partial worktree edit plus live process ids that required exact manual cleanup.

The accepted one-controller topology remains useful for clean context and sidebar UX, but it is not safe for unattended use unless process lifetime is owned by a bounded supervisor.

## Decision

FDP_Codex will start ephemeral Codex workers only through `scripts/run-ephemeral-worker.mjs` for supervised local WI execution.

The wrapper uses the fixed `codex exec --ephemeral --json` surface, accepts only `read-only` or `workspace-write`, and sends the prompt through stdin. It does not place the prompt in the process argument list or persist it to a wrapper log.

The wrapper emits JSONL lifecycle, stdout, stderr, timeout, interruption, observation-error, and final-result events as the worker runs. The default timeout is 120 seconds and every invocation must have a finite timeout. The deadline and interrupt listeners are armed before reading stdin; a held-open stdin returns a structured null-root timeout or interruption result without spawning, and managed execution receives only the remaining deadline.

## Process Ownership

On Windows, the supervisor creates the real worker suspended, assigns it to a kill-on-close Job Object, and resumes it only after assignment. Normal completion requires the Job Object to report zero active processes after termination, covering descendants whose parent exits before a metadata poll can observe them. Other platforms fail closed before spawning because equivalent containment is not implemented. The absolute timeout deadline and interrupt listener are armed before controller identity lookup, spawn, and every event callback. The identity lookup races those guards, a guard check follows identity acquisition, another guard check runs immediately before spawn after invocation environment materialization and handler preparation, and a guard that wins before spawn returns without creating a wrapper or worker. A started identity-lookup process is an owned child: the supervisor terminates its exact ChildProcess handle, waits for the close event, and includes that helper cleanup in the structured result before returning. Elapsed-deadline checks prevent a delayed callback from converting an expired run into success. A post-spawn event sink exception is captured as `event_dispatch_failed`, retained in `event_errors`, and routed through wrapper-first verified cleanup rather than escaping the supervisor. Arbitrary `onEvent` callbacks receive non-terminal streaming events only and never receive `worker.result`. Every terminal path returns one structured result after guards and cleanup finish, and the fixed CLI publisher serializes exactly one `worker.result` immediately afterward. Blocking, throwing, or aborting code conditioned on a terminal event therefore cannot delay or mutate the managed outcome. Stdin stream errors are retained in `stdin_errors`; they produce `stdin_failed` when they win before another terminal guard, while an already-selected timeout or interruption remains the primary outcome. On Windows 10 or newer, `STARTUPINFOEX` with `PROC_THREAD_ATTRIBUTE_JOB_LIST` assigns the suspended worker to the Job Object atomically during `CreateProcess`, eliminating the creation-to-assignment window. The controller generates a cryptographically random per-invocation control token. The native wrapper removes the token, controller PID, and controller creation FILETIME from the process environment before creating the worker. A behavioral fixture proves the worker inherits none of them. The supervisor accepts root, assignment, controller-watchdog, atomic-child, drain, and error markers only when they carry that exact token. Before spawning the wrapper, the controller reads its own PID plus creation FILETIME. Before worker creation the wrapper opens one native controller process handle, reads and matches creation FILETIME from that same native process handle, retains that exact controller process handle, and fails before worker creation on a missing or mismatched identity. It then arms a background watchdog that waits on either the controller handle or a separate cancellation event. Controller death terminates the Job and exits the wrapper. Normal teardown signals cancellation, joins the watchdog, emits an authenticated watchdog-stopped marker, and only then closes the Job, cancellation, and controller handles. Cleanup can verify only after the exact wrapper close event is observed; an exit code or signal alone is insufficient, and process-table absence cannot replace wrapper close or authenticated drain. Before creating the worker, the native wrapper writes its own PID and start time marker. The supervisor requires that PID to match the exact spawned wrapper and never initializes root identity from process-table parent or name fallback. Before resume, the native wrapper writes the real worker PID and start time marker and then resumes the already-contained worker without waiting for a supervisor acknowledgement. The supervisor accepts and locks only that first marker; later same-prefix stderr is rejected as duplicate control data. The supervisor separately waits until its stderr handler has registered both immutable markers before any process-table query. Native marker timestamps use CIM-compatible microsecond precision. Each query has its own finite timeout, and the exact wrapper is stopped on timeout or interruption even if observation is unavailable. The supervisor also records pids, parent pids, executable names, and start times as evidence. An uninitialized wrapper root is never adopted from process-table parent or name fields. A missing, invalid, duplicate, or spawned-PID-mismatched root marker leaves observation unavailable, excluding same-supervisor PID reuse from observation and targeted cleanup. Once an identity has a recorded start time, a live row whose start time is unavailable is classified unknown rather than matched by name, cannot acquire descendants or receive a targeted signal, and keeps verification failed. A newly discovered descendant is not registered without start-time metadata; it remains an unobserved unknown candidate, receives no targeted signal, and permanently makes the invocation's observation unverified.

On Windows timeout or interruption, the exact wrapper is stopped first so closing its Job handle terminates every atomically assigned member. The supervisor then re-observes tracked identities; every cleanup result classifies the wrapper, atomic worker, and all other observed descendants exactly once as gone, identity-mismatched, alive, or unknown. Observation failure assigns unobservable identities to unknown rather than alive and keeps cleanup unverified. The supervisor never sends PID-only signals to observed descendants; exact wrapper-handle stop and Job-handle close own termination, while metadata cleanup only re-observes immutable identities. Observation continues until no tracked identity remains or the verification deadline expires. A cleanup that cannot be observed or verified is a failure, not a successful fallback. Timeout and interruption remain the primary CLI exit classifications 124 and 130 even when cleanup failure becomes the detailed result status. The deterministic suite launches the real CLI wrapper as a child process and observes both codes under cleanup failure.

If the real worker root exits while any other Job process remains active, including a descendant not yet observed by metadata polling, the native wrapper records that active count, terminates and drains the Job, and returns a lifecycle failure instead of the root exit code.

The controller must use the wrapper's internal timeout or an interrupt signal instead of force-killing the wrapper as its normal timeout mechanism. Windows Job Object close terminates assigned processes if the wrapper is killed, but the killed wrapper cannot emit a verified final result.

## UX And Recovery

The controller remains the only persistent user-visible task. The worker produces observable events without creating a Codex app task. Controller fallback begins only after the managed result proves cleanup or reports an explicit cleanup failure.

Interrupted work is still recovered from repository SSOT and the actual diff. Process cleanup does not authorize automatic acceptance of a partial edit.

## Data Boundary

The wrapper does not itself approve transmission of repository content to a model provider. A live model smoke or dogfood run must remain inside an approved data and network boundary. Local fixture tests and `codex exec --help` smoke do not transmit a repository prompt.

## Known Issue Repayment

The implementation, deterministic process-tree tests, no-residual process query, and installed Codex CLI local smoke repay KI-CX-WORKER-001. These checks exercise the process behavior that triggered the KI without coupling cleanup correctness to a model provider response.

The execution environment rejected the repository-backed live model smoke even after the user explicitly approved the stated transmission risk. KI-CX-PROVIDER-001 records that separate provider trust boundary and blocks dogfood continuation, generalized unattended worker use, and runner reactivation. FDP_Codex must not bypass that boundary or ask the user to run the rejected command indirectly.

## Hard Stops

The A2 runner remains `PAUSED`. This decision does not reactivate it, change its prompt or schedule, create a target remote, push the target, create a target PR, expand A2 or A3 authority, execute S2 review, create a separate reviewer, add a production dependency, change a public API or external contract, publish a release, deploy, publish a package, submit to an OSS program, or authorize destructive operations.

## Evidence

- `docs/specifications/ephemeral-worker-runner.md`
- `docs/records/validation-wi-cx0059-fix.md`
- `scripts/run-ephemeral-worker.mjs`
- `scripts/test-ephemeral-worker-lifecycle.mjs`
