# Gates: Complete acceptance walkthrough hardening

OWNS: GATES.md, docs/plans/CURRENT.md, docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md, scripts/check.sh, src/styles.css, tests/acceptance-walkthrough.test.mjs, tests/styles.test.mjs

Scope: harden and visibly validate the complete owner-to-public Stage 0 sequence without adding a new product surface or changing accepted behavior

- [x] AW1: one public-API integration regression proves three confirmed works, three private Drafts, one two-work bridge, publication, featuring, pinning, visitor privacy, and durable reload state as one coherent contract
  CHECK: node --test tests/acceptance-walkthrough.test.mjs
  EXPECT: ℹ fail 0
  EVIDENCE: 1/1 passes through public versioned state, composition, projection, save, and reload APIs

- [x] AW2: governance, syntax, focused behavior, and repository regressions all pass
  CHECK: ./scripts/check.sh
  EXPECT: ℹ fail 0
  EVIDENCE: governance consistency, syntax, diff checks, and all 82 tests pass

- [x] AW3: the complete visible walkthrough passes at representative desktop/mobile viewports and both color schemes, including focus, touch, reload, privacy, and console checks
  EVIDENCE: isolated WebKit origin completed choose 3 -> capture 3 -> bridge -> move/pin -> publish 3 -> curate orbit -> visitor -> reload; light/dark 1280x820 and 390x844 renders were inspected, visitor had 7 Thoughts/0 Drafts/0 owner actions, reload retained 1 pin and 3 orbit works, mobile width stayed 390 with a 380 canvas and 44px return/control targets, reduced motion and keyboard focus were active, and console reported 0 errors/0 warnings

- [x] AW4: a fresh independent read-only review finds no unresolved blocker in the regression, checkpoint evidence, or completion claims
  EVIDENCE: initial review found the regression used an empty orbit instead of replacing a seeded work; the corrected regression now loads the seeded three-work orbit, removes Aftersun, features The Left Hand of Darkness, reloads, and asserts all three final works. A different fresh correction reviewer found no findings and independently confirmed focused 1/1, full 82/82, clean diff, public-API composition, privacy boundaries, and the narrow 44px correction
