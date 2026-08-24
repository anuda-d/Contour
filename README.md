# Contour prototype

Contour is a runnable browser prototype for displaying identity through the ideas that books and films provoke. Its central artifact is a generated but shapeable Map of authored Thoughts and the Media that ground them.

The prototype tests whether this Map can feel like a public portrait instead of a review page, media log, technical graph, or personal knowledge-management tool. It does not test market demand, retention, or production readiness.

## What you can do

The current owner-to-public walkthrough supports:

- Exploring a mature seeded Map with semantic zoom, pan, focus, and direct node movement
- Choosing exactly three Books or Films from the bounded catalogue
- Writing one private, editable Draft Thought for each chosen work
- Connecting two works through one human-authored bridge Thought
- Pinning an explicit Map position while leaving ordinary movement temporary
- Publishing anchored Drafts without replacing their identity or placement
- Curating three public Media in the profile orbit
- Previewing the Published-only Map and profile as a visitor
- Reloading durable selection, authored Thoughts, publication state, featured Media, and pinned positions

Visitor preview excludes Drafts and owner controls. Every Published Thought remains anchored to at least one Book or Film.

## Run the prototype locally

You need Node.js for tests and Python 3 for the local static server.

1. Run `npm run serve`.
2. Open `http://localhost:4173`.

The prototype stores its durable state in this browser’s local storage. Camera position, selected node, temporary movement, and visitor-preview mode last only for the current visit.

Run `npm test` for the test suite. Run `./scripts/check.sh` for governance consistency, syntax checks, tests, and diff validation.

## Prototype limits

This repository does not include:

- Authentication, shared accounts, or a production database
- A public profile URL, sharing workflow, or deployment configuration
- Live catalogue integrations or full Media pages
- Moderation, account recovery, or production privacy and security systems
- Ratings, popularity scores, a primary engagement-ranked feed, or public follower counts
- Theme nodes, manual Theme filing, or general-purpose relationship editing
- AI-authored identity or automatically published interpretation

The technical acceptance walkthrough is implemented, validated across desktop and mobile in light and dark modes, independently reviewed, and committed. The remaining completion boundary is qualitative: the owner or target users must judge whether the seeded Map creates credible desire to make one. See the [Current Development Index](docs/plans/CURRENT.md) for the active decision and accepted evidence.

## Product direction

> My Map looks like me, and I want other people to explore it.

Media provides the aesthetic invitation. Thoughts provide the substance. The Map is the identity.

The product remains web first and supports Books and Films in this prototype. Drafts belong only to the owner Map. Published Thoughts form the public identity artifact. Themes may later emerge from Map regions, but they are not manual graph nodes or global tags.

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
2. [Identity Map Prototype goal](docs/plans/identity-map-prototype/GOAL.md)
3. [Implementation Plan](docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md)
4. [Editorial Constellation design foundation](docs/plans/identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
5. [Goal-bounded development loop](docs/main/DEVELOPMENT_LOOP.md)

Coding agents must begin with the [Current Development Index](docs/plans/CURRENT.md), confirm authorization and owner-decision gates, and follow its just-in-time read order.
