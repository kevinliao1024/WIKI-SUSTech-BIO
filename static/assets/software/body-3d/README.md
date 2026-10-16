# Original human body surface

This asset is an original neutral adult mannequin for the conceptual delivery visualization. It is not patient anatomy or a quantitative anatomical model. No external mesh, photograph, model download, or model weights were used.

## Files

- body-surface.json: geometry metadata and artistic organ landmarks.
- body-surface.bin: little-endian Float32 positions, then Float32 normals, then Uint32 triangle indices, at the byte offsets in the metadata. 45,538 vertices; 91,304 triangles; 2,188,560 bytes.
- body-parameters.json: explicit torso/limb/head/hand shape parameters.
- generate_body.py: reproducible generator. Requires only NumPy; no meshing dependency.
- body-qa-contact.png: front, three-quarter and side visual QA.
- mesh-validation.json: hashes, environment versions and geometry checks.

## Coordinates and scale

Y is up; Z is forward; X is left/right. The surface extends from Y=0.0061 to 1.7579 in nominal metre units. This is artistic adult proportion, not measured clinical geometry. Brain landmark: [0,1.64,0]. Liver landmark: [-0.065,1.08,0.035]. Chest: [0,1.25,0.02]. Pelvis: [0,0.88,0].

## Regeneration

Use a fresh output directory; existing output files are refused before computation:

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python3 generate_body.py ./fresh-human-body
```

Generation was executed with Python 3.12.14 and NumPy 2.3.5. The analytic torso loft and softly blended anatomical primitives are sampled on a 0.006-unit grid and converted with a consistent six-tetrahedron surface extraction. Sub-grid vertex clustering reduces payload size; hand geometry retains a finer clustering step. Normals come from the implicit field gradient.

This mesh is intended for surface rendering. It is not guaranteed to be watertight or manifold after vertex clustering and is unsuitable for fabrication or quantitative anatomical measurement. See the numerical checks in mesh-validation.json. These limitations do not imply a scientific simulation: no delivery or biological model is executed by the generator.
