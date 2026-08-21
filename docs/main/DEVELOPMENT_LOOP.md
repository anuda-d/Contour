# Owner-Gated Agentic Development Loop

Status: current operating contract for progressive development against one
owner-approved goal.

This loop advances one owner-approved product goal through small, independently
validated work units. It preserves the structure used by the 2084 project but
intentionally removes autonomous continuation. Every implementation or
alignment unit stops after fresh independent review and waits for the owner as
the final reviewer. No unit is committed and no later unit begins without the
required owner approval.

The repository is the durable state between units. The loop does not choose
project direction, authorize its own work, or create a future task queue.

## Goal and Work-Unit Boundary

The active goal defines the outcome, invariants, authorized product scope,
validation standard, and stopping condition. A work unit is the smallest
coherent change that can create new evidence for one unmet goal criterion in
one fresh context.

Goal approval does not authorize implementation. The owner must separately
authorize the first bounded run. Each authorization is a single-use token that
permits the orchestrator to select one smallest useful gap inside the approved
goal. It is not approval for work outside that goal. The token is consumed only
after a valid progress claim has been selected and recorded, immediately before
implementation edits begin.

One authorized run:

1. selects one bounded goal gap from current repository evidence;
2. implements one coherent change;
3. validates it proportionately, including browser and visual checks for
   affected interface behavior;
4. records the candidate evidence claim;
5. obtains fresh independent review of the implementation and candidate claim;
6. resolves every blocking finding and repeats review after material changes;
   and
7. stops at **AWAITING OWNER APPROVAL** without committing or selecting later
   work.

The owner then reviews the result after the independent reviewer. Explicit
approval allows the orchestrator to finalize the evidence and commit the work
unit. Unless the owner says `approve only`, `pause`, or `stop`, that approval
also grants exactly one token for the orchestrator to select the next bounded
unit inside the same goal. It never authorizes unlimited continuation or work
outside the approved goal.

There are no unattended or scheduled runs in this contract. Adding one later
requires an explicit owner decision and an updated operating contract.

## Model Routing

- The main orchestrator and implementation agents use `gpt-5.6-terra` with
  high reasoning.
- Every independent implementation and goal-alignment reviewer uses a fresh
  `gpt-5.6-sol` agent with high reasoning.
- The independent reviewer is read-only and may not edit, commit, or approve.
- The owner remains the final reviewer regardless of model output.

## No-Overlap Gate

Before a newly authorized run reads implementation or changes repository
state, inspect Codex task activity for this project. Ignore the just-started
orchestrator itself.

If another project task, loop orchestrator, implementation subagent, or review
agent is queued or running, stop at **ACTIVE RUN EXISTS** without changing the
repository. If task activity cannot be inspected reliably, stop at **ACTIVE RUN
STATUS UNKNOWN** rather than risk overlapping work.

An orchestrator must not finish or return the unit to the owner while one of
its subagents remains active. It must wait for, stop, or receive the result from
every subagent first.

## Sources of Authority

Read these in order before changing the repository:

1. `AGENTS.md` — project-wide working constraints.
2. `docs/plans/CURRENT.md` — compact index, owner gate, and run boundary.
3. The active goal linked from `CURRENT.md` — authorized result, criteria, and
   invariants.
4. The linked implementation state — owner-approved evidence, current run, and
   pending review state.
5. Relevant implementation and tests found just in time to select one task.
6. Only the product specification relevant to the selected task.

The product foundation and active goal are authoritative. The active goal
narrows higher-level documents but does not override their invariants. Open
questions mark owner decision boundaries; they are not a backlog.

If sources conflict in a way that affects product direction, visual language,
scope, or lasting architecture, stop at **NEEDS OWNER DECISION**. Explain the
conflict and present the smallest concrete decision required.

## Authority

With a valid single-use owner authorization, the loop may:

- implement one coherent change that advances one unmet active-goal criterion;
- add or update focused tests for that behavior;
- create the smallest necessary application or validation infrastructure tied
  to a named criterion;
- update candidate implementation-state evidence;
- simplify or remove code when that is the smallest way to satisfy the goal;
- delegate bounded independent implementation or investigation when the work
  divides cleanly; and
- prepare a coherent diff for independent and owner review.

Without a new owner decision, the loop may not:

- select, broaden, replace, or reinterpret the active goal;
- begin work when the owner gate is pending or consumed;
- settle an open product, visual, scope, or lasting architecture decision;
- change the core philosophy, pillars, or product model;
- mark candidate evidence owner-approved;
- commit before explicit owner approval;
- select or begin another work unit while owner review is pending;
- continue into an adjacent feature after the active goal is complete;
- push, merge, publish, deploy, discard user work, or weaken validation because
  intended behavior is difficult; or
- treat independent review as a substitute for owner approval.

## Preconditions

Before implementation, confirm that:

- `CURRENT.md` links exactly one active owner-approved goal;
- the implementation state records explicit owner authorization for exactly
  one bounded run inside the active goal;
- no pending owner review exists;
- no incomplete or overlapping run exists;
- the proposed behavior is authorized by the goal;
- the linked implementation state contains no future task queue;
- the working checkout has no unrelated unfinished changes that overlap the
  proposed task; and
- the baseline repository check passes, or any pre-existing failure is
  recorded and clearly unrelated.

The documentation and loop setup changes that existed before the first work
unit form the initial owner-authored baseline. The first work unit must not
discard, rewrite, or accidentally commit unrelated owner changes.

If unrelated user changes overlap the proposed task, stop at **BASELINE
BLOCKED** and report the exact paths. Never reset, discard, or absorb them
without owner direction.

## One Work-Unit Run

### 1. Orient

Read the compact index, active goal, and implementation state. Check for a
pending review, alignment requirement, or stop condition before loading
implementation details.

### 2. Verify owner authorization

Verify that the owner explicitly authorized one bounded run after the most
recent terminal report. Do not consume the token during orientation.

If no valid authorization exists, make no implementation change and stop at
**OWNER AUTHORIZATION REQUIRED**. Never infer authorization from goal approval,
silence, past approval, or the existence of open criteria.

### 3. Select one task

Choose the smallest unmet goal gap whose implementation can create new
behavioral evidence within one fresh context. Record only that task under
`Current Run`, then read only its relevant specification and implementation.

State the progress claim before editing:

> This work unit advances criterion X by producing behavior Y, verified by
> evidence Z.

After selecting a valid claim, atomically record that single task under `Current
Run` and mark the authorization consumed immediately before implementation
edits. Do not select, suggest, or record a later task. If the task does not fit
comfortably, replace it with a smaller one before consuming the token. If no
honest progress claim can be made, leave the token granted and stop at **NO
JUSTIFIED CHANGE**. Do not retry the unchanged selection without new repository
evidence or owner direction.

If the selected claim becomes non-viable after the token is consumed, do not
silently choose a replacement. Record the blocker against the current run,
preserve only the loop-owned pending changes, and stop at **WORK UNIT BLOCKED**
for owner direction.

The blocked-run transitions are:

- **Retry same claim:** the owner explicitly authorizes continuation of the
  already recorded claim. The token remains consumed and no replacement task
  may be selected. The unit returns to implementation, validation, and review.
- **Administrative close:** the owner directs whether loop-owned partial changes
  are removed or otherwise handled. After following that exact direction, the
  orchestrator restores and validates the baseline, appends an administratively
  closed run record without goal evidence, clears `Current run`, `Incomplete
  run`, and `Pending owner review`, sets `Owner authorization` and
  `Authorization scope` from the owner's explicit continue or stop instruction,
  synchronizes `CURRENT.md`, and commits that administrative transaction.
- **Reject and remove:** this is an administrative close in which the owner
  explicitly identifies the loop-owned changes to remove. Never discard them
  merely because the unit is blocked.

Administrative close does not mark a criterion met or increment the alignment
counter. A new unit may begin only after its close commit exists. No unit may
remain silently retryable while its token is consumed.

### 4. Partition bounded work

The orchestrator owns task selection, integration, validation, progress
recording, and completion judgment. It may delegate genuinely independent work
when doing so reduces risk or context pressure.

- Prefer one writer when interfaces or visual behavior are still uncertain.
- Parallel writers require explicit non-overlapping file ownership and agreed
  interfaces.
- Do not let two agents edit the same file concurrently.
- Use read-only investigation agents when clean write partitioning is absent.
- Do not delegate the goal choice, owner gate, progress claim, integration, or
  final completion decision.
- Require concise results rather than raw exploration logs.
- Skip delegation when coordination would cost more than it saves.

### 5. Implement one coherent change

Make the smallest change that can satisfy the progress claim. Infrastructure
work is allowed only when it is necessary for a named criterion and identifies
the immediate behavior it unlocks. Do not add speculative systems for later
goals.

The graph and user experience must be developed in tandem. A data-only or
graph-only abstraction is not progress unless the same work unit produces or
protects observable behavior required by the goal.

### 6. Validate proportionately

Run focused checks first, then `./scripts/check.sh`. For every affected visual
surface or interaction flow:

- launch the application through its documented command;
- render representative desktop and mobile viewports;
- click through the affected public interface flow;
- inspect the resulting layout, states, transitions, and console output; and
- retain concise evidence sufficient for the independent reviewer and owner.

Review the diff for:

- drift from identity and self-presentation toward reviews, logging, feeds, or
  productivity software;
- private Draft leakage into visitor mode;
- unexplained semantic edges created by spatial movement;
- manual Theme nodes or premature social systems;
- a graph that is decorative, technical, unstable, or detached from creation;
- inaccessible or unusable responsive behavior;
- tests weakened beyond the intended behavior; and
- complexity without observable product value.

If the work cannot be rendered or clicked through, it is not ready for owner
review. Report the exact validation blocker rather than claiming visual
completion.

### 7. Record candidate evidence and obtain fresh independent review

After integration and validation, first record the progress claim, owned diff,
observed behavior, validation, risks, and known assumptions under `Pending Owner
Review`. Then use a fresh read-only `gpt-5.6-sol` high-reasoning reviewer. Give
it:

- the active goal and relevant product rules;
- the resulting diff and owned paths;
- the progress claim;
- focused, full, browser, and visual validation evidence; and
- known risks or forced prototype behavior.

Do not give it the implementer's private reasoning or ask it to confirm the
chosen approach. The reviewer independently looks for goal mismatch, broken
invariants, private/public leakage, visual or interaction gaps, inadequate
evidence, test gaps, and unnecessary complexity.

Resolve every blocking finding. Any material correction requires focused and
full validation again and a fresh independent review. The review agent cannot
approve the work unit.

After a clean review, the orchestrator may append a factual summary of the
review result to `Pending Owner Review`. That administrative record does not
invalidate the review only if it changes no implementation, tests, behavior,
or evidence claim. The owner receives the complete final diff, including that
record.

### 8. Prepare owner review and stop

After independent review has no unresolved blocking finding:

- confirm the task and evidence are complete under `Pending Owner Review`;
- leave affected criteria open;
- preserve the reviewed implementation diff without committing; only factual
  review-record administration may differ from what the reviewer inspected;
- clear or summarize any finished subagent state;
- report observed behavior separately from interpretation;
- provide the validation and independent-review results; and
- ask the owner to approve, request changes, pause, or reject the unit.

Then stop at **AWAITING OWNER APPROVAL**. Do not select or begin later work.

### 9. Apply the owner's decision

If the owner requests changes, modify only the pending work unit, repeat
validation and fresh independent review, update the pending evidence, and
return to **AWAITING OWNER APPROVAL**.

If the owner rejects the unit, preserve or remove only the loop-owned pending
changes according to the owner's instruction. Do not discard them
automatically.

If the owner approves:

1. mark supported criteria and evidence owner-approved;
2. append the concise approved run record;
3. clear `Current run`, `Incomplete run`, and `Pending owner review`;
4. increment `Approved implementation runs since alignment` by one and set
   `Alignment due` to `yes` when the resulting count reaches `3`;
5. set the next owner gate from the owner's decision, using `alignment` scope
   when alignment is due;
6. synchronize the run-state snapshot in `CURRENT.md`;
7. review the final diff and stage only the coherent work unit; and
8. create one commit containing both the approved work and resulting gate.

The owner-approval state changes in steps 1 through 3 are factual
administration. They do not require another independent review unless they also
change implementation, tests, behavior, or the evidence claim.

Unless the owner says `approve only`, `pause`, or `stop`, approval grants one
single-use token for the orchestrator to select the next smallest work unit
inside the same goal. That next unit begins only after the approved commit
exists and from the updated repository state.

## Progress and Alignment Gates

- A criterion with proportionate owner-approved evidence is closed. Do not
  harden it further without a regression, affected invariant, or owner
  direction.
- After at most three owner-approved implementation units, an independently
  reviewed goal-level alignment must become the next owner-authorized unit.
- When alignment is due, any next authorization token applies to alignment only
  and cannot be consumed by implementation.
- Alignment reviews observable behavior, proven criteria, drift, complexity,
  and possible removal. It does not implement or select later work.
- Alignment results also stop for owner approval before commit.
- When the owner approves alignment, the same commit records the approved
  alignment, resets `Approved implementation runs since alignment` to `0`, sets
  `Alignment due` to `no`, clears `Current run`, `Incomplete run`, and `Pending
  owner review`, and sets the next gate from the owner's continue or stop
  instruction. If continuation is authorized, its scope returns to
  `implementation`.
- Never create a future implementation queue.
- Do not complete two infrastructure-only units without focused behavioral
  evidence.
- It is valid for alignment or a pre-consumption selection attempt to make no
  code change. A post-consumption unit that cannot produce its claim must use
  **WORK UNIT BLOCKED**.

## Work-Unit and Terminal States

Each run ends in exactly one state:

- **OWNER AUTHORIZATION REQUIRED** — no valid single-use authorization exists;
  no implementation work occurred.
- **ACTIVE RUN EXISTS** — another project task or agent is active; this run made
  no repository change.
- **ACTIVE RUN STATUS UNKNOWN** — overlap could not be checked reliably; this
  run made no repository change.
- **AWAITING OWNER APPROVAL** — one work unit is implemented, validated,
  independently reviewed, recorded as candidate evidence, and intentionally
  uncommitted.
- **CHANGES REQUESTED** — the owner required corrections; only the pending work
  unit may continue.
- **TASK APPROVED** — the owner approved the evidence and the coherent unit was
  committed. A next unit may begin only with the resulting single-use owner
  authorization.
- **ALIGNMENT APPROVED** — the owner approved an independently reviewed
  alignment record and its commit.
- **NEEDS OWNER DECISION** — continuing requires a product, visual, scope, or
  lasting architecture choice absent from the goal.
- **GOAL COMPLETE** — every criterion has owner-approved evidence; the final
  state is committed and no later goal is selected.
- **NO JUSTIFIED CHANGE** — no honest bounded change advances the active goal;
  the unused token remains granted but may not be retried against unchanged
  evidence without owner direction.
- **WORK UNIT BLOCKED** — a selected unit became non-viable after consuming its
  token; the current run and any loop-owned pending changes remain isolated
  until the owner directs retry, administrative close, or removal.
- **BASELINE BLOCKED** — repository state prevents a safe work unit.
- **OWNER PAUSED** — the owner paused or stopped the loop.

For each owner-approved work unit, retain a concise report in the implementation
state:

1. criterion advanced and progress claim;
2. observed behavior and interpretation kept separate;
3. files changed and commit created;
4. focused, full, browser, and visual validation;
5. implementation partition and independent-review findings;
6. forced outcomes, special cases, risks, and unresolved assumptions; and
7. whether alignment is due, without naming a future implementation task.
