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

The import contains **36 original PDFs and 36 HTML readers in seven flat categories**.
The retained MX01 and MX02 IDs are displayed under Molecular Biology (15 entries);
they are integrated molecular workflows, not an eighth navigation category.
No source file or source identifier was removed or renumbered.
C is displayed as Cell Biology and MR as miRNA Regulation per the page brief.
The source index lists RP07, but there is no current RP07 PDF; it remains absent.

The maintained numbered `Protocols/<ID>/` folders are authoritative.
The reader is generated from the corresponding Markdown without rewriting
experimental instructions. It adds documented ID/category metadata, preserves
source sections, tables, images and reference links, and omits empty sections.
Its TOC lists only actual level-two sections. The original PDF remains accessible
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
The catalog records PDF and Markdown SHA-256 values, titles and versions.
The reader template is `wiki/components/experiments/entry.html`, with styles in
`static/experiments/reader.css`. Local image and SVG dependencies are copied;
out-of-scope paths and active source markup are rejected. Source references remain
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
