# Identity Map Prototype Implementation State

Status: active shared state; the goal is owner-approved, but the first work
unit is not authorized.

## Run State

- Active goal id: identity-map-prototype
- Owner authorization: pending
- Authorization scope: none
- Current run: none
- Incomplete run: none
- Pending owner review: none
- Last owner-approved run: none
- Approved implementation runs since alignment: 0
- Alignment due: no

## Goal Progress

| Criterion | Status | Owner-approved evidence |
| --- | --- | --- |
| IM-1 Desirable destination | open | None yet. |
| IM-2 Non-review expression | open | None yet. |
| IM-3 Draft boundary | open | None yet. |
| IM-4 Generated living Map | open | None yet. |
| IM-5 Intuitive spatial control | open | None yet. |
| IM-6 Authored bridge | open | None yet. |
| IM-7 Public identity boundary | open | None yet. |
| IM-8 Integrated creation | open | None yet. |
| IM-9 Responsive experience | open | None yet. |
| IM-10 Durable acceptance walkthrough | open | None yet. |

This table records only evidence the owner has approved after validation and
fresh independent review. It is not a task backlog or implementation sequence.

## Per-Run Selection

Each fresh work unit:

1. verifies explicit owner authorization for exactly one bounded run within the
   active goal;
2. reads the active goal and this shared state;
3. confirms the repository and no-overlap gates are safe;
4. locates only enough implementation and tests to select the smallest useful
   gap for one open criterion;
5. states a valid progress claim, records one bounded work unit under `Current
   Run`, and marks the single-use authorization consumed immediately before
   changing implementation;
6. states the intended behavior and focused evidence;
7. implements, validates, records candidate evidence under `Pending Owner
   Review`, and obtains fresh independent review of the implementation and
   candidate evidence; and
8. stops without committing or selecting later work.

Criteria order does not prescribe task order. Do not select or record future
work. If no honest work unit advances the goal, make no implementation change.

## Current Run

None. The first implementation work unit is awaiting explicit owner
authorization.

## Pending Owner Review

None.

When populated, this section must identify:

- the criterion and progress claim;
- the exact owned diff and base commit;
- observed behavior separately from interpretation;
- focused, full, browser, and visual validation results as applicable;
- independent-review status, which may be `pending` while the candidate record
  is prepared and must contain the findings and their resolution before owner
  review;
- forced outcomes, special cases, risks, and unresolved assumptions; and
- the precise decision requested from the owner.

## Approval Rules

- Independent review is advisory. Only explicit owner approval can finalize a
  work unit.
- Silence, elapsed time, prior approval, goal approval, or a non-blocking review
  result never counts as owner approval.
- Before approval, do not mark a criterion met and do not commit the work unit.
- Material implementation, test, behavior, or product-state changes after
  independent review invalidate that review and require fresh validation and
  review before returning to the owner.
- Factual administrative updates that only record the completed review or the
  owner's decision do not invalidate review. They must not alter implementation,
  tests, behavior, or the evidence claim, and the owner sees them in the final
  diff.
- If the owner requests changes, modify only the reviewed work unit, validate,
  obtain fresh independent review, and return to `Pending Owner Review`.
- If a selected unit becomes non-viable after its authorization is consumed,
  record the exact blocker and stop at `WORK UNIT BLOCKED`. Do not select a
  replacement unit or clear the run. The owner may explicitly authorize a
  retry of the same recorded claim while the token remains consumed. To close
  the run, the owner must direct how any loop-owned partial changes are handled;
  after the baseline check passes, record the abandoned run without marking a
  criterion, clear all current-run fields, set the next gate from the owner's
  instruction, and commit that administrative close before any new unit.
- After owner approval, record the approved evidence; clear `Current Run`,
  `Incomplete run`, and `Pending Owner Review`; increment `Approved
  implementation runs since alignment`; set `Alignment due` to `yes` when that
  counter reaches `3`; set the resulting gate; synchronize `CURRENT.md`; and
  commit the coherent work unit and gate together.
- An owner's approval of a reviewed work unit grants exactly one single-use
  authorization for the orchestrator to select the next smallest gap inside the
  same goal unless the owner explicitly says to approve only, pause, or stop.
- When alignment is due, that next authorization applies to alignment only.
- Goal approval alone does not authorize the first implementation work unit.

## Alignment

After at most three owner-approved implementation work units, perform a
goal-level alignment review as its own owner-authorized work unit before more
implementation.

A fresh independent reviewer compares all owner-approved evidence with the
goal, identifies drift or unnecessary complexity, and recommends removal when
appropriate. The result then stops for owner approval before the alignment
record may be committed. Alignment does not select or suggest a later task.

When the owner approves alignment, record the approved alignment, reset
`Approved implementation runs since alignment` to `0`, set `Alignment due` to
`no`, clear `Current run`, `Incomplete run`, and `Pending owner review`, set the
next gate from the owner's continue or stop instruction, synchronize
`CURRENT.md`, and commit the alignment record and resulting gate together. No
implementation may begin before that commit exists.

## Owner-Approved Run Log

None.

## Administratively Closed Run Log

None. A blocked unit may enter this log only after explicit owner direction and
a restored, validated baseline. Administrative close does not create goal
evidence or increment the alignment counter.
