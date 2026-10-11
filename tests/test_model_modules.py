import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest
from urllib.parse import unquote, urljoin, urlparse

import markdown

from app import app


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_ASSETS = PROJECT_ROOT / "static/assets/model"
CHAPTER_COUNTS = {1: 7, 2: 6, 3: 6, 4: 7}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Element:
    def __init__(self, tag, attrs=()):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def text(self):
        return "".join(child.text() if isinstance(child, Element) else child for child in self.children)


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag not in VOID_TAGS:
            self.stack.append(element)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag, attrs))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def normalized(text):
    return " ".join(text.split())


class FourModelModulesTest(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True)
        self.client = app.test_client()
        response = self.client.get("/model")
        self.assertEqual(response.status_code, 200)
        self.document = Document(response.get_data(as_text=True))
        self.modules = {
            node.attrs["id"]: node
            for node in self.document.root.walk()
            if "data-model-module" in node.attrs
        }

    def test_all_four_modules_have_source_content_and_dbtl(self):
        self.assertEqual(set(self.modules), {f"module{number}" for number in range(1, 5)})
        for number in range(1, 5):
            with self.subTest(module=number):
                module = self.modules[f"module{number}"]
                self.assertNotEqual(module.attrs.get("data-content-status"), "pending")
                self.assertNotIn("Content pending team review", module.text())
                self.assertNotIn("Coming soon", module.text())
                self.assertGreater(len(module.text()), 1000)
                dbtl = [node for node in module.walk() if node.tag == "details" and node.attrs.get("id") == f"module{number}-dbtl"]
                self.assertEqual(len(dbtl), 1)
                self.assertIn("Design", dbtl[0].text())
                self.assertGreater(len(dbtl[0].text()), 200)
                source = (MODEL_ASSETS / f"module{number}.md").read_text(encoding="utf-8")
                main_article = next(node for node in module.children if isinstance(node, Element) and node.tag == "article")
                visible_text = normalized(main_article.text())
                for heading in re.findall(r"^## (.+)$", source, re.M):
                    self.assertIn(normalized(heading), visible_text)
                original = Document(markdown.markdown(source, extensions=["tables", "fenced_code"]))
                for paragraph in original.root.walk():
                    text = normalized(paragraph.text())
                    if paragraph.tag == "p" and len(text) > 40:
                        self.assertIn(text, visible_text, "Source paragraphs must survive the website import")

    def test_main_chapters_and_sidebar_targets_are_complete(self):
        ids = [node.attrs["id"] for node in self.document.root.walk() if "id" in node.attrs]
        self.assertEqual(len(ids), len(set(ids)), "Duplicate IDs make chapter navigation ambiguous")
        links = {node.attrs.get("href") for node in self.document.root.walk() if node.tag == "a"}
        for number, count in CHAPTER_COUNTS.items():
            with self.subTest(module=number):
                module = self.modules[f"module{number}"]
                chapters = [
                    node for node in module.walk()
                    if node.tag == "h3" and "data-model-chapter" in node.attrs
                    and re.fullmatch(rf"module{number}-\d+", node.attrs.get("id", ""))
                ]
                self.assertEqual([node.attrs.get("id") for node in chapters], [f"module{number}-{index}" for index in range(1, count + 1)])
                for chapter in chapters:
                    self.assertTrue(chapter.text().strip())
                    # The existing M2 next-cycle chapter is intentionally grouped with DBTL.
                    if "Next Design" not in chapter.text():
                        self.assertIn(f"#{chapter.attrs['id']}", links)

    def test_figures_and_local_evidence_links_are_served(self):
        model_ids = {node.attrs["id"] for node in self.document.root.walk() if "id" in node.attrs}
        for number in range(1, 5):
            module = self.modules[f"module{number}"]
            images = [node for node in module.walk() if node.tag == "img"]
            with self.subTest(module=number):
                if number == 4:
                    self.assertEqual(images, [], "Text-only Module 4 must not gain invented result figures")
                else:
                    self.assertTrue(images)
            for image in images:
                with self.subTest(image=image.attrs.get("src")):
                    self.assertTrue(image.attrs.get("alt", "").strip())
                    source = image.attrs["src"]
                    self.assertFalse(urlparse(source).netloc, source)
                    response = self.client.get(urljoin("/model", source))
                    try:
                        self.assertEqual(response.status_code, 200, source)
                        self.assertTrue(response.mimetype.startswith("image/"), source)
                        self.assertGreater(len(response.data), 1000, source)
                    finally:
                        response.close()
            evidence_links = []
            for node in module.walk():
                if node.tag != "a" or not node.attrs.get("href"):
                    continue
                target = urlparse(urljoin("/model", node.attrs["href"]))
                if target.scheme or target.netloc:
                    continue
                with self.subTest(link=node.attrs["href"]):
                    if target.path == "/model":
                        if target.fragment:
                            self.assertIn(unquote(target.fragment), model_ids)
                    else:
                        response = self.client.get(target.path)
                        try:
                            self.assertEqual(response.status_code, 200, node.attrs["href"])
                        finally:
                            response.close()
                    if target.path.startswith("/static/assets/model/"):
                        evidence_links.append(target.path)
            self.assertTrue(evidence_links, f"Module {number} has no accessible local source or evidence")

    def test_document_and_asset_hashes_match_the_published_files(self):
        manifest = json.loads((MODEL_ASSETS / "source-manifest.json").read_text(encoding="utf-8"))
        documents = manifest["document_records"]
        self.assertEqual(len(documents), 8)
        self.assertEqual({Path(record["destination"]).name for record in documents}, {f"module{number}{suffix}.md" for number in range(1, 5) for suffix in ("", "-dbtl")})
        self.assertEqual({record["source"] for record in documents}, set(manifest["documents"]))
        for record in documents + manifest["assets"]:
            with self.subTest(source=record["source"]):
                destination = PROJECT_ROOT / record["destination"]
                self.assertTrue(destination.is_relative_to(MODEL_ASSETS))
                self.assertTrue(destination.is_file(), record["destination"])
                self.assertEqual(hashlib.sha256(destination.read_bytes()).hexdigest(), record["sha256"])

    def test_scientific_boundaries_remain_visible(self):
        m1 = normalized(self.modules["module1"].text()).lower()
        self.assertIn("endogenous", m1)
        self.assertIn("candidate", m1)
        m2 = normalized(self.modules["module2"].text()).lower()
        self.assertIn("retrospect", m2)
        self.assertIn("development-stage", m2)
        m3 = normalized(self.modules["module3"].text()).lower()
        self.assertIn("hypotheses", m3)
        self.assertIn("batch", m3)
        m4 = normalized(self.modules["module4"].text()).lower()
        self.assertIn("text-only", m4)
        self.assertIn("reconciliation", m4)
        self.assertIn("training logs and per-site predictions are not included", m4)
        self.assertIn("rather than sensitivity of the complete two-stage workflow", m4)

    def test_dry_lab_navigation_excludes_overview_and_preserves_legacy_routes(self):
        toggle = next(node for node in self.document.root.walk() if node.tag == "button" and node.attrs.get("aria-label") == "Dry Lab")
        menu = next(node for node in self.document.root.walk() if node.attrs.get("id") == toggle.attrs["aria-controls"])
        links = [node.attrs["href"] for node in menu.walk() if node.tag == "a"]
        labels = [node.text() for node in menu.walk() if "rna-branch__label" in node.attrs.get("class", "").split()]
        self.assertEqual(links, ["/model", "/software"])
        self.assertEqual(labels, ["Model", "Software"])
        for route in ["/dry-lab", "/brain-delivery", "/offtarget-atlas"]:
            with self.subTest(route=route):
                self.assertEqual(self.client.get(route).status_code, 200)


if __name__ == "__main__":
    unittest.main()
