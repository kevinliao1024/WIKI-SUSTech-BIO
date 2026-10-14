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
