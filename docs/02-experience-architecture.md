# Experience Architecture

## Purpose

This document defines the primary web surfaces and how a person moves between self-reflection, identity, and social discovery.

## Experience hierarchy

1. My Map is the signed-in home.
2. The public profile is the main identity artifact.
3. Thoughts are the primary detail and conversation object.
4. Media pages organize human interpretation around a work.
5. Emergent Theme regions and similar Maps may later enable social discovery through ideas.
6. Paths may later provide guided exploration.
7. The Library remains private utility.

## Primary navigation

The initial signed-in web navigation should remain small:

- **My Map**
- **Explore**
- **Library**
- **Profile**
- A persistent **New Thought** action

Explore may contain People, Media, and Themes without turning each into a permanent top-level tab.

## My Map

My Map is the default signed-in destination and the product's emotional centre.

It must help the owner:

- See the whole shape of their thinking.
- Identify recurring patterns and regions.
- Find a previous Thought.
- Focus on one cluster.
- Notice recent growth.
- Connect a new Thought to an existing region.
- See understated indications of cross-person references.

### Exploration levels

#### Whole Map

Shows important Thoughts, recognizable Books and Films, and any regions that have become legible through their relationships.

#### Cluster

Focuses on one intellectual neighbourhood and the Thoughts and Media that compose it.

#### Thought

Opens the full statement, optional body, Media anchors, nearby Map context, revisions, connected Thoughts, and conversation.

#### Social layer

Reveals cross-person references and routes into other people's Maps when requested.

### Controls

Begin with:

- Zoom and pan.
- Search within My Map.
- Filter Books or Films.
- Filter Draft or Published.
- Focus a visible region when one has emerged.
- Show or hide social references.

Avoid graph-analysis terminology and controls that make the product feel like technical software.

## Public profile

The profile is a curated portrait layered over the Map.

Recommended order:

1. Name, handle, image, and identity line.
2. **Media in my orbit:** three to five featured covers or posters selected from Media already present in the Map.
3. Interactive public Map.
4. Named Map regions or Themes when they have emerged and the owner has chosen to name them.
5. Featured Thoughts or regions.
6. Paths when available.
7. Following relationships as a route to further human discovery, without prominent counts.

Clicking featured Media should open the part of that User's Map connected to the work.

The profile should not display ratings, books read, films watched, streaks, completion goals, or audience-size status.

## Thought detail

A Thought may open as a side panel from the Map on larger screens and as a full page on mobile or when directly linked.

The detail view should show:

- Author.
- Core statement and optional body.
- Primary and additional Media anchors.
- Precise scene, chapter, passage description, or timestamp when supplied.
- Nearby Map region when relevant.
- Correction history when relevant.
- Newer Thoughts that develop, revise, contradict, or clarify it.
- Quiet cross-person reference attribution.
- Save, Appreciate, Comment, and Connect actions.
- Connected Thoughts.
- Comment conversation.

### Connect action

Connecting begins from an existing Thought and may:

- Attach another Book or Film to create a bridge Thought.
- Link another authored Thought.
- Create a new Thought referencing another person's Thought.

A final public edge must remain understandable as authored meaning rather than unexplained decoration. Whether a particular connection requires new text, a relationship label, or another lightweight expression remains an open design question for the first goal.

## Comments

Comments are visible after a visitor opens a public Thought from a Map, Media page, Theme space, direct link, or notification.

They remain contained inside the Thought detail view. A Comment never appears as an independent discovery result or Map node.

The interface should clearly separate:

- **Connected Thoughts:** durable intellectual responses.
- **Conversation:** contextual comments.

## Media page

The Media page asks:

> What has this work caused people to think?

It does not ask for an aggregate judgment.

### Compact Media header

- Cover or poster, including typographic fallback.
- Title.
- Author or director.
- Year.
- Media type.
- Add Thought and Save privately actions.

### Thought ordering for a signed-in user

1. Your Thoughts about the work.
2. Thoughts from people you follow.
3. Thoughts directly referenced by or connected to your Map.
4. Nearby interpretations based on overlapping Themes.
5. Wider or meaningfully opposing interpretations.

Popularity should not be the default ordering principle.

### Media discovery content

- Personal Themes associated with the work.
- People with substantial Map regions around it.
- Bridge Thoughts connecting it to other Books or Films.
- Different interpretations with clear authorship.

## Theme regions and future Theme spaces

### Personal Theme region

A Theme first appears as a region in the Map rather than a node connected to individual Thoughts. A region may remain unnamed. If the owner later names it, opening that name from a profile focuses the related part of the Map and explains the language they chose.

The initial profile-and-Map prototype does not require Theme naming or manual Theme membership. It must first prove that meaningful regions can arise from the graph itself.

### Public Theme space

A future public Theme space shows nearby, user-recognized Map regions rather than a flat tag feed.

It should emphasize:

- People whose Maps strongly orbit the idea.
- Different framings of similar subject matter.
- Shared and unexpected Media.
- Related or opposing Theme clusters.
- Direct routes into the relevant region of each person's Map.

Theme-space discovery, saving, following, and topic activity are deferred until the personal Map and profile are viable.

## Explore

Explore should create desire before asking for work.

It may feature:

- Distinctive public Maps.
- A specific Theme region from a person.
- Strong Thoughts anchored to recognizable Media.
- Cross-media bridge Thoughts.
- Paths when available.
- Books and Films that generate varied interpretation.

The page should not become an infinite engagement-ranked feed.

## Library

The Library provides quiet private capture:

- Saved Books and Films.
- Saved Thoughts by other people.
- Draft Thoughts.
- Search and basic organization.

Saving does not publish, notify the original author, or change the public Map.

## Onboarding

Onboarding follows discovery before labour.

### Recommended flow

1. Explore one strong seeded profile and its Map.
2. Choose three meaningful Books or Films in any mixture.
3. Add one compact Thought to each.
4. Connect two Thoughts or attach another work to create a bridge.
5. Move through the generated Map and notice any visual region that begins to form.
6. Watch the Map grow after every action.
7. Preview the resulting public profile.

The user should never complete several forms and only then see a Map.

### First magic moment

> Three things I care about suddenly look like part of the same mind.

## Responsive web behaviour

- Desktop emphasizes spatial exploration and a persistent Thought panel.
- Mobile emphasizes capture, focused cluster navigation, and full-screen Thought detail.
- The complete graph need not be equally dense on a small screen; progressive focus is preferable to an unreadable miniature.
- Public URLs for profiles, Thoughts, Media, and later named Theme regions and Paths are essential.
