# Goal-bounded autonomous development loop

Status: current operating contract for scheduled development against one
owner-approved goal.

This loop advances one approved goal through small, independently validated
work units in successive fresh tasks.
It operates only when `docs/plans/CURRENT.md` records exactly one active goal
with standing owner authorization.
Routine implementation, acceptance, local commit, handoff, and relay inside the
approved goal do not wait for owner review.

The owner remains the authority for a new goal and for unresolved material
product, visual, scope, privacy, or lasting architecture decisions.
Standing authorization never broadens or reinterprets the active goal.

## Scheduled operating window

The Architecture Foundation loop may start new units daily from 18:00 until
23:00 in America/Toronto.
The recurring scheduler starts a fresh recovery task once per hour at 18:00,
19:00, 20:00, 21:00, and 22:00.

An accepted unit that finishes before 23:00 creates one fresh successor task in
the same local project after writing its handoff.
That relay provides back-to-back progress without letting one task own two
units.
At or after 23:00, the active task finishes its current unit safely, writes the
handoff, and does not create a successor.

The hourly starts are recovery opportunities, not permission for overlap.
Every scheduled or relayed task first inspects the recorded run state and atomically claims the durable checkout-ownership record before any subagent spawn or file change.
If another durable owner is active, the new task exits without changing the repository.
If no live task owns a matching recorded `Current run` and `Incomplete run`, the
fresh task resumes exactly that orphaned unit instead of selecting a new one.
If the two run fields conflict, the ownership record is unreadable, or the recorded owner's state cannot be verified, stop safely without changes.

Outside the scheduled window, a task may finish an already-recorded unit safely
but may not select a new unit or relay a successor.
An explicit owner instruction may perform administrative work outside the
window but does not silently start an implementation unit.

## Goal and work-unit boundary

The active goal defines the outcome, invariants, authorized scope, validation
standard, and completion condition.
A work unit is the smallest coherent change that creates evidence for one unmet
criterion.
One implementation task owns at most one work unit.

Standing authorization permits successive bounded units only inside the active
goal.
The loop selects each unit from current repository evidence after the prior unit
is accepted and committed.
It never records a future task queue.

Each work unit:

1. selects one smallest justified goal gap;
2. obtains one to three independent read-only explorations;
3. states one criterion, intended result, and evidence claim;
4. implements one coherent change through the sole-writer orchestrator;
5. runs focused checks and the full repository check;
6. records candidate evidence;
7. receives a fresh independent read-only review;
8. resolves every blocking finding and repeats validation and fresh review after
   a material correction;
9. records accepted evidence and creates one local commit;
10. writes the compact temporary handoff with `No next unit selected`;
11. creates one fresh successor before 23:00 when relay remains authorized; and
12. stops without selecting another unit.

## Architecture Foundation exception

The owner explicitly authorized architecture-only work for the active
Architecture Foundation goal.
During this goal, enforceable architecture, compatibility, migration, and test
evidence are valid progress even when a unit intentionally changes no visible
product behavior.

This exception is narrow.
The accepted Identity Map Prototype remains the frozen behavior and visual
baseline.
No Discovery, Library, Themes, Search, personalization, framework migration,
visual redesign, or speculative future module is authorized.

While the architecture entry gate is open, only the contract unit defined by
the active goal may be selected.
Broad source migration starts only after that gate is accepted.

## Fresh-task handoff contract

Every implementation unit begins in a newly created fresh task.
The first unit reads the active goal and implementation state without requiring
a prior handoff.
Every later unit reads the latest temporary handoff before selecting or
continuing work.

A task may orient, select or continue one unit, explore, implement, validate,
review, correct, accept, commit, hand off, and relay.
It may not select or implement a second unit.

At every accepted, paused, blocked, or owner-decision terminal state, write a
compact redacted handoff in the operating system temporary directory.
Use `contour-<active-goal-id>-handoff.md` and capture the goal id before a
completion transition clears it.

The handoff contains only:

- active goal id and exact terminal state;
- accepted commit or exact incomplete working-tree state;
- criterion and evidence status;
- focused, full, rendered, and independent-review results as applicable;
- UI checkpoint count;
- risks and unresolved owner decisions;
- `No next unit selected`; and
- suggested skills for the next task.

The handoff is context, not authority, accepted evidence, or a future task
queue.
If it is unavailable, the fresh task reconstructs factual state from the
repository and does not infer missing decisions or discard work.

## Fresh-task relay

After an accepted local commit and handoff, read the current local time in
America/Toronto.
If it is before 23:00 and standing authorization remains active:

1. use the Codex project tools to identify the exact current local project;
2. assert and release checkout ownership, then enter handoff-only state and perform no more repository work;
3. create one fresh local task in that project with `gpt-5.6-terra` and high reasoning;
4. give it the active automation prompt and tell it to begin with the authoritative read order;
5. wait once, briefly, only to confirm dispatch; and
6. stop the current task.

Do not relay after a blocked, paused, owner-decision, unsafe-baseline,
overlapping-run, or goal-complete terminal state.
Do not relay at or after 23:00.
Do not interpret failure to create a successor as permission to keep working in
the current task.
The next hourly recovery start may resume from the handoff.

## No-overlap gate

Before any subagent spawn or repository change, run `python3 scripts/development_loop_lock.py acquire`.
The command obtains the current task ID from `CODEX_THREAD_ID` and atomically creates the durable local ownership record.

If acquisition reports `HELD_BY <owner-id>`, inspect that exact task with `read_thread`.
Stop at **ACTIVE RUN EXISTS** when the recorded owner is queued, active, or owns a non-terminal latest turn.
An idle owner that asked for input still owns the checkout.
When the exact owner is idle or `notLoaded` after a failed or interrupted turn, send a follow-up to that same task instructing it to assert ownership and resume its matching recorded unit.
When the exact owner completed a documented loop terminal state but failed to release, send a follow-up to that same task instructing it to release its own record and finish the applicable handoff or relay only.
The recovery task that does not own the record then stops without repository changes.
Ownership is never taken over or force-released by a different task.
If the record is unreadable, exact-owner inspection fails, or the exact-owner follow-up cannot be dispatched, stop at **ACTIVE RUN STATUS UNKNOWN**.

The unscoped Codex task listing is not an ownership precondition because it can hang, cannot filter by project, and cannot reliably classify idle historical tasks.
Do not call `list_threads` as part of the no-overlap gate.
The atomic ownership record is the decisive single-writer proof for every task governed by this repository.
The transition to this rule was accepted only after a successful project activity screen showed no competing active task.

Before every later repository mutation phase and after any resumed turn, run
`python3 scripts/development_loop_lock.py assert-owner`.
A mismatch stops all further repository work.
Release ownership with `python3 scripts/development_loop_lock.py release` at every non-relaying terminal state.
For a relay, assert and release ownership immediately before creating the successor, enter handoff-only state, and perform no more repository work.
The successor must acquire ownership for itself.

The recorded `Current run` and `Incomplete run` must also agree.
A fresh task continues a recorded incomplete unit instead of selecting a
replacement.

## Owner decision boundary

Routine work-unit evidence is accepted under standing authorization after
focused and full validation plus clean fresh independent review.
The owner is not a routine unit reviewer.

Stop at **NEEDS OWNER DECISION** before acting when continuation requires:

- selecting, replacing, broadening, or reinterpreting a goal;
- a material product, visual, scope, privacy, or lasting architecture choice not
  already settled by authoritative documents;
- changing the frozen behavior or design outside an allowed correctness fix;
- resolving an open question that materially affects behavior;
- destructive cleanup, disposal of user work, deployment, publication, push,
  merge, or another external side effect;
- authority to absorb overlapping unrelated changes; or
- direction after the owner pauses or stops the loop.

When a decision is required, record the smallest concrete question, set `Run
status` to `needs owner decision`, write the handoff, and do not relay.

## Frontend design contract

For work affecting Map presentation, interaction, visibility, responsive
layout, design tokens, or reusable frontend foundations, use the
`design-taste-frontend` skill.
Record its Design Read, design dials, relevant redesign audit, and applicable
pre-flight results before acceptance.

The Architecture Foundation freezes the accepted visual design.
A UI-affecting unit must explain why an accessibility or correctness fix is
required and demonstrate preservation of unrelated behavior.

## Visual checkpoint cadence

Count only accepted units that change a visible UI surface or interaction.
Run the complete rendered checkpoint on every fifth such unit and before goal
completion.

The checkpoint exercises accumulated affected flows at representative desktop
and mobile sizes, supported color modes, keyboard and touch behavior,
responsive seams, local persistence, and console output.
Reset the counter only after checkpoint evidence is accepted.
Independent code review remains required for every unit.

## Model routing

- The sole-writer orchestrator uses `gpt-5.6-terra` with high reasoning.
- Read-only explorer agents use `gpt-5.6-terra` with high reasoning.
- Every independent implementation and alignment review uses a fresh
  `gpt-5.6-sol` agent with high reasoning.
- Reviewers are read-only and may not edit, commit, choose product direction,
  or determine a new goal.

## Sources of authority

Read these in order before repository work:

1. `AGENTS.md`;
2. `docs/plans/CURRENT.md`;
3. the active goal linked from `CURRENT.md`;
4. the linked implementation state;
5. the latest temporary handoff when available;
6. relevant implementation and tests located at selection time; and
7. only the product specification relevant to the selected unit.

If sources conflict in a way that affects product direction, visual language,
scope, privacy, or lasting architecture, stop at **NEEDS OWNER DECISION**.

## Standing authority

While the active goal has `Owner authorization: standing`, the loop may:

- select successive bounded units during the scheduled window;
- implement one coherent change per unit;
- add or update focused tests and quality gates;
- update implementation-state evidence;
- simplify or remove loop-owned code when it is the safest bounded solution;
- use read-only explorers and reviewers;
- accept clean reviewed evidence;
- create local commits;
- create the required temporary handoff; and
- create one fresh successor task before 23:00.

Standing authority does not permit the loop to:

- select or invent a new goal;
- broaden or reinterpret the active goal;
- decide an unresolved owner question;
- weaken tests, validation, product boundaries, authorship, or privacy rules;
- absorb, overwrite, discard, or commit unrelated user work;
- push, merge, deploy, publish, or create unrelated external side effects;
- use destructive cleanup to make a unit pass; or
- treat a reviewer as a product decision-maker.

## Preconditions

Before selecting or continuing a unit, confirm that:

- the task has not completed another unit;
- current time permits new selection, or an incomplete unit is being finished;
- exactly one active owner-approved goal is linked;
- owner authorization is standing;
- no owner decision or alignment blocker is pending;
- no overlapping task or recorded run exists;
- the durable checkout-ownership record names the current task;
- a current unit, if any, matches the incomplete unit;
- the work is authorized by the active goal;
- no future task queue is recorded;
- the architecture entry gate is respected;
- the checkout contains no unsafe overlapping user changes; and
- the repository check passes, or a pre-existing unrelated failure is recorded.

If unrelated changes overlap the unit, stop at **BASELINE BLOCKED**.
Never reset or discard them without direction.

## One work-unit run

### 1. Orient

Read the sources of authority, latest handoff, run fields, accepted evidence,
and repository state.
Confirm this is a fresh task, acquire durable checkout ownership, and confirm no overlap exists.

### 2. Select one task

Choose the smallest unmet goal gap that can create direct evidence in one task.
While the architecture entry gate is open, select only its contract unit.

Record only that task under `Current run` and `Incomplete run`.
State:

> This work unit advances criterion X by producing result Y, verified by
> evidence Z.

Do not record later tasks.
If no honest gap advances the goal, stop at **NO JUSTIFIED CHANGE**.

### 3. Explore

Use one to three read-only explorer agents for concrete independent questions.
Wait for all explorers before editing.
The orchestrator remains the sole writer.

### 4. Implement

Make the smallest coherent change that can satisfy the claim.
Preserve the visible behavior freeze, public and private boundaries, authored
meaning, spatial separation, storage compatibility, and unrelated work.

Do not add speculative infrastructure or future-feature seams.

### 5. Validate

Run focused checks first and then `./scripts/check.sh`.
Inspect the owned diff and verify the intended architecture or compatibility
claim directly.
Run rendered evidence only for a concrete risk, a due visual checkpoint, or
AF-10.

### 6. Record and review

Before review, record the criterion, claim, exact diff, observed evidence,
validation, UI counter, risks, and proposed accepted evidence.

Use a fresh read-only `gpt-5.6-sol` high-reasoning reviewer.
Provide the goal, relevant rules, actual diff, evidence claim, validation, and
known risks.
Resolve every blocker.
A material correction repeats focused and full validation and uses a new fresh
reviewer.

### 7. Accept, commit, hand off, relay, and stop

After validation passes and review is clean:

1. record the factual review result;
2. mark only supported criteria accepted;
3. approve the architecture entry gate only when its exact claim is satisfied;
4. append the accepted run record;
5. update the UI checkpoint fields when applicable;
6. clear `Current run` and `Incomplete run`;
7. set `Run status` to `awaiting scheduled fresh task` unless the goal is
   complete;
8. synchronize `CURRENT.md`;
9. stage only the coherent unit;
10. create one local commit;
11. write the temporary handoff with `No next unit selected`;
12. before 23:00, create one fresh successor when every relay precondition
    remains true; and
13. stop at **UNIT COMMITTED - HANDOFF READY**.

The current task never selects the successor's unit.

## Blocked units

Do not silently replace a non-viable selected unit.

- Resolve a technical blocker safely inside the same claim when possible.
- For a required owner decision, record it, hand off, and stop without relay.
- For an unsafe baseline or overlap, preserve exact state, hand off when
  appropriate, and stop without relay.
- Never remove work merely because a unit is blocked.

## Owner pause or stop

The owner may pause or stop the loop at any time.
On pause, set owner authorization, cadence, relay, and run status to paused in
both operational files, preserve any active unit, write a handoff, and stop.
The scheduler must no-op while authorization is paused.

Administrative state changes explicitly requested by the owner remain allowed.
Resuming requires an explicit owner instruction and synchronized standing state.

## Goal completion

The active goal is complete only when every criterion has accepted evidence,
the final full repository check and complete rendered walkthrough pass, legacy
storage compatibility is exercised, and a final fresh independent review is
clean.

At completion:

1. record final evidence and review;
2. mark every criterion accepted;
3. set the goal and implementation state to their canonical completed status;
4. clear current and incomplete runs and pending decisions;
5. set `Active goal id` to `none`, owner authorization to `pending`, cadence to
   `stopped`, relay to `stopped`, and standing authority to `none`;
6. synchronize `CURRENT.md` and `README.md`;
7. run the final repository check;
8. create the final local commit;
9. write the final handoff using the captured completing goal id;
10. pause the `bproject-autonomous-graph-loop` automation so it does not create
    later no-op recovery tasks;
11. do not relay; and
12. stop at **GOAL COMPLETE** without selecting another goal.

## Terminal states

- **UNIT COMMITTED - HANDOFF READY**
- **ALIGNMENT COMMITTED - HANDOFF READY**
- **NEEDS OWNER DECISION - HANDOFF READY**
- **OWNER AUTHORIZATION REQUIRED OR PAUSED**
- **ACTIVE RUN EXISTS**
- **ACTIVE RUN STATUS UNKNOWN**
- **NO JUSTIFIED CHANGE**
- **WORK UNIT BLOCKED - HANDOFF READY**
- **BASELINE BLOCKED - HANDOFF READY**
- **GOAL COMPLETE**

## Accepted run record

For every committed unit retain:

1. criterion and claim;
2. observed evidence and interpretation separately;
3. exact files and local commit;
4. focused and full validation plus applicable rendered evidence;
5. explorer partition and fresh review result;
6. risks and unresolved assumptions;
7. acceptance basis under standing owner authorization; and
8. confirmation that the handoff records `No next unit selected`.
