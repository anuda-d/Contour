# Book Platform MVP Product Spec

## Purpose

This document turns the project philosophy into a concrete first prototype.

The MVP should not prove the full ideas graph. It should prove the core behavior that can eventually create the graph:

> Trendy, artsy, taste-sensitive readers will use books, reactions, and connections to build a public intellectual persona.

The first version should master the fundamentals before expanding. Every feature should support identity, taste, lightweight interpretation, or discovery.

## Target user

The first users are not generic readers, academic readers, or productivity-heavy note takers.

The initial tribe is:

> Trendy and artsy readers who want to be performative and deep in a tasteful way.

They want the social satisfaction of Letterboxd, but for reading identity. They want people to understand their taste, their sophistication, and the kinds of ideas they orbit.

They probably do not currently have a perfect tool for this. Some may use Instagram, TikTok, Goodreads, StoryGraph, private notes, or nothing at all. The key is not that they are already knowledge-management users. The key is that they want books to contribute to persona.

### What they want

1. A public profile that makes them look interesting.
2. Low-effort ways to signal depth and taste.
3. Discovery through people whose taste feels aspirational.
4. Books presented as identity signals, not only review objects.
5. A way to look thoughtful without writing academic essays.

### What they do not want

1. Heavy note-taking workflows.
2. Academic taxonomy management.
3. Debate forums.
4. Productivity framing.
5. Generic reading goals as the main identity layer.
6. Leaderboards, XP, or shallow gamification.

## Core product thesis

Books are not the final product. The reader is.

The MVP should make each user feel:

> My reading profile makes me look interesting, and it helps me understand my taste.

Ratings can exist because users understand them instantly, but ratings are not the differentiated product layer.

The differentiated layer is:

> Reactions create identity. Connections create insight. Collections create worldview.

## MVP navigation

The first prototype should use simple, legible navigation.

### Primary tabs

1. Books
2. People
3. Profile

Books and People are the primary browse surfaces because they are immediately understandable.

Connections and Thought Collections should not be top-level tabs in the MVP. They are too abstract for cold browsing. They should appear as attached layers inside books, profiles, and share cards.

## Core hierarchy

1. People and Books are navigation surfaces.
2. Reactions are the atomic identity action.
3. Connections are the atomic insight layer.
4. Thought Collections are the shareable worldview artifact.
5. Profiles are the emotional reward.

## First magic moment

The first magic moment should be discovery before creation.

A new user should first see profiles, books, or collections that make them think:

> I want my profile to feel like that.

Then the app should give them a lightweight path to create their own version.

### Recommended onboarding shape

1. Show a small set of seeded, high-quality reader profiles and collections.
2. Let the user choose what feels closest to their taste.
3. Ask them to add or select three books.
4. Let them attach reactions to those books.
5. Suggest one possible book-to-book connection.
6. Show the beginning of their profile.

Do not start with a blank profile and ask users to do labor before desire exists.

## Profile requirements

The profile is the primary identity surface.

Above the fold, a profile should show:

1. Name or handle.
2. Short identity line.
3. Three defining books.
4. Taste reactions attached to books.
5. One or two Thought Collections.
6. Recurring ideas or themes.
7. One strong book connection.
8. Optional unfinished book if it adds texture.

### Three defining books

Use three defining books, not a large shelf.

This forces taste. A profile should not look like inventory. It should look curated.

### Taste reactions

Taste reactions are expressive labels that explain the user's relationship to a book.

A rating answers:

> Was this good?

A taste reaction answers:

> What does this book say about the reader?

Example reactions:

1. Changed me.
2. Respected, not loved.
3. Beautiful but hollow.
4. Embarrassingly formative.
5. Could not finish, still think about it.
6. Overrated but necessary.
7. Too early for me.
8. Wanted to be this kind of person.
9. Hated it productively.
10. Emotionally important.

Ratings can exist, but reactions should carry the public identity layer.

## Atomic creation ladder

The MVP creation ladder should be:

> React -> note -> connect -> collect

Most users can stop after reacting to a book. More invested users can add a note, connect books, and eventually create Thought Collections.

### Atomic action

The atomic action is:

> React to a book.

This is lightweight, expressive, and repeatable.

### Upgrade path

After a reaction, the app can ask:

> Does this remind you of another book?

If yes, the user creates a connection.

The connection should ask for:

1. Source book.
2. Target book.
3. Idea label.
4. One-sentence explanation.

Example:

> The Bell Jar -> My Year of Rest and Relaxation
> Idea: self-destruction as control
> Both books turn withdrawal into a private form of power, but one treats it as collapse and the other as aesthetic strategy.

## Thought Collections

Thought Collections are important, but they should not be forced during onboarding.

In the MVP, Collections should be aspirational early and created after a user has enough material.

### Smallest useful Thought Collection

A Thought Collection should include:

1. Title.
2. One-line thesis.
3. Three to five books.
4. One short note per book.
5. Optional connection between at least two books.

Example:

**Elegant Despair**

Books where sadness becomes an aesthetic, then a trap.

1. The Bell Jar - Self-awareness without a way out.
2. No Longer Human - Performance as spiritual collapse.
3. The Secret History - Beauty used to excuse rot.

This is enough to feel thoughtful without becoming an essay.

## Browse surfaces

### People tab

The People tab should emphasize taste and persona.

A person preview should show:

1. Name or handle.
2. Short identity line.
3. Three defining books.
4. One reaction or connection.
5. One visible theme or collection.

People pages should include:

1. Defining books.
2. Reactions.
3. Thought Collections.
4. Book connections.
5. Unfinished Shelf entries.
6. Recurring ideas.

### Books tab

The Books tab should make books feel socially and intellectually alive.

A book preview should show:

1. Cover and title.
2. Common reactions.
3. Interesting readers who reacted to it.
4. One or two connected books.
5. Collections containing it.

Book pages should include:

1. Reactions from users.
2. Connected books.
3. Thought Collections containing the book.
4. People who define themselves through the book.
5. Opposing or unexpected interpretations when available.

## Share objects

The product should support three shareable artifacts.

### Profile

Purpose:

> Share identity.

The profile is the main accumulated artifact. It should be beautiful, legible, and worth sending as a representation of the user's reading persona.

### Book connection

Purpose:

> Share a sharp insight.

Connections may be the most viral unit because they are compact, specific, and screenshot-friendly.

Each connection should have a clean URL and a visual card layout.

### Thought Collection

Purpose:

> Share a developed worldview.

Collections are deeper and more effortful than connections. They should be shareable, but not required for a new user to get value.

## Making the MVP feel alive

The MVP should not depend on a dense network or global feed.

Use:

1. Seeded aspirational profiles.
2. Seeded high-quality Thought Collections.
3. Personal profile-building prompts.
4. Small invite circles.
5. Rotating prompts.

Do not pretend the network is dense before it is.

### Rotating prompt examples

1. Add a book you respected but did not love.
2. Add a book you wanted to be the kind of person who reads.
3. Connect two books about ambition.
4. Mark a book you were not ready for.
5. Add a book that changed your taste.
6. Add a book you hated productively.

## Lessons from Duolingo to apply carefully

Duolingo's useful lesson is not mascots, XP, or punishment. The useful lesson is that repeat behavior happens when the next step is tiny, obvious, and rewarding.

Apply:

1. Tiny first actions.
2. Visible progress.
3. Repairable continuity instead of punitive streaks.
4. Varied prompts so the app does not feel static.
5. Small social accountability before broad social feeds.

Avoid:

1. Punitive streak mechanics.
2. Leaderboards.
3. XP as the main reward.
4. Notification pressure.
5. Turning thought into shallow point scoring.

## Prototype success criteria

There is no single success condition. The first prototype should be judged across several product truths.

After ten minutes, a target user should be able to:

1. Browse taste-rich people and books.
2. React to three books.
3. Create one book-to-book connection.
4. See a profile that feels meaningfully more like them.
5. Understand why this is not Goodreads.
6. Find at least one profile, book, or connection that makes them want to keep exploring.

The strongest signal is not feature completion. The strongest signal is:

> The user wants their profile to exist and improve.

## Explicit MVP exclusions

Do not build these in the first prototype:

1. Global feed.
2. Complex recommendation algorithm.
3. AI-generated thoughts.
4. Forums or debate threads.
5. Advanced graph visualization.
6. Long-form essay editor.
7. Follower-count/status obsession as primary UI.
8. Reading goal or productivity dashboard.
9. Full book database complexity beyond enough search/add behavior.
10. Gamified XP or leaderboards.

The MVP should master the fundamentals before expanding.

## First prototype scope

Build enough to test:

1. People browsing.
2. Book browsing.
3. Profile viewing.
4. Reacting to a book.
5. Creating a simple connection.
6. Viewing a lightweight Thought Collection.
7. Seeing all three share objects: profile, connection, collection.

Fake data is acceptable. Seeded content is acceptable. The first prototype should optimize for product feel and interaction clarity, not backend completeness.
