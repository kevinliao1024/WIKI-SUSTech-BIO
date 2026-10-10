# Code entry points and reproducibility scope

## Executed for this handoff

| Entry point | Inputs | Outputs / status |
|---|---|---|
| `scripts/audit_science.py` | Frozen plot tables and CP results | Passed numerical consistency audit, including refitting the selected CP spectral baseline |
| `scripts/compare_esm2.py` | Local ESM-2 weights, supplied reference and audited mutations | Completed embeddings and fixed-plan clustering for 11 constructs |
| `scripts/plot_esm2.py` | Frozen primary cosine-distance matrix | ORCA-styled supporting PNG/SVG |
| `scripts/draw_workflow.py` | Disclosed conceptual asset | SVG/PDF with vector labels and a conceptual bitmap; 2880-pixel-wide PNG |

Run commands from the repository root. Each new analysis/drawing entry point requires a fresh output path. The ESM-2 [plan and report](../analysis/esm2/REPORT.md) describe fixed choices and limitations. Its local weights are read-only and inference is offline.

## Supplied plotting code

`figure-sources/orca-02-11/plot.py` and `figure-sources/orca-n1-n4/plot.py` include the input tables and ORCA style helpers. Preserve their source directories and render in a disposable copy because some QA files are written next to the scripts. Do not run them against immutable source directories merely to produce a new render.

```bash
mkdir -p work
cp -R figure-sources/orca-02-11 work/orca-main
python work/orca-main/plot.py --only 8 --output rerender

cp -R figure-sources/orca-n1-n4 work/orca-new
python work/orca-new/plot.py --out rerender
```

Use fresh destination names if these copies already exist. Plotting needs Matplotlib, NumPy, pandas and Pillow; actual versions used during this handoff are recorded in validation reports. Futura is preferred; Arial/DejaVu Sans are fallbacks. A fallback font can change layout without changing data.

## Historical analysis archive

`historical/` retains the supplied 88 Python scripts and two shell scripts, including cancelled approaches clearly labelled by the source. Read its [workflow](historical/WORKFLOW.md), [script manifest](historical/MANIFEST.md) and [data dependencies](historical/DATA.md) before running a stage. The archival README's claim of unchanged code predates the documented machine-path edits in this repository.

This is not a fully portable one-command pipeline. Many scripts expect a reconstructed `af/`-style working directory, intermediate outputs and external tools or services. The original Windows-only PowerPoint COM script remains archival and is not used for the new workflow image. Some batch scripts require mapping original spreadsheet filenames to the descriptive names in data volume 4. The `data/external` replacement removes a private machine path; it does not automatically resolve every input dependency.

Do not run historical packaging/document-generation scripts in the source-data directory. They can overwrite outputs. Reconstruct a scratch working copy and inspect paths first. No cluster jobs, server submissions or full-data recomputations are launched by the new audit commands.
