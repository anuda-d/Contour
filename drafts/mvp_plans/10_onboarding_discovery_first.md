# 10 Onboarding Discovery First

## Goal
Create an onboarding entry that starts with desire and discovery before asking the user to do profile-building work.

## Done Means
- A new user first sees seeded profiles and collections that model the desired identity outcome.
- The user can choose taste references before being asked to add books.
- Onboarding leads naturally into adding or selecting three books.

## Scope
- Show a small curated set of seeded profiles and Thought Collections.
- Let the user choose one or more examples that feel close to their taste.
- Store those choices as onboarding taste references for the current prototype user.
- Use the choices to personalize the next profile-building step at a lightweight level, such as ordering suggestions.
- Provide a clear way to skip into browsing without destroying seeded context.

## Out Of Scope
- Account creation.
- Email capture.
- Algorithmic personalization.
- Quiz-heavy onboarding.
- AI identity generation.

## Product Guardrails
- Do not start with a blank profile and demand labor.
- The first magic moment is "I want my profile to feel like that."
- Onboarding should feel tasteful, not like a productivity setup wizard.

## User Flow
The user lands in onboarding, browses a few aspirational profiles and collections, selects what resonates, and then moves to choosing books.

## Data / Interface Expectations
- Public seam to confirm before implementation if logic is added: `saveOnboardingTasteReferences(userId, selectedReferenceIds)`.
- References may point to seeded users, collections, or books.
- The next slice can read selected references to suggest books or prefill context.

## TDD Guidance
Use `$tdd` only if storing or deriving onboarding choices is non-trivial.

First red test if applicable:
- `saveOnboardingTasteReferences stores selected seeded profiles and collections for the current user`.

## Acceptance Checks
- First onboarding screen shows aspirational existing content, not a blank form.
- The user can select taste references and continue.
- The onboarding flow does not mention XP, streaks, productivity, or follower growth.

## Dependencies
- `04_people_browse_seeded_profiles.md`
- `14_thought_collection_view.md` if collection cards are interactive; otherwise seeded collection previews from slice 01 are enough.

