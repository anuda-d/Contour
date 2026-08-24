# Gates: Durable pinned node placement

OWNS: GATES.md, docs/plans/CURRENT.md, docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md, index.html, scripts/check.sh, src/app.js, src/map.js, src/pinned-state.js, src/styles.css, tests/map.test.mjs, tests/pinned-state.test.mjs, tests/styles.test.mjs

Scope: preserve ordinary movement as temporary while allowing the owner to explicitly pin a node position across reloads and unpin it back to generated placement without changing graph meaning

- [x] DP1: pinned placement state is normalized, persistent, recoverable, and immutable
  CHECK: node --test tests/pinned-state.test.mjs tests/map.test.mjs
  EXPECT: ℹ fail 0
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/anuda/Desktop/bproject; path=668f0de3136d/22 entries; output=ℹ todo 0 | ℹ duration_ms 38.631959

- [x] DP2: governance, syntax, focused behavior, and repository regressions all pass
  CHECK: ./scripts/check.sh
  EXPECT: ℹ fail 0
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/anuda/Desktop/bproject; path=668f0de3136d/22 entries; output=ℹ todo 0 | ℹ duration_ms 99.019333

- [x] DP3: the Map source and design pre-flight preserve temporary movement, explicit owner-only pinning, generated-layout recovery, semantic relationship stability, shared owner and visitor composition, both themes, focus, and mobile target sizing
  EVIDENCE: Source and token inspection plus a 1280x720 dark-mode smoke check verified the contextual non-wrapping action, retained pin through reload and Reset, identical visitor coordinate without pin controls or metadata, generated-position recovery on Unpin, node focus restoration, refreshed temporary-placement feedback after moving again, shared dual-theme tokens, inherited 44px mobile actions, and zero console warnings or errors.

- [x] DP4: a fresh independent read-only review finds no unresolved blocker in the implementation or candidate evidence
  EVIDENCE: Final fresh reviewer inspected the complete diff and candidate claim, ran all 54 tests, confirmed the corrected storage and status lifecycles plus Reset, graph growth, visitor, Draft, focus, mobile, theme, and semantic boundaries, and found no implementation issue; its sole factual date finding was corrected in both synchronized records and reviewer confirmation found no unresolved finding or blocker.
