#!/usr/bin/env python3
"""Import current, numbered team protocol PDFs; never import archives or sources."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

import yaml


GROUPS = [
    ("M", "Molecular Biology", "Core methods", "From DNA assembly to RNA and protein readouts.", "#3d409b"),
    ("C", "Cell Culture", "Core methods", "Maintain, preserve and prepare mammalian cells.", "#6f71c1"),
    ("MX", "Integrated Molecular Biology", "Integrated workflows", "Connect core methods into complete experimental workflows.", "#5f62cd"),
    ("MR", "MRE / miRNA Regulation", "Project methods", "Small-RNA extraction, detection and mimic delivery.", "#676a9f"),
    ("RP", "Reporter System", "Project methods", "Construct, stabilize and measure the SONAR reporter.", "#a45e73"),
    ("AS", "ASO Control", "Project methods", "Deliver antisense oligonucleotides for experimental control.", "#8e608b"),
    ("AA", "AAV Delivery", "Project methods", "Packaging, purification, genome titration and transduction.", "#527c8f"),
    ("FV", "Functional Validation", "Project methods", "Cell delivery, lipid imaging and an Aβ42 clearance assay.", "#66745c"),
]


def sync(source, repo):
    groups = []
    for code, title, family, description, color in GROUPS:
        entries = []
        for folder in sorted(source.iterdir()):
            if not folder.is_dir() or not re.fullmatch(code + r"\d{2}", folder.name):
                continue
            pdfs = list(folder.glob("*.pdf"))
            if len(pdfs) != 1:
                raise ValueError(f"Expected exactly one current PDF in {folder.name}")
            data = json.loads((folder / "protocol.json").read_text())
            if data["id"] != folder.name:
                raise ValueError(f"Protocol ID mismatch: {folder.name}")
            pdf = pdfs[0]
            raw = pdf.read_bytes()
            if not raw.startswith(b"%PDF-"):
                raise ValueError(f"Invalid PDF: {pdf.name}")
            relative = Path("experiments/pdf") / pdf.name
            target = repo / "static" / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(pdf, target)
            entries.append({
                "id": data["id"], "title": data["title"],
                "version": str(data["version"]), "file": relative.as_posix(),
                "size_kb": round(len(raw) / 1024),
                "sha256": hashlib.sha256(raw).hexdigest(),
            })
        if not entries:
            raise ValueError(f"No current PDFs for {code}")
        groups.append(dict(code=code, title=title, family=family,
                           description=description, color=color, protocols=entries))
    metadata = dict(title="Experiments", subtitle="Methods behind the work.",
                    eyebrow="Wet Lab", protocol_groups=groups)
    content = "---\n" + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True) + "---\n\n"
    content += "## Methods behind the work.\n\nExplore the protocols behind ORCA, from everyday laboratory methods to project-specific workflows. Each numbered protocol opens as a PDF with its materials, procedures and references.\n"
    destination = repo / "docs/wet-lab/experiments.md"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content)
    print(f"Imported {sum(len(g['protocols']) for g in groups)} PDFs in {len(groups)} categories.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Maintained Protocols directory")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    sync(args.source.resolve(), args.repo.resolve())
