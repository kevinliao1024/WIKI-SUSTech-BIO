# Engineering linked overview

The navigation map is on the left and the user's latest portrait diagram is on the right. Fundamental Research, Platform Development and Functional Validation share the root column, with peer connectors. Fundamental Research is the first reader category and Functional Validation is the last. The five Engineering workstreams keep their existing branches. The two Fundamental Research cycles and three Functional Validation experiments are reached from the reader or directly from their illustrated regions. All three FV experiments use the same Design–Build–Test–Learn controls while retaining their Experiment I–III labels.

Hover or keyboard focus on either representation highlights the corresponding module in color and leaves the remaining illustration in grayscale. Hovering a diagram module expands its matching map branch. Both representations are ordinary chapter links; click or Enter opens the same chapter, including its introduction. Touch users tap either view directly. Mouse-driven desktop windows down to 600 px keep the map and diagram beside each other. Below 600 px, or on touch-first devices, the complete map and diagram stack in one scrollable region.

## Figure provenance

`source.pptx` is byte-identical to the user's 2026-10-18 21:54 `orca-project-overview-v2/deliverables/ORCA_Project_Overview.pptx`. It includes the Fundamental Research and Functional Validation panels and their stage arrows. SHA-256 is recorded in `provenance.json`. The Model labels RNA-seq, PUF / APOBEC, LAMAR and Whole-body retain **Futura Bold 14.25 pt**. The 412 PPT objects are assigned once each to 21 semantic SVG groups; these groups are code, not separate uploaded images.

Inactive vectors receive actual achromatic fill/stroke values; active vectors restore their exact saved source colors. The AAV raster alone uses an image grayscale filter. This avoids depending on browser compositing of filters over SVG glyph groups.

The illustration uses native SVG geometry and outlined text, preserving the source coordinates, connectors, colors and typefaces without requiring visitors to have Futura installed. The only bitmap is the original AAV icon. The SVG is embedded in the page template so linking and coloring do not depend on cross-origin SVG access or a third-party library. The prime marks in 5′ / 3′ use an outlined fallback glyph because the PDF export cannot embed that glyph from Futura.

## Existing media mapping

The unchanged `static/engineering-overview/aav9.png` retains its verified official mapping in `asset_mapping.csv`. The new panels are inline vector geometry, so this update needs no additional media upload.

The illustration template, interaction JavaScript and CSS travel with the Wiki code. Do not upload the intermediate PPT/PDF layers, source deck, screenshots or fonts as display images. No font files are added to the website.

## Rebuild

The committed source is sufficient to recreate the vector template. The conversion scripts need Python with lxml, PyMuPDF and fontTools, Node, and the Artifact Tool runtime. Set `RUNTIME_NODE_MODULES` to the installed runtime's node_modules directory. `ENGINEERING_FONT_DIR` can override `/System/Library/Fonts/Supplemental` and must contain Futura.ttc, Georgia Bold.ttf and Arial.ttf.

From the repository root:

```sh
python3 scripts/engineering-overview/prepare.py
node scripts/engineering-overview/export.mjs
python3 scripts/engineering-overview/compose.py
```

Temporary conversion layers and extracted fonts stay in `work/engineering-overview/`. The generated runtime outputs are `wiki/components/engineering_overview.html` and the single PNG above. The converter asserts that all source objects belong to exactly one group. Update the group assignments and link rectangles deliberately if a future source changes geometry or shape IDs.

## Verification

`tests/engineering_overview_browser.mjs` exercises all 16 chapters from both sides, bidirectional hover, grayscale isolation, keyboard Enter, return-to-map, normal motion, responsive widths and touch tapping. `tests/test_wiki.py` checks the native vector / single bitmap contract and the reader's independent cycle controls.

The broader legacy navigation script still stops at its old `data-engineering-turn-progress > 0` assertion after a 3-pixel wheel continuation. A controlled browser comparison produced the same null progress value with the untouched main-branch reader and this branch; this is recorded in `qa/reader-baseline-comparison.json`. The new linked-overview browser suite and 25 route/markup tests pass. No reader wheel behavior was changed to satisfy that older assertion.

2026-10-18 follow-up: verified the actual in-app browser at 627 px. All 14 module selections had zero chromatic fill/stroke values outside the active layers; Control and Measure mouse/focus states are saved in `qa/in-app-*-only.png`. A stationary-pointer hover event could replace keyboard selection; diagram hover now requires physical pointer movement before overriding keyboard focus. A GFA diagram click and return-to-map were also confirmed in that same browser.

2026-10-19 migration: both Blueprint experimental cycles were moved verbatim, with explicit Engineering cycle/stage anchors and the original four references. Blueprint retains links to their new locations. All 135 Python checks pass; browser checks cover the peer connector, both new cycle links and all eight DBTL targets, all 16 chapters, desktop/mobile layouts and category rollers.

2026-10-19 FV migration: the supplied `Functional_Validation_Final_EN.md` manuscript is integrated in `docs/project/engineering.md` with all paragraphs, captions and 11 references preserved. Existing figure assets are reused. Results retains a synthesis and direct links to the three experiments. The overview artwork itself is unchanged; its Functional Validation title and three experiment regions now link to the reader.
