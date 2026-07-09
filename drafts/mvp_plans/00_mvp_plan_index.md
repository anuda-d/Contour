# MVP Implementation Slice Index

## Goal
Provide the implementation order and shared rules for building the book platform MVP as tiny, stack-agnostic loop-session slices.

## Done Means
- Every slice in this folder has a definite goal, clear scope, explicit guardrails, interface expectations, acceptance checks, and dependencies.
- A builder can pick the next numbered file and implement it without deciding product strategy.
- Logic-heavy slices identify the public seam that must be confirmed before TDD begins.

## Scope
- Defines the implementation order for all MVP planning slices.
- Defines shared product guardrails and data vocabulary.
- Defines the TDD rule that logic-heavy slices must follow.
- Does not describe a specific application stack because the repository currently contains planning documents only.

## Out Of Scope
- Application implementation.
- Framework selection.
- Database selection.
- Deployment planning.
- Production launch checklist.

## Product North Star
The MVP proves that readers want a public reading identity where books, reactions, connections, and lightweight collections make them look interesting and help them understand their taste.

Books are not the final product. The reader is.

## Product Guardrails
- Optimize for identity, taste, lightweight interpretation, and discovery.
- Make the profile the emotional reward of user effort.
- Keep reactions more prominent than ratings as the public identity layer.
- Make connections compact, specific, and shareable.
- Make Thought Collections aspirational but lightweight.
- Use seeded profiles, books, collections, and prompts to make the MVP feel alive before network density exists.
- Do not build a global feed, debate forum, leaderboard, XP system, productivity dashboard, long-form essay editor, advanced graph visualization, AI-generated identity layer, or full book database.
- Do not make users write academic notes before seeing value.
- Do not center follower counts or popularity status as the primary interface.

## User Flow
A builder starts here, reads the global guardrails and shared vocabulary, then implements the numbered slice files in order.

## Data / Interface Expectations
- Slice plans are stack-agnostic and should remain usable for a web app, prototype, or native app implementation.
- Public seams named in slice files are examples of boundaries to confirm before implementation, not mandatory function names.
- Later implementation should preserve the shared vocabulary unless the product spec changes.

## Shared Data Vocabulary
- **User:** public reader identity with handle, name, identity line, defining books, reactions, collections, connections, recurring ideas, and optional unfinished shelf.
- **Book:** cultural object with title, author, cover, short description, common reactions, readers, connections, and collections.
- **Reaction:** expressive label attached by a user to a book; examples include `Changed me`, `Respected, not loved`, `Beautiful but hollow`, and `Could not finish, still think about it`.
- **Connection:** user-authored link between two books through an idea label and one-sentence explanation.
- **Thought Collection:** title, one-line thesis, three to five books, one short note per book, and optional connection between at least two books.
- **Unfinished Shelf Entry:** book, reason, optional note, and visibility state.
- **Prompt:** small action invitation that nudges a user to add a book, reaction, connection, or unfinished entry.

## TDD Guidance
Use `$tdd` in the logic-heavy implementation slices named below. Confirm the public seam before tests are written, then run one red-green cycle at a time.

## Acceptance Checks
- The folder contains this index and 20 numbered implementation-slice files.
- Every implementation-slice file includes Goal, Done Means, Scope, Out Of Scope, Product Guardrails, User Flow, Data / Interface Expectations, TDD Guidance, Acceptance Checks, and Dependencies.
- Logic-heavy slices identify a public seam and a first red test.
- The plan remains stack-agnostic.

## Dependencies
- Product source documents in `/Users/anuda/Desktop/bproject/drafts`.

## Implementation Order
1. `01_seeded_content_foundation.md`
2. `02_core_domain_model.md`
3. `03_primary_navigation_shell.md`
4. `04_people_browse_seeded_profiles.md`
5. `05_person_profile_identity_surface.md`
6. `06_books_browse_surface.md`
7. `07_book_detail_social_context.md`
8. `08_reaction_catalog_and_reaction_capture.md`
9. `09_profile_updates_from_reactions.md`
10. `10_onboarding_discovery_first.md`
11. `11_three_book_profile_builder.md`
12. `12_connection_creation_flow.md`
13. `13_connection_detail_share_object.md`
14. `14_thought_collection_view.md`
15. `15_collection_share_object.md`
16. `16_unfinished_shelf_texture.md`
17. `17_rotating_prompts.md`
18. `18_profile_share_object.md`
19. `19_empty_loading_and_seeded_states.md`
20. `20_mvp_acceptance_walkthrough.md`

## TDD Rule For Logic-Heavy Slices
When a slice includes non-trivial domain logic, use red-green TDD:
- Confirm the public seam before writing tests.
- Write one failing behavior test first.
- Implement only enough behavior to pass.
- Test through public interfaces, not private methods or internal collaborators.
- Mock only system boundaries such as external APIs, time, randomness, filesystem, or database boundaries.
- Use independent expected values from the product spec, not expected values recomputed by the implementation.
- Keep each test focused on one observable behavior.
