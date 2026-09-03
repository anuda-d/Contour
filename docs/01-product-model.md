# Product model

## Purpose

This document defines Contour's current product objects, relationships, lifecycle rules, and public/private boundaries.

## Model boundaries

Contour's shared catalogue contains Books and Films.

A User owns a public profile and Map plus a separate private interest graph and Library.

The public Map is a projection of deliberate taste and authored expression, not the product database or a general activity log.

The core relationships are:

- A User deliberately Likes shared Media publicly.
- A User authors Thoughts anchored to shared Media.
- A User owns a Personal Map containing public taste, published authorship, generated regions, and credited external routes.
- The Map generates personal Theme regions from coherent public material.
- Private behavior informs discovery through an Interest Graph without becoming public identity.

## User

A User's minimum public identity is a handle, display name, profile image or visual mark, and short identity line.

The public profile may accumulate deliberately public Likes, Published Thoughts, authored connections, visible Theme regions, and featured Media.

The profile communicates taste and authorship without audience size, consumption totals, achievements, or public vote scores.

## Media

Media is a shared record for a created work.

The first version supports two types only:

- **Book:** title, author or authors, publication year when known, cover when trustworthy, and optional identifiers such as ISBN.
- **Film:** title, director or directors, release year when known, poster when trustworthy, and optional external catalogue identifiers.

The platform stores metadata rather than the work itself, and the same record is shared across Users.

Missing niche works may be provisional records containing type, title, creator, and optional year.

Duplicate records must be mergeable without losing Likes, Thoughts, Saves, Bookmarks, or discovery provenance.

Missing artwork uses a designed typographic tile, and the system must not invent cover or poster art.

Users should not freely replace shared artwork in the first version.

## Like

A Like is a deliberate public claim that a Book or Film belongs in the User's taste.

It may add the shared Media to the User's public Map without requiring a Thought.

It does not claim authorship, explain why the User likes the work, create a semantic edge, or prove completion.

It is distinct from a private Save, rating, or Vote on another person's contribution.

Removing a Like removes taste-only membership unless the same Media remains public through a Published Thought, connection, or explicit feature.

Public aggregate Like counts are hidden or strongly de-emphasized.

## Thought

A Thought is the primary authored content object.

It may be a reaction, question, interpretation, disagreement, memory, comparison, or conclusion in the author's own words.

Every Thought has an author, free-form core statement, status, and creation timestamp.

A Published Thought has a publication timestamp and at least one Book or Film anchor.

An optional body, precise scene/chapter/passage/timestamp reference, additional Media anchors, and credited Thought or Theme references may add context.

The compact statement must remain usable in discovery and on the Map.

Contour does not require a rating, summary, verdict, theme field, or academic review structure.

A Draft may be unattached while captured, but a Published Thought must have a Media anchor.

A quotation without the User's own expression is not a Thought.

Adding another work makes a Thought a bridge across Media.

A bridge is an authored interaction and presentation of meaning, not a separate content type.

Spatial proximity never creates a semantic connection.

## Thought lifecycle and evolution

### Draft

- A Draft is private to its author and freely editable.
- It may be unattached in a capture inbox.
- It appears on the author's private Map as soon as it is captured.
- It never appears in visitor mode, public search, public recommendations, or a public read model.
- It cannot receive public social interaction.

### Published

- A Published Thought is public and eligible for the author's Map and profile, Media and Theme surfaces, search, and discovery.
- It may receive private Bookmarks, personalized Votes, optional Comments, and credited references.

### Correction

Spelling, grammar, clarity, and inaccurate reference details may be corrected without changing the underlying claim.

Corrections should retain prior versions for trust, for example through an `Edited · View history` affordance.

A changed position is a new Thought, not a rewrite of the original.

Supported relationships include `develops`, `revises`, `contradicts`, `clarifies`, and `references`.

Linked content should indicate when a source was corrected after a relationship was created.

Withdrawal and deletion need an explicit policy before linked public content is treated as disposable.

## Personal Theme region

A Personal Theme is a generated region of related public Likes, Thoughts, Media, and authored relationships in one person's Map.

It is a discovery lens, not a canonical global topic, conventional node, or manually assigned tag.

A Theme appears only when the public Map has enough substance and coherence to support a meaningful region.

Evidence may include multiple works, Thoughts, explicit relationships, and recurring language or ideas.

Spatial proximity alone is insufficient, and exact thresholds remain an empirical product question.

The system generates the name and must distinguish it from the User's authored words.

The owner may rename, hide, dismiss, and later restore a Theme.

Hiding or dismissing a Theme does not delete its underlying Likes, Thoughts, Media, or connections.

A visible Theme is searchable when its Map is public.

Similar personal Themes may be retrieved together without being merged into one objective concept.

## Personal Map

The Map is a generated, shapeable view of one User's deliberate public taste and expression.

Public membership may contain deliberately Liked Books and Films, Published Thoughts, their Media anchors, explicit relationships, visible generated Themes, and credited routes to external material.

It must not contain Drafts, private Saves or Bookmarks, passive searches or views, recommendation history, another person's Thought as if locally authored, or hidden and dismissed Themes.

The layers remain visually and semantically distinct:

- **Taste:** deliberately Liked Books and Films.
- **Authored:** Published Thoughts and explicit connections.
- **Generated:** layout and visible Personal Themes.
- **External:** credited references and navigable social context.

The layout is generated from public membership and actual relationships.

It should remain stable enough to feel familiar, support zooming and region focus, and allow light controls such as moving, pinning, featuring, and hiding generated regions.

Movement and pinning change presentation only.

The Map must not require full manual node placement or become a blank canvas.

## Private interest graph and Library

The Interest Graph is private system state used to personalize discovery.

Possible signals include Likes, Published Thoughts, explicit connections, Saves, Bookmarks, follows, Votes, searches, selected recommendation reasons, repeated deliberate visits, and aggregate similarity.

Authored expression, Likes, Saves, follows, and repeated deliberate actions carry more weight than one impression, view, or raw dwell time.

Passive or private activity never silently changes the public Map.

Recommendation explanations must not reveal sensitive private activity to another User.

Production requires proportionate controls for personalization history, correction, and reset.

The private Library may contain Saved Books and Films, Bookmarked Thoughts, connections, Theme regions, Draft Thoughts, and saved routes to another person's Map.

Saving or Bookmarking does not publish, notify the source by default, add an item to the public Map, create a semantic edge, or imply agreement.

## Social actions

### Save

A Save privately records a Book or Film for possible future reading or viewing.

It does not add the work to the public Map or imply completion, agreement, or a Like.

### Bookmark

A Bookmark privately records another person's Thought, connection, Theme region, or Map route for return.

It preserves source authorship and context and does not copy the material into the User's public Map.

### Vote

A Vote is private feedback about whether a Thought, connection, or discovery route fits the viewer's taste.

An upvote means `More like this for me`, and a downvote means `Less like this for me`.

Neither Vote means objective correctness or changes the author's Map.

Downvotes do not notify the author.

Public totals and global scoreboards are excluded.

Personalized results should retain some varied and opposing perspectives rather than optimizing only for agreement.

### Follow

Following a person prioritizes routes through their public taste, Thoughts, connections, Themes, and Map.

It does not copy their material into the follower's Map or require a chronological home feed.

Follower counts are hidden or strongly de-emphasized.

### Comment

A Comment is optional contextual conversation attached to exactly one public Thought.

It has an author and body.

It is visible through that Thought, has at most one reply level, has no standalone discovery page, and is not a Map node.

It may optionally be developed into a new anchored Thought.

The parent Thought author may disable Comments.

Comments require author controls, moderation, and a separate owner decision before entering a shared discovery phase.

## Cross-person provenance

When a User references another person's Thought or Theme, the new Thought appears in the author's Map and identifies the external source and author.

The source remains owned by and located with its original author, and the relationship is credited and navigable.

Saving or referencing another person's material does not import it into the User's authored Map.

The safe current model is to Bookmark the source, navigate to its original context, publish a new Media-anchored response, and credit the source.

Any future external-branch reuse must preserve authorship, attribution, edit behavior, context, and the distinction between reference and agreement.

Authorship never transfers through Like, Save, Bookmark, Vote, Follow, Comment, or reference.

Generated Theme names are system organization unless the owner explicitly renames them.

## Recommendation contract

Recommendations may combine public, private, and aggregate signals, but the explanation must match the evidence actually used.

When available, the explanation must identify the strongest understandable evidence from a Thought, authored connection, Personal Theme, followed or similar person/Map, or known work that supplied the route.

An inferred recommendation may appear without an explicit connection, but it must not invent human authorship or expose private behavior.

Prioritize direct intent and understandable human evidence before wider aggregate candidates.

Do not rank by global Vote totals, follower count, public Like count, Comment count, posting frequency, engagement velocity, or raw time spent.

## Launch safety requirements

Before a multi-User public launch, Contour needs blocking and reporting at User, Thought, and Comment level, author control over attached Comments, removal of one's own Comment, harassment handling, moderation and appeal policy, and personalization privacy controls.

Votes are taste signals and never substitutes for reporting or moderation.

## Objects deliberately excluded

The current model excludes mandatory or aggregate Ratings, public popularity scores, canonical global Themes, standalone public Posts without a Book or Film anchor, public consumption logs, achievements or streaks, semantic edges created only by movement, and AI-authored Thoughts presented as human expression.
