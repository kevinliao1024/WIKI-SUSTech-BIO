# SUSTech-BIO 404 implementation

Follow-up: the 404 search has since been promoted into the shared navigation.
See [the global search migration and current file list](navigation-search-2026-10-17.md).
The earlier search component path below records the original 404-only version.

Implemented locally on 2026-10-17. Preview: `http://127.0.0.1:4186/404.html`.
The existing Flask error handler and frozen `/404.html` route both use this page.

## Design and behavior

- The supplied ZIP is fully extracted, unchanged, in `docs/design/sustechbio-404-layered-package/`. Its README, layer metadata, example CSS/JS and full mockup are the source references; it contains no separate prompt document.
- The 404 lettering, pastel gradient, orbit, star, readable copy and single **Go back home** action are SVG/HTML/CSS. The raster content panel and its duplicate **Go to Wiki** action are no longer loaded.
- The orbit consists of two halves of one ellipse. Its far half is painted behind the numerals, and its near half in front, without the former overlapping third curve.
- Navigation reuses the live `wiki/menu.html` and the existing dark homepage styling. No shared navigation markup, styles or scripts were edited. Its RNA dropdowns retain their existing behavior.
- The search control lists Home, then every dropdown page from the live `NAVIGATION` registry, in the same group and item order as the real navigation. It supports filtering, empty results and Escape to close.
- Background, mascot, question mark, island, bubbles and stars use the supplied artwork. Float periods remain 8, 6.5, 5.3 and 3.4 seconds, with the package's staggered delays. Reduced motion stops these animations.
- On narrow screens, native text and the single action remain readable above the mascot. The desktop raster star layer is omitted there because its embedded orbit crosses the native text when cropped to a tall viewport.
- The existing footer, license notice and repository link remain included.

## Actual files changed or added by this task

Presentation source:

- `wiki/pages/404.html`
- `wiki/components/not_found_numeral.html`
- `wiki/components/not_found_search.html`
- `static/not-found/not-found.css`
- `static/not-found/not-found.js`
- `static/not-found/assets/background.png`
- `static/not-found/assets/bubbles.png`
- `static/not-found/assets/stars.png`
- `static/not-found/assets/island_sign.png`
- `static/not-found/assets/mascot.png`
- `static/not-found/assets/question_mark.png`

Design archive and verification artifacts:

- `docs/design/sustechbio-404-layered-package/` — all 14 original archive entries, including nine images and five source/document files.
- `docs/design/sustechbio-404-implementation.md` — this record.
- `docs/previews/sustechbio-404-2026-10-17/desktop.png`
- `docs/previews/sustechbio-404-2026-10-17/mobile.png`
- `docs/previews/sustechbio-404-2026-10-17/verification.json`

No changes to `app.py`, `wiki/layout.html`, `wiki/menu.html`, shared CSS/JS, dependency files, shared tests, the homepage templates or generated `public/` were made by this task. The checkout already contained concurrent changes to several of those files, and additional unrelated changes were observed during verification. Those changes and the existing local backup were preserved.

## Verification

- Existing `tests.test_wiki`: **25 tests passed**.
- Live `/404.html`: HTTP 200; ordinary and deeply nested unknown routes: HTTP 404. All render the new page and local resources successfully.
- Browser checks passed at 1440 px desktop and 320, 390, 700 and 768 px widths: no horizontal overflow; single home action has a usable hit area and fits in the viewport; actual home navigation succeeds.
- Browser checks passed for the real Project dropdown, matching and empty search results, Escape dismissal, search link order matching every navigation dropdown, and reduced motion. No page JavaScript errors were recorded.
- Desktop and mobile screenshots were rendered and visually inspected. The browser environment required a separate headless test after the in-app inspection connection became unreliable.
- Frozen-Flask successfully rendered the final 404 page into an isolated temporary destination. Local-resource and required legal-link audits passed, as did JavaScript syntax and scoped whitespace checks.
- An earlier full-site export attempt stopped with insufficient disk space; its temporary destination was removed automatically. A full-site export was not repeated. The final verification covers the changed 404 page, its dependencies and existing route tests, without rebuilding shared `public/`.

The implementation is integrated into local source, rather than confined to an isolated design preview. Nothing was committed, pushed or deployed. Artwork is retained locally for review; existing repository asset-publication rules still apply before deployment.
