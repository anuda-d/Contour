# Current development index

Status: Architecture Foundation is active under standing scheduled authorization.

## Active work

- Goal: [Architecture Foundation](architecture-foundation/GOAL.md)
- Shared implementation state: [Implementation Plan](architecture-foundation/IMPLEMENTATION_PLAN.md)
- Prior completed goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Preserved design foundation: [Editorial Constellation](identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
- Active work: Architecture Foundation units may run during the authorized daily window

## Run state snapshot

- Active goal id: architecture-foundation
- Owner authorization: standing
- Authorization scope: active goal
- Authorization source: owner
- Loop cadence: scheduled orchestrator generations
- Frozen behavior baseline: approved
- Architecture entry gate: approved
- Current run: none
- Incomplete run: none
- Run status: awaiting orchestrator generation
- Pending owner decision: none
- Scheduled window: daily 18:00-23:00 America/Toronto
- Fresh-task relay: replaced by generation handoff
- Alignment due: no
- Runtime lifecycle source: Git common directory state
- Current generation: none
- Generation phase: idle
- Accepted slices this generation: 0
- Active slice: none
- Slice phase: none
- Slice retry status: none
- Fresh-orchestrator handoff: active
- Visual checkpoint: Identity Map Prototype goal completion, 2026-08-26
- UI units since visual checkpoint: 0
- Standing implementation authority: active

## Goal boundary

The owner approved the Architecture Foundation goal and standing implementation
authorization on 2026-08-28.
This is an explicit, temporary exception to the ordinary rule that architecture
must accompany new visible product behavior.
The accepted Identity Map Prototype is the frozen compatibility target while
the implementation is restructured beneath it.

The goal establishes a strict TypeScript modular monolith around current product
facts and behavior.
It does not add Discovery, Library, Search, Themes, personalization, a framework,
or another product surface.
It must preserve the existing visual design, user flows, public and private
boundaries, and persisted browser state through versioned migration.

The architecture entry gate requires an accepted architecture contract,
decision records, and an automated dependency-boundary check before broad source
migration begins.
This gate is an approved architecture-only work unit because the owner selected
the foundation-first strategy explicitly.

## Scheduled autonomy

The authorized window is daily from 18:00 through 23:00 in America/Toronto.
One orchestrator generation manages no more than three sequential accepted slices.
Every slice completes a coherent responsibility through one fresh sole-writer task and an immutable completion contract.
Only a slice with matching focused and full validation, clean fresh review, and a verified commit counts toward the generation limit.
After the third accepted slice, or an earlier natural goal boundary, the orchestrator performs whole-goal alignment and hands compact durable state to a fresh orchestrator.

Hourly scheduled starts are liveness and recovery opportunities only.
They never select slices, implement, validate, review, commit, or perform alignment.
Read-only orientation and exploration do not require the checkout lock.
Each slice writer acquires the durable single-writer record immediately before its first repository mutation and retains its exact claim ID.
An exact documented terminal owner may be recovered only through an unchanged task and claim ID; age alone never permits recovery.
Conflicting structured state, an unreadable lock, or uncertain owner status stops safely.
No human approval is required between clean units that remain inside this goal.
The loop still stops for an unresolved owner decision, unsafe or overlapping
state, failed validation or review that cannot be resolved in scope, or an
external action not already authorized.

Push, merge, deploy, publish, destructive cleanup, and unrelated external side
effects are not authorized by standing implementation authority.

## Required read order

1. `AGENTS.md`
2. this file
3. the active goal linked above
4. the shared implementation state linked above
5. the persisted lifecycle state from `scripts/development_loop_state.py`
6. the latest temporary handoff when one exists
7. confirm the current time is inside the scheduled window for new selection
8. confirm the recorded orchestrator and writer claims do not overlap
9. continue the exact active slice or select one coherent responsibility when the generation is selecting
10. read only the code, tests, and specification needed for that slice

## Generation boundary

One writer task owns at most one slice.
One orchestrator owns no more than three accepted slices and never modifies the checkout.
Every generation handoff writes `contour-architecture-foundation-handoff.md` in the operating system temporary directory and records `No next slice selected`.
The next slice is selected only by the current orchestrator or, after alignment, by a fresh orchestrator.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

## Stop condition

The repository is at **GOAL ACTIVE - AWAITING ORCHESTRATOR GENERATION**.
The scheduler may start or recover only the exact persisted orchestrator generation during the authorized window.
