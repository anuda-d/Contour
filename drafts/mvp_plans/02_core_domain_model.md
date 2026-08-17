# 02 Core Domain Model

## Goal
Define the MVP domain objects and relationships so all later slices share one consistent product vocabulary.

## Done Means
- User, Book, Reaction, Connection, Thought Collection, Unfinished Shelf Entry, Prompt, and Rating concepts exist in the app model.
- Required fields support every planned MVP screen without adding new primitives later.
- Domain validation catches broken references and invalid collection or connection shapes.

## Scope
- Model users with handle, display name, identity line, avatar or visual placeholder, defining book ids, reaction ids, collection ids, connection ids, recurring ideas, and unfinished shelf ids.
- Model books with title, author, cover, description, common reaction ids, reader ids, connection ids, and collection ids.
- Model reactions as user-book records with label, optional rating, optional short note, visibility, and timestamp.
- Model connections as source book, target book, idea label, one-sentence explanation, author user, visibility, and timestamp.
- Model Thought Collections as owner, title, thesis, 3 to 5 book entries, optional connection ids, visibility, and timestamp.
- Model unfinished entries as user, book, reason label, optional note, visibility, and timestamp.

## Out Of Scope
- Database schema migration details.
- Full search indexing.
- Privacy settings beyond simple visibility values.
- Author pages, genre taxonomy, and advanced idea graph nodes.

## Product Guardrails
- Keep the model person-first. Books support reader identity; they should not become isolated wiki entries.
- Ideas begin as flexible user-generated labels, not a forced taxonomy.
- Store original user commentary. Do not center copied book passages.

## User Flow
No direct user-facing flow is required. This slice enables later flows to read and write consistent MVP data.

## Data / Interface Expectations
- Public seam to confirm before implementation: a domain service or data access boundary that can create, read, and validate MVP records.
- Entities should be serializable for seeded content and future persistence.
- Visibility should allow at least `public` and `private`, even if most MVP content is public.

## TDD Guidance
Use `$tdd`.

First red test:
- `validates a complete profile graph with defining books, reactions, collections, connections, and unfinished entries`.

Additional behavior tests, one at a time:
- Reject a Thought Collection with fewer than 3 books.
- Reject a Thought Collection with more than 5 books.
- Reject a connection where source and target are the same book.
- Reject records that reference missing users or books.

## Acceptance Checks
- Seed content from slice 01 can be represented without special cases.
- Invalid references produce clear validation errors.
- No test asserts on internal storage details.

## Dependencies
- `01_seeded_content_foundation.md`

