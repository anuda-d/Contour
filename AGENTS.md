# Agent guidance

These instructions govern contributors and coding agents working in this
repository. Product direction belongs to the owner.

## Before working

- Start with `docs/plans/CURRENT.md`; it is the compact operational index.
- Before spawning subagents or changing the repository, follow the no-overlap gate in `docs/main/DEVELOPMENT_LOOP.md` and claim checkout ownership with `python3 scripts/development_loop_lock.py acquire`.
- The ownership command uses `CODEX_THREAD_ID` automatically.
  A task must assert ownership before each later mutation phase and release it at every terminal state or immediately before a relay handoff.
- Confirm that exactly one owner-approved goal is active.
- Confirm that the active goal has standing owner authorization and that no
  owner decision, pause, unsafe baseline, or overlapping run blocks work.
- Confirm that this is a fresh implementation chat for the selected or resumed
  work unit and that this chat has not completed another unit.
- Read the latest temporary handoff when one exists, but treat the active goal
  and implementation state as authoritative.
- Standing authorization permits successive bounded units only inside the
  approved goal. It does not authorize a new goal or broader product direction.
- Read the active goal and implementation state, then locate only enough code
  and tests to select one smallest useful goal gap.
- Read only the product specification relevant to that selected task.
- Treat `docs/05-open-questions.md` as owner decision boundaries, not a backlog.
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

- State the criterion, intended behavior, and evidence before editing.
- Use one to three read-only explorer subagents for independent investigation
  before implementation. They return concise evidence and never edit files.
- For Map presentation, interaction, visibility, responsive layout, design
  tokens, or reusable frontend foundations, use the `design-taste-frontend`
  skill. Record its Design Read, design dials, relevant redesign audit, and
  applicable pre-flight results. Apply its product-UI rules contextually rather
  than mechanically importing landing-page patterns.
- The orchestrator is the sole implementation writer and owns selection,
  integration, validation, and completion judgment.
- Prefer the smallest end-to-end behavior or directly testable architecture
  claim authorized by the active goal.
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
- Work remains one bounded unit at a time. Do not create a future task queue.
- One implementation chat owns at most one work unit.
- After an accepted commit or another terminal unit state, write the compact
  redacted temporary handoff required by the development loop, record `No next
  unit selected`, and stop the chat.
- Select or continue the next unit only in a newly created fresh chat.
- Independent review is required. A reviewer reports findings but does not make
  product decisions.
- Record candidate evidence before independent review so the reviewer inspects
  the claim as well as the implementation. Focused and repository validation
  plus a clean fresh independent review permit local acceptance and commit;
  full rendered click-through evidence is required only when the visual
  checkpoint is due.
- After a unit is committed, hand off and stop.
  A fresh chat may select the next smallest justified gap inside the same goal
  only while standing authorization remains active.
- During an authorized scheduled window, an accepted unit may create exactly one
  fresh successor task in the same project after its handoff.
  The current task still stops and never selects the successor's unit.
- For Architecture Foundation, new units may start daily from 18:00 until 23:00
  America/Toronto.
  An accepted task finishing before 23:00 relays immediately; at or after 23:00
  it does not relay.
- Hourly scheduled tasks are recovery starts and must no-op when another live
  project implementation task owns the work.
  With no live owner, they resume exactly a matching recorded current and
  incomplete run; conflicting fields stop safely.
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

- The sole-writer orchestrator uses `gpt-5.6-terra` with high reasoning.
- Explorer subagents use `gpt-5.6-terra` with high reasoning and are read-only.
- Fresh independent review uses `gpt-5.6-sol` with high reasoning.
- Review agents are read-only and must return findings to the orchestrator.

## Communicating results

- Lead with what visibly changed and what was actually observed.
- Separate evidence from interpretation.
- State validation and independent-review results plainly.
- Call out forced prototype behavior, special cases, risks, and unresolved
  assumptions.
- At an owner-decision gate, ask only for the smallest product, visual, scope,
  architecture, pause, or new-goal decision needed to continue.
- Do not imply that a prototype proves demand, retention, or product viability.
