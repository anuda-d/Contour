# 08 Reaction Catalog And Reaction Capture

## Goal
Let a user react to a book with an expressive identity label, optional rating, and optional short note.

## Done Means
- Users can choose a reaction label for a book.
- The reaction is saved to the current prototype user.
- The book and profile surfaces can display the new reaction.

## Scope
- Provide a reaction catalog with MVP labels such as `Changed me`, `Respected, not loved`, `Beautiful but hollow`, `Embarrassingly formative`, `Could not finish, still think about it`, `Overrated but necessary`, `Too early for me`, `Wanted to be this kind of person`, `Hated it productively`, and `Emotionally important`.
- Add a compact reaction capture flow from book detail and any profile builder flow that has a selected book.
- Allow optional star or numeric rating only as secondary input.
- Allow optional short note with a strict compact length appropriate for profile display.
- Save one current reaction per user-book pair unless the implementation deliberately supports edit history later.

## Out Of Scope
- Long-form review editor.
- AI note writing.
- Public comments on reactions.
- Reaction analytics.

## Product Guardrails
- Reaction labels should answer "what does this book say about the reader?" not only "was it good?"
- The flow must be lighter than writing a review.
- Ratings must not visually overpower reaction labels.

## User Flow
The user opens a book, chooses `Respected, not loved`, optionally adds a short note, saves, and sees that reaction attached to the book and their profile.

## Data / Interface Expectations
- Public seam to confirm before implementation: `reactToBook(userId, bookId, reactionInput)` or equivalent command boundary.
- Reaction input includes label, optional rating, optional note, and visibility.
- The command returns the saved reaction or a result that lets the UI refresh through public read interfaces.

## TDD Guidance
Use `$tdd`.

First red test:
- `reactToBook saves an expressive reaction for a user-book pair and makes it retrievable through the public reaction read seam`.

Additional behavior tests, one at a time:
- Reject unknown reaction labels.
- Replace or update the existing user-book reaction according to the chosen MVP rule.
- Keep rating optional.

## Acceptance Checks
- A user can complete the flow in under one minute.
- Saved reactions appear on the relevant book detail.
- Saved reactions can be consumed by the profile update slice.
- No test mocks internal application modules.

## Dependencies
- `02_core_domain_model.md`
- `07_book_detail_social_context.md`

