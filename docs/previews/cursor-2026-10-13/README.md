# ORCA molecular pointer

2026-10-13. Design and implementation live in this repository.

- Default: 28 × 32 px indigo arrow with paper outline and coral inset; exact hotspot (3, 3).
- Links/buttons: 24 × 24 px coral probe, hotspot (12, 12), decorative 34 px lavender halo.
- Primary click on an enabled interactive target: halo contracts, one coral ripple fades in 460 ms. Maximum four transient ripples.
- No trails, magnetic offsets, click interception or external runtime dependencies.
- Native text, grab/grabbing, resize and other functional cursor states remain available. Protein handles explicitly retain their intended grab state despite Bootstrap's more specific button rule.
- Touch/coarse pointer: no custom cursor or visible overlay. Reduced motion: native SVG cursor only, no halo/ripple. Forced colors: system cursors.
- Keyboard, blur, pointer leave/cancel and page hide clear the decorative layer. Scroll refreshes the target beneath a stationary pointer.

## Files

`static/cursor/arrow.svg`, `probe.svg`, `orca-cursor.css`, `orca-cursor.js` contain the production component. `wiki/layout.html` adds only two resource references, covering both home templates and content pages without altering their markup.

`index.html` is a standalone design board and interaction playground, shown by the task-specific local preview at `/cursor-review` (port 8794). That preview-only route is not added to `app.py` or the public site. Its URLs use the project's `/static` and `/assets` paths.

The preview's `static/cursor/Futura-Medium.ttf` is copied from the supplied ORCA style skill's `assets/fonts/futura/futurawin.ttf`; it is used only by the design board. The SVGs are hand-authored editable artwork. Palette: `#2E267C`, `#9D9CF4`, `#E9E8FF`, `#F58F9C`, `#FFFEFC`.

## Verification

- Existing Python suite: 64 checks passed after the shared-layout integration.
- JavaScript syntax and whitespace/diff checks passed.
- Real browser: design board on light/dark surfaces, primary click delivery, live probe cursor and halo, ripple creation and non-interception, input text cursor, and project navigation opening.
- Runtime checks with simulated media preferences: reduced motion, coarse/touch pointers, forced colors, preference changes without reload, native text/grab and disabled targets, and a maximum of four ripples during rapid clicks. This does not replace physical-device testing.
- Home: one cursor layer; SVG hit area and button handles use native grab cursors. No full biological drag sequence was repeated for this cursor-only change.

Pre-existing shared-layout edits for the reading orbit were preserved. The integration lock was acquired and released by this task. Other uncommitted changes in this shared checkout are outside this task; these checks describe the observed state, not future concurrent writes.
