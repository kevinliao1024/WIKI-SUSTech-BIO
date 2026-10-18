"""Derive display-only meshes from the supplied STL archives; originals stay intact.

Run from the repository root with an existing Python environment containing NumPy:
  python static/human-practices/model-viewers/derive_meshes.py --output NEW_DIRECTORY

Vertex clustering is deliberately bounded to 1/220 of the model's longest axis.
No surface or color is invented. Browser colors are a display-only palette because
the input STLs have no vertex/material colors or biological segmentation metadata.
"""

import argparse
import hashlib
import json
import struct
import zipfile
from pathlib import Path

import numpy as np

STL_DTYPE = np.dtype([("normal", "<f4", 3), ("vertices", "<f4", (3, 3)), ("attribute", "<u2")])
SOURCES = {
    "brain": "biology-brain-model.stl.zip",
    "cell": "biology-animal-cell-model.stl.zip",
}


def cluster(vertices, resolution=220):
    points = vertices.reshape(-1, 3)
    low, high = points.min(axis=0), points.max(axis=0)
    step = float((high - low).max()) / resolution
    # Each coordinate occupies an unsigned 16-bit field, so ordering is stable.
    ids = np.zeros(len(points), dtype=np.uint64)
    for axis in range(3):
        q = np.floor((points[:, axis] - low[axis]) / step).astype(np.uint64)
        ids |= q << (axis * 16)
    unique, inverse = np.unique(ids, return_inverse=True)
    counts = np.bincount(inverse)
    positions = np.column_stack([
        np.bincount(inverse, weights=points[:, axis]) / counts for axis in range(3)
    ]).astype("<f4")
    faces = inverse.reshape(-1, 3).astype("<u4")
    nondegenerate = (faces[:, 0] != faces[:, 1]) & (faces[:, 1] != faces[:, 2]) & (faces[:, 2] != faces[:, 0])
    faces = faces[nondegenerate]
    # Retain the winding of the first source face when clustering coincides.
    _, first = np.unique(np.sort(faces, axis=1), axis=0, return_index=True)
    faces = faces[np.sort(first)]
    offsets = positions[faces[:, 1]] - positions[faces[:, 0]]
    edges = positions[faces[:, 2]] - positions[faces[:, 0]]
    faces = faces[np.linalg.norm(np.cross(offsets, edges), axis=1) > 1e-12]
    error = float(np.linalg.norm(points - positions[inverse], axis=1).max())
    assert error <= np.sqrt(3) * step + 1e-6
    return positions, faces, {"gridResolution": resolution, "cellSize": step, "maxVertexDisplacement": error}


def convert(source, output, key):
    with zipfile.ZipFile(source) as archive:
        members = [name for name in archive.namelist() if name.lower().endswith(".stl")]
        assert len(members) == 1
        raw = archive.read(members[0])
    source_count = struct.unpack_from("<I", raw, 80)[0]
    assert len(raw) == 84 + 50 * source_count
    triangles = np.frombuffer(raw, dtype=STL_DTYPE, offset=84, count=source_count)
    assert np.isfinite(triangles["vertices"]).all()
    attributes = np.unique(triangles["attribute"]).tolist()
    assert attributes == [0], "Colored STL requires a different conversion; do not discard colors."
    # A small fixture validates the algorithm before conversion of this asset.
    sample_positions, sample_faces, sample_error = cluster(triangles["vertices"][:10000])
    assert np.isfinite(sample_positions).all() and sample_faces.max() < len(sample_positions)
    positions, faces, reduction = cluster(triangles["vertices"])
    low, high = triangles["vertices"].min(axis=(0, 1)), triangles["vertices"].max(axis=(0, 1))
    assert np.all(positions.min(axis=0) >= low - 1e-6)
    assert np.all(positions.max(axis=0) <= high + 1e-6)
    assert faces.max() < len(positions) and np.isfinite(positions).all()
    output_bin = output / f"{key}.bin"
    payload = positions.tobytes() + faces.tobytes()
    output_bin.write_bytes(payload)
    report = {
        "format": "positions-float32le-indices-uint32le", "id": key,
        "source": source.name, "sourceMember": members[0],
        "sourceArchiveSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "sourceStlSha256": hashlib.sha256(raw).hexdigest(),
        "sourceTriangles": source_count, "sourceAttributeValues": attributes,
        "sourceBounds": [low.tolist(), high.tolist()],
        "vertices": len(positions), "triangles": len(faces),
        "indexByteOffset": positions.nbytes, "byteLength": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(), "mesh": output_bin.name,
        "bounds": [positions.min(axis=0).tolist(), positions.max(axis=0).tolist()],
        "derivation": "vertex clustering; degenerate and duplicate triangles removed",
        "reduction": reduction, "numpyVersion": np.__version__,
        "colorStatus": "No colors in source STL. Browser palette is for visual display, not biological segmentation.",
    }
    (output / f"{key}.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({key: report}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True, help="A new output directory (must not exist).")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    for model_id, filename in SOURCES.items():
        convert(Path("assets/human-practices/models") / filename, args.output, model_id)
