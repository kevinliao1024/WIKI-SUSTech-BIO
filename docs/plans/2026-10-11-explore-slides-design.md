# Explore the project — rectangular specimen slides

Date: 2026-10-11. Status: the user approved **暗场微光**; implemented in the local homepage and the shared index on `/next`. Not published.

## Confirmed brief

- Retain rectangular microscope slides. Organic cell/tissue textures live **inside** the rectangular carrier.
- Redesign the homepage's Explore the project navigation. The user explicitly released this work from the ORCA visual-style skill.
- Determine visual direction and technical approach using a board before integrating it.
- Preserve the five navigation groups and all 19 existing child-page links.
- No claim that the decorative specimen textures are experimental micrographs or biological results.

## Board directions

1. **Darkfield glow / 暗场微光 (recommended):** deep blue-black stage, narrow cold glass edges, silver-blue abstract specimens, opaque paper labels, slightly staggered portrait slides. Selection raises and straightens one slide. This continues the existing dark particle homepage and makes the glass silhouette legible.
2. **Frosted archive / 磨砂档案:** warm grey stage, sage specimens, landscape slides arranged in five archive rows. Selection draws a row sideways. Strongest for reading and a quieter editorial finish.
3. **Stained specimen / 染色切片:** pale mauve stage, rose cytoplasm and violet nuclei, portrait slides in an orderly collection. Selection raises a slide. Most literal microscopy association; its light section introduces a deliberate visual break after the dark story.

The board is a working material and navigation study, not an experiment image and not a final microscopy rendering.

## Proposed implementation

### Rendering

- Use semantic HTML buttons for the five slide selectors, with real anchor links in the selected group's directory. Keep labels as HTML, not part of artwork.
- Use CSS for the rectangular carrier, sharp 2–3 px corner radius, static glass-edge gradients, paper label, shadows, and transforms. No full-screen blur or extra rendering canvas.
- Use small inline SVG shapes/clip paths and static grain to refine the sample silhouette inside each slide if the approved board needs more detail. CSS-generated sample textures are enough for the initial board. Keep decorative sample rendering separate from hit targets and text.
- Reuse existing local fonts and project assets. No new third-party package, CDN, generated bitmap, image hosting, or new WebGL context is required for this direction.

### Interaction

- Click/tap a slide to select its directory. Keyboard Enter/Space provides the same selection. Hover adds only a small lift, without changing the selected category.
- Suggested desktop motion: 6 px hover lift; 12 px selected lift; rotation settles toward 0 degrees; 350–450 ms ease-out. Keep labels stable and clickable.
- No automatic looping drift: the five targets remain easy to acquire. A one-time section entrance may use a short stagger if desired after the style is chosen.
- Preserve `#ot-index-title` and its existing story link.
- Native JS handles selection and `aria-pressed`/`hidden`. IntersectionObserver is only needed if an entrance animation is approved. There is no reason to modify the Three.js timeline for the basic slide directory.
- Without JavaScript, all group headings and links remain readable. With reduced motion, selection updates instantly.

### Layout

- Desktop: five slides in a single deliberate composition; group names remain fully visible even where shadows or glass overlap.
- Narrow screens: 3+2 compact portrait slides for the darkfield/stained directions, with a wrapping directory below; landscape rows for the archive direction. Avoid horizontal scrolling and overlap between click targets.
- Each sample has a different internal arrangement, while the carrier, labels and serial marks use a consistent system. Do not encode essential category information only through color.

### File boundaries and integration

Created dedicated `wiki/components/explore_slides.html`, `static/onetake/explore-slides.css`, and `static/onetake/explore-slides.js` modules. The component renders all five groups and 19 anchors from the existing navigation registry. Each slide has a distinct arrangement of inline SVG cells; no raster image or new dependency is used.

Acquired the cooperative shared-integration lock, reread the live templates and their diffs, and added only the component/style/script references in `wiki/pages/home.html` and `wiki/pages/home_next_structure.html`. The `/next` residue-112 component and anchor remain separate. Released the lock after the focused diff review and 43 existing checks passed. No shared animation module, navigation bar or footer was edited.

## Integration checks planned

- All five group headings and all 19 routes are preserved; no duplicate IDs.
- Desktop, 390 px and 320 px layout; long Human Practices and Alternative Platform labels.
- Mouse, keyboard, touch, reduced motion and JavaScript-disabled navigation.
- Directory selection does not jump the whole page, interfere with the preceding pinned scene, or affect the footer.
- Run existing relevant Wiki rendering/link checks and inspect the resulting focused diff. Do not rebuild shared `public/` during concurrent work.

## Deliverables for this design stage

- `docs/previews/slide-style-board-2026-10-11.html`: copy of the in-chat interactive board.
- This document: visual rationale, proposed technical approach and integration boundaries.
- At the design stage these were previews only. After approval, the production templates were integrated as recorded below.

## Design-stage verification

- Visually inspected all three material directions in a browser.
- Inspected the portrait darkfield composition and landscape archive rows at 320 px content width, alongside a 736 px desktop preview.
- Clicked Wet Lab in the narrow darkfield preview and verified all six page entries appeared with the selection state updated.
- The board's child-page actions remain local previews. The integrated component now uses real anchors.

## Approved implementation and verification

Changed files in this implementation:

- `wiki/components/explore_slides.html` — new semantic slide selectors, decorative SVG specimens, and server-rendered directory.
- `static/onetake/explore-slides.css` — darkfield glass, labels, desktop layout, centered 3+2 mobile arrangement, focus and reduced-motion rules.
- `static/onetake/explore-slides.js` — selection and progressive enhancement. Hidden, inert panels reserve layout space so changing chapter does not move the page.
- `wiki/pages/home.html` — replaces only the old index with the component, plus local CSS/JS references.
- `wiki/pages/home_next_structure.html` — the same index replacement; preserves the separate structure preview.
- This document — records the approved direction and actual verification.

Checks completed:

- `.venv/bin/python -m unittest tests.test_wiki tests.test_content tests.test_audit -q`: **43 passed**. Includes both homepage routes, navigation destinations and local asset rules.
- `node --check static/onetake/explore-slides.js`: passed.
- `git diff --check`: passed at integration review.
- Real homepage preview at port 8086: desktop selection, Space/Enter keyboard operation, live status and five-category access.
- Project → Wet Lab: all six Wet Lab links visible; directory stayed **95 px** high and scroll position stayed **18,817 px** at the measured desktop viewport.
- 390 px and 320 px viewport checks: centered 3+2 layout, no horizontal overflow; Human Practices label wraps cleanly. At 320 px all label scroll widths match their available widths.
- Script-free render of the actual homepage: zero scripts, selector deck hidden, **five groups and all 19 links visible**, no horizontal overflow at 320 px.
- Browser error log for the integrated preview: empty. Temporary viewport override reset after testing.
- Reduced-motion behavior is implemented through the component's CSS media query; a separate OS/browser reduced-motion preference run was not performed.

The feature is integrated in the local source, not confined to the design board. No shared `public/` build, commit, push or deployment was performed by this task. Pre-existing changes (including the board source and `tests/home_drag_browser.mjs`) were preserved.
