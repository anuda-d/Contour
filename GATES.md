# Gates: Map-led Draft publishing

OWNS: GATES.md, docs/plans/CURRENT.md, docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md, index.html, scripts/check.sh, src/app.js, src/draft-state.js, src/graph-projection.js, src/map.js, src/styles.css, tests/draft-state.test.mjs, tests/graph-projection.test.mjs, tests/map.test.mjs, tests/styles.test.mjs

Scope: explicitly publish one existing anchored private Draft into the shared public Map while preserving authorship, Media grounding, position, persistence, and visitor privacy boundaries

- [x] PB1: authored Thought state and graph projection publish explicitly, persist safely, preserve anchors, and remain private before publication
  CHECK: node --test tests/draft-state.test.mjs tests/graph-projection.test.mjs tests/map.test.mjs
  EXPECT: ℹ fail 0
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/anuda/Desktop/bproject; path=668f0de3136d/22 entries; output=ℹ todo 0 | ℹ duration_ms 43.299125

- [x] PB2: governance, syntax, focused behavior, and repository regressions all pass
  CHECK: ./scripts/check.sh
  EXPECT: ℹ fail 0
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/anuda/Desktop/bproject; path=668f0de3136d/22 entries; output=ℹ todo 0 | ℹ duration_ms 96.580042

- [x] PB3: source and design pre-flight preserve the shared Editorial Constellation, explicit owner authorship, immediate Map return, Draft and Published distinction, visitor control exclusion, focus, both themes, and mobile target sizing
  EVIDENCE: Design Read and dials 6 / 3 / 4 recorded; native token, contrast, nowrap, reduced-motion, and 44px mobile rules inspected; targeted dark desktop flow visibly retained one shared Map, one coral action, same selected and focused node, unchanged camera, Published treatment, and visitor control exclusion

- [x] PB4: a fresh independent read-only review finds no unresolved blocker in the implementation or candidate evidence
  EVIDENCE: first review found a P2 stale-tab overwrite; merge-aware persistence, storage synchronization, and exact regressions corrected it; a different fresh correction reviewer found only a P3 iterable migration edge, its Set normalization and regression pass 27 focused and 64 full checks, and follow-up confirms no unresolved code, behavior, or evidence finding
