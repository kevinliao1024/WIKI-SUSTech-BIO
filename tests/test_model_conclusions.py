import hashlib
import json
import re
from pathlib import Path
import unittest
from zipfile import ZipFile

from app import app
from tests.test_model_modules import Document, Element


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "static/assets/model"


class ModelConclusionAdditionsTest(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True)
        response = app.test_client().get("/model")
        self.assertEqual(response.status_code, 200)
        self.document = Document(response.get_data(as_text=True))

    def test_original_chapter_anchors_and_source_snapshots_are_preserved(self):
        for number in range(1, 5):
            with self.subTest(module=number):
                source = (ROOT / f"wiki/components/model/module{number}.html").read_text()
                include = "{% endraw %}{% include 'components/model/conclusions/module" + str(number) + ".html' %}{% raw %}"
                self.assertEqual(source.count(include), 1)
                baseline = Document((ASSETS / f"synthesis/sources/module{number}-published.html").read_text())
                current = Document(source)
                expected = [node.attrs["id"] for node in baseline.root.walk() if "data-model-chapter" in node.attrs]
                actual = [node.attrs["id"] for node in current.root.walk() if "data-model-chapter" in node.attrs]
                self.assertEqual(actual, expected)

    def test_additions_are_within_each_existing_conclusion_before_reproducibility(self):
        expected_chapters = {1: "module1-5", 2: "module2-3", 3: "module3-4", 4: "module4-4"}
        for number, expected in expected_chapters.items():
            with self.subTest(module=number):
                module = next(node for node in self.document.root.walk() if node.attrs.get("id") == f"module{number}")
                article = next(node for node in module.children if isinstance(node, Element) and node.tag == "article")
                chapter = None
                additions = []
                for node in article.children:
                    if not isinstance(node, Element):
                        continue
                    if "data-model-chapter" in node.attrs:
                        chapter = node.attrs["id"]
                    if "data-model-conclusion-addition" in node.attrs:
                        self.assertEqual(chapter, expected)
                        self.assertEqual(node.attrs["id"], f"module{number}-synthesis")
                        additions.append(node)
                self.assertEqual(len(additions), 1)
        ids = {node.attrs.get("id") for node in self.document.root.walk()}
        self.assertNotIn("synthesis", ids)
        self.assertNotIn("therapeutic-window", ids)
        expected_figures = {1: [8, 9], 2: [], 3: [], 4: [37, 38]}
        for number, expected in expected_figures.items():
            addition = next(node for node in self.document.root.walk() if node.attrs.get("id") == f"module{number}-synthesis")
            figures = [node for node in addition.walk() if node.tag == "figure"]
            self.assertEqual([int(node.attrs["id"].removeprefix("model-figure-")) for node in figures], expected)

    def test_claims_and_literature_references_resolve_and_source_hashes_match(self):
        audit = json.loads((ASSETS / "synthesis/claims-audit.json").read_text())
        claims = {claim["id"] for claim in audit["claims"]}
        integration_audit = json.loads((ASSETS / "integration-20261013/claims-audit.json").read_text())
        claims.update(claim["id"] for claim in integration_audit["claims"])
        literature = json.loads((ASSETS / "therapeutic-window/literature-audit.json").read_text())
        citations = {source["id"] for source in literature["sources"]}
        integration_literature = json.loads((ASSETS / "integration-20261013/literature-audit.json").read_text())
        citations.update(source["id"] for source in integration_literature["sources"])
        used_claims = set()
        used_citations = set()
        for node in self.document.root.walk():
            for attribute, available, used in (("data-claim", claims, used_claims), ("data-literature", citations, used_citations)):
                if attribute not in node.attrs:
                    continue
                ids = set(node.attrs[attribute].split())
                self.assertTrue(ids <= available, ids - available)
                used.update(ids)
        self.assertTrue(used_claims)
        self.assertTrue(used_citations)
        all_sources = {**audit["sources"], **integration_audit["sources"]}
        for key, source in all_sources.items():
            with self.subTest(source=key):
                path = ROOT / source["path"]
                if "archive_member" in source and path.suffix == ".zip":
                    with ZipFile(path) as archive:
                        content = archive.read(source["archive_member"])
                else:
                    content = path.read_bytes()
                self.assertEqual(hashlib.sha256(content).hexdigest(), source["sha256"])

    def test_imported_figures_preserve_alt_text_and_original_asset_hashes(self):
        imported = [node for node in self.document.root.walk() if "data-model-integrated-figure" in node.attrs]
        self.assertEqual(len(imported), 4)
        for figure in imported:
            family = figure.attrs["data-model-integrated-figure"]
            folder = ASSETS / "integration-20261013/figures" / family
            image = next(node for node in figure.walk() if node.tag == "img")
            self.assertEqual(image.attrs["alt"], (folder / "alt-text.txt").read_text().strip())
        manifest = json.loads((ASSETS / "integration-20261013/package-manifest.json").read_text())
        prefix = "ORCA_synthesis_integration_2026-10-13/"
        for item in manifest["entries"]:
            path = ASSETS / "integration-20261013" / item["member"].removeprefix(prefix)
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), item["sha256"], str(path))

    def test_therapeutic_window_uses_missing_parameters_without_inferred_curve(self):
        parameters = json.loads((ASSETS / "therapeutic-window/parameters.json").read_text())
        self.assertFalse(parameters["plot_generated"])
        self.assertEqual(len(parameters["missing_parameters"]), 4)
        self.assertTrue(all(parameter["value"] is None for parameter in parameters["missing_parameters"]))
        module4 = next(node for node in self.document.root.walk() if node.attrs.get("id") == "module4-synthesis")
        self.assertFalse(any("model-honesty" in node.attrs.get("class", "").split() for node in module4.walk()))
        self.assertFalse(any(node.tag == "a" for node in module4.walk()))
        self.assertEqual(sum(node.tag == "figure" for node in module4.walk()), 2)
        self.assertIn("disease models", module4.text())



if __name__ == "__main__":
    unittest.main()
