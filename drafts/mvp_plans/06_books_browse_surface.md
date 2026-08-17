# 06 Books Browse Surface

## Goal
Build the Books browse surface so books feel socially and intellectually alive, not like static catalog entries.

## Done Means
- The Books tab shows seeded book previews.
- Each preview includes cover, title, common reactions, interesting readers, connected books, and collections containing it when available.
- Selecting a book opens the book detail view.

## Scope
- Show at least 12 seeded books.
- Display cover or consistent placeholder, title, author, and one compact description or context line.
- Show common reactions as taste labels.
- Show at least one interesting reader when available.
- Show one or two connected books when available.
- Show collection membership when available.

## Out Of Scope
- Full book database search.
- ISBN metadata resolution.
- Author profile pages.
- Genre filtering.
- Popularity rankings.

## Product Guardrails
- Books should be discovery surfaces through people, ideas, and collections.
- Avoid making star ratings the dominant book preview signal.
- Do not build a generic review catalog.

## User Flow
The user opens Books, sees that each book has social context and idea context, then clicks one to understand why it matters to people.

## Data / Interface Expectations
- Book previews join Book records to Reaction, User, Connection, and Collection records.
- Preview should handle a book with no connection by showing reactions and readers rather than an empty graph section.
- Book detail links use stable book ids.

## TDD Guidance
If using a view-model seam, test:
- `buildBookPreview includes social and idea context for a connected seeded book`.

## Acceptance Checks
- A book preview never contains only title, author, and rating.
- At least 8 visible previews show a reaction or reader signal.
- At least 4 visible previews show a connection or collection signal.
- Clicking a book opens its detail surface.

## Dependencies
- `01_seeded_content_foundation.md`
- `03_primary_navigation_shell.md`

