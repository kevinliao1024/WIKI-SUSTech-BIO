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
# Only these requested presentation edits are allowed; source files stay intact.
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
    4: {"Engineering objective": None, "Interpretation": "Interpretation and next steps"},
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
)
MODEL_PAGE_TEXT_EDITS = {
    1: (("The accompanying DBTL account connects these results to the next experimental cycle. ", ""),),
    2: (
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

    def test_all_four_modules_preserve_source_content_except_explicit_presentation_edits(self):
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
                original = Document(markdown.markdown(source, extensions=["tables", "fenced_code"]))
                visible_headings = [
                    re.sub(r"^\d+\.\d+\s*", "", normalized(node.text()))
                    for node in main_article.walk() if node.tag in ("h3", "h4", "h5", "h6")
                ]
                heading_edits = MODEL_PAGE_HEADING_EDITS[number]
                seen_heading_edits = set()
                for node in original.root.walk():
                    if node.tag not in ("h2", "h3", "h4", "h5", "h6"):
                        continue
                    heading = normalized(node.text())
                    expected = heading_edits.get(heading, heading)
                    if heading in heading_edits:
                        seen_heading_edits.add(heading)
                        self.assertNotIn(heading, visible_headings)
                    if expected is not None:
                        self.assertIn(expected, visible_headings)
                self.assertEqual(seen_heading_edits, set(heading_edits))
                text_edits = MODEL_PAGE_TEXT_EDITS.get(number, ())
                edited = {old: 0 for old, _ in text_edits}
                for paragraph in original.root.walk():
                    text = normalized(paragraph.text())
                    if paragraph.tag == "p" and len(text) > 40:
                        for old, new in text_edits:
                            edited[old] += text.count(old)
                            text = text.replace(old, new)
                        self.assertIn(text, visible_text, "All retained source paragraphs must survive the website import")
                self.assertEqual(edited, {old: 1 for old, _ in text_edits})
                # Prose edits must not change the supplied result tables or tool calls.
                for tag in ("table", "pre"):
                    expected = [normalized(node.text()) for node in original.root.walk() if node.tag == tag]
                    actual = [normalized(node.text()) for node in main_article.walk() if node.tag == tag]
                    self.assertEqual(actual, expected, f"Module {number} source {tag} contents changed")

    def test_module2_reproducibility_is_condensed_and_keeps_evidence_access(self):
        article = next(node for node in self.modules["module2"].walk() if node.tag == "article")
        section = []
        inside = False
        for node in article.children:
            if not isinstance(node, Element):
                continue
            if node.attrs.get("id") == "module2-5":
                inside = True
            elif node.tag == "h3" and inside:
                break
            elif inside:
                section.append(node)
        self.assertEqual([node.tag for node in section], ["p", "ul", "p"])
        blocks = [
            (node.tag, normalized(node.text()))
            for parent in section for node in parent.walk() if node.tag in ("p", "li")
        ]
        self.assertEqual(blocks, list(MODULE2_REPRODUCIBILITY_BLOCKS))
        links = [
            node.attrs.get("href") for parent in section for node in parent.walk() if node.tag == "a"
        ]
        repository = "https://github.com/pdx12320/igem_module2"
        self.assertEqual(links, [
            repository,
            f"{repository}/blob/main/wiki/data/hsu_A_oof_rankings.csv",
            f"{repository}/blob/main/wiki/data/protocol.json",
            f"{repository}/tree/main/wiki/data",
            f"{repository}/tree/main/wiki/ablation_experiment",
            f"{repository}/tree/main/puf_reuse",
            f"{repository}/tree/main/research/inverse_folding_20260928",
            f"{repository}/tree/main/wiki/inverse_folding_20260928",
            "https://github.com/pdx12320/PUF_alphafold",
            "https://github.com/dauparas/LigandMPNN",
        ])

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
        self.assertEqual(sum(node.tag == "h2" for node in introduction.walk()), 1)
        roles = next(node for node in introduction.walk() if node.tag == "ol")
        items = [node for node in roles.children if isinstance(node, Element) and node.tag == "li"]
        self.assertEqual(len(items), 4)
        for number, item in enumerate(items, 1):
            links = [node for node in item.walk() if node.tag == "a"]
            self.assertEqual([node.attrs.get("href") for node in links], [f"#module{number}"])
            self.assertTrue(normalized(links[0].text()))
            self.assertIn(f"module{number}", self.modules)

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
                anchors = [node for node in subnav.walk() if node.tag == "a"]
                self.assertEqual([node.attrs.get("href") for node in anchors], [f"#module{number}-{chapter}" for chapter in CHAPTER_IDS[number]])
                self.assertTrue(all("data-chapter-link" in node.attrs for node in anchors))
                self.assertEqual([node.text() for node in anchors].count("Overview"), 1)
                self.assertNotIn("Module overview", subnav.text())

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

    def test_module4_citations_resolve_to_references_with_primary_sources(self):
        module = self.modules["module4"]
        required_sources = {
            "module4-ref-lamar": "https://doi.org/10.1186/s13059-025-03752-x",
            "module4-ref-gencode": "https://www.gencodegenes.org/human/release_50.html",
            "module4-ref-gffread": "https://doi.org/10.12688/f1000research.23297.2",
            "module4-ref-optuna": "https://doi.org/10.1145/3292500.3330701",
            "module4-ref-pr": "https://doi.org/10.1371/journal.pone.0118432",
        }
        references = {
            node.attrs["id"]: node for node in module.walk()
            if node.tag == "li" and node.attrs.get("id", "").startswith("module4-ref-")
        }
        cited_ids = {
            node.attrs["href"][1:] for node in module.walk()
            if node.tag == "a" and node.attrs.get("href", "").startswith("#module4-ref-")
        }
        self.assertTrue(set(required_sources).issubset(references))
        self.assertGreaterEqual(len(references), 11)
        self.assertEqual(cited_ids, set(references), "Each bibliography entry must be used by the article")
        for reference_id, source in required_sources.items():
            with self.subTest(reference=reference_id):
                links = [node for node in references[reference_id].walk() if node.tag == "a"]
                self.assertIn(source, [node.attrs.get("href") for node in links])
                self.assertTrue(all(normalized(node.text()) for node in links))
        gencode = normalized(references["module4-ref-gencode"].text())
        self.assertIn("GENCODE. (2026).", gencode)
        self.assertIn("annotation freeze May 2025", gencode)
        self.assertIn("https://github.com/rnasys/LAMAR", {
            node.attrs.get("href") for node in module.walk() if node.tag == "a"
        })

    def test_each_module_has_relevant_linked_references(self):
        # These five inherited Module 2 citations use author-year text rather than links.
        plain_citations = {
            "https://doi.org/10.1073/pnas.0606294103": "Cheong & Hall, 2006",
            "https://doi.org/10.1126/science.add2187": "Dauparas et al., 2022",
            "https://doi.org/10.1038/s41592-025-02626-1": "Dauparas et al., 2025",
            "https://doi.org/10.1016/j.cell.2025.06.014": "Fei et al., 2025",
            "https://doi.org/10.1016/S0092-8674(02)00873-5": "Wang et al., 2002",
        }
        for number, module in self.modules.items():
            with self.subTest(module=number):
                article = next(node for node in module.walk() if node.tag == "article")
                body, bibliography = [], []
                in_references = False
                for node in article.children:
                    if not isinstance(node, Element):
                        continue
                    if node.tag == "h3" and normalized(node.text()).endswith("References"):
                        in_references = True
                    elif in_references:
                        bibliography.extend(item for item in node.walk() if item.tag in ("p", "li"))
                    else:
                        body.append(node)
                self.assertGreaterEqual(len(bibliography), 11)
                body_links = {
                    link.attrs.get("href") for node in body for link in node.walk() if link.tag == "a"
                }
                body_text = normalized(" ".join(node.text() for node in body))
                primary_sources = []
                for reference in bibliography:
                    links = [node for node in reference.walk() if node.tag == "a"]
                    self.assertTrue(links, normalized(reference.text()))
                    self.assertTrue(all(normalized(link.text()) for link in links))
                    self.assertTrue(all(urlparse(link.attrs.get("href", "")).scheme == "https" for link in links))
                    primary_sources.append(links[0].attrs["href"])
                    if reference.attrs.get("id"):
                        self.assertIn(f"#{reference.attrs['id']}", body_links)
                    elif number == "module2" and links[0].attrs["href"] in plain_citations:
                        self.assertIn(plain_citations[links[0].attrs["href"]], body_text)
                    else:
                        self.assertIn(links[0].attrs["href"], body_links)
                self.assertEqual(len(primary_sources), len(set(primary_sources)), "Do not inflate a bibliography with duplicate sources")

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
