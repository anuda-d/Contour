# Goal-Bounded Autonomous Development Loop

Status: current operating contract for continuous development against one
owner-approved goal.

This loop advances one approved product goal through small, independently
validated work units. The owner has granted standing authorization for the loop
to continue until the active goal is complete. Routine implementation does not
wait for owner review.

The owner remains the authority for a new goal and for unresolved material
product, visual, scope, or lasting architecture decisions. The loop never uses
standing authorization to broaden or reinterpret the active goal.

## Goal and Work-Unit Boundary

The active goal defines the outcome, invariants, authorized scope, validation
standard, and completion condition. A work unit is the smallest coherent change
that can create new evidence for one unmet goal criterion in one fresh context.

Standing authorization permits successive bounded work units only inside the
active goal. Work remains strictly one unit at a time. The loop selects each
unit from current repository evidence after the prior unit is accepted and
committed. It never creates a future task queue.

Each work unit:

1. selects one smallest justified goal gap;
2. obtains one to three independent read-only explorations;
3. states one criterion, intended behavior, and evidence claim;
4. implements one coherent change through the sole-writer orchestrator;
5. runs focused, full, browser, interaction, and visual validation as
   applicable;
6. records candidate evidence;
7. receives a fresh independent read-only review;
8. resolves every blocking finding and repeats validation and review after
   material correction;
9. records accepted evidence and creates one local commit after a clean review;
   and
10. immediately re-orients for the next bounded unit inside the same goal.

The loop stops only when the goal is complete, the owner pauses or stops it, an
owner decision is required, another run overlaps, the baseline is unsafe, or a
technical or external-action blocker cannot be resolved within authorized
scope.

## Owner Decision Boundary

Routine implementation evidence is accepted under standing authorization after
full validation and clean fresh independent review. The owner is not a routine
work-unit reviewer.

Stop at **NEEDS OWNER DECISION** before acting when continuation requires:

- selecting, replacing, broadening, or reinterpreting a goal;
- a material product, visual, scope, or lasting architecture choice not already
  settled by authoritative documents;
- changing the product philosophy, pillars, invariants, or model;
- resolving an open question that materially affects behavior;
- destructive cleanup, disposal of user work, deployment, publication, push,
  merge, or another external side effect;
- authority to handle overlapping unrelated changes; or
- direction after the owner pauses or stops the loop.

The independent reviewer may identify that a decision is required, but may not
make the decision.

When a decision is required, set `Pending owner decision` to the smallest
concrete question and `Run status` to `needs owner decision`. Preserve a current
unit when one exists; otherwise leave `Current run` and `Incomplete run` as
`none`. Standing authorization remains recorded but no work continues until the
decision is supplied.

## Frontend Design Contract

For work affecting Map presentation, interaction, visibility, responsive
layout, design tokens, or reusable frontend foundations, the orchestrator must
use the `design-taste-frontend` skill.

Before editing, record:

- the one-line Design Read;
- `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`;
- the relevant redesign audit and patterns being preserved or retired; and
- the applicable design-system or honest native-CSS choice.

Before acceptance, apply the skill's relevant pre-flight checks, including
responsive behavior, reduced motion, both supported color modes, content
clarity, contrast, shape consistency, and removal of generic or flowchart-like
visual patterns. Landing-page-specific rules do not apply mechanically to the
interactive Map.

## Graph-First Entry Gate

The active implementation state carries a `Graph foundation` field. While it is
`open`, the loop may work only on the first visible, interactive Map foundation.

The graph foundation must develop observable graph behavior and the smallest
necessary substrate together. It may include an application shell, goal-valid
seed data, graph model, rendering, layout, and direct interaction only insofar
as they support the visible claim. It may not select profile, onboarding,
publishing, authentication, or speculative production work before the gate is
accepted.

The gate becomes `approved` only when a bounded graph unit is rendered,
interacted with, fully validated, independently reviewed without an unresolved
blocker, recorded as accepted evidence, and committed under standing
authorization.

## Model Routing

- The sole-writer orchestrator uses `gpt-5.6-terra` with high reasoning.
- Read-only explorer subagents use `gpt-5.6-terra` with high reasoning.
- Every independent implementation and alignment review uses a fresh
  `gpt-5.6-sol` agent with high reasoning.
- Reviewers are read-only and may not edit, commit, choose product direction,
  or determine a new goal.

## No-Overlap Gate

Before selecting a unit, inspect project task and agent activity. Ignore the
active orchestrator itself.

If another project orchestrator, orphaned explorer, reviewer, or unrelated task
is active, stop at **ACTIVE RUN EXISTS** without changing the repository. If
activity cannot be inspected reliably, stop at **ACTIVE RUN STATUS UNKNOWN**.

Explorers and reviewers spawned by the current orchestrator are expected. The
orchestrator must receive, stop, or otherwise resolve every owned subagent
before accepting a unit.

## Sources of Authority

Read these in order before repository work:

1. `AGENTS.md`;
2. `docs/plans/CURRENT.md`;
3. the active goal linked from `CURRENT.md`;
4. the linked implementation state;
5. relevant implementation and tests located just in time; and
6. only the product specification relevant to the selected unit.

The product foundation and active goal are authoritative. The active goal may
narrow higher-level documents but may not violate their invariants. Open
questions identify owner-decision boundaries and are not a backlog.

If sources conflict in a way that affects product direction, visual language,
scope, or lasting architecture, stop at **NEEDS OWNER DECISION** with the
smallest concrete decision required.

## Standing Authority

While the active goal has `Owner authorization: standing`, the loop may:

- select successive bounded units inside the active goal;
- implement one coherent change per unit;
- add or update focused tests for that behavior;
- create the smallest necessary application or validation substrate tied to a
  named criterion;
- update implementation-state evidence;
- simplify or remove loop-owned code when it is the safest smallest way to
  satisfy the goal;
- use bounded read-only explorers and reviewers;
- accept clean reviewed evidence;
- create local commits; and
- continue immediately to the next justified unit.

Standing authority does not permit the loop to:

- select or invent a new goal;
- broaden or reinterpret the active goal;
- decide an unresolved owner question;
- weaken tests, validation, product boundaries, authorship, or privacy rules;
- absorb, overwrite, discard, or commit unrelated user work;
- push, merge, deploy, publish, or create external side effects;
- use destructive cleanup to make a unit pass; or
- treat a reviewer as a product decision-maker.

## Preconditions

Before selecting a new unit or continuing the current unit, confirm that:

- `CURRENT.md` links exactly one active owner-approved goal;
- standing authorization is active for that goal;
- no owner decision or alignment blocker is pending;
- no overlapping run exists;
- a current unit, if any, matches the recorded incomplete unit;
- the behavior is authorized by the active goal;
- no future task queue is recorded;
- the graph-first gate is respected;
- the checkout contains no unsafe overlapping user changes; and
- the repository check passes, or a pre-existing unrelated failure is recorded.

If unrelated user changes overlap the unit, stop at **BASELINE BLOCKED** and
report exact paths. Never reset or discard them without direction.

## One Work-Unit Run

### 1. Orient

Read the compact index, active goal, implementation state, accepted evidence,
current run, and owner-decision state. If a unit is already active, continue
only that unit. Otherwise select a new unit after all preconditions pass.

### 2. Select one task

Choose the smallest unmet goal gap that can create visible or behavioral
evidence in one context. While the graph foundation is open, select only a
visible graph-foundation gap.

Record only that task under `Current Run`. State:

> This work unit advances criterion X by producing behavior Y, verified by
> evidence Z.

Do not record later tasks. If no honest gap advances the goal, stop at **NO
JUSTIFIED CHANGE** without changing implementation.

### 3. Partition bounded work

Use one to three read-only explorer subagents for concrete independent
questions. They may inspect code, tests, docs, runtime evidence, and options.
They may not edit or choose the task or product direction.

Wait for all explorers before implementation. The orchestrator remains the sole
writer and owns selection, integration, validation, and completion judgment.

### 4. Implement one coherent change

Make the smallest end-to-end change that can satisfy the claim. Infrastructure
is allowed only when necessary for the visible behavior in the same unit.

Develop the graph and surrounding user experience in tandem. Preserve spatial
movement as distinct from semantic authorship, private Drafts as distinct from
Published content, and unrelated user changes as outside the unit.

Use the frontend design contract for every relevant visual unit.

### 5. Validate proportionately

Run focused checks first and then `./scripts/check.sh`.

For every affected visual surface or flow:

- launch through the documented command;
- render representative desktop and mobile sizes;
- test every affected pointer, keyboard, touch, and responsive flow;
- inspect layout, state transitions, both supported color modes, and console
  output;
- exercise reduced-motion behavior when motion changed; and
- retain concise evidence for review.

Review the diff for:

- drift from identity and self-presentation toward reviews, logging, feeds, or
  productivity software;
- private Draft leakage into visitor mode;
- semantic relationships created by spatial movement;
- manual Theme nodes or premature social systems;
- a Map that is decorative, technical, unstable, flowchart-like, or detached
  from creation;
- inaccessible responsive behavior;
- tests weakened beyond intended behavior;
- speculative infrastructure; and
- unrelated work.

If affected behavior cannot be seen or evaluated, it is not ready for review.

### 6. Record evidence and obtain fresh review

Before review, record under the current unit:

- criterion and progress claim;
- exact owned diff;
- observed behavior separately from interpretation;
- focused, full, browser, interaction, and visual validation;
- risks, forced prototype behavior, and unresolved assumptions; and
- proposed accepted evidence.

Then use a fresh read-only `gpt-5.6-sol` high-reasoning reviewer. Provide the
goal, relevant product and design rules, actual diff, evidence claim,
validation, and known risks. Do not provide private implementation reasoning or
ask for confirmation.

The reviewer checks goal fit, invariants, privacy boundaries, interaction and
visual quality, evidence sufficiency, test coverage, unnecessary complexity,
and whether an owner decision is required.

Resolve every blocking finding. Every material correction requires focused and
full validation again plus another fresh review.

### 7. Accept, commit, and continue

After validation passes and a fresh review has no unresolved blocker:

1. append the factual review result;
2. mark only proportionately supported criteria and evidence accepted under
   `standing owner authorization, 2026-08-22`;
3. set `Graph foundation` to `approved` when the unit satisfies its gate;
4. append the accepted run record;
5. clear `Current run` and `Incomplete run`;
6. set `Run status` to `selecting` unless the goal is complete;
7. synchronize `CURRENT.md`;
8. review and stage only the coherent unit;
9. create one local commit; and
10. re-orient immediately for the next bounded unit.

The factual acceptance record may differ from the reviewed diff only in
administrative state. Any change to implementation, tests, behavior, or the
evidence claim requires fresh validation and review.

## Blocked Units

If a selected unit becomes non-viable, do not silently replace it.

- If the blocker is technical and can be resolved safely inside the same claim,
  continue that unit.
- If the blocker requires a product, visual, scope, architecture, destructive,
  or external-action decision, set `Pending owner decision`, set `Run status`
  to `needs owner decision`, preserve the isolated unit, and stop at **NEEDS
  OWNER DECISION**.
- If the baseline or overlapping user work is unsafe, stop at **BASELINE
  BLOCKED**.
- Never remove loop-owned or user-owned work merely because a unit is blocked.

Administrative closure or removal of a blocked unit requires explicit owner
direction when it would discard material work.

## Alignment

Perform goal-level alignment at meaningful milestones or when verified evidence
reveals possible drift or unnecessary complexity. Alignment reviews observable
behavior, accepted evidence, product fit, and possible removal. It does not
select future tasks.

Alignment receives fresh independent read-only review. If it finds no material
owner decision and no blocker, record and commit the alignment under standing
authorization, clear `Alignment due`, and continue. If it requires a material
product, visual, scope, or architecture decision, stop at **NEEDS OWNER
DECISION**.

## Owner Pause or Stop

The owner may pause or stop the loop at any time.

On pause:

- set `Owner authorization` to `paused`;
- retain `Authorization scope: active goal` and `Authorization source: owner`;
- set `Loop cadence` and `Run status` to `paused`;
- preserve any matching `Current run` and `Incomplete run`; and
- make no implementation change or commit until the owner resumes or directs
  disposition.

If the owner stops while a material unit is active, preserve it. Do not clear,
discard, or commit it without explicit disposition. A stopped clean boundary
with no active unit may use the same paused state until the owner supplies a new
direction.

## Goal Completion

The active goal is complete only when every criterion has proportionate
accepted evidence, the complete walkthrough and full check pass, all affected
visual surfaces have been rendered and exercised, and a final fresh independent
review finds no unresolved blocker or missing criterion.

When complete:

1. record the final accepted evidence and review, and mark every IM criterion
   `accepted` in the Goal Progress table;
2. replace the goal status with the single canonical line `Status: complete;
   owner-approved goal completed under standing authorization.`;
3. clear `Current run`, `Incomplete run`, and `Pending owner decision` to
   `none`;
4. set `Run status` to `none`;
5. set `Owner authorization` to `pending`, `Authorization scope` and
   `Authorization source` to `none`, and `Loop cadence` to `stopped`;
6. set `Graph foundation` to `approved` and `Alignment due` to `no`;
7. set `Active goal id` to `none` in both state files;
8. replace (do not append to) the status and active-work prose in both state
   files with the canonical completed lines enforced by `scripts/check.sh`, so
   no stale active-correction claim remains;
9. replace the full `Current Run` section body with only `- State: none; goal
   complete.` and the full `Current Unit Evidence` section body with only
   `- State: complete; no current unit.`;
10. replace the active `Goal` link in `CURRENT.md` with `Last completed goal`
   while retaining the shared implementation-state link;
11. synchronize every remaining mirrored field in `CURRENT.md`;
12. run the final repository check against that exact terminal state;
13. create the final local commit; and
14. stop at **GOAL COMPLETE** without selecting another goal.

The owner supplies any later goal.

## Terminal States

Each unit or loop ends in exactly one state:

- **UNIT COMMITTED**: one bounded unit passed validation and fresh independent
  review, was accepted under standing authorization, and was committed locally.
  The loop continues immediately unless another terminal condition applies.
- **ALIGNMENT COMMITTED**: a clean independently reviewed alignment was
  committed and the loop continues.
- **NEEDS OWNER DECISION**: continuation requires a new goal or a material
  product, visual, scope, architecture, destructive, external-action, pause, or
  stop decision.
- **OWNER AUTHORIZATION REQUIRED OR PAUSED**: standing authorization is absent
  or withdrawn.
- **ACTIVE RUN EXISTS**: another project run makes safe selection impossible.
- **ACTIVE RUN STATUS UNKNOWN**: overlap could not be checked reliably.
- **NO JUSTIFIED CHANGE**: no honest bounded unit advances the goal from current
  evidence.
- **WORK UNIT BLOCKED**: a technical blocker prevents the current claim from
  completing safely.
- **BASELINE BLOCKED**: overlapping or unsafe repository state prevents work.
- **GOAL COMPLETE**: all criteria have accepted evidence, the final validation
  and review are clean, the final commit exists, and no later goal is selected.

## Accepted Run Record

For every committed unit retain:

1. criterion and claim;
2. observed behavior and interpretation separately;
3. exact files and local commit;
4. focused, full, browser, interaction, and visual validation;
5. explorer partition and fresh review result;
6. risks and unresolved assumptions; and
7. acceptance basis: `standing owner authorization, 2026-08-22`.
