# Model modules

The Model page uses four section anchors, entry cards and a sticky module index.
On narrow screens the index becomes a horizontal bar below the whale navigation.
All four modules contain their current rendered manuscripts. DBTL source records
remain archived; they are not expanded or linked as separate chapters on the Model page.
Dry Lab navigation remains Model and Software. All four modules are on the Model
page. The previously published Dry Lab, Brain Delivery and OffTarget Atlas routes
remain available through the Frozen-Flask page generator.

Module 1 and 2 content was first imported on 2026-09-28. The 2026-10-10 update
uses all four team-supplied archives:

- `igem_module1/01_Module1_Wiki_EN.md` and `02_Module1_DBTL_EN.md`
- `igem_module2/wiki/PUF_Dry_Lab_Wiki_EN_ESM.md` and `PUF_Module2_DBTL_EN_ESM.md`
- `igem_module3/wiki/module3.md` and `DBTL.md`
- `igem_module4/wiki/module4.md` and `DBTL.md`

The Module 2 main manuscript already includes the current inverse-folding Part II.
DBTL accounts remain in the source archive. Source documents, numerical tables
and figure assets are retained; rendered prose and captions include evidence
attribution corrections. No analyses were executed and no model was retrained. Source Markdown copies and figure
checksums are in `static/assets/model/`; rendered fragments are in
`wiki/components/model/`. The initial import used Marked. The current import uses
the repository's existing Python Markdown dependency; no dependency was added. The update
also includes Module 2's supplied readout-depth sensitivity section and figures.
Module 3 retains the supplied PNGs and batch-specific interpretations. Module 4
uses the 2026-10-11 manuscript and five supplied PNGs. Its rendered page distinguishes
draft-reported settings and ranking summaries from the saved records in the versioned
Module 4 evidence release. The original source documents and figures remain intact. The only
mathematical display conversion renders the supplied specificity equation with
HTML subscripts. Image dimensions reserve space for reliable anchor navigation.

Figures are unchanged team-supplied PNGs. Rendered captions describe their
provenance and scope. Media licensing and scientific/reference review remain team
publication responsibilities; the import is not an independent scientific audit.

The historical presentation import uses the existing project environment:

```sh
python scripts/import_model_modules.py --source-root /path/to/extracted/modules
```

The source directory must contain `igem_module1` through `igem_module4` from the
team archives. The importer retains Module 1, updates the supplied Module 2
section and renders Modules 3/4. It records document and asset SHA-256 hashes in
`source-manifest.json`; the existing Module 1 summary table's original and
normalized line-ending hashes are both recorded. It does not run scientific models.
The historical importer does not replay the subsequent reading-layout and evidence
reconciliation edits. Preserve the checked-in HTML fragments when maintaining this
release; re-importing an old archive would revert those presentation corrections.

## Evidence access revision

The Model page links the recovered Module 2 source package under
`static/assets/model/evidence/`. Its member manifest records source checksums and
any explicitly documented publication-only transformations. The archive restores
access to existing layer-sensitivity and inverse-folding records without executing
model code. The historical fixed-panel record is linked separately from the current
ESM assessment; the original nomination-time prediction file remains unavailable.

Module 4 evidence is linked to commit
`17a00c641f0a7ce726d65e16c2cca4b58a841431` of `pdx12320/igem_module4`.
The evidence audit distinguishes draft settings, saved run metadata, reconstructable
Stage I results and draft-reported Stage II summaries. It also records split overlap,
missing transcript identifiers and incomplete historical run-to-result mapping.
The page describes those limits without changing datasets, labels, scientific
thresholds, model weights or reported numerical result tables.


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
