# Team page GitHub source publication · 2026-10-18

Target repository: `pdx12320/WIKI_SUSTech-BIO`, branch `main`.

The Team implementation already present on main was not selected by the page
registry and its font files were missing. This change registers the custom Team
template, includes its supporting fonts and regression checks, connects four
new portraits, and replaces local package frame URLs with the verified iGEM
AVIF uploads. The unsupported Design & communication link is removed from the
Team closing section; Attributions remains available.

## Content and interaction

- 25 cards: 15 team members, 5 Advisors, 2 Instructors, 3 PI placeholders.
- Existing user-confirmed quotes, multiple role tags and Student Leader badges
  are preserved. No quote was invented for the PI placeholders.
- New portraits: Huiwen Ma, Junming Feng, Xueyin Lu, Yanfei Pu.
- Package frames: `https://static.igem.wiki/teams/6085/wiki/team/pkg1.avif`
  through `pkg4.avif`, in numeric order, twice after clicking the package.
  All four returned HTTP 200 and `image/avif` on 2026-10-18.
- Waiting does not enter the roster. The blurred background remains locked
  until unpacking completes. Reduced motion and failed-image recovery are
  covered by the animation checks.

## Verification

- Python unittest discovery: 126 checks passed.
- `node tests/team_compilation.mjs`: passed two complete cycles, preloading,
  delayed and failed images, typing, scroll lock, completion and reduced motion.
- Frozen-Flask build: passed in a dedicated destination; shared `public/` was
  not rebuilt. Build/link audit: passed all 25 required routes.
- `git diff --check`: passed.
- No new browser visual inspection was completed during this publication.

## Official-host deployment status

This is a GitHub source merge, not an iGEM GitLab deployment. The strict official
media audit remains blocked by 17 Team portrait uploads and 3 Team font uploads
without confirmed remote mappings. It also reports two existing Software video
files. The four newly supplied portraits and all four PKG frames already use
verified iGEM URLs. The local sources remain usable for preview and source
reproduction. No deployment audit was weakened or bypassed.

The release was prepared against current main in an isolated checkout under
`.local-backups/`. The shared checkout branch and index were preserved.
