# Explore the project — rectangular specimen slides

Date: 2026-10-11. Status: style board prepared; production integration awaits the user's style choice, as requested before implementation.

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

After approval, create dedicated `wiki/components/explore_slides.html`, `static/onetake/explore-slides.css`, and `static/onetake/explore-slides.js` modules (proposed paths, not yet created).

Take the cooperative shared-integration lock before making the minimal include/style/script changes to `wiki/pages/home.html`. Check `home_next_structure.html` and preserve its separate residue-112 review content; synchronize only the common navigation section where appropriate. Re-read live shared-file diffs while holding the lock. Do not replace other agents' page or animation work.

## Integration checks planned

- All five group headings and all 19 routes are preserved; no duplicate IDs.
- Desktop, 390 px and 320 px layout; long Human Practices and Alternative Platform labels.
- Mouse, keyboard, touch, reduced motion and JavaScript-disabled navigation.
- Directory selection does not jump the whole page, interfere with the preceding pinned scene, or affect the footer.
- Run existing relevant Wiki rendering/link checks and inspect the resulting focused diff. Do not rebuild shared `public/` during concurrent work.

## Deliverables for this design stage

- `docs/previews/slide-style-board-2026-10-11.html`: copy of the in-chat interactive board.
- This document: visual rationale, proposed technical approach and integration boundaries.
- No production page, animation or shared entry point has been changed during this design stage.
