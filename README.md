# Thought Map Product

This repository is the planning foundation for a web-first social product where people map how books and films shape their thinking.

The product is not a review site, a rating database, a generic social feed, or a personal knowledge-management tool. Its central artifact is a person's public Thought Map: an authored graph of compact Thoughts, the media that prompted them, the Themes that emerge across them, and the understated links between different people's interpretations.

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

## Current status

The previous book-only prototype and its implementation plans have been removed. The repository is documentation-first while the new product is specified from the ground up.

The foundation is settled. The next work is to resolve the explicitly listed open questions, turn the MVP plan into build slices, and then implement the web prototype.

## Settled boundaries

- Web first; native mobile may follow after the core behaviour is proven.
- Books and films only in the first version.
- No ratings, aggregate scores, reading goals, watch statistics, or conventional reviews.
- No global feed as the primary experience.
- No public follower counts as status signals.
- No AI-authored identity or automatically published interpretation.
- A public Thought must be anchored to created media.
- A personal Map contains only its owner's authored Thoughts.
- Comments enable conversation but never become Map nodes.
- Themes are personal, named clusters rather than global tags.
- Collections are not a core object. Paths may later guide visitors through an ordered part of a Map.
