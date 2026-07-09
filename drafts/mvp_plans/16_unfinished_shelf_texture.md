# 16 Unfinished Shelf Texture

## Goal
Add unfinished books as a humanizing profile layer rather than a failure state.

## Done Means
- Profiles can show optional unfinished shelf entries.
- A current user can mark a book unfinished with a reason and optional short note.
- Unfinished entries add texture without becoming a productivity dashboard.

## Scope
- Show seeded unfinished shelf entries on relevant profiles.
- Add a minimal current-user flow to mark a book unfinished from book detail.
- Support reason labels such as `Not ready for it yet`, `Wrong moment`, `Respected but could not continue`, `Still think about it`, and `Want to return later`.
- Allow optional short note.
- Show at most one or two unfinished entries prominently on the profile.

## Out Of Scope
- Reading progress tracking.
- Page counts.
- Reminders.
- Completion goals.
- Shame language or failure states.

## Product Guardrails
- Not finishing can reveal timing, mood, maturity, difficulty, taste mismatch, or future intent.
- Unfinished entries should make profiles feel human.
- Do not punish or gamify abandoned books.

## User Flow
The user marks a book as `Not ready for it yet`, adds a short note, and later sees it as texture on their profile.

## Data / Interface Expectations
- Public seam to confirm before implementation: `markBookUnfinished(userId, bookId, reason, note, visibility)`.
- The profile read seam includes public unfinished entries.
- A book can have both a reaction and unfinished entry if the product copy supports that nuance.

## TDD Guidance
Use `$tdd` if implementing write behavior.

First red test:
- `markBookUnfinished saves a reasoned unfinished entry that appears on the user's profile`.

Additional behavior tests, one at a time:
- Reject unknown reason labels.
- Keep note optional.
- Preserve existing reaction data for the same book.

## Acceptance Checks
- Marking a book unfinished changes the user's profile.
- The copy does not imply failure.
- The profile still prioritizes defining books and reactions over unfinished entries.

## Dependencies
- `07_book_detail_social_context.md`
- `09_profile_updates_from_reactions.md`

