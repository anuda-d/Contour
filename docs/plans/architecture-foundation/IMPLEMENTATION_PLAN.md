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
| AF-4 Application use cases | open | None yet. |
| AF-5 Isolated effects and validated boundaries | open | Partial: selection, featured-Media, pinned-position, and authored-Thought persistence now cross injected browser-storage ports, untrusted JSON is normalized before entering typed product state, and the authored lifecycle no longer reads the wall clock; other effects remain un-migrated. |
| AF-6 Explicit projections and privacy | open | Partial: the owner and visitor graph projection now has strict TypeScript ownership and focused evidence for Draft and draft-only Media exclusion, publication-derived public eligibility, dangling-edge filtering, and owner capability removal; application-level structurally separate read models remain open. |
| AF-7 Durable compatibility | open | Partial: authored V2, V1, and legacy-Draft browser storage now has typed precedence, normalization, migration, recovery, and read-merge-write evidence; other persisted state remains to be completed. |
| AF-8 Frozen visible behavior | open | None yet. |
| AF-9 Layered test and quality gates | open | Partial: the repository check now enforces separate strict typechecks, the Vite build, import boundaries, and Map composition, DOM-source-contract, product, browser-adapter, CSS-regression, end-to-end acceptance, and architecture-boundary coverage; later migrated seams and final coverage remain open. |
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

- State: accepted; no successor unit selected.
- Unit id: af-2-composition-root-typescript-seam.
- Criterion: AF-2 Complete strict TypeScript and AF-9 Layered test and quality gates.
- Intended result: migrate the sole browser composition root from `src/app.js` to strict `src/composition/main.ts`, update the native entrypoint, and preserve every current startup, storage-recovery, authoring, projection, Map, and cross-tab behavior.
- Evidence claim: no maintained application JavaScript remains; the native browser entrypoint loads the strict TypeScript composition root; focused composition and acceptance coverage, strict typechecking, architecture enforcement, the reproducible browser build, and the full repository check pass without a product or visual change.
- Exact owned diff: relocate the existing composition root to `src/composition/main.ts`, add only types and strict-safe DOM guards required by TypeScript, update the static entrypoint and relevant source-contract coverage, retire `src/app.js`, and update this unit's run and acceptance evidence.
- UI checkpoint: not incremented if source and focused behavior evidence confirm no rendered UI surface, interaction, CSS, or visible content changes.
- Design read: preserve-mode editorial constellation Map. Preserve markup, CSS, design tokens, copy, hierarchy, appearance, motion, and interaction intent exactly.
- Design dials: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` remain at the accepted baseline.
- Redesign audit: not applicable unless source inspection reveals an unintended rendered behavior change. Retire no visual pattern.
- Pre-flight scope: strict composition-root migration only. Verify the entrypoint, source layout, startup and cross-tab contracts, and no product-facing file change beyond the entry script path.
- Risks and assumptions: the relocated composition root still coordinates effects and UI callbacks directly. This unit changes its language and location only; it does not claim application-use-case isolation or structurally separate projections.
- Exploration: two independent read-only `gpt-5.6-terra` high-reasoning explorers confirmed that composition may depend on every current layer, identified the obsolete `app.js` legacy exemption and fixture, and scoped the strict conversion to DOM, storage, callback, result-union, and entrypoint typing without changing startup behavior.
- Candidate evidence: moved `src/app.js` to strict `src/composition/main.ts`, rebased only its imports, preserved all current composition callbacks and recovery flows, and changed the native module entrypoint to the new source path. A narrow `PublicMediaSource` query contract replaces the rejected seed-to-projection assertion while retaining the exact public-Media eligibility rule. The entrypoint test asserts that `index.html` loads `src/composition/main.ts` with the existing cache-buster and no longer references `src/app.js`; the architecture checker no longer exempts the retired legacy root, while its remaining-legacy fixture still proves import resolution occurs before exemption. The first independent review found and blocked an unsafe double assertion plus weakened legacy coverage; both were corrected. Repeat focused 57-test validation passed the entrypoint contract, full private-to-public acceptance walkthrough, Graph projection, Map presentation, DOM behavior, and architecture boundaries. `npm run typecheck`, `npm run check:architecture`, `npm run build`, repeated `./scripts/check.sh`, and `git diff --check -- .` all passed. The repeated full repository check passed 136 tests with zero failures. No rendered surface, CSS, interaction contract, or persisted storage representation changed.
- Independent review: the first fresh `gpt-5.6-sol` high-reasoning reviewer identified and blocked the unsafe assertion and weakened remaining-legacy fixture. After correction and repeat validation, a new fresh `gpt-5.6-sol` high-reasoning reviewer returned clean with no P0-P3 finding or commit blocker. It verified the assertion-free public-Media query, remaining legacy import-resolution coverage, and preserved behavior, privacy, and storage contracts.
- Accepted evidence: AF-2 is accepted. The sole maintained JavaScript composition root is retired, every maintained source and automated test is TypeScript, and the native browser entrypoint reaches the strict composition root. AF-9 remains open because later application, adapter, projection, compatibility, and final-walkthrough seams still need proportionate coverage.

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

- Latest accepted unit: af-2-architecture-boundary-test-typescript-seam
- Latest implementation commit: recorded in this accepted unit's post-commit handoff.
- Latest temporary handoff: written after this accepted unit commits.
- Next unit selected: no

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
- Criterion: AF-2 Complete strict TypeScript and AF-9 Layered test and quality gates.
- Intended result: migrate the sole browser composition root to strict TypeScript and retire the last maintained application JavaScript source without changing accepted behavior.
- Evidence claim: the native entrypoint, strict typechecks, import enforcement, behavior coverage, and production build directly support complete TypeScript ownership.
- Focused validation: the repeated 57-test source, acceptance, projection, Map, and architecture suite plus `npm run typecheck`, `npm run check:architecture`, and `npm run build` passed.
- Full validation: repeated `./scripts/check.sh` passed architecture enforcement, strict browser and test typechecks, the Vite production build, and all 136 tests with zero failures; `git diff --check -- .` passed.
- Rendered validation: not due because the accepted unit changes no rendered surface, interaction, CSS, or visual design.
- Remaining risk: direct composition callbacks, application-use-case isolation, read-model separation, adapter-port completion, storage compatibility completion, frozen-flow validation, and the final walkthrough remain open under their respective criteria.
- Independent review: after correction, a fresh `gpt-5.6-sol` high-reasoning reviewer returned clean with no P0-P3 finding or commit blocker.

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

## Administratively closed run log

None.
A blocked unit may enter this log only after a restored, validated baseline and
explicit owner direction when closure would discard material work.
Administrative closure does not create goal evidence.
