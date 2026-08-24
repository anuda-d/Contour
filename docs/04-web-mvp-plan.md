# Web MVP Plan

## Purpose

This document defines the smallest staged web build that can test the new product thesis without rebuilding the discarded book-only prototype under different names.

## What must be proven

The first build must test whether target users:

1. Want a public identity built from Thoughts about books and films.
2. Enjoy looking at and exploring their own Map.
3. Can create useful Thoughts without academic friction.
4. Understand the difference between private Drafts and their public Map.
5. Find the generated graph intuitive to move through and shape.
6. Value cross-media connections as part of how the profile represents them.

The strongest qualitative signal is:

> The user wants to keep shaping and sharing their Map after the guided session ends.

## Platform decision

Start with a responsive web product.

Web is the right first surface because:

- Profiles, Thoughts, and Media need public URLs; named Theme-region URLs may follow later.
- Graph exploration benefits from desktop space.
- Visitors can explore without installing an app.
- The model can be iterated quickly.
- The wider web remains a natural source of Media references.

Native mobile is deferred until capture and repeat behaviour are proven. A browser extension or bookmarklet may precede it.

## Stage 0: identity and Map interaction prototype

### Goal

Prove that the generated-but-shapeable Map and resulting public profile create a desirable identity experience before production infrastructure or the wider social system.

### Data

- One editable prototype User.
- A curated catalogue of Books and Films.
- Enough seeded content to demonstrate a compelling mature profile and Map before creation begins.
- Local persistence is acceptable.

### Required surfaces

- Discovery-led landing and onboarding.
- My Map.
- Public-profile preview and visitor view.
- Thought creation and detail.
- A minimal Book and Film chooser sufficient to anchor Thoughts.

### Required actions

- Search and choose a Book or Film.
- Create a Draft Thought.
- See the Draft appear distinctly and immediately on the private Map.
- Anchor and publish a Thought.
- See the published Thought enter the public Map without losing its recognizable place.
- Attach another work to create a bridge Thought.
- Move through and spatially shape the generated graph.
- Exercise the first bounded form of authored connection selected in the owner-approved goal.
- Feature Media already present in the Map.

### Map requirements

- Automatically generated and visually stable.
- Readable Books, Films, Draft Thoughts, and Published Thoughts.
- Immediate growth after creation.
- Intuitive movement with a clear distinction between spatial placement and semantic connection.
- Whole-map and focused-region exploration.
- Thought detail from a node.
- A way to preview the same graph as a visitor will encounter it.
- Usable focused navigation on mobile.

### Prototype exclusions

- Real multi-user authentication.
- Follow, Save, Appreciate, Comment, activity, and notification systems.
- Cross-person references and similar-Map discovery.
- Theme naming, Theme spaces, and manual Theme membership.
- Full Media pages and external catalogue synchronization.
- Production moderation systems.
- Native applications.
- Browser extension.
- Paths authoring unless core work finishes early.
- AI-generated public text or automatic public Theme naming.

## Stage 0 acceptance walkthrough

In roughly ten minutes, a target user can:

1. Explore a compelling seeded profile and understand that its Map represents the person's displayed mind.
2. Choose three Books or Films.
3. Add a compact Thought to each.
4. See each Draft appear on the private Map immediately and distinctly.
5. Connect two works through a bridge Thought.
6. Publish the Thoughts and understand what changed on the public Map.
7. Move through and shape the graph without needing graph-analysis knowledge.
8. Feature Media above the Map.
9. Preview the public profile as another person would encounter it.
10. Want to keep refining or share the result.

The walkthrough fails if the Map feels decorative or technical, Draft and public state are confused, creation feels like writing reviews, or users do not care about revisiting or showing the profile.

## Later prototype expansion

Only after the identity and Map artifact shows promise should a later owner-approved goal choose among:

- Emergent Theme-region recognition and optional naming.
- Discovery through similar Map regions and distinctive people.
- Media pages organized around interpretation.
- Save, Appreciate, Comment, Follow, and activity behavior.
- Cross-person Thought references and backlinks.

These are directions, not a committed implementation sequence. Social activity remains intentionally unresolved until the personal profile works.

## Stage 1: closed web alpha

### Goal

Test the behaviour with real people and durable shared state.

### Additional requirements

- Authentication and account recovery.
- Persistent database and stable public URLs.
- Media record deduplication and merging.
- Image-source and metadata provenance.
- Real Follow, Save, Appreciate, Comment, and reference relationships.
- Activity surface sufficient for Appreciations, Comments, and references.
- Blocking, reporting, conversation controls, and moderation tooling.
- Revision history and content withdrawal rules.
- Accessibility, responsive behaviour, and performance budgets.
- Privacy and security review.
- Basic product analytics focused on the core loop rather than engagement maximization.

### Alpha research questions

- Do users return to inspect their own Map without a notification prompt?
- Which creation prompts produce specific Thoughts rather than generic reviews?
- Does selecting featured Media improve pride in the profile?
- Do emergent Theme regions feel revealing, arbitrary, or invasive?
- Are cross-person references understandable when visually understated?
- Do Comments create connection without overwhelming durable Thoughts?
- Does Follow improve discovery without a feed?
- Which graph views remain legible as Maps grow?

## Stage 2: expansion only after proof

Candidates, not commitments:

- Path creation and sharing.
- Browser capture extension.
- Native mobile capture.
- Additional created-media types.
- Collaborative Paths.
- Stronger graph history and time travel.
- Carefully assistive Theme and connection suggestions.

No candidate should be promoted merely because it is technically easy.

## Stage 0 dependency direction

Stage 0 begins with a visible, interactive graph foundation rather than a
profile shell or an abstract data layer. After that foundation is accepted,
the graph and the creation experience must be developed in
tandem. The owner-approved implementation goal defines completion criteria,
and the development loop selects one bounded gap at a time rather than treating
this document as a task queue.

The conceptual dependency is:

1. A desirable seeded Map establishes the first visible product foundation.
2. Generated layout and direct spatial interaction make the graph explorable
   rather than decorative.
3. Thought lifecycle and Media anchoring supply authentic content.
4. The Map changes visibly through the same interface after every creation action.
5. A responsive public profile is layered over the proven Map.
6. The complete walkthrough and target-user sessions test whether it is worth continuing.

## Validation standard

The prototype is not done because every screen exists. It is done when:

- The complete acceptance walkthrough works through public interface actions.
- The Map remains readable on desktop and navigable on mobile.
- All creation visibly improves the profile.
- No core flow requires ratings, reviews, counts, or a feed.
- The distinction between private Drafts and public identity remains clear.
- Spatial graph customization does not silently create confusing semantic claims.
- Target users demonstrate desire to continue shaping their own Map.
