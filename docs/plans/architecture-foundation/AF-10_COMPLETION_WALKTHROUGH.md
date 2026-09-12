# AF-10 terminal completion walkthrough

## Scope and result

This evidence records the final frozen-behavior walkthrough without changing application source, tests, native DOM, CSS, tokens, visible copy, interaction, privacy, storage behavior, or design.
The production build was served locally at `http://localhost:4173`.
The completed browser artifacts are ignored under `output/playwright/af-10-terminal-completion-walkthrough/`.
The terminal walkthrough extends AF-8 by exercising persisted legacy localStorage through the rendered application rather than only through Node contracts.

## Design preservation read

- Design Read: preserve the native-DOM Editorial Constellation identity Map for Book and Film authoring and public discovery.
- Existing DESIGN_VARIANCE: 7.
- Existing MOTION_INTENSITY: 4.
- Existing VISUAL_DENSITY: 4.
- Existing system: cool mineral light mode and matched dark mode, charcoal hierarchy, restrained coral accent, Avenir typography, and 7px controls.
- Preservation audit: no product renderer, DOM, CSS, theme token, copy, focus trap, modal inertness, layout, responsive behavior, motion, privacy boundary, or storage semantics changed.
- Applicable pre-flight results: the walkthrough observed light and dark hierarchy, mobile seams, control sizing, visible focus, dialog inertness, touch selection, and existing responsive presentation.
- Inapplicable pre-flight results: landing-page, hero, image, and redesign checks do not apply because this slice preserves an existing product UI and changes no UI code.

## Browser matrix

| Session | Runtime and context | Persisted state and rendered result | Representative artifacts | Console |
| --- | --- | --- | --- | --- |
| `af10-desktop-light` | Firefox, 1440x900, light | Legacy Draft-only state migrated to V2 while the original Draft key remained; owner hid the Draft from visitor preview until publication, then visitor preview exposed the published Thought without owner controls. | `desktop-light/.playwright-cli/` and `desktop-light-final-focus-state.json` | 0 errors and 0 warnings after owner, visitor, reload, and dialog checks. |
| `af10-desktop-dark` | Firefox, 1440x900, dark | V1 published Thought remained authoritative over a conflicting legacy Draft; startup wrote canonical V2 and retained both prior keys; owner and visitor presentation remained intact. | `desktop-dark/.playwright-cli/` and `desktop-dark-final-state.json` | 0 errors and 0 warnings after visitor proof. |
| `af10-mobile-light-chromium` | Chromium, 390x844, light, touch enabled | Canonical V2 Draft remained authoritative over conflicting V1 and legacy Draft records; a real Playwright `tap()` selected the owner Draft, while visitor projection omitted it. | `mobile-light/.playwright-cli/` and `mobile-light-chromium-final-state.json` | 0 errors and 0 warnings after touch owner and visitor proof. |
| `af10-mobile-dark-chromium` | Chromium, 390x844, dark, touch enabled | Legacy Draft-only state migrated to V2, preserved its original key, normalized selection, featured Media, and pinned position, and remained private in visitor preview. | `mobile-dark/.playwright-cli/` and `mobile-dark-chromium-final-state.json` | 0 errors and 0 warnings after touch owner and visitor proof. |

## Rendered migration evidence

The desktop-light and mobile-dark sessions began with no authored V2 or V1 key and a valid legacy `thought-map.prototype.drafts.v1` record.
After the application reloaded, each rendered owner Map showed the legacy private Draft and each browser stored canonical `thought-map.prototype.authored-thoughts.v2` without deleting the original legacy Draft key.
Those sessions also normalized the deliberately duplicated and invalid selection IDs, recovered malformed featured Media to the default public orbit, and clamped the persisted Draft pin to `{ "x": 490, "y": -310 }`.
The desktop-dark session confirmed that a valid V1 authored record takes precedence over a conflicting legacy Draft and is retained while canonical V2 is written.
The touch-enabled mobile-light session confirmed that V2 takes precedence over conflicting V1 and legacy Draft records.

## Interaction, privacy, and persistence observations

The desktop-light legacy Draft appeared as `Private draft` to its owner and was absent from visitor preview before publication.
After the owner published it, visitor preview rendered the Thought and exposed only public `Focus` and `Close` actions.
The owner and visitor DOM snapshots showed no chooser, capture, publish, edit, position, or pinned-state controls in visitor mode.
The owner chooser opened as an `aria-modal` dialog with the search field focused, both the topbar and Map page inert, and `Tab` plus `Shift+Tab` retaining focus in the dialog.
Closing the chooser restored focus to the chooser entry.
Both touch-enabled Chromium sessions reported `navigator.maxTouchPoints: 1`, and real `tap()` selected the expected private owner Draft before visitor projection removed it.
Reload snapshots and saved storage states confirmed the canonical persisted forms and preserved legacy authored keys.

## Validation and limits

Focused lifecycle and terminal-evidence coverage ran with `npx tsx --test tests/development-loop-state.test.ts tests/quality-gate-inventory.test.ts` and passed 25 tests.
`npm run build` passed before this production walkthrough.
The candidate also requires the repository-wide check and whitespace check against the exact staged terminal-document tree before review.
This evidence establishes frozen-behavior and compatibility coverage only.
It does not mark the goal complete, pause the scheduler, select a successor, or substitute for the required fresh independent review and whole-goal lifecycle transitions.
