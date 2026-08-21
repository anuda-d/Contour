# Agent Guidance

These instructions govern contributors and coding agents working in this
repository. Product direction belongs to the owner.

## Before Working

- Start with `docs/plans/CURRENT.md`; it is the compact operational index.
- Confirm that exactly one owner-approved goal is active.
- Confirm explicit owner authorization for exactly one bounded run before
  reading implementation or making implementation changes. That authorization
  permits the orchestrator to select one smallest gap inside the approved goal;
  it does not authorize work outside the goal.
- Read the active goal and implementation state, then locate only enough code
  and tests to select one smallest useful goal gap.
- Read only the product specification relevant to that selected task.
- Treat `docs/05-open-questions.md` as owner decision boundaries, not a backlog.
- If owner review is pending, do not select or begin another work unit.

## Product Direction

- This is a social identity platform centered on a person's displayed Thought
  Map.
- The stage creates desire; the mirror gives the performance substance.
- The User is the center, Thoughts are authored expression, Media is grounding,
  and the Map is the identity artifact.
- Build the graph and the surrounding user experience in tandem.
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
- Render every affected visual surface at representative desktop and mobile
  sizes.
- Click through every affected user flow through the visible interface.
- Inspect layout, state transitions, responsive behavior, and console output.
- If the result cannot be seen or evaluated, say so and do not claim completion.
- Use a fresh independent read-only review agent after implementation and after
  every material correction.

## Owner-Gated Development Loop

- Use `docs/main/DEVELOPMENT_LOOP.md` as the complete operating contract.
- One owner authorization permits exactly one bounded work unit.
- Independent review is required but cannot approve work.
- Record candidate evidence before independent review so the reviewer inspects
  the claim as well as the implementation. After review, append only the
  factual review result and stop without committing at **AWAITING OWNER
  APPROVAL**.
- The owner is the final reviewer.
- Only explicit owner approval permits the coherent work unit to be committed.
- Unless the owner explicitly pauses, stops, or approves only, approval grants
  exactly one authorization for the orchestrator to select and complete the
  next bounded work unit inside the approved goal.
- Never continue autonomously across an owner gate.
- Never select, broaden, or replace the active goal.
- Never create a future task queue.
- Stop when the goal is complete or continuing requires an owner decision.

## Model Routing

- Orchestration and implementation use `gpt-5.6-terra` with high reasoning.
- Fresh independent review uses `gpt-5.6-sol` with high reasoning.
- Review agents are read-only and must return findings to the orchestrator.

## Communicating Results

- Lead with what visibly changed and what was actually observed.
- Separate evidence from interpretation.
- State validation and independent-review results plainly.
- Call out forced prototype behavior, special cases, risks, and unresolved
  assumptions.
- At the owner gate, clearly ask for approval, changes, pause, or rejection.
- Do not imply that a prototype proves demand, retention, or product viability.
