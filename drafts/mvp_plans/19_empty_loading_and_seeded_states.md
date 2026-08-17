# 19 Empty Loading And Seeded States

## Goal
Make every MVP surface resilient when data is loading, missing, private, incomplete, or still seeded-only.

## Done Means
- People, Books, Profile, Book Detail, Connection Detail, and Collection Detail have intentional loading, not-found, and empty states.
- Empty states invite tiny identity-building actions instead of generic blank UI.
- Seeded content is used where appropriate to avoid pretending the network is dense.

## Scope
- Add loading states for primary browse and detail surfaces.
- Add not-found states for missing user, book, connection, and collection ids.
- Add incomplete profile states for users with fewer than three defining books or reactions.
- Add empty section states for optional profile sections.
- Add seeded fallback recommendations where the MVP would otherwise feel dead.

## Out Of Scope
- Offline-first architecture.
- Error reporting infrastructure.
- Full observability platform.
- Network retry strategy beyond basic user-facing recovery.

## Product Guardrails
- Empty states should preserve desire: show examples, prompts, or the next tiny action.
- Do not make the app feel like a sparse social network.
- Do not use guilt, streak loss, or productivity pressure.

## User Flow
The user reaches an incomplete profile and sees a specific next step such as selecting three defining books or reacting to one book, while still seeing seeded inspiration nearby.

## Data / Interface Expectations
- Detail routes distinguish `loading`, `notFound`, `privateOrUnavailable`, and `ready` states if the stack supports status models.
- Empty states should receive enough context to offer the correct next action.
- Seeded fallback content should not overwrite user-created content.

## TDD Guidance
Use `$tdd` if status resolution is centralized.

First red test:
- `resolveMvpSurfaceState returns incompleteProfile when a user has fewer than three defining books`.

Additional behavior tests, one at a time:
- Missing connection id returns not found.
- Private public-profile records are omitted or marked unavailable.
- Ready state wins when required data exists.

## Acceptance Checks
- No primary surface renders a raw blank page.
- Missing detail ids produce a clear message and route back to browse.
- Incomplete profile states suggest identity-building actions, not generic setup chores.

## Dependencies
- `03_primary_navigation_shell.md`
- `13_connection_detail_share_object.md`
- `15_collection_share_object.md`
- `18_profile_share_object.md`

