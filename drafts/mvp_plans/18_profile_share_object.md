# 18 Profile Share Object

## Goal
Make the profile shareable as the main accumulated artifact of reading identity.

## Done Means
- A public profile has a clean URL or route.
- The direct profile view shows the identity line, defining books, reactions, collections, recurring ideas, strong connection, and optional unfinished texture.
- The profile is understandable when opened outside the user's current session.

## Scope
- Ensure public profile routes are addressable by handle or stable user id.
- Reuse the profile identity surface from slice 05.
- Include share-oriented visual hierarchy for direct visits.
- Link profile sections to books, connections, and collections.
- Show seeded and current-user profiles through the same read path.

## Out Of Scope
- Native sharing integration.
- Image export.
- Profile privacy management UI.
- Follower counts.
- Social stats.

## Product Guardrails
- The profile is the emotional and social center of the MVP.
- It should look like a portrait, not a data dump.
- Do not make social status metrics the reason to share.

## User Flow
The user opens their profile, sees a public artifact that represents their taste, and can send the URL as "this is me as a reader."

## Data / Interface Expectations
- Public seam to confirm before implementation if route resolution has logic: `getPublicProfile(identifier)`.
- Public profiles include only public-visible records.
- Private records should be omitted or replaced with a clear unavailable state if privacy is implemented.

## TDD Guidance
Use `$tdd` if visibility filtering or route resolution is non-trivial.

First red test:
- `getPublicProfile returns the user's public identity surface and omits private records`.

## Acceptance Checks
- A seeded user's profile is directly reachable.
- The current prototype user's profile is directly reachable after reactions and defining books are saved.
- The direct view has enough context without needing a global feed or dashboard.

## Dependencies
- `05_person_profile_identity_surface.md`
- `09_profile_updates_from_reactions.md`
- `11_three_book_profile_builder.md`

