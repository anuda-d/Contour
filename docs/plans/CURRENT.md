# Current Development Index

Status: Identity Map Prototype is the active owner-approved goal as of
2026-08-20. No implementation work unit is authorized.

## Active Work

- Goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Shared implementation state: [Implementation Plan](identity-map-prototype/IMPLEMENTATION_PLAN.md)
- Active work: none; stop at **OWNER AUTHORIZATION REQUIRED** until the owner
  explicitly authorizes the first work unit

## Run State Snapshot

- Active goal id: identity-map-prototype
- Owner authorization: pending
- Authorization scope: none
- Current run: none
- Incomplete run: none
- Pending owner review: none
- Approved implementation runs since alignment: 0
- Alignment due: no

These fields mirror the active implementation state and are checked by
`./scripts/check.sh`. Update both files in the same administrative change.

## Required Read Order

1. `AGENTS.md`
2. this file
3. the owner-approved active goal
4. its shared implementation state
5. relevant implementation and tests located just in time for task selection
6. only the specification relevant to the selected task

If this index reports no active goal, no owner authorization, a pending owner
review, or an incomplete conflicting run, stop at the corresponding terminal
state. Do not turn an open question, later direction, or improvement idea into
active work.

## Owner Gate

- Goal approval and work-unit authorization are separate.
- The current gate is `pending`; therefore no implementation may begin.
- The owner must explicitly authorize one bounded run in conversation.
- Authorization permits the orchestrator to select exactly one smallest useful
  gap inside the approved goal. It is not approval for work outside that goal.
- The token is consumed only after a valid progress claim is selected and
  recorded, immediately before implementation edits.
- After implementation, validation, and independent review, the work unit must
  stop at **AWAITING OWNER APPROVAL** without committing.
- Only the owner can approve the reviewed work.
- Approval finalizes that unit and, unless the owner says otherwise, authorizes
  the orchestrator to select exactly one next unit inside the same goal. It
  never authorizes an unlimited run.
- When alignment is due, the next token applies to alignment only and cannot be
  consumed by an implementation unit.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

Browser and visual validation commands must be added to this index after the
application baseline selects them and the owner approves that work unit.

## Run Contract

- Confirm the owner gate and no-overlap gate before repository work.
- If a reviewed unit awaits owner approval, do not select or begin another.
- If alignment is due, an available authorization token applies to alignment
  only; do not select implementation.
- Otherwise select one smallest useful gap from the goal and current evidence.
- State one criterion, one behavior, and one evidence claim before editing.
- Load implementation just in time; the state file prescribes no task sequence.
- Run focused validation before the full check.
- Render affected visual surfaces and click through affected flows.
- Record candidate evidence, then use a fresh independent read-only reviewer of
  the implementation and evidence claim.
- Resolve blocking findings and repeat review after material corrections.
- Append the factual review result, then stop for owner review without
  committing.
- Commit only after explicit owner approval.
- Never select a new goal, push, merge, publish, or disturb unrelated user work.

## Stop Conditions

- Owner authorization is absent or already consumed.
- Owner review is pending.
- A consumed work unit is blocked and awaiting owner direction.
- Another project run or subagent is active.
- Baseline repository state is unsafe.
- The task exceeds one fresh context window.
- Owner authority is required.
- No justified task advances the goal.
- The owner pauses or stops the loop.
- The goal is complete.
