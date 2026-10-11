# APOE residue 112 — /next review plates

Public reference coordinates from RCSB PDB, retrieved 2026-10-11:

| Reference | Chain | Residue 112 | Residue 158 | X-ray resolution |
| --- | --- | --- | --- | --- |
| [1B68](https://www.rcsb.org/structure/1B68) · APOE4 N-terminal fragment | A | ARG | ARG | 2.00 Å |
| [1LPE](https://www.rcsb.org/structure/1LPE) · APOE3 N-terminal domain | A | CYS | ARG | 2.25 Å |

The current 1LPE entry reports 2.25 Å; its historical primary-paper abstract
mentions 2.5 Å. Labels use the current deposited entry metadata.

These are independent published crystal structures. The APOE3 reference
illustrates the intended residue identity of the APOE3-like RNA design; it is
**not** a structure measured after the team's editing experiment. RNA editing
changes coding information; the slider does not depict a sidechain being
chemically converted within an existing protein.

Both plates share a Kabsch alignment using 117 observed chain-A C-alpha atoms
at residues 42–160, RMSD 0.3313 Å, then one orthographic view and scale. The
display uses observed residues 23–162 only; missing 1B68 residues 84–85 are
left disconnected. The ribbons are a smooth C-alpha representation and the
112 sidechain uses deposited heavy-atom coordinates with explicit residue
bonds. The inset magnification and composition are identical in both plates.

Rendered offline with the existing Blender 5.2.1 LTS installation, Cycles.
No generative images or invented atoms are used. Blue grey is a desaturated
structure-specific neutral; coral #F58F9C and paper #FFFEFC follow ORCA tokens.

To regenerate, from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render_apoe112.py -- --out /tmp/orca-apoe112-render
python scripts/package_apoe112.py /tmp/orca-apoe112-render
```

The packaging step needs Pillow. `provenance.json` records the source hashes,
alignment, projection anchors and entry metadata. `*-plate.webp` are the
lightweight page assets; `*-plate.png` are exportable high-resolution versions.

Preview only: `/next#apoe112`. The default `/` does not load these assets.
Before public iGEM deployment, upload production images to `static.igem.wiki`
and replace the local-review asset URLs according to the repository's asset
hosting policy. No public upload or homepage promotion has been performed.
