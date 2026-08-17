# 07 Book Detail Social Context

## Goal
Build the book detail surface around reactions, connected books, collections, and people who define themselves through the book.

## Done Means
- A book page shows reactions from users, connected books, Thought Collections containing the book, people who define themselves through it, and opposing or unexpected interpretations when seeded.
- The page makes the book feel culturally alive without becoming a review forum.

## Scope
- Render book title, author, cover, and concise context.
- Render user reactions with labels and optional short notes.
- Render connected books with idea label and one-sentence explanation.
- Render Thought Collections containing the book.
- Render people who include the book in their three defining books.
- Render seeded contrasting interpretations when available.

## Out Of Scope
- Long review threads.
- Comment discussions.
- Debate UI.
- Full quote or passage archive.
- Buy links.

## Product Guardrails
- User interpretation is the value. Do not center copied passages.
- Keep reactions and connections compact and browseable.
- Opposing interpretations should feel like lenses, not arguments to win.

## User Flow
The user opens a book and sees how different readers use it to express identity, what ideas it connects to, and which collections it shapes.

## Data / Interface Expectations
- Book detail consumes one Book plus related Reactions, Users, Connections, and Collections.
- Reactions should identify the reacting user.
- Connections should support navigation to the connection detail share object in a later slice.

## TDD Guidance
Presentation-heavy. If using a selector seam, test:
- `getBookDetailContext groups reactions, defining readers, connections, and collections for a book`.

## Acceptance Checks
- The page contains no forum thread or comment composer.
- At least one seeded book shows reactions, connections, collections, and defining readers.
- Empty optional sections collapse cleanly.
- The detail page links back to relevant people and collections.

## Dependencies
- `06_books_browse_surface.md`

