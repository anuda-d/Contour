# Browser-storage compatibility inventory

Status: entry-gate inventory for the frozen Identity Map Prototype.

Every entry below is valid persisted browser state that Architecture Foundation migration must preserve.
All stored values are untrusted input and retain their current recovery behavior until an explicitly versioned replacement is accepted.

## Stored representations

| Key and precedence | Canonical or legacy shape | Validity and recovery contract | Current evidence |
| --- | --- | --- | --- |
| `thought-map.prototype.media-selection.v1` | `{ version: 1, selectedMediaIds: string[], confirmed: boolean }` | Keep known catalogue IDs in order, deduplicate, limit to three, and preserve confirmation only for exactly three selections. A missing or empty key loads an empty persistent state. Parsed values normalize in persistent storage, but a `{ version: 1 }` envelope and a current-version non-array `selectedMediaIds` value both become canonical empty state with `recovered: false`; recovery is true only when version, array IDs, or confirmation need normalization. Invalid JSON, unavailable storage, or a storage read error returns an empty visit-only state. | `src/product/taste/selection.ts`, `src/adapters/browser/selection-local-storage.ts`, `tests/product/taste/selection.test.ts`, `tests/adapters/browser/selection-local-storage.test.ts` |
| `thought-map.prototype.authored-thoughts.v2` first | `{ version: 2, thoughts: Thought[] }` | Keep only valid `draft-*` Thoughts with nonempty text, known primary anchor, exact ISO creation date, valid distinct optional secondary anchor, and exact ISO publication date for Published status. Invalid publication metadata downgrades an otherwise valid Thought to Draft, and an invalid secondary anchor is stripped while retaining the Thought. A missing v2 falls through to v1 and legacy-Draft precedence, while an empty string or invalid JSON becomes a persistent recovered empty state with a recovery notice. A parsed `{ version: 2 }` envelope or current-version non-array `thoughts` value is canonical empty state with `recovered: false` and no recovery notice. Present v2 is authoritative even when corrupt. | `src/draft-state.js`, `tests/draft-state.test.mjs` |
| `thought-map.prototype.authored-thoughts.v1` second | `{ version: 1, thoughts: [{ id, status, statement, mediaId, createdAt, publishedAt? }] }` | When v2 is absent, migrate `mediaId` to `primaryMediaId` and preserve valid publication. Loading reports migration without immediately overwriting the legacy key. | `src/draft-state.js`, `tests/draft-state.test.mjs` |
| `thought-map.prototype.drafts.v1` third | `{ version: 1, drafts: [{ id, statement, mediaId, createdAt, ... }] }` | When both authored-thought keys are absent, migrate valid legacy Drafts into v2 Draft Thoughts. First later persistence writes v2 and leaves the legacy value intact. | `src/draft-state.js`, `tests/draft-state.test.mjs` |
| `thought-map.prototype.featured-media.v1` | `{ version: 1, featuredMediaIds: string[] }` | Keep ordered, unique, currently public Media IDs and cap at three. A missing or empty key uses normalized seed defaults, while a stored empty list remains a deliberate empty choice. Invalid JSON recovers to defaults with `recovered: true`. Parsed values normalize in persistent storage, but a `{ version: 1 }` envelope and a current-version non-array `featuredMediaIds` value are canonical empty choices with `recovered: false`; recovery is true only when version or array IDs need normalization. | `src/product/taste/featured.ts`, `src/adapters/browser/featured-local-storage.ts`, `tests/product/taste/featured.test.ts`, `tests/adapters/browser/featured-local-storage.test.ts` |
| `thought-map.prototype.pinned-positions.v1` | `{ version: 1, pinnedPositions: Record<string, { x: number, y: number }> }` | Keep known composable non-user node positions with finite coordinates and clamp x to plus or minus 490 and y to plus or minus 310. A missing or empty key is a persistent empty state with `recovered: false`. Invalid JSON and parsed-invalid shapes, including `{ version: 1 }`, recover to an empty persistent state with `recovered: true`. Unavailable storage or a read error returns an empty visit-only state. | `src/product/map/pinned-positions.ts`, `src/adapters/browser/pinned-local-storage.ts`, `tests/product/map/pinned-positions.test.ts`, `tests/adapters/browser/pinned-local-storage.test.ts` |

## Recovery and privacy rules

Unavailable storage or get and set exceptions keep the application usable for the current visit and never claim persistence.
Invalid JSON and storage read failures follow each key's explicit recovery behavior above.
Current-version envelopes with non-array selection, featured, or Thought collections normalize to canonical empty persistent state without marking recovery.
Pinned state flags a missing or invalid positions container as recovered.
Startup currently rewrites recovered selection, featured, pinned, and Thought state through their respective save paths.
Migration must not overwrite a valid legacy payload before its values have been migrated.

Thought persistence uses read-merge-write behavior.
Publication wins over a stale Draft, field-scoped Draft edits and bridges merge, and new Thoughts are retained.
The current cross-tab `storage` event reloads only authored Thoughts and replaces the in-memory state with the loaded value.
The read-merge-write behavior applies to authored Thought persistence writes, not to the storage-event handler.
Selection, featured Media, and pinned positions have no cross-tab synchronization guarantee that migration may silently broaden or weaken.

Drafts, draft-only Media, and invalid authored data never enter visitor reads.
A persisted ID beginning with `draft-` remains an identity convention after publication and does not itself determine privacy.
Eligibility depends on the current catalogue, current public Media, and current composable pin targets.
Migration must construct the matching validation context before discarding any persisted value.

## Frozen walkthrough evidence

`tests/acceptance-walkthrough.test.mjs` covers persisted selection, Draft creation and editing, bridge authorship, pinning, publication, featuring, reload durability, and private versus visitor projection behavior.
The focused state suites named above cover canonical round trips, legacy thought migration and precedence, malformed payload recovery, unavailable storage, and authored merge behavior.
