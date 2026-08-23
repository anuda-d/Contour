# Identity Map Prototype

Status: active; owner-approved on 2026-08-20. Standing goal-bounded autonomous
implementation was authorized on 2026-08-22 until this goal is complete.

## Question

Can someone encounter a small, media-grounded Thought Map that already feels
coherent, explore and shape it intuitively, and then grow it through authored
Thoughts until it becomes a public identity artifact rather than a review
page, media log, or technical graph?

## Goal Result

Build a responsive, locally persistent interaction prototype in which one User
can:

1. encounter a compelling seeded Map that creates the desire to make one;
2. move through and spatially shape its automatically generated graph;
3. choose three Books or Films;
4. write a Thought about each without following a review template;
5. see every Thought appear immediately as a private Draft node;
6. publish those Thoughts into the public version of the Map;
7. create one meaningful cross-media bridge Thought;
8. feature selected Media; and
9. preview the profile exactly as a visitor would encounter it.

The result is an honest interaction prototype that can be evaluated by the
owner and placed in front of target users. Completing the software does not by
itself prove retention, market demand, or product viability.

## Product Boundary

This goal owns the smallest end-to-end identity experience:

- a desirable seeded Map as the first visible product surface;
- a readable generated graph and direct spatial interaction;
- a bounded Book and Film catalogue sufficient for the walkthrough;
- non-review Thought capture;
- private Draft and public Published states;
- a generated graph projection of Media, Thoughts, and authored relationships;
- one cross-media bridge Thought;
- a public profile layered over the proven Map;
- lightweight profile curation through featured Media;
- local persistence; and
- responsive owner and visitor views.

It does not own the wider social network, production infrastructure, or the
later Theme and discovery systems.

## Invariants

- The product remains a social identity platform whose primary artifact is the
  User's displayed Map.
- Books and Films are the only supported Media types.
- Every Published Thought has at least one Media anchor.
- A Draft appears immediately and distinctly on the owner's private Map but
  never appears in visitor mode.
- The User authors every public interpretation. No AI-written identity or
  automatically published interpretation is permitted.
- Thought creation does not use ratings, verdicts, consumption statistics, or
  a conventional review template.
- The Map begins with a coherent generated layout. The User does not face a
  blank canvas or need to arrange every node manually.
- Spatial movement does not silently create an unexplained semantic
  relationship.
- Themes are not graph nodes or manual categories in this goal.
- The graph and its surrounding creation experience evolve together; neither
  may be treated as a decorative afterthought.
- The first implementation foundation is the visible, interactive Map. It is
  built with the smallest application and data substrate required to evaluate
  real graph behavior, before profile or creation-flow work begins.
- The profile must feel expressive and socially presentable rather than like
  graph-analysis or productivity software.
- No engagement-ranked feed or public popularity score is introduced.

## Completion Criteria

- **IM-1 Desirable Map:** A seeded mature Map immediately communicates an
  authored display of a person and creates a credible desire to make one.
- **IM-2 Non-review expression:** Thought capture invites what a work caused
  the User to notice, feel, question, connect, or believe without ratings or
  conventional review prompts.
- **IM-3 Draft boundary:** A newly captured Draft appears immediately and
  distinctly on the private Map, remains editable, and is absent from visitor
  mode.
- **IM-4 Generated living Map:** The prototype generates a readable and
  visually stable starting layout and changes visibly after every relevant
  creation or publication action. After the three-work walkthrough, the owner
  can recognize at least one relationship or region that makes the works feel
  like parts of the same displayed mind rather than an arbitrary arrangement.
- **IM-5 Intuitive spatial control:** The User can pan, zoom, move nodes, and
  use an owner-approved persistence or pinning behavior without graph-software
  terminology or required manual layout work.
- **IM-6 Authored bridge:** The User can connect two works through one Thought
  anchored to both, and a visitor can understand the authored meaning rather
  than encountering an unexplained line.
- **IM-7 Public identity boundary:** Publishing and featuring update a coherent
  visitor-facing profile while all private material remains excluded.
- **IM-8 Integrated creation:** The creation flow returns the User to the Map
  and reveals each change there instead of hiding the graph behind a sequence
  of disconnected forms.
- **IM-9 Responsive experience:** The core walkthrough is usable and visually
  coherent on representative desktop and mobile viewports, with focused
  navigation where the complete graph would be unreadable.
- **IM-10 Durable acceptance walkthrough:** Local state survives reloads; the
  complete walkthrough passes through visible interface actions; focused and
  full repository checks pass; independent review has no unresolved blocking
  findings; and every criterion has proportionate accepted evidence under the
  standing goal authorization.

## Graph-First Entry Gate

Before work may be selected for profile, onboarding, Thought capture,
publishing, or production infrastructure, the implementation must establish an
accepted graph foundation that advances IM-1, IM-4, or IM-5 through visible
evidence. Acceptance requires full validation, clean fresh independent review,
and a local commit under the standing goal authorization.

The first graph work unit must produce a running 2D Map surface using seeded
Books, Films, Thoughts, and explicit authored relationships. It must combine
the smallest necessary application substrate with generated layout and direct
interaction so the result can be rendered and evaluated. A data model without
a visible graph, a decorative graph without meaningful node types, and a
profile shell that merely reserves space for a future graph do not satisfy the
gate.

The bounded unit does not need to implement profiles, onboarding, capture,
Draft or Published flows, authentication, or a production backend. The owner
approved the core graph visual language and lasting placement policy on
2026-08-22 after reviewing the first candidate. Those decisions are recorded
in the [Map Design Foundation](MAP_DESIGN_FOUNDATION.md).

## Owner Decisions Inside the Goal

The owner selected these lasting foundations on 2026-08-22:

- ordinary node movement is temporary, while durable placement requires an
  explicit **Pin position** action; and
- the Map uses the semantic-zoom Editorial Constellation language recorded in
  the [Map Design Foundation](MAP_DESIGN_FOUNDATION.md), including recognizable
  Media anchors, floating Thought typography, selective relationship
  visibility, subtle unlabeled regions, and a shared owner/visitor composition.

The following visual decision remains owner-gated and may not be settled by the
loop:

- the exact visual treatment that distinguishes private Draft Thoughts from
  Published Thoughts without detaching either from the shared Map language.

If that decision blocks a work unit, stop at **NEEDS OWNER DECISION** with a
concrete comparison. Do not silently choose a lasting product direction.

## Out of Scope

- Theme recognition, naming, or Theme spaces
- Similar-Map, people, or wider discovery systems
- Follow, Save, Appreciate, Comment, activity, or notification behavior
- Cross-person Thought references or backlinks
- General Thought-to-Thought relationship design beyond the bridge required by
  IM-6
- Real multi-user authentication or account recovery
- Production database, moderation, privacy, security, or deployment systems
- Full Media pages, provisional Media records, or live catalogue integrations
- AI-written Thoughts, identity, or automatically published labels
- Paths
- Proof of retention, market demand, or product viability through real users

## Specification Routing

After selecting one smallest useful goal gap, read only the relevant parts of:

- [Map Design Foundation](MAP_DESIGN_FOUNDATION.md) for every change affecting
  Map presentation, interaction, visibility, or reusable UI foundations;
- the `design-taste-frontend` skill for every relevant Map UI implementation,
  including its Design Read, dials, redesign audit, and applicable pre-flight
  checks;
- [Product Foundation](../../00-product-foundation.md) for philosophy, pillars,
  and protected product boundaries;
- [Product Model](../../01-product-model.md) for User, Media, Thought, Draft,
  Published, bridge, and Map semantics;
- [Experience Architecture](../../02-experience-architecture.md) for Map,
  profile, Thought detail, onboarding, and responsive behavior; and
- [Web MVP Plan](../../04-web-mvp-plan.md) for the Stage 0 walkthrough and
  validation standard.

The [Open Questions](../../05-open-questions.md) are boundaries around owner
authority, not an implementation backlog. The [Social Contract](../../03-social-contract.md)
is later context unless an implementation threatens one of its authorship or
anti-popularity invariants.

## Completion Boundary

Complete IM-1 through IM-10 through single-work-unit runs selected from current
verified evidence. Every implementation unit must pass focused and full
validation and receive fresh independent review. A clean unit is accepted and
committed locally under the standing goal authorization, then the loop continues
with the next smallest justified gap.

The owner remains the authority for unresolved material product, visual, scope,
and lasting architecture decisions and for any later goal. Routine alignment
and final completion do not require owner review when the documented criteria,
validation, and fresh independent review are all satisfied. Mark the goal
complete, commit the final state update, and stop before selecting another goal.
