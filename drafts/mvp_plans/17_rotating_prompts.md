# 17 Rotating Prompts

## Goal
Add small rotating prompts that make the next identity-building action tiny, obvious, and rewarding.

## Done Means
- The app can show one prompt at a time from seeded prompt content.
- Prompts route users into relevant actions such as reacting, connecting, or marking unfinished.
- Prompt rotation feels varied without using streaks, XP, or notification pressure.

## Scope
- Use MVP prompt examples such as:
  - Add a book you respected but did not love.
  - Add a book you wanted to be the kind of person who reads.
  - Connect two books about ambition.
  - Mark a book you were not ready for.
  - Add a book that changed your taste.
  - Add a book you hated productively.
- Display prompts on Profile and optionally onboarding or home surfaces.
- Each prompt has a target action type: reaction, connection, defining book, or unfinished entry.
- Track dismissed or completed prompts for the current session or prototype user.

## Out Of Scope
- Push notifications.
- Streaks.
- XP.
- Personalized ML prompt ranking.
- Daily obligation mechanics.

## Product Guardrails
- The useful behavior lesson is tiny next steps, not punishment or gamification.
- Prompts should deepen identity and reflection.
- Avoid pressure language.

## User Flow
The user sees `Add a book you respected but did not love`, taps it, selects a book, adds the reaction, and sees the profile improve.

## Data / Interface Expectations
- Public seam to confirm before implementation: `getNextPrompt(userId, context)` and `completePrompt(userId, promptId)`.
- Prompt records include id, display text, action type, optional suggested reaction label, and status.
- Rotation should not repeat a completed prompt immediately.

## TDD Guidance
Use `$tdd`.

First red test:
- `getNextPrompt returns an incomplete prompt and skips prompts the user has completed`.

Additional behavior tests, one at a time:
- Completing a prompt prevents immediate repeat.
- Prompt action type maps to the expected destination flow.
- If all prompts are completed, return a calm empty state rather than pressure copy.

## Acceptance Checks
- At least one prompt routes to reaction capture.
- At least one prompt routes to connection creation.
- Prompt UI contains no streak, XP, leaderboard, or punishment language.

## Dependencies
- `08_reaction_catalog_and_reaction_capture.md`
- `12_connection_creation_flow.md`
- `16_unfinished_shelf_texture.md`

