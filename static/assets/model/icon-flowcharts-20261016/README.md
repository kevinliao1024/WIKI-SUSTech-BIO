# Selected Dry Model icon workflows

User-approved Figures 2, 10, 20 and 25 only. Each is supplied as native editable SVG, vector PDF and PNG. Original source images and the seven-figure preview package are unchanged. The page owner handles mounting these assets.

Revision v2 changes only three drawing primitives: the Figure 2 scissors pivot is at the exact blade intersection; the Figure 25 circular update arrow has a single continuous curved shaft and tangent arrowhead; the Figure 25 left feedback route uses the same indigo as the other workflow arrows. All scientific labels and directed relationships are unchanged. The v1 deliverable is retained separately.

Figure 2 removes the top library-count line and bottom reference-build line from the graphic and reduces its canvas height from 690 to 540 layout units. Those scientific details remain documented in the source page and external caption. Local pictogram refinements separate the magnifier/target, frozen-model lock, paired model networks, and structural-audit lens/checkmark. The workflow edges, scientific labels, model inputs, formulas and numerical claims are unchanged.

Open index.html for a standalone source-versus-selected comparison. SVG text remains editable. The icons are schematic symbols and do not encode measured chart values or molecular coordinates.

Reproduce in an existing Python environment with Matplotlib and NumPy:

    python generate.py --repository /path/to/WIKI_SUSTech-BIO --output /path/to/new-output

Use a new output directory. The script refuses to overwrite a generated set. Add --preserve-unchanged to retain the approved Figure 10 and 20 file bytes from the repository; otherwise all four are rendered from the same drawing code. Runtime versions and font are recorded in manifest.json. No model is recomputed, and no new dependency is installed.
