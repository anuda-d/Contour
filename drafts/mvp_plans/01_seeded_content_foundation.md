# 01 Seeded Content Foundation

## Goal
Create the seed content needed for the MVP to feel socially alive before real users or a dense graph exist.

## Done Means
- The app has seeded people, books, reactions, connections, Thought Collections, unfinished shelf entries, and prompts.
- Seeded content can power People, Books, Profile, Onboarding, Connection, and Collection surfaces without blank states.
- Content feels taste-rich, artsy, and identity-oriented rather than generic review-site filler.

## Scope
- Define at least 6 seeded reader profiles.
- Define at least 18 seeded books across literary fiction, philosophy-adjacent nonfiction, criticism, memoir, and culturally legible popular works.
- Define at least 8 Thought Collections, each with title, one-line thesis, 3 to 5 books, and one short note per book.
- Define at least 12 book-to-book connections with idea label and one-sentence explanation.
- Define at least 10 reaction labels from the MVP spec.
- Define at least 6 rotating prompts.
- Mark one seeded profile as the prototype current user.

## Out Of Scope
- Real authentication.
- External book database integration.
- Personalized recommendation logic.
- AI-generated seed content at runtime.

## Product Guardrails
- Seed profiles should look like aspirational readers, not influencers optimized for follower counts.
- Seed content should show taste, contradiction, unfinished reading, and recurring ideas.
- Do not over-index on ratings. Reactions and connections should carry the identity signal.

## User Flow
The first-time user opens the app and immediately sees people, books, and collections that make them think, "I want my profile to feel like that."

## Data / Interface Expectations
- Seed data is available through a stable read interface such as `listSeedPeople`, `listSeedBooks`, `listSeedCollections`, and `listSeedPrompts`, or equivalent route-level data loaders.
- Seed records use stable ids, not titles or names as identifiers.
- Every seeded connection references valid source and target book ids.
- Every seeded collection references valid book ids and owner user id.

## TDD Guidance
This slice is light on logic. If validation is implemented, confirm the public seam `loadMvpSeedContent` or equivalent before testing.

Behavior test to write first:
- `loadMvpSeedContent returns internally consistent seeded people, books, connections, collections, and prompts`.

## Acceptance Checks
- People browse has enough content to show at least 6 profile previews.
- Books browse has enough content to show at least 12 book previews.
- At least one seeded profile has three defining books, one collection, one connection, recurring ideas, and one unfinished book.
- No seeded collection has fewer than 3 or more than 5 books.
- No connection references a missing book.

## Dependencies
- None.

