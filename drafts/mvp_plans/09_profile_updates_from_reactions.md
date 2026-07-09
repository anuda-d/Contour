# 09 Profile Updates From Reactions

## Goal
Make each saved reaction visibly improve the current user's profile.

## Done Means
- After a user reacts to books, their profile reflects those reactions without manual refresh work by the user.
- The profile can identify candidate defining books and recurring ideas from current user activity.
- The profile feels meaningfully more like the user after three reactions.

## Scope
- Show recent or meaningful reactions on the current user's profile.
- If the user has fewer than three selected defining books, use reacted books as candidates for the profile builder.
- Surface reaction labels next to the relevant book cards.
- Show a lightweight "profile is taking shape" state when the user has fewer than three reactions.
- Preserve seeded profile content while allowing current user actions to override or augment it.

## Out Of Scope
- Complex profile scoring.
- AI-generated identity summaries.
- Automatic permanent selection of defining books without user confirmation.
- Reading-history dashboards.

## Product Guardrails
- Every meaningful action should improve the public intellectual profile.
- Do not turn progress into XP, levels, streaks, or points.
- Avoid implying the app knows the user's identity better than they do.

## User Flow
The user reacts to three books, opens Profile, and sees those books and labels shaping their public reading identity.

## Data / Interface Expectations
- Public seam to confirm before implementation: `getProfileForUser(userId)` after reaction writes.
- Profile read output includes reaction-derived sections or candidate slots.
- Reactions are observed through the same public read path the UI uses, not by querying internal storage in tests.

## TDD Guidance
Use `$tdd`.

First red test:
- `getProfileForUser includes newly saved book reactions as visible profile taste signals`.

Additional behavior tests, one at a time:
- With fewer than three reactions, profile exposes an incomplete-but-useful setup state.
- With three reactions, profile exposes three candidate books for defining-book selection.

## Acceptance Checks
- Reacting to a book changes the profile surface.
- The profile does not show points, achievements, or productivity metrics.
- The user can understand which book actions made the profile richer.

## Dependencies
- `08_reaction_catalog_and_reaction_capture.md`
- `05_person_profile_identity_surface.md`

