# 13 Connection Detail Share Object

## Goal
Build the shareable connection detail surface as a compact artifact of insight.

## Done Means
- Each connection has a clean detail URL or route.
- The surface displays source book, target book, idea label, explanation, and author identity.
- The layout is screenshot-friendly and can be shared without surrounding app context.

## Scope
- Render a connection card/detail page.
- Include source book title, author, and cover or placeholder.
- Include target book title, author, and cover or placeholder.
- Include idea label prominently.
- Include one-sentence explanation.
- Include author display name or handle and link to profile.
- Include links back to both book pages.

## Out Of Scope
- Native share sheet integration.
- Image export.
- Comments.
- Likes.
- Forking or replying to connections.

## Product Guardrails
- Connections may be the most viral unit because they are compact and specific.
- The card should communicate insight, not social status.
- Do not add debate affordances or engagement bait.

## User Flow
The user opens a connection and sees a clean artifact they would plausibly screenshot or send to a friend.

## Data / Interface Expectations
- Connection detail consumes the same Connection, Book, and User data created by slice 12.
- The route should be addressable by stable connection id.
- Missing connection id should show a useful not-found state in slice 19.

## TDD Guidance
Presentation-heavy. If a share-card view-model exists, test:
- `buildConnectionShareObject returns both books, idea label, explanation, and author for a saved connection`.

## Acceptance Checks
- A connection created by the current user has a reachable detail route.
- The card remains understandable if viewed directly from a link.
- The surface does not expose comments, ratings, or follower metrics.

## Dependencies
- `12_connection_creation_flow.md`

