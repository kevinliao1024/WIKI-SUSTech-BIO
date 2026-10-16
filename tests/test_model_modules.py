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
    4: (1, 2, 'strategy', 3, 4, 6, 7),
}
# Only explicit presentation and evidence-attribution edits are allowed; source files stay intact.
MODEL_PAGE_HEADING_EDITS = {
    1: {"Analysis objectives": None},
    2: {
        "Background and engineering objective": "Overview",
        "Background and objective": "Design rationale",
        "Next Design–Build–Test–Learn cycle": "Next experiments",
        "Assay-informed ranking": None,
        "Structure-conditioned design": None,
        "Figures and local reuse": None,
    },
    3: {"Background": "Overview", "Model overview": "Modeling approach"},
    4: {
        "Engineering objective": None, "Interpretation": "Interpretation and next steps",
        "Stage II: 101-nt cytidine-centered classifier": "Stage II: 101-nt cytidine-centered ranking",
    },
}
MODULE2_REPRODUCIBILITY_BLOCKS = (
    ("p", "The Module 2 repository brings together the models, data and figure sources."),
    ("li", "Assay ranking: 66 OOF predictions, the fixed protocol, comparison and subset tables, "
     "ablation code and fold searches, and the reusable ranker. Top30 is not evaluated in subsets "
     "with fewer than 30 constructs."),
    ("li", "Structure-conditioned design: samples, candidate sequences and experimental audits, "
     "with plotted data and figure scripts. Historical inputs are retained in PUF_alphafold; "
     "the upstream implementation is LigandMPNN."),
    ("li", "Reuse: the source package includes editable figures, image exports, captions and "
     "plotting scripts. Reproduction records retain seeds, masks, model versions, checksums and validation results."),
    ("p", "The assay labels and validation folds remain fixed. Structural results include "
     "archived-sample reanalysis and new TRM-only sampling; this update adds no wet-lab measurements."),
    ("p", "The source-package manifest records the recovered files and their checksums. "
     "The package restores access to existing source materials; no model or experiment was rerun "
     "for this website revision. Original runtime dependencies and pretrained checkpoints remain "
     "required; raw experimental workbooks are not redistributed."),
)
MODEL_PAGE_TEXT_EDITS = {
    1: (("The accompanying DBTL account connects these results to the next experimental cycle. ", ""),),
    2: (
        ("ORCA plotting script", "ORCA plotting source package"),
        ("The ablation comparison, per-construct predictions, locked ablation protocol and validation "
         "record accompany the new figures. The ablation_experiment/ directory contains inputs, "
         "training code and all 66 fold-level parameter searches.", MODULE2_REPRODUCIBILITY_BLOCKS[1][1]),
        ("The package contains all 66 ranked predictions, the five-target audit, the Top-K baseline "
         "comparison, all-method metrics and the fixed protocol. Batch-specific and double-repeat "
         "subset metrics are retained in the complete subset table. Top30 is marked not evaluable "
         "for subsets with fewer than 30 constructs; it is not silently replaced with a smaller K.",
         MODULE2_REPRODUCIBILITY_BLOCKS[1][1]),
        ("The main project repository is pdx12320/igem_module2. The prepared repository update "
         "brings together the assay-informed ranker and the structure-conditioned design results. "
         "The earlier PUF_alphafold repository remains the historical source for the archived "
         "structural inputs and all-position samples.", MODULE2_REPRODUCIBILITY_BLOCKS[2][1]),
        ("Reproduction records retain seeds, masks, model versions, input checksums and validation "
         "results. The updated figures and prose do not retrain the ESM Ranker or introduce new "
         "wet-lab measurements.", MODULE2_REPRODUCIBILITY_BLOCKS[3][1]),
        ("Both workflows include editable PowerPoint sources and PNG previews. Data figures "
         "include PNG, SVG, PDF, plotted tables, captions and reproducible ORCA scripts. Image "
         "paths are relative to this document, so the local package does not depend on unpublished "
         "GitHub assets. Keep the accompanying folders beside the Markdown files. Standalone "
         "HTML previews embed every image for offline viewing.", MODULE2_REPRODUCIBILITY_BLOCKS[3][1]),
        ("The assay-informed model retains its existing training labels, folds and development-stage "
         "evaluation. The structure-conditioned analysis adds archived-sample reanalysis and new "
         "TRM-only sampling. No new assay measurements were introduced.", MODULE2_REPRODUCIBILITY_BLOCKS[4][1]),
    ),
    3: (
        ("Programmable RNA editing can alter a transcript without changing its genomic sequence. "
         "Pumilio/FBF (PUF) proteins offer a modular route to RNA recognition, and engineered "
         "PUF–APOBEC fusions have enabled targeted C-to-U editing in cells and animals. These "
         "systems provide a starting point for improving the balance between editing activity "
         "and substrate preference. Wang et al., 2002; Han et al., 2025.",
         "Programmable RNA editing can alter a transcript without changing its genomic sequence. "
         "Pumilio/FBF (PUF) proteins offer a modular route to RNA recognition (Wang et al., 2002), "
         "with engineered repeats extending recognition to cytosine (Filipovska et al., 2011). "
         "Engineered PUF–APOBEC fusions have enabled targeted C-to-U editing in cells and animals "
         "(Han et al., 2022; Han et al., 2025). These systems provide a starting point for improving "
         "the balance between editing activity and substrate preference."),
        ("retained Figure 7 assets", "retained source-package Figure 7 assets"),
        ("The N1 comparison", "The comparison in Figure 29"),
        ("complete N4 panel", "complete source-package N4 panel"),
        ("Figure identifiers are retained from the source packages.",
         "Figures are numbered in page order; original identifiers remain in the source packages."),
    ),
    4: (
        ("Our objective was to answer the following question:",
         "Our objective is to rank cytidines within human transcript regions for targeted follow-up of potential C-to-U off-target editing."),
        ("Given a human transcript region exposed to the PUF-LIKER-APOBEC editor, which cytidines should be prioritized as potential C-to-U off-target editing sites?",
         "The intended decision is which sites to measure next under a defined editor and experimental condition."),
        ("The figure should show training loss and masked nucleotide prediction accuracy across training steps. ", ""),
        ("The figure should show training loss and validation PR-AUC across training steps for four conditions: ",
         "Training loss and validation PR-AUC are shown across training steps for "),
        ("comparison of off-target candidate profiles between PUF or APOBEC variants;",
         "future comparison of variant-specific off-target candidate profiles, subject to variant-resolved training and evaluation;"),
        ("Zhou, H., Hu, Y., Zheng, Y., Li, J., Peng, J., Hu, J., ... & Wang, Z. (2025). A foundation language model to decipher diverse regulation of RNAs. Genome Biology, 26(1), 301.",
         "Zhou, H. et al. (2025). A foundation language model to decipher diverse regulation of RNAs. Genome Biology, 26, 301. doi:10.1186/s13059-025-03752-x."),
        ("GENCODE. (2025). GENCODE human release 50. https://www.gencodegenes.org/human/",
         "GENCODE. (2026). GENCODE human release 50, GRCh38.p14. Release 50 annotation and files. Released June 2026; annotation freeze May 2025, as recorded in the release history."),
        ("Pertea, G., & Pertea, M. (2020). GFF utilities: GffRead and GffCompare. F1000Research, 9, ISCB Comm J-304. https://doi.org/10.12688/f1000research.23297.2",
         "Pertea, G., & Pertea, M. (2020). GFF Utilities: GffRead and GffCompare. F1000Research, 9, 304. doi:10.12688/f1000research.23297.2."),
    ),
}
# Exact source-to-rendered corrections reviewed against the versioned evidence audit.
MODEL_PAGE_TEXT_EDITS[4] += tuple(
    (item["old"], item["new"])
    for item in json.loads((PROJECT_ROOT / "tests/fixtures/model-evidence-text-edits.json").read_text(encoding="utf-8"))
)
# Result-focused wording preserves source tables, code and evaluation scope.
MODEL_PAGE_TEXT_EDITS[2] += tuple(
    (item["old"], item["new"])
    for item in json.loads((PROJECT_ROOT / "tests/fixtures/model-narrative-text-edits.json").read_text(encoding="utf-8"))
)
# Page captions use one sequence; archived documents keep their original labels.
MODEL_PAGE_CAPTION_LABEL_EDITS = {
    1: {
        "Figure 1.": "Figure 2.", "Figure 2A.": "Figure 3.", "Figure 2B.": "Figure 4.",
        "Figure 3.": "Figure 5.", "Figure 4.": "Figure 6.", "Figure 5.": "Figure 7.",
    },
    2: {f"Figure {number}.": f"Figure {number + 9}." for number in range(1, 16)},
    3: {
        "Workflow.": "Figure 25. Workflow.", "Figure 3.": "Figure 26.",
        "Figure 4.": "Figure 27.", "Figure 8.": "Figure 28.", "Figure N1.": "Figure 29.",
        "Figure 9.": "Figure 30.", "Figure 10.": "Figure 31.", "Figure N3.": "Figure 32.",
    },
    4: {f"Figure {number}.": f"Figure {number + 32}." for number in range(1, 5)},
}
# Four approved vector replacements; every other image attribute stays exact.
MODEL_PAGE_IMAGE_EDITS = {
    "/static/assets/model/igem_module1/assets/01_module1_workflow_illustrated.png": {
        "src": "/static/assets/model/icon-flowcharts-20261016/figure-02-rna-seq.svg",
        "width": "1200", "height": "540",
    },
    "/static/assets/model/igem_module2/wiki/figures/architecture/figure@2x.png": {
        "src": "/static/assets/model/icon-flowcharts-20261016/figure-10-puf-esm.svg",
        "width": "1200", "height": "720",
    },
    "/static/assets/model/igem_module2/wiki/inverse_folding_20260928/figures/workflow/figure@2x.png": {
        "src": "/static/assets/model/icon-flowcharts-20261016/figure-20-inverse-folding.svg",
        "width": "1200", "height": "865",
    },
    "/static/assets/model/igem_module3/wiki/figures/workflow/rendered/workflow.png": {
        "src": "/static/assets/model/icon-flowcharts-20261016/figure-25-structure-assay.svg",
        "width": "1200", "height": "760",
    },
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

    def test_module_prose_edits_preserve_published_tables_code_and_images(self):
        self.assertEqual(set(self.modules), {f"module{number}" for number in range(1, 5)})
        for number in range(1, 5):
            with self.subTest(module=number):
                module = self.modules[f"module{number}"]
                self.assertGreater(len(module.text()), 1000)
                baseline = Document((MODEL_ASSETS / f"synthesis/sources/module{number}-published.html").read_text())
                for tag in ("table", "pre"):
                    expected = [normalized(node.text()) for node in baseline.root.walk() if node.tag == tag]
                    actual = [normalized(node.text()) for node in module.walk() if node.tag == tag]
                    self.assertEqual(actual, expected)
                original_images = [
                    {**node.attrs, **MODEL_PAGE_IMAGE_EDITS.get(node.attrs.get("src"), {})}
                    for node in baseline.root.walk() if node.tag == "img"
                ]
                actual_images = [node.attrs for node in module.walk() if node.tag == "img" and "/integration-20261013/" not in node.attrs.get("src", "")]
                self.assertEqual(actual_images, original_images)

    def test_module_resource_links_are_confined_to_reproducibility(self):
        reading = next(node for node in self.document.root.walk() if "model-reading" in node.attrs.get("class", "").split())
        expected_chapters = {1: "module1-6", 2: "module2-5", 3: "module3-5", 4: "module4-6"}
        allowed_links = []
        for number, expected_chapter in expected_chapters.items():
            module = self.modules[f"module{number}"]
            article = next(node for node in module.walk() if node.tag == "article")
            chapter = None
            resources = []
            for node in article.children:
                if not isinstance(node, Element):
                    continue
                if "data-model-chapter" in node.attrs:
                    chapter = node.attrs["id"]
                    if chapter == expected_chapter:
                        self.assertIn("Reproducibility and availability", node.text())
                links = [child for child in node.walk() if child.tag == "a"]
                if links:
                    self.assertEqual(chapter, expected_chapter)
                    self.assertIn("data-model-resource-links", node.attrs)
                    resources.extend(links)
            self.assertTrue(resources, f"Module {number} must expose its resources")
            for link in resources:
                href = link.attrs["href"]
                parsed = urlparse(href)
                if not parsed.netloc:
                    self.assertTrue((PROJECT_ROOT / unquote(parsed.path).lstrip("/")).is_file(), href)
            allowed_links.extend(resources)
        self.assertEqual([node for node in reading.walk() if node.tag == "a"], allowed_links)
        self.assertFalse(any("ev-badge" in node.attrs.get("class", "").split() for node in reading.walk()))
        text = normalized(reading.text()).lower()
        for phrase in ("claim audit", "integration evidence audit", "source checksums", "this update", "this website revision", "this integration", "not supplied", "remain unavailable", "has not been established"):
            self.assertNotIn(phrase, text)

    def test_each_module_has_one_introductory_overview(self):
        for number in range(1, 5):
            with self.subTest(module=number):
                headings = [node for node in self.modules[f"module{number}"].walk() if node.tag in ("h3", "h4", "h5", "h6")]
                titles = [re.sub(r"^\d+\.\d+\s*", "", normalized(node.text())) for node in headings]
                self.assertEqual(headings[0].attrs.get("id"), f"module{number}-1")
                self.assertEqual(titles[0], "Overview")
                self.assertEqual(
                    # Background screening is a retained analysis method, not an introduction.
                    [title for title in titles if re.fullmatch(r"background(?: and (?:engineering )?objective)?|(?:model )?overview", title, re.I)],
                    ["Overview"],
                )

    def test_project_introduction_connects_all_four_modules(self):
        main = next(node for node in self.document.root.walk() if node.tag == "main")
        self.assertEqual(sum(node.tag == "h1" for node in main.walk()), 1)
        introduction = next(node for node in main.walk() if node.attrs.get("id") == "model-content")
        self.assertEqual(introduction.attrs.get("data-content-source"), "docs/dry-lab/model.md")
        roles = next(node for node in introduction.walk() if node.tag == "ol")
        items = [node for node in roles.children if isinstance(node, Element) and node.tag == "li"]
        self.assertEqual(len(items), 4)
        for number, item in enumerate(items, 1):
            self.assertIn(f"Module {number}", item.text())
            self.assertIn(f"module{number}", self.modules)
            self.assertFalse(any(node.tag == "a" for node in item.walk()))

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

    def test_sidebar_chapters_follow_their_module_in_reading_order(self):
        nav = next(node for node in self.document.root.walk() if node.tag == "nav" and node.attrs.get("aria-label") == "Model modules")
        groups = [node for node in nav.children if isinstance(node, Element)]
        self.assertEqual(len(groups), 4)
        for number, group in enumerate(groups, 1):
            with self.subTest(module=number):
                children = [node for node in group.children if isinstance(node, Element)]
                self.assertEqual([node.tag for node in children], ["button", "div"])
                button, subnav = children
                self.assertEqual(button.attrs.get("data-module"), f"module{number}")
                self.assertEqual(button.attrs.get("aria-controls"), subnav.attrs.get("id"))
                anchors = [node for node in subnav.walk() if node.tag == "a" and "data-chapter-link" in node.attrs]
                self.assertEqual([node.attrs.get("href") for node in anchors], [f"#module{number}-{chapter}" for chapter in CHAPTER_IDS[number]])
                labels = []
                for index, anchor in enumerate(anchors, 1):
                    number_label = next(node for node in anchor.walk() if node.attrs.get("class") == "module-chapter-number")
                    title_label = next(node for node in anchor.walk() if node.attrs.get("class") == "module-chapter-label")
                    self.assertEqual(number_label.text(), f"{number}.{index}")
                    labels.append(title_label.text())
                self.assertEqual(labels.count("Overview"), 1)
                self.assertNotIn("Module overview", subnav.text())
                subsection_links = [node for node in subnav.walk() if "data-subchapter-link" in node.attrs]
                expected = ["module2-ranking-results", "module2-feature-ablations", "module2-readout-layers"] if number == 2 else []
                self.assertEqual([node.attrs.get("href") for node in subsection_links], [f"#{item}" for item in expected])
                targets = [node for node in self.modules[f"module{number}"].walk() if "data-model-subchapter" in node.attrs]
                self.assertEqual([node.attrs.get("id") for node in targets], expected)
                self.assertTrue(all(node.attrs.get("data-parent-chapter") == "module2-2" for node in targets))

    def test_module4_grouping_preserves_legacy_deep_links(self):
        expected = {
            "module4-objective": ("span", "module4-1"),
            "module4-labels": ("h4", "module4-2"),
            "module4-adaptation": ("h4", "module4-2"),
            "module4-training": ("h4", "module4-strategy"),
            "module4-ranking": ("h4", "module4-3"),
            "module4-implications": ("h4", "module4-4"),
            "module4-5": ("h4", "module4-4"),
        }
        found = {}
        current_chapter = None
        for node in self.modules["module4"].walk():
            if "data-model-chapter" in node.attrs:
                current_chapter = node.attrs["id"]
            if node.attrs.get("id") in expected:
                self.assertNotIn("data-model-chapter", node.attrs)
                found[node.attrs["id"]] = (node.tag, current_chapter)
        self.assertEqual(found, expected)

    def test_reading_figures_are_captioned_and_numbered_in_page_order(self):
        reading = next(
            node for node in self.document.root.walk()
            if "model-reading" in node.attrs.get("class", "").split()
        )
        figures = [node for node in reading.walk() if node.tag == "figure"]
        self.assertEqual(len(figures), 38)
        self.assertEqual(
            [node.attrs.get("id") for node in figures],
            [f"model-figure-{number}" for number in range(1, 39)],
        )
        numbers = []
        concise_captions = json.loads((MODEL_ASSETS / "integration-20261013/page-captions.json").read_text())["captions"]
        for figure in figures:
            captions = [node for node in figure.walk() if node.tag == "figcaption"]
            self.assertEqual(len(captions), 1)
            caption = normalized(captions[0].text())
            label = re.match(r"^Figure (\d+)\.\s+(\S.*)$", caption)
            self.assertIsNotNone(label, caption)
            numbers.append(int(label.group(1)))
            self.assertEqual(label.group(2), concise_captions[label.group(1)])
            self.assertFalse(any(node.tag == "a" for node in captions[0].walk()))
            self.assertNotRegex(caption, r"https?://|www\.")
            self.assertLessEqual(len(label.group(2).split()), 55)
        self.assertEqual(numbers, list(range(1, 39)))
        self.assertNotIn("View full-size", reading.text())

    def test_figures_and_local_evidence_links_are_served(self):
        model_ids = {node.attrs["id"] for node in self.document.root.walk() if "id" in node.attrs}
        for number in range(1, 5):
            module = self.modules[f"module{number}"]
            images = [node for node in module.walk() if node.tag == "img"]
            with self.subTest(module=number):
                if number == 4:
                    original_images = [image for image in images if "/integration-20261013/" not in image.attrs.get("src", "")]
                    self.assertEqual(len(original_images), 5, "Module 4 preserves all five earlier result images")
                    self.assertEqual(sum(node.tag == "figure" for node in module.walk()), 6)
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

    def test_measurement_and_evaluation_scopes_remain_in_the_prose(self):
        m1 = normalized(self.modules["module1"].text()).lower()
        self.assertIn("endogenous", m1)
        self.assertIn("four biological replicates", m1)
        m2 = normalized(self.modules["module2"].text()).lower()
        self.assertIn("66", m2)
        self.assertIn("grouped out-of-fold", m2)
        m3 = normalized(self.modules["module3"].text()).lower()
        self.assertIn("batch", m3)
        self.assertIn("0.673", m3)
        m4 = normalized(self.modules["module4"].text()).lower()
        self.assertIn("140 positive", m4)
        self.assertIn("one full region sequence was shared", m4)
        self.assertIn("average precision", m4)

    def test_module4_primary_references_remain_as_plain_citations(self):
        module = self.modules["module4"]
        references = {node.attrs["id"]: node for node in module.walk() if node.tag == "li" and node.attrs.get("id", "").startswith("module4-ref-")}
        expected_dois = {
            "module4-ref-lamar": "10.1186/s13059-025-03752-x",
            "module4-ref-gffread": "10.12688/f1000research.23297.2",
            "module4-ref-optuna": "10.1145/3292500.3330701",
            "module4-ref-pr": "10.1371/journal.pone.0118432",
        }
        self.assertGreaterEqual(len(references), 11)
        for key, doi in expected_dois.items():
            self.assertIn(doi, references[key].text())
        self.assertIn("GENCODE. (2026).", references["module4-ref-gencode"].text())
        self.assertFalse(any(node.tag == "a" for reference in references.values() for node in reference.walk()))

    def test_each_module_keeps_a_plain_bibliography(self):
        for name, module in self.modules.items():
            with self.subTest(module=name):
                article = next(node for node in module.walk() if node.tag == "article")
                bibliography = []
                in_references = False
                for node in article.children:
                    if not isinstance(node, Element):
                        continue
                    if node.tag == "h3" and normalized(node.text()).endswith("References"):
                        in_references = True
                    elif in_references:
                        bibliography.extend(item for item in node.walk() if item.tag in ("p", "li"))
                texts = [normalized(node.text()) for node in bibliography]
                self.assertGreaterEqual(len(texts), 11)
                self.assertEqual(len(texts), len(set(texts)))
                for text in texts:
                    self.assertRegex(text, r"(?:19|20)\d{2}")
                self.assertFalse(any(node.tag == "a" for reference in bibliography for node in reference.walk()))
                if name in {"module1", "module2"}:
                    ordered = [node for node in module.walk() if node.tag == "ol" and "model-references" in node.attrs.get("class", "").split()]
                    self.assertEqual(len(ordered), 1)
                    self.assertEqual([node for node in ordered[0].children if isinstance(node, Element)], bibliography)
                    expected_authors = {
                        "module1": ["Grünewald", "Zhou", "Chen", "Dobin", "McKenna", "Mudge", "GENCODE", "GATK Team", "Flati", "Picardi", "McLaren", "Benjamini"],
                        "module2": ["Abramson", "Hu", "Radivojević", "Hsu", "Lin", "Hoerl", "Varma", "Wang", "Cheong", "Zhao", "Fei", "Dauparas", "Dauparas"],
                    }[name]
                    self.assertEqual(len(texts), len(expected_authors))
                    self.assertTrue(all(text.startswith(author) for text, author in zip(texts, expected_authors)))

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
