# Experiment page maintenance

`/experiments` is the Experiment library under Wet Lab, using the shared ORCA
shell, palette and typography. The initial landing view contains a concise
introduction, a native collapsed How to Use / Read accordion, and the card library.
Cards show only the ID and name. Search indexes the title, ID, category and words
from each maintained procedure, and combines with the selected category.

## Editable guide copy

Edit **`docs/wet-lab/experiment-guide.yaml`** and run the importer below.
It contains the complete four discovery steps, nine module explanations and
optional-section clarification. The generated catalog embeds that data; the
`wiki/components/experiments/how-to-read.html` template loops over it.
The accordion is independent of filtering and remains usable without JavaScript.

## Sources and categories

The import contains **36 original PDFs, 191 original page images and 36 page containers in seven flat categories**.
The retained MX01 and MX02 IDs are displayed under Molecular Biology (15 entries);
they are integrated molecular workflows, not an eighth navigation category.
No source file or source identifier was removed or renumbered.
C is displayed as Cell Biology and MR as miRNA Regulation per the page brief.
The source index lists RP07, but there is no current RP07 PDF; it remains absent.

The maintained numbered `Protocols/<ID>/` folders are authoritative.
The reader displays lossless 1800-pixel-wide page images rendered directly from
each original PDF, preserving its fonts, pagination, tables, figures and footer.
It contains no browser PDF plug-in, viewer toolbar or gray canvas. The Wiki's
own information, download links and section navigation occupy a left column;
the original pages scroll independently on the right. The 94dvh window starts
at 120% of whole-page scale, capped by the reading column's width, prioritizing
legibility over showing the entire first page. On narrow phones, the information moves
into a compact, independently scrollable region above the document.
Select a page to enlarge it within a horizontally scrollable page region; select
again to fit. The section navigation uses actual Georgia Bold 14pt headings
extracted from the source PDFs, with anchors at their original page coordinates.
References retain the PDF link annotations. Exact PDF text is included for
screen readers; the visible page is never reconstructed from Markdown. The original PDF remains accessible
from every reader and directly from cards when JavaScript is unavailable.
Notebook links lead to the real Notebook overview, not invented dated records;
Reporter System entries additionally link to SONAR Measurement.

## Refresh

From the repository root:

```bash
python scripts/sync_experiment_protocols.py /path/to/Protocols
```

This updates `docs/wet-lab/experiments.md`, PDF copies in
`static/experiments/pdf/`, and HTML/media in `static/experiments/entries/`.
The catalog records PDF SHA-256 values, titles and versions.
The reader template is `wiki/components/experiments/entry.html`, with styles in
`static/experiments/reader.css`. Each entry has a pages.json manifest with the source checksum, page count,
image dimensions, image checksums, source section coordinates and link annotations.
PyMuPDF and Pillow are required only for importing, as in the Notebook importer.
The generated site has no PDF rendering dependency. Source references remain
as supplied; import does not certify that external publishers keep their URLs live.
The importer does not delete obsolete deployment files; review removals separately.
Do not edit generated readers or PDFs: update the maintained library and reimport.

## Validation

```bash
python -m unittest discover -s tests -v
node tests/experiments_browser.mjs
```

The browser check accepts `EXPERIMENTS_BASE`, `EXPERIMENTS_OUTPUT` and
`PLAYWRIGHT_MODULE`. It uses installed Chrome without adding a production
dependency. Check a separate Frozen-Flask output with `audit_build` before delivery.
All readers, fonts and media load locally; no runtime CDN or external PDF viewer.

To refresh only the page images from the already-imported, checksum-verified PDFs,
run: python scripts/sync_experiment_protocols.py --refresh-readers

The importer caches verified images when both the source hash and renderer match.
PDFs themselves remain unchanged. Text cannot be selected directly from an image;
the original download is retained for copying text or printing.
