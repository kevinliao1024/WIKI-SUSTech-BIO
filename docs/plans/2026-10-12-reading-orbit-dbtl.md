# Scroll orbit and DBTL stage navigation

Delivered 2026-10-12, Asia/Shanghai. Chat `01a12fde-38b2-7d91-b6b7-d265db95e3ae`.

## Design and behavior

The user requested a shaped reading indicator that moves down and gradually
rotates, shared by Home and ordinary pages. The implemented shell has an
asymmetric spiral, a tilted orbit and an amber satellite. Its position follows
the actual document scroll distance; the linework turns twice over the full
page. It reverses when reading upward and stays still when scrolling stops.
Home uses luminous ice/aqua and amber; light pages use muted teal and brass.
The user explicitly released the ORCA font and palette restrictions for this
component. The component uses local system font stacks and native SVG.

The user clarified that DBTL should rotate between Design, Build, Test and Learn
inside its page and scroll to the selected chapter. Engineering (`/engineering`)
now has a sticky stage dial with fixed, readable labels and a rotating inner
form/pointer. It supports Cycle 01 and Cycle 02, follows ordinary scrolling,
keeps direct hash links and browser history, and transfers keyboard focus to
the destination heading. Mobile uses a compact sticky layout and 44px stage
targets. Reduced motion disables the progress shape's rotation and the dial's
animated transition while retaining reading position and navigation.

Engineering remains explicitly pending team review. Its Markdown now contains
eight stage headings with stable IDs and prompts, not experimental results.
Fill the stage prompts from verified team records. To add a cycle, add its
four Markdown headings and its option to `dbtl_wheel.html`; the script discovers
the resulting targets. Model content and archived DBTL manuscripts were not
changed. `/next` retains its isolated structure section.

## Actual changed files

Modified:

- `wiki/layout.html`: shared component, stylesheet and script references.
- `static/wiki.js`: removed the old horizontal progress updater; existing
  navigation and back-to-top behavior remain.
- `wiki/pages/content_page.html`: Engineering-only DBTL assets and directory.
- `docs/project/engineering.md`: pending stage prompts and eight anchors.

Added:

- `wiki/components/reading_orbit.html`
- `wiki/components/dbtl_wheel.html`
- `static/reading-orbit/reading-orbit.css`
- `static/reading-orbit/reading-orbit.js`
- `static/reading-orbit/dbtl-wheel.css`
- `static/reading-orbit/dbtl-wheel.js`
- `tests/reading_orbit_browser.mjs`
- This delivery record.
- `docs/previews/reading-orbit-2026-10-12/`: `home-desktop.png`,
  `general-desktop.png`, `dbtl-desktop.png`, `dbtl-mobile.png`,
  `home-mobile.png`, `description-mobile.png`, `model-mobile.png`, `result.json`.

## Checks and limits

- Existing Python suite: 63 tests passed.
- Existing home edit replay logic checks passed.
- New browser regression passed for Home, `/next`, Description and Model:
  0%, 43% and 100% reading positions; movement, rotation and viewport bounds.
- DBTL browser checks passed: all four stages in both cycles, manual reading
  tracking, direct hashes, keyboard activation and focused destinations.
- 390×844 mobile checks passed: progress remains within the viewport, no
  Engineering horizontal overflow, and target headings are below the sticky
  dial. Desktop screenshots use 1440×1000.
- Reduced-motion checks passed; no browser page errors observed.
- Both component scripts passed syntax checks; `git diff --check` passed.
- Frozen-Flask build and `audit_build` passed in a task-specific temporary
  destination. Shared `public/` was not rebuilt.

Home's automatic editing replay intentionally changes actual scroll position.
The reading indicator follows it. The browser test pins only the Home scene
for reproducible endpoint tests, leaving document scrolling active; Home's
existing replay behavior is covered by its separate existing logic check.

The in-app browser plugin failed to initialize due to a local native-module
signature problem. Visual and interaction acceptance used isolated headless
Chrome with the bundled Playwright runtime. Screenshots were visually inspected
and saved here. Preview server: `http://127.0.0.1:8774`.

Shared integration edits used the cooperative lock, reread live files/diffs,
and released this chat's lock after checking. No overlapping edits were
observed in the three shared files this task touched. Pre-existing transition,
home-test and untracked changes were preserved. Other tasks may still change
the shared checkout later; these checks describe the observed delivered state.
All feature code is integrated in this repository; only visual acceptance and
the isolated build output are previews. No commit or deployment was performed.
