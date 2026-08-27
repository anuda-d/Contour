# Web MVP plan

## Purpose

This document separates what Contour has already built from what the next
discovery proof must test. A staged prototype is evidence only for its stated
question; it does not prove demand, retention, recommendation quality, or
product viability.

## Product sequence

Contour has two complementary foundations:

1. **Contribution and profile:** a person can accumulate deliberate taste,
   authored Thoughts, connections, Themes, and a public Map.
2. **Human discovery:** another person can start from something known, follow
   understandable human evidence, and find an unfamiliar Book or Film worth
   saving.

The completed Identity Map Prototype establishes a substantial part of the
first foundation. The proposed next prototype must test the second before the
repository expands into production infrastructure or a complete social system.

## Platform decision

Continue with responsive web for the next proof.

Web remains appropriate because:

- discovery routes need public URLs;
- search, Media, Thoughts, personal Themes, people, and Maps benefit from
  linkable destinations;
- visitors can explore without installing an app;
- graph and recommendation context benefit from desktop space;
- mobile web can test high-intent search, saving, voting, and capture; and
- the product model can change quickly before native investment.

Native mobile remains deferred until discovery and contribution behavior are
proven. A browser extension or share target may eventually support capture but
is not part of the next proof.

## Stage 0: Identity Map Prototype, complete

### Historical question

Can one User encounter, shape, and grow a small Book-and-Film Thought Map until
it becomes a coherent public profile rather than a technical graph or media
log?

### Implemented result

The completed local prototype supports:

- a mature seeded Editorial Constellation;
- generated layout, semantic zoom, pan, focus, movement, and durable pinning;
- a bounded Book and Film chooser;
- private editable Draft Thoughts;
- anchored publication into a Published-only visitor Map;
- one human-authored cross-media bridge Thought;
- featured public Media;
- a coherent owner and visitor profile composition;
- local durable state; and
- a complete responsive desktop/mobile, light/dark acceptance walkthrough.

### Evidence boundary

The owner accepted this as a completed MVP foundation on 2026-08-26. The
software and bounded interaction walkthrough are complete. This acceptance does
not claim:

- that target users want to create Maps;
- that Contour improves real discovery;
- that seeded recommendations are trustworthy;
- that people return after saving a work;
- that the product has demand or retention; or
- that the prototype is production-ready.

The historical goal, implementation state, and visual design foundation remain
the authoritative record of what was built.

## Proposed Stage 1: Human Discovery Prototype

Status: product direction is settled; implementation requires a separate
owner-approved goal and authorization.

### Question

Can someone start from a Book, Film, or idea they already know, discover an
unfamiliar Book or Film through understandable human evidence, and care enough
to save it?

### Strongest qualitative signal

> This gave me a more convincing route to something new than a generic list,
> opaque algorithm, or disconnected social post.

### Bounded data

- Several seeded public people with distinct Maps.
- A curated Book and Film catalogue large enough to support surprising routes.
- Seeded free-form Thoughts and explicit cross-work connections.
- Seeded personal Theme regions with generated-name provenance.
- Honest forced personalization inputs for one local viewer.
- Local state is acceptable.

The prototype may force or seed recommendation candidates, but the interface
must disclose that limitation in evidence. It may not imply that a production
recommender or real multi-User behavior exists.

### Required surfaces

- Discovery-led landing example.
- Explore as the signed-in home.
- Search from a known work or idea.
- Bounded recommendation results with reasons.
- Media page or equivalent Media context.
- Thought and connection detail.
- Personal Theme region detail.
- Public person and Map exploration using the existing foundation.
- Private Library state for Saved works and Bookmarked evidence.
- Starter-Map state from deliberately Liked familiar works.

### Required actions

- Start from a known Book, Film, or idea.
- Receive unfamiliar Book and Film candidates.
- Inspect the human evidence behind a candidate.
- Move through a Thought, connection, Theme region, and person's Map.
- Upvote or downvote the personal relevance of evidence.
- Bookmark the evidence privately.
- Save an unfamiliar work privately.
- Like a familiar work publicly and see it enter a starter Map taste layer.
- See an understandable recommendation reason update when relevant.

### Acceptance walkthrough

In roughly ten minutes, a target User can:

1. Encounter one strong example of a known work leading to an unfamiliar work
   through a real person's explanation.
2. Select a Book, Film, or idea they already care about.
3. Receive several bounded candidates and distinguish why each appeared.
4. Open one Thought or connection and understand the human meaning.
5. Continue into the contributor's personal Theme region or Map.
6. Upvote, downvote, or Bookmark the route without producing a public score.
7. Save one unfamiliar Book or Film privately.
8. Deliberately Like familiar works and see a lightweight public Map begin.
9. Return to Explore without being placed in an infinite feed.
10. Prefer at least one resulting discovery route to an opaque or generic
    recommendation.

### Failure conditions

The proof fails if:

- candidates feel like arbitrary seeded cards;
- the User cannot tell why a work was recommended;
- human evidence is decorative rather than decision-useful;
- personal Themes look like generic tags;
- Votes appear to establish correctness or global popularity;
- Saves, Bookmarks, or passive activity leak into the public Map;
- liking familiar works requires writing before a starter Map appears;
- Explore behaves like an endless engagement feed; or
- the User finds nothing worth saving.

### Exclusions

- Real multi-User authentication.
- Production recommendation infrastructure or machine-learning claims.
- Live behavioral analytics collection.
- Production Media-catalogue synchronization.
- Public vote, Like, or follower counts.
- Comments; reconsidering them requires a later owner decision.
- Notifications or an activity feed.
- Cross-Map branch import.
- Canonical global Themes or manual Theme filing.
- Production moderation, privacy, security, or deployment.
- Native applications.

## Stage 2: closed web alpha

Only after the discovery interaction shows promise should a closed alpha add
real shared state and behavior.

### Additional requirements

- Authentication and account recovery.
- Persistent database and stable public URLs.
- Real Likes, Saves, Bookmarks, Votes, and Follows.
- Media-record deduplication and merging.
- Image-source and metadata provenance.
- Real recommendation candidate generation and explanation logging.
- Personalization history, correction, reset, and privacy controls.
- Blocking, reporting, moderation, and appeal tooling.
- Revision history and content withdrawal rules.
- Accessibility, responsive behavior, and performance budgets.
- Security and privacy review.
- Product analytics focused on discovery outcomes rather than engagement
  maximization.

### Alpha research questions

- Do Users find and later act on Saved Books or Films?
- Which human evidence most improves confidence: Thoughts, direct connections,
  personal Themes, people, or similar Maps?
- Which explicit and passive signals improve relevance without feeling creepy?
- Do personalized Votes help without collapsing discovery into agreement?
- Do Users deliberately Like familiar works after receiving discovery value?
- Do Thoughts and connections accumulate without forced prompts?
- Do generated Theme names feel useful, generic, or misrepresentative?
- Does following a person improve discovery without a home feed?
- How frequently do Users return at natural discovery and contribution moments?
- Which Map views remain legible as taste-only and authored layers grow?

## Stage 3: expansion only after proof

Candidates, not commitments:

- Comments and quiet activity notifications.
- Cross-person Thought references and backlinks.
- Carefully designed external Map-branch reuse.
- Paths through works, Thoughts, and Theme regions.
- Browser capture or share extension.
- Native mobile capture.
- Additional created-media types.
- Stronger graph history and time travel.
- Assistive Theme and connection suggestions.

No candidate should be promoted merely because it is available to implement.

## Validation standard

A prototype is not done because every planned screen exists.

For the proposed discovery proof, completion requires:

- the walkthrough to work through visible interface actions;
- public and private state boundaries to remain clear;
- every recommendation reason to match its actual evidence;
- the existing Map and Draft/Published behavior to remain intact where reused;
- responsive desktop and mobile behavior;
- focused checks and `./scripts/check.sh` to pass;
- a full rendered checkpoint at the cadence defined by the active goal;
- fresh independent review with no unresolved blocker; and
- honest documentation of forced data, special cases, and unproven claims.

The primary outcome is useful discovery, not daily activity, time spent,
content volume, or profile completion.
