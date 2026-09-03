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
- Loop cadence: scheduled autonomous relay
- Frozen behavior baseline: approved
- Architecture entry gate: approved
- Current run: none
- Incomplete run: none
- Run status: awaiting scheduled fresh task
- Pending owner decision: none
- Scheduled window: daily 18:00-23:00 America/Toronto
- Fresh-task relay: active
- Alignment due: no
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
Each implementation task owns at most one bounded unit.
After a clean accepted commit before 23:00, that task writes the required
temporary handoff and creates one fresh successor task in the same project.
At or after 23:00, it finishes the active unit safely, writes the handoff, and
does not create a successor.

Hourly scheduled starts during the window are recovery opportunities.
They must exit without repository changes when another live project
implementation task owns the work.
The unscoped Codex task listing is not an ownership precondition because it can hang and cannot classify idle historical tasks reliably.
Each repository-working task must atomically acquire the durable local checkout lock, which is the decisive single-writer proof.
When no live owner exists, they resume exactly a matching recorded current and
incomplete run instead of selecting a replacement.
Conflicting run fields, an unreadable lock, or an uninspectable recorded owner stop safely.
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
5. the latest temporary handoff when one exists
6. confirm the current time is inside the scheduled window for new selection
7. confirm no task or recorded run overlaps
8. select or continue only one smallest useful goal gap
9. read only the code, tests, and specification needed for that unit

## Fresh-task boundary

One implementation task owns at most one work unit.
Every terminal unit state writes
`contour-architecture-foundation-handoff.md` in the operating system temporary
directory and records `No next unit selected`.
The current task never selects a second unit.
When relay is allowed, it creates a fresh task whose first action is to select
the next smallest justified gap from authoritative repository state.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

## Stop condition

The repository is at **GOAL ACTIVE - AWAITING SCHEDULED FRESH TASK**.
The automation may start or relay one fresh task at a time during the authorized
window without intermediate owner approval.
