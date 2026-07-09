# 03 Primary Navigation Shell

## Goal
Build the MVP navigation frame with exactly three primary tabs: Books, People, and Profile.

## Done Means
- Users can move between Books, People, and Profile from every primary screen.
- Connections and Thought Collections are not top-level tabs.
- The shell works with seeded data and does not require authentication to browse.

## Scope
- Create the top-level navigation shell.
- Add primary routes or views for Books, People, and Profile.
- Default first visit to a discovery-oriented surface, preferably People or a seeded onboarding entry if onboarding already exists.
- Keep navigation labels plain: `Books`, `People`, `Profile`.
- Ensure active tab state is clear.

## Out Of Scope
- Global feed.
- Notifications.
- Search bar behavior.
- Settings.
- Dedicated top-level Collections or Connections tabs.

## Product Guardrails
- Navigation must make People and Books feel like the primary browse surfaces.
- Profile must feel like the reward, not a storage cabinet.
- Abstract graph concepts should appear inside profiles, books, and share objects, not as cold browse tabs.

## User Flow
A user opens the app, sees a simple three-tab structure, browses people or books, and can always return to their profile.

## Data / Interface Expectations
- Navigation state should map to stable route names or screen ids: `books`, `people`, `profile`.
- Profile route should resolve to the current prototype user from seeded content until real auth exists.
- Deep links created in later slices should render inside this shell when appropriate.

## TDD Guidance
This is mostly UI composition. Use interaction tests only if the project already has a browser or route testing seam.

## Acceptance Checks
- There are exactly three primary nav items.
- Clicking each primary item changes the visible surface.
- No top-level nav item exists for Connections, Collections, Ratings, Feed, Goals, or Forums.
- The shell renders usable content with only seeded data.

## Dependencies
- `01_seeded_content_foundation.md`
- `02_core_domain_model.md`

