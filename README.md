# Contour prototype

Status: Human Discovery Prototype is owner-approved and paused.

Contour is an intentional, human-to-human discovery product for Books and
Films. It helps someone begin with a work or idea they already know, encounter
an unfamiliar work through another person's taste or interpretation, and
understand why the recommendation may matter.

The current repository contains the completed **Identity Map Prototype** and an
owner-approved **Human Discovery Prototype** goal.
Current authorization is recorded in the Current Development Index.
The existing software proves a responsive, locally persistent profile and
contribution foundation: a generated but shapeable Map of Books, Films,
authored Thoughts, and explicit connections.
At goal preparation time, the software did not yet implement Contour's
discovery experience, shared accounts, real recommendations, or production
infrastructure.

## What the completed prototype can do

The owner-to-public walkthrough supports:

- Exploring a mature seeded Map with semantic zoom, pan, focus, and direct node movement
- Choosing exactly three Books or Films from the bounded catalogue
- Writing one private, editable Draft Thought for each chosen work
- Connecting two works through one human-authored bridge Thought
- Pinning an explicit Map position while leaving ordinary movement temporary
- Publishing anchored Drafts without replacing their identity or placement
- Curating three public Media in the profile orbit
- Previewing the Published-only Map and profile as a visitor
- Reloading durable selection, authored Thoughts, publication state, featured Media, and pinned positions

Visitor preview excludes Drafts and owner controls. Every Published Thought
remains anchored to at least one Book or Film.

## Run the prototype locally

You need Node.js for tests and Python 3 for the local static server.

1. Run `npm run serve`.
2. Open `http://localhost:4173`.

The prototype stores durable state in this browser's local storage. Camera
position, selected node, temporary movement, and visitor-preview mode last only
for the current visit.

Run `npm test` for the test suite. Run `./scripts/check.sh` for governance
consistency, syntax checks, tests, and diff validation.

## Completed Map prototype limits

At goal preparation time, the completed Map prototype did not include:

- Authentication, shared accounts, or a production database
- Public discovery through search, recommendations, people, Media, or Themes
- Real Likes, Saves, Bookmarks, Votes, Follows, Comments, or notifications
- A private behavioral-interest model or recommendation engine
- Live catalogue integrations or full Media pages
- Moderation, account recovery, or production privacy and security systems
- Ratings, public popularity scores, or an engagement-ranked infinite feed
- Generated public Theme regions or cross-Map branch reuse

The software and its final desktop/mobile, light/dark acceptance walkthrough
are complete and independently reviewed. Completion proves the bounded
interaction artifact, not target-user discovery quality, demand, retention, or
market viability.

## Product direction

> Find your next Book or Film through a mind, not a score.

Books and Films are the shared cultural objects. Free-form Thoughts,
connections, personal Theme regions, and people supply human context. A User's
Map can begin with deliberately Liked works and becomes richer through authored
expression. Private Saves, Bookmarks, and behavioral signals personalize
discovery without silently changing the public Map.

Contour is designed for intentional use when someone wants to discover,
respond, or contribute. It is not designed around a daily attention habit.

## Read the product and implementation docs

Product direction:

1. [Product foundation](docs/00-product-foundation.md)
2. [Product model](docs/01-product-model.md)
3. [Experience architecture](docs/02-experience-architecture.md)
4. [Social contract](docs/03-social-contract.md)
5. [Web MVP plan](docs/04-web-mvp-plan.md)
6. [Open questions](docs/05-open-questions.md)

Implementation state:

1. [Current Development Index](docs/plans/CURRENT.md)
2. [Human Discovery Prototype goal](docs/plans/human-discovery-prototype/GOAL.md)
3. [Human Discovery implementation state](docs/plans/human-discovery-prototype/IMPLEMENTATION_PLAN.md)
4. [Identity Map Prototype goal](docs/plans/identity-map-prototype/GOAL.md)
5. [Identity Map implementation archive](docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md)
6. [Editorial Constellation design foundation](docs/plans/identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
7. [Goal-bounded development loop](docs/main/DEVELOPMENT_LOOP.md)

Coding agents must begin with the Current Development Index, confirm that one
owner-approved goal and standing authorization exist, and stop when
authorization is absent or paused.
Every implementation unit begins in a fresh chat and ends with a temporary
handoff that selects no next unit.
