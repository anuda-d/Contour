# Map Design Foundation

Status: owner-approved design direction for the active Identity Map Prototype
goal as of 2026-08-22. This document guides the pending graph-foundation
correction and later Map surfaces inside the same goal. It does not approve the
current implementation or authorize a separate work unit.

## Purpose

The Map is the product's primary identity artifact. Its design must make a
person's authored interpretations feel spatial, personal, and worth exploring.
It must not resemble a flowchart, database diagram, productivity canvas, or
technical graph-analysis tool.

The selected direction is an **Editorial Constellation**: a spatial field that
combines the navigational restraint of a constellation with the readability and
character of an editorial portrait.

## Experience Principle

From a distance, a visitor sees the shape of a person. Moving closer reveals
the works, Thoughts, and authored meaning that create that shape.

The Map therefore uses semantic zoom. It does not render one fixed set of cards
and make them progressively smaller.

## Semantic Zoom

Visibility is based on scale and context rather than making all content equally
readable at every distance.

### Distant view

- Text is not expected to be readable.
- The Map communicates its silhouette, density, major regions, and strongest
  cross-media bridges.
- Recognizable cover and poster imagery remains visible as small cultural
  anchors.
- Only a quiet regional connection skeleton is shown.
- Soft, unlabeled atmospheric fields may make meaningful regions perceptible.

### Middle view

- Media titles and selected Thought fragments begin to appear.
- More local relationships become visible.
- Hover, keyboard focus, or selection clarifies the immediate neighborhood and
  softens unrelated material.
- Region atmosphere becomes less prominent as individual content becomes more
  legible.

### Close view

- Thought statements, Media details, and local relationships become readable.
- Thoughts appear primarily as floating typography rather than permanent cards.
- Media retains the visual character of cover, poster, or approved typographic
  fallback treatments.

### Focused view

- Selection happens in place and does not automatically move the Map.
- An explicit focus action may frame a node's neighborhood.
- Full detail appears in a compact contextual surface without obscuring the
  selected neighborhood.
- Leaving focus returns to the prior spatial context when practical.

Exact scale thresholds and transition values remain implementation decisions to
validate visually.

## Content Language

### Media

- Books and Films remain recognizable from the distant view through artwork,
  proportion, and silhouette.
- Books use portrait cover proportions. Films use poster or still proportions.
- Trustworthy artwork is preferred. Missing artwork uses a deliberate
  typographic fallback and never invented cover or poster art.
- Media type is not communicated through unrelated dashboard colors when shape
  and artwork already provide the distinction.

### Thoughts

- Thoughts are authored language in space, not rectangular flowchart nodes.
- Close-range Thoughts use floating typography with a restrained authored mark.
- A containing surface appears only when selection, detail, editing, or
  accessibility requires it.
- The visibility model may later support a small owner-featured set of defining
  Thoughts. That product direction is recorded here, but the active goal does
  not require or authorize a separate Thought-featuring action.
- When available, featuring is authored curation, not a public score or
  popularity signal.

### Relationships

- Explicit cross-media bridges have the highest distant-view priority.
- Ordinary Media anchors appear as the user moves closer or requests local
  context.
- Selecting a node always reveals the relationships required to understand its
  immediate authored meaning.
- Lines should behave as quiet paths through the Map, not uniform diagram
  connectors.
- Spatial proximity never creates a semantic relationship.

### Regions

- Regions are subtle, unlabeled atmospheric fields rather than Theme nodes,
  labeled bubbles, or manual filing containers.
- They are most perceptible from a distance and recede as individual content
  becomes readable.
- Their presence cannot automatically name or publish part of the User's
  identity.
- The exact region-generation threshold and visual algorithm remain unresolved.

## Visibility Policy

The interface may prioritize what is rendered at a given scale, but it does not
assign a public value score to Thoughts or people.

Visibility uses an explainable rule order:

1. selected or focused content and the context needed to understand it;
2. owner-featured content when the active goal authorizes it;
3. explicit authored cross-media bridges;
4. primary Media anchors;
5. additional local relationships as scale permits; and
6. stable deterministic tie-breaking when the available visual space is full.

Engagement, audience size, ratings, and popularity do not influence this
priority. Inside the active goal, content hidden at one scale remains reachable
through zoom or explicit focus. Later search or direct navigation may extend
access without changing the visibility policy.

## Spatial Interaction

Selection, movement, and focus are distinct actions.

- A click or tap selects a node in place.
- Pointer movement must cross a small drag threshold before node movement
  begins.
- A dragged node stays directly under the pointer without moving or recentering
  the camera.
- Ordinary drag movement is temporary.
- Durable placement requires an explicit **Pin position** action.
- Pinning changes spatial presentation only. It does not create or alter a
  semantic relationship.
- Panning begins from open canvas space and never competes with node dragging.
- Zoom reveals semantic detail at stable thresholds.
- Focus is explicit and may frame a neighborhood; selection alone does not.

The exact pin control, unpin behavior, reset behavior, and persistence boundary
remain to be tested. The lasting policy is settled: casual movement is not
automatically durable.

## Owner and Visitor Composition

Owner and visitor modes share the same underlying Map composition, camera
model, semantic zoom, node treatments, and relationship language.

Owner mode adds a quiet editing layer for Draft visibility, shaping, pinning,
featuring, and publishing. It must not become a separate graph editor. The
owner should feel that they are directly shaping the artifact a visitor will
encounter.

The exact visual treatment for private Drafts versus Published Thoughts remains
an owner decision that must preserve the private and public boundary.

## Visual System

- The default is a light mineral or cool-fog canvas with charcoal typography
  and restrained linework.
- A matched dark mode uses the same hierarchy rather than becoming a separate
  galaxy aesthetic.
- One restrained coral or vermilion accent communicates authorship, selection,
  and active interaction.
- Media artwork supplies additional color without turning the interface into a
  multi-accent dashboard.
- Thought typography, spatial rhythm, artwork, and region atmosphere carry the
  identity. Permanent card borders and ornamental glow do not.
- The Map should occupy the primary visual field. Navigation, instructions,
  controls, and contextual detail must remain subordinate.

Owner-selectable visual themes are not part of this foundation. They may be
considered only after the shared visual language is proven.

## Shared Implementation Contract

The design must be implemented as one reusable Map system rather than separate
screen-specific versions.

Shared foundations must include:

- one camera and semantic-zoom model;
- one visibility policy for labels, nodes, relationships, and regions;
- one interaction model for selection, drag, pan, zoom, focus, and pinning;
- shared design tokens for theme, typography, spacing, motion, and surfaces;
- reusable render treatments for Media, Thoughts, and later Draft and
  Published states;
- one focused-neighborhood and contextual-detail pattern; and
- mode-specific owner controls layered over the same visitor composition.

Seeded prototype content must not be embedded into these shared foundations.
New Map features should extend the shared model rather than inventing a second
canvas, node system, or visibility policy.

## Patterns to Retire

- Permanent bordered cards for every Thought.
- A central User node used as a database hub.
- Uniformly visible connector lines at every zoom level.
- A row of truncated Thought pills duplicating the Map.
- A large permanent detail card covering the canvas.
- Separate owner and visitor Map implementations.
- Force controls, graph statistics, folders, tags, or graph-analysis language
  in the primary experience.
- Node importance derived from popularity or engagement.
- Generic glowing galaxy styling used as the product identity.

## Still Unresolved

- Exact semantic-zoom thresholds and transition timing.
- The algorithm and evidence threshold for atmospheric regions.
- The final Draft versus Published Thought treatment.
- The exact Pin, Unpin, and Reset interactions.
- Whether pinning or region featuring is introduced first after direct movement.
- Artwork sourcing, licensing, provenance, and caching.
- The precise compact-detail behavior at narrow mobile sizes.

These are implementation or owner-decision boundaries, not permission to
expand the active work unit.

## Research Reference

Obsidian's graph informed the use of progressive disclosure, local-neighborhood
focus, selective labels, and restrained graph chrome. This product does not
adopt Obsidian's technical graph controls, link-count hierarchy, file metaphor,
or generic knowledge-management visual identity.

- [Obsidian Graph view](https://obsidian.md/help/Plugins/Graph%2Bview)
- [Obsidian 0.9.0 graph-view changes](https://obsidian.md/changelog/2020-09-21-desktop-v0.9.0/)
