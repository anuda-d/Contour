# Web MVP Plan

## Purpose

This document defines the smallest staged web build that can test the new product thesis without rebuilding the discarded book-only prototype under different names.

## What must be proven

The first build must test whether target users:

1. Want a public identity built from Thoughts about books and films.
2. Enjoy looking at and exploring their own Map.
3. Can create useful Thoughts without academic friction.
4. Understand the difference between a Thought, Comment, Theme, and private Save.
5. Find other people through interpretation rather than ratings or popularity.
6. Value cross-media and cross-person connections.

The strongest qualitative signal is:

> The user wants to keep shaping and sharing their Map after the guided session ends.

## Platform decision

Start with a responsive web product.

Web is the right first surface because:

- Profiles, Thoughts, Media, and Themes need public URLs.
- Graph exploration benefits from desktop space.
- Visitors can explore without installing an app.
- The model can be iterated quickly.
- The wider web remains a natural source of Media references.

Native mobile is deferred until capture and repeat behaviour are proven. A browser extension or bookmarklet may precede it.

## Stage 0: interaction prototype

### Goal

Prove the identity and Map experience before production infrastructure.

### Data

- One editable prototype User.
- Several seeded public Users with distinct Maps.
- A curated catalogue of Books and Films.
- Seeded Thoughts, Themes, Comments, cross-media bridges, and cross-person references.
- Local persistence is acceptable.

### Required surfaces

- Discovery-led landing and onboarding.
- My Map.
- Public profile.
- Thought creation and correction.
- Thought detail with Comments.
- Book and Film pages.
- Personal Theme view.
- Public Theme space.
- Private Library.
- People discovery and Follow state.

### Required actions

- Search and choose a Book or Film.
- Add a provisional missing work with minimal metadata.
- Create a Draft Thought.
- Anchor and publish a Thought.
- Attach another work to create a bridge Thought.
- Connect two authored Thoughts.
- Create a new Thought referencing a seeded person's Thought.
- Accept, rename, or reject a suggested Theme.
- Feature Media already present in the Map.
- Save privately.
- Appreciate.
- Comment and reply once.
- Follow a person.

### Map requirements

- Automatically generated and visually stable.
- Readable Books, Films, Thoughts, and Themes.
- Immediate growth after creation.
- Whole-map and cluster focus.
- Thought detail from a node.
- Search and basic filters.
- Quiet reference indicator with an optional social layer.
- Usable focused navigation on mobile.

### Prototype exclusions

- Real multi-user authentication.
- Production moderation systems.
- Notifications and email.
- External catalogue synchronization beyond what is needed for the demo.
- Native applications.
- Browser extension.
- Paths authoring unless core work finishes early.
- AI-generated public text or automatic public Theme naming.

## Stage 0 acceptance walkthrough

In roughly fifteen minutes, a target user can:

1. Explore a seeded profile and one meaningful Theme cluster.
2. Choose three Books or Films.
3. Add a compact Thought to each.
4. See the Map change after every Thought.
5. Connect two works through a bridge Thought.
6. Accept or rename a suggested Theme.
7. Feature Media above the Map.
8. Preview the public profile.
9. Open another person's Thought.
10. Save it privately, Appreciate it, and leave a Comment.
11. Author a new Thought that quietly references it.
12. Return to My Map and understand what changed.

The walkthrough fails if users focus mainly on counts, cannot understand the Map, mistake Comments for Thoughts, or do not care about revisiting their profile.

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
- Do suggested Themes feel insightful or invasive?
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

## Build order for Stage 0

1. Shared Book and Film catalogue with niche-work fallback.
2. Thought lifecycle and Media anchoring.
3. Graph projection and stable layout.
4. My Map and Thought detail.
5. Public profile and featured Media.
6. Seeded People and discovery-first onboarding.
7. Themes and Theme suggestions requiring confirmation.
8. Media pages and followed-person prioritization.
9. Save, Appreciate, Comment, and Follow interactions.
10. Cross-person Thought reference and quiet backlink presentation.
11. Responsive focused Map navigation.
12. Full acceptance walkthrough and target-user sessions.

## Validation standard

The prototype is not done because every screen exists. It is done when:

- The complete acceptance walkthrough works through public interface actions.
- The Map remains readable on desktop and navigable on mobile.
- All creation visibly improves the profile.
- No core flow requires ratings, reviews, counts, or a feed.
- The distinction between authored Map content and social conversation remains clear.
- Target users demonstrate desire to continue shaping their own Map.

