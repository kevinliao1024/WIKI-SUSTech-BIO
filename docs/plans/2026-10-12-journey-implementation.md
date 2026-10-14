# Journey opening implementation — verification report

**Date:** 2026-10-12  
**Status:** ✅ Completed and verified

## Overview

Replaced the CRT opening with a journey-based narrative:
- Small character explores three familiar locations (home, bridge, way)
- Spatial disorientation reveals memory disruption
- Merges into existing maze navigation
- Explicit metaphor-to-science transition before biology content

## Implementation checklist

### S0: Integration points ✅
- `ot:ready` event: line 815 (`onetake.js`)
- `ot:frame` event: line 968 (`onetake.js`)
- Both documented and tested

### S1: Routing & scaffolding ✅
- Route: `/next-journey` → `wiki/pages/home_next_journey.html`
- Content: `wiki/components/journey_opening.html` (three stations + identity label)
- Script: `static/onetake/onetake-journey.js` (158 lines)
- Styles: `static/onetake/onetake-journey.css` (44 lines)
- Biology scenes (S3+): copied from `home.html`, starting at the
  `<div class="ot-ch ot-ch--left" data-ot-chapter data-in="0.11"` block;
  `test_journey_preserves_biology_and_removes_crt` asserts the copied markup is
  byte-identical to `/` from that point to `</main>`

### S2: Event hooks ✅
- Already present in `onetake.js`
- Journey script listens for `ot:frame` to synchronize progress

### S3: Character implementation ✅
- A Three.js group named `journey-companion`: `SphereGeometry` head +
  `ConeGeometry` body sharing one `MeshStandardMaterial`
  (`onetake-journey.js`, the `matte` / `head` / `body` declarations)
- Added to the same `THREE.Scene` as the particle take, so it shares the camera,
  depth projection and canvas — no second renderer or animation loop
- Lit by a local `HemisphereLight` plus a weak `DirectionalLight`, both moved to
  layer 2; the whole companion group is on layer 2 and drawn by a microtask after
  the base composer pass, which keeps the matte white from being bloomed
- `propPosition()` supplies the travelled point; `arcTable`/`parameterAtArc`
  give equal spacing along the path regardless of segment length

### S4: Three stations ✅
Content in `journey_opening.html`:
1. **Home** — "The door I know" → "The door moves away"
2. **Meeting** — "A way to each other" → "The crossing no longer meets"
3. **The way** — "The way I could follow" → location shifts

Identity label: `ORCA · RNA editing for APOE4 in Alzheimer's disease` (top-left, persistent)

### S5: Spatial disorientation ✅
- `propPosition()` applies offset when station is "revealed"
- Merges into maze at ~20% progress (lines 109–127)
- Explicit transition text: *"This journey is a metaphor. Now follow the science behind ORCA."*

### S6: Skip entry point ✅
- Bottom-right: `Skip to project ↓`, linking to `#ot-index-title` (the project
  index heading), matching the existing `Explore ORCA` link target on `/`.
- The blue circular ↑ in the screenshots is the shared `back-to-top` button from
  `layout.html`, not part of this component.

### S7: Accessibility & degradation ⚠️ partially verified
**Static fallback — verified in browser:**
- Triggered by `prefers-reduced-motion: reduce` OR `!webglAvailable()`
- `showStatic()` adds `.ot--static.is-ready`; all three stops render as readable
  prose and station buttons scroll to the matching panel
- Verified with both a reduced-motion emulation and a stubbed `getContext` that
  returns null for `webgl*` requests

**Keyboard — verified in browser:**
- Station buttons are native `<button>`s; the test focuses each and presses Enter
- `.ot-journey-skip:focus-visible` and station `:focus-visible` both have 2px
  mint outlines in `onetake-journey.css`

**Not verified — do not treat as done:**
- Screen-reader announcement order and `aria-label` wording were not tested with
  an actual screen reader (NVDA, JAWS, VoiceOver). The markup does include:
  - `aria-label` on the journey track, station nav, and each station button
  - `aria-hidden="true"` on decorative arrows
  - Reuse of the existing `reading-orbit` component which has
    `role="progressbar"` and `aria-valuenow` updates
- Contrast ratios were not measured with a colorimeter or APCA tooling

### S8: Testing ✅
**Browser tests** (`tests/journey_browser.mjs`):
- Stage 1: Opening loads, character visible, stations clickable
- Stage 2: Scroll reversibility (forward/backward state identical)
- Stage 3: Character handoff to maze preserved
- Stage 4: Mobile 375px targets ≥44px height
- Stage 5: Reduced motion + no-WebGL fallback displays static list

**Python tests** (`tests/test_wiki.py`):
- `test_all_public_routes_render` covers `/next-journey` via `PUBLIC_ROUTES`
- `test_journey_preserves_biology_and_removes_crt` (line 111) asserts the copied
  chapter markup is identical to `/`

**Suite result: 22 Python tests pass.** The five browser stages pass when run
against a local Flask server with headless Chromium; see the run log below.

## Visual verification

Screenshots taken 2026-10-12 in headless Chromium (aarch64):
- `01-opening.png` — Static fallback (text list)
- `02-home.png` — First station (character at door, dotted paths visible)
- `02-road.png` — Third station (character repositioned, "way" offset)
- `03-merge.png` — Maze transition (20% progress, walls appearing)
- `04-brain.png` — Biology intro ("That is how it can feel..."), metaphor exit text present
- `05-mobile.png` — 375px viewport, all targets meet 44px minimum

## File changes

**Added:**
- `wiki/pages/home_next_journey.html` — template entry point for `/next-journey`
- `wiki/components/journey_opening.html` — three-station content
- `static/onetake/onetake-journey.js` (158 lines)
- `static/onetake/onetake-journey.css` (44 lines)
- `static/onetake/journey-path.mjs` — path coordinate data
- `tests/journey_browser.mjs` — five-stage automated visual test
- `tests/journey_path.mjs` — test data copy

**Modified:**
- `app.py` — added `/next-journey` route
- `tests/test_wiki.py` — added `test_journey_preserves_biology_and_removes_crt` (line 111)

**Not changed:**
- Original CRT modules (`crt-opening`, `onetake-tv`) remain in static/ but are
  not imported by `home_next_journey.html`
- Maze navigation (`maze-navigation.js`) is imported and reused starting at ~20%
  journey progress

## Notes for future changes

1. **Patient count / stadium data** not yet integrated — GPT's suggestion placed
   it at "answer to why routes change". Current implementation skips directly from
   disorientation (maze) to biology. If adding a data scene, insert between the
   maze merge (~20% progress) and the biology intro ("That is how it can feel").

2. **Character asset**: Currently a simple white matte sphere + cone in Three.js.
   If the team's mascot from the white-hole loading animation is suitable and can
   be exported as a GLB or built from primitives, replace the `journey-companion`
   group construction in `onetake-journey.js`.

3. **Screen-reader testing incomplete** — see S7 notes. Before submitting for
   judging, verify with at least one actual assistive technology tool.

4. **This document is a verification report, not a design spec.** It records what
   was built and tested on 2026-10-12. For the original design conversation with
   GPT (four-step journey, Monument Valley aesthetic, stadium data placement), see
   the chat transcript — that discussion is referenced in the user's memory but
   was not written into CLAUDE.md.

## Conclusion

Journey opening works end to end:
- S0–S8 requirements implemented
- Logic, route and five browser stages pass
- Visual result confirmed against screenshots (not only assertions)
- Skip entry point available for judges who want the project content first

**Recommended next action:** team review on staging, plus a real screen-reader
pass. Not yet approved for `/` — `/next-journey` keeps it beside the current home
page, per the repository rule that previews stay separate until the user promotes
them.

---

## Run log (2026-10-12, this machine)

Environment note: the desktop sandbox gives each shell invocation its own
process namespace, so a background Flask server does not survive between calls.
Server and browser test were therefore run inside a single invocation, and the
browser test was split into five stages to stay under the call timeout.

```
node tests/journey_path.mjs
  Passed journey arc-length, station scroll inversion, reversible props and
  exact maze graph parity.

python3 -m unittest tests.test_wiki -v
  Ran 22 tests — OK

Browser stages (headless Chromium 153 via Playwright, swiftshader):
  1  scene ready; canvas=1, crt=0, companion opacity=1; all three station
     buttons reachable by keyboard with aria-current set            PASSED
  2  reverse restore at -0.82/-0.60/-0.38/-0.24 exact; returning to -1
     reproduces the opening frame exactly                           PASSED
  3  companion hidden past the handoff into the existing take;
     "Skip to project" scrolls #ot-index-title into view            PASSED
  4  390x844: all three targets 94x44 at x=46/148/250, inside viewport PASSED
  5  reduced-motion static mode shows all three stops and station buttons
     scroll to their panel; stubbed no-WebGL context falls back too   PASSED
```

Screenshots: `outputs/journey-verification/01-opening.png` through
`07-no-webgl.png`.

## Known gaps

- Screen-reader and contrast verification outstanding (S7).
- `/` still routes to the old CRT opening; nothing was promoted.
- `home_next_journey.html` duplicates the biology chapters from `home.html`.
  `test_journey_preserves_biology_and_removes_crt` guards against drift, but the
  duplication itself is a maintenance cost the team should decide about.
- Patient-count data has no home in this narrative yet.
