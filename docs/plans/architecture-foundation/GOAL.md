# Architecture Foundation

Status: active; owner-approved goal under standing scheduled authorization.

## Owner decision

The owner approved this goal, its lasting architecture direction, complete
TypeScript migration, compatibility requirements, and scheduled autonomous loop
on 2026-08-28.
The owner explicitly selected the long-term foundation-first option and approved
architecture-only work for this goal.
That decision is a bounded exception to the normal product-first rule and does
not authorize speculative future product modules.

## Question

Can the accepted Contour prototype be restructured into a strict TypeScript
modular monolith with enforceable boundaries, durable storage migration, and
the same visible behavior and design, so later product work can build on a
coherent core rather than the prototype's graph-shaped implementation?

## Goal result

Produce a complete, browser-runnable Architecture Foundation in which:

1. current product facts have one authoritative owner and explicit invariants;
2. application use cases coordinate domain behavior through narrow ports;
3. browser storage, time, identifiers, and DOM rendering are outward adapters;
4. public and owner-private reads are structurally separate;
5. the Map is a projection and presentation capability rather than the product
   database or architectural center;
6. all maintained application source and automated tests are strict TypeScript;
7. the native DOM and CSS interface preserves its accepted visual and
   interaction behavior;
8. every currently supported localStorage shape migrates without losing valid
   user state; and
9. automated checks enforce the dependency direction and quality gates.

The result is a maintainable local modular monolith, not a production backend
or a new product feature release.

## Architecture contract

The required dependency direction is:

```text
UI adapters -> application use cases -> product modules -> kernel
     |                  ^                    ^
     +------ composition root ------ outward adapters
```

- The kernel owns shared identifiers, result conventions, validation helpers,
  and effect contracts only when they have real cross-module leverage.
- Product modules own current product vocabulary, invariants, commands, and
  queries.
- Application use cases are the only layer that coordinates changes across
  product modules.
- Outward adapters implement persistence, clock, identifier generation, browser
  events, and other effects required by inward contracts.
- UI adapters render supplied read models and translate user events into
  application intents.
- One composition root may depend on all concrete implementations and wires the
  application.
- Cross-module reads use narrow queries or read models.
  Modules never reach into another module's mutable state or storage adapter.

## Current product modules

Only vocabulary needed by the accepted prototype may become a product module:

- identity and viewer ownership;
- the Book and Film catalogue;
- authored Thought lifecycle, anchors, and authored relationships;
- deliberate public taste and public presentation choices;
- owner-private selection and Draft access where required by current behavior;
- public and owner projections;
- Map membership, presentation preferences, and spatial layout inputs; and
- current application workflows that coordinate those facts.

The exact module boundaries may be refined during the architecture-contract
unit only when the refinement preserves this scope and does not decide new
product behavior.

## Protected invariants

- Books and Films remain the only supported Media types.
- A public Thought remains anchored to at least one Book or Film.
- Draft and Published are lifecycle states of authored material, not unrelated
  content types.
- Drafts and draft-only Media never enter a visitor or public read model.
- Public Map membership derives only from deliberate public facts and published
  authorship.
- Private selection, storage recovery, and interaction state never become a
  public taste or authorship claim.
- Spatial movement and pinning never create semantic authorship.
- A relationship's meaning belongs to authored content, not graph layout.
- Map, profile, and future surfaces consume rebuildable read models rather than
  becoming sources of truth.
- TypeScript compile-time types do not replace runtime validation at persisted,
  seeded, form-input, or external boundaries.
- Persistence failure may degrade the current visit but never relax privacy or
  reinterpret invalid data as public.
- No current valid persisted state is lost merely because the internal model or
  storage envelope changes.

## Visible behavior freeze

The accepted Identity Map Prototype is the compatibility baseline.
The goal must preserve:

- the seeded owner profile and mature Map;
- choosing exactly three Books or Films;
- creating and editing anchored private Draft Thoughts;
- creating a bridge Thought between two works;
- publishing while preserving authored identity and placement;
- pinning, unpinning, and resetting explicit positions;
- curating three public Media in the profile orbit;
- visitor preview with Published-only content and no owner controls;
- reload durability for selection, authored content, publication, featuring,
  and pinned positions;
- camera, focus, zoom, pan, drag, keyboard, and touch behavior;
- representative desktop and mobile layouts;
- supported light and dark appearances; and
- existing content hierarchy and visual design.

Only accessibility or correctness fixes required to preserve this contract are
allowed to alter visible behavior.
Any other visual or product change requires a separate owner decision and is
outside this goal.

## Complete TypeScript migration contract

- All maintained files under `src/` and all automated tests become TypeScript.
- Strict type checking is mandatory, including
  `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Hand-maintained JavaScript mirrors are forbidden.
- Generated JavaScript, source maps, build information, coverage, and browser
  output remain ignored and untracked.
- Browser code is built reproducibly through Vite and TypeScript while the UI
  remains native DOM and CSS.
- Existing behavior receives equal or stronger focused tests before its owning
  JavaScript module is removed.
- Migration proceeds through bounded seams and keeps the repository runnable at
  every accepted commit.
- The composition root and DOM-heavy adapters migrate after inward pure and
  application modules unless evidence makes another order safer.

## Persistence compatibility contract

Every current localStorage representation is untrusted input and must be
recognized by a versioned adapter or migration path.
The migration preserves every valid current value for:

- selected works;
- Draft and Published Thought state, including authored bridges;
- featured public works; and
- pinned Map positions.

Corrupt or unsupported payloads recover explicitly without leaking private
content or preventing the application from opening.
Round-trip, legacy migration, corruption, unavailable-storage, and relevant
cross-tab behavior are verified through adapter contract tests.

## Architecture entry gate

Before broad source migration, one accepted unit must establish:

1. concise architecture decision records for module ownership, dependency
   direction, effect isolation, runtime validation, storage compatibility, and
   the native DOM plus Vite choice;
2. the intended source layout and naming rules;
3. an automated import-boundary check that fails on a representative forbidden
   dependency; and
4. a migration compatibility inventory tied to current behavior and storage.

The entry gate is architecture-only by explicit owner decision.
It becomes approved only after focused and full validation, candidate evidence,
clean fresh independent review, an accepted local commit, and a temporary
handoff.

## Completion criteria

- **AF-1 Enforced architecture contract:** Decision records, source ownership,
  dependency direction, and automated import rules are accepted and remain
  consistent with the implemented source tree.
- **AF-2 Complete strict TypeScript:** Every maintained application source and
  automated test is strict TypeScript, browser and test builds are reproducible,
  no maintained JavaScript mirror remains, and generated output is ignored.
- **AF-3 Deep product modules:** Current product facts and invariants live in
  cohesive modules with small intentional APIs rather than graph-shaped shared
  state, generic CRUD bags, or UI-owned mutation rules.
- **AF-4 Application use cases:** Current workflows are coordinated in a
  screen-neutral application layer with explicit outcomes, failure handling,
  and atomic invariants at cross-module changes.
- **AF-5 Isolated effects and validated boundaries:** Storage, clock, identifiers,
  browser events, seed input, and form input cross typed ports and are validated
  once at their trust boundaries.
- **AF-6 Explicit projections and privacy:** Owner and public read models are
  structurally separate, Map/profile rendering consumes projections, and no
  client-side display filter serves as the only privacy boundary.
- **AF-7 Durable compatibility:** All current valid localStorage shapes migrate
  and round-trip correctly, corrupt or unavailable storage recovers safely, and
  no valid user state is silently discarded.
- **AF-8 Frozen visible behavior:** The accepted owner and visitor flows,
  interaction model, accessibility, responsive design, and light/dark visuals
  remain behaviorally equivalent except approved correctness fixes.
- **AF-9 Layered test and quality gates:** Deterministic domain tests,
  application tests with fakes, adapter contracts, focused DOM behavior tests,
  architecture checks, strict type checks, browser build, and complete
  repository validation protect the implemented seams.
- **AF-10 Durable completion walkthrough:** A clean build and complete current
  walkthrough pass on representative desktop and mobile viewports in light and
  dark modes, persisted legacy state is exercised, the console is clean, all
  criteria have accepted evidence, and final fresh independent review has no
  unresolved blocker.

## Explicit exclusions

This goal does not authorize:

- Discovery, Explore, Search, Library, Themes, personalization, Saves,
  Bookmarks, Votes, Follows, or other future feature implementation;
- speculative modules or empty interfaces for those future features;
- React, Next.js, another UI framework, a router migration, or a CSS-system
  replacement;
- a production API, database, authentication system, catalogue provider,
  analytics, deployment, or synchronization service;
- microservices, event sourcing, a CQRS platform, a broker, an ORM hierarchy, a
  DI container, or a universal repository abstraction;
- a global mutable `AppState`, generic entity store, generic content model, or
  universal semantic graph model;
- a second maintained application implementation;
- a visual redesign or new product behavior; or
- push, merge, deploy, publish, destructive cleanup, or unrelated external
  side effects.

## Failure conditions

The goal is not complete if:

- visible behavior or design changes without explicit approval;
- Map or graph structures remain the authority for non-spatial product facts;
- UI callbacks still coordinate domain mutation, persistence, projection, and
  refresh as ad hoc transaction scripts;
- product or application code imports DOM, localStorage, wall-clock, random ID,
  generated output, seed fixtures, or another module's adapter;
- private data is protected only by renderer filtering;
- TypeScript is weakened to accommodate legacy code;
- maintained JavaScript or duplicate generated source remains;
- a current valid persisted state cannot migrate;
- architecture checks can be bypassed by the supported build or test paths;
- future product abstractions appear without current behavior to justify them;
  or
- completion evidence omits the full frozen behavior walkthrough and legacy
  storage compatibility.

## Validation standard

Each unit runs focused checks and `./scripts/check.sh`, records candidate
evidence before review, and receives a fresh independent read-only review.
Material corrections repeat focused and full validation plus fresh review.
UI-changing correctness fixes follow the visual checkpoint cadence.
AF-10 always requires a final complete rendered walkthrough regardless of the
counter.

## Goal completion

The goal is complete only when AF-1 through AF-10 have proportionate accepted
evidence, the architecture and TypeScript checks enforce the final source tree,
the storage migration contract passes, the final frozen-behavior walkthrough
passes, and a fresh independent review finds no unresolved blocker.
Completion ends standing authorization and does not select a later goal.
