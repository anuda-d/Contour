# 05 Person Profile Identity Surface

## Goal
Build the profile surface as the MVP's primary identity reward.

## Done Means
- A profile above the fold shows the reader's handle or name, identity line, three defining books, reactions, one or two Thought Collections, recurring ideas, one strong connection, and optional unfinished book.
- The page feels curated rather than like an inventory shelf.
- The same component or screen can render seeded people and the current prototype user.

## Scope
- Render profile header with name, handle, and identity line.
- Render exactly three defining books as a curated identity set.
- Show taste reactions attached to books.
- Show one or two Thought Collections with title and thesis.
- Show recurring ideas or themes as text labels.
- Show one strong book connection with idea label and explanation.
- Show optional unfinished shelf entry only when it adds texture.

## Out Of Scope
- Profile editing.
- Follower lists.
- Reading goals.
- Complete reading history.
- Private/public settings UI.

## Product Guardrails
- Do not make the profile look like a Goodreads shelf or productivity dashboard.
- Prioritize "what kind of reader is this?" over "how many books did this person finish?"
- Keep unfinished books humanizing, not shameful.

## User Flow
The user opens a profile and quickly understands the reader's taste, recurring ideas, and how books shape their persona.

## Data / Interface Expectations
- Profile view consumes User plus related Book, Reaction, Connection, Collection, and Unfinished Shelf records.
- Missing optional data should collapse gracefully, but missing defining books should produce a clear setup state.
- Profile share URL behavior is implemented later; this slice only needs profile rendering and navigation.

## TDD Guidance
Presentation-heavy. If using a profile view-model seam, test:
- `buildProfileIdentitySurface returns the required above-the-fold sections for a complete user`.

## Acceptance Checks
- Above the fold contains all MVP-required identity elements for seeded profiles.
- Profile does not foreground review counts, follower counts, streaks, XP, or reading goals.
- The current prototype user's profile renders even before user-created actions exist.

## Dependencies
- `01_seeded_content_foundation.md`
- `04_people_browse_seeded_profiles.md`

