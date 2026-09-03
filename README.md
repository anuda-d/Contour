# Contour

Status: Architecture Foundation is active under standing scheduled authorization.

Contour is an intentional, human-to-human discovery product for Books and Films.
It helps you start with a familiar work or idea.
You can then encounter an unfamiliar work through another person's taste or interpretation and understand why it may matter.

This repository contains the completed Identity Map Prototype and the active Architecture Foundation work.
The current software is responsive and locally persistent.
Its profile and contribution experience centers on a generated but shapeable Map.

## Run Contour locally

You need Node.js `^20.19.0` or `>=22.12.0` and npm.
Vite runs the development server and creates the production browser build.

Install the dependencies and start the local server:

```bash
npm install
npm run serve
```

Open [http://localhost:4173](http://localhost:4173) in your browser.

The prototype stores your selection, authored Thoughts, publication state, featured Media, and pinned positions in local storage.
Camera position, selected node, temporary movement, and visitor-preview mode last only for the current visit.

Useful checks:

- `npm test`: run the test suite
- `npm run typecheck`: run strict TypeScript validation
- `npm run build`: create the production browser build
- `./scripts/check.sh`: run governance, architecture, type, build, test, and diff checks

## What you can do

The owner-to-public walkthrough lets you:

- Explore a mature seeded Map with semantic zoom, pan, focus, and direct node movement
- Choose exactly three Books or Films from the bounded catalogue
- Write one private, editable Draft Thought for each chosen work
- Connect two works through one human-authored bridge Thought
- Pin an explicit Map position while leaving ordinary movement temporary
- Publish anchored Drafts without replacing their identity or placement
- Curate three public Media in the profile orbit
- Preview the Published-only Map and profile as a visitor
- Reload durable selection, authored Thoughts, publication state, featured Media, and pinned positions

Visitor preview excludes Drafts and owner controls.
Every Published Thought remains anchored to at least one Book or Film.

## Current development status

The Identity Map Prototype is complete.
The active Architecture Foundation goal preserves its accepted behavior and design.
The work migrates the application and tests to strict TypeScript, isolates effects and privacy boundaries, and retains valid browser state through versioned migration.

The architecture work does not add Contour's discovery experience, shared accounts, real recommendations, or production infrastructure.
See the [Current Development Index](docs/plans/CURRENT.md) for the authoritative status.
The [Architecture Foundation goal](docs/plans/architecture-foundation/GOAL.md) defines its scope.

## Prototype limits

The completed Map prototype does not include:

- Authentication, shared accounts, or a production database
- Public discovery through search, recommendations, people, Media, or Themes
- Real Likes, Saves, Bookmarks, Votes, Follows, Comments, or notifications
- A private behavioral-interest model or recommendation engine
- Live catalogue integrations or full Media pages
- Moderation, account recovery, or production privacy and security systems
- Ratings, public popularity scores, or an engagement-ranked infinite feed
- Generated public Theme regions or cross-Map branch reuse

The software and its final desktop and mobile, light and dark acceptance walkthrough are complete and independently reviewed.
Completion proves the bounded interaction artifact, not target-user discovery quality, demand, retention, or market viability.

## Product direction

> Find your next Book or Film through a mind, not a score.

Books and Films are the shared cultural objects.
Free-form Thoughts, connections, personal Theme regions, and people supply human context.
A User's Map can begin with deliberately Liked works and becomes richer through authored expression.
Private Saves, Bookmarks, and behavioral signals personalize discovery without silently changing the public Map.

Contour is designed for intentional use when someone wants to discover, respond, or contribute.
It is not designed around a daily attention habit.

## Documentation

Read the product direction:

- [Product foundation](docs/00-product-foundation.md)
- [Product model](docs/01-product-model.md)
- [Experience architecture](docs/02-experience-architecture.md)
- [Social contract](docs/03-social-contract.md)
- [Web MVP plan](docs/04-web-mvp-plan.md)
- [Open questions](docs/05-open-questions.md)

Read the implementation state:

- [Current Development Index](docs/plans/CURRENT.md)
- [Architecture Foundation goal](docs/plans/architecture-foundation/GOAL.md)
- [Architecture Foundation implementation state](docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md)
- [Identity Map Prototype goal](docs/plans/identity-map-prototype/GOAL.md)
- [Identity Map implementation archive](docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md)
- [Editorial Constellation design foundation](docs/plans/identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
- [Goal-bounded development loop](docs/main/DEVELOPMENT_LOOP.md)

## Contributor workflow

Coding agents must begin with the [Current Development Index](docs/plans/CURRENT.md).
They must confirm that one owner-approved goal has standing authorization and stop when authorization is absent or paused.
Every implementation unit begins in a fresh task and ends with a temporary handoff that selects no next unit.
During the daily 18:00-23:00 America/Toronto window, a clean accepted unit may create one fresh successor task without intermediate owner approval.
