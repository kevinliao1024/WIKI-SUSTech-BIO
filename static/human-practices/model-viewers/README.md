# Human Practices model viewers

These two viewers display the team's supplied STL geometry. They preserve the
static illustrations and original model archive downloads. There is no automatic
rotation and no mesh or Three.js download until a visitor presses the load button.

## Integration

Load `viewers.css`, then `viewers.js` as a module after providing the existing
local Three.js import map. The `three` import points to
`static/vendor/three/three.module.js`; `three/addons/` points to the matching local
addons directory. The bundled version is Three.js revision 186.

The module enhances figures containing `biology-brain-model-render.webp` or
`biology-cell-model-render.webp`. It preserves each `figcaption`. The exported
`enhanceModelViewers(root)` is idempotent if additional figures are inserted later.

Drag or touch rotates the model, a wheel or two-finger gesture zooms, and the
toolbar provides zoom/reset/poster buttons. On a focused canvas, the arrow keys
rotate, plus/minus zoom, and R resets. Load or WebGL errors leave the static
illustration and source download available.

## Geometry and color provenance

The original binary STL archives have 1,439,423 brain triangles and 1,467,272 cell
triangles. All triangle color attributes are zero, with no material or anatomical
segmentation metadata. The visible palette is therefore explicitly described as
display color, not a reconstruction of the illustration's biological regions.
No anatomical labels are inferred from that palette.

Derived meshes use vertex clustering on a 220-cell grid along the longest axis;
only coincident/degenerate triangles are removed. Their manifests record original
and derived SHA-256 hashes, bounds, triangle counts, NumPy version, and maximum
vertex displacement. Maximum displacement is 0.004511 (brain) and 0.004629 (cell)
in source coordinate units, less than 0.47% of either model's longest dimension.
This is a web-display approximation; original print/download files stay intact.

The brain payload is 6,069,564 bytes (338,854 triangles); the cell payload is
9,197,592 bytes (514,425 triangles). Pixel ratio is capped at 1.5, rendering occurs
only on resize or interaction, and no animation loop runs while idle. These data
and local vendor modules must remain in the static build for offline/local hosting.

## Reproduce and validate

Use an existing Python environment with NumPy; no browser/runtime dependency has
been added. From the repository root:

```sh
python static/human-practices/model-viewers/derive_meshes.py --output work/new-model-meshes
python static/human-practices/model-viewers/verify_meshes.py
node --check static/human-practices/model-viewers/viewers.js
```

The converter requires a new output directory and never rewrites the original
assets. It runs a 10,000-triangle fixture before each complete model conversion.
