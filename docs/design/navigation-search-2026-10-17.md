# Shared navigation search

Integrated into local Wiki source on 2026-10-17. Review at
`http://127.0.0.1:4187/description` (light theme) or
`http://127.0.0.1:4187/404.html` (dark theme).

## Behavior

The rightmost search control is now part of the shared navigation, including
Home, ordinary content pages, the Model and Software pages, `/next`,
`/next-journey`, the older `/next-crayon` preview, and 404 responses.
It follows the existing navigation's visibility and homepage exit behavior.

The component reads the same live `navigation_groups` as the dropdown menus.
Results list Home, followed by Team, Project, Wet Lab, Dry Lab and Human
Practices, with all 19 links in precisely the navigation's order. Filtering
preserves that order and hides groups with no matches. Page configuration
updates therefore reach navigation and search together.

Light and dark pages use corresponding search colors. The disclosure focuses
the input on opening, supports Arrow Down to the first matching page and Escape
to return focus to the search button, and closes on an outside click or when
keyboard focus leaves it. Opening search dismisses an existing RNA dropdown
through its normal cleanup behavior; opening another menu closes search.

## Files changed in this follow-up

- `wiki/components/navigation_search.html` — reusable grouped result list.
- `static/navigation-search.css` — layout, responsive positioning and themes.
- `static/navigation-search.js` — filtering, keyboard and dismissal behavior.
- `wiki/menu.html` — one include after the navigation items.
- `wiki/layout.html` — one stylesheet and one script include.
- `wiki/pages/home_next_crayon.html` — one include in its older custom header.
- `wiki/pages/404.html` — remove the former separate search include.
- `static/not-found/not-found.css` — remove search-only styles and reserved space.
- `static/not-found/not-found.js` — retain only the artwork's float delays.
- `wiki/components/not_found_search.html` — superseded by the shared component;
  the former task-created file was removed.
- `docs/design/navigation-search-2026-10-17.md` — this record.
- `docs/design/sustechbio-404-implementation.md` — pointer to this migration.
- `docs/previews/navigation-search-2026-10-17/dark-search.png`
- `docs/previews/navigation-search-2026-10-17/light-search.png`
- `docs/previews/navigation-search-2026-10-17/mobile-search.png`
- `docs/previews/navigation-search-2026-10-17/verification.json`

The shared integration lock was acquired before editing shared files, live
contents and diffs were reread, and the four added integration lines were
checked with route verification before releasing this task's lock. Existing
unrelated changes and backups were preserved. Another task subsequently held
the lock for `app.py` and Notebook files; that lock was left untouched. No
overlap in the navigation files was observed during final review. Later
concurrent changes remain outside this verification snapshot.

## Checks

- Existing Python suite: **86 tests passed**. Existing Notebook resource-file
  warnings were emitted without test failures.
- **30 routes**: exactly one search component, its two assets, all 19 links and
  the exact five navigation groups in the correct order.
- Browser interaction checks on `/404.html`, `/description`, `/model` and `/`:
  theme, matching and empty results, preserved group order, RNA-menu/search
  handoff, Arrow Down and Escape, restored focus, and a real search-result
  navigation to `/model` all passed. No page JavaScript errors were recorded.
- Layout checks at **320, 390, 768, 1200 and 1440 px**: the search button and
  panel remain inside the viewport, avoid painted brand/navigation text, and
  introduce no horizontal overflow. Screenshots were visually inspected.
- Isolated Frozen-Flask export checks for `/description`, `/404.html` and
  `/next`, local asset/legal-link audits, JavaScript syntax and scoped whitespace
  checks passed. Shared `public/` was not rebuilt.

This is integrated functionality, not a preview-only mockup. Nothing was
committed, pushed or deployed by this follow-up. Port 4187 was used because an
existing service occupied 4186; that existing service was not stopped.
