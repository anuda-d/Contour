# 12 Connection Creation Flow

## Goal
Let the user create a simple book-to-book connection through an idea label and one-sentence explanation.

## Done Means
- A user can choose source book, target book, idea label, and explanation.
- The saved connection appears on relevant book pages and the user's profile.
- The flow can be triggered after a reaction with the prompt "Does this remind you of another book?"

## Scope
- Support connection creation from a reacted book and from a generic create entry point if already available.
- Require source book, target book, idea label, and one-sentence explanation.
- Suggest target books from the user's reacted books, defining books, and seeded books.
- Keep explanation compact and profile/share-card friendly.
- Save the connection as authored by the current prototype user.

## Out Of Scope
- Multi-book connections.
- Debate or comments on connections.
- AI-suggested explanations.
- Advanced graph visualization.
- Historical influence claims.

## Product Guardrails
- A connection is subjective interpretation, not factual literary ancestry.
- The core question is "these books belong near each other in my mind, and this is why."
- Keep it lighter than an essay and sharper than a tag.

## User Flow
After reacting to `The Bell Jar`, the user is asked whether it reminds them of another book, chooses `My Year of Rest and Relaxation`, labels the idea `self-destruction as control`, writes one sentence, and saves.

## Data / Interface Expectations
- Public seam to confirm before implementation: `createBookConnection(userId, input)`.
- Input includes sourceBookId, targetBookId, ideaLabel, explanation, and visibility.
- The command rejects same-book connections and missing required fields.
- The saved connection is visible through book detail, profile, and connection detail read seams.

## TDD Guidance
Use `$tdd`.

First red test:
- `createBookConnection creates a retrievable connection between two different books with idea label and explanation`.

Additional behavior tests, one at a time:
- Reject same source and target book.
- Reject blank idea label.
- Reject blank explanation.
- Reject missing book ids.

## Acceptance Checks
- Creating a connection takes less than two minutes.
- The connection appears on both source and target book contexts when appropriate.
- The connection appears on the user's profile as a strong insight candidate.
- The UI does not frame the connection as proven historical influence.

## Dependencies
- `08_reaction_catalog_and_reaction_capture.md`
- `09_profile_updates_from_reactions.md`

