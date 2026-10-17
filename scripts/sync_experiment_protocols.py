#!/usr/bin/env python3
"""Import current PDFs and render their maintained Markdown as static readers."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

import yaml
import markdown
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


class EntryAssets(HTMLParser):
    """Copy referenced local media, including linked SVG images; reject unsafe paths."""
    def __init__(self, folder, destination):
        super().__init__(convert_charrefs=False)
        self.folder, self.destination, self.parts, self.text = folder, destination, [], []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "iframe", "object", "embed"}:
            raise ValueError(f"Unsupported source markup: {tag}")
        clean = []
        for key, value in attrs:
            if key.startswith("on"):
                raise ValueError("Inline source event handlers are not allowed")
            if key in {"src", "href"} and value:
                url = urlsplit(value)
                if url.scheme not in {"", "http", "https"} or value.startswith("//"):
                    raise ValueError(f"Unsupported source URL: {value}")
                if not url.scheme and url.path:
                    source = (self.folder / unquote(url.path)).resolve()
                    if not source.is_relative_to(self.folder.resolve()) or not source.is_file():
                        raise ValueError(f"Missing or out-of-scope asset: {value}")
                    target = self.destination / unquote(url.path)
                    copy_asset(source, target, self.folder)
            clean.append(key if value is None else f'{key}="{escape(value, quote=True)}"')
        self.parts.append('<' + tag + (' ' + ' '.join(clean) if clean else '') + '>')

    def handle_endtag(self, tag):
        self.parts.append(f'</{tag}>')

    def handle_data(self, data):
        self.parts.append(data)
        self.text.append(data)

    def handle_entityref(self, name):
        self.parts.append(f'&{name};')

    def handle_charref(self, name):
        self.parts.append(f'&#{name};')


def copy_asset(source, target, root):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    if source.suffix == '.svg':
        # Viewport SVGs in the source library link to adjacent PNGs.
        for path in re.findall(r'(?:xlink:)?href="([^"]+)"', source.read_text()):
            if path.startswith('data:') or path.startswith('#'):
                continue
            dependency = (source.parent / path).resolve()
            if urlsplit(path).scheme or not dependency.is_relative_to(root.resolve()) or not dependency.is_file():
                raise ValueError(f"Invalid SVG dependency: {path}")
            copy_asset(dependency, target.parent / path, root)


def render_entry(folder, repo, data, category):
    files = list(folder.glob(folder.name + '*.md'))
    if len(files) != 1:
        raise ValueError(f"Expected one maintained Markdown file for {folder.name}")
    raw = files[0].read_text()
    # Preserve the source header metadata and every actual nonempty section.
    preamble, *chunks = re.split(r'^## ', raw, flags=re.M)
    preamble = re.sub(r'^# .*\n', '', preamble, count=1)
    source = '## Experiment Information\n\n' + f'**ID:** {data["id"]} · **Category:** {category}\n\n' + preamble
    for chunk in chunks:
        heading, _, body = chunk.partition('\n')
        if body.strip():
            source += '\n## ' + heading + '\n' + body
    converter = markdown.Markdown(extensions=['tables', 'sane_lists', 'toc'], extension_configs={'toc': {'toc_depth': '2-2'}})
    html = converter.convert(source)
    relative = Path('experiments/entries') / folder.name / 'index.html'
    destination = repo / 'static' / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    parser = EntryAssets(folder, destination.parent)
    parser.feed(html)
    env = Environment(loader=FileSystemLoader(repo / 'wiki'), autoescape=select_autoescape())
    template = env.get_template('components/experiments/entry.html')
    toc = [dict(id=t['id'], name=unescape(t['name'])) for t in converter.toc_tokens]
    destination.write_text(template.render(entry=data, body=''.join(parser.parts), toc=toc))
    # Plain unique words from the real source support related-keyword search.
    keywords = ' '.join(sorted(set(re.findall(r'[\wβµμ+-]+', ' '.join(parser.text).lower()))))
    return relative.as_posix(), keywords, hashlib.sha256(raw.encode()).hexdigest()


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
            reader, keywords, markdown_sha256 = render_entry(folder, repo, data, title)
            entries.append({
                "id": data["id"], "title": data["title"],
                "version": str(data["version"]), "file": relative.as_posix(),
                "size_kb": round(len(raw) / 1024),
                "sha256": hashlib.sha256(raw).hexdigest(),
                "reader": reader, "keywords": keywords, "markdown_sha256": markdown_sha256,
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
    parser.add_argument("source", type=Path, help="Maintained Protocols directory")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    sync(args.source.resolve(), args.repo.resolve())
