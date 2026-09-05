# ORCA Visual Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand the current SUSTech wiki as ORCA and translate the approved ocean-current artwork into an original responsive CSS/SVG homepage and palette.

**Architecture:** Keep the Flask/Jinja route and content architecture unchanged. Update visible brand copy in shared templates and the homepage, introduce semantic ORCA palette variables and decorative inline SVG primitives, then reskin existing components through CSS tokens so dry-lab content remains intact.

**Tech Stack:** Flask, Jinja, HTML5, CSS3, vanilla JavaScript, Python unittest, Frozen-Flask, Playwright.

---

### Task 1: Brand contract

**Files:**
- Modify: `tests/test_wiki.py`
- Modify: `app.py`
- Modify: `wiki/layout.html`
- Modify: `wiki/menu.html`
- Modify: `wiki/footer.html`
- Modify: `wiki/pages/home.html`

1. Add a failing test asserting `ORCA` and the expanded name appear on the homepage and that visible shared UI contains no old project branding.
2. Run `conda run -n xbx_env python -m unittest tests.test_wiki -v`; expect the new test to fail on `REWIRE`.
3. Replace visible branding in metadata, navigation, homepage, footer and accessibility labels. Preserve literal public source paths whose names contain the legacy string.
4. Re-run the test and confirm it passes.

### Task 2: Palette and homepage composition

**Files:**
- Modify: `tests/test_wiki.py`
- Modify: `wiki/pages/home.html`
- Modify: `static/style.css`

1. Add failing tests for the seven approved palette tokens and homepage hooks for the pod, currents, coral and white transition.
2. Run the focused tests and confirm failure because the hooks/tokens do not exist.
3. Add accessible decorative inline SVG/CSS markup to the homepage. Add ORCA palette variables and restyle the hero, narrative scenes, cards, tables, buttons and page heroes.
4. Re-run all unit tests and keep all evidence/provenance checks green.

### Task 3: Responsive and motion behavior

**Files:**
- Modify: `static/style.css`
- Modify: `static/wiki.js` only if existing behavior needs a hook
- Modify: `tests/browser_smoke.py`

1. Extend browser assertions for the ORCA title, homepage ornament and mobile overflow.
2. Run the browser test and verify it fails before the implementation is complete.
3. Add responsive layout rules, restrained current motion, reduced-motion handling and no-JavaScript visibility.
4. Run the browser test and inspect new desktop/mobile screenshots.

### Task 4: Documentation and full verification

**Files:**
- Modify: `README.md`
- Modify: `CONTENT_GUIDE.md`

1. Document ORCA branding, palette tokens and the boundary for real legacy-named source paths.
2. Run:
   - `conda run -n xbx_env python -m unittest discover -s tests -v`
   - `conda run -n xbx_env python -m flask --app app.py freeze`
   - `conda run -n xbx_env python scripts/audit_build.py`
   - `git diff --check`
   - the full Playwright smoke command in `xbx_env`
3. Start `conda run -n xbx_env python app.py` and confirm an HTTP 200 response at `http://127.0.0.1:8080`.

Do not commit or push these changes.
