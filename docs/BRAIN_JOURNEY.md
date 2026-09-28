# Illustrated brain journey

The current homepage opening lives in `wiki/components/hero_scene.html`,
`static/hero.js`, and `static/brain-journey.css`. The latter is loaded after the
older homepage sheets. The existing Flask/Jinja stack and dependencies are unchanged.

The opening uses one sticky viewport and a reversible scroll timeline:

| Normalized progress | Visual checkpoint |
| --- | --- |
| 0 | Complete cartoon brain and ORCA title |
| 0.15–0.245 | Camera follows the highlighted cell into the brain |
| 0.29 | Star-shaped astrocyte fills the stage |
| 0.31–0.505 | Camera moves into the cell and reveals RNA |
| 0.52 | GCG sequence fully visible |
| 0.57–0.69 | Middle C drops into the existing tissue scene |
| 0.70–1 | Existing cell and clearance sequence |

`?rnaProgress=0.29` freezes a checkpoint for inspection. It suppresses the
brain/astrocyte idle loops. Live scrolling supports reverse movement. The
right-hand neuron sends `orca:return-top` to reset both scroll and hero state
immediately. The old bottom chapter labels, Skip intro link and duplicate GCG caption have been removed.

Reduced-motion styles render brain, astrocyte and GCG in a static vertical
composition. The later reversal no longer initiates a rewind in this mode.
Without JavaScript, the opening is a single brain illustration instead of a
long empty scroll track.

## Artwork

`static/assets/brain-journey/brain.svg`, `astrocyte.svg` and `rna.svg` are original,
code-drawn cartoon illustrations created for this update, in the repository's
indigo/lavender/coral palette. They have no external dependencies. They are
schematic decorative storytelling assets, not experimental images or measured
anatomical reconstructions. The brain's highlighted astrocyte sits at 69.4%,
60%; this is the camera's zoom anchor. Astrocyte nucleus is near 51.2%, 50.9%.
The RNA GCG text is rendered separately so only the middle C can fall.

The existing iGEM media-upload requirements still apply before publication.
The old `intro_*.py` browser scripts target a retired fish intro and do not
validate this sequence. Current validation combines existing route tests,
static build audit and desktop/mobile browser checks at the checkpoints above.

## Crayon entrance

`components/crayon_title.html` uses original stroke-based lettering for ORCA and
its full name; no external font is loaded. `components/crayon_brain.html` is an
inline derivative of the original brain SVG, with a wax-grain filter.
`static/crayon-intro.js` draws these actual vector paths over about four seconds,
with a crayon tip following the active stroke. Starting to scroll finishes the
drawing immediately and hands control to the existing scroll timeline. Reduced
motion and fixed-progress preview URLs show the complete drawing directly.
