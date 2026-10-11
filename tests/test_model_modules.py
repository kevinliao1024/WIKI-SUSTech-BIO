import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest
from urllib.parse import unquote, urljoin, urlparse

import markdown

from app import app
from scripts.import_model_modules import Importer


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_ASSETS = PROJECT_ROOT / "static/assets/model"
CHAPTER_IDS = {
    1: (1, 2, 3, 4, 5, 6, 7),
    2: (1, 'iteration', 2, 3, 5, 6),
    3: (1, 2, 3, 4, 5, 6),
    4: (1, 'objective', 2, 'labels', 'adaptation', 'strategy', 'training', 3, 'ranking', 4, 'implications', 5, 6, 7),
}
# The Model view omits DBTL; source manuscripts and their checksums stay intact.
MODEL_PAGE_TEXT_EDITS = {
    1: ("The accompanying DBTL account connects these results to the next experimental cycle. ", ""),
}
OMITTED_MODULE2_PARAGRAPHS = {
    "The next experiments should separate scaffold improvement, recognition changes and editing specificity. Non-TRM candidates should first be added individually to characterized TRM backgrounds, with unchanged parental controls. TRM candidates should be tested individually before evaluating combinations, including exact alternatives at shared positions such as E256Q and E256R.",
    "Direct binding assays should compare the fixed target RNA with defined alternative RNAs. Matched editing experiments should measure all three endpoints, together with expression and protein integrity where feasible. Candidate selection and evaluation criteria should be recorded before collecting the next batch. These experiments would distinguish binding effects from changes in expression, catalytic positioning or cellular context.",
    "The existing PUF-ESM Specificity Ranker can provide a separate assay-informed prioritization layer, following the integration of evolutionary and labelled data described by Hsu et al. (2022). Its frozen ESM-2 score, one-hot encoding and Ridge regressors differ from the structure-conditioned MPNN screen. Its existing grouped cross-validation remains developmental evidence; candidates from these new design spaces require prospective assessment, particularly at previously untested non-TRM positions.",
}
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

    def test_all_four_modules_preserve_source_content_except_requested_dbtl_removal(self):
        self.assertEqual(set(self.modules), {f"module{number}" for number in range(1, 5)})
        for number in range(1, 5):
            with self.subTest(module=number):
                module = self.modules[f"module{number}"]
                self.assertNotEqual(module.attrs.get("data-content-status"), "pending")
                self.assertNotIn("Content pending team review", module.text())
                self.assertNotIn("Coming soon", module.text())
                self.assertGreater(len(module.text()), 1000)
                revision = MODEL_ASSETS / "revisions/20261011" / f"module{number}.md"
                source = (revision if number in (2, 4) else MODEL_ASSETS / f"module{number}.md").read_text(encoding="utf-8")
                if number == 4:
                    # The supplied export escapes Markdown and separates table rows.
                    source = re.sub(r"\\([#*_&\-])", r"\1", source)
                    source = re.sub(r"\n{3,}", "\n\n", source)
                    source = re.sub(r"(?m)(\|[^\n]*\|)\n\n(?=\|)", r"\1\n", source)
                main_article = next(node for node in module.children if isinstance(node, Element) and node.tag == "article")
                visible_text = normalized(main_article.text())
                for heading in re.findall(r"^## (.+)$", source, re.M):
                    if number == 2 and heading == "Next Design–Build–Test–Learn cycle":
                        self.assertNotIn(heading, visible_text)
                        continue
                    self.assertIn(normalized(heading), visible_text)
                original = Document(markdown.markdown(source, extensions=["tables", "fenced_code"]))
                omitted = set()
                edited = 0
                for paragraph in original.root.walk():
                    text = normalized(paragraph.text())
                    if paragraph.tag == "p" and len(text) > 40:
                        if number == 2 and text in OMITTED_MODULE2_PARAGRAPHS:
                            omitted.add(text)
                            self.assertNotIn(text, visible_text)
                            continue
                        if number in MODEL_PAGE_TEXT_EDITS:
                            old, new = MODEL_PAGE_TEXT_EDITS[number]
                            edited += text.count(old)
                            text = text.replace(old, new)
                        self.assertIn(text, visible_text, "All retained source paragraphs must survive the website import")
                self.assertEqual(omitted, OMITTED_MODULE2_PARAGRAPHS if number == 2 else set())
                self.assertEqual(edited, 1 if number in MODEL_PAGE_TEXT_EDITS else 0)

    def test_model_page_has_no_dbtl_content_or_navigation(self):
        main = next(node for node in self.document.root.walk() if node.tag == "main")
        self.assertNotRegex(main.text().lower(), r"\bdbtl\b|design[–— -]build[–— -]test[–— -]learn")
        for node in main.walk():
            for attribute in ("id", "href", "aria-controls"):
                value = node.attrs.get(attribute, "")
                self.assertNotIn("dbtl", value.lower())
                self.assertNotIn(value, ("module2-4", "#module2-4"))

    def test_module4_import_keeps_dbtl_reference_out_of_model_view(self):
        source = "This text-only release contains the Wiki, DBTL record and their original text inputs."
        importer = Importer(PROJECT_ROOT / "work/import-fixture", PROJECT_ROOT)
        document = importer.source(4, "wiki/module4.md")
        main = importer.render(source, 4, document)
        self.assertIn("This text-only release contains the Wiki and its original text inputs.", main)
        self.assertNotIn("DBTL", main)
        self.assertIn("DBTL record", importer.render(source, 4, document, dbtl=True))

    def test_main_chapters_and_sidebar_targets_are_complete(self):
        ids = [node.attrs["id"] for node in self.document.root.walk() if "id" in node.attrs]
        self.assertEqual(len(ids), len(set(ids)), "Duplicate IDs make chapter navigation ambiguous")
        links = {node.attrs.get("href") for node in self.document.root.walk() if node.tag == "a"}
        for number, chapter_ids in CHAPTER_IDS.items():
            with self.subTest(module=number):
                module = self.modules[f"module{number}"]
                chapters = [
                    node for node in module.walk()
                    if node.tag == "h3" and "data-model-chapter" in node.attrs
                    and re.fullmatch(rf"module{number}-[\w-]+", node.attrs.get("id", ""))
                ]
                self.assertEqual([node.attrs.get("id") for node in chapters], [f"module{number}-{index}" for index in chapter_ids])
                for index, chapter in enumerate(chapters, 1):
                    self.assertTrue(chapter.text().strip())
                    number_label = next(node for node in chapter.walk() if node.attrs.get("class") == "chapter-number")
                    self.assertEqual(number_label.text(), f"{number}.{index}")
                    self.assertIn(f"#{chapter.attrs['id']}", links)

    def test_figures_and_local_evidence_links_are_served(self):
        model_ids = {node.attrs["id"] for node in self.document.root.walk() if "id" in node.attrs}
        for number in range(1, 5):
            module = self.modules[f"module{number}"]
            images = [node for node in module.walk() if node.tag == "img"]
            with self.subTest(module=number):
                if number == 4:
                    self.assertEqual(len(images), 5, "Module 4 uses exactly the five supplied result images")
                    self.assertEqual(sum(node.tag == "figure" for node in module.walk()), 4)
                    self.assertEqual(sum(node.tag == "table" for node in module.walk()), 10)
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
            self.assertTrue(evidence_links or images, f"Module {number} has no accessible local source or evidence")

    def test_document_and_asset_hashes_match_the_published_files(self):
        manifest = json.loads((MODEL_ASSETS / "source-manifest.json").read_text(encoding="utf-8"))
        documents = manifest["document_records"]
        self.assertEqual(len(documents), 8)
        self.assertEqual({Path(record["destination"]).name for record in documents}, {f"module{number}{suffix}.md" for number in range(1, 5) for suffix in ("", "-dbtl")})
        self.assertEqual({record["source"] for record in documents}, set(manifest["documents"]))
        self.assertEqual(len(manifest["archived_document_records"]), 4)
        for record in documents + manifest["assets"] + manifest["archived_document_records"]:
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
        self.assertIn("unobserved cytidine is not necessarily a non-editable cytidine", m4)
        self.assertIn("low pr-auc", m4)
        self.assertIn("experimental validation remains necessary", m4)
        self.assertIn("not to replace experimental confirmation", m4)

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
