# 14 Thought Collection View

## Goal
Build the lightweight Thought Collection view as a shareable worldview artifact.

## Done Means
- A seeded Thought Collection can be opened and read.
- The view includes title, thesis, 3 to 5 books, one short note per book, owner identity, and optional connection.
- It feels thoughtful without becoming an essay.

## Scope
- Render seeded collections from the seed content.
- Show collection owner and link to profile.
- Show title and one-line thesis near the top.
- Show each book with title, author, cover or placeholder, and collection-specific note.
- Show an optional connection between at least two books when present.
- Link each book to its book detail page.

## Out Of Scope
- Collection creation flow.
- Rich text editor.
- Sections or nested structure.
- Forking.
- Collaborative collections.

## Product Guardrails
- A Thought Collection is not merely a list and not an academic essay.
- It should feel like something the user wants on their profile.
- Keep notes short and original; do not build around long excerpts.

## User Flow
The user opens `Elegant Despair`, reads the thesis, sees three books with short notes, and understands the owner's taste and worldview.

## Data / Interface Expectations
- Public seam to confirm before implementation if validation exists: `getThoughtCollection(collectionId)`.
- Collection entries include book id and short note.
- A valid MVP collection has 3 to 5 book entries.

## TDD Guidance
Use `$tdd` for collection validation or composition.

First red test:
- `getThoughtCollection returns a collection with title, thesis, owner, three to five book notes, and optional connection`.

Additional behavior tests, one at a time:
- Reject or flag seeded collections with fewer than 3 books.
- Reject or flag seeded collections with more than 5 books.

## Acceptance Checks
- At least 3 seeded collections render correctly.
- Every rendered collection has 3 to 5 books.
- The page is readable without a long essay editor or academic structure.

## Dependencies
- `01_seeded_content_foundation.md`
- `07_book_detail_social_context.md`

