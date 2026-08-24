# Current Development Index

Status: Identity Map Prototype is the active owner-approved goal as of
2026-08-20. Standing goal-bounded authorization was granted on 2026-08-22 for
successive independently reviewed work units until the goal is complete.

## Active Work

- Goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Shared implementation state: [Implementation Plan](identity-map-prototype/IMPLEMENTATION_PLAN.md)
- Map design foundation: [Editorial Constellation](identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
- Active work: selecting the next bounded unit inside the active goal

## Run State Snapshot

- Active goal id: identity-map-prototype
- Owner authorization: standing
- Authorization scope: active goal
- Authorization source: owner
- Loop cadence: continuous
- Graph foundation: approved
- Current run: none
- Incomplete run: none
- Run status: selecting
- Pending owner decision: none
- Alignment due: no
- Visual checkpoint: accepted through Map-led Thought capture, 2026-08-23
- UI units since visual checkpoint: 3

The graph-first foundation correction was accepted under standing authorization
on 2026-08-22 after full validation and clean fresh independent review. Routine
validation and fresh independent review replace owner work-unit review;
material product, visual, scope, and lasting architecture decisions remain
owner-gated.

On 2026-08-23 the owner selected the quiet Draft margin-note treatment. Draft
Thoughts use an open authored mark at overview scale, add a small `Draft` note
beside their floating fragment at middle scale, and identify themselves as
`Private draft` in close contextual detail. Visitor mode excludes them.

On 2026-08-23 the owner also reduced rendered click-through validation from a
per-unit gate to a checkpoint on every fifth UI unit before its acceptance and
before goal completion. Fresh independent code review and focused/full
repository checks remain required for every unit.

The owner explicitly resumed the autonomous loop on 2026-08-24. Durable pinned
node placement was accepted after focused and full validation, targeted browser
evidence, correction of review findings, and clean fresh independent review.
Map-led Draft publishing is accepted after focused and full checks, a targeted
rendered publication flow, correction of a stale-tab persistence issue, and
clean fresh correction review. The Map-led cross-media bridge Draft is also
accepted after focused and full checks, a targeted rendered bridge-to-public
flow, correction of cross-version lifecycle and stale-detail issues, and clean
fresh correction review. The loop is selecting the next bounded unit without
broadening the goal.

These fields mirror the active implementation state and are checked by
`./scripts/check.sh`. Update both files in the same administrative change.

## Required Read Order

1. `AGENTS.md`
2. this file
3. the owner-approved active goal
4. its shared implementation state
5. relevant implementation and tests located just in time for task selection
6. only the specification relevant to the selected task

If this index reports no active goal, no standing authorization, a pending owner
decision, or an incomplete conflicting run, stop at the corresponding terminal
state. If a current unit exists, continue only that unit. While `Graph
foundation` is `open`, any new work must remain a visible graph foundation
allowed by the active goal. Do not turn an open question, later direction, or
improvement idea into active work.

## Standing Goal Authorization

The standing-authorization terms below are active for the resumed loop.

- The owner granted standing authorization on 2026-08-22 to advance this one
  active goal through successive bounded units until it is complete.
- Each unit still requires focused and full repository validation and fresh
  independent read-only review. Full rendered click-through evidence is batched
  on every fifth UI unit before acceptance and before goal completion.
- A clean unit is accepted and committed locally under the standing
  authorization, then the loop immediately selects the next smallest justified
  gap inside the same goal.
- The owner remains the authority for new goals and unresolved material
  product, visual, scope, or lasting architecture decisions.
- The loop may not push, merge, deploy, publish, discard user work, or perform
  another external or destructive action without explicit direction.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

Rendered checkpoint commands and evidence are recorded when the five-unit or
final-goal checkpoint is due.

## Run Contract

- Confirm standing authorization, owner-decision, and no-overlap gates before
  repository work.
- Continue an existing current unit before selecting anything new.
- Otherwise select one smallest useful gap from the goal and current evidence.
- While `Graph foundation` is `open`, select only a bounded visible graph claim
  allowed by the graph-first entry gate.
- Use `design-taste-frontend` for every relevant Map UI unit and record its
  Design Read, dials, audit, and applicable pre-flight result.
- State one criterion, one behavior, and one evidence claim before editing.
- Load implementation just in time; the state file prescribes no task sequence.
- Run focused validation before the full check.
- Increment `UI units since visual checkpoint` for accepted UI units one through
  four. When the next UI candidate is the fifth, preserve it as the current
  run, set the counter to five and `Run status` to `visual checkpoint`, and run
  the combined rendered click-through before review and acceptance. A clean
  fifth unit records the checkpoint and resets the count to zero.
- Record candidate evidence, then use a fresh independent read-only reviewer of
  the implementation and evidence claim.
- Resolve blocking findings and repeat review after material corrections.
- After a clean review, record accepted evidence, commit the coherent local
  unit, and immediately continue the loop.
- Never select a new goal, push, merge, publish, or disturb unrelated user work.

## Stop Conditions

- Standing authorization is absent or withdrawn.
- A material owner decision is pending.
- A work unit is blocked and requires owner authority or destructive handling.
- Another project run or unrelated or orphaned subagent is active before task
  selection.
- Baseline repository state is unsafe.
- The task exceeds one fresh context window.
- No justified task advances the goal.
- The owner pauses or stops the loop.
- The goal is complete.
