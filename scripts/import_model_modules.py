"""Import the supplied dry-lab manuscripts without changing scientific content.

Run with the repository's existing Python/Markdown environment:
    python scripts/import_model_modules.py --source-root /path/to/extracted/modules

The source root contains igem_module1 through igem_module4. Module 1 is retained
byte-for-byte, Module 2 receives only its supplied readout-depth addition and
caption updates, and Modules 3/4 are rendered as model-page fragments. This is
a presentation import, not model reproduction or scientific validation.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import struct
import zipfile
from pathlib import Path
from urllib.parse import urlsplit, quote

import markdown


DOCUMENTS = {
    1: ("01_Module1_Wiki_EN.md", "02_Module1_DBTL_EN.md"),
    2: ("wiki/PUF_Dry_Lab_Wiki_EN_ESM.md", "wiki/PUF_Module2_DBTL_EN_ESM.md"),
    3: ("wiki/module3.md", "wiki/DBTL.md"),
    4: ("wiki/module4.md", "wiki/DBTL.md"),
}
REPOSITORIES = {n: f"https://github.com/pdx12320/igem_module{n}" for n in (1, 2, 3)}
ATTR = re.compile(r'([\w-]+)="([^"]*)"')


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_if_changed(path: Path, data: bytes) -> None:
    if path.exists() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


class Importer:
    def __init__(self, source_root: Path, repository: Path):
        self.source_root = source_root.resolve()
        self.repository = repository.resolve()
        self.asset_root = self.repository / "static/assets/model"
        self.assets: dict[str, dict] = {}
        self.document_records: list[dict] = []

    def source(self, number: int, path: str) -> Path:
        return self.source_root / f"igem_module{number}" / path

    def register_asset(self, number: int, source_path: Path) -> str:
        root = self.source_root / f"igem_module{number}"
        relative = source_path.resolve().relative_to(root)
        destination = self.asset_root / f"igem_module{number}" / relative
        data = source_path.read_bytes()
        write_if_changed(destination, data)
        public = "/" + destination.relative_to(self.repository).as_posix()
        self.assets[public] = {
            "source": f"igem_module{number}/{relative.as_posix()}",
            "destination": destination.relative_to(self.repository).as_posix(),
            "sha256": sha256(data),
        }
        return public

    def png_image(self, number: int, document: Path, match: re.Match) -> str:
        attributes = {key: html.unescape(value) for key, value in ATTR.findall(match.group())}
        source_path = (document.parent / attributes["src"]).resolve()
        data = source_path.read_bytes()
        if data[:8] != b"\x89PNG\r\n\x1a\n":
            raise ValueError(f"Expected a supplied PNG: {source_path.name}")
        width, height = struct.unpack(">II", data[16:24])
        public = self.register_asset(number, source_path)
        alt = html.escape(attributes.get("alt", ""), quote=True)
        return (f'<img loading="lazy" decoding="async" src="{public}" '
                f'alt="{alt}" width="{width}" height="{height}">')

    def link(self, number: int, document: Path, target: str) -> str:
        parts = urlsplit(html.unescape(target))
        if parts.scheme or parts.netloc or not parts.path:
            return target
        root = self.source_root / f"igem_module{number}"
        source_path = (document.parent / parts.path).resolve()
        relative = source_path.relative_to(root).as_posix()
        if relative == DOCUMENTS[number][0]:
            return f"/model#module{number}"
        if relative == DOCUMENTS[number][1]:
            return f"/model#module{number}-dbtl"
        if number == 4 and relative.rstrip("/") == "provenance/input-drafts":
            return "/static/assets/model/igem_module4/provenance/input-drafts.zip"
        local_suffixes = {".csv", ".tsv", ".json", ".md", ".png"}
        if source_path.is_file() and source_path.suffix in local_suffixes:
            # Runnable code and larger reusable directories stay in the source
            # repository; small evidence records are locally downloadable.
            public = self.register_asset(number, source_path)
            return public + ("#" + parts.fragment if parts.fragment else "")
        if number not in REPOSITORIES:
            raise ValueError(f"No local evidence target: module {number}, {relative}")
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        kind = "tree" if source_path.is_dir() else "blob"
        return f"{REPOSITORIES[number]}/{kind}/main/{quote(relative, safe='/')}"

    def render(self, source: str, number: int, document: Path,
               dbtl: bool = False, chapters: bool = True) -> str:
        if number == 4 and not dbtl:
            # The Model page omits the DBTL account; retain the archived source.
            source = source.replace(
                "This text-only release contains the Wiki, DBTL record and their",
                "This text-only release contains the Wiki and its",
            )
        source = re.sub(r"\A# [^\n]+\n+", "", source, count=1)
        rendered = markdown.markdown(source, extensions=["tables", "fenced_code", "sane_lists"])
        rendered = re.sub(r"<img\b[^>]*>", lambda m: self.png_image(number, document, m), rendered)

        def href(match: re.Match) -> str:
            target = self.link(number, document, match.group(1))
            return 'href="' + html.escape(html.unescape(target), quote=True) + '"'

        rendered = re.sub(r'href="([^"]*)"', href, rendered)
        # In these supplied manuscripts each image is followed by its caption.
        rendered = re.sub(
            r"<p>(<img\b[^>]*>)</p>\s*<p>(.*?)</p>",
            lambda m: "<figure>" + m.group(1) + "<figcaption>" +
            re.sub(r"^<em>(.*)</em>$", r"\1", m.group(2), flags=re.S) +
            "</figcaption></figure>", rendered, flags=re.S,
        )
        rendered = rendered.replace(
            "<table>", '<div class="model-table" tabindex="0" role="region" '
            'aria-label="Scrollable data table"><table>'
        ).replace("</table>", "</table></div>")
        counter = 0

        def heading(match: re.Match) -> str:
            nonlocal counter
            level = int(match.group(1))
            content = match.group(2)
            if level == 2 and chapters:
                counter += 1
                marker = f"module{number}{'-dbtl' if dbtl else ''}-{counter}"
                return (f'<h3 id="{marker}" data-model-chapter>'
                        f'<span class="chapter-number">{number}.{counter}</span>'
                        f"{content}</h3>")
            new_level = min(level + 1, 6)
            return f"<h{new_level}>{content}</h{new_level}>"

        rendered = re.sub(r"<h([2-6])>(.*?)</h\1>", heading, rendered, flags=re.S)
        return rendered

    def module2_addition(self, source: str, document: Path, destination: Path) -> None:
        current = destination.read_text()
        section = re.search(
            r"(#### Sensitivity to ESM-2 readout depth\n.*?)(?=#### Original five constructs)",
            source, re.S,
        )
        if not section:
            raise ValueError("The supplied Module 2 sensitivity section is missing")
        addition = self.render(section.group(1), 2, document, chapters=False)
        start = "<h5>Sensitivity to ESM-2 readout depth</h5>"
        end = "<h5>Original five constructs with high measured specificity</h5>"
        if start in current:
            current = current[:current.index(start)] + addition + "\n" + current[current.index(end):]
        else:
            if end not in current:
                raise ValueError("Module 2 insertion point changed")
            current = current.replace(end, addition + "\n" + end, 1)
        captions = re.findall(r"!\[[^\]]*\]\([^\n]+\)\s*\n\s*\*([^\n]+)\*", source)
        if len(captions) != 15 or len(re.findall(r"<figcaption>", current)) != 15:
            raise ValueError("Module 2 caption count changed")
        caption_iter = iter(captions)

        def caption(match: re.Match) -> str:
            markup = markdown.markdown(next(caption_iter))
            return "<figcaption>" + markup.removeprefix("<p>").removesuffix("</p>") + "</figcaption>"

        current = re.sub(r"<figcaption>.*?</figcaption>", caption, current, flags=re.S)
        write_if_changed(destination, current.encode())

    def original_drafts(self) -> None:
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name in ("WIKI.md", "DBTL.md"):
                source_path = self.source(4, f"provenance/input-drafts/{name}")
                self.register_asset(4, source_path)
                entry = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.external_attr = 0o100644 << 16
                archive.writestr(entry, source_path.read_bytes())
        destination = self.asset_root / "igem_module4/provenance/input-drafts.zip"
        write_if_changed(destination, data.getvalue())
        self.assets["/" + destination.relative_to(self.repository).as_posix()] = {
            "source": "igem_module4/provenance/input-drafts/{WIKI.md,DBTL.md}",
            "destination": destination.relative_to(self.repository).as_posix(),
            "sha256": sha256(data.getvalue()),
            "note": "Deterministic download archive; individual drafts are preserved byte-for-byte.",
        }

    def run(self) -> None:
        manifest_path = self.asset_root / "source-manifest.json"
        old_manifest = json.loads(manifest_path.read_text())
        for asset in old_manifest["assets"]:
            destination = (self.repository / asset["destination"] if "destination" in asset
                           else self.asset_root / asset["source"])
            if not destination.is_file():
                raise FileNotFoundError(destination)
            public = "/" + destination.relative_to(self.repository).as_posix()
            record = dict(asset, destination=destination.relative_to(self.repository).as_posix())
            actual = sha256(destination.read_bytes())
            if actual != asset["sha256"]:
                source_path = self.source_root / asset["source"]
                if (not source_path.is_file() or
                        source_path.read_bytes().replace(b"\r\n", b"\n") !=
                        destination.read_bytes().replace(b"\r\n", b"\n")):
                    raise ValueError(f"Existing imported asset changed: {asset['source']}")
                record.update(sha256=actual, source_sha256=asset["sha256"],
                              note="Existing import normalized line endings; content is unchanged.")
            self.assets[public] = record
        for number, sources in DOCUMENTS.items():
            for index, relative in enumerate(sources):
                suffix = "-dbtl" if index else ""
                source_path = self.source(number, relative)
                data = source_path.read_bytes()
                markdown_path = self.asset_root / f"module{number}{suffix}.md"
                if number == 1:
                    if markdown_path.read_bytes() != data:
                        raise ValueError("Module 1 source differs; review before changing its existing import")
                else:
                    write_if_changed(markdown_path, data)
                self.document_records.append({
                    "source": f"igem_module{number}/{relative}",
                    "destination": markdown_path.relative_to(self.repository).as_posix(),
                    "sha256": sha256(data),
                })
                template = self.repository / f"wiki/components/model/module{number}{suffix}.html"
                if number == 2:
                    self.module2_addition(data.decode(), source_path, template)
                elif number in (3, 4):
                    fragment = self.render(data.decode(), number, source_path, dbtl=bool(index))
                    write_if_changed(template, ("{% raw %}\n" + fragment + "\n{% endraw %}\n").encode())
        # Keep compact provenance and plot tables. Historical programs, large
        # structure archives, checkpoints and dependency caches are not imported.
        for relative in ("README.md", "provenance/REVISION_NOTES.md",
                         "provenance/TERMINOLOGY.md", "provenance/sources.md",
                         "provenance/input-manifest.json"):
            self.register_asset(4, self.source(4, relative))
        self.original_drafts()
        for source_path in sorted(self.source(3, "data/plot-tables").glob("*.csv")):
            self.register_asset(3, source_path)
        for relative in ("figure-sources/orca-n1-n4/input/data/combo_batch_ratio_vs_retention.csv",
                         "figure-sources/orca-n1-n4/input/data/designed_batch_groups.csv"):
            self.register_asset(3, self.source(3, relative))
        manifest = {
            "source": "Team-supplied Module 1–4 archives, imported 2026-10-10",
            "documents": [r["source"] for r in self.document_records],
            "document_records": self.document_records,
            "assets": sorted(self.assets.values(), key=lambda row: row["destination"]),
            "scope": "Presentation import only; no model training, assay reanalysis or claim verification.",
            "module4_evidence_status": (
                "Text-only release. Project-specific numbers come from the supplied drafts "
                "and await reconciliation with original results. No synthetic figures, "
                "training curves, checkpoints or inference program were added."
            ),
        }
        write_if_changed(manifest_path, (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode())
        print(f"Imported {len(self.document_records)} documents; recorded {len(self.assets)} assets.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    arguments = parser.parse_args()
    Importer(arguments.source_root, arguments.repo_root).run()
