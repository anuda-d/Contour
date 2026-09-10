# Agent guidance

These instructions govern contributors and coding agents working in this
repository. Product direction belongs to the owner.

## Before working

- Start with `docs/plans/CURRENT.md`; it is the compact operational index.
- Read-only inspection and read-only explorer subagents do not require checkout ownership.
- Orchestrators manage lifecycle state and never modify the checkout.
- Every slice uses one fresh writer task as its sole repository modifier.
- Claim the persisted writer ticket under the fresh task identity, then immediately before the first repository mutation follow the compact no-overlap gate in `docs/main/DEVELOPMENT_LOOP.md` and run `python3 scripts/development_loop_lock.py acquire`.
- Retain the returned claim ID and pass it to every `assert-owner` and `release` operation.
- After a resumed turn, assert ownership before the next repository mutation.
  Assert again before commit, commit the reviewed tree, and release checkout ownership before lifecycle finalization.
- A task that has reported a terminal state must never resume repository work under that task's prior claim.
- Confirm that exactly one owner-approved goal is active.
- Confirm that the active goal has standing owner authorization and that no
  owner decision, pause, unsafe baseline, or overlapping run blocks work.
- Confirm that the orchestrator generation and writer ticket in the persisted
  loop state match this task's role and claim.
- Read the latest temporary handoff when one exists, but treat the active goal
  and implementation state as authoritative.
- Standing authorization permits successive bounded units only inside the
  approved goal. It does not authorize a new goal or broader product direction.
- Read the active goal and implementation state, complete any due completion audit, then locate enough code and tests to select one coherent responsibility that eliminates a concrete acceptance gap.
- Read only the product specification relevant to that selected task.
- Treat unresolved product questions as owner decision boundaries, not a backlog.
- If an owner decision is pending, do not select or begin another work unit.

## Product direction

- The product is Contour, an intentional human-to-human discovery platform for
  Books and Films.
- The primary outcome is finding an unfamiliar work through understandable
  human evidence: a Thought, authored connection, personal Theme region, person,
  or Map.
- The Map is a layered public taste and authorship artifact that supports
  discovery. It may begin with deliberately Liked Media and becomes richer
  through authored Thoughts and connections.
- Discovery creates immediate utility; identity accumulates through
  participation. Do not require Map-building labor before proving value.
- Build visible end-to-end discovery behavior and only the application and data
  substrate required to evaluate it. Architecture without observable product
  behavior is not progress.
- The active Architecture Foundation goal is the owner-approved exception to
  the preceding rule.
  During that goal, enforceable architecture, migration, compatibility, and
  test evidence are progress while current visible behavior and design remain
  frozen.
- Keep the Map generated but shapeable. Do not present a blank manual canvas.
- Drafts belong visibly to the private owner Map and never to visitor mode.
- Public Thoughts require a Book or Film anchor.
- Free-form expression is allowed; do not force ratings, verdicts, summaries,
  or a conventional review template.
- A public Like, private Save, private Bookmark, personalized Vote, and authored
  Thought are distinct actions. Passive behavior may personalize discovery but
  must never silently change the public Map.
- Do not introduce canonical Theme nodes or manual Theme filing. Personal
  Themes emerge from coherent Map regions; the system names them, and the
  owner can rename, hide, or dismiss them.
- Recommendations may use explicit and behavioral signals, but must expose
  understandable human evidence when available and never reveal another
  person's private activity.
- Do not introduce public popularity scores, global truth-ranking Votes,
  consumption achievements, or a primary engagement-ranked infinite feed.
- AI may assist retrieval, ranking, clustering, or generated Theme naming, but
  may not impersonate a User or publish a Thought as human authorship.

## While implementing

- State the criterion, responsibility, acceptance gap to eliminate, completion condition, and evidence before editing.
- Use one to three read-only explorer subagents for independent investigation
  before implementation. They return concise evidence and never edit files.
- For Map presentation, interaction, visibility, responsive layout, design
  tokens, or reusable frontend foundations, use the `design-taste-frontend`
  skill. Record its Design Read, design dials, relevant redesign audit, and
  applicable pre-flight results. Apply its product-UI rules contextually rather
  than mechanically importing landing-page patterns.
- The orchestrator owns selection, frozen slice contracts, acceptance, and
  generation alignment, but it never modifies the repository checkout.
- The fresh writer owns one slice, is its sole repository modifier, and manages
  its read-only explorer and reviewer subagents.
- The reviewer records its verdict through the lifecycle tool under its own fresh task identity and never modifies the repository checkout.
- Complete one bounded end-to-end behavior or architectural responsibility authorized by the active goal.
- Group related entry paths, validators, adapters, helpers, imports, and tests needed to close that responsibility in the same unit.
  A single handler, wrapper, or file move is a standalone unit only when it closes a concrete acceptance gap or is an indispensable prerequisite justified by dependency or preservation risk.
- Refresh the touched criteria's remaining blockers at acceptance.
  Audit all open criteria before the next selection when no audit exists or three implementation units have been accepted since the audit, following `docs/main/DEVELOPMENT_LOOP.md`.
- Keep spatial graph movement distinct from semantic authorship.
- Preserve clear private Draft and public Published boundaries.
- Avoid speculative infrastructure for later social or production goals.
- Explain assumptions that materially affect behavior.
- Do not settle product, visual, scope, or lasting architecture questions
  without owner approval.
- Preserve unrelated user changes and never absorb them into a loop commit.

## Validation requirements

- Run focused checks first and `./scripts/check.sh` before review.
- Full rendered desktop/mobile click-through validation is a checkpoint, not a
  per-unit gate. Run it on every fifth UI implementation unit before that unit
  is accepted, and once more before goal completion.
- Between checkpoints, validate UI changes through focused tests, source and
  design-system inspection, and `./scripts/check.sh`. A narrow rendered smoke
  check may be used to diagnose a specific risk, but a complete click-through
  is not required for unit acceptance.
- At a visual checkpoint, exercise the accumulated affected flows, responsive
  behavior, supported color modes, focus and touch interaction, and console.
- Use a fresh independent read-only review agent after implementation and after
  every material correction.

## Goal-bounded autonomous development loop

- Use `docs/main/DEVELOPMENT_LOOP.md` as the complete operating contract.
- Standing authorization exists only when `docs/plans/CURRENT.md` records one
  active owner-approved goal with `Owner authorization: standing`. If no active
  goal is recorded, stop before implementation.
- One orchestrator generation manages at most three sequential accepted slices.
- Each slice has one immutable completion contract and one fresh writer task.
- A writer handles at most one slice and stops after returning its compact result.
- Only a slice with matching focused and full validation, clean fresh review,
  and an exactly identified commit counts toward the generation limit.
- An incomplete slice remains the active slice and is recovered without
  replacement or contract weakening.
- A pause or block fences all writer and reviewer lifecycle transitions while preserving the exact active slice.
- Independent review is required. A reviewer reports findings but does not make
  product decisions.
- Orchestrator, writer, and reviewer task identities are globally single-use across lifecycle roles.
- Independent review checks that the responsibility's completion condition is met and the remaining acceptance blockers are explicit, as well as implementation correctness.
- Record candidate evidence before independent review so the reviewer inspects
  the claim as well as the implementation. Focused and repository validation
  plus a clean fresh independent review permit local acceptance and commit;
  full rendered click-through evidence is required only when the visual
  checkpoint is due.
- After an accepted slice, its writer stops and the same orchestrator may select
  the next slice while fewer than three slices have been accepted.
- At three accepted slices, or an earlier natural goal boundary, the orchestrator
  performs whole-goal alignment, writes a compact handoff with `No next slice
  selected`, and hands control to a fresh orchestrator.
- For Architecture Foundation, new units may start daily from 18:00 until 23:00
  America/Toronto.
  An orchestrator may dispatch another slice before 23:00 while its generation
  remains below the three-slice limit.
- Hourly scheduled tasks are liveness and recovery triggers only.
  They inspect persisted lifecycle state and may dispatch or recover its exact
  orchestrator, but they never select a slice, implement, review, or commit.
- A scheduled recovery persists its exact terminal-owner intent and one-use ticket before creating the recovery task.
- No human approval is required between clean units inside the active goal.
  Owner-decision, safety, overlap, review, validation, and external-action gates
  remain in force.
- The owner remains the decision-maker for new goals and unresolved material
  product, visual, scope, or lasting architecture choices. Stop at **NEEDS
  OWNER DECISION** when one is required.
- Never select, broaden, or replace the active goal.
- Never push, merge, deploy, publish, destructively clean up, or absorb
  unrelated user work without explicit direction.
- Stop when the goal is complete, the owner pauses, or continuing requires an
  owner decision or unsafe external action.

## Model routing

- The lifecycle orchestrator uses `gpt-5.6-terra` with high reasoning.
- Fresh slice writers use `gpt-5.6-terra` with high reasoning.
- Explorer subagents are delegated by the writer, use `gpt-5.6-terra` with high reasoning, and are read-only.
- Fresh independent review uses `gpt-5.6-sol` with high reasoning.
- Review agents are read-only and must return findings to the slice writer.

## Communicating results

- Lead with what visibly changed and what was actually observed.
- Separate evidence from interpretation.
- State validation and independent-review results plainly.
- Call out forced prototype behavior, special cases, risks, and unresolved
  assumptions.
- At an owner-decision gate, ask only for the smallest product, visual, scope,
  architecture, pause, or new-goal decision needed to continue.
- Do not imply that a prototype proves demand, retention, or product viability.
