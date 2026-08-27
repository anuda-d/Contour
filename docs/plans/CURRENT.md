# Current development index

Status: no active goal; Identity Map Prototype is complete.

## Active work

- Last completed goal: [Identity Map Prototype](identity-map-prototype/GOAL.md)
- Shared implementation state: [Implementation Plan](identity-map-prototype/IMPLEMENTATION_PLAN.md)
- Preserved design foundation: [Editorial Constellation](identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
- Active work: none; Identity Map Prototype is complete and the loop is stopped

## Run state snapshot

- Active goal id: none
- Owner authorization: pending
- Authorization scope: none
- Authorization source: none
- Loop cadence: stopped
- Graph foundation: approved
- Current run: none
- Incomplete run: none
- Run status: none
- Pending owner decision: none
- Alignment due: no
- Visual checkpoint: goal completion
- UI units since visual checkpoint: 0

## Completed goal boundary

The owner accepted the Identity Map Prototype as a completed MVP foundation on
2026-08-26. Its software, local durability contract, and complete owner-to-public
walkthrough were already implemented, validated on representative desktop and
mobile viewports in light and dark modes, independently reviewed, and committed.

The owner-level acceptance of IM-1 means the rendered Map remains a credible
and valuable profile/contribution feature worth carrying forward. It does not
claim target-user validation, real discovery quality, market demand, retention,
or production readiness.

The goal's accepted interaction evidence remains recorded in the linked
implementation state. No unfinished technical unit or overlapping run remains.
Standing authorization ended with goal completion.

## Product realignment

The owner named the product **Contour** and selected a discovery-first direction
on 2026-08-26.

Contour helps someone begin with a known Book, Film, or idea and discover an
unfamiliar work through understandable human evidence: a Thought, authored
connection, personal Theme region, person, or Map. The completed Map prototype
is preserved as Contour's profile and contribution foundation rather than
treated as the first-use promise.

The proposed Human Discovery Prototype is specified in the
[Web MVP Plan](../04-web-mvp-plan.md). That proposed phase is not an active goal
and has no standing implementation authorization. A later owner instruction
must establish its exact goal, invariants, implementation state, and
authorization before code work begins.

## Required read order

1. `AGENTS.md`
2. this file
3. stop if this file records no active goal
4. otherwise read the linked active goal
5. read its shared implementation state
6. locate only enough code and tests to select one smallest useful gap
7. read only the product specification relevant to that selected task

Product discussion and owner-directed documentation changes may proceed without
an active implementation goal. Product implementation may not.

## Current authorization boundary

- No active goal exists.
- No standing goal-bounded implementation authorization exists.
- Do not select, infer, or begin a discovery implementation unit from the Web
  MVP Plan or Open Questions.
- The owner remains the authority for the next goal and every unresolved
  product, visual, scope, privacy, or lasting architecture decision.
- Push, merge, deploy, publish, destructive cleanup, and unrelated external
  side effects remain separately authorized.

## Commands

- Full check: `./scripts/check.sh`
- Repository state: `git status --short`
- Diff review: `git diff --check`

## Stop condition

The development loop is stopped at **GOAL COMPLETE**. The next implementation
run requires a new owner-approved goal; the proposed discovery phase does not
become active merely because its direction is documented.
