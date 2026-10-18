"""Validate derived payloads, source hashes, index ranges, and bounds (NumPy)."""
import hashlib
import json
import zipfile
from pathlib import Path

import numpy as np

directory = Path(__file__).parent / "data" / "meshes"
for model in ("brain", "cell"):
    report = json.loads((directory / f"{model}.json").read_text())
    binary = (directory / report["mesh"]).read_bytes()
    source = Path("assets/human-practices/models") / report["source"]
    assert hashlib.sha256(source.read_bytes()).hexdigest() == report["sourceArchiveSha256"]
    with zipfile.ZipFile(source) as archive:
        assert hashlib.sha256(archive.read(report["sourceMember"])).hexdigest() == report["sourceStlSha256"]
    assert hashlib.sha256(binary).hexdigest() == report["sha256"]
    assert len(binary) == report["byteLength"] == report["vertices"] * 12 + report["triangles"] * 12
    positions = np.frombuffer(binary, dtype="<f4", count=report["vertices"] * 3).reshape(-1, 3)
    faces = np.frombuffer(binary, dtype="<u4", offset=report["indexByteOffset"]).reshape(-1, 3)
    assert np.isfinite(positions).all() and faces.max() < len(positions)
    assert (faces[:, 0] != faces[:, 1]).all() and (faces[:, 1] != faces[:, 2]).all()
    assert (faces[:, 2] != faces[:, 0]).all()
    low, high = np.array(report["sourceBounds"])
    assert np.all(positions.min(axis=0) >= low - 1e-6) and np.all(positions.max(axis=0) <= high + 1e-6)
    assert np.allclose([positions.min(axis=0), positions.max(axis=0)], report["bounds"])
    assert report["reduction"]["maxVertexDisplacement"] <= np.sqrt(3) * report["reduction"]["cellSize"] + 1e-6
    assert report["sourceAttributeValues"] == [0]
    print(f'{model}: source hash, mesh hash, {len(positions):,} vertices, {len(faces):,} triangles, indices and bounds verified')
