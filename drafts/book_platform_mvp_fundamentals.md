# Book Platform MVP Fundamentals

## Purpose of this document

This document defines the philosophical and product fundamentals for the first build of the book platform.

It does not define visual design, exact screens, or final implementation details. The goal is to give builders and AI agents enough conceptual gravity to make consistent product decisions without turning the platform into generic Goodreads with nicer fonts.

The MVP should prove one central claim:

> People want a social reading platform where books become signals of taste, identity, and thought, not just objects to rate and review.

## Core product thesis

The platform is a modern social reading app where users build public identity through the books they read, the ideas they notice, and the connections they make.

Books are not the final product. The reader is.

A book entry matters because it says something about the person who read it. A rating matters because it reveals taste. A note matters because it reveals interpretation. A connection matters because it reveals how the user thinks.

The MVP should not attempt to build the full ideas graph immediately. It should create the behaviors that allow the ideas graph to emerge later.

## Human motivation model

The system should be built around two uncomfortable but useful truths.

### 1. People read for identity as much as information

Users do not only read because they want knowledge. They also read because they want to become a certain kind of person and be perceived as that kind of person.

The platform should not pretend otherwise.

Reading is intellectual, emotional, and social. A finished book can signal discipline. A difficult book can signal seriousness. A strange book can signal taste. A thoughtful interpretation can signal depth.

The product should make these signals visible without making them feel fake or desperate.

### 2. The app is performative by design

This should be treated as a feature, not a flaw.

The platform should give users a tasteful stage for their reading identity. Like Letterboxd, the act of logging should feel personal, social, and expressive.

A user should feel that every meaningful action improves their public intellectual profile.

The system should ask:

1. Does this action make the user easier to understand as a reader?
2. Does this action make the user's taste more visible?
3. Does this action make the user's thinking more legible?
4. Does this action create reusable data for future discovery?
5. Does this action feel lightweight enough to repeat?

If the answer is no, the feature probably does not belong in the MVP.

## MVP north star

The MVP should make users feel:

> My reading profile makes me look interesting, and it helps me understand myself better.

The public stage brings users in. The private mirror keeps them.

The platform should let users perform taste, but it should also help them recognize patterns in their own mind.

A good MVP user should be able to say:

1. This profile feels like me.
2. This book says something about me.
3. This idea keeps showing up in what I read.
4. This other user's profile makes me want to read something.
5. This app gives me a better way to express my reading life than Goodreads.

## Audience philosophy

The product should serve two overlapping groups.

### Serious readers

These users want depth, interpretation, connection, and intellectual identity. They may already use notebooks, Notion, Obsidian, Goodreads, StoryGraph, Substack, or private reading journals.

They are likely to create Thought Collections, write longer notes, and care about idea relationships.

### Social and casual readers

These users may come from BookTok, Bookstagram, casual fantasy reading, romance reading, literary fiction circles, or trend driven reading culture.

They may not write long notes, but they care about taste, public identity, reactions, shelves, aesthetics, and social proof.

The MVP must not force casual readers to behave like academics. It must not force serious readers to flatten their thoughts into shallow ratings.

The system should support both through layered depth.

## Layered depth principle

Every major interaction should have a low effort version and a deeper version.

A casual user should be able to log a book, rate it, add a reaction, and move on.

A serious user should be able to connect that book to ideas, other books, and eventually Thought Collections.

The platform should not demand depth. It should invite it.

The graph should be created through ordinary user behavior, not through homework.

## Core primitives

The MVP should be organized around a small number of primitives. These primitives matter more than individual features.

### User

The user is the central object of the platform.

The system is person first, not topic first. Books, ratings, reactions, notes, ideas, and collections all exist partly to make the user's reading identity visible.

A user profile should not be a storage cabinet. It should be a portrait.

### Book

A book is a cultural and intellectual object that can be logged, rated, reacted to, tagged, connected, and collected.

Books should not exist as isolated review objects. A book becomes more valuable when connected to users, ideas, and other books.

### Rating

Ratings should exist because users understand them instantly.

However, ratings should not be the deepest signal in the system. A star rating is familiar, but it is blunt.

The platform should treat ratings as a starting point, not the identity layer.

### Reaction

A reaction expresses the kind of experience a user had with a book.

This is different from quality.

A book can be brilliant but unpleasant. It can be flawed but emotionally important. It can be respected but not loved.

Reactions give users a richer way to perform taste and give the system better emotional and intellectual data.

### Idea

An idea is a reusable concept, theme, tension, question, or philosophy that a user sees inside or across books.

Ideas are not just tags. They are the early edges of the future graph.

Examples include alienation, moral compromise, ambition, power, faith, memory, grief, freedom, obsession, self destruction, and the cost of knowledge.

In the MVP, ideas can begin as user generated labels. The system should preserve flexibility and avoid forcing premature taxonomy.

### Connection

A connection links one book to another through an idea.

This may be the most important atomic action in the product.

A connection says:

> These books belong near each other in my mind, and this is why.

Connections are valuable because they reveal taste, interpretation, and intellectual movement. They also create the raw material for the future ideas graph.

### Thought Collection

A Thought Collection is a curated set of books, ideas, and user commentary around a point of view.

It is not merely a list. It is not a review. It is not an academic essay.

It should feel like a public artifact of thought.

The MVP version of a Thought Collection should be lightweight enough that users can create one without feeling like they are writing a paper.

A Thought Collection should answer:

1. What idea is this exploring?
2. Which books shaped this idea?
3. What does the user think these books reveal together?
4. Why does this collection say something about the user's taste?

### Profile

The profile is the primary identity surface.

It should make a user's reading life feel coherent and expressive. It should show what they read, what they admire, what they abandon, what they return to, and what ideas define their taste.

The profile should be designed as the emotional and social center of the MVP.

### Unfinished Shelf

The Unfinished Shelf is where abandoned books become meaningful data.

Not finishing a book should not simply mean failure or dislike. It can reveal timing, mood, maturity, difficulty, taste mismatch, or future intent.

The Unfinished Shelf makes profiles feel human rather than purely performative.

## MVP behavioral loop

The MVP should support this loop:

1. A user reads or remembers a book.
2. The user logs the book.
3. The user gives it a rating or reaction.
4. The user optionally adds an idea.
5. The user optionally connects it to another book.
6. The user's profile becomes richer.
7. Other users discover the profile, book, idea, or collection.
8. The user's taste gains social meaning.
9. The user returns to refine the profile and add more of themselves.

The most important part is that the loop must work even when the user is not currently finishing books.

The app should give users reasons to return between books by letting them refine ideas, update reactions, revisit unfinished books, and build collections slowly.

## What the MVP should prove

The MVP should prove these assumptions before anything else.

### 1. Users want public reading identity

The product must prove that users want a profile that represents them through books and ideas.

If users do not care about the profile, the app loses its strongest differentiator.

### 2. Users will add lightweight interpretation

The product must prove that users will do more than rate books.

They do not need to write essays. But they must be willing to add reactions, ideas, short thoughts, or connections.

### 3. Connections create discovery value

The product must prove that book to book connections are interesting to browse.

If connections do not help users find books or people, the ideas graph will not matter.

### 4. Collections can be created without academic friction

The product must prove that Thought Collections can feel expressive and lightweight.

If Collections feel like homework, only power users will create them and the graph will stay thin.

### 5. The app feels socially alive before the graph is dense

The MVP cannot depend on a mature graph. It must feel useful and expressive while the network is still small.

This means early value should come from profiles, taste, logging, reactions, and lightweight collections.

## What should be avoided in the MVP

The MVP should avoid features that require density before they create value.

Avoid building the full graph intelligence too early.

Avoid complex debate systems.

Avoid large community forums.

Avoid treating the platform as a wiki.

Avoid academic citation workflows.

Avoid AI generated identity as the default experience.

Avoid making users write long essays before they get value.

Avoid making book pages more important than user profiles.

Avoid copying Goodreads review culture.

Avoid copying Reddit discussion culture.

## AI philosophy for MVP

AI should not be central to the first version.

The value of the platform is human taste, not automated commentary.

AI can later help users refine expression, but the MVP should protect the authenticity of user voice.

The platform should never make users feel like profiles are machine generated performances.

If AI is included at all, it should be quiet, optional, and supportive.

Acceptable future AI roles include:

1. Helping turn messy notes into cleaner summaries.
2. Suggesting possible idea tags.
3. Suggesting related books or connections.
4. Summarizing a user's own collection.
5. Helping users identify patterns in their own reading.

AI should assist taste. It should not replace taste.

## Public and private identity

The platform should support both public and private expression.

Public identity is important because the app is social and performative.

Private control is important because reading can reveal sensitive parts of a person's life.

A user should be able to decide how visible their profile, books, notes, unfinished shelf, and collections are.

The system should assume that some reading data is identity rich enough to require control.

## Copyright and passage philosophy

The product should center user commentary, not reproduced book text.

Passages and quotes can be emotionally important, but public storage of long copyrighted excerpts can create legal and product risk.

The MVP should be conservative.

The system should prefer short quotes, page references, paraphrase, and original user commentary.

The platform should not become a public database of book excerpts.

The value is not the copied passage. The value is what the user thinks the passage means.

## Success criteria

The MVP is successful if it creates visible identity value before it creates full graph value.

Success should be measured by whether users:

1. Build profiles they want to share.
2. Log books because the act improves their identity surface.
3. Add reactions or ideas beyond ratings.
4. Connect books to other books.
5. Create lightweight Thought Collections.
6. Discover other users through taste and ideas.
7. Return between finished books.
8. Feel that the platform expresses something Goodreads cannot.

## Final MVP principle

The MVP should exploit vanity, then convert it into substance.

Users may arrive because they want their reading taste to look interesting.

They should stay because the product helps them understand what they think, what they value, and what ideas keep pulling them back.

