# Data access, provenance and scope

Plotting and audit inputs are committed directly. Larger original archives are available in the [Module 3 data release](https://github.com/pdx12320/igem_module3/releases/tag/module3-data-v1).

| Release asset | Contents |
|---|---|
| `data-1-baseline-structures.zip` | Three baseline RNA-context AF3 ensembles |
| `data-2-mutants-controls.zip` | Mutant, designed-control and protein-only predictions |
| `data-3-sequencing-wetlab.zip` | Supplied sequencing and wet-experiment files |
| `data-4-results-inputs.zip` | Historical analysis results, task inputs and batch spreadsheets |

These four assets preserve the original archive bytes; only their public download filenames are simplified. Original volume-0 instructions, placement notes and file checksums are committed under [source-manifests](source-manifests/). Archive-level names, sizes and hashes are recorded in [input_archives.json](../provenance/input_archives.json); the executed [data-archive audit](../provenance/data-archive-audit.json) maps each public asset to its original filename and reports any manifest discrepancy.

All 6,755 actual files passed CRC reading and matched their manifest size and SHA-256. The 6,758-row original manifest additionally lists three `~$` Excel temporary lock files absent from the archives. The audit names these explicitly; no experimental table was inferred or recreated to fill them.

## Directly usable tables

- [plot-tables](plot-tables/) contains the supplied numerical snapshots for the original Dry Lab figures.
- [evidence](evidence/) contains selected contact, conservation, off-target and candidate tables used as contextual evidence.
- N1–N4 tables are in [the ORCA input directory](../figure-sources/orca-n1-n4/input/data/).
- CP arrays and stored resampling results remain in [the original clustering package](../analysis/cp-clustering/).
- New ESM-2 embeddings, distances and sequence inputs are in [analysis/esm2/results](../analysis/esm2/results/).

## Important reading conventions

Keep batches separate. Raw +1 ratios, parent-normalized ROF, activity retention and amplicon targeting ratios have different denominators. Missing/undetected denominator values are not zero or infinite ratios. The original batch tables include an ambiguously described `列1`; the wiki relies on explicitly named derived metrics instead of assuming that column means a subtraction.

Read the source placement notes before reconstructing a historical working directory. Volume 4's `根目录数据文件/` entries were originally at the analysis root; batch spreadsheets have descriptive delivery filenames that differ from historical hardcoded names. Extract into a fresh scratch directory and never over an existing analysis or raw-data tree.

The input DBTL document and Modules 1–2 were contextual references. Their embedded prompts were not treated as instructions, and their unrelated content was not copied into the Module 3 main narrative. Published third-party articles and model weights are not bundled.
