# Architecture Foundation contract

Status: entry-gate contract for the frozen Identity Map Prototype.

This contract defines the target structure for the Architecture Foundation goal.
It does not change product behavior, visual design, or persisted browser state.
It is enforceable now through the import-boundary check and becomes fully realized through the bounded migrations that follow.

## Decision records

### ADR-AF-001 - Product ownership

Identity owns the viewer and profile ownership facts.
Catalogue owns the supported Book and Film records.
Authorship owns Thought lifecycle, anchors, and authored relationships.
Taste owns deliberate selection and featured public Media choices.
Map owns membership inputs, rebuildable projections, presentation preferences, and explicit spatial pin semantics.
No module owns a generic graph as the source of truth for these facts.

### ADR-AF-002 - Dependency direction

The dependency direction is `UI adapters -> application use cases -> product modules -> kernel`.
Outward adapters implement ports declared inward.
The composition root is the only location that may depend on every concrete layer.
Cross-module changes are coordinated by application use cases rather than UI callbacks or shared mutable graph state.

### ADR-AF-003 - Effects are outward adapters

Browser storage, storage events, clock access, identifier generation, DOM events, and seed input are outward effects.
Product and application modules receive these capabilities through narrow ports when they need them.
Product modules do not import browser globals, concrete adapters, or UI code.

### ADR-AF-004 - Runtime validation at trust boundaries

Persisted values, seed data, form input, and browser events are untrusted until validated at their adapter boundary.
Strict TypeScript will describe trusted values after validation but will not replace validation.
Invalid or unavailable persistence degrades only the current visit and never creates a public claim or exposes a Draft.

### ADR-AF-005 - Compatibility preserves valid state

Every current localStorage representation remains readable through a versioned browser-storage adapter or explicit migration path.
The authoritative compatibility inventory is [COMPATIBILITY_INVENTORY.md](COMPATIBILITY_INVENTORY.md).
Migration preserves valid values before normalization and retains the current precedence, recovery, and privacy semantics.

### ADR-AF-006 - Native DOM and Vite remain the browser stack

The browser interface remains native DOM and CSS.
Vite and TypeScript will provide the reproducible browser build during AF-2.
No UI framework, router migration, or CSS-system replacement is part of this goal.

## Intended source layout

```text
src/
  kernel/                 shared IDs, Result, validation, and port contracts
  product/
    identity/             viewer and ownership facts
    catalogue/            Book and Film facts
    authorship/           Thoughts, lifecycle, anchors, authored relationships
    taste/                deliberate selection and featured public choices
    map/                  membership inputs, projections, spatial preferences
  application/            screen-neutral use cases and read-model queries
  adapters/
    browser/              localStorage, clock, UUID, storage-event adapters
    seed/                 validated prototype seed input
  ui/                     native-DOM views and event translation
  composition/            concrete wiring and browser startup
```

Product-facing source files use `*.ts` names after their migration.
Application use-case files use a `verb-noun.ts` name such as `publish-thought.ts`.
Browser-storage adapters use a `*-local-storage.ts` name.
Browser event adapters use a `browser-*.ts` name.
Native-DOM UI adapters use a `*.dom.ts` or `*.view.ts` name.
Tests mirror their owning source path beneath `tests/`.

## Current transition map

The flat JavaScript files below are temporary legacy locations while AF-2 through AF-7 migrate bounded seams.
They are explicit in the import checker so a new top-level source file cannot silently bypass the target layout.

| Current file | Temporary classification | Migration destination | Preserved responsibility |
| --- | --- | --- | --- |
| `src/app.js` | composition | `src/composition/main.ts` | concrete browser wiring only |
| `src/map.js`, `src/thought-capture.js`, `src/work-chooser.js` | UI | `src/ui/` | DOM rendering and event translation |
| `src/layout.ts`, `src/graph-projection.ts` | product transition | `src/product/map/`, `src/application/`, and `src/ui/` | rebuildable projections and spatial presentation inputs |

## Migrated seams

| Current owner | Migrated source | Preserved responsibility |
| --- | --- | --- |
| Catalogue | `src/product/catalogue/catalogue.ts` | Typed Book and Film facts and fresh editable catalogue reads |
| Taste selection | `src/product/taste/selection.ts` and `src/adapters/browser/selection-local-storage.ts` | Typed private three-work selection rules and injected browser-storage persistence |
| Taste featured Media | `src/product/taste/featured.ts` and `src/adapters/browser/featured-local-storage.ts` | Typed deliberate public presentation choices and injected browser-storage persistence |
| Map pinned positions | `src/product/map/pinned-positions.ts` and `src/adapters/browser/pinned-local-storage.ts` | Typed spatial pin rules and injected V1 browser-storage persistence without semantic authorship effects |
| Authored Thoughts | `src/product/authorship/draft-state.ts` and `src/adapters/browser/authored-local-storage.ts` | Typed Draft lifecycle, immutable authored-state merge, and injected V2, V1, and legacy-Draft browser-storage compatibility |
| Map public projection | `src/graph-projection.ts` | Typed owner and visitor projection plus capability inputs while the application still owns final read-model separation |
| Prototype seed | `src/adapters/seed/prototype-seed.ts` | Typed deterministic seeded owner, Media, published Thoughts, authored relationships, public choices, and spatial inputs |

The temporary `src/map.js` visitor filter and `composeGraphWithDrafts` graph composition are migration seams, not enduring privacy or product-authority mechanisms.
Owner and visitor read models will become structurally separate application outputs.
Spatial pins and movement remain presentation facts and never create authored relationships.

## Enforced import boundaries

`scripts/check-import-boundaries.mjs` enforces the target directional matrix for files already under the target directories.
The matrix allows `kernel -> kernel`, `product -> product or kernel`, `application -> application, product, or kernel`, `adapters -> adapters, application, product, or kernel`, `ui -> ui, application, or kernel`, and `composition -> any layer`.
The temporary legacy importers above are parsed and retain source-resolution validation, but are exempt from directional enforcement only while they remain at their listed paths.
The checker uses the TypeScript- and JSX-aware `@babel/parser` to reject an unclassified new source file, unresolved relative or `/src/` imports, and every forbidden source import under valid ESM or CommonJS grammar.
The target uses ESM source only, so `.cjs` and `.cts` files plus unshadowed CommonJS `require` and export-assignment forms fail the check rather than creating an unchecked CommonJS path.
`import.meta.glob()` is reserved for a future approved composition adapter and fails in all current source layers.
Dynamic imports that cannot be statically resolved use no permitted layer and are rejected in migrated source.
`scripts/check.sh` invokes the checker so supported repository validation cannot bypass it.
The controlled test fixture proves that a product module importing a browser adapter fails the check.

## Exit condition for transition exceptions

The temporary legacy exemptions are removed as each file migrates into the target layout.
AF-2 acceptance requires every maintained application source and automated test to be strict TypeScript with no maintained JavaScript mirror.
No future module is introduced merely to satisfy this layout.
