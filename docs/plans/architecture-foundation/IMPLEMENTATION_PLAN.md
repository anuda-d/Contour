# Architecture Foundation Implementation State

Status: active shared state; standing scheduled owner authorization.

## Run state

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

## Goal progress

| Criterion | Status | Accepted evidence |
| --- | --- | --- |
| AF-1 Enforced architecture contract | accepted | Architecture decision records, six-key compatibility inventory, and the checked import-boundary gate were accepted after 30 focused and 112 repository tests plus clean fresh review. |
| AF-2 Complete strict TypeScript | accepted | Every maintained application source and automated test is strict TypeScript. Separate browser and Node-test typechecks, the Vite build, and the checked `src/composition/main.ts` native entrypoint are accepted with no maintained application JavaScript mirror. |
| AF-3 Deep product modules | open | Partial: authored Thought lifecycle, anchors, publication, and immutable merge now live in a cohesive strict TypeScript product module; other product facts remain in prototype seams. |
| AF-4 Application use cases | open | Partial: authored-Thought cross-tab reload and deliberate selection toggle or confirmation now use screen-neutral application outcomes through specific typed persistence ports; other current workflows remain composition-owned. |
| AF-5 Isolated effects and validated boundaries | open | Partial: browser localStorage, DOM-root acquisition, Map resize listening, Map drag-click suppression timing, the existing Map debug-global publication, storage adapters, wall-clock access, UUID generation, authored-Thought cross-tab events, authored-Thought reload, and selection persistence now cross narrow inward ports; featured-Media, pinned-position, other browser events, seed input, and form-input boundaries remain open. |
| AF-6 Explicit projections and privacy | open | Partial: the owner and visitor graph projection now has strict TypeScript ownership and focused evidence for Draft and draft-only Media exclusion, publication-derived public eligibility, dangling-edge filtering, and owner capability removal; application-level structurally separate read models remain open. |
| AF-7 Durable compatibility | open | Partial: authored V2, V1, and legacy-Draft browser storage now has typed precedence, normalization, migration, recovery, and read-merge-write evidence; other persisted state remains to be completed. |
| AF-8 Frozen visible behavior | open | None yet. |
| AF-9 Layered test and quality gates | open | Partial: the repository check now enforces separate strict typechecks, the Vite build, import boundaries, shared effect-port source coverage, browser-root, browser-resize, browser-clock, browser-Map-global, selection application, and selection adapter coverage, plus Map composition, DOM-source-contract, product, application-use-case, browser-adapter, CSS-regression, end-to-end acceptance, and architecture-boundary coverage; later migrated seams and final coverage remain open. |
| AF-10 Durable completion walkthrough | open | None yet. |

This table records accepted evidence only.
It is not a task sequence, roadmap, or permission to infer later work units.

## Architecture entry state

- Gate state: approved
- Authorized gate claim: establish the architecture decision records, intended
  source ownership, dependency rules, executable import-boundary check, and
  current behavior plus storage compatibility inventory
- Required negative evidence: the import-boundary check fails on a controlled
  representative forbidden dependency and passes the real source tree
- Forbidden gate substitutions: TypeScript conversion without the contract,
  future-feature scaffolding, framework adoption, a generic repository or global
  store, product behavior change, or a visual redesign
- Gate approval requirements: focused and full validation, candidate evidence,
  clean fresh independent review, one accepted local commit, and the temporary
  fresh-task handoff

The entry state restricts the first selection without creating a future task
queue.

## Current run

- State: accepted; no current unit.
- Unit id: af-5-map-click-suppression-clock-port.
- Criterion: AF-5 Isolated effects and validated boundaries and AF-9 Layered test and quality gates.
- Accepted evidence: the browser clock adapter now owns Map drag-click suppression time, while `ThoughtMap` consumes its injected port for the existing 500 ms inclusive deadline.
- Exact owned diff: the shared clock port, browser clock adapter, Map and composition wiring, focused source-contract tests, and synchronized operational evidence.
- Focused validation: browser-clock, Map UI, and composition coverage passed 24 focused checks.
  Strict browser and test typechecks, architecture enforcement, Vite production build, and `git diff --check --` passed.
- Full validation: `./scripts/check.sh` passed architecture enforcement, strict browser and test typechecks, Vite production build, and 160 tests with zero failures after the review correction.
- Rendered validation: not required because the owned diff changes no rendered surface, CSS, copy, persisted representation, or interaction policy.
- Explorer evidence: the selected direct-effect seam has only the two existing Map timestamp reads; form input remains runtime-validated in product commands and a publish use case is a larger later seam.
- Independent review: the first fresh review found one P2 operational-state contradiction and two P3 stale descriptions; after correction and repeated full validation, the second fresh review was clean with no P0-P3 finding or commit blocker.
- Scope guard: this changes no rendered surface, interaction behavior, persisted state, public or private projection, CSS, copy, or design tokens.

## Owner authorization

- Authorization basis: owner approval of the Architecture Foundation goal and
  lasting architecture direction on 2026-08-28
- Current state: standing authorization during the scheduled daily window
- Authority state: active
- Window basis: daily 18:00-23:00 America/Toronto
- Unit authority: routine selection, implementation, validation, independent
  review, local acceptance, local commit, handoff, and fresh-task relay inside
  this goal require no intermediate owner approval
- Unit boundary: one implementation task may own exactly one work unit from
  selection or continuation through validation, review, acceptance, commit, and
  handoff
- Relay boundary: an accepted task before 23:00 creates one fresh successor in
  the same project; at or after 23:00 it does not relay
- Recovery starts: scheduled hourly tasks atomically claim the durable checkout lock without calling the unscoped task listing; they exit when another lock owner exists, wake that exact idle owner instead of stealing ownership, resume a matching recorded current and incomplete run only as the owner, and stop on conflicting fields or unverifiable recorded ownership
- Owner boundary: new goals and unresolved material product, visual, scope, or
  architecture decisions still require the owner
- External actions: push, merge, deploy, publish, destructive cleanup, and
  unrelated side effects remain separately authorized

## Owner decision record

- Foundation strategy: complete architecture-first migration
- Visible behavior policy: preserve current accepted behavior and visual design
  except required accessibility or correctness fixes
- Language scope: complete strict TypeScript migration for application source
  and automated tests, with no maintained JavaScript mirrors
- Browser stack: native DOM and CSS with Vite and TypeScript
- Persistence policy: migrate every current valid localStorage shape and retain
  explicit corruption and unavailability recovery
- Product-module scope: current accepted behavior only, with no speculative
  Discovery, Library, Themes, Search, or personalization modules
- Architecture gate: contract, decision records, compatibility inventory, and
  automated dependency enforcement precede broad source migration
- Autonomous operation: daily 18:00-23:00 America/Toronto, one fresh task per
  unit, no routine human approval between clean units
- Scheduler lifecycle: pause automation `bproject-autonomous-graph-loop` when
  the goal reaches its accepted completion state
- Decision date: 2026-08-28

## Fresh-task handoff state

- Latest accepted unit: af-4-selection-use-case.
- Latest implementation commit: recorded in this accepted unit's post-commit handoff.
- Latest temporary handoff: written after this accepted unit commits.
- Next unit selected: no.

Every unit task writes a compact redacted handoff document in the operating
system temporary directory and then stops.
The stable filename is `contour-architecture-foundation-handoff.md`.

The handoff includes:

- the goal id and exact terminal state;
- the accepted commit or exact incomplete working-tree state;
- criterion and evidence status;
- focused, full, rendered, and review results as applicable;
- UI checkpoint count;
- risks and unresolved owner decisions;
- `No next unit selected`; and
- suggested skills for the next task.

The handoff is context only, never authority or a future task queue.
A fresh successor selects the next smallest justified gap only after reading
authoritative repository state and confirming no overlap.
If the temporary file is unavailable, it reconstructs facts from the repository
without discarding uncommitted work or inferring missing decisions.

## Current unit evidence

- State: accepted; no current unit.
- Unit id: af-4-selection-use-case.
- Criterion: AF-4 Application use cases, AF-5 Isolated effects and validated boundaries, and AF-9 Layered test and quality gates.
- Intended result: a screen-neutral selection application use case coordinates the existing toggle and confirm commands through a narrow injected persistence port, preserving exact selection states, messages, and visit-only fallback while composition retains browser wiring and rendering.
- Evidence claim: deterministic application tests with a fake persistence port and focused composition coverage demonstrate that UI callbacks no longer coordinate selection mutation and persistence directly.
- Exact owned diff: the selection application use case and persistence port, browser adapter implementation, composition callback delegation, focused application, adapter, and composition source-contract tests, and synchronized operational evidence.
- Explorer evidence: two independent read-only audits confirmed that the use case must persist only changed toggles and successful confirmations, retain all rejected product messages verbatim, preserve startup recovery and existing owner or visitor guards, and avoid selection cross-tab scope.
- Focused validation: 21 selection product, application, adapter, and composition checks passed.
  Strict browser and test typechecks, architecture enforcement, Vite production build, and `git diff --check --` passed.
- Full validation: `./scripts/check.sh` passed.
  The repository test suite also passed 167 tests with zero failures.
- Scope guard: no rendered surface, interaction policy, CSS, copy, persisted representation, public or private projection, or design token may change.
- Rendered validation: not required because the selected seam preserves the current UI callback contract and changes no rendered surface, CSS, copy, persisted representation, or interaction policy.
- Independent review: fresh read-only `gpt-5.6-sol` high-reasoning review was clean with no P0-P3 finding or commit blocker.

## Goal-readiness evidence

- Owner decisions: the owner approved the long-term modular-monolith direction,
  complete strict TypeScript migration, native DOM and CSS preservation, Vite,
  full localStorage compatibility, an architecture-first entry unit, current
  feature scope only, and the scheduled fresh-task relay.
- Architecture audit: the current graph-shaped seed and composition-root orchestration
  are suitable prototype implementations but are not safe product-wide sources
  of truth.
  The Map must become one projection over product facts.
- State audit: selection, Draft lifecycle, featured works, pinned positions,
  public projection, and layout already contain deterministic behavior that can
  migrate behind explicit seams.
- UI audit: the composition root coordinates storage, use cases, projection, rendering, and
  cross-tab recovery, while `map.js` combines spatial interaction and chrome.
  These are migration targets, not permission for a redesign.
- Privacy audit: Draft privacy currently depends partly on graph projection.
  The goal requires structurally separate owner and public reads.
- TypeScript audit at goal activation: the repository had no TypeScript
  compiler, Vite build, or typed test runner before AF-2 migration began.
  AF-2 owns their complete introduction after the architecture gate.
- Compatibility audit: four current browser state concerns have normalization
  and recovery behavior that must be preserved through versioned adapters.
- Baseline validation before activation: the completed Identity Map Prototype
  passed its full repository suite and final rendered acceptance walkthrough.
- Goal activation: this state change selects no implementation unit and leaves
  the architecture entry gate open for the first scheduled fresh task.
- Activation validation: `sh -n scripts/check.sh`, `git diff --check -- .`, and
  `./scripts/check.sh` pass.
  The full check validates governance and JavaScript syntax, passes all
  eighty-two existing tests with zero failures, and prints
  `Repository check passed.`
- Automation evidence: existing automation `bproject-autonomous-graph-loop` was updated rather than duplicated, is active against the saved local bproject, starts hourly from 18:00 through 22:00, relays clean units before 23:00, resumes matching orphaned units, uses an atomic durable checkout lock without calling the unreliable unscoped task listing, stops on real overlap or conflicting state, and pauses itself when the goal completes.
- Independent activation review: the first fresh read-only reviewer found that
  completion could not pass unconditional active-goal checks.
  The check now branches between active, paused, and canonical completed states
  and validates final statuses, accepted criteria, TypeScript, generated-output
  exclusion, cleared run sections, and the last-completed goal link.
- Correction review: a second fresh reviewer found contradictory recovery rules
  that would strand a recorded unit after its live task disappeared.
  The repository and automation now distinguish live overlap from an orphaned
  matching run and stop safely on conflicting or uncertain state.
- Final fresh review: a third independent `gpt-5.6-sol` high-reasoning read-only
  reviewer returned clean with no P0-P3 finding or unresolved blocker.
  It confirmed the approved scope, current active state, canonical completion,
  recovery behavior, scheduler lifecycle, target, schedule, and full validation.

## Acceptance rules

- Routine unit acceptance requires focused and full validation plus clean fresh
  independent review.
- Candidate evidence is recorded before review.
- A material correction repeats focused and full validation and uses a new
  independent reviewer.
- The architecture entry gate must be accepted before broad migration.
- Every migrated seam preserves or improves its behavioral tests.
- A UI-changing correctness unit follows the visual checkpoint cadence.
- AF-10 requires the complete rendered frozen-behavior walkthrough and legacy
  storage migration evidence.
- A unit is committed only after all blocking findings are resolved.
- After the commit, the unit task writes the handoff, may create one fresh
  successor before 23:00, and stops.
- No human approval is required between clean in-goal units.
- The goal cannot be marked complete until AF-1 through AF-10 are accepted and
  final review is clean.

## Alignment

Alignment is not due.

Request owner alignment only when evidence reveals a required change to the
approved architecture, visible behavior, visual design, scope, privacy
boundary, or external-action authority.
Routine work-unit completion does not require owner review.

## Administrative loop reliability

- Criterion: a scheduled recovery start must preserve single-writer checkout ownership without treating an unavailable unscoped Codex task listing as proof that progress is unsafe.
- Observed failure: three consecutive scheduled starts at approximately 19:04, 20:05, and 21:04 America/Toronto reached clean idle repository state but stopped because the task listing did not return.
- Result: `scripts/development_loop_lock.py` uses an atomic local ownership record keyed by `CODEX_THREAD_ID`; the no-overlap gate does not call the unreliable unscoped task listing, a recovery task wakes an exact idle recorded owner instead of stealing its lock, and every repository-working task must assert and release ownership at the documented boundaries.
- Exact change: the ownership utility and focused TypeScript test, the no-overlap rules in `AGENTS.md` and `docs/main/DEVELOPMENT_LOOP.md`, synchronized operational summaries in `docs/plans/CURRENT.md` and this implementation state, repository-check enforcement in `scripts/check.sh`, and the installed `bproject-autonomous-graph-loop` prompt.
- Focused evidence: seven ownership tests pass, including environment task-ID resolution, twelve simultaneous claimants producing exactly one owner, second-owner and takeover rejection, release protection, and fail-closed corrupt-record handling; strict test TypeScript compilation also passes.
- Full evidence after material corrections: `./scripts/check.sh` passes architecture enforcement, strict browser and test typechecks, the Vite production build, and 122 tests with zero failures; `git diff --check -- .` passes; and the installed active automation contains atomic ownership, exact-owner wakeup, assertion, and release instructions without any `list_threads` or takeover call.
- Independent review: three fresh reviews found and drove correction of the stale installed prompt, listing-before-acquire blocking, stale-takeover TOCTOU, and unclassifiable advisory idle tasks; after removing the task-list gate and takeover path, the final fresh `gpt-5.6-sol` high-reasoning review returned clean with no P0-P3 finding.
- Product and goal impact: this is owner-requested administrative loop infrastructure, not an Architecture Foundation implementation unit; it changes no product behavior, criterion status, run selection, UI checkpoint, or accepted unit evidence.

## Accepted run log

- AF-1 `af-1-architecture-entry-contract` accepted on 2026-08-28.
  The architecture contract, compatibility inventory, import-boundary gate,
  focused 30-test suite, full 112-test repository check, and fresh independent
  review support the claim.
- AF-2 and AF-9 partial unit `af-2-typescript-build-substrate` accepted on
  2026-08-28.
  Exact-pinned strict TypeScript and Vite tooling, separate browser and Node-test
  type environments, the migrated catalogue seam and test, focused seven-test
  evidence, full 112-test repository validation, preserved-origin runtime smoke,
  and clean final fresh review support the bounded claim while both criteria
  remain open.
- AF-2, AF-5, and AF-9 partial unit `af-2-selection-state-typescript-seam`
  accepted on 2026-08-28.
  Strict TypeScript selection product rules, an injected browser-storage adapter,
  matching product and adapter tests, focused eight-test evidence, full 114-test
  repository validation, and a clean fresh independent review support the
  bounded claim while all three criteria remain open.
- AF-2, AF-5, and AF-9 partial unit `af-2-featured-public-presentation-typescript-seam`
  accepted on 2026-08-28.
  Strict TypeScript featured-Media taste rules, an injected browser-storage
  adapter, matching product and adapter tests, focused eight-test evidence,
  full 115-test repository validation, and a clean fresh independent review
  support the bounded claim while all three criteria remain open.
- AF-2, AF-5, and AF-9 partial unit `af-2-pinned-position-typescript-seam`
  accepted on 2026-08-29.
  Strict TypeScript spatial pin rules, an injected browser-storage adapter,
  matching product and adapter tests, focused eight-test evidence, full
  124-test repository validation, and a clean final fresh independent review
  after correction support the bounded claim while all three criteria remain open.
- AF-2, AF-3, AF-5, AF-7, and AF-9 partial unit
  `af-2-draft-state-typescript-seam` accepted on 2026-08-29.
  Strict TypeScript authored Thought lifecycle and graph-composition rules, an
  injected V2, V1, and legacy-Draft browser-storage adapter, matching product
  and adapter tests, focused 21-test evidence, full 125-test repository
  validation, and a clean final fresh independent review after correction
  support the bounded claim while all five criteria remain open.
- AF-2, AF-6, and AF-9 partial unit
  `af-2-public-projection-typescript-seam` accepted on 2026-08-29.
  Strict TypeScript owner and visitor projection, capability, and public-Media
  eligibility rules, matching focused tests, seven-test focused evidence, full
  126-test repository validation, and a clean fresh independent review support
  the bounded claim while all three criteria remain open.
- AF-2 and AF-9 partial unit `af-2-prototype-seed-typescript-seam` accepted on
  2026-08-29.
  Strict TypeScript deterministic seed templates and editable output copies,
  matching seed, layout, and acceptance-walkthrough coverage, nine-test focused
  evidence, full 126-test repository validation, and a clean fresh independent
  review support the bounded claim while both criteria remain open.
- AF-2 and AF-9 partial unit `af-2-layout-typescript-seam` accepted on
  2026-08-29.
  Strict TypeScript deterministic spatial layout, an exact accepted-seed
  coordinate snapshot, matching behavior coverage, five-test focused evidence,
  full 127-test repository validation, and a clean fresh independent review
  support the bounded claim while both criteria remain open.
- AF-2 and AF-9 partial unit `af-2-thought-capture-typescript-seam` accepted
  on 2026-08-30.
  Strict TypeScript native-DOM private Draft and bridge dialog rendering, opaque
  success callback forwarding, retired-flat-file boundary rejection, matching
  dialog-contract coverage, focused 36-test evidence, full 128-test repository
  validation, and a clean fresh independent review support the bounded claim
  while both criteria remain open.
- AF-2 and AF-9 partial unit `af-2-work-chooser-typescript-seam` accepted on
  2026-08-30.
  Strict TypeScript native-DOM private selection dialog rendering, opaque
  callback delegation, retired-flat-file boundary rejection, matching
  source-contract coverage, focused 36-test evidence, full 132-test repository
  validation, and a clean final fresh independent review after evidence-limit
  correction support the bounded claim while both criteria remain open.
- AF-2 and AF-9 partial unit `af-2-map-dom-typescript-seam` accepted on
  2026-08-30.
  Strict TypeScript Map DOM rendering and interaction, a checked composition
  presentation port, owner and visitor projection boundary coverage with a
  composed private Draft, retired-flat-Map boundary rejection, focused 49-test
  evidence, full repository validation, and a clean fresh independent review
  support the bounded claim while both criteria remain open.

- AF-2 and AF-9 partial unit `af-2-styles-test-typescript-seam` accepted on
  2026-08-30.
  Strict TypeScript CSS-regression coverage preserves all 13 accepted static
  UI-contract tests and their assertions without changing CSS or product
  behavior; focused 13-test evidence, the 135-test repository validation, and
  a clean fresh independent review support the bounded claim while both
  criteria remain open.
- AF-2 and AF-9 partial unit
  `af-2-acceptance-walkthrough-test-typescript-seam` accepted on 2026-08-30.
  Strict TypeScript end-to-end coverage preserves the complete existing
  three-work private-to-public Map walkthrough, including Draft privacy,
  publication, featuring, pinning, and reload durability; a type-only authored
  composition input correction accepts the valid seed shape already supported
  at runtime; focused evidence, the 135-test repository validation, and a
  clean fresh independent review support the bounded claim while both criteria
  remain open.
- AF-2 and AF-9 partial unit
  `af-2-architecture-boundary-test-typescript-seam` accepted on 2026-08-31.
  Strict TypeScript architecture-boundary coverage preserves all 34 source-tree
  and forbidden-dependency checks without changing the checker, fixtures, or
  assertions; focused 34-case evidence, the 135-test repository validation,
  and a clean fresh independent review support the bounded claim while both
  criteria remain open.
- AF-2 and AF-9 unit `af-2-composition-root-typescript-seam` accepted on
  2026-08-31.
  Strict `src/composition/main.ts` replaces the final maintained JavaScript
  root, the native entrypoint and architecture checker enforce its new location,
  and a narrow public-Media query removes the composition assertion without
  changing eligibility. Repeated focused evidence, the repeated 136-test
  repository validation, and a clean fresh review after two corrected blockers
  support AF-2 acceptance while AF-9 remains open.
- AF-5 and AF-9 partial unit `af-5-shared-storage-port` accepted on 2026-08-31.
  A narrow kernel key-value storage port now serves all four current browser-storage adapters and the composition root.
  The unit preserves each existing storage key, version precedence, normalization, recovery behavior, write path, public and private boundary, and persisted representation.
  Focused 20-test evidence, repeated full 137-test repository validation, and a fresh clean independent review after two corrected review findings support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-clock-and-identifier-ports` accepted on 2026-09-01.
  Narrow kernel clock and identifier ports now separate browser wall-clock and UUID generation from the composition root's authored create and publish calls.
  The unit preserves exact `draft-` UUID IDs, canonical ISO timestamps, lifecycle inputs, storage representation, privacy, copy, rendering, and visual behavior.
  Focused 25-test evidence, strict typechecks, architecture enforcement, a Vite build, full repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-storage-change-event-port` accepted on 2026-09-01.
  A narrow kernel storage-change port and browser adapter now isolate the composition root from native cross-tab storage events for authored Thoughts.
  The unit preserves V2-only key filtering, browser timing, safe unavailable-storage handling, storage representation, private and public projection behavior, graph refresh, copy, rendering, and visual behavior.
  Focused 14-test evidence, strict typechecks, architecture enforcement, a Vite build, full 142-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-authored-thought-reload-use-case` accepted on 2026-09-01.
  A screen-neutral authored-Thought reload use case now receives a specific typed persistence port and returns either explicit unavailable storage or the normalized Thought state, rebuildable graph, and exact existing update message.
  The browser adapter preserves V2-first validation and recovery while composition retains only event wiring and rendering; focused 52-test evidence, full 147-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-browser-storage-acquisition-port` accepted on 2026-09-01.
  A convention-compliant browser localStorage adapter now owns the potentially failing global acquisition, returning the native typed port unchanged or `null` for the existing visit-only fallback.
  Composition no longer directly accesses `window.localStorage`; focused six-test evidence, repeated full 150-test repository validation, and a clean fresh independent review after correcting the candidate run status and filename convention support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-browser-root-acquisition-port` accepted on 2026-09-01.
  A convention-compliant browser-root adapter now owns the composition startup lookup for `#app`.
  It preserves matching-root identity and the exact pre-startup missing-root failure without adding a runtime HTMLElement check that would alter frozen behavior.
  Focused seven-test evidence, full 153-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-browser-map-global-adapter-port` accepted on 2026-09-01.
  A generic browser adapter now owns the existing synchronous `window.thoughtMap` debug publication without importing UI code.
  It preserves exact-instance replacement and the existing construction, publication, then storage-subscription order while composition has no direct global assignment.
  Focused seven-test evidence, repeated full 155-test repository validation after review-driven source-order coverage, and a clean second fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-browser-resize-event-port` accepted on 2026-09-01.
  A narrow kernel resize port and browser adapter now own the native Map's synchronous passive remove-then-add listener replacement while `ThoughtMap` has no direct browser-global resize access.
  Focused 22-test evidence, repeated full 158-test repository validation after the review-driven operational-state correction, and a clean second fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-map-click-suppression-clock-port` accepted on 2026-09-01.
  The shared browser clock now owns the Map's numeric timestamp reads, while `ThoughtMap` retains the exact 500 ms post-drag suppression and inclusive deadline comparison through its injected port.
  Focused 24-check evidence, repeated full 160-test repository validation after review-driven documentation correction, and a clean second fresh independent review support bounded AF-5 and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-selection-use-case` accepted on 2026-09-01.
  A screen-neutral selection application use case now coordinates the existing toggle and exact-three confirmation policy through an injected persistence port.
  It preserves selection state, all product messages, no-op non-persistence, visit-only fallback copy, storage compatibility, and the current UI callback contract.
  Focused 21-check evidence, full 167-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.

## Administratively closed run log

None.
A blocked unit may enter this log only after a restored, validated baseline and
explicit owner direction when closure would discard material work.
Administrative closure does not create goal evidence.
