# PUF structure card

Source: team-supplied archive, `igem_module2/research/inverse_folding_20260928/trm_only/inputs/complex.pdb`.
SHA-256: `0735687280484cd7580c97e5c40075a5b7d95798f73c8511f739210fb67abf87`.

The illustration projects all 493 chain-A C-alpha coordinates onto their first
two principal axes. Depth orders and shades backbone segments. Chain R contains
17 RNA residues; heavy-atom bonds are shown for distances between 0.7 and 1.9 Å.
Both chains use the same projection and scale. Hover/focus reveals chain R at its
supplied bound coordinates; the translating entrance is decorative, not a binding
simulation. The supplied file is treated as a structural model, not verified
experimental structure. No coordinates or scientific results were changed.

## Canvas card rendering

The current card uses `model-structure.js` and `model-canvas.js`. The 493 CA
coordinates are centered and rotated into principal-axis coordinates, rounded to
0.001 Å for display. The RNA display simplifies each of its 17 residues to C1′
and N9 (purines) or N1 (pyrimidines), retaining the supplied bound placement.
Canvas depth-sorts protein segments and applies a small common view rotation on
hover. RNA approaches that placement decoratively; this is not binding dynamics.
The older SVG/Figma exports are retained as previous artwork, not displayed.
Sequencing cluster colors and base calls are illustrative, not assay output.
