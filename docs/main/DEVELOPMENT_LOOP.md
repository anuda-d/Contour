# Goal-bounded autonomous development loop

Status: current operating contract for scheduled development against one owner-approved goal.

The loop advances one approved goal through bounded, independently validated slices.
One orchestrator generation manages up to three sequential accepted slices before whole-goal alignment and a compact handoff to a fresh orchestrator.
Each slice has one fresh writer that is the only task allowed to modify the repository checkout for that slice.

## Sources of authority

Read these in order:

1. `AGENTS.md`;
2. `docs/plans/CURRENT.md`;
3. the active goal linked from `CURRENT.md`;
4. the linked implementation state;
5. `python3 scripts/development_loop_state.py status --json`;
6. the latest temporary generation handoff when present;
7. relevant implementation and tests; and
8. only the product specification relevant to the selected slice.

Repository commits and the versioned lifecycle record are authoritative for recovery.
Markdown run fields and the temporary handoff are human-readable summaries and must never override conflicting structured state.
The lifecycle record is stored under the repository's Git common directory so all local worktrees observe the same generation.

## Roles and ownership

### Scheduler

The scheduler is only a liveness and recovery trigger.
It inspects authorization, the durable lifecycle record, and the exact recorded task when ownership may be stale.
It may reserve one generation dispatch from `idle` or `handoff_ready`, or recover an exactly verified terminal owner.
Before creating a recovery task, it persists a one-use recovery dispatch ticket against the exact terminal task and claim.
It never chooses a slice, modifies source, validates, reviews, commits, aligns, or creates a speculative task queue.

### Orchestrator generation

One orchestrator owns lifecycle decisions for no more than three accepted slices.
It selects one present acceptance gap, freezes its contract, dispatches one fresh writer, evaluates the returned evidence, and either continues with another slice or aligns.
It may manage fewer than three slices when the goal completes, a natural alignment boundary is reached, or work becomes blocked.
The orchestrator never modifies the repository checkout.

### Slice writer

Every slice is delegated to a fresh task through a one-use dispatch ticket.
That writer acquires exact checkout ownership, handles one immutable slice contract, and is the only repository modifier for the slice.
It may delegate one to three read-only explorers and a fresh read-only reviewer.
After acceptance, an explicit incomplete state, or another terminal result, the writer releases checkout ownership, returns a compact result to the orchestrator, and stops.

### Read-only subagents

Explorers inspect current evidence and return findings to the writer.
The independent reviewer checks the exact frozen contract, content identity, validation evidence, and proposed acceptance.
It records its verdict under its own authenticated fresh task identity, then returns the result to the writer.
Read-only subagents never edit, commit, select product direction, or own lifecycle state.

## Persisted state machine

`scripts/development_loop_state.py` is the only writer for lifecycle state.
Every mutation uses an expected revision, role claim, allowed prior state, and unique operation ID.
An identical operation replay returns its prior result.
Reusing an operation ID with different input, using a stale revision, or using an old claim fails closed.
Task identities are globally single-use across orchestrator, writer, and reviewer roles.
Writes use an atomic replacement with file and directory synchronization.

The generation lifecycle is:

```text
idle or handoff_ready
  -> selecting
  -> slice_active
  -> selecting              after accepted slice 1 or 2
  -> alignment_due          automatically after accepted slice 3
  -> alignment
  -> handoff_ready
  -> selecting              only through a fresh orchestrator generation
```

An earlier natural goal boundary may move `selecting` to `alignment_due` after at least one accepted slice.
`paused`, `blocked`, and `complete` are explicit non-progress states.
Writer and reviewer transitions require both `slice_active` and standing authorization, so pause or block immediately fences an active slice without discarding it.

The slice lifecycle is:

```text
selected
  -> implementing
  -> validating
  -> reviewing
  -> commit_pending         after clean review
  -> accepted               through verified commit finalization

reviewing
  -> repairing
  -> validating             with prior validation and review invalidated

reviewing or recovery
  -> incomplete             when its persistent retry budget is exhausted
```

An incomplete slice remains active.
It is never counted, replaced, or silently weakened.

## Frozen slice contract

Before dispatch, the orchestrator records a contract containing:

- slice ID;
- affected criterion;
- owning responsibility;
- exact acceptance gap;
- observable completion condition;
- included paths;
- preservation boundaries; and
- focused and full validation commands; and
- an explicit UI-change boolean used for checkpoint accounting.

The state tool validates the contract, embeds its canonical value, and records its hash.
No transition edits a selected contract.
A material contract change requires explicit abandonment or owner direction, never an in-place rewrite.

## Evidence and acceptance

Validation records must identify the exact contract hash and content identity reviewed.
A material correction invalidates prior validation and review evidence.
A reviewer task may review a slice only once, so every post-correction review is fresh.

Before validation, the writer stages exactly the slice-owned content.
The state tool derives its content identity from the Git tree and rejects unstaged or untracked content.
Generation and slice baselines are derived from a clean, unlocked authoritative checkout `HEAD` and must continue from the last accepted or handed-off commit.
After clean review, the state tool emits two required commit trailers:

```text
Contour-Slice: <slice-id>
Contour-Contract: <contract-hash>
```

The writer commits the reviewed tree in the authoritative saved-project checkout and releases checkout ownership before finalization.
Finalization verifies that the commit is the clean authoritative checkout `HEAD`, descends from the recorded slice base, contains both trailers, changes only contract-included paths, matches the validated and reviewed Git tree, and has no remaining checkout owner.
Only finalization appends the unique accepted slice to the generation.
The third unique acceptance atomically makes alignment due.
A fourth selection is illegal.

## Retry and recovery policy

Age alone never permits takeover.
Recovery requires the exact recorded task ID and claim ID, explicit verification that the owner is terminal, a matching generation, and the latest revision.
That terminal snapshot is reserved in lifecycle state before task creation, and only the fresh task holding the persisted one-use recovery ticket may claim it.
An unknown, queued, active, interrupted, or input-blocked owner remains protected.

Writer repair and owner recovery budgets persist in lifecycle state and survive task or process restart.
The current limits are three repair cycles, three writer recoveries, and three orchestrator recoveries.
Exhaustion records `incomplete` or `blocked` and never resets itself by starting a new task or generation.

Generation, slice, and recovery dispatch intent is persisted before task creation.
Only one task can claim each persisted one-use ticket.
If task creation has an uncertain result, the pending ticket remains durable and automatic dispatch stops rather than creating a duplicate.
Commit recovery is safe because acceptance requires the recorded slice and contract trailers and unique finalization.

## Checkout no-overlap gate

Read-only work does not require checkout ownership.
Immediately before its first repository mutation, a writer runs:

```text
python3 scripts/development_loop_lock.py acquire
```

The writer must first claim its persisted lifecycle ticket, because checkout acquisition reads that state and admits only the current fresh writer in `slice_active` under standing authorization.
The writer retains the returned checkout claim ID.
Version 3 `assert-owner` and `release` operations require both the current task ID and that exact claim ID, and assertion revalidates the lifecycle generation and writer claim.
A stale claim from the same task fails.
Unversioned, version 1, and version 2 records remain readable and exact-owner releasable for migration, but cannot assert mutation authority or be recovered.

After a resumed turn, the writer asserts ownership before the next mutation.
It asserts again before commit, releases ownership after the reviewed commit is clean authoritative `HEAD`, finalizes that commit in lifecycle state, then returns the terminal slice result.
After lifecycle recovery installs the fresh writer and claim, an exact verified terminal checkout claim may be atomically transferred with `recover-stale`.
Unreadable, conflicting, or unverifiable ownership stops all repository mutation.

## Scheduled operating window

The Architecture Foundation loop may dispatch new slices daily from 18:00 until 23:00 in America/Toronto.
Outside the window, a recorded incomplete slice may finish safely, and an active orchestrator may align and hand off, but no new slice is selected or dispatched.
An explicit owner instruction may perform administrative work outside the window without silently starting a product slice.

Hourly scheduler invocations at 18:00 through 22:00 are recovery opportunities.
They no-op when authorization is paused, a valid orchestrator is active, a writer owns an active slice, an owner decision is pending, or lifecycle state is uncertain.

## Generation run

### 1. Orient and recover

Read the authoritative sources, validate lifecycle state, inspect the exact recorded owner when needed, and recover only by unchanged claims.
Migrate legacy Markdown state only once.
Matching `none` run fields become `idle` without inventing historical generation counts.
A matching legacy incomplete run requires its exact frozen contract and orchestrator identity.
Migration preserves that slice as recoverable and allows exactly one fresh writer to claim its pending dispatch ticket without replacing the contract.
Conflicting legacy fields fail closed.

### 2. Select and freeze one slice

When the generation is `selecting`, complete any due goal-level audit and identify one coherent responsibility that eliminates a concrete current gap.
Prefer criterion completion or an indispensable blocker to it.
Do not record a future slice queue.
Freeze the contract before creating the writer task.

### 3. Dispatch one fresh writer

Persist the one-use dispatch ticket before task creation.
Create the writer in the saved Contour project with environment `{ type: "local" }`, never the default isolated Git worktree.
The writer claims that ticket with its fresh task ID, acquires lifecycle-bound checkout ownership, and rechecks the authoritative repository base and frozen contract.
Any task identity previously used as an orchestrator, writer, or reviewer is rejected as a slice writer.

### 4. Explore and implement

The writer obtains one to three independent read-only explorations, states the evidence claim, and implements the smallest coherent change satisfying the entire contract.
It preserves the visible behavior freeze, privacy, authorship meaning, spatial separation, storage compatibility, and unrelated user work.

### 5. Validate and review

The writer stages only contract-owned files and runs focused checks and `./scripts/check.sh` against the derived Git tree identity.
It records factual evidence, then delegates a fresh independent read-only review.
The reviewer records the verdict through the lifecycle tool under its own task identity without modifying the repository.
Blocking findings return the same slice to repair without weakening its contract.
Every material correction repeats focused and full validation and uses a new reviewer.

### 6. Commit and finalize exactly once

After clean review, the writer records commit intent, includes the required trailers, commits only the reviewed tree, and confirms it is clean `HEAD` in the saved-project checkout.
It updates the repository's goal evidence and Markdown summary in the same slice commit when required by the active goal.
It then releases checkout ownership and finalizes that exact commit in lifecycle state.
Finalization exposes `selecting` only after the checkout is free.
The writer returns the contract hash, commit, evidence, remaining blockers, and risks to the orchestrator, then stops.

### 7. Continue or align

After accepted slice 1 or 2, the same orchestrator may select another slice while authorization and the operating window allow it.
After slice 3, the state machine forces whole-goal alignment.
An incomplete slice remains active and does not count.

The alignment compares every open goal criterion with current source, tests, accepted evidence, and all slice results from this generation.
It records accepted slice IDs and commits, remaining concrete gaps, audit and UI checkpoint counters, unresolved decisions, validation status, and recovery state.
The handoff says `No next slice selected`.
It does not preselect work for the fresh orchestrator.

After the handoff is durably recorded, a fresh orchestrator may start the next generation from `handoff_ready`.

## Completion audit and visual checkpoints

Goal-level completion audits remain due before selection when the recorded baseline is `none` or three accepted implementation slices have accumulated since the audit.
The orchestrator performs the audit during selection or generation alignment, not as a separate implementation slice.
Each accepted slice increments the durable audit counter, and `record-completion-audit` verifies clean authoritative `HEAD`, stores its evidence, and resets the counter.
An interrupted active slice is completed or explicitly blocked before a due audit changes selection.

Visible UI slices increment the existing UI checkpoint count.
Run the complete rendered checkpoint on every fifth accepted UI slice and before goal completion.
For a due fifth UI slice, `record-ui-checkpoint` binds rendered evidence to its exact validated Git tree before acceptance, stores the evidence, and resets the durable UI counter.
Outside an active slice, the same command verifies clean authoritative `HEAD` before resetting the counter.
The checkpoint covers representative desktop and mobile sizes, supported color modes, keyboard and touch behavior, responsive seams, persistence, and console output.

## Owner decision and product boundaries

Standing authorization applies only to the active owner-approved goal.
Stop at **NEEDS OWNER DECISION** before changing goal, product, visual, scope, privacy, or lasting architecture direction not already settled by authoritative documents.
Never push, merge, deploy, publish, destructively clean, or absorb unrelated user work without explicit authorization.

The Architecture Foundation exception authorizes enforceable architecture, compatibility, migration, and test evidence while the accepted Identity Map Prototype remains visually and behaviorally frozen.
It does not authorize Discovery, Library, Themes, Search, personalization, framework migration, redesign, or speculative modules.

## Pause, block, and completion

Owner pause sets authorization and lifecycle state to paused without discarding an active slice.
A technical blocker preserves the exact slice, contract, content evidence, and retry counters.
Both states fence the writer immediately, and only an explicitly owner-authorized resume can restore a paused phase.
Temporary handoff loss is reconstructed from Git history and lifecycle state.

The goal completes only when all criteria have accepted evidence, the full repository check and final rendered walkthrough pass, legacy storage compatibility is exercised, final independent review is clean, and `complete-alignment` has persisted a clean successor-free handoff.
The final accepted slice first updates the canonical goal documents and commits the structured terminal evidence with the exact reviewed tree.
That versioned JSON evidence contains schema version 1, the exact goal ID, a complete criterion-to-`accepted` map, passing full-validation, rendered-walkthrough, and legacy-compatibility records with evidence, and the tracked terminal-document paths.
It deliberately excludes its own final-review claim so review can happen after the evidence commit without a circular amend-and-rereview sequence.
The orchestrator then aligns and records the handoff, records current completion-audit and UI-checkpoint evidence, and delegates one fresh reviewer to call `record-goal-review --result pass|block` under its own identity.
Only after that reviewer passes does the orchestrator pause the scheduler and persist `complete` against the same clean, unlocked handoff commit and committed terminal-evidence file.
Completion resolves the canonical installed `bproject-autonomous-graph-loop` configuration, parses its TOML, and requires both the exact automation ID and `PAUSED` status.
No repository change or new goal follows the `complete` transition.

## Model routing

- The lifecycle orchestrator uses `gpt-5.6-terra` with high reasoning.
- Fresh slice writers use `gpt-5.6-terra` with high reasoning.
- Writer-managed explorers use `gpt-5.6-terra` with high reasoning and are read-only.
- Fresh independent slice and alignment reviewers use `gpt-5.6-sol` with high reasoning and are read-only.

## Terminal states

- **SLICE ACCEPTED - WRITER STOPPED**
- **SLICE INCOMPLETE - RECOVERY REQUIRED**
- **ALIGNMENT COMPLETE - HANDOFF READY**
- **NEEDS OWNER DECISION**
- **ACTIVE OWNER EXISTS**
- **ACTIVE OWNER STATUS UNKNOWN**
- **BASELINE BLOCKED**
- **GOAL COMPLETE**
