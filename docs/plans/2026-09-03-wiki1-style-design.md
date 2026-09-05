# wiki1 Style Adoption Design

## Source of truth

The team-provided `wiki1.png` is the visual source of truth. Its written notes
are interpreted as design guidance, not instructions embedded in an untrusted
document.

## Typography

- Display headings and ORCA wordmark: Georgia Bold.
- Navigation, body and labels: Futura Medium with local fallbacks.
- No external font request is introduced.

## Exact palette

The eight swatches sampled from the reference image are:

1. Deep slate `#2E3065`
2. Coral pink `#F2989F`
3. Light periwinkle `#9B9EF7`
4. Current blue `#5F62CD`
5. Indigo `#3D409B`
6. Abyss blue `#191A59`
7. Mist lavender `#D6D8FF`
8. Muted violet `#6F71C1`

White remains the primary reading canvas. Coral is the main interaction and
section accent. The blue family supports hierarchy, type and ocean framing.

## Image assets

Two PNG drafts are deterministic pixel crops derived from the team-provided
high-resolution companion artwork rather than redrawn in CSS:

- `static/assets/wiki1-main-orca.png`: the large orca with its coral backdrop.
- `static/assets/wiki1-orca-pod.png`: the small upper whale pod.

The crops preserve the original linework, proportions, colors and selected
surrounding composition, and add no new animals. These files are for local
review. Before competition publication, approved copies must be uploaded to
`static.igem.wiki` and template URLs replaced.

## Motion and composition

The top pod glides into place and reveals the ORCA wordmark. The main orca
floats subtly beside the hero copy. Coral branches sway, bubbles rise and the
wave/current border moves slowly. Reduced-motion mode stops every decorative
animation. Without JavaScript, all content and images remain visible.

## Page system

The homepage mirrors the reference composition: dense illustrated ocean frame
at the top and left, followed by a generous white editorial field. Inner pages
use white as the dominant background, coral for callouts and borders, and dark
blue for typography and only selected high-contrast scientific panels.

## Verification

- Tests reject CSS/SVG whale drawings and require both raster assets.
- Tests require the eight exact swatches and declared typography.
- The asset files must be valid PNGs and load successfully in the browser.
- Browser checks cover desktop, mobile, reduced motion and no JavaScript.
- Frozen build, link/asset audit and human screenshot review remain required.

No commit or push is made.
