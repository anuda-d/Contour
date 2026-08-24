# Agent Guidance

These instructions govern contributors and coding agents working in this
repository. Product direction belongs to the owner.

## Before Working

- Start with `docs/plans/CURRENT.md`; it is the compact operational index.
- Confirm that exactly one owner-approved goal is active.
- Confirm that the active goal has standing owner authorization and that no
  owner decision, pause, unsafe baseline, or overlapping run blocks work.
- Standing authorization permits successive bounded units only inside the
  approved goal. It does not authorize a new goal or broader product direction.
- Read the active goal and implementation state, then locate only enough code
  and tests to select one smallest useful goal gap.
- Read only the product specification relevant to that selected task.
- Treat `docs/05-open-questions.md` as owner decision boundaries, not a backlog.
- If an owner decision is pending, do not select or begin another work unit.

## Product Direction

- This is a social identity platform centered on a person's displayed Thought
  Map.
- The stage creates desire; the mirror gives the performance substance.
- The User is the center, Thoughts are authored expression, Media is grounding,
  and the Map is the identity artifact.
- Build the graph and the surrounding user experience in tandem.
- The first implementation foundation is the visible, interactive Map. Until
  that foundation is accepted through full validation, clean fresh independent
  review, and local commit under standing authorization, do not select profile,
  onboarding, publishing, or production-infrastructure work.
- Build only the thin application and data substrate required by the current
  visible graph behavior. An architecture-only layer is not progress.
- Keep the Map generated but shapeable. Do not present a blank manual canvas.
- Drafts belong visibly to the private owner Map and never to visitor mode.
- Public Thoughts require a Book or Film anchor.
- Do not introduce ratings, conventional reviews, consumption statistics,
  popularity scores, or a primary engagement-ranked feed.
- Do not introduce Theme nodes or manual Theme filing. Themes may later emerge
  from Map regions after the core artifact is proven.
- AI may assist future private workflows but may not author or publish the
  User's identity.

## While Implementing

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
- Prefer the smallest end-to-end behavior that can be seen and evaluated.
- Keep spatial graph movement distinct from semantic authorship.
- Preserve clear private Draft and public Published boundaries.
- Avoid speculative infrastructure for later social or production goals.
- Explain assumptions that materially affect behavior.
- Do not settle product, visual, scope, or lasting architecture questions
  without owner approval.
- Preserve unrelated user changes and never absorb them into a loop commit.

## Validation

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

## Goal-Bounded Autonomous Development Loop

- Use `docs/main/DEVELOPMENT_LOOP.md` as the complete operating contract.
- The owner has granted standing authorization to advance the active goal
  through successive bounded work units until the goal is complete.
- Work remains one bounded unit at a time. Do not create a future task queue.
- Independent review is required. A reviewer reports findings but does not make
  product decisions.
- Record candidate evidence before independent review so the reviewer inspects
  the claim as well as the implementation. Focused and repository validation
  plus a clean fresh independent review permit local acceptance and commit;
  full rendered click-through evidence is required only when the visual
  checkpoint is due.
- After a unit is committed, immediately re-orient and select the next smallest
  justified gap inside the same goal.
- The owner remains the decision-maker for new goals and unresolved material
  product, visual, scope, or lasting architecture choices. Stop at **NEEDS
  OWNER DECISION** when one is required.
- Never select, broaden, or replace the active goal.
- Never push, merge, deploy, publish, destructively clean up, or absorb
  unrelated user work without explicit direction.
- Stop when the goal is complete, the owner pauses, or continuing requires an
  owner decision or unsafe external action.

## Model Routing

- The sole-writer orchestrator uses `gpt-5.6-terra` with high reasoning.
- Explorer subagents use `gpt-5.6-terra` with high reasoning and are read-only.
- Fresh independent review uses `gpt-5.6-sol` with high reasoning.
- Review agents are read-only and must return findings to the orchestrator.

## Communicating Results

- Lead with what visibly changed and what was actually observed.
- Separate evidence from interpretation.
- State validation and independent-review results plainly.
- Call out forced prototype behavior, special cases, risks, and unresolved
  assumptions.
- At an owner-decision gate, ask only for the smallest product, visual, scope,
  architecture, pause, or new-goal decision needed to continue.
- Do not imply that a prototype proves demand, retention, or product viability.
