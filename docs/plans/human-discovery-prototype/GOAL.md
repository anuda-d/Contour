# Human Discovery Prototype

Status: deferred proposal; not active and not authorized for implementation.

## Owner decision

The owner approved this proposal on 2026-08-27, then selected Architecture
Foundation as the active goal on 2026-08-28.
This proposal is retained for later reconsideration but has no implementation
authority and is not an active goal.

## Question

Can someone begin with a Book, Film, or explicitly supported idea they already
know, discover an unfamiliar Book or Film through understandable human
evidence, inspect the person and context behind that evidence, and care enough
to Save the unfamiliar work privately?

## Goal result

Build a responsive, locally persistent Human Discovery Prototype in which one
local viewer can:

1. encounter one strong seeded example of a familiar work leading to an
   unfamiliar work through a person's explanation;
2. start Explore from a known Book, Film, or bounded seeded idea;
3. compare a finite set of unfamiliar Book and Film candidates;
4. understand the public human evidence that explains every candidate;
5. move through a Thought, authored connection, personal Theme region, person,
   and public Map where those routes are present;
6. privately Vote on or Bookmark evidence and privately Save an unfamiliar
   work;
7. deliberately Like a familiar work and see it enter the public taste layer
   of a starter Map without writing a Thought; and
8. return to finite Explore and private Library surfaces without entering an
   engagement feed.

The result is an honest local interaction prototype that can be evaluated by
the owner and placed in front of target users.
Completing the software does not prove recommendation quality, demand,
retention, repeated use, or product viability.

## Strongest evaluation signal

> This gave me a more convincing route to something new than a generic list,
> opaque algorithm, or disconnected social post.

This qualitative comparison guides evaluation but is not manufactured by the
interface and is not inferred from time spent or daily activity.

## Product boundary

This goal owns the smallest complete discovery experience that can exercise the
question above:

- a discovery-led landing example and finite Explore home;
- bounded search from known Books, Films, and explicitly supported seeded ideas;
- several unfamiliar candidates with reasons derived from public seeded
  evidence;
- compact Media, Thought or connection, personal Theme, person, and public Map
  context sufficient for the walkthrough;
- several seeded public people with distinct Maps and attributed material;
- a curated Book and Film catalogue large enough to support honest unfamiliar
  routes;
- private local Save, Bookmark, and personalized Vote state;
- a quiet private Library that exposes the saved work and bookmarked evidence;
- deliberate public Like state and a lightweight starter Map taste layer;
- honest forced personalization inputs for one local viewer;
- reuse of the completed Identity Map Prototype where Map context is needed;
- local persistence; and
- responsive desktop and mobile behavior.

It does not own a production social network, real recommendation system, live
multi-User data, or production infrastructure.

## Protected invariants

- Books and Films remain the only supported Media types.
- Discovery provides value before requiring Map-building or authored labor.
- Every confident recommendation reason resolves to the actual public evidence
  displayed by the interface.
- An inferred similarity is never presented as a direct human connection.
- Public authorship and generated organization remain distinguishable.
- A public Thought remains anchored to at least one Book or Film.
- The existing private Draft and public Published boundary remains intact.
- Another person's Thought is always credited and never presented as the local
  viewer's authorship.
- A Save, Bookmark, personalized Vote, search, view, dwell event, or other
  private behavior never silently changes the public Map.
- A personalized Vote never becomes a public score or claim of objective truth.
- A Like is a deliberate public taste action distinct from Save, Bookmark,
  Vote, selection, featuring, and authored expression.
- A Like may add Media to the public taste layer without creating authorship,
  completion, agreement, or a semantic relationship.
- Spatial Map movement never creates semantic authorship.
- Personal Themes remain attributed regions of one person's public Map.
- A generated Theme name is presented as generated unless the owner renamed it.
- Themes do not become canonical global tags, manually filed categories, or
  ordinary graph nodes.
- Explore remains finite and intentional rather than becoming an infinite or
  engagement-ranked feed.
- No public popularity, follower, Like, Vote, consumption, or completion score
  becomes a discovery shortcut.
- AI or automation may assist retrieval, ranking, or generated Theme naming but
  may not fabricate public evidence or impersonate a User.

## Prototype-honesty guardrails

- Seeded people, profiles, Maps, Thoughts, connections, Themes, catalogue data,
  recommendation candidates, and personalization inputs are identified as
  prototype data in the interface or recorded evidence where appropriate.
- The prototype never implies that seeded people are authenticated live Users,
  that seeded actions happened on a network, or that real aggregate behavior
  exists.
- Every candidate and displayed reason shares machine-verifiable provenance.
  Copy detached from its evidence record cannot satisfy the goal.
- Forced candidate generation is allowed only when its limitation is explicit.
  The interface may not claim production recommendation quality, machine
  learning, or real behavioral inference.
- Seeded personal Themes may demonstrate attributed discovery routes and
  generated-name provenance.
  This goal does not implement or validate a Theme-formation threshold,
  clustering quality, or a general Theme-matching algorithm.
- Local persistence is acceptable and must not be described as a real account,
  synchronized profile, or production privacy guarantee.
- Analytics collection is excluded.
  Evaluation evidence is recorded deliberately rather than inferred from hidden
  tracking.

## Attributed-evidence source gate

The first discovery entry unit cannot begin until the owner selects the allowed
source for attributed human evidence.

Record the selected source using exactly one of these values:

- `owner-authored` for material attributed truthfully to the owner;
- `contributor-supplied` for material used with permission and correct
  contributor attribution; or
- `other-owner-approved` for another source with documented permission,
  provenance, and truthful attribution.

The matching attribution treatment is respectively `credited owner`, `credited
contributor`, or `credited approved source`.
The permission and provenance record must contain the concrete basis rather
than a placeholder.

Explicitly fictional fixture personas and copy may test layout, navigation,
state, privacy, and provenance mechanics only.
They must be labelled as fictional prototype fixtures and cannot satisfy a
claim that a real person's evidence was persuasive.

AI-generated, unattributed, scraped without permission, or falsely attributed
Thoughts cannot satisfy HD-1, HD-3, HD-4, or the discovery-first entry gate.
Automation may not impersonate a person merely because the interface is a
prototype.

Before clearing this owner decision, record the selected source and its
permission or provenance basis in the mirrored run-state fields and the Owner
decision record in the shared implementation state.
The decision must remain available to every fresh chat.

## TypeScript migration contract

The owner approved incremental TypeScript adoption as an engineering constraint
inside this goal.

- New discovery domain, state, provenance, and application modules use strict
  TypeScript.
- The first visible discovery entry unit may add the smallest supported browser
  build and development substrate needed to run TypeScript.
- That same unit must deliver visible end-to-end discovery behavior.
  A compiler, configuration, or build pipeline by itself is not goal progress.
- Type checking becomes part of `./scripts/check.sh` when the TypeScript
  substrate is introduced.
- The TypeScript substrate declares `compilerOptions.strict: true` in the root
  `tsconfig.json` and provides repository `typecheck` and `build` scripts that
  the full check executes.
- The build check must exercise the supported browser entry rather than only
  emitting or checking isolated modules.
- Untouched legacy JavaScript may remain JavaScript.
- A legacy module is migrated only when the current bounded behavior requires
  touching it or when migration is the smallest safe way to preserve a typed
  interface.
- Every migration preserves behavior and retains or improves focused tests.
- A whole-codebase conversion is not an entry condition or completion
  criterion.
- Introducing TypeScript does not authorize a framework, router, state-library,
  CSS-system, test-framework, Map, or application rewrite.
- Toolchain replacement, broad dependency churn, generated-code adoption, or a
  second application architecture requires a separate owner decision when it
  is not the smallest necessary substrate for visible behavior.

## Discovery-first entry gate

Before work may be selected for broader Search, Theme exploration, Votes,
Bookmarks, Likes, Library organization, or additional discovery routes, the
implementation must establish one accepted visible vertical slice:

1. begin from one known seeded work;
2. show at least one unfamiliar candidate;
3. derive its reason from an actual attributed Thought or authored connection;
4. open the evidence and contributor's public Map context;
5. Save the unfamiliar work privately;
6. return to a finite Explore state; and
7. reload without publishing the Save or changing either person's public Map.

The entry unit may establish the smallest TypeScript browser and validation
substrate required for this behavior.
It may not be satisfied by types, data models, routing, generic cards,
placeholder screens, or infrastructure without the complete visible route.

The gate becomes approved only after focused and full validation, proportionate
rendered evidence, clean fresh independent review, recorded accepted evidence,
and one local commit under standing authorization.

This entry gate is a selection constraint, not a future task queue.

## Completion criteria

- **HD-1 Discovery-led first value:** First use demonstrates a convincing
  familiar-to-unfamiliar human route before asking for authored work or Map
  construction.
- **HD-2 Bounded known-context discovery:** Explore accepts a known Book, Film,
  or explicitly supported seeded idea and returns several finite unfamiliar
  Book and Film candidates rather than an infinite feed.
- **HD-3 Truthful recommendation reasons:** Every candidate distinguishes why
  it appeared and links that explanation to its actual public Thought,
  connection, personal Theme, person, or Map evidence without exposing private
  behavior.
  At least one acceptance route uses owner-approved human-authored evidence
  under the attributed-evidence source gate.
- **HD-4 Navigable human context:** The walkthrough can move through the
  relevant Thought or connection, personal Theme region, contributor identity,
  public Map, and Media context across several seeded contributors while
  preserving authorship and generated-name provenance.
- **HD-5 Private discovery utility:** Personalized Vote, Bookmark, and Save are
  distinct, locally durable private actions.
  They appear in the appropriate detail or Library context and never create a
  public count, notification, semantic edge, or public Map membership.
  When a Vote changes a bounded local recommendation reason, the interface
  explains that personal effect without implying global truth.
- **HD-6 Deliberate starter Map:** A familiar work enters the local viewer's
  public taste layer only through an explicit Like with a clear public
  consequence, without requiring a Thought or implying completion or
  authorship.
- **HD-7 Finite Explore and quiet Library:** The viewer can return to Explore
  and find Saved works and Bookmarked evidence in a private Library without a
  chronological activity stream, streak, or engagement loop.
- **HD-8 Preserved Map foundation:** Existing owner and visitor Map behavior,
  Draft and Published privacy, authored bridges, curation, placement, and
  responsive visual foundations remain intact wherever reused.
- **HD-9 Incremental strict TypeScript:** New discovery code is type-checked
  under the migration contract, typed provenance prevents reason and evidence
  drift, and no big-bang migration or unrelated architecture rewrite becomes a
  prerequisite.
- **HD-10 Durable acceptance walkthrough:** The complete roughly ten-minute
  walkthrough works through visible actions on representative desktop and
  mobile viewports, local state survives reload, forced behavior is disclosed,
  focused and full checks pass, the final rendered checkpoint passes, fresh
  independent review has no unresolved blocker, and evidence records do not
  overclaim product validation.

## Failure conditions

The goal is not complete if:

- candidates feel like arbitrary seeded cards;
- a displayed reason cannot be traced to its actual public evidence;
- human evidence is decorative rather than useful for deciding whether to Save;
- the unfamiliar destination is not actionable from its evidence route;
- personal Themes look like global tags or authored labels when they are not;
- Votes appear to establish correctness or global popularity;
- Saves, Bookmarks, Votes, searches, views, or dwell leak into a public Map;
- a Like is confused with a private Save or requires writing before a starter
  Map appears;
- Explore behaves like an endless engagement feed;
- TypeScript work becomes a broad rewrite without visible discovery evidence;
- existing Map, Draft, Published, authorship, or visitor boundaries regress; or
- forced prototype behavior is presented as real multi-User or recommendation
  evidence.

## Explicit exclusions

- Real multi-User authentication or account recovery
- Production database or synchronized shared state
- Production recommendation infrastructure or machine-learning claims
- Live behavioral analytics or hidden evaluation tracking
- Production Media-catalogue synchronization
- Media deduplication and merging workflows
- Production artwork licensing, caching, or provenance systems
- Comments, notifications, or an activity feed
- A real Follow system or follower lists
- Public Vote, Like, Save, Bookmark, follower, or popularity counts
- Canonical global Themes or manual Theme filing
- Production Theme generation, clustering, or similarity matching
- Cross-Map branch import
- Production moderation, privacy, security, or deployment
- Native applications, browser extensions, or share targets
- A framework, router, state-library, CSS-system, test-framework, or Map rewrite
- Complete migration of untouched legacy JavaScript
- Proof of demand, retention, repeated use, or product viability

## Later owner-decision gates

The first known-work to evidence to private-Save entry slice does not require
these later presentation decisions.
Before a work unit first changes any corresponding surface, stop for the
smallest owner decision on:

- the exact visual and explanatory distinction between public Like and private
  Save;
- the exact personalized Vote presentation and bounded effect on recommendation
  reasons;
- the exact taste-only versus Published-Thought distinction across Map zoom
  levels; and
- the exact presentation of generated Theme naming, provenance, correction,
  hiding, and dismissal inside this prototype.

These are decision boundaries, not a task queue.
No implementation chat may settle them from the Open Questions document alone.

## Acceptance walkthrough

In roughly ten minutes, the owner or a target User can:

1. encounter one strong seeded example of a known work leading to an unfamiliar
   work through a person's explanation;
2. select a known Book, Film, or supported idea;
3. receive several bounded candidates and distinguish why each appeared;
4. open one Thought or connection and understand the human meaning;
5. continue into the contributor's personal Theme region or public Map;
6. Vote on or Bookmark the route without producing a public score;
7. Save one unfamiliar Book or Film privately and find it in Library;
8. deliberately Like a familiar work and see a lightweight public starter Map
   begin without writing;
9. return to finite Explore and reload with all public and private boundaries
   preserved; and
10. compare the resulting human route with a generic list or opaque
    recommendation without the product claiming a preferred answer.

## Validation standard

- State the criterion, intended behavior, and evidence before every unit.
- Use one to three read-only explorers before implementation.
- Keep one sole implementation writer.
- Run focused checks first and `./scripts/check.sh` before review.
- Run full rendered desktop and mobile, light and dark, keyboard and touch,
  responsive, reduced-motion where relevant, and console validation at the
  established five-UI-unit checkpoint and again before goal completion.
- Use fresh independent read-only review after implementation and after every
  material correction.
- Preserve exact candidate provenance and public/private projection in tests.
- Record forced behavior, special cases, risks, and unsupported claims.
- Accept and commit only one coherent unit per fresh implementation chat.
- Do not push, merge, deploy, publish, or create unrelated external effects.

## Specification routing

After selecting one smallest useful gap, read only the relevant parts of:

- [Product Foundation](../../00-product-foundation.md) for philosophy, pillars,
  discovery promises, and protected boundaries;
- [Product Model](../../01-product-model.md) for Media, Like, Thought, personal
  Theme, Map, private interest, Library, Vote, and provenance semantics;
- [Experience Architecture](../../02-experience-architecture.md) for Explore,
  Search, Media, Thought, Theme, profile, Map, Library, and responsive behavior;
- [Social Contract](../../03-social-contract.md) when a unit touches Votes,
  recommendation explanations, Following, or cross-person behavior;
- [Web MVP Plan](../../04-web-mvp-plan.md) for Stage 1 scope, walkthrough,
  failure conditions, exclusions, and validation;
- [Open Questions](../../05-open-questions.md) as owner-decision boundaries,
  never as a backlog; and
- [Editorial Constellation](../identity-map-prototype/MAP_DESIGN_FOUNDATION.md)
  plus the `design-taste-frontend` skill for every relevant visual or reusable
  frontend unit.

## Owner authorization boundary

The goal is owner-approved.
Current authorization is recorded only in `CURRENT.md` and the shared
implementation state.
When those records say `paused`, the goal may be discussed, audited, or
corrected but no implementation unit may be selected or started.

Standing authorization, when explicitly recorded after owner direction,
permits successive bounded units only inside this goal and under the fresh-chat
handoff contract.
It does not authorize a broader product phase, production infrastructure,
deployment, push, merge, publication, destructive cleanup, or an unresolved
owner decision.
