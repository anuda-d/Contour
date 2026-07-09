# 11 Three Book Profile Builder

## Goal
Let the current user select exactly three defining books as the core curated identity signal on their profile.

## Done Means
- The user can select or add three books.
- The profile shows those three books as defining books.
- The flow forces curation rather than turning into a shelf.

## Scope
- Present suggested books from seeded content, onboarding choices, and reacted books.
- Allow the user to search within seeded books or add a minimal custom book if the chosen title is missing.
- Require exactly three defining books to complete this step.
- Allow replacing a selected book before confirming.
- Save the selected three to the current user profile.

## Out Of Scope
- Full book database integration.
- Bulk import from Goodreads or StoryGraph.
- Large shelves.
- Reading status management beyond optional unfinished entry handled later.

## Product Guardrails
- Three defining books are a taste constraint, not a storage feature.
- The UI should ask "what represents you?" rather than "what have you read?"
- Keep the step fast enough that it does not feel like catalog maintenance.

## User Flow
The user chooses three books that define their taste, confirms the selection, and sees them appear on their profile.

## Data / Interface Expectations
- Public seam to confirm before implementation: `setDefiningBooks(userId, bookIds)`.
- The command requires exactly three distinct book ids.
- Custom minimal books, if allowed, must create title and author fields before selection.

## TDD Guidance
Use `$tdd`.

First red test:
- `setDefiningBooks saves exactly three distinct books as the user's defining books`.

Additional behavior tests, one at a time:
- Reject fewer than three books.
- Reject more than three books.
- Reject duplicate book ids.

## Acceptance Checks
- User cannot finish this step with 0, 1, 2, or 4 books.
- Confirmed books immediately appear in the profile identity surface.
- The screen does not become a general bookshelf.

## Dependencies
- `09_profile_updates_from_reactions.md`
- `10_onboarding_discovery_first.md`

