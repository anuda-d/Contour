# 20 MVP Acceptance Walkthrough

## Goal
Verify the full prototype against the ten-minute MVP success criteria from the product spec.

## Done Means
- A target user can browse taste-rich people and books, react to three books, create one connection, see their profile improve, understand why the app is not Goodreads, and find at least one reason to keep exploring.
- The walkthrough is documented as a repeatable acceptance script.
- Any failed criterion becomes a concrete follow-up ticket, not a vague polish note.

## Scope
- Create a manual walkthrough script for a fresh prototype user.
- Include a seeded-content-only browse path.
- Include onboarding discovery-first path.
- Include three reactions.
- Include three defining books.
- Include one book-to-book connection.
- Include viewing profile, connection share object, and collection share object.
- Include negative checks for excluded MVP features.

## Out Of Scope
- Formal usability study.
- Analytics instrumentation.
- Production launch checklist.
- Backend load testing.

## Product Guardrails
- The strongest signal is that the user wants their profile to exist and improve.
- The app should feel socially alive before graph density.
- The acceptance pass must explicitly check that the product does not collapse into Goodreads-style reviews, Reddit-style discussion, academic software, or Duolingo-style gamification.

## User Flow
Run this exact walkthrough:
1. Open the app as a fresh user.
2. Browse People and identify one aspirational profile.
3. Browse Books and identify one book with reactions, readers, connections, and collections.
4. Enter onboarding and select one seeded profile or collection that matches taste.
5. Select three defining books.
6. React to three books with expressive labels.
7. Create one connection between two books with idea label and one-sentence explanation.
8. View the updated profile.
9. Open the connection share object.
10. Open a Thought Collection share object.
11. Confirm at least one profile, book, or connection makes the user want to keep exploring.

## Data / Interface Expectations
- Public seam to confirm before automated acceptance testing: a user-level scenario runner, browser flow, or app-level integration seam.
- The walkthrough should use public UI or public app routes only.
- Test data should be seeded or created through public commands, not internal storage writes.

## TDD Guidance
Use `$tdd` for any automated scenario runner.

First red test:
- `fresh user can complete the MVP identity loop through public app seams`.

Keep the test high-level and behavior-focused. Do not assert on private component names, database rows, or internal function calls.

## Acceptance Checks
- The walkthrough can be completed in roughly ten minutes.
- The profile is visibly richer after reactions and defining books.
- The created connection is reachable as a share object.
- At least one Thought Collection is reachable as a share object.
- No global feed, leaderboard, XP, forum, long-form essay editor, AI-generated thought, or productivity dashboard is required to complete the loop.

## Dependencies
- All previous slices.

