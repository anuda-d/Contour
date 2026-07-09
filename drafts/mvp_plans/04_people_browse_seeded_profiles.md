# 04 People Browse Seeded Profiles

## Goal
Build the People browse surface so users discover aspirational reader identities before being asked to create.

## Done Means
- The People tab shows seeded profile previews.
- Each preview communicates taste and persona within a few seconds.
- Selecting a person opens that person's profile view or detail route.

## Scope
- Show at least 6 seeded people.
- Each preview includes display name or handle, identity line, three defining books, one reaction or connection, and one visible theme or collection.
- Sort seeded people intentionally, not alphabetically by default: strongest aspirational examples first.
- Include enough visual hierarchy that defining books and identity line are immediately scannable.

## Out Of Scope
- Follow buttons.
- Follower counts.
- Infinite scrolling.
- People search.
- Recommendation algorithm.

## Product Guardrails
- People previews should make readers feel interesting, not merely productive.
- Avoid generic bios like "loves books." Identity lines should express taste.
- Do not show popularity metrics as the main reason to click someone.

## User Flow
The user opens People, scans several reader previews, notices one whose taste feels aspirational, and opens the profile.

## Data / Interface Expectations
- People browse consumes the User records and related Book, Reaction, Connection, and Collection records.
- Preview composition should tolerate a missing optional unfinished shelf, but not missing defining books.
- Person detail links use stable user ids or handles.

## TDD Guidance
This is presentation-heavy. If there is a view-model seam, test that `buildPersonPreview` returns the required preview fields from seeded user data.

## Acceptance Checks
- Every preview shows exactly three defining books.
- Every preview includes at least one taste signal beyond book titles.
- Clicking a preview reaches a profile surface for that user.
- The screen does not contain feed language, leaderboard ranking, or follower-count emphasis.

## Dependencies
- `01_seeded_content_foundation.md`
- `03_primary_navigation_shell.md`

