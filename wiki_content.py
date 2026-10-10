"""Central page registry and Markdown rendering for the ORCA Wiki."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
from typing import Callable

import markdown
import yaml


PROJECT_ROOT = Path(__file__).resolve().parent
DOCS_ROOT = PROJECT_ROOT / "docs"


@dataclass(frozen=True)
class PageConfig:
    markdown_path: str
    template: str = "pages/content_page.html"

    @property
    def is_custom(self) -> bool:
        return self.template != "pages/content_page.html"


@dataclass(frozen=True)
class MarkdownContent:
    source_path: Path
    metadata: dict[str, object]
    html: str
    toc: tuple[dict[str, object], ...]

    @property
    def title(self) -> str:
        return str(self.metadata.get("title", self.source_path.stem.replace("-", " ").title()))

    @property
    def source_label(self) -> str:
        return str(self.source_path.relative_to(PROJECT_ROOT))


# This is the single route -> Markdown -> template registry for every content page.
# The homepage and 404 page intentionally remain special Jinja implementations.
CONTENT_PAGES: dict[str, PageConfig] = {
    "team": PageConfig("team/team.md"),
    "attributions": PageConfig("team/attributions.md"),
    "description": PageConfig("project/description.md"),
    "engineering": PageConfig("project/engineering.md"),
    "results": PageConfig("project/results.md"),
    "contribution": PageConfig("project/contribution.md"),
    "parts": PageConfig("project/parts.md"),
    "experiments": PageConfig("wet-lab/experiments.md"),
    "notebook": PageConfig("wet-lab/notebook.md"),
    "measurement": PageConfig("wet-lab/measurement.md"),
    "alternative-platform": PageConfig("wet-lab/alternative-platform.md"),
    "safety-and-security": PageConfig("wet-lab/safety-and-security.md"),
    "dry-lab": PageConfig("dry-lab/dry-lab.md", "pages/dry-lab.html"),
    "model": PageConfig("dry-lab/model.md", "pages/model.html"),
    "brain-delivery": PageConfig("dry-lab/brain-delivery.md", "pages/brain-delivery.html"),
    "offtarget-atlas": PageConfig("dry-lab/offtarget-atlas.md", "pages/offtarget-atlas.html"),
    "software": PageConfig("dry-lab/software.md", "pages/software.html"),
    "hardware": PageConfig("dry-lab/hardware.md"),
    "entrepreneurship": PageConfig("human-practices/entrepreneurship.md"),
    "human-practices": PageConfig("human-practices/human-practices.md"),
    "education": PageConfig("human-practices/education.md"),
    "inclusivity": PageConfig("human-practices/inclusivity.md"),
    "sustainability": PageConfig("human-practices/sustainability.md"),
}


# Navigation is a curated subset of CONTENT_PAGES. Unlisted pages remain
# available by their direct routes and through contextual links.
NAVIGATION = (
    {"label": "Team", "items": (("team", "Team"), ("attributions", "Attributions"))},
    {
        "label": "Project",
        "items": (
            ("description", "Description"),
            ("engineering", "Engineering"),
            ("contribution", "Contribution"),
            ("parts", "Parts"),
        ),
    },
    {
        "label": "Wet Lab",
        "items": (
            ("experiments", "Experiments"),
            ("results", "Results"),
            ("notebook", "Notebook"),
            ("measurement", "Measurement"),
            ("alternative-platform", "Alternative Platform"),
            ("safety-and-security", "Safety & Security"),
        ),
    },
    {
        "label": "Dry Lab",
        "menu_class": "dry-menu",
        "items": (
            ("model", "Model"),
            ("software", "Software"),
        ),
    },
    {
        "label": "Human Practices",
        "align_end": True,
        "items": (
            ("human-practices", "Human Practices"),
            ("education", "Education"),
            ("entrepreneurship", "Entrepreneurship"),
            ("inclusivity", "Inclusivity"),
            ("sustainability", "Sustainability"),
        ),
    },
)


FRONT_MATTER = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.DOTALL)
LEADING_H1 = re.compile(r"\A\s*#\s+(.+?)\s*(?:\r?\n|\Z)")
MARKDOWN_IMAGE = re.compile(r'(<img\b[^>]*\bsrc=")(/assets/)([^"?#]+)([^" ]*)(")', re.IGNORECASE)


def _parse_front_matter(source: str, source_path: Path) -> tuple[dict[str, object], str]:
    match = FRONT_MATTER.match(source)
    if not match:
        return {}, source
    metadata = yaml.safe_load(match.group(1)) or {}
    if not isinstance(metadata, dict):
        raise ValueError(f"Front matter must be a mapping: {source_path}")
    return metadata, source[match.end() :]


def _flatten_toc(tokens: list[dict[str, object]]) -> tuple[dict[str, object], ...]:
    entries: list[dict[str, object]] = []
    for token in tokens:
        level = int(token.get("level", 0))
        if level in {2, 3}:
            entries.append(
                {
                    "level": level,
                    "id": str(token.get("id", "")),
                    "name": str(token.get("name", "")),
                }
            )
        children = token.get("children", [])
        if isinstance(children, list):
            entries.extend(_flatten_toc(children))
    return tuple(entries)


def _rewrite_asset_urls(html: str, asset_url: Callable[[str], str] | None) -> str:
    if asset_url is None:
        return html

    def replace(match: re.Match[str]) -> str:
        resolved = asset_url(match.group(3))
        return f"{match.group(1)}{resolved}{match.group(4)}{match.group(5)}"

    return MARKDOWN_IMAGE.sub(replace, html)


def load_markdown_content(
    markdown_path: str,
    *,
    asset_url: Callable[[str], str] | None = None,
) -> MarkdownContent:
    """Read front matter and render one docs-relative Markdown file."""

    source_path = (DOCS_ROOT / markdown_path).resolve()
    if DOCS_ROOT.resolve() not in source_path.parents:
        raise ValueError(f"Markdown path escapes docs/: {markdown_path}")
    if not source_path.is_file():
        raise FileNotFoundError(f"Configured Markdown file does not exist: {source_path}")

    metadata, body = _parse_front_matter(source_path.read_text(encoding="utf-8"), source_path)

    # A leading H1 is friendly in standalone Markdown editors. The page template
    # already owns the document H1, so reuse it as a title fallback and remove the
    # duplicate from the rendered article.
    h1 = LEADING_H1.match(body)
    if h1:
        metadata.setdefault("title", h1.group(1).strip())
        body = body[h1.end() :]

    renderer = markdown.Markdown(
        extensions=("extra", "sane_lists", "toc"),
        extension_configs={
            "toc": {
                "permalink": False,
                "slugify": lambda value, separator: re.sub(
                    r"[^a-z0-9\u4e00-\u9fff]+", separator, value.lower()
                ).strip(separator),
            }
        },
        output_format="html5",
    )
    rendered = renderer.convert(body)
    rendered = _rewrite_asset_urls(rendered, asset_url)
    toc = _flatten_toc(getattr(renderer, "toc_tokens", []))

    return MarkdownContent(source_path=source_path, metadata=metadata, html=rendered, toc=toc)


def validate_registry() -> list[str]:
    """Return registry problems without requiring a Flask request context."""

    issues: list[str] = []
    navigation_routes = {route for group in NAVIGATION for route, _label in group["items"]}
    configured_routes = set(CONTENT_PAGES)
    for route in sorted(navigation_routes - configured_routes):
        issues.append(f"Navigation route has no content mapping: {route}")
    for route, config in CONTENT_PAGES.items():
        markdown_file = DOCS_ROOT / config.markdown_path
        if not markdown_file.is_file():
            issues.append(f"Missing Markdown file for {route}: {config.markdown_path}")
        template_file = PROJECT_ROOT / "wiki" / config.template
        if not template_file.is_file():
            issues.append(f"Missing template for {route}: {config.template}")
    return issues
