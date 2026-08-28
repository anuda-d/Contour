# Current development index

Status: Human Discovery Prototype is owner-approved and paused.

## Active work

- Goal: [Human Discovery Prototype](human-discovery-prototype/GOAL.md)
- Shared implementation state: [Implementation Plan](human-discovery-prototype/IMPLEMENTATION_PLAN.md)
- Prior completed goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Preserved design foundation: [Editorial Constellation](identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
- Active work: none; owner authorization is paused

## Run state snapshot

- Active goal id: human-discovery-prototype
- Owner authorization: paused
- Authorization scope: active goal
- Authorization source: owner
- Loop cadence: paused
- Graph foundation: approved
- Discovery entry gate: open
- Current run: none
- Incomplete run: none
- Run status: paused
- Pending owner decision: select the allowed source for attributed human evidence before resume
- Attributed evidence source: pending owner decision
- Attributed evidence provenance: pending owner decision
- Alignment due: no
- Visual checkpoint: not yet established
- UI units since visual checkpoint: 0

## Goal boundary

The owner approved the Human Discovery Prototype goal on 2026-08-27.
It tests whether someone can begin from a known Book, Film, or explicitly
supported idea, follow understandable human evidence to an unfamiliar work,
inspect the contributor and context, and privately Save the work.

The goal was placed in its initial paused state during preparation.
No implementation work unit was selected or started during that preparation.
Every transition from paused to standing authorization requires an explicit
owner instruction in a fresh chat before the loop may select or continue a
unit.
Before any such transition, the owner must select and durably record whether
attributed human evidence is owner-authored, contributor-supplied with
permission, or another documented permissioned source.
Fictional fixtures may test mechanics but cannot prove a human-evidence claim.

The discovery-first entry gate requires one visible known-work to
unfamiliar-candidate route with attributed authored evidence, contributor Map
context, private Save, finite Explore return, and reload-safe public/private
boundaries.
The same unit may establish the smallest strict TypeScript browser and
validation substrate needed for that route.
Compiler-only work, a whole-codebase migration, or unrelated architecture
replacement cannot satisfy the gate.

## Completed foundation

The owner accepted the Identity Map Prototype as a completed MVP foundation on
2026-08-26.
Its software, local durability contract, and complete owner-to-public
walkthrough were implemented, validated on representative desktop and mobile
viewports in light and dark modes, independently reviewed, and committed.

That accepted foundation remains Contour's public profile and contribution
surface.
It does not claim target-user validation, real discovery quality, market
demand, retention, or production readiness.

## Required read order

1. `AGENTS.md`
2. this file
3. the active goal linked above
4. the shared implementation state linked above
5. the latest temporary handoff when one exists
6. stop if authorization is not standing
7. otherwise locate only enough code and tests to select or continue one
   smallest useful goal gap
8. read only the product specification relevant to that unit

The first implementation chat has no prior unit handoff.
Every later implementation chat must be fresh and must read the latest compact
handoff from the operating system temporary directory when it exists.
The handoff is context, not authority or a future task queue.

## Current authorization boundary

- Exactly one owner-approved goal exists.
- Owner authorization is paused.
- Standing implementation authority: paused
- No standing goal-bounded implementation authorization exists yet.
- One owner decision on attributed-evidence sourcing is pending.
- Do not select, infer, or begin a discovery implementation unit.
- Do not add TypeScript tooling or migrate JavaScript while paused.
- Product discussion, goal correction, audit, and readiness validation may
  proceed without starting the loop.
- The owner remains the authority for unresolved product, visual, scope,
  privacy, and lasting architecture decisions.
- Push, merge, deploy, publish, destructive cleanup, and unrelated external
  side effects remain separately authorized.

## Fresh-chat boundary

Once the owner resumes standing authorization, one implementation chat owns at
most one work unit.
After that unit reaches an accepted commit or another terminal handoff state,
the chat writes `contour-human-discovery-prototype-handoff.md` in the operating
system temporary directory and stops.
It records `No next unit selected`.
A new work unit may be selected only in a newly created fresh chat.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

## Stop condition

The repository is at **GOAL APPROVED - PAUSED**.
Do not start the implementation loop until the owner explicitly resumes this
goal in a fresh chat.
