#!/usr/bin/env python3
"""Import original PDFs and generate lossless page facsimiles (PyMuPDF/Pillow at import time)."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape


GROUPS = [
    ("M", "Molecular Biology", "Core methods", "From DNA assembly to RNA and protein readouts.", "#3d409b"),
    ("C", "Cell Biology", "Core methods", "Maintain, preserve and prepare mammalian cells.", "#6f71c1"),
    ("MR", "miRNA Regulation", "Project methods", "Small-RNA extraction, detection and mimic delivery.", "#676a9f"),
    ("RP", "Reporter System", "Project methods", "Construct, stabilize and measure the SONAR reporter.", "#a45e73"),
    ("AS", "ASO Control", "Project methods", "Deliver antisense oligonucleotides for experimental control.", "#8e608b"),
    ("AA", "AAV Delivery", "Project methods", "Packaging, purification, genome titration and transduction.", "#527c8f"),
    ("FV", "Functional Validation", "Project methods", "Cell delivery, lipid imaging and an Aβ42 clearance assay.", "#66745c"),
]


def render_entry(pdf, repo, data):
    # Authoring-only dependencies, already used by the Notebook importer.
    import fitz
    from PIL import Image

    relative = Path('experiments/entries') / data['id'] / 'index.html'
    destination = repo / 'static' / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
    manifest_path = destination.with_name('pages.json')
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    renderer = f'PyMuPDF {fitz.__version__}; lossless WebP; width 1800'
    reusable = previous.get('source_sha256') == digest and previous.get('renderer') == renderer
    pages, toc, seen, texts = [], [], set(), []
    with fitz.open(pdf) as document:
        for number, page in enumerate(document, 1):
            rect = page.rect
            text = page.get_text(sort=True)
            texts.append(text)
            anchors = []
            # Source PDFs use Georgia Bold 14pt for their actual section headings.
            # Derive labels and positions from PDF text, never from a rewritten outline.
            for block in page.get_text('dict')['blocks']:
                for line in block.get('lines', []):
                    spans = line['spans']
                    if spans and all('Georgia-Bold' in v['font'] and abs(v['size'] - 14) < .2 for v in spans):
                        title = ''.join(v['text'] for v in spans).strip()
                        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                        if not slug or slug in seen:
                            continue
                        seen.add(slug)
                        anchor = dict(id=slug, title=title, page=number, top=round(line['bbox'][1] / rect.height * 100, 5))
                        toc.append(anchor)
                        anchors.append(anchor)
            image_name = f'page-{number:03d}.webp'
            target = destination.parent / image_name
            old = next((p for p in previous.get('pages', []) if p['number'] == number), {})
            if not (reusable and target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == old.get('sha256')):
                pix = page.get_pixmap(matrix=fitz.Matrix(1800 / rect.width, 1800 / rect.width), alpha=False)
                Image.frombytes('RGB', [pix.width, pix.height], pix.samples).save(target, 'WEBP', lossless=True)
            with Image.open(target) as img:
                width, height = img.size
            links = []
            for link in page.get_links():
                uri = link.get('uri', '')
                if urlsplit(uri).scheme not in {'http', 'https'}:
                    continue
                box = link['from']
                links.append(dict(url=uri, left=round(box.x0 / rect.width * 100, 5),
                                  top=round(box.y0 / rect.height * 100, 5),
                                  width=round(box.width / rect.width * 100, 5),
                                  height=round(box.height / rect.height * 100, 5)))
            pages.append(dict(number=number, image=image_name, width=width, height=height,
                              sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                              text=text, anchors=anchors, links=links))
    env = Environment(loader=FileSystemLoader(repo / 'wiki'), autoescape=select_autoescape())
    rendered = env.get_template('components/experiments/entry.html').render(entry=data, pages=pages, toc=toc)
    destination.write_text('\n'.join(line.rstrip() for line in rendered.splitlines()) + '\n')
    manifest = dict(source_sha256=digest, renderer=renderer, page_count=len(pages),
                    pages=[{k:v for k,v in p.items() if k != 'text'} for p in pages])
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    keywords = ' '.join(sorted(set(re.findall(r'[\wβµμ+-]+', ' '.join(texts).lower()))))
    print(f"{data['id']}: {len(pages)} original PDF pages", flush=True)
    return relative.as_posix(), keywords, len(pages)


def refresh_readers(repo):
    """Render only the already-approved, checksum-verified deployment PDFs."""
    catalog = repo / 'docs/wet-lab/experiments.md'
    _, frontmatter, body = catalog.read_text().split('---', 2)
    metadata = yaml.safe_load(frontmatter)
    for group in metadata['protocol_groups']:
        for data in group['protocols']:
            pdf = repo / 'static' / data['file']
            if hashlib.sha256(pdf.read_bytes()).hexdigest() != data['sha256']:
                raise ValueError(f"PDF checksum mismatch: {data['id']}")
            data['reader'], data['keywords'], data['page_count'] = render_entry(pdf, repo, data)
            data.pop('markdown_sha256', None)
    catalog.write_text('---\n' + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True) + '---' + body)


def sync(source, repo):
    groups = []
    for code, title, family, description, color in GROUPS:
        entries = []
        for folder in sorted(source.iterdir()):
            pattern = r"(?:M|MX)\d{2}" if code == 'M' else code + r"\d{2}"
            if not folder.is_dir() or not re.fullmatch(pattern, folder.name):
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
            reader, keywords, page_count = render_entry(pdf, repo, data)
            entries.append({
                "id": data["id"], "title": data["title"],
                "version": str(data["version"]), "file": relative.as_posix(),
                "size_kb": round(len(raw) / 1024),
                "sha256": hashlib.sha256(raw).hexdigest(),
                "reader": reader, "keywords": keywords, "page_count": page_count,
            })
        if not entries:
            raise ValueError(f"No current PDFs for {code}")
        groups.append(dict(code=code, title=title, family=family,
                           description=description, color=color, protocols=entries))
    guide = yaml.safe_load((repo / 'docs/wet-lab/experiment-guide.yaml').read_text())
    metadata = dict(title="Experiment", subtitle="Experimental methods and practical procedures behind ORCA.",
                    eyebrow="Wet Lab", guide=guide, protocol_groups=groups)
    content = "---\n" + yaml.safe_dump(metadata, sort_keys=False, allow_unicode=True) + "---\n\n"
    content += "## Experimental methods and practical procedures behind ORCA.\n"
    destination = repo / "docs/wet-lab/experiments.md"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content)
    print(f"Imported {sum(len(g['protocols']) for g in groups)} PDFs in {len(groups)} categories.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, nargs="?", help="Maintained Protocols directory")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--refresh-readers", action="store_true", help="Render the existing approved deployment PDFs")
    args = parser.parse_args()
    if args.refresh_readers:
        refresh_readers(args.repo.resolve())
    elif args.source:
        sync(args.source.resolve(), args.repo.resolve())
    else:
        parser.error("Provide source or --refresh-readers")
