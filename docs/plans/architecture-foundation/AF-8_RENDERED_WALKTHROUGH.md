# AF-8 rendered frozen-behavior walkthrough

## Scope and result

This evidence validates the accepted frozen owner and visitor behavior without changing application source, tests, CSS, configuration, dependencies, or product behavior.
The production build was served locally at `http://localhost:4173` and exercised in named isolated Playwright CLI sessions.
All screenshots, snapshots, trace files, state files, and session logs are under `output/playwright/af-8-rendered-frozen-behavior-walkthrough/`.
The rendered evidence accepts AF-8 and provides the required rendered support to AF-9.
AF-9 remains open for its separate final cross-criterion invariant-to-test inventory.
AF-10 remains open for its final legacy-state completion walkthrough and goal-wide review.

## Design preservation read

- Design Read: preserve the native-DOM Editorial Constellation identity Map for authoring and presenting Books and Films.
- Existing DESIGN_VARIANCE: 7.
- Existing MOTION_INTENSITY: 4.
- Existing VISUAL_DENSITY: 4.
- Existing system: cool mineral light mode and matched dark mode, charcoal hierarchy, restrained coral accent, Avenir typography, and 7px controls.
- Preservation audit: no product renderer, DOM, CSS, theme token, copy, focus trap, modal inertness, layout, responsive behavior, motion, or storage semantics changed.
- Applicable pre-flight results: hierarchy, responsive seams, light and dark contrast hierarchy, target size, focus behavior, and preservation of the existing visual language were observed in the rendered sessions.
- Inapplicable pre-flight results: landing-page, hero, image, and redesign checks do not apply because this slice preserves an existing product UI and changes no UI code.

## Browser matrix

| Session | Context | State and observed result | Representative artifacts | Console |
| --- | --- | --- | --- | --- |
| `af8-desktop-light` | 1440x900, light | Complete owner flow, direct visitor proof before publication, owner return, publication, featured curation, and reload proof. | `desktop-light/.playwright-cli/`, including `traces/trace-1789080116674.trace` | 0 errors and 0 warnings at visitor proof and final reload. |
| `af8-desktop-pan` | 1440x900, light | Completed owner state with an open-space Map pan from `(1230, 650)` to `(1110, 690)`, followed by a fresh snapshot. | `desktop-light/.playwright-cli/page-2026-09-10T22-58-59-588Z.png`, `page-2026-09-10T22-59-02-302Z.png`, and `traces/trace-1789081139043.trace` | 0 errors and 0 warnings. |
| `af8-desktop-dark` | 1440x900, dark | Reloaded completed owner state and direct visitor state preserved the dark hierarchy and published-only read. | `desktop-dark/.playwright-cli/page-2026-09-10T22-45-36-084Z.png` | 0 errors and 0 warnings. |
| `af8-mobile-light` | 390x844, light, touch enabled | Fresh selection, private Draft, bridge, touch selection, publication, direct visitor proof, and reload proof. | `mobile-light/.playwright-cli/`, including `traces/trace-1789080354845.trace` | 0 errors and 0 warnings. |
| `af8-mobile-controls` | 390x844, light, touch enabled | Completed-state mobile control pass verified touch selection, drag threshold, temporary movement, and pin acknowledgement. | `mobile-controls/.playwright-cli/`, including `traces/trace-1789080620857.trace` | 0 errors and 0 warnings. |
| `af8-mobile-dark` | 390x844, dark, touch enabled | Reloaded completed owner state and direct visitor state preserved the dark hierarchy and responsive interaction surfaces. | `mobile-dark/.playwright-cli/page-2026-09-10T22-47-58-405Z.png` | 0 errors and 0 warnings. |

The desktop and mobile contexts each used their matching `playwright-cli.json` context configuration beneath the corresponding output directory.
The mobile sessions reported `innerWidth: 390`, `innerHeight: 844`, and `maxTouchPoints: 1`.
The dark sessions reported `colorScheme: dark`.

## Owner walkthrough

1. The seeded Mira Vale owner Map loaded with its six works and mature authored constellation.
2. The work chooser selected exactly The Left Hand of Darkness, Arrival, and Bluets, then confirmed the three-work selection.
3. The chooser dialog opened with its search field focused, while the owner surface was inert.
   `Tab` and `Shift+Tab` were exercised before confirmation.
4. A private anchored Draft was created on The Left Hand of Darkness, then edited to `Language and memory make room for a freedom neither could name alone.`
5. A two-work private bridge through Arrival was created and saved.
6. Before publication, direct visitor preview omitted owner controls and the private Draft.
7. An open-space Map pan moved the completed owner canvas from `(1230, 650)` to `(1110, 690)`.
   Before and after screenshots plus a trace record the camera gesture without selecting or moving a node.
8. The owner returned to the Map, selected the Draft, and dragged it beyond the movement threshold.
   The UI reported `Temporary position. Pin it to keep this placement.`
9. Desktop coverage pinned the position, unpinned it, used Reset, moved selection with `ArrowRight`, pinned again, used Focus, and used both zoom controls.
10. Mobile control coverage used a real touch `tap()` for selection and raw pointer movement for a visible drag.
   It reported temporary movement, then `Position pinned.` after the Pin position control.
11. The bridge was published with the same identity and placement.
    The owner UI reported `Thought published. Visitor preview now shows it.`
12. Public orbit curation removed The Dispossessed and added The Left Hand of Darkness, leaving exactly In the Mood for Love, Aftersun, and The Left Hand of Darkness featured.
13. Reload preserved the three-work selection, authored Thought, publication state, featured works, and pinned position.

## Visitor, privacy, and visual observations

Direct visitor preview before publication showed no chooser, Thought capture action, private Draft, or owner-only spatial controls.
Direct visitor preview after publication showed the published bridge and still exposed no owner controls.
Reloaded visitor reads remained Published-only in light and dark contexts.
The desktop dark screenshot shows the existing cool dark field, charcoal-to-coral hierarchy, restrained node marks, and clear contextual contrast without clipping.
The mobile light and dark screenshots show the existing compact top bar, usable bottom contextual surface, visible Map region, and no observed horizontal overflow.
No new visual treatment or copy was introduced.

## Validation and limits

- `command -v npx >/dev/null 2>&1` passed.
- `npm run build` passed with Vite production output.
- The focused Node command passed all 65 tests: `node --import tsx --test tests/acceptance-walkthrough.test.ts tests/ui/map.dom.test.ts tests/ui/thought-capture.dom.test.ts tests/ui/work-chooser.dom.test.ts tests/styles.test.ts`.
- Browser console inspections recorded 0 unexpected errors and 0 warnings in every completed session.
- `git diff --check -- docs/plans/CURRENT.md docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md docs/plans/architecture-foundation/AF-8_RENDERED_WALKTHROUGH.md` and `./scripts/check.sh` are recorded with this candidate before independent review.

This walkthrough proves that the current frozen behavior renders and persists under the stated local browser contexts.
It does not claim demand, retention, or product viability.
