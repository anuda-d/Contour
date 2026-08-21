# Thought Map Product

This repository is the planning foundation for a web-first social identity product where people put an authored representation of their mind on display through the Thoughts that books and films provoke in them.

The product is not a review site, a rating database, a generic social feed, or a personal knowledge-management tool. Its central artifact is a person's public Thought Map: a generated but shapeable graph of compact Thoughts, the media that prompted them, the patterns that emerge across them, and eventually the understated links between different people's interpretations.

## North star

> My Map looks like me, and I want other people to explore it.

Media provides the aesthetic invitation. Thoughts provide the substance. The Map is the identity.

## Start here

1. [Product foundation](docs/00-product-foundation.md)
2. [Product model](docs/01-product-model.md)
3. [Experience architecture](docs/02-experience-architecture.md)
4. [Social contract](docs/03-social-contract.md)
5. [Web MVP plan](docs/04-web-mvp-plan.md)
6. [Open questions](docs/05-open-questions.md)
7. [Active development goal](docs/plans/identity-map-prototype/GOAL.md)
8. [Owner-gated development loop](docs/main/DEVELOPMENT_LOOP.md)

Coding agents do not use this reading list as their operational entry point.
They must begin with the [Current Development Index](docs/plans/CURRENT.md),
check the owner gate, and follow its just-in-time read order.

## Current status

The previous book-only prototype and its implementation plans have been removed. The repository is documentation-first while the new product is specified from the ground up.

The core concept and philosophy have been revised around identity, self-presentation, and the Map. The Identity Map Prototype is the active owner-approved goal. Bounded graph-first work may run through explicit owner instructions or the conditionally pre-approved daily 6:00-7:00 PM America/Toronto automation window; profile and creation-flow work remain deferred until the graph foundation is accepted.

## Settled boundaries

- Web first; native mobile may follow after the core behaviour is proven.
- Books and films only in the first version.
- No ratings, aggregate scores, reading goals, watch statistics, or conventional reviews.
- No global feed as the primary experience.
- No public follower counts as status signals.
- No AI-authored identity or automatically published interpretation.
- A public Thought must be anchored to created media.
- A personal Map contains only its owner's authored Thoughts.
- Drafts appear distinctly on the owner's private Map and never on the public Map.
- The Map supplies an automatic starting layout while allowing intuitive movement and light spatial control.
- Comments enable conversation but never become Map nodes.
- Themes, when introduced, emerge from regions of the Map rather than appearing as manually connected graph nodes or global tags.
- Collections are not a core object. Paths may later guide visitors through an ordered part of a Map.
