# Model modules

## Current judge-facing presentation, 2026-10-13

The four module narratives and conclusions use direct result, interpretation and
design prose. Evidence-status badges, inline hyperlinks, audit passages and
editorial update descriptions have been removed from the narrative.
Each module has a Reproducibility and availability section containing its data,
code and model links. All article hyperlinks are confined to those four sections.
Author/year citations and reference entries remain plain text. The module index,
chapter navigation and existing deep-link anchors remain functional.
Module 1 and 2 references are numbered in their first-citation order, matching
the ordered-list presentation used by the other modules. Existing reference
anchors and entry text are retained.

Chapter navigation shows the same section numbers as the article, with compact
14px labels. Module 2 provides direct entries for ranking results, feature ablations
and readout-layer sensitivity within its long specificity-ranking chapter.
Those entries share the existing directory and scrolling behavior. Unlisted
sibling headings restore the nearest listed ancestor as the current entry.
The desktop directory has no independent vertical scrollbar; short windows use
normal document flow. Mobile keeps its horizontal chapter row.

The white reading column contrasts with a pale gray page background, with a
narrow gray edge gradient and soft outer shadow. Figure containers and table
surfaces use pale gradients and soft edges; scientific images retain their
original colors and pixels.

The local branch incorporates `origin/main` through
`16ebbf837b02513f9e67de0532783386a3e3817f`, including the upstream navigation and
ORCA cursor changes. The fast-forward preserved all 74 existing modified files
byte-for-byte before the reference and directory edits.

Scientific tables, code blocks, figure assets and numerical selection criteria
are unchanged. Measurement definitions, evaluation cohorts and batch-specific
comparisons remain explicit in the text. Figure numbering remains 1–38, and
displayed captions are recorded in `integration-20261013/page-captions.json`.
The source packages, published-fragment snapshots and evidence audits are retained
as immutable records; the current prose intentionally differs from those snapshots.

The sections below document earlier stages and do not describe the current
presentation where their statements conflict with this section.

## Historical supplied analysis integration, 2026-10-13

The user approved the four supplied figures in
`ORCA_synthesis_integration_2026-10-13.zip`. The new descriptive results are
distributed within the existing module conclusions, extending the previous
conclusion additions rather than creating standalone synthesis/window sections.

- Module 1: jointly retained PUF10/PUF12 rates and candidate-count/shared-rate
  comparisons; new Figures 8 and 9.
- Module 2: selected RNA-context differences remain distinct from protein-variant
  ranking, with primary engineered-PUF binding literature as assay context.
- Module 3: archived reporter C388/C871 signal changes, original metric formulas
  and a separate RESCUE engineering precedent. No additional APOBEC figure.
- Module 4: mutually exclusive selected-site context composition and the complete
  exploratory position scan; new Figures 37 and 38. Clinical interpretation
  remains the qualitative parameter-gap block.

The page has 38 figures in reading order. Original figures 1–7 keep their
numbers; original Module 2 figures 8–22 become 10–24, Module 3 figures 23–30
become 25–32, and Module 4 figures 31–34 become 33–36. The page-level Module 3
comparison reference changes from Figure 27 to Figure 29. Historical identifiers
in archived source packages, including source-package Figure 7, remain unchanged.
Original scientific body text, tables and images remain intact. Figure labels,
IDs and that page reference change in the original fragments. Following the
user's later instruction, all 38 displayed captions are concise reading guides
without hyperlinks. Essential panel definitions, comparison directions and
scope remain; source and audit details stay in the body and evidence files.
`integration-20261013/page-captions.json` records the displayed wording.

Supplied figures, original caption files, alt text, data and evidence are preserved byte-for-byte
under `static/assets/model/integration-20261013/`. The figure import and package
manifests record their hashes and dimensions. New claim and literature audits
distinguish internal consistency from reconstruction of the original experiments.
Thirty targeted package consistency checks passed; the referenced 171-check QA
and original positive-site/reporter-row inputs are not shipped and were not rerun.
Two context-figure manifests have supplied style-checksum mismatches, recorded
in `figure-import-manifest.json`; their original metadata and figure bytes remain
unchanged. No figure was regenerated, no model was run and no scientific
threshold, label, sample inclusion or statistical method was changed.

Scoped Git attributes retain supplied CSV CRLF and generated SVG whitespace,
while preserving the repository's existing PDF and font rules. Figure links
reserve the fixed mobile directory offset. The active directory entry is revealed
again after viewport resize, including changes within the mobile layout.

The observed parent C388 mean of 0.67335 is distinguished from the historical
fixed reference 0.673. The displayed original retention 0.773 is retained with
its archived formula; the separate observed-parent quotient 0.772 and
mean-of-record-ratios 2.157 are not substituted into the original metric.

## Historical conclusion additions, 2026-10-12

The four existing module conclusions now incorporate the cross-module synthesis
and therapeutic interpretation. The user's placement instruction supersedes the
reference specification's standalone capstone sections. The overview links to
each addition; the existing four-module navigation remains the reading index.

- Module 1, Engineering implications: recognition length versus detected
  candidate counts, and DOI-backed context for off-target reduction as an
  engineering outcome, retaining the apparent-C388 limitation.
- Module 2, Next experiments: feature ablations and calibrated library ranking,
  with cross-scaffold transfer left unestablished. Saved fixed layer-12 OOF
  coordinates match the published 0.405 main model.
- Module 3, Conclusion: batch-specific catalytic preference and a working
  recognition/catalysis interpretation, without pooling earlier single-mutant
  measurements with the combination batch.
- Module 4, Interpretation and next steps: RNA-context ranking without causal
  domain attribution, separate measurement and ranking scopes, and a
  qualitative therapeutic-window parameter-gap fallback.

New fragments are in `wiki/components/model/conclusions/`; the only edits inside
the original fragments insert their includes immediately before reproducibility
sections. Removing those include lines recovers all four original fragments
byte-for-byte, including their numbers, captions, anchors and caveats. The raw
source manuscripts and data remain unchanged. New evidence badges use CSS only.
The user's final instruction makes this a text-only addition: no new figure,
image reference or plotting dependency is introduced.

The evidence package is in `static/assets/model/synthesis/`: `claims-audit.json`,
immutable published-fragment snapshots and SHA-256 manifests. Verified primary-literature scope
and missing parameters are in `static/assets/model/therapeutic-window/`.
No model was run or retrained, no assay was added, and no scientific thresholds,
labels, sample inclusion, references or statistical methods were changed.

The audit narrows four proposed claims: cross-scaffold transfer failure is not
established; ranking does not identify a dual-domain signature; independent
filters and multiplicative effects remain untested; genotype associations and
candidate counts do not calibrate a therapeutic benefit/risk curve. The callable
reference, separate editor profiles and regional Hit@10 are not a nested funnel.

Terminology remains consistent with the original modules: ORCA, PUF, APOBEC,
LAMAR, apparent C388 signal and retained candidate sites. Candidate sites are
screened loci, not independently confirmed off-target events; apparent C388
does not isolate intended transcript conversion.

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
