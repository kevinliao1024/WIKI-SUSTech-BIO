# ORCA White Hole Page Transition

An independent Three.js / GLSL overlay connecting Home's deep space to the light Wiki pages. No build step, CDN, new dependency, Home scene hook or navigation markup change.

## Preview

From the project root, use the existing Python environment:

```sh
.venv/bin/python -m flask run --host 127.0.0.1 --port 8081 --debug --no-reload
```

- Wiki: http://127.0.0.1:8081/
- Motion studio: http://127.0.0.1:8081/static/transition/preview.html
- Project: http://127.0.0.1:8081/description
- Wet Lab: http://127.0.0.1:8081/experiments

The studio plays both Home-related directions. Its timeline can hold any real rendered frame, including the 0.65s core, 1.10s warp and 1.50s fullscreen cover. The CSS checkbox previews fallback. Reset or Escape releases the scene. These controls exist only in the studio.

## Integration / handoff to the navigation session

The only shared-file edit is one line in `wiki/layout.html`, immediately after the description meta tag:

```jinja2
{% include 'components/whitehole_head.html' %}
```

That independent component adds the scoped CSS, the synchronous pre-paint boot script and the deferred controller. Keep it in the head if merging/reworking the layout. Do not move the boot script to the body or add `defer` to it: a destination page must paint its matching cover before its content.

Existing real anchor links are automatically handled by a document bubble listener. Buttons, prevented events, external links, mail links, downloads, new tabs, modifier/middle clicks, same-page links and hashes keep their native behavior. Existing ATCG/C→U handlers run before the document listener, so a decorative-base click that they prevent never triggers a transition. Add `data-wh-exclude` to a link or ancestor to opt out. If future navigation explicitly calls `location.assign` instead of using links, call `window.ORCAWhiteHole.navigate(url)` at that exact navigation point; do not call both. No navigation changes are needed for the current markup.

The controller supports extensionless Wiki routes beneath the configured Home path, including a Frozen-Flask deployment prefix. `/next` is recognized as the existing Home alias. Only links crossing between Home and internal pages are intercepted. Internal-to-internal links, assets, nested application URLs and file links keep native navigation.

## Animation

Run `node tests/whitehole_routes.mjs` to check native internal navigation, cleanup of old incoming fades, retained Home transitions and frozen hosting prefixes.

- **Home → light:** 0–0.30s particle convergence; 0.30–0.70s photon rims, tilted light disk, high core and axial jet; 0.70–1.20s camera advance and depth-dependent GPU trails; 1.20–1.50s expanding light fills the viewport; destination reveals through a 500ms warm-white fade.
- **Light → Home:** flat radial filaments contract; a navy aperture with icy/periwinkle rims forms and expands; after navigation a separate particle expansion fades into the existing Home scene. This has its own shader branch, not a reversed forward timeline.
- **Internal → internal:** native page navigation, with no transition overlay, prefetch gate, departure animation or arrival fade. Old pending `light` states are discarded before first paint.

`whitehole-scene.js` exports `WhiteHoleScene`, `ParticleSystem` and `PortalShader`. The classic controller exports `PageTransitionController` and `TransitionTimeline` through `window.ORCAWhiteHoleClasses`. The default reusable instance is `window.ORCAWhiteHole`. Lifecycle methods: `navigate(url)`, `reset()`, `destroy()`. Events: `whitehole:start`, `whitehole:navigate`, `whitehole:complete`, `whitehole:error`, with details on `event.detail`.

The portal shader combines several photon rims, curved disk lanes, procedural refracted star fields, spiral haze and broad glow. The particle vertex shader computes convergence, forward travel and streak length with deterministic seeds, avoiding per-frame particle uploads. There is no bloom composer or texture download. The overlay synthesizes space independently; it never samples or mutates Home's existing WebGL canvas.

## Cross-document continuity and recovery

The current page checks the destination with a same-origin HTML GET while animating. At full coverage it saves a versioned, expiring destination/direction record in `sessionStorage`, then performs a native document navigation. The destination boot script consumes that record and installs a matching warm-white/navy pseudo-element before first paint. The real overlay overlaps that shield, waits for content/fonts/load (bounded to 1.4s), then reveals.

Failed/non-HTML/HTTP-error requests leave the current page usable with a small retry notice. Stalled requests time out after 8s. Escape cancels an uncommitted departure. A 6s departure watchdog recovers a canceled navigation, and a 4.5s boot watchdog removes a cover if controller loading fails. Repeated clicks cannot start parallel timelines. History restores and direct refresh discard pending transitions; a persisted `pageshow` clears restored overlays. Native browser scroll/history semantics are retained.

If storage is disabled, navigation remains functional, but the cross-document pre-paint continuation cannot be persisted. Network or browser error documents are outside the site's JavaScript control. The default request also warms the browser cache; the actual navigation remains native rather than replacing HTML via an SPA.

## Performance and fallbacks

- Desktop: 2,100 GPU trails; device pixel ratio capped at 1.5.
- Mobile / low-core / low-memory device: 650 trails; pixel ratio capped at 1.
- First 20 frames averaging over 28ms lower pixel ratio and draw count automatically.
- One transient renderer per controller; all geometries/materials/context are disposed after departure, arrival, reset or cancellation. No idle renderer and no change to Home's renderer.
- Module and shader code may preload during idle time, without creating GPU resources.
- WebGL unavailable, context loss, shader/module failure, or Save-Data: CSS portal fallback.
- Reduced motion: brief 80ms fades, without a WebGL scene. Changing this preference during playback releases the active renderer.

## Verification

```sh
WIKI_BASE_URL=http://127.0.0.1:8081 \
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
node tests/whitehole_browser.mjs
```

If Playwright is already resolvable in your Node environment, omit `PLAYWRIGHT_MODULE`. The script uses an isolated temporary Chrome profile and writes real screenshots/results to `/private/tmp/orca-whitehole` (override with `WHITEHOLE_OUTPUT`). It covers both directions, parser-time shielding, short fades, history, refresh, native link exclusions, failed and stalled requests, repeated navigation, cancellation, reduced motion, mobile navigation, DPR/particle limits and WebGL fallback.

The existing Python route/content/audit suite currently has two navigation-related failures (`test_home_contains_particle_story_and_project_navigation`, `test_particle_preview_alias_matches_default_home`). Both were reproduced with this integration removed in-memory; no navigation/Home files were changed to address them.

Validation completed: 15 browser checks passed with no transition script/shader errors. A real Frozen-Flask export into a temporary directory included every module/shader and passed Home → Project, Project → `index.html` Home and Project → Wet Lab under a `/sustech/` server prefix. One local desktop headless Chrome run recorded 91 animation frame intervals: median 16.7ms, P95 16.8ms. This is a measurement on this machine, not a guarantee for every device. Reduced motion, WebGL failure and the 390×844 touch viewport were tested separately. The existing Python suite passed 41 of 43 checks, with the same two failures described above.

## Files owned by this change

```text
static/transition/whitehole.js
static/transition/whitehole-boot.js
static/transition/whitehole-scene.js
static/transition/whitehole.css
static/transition/shaders/whitehole.vert
static/transition/shaders/whitehole.frag
static/transition/preview.html
static/transition/preview.css
static/transition/preview.js
static/transition/README.md
wiki/components/whitehole_head.html
wiki/layout.html                       (one include line only)
tests/whitehole_browser.mjs
```

## Loading refinement — 2026-10-19

One `LOADING` word follows a helical tunnel wall toward the viewer. Each letter
follows the local tangent. Letter projection and particle trails use the same 62-degree camera and depth
shear (-0.24 × depth). The word turns through 18.85 radians (three turns), while
the background advances more slowly through 14.14 radians in the same direction. Light streaks use four connected segments rather than
straight radial lines; the portal's luminous grooves rotate in the same direction.
The word continues past the camera and clears the viewport before navigation.
Its opacity reaches zero by progress 0.97, so covered/arrival/reveal never freeze
or replay it on a white screen. Reduced motion keeps the letters static.

Home → generic departure lasts 4.2 seconds so the single word is readable over three turns; return-to-Home stays at 1.5 seconds. Generic destinations reveal immediately
after the parser shield handoff with a 90ms fade, without waiting for fonts or
images. Return-to-Home retains its bounded readiness and 320ms reveal. Pages
marked `data-team-opening`, `data-design-opening`, or `data-wh-own-opening` retain
their own arrival. Internal-to-internal navigation remains native.

Validate through real Home → Wiki links, not the standalone motion studio.

The word starts larger and stays at a readable depth through most of its three
orbits, then passes the camera. Its deep blue (#082c60) glyphs use a small SVG
displacement/bleed filter and sparse attached ink droplets. The opaque seal only
covers the final 2% of departure, shortening the pause after the lettering exits.

Loading retains its original Futura / Trebuchet MS font stack and weight.
A 2.05× vertical stretch and .035em same-color ink stroke make that existing
letterform taller and heavier without replacing the face or widening its orbit.

The three-orbit departure now runs over 4.2 seconds (about 24% slower than the
previous 3.2-second version). Letter spacing along the wall increases from
0.31 to 0.35 radians; the brief 90ms arrival reveal is unchanged.

## Parallel destination loading and shorter handoff

The HTML request begins with the departure. As soon as that HTML returns, inert
parsing queues stylesheet, classic/module script, explicitly preloaded font and
a few initial image downloads, while the slow LOADING orbit is still visible.
The first two main-content images are warmed even if marked lazy; remaining
lazy content is left alone. At most 48 assets on the same origin or
static.igem.wiki are queued, and repeated URLs are deduplicated. Scripts and
page-specific openings execute only on the eventual native navigation.

At 94% of departure, an unresolved response keeps a live spiral wall running.
Its shader clock continues instead of freezing the last ray frame. Once the
HTML is ready, the last 6% completes in 70ms rather than 252ms, followed by native
navigation and the existing 90ms arrival fade. Cached assets reduce the second
document's cold start; they do not guarantee a fixed network/parse time.
Reset, cancellation and history cleanup remove only this controller's preload
links. Run `node tests/whitehole_preload.mjs` for concurrency, no early script
execution, short exit, cleanup and failed/slow-response recovery coverage.

## Relative wall speed and clean streak starts

The wall grooves and particles now turn through 14.14 radians (75% of the
word's 18.85 radians), in the same direction. LOADING keeps its current timing,
so it advances relative to the calmer background. Waiting-wall drift also slows
from 0.42 to 0.32 radians per second.

Particle trails now wrap a shared head depth before their tail positions are
computed. Tail vertices never wrap separately across the tunnel seam; a short
visibility fade at the loop boundary and shorter tails remove the isolated
long vertical/diagonal connection visible above the word during the start.

## Continuous playback and rendering load

The wall now advances from its own display-frame clock, independently of the
letter/navigation progress. It keeps flowing at held progress and does not
accelerate with the short final exit. A long background-tab pause uses bounded
catch-up so returning to the tab does not jump through missed rotations.

Glyphs render once at a fixed 6vh size and move/scale as cached layers; the ink
font/filter is no longer resized and repainted on every frame. The background
canvas starts at pixel ratio 1 (0.85 on low-power devices), while DOM text stays
sharp. A rolling frame window can reduce the field to 0.75 and 650 trails if
needed; the low-quality shader avoids several repeated noise evaluations.
These changes reduce rendering work without skipping animation frames.

`node tests/whitehole_continuity.mjs` checks the wall still advances at held
progress, shares its clock between passes, and handles tab-resume and sampled
frames correctly. Live browser frame-rate measurement was unavailable during
this change because the browser connection timed out; no measured FPS claim.

## Startup preparation

Both WebGL programs now compile asynchronously and upload their first frame
on a detached canvas before joining the overlay. The preparation clock and
frame samples reset before playback; preparation time cannot become the first
flow delta. Existing navigation preparation limits and all motion speeds remain
unchanged. Failure disposes the scene and retains the CSS fallback.

The continuity test also checks both compilations finish before the first draw,
clock reset, and compilation failure. A live Home → Description navigation
completed with no captured console errors. This verifies integration, not a
measured improvement in startup frame times.
