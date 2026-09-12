# Architecture Foundation quality-gate inventory

This inventory is the authoritative mapping from the accepted Architecture Foundation criteria and protected invariants to executable proof in the final source tree.
Each checked proof is a tracked test, a checked command, or accepted rendered evidence.
The focused inventory test validates the row identity, table form, proof resolution, and required coverage layers.

## Proof layers

- Product proof is deterministic domain behavior in `tests/product/`.
- Application proof exercises a use case through fakes in `tests/application/`.
- Adapter proof checks browser or seed contracts in `tests/adapters/`.
- DOM proof validates native user-interface boundaries in `tests/ui/`.
- Architecture proof checks structural dependency rules in `tests/architecture-boundaries.test.ts` and `npm run check:architecture`.
- Strict build proof is `npm run typecheck` and `npm run build`.
- Rendered proof is the accepted owner and visitor walkthrough in `docs/plans/architecture-foundation/AF-8_RENDERED_WALKTHROUGH.md`.
- Repository proof is `./scripts/check.sh`.

## Criteria

| ID | Protected claim | Evidence layers | Checked proofs |
| --- | --- | --- | --- |
| AF-1 | Dependency direction and source ownership remain enforceable. | architecture, repository | `tests/architecture-boundaries.test.ts`; `npm run check:architecture`; `./scripts/check.sh` |
| AF-2 | Maintained source and automated tests remain strict TypeScript with a reproducible native-DOM browser build. | strict-build, architecture, repository | `tests/composition/main.test.ts`; `npm run typecheck`; `npm run build`; `./scripts/check.sh` |
| AF-3 | Product facts have explicit owners while Map nodes and edges remain rebuildable projection and layout input. | product, adapter, application, repository | `tests/product/catalogue/catalogue.test.ts`; `tests/product/map/map-graph.test.ts`; `tests/product/map/layout.test.ts`; `tests/adapters/seed/prototype-seed.test.ts`; `tests/application/map/create-map-read-model.test.ts`; `./scripts/check.sh` |
| AF-4 | Screen-neutral application use cases coordinate current workflows through explicit outcomes and narrow ports. | application, composition, repository | `tests/application/map/initialize-map-session.test.ts`; `tests/application/authorship/publish-authored-thought.test.ts`; `tests/application/authorship/prepare-authored-capture.test.ts`; `tests/composition/main.test.ts`; `./scripts/check.sh` |
| AF-5 | Browser effects and untrusted native inputs are validated at their adapter or DOM boundary before trusted state changes. | adapter, DOM, architecture, repository | `tests/adapters/browser/storage-compatibility-contract.test.ts`; `tests/adapters/browser/browser-clock.test.ts`; `tests/ui/map.dom.test.ts`; `tests/ui/thought-capture.dom.test.ts`; `tests/ui/work-chooser.dom.test.ts`; `./scripts/check.sh` |
| AF-6 | Owner and visitor Map read models are structurally separate, with Draft-only data excluded from visitor rendering. | product, application, DOM, rendered, repository | `tests/product/map/projection.test.ts`; `tests/application/map/create-map-read-model.test.ts`; `tests/ui/map.dom.test.ts`; `docs/plans/architecture-foundation/AF-8_RENDERED_WALKTHROUGH.md`; `./scripts/check.sh` |
| AF-7 | Every supported browser-storage shape migrates or recovers without discarding valid state or exposing private facts. | adapter, application, repository | `tests/adapters/browser/storage-compatibility-contract.test.ts`; `tests/adapters/browser/authored-local-storage.test.ts`; `tests/application/authorship/recover-authored-thoughts.test.ts`; `./scripts/check.sh` |
| AF-8 | The accepted owner and visitor interactions, responsive layouts, light and dark appearances, and private-public boundary remain frozen. | DOM, acceptance, rendered, repository | `tests/acceptance-walkthrough.test.ts`; `tests/ui/map.dom.test.ts`; `docs/plans/architecture-foundation/AF-8_RENDERED_WALKTHROUGH.md`; `./scripts/check.sh` |

## Protected invariants

| ID | Protected claim | Evidence layers | Checked proofs |
| --- | --- | --- | --- |
| INV-01 | Books and Films remain the only supported Media types. | product, adapter, repository | `tests/product/catalogue/catalogue.test.ts`; `tests/adapters/seed/prototype-seed.test.ts`; `./scripts/check.sh` |
| INV-02 | A public Thought remains anchored to at least one Book or Film. | product, application, DOM, repository | `tests/product/authorship/draft-state.test.ts`; `tests/application/authorship/publish-authored-thought.test.ts`; `tests/ui/thought-capture.dom.test.ts`; `./scripts/check.sh` |
| INV-03 | Draft and Published remain lifecycle states of authored material. | product, application, adapter, repository | `tests/product/authorship/draft-state.test.ts`; `tests/application/authorship/save-authored-draft.test.ts`; `tests/adapters/browser/authored-local-storage.test.ts`; `./scripts/check.sh` |
| INV-04 | Drafts and draft-only Media never enter a visitor or public read model. | product, application, DOM, rendered, repository | `tests/product/map/projection.test.ts`; `tests/application/map/create-map-read-model.test.ts`; `tests/ui/map.dom.test.ts`; `docs/plans/architecture-foundation/AF-8_RENDERED_WALKTHROUGH.md`; `./scripts/check.sh` |
| INV-05 | Public Map membership derives only from deliberate public facts and published authorship. | product, application, acceptance, repository | `tests/product/taste/featured.test.ts`; `tests/product/map/map-graph.test.ts`; `tests/application/taste/update-featured.test.ts`; `tests/acceptance-walkthrough.test.ts`; `./scripts/check.sh` |
| INV-06 | Private selection, recovery, and interaction state never become a public taste or authorship claim. | product, application, adapter, DOM, repository | `tests/product/taste/selection.test.ts`; `tests/application/taste/recover-selection.test.ts`; `tests/adapters/browser/selection-local-storage.test.ts`; `tests/ui/work-chooser.dom.test.ts`; `./scripts/check.sh` |
| INV-07 | Spatial movement and pinning never create semantic authorship. | product, application, DOM, repository | `tests/product/map/pinned-positions.test.ts`; `tests/application/map/update-pinned-positions.test.ts`; `tests/ui/map.dom.test.ts`; `./scripts/check.sh` |
| INV-08 | Relationship meaning belongs to authored content rather than graph layout. | product, application, adapter, repository | `tests/product/authorship/draft-state.test.ts`; `tests/product/map/map-graph.test.ts`; `tests/application/authorship/save-authored-draft.test.ts`; `tests/adapters/seed/prototype-seed.test.ts`; `./scripts/check.sh` |
| INV-09 | Map and profile surfaces consume rebuildable read models rather than becoming sources of truth. | product, application, composition, repository | `tests/product/map/map-graph.test.ts`; `tests/application/map/create-map-read-model.test.ts`; `tests/composition/map-presentation.test.ts`; `./scripts/check.sh` |
| INV-10 | Compile-time types do not replace runtime validation at persisted, seeded, form-input, or external boundaries. | adapter, DOM, architecture, repository | `tests/adapters/browser/storage-compatibility-contract.test.ts`; `tests/adapters/seed/prototype-seed.test.ts`; `tests/ui/thought-capture.dom.test.ts`; `tests/ui/map.dom.test.ts`; `npm run typecheck`; `./scripts/check.sh` |
| INV-11 | Persistence failure may degrade the current visit without relaxing privacy or treating invalid data as public. | adapter, application, product, repository | `tests/adapters/browser/storage-compatibility-contract.test.ts`; `tests/application/authorship/reload-authored-thoughts.test.ts`; `tests/product/map/projection.test.ts`; `./scripts/check.sh` |
| INV-12 | A valid persisted state is retained across internal-model or storage-envelope migration. | adapter, application, acceptance, repository | `tests/adapters/browser/storage-compatibility-contract.test.ts`; `tests/adapters/browser/authored-local-storage.test.ts`; `tests/application/map/initialize-map-session.test.ts`; `tests/acceptance-walkthrough.test.ts`; `./scripts/check.sh` |

## Gate execution

`npx tsx --test tests/quality-gate-inventory.test.ts` checks this inventory directly before the repository suite runs it again.
`./scripts/check.sh` requires this inventory and executes the focused inventory check before architecture, type, build, and complete-suite checks.
