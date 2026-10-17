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
