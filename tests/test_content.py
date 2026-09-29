import tempfile
import unittest
from pathlib import Path
import re
from unittest.mock import patch

from wiki_content import CONTENT_PAGES, DOCS_ROOT, PROJECT_ROOT, load_markdown_content, validate_registry


class MarkdownContentTest(unittest.TestCase):
    def test_registry_navigation_files_and_templates_are_in_sync(self):
        self.assertEqual(validate_registry(), [])

    def test_every_configured_markdown_file_parses(self):
        for route, config in CONTENT_PAGES.items():
            with self.subTest(route=route):
                content = load_markdown_content(config.markdown_path)
                self.assertTrue(content.title)
                self.assertTrue(content.metadata.get("subtitle"))
                self.assertIn("<h2", content.html)

    def test_local_markdown_images_exist(self):
        for route, config in CONTENT_PAGES.items():
            source = (DOCS_ROOT / config.markdown_path).read_text(encoding="utf-8")
            images = re.findall(r"!\[[^\]]*\]\((/assets/[^)\s]+)", source)
            for image in images:
                with self.subTest(route=route, image=image):
                    self.assertTrue((PROJECT_ROOT / image.lstrip("/")).is_file())

    def test_front_matter_tables_footnotes_and_heading_ids(self):
        source = """---
title: Parser Test
subtitle: Test content
---

# Parser Test

## Main Section

| A | B |
|---|---|
| 1 | 2 |

Footnote.[^1]

[^1]: Verified note.

### Detail
"""
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file_path = root / "parser.md"
            file_path.write_text(source, encoding="utf-8")
            with patch("wiki_content.DOCS_ROOT", root):
                content = load_markdown_content("parser.md")

        self.assertEqual(content.metadata["title"], "Parser Test")
        self.assertIn('<h2 id="main-section">', content.html)
        self.assertIn("<table>", content.html)
        self.assertIn('class="footnote"', content.html)
        self.assertEqual([entry["level"] for entry in content.toc], [2, 3])

    def test_asset_urls_can_be_rewritten_for_flask_or_frozen_builds(self):
        source = """---
title: Image Test
subtitle: Test content
---

## Figure

![Alt text](/assets/images/example.webp)
"""
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "image.md").write_text(source, encoding="utf-8")
            with patch("wiki_content.DOCS_ROOT", root):
                content = load_markdown_content(
                    "image.md", asset_url=lambda filename: f"../assets/{filename}"
                )

        self.assertIn('src="../assets/images/example.webp"', content.html)


if __name__ == "__main__":
    unittest.main()
