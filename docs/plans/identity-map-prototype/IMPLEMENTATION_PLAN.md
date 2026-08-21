# Identity Map Prototype Implementation State

Status: active shared state; the goal is owner-approved, and a standing
scheduled-autonomous-window authorization for bounded graph-first
implementation was conditionally pre-approved on 2026-08-21.

## Run State

- Active goal id: identity-map-prototype
- Owner authorization: granted
- Authorization scope: implementation
- Authorization source: scheduled-autonomous-window
- Autonomous window: daily 18:00-19:00 America/Toronto
- Graph foundation: open
- Current run: none
- Incomplete run: none
- Pending owner review: none
- Last accepted run: none
- Alignment due: no

## Goal Progress

| Criterion | Status | Accepted evidence |
| --- | --- | --- |
| IM-1 Desirable Map | open | None yet. |
| IM-2 Non-review expression | open | None yet. |
| IM-3 Draft boundary | open | None yet. |
| IM-4 Generated living Map | open | None yet. |
| IM-5 Intuitive spatial control | open | None yet. |
| IM-6 Authored bridge | open | None yet. |
| IM-7 Public identity boundary | open | None yet. |
| IM-8 Integrated creation | open | None yet. |
| IM-9 Responsive experience | open | None yet. |
| IM-10 Durable acceptance walkthrough | open | None yet. |

This table records only evidence accepted through explicit owner approval or
the scheduled conditional pre-approval policy after validation and fresh
independent review. It is not a task backlog or implementation sequence.

## Per-Run Selection

Each fresh work unit:

1. verifies explicit owner authorization for exactly one bounded run or a valid
   configured trigger inside the scheduled autonomous window;
2. reads the active goal and this shared state;
3. confirms the repository and no-overlap gates are safe;
4. locates only enough implementation and tests to select the smallest useful
   gap for one open criterion;
5. uses one to three read-only explorer subagents to investigate independent
   questions about that gap and return concise evidence;
6. states a valid progress claim, records one bounded work unit under `Current
   Run`, and marks the single-use authorization consumed immediately before
   changing implementation;
7. states the intended behavior and focused evidence;
8. has the orchestrator implement as the sole writer, validates, records
   candidate evidence under `Pending Owner
   Review`, and obtains fresh independent review of the implementation and
   candidate evidence; and
9. stops for the owner or conditionally accepts and commits exactly one valid
   scheduled-window unit.

Criteria order does not prescribe task order. Do not select or record future
work. While `Graph foundation` is `open`, however, the graph-first entry gate
in the goal and development loop restricts selection to a visible graph
foundation. If no honest work unit advances the goal, make no implementation
change.

## Graph-First Entry State

- Required next evidence type: a running, visible, interactive 2D Map and only
  the thin substrate necessary to support its bounded behavior
- Deferred until this gate is accepted through explicit owner approval or
  valid scheduled conditional pre-approval: profile, onboarding, Thought
  capture, publishing, authentication, and production infrastructure

This is a selection constraint, not a future task queue. The exact bounded
claim is chosen just in time from the verified repository baseline.

## Current Run

None. Standing scheduled authorization is available only to configured triggers
inside the autonomous window. Any next run must satisfy the graph-first gate.

## Scheduled Autonomous Window

- Authorization basis: owner conditional pre-approval granted 2026-08-21
- Window: daily 18:00-19:00 America/Toronto
- Configured trigger cadence: 18:00, 18:15, 18:30, and 18:45
- Unit limit: one bounded work unit per configured trigger
- Acceptance basis: applicable validation passes, fresh independent review has
  no unresolved blocker, and every guard in the development loop holds
- Always owner-gated: product or architecture decisions, alignment, goal
  completion, destructive cleanup, deployment, push, merge, and publication

Repeated scheduled triggers provide continuation. A trigger does not chain a
second work unit internally.

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
  normal work unit. A valid scheduled trigger may instead use the owner's
  recorded conditional pre-approval after a clean review and every guard passes.
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
  `Incomplete run`, and `Pending Owner Review`; set `Graph foundation` to
  `approved` when the reviewed
  unit satisfies the entry gate; set the resulting gate; synchronize
  `CURRENT.md`; and commit the coherent work unit and gate together.
- After valid scheduled conditional acceptance, perform the same evidence and
  state transaction, record the acceptance basis, and commit one coherent local
  unit. Restore scheduled authorization only when alignment and final
  goal-completion review remain not due. Otherwise set authorization to
  `pending`, scope and source to `none`, record the owner-only review gate, and
  stop scheduled continuation.
- An owner's approval of a reviewed work unit grants exactly one single-use
  authorization for the orchestrator to select the next smallest gap inside the
  same goal unless the owner explicitly says to approve only, pause, or stop.
- When alignment is due, that next authorization applies to alignment only.
- Goal approval alone does not authorize the first implementation work unit.

## Alignment

Perform goal-level alignment at a named product milestone, on explicit owner
request, or when verified evidence reveals product or lasting architecture
drift. A work-unit count never triggers alignment by itself.

A fresh independent reviewer compares all accepted evidence with the
goal, identifies drift or unnecessary complexity, and recommends removal when
appropriate. The result then stops for owner approval before the alignment
record may be committed. Alignment does not select or suggest a later task.

When the owner approves alignment, record the approved alignment, set
`Alignment due` to `no`, clear `Current run`, `Incomplete run`, and `Pending
owner review`, set the next gate from the owner's continue or stop instruction, synchronize
`CURRENT.md`, and commit the alignment record and resulting gate together. No
implementation may begin before that commit exists.

## Accepted Run Log

None.

## Administratively Closed Run Log

None. A blocked unit may enter this log only after explicit owner direction and
a restored, validated baseline. Administrative close does not create goal
evidence.
