# Engineering linked overview

The navigation map is on the left and the user's latest portrait diagram is on the right. The map ends at module level; Cycle navigation stays in the article reader.

Hover or keyboard focus on either representation highlights the corresponding module in color and leaves the remaining illustration in grayscale. Hovering a diagram module expands its matching map branch. Both representations are ordinary chapter links; click or Enter opens the same chapter, including its introduction. Touch users tap either view directly. At narrow widths the complete map and diagram stack in one scrollable region.

## Figure provenance

`source.pptx` is the user's 2026-10-18 19:29 revision, byte-identical to the saved Downloads file at capture time. SHA-256 is recorded in `provenance.json`. The Model labels RNA-seq, PUF / APOBEC, LAMAR and Whole-body retain **Futura Bold 14.25 pt**. The 255 PPT objects are assigned once each to 18 semantic SVG groups; these groups are code, not separate uploaded images.

The illustration uses native SVG geometry and outlined text, preserving the source coordinates, connectors, colors and typefaces without requiring visitors to have Futura installed. The only bitmap is the original AAV icon. The SVG is embedded in the page template so linking and coloring do not depend on cross-origin SVG access or a third-party library. The prime marks in 5′ / 3′ use an outlined fallback glyph because the PDF export cannot embed that glyph from Futura.

## Exactly one new media upload

Upload **`static/engineering-overview/aav9.png`** through the iGEM media upload tool. This is the unchanged image extracted from the PPT, not a crop of the complete overview. Add its returned official URL to `asset_mapping.csv` using the existing verified mapping workflow. Until then, the preview uses the repository-local file. No official URL has been invented or marked uploaded.

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

`tests/engineering_overview_browser.mjs` exercises all 14 chapters from both sides, bidirectional hover, grayscale isolation, keyboard Enter, return-to-map, normal motion, responsive widths and touch tapping. `tests/test_wiki.py` checks the native vector / single bitmap contract and the reader's independent cycle controls.

The broader legacy navigation script still stops at its old `data-engineering-turn-progress > 0` assertion after a 3-pixel wheel continuation. A controlled browser comparison produced the same null progress value with the untouched main-branch reader and this branch; this is recorded in `qa/reader-baseline-comparison.json`. The new linked-overview browser suite and 25 route/markup tests pass. No reader wheel behavior was changed to satisfy that older assertion.
