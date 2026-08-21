# Current Development Index

Status: Identity Map Prototype is the active owner-approved goal as of
2026-08-20. A standing scheduled-autonomous-window authorization was granted on
2026-08-21 for bounded graph-first implementation runs.

## Active Work

- Goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Shared implementation state: [Implementation Plan](identity-map-prototype/IMPLEMENTATION_PLAN.md)
- Active work: none; a manual owner-authorized run or valid scheduled trigger
  may select only a graph-first work unit

## Run State Snapshot

- Active goal id: identity-map-prototype
- Owner authorization: granted
- Authorization scope: implementation
- Authorization source: scheduled-autonomous-window
- Autonomous window: daily 18:00-19:00 America/Toronto
- Graph foundation: open
- Current run: none
- Incomplete run: none
- Pending owner review: none
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
state. While `Graph foundation` is `open`, the only selectable implementation
work is a visible graph foundation allowed by the active goal. Do not turn an
open question, later direction, or improvement idea into active work.

## Owner Gate

- Goal approval and work-unit authorization are separate.
- The current gate is `granted` for one graph-first implementation run.
- The standing scheduled authorization is usable only by configured triggers
  inside the recorded autonomous window.
- Authorization permits the orchestrator to select exactly one smallest useful
  gap inside the approved goal. It is not approval for work outside that goal.
- The token is consumed only after a valid progress claim is selected and
  recorded, immediately before implementation edits.
- After implementation, validation, and independent review, the work unit must
  stop at **AWAITING OWNER APPROVAL** without committing.
- During a valid autonomous trigger, full validation and clean independent
  review satisfy the owner's conditional pre-approval and permit one local
  commit without waiting.
- Reviewed work may be accepted through explicit owner approval or valid
  scheduled conditional pre-approval.
- Approval finalizes that unit and, unless the owner says otherwise, authorizes
  the orchestrator to select exactly one next unit inside the same goal. It
  never authorizes an unlimited run.
- When alignment is due, the next token applies to alignment only and cannot be
  consumed by an implementation unit.
- Alignment and goal completion always require explicit owner review and cannot
  be accepted by the autonomous-window policy.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`
- Scheduled loop: `Bproject autonomous graph loop`, active at 18:00, 18:15,
  18:30, and 18:45 America/Toronto

Browser and visual validation commands must be added to this index after the
application baseline selects them and the owner approves that work unit.

## Run Contract

- Confirm the owner gate and no-overlap gate before repository work.
- If a reviewed unit awaits owner approval, do not select or begin another.
- If alignment is due, an available authorization token applies to alignment
  only; do not select implementation.
- Otherwise select one smallest useful gap from the goal and current evidence.
- While `Graph foundation` is `open`, select only a bounded visible graph claim
  allowed by the graph-first entry gate.
- State one criterion, one behavior, and one evidence claim before editing.
- Load implementation just in time; the state file prescribes no task sequence.
- Run focused validation before the full check.
- Render affected visual surfaces and click through affected flows.
- Record candidate evidence, then use a fresh independent read-only reviewer of
  the implementation and evidence claim.
- Resolve blocking findings and repeat review after material corrections.
- Append the factual review result, then stop for owner review without
  committing.
- During a valid autonomous trigger, apply conditional pre-approval only after
  every recorded guard passes, commit one unit, and stop.
- Outside the autonomous window, commit only after explicit owner approval.
  Inside it, a commit requires valid scheduled conditional pre-approval.
- Never select a new goal, push, merge, publish, or disturb unrelated user work.

## Stop Conditions

- Owner authorization is absent, consumed, or invalid for the current time and
  trigger source.
- Owner review is pending.
- A consumed work unit is blocked and awaiting owner direction.
- Another project run or unrelated or orphaned subagent is active before task
  selection.
- Baseline repository state is unsafe.
- The task exceeds one fresh context window.
- Owner authority is required.
- No justified task advances the goal.
- The owner pauses or stops the loop.
- The goal is complete.
