# Interactive Notebook: source index and maintenance

## Integration inventory

- Repository: `pdx12320/WIKI_SUSTech-BIO`, based on `main` at `240f86a`.
- Stack: Flask + Jinja + Frozen-Flask, with native ES modules. No new runtime dependency.
- Route: `/notebook`, in the existing **Wet Lab → Notebook** navigation.
- Presentation: `wiki/pages/notebook.html`, `static/notebook/notebook.css`, and `notebook.mjs`.
- Editable introduction: `docs/wet-lab/notebook.md`.
- The shared header, footer, license and navigation are retained. The shared reading-orbit control is hidden only on this page because the Notebook owns its date navigation.
- The Model page supplies the editorial scale and ORCA indigo, lavender and coral visual vocabulary. Notebook styles are scoped; no Model or homepage files are changed.

## Source coverage

The source is the project owner's finalized Notebook archive dated 2026-10-17.
All 178 PDFs were checked against `FINALIZATION.json` hashes, their 181 physical
pages, approved daily record metadata and PDF date text. Every source PDF is
copied byte for byte; original branch folders and filenames are preserved.
The project owner explicitly confirmed use of all finalized dates for this
page on 2026-10-17. No chronology or scientific findings were newly inferred
by the website implementation. Private daily JSON and source notes are not shipped.

| Archive branch / track | Records | First date | Last date |
| --- | ---: | --- | --- |
| Fundmental | 25 | 2026-06-21 | 2026-08-16 |
| PUF | 38 | 2026-07-27 | 2026-09-19 |
| Apobec | 21 | 2026-08-24 | 2026-09-28 |
| Gfa | 9 | 2026-08-11 | 2026-08-30 |
| MRE | 15 | 2026-08-11 | 2026-09-03 |
| ASO | 12 | 2026-09-19 | 2026-10-03 |
| AAV | 17 | 2026-09-12 | 2026-10-12 |
| Reporter | 33 | 2026-08-03 | 2026-09-26 |
| FV | 8 | 2026-09-18 | 2026-10-13 |

`Fundmental` deliberately retains the archive's spelling. `Reporter` retains
its archival track identity; no separate SONAR track or Cre–loxP record is
invented. There are no missing assets in this finalized source inventory.
No project/track milestones are asserted in the initial index. The existing
`/engineering` page is a pending generic shell with no verified per-track
modules, so the initial `engineeringLinks` arrays are empty.

## Index format

`static/notebook/index.json` is the public source of truth for the UI:

- `schemaVersion: 1`.
- `tracks`: stable `id`, visible `label`, `archiveBranch`, supported description,
  `color`, category and `engineeringLinks`.
- `records`: unique archival `id`, `trackId`, ISO date-only `date`, source title,
  experimenter, source order, original filename, `pdf` path, `sha256`, physical
  `pageCount` and a `pages` array. Every page has a one-based `number`, original-page
  preview path, image width/height and preview SHA-256.
- `milestones`: optional objects with `id`, date, `type` (`project` or `track`),
  factual `label`, `recordIds`, and `trackId` for track milestones. The diamond
  opens a supporting record. Add these only with actual record support.

Paths in the index are relative to the index itself. For example
`pdfs/PUF/original-filename.pdf` and `previews/PUF/original-filename-p1.webp`.
PDF references can contain one page or several explicitly indexed pages.
Multiple cards in one day remain separate records. Duplicate IDs, unsafe paths,
invalid dates and repeated same-track PDF/page mappings are rejected at runtime.
Intentional reuse across different tracks uses different record IDs and an
explicit `sourceNote` describing the shared source.

## Add or update records

1. Finalize the original Notebook through the team's established record workflow.
   The website importer does not write, reconstruct, or revise historical PDFs.
2. With Python, PyMuPDF and Pillow available, run:
   `python scripts/import_notebook.py /path/to/Notebook`.
   It imports only the finalized manifest, verifies PDF bytes/date text/pages,
   and renders each original page to a lossless 1600-pixel-wide WebP. These are
   genuine page renders, not recreated documents. The importer is authoring-only.
3. For a new branch, add its metadata to `track_specs` in the importer and rerun.
   For a curated index not generated from this archive, edit `index.json` with
   the same schema, copy its original PDFs, and render the indexed pages.
4. The current nine-track lane layout is computed by `overviewLaneX` in
   `notebook.mjs`; extend the left/right lane counts and minimum map width when adding
   more than nine tracks. Dates and cards never require changes to animation code.
5. Add verified Engineering links as `{ "label": "POD Engineering", "route":
   "engineering#verified-section-id" }` only after that section actually exists
   and its content corresponds to the track. Verify the rendered anchor as well
   as the page route. Do not link placeholder modules.
6. Regenerate `catalog.html` alongside the index so no-JavaScript access stays
   complete. Preserve original filenames. Update source coverage and tests when
   the finalized record/page counts change intentionally.

If importing again after curating milestones or Engineering links, preserve and
reapply those reviewed metadata additions: the importer regenerates the index.
It intentionally does not delete arbitrary existing assets.

## Interaction and accessibility

Overview uses UTC calendar-day arithmetic at **14 CSS pixels per day** for all
tracks, including days without records. Month, Monday and day ticks share the
same scale. The minimum and maximum real dates determine track terminals.

The SVG calendar and every lane remain mounted when switching views. Their
horizontal translations animate into a compact left rail. Focus hides all
nonselected lanes, including their keyboard and accessibility targets; the toolbar
provides track switching. Focus
records are filtered by `trackId` before grouping by date. A `ResizeObserver`
measures each shared day row and places the selected line's date nodes and
connectors beside the first record title. Expanding PDFs changes row height,
not their historical time span. Other rail dates interpolate between those
rows; Focus intentionally does not imply a proportional calendar scale.

The toolbar provides return, track switching and date navigation. Track lines,
legend buttons, date nodes and card controls work with keyboard and touch.
`IntersectionObserver` follows the active date; reduced motion removes the
layout animation. Mobile Overview has a full-size horizontally scrollable map
plus named track buttons; mobile Focus keeps a narrow date line and readable
cards. The left rail is the same SVG, not a substituted sidebar.

Links: `/notebook`, `?track=aav`, `?track=reporter&date=2026-09-26`, and
`?track=puf&date=2026-07-27&record=QX01`. Back/Forward, the return control and
track changes retain the saved Overview position. A record link expands just
that record. Expanded-state memory lasts for the current page session; pages
are removed from the DOM on collapse or track change and re-created on demand.

No PDF renderer, iframe, canvas or image is loaded in Overview. Expanded records
load only their indexed previews, with explicit dimensions and browser lazy
loading. Previews use a maximum 500px reading width and shrink to fit mobile
screens. Record titles use flat dividers rather than speech-bubble boxes. Each preview has a full-size link and a direct original PDF link with
`#page=N`. Failed previews retain a source-file fallback. `catalog.html` lists
all originals when JavaScript or the manifest is unavailable.

## Build and verification

Use the repository Python environment and existing dependency pins:

```sh
python -m unittest discover -s tests -v
node tests/notebook_core.mjs
PLAYWRIGHT_MODULE=/path/to/playwright node tests/notebook_browser.mjs
python -m flask --app app freeze
python scripts/audit_build.py
```

For the browser suite, start the Flask server on port 8127 or set `NOTEBOOK_BASE`.
Set `NOTEBOOK_OUTPUT` to a task-specific screenshots/results folder. Tests cover
concurrent AAV/Reporter activity on 2026-09-26, strict track filtering, the two-page
PUF record QX01, date/card alignment, resource cleanup, URL history, responsive
widths, reduced motion, failed previews and an empty index.

Frozen-Flask copies `static/notebook/` into the deployment; dynamic fetches are
relative to the generated index URL and work under the team's deployment prefix.
No third-party CDN or external PDF runtime is used. In the final iGEM media
publication step, follow the repository's requirement to upload media to
`static.igem.wiki`. The committed local assets provide an operational repository
preview and static build; they are not a claim of an iGEM media upload.

## Visual hierarchy revision — 2026-10-17

The title leads directly into a nine-card track selector, with one original SVG
navigation icon per track on a common 48px grid. Each card shows the indexed
record count and actual date range. The redundant introductory copy is omitted.
The shared calendar uses responsive lane positions across the available width,
stronger lines and labels, alternating monthly bands, weekly guides and monthly
record totals calculated from the index. Counts beside a date node indicate
multiple separate records on that date. No dates, milestones or source files
were added or altered. On narrow screens, the track cards use two columns and
the calendar remains horizontally scrollable at a readable minimum width.
