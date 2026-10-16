# Dry Model icon-flowchart previews

Open `index.html` in a browser. It contains the seven icon previews and embedded original images for offline comparison. None of these files is mounted on the Model page.

Each figure is supplied as an editable native SVG, vector PDF and 1.6× PNG. Text remains text in SVG. The pictograms are original schematic drawings; they are not measured structures, quantitative charts or specific sequence designs. `manifest.json` maps sources, scope, hashes, captions, alt text and unchanged relations. Figure 33 covers workflow panels A/C/D only; its numerical panel B remains unchanged in the original.

## Reproduce

Use an existing Python environment with Matplotlib and NumPy. No dependency installation is required by this package. Runtime versions and chosen font are recorded in the manifest. Run:

```sh
python generate.py --repository /path/to/WIKI_SUSTech-BIO --output /path/to/new-preview-directory
```

Use a new output directory. The generator refuses to overwrite an existing generated set. The repository supplies the immutable source PNGs and Module 4 text. The generator does not run a scientific model.

## Attribution

Native icon artwork and layouts were prepared for ORCA using its supplied palette and figure rules. Original-source attribution is unchanged; Figure 33 is adapted from Zhou et al. (2025) as documented in the Model page. Review the source mapping before any future replacement.
