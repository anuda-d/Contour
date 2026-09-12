# Architecture Foundation Implementation State

Status: active shared state; standing scheduled owner authorization.

## Run state

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

## Goal progress

| Criterion | Status | Accepted evidence |
| --- | --- | --- |
| AF-1 Enforced architecture contract | accepted | Architecture decision records, six-key compatibility inventory, and the checked import-boundary gate were accepted after 30 focused and 112 repository tests plus clean fresh review. |
| AF-2 Complete strict TypeScript | accepted | Every maintained application source and automated test is strict TypeScript. Separate browser and Node-test typechecks, the Vite build, and the checked `src/composition/main.ts` native entrypoint are accepted with no maintained application JavaScript mirror. |
| AF-3 Deep product modules | accepted | Typed identity, catalogue, and seeded or persisted authored facts now have explicit owners, while one Map builder deterministically derives nodes and relationship edges for projection and layout. Focused fact, projection, application, and walkthrough evidence plus clean fresh review confirm no generic graph remains product authority. |
| AF-4 Application use cases | accepted | Screen-neutral startup and recovery, create/edit/bridge preparation, selection and featured-Media commands, pin/unpin commands, authored capture/publication/reload state-plus-graph outcomes, and structural Map reads coordinate every current workflow through explicit outcomes and typed ports. Focused application, composition, and form evidence plus clean criterion-wide independent review confirm that only presentation and concrete effect wiring remain outward. |
| AF-5 Isolated effects and validated boundaries | accepted | The executable inventory now covers browser storage, root, resize, storage-change, clock, identifiers, debug global, seed, form snapshots and live inputs, every Map data attribute, and every Map wheel, pointer, keyboard, and geometry value. Invalid values remain inert before trusted state, CSS, or application callbacks. |
| AF-6 Explicit projections and privacy | accepted | Application-created owner and visitor Map read models now structurally separate rendered graph data. Visitor Map rendering receives no Draft or draft-only Media, generated positions, or pins, while public positions preserve full-graph layout influence and owner-only transient placement remains outside visitor rendering. |
| AF-7 Durable compatibility | accepted | Six current browser-storage key shapes across selection, authored Thought V2/V1/legacy Draft precedence, featured Media, and pinned positions have accepted typed migration, retention, recovery, unavailable-storage, reload, and privacy evidence. |
| AF-8 Frozen visible behavior | accepted | [Rendered walkthrough](AF-8_RENDERED_WALKTHROUGH.md) covers local production desktop and touch-enabled mobile owner and visitor flows in light and dark modes, private/public separation, persistence, interaction, responsive seams, focus behavior, and clean console evidence without a product change. |
| AF-9 Layered test and quality gates | accepted | [Quality-gate inventory](../../architecture/QUALITY_GATE_INVENTORY.md) maps AF-1 through AF-8 and every protected invariant to tracked product, fake-port application, adapter, DOM, architecture, strict build, rendered, and repository proof. Its focused test rejects missing, malformed, duplicate, or unresolvable evidence, and the repository check executes it explicitly. |
| AF-10 Durable completion walkthrough | accepted | [Terminal completion walkthrough](AF-10_COMPLETION_WALKTHROUGH.md) records production-build desktop and touch-enabled mobile Chromium owner and visitor evidence in light and dark modes, rendered legacy Draft migration, V1 and V2 precedence, preserved legacy keys, focus, responsive seams, persistence, and clean console observations. [Schema-version-1 terminal evidence](AF-10_TERMINAL_EVIDENCE.json) records all accepted criteria and canonical terminal documents. |

This table records accepted evidence only.
It is not a task sequence, roadmap, or permission to infer later work units.

## Completion audit

- Last audited commit: b3c3f0605380aa434a2dcf4b47d1f31be255926b
- Accepted implementation units since audit: 3

| Open criterion | Present evidence | Exact remaining blocker | Observable acceptance condition |
| --- | --- | --- | --- |
| None | AF-1 through AF-10 have recorded criterion evidence. | Fresh independent slice review, then whole-goal alignment, final goal review, and explicit lifecycle completion remain outside this writer slice. | The orchestrator completes the separately required lifecycle transitions without changing the reviewed terminal evidence tree. |

At the recorded audit baseline no criterion was ready for acceptance.
Touched blocker rows are refreshed at each unit; the baseline and count still govern the next complete audit.
AF-3 is accepted: identity, catalogue, and authored facts now own their current semantics, and the Map graph is rebuilt only as a projection and layout input.
AF-4 is now accepted after complete workflow evidence and fresh criterion-wide independent review.
Its capture-preparation blocker is eliminated; rendering and focus translation remain correctly outward.
AF-5 is accepted after the complete executable effect and native-input boundary inventory.
AF-8 is accepted with the rendered frozen-behavior walkthrough.
AF-9 is accepted with its checked cross-criterion invariant inventory.
AF-10 has final rendered legacy-state completion evidence in `AF-10_COMPLETION_WALKTHROUGH.md`.
The committed terminal evidence deliberately excludes its later final-review claim to avoid a circular amend-and-rereview sequence.
This audit is present-state evidence, with no future task queue.

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
- Latest accepted unit: af-3-typed-prototype-facts-map-projection.
- Criteria: AF-3 Deep product modules accepted, with bounded AF-5 and AF-9 support.
- Accepted result: typed identity, catalogue, and authored facts now rebuild the Map representation through one product-owned builder.
  The seed boundary validates redundant legacy relationship input without returning graph-shaped product authority.
- Evidence: 48 focused checks, the full 256-test repository suite, strict browser and test typechecks, architecture enforcement, Vite build, and whitespace validation pass.
- Independent review: a fresh read-only `gpt-5.6-sol` high-reasoning review found no actionable P0-P3 findings after independently rerunning 69 affected tests.
- UI checkpoint: unchanged at 0; no valid UI behavior, copy, DOM, CSS, theme, layout, or interaction changed.

## Owner authorization

- Authorization basis: owner approval of the Architecture Foundation goal and
  lasting architecture direction on 2026-08-28
- Current state: standing authorization during the scheduled daily window
- Authority state: active
- Window basis: daily 18:00-23:00 America/Toronto
- Slice authority: routine selection, implementation, validation, independent review, local acceptance, and local commit inside this goal require no intermediate owner approval.
- Writer boundary: one fresh writer task may own exactly one slice and is its sole repository modifier.
- Generation boundary: one orchestrator manages at most three sequential accepted slices, performs whole-goal alignment, and then hands off to a fresh orchestrator.
- Recovery starts: scheduled hourly tasks perform only liveness and exact-claim recovery against structured lifecycle state.
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
- Autonomous operation: daily 18:00-23:00 America/Toronto, one fresh writer per slice and one orchestrator per three accepted slices, with no routine human approval between clean slices
- Scheduler lifecycle: pause automation `bproject-autonomous-graph-loop` when
  the goal reaches its accepted completion state
- Decision date: 2026-08-28

## Generation handoff state

- Latest accepted unit: af-4-authored-capture-preparation.
- Latest implementation commit: recorded in this accepted unit's post-commit handoff.
- Latest temporary handoff: `contour-architecture-foundation-handoff.md` in temporary storage; context only, with this repository state authoritative.
- Next slice selected: no.

Every orchestrator generation writes a compact redacted handoff document in the operating system temporary directory and then stops.
The stable filename is `contour-architecture-foundation-handoff.md`.

The handoff includes:

- the goal id and exact terminal state;
- the accepted commit or exact incomplete working-tree state;
- criterion and evidence status;
- focused, full, rendered, and review results as applicable;
- UI checkpoint count;
- risks and unresolved owner decisions;
- `No next slice selected`; and
- suggested skills for the next task.

The handoff is context only, never authority or a future task queue.
A fresh orchestrator selects one coherent responsibility only after reading authoritative repository and lifecycle state, confirming no overlap, and completing any due completion audit.
If the temporary file is unavailable, it reconstructs facts from the repository
without discarding uncommitted work or inferring missing decisions.

## Current unit evidence

- State: accepted; no current unit.
- Unit id: af-3-typed-prototype-facts-map-projection.
- Criterion: AF-3 Deep product modules accepted, with bounded AF-5 and AF-9 support.

### Prior AF-4 acceptance evidence

- Completed responsibility: one application query prepares creation, editing including existing bridges, and bridge creation from current authored state, private selection, and catalogue facts.
- Eliminated gap: composition no longer owns capture availability, Draft lookup, anchor assembly, or selected-work catalogue joins.
- Completion condition: all three entry paths return explicit available or unavailable outcomes with unchanged eligible works, order, and Draft opening values; composition consumes those outcomes without reconstructing workflow rules.
- Exact accepted files: `src/application/authorship/prepare-authored-capture.ts`, `src/composition/main.ts`, `tests/application/authorship/prepare-authored-capture.test.ts`, `tests/composition/main.test.ts`, and this implementation state.
  `CURRENT.md` is synchronized back to its canonical idle state and has no final diff.
- Observed evidence: eight executable application tests cover confirmed create availability, selection order, single and existing-bridge editing with unconfirmed selection, missing and Published Thought rejection, primary-first selected bridge candidates, missing-catalogue filtering, and isolated opening snapshots.
  The new composition source contract verifies both entry callbacks delegate preparation and retain modal exclusion, owner mode, notice consumption, focus restoration, and focus-versus-selection Map updates.
  Existing capture form and save tests continue to prove validation, exact mutations, concurrent merge protection, no-op, and visit-only outcomes.
- Validation: all 48 focused authored application, composition, and Thought Capture tests pass.
  `./scripts/check.sh` passes strict browser and test typechecks, architecture boundaries, Vite build, and all 258 repository tests with zero failures.
  Owned-diff whitespace checks pass.
  Initial validation found two redundant test guards rejected after assertion narrowing and a noncanonical run-status value; both were corrected before the successful focused and full rerun.
- Interpretation: the preparation query closes the remaining AF-4 workflow join when combined with the previously accepted application boundaries below.
  Fresh independent review confirmed criterion completion and the absence of another composition-owned workflow mutation script.
  Rendering, dialog lifecycle, owner preview gating, focus versus selection, display-title input, and projected pinnable IDs are narrow outer presentation or composition responsibilities.
  They do not perform domain mutation, persistence, or cross-module transaction policy and should not move into the application layer.
- Design Read: preservation of the native-DOM Editorial Constellation for people authoring private Thoughts about Books and Films.
- Design dials: DESIGN_VARIANCE, MOTION_INTENSITY, and VISUAL_DENSITY all match the accepted implementation; no dial increment or redesign is authorized.
- Design preservation audit: keep cool mineral light and matched dark tokens, coral accent, Avenir typography, 7px control radius, existing anchor order, private notices, dialog inertness, and focus behavior.
- Design pre-flight: preservation mode, accepted Editorial Constellation language, existing design dials, and native DOM/CSS remain unchanged.
  Source and diff inspection confirm no UI renderer, CSS, token, copy, focus-trap, keyboard, modal inertness, responsive, or theme edits.
  New query tests cover the work order that drives dialog content.
  Landing-page layout, hero, image, and motion redesign checks are inapplicable to this bounded product architecture unit.
- Rendered evidence: not run; no valid UI behavior changes and the fifth-UI-unit checkpoint is not due.
  AF-8 and AF-10 still require their complete rendered walkthroughs.
- UI checkpoint: unchanged at 0.
- Independent review: fresh read-only `gpt-5.6-sol` high-reasoning review found no actionable P0-P3 findings.
  The reviewer independently reran all 48 focused checks and whitespace validation, inspected the full-check evidence, and confirmed AF-4 acceptance.
- Acceptance: AF-4 accepted under standing owner authorization after clean review; no AF-4 blocker remains.
  AF-9 receives bounded preparation-query and composition evidence but remains open for a complete invariant-to-test inventory, remaining AF-3 migration coverage, and AF-8/AF-10 rendered evidence.
- Completion audit count: incremented once from 1 to 2; audit baseline remains `b3c3f0605380aa434a2dcf4b47d1f31be255926b`.
- Risks and assumptions: owner-only gating remains before preparation in composition and in Map entry controls.
  Bridge secondary eligibility remains the offered current selected works plus the existing form boundary; the save command's current catalogue validation is unchanged.
  Existing partial-catalogue filtering is preserved, including editing when at least one existing anchor resolves.
  No unresolved owner decision is required.

### AF-3 accepted evidence

- Completed responsibility: typed identity and authored facts are now the source of truth, while `product/map/map-graph.ts` alone derives the Map-only nodes and semantic relationship edges.
- Eliminated acceptance gap: no active product or application path accepts a generic graph as authority for owner identity, seeded authored Thoughts, or authored and anchor relationships.
- Completion condition evidence: the focused 48-test suite passes across seed validation, graph assembly, authored workflows, startup, privacy projection, deterministic layout, composition contracts, and the private-to-public walkthrough.
  Strict browser and Node type checks, `./scripts/check.sh`, and owned-diff whitespace validation also pass.
- Preservation evidence: exact seed profile, Thought content, relationship IDs, kinds, ordering, accepted layout coordinates, Draft privacy, public eligibility, pin eligibility, storage shapes, messages, and native DOM behavior remain covered without a renderer or CSS change.
- Independent review: the initial reviewer found and the unit corrected lossy third-anchor rejection and a missing draft-only Media privacy proof.
  A fresh final reviewer found no actionable P0-P3 findings and independently passed 69 affected tests.
- Remaining blockers: AF-5 still needs a complete effect-boundary inventory, and AF-9 still needs its final cross-layer invariant-to-test inventory and rendered evidence.
- Completion audit: incremented once from 2 to 3, so the next fresh task must complete a new audit before selection.
- Risks and assumptions: redundant seed relationship records remain only for input validation, never as product authority.
  Persisted `draft-*` IDs still win collisions exactly as before.
  No owner decision is required.

### AF-4 criterion evidence consolidation

| Current workflow | Owning application boundary | Accepted evidence |
| --- | --- | --- |
| Complete startup and recovery | `application/map/initialize-map-session.ts` and the authored, selection, featured, and pin recovery use cases | Accepted typed-port ordering, success, corruption recovery, merge, and visit-only tests |
| Create, edit, and bridge preparation | `application/authorship/prepare-authored-capture.ts` | Accepted ordered opening snapshots and explicit availability tests for all three sibling paths |
| Authored create, edit, and bridge mutation | `application/authorship/save-authored-draft.ts` | Accepted injected clock/identifier, scoped persistence, stale publication protection, no-op, exact messages, authoritative state-plus-graph tests |
| Authored publication and storage-event reload | `application/authorship/publish-authored-thought.ts` and `reload-authored-thoughts.ts` | Accepted lifecycle, atomic persistence, concurrent merge, storage-unavailable, state-plus-graph, and public projection tests |
| Private selection and public featured-Media mutation | `application/taste/update-selection.ts` and `update-featured.ts` | Accepted invariant, ordering, public eligibility, no-op, persistence, and explicit outcome tests |
| Spatial pin and unpin | `application/map/update-pinned-positions.ts` | Accepted non-user eligibility, position validation, persistence failure, no-op, and spatial-only outcome tests |
| Active owner and visitor Map reads | `application/map/create-map-read-model.ts` | Accepted structural privacy, full-graph layout preservation, pin filtering, and owner transient placement tests |

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
- Earlier automation evidence: the existing `bproject-autonomous-graph-loop` was updated rather than duplicated and kept its saved local project, 18:00 through 22:00 schedule, model, reasoning effort, and local execution environment.
  Its retired per-unit relay behavior is superseded by the generation-based control plane documented below.
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

- A slice completes one coherent responsibility and eliminates its named acceptance gap, or completes an indispensable prerequisite justified by dependency or preservation risk.
- Related entry paths and their validators, adapters, imports, and focused tests belong in the same frozen slice contract when they serve that responsibility.
- Candidate evidence and independent review identify the same contract hash and content identity.
- Routine slice acceptance requires focused and full validation, clean fresh independent review, and exact commit finalization through the lifecycle state machine.
- A material correction invalidates prior validation and review, repeats both validation layers, and uses a new independent reviewer.
- The architecture entry gate must be accepted before broad migration.
- Every migrated seam preserves or improves its behavioral tests.
- A UI-changing correctness slice follows the visual checkpoint cadence.
- AF-10 requires the complete rendered frozen-behavior walkthrough and legacy
  storage migration evidence.
- A slice is committed only after all blocking findings are resolved.
- After the reviewed commit is clean authoritative `HEAD`, the writer releases ownership, finalizes exact acceptance, returns a compact result, and stops.
- The same orchestrator may select slice two or three, but the state machine forces alignment after three acceptances.
- No human approval is required between clean in-goal slices.
- The goal cannot be marked complete until AF-1 through AF-10 are accepted and
  final review is clean.

## Alignment

Owner alignment is not due.
Once the AF-10 slice is independently reviewed and finalized, whole-goal alignment is controlled separately by the lifecycle state machine.
It is mandatory before the final goal review and completion transition.

Request owner alignment only when evidence reveals a required change to the
approved architecture, visible behavior, visual design, scope, privacy
boundary, or external-action authority.
Routine work-unit completion does not require owner review.

## Administrative loop reliability

- Criterion: preserve atomic single-writer ownership without locking read-only work or allowing an abandoned terminal claim to strand the checkout.
- Observed overhead: the prior policy acquired ownership before read-only explorers, repeated assertions before every mutation phase, and required the recorded owner to release every stale claim.
- Owner-directed result: read-only work is lock-free; writers acquire immediately before their first repository mutation, assert after resumption and before the final commit, then release before exact lifecycle finalization.
- Recovery safety: a documented terminal owner's exact task ID and unique claim ID may be atomically transferred with explicit terminal verification; age alone never permits recovery, an outdated snapshot cannot replace a newer claim, and a legacy tokenless record remains owner-release only.
- Exact change: the ownership utility and focused TypeScript tests, compact rules in `AGENTS.md` and `docs/main/DEVELOPMENT_LOOP.md`, synchronized summaries in `docs/plans/CURRENT.md` and this implementation state, repository-check enforcement in `scripts/check.sh`, and the installed `bproject-autonomous-graph-loop` prompt.
- Candidate evidence: two independent read-only audits agree that the lock primitive is cheap and the surrounding gate was overbroad; Python compilation, ten focused ownership tests, JSON status inspection, owned-diff whitespace validation, strict typechecks, the Vite build, and the full 224-test repository check pass.
- First review correction: the initial fresh review identified a stale-recovery race if a terminal owner resumed under its old claim and contradictory scheduler instructions that reacquired after successful recovery; the policy now forbids terminal-claim resumption and the scheduler branches between ordinary acquisition and recovery.
- Repeated validation: ten focused ownership tests and the full repository check pass again with architecture enforcement, strict typechecks, the Vite build, and all 224 tests; owned-diff whitespace validation and the installed scheduler prompt inspection also pass.
- Second review correction: the next fresh review found that the CLI still allowed self-recovery and recovery of unversioned records containing an arbitrary claim ID; both paths now fail closed with focused coverage.
- Final correction validation: ten focused ownership tests and the full repository check pass again with architecture enforcement, strict typechecks, the Vite build, and all 224 tests; owned-diff whitespace validation also passes.
- Third review correction: the next fresh review found that the installed scheduler rechecked candidate state before ownership rather than after it; the prompt now establishes ownership first, rechecks repository and run state while holding it, and reconfirms the candidate before mutation.
- Final scheduler correction validation: ten focused ownership tests and the full repository check pass again with architecture enforcement, strict typechecks, the Vite build, and all 224 tests; direct inspection confirms the installed scheduler now acquires or recovers before its decisive recheck.
- Final independent review: a fresh `gpt-5.6-sol` high-reasoning reviewer found no P0-P3 issue, policy contradiction, recovery race, or missing implementation evidence.
- Owned-only staging: the cached patch contains exactly the seven administrative lock-policy files and excludes the pre-existing `AGENTS.md`, `scripts/check.sh`, README, product-document, and retired-plan changes.
- Product and goal impact: this is owner-requested administrative loop infrastructure, not an Architecture Foundation implementation unit; it changes no product behavior, criterion status, run selection, UI checkpoint, or accepted unit evidence.

## Administrative completion policy update

- Authority: the owner requested this loop correction on 2026-09-06 after reviewing the pattern of small partial units.
- Criterion: selection and acceptance must complete a bounded responsibility or justified prerequisite and identify the concrete goal gap eliminated.
- Intended result: related paths are completed together, touched criterion blockers stay explicit, and a completion audit is due before the next new selection and every three accepted implementation units afterward.
- Explorer evidence: two independent read-only audits identified repeated single-boundary units, vague residual criterion descriptions, and stale latest-unit handoff metadata.
- Exact repository diff: `AGENTS.md`, `docs/main/DEVELOPMENT_LOOP.md`, `docs/plans/CURRENT.md`, this implementation state, and `scripts/check.sh` synchronize selection, review, audit cadence, and compact audit-state validation.
- Automation verification: the existing `bproject-autonomous-graph-loop` identity, project, schedule, model, reasoning effort, and local execution environment are preserved.
  It remains paused through control-plane commit and state migration, then is activated only after the authoritative checkout is clean and unlocked.
- Focused validation: shell syntax and whitespace checks pass; eight isolated policy-check fixtures accept initial, due, and recovery audit states and reject malformed, missing, duplicate, or out-of-range fields.
- Full validation: `./scripts/check.sh` passes architecture enforcement, strict browser and test typechecks, the Vite production build, and all 239 tests with zero failures.
- Independent review: a fresh read-only `gpt-5.6-sol` high-reasoning reviewer found no actionable P0-P3 finding and independently reran the full repository check successfully.
- Scope: this administrative update selects no implementation unit, advances no Architecture Foundation criterion, and leaves the UI checkpoint count at zero.
  Goal scope, standing authorization, ownership, safety gates, full validation, independent review, rendered checkpoints, and the scheduled window are preserved.
- Completion audit: intentionally due; the next eligible fresh task establishes current criterion blockers before selecting its unit.

## Administrative orchestrator-generation migration

- Authority: the owner replaced the one-task-per-slice outer loop with orchestrator generations on 2026-09-08: the scheduler should be purely liveness and recovery, one orchestrator should manage up to three accepted slices, and every slice should use one fresh sole-writer task with read-only subagents.
- Product impact: this is loop control-plane administration and selects no Architecture Foundation implementation slice.
- Structured state: `scripts/development_loop_state.py` persists one versioned lifecycle record under the Git common directory with atomic synchronized writes, compare-and-swap revisions, exact role claims, bounded retry counters, and idempotent operation IDs.
- Frozen contracts: each slice embeds and hashes its criterion, responsibility, acceptance gap, completion condition, included paths, preservation boundaries, and validation commands before dispatch.
- Acceptance: focused and full validation plus independent review bind to one content identity, and finalization verifies a descendant commit with exact slice and contract trailers before incrementing the generation count.
- Generation boundary: accepted slices one and two return the same orchestrator to selection; accepted slice three atomically requires whole-goal alignment and a successor-free durable handoff.
- Recovery: one-use dispatch tickets prevent duplicate writers, incomplete slices remain active, exact terminal task and claim IDs are required for takeover, and retry exhaustion persists as incomplete or blocked.
- Migration: matching legacy `none` fields initialize idle state without inventing history; a matching incomplete legacy run requires its exact contract and orchestrator identity; conflicting fields fail closed.
- Checkout ownership: version 3 writer locks bind the exact lifecycle generation, writer task, and writer claim for acquisition and assertion, while unversioned, version 1, and version 2 records are release-only and remain exact-owner releasable for migration.
- Scheduler: the installed automation remains paused and its prompt is restricted to lifecycle inspection, exact recovery, and orchestrator dispatch.
- Goal and authorization: the active Architecture Foundation goal, standing owner authorization, frozen product behavior, audit baseline and count, UI checkpoint, criterion states, and external-action boundaries are unchanged.

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
- AF-4, AF-5, and AF-9 partial unit `af-4-featured-media-use-case` accepted on 2026-09-01.
  A screen-neutral featured-Media application use case now coordinates the existing public-Media toggle through an injected persistence port.
  It preserves public-only eligibility, ordered three-work curation, product messages, no-op non-persistence, v1 storage compatibility, startup recovery, visit-only fallback copy, and the current UI callback contract.
  Focused 20-check evidence, full 172-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-pinned-position-use-case` accepted on 2026-09-01.
  Screen-neutral pin and unpin application use cases now coordinate the existing spatial policy through an injected persistence port.
  They preserve current composable non-user eligibility including private Drafts, V1 same-key normalization and recovery, silent startup rewrite behavior, exact product and visit-only fallback messages, no-op non-persistence, current UI callback behavior, and spatial-only meaning.
  Focused 21-check evidence, full 177-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-publish-authored-thought-use-case` accepted on 2026-09-02.
  A screen-neutral publication use case now coordinates the existing authored-Thought lifecycle command, canonical clock timestamp, exact read-merge-write persistence mutation, no-op outcomes, and visit-only fallback through an injected narrow port.
  It preserves irreversible publication, concurrent authored state, exact product and persistence messages, visitor eligibility, selected-node Map refresh, camera behavior, storage compatibility, and private Draft boundaries.
  Repeated focused 58-check evidence, repeated full 183-test repository validation, and a clean second fresh independent review after correcting operational evidence support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-authored-thought-capture-use-case` accepted on 2026-09-02.
  Screen-neutral create, edit, and bridge commands now own generated Draft identity and timestamp, selected-work validation, exact scoped read-merge-write persistence, no-op behavior, visit-only fallback, and stale publication protection.
  The composition root retains dialog flow, graph rebuilding, focus versus selection refresh, and rendering.
  Repeated focused evidence, full 192-test repository validation, and a clean second fresh independent review after correcting a whitespace-only concurrent bridge merge regression support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-authored-thought-startup-recovery-use-case` accepted on 2026-09-02.
  An authored-Thought startup recovery use case now coordinates the existing normalized recovery rewrite through a narrow persistence port.
  It preserves v2-first storage precedence, legacy key retention, read-merge-write state, authoritative merged-state adoption, visit-only write fallback, private Draft boundaries, existing copy, graph rebuilding, and rendering.
  Focused 197-test evidence, full 197-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-selection-startup-recovery-use-case` accepted on 2026-09-02.
  A deliberate-selection startup recovery use case now coordinates the existing canonical same-key rewrite through a narrow persistence port.
  It preserves private selection, ordered known unique three-work eligibility, confirmation rules, the exact storage key and JSON representation, direct write-only recovery semantics, visit-only write fallback, existing chooser copy, Map updates, and rendering.
  Focused 31-check evidence, full 201-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-featured-startup-recovery-use-case` accepted on 2026-09-02.
  A featured-Media startup recovery use case now coordinates the existing canonical same-key rewrite through a narrow persistence port.
  It preserves public-only eligibility, ordered unique three-work curation, seed defaults, explicit empty state, the exact storage key and JSON representation, direct write-only recovery semantics, visit-only failure copy, public and private boundaries, Map state, and rendering.
  Focused 31-check evidence, full 206-test repository validation, and a clean fresh independent review support bounded AF-4, AF-5, and AF-9 evidence.
- AF-4, AF-5, and AF-9 partial unit `af-4-pinned-startup-recovery-use-case` accepted on 2026-09-02.
  A pinned-position startup recovery use case now coordinates the existing canonical same-key V1 rewrite through a narrow persistence port.
  It preserves valid non-user position eligibility including private Drafts, normalization and recovery timing after authored graph recomposition, the exact storage key and JSON representation, direct write-only recovery semantics, silent write failure, spatial-only meaning, Map state, and rendering.
  Focused 23-check evidence, full 210-test repository validation, and a clean second fresh independent review after a documentation-only state correction support bounded AF-4, AF-5, and AF-9 evidence.
- AF-5 and AF-9 partial unit `af-5-prototype-seed-runtime-validation` accepted on 2026-09-02.
  The prototype-seed adapter now runtime-validates the current owner, supported Book and Film catalogue facts, published Thought anchors, deliberate public features, and authored and anchor relationships before returning the same fresh editable graph copy.
  Focused six-test evidence, full 212-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-thought-capture-form-boundary-validation` accepted on 2026-09-02.
  Thought Capture now validates mutable native-DOM form snapshots before calling application code, accepting only supplied work IDs, a distinct bridge anchor, and string form values while retaining existing product validation and every valid callback input.
  Focused seven-test evidence, full 215-test repository validation, and a clean second fresh independent review after correcting executable submit-boundary coverage support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-work-chooser-toggle-boundary-validation` accepted on 2026-09-02.
  Work Chooser now validates mutable DOM-owned catalogue identifiers before calling application code, accepting only supplied string IDs while retaining existing selection policy and every valid callback input.
  Focused five-test evidence, full 217-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-publish-draft-boundary-validation` accepted on 2026-09-02.
  Map now validates a mutable Publish Draft detail-button ID against the current owner-capable projected Draft before calling application code.
  Focused 17-test evidence, full 219-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-featured-media-boundary-validation` accepted on 2026-09-02.
  Map now validates a mutable Featured Media detail-button ID against the current owner-capable projected Media before calling application code.
  Focused 19-test evidence, full 221-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-position-action-boundary-validation` accepted on 2026-09-04.
  Map now validates a mutable position-action detail-button ID against the current owner-projected non-user node and current action eligibility before calling either spatial persistence callback.
  Focused 21-test evidence, full 226-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-edit-draft-boundary-validation` accepted on 2026-09-04.
  Map now validates a mutable Edit Draft detail-button ID against the current owner-capable projected Draft before calling application composition.
  Focused 23-test evidence, full 228-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-connect-draft-boundary-validation` accepted on 2026-09-04.
  Map now validates a mutable Connect another work detail-button ID against the current owner-capable projected single-anchor Draft with confirmed selection before calling application composition.
  Focused 25-test evidence, full 230-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-node-event-target-boundary-validation` accepted on 2026-09-05.
  Map now validates mutable node-event identifiers against active projected non-user nodes before click selection, pointer drag, or keyboard movement changes Map state.
  Focused 28-test evidence, full 233-test repository validation, and a clean second fresh independent review after correcting invalid keyboard propagation support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-focus-target-boundary-validation` accepted on 2026-09-05.
  Map now validates mutable orbit and detail Focus identifiers against active projected targets before focus changes selection, detail rendering, or camera state.
  Focused 31-test evidence, full 236-test repository validation, and a clean fresh independent review support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-edge-state-dom-boundary-validation` accepted on 2026-09-05.
  Map edge-state rendering now validates mutable node identifiers against active projected non-user nodes before graph comparison or class mutation.
  Missing, non-string, stale, user, and non-projected identifiers remain inert, while selected, connected, and muted behavior for valid Media and Thought nodes is preserved.
  Repeated focused 32-check evidence, repeated full 237-test repository validation, and a clean fresh correction review after one test-coverage finding support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-5 and AF-9 partial unit `af-5-map-selection-state-dom-boundary-validation` accepted on 2026-09-05.
  Map selection-state rendering now validates mutable node identifiers against active projected non-user nodes before selected-class or `aria-pressed` mutation.
  Missing, non-string, stale, user, and non-projected identifiers remain inert, while selected and unselected behavior for valid Media and Thought nodes, including clearing selection, is preserved.
  Repeated focused 33-check evidence, repeated full 238-test repository validation, and a clean fresh correction review after one test-coverage finding support bounded AF-5 and AF-9 evidence while both criteria remain open.
- AF-6 and AF-9 partial unit `af-6-product-map-projection-location` accepted on 2026-09-05.
  The existing owner and visitor projection policy now lives in `src/product/map/projection.ts`, and the architecture checker rejects revival of the retired flat path.
  Projection order, deep-copy isolation, Draft and draft-only Media exclusion, dangling-edge removal, public-Media eligibility, owner capability policy, and all valid visible behavior remain unchanged.
  Repeated focused 47-check evidence, repeated full 238-test repository validation, and a clean second fresh independent review after correcting the canonical recovery state support bounded AF-6 and AF-9 evidence while both criteria remain open.
- AF-3 and AF-9 partial unit `af-3-product-map-layout-location` accepted on 2026-09-06.
  Deterministic spatial layout now lives in `src/product/map/layout.ts`, and the architecture checker rejects revival of the retired top-level path.
  Generated coordinates, owner centering, authored-edge influence, collision separation, Map presentation-port behavior, and all valid visible behavior remain unchanged.
  Repeated focused 77-check evidence, repeated full 239-test repository validation, and a clean final fresh independent review after four documentation-state and coverage-wording corrections support bounded AF-3 and AF-9 evidence while both criteria remain open.
- AF-7 unit `af-7-browser-storage-compatibility-contract` accepted on 2026-09-06.
  The combined contract now proves all six persisted key shapes across four state families: selection V1, authored Thought V2, V1, and legacy Draft precedence, featured Media V1, and pinned positions V1.
  It preserves normalized valid state, full authored fields, raw legacy-key retention through recovery, V2-first precedence, V1 and legacy-only fallback, same-key recovery writes, visit-only storage failure, authored-only storage-event reload, and private Draft boundaries.
  Focused 38-check evidence, strict browser and test typechecks, the full repository check, owned-diff whitespace validation, and a clean final fresh independent review support AF-7 acceptance.
- AF-6 with bounded AF-4 and AF-9 support unit `af-6-structural-map-read-model` accepted on 2026-09-06.
  The application now creates owner and visitor Map read models, and the Map UI consumes only the active structural model rather than retaining a full private graph and filtering it at display time.
  Visitor rendering excludes Draft and draft-only Media, generated positions, pins, and temporary-movement metadata while preserving public-node layout from the complete graph.
  Owner-only temporary positions and movement markers remain in composition across visitor preview and restore only on owner return, and mode-only swaps preserve Draft notices.
  Strict typechecks, 61 focused checks, full 248-check repository validation, whitespace validation, and a final fresh independent review with no P0-P3 findings support AF-6 acceptance while AF-4 and AF-9 remain open.
- AF-4 with bounded AF-5 and AF-9 support unit `af-4-map-session-initialization` accepted on 2026-09-06.
  Complete selection, featured-Media, authored-Thought, and pinned-position startup loading and recovery now run through typed application ports and return one screen-neutral Map-session result.
  Composition wires browser adapters, consumes the explicit result, and no longer scripts raw startup loading, recovery, eligibility derivation, or graph assembly.
  Exact load and recovery order, normalized recovery writes, success and visit-only messages, public featured-Media eligibility, private Draft pinnability, authored-Draft recomposition, structural visitor Map reads, persistence shapes, and all valid visible behavior remain unchanged.
  The focused 49-check suite, strict typechecks, architecture check, Vite build, owned-diff whitespace validation, and full 248-check repository validation pass.
  Three fresh independent reviews resolved successful-recovery evidence and documentation-state findings, and the final fresh review found no actionable P0-P3 findings.
  AF-4 remains open for mutation-time capture and bridge eligibility plus render-refresh responsibilities.
- AF-4 with bounded AF-9 support unit `af-4-authored-map-state-transitions` accepted on 2026-09-06.
  Authored save and publication application outcomes now return the authoritative persisted Thought state plus rebuilt Map graph, matching the already explicit reload outcome.
  Composition applies that result and retains dialog lifecycle, focus or selection presentation choice, and Map rendering.
  The unit preserves concurrent merged state, no-op and visit-only outcomes, exact messages, storage representations, private Draft boundaries, public projection eligibility, and all valid visible behavior.
  The repository quality gate now scopes every criterion parser to the authoritative Goal progress table.
  Strict typechecks, 29 focused checks, the full 249-check repository validation, whitespace validation, and a final fresh independent review with no actionable P0-P3 findings support bounded AF-4 and AF-9 evidence.
  AF-4 remains open for mutation-time capture and bridge eligibility plus rendering responsibility.

- AF-4 with bounded AF-9 support unit `af-4-authored-capture-preparation` accepted on 2026-09-06.
  The new application query owns the complete creation, editing including existing bridges, and bridge preparation responsibility.
  It eliminates composition-owned capture availability and joins between current authored Drafts, private selection, and catalogue facts.
  Observed evidence preserves confirmed create and bridge gating, editing after selection becomes unconfirmed, existing anchors, exact candidate order, unavailable records, and isolated opening snapshots.
  The two read-only explorers independently audited workflow ownership and capture contracts.
  All 48 focused checks, strict browser and test typechecks, architecture enforcement, Vite build, whitespace validation, and the full 258-test repository check pass.
  Fresh read-only `gpt-5.6-sol` high-reasoning review found no actionable P0-P3 findings and confirmed that no AF-4 workflow blocker remains.
  AF-4 is accepted based on this complete preparation boundary plus the previously accepted startup, command, recovery, reload, and structural Map read-model evidence.
  Modal lifecycle, owner presentation, focus versus selection, Map rendering, display-title input, and spatial eligibility inputs remain appropriate outer wiring.
  AF-9 remains open for the complete invariant-to-test inventory, remaining product-fact migration coverage, and final rendered evidence.
  Exact files are the new application query and mirrored tests, composition root and its source-contract tests, and this implementation state.
  `CURRENT.md` is synchronized with no final diff.
  The unit's local commit SHA is recorded in its post-commit temporary handoff; no push or external publication is authorized.
  UI checkpoint count remains 0, and the completion-audit count advances once to 2.
  No owner decision or unresolved assumption was introduced; save-time bridge policy, form validation, persistence, and valid visible behavior remain frozen.
  Acceptance is under standing owner authorization after focused and full validation plus clean independent review.
  The handoff records `No next unit selected`.

- AF-5 with bounded AF-9 support unit `af-5-native-dom-event-boundaries` accepts the final native-DOM boundary inventory.
  Map wheel, pointer, keyboard, and browser geometry values are finite, identity, and literal-command validated before camera, gesture, placement, CSS, or callback work.
  Thought Capture validates live radio, text, and modal keyboard input before dialog state changes.
  Work Chooser validates live search and modal keyboard input before presentation state changes.
  Existing Map IDs and form submit snapshots remain the application-callback boundaries.
  Invalid input is inert and valid mouse, touch, keyboard, selection, capture, focus, zoom, pan, drag, pin, publish, feature, owner, and visitor behavior remains covered by the focused suite.
  Design Read: preservation of the native-DOM Editorial Constellation for private Thought capture and public or owner Map interaction.
  Design dials remain unchanged from the accepted baseline.
  The preservation audit found no renderer, CSS, token, copy, focus-trap, modal-inertness, responsive, theme, or interaction-design change.
  Pre-flight is preservation mode with native DOM and CSS retained; landing-page layout, hero, asset, and motion redesign checks are inapplicable.
  AF-5 is accepted by this executable inventory plus the prior accepted effect-port evidence.
  AF-9 receives the matching DOM proof but remains open for its final cross-criterion invariant inventory and rendered AF-8 or AF-10 evidence.

## Administratively closed run log

None.
A blocked unit may enter this log only after a restored, validated baseline and
explicit owner direction when closure would discard material work.
Administrative closure does not create goal evidence.
