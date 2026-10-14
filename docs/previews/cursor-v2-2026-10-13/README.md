# Smaller cursor alternatives

2026-10-13. User requested a prettier, smaller replacement after the first cursor was merged in GitHub PR #10.

Preview: `/static/cursor/review-v2/index.html`, served by any Wiki development server. Source and six editable SVGs live in `static/cursor/review-v2/`.

- A: thin arrow, 18 × 22 px with a (2, 2) hotspot; paper fill becomes indigo on hover. Recommended for precision and restrained appearance.
- B: miniature orca, 24 × 20 px with a (2, 7) hotspot at its snout; indigo becomes violet on hover. More playful.
- C: approximately 6 px visible dot in a 12 px canvas, center hotspot; 16 px canvas on hover with a small lavender outline. Most minimal.

Each card has its own native cursor for immediate comparison. Selecting a radio applies that cursor across the trial page. Images in the upper swatches are 4× references; the dark strips and real native cursors are 1×. Clicking trial buttons produces a small 240 ms feedback pulse. No tracking halo or trail is used.

These are isolated design alternatives. The live cursor module and the already merged GitHub version are unchanged. Only this preview's new files are added. Text/grab states, reduced-motion feedback and touch behavior are retained.

The assets are hand-authored SVGs using the ORCA palette. The preview reuses the existing local Futura font. No network-loaded assets, new dependencies, shared entry-point edits or public builds are introduced.

Files: `index.html`, `review.css`, `review.js`, `arrow.svg`, `arrow-hover.svg`, `whale.svg`, `whale-hover.svg`, `pearl.svg`, `pearl-hover.svg` under `static/cursor/review-v2/`; this record and `design-board.png` under `docs/previews/cursor-v2-2026-10-13/`.

Verification: all nine served files return HTTP 200; SVG dimensions and local HTML links checked; JavaScript syntax and diff whitespace checked. Real browser switching to whale and pearl, primary-button click delivery, non-intercepting feedback pulse, native text/grab cursors, and return to the default arrow verified. Screenshot saved after layout inspection. No full-site suite was repeated because this change is an isolated static preview.
