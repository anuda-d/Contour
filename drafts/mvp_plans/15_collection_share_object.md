# 15 Collection Share Object

## Goal
Make Thought Collections shareable as developed but lightweight worldview artifacts.

## Done Means
- Each collection has a clean URL or route suitable for direct sharing.
- The share surface communicates owner, title, thesis, books, notes, and optional connection without requiring login.
- The collection can appear on profiles and book pages as a reusable object.

## Scope
- Ensure collection routes are addressable by stable collection id or slug.
- Create a compact share-oriented layout for direct visits.
- Include owner identity and profile link.
- Include title, thesis, book notes, and optional connection.
- Provide clear links back to related book pages.

## Out Of Scope
- Social share integrations.
- Image generation.
- Likes, saves, or comments.
- Collection creation or editing.

## Product Guardrails
- Collections should reveal the user's mind, not just their book list.
- Avoid turning the share page into a blog post template.
- Do not make the object depend on a dense network or global feed.

## User Flow
Someone receives a collection link, opens it, understands the point of view, and can click through to the owner's profile or the books.

## Data / Interface Expectations
- The collection share route reads the same collection object used by profile and book surfaces.
- Share URLs should not expose implementation-only ids if a slug system already exists; otherwise stable ids are acceptable for MVP.
- Missing or private collection handling belongs to slice 19.

## TDD Guidance
Presentation-heavy. If using a route/data seam, test:
- `collection share route resolves a public collection by stable id and exposes its owner, thesis, and books`.

## Acceptance Checks
- At least one seeded collection is reachable directly by URL or route.
- Direct view has enough context to make sense outside the app shell.
- The page does not require authentication for public seeded collections.

## Dependencies
- `14_thought_collection_view.md`

