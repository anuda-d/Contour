# Goal-bounded autonomous development loop

Status: current operating contract for continuous development against one
owner-approved goal.

This loop advances one approved product goal through small, independently
validated work units executed in successive fresh chats. It operates only when
`docs/plans/CURRENT.md` records one active owner-approved goal with standing
authorization. When no active goal is recorded or authorization is paused,
implementation stops until the owner supplies the required direction. Routine
implementation inside an authorized goal does not wait for owner review.

The owner remains the authority for a new goal and for unresolved material
product, visual, scope, or lasting architecture decisions. The loop never uses
standing authorization to broaden or reinterpret the active goal.

## Goal and work-unit boundary

The active goal defines the outcome, invariants, authorized scope, validation
standard, and completion condition. A work unit is the smallest coherent change
that can create new evidence for one unmet goal criterion in one fresh chat.
One implementation chat owns at most one work unit.

Standing authorization permits successive bounded work units only inside the
active goal. Work remains strictly one unit at a time. The loop selects each
unit from current repository evidence after the prior unit is accepted and
committed. It never creates a future task queue.

Each work unit:

1. selects one smallest justified goal gap;
2. obtains one to three independent read-only explorations;
3. states one criterion, intended behavior, and evidence claim;
4. implements one coherent change through the sole-writer orchestrator;
5. runs focused and full repository validation, plus a rendered click-through
   only when the five-UI-unit visual checkpoint is due;
6. records candidate evidence;
7. receives a fresh independent read-only review;
8. resolves every blocking finding and repeats focused/full repository
   validation and review after material correction;
9. records accepted evidence and creates one local commit after a clean review;
10. writes a compact temporary handoff that selects no next unit; and
11. stops so the next unit begins in a newly created fresh chat.

The loop stops only when the goal is complete, the owner pauses or stops it, an
owner decision is required, another run overlaps, the baseline is unsafe, or a
technical or external-action blocker cannot be resolved within authorized
scope.

## Fresh-chat handoff contract

Every implementation unit begins in a newly created fresh chat.
The first unit after goal authorization reads the active goal and implementation
state and has no prior unit handoff.
Every later unit reads the latest temporary handoff before selecting or
continuing work.

A unit chat may orient, select or continue one unit, explore, implement,
validate, obtain fresh review, correct findings, accept, and commit that one
unit.
It may not select or implement a second unit.

At the end of an accepted, paused, blocked, or owner-decision run, write a
compact redacted handoff document in the operating system temporary directory.
Use the stable filename `contour-<active-goal-id>-handoff.md`.
Capture that goal id when the chat starts and preserve it for the handoff name
even if terminal state later clears `Active goal id`.
Reference authoritative repository artifacts rather than duplicating their
content.

The handoff contains only:

- active goal id and exact terminal state;
- accepted commit or exact incomplete working-tree state;
- criterion and evidence status;
- focused, full, rendered, and independent-review results as applicable;
- UI checkpoint count;
- forced prototype behavior, risks, and unresolved owner decisions;
- `No next unit selected`; and
- suggested skills for the next chat.

The handoff is context, not authority, accepted evidence, or a future task
queue.
The repository goal and implementation state remain authoritative.
If the temporary handoff is unavailable, the fresh chat reconstructs factual
state from the repository and does not infer missing decisions.

After writing the handoff, the current chat stops.
The next smallest gap is selected only after a fresh chat rechecks standing
authorization, overlap, repository state, the entry gate, and current evidence.

## Owner decision boundary

Routine implementation evidence is accepted under standing authorization after
focused and full repository validation and clean fresh independent review. The
owner is not a routine work-unit reviewer.

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

## Frontend design contract

For work affecting Map presentation, interaction, visibility, responsive
layout, design tokens, or reusable frontend foundations, the orchestrator must
use the `design-taste-frontend` skill.

Before editing, record:

- the one-line Design Read;
- `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`;
- the relevant redesign audit and patterns being preserved or retired; and
- the applicable design-system or honest native-CSS choice.

Before acceptance, apply the skill's relevant source, token, content, contrast,
shape, and accessibility pre-flight checks. Full rendered responsive,
color-mode, motion, and interaction replay belongs to the visual checkpoint
unless a narrow smoke check is needed to diagnose a specific implementation
risk. Landing-page-specific rules do not apply mechanically to the interactive
Map.

## Visual checkpoint cadence

Full rendered click-through testing is deliberately batched for this
experimental prototype.

- Count only implementation units that change a visible UI surface or
  interaction. Counts one through four represent accepted units since the last
  checkpoint.
- When the next UI candidate would be the fifth, preserve it as `Current run`,
  set the count to five and `Run status` to `visual checkpoint`, and run one
  combined checkpoint before review and acceptance.
- Record the checkpoint with the candidate evidence, then obtain the unit's
  fresh independent review of both code and checkpoint evidence. After a clean
  review, accept and commit the fifth unit, update `Visual checkpoint`, reset
  the count to zero, set `Run status` to `awaiting fresh chat`, write the
  temporary handoff, and stop the unit chat.
- Exercise the accumulated affected flows at representative desktop and mobile
  sizes, supported color modes, keyboard/touch behavior, responsive seams, and
  console output.
- Reset the count to zero only after the checkpoint evidence is recorded.
- Run the same complete checkpoint before marking the goal complete, even when
  fewer than five UI units have accumulated.
- Independent read-only code review remains required for every unit and after
  every material correction. Reviewers do not repeat the complete rendered
  click-through unless a checkpoint is due.

Each active goal's implementation state owns the current checkpoint date and
UI-unit count. Historical goal checkpoints do not authorize or satisfy a later
goal's visual evidence.

## Goal-specific entry gate

The implementation-state schema retains a `Graph foundation` field for the
completed Identity Map Prototype and compatible later goals. When an active
goal sets this field to `open`, that goal must define the exact visible entry
gate and restrict selection accordingly.

Any entry gate must develop observable end-to-end behavior and the smallest
necessary substrate together. It may include an application shell, goal-valid
seed data, model, rendering, interaction, and local state only insofar as they
support the visible claim. It may not be satisfied by speculative architecture
or a placeholder surface.

The gate becomes `approved` only when its bounded behavior is exercised, fully
validated, independently reviewed without an unresolved blocker, recorded as
accepted evidence, and committed under standing authorization.

## Model routing

- The sole-writer orchestrator uses `gpt-5.6-terra` with high reasoning.
- Read-only explorer subagents use `gpt-5.6-terra` with high reasoning.
- Every independent implementation and alignment review uses a fresh
  `gpt-5.6-sol` agent with high reasoning.
- Reviewers are read-only and may not edit, commit, choose product direction,
  or determine a new goal.

## No-overlap gate

Before selecting a unit, inspect project task and agent activity. Ignore the
active orchestrator itself.

If another project orchestrator, orphaned explorer, reviewer, or unrelated task
is active, stop at **ACTIVE RUN EXISTS** without changing the repository. If
activity cannot be inspected reliably, stop at **ACTIVE RUN STATUS UNKNOWN**.

Explorers and reviewers spawned by the current orchestrator are expected. The
orchestrator must receive, stop, or otherwise resolve every owned subagent
before accepting a unit.

## Sources of authority

Read these in order before repository work:

1. `AGENTS.md`;
2. `docs/plans/CURRENT.md`;
3. the active goal linked from `CURRENT.md`;
4. the linked implementation state;
5. relevant implementation and tests located at selection time; and
6. only the product specification relevant to the selected unit.

The product foundation and active goal are authoritative. The active goal may
narrow higher-level documents but may not violate their invariants. Open
questions identify owner-decision boundaries and are not a backlog.

If sources conflict in a way that affects product direction, visual language,
scope, or lasting architecture, stop at **NEEDS OWNER DECISION** with the
smallest concrete decision required.

## Standing authority

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
- create the required temporary handoff after each unit.

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

- the current implementation chat has not completed another work unit;
- `CURRENT.md` links exactly one active owner-approved goal;
- standing authorization is active for that goal;
- no owner decision or alignment blocker is pending;
- no overlapping run exists;
- a current unit, if any, matches the recorded incomplete unit;
- the behavior is authorized by the active goal;
- no future task queue is recorded;
- any goal-specific entry gate is respected;
- the checkout contains no unsafe overlapping user changes; and
- the repository check passes, or a pre-existing unrelated failure is recorded.

If unrelated user changes overlap the unit, stop at **BASELINE BLOCKED** and
report exact paths. Never reset or discard them without direction.

## One work-unit run

### 1. Orient

Read the compact index, active goal, implementation state, accepted evidence,
current run, owner-decision state, and latest temporary handoff when one exists.
Confirm this is a fresh chat for the unit. If a unit is already active, continue
only that unit. Otherwise select a new unit after all preconditions pass.

### 2. Select one task

Choose the smallest unmet goal gap that can create visible or behavioral
evidence in one chat. While a goal-specific entry gate is open, select only a
unit that can satisfy that visible entry gate.

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
is allowed only when necessary for visible or directly testable behavior in the
same unit.

Develop discovery behavior and its supporting surfaces in tandem. When the Map
is affected, preserve spatial movement as distinct from semantic authorship,
private Drafts as distinct from Published content, private interest behavior as
distinct from public Map membership, and unrelated user changes as outside the
unit.

Use the frontend design contract for every relevant visual unit.

### 5. Validate proportionately

Run focused checks first and then `./scripts/check.sh`.

For each ordinary unit, validate the affected behavior with focused tests,
source and diff inspection, and the full repository check. Record whether the
unit increments the UI-unit checkpoint counter. A targeted rendered smoke check
is optional when it answers a concrete risk efficiently; it is not a routine
acceptance gate.

When the visual checkpoint is due, launch through the documented command and:

- render representative desktop and mobile sizes;
- test the accumulated affected pointer, keyboard, touch, and responsive flows;
- inspect layout, state transitions, both supported color modes, and console;
- exercise reduced-motion behavior when motion changed; and
- retain concise checkpoint evidence.

Review the diff for:

- drift from intentional human discovery toward ratings, generic logging,
  opaque recommendations, feeds, or productivity software;
- discovery results that lack truthful provenance or understandable evidence;
- private Saves, Bookmarks, Votes, or passive behavior leaking into the public
  Map or another User's recommendation explanation;
- private Draft leakage into visitor mode;
- semantic relationships created by spatial movement;
- canonical Theme nodes, manual Theme filing, or generated Themes presented as
  authored human language;
- public popularity scores or personalized Votes treated as global truth;
- a Map that is decorative, technical, unstable, flowchart-like, or detached
  from discovery and contribution;
- attention-maximizing mechanics inconsistent with intentional use;
- inaccessible responsive behavior;
- tests weakened beyond intended behavior;
- speculative infrastructure; and
- unrelated work.

### 6. Record evidence and obtain fresh review

Before review, record under the current unit:

- criterion and progress claim;
- exact owned diff;
- observed behavior separately from interpretation;
- focused and full repository validation, any targeted smoke evidence, and the
  current visual-checkpoint count or checkpoint result;
- risks, forced prototype behavior, and unresolved assumptions; and
- proposed accepted evidence.

Then use a fresh read-only `gpt-5.6-sol` high-reasoning reviewer. Provide the
goal, relevant product and design rules, actual diff, evidence claim,
validation, and known risks. Do not provide private implementation reasoning or
ask for confirmation.

The reviewer checks goal fit, invariants, privacy boundaries, code-level
interaction and visual quality, evidence sufficiency, test coverage,
unnecessary complexity, and whether an owner decision is required. At a visual
checkpoint, the reviewer also inspects the rendered click-through evidence.

Resolve every blocking finding. Every material correction requires focused and
full repository validation again plus another fresh review. It does not require
another complete rendered click-through unless the visual checkpoint is due or
the correction invalidates checkpoint evidence.

### 7. Accept, commit, hand off, and stop

After validation passes and a fresh review has no unresolved blocker:

1. append the factual review result;
2. mark only proportionately supported criteria and evidence accepted under
   the active goal's recorded standing owner authorization;
3. set the applicable goal-specific entry gate to `approved` when the unit
   satisfies it;
4. append the accepted run record;
5. for an accepted UI unit below the checkpoint, increment `UI units since
   visual checkpoint`; for the fifth unit, update `Visual checkpoint` with its
   recorded evidence and reset the count from five to zero;
6. clear `Current run` and `Incomplete run`;
7. set `Run status` to `awaiting fresh chat` unless the goal is complete;
8. synchronize `CURRENT.md`;
9. review and stage only the coherent unit;
10. create one local commit;
11. write the required compact temporary handoff with the exact commit and `No
    next unit selected`; and
12. stop at **UNIT COMMITTED - HANDOFF READY**.

The factual acceptance record may differ from the reviewed diff only in
administrative state. Any change to implementation, tests, behavior, or the
evidence claim requires fresh validation and review.

## Blocked units

If a selected unit becomes non-viable, do not silently replace it.

- If the blocker is technical and can be resolved safely inside the same claim,
  continue that unit.
- If the blocker requires a product, visual, scope, architecture, destructive,
  or external-action decision, set `Pending owner decision`, set `Run status`
  to `needs owner decision`, preserve the isolated unit, and stop at **NEEDS
  OWNER DECISION - HANDOFF READY** after writing the temporary handoff.
- If the baseline or overlapping user work is unsafe, stop at **BASELINE
  BLOCKED - HANDOFF READY** after writing the temporary handoff.
- Never remove loop-owned or user-owned work merely because a unit is blocked.

Administrative closure or removal of a blocked unit requires explicit owner
direction when it would discard material work.

## Alignment review

Perform goal-level alignment at meaningful milestones or when verified evidence
reveals possible drift or unnecessary complexity. Alignment reviews observable
behavior, accepted evidence, product fit, and possible removal. It does not
select future tasks.

Alignment receives fresh independent read-only review. If it finds no material
owner decision and no blocker, record and commit the alignment under standing
authorization, clear `Alignment due`, write a temporary handoff, and stop so
any later unit begins in a fresh chat. If it requires a material product,
visual, scope, or architecture decision, stop at **NEEDS OWNER DECISION -
HANDOFF READY**.

## Owner pause or stop

The owner may pause or stop the loop at any time.

On pause:

- set `Owner authorization` to `paused`;
- retain `Authorization scope: active goal` and `Authorization source: owner`;
- set `Loop cadence` and `Run status` to `paused`;
- set `Standing implementation authority: paused` exactly once in both
  operational state files;
- set `Status: Human Discovery Prototype is owner-approved and paused.` in
  `CURRENT.md` and `README.md`, `Status: active; owner-approved goal paused.` in
  the goal, and `Status: active shared state; owner-approved goal paused.` in
  the implementation state;
- set the single `Active work` line to `Active work: none; owner authorization
  is paused`;
- preserve any matching `Current run` and `Incomplete run`; and
- make no product implementation change or loop-unit commit until the owner
  resumes or directs disposition.

If a unit chat is active when the pause occurs, write the temporary handoff and
stop.
An administrative state change or commit explicitly requested by the owner
remains allowed.

If the owner stops while a material unit is active, preserve it. Do not clear,
discard, or commit it without explicit disposition. A stopped clean boundary
with no active unit may use the same paused state until the owner supplies a new
direction.

## Owner resume

Only an explicit owner instruction may resume a paused goal.
Resume happens in a newly created fresh chat and requires every pending owner
decision needed for the next eligible unit to be resolved first.

Before selection, synchronize these canonical fields and status lines in
`CURRENT.md`, the active goal, and its implementation state:

- `Owner authorization: standing`;
- `Authorization scope: active goal`;
- `Authorization source: owner`;
- `Loop cadence: continuous`;
- `Run status: selecting` when no unit is active, or the exact continuing-unit
  status when one is preserved;
- non-pending mirrored `Attributed evidence source` and `Attributed evidence
  provenance` fields plus the matching durable Owner decision record when the
  goal requires attributed human evidence;
- `Status: Human Discovery Prototype is active under standing authorization.`
  in `CURRENT.md` for this goal;
- `Status: active; owner-approved goal under standing authorization.` in this
  goal's `GOAL.md`; and
- `Status: active shared state; standing owner authorization.` in this goal's
  implementation state.
- `Active work: Human Discovery Prototype implementation is active under
  standing authorization` in `CURRENT.md` for this goal; and
- `Status: Human Discovery Prototype is active under standing authorization.`
  in `README.md`.

Rewrite current authorization prose so it says standing authority is active and
does not retain a contradictory pause or implementation prohibition.
Remove or rewrite initial-preparation claims such as no implementation having
started, no implementation authority existing, or implementation activity
being absent.
Run `./scripts/check.sh` against the synchronized resume state before selecting
or continuing the unit.

When a goal is paused again after implementation has begun, use the canonical
paused status lines enforced by `scripts/check.sh` and update current prose to
describe the actual preserved run, accepted evidence, and pause reason.
Do not reuse “before implementation” wording after implementation evidence
exists.

## Goal completion

The active goal is complete only when every criterion has proportionate
accepted evidence, the complete walkthrough and full check pass, all affected
visual surfaces have been rendered and exercised, and a final fresh independent
review finds no unresolved blocker or missing criterion.

When complete:

1. run and record the final complete rendered click-through checkpoint, set
   `Visual checkpoint` to `goal completion`, reset `UI units since visual
   checkpoint` to `0`, record the final accepted evidence and review, and mark
   every active-goal criterion `accepted` in the Goal Progress table;
2. replace the goal status with the single canonical line `Status: complete;
   owner-approved goal completed under standing authorization.`;
3. clear `Current run`, `Incomplete run`, and `Pending owner decision` to
   `none`;
   preserve the completing goal id separately for the final handoff filename;
4. set `Run status` to `none`;
5. set `Owner authorization` to `pending`, `Authorization scope` and
   `Authorization source` to `none`, and `Loop cadence` to `stopped`;
6. set `Graph foundation` and the active goal's discovery entry gate to
   `approved` and `Alignment due` to `no`;
7. set `Active goal id` to `none` in both state files;
8. replace (do not append to) the status and active-work prose in both state
   files with the canonical completed lines enforced by `scripts/check.sh`,
   including `Status: no active goal; Human Discovery Prototype is complete.`
   in `CURRENT.md` and `Status: complete shared state; no work is active and
   the loop is stopped.` in the implementation state, so no stale active,
   pause, or correction claim remains;
   set `Status: Human Discovery Prototype is complete.` in `README.md` and set
   `Standing implementation authority: none` exactly once in both operational
   state files;
9. replace the full `Current run` section body with only `- State: none; goal
   complete.` and the full `Current unit evidence` section body before
   `Goal-readiness evidence` with only `- State: complete; no current unit.`;
10. replace the active `Goal` link in `CURRENT.md` with `Last completed goal`
   while retaining the shared implementation-state link, and keep earlier
   completed goals under a different historical label so exactly one
   `Last completed goal` entry exists;
11. synchronize every remaining mirrored field in `CURRENT.md`;
    replace initial readiness prose that claims implementation is paused,
    absent, or not started with factual completion history;
    update `README.md` so its current capability and prototype-limit prose no
    longer says discovery is unimplemented;
12. run the final repository check against that exact terminal state;
13. create the final local commit;
14. write the final temporary handoff with `No next unit selected`; and
15. stop at **GOAL COMPLETE** without selecting another goal.

The owner supplies any later goal.

## Terminal states

Each unit or loop ends in exactly one state:

- **UNIT COMMITTED - HANDOFF READY**: one bounded unit passed validation and
  fresh independent review, was accepted under standing authorization, was
  committed locally, and has a temporary handoff for a new chat.
- **ALIGNMENT COMMITTED - HANDOFF READY**: a clean independently reviewed
  alignment was committed and has a temporary handoff for a new chat.
- **NEEDS OWNER DECISION - HANDOFF READY**: continuation requires a new goal or a material
  product, visual, scope, architecture, destructive, external-action, pause, or
  stop decision, and current factual state has been handed off.
- **OWNER AUTHORIZATION REQUIRED OR PAUSED**: standing authorization is absent
  or withdrawn.
- **ACTIVE RUN EXISTS**: another project run makes safe selection impossible.
- **ACTIVE RUN STATUS UNKNOWN**: overlap could not be checked reliably.
- **NO JUSTIFIED CHANGE**: no honest bounded unit advances the goal from current
  evidence.
- **WORK UNIT BLOCKED - HANDOFF READY**: a technical blocker prevents the
  current claim from completing safely, and current factual state has been
  handed off.
- **BASELINE BLOCKED - HANDOFF READY**: overlapping or unsafe repository state
  prevents work, and current factual state has been handed off.
- **GOAL COMPLETE**: all criteria have accepted evidence, the final validation
  and review are clean, the final commit exists, and no later goal is selected.

## Accepted run record

For every committed unit retain:

1. criterion and claim;
2. observed behavior and interpretation separately;
3. exact files and local commit;
4. focused and full repository validation, plus the UI checkpoint count and any
   applicable targeted smoke or full checkpoint evidence;
5. explorer partition and fresh review result;
6. risks and unresolved assumptions; and
7. acceptance basis: the active goal's recorded standing owner authorization;
   and
8. confirmation that the temporary handoff records `No next unit selected`.
