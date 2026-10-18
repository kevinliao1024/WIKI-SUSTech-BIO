# Notebook verification — 2026-10-17

- **83 Python tests passed**, including source PDF / preview SHA-256 integrity,
  source page ranges, route integration, static source accessibility and all
  existing site tests.
- **Node core checks passed**: equal elapsed-day spacing, AAV/Reporter concurrency
  on 2026-09-26, strict per-track grouping, same-day separate experiments, variable
  record-height positions, invalid index rejection and calendar-only dates.
- **Frozen-Flask build and existing `audit_build` passed**: all 26 required
  outputs and required site assets/links were present.
- **Chrome browser tests passed** against both Flask and the actual frozen output
  served under `/sustech/`. No page JavaScript errors were observed.
- Browser coverage: 1440px desktop; 834px tablet; 390px and 320px mobile; keyboard
  track selection; no initial PDF/preview requests; persistent SVG through
  transitions; strict focus filtering; overview scroll restoration; multipage
  QX01 deep-link rendering; node/card alignment after expansion; collapse
  cleanup; Back/Forward; reduced motion; failed-preview fallback; empty index.
- The saved browser results are in `qa/browser-results.json`. Visual review of
  the full Overview, desktop Focus, original PDF and mobile screens passed.
- Every original PDF's hash matches the finalized local source manifest:
  **178 files, 181 pages, no source PDF modifications**. The complete Notebook
  web asset directory is approximately 18 MB; page images load only on demand.

## Publication boundary

This verification concerns the repository implementation and frozen build.
It does not claim that the feature has been merged, deployed to the public Wiki,
or that the 181 page-preview images have been uploaded to iGEM's media service.
Engineering links remain empty because there are no corresponding verified
module destinations in the current repository. The source index supports adding
those links after the module pages exist.

## Visual revision verification

After the track-card and calendar redesign, all 83 Python tests and the Node
core checks passed again. The frozen build passed `audit_build`; the complete
Chrome interaction suite passed against the live page and the frozen `/sustech/`
build. Visual inspection covered the desktop card grid, full-width parallel
tracks, focused date labels, and 320px/390px mobile cards and source previews.
The nine decorative navigation icons are original inline SVGs; no new external
assets or dependencies are needed.

- [Track selector at 1280px](qa/track-cards.png)
- [Parallel calendar at 1280px](qa/parallel-timeline.png)

## Compact single-track reader

Focus now displays only the selected experimental lane; the other lanes are
hidden from both sight and keyboard navigation. Track switching remains in the
toolbar. Each record uses a continuous rounded frame with explicit View record / Close
record controls, and original pages are limited
to a 500px outer width while retaining full-size and PDF links. The reviewed MRE
preview rendered at 498 × 707px.

All 83 Python checks, the frozen build audit, and the live/frozen Chrome suites
passed after this change. Browser checks also assert that only one lane is
visible and that the two-page QX01 preview stays within the reading-width limit.

- [Single-track record list](qa/reader-list.png)
- [Compact original-page reader](qa/reader-original.png)

The enclosing-frame revision also passed the Chrome suite, including desktop
and 834/390/320px layouts, opening/closing multipage records, measured node
alignment and PDF fallback. Review screenshots above show the final framed
reader with the 500px page limit retained.


## Activity-card refinement

The title eyebrows, end summary copy and source-index footer were removed.
The four revised symbols and stronger activity headings were visually checked.
The three Notebook Python checks, full existing Chrome interaction suite
(1440/834/390/320px), and frozen build audit passed. All 178 titles receive an
activity cue; exact source titles, dates, source index, PDFs and previews remain
unchanged. The expanded QX01 page remains 498px wide.

- [Updated navigation icons](qa/track-cards.png)
- [Activity cards](qa/reader-list.png)
- [Expanded activity card](qa/reader-original.png)


## Fundmental publication cutoff

At the owner's request, the website excludes Fundmental records after
2026-07-31: ten records, ten PDFs and ten previews removed. Current coverage is
168 records / 171 pages; Fundmental contains 15 records ending 2026-07-31.
The catalog, importer selection policy and expected inventory checks are
synchronized. Earlier counts in this log describe the preceding versions.

Notebook Python checks, Node core checks, frozen build/link audit and exact
PDF/preview inventory checks passed after removal. Chrome confirmed the updated
overview totals, 15 focused records, no date options after July 31, and a
390px layout without document overflow. See [Fundmental cutoff](qa/fundmental-cutoff.png).


## Timeline-first descending overview — 2026-10-18

Notebook Python checks, descending-scale Node checks and the frozen build audit
passed. Browser assertions verify October is visible at entry, month headings
run OCT / SEPT / AUG / JUL / JUN down the page, and all track cards sit below the
calendar. Existing focus, date alignment, return-position, keyboard, multipage
and mobile behavior is also covered by the browser suite.

- [Overview on entry](qa/overview-entry.png)
- [Track cards below June](qa/track-cards.png)

The same checks passed after rebasing onto current main, preserving its Source
Sans typography, grey canvas, white cards and removal of count annotations.
