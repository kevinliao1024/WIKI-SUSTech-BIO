from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlparse


ALLOWED_ASSET_HOSTS = {"static.igem.wiki", "video.igem.org"}
EXCLUDED_TERMS = ("physicell", "paraview")
EXPECTED_OUTPUTS = {
    "index.html",
    "team",
    "attributions",
    "description",
    "engineering",
    "results",
    "contribution",
    "parts",
    "experiments",
    "notebook",
    "measurement",
    "alternative-platform",
    "safety-and-security",
    "dry-lab",
    "model",
    "brain-delivery",
    "offtarget-atlas",
    "software",
    "hardware",
    "entrepreneurship",
    "human-practices",
    "education",
    "inclusivity",
    "sustainability",
    "404.html",
}
EXPECTED_EVIDENCE = {
    "static/evidence/brain-delivery-v4-summary.md",
    "static/evidence/puf-atlas-example/summary.json",
    "static/evidence/puf-atlas-example/run_metadata.json",
}


class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets: list[str] = []
        self.images_without_alt: list[str] = []
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag in {"script", "img", "source", "video", "audio", "iframe"}:
            source = attributes.get("src")
            if source:
                self.assets.append(source)
        if tag == "img" and "alt" not in attributes:
            self.images_without_alt.append(attributes.get("src", "<unknown>"))
        if tag in {"image", "use"}:
            for attribute in ("href", "xlink:href"):
                if attributes.get(attribute):
                    self.assets.append(attributes[attribute])
        if tag == "link" and attributes.get("rel") not in {"license", None}:
            href = attributes.get("href")
            if href:
                self.assets.append(href)
        if tag == "a" and attributes.get("href"):
            self.links.append(attributes["href"])


def audit_document(name: str, document: str) -> list[str]:
    issues: list[str] = []
    parser = AssetParser()
    parser.feed(document)

    for source in parser.images_without_alt:
        issues.append(f"{name}: image missing alt text: {source}")

    for asset in parser.assets:
        parsed = urlparse(asset)
        if parsed.netloc and parsed.hostname not in ALLOWED_ASSET_HOSTS:
            issues.append(f"{name}: third-party runtime asset: {asset}")

    if "creativecommons.org/licenses/by/4.0" not in document:
        issues.append(f"{name}: missing required license link")
    if "gitlab.igem.org/2026/sustech" not in document:
        issues.append(f"{name}: missing required repository link")

    lowered = document.lower()
    for term in EXCLUDED_TERMS:
        if term in lowered:
            issues.append(f"{name}: excluded term found: {term}")

    return issues


def audit_stylesheet(name: str, stylesheet: str) -> list[str]:
    issues: list[str] = []
    candidates = re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", stylesheet, flags=re.I)
    candidates.extend(re.findall(r"@import\s+['\"](https?://[^'\"]+)", stylesheet, flags=re.I))
    for asset in candidates:
        parsed = urlparse(asset)
        if parsed.scheme in {"http", "https"} and parsed.netloc not in ALLOWED_ASSET_HOSTS:
            issues.append(f"{name}: third-party stylesheet asset: {asset}")
    return issues


def audit_script(name: str, source: str) -> list[str]:
    issues: list[str] = []
    # Catches: from '...', import '...', import('...')
    candidates = re.findall(r"""(?:from|import)\s*\(?\s*['"](https?://[^'"]+)['"]""", source)
    for url in candidates:
        parsed = urlparse(url)
        if parsed.hostname not in ALLOWED_ASSET_HOSTS:
            issues.append(f"{name}: remote ESM import: {url}")
    return issues


def audit_importmap(name: str, source: str) -> list[str]:
    issues: list[str] = []
    try:
        data = json.loads(source)
    except json.JSONDecodeError:
        return issues
    if not isinstance(data, dict):
        return issues
    specifiers: list[str] = list((data.get("imports") or {}).values())
    for scope in (data.get("scopes") or {}).values():
        if isinstance(scope, dict):
            specifiers.extend(scope.values())
    for specifier in specifiers:
        if not isinstance(specifier, str):
            continue
        parsed = urlparse(specifier)
        if parsed.scheme in {"http", "https"} and parsed.hostname not in ALLOWED_ASSET_HOSTS:
            issues.append(f"{name}: remote import map specifier: {specifier}")
    return issues


def audit_internal_links(name: str, document: str, public_dir: Path) -> list[str]:
    parser = AssetParser()
    parser.feed(document)
    issues: list[str] = []
    for link in parser.links:
        parsed = urlparse(link)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        target = parsed.path.lstrip("/")
        if not (public_dir / target).is_file():
            issues.append(f"{name}: broken internal link: {link}")
    for asset in parser.assets:
        parsed = urlparse(asset)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        target = public_dir / parsed.path.lstrip("/") if parsed.path.startswith("/") else public_dir / Path(name).parent / parsed.path
        if not target.is_file():
            issues.append(f"{name}: missing local asset: {asset}")
    return issues


def audit_build(public_dir: Path = Path("public")) -> list[str]:
    issues: list[str] = []
    missing = sorted(path for path in EXPECTED_OUTPUTS if not (public_dir / path).is_file())
    issues.extend(f"missing frozen route: {path}" for path in missing)
    missing_evidence = sorted(path for path in EXPECTED_EVIDENCE if not (public_dir / path).is_file())
    issues.extend(f"missing evidence archive: {path}" for path in missing_evidence)

    for path in sorted(public_dir.iterdir()):
        if path.is_file():
            document = path.read_text(encoding="utf-8")
            issues.extend(audit_document(path.name, document))
            issues.extend(audit_internal_links(path.name, document, public_dir))
    for path in sorted(public_dir.rglob("*.css")):
        issues.extend(audit_stylesheet(str(path), path.read_text(encoding="utf-8")))
    for path in sorted(public_dir.rglob("*.js")):
        issues.extend(audit_script(str(path), path.read_text(encoding="utf-8")))
    for path in sorted(public_dir.rglob("*.json")):
        issues.extend(audit_importmap(str(path), path.read_text(encoding="utf-8")))
    return issues


def main() -> int:
    issues = audit_build()
    if issues:
        print("Build audit failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1
    print(f"Build audit passed: {len(EXPECTED_OUTPUTS)} routes; checked local/iGEM asset references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
