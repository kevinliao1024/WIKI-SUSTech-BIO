# Model modules

The Model page uses four section anchors, entry cards and a sticky module index.
On narrow screens the index becomes a horizontal bar below the whale navigation.
Modules 3 and 4 remain explicitly pending. Dry Lab navigation and footer link to
Model and Software; previously published routes remain available through the
explicit Frozen-Flask page generator.

Module 1 and 2 content was imported from the team-supplied archive on 2026-09-28:

- `igem_module1/01_Module1_Wiki_EN.md` and `02_Module1_DBTL_EN.md`
- `igem_module2/wiki/PUF_Dry_Lab_Wiki_EN_ESM.md` and `PUF_Module2_DBTL_EN_ESM.md`

The Module 2 main manuscript already includes the current inverse-folding Part II.
DBTL accounts are expandable below their respective modules. Scientific numbers,
thresholds, limitations, citations and figure captions are retained. No analyses
were executed and no model was retrained. Source Markdown copies and figure
checksums are in `static/assets/model/`; rendered fragments are in
`wiki/components/model/`. Markdown was converted once using the available Marked
installation; the website requires no additional runtime dependency. The only
mathematical display conversion renders the supplied specificity equation with
HTML subscripts. Image dimensions reserve space for reliable anchor navigation.

Figures are unchanged team-supplied PNGs. Their original captions describe their
provenance and scope. Media licensing and scientific/reference review remain team
publication responsibilities; the import is not an independent scientific audit.

## Figma illustration revision

Editable source: https://www.figma.com/design/uxQ8mjplCxdMwVWsd3cU7Z
Sequencing plate: node 2:3; PUF plate: node 2:79.
The sequencing instrument and flow-cell plate were drawn as native Figma shapes.
The PUF coordinates were imported as editable vectors and arranged in Figma.
Exports live in `figma-sequence.html` and `figma-puf.html`; CSS animates the named
scan and RNA layers. All displayed module titles are English.

GitHub skill reviewed for deterministic vector figure layout:
https://github.com/ThalesGroup/agilab/blob/main/.claude/skills/scientific-svg-figures/SKILL.md
The installed `figma-use` workflow was used to create and export the design.
No third-party skill scripts or global installations were needed.

## Current Canvas revision

The entry cards now render through `model-canvas.js`, with structure coordinates
in `model-structure.js`. The sequencing plate scans on hover/focus; the PUF card
reveals RNA at its supplied bound position. Rendering pauses off-screen, respects
reduced-motion preferences, and scales for high-density and mobile displays.
The Figma exports above are retained as previous editable artwork and are no
longer included by the current card template. See `PUF_CARD_STRUCTURE.md` for
coordinate provenance and the distinction between structure and decorative motion.
