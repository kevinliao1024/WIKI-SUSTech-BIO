import json
import html
import re
import unittest
from pathlib import Path
from urllib.parse import urljoin

from app import app
from wiki_content import NAVIGATION


PUBLIC_ROUTES = [
    "/",
    "/next",
    "/next-journey",
    "/team",
    "/attributions",
    "/description",
    "/blueprint",
    "/engineering",
    "/results",
    "/contribution",
    "/future",
    "/parts",
    "/experiments",
    "/notebook",
    "/measurement",
    "/alternative-platform",
    "/safety-and-security",
    "/dry-lab",
    "/model",
    "/brain-delivery",
    "/offtarget-atlas",
    "/software",
    "/hardware",
    "/human-practices",
    "/education",
    "/inclusivity",
]

PLACEHOLDER_ROUTES = [
    "/team",
    "/attributions",
    "/description",
    "/blueprint",
    "/engineering",
    "/results",
    "/contribution",
    "/future",
    "/parts",
    "/measurement",
    "/alternative-platform",
    "/safety-and-security",
    "/hardware",
    "/human-practices",
    "/education",
    "/inclusivity",
]

ENGINEERING_PARTS = [
    "fundamental-research",
    "pod", "cetus", "integrated-orca", "gfa", "mre", "aso", "cre-loxp",
    "deliver", "measure", "model-rna-seq", "model-puf", "model-apobec",
    "model-lamar", "model-whole-body", "functional-validation",
]


class WikiRoutesTest(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def get_text(self, route: str) -> str:
        response = self.client.get(route)
        self.assertEqual(response.status_code, 200, route)
        return response.get_data(as_text=True)

    def test_all_public_routes_render(self):
        for route in PUBLIC_ROUTES:
            with self.subTest(route=route):
                self.get_text(route)

    def test_unknown_page_returns_designed_404(self):
        for route in ("/this-page-does-not-exist",):
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 404)
                self.assertIn("Lost in the current", response.get_data(as_text=True))

    def test_static_404_route_renders_for_frozen_hosting(self):
        page = self.get_text("/404.html")
        self.assertIn("Lost in the current", page)

    def test_home_contains_particle_story_and_project_navigation(self):
        page = self.get_text("/")
        for marker in ['data-ot>', 'data-ot-canvas', 'data-ot-story']:
            self.assertIn(marker, page)
        menu = re.search(r'<nav\b[^>]*aria-label="Primary navigation"[^>]*>(.*?)</nav>', page, re.S)
        index = re.search(r'<section\b[^>]*aria-labelledby="ot-index-title"[^>]*>(.*?)</section>', page, re.S)
        self.assertIsNotNone(menu)
        self.assertIsNotNone(index)
        self.assertIn('href="/education"', menu.group(1))
        self.assertIn('href="/education"', index.group(1))
        navigation_routes = [f"/{route}" for group in NAVIGATION for route, _ in group["items"]]
        for route in navigation_routes:
            with self.subTest(route=route):
                self.assertIn(f'href="{route}"', menu.group(1))
                self.assertIn(f'href="{route}"', index.group(1))
        self.assertRegex(page, r'<footer\b[^>]*\bsite-footer\b')
        self.assertNotIn('data-school-footer', page)
        self.assertNotIn('data-edit-start', page)
        for marker in ['explore-slide__serial', 'explore-slide__count', 'explore-slides__eyebrow']:
            self.assertNotIn(marker, index.group(1))
        self.assertNotIn('↗', index.group(1))
        for text in ['Conceptual editing mechanism', 'Explore ORCA', '>POD<', '>CETUS<']:
            self.assertNotIn(text, page)
        self.assertIn('Recognizes and binds the target RNA.', page)
        self.assertIn('Converts the target C to U.', page)
        self.assertNotIn('data-bio-label="nucleus"', page)
        self.assertNotIn('We want to know whether this RNA edit changes how astrocytes take up', page)
        self.assertIn('>APOE4 RNA</span>', page)
        self.assertNotIn('ot-residue-arrow', page)
        self.assertNotIn('class="burden__source"', page)
        self.assertIn('class="burden__source"', self.get_text('/next'))
        self.assertLess(page.index('onetake/home-entry.js'), page.index('ot-hero-title'))
        self.assertIn('data-school-footer', self.get_text('/model'))

    def test_particle_structure_preview_keeps_home_story(self):
        # /next now adds the separately reviewed residue-112 structure section.
        home, preview = self.get_text("/"), self.get_text("/next")
        for page in [home, preview]:
            for marker in ['data-ot-canvas', 'data-ot-story', 'data-bio-handle="pod"',
                           'data-bio-handle="cetus"', 'What if we can']:
                self.assertIn(marker, page)
        self.assertIn('id="ot-index-title"', home)
        self.assertIn('href="#apoe112"', preview)

    def test_journey_preserves_biology_and_removes_crt(self):
        home, journey = self.get_text("/"), self.get_text("/next-journey")
        self.assertNotIn("data-crt-picture", journey)
        self.assertEqual(journey.count("data-ot-canvas"), 1)
        self.assertIn("Skip to project", journey)
        for marker in ['data-bio-handle="pod"', 'data-bio-handle="cetus"',
                       'data-burden', 'ot-index-title', 'data-journey-station="home"',
                       'data-journey-station="bridge"', 'data-journey-station="road"']:
            self.assertIn(marker, journey)
        # The two independent previews retain their original biology copy.
        # Home now has its own explanatory copy and system-optimization ending.
        preview = self.get_text('/next')
        start = '<div class="ot-ch ot-ch--left" data-ot-chapter data-in="0.11"'
        preview_story = preview[preview.index(start):preview.index('<section class="apoe112')]
        journey_story = journey[journey.index(start):journey.index('<section class="ot-index')]
        self.assertEqual(preview_story.replace('href="#apoe112"', 'href="#ot-index-title"').strip(),
                         journey_story.strip())
        self.assertIn('explore-slide__serial', journey)
        self.assertIn('data-edit-start', journey)

    def test_visible_brand_is_orca(self):
        home = self.get_text("/")
        team = self.get_text("/team")
        for page in [home, team]:
            self.assertIn("ORCA", page)
            self.assertNotIn("REWIRE", page)
        self.assertIn("On-target RNA Correction of APOE4 for Alzheimer’s Disease", home)

    def test_particle_assets_and_transitive_module_imports_are_served_locally(self):
        page = self.get_text("/")
        self.assertIn('/static/onetake/onetake.css', page)
        self.assertIn('/static/onetake/onetake.js', page)
        importmap = re.search(r'<script type="importmap">(.*?)</script>', page, re.S)
        self.assertIsNotNone(importmap)
        imports = json.loads(importmap.group(1))["imports"]
        pending = ["/static/onetake/onetake.css", "/static/onetake/onetake.js"]
        visited = set()
        while pending:
            asset_url = pending.pop()
            if asset_url in visited:
                continue
            visited.add(asset_url)
            self.assertTrue(asset_url.startswith("/static/"), asset_url)
            response = self.client.get(asset_url)
            try:
                self.assertEqual(response.status_code, 200, asset_url)
                source = response.get_data(as_text=True)
                self.assertTrue(source, asset_url)
            finally:
                response.close()
            if not asset_url.endswith((".js", ".mjs")):
                continue
            for specifier in re.findall(r'(?:from\s*|import\s*)[\'"]([^\'"]+)[\'"]', source):
                if specifier in imports:
                    pending.append(imports[specifier])
                elif specifier.startswith("three/addons/"):
                    pending.append(imports["three/addons/"] + specifier.removeprefix("three/addons/"))
                else:
                    self.assertTrue(specifier.startswith("."), specifier)
                    pending.append(urljoin(asset_url, specifier))

    def test_inner_pages_do_not_load_particle_assets(self):
        for route in PUBLIC_ROUTES:
            if route in {"/", "/next", "/next-journey"}:
                continue
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertNotIn("onetake/", page)
                if route == "/inclusivity":
                    # The requested STL viewers use local Three.js, without the
                    # homepage's particle scenes or animation dependencies.
                    importmap = re.search(r'<script type="importmap">(.*?)</script>', page, re.S)
                    self.assertIsNotNone(importmap)
                    self.assertEqual(json.loads(importmap.group(1))["imports"], {
                        "three": "/static/vendor/three/three.module.js",
                        "three/addons/": "/static/vendor/three/addons/",
                    })
                    self.assertIn("human-practices/model-viewers/viewers.js", page)
                else:
                    self.assertNotIn('type="importmap"', page)

    def test_inclusivity_owns_accessibility_content_and_model_viewers(self):
        hp = self.get_text("/human-practices")
        inclusivity = self.get_text("/inclusivity")
        for title in [
            "Anjia Guardian: A home-safety mini-app designed for older adults",
            "Biology Models to Explore by Touch: The Brain and the Cell",
        ]:
            self.assertIn(title, inclusivity)
            self.assertNotIn(title, hp)
        # Catch an empty inherited-template body as well as missing figures.
        self.assertIn("The interface uses large text", inclusivity)
        self.assertIn("Could we offer a more tangible way", inclusivity)
        for filename in [
            "biology-brain-model-render.webp", "biology-cell-model-render.webp",
            "biology-brain-model.stl.zip", "biology-animal-cell-model.stl.zip",
        ]:
            self.assertIn(filename, inclusivity)
            self.assertNotIn(filename, hp)
        self.assertIn('/inclusivity#1-anjia-guardian-', hp)
        self.assertNotIn("human-practices/model-viewers/viewers.js", hp)
        self.assertEqual(hp.count('class="hp-media-row"'), 7)
        self.assertEqual(inclusivity.count('class="hp-media-row"'), 2)

    def test_hero_assets_are_served_from_requested_path(self):
        response = self.client.get("/assets/hero/clearance/cleaners-ready.png")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/png")
        response.close()

    def test_stylesheet_uses_approved_orca_palette(self):
        stylesheet = Path("static/style.css").read_text(encoding="utf-8")
        for color in ["#2e3065", "#f2989f", "#9b9ef7", "#5f62cd", "#3d409b", "#191a59", "#d6d8ff", "#6f71c1"]:
            self.assertIn(color, stylesheet.lower())
        self.assertIn('--serif: Georgia,', stylesheet)
        self.assertIn('--sans: Futura,', stylesheet)

    def test_development_server_is_loopback_only(self):
        app_source = Path("app.py").read_text(encoding="utf-8")
        self.assertIn('app.run(host="127.0.0.1",', app_source)

    def test_evidence_context_follows_each_page_format(self):
        for route in ["/dry-lab", "/model", "/brain-delivery", "/offtarget-atlas", "/software"]:
            with self.subTest(route=route):
                page = self.get_text(route)
                if route == "/model":
                    self.assertNotIn("Evidence status", page)
                    self.assertNotIn('data-evidence=', page)
                elif route == "/software":
                    self.assertNotIn("Evidence status", page)
                    self.assertIn('data-evidence="software"', page)
                    self.assertIn("normalized model inputs", page)
                    self.assertEqual(page.count('data-software-story='), 4)
                else:
                    self.assertIn("Evidence status", page)
                    self.assertIn('data-evidence=', page)

    def test_spatial_model_is_limited_to_requested_software_and_engineering_pages(self):
        for route in PUBLIC_ROUTES:
            with self.subTest(route=route):
                page = self.get_text(route).lower()
                if route in {"/software", "/engineering"}:
                    self.assertIn("physicell", page)
                else:
                    self.assertNotIn("physicell", page)
                self.assertNotIn("paraview", page)

    def test_framework_pages_omit_generic_review_banners_without_lorem_ipsum(self):
        for route in PLACEHOLDER_ROUTES:
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertNotIn('data-content-status=', page)
                self.assertNotIn("Content pending team review", page)
                self.assertNotIn("Lorem ipsum", page)

    def test_markdown_pages_expose_their_docs_source(self):
        expected = {
            "/description": "docs/project/description.md",
            "/engineering": "docs/project/engineering.md",
            "/experiments": "docs/wet-lab/experiments.md",
            "/human-practices": "docs/human-practices/human-practices.md",
            "/inclusivity": "docs/human-practices/inclusivity.md",
            "/measurement": "docs/wet-lab/measurement.md",
            "/attributions": "docs/team/attributions.md",
        }
        for route, source in expected.items():
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertIn(f'data-content-source="{source}"', page)
                if route != "/experiments":
                    self.assertIn('class="markdown-content"', page)

    def test_engineering_map_and_reader_navigation_contract(self):
        page = self.get_text("/engineering")
        self.assertIn('data-engineering-view="map"', page)
        self.assertEqual(len(re.findall(r'\bdata-engineering-map(?=[\s>])', page)), 1)
        self.assertEqual(re.findall(r'\bdata-engineering-group="([^"]+)"', page),
                         ["fundamental-research", "edit", "control", "deliver", "measure", "model", "functional-validation"])
        self.assertIn('data-selected-group=""', page)
        self.assertNotIn('data-engineering-expand', page)
        self.assertNotIn('engineering-map-expand', page)
        branches = re.findall(r'<div\b[^>]*data-map-branch-group="[^"]+"[^>]*>', page)
        self.assertEqual(len(branches), 3)
        self.assertTrue(all(re.search(r'\bhidden(?=[\s>])', branch) for branch in branches))
        map_section = re.search(r'<section\b[^>]*data-engineering-map\s[^>]*>(.*?)</section>', page, re.S)
        self.assertIsNotNone(map_section)
        self.assertNotRegex(map_section.group(1), r'<img\b')
        self.assertEqual(len(re.findall(r'<image\b', map_section.group(1))), 1)
        self.assertIn('data-engineering-overview=', map_section.group(1))
        self.assertEqual(len(re.findall(r'\bdata-overview-layer=', map_section.group(1))), 21)
        self.assertNotIn('engineering-map-water-art', map_section.group(1))
        self.assertRegex(map_section.group(1), r'<h1\b[^>]*id="engineering-map-title"[^>]*>Platform Development</h1>')
        visible_copy = re.sub(r'<[^>]+>', '', map_section.group(1))
        for removed in ["Ideas in motion", "Choose a cycle", "Choose a branch, then a cycle."]:
            self.assertNotIn(removed, visible_copy)
        self.assertNotIn("data-map-hint", page)
        self.assertNotIn("data-map-cycle-title", page)
        self.assertRegex(page, r'<svg\b[^>]*data-map-lines(?=[\s>])')
        config = re.search(r'<script\b[^>]*data-engineering-map-data[^>]*>(.*?)</script>', page, re.S)
        self.assertIsNotNone(config)
        groups = json.loads(config.group(1))
        self.assertEqual([part["id"] for group in groups for part in group["parts"]], ENGINEERING_PARTS)
        for group in groups:
            link = re.search(rf'<a\b[^>]*data-engineering-group="{group["id"]}"[^>]*>', page)
            self.assertIsNotNone(link)
            self.assertIn(f'href="#{group["parts"][0]["id"]}"', link.group(0))
        leaf_parts = [part for part in ENGINEERING_PARTS if part not in {"fundamental-research", "deliver", "measure", "functional-validation"}]
        self.assertCountEqual(re.findall(r'\bdata-engineering-part="([^"]+)"', page), leaf_parts)
        # Cycles remain in the reader; the overview map stops at module level.
        self.assertNotRegex(page, r'\bdata-map-cycle="')
        self.assertNotIn('engineering-map-cycle-picker', page)
        self.assertNotRegex(page, r'\bdata-engineering-cycle="')
        self.assertLess(page.index('/static/engineering-structure.js'), page.index('/static/engineering-map.js'))
        self.assertEqual(len(re.findall(r'\bdata-engineering-map-back(?=[\s>])', page)), 1)
        self.assertGreater(page.index("data-engineering-cycles"), page.index("data-dbtl-wheel"))
        self.assertNotIn("engineering-module-nav", page)
        self.assertNotIn("data-reading-orbit", page)
        self.assertNotRegex(page, r"<footer\b")

    def test_engineering_parts_have_complete_authored_cycles_and_portrait_pool(self):
        page = self.get_text("/engineering")
        article = re.search(r'<article\b[^>]*class="markdown-content"[^>]*>(.*?)</article>', page, re.S)
        self.assertIsNotNone(article)
        ids = re.findall(r'\bid="([^"]+)"', article.group(1))
        self.assertEqual(len(ids), len(set(ids)))
        # Imported manuscripts define their own cycle counts. Integrated ORCA
        # has one unnumbered DBTL record; Cre–loxP is a proposal, not an experiment.
        counts = dict(zip(ENGINEERING_PARTS, [2, 3, 6, 1, 2, 3, 6, 0, 3, 10, 5, 6, 5, 5, 5, 3]))
        cycles = [f"{part}-cycle-{number:02d}" for part, count in counts.items() for number in range(1, count + 1)]
        self.assertEqual(len(cycles), 65)
        self.assertCountEqual([anchor for anchor in ids if re.fullmatch(r".+-cycle-\d{2}", anchor)], cycles)
        for cycle in cycles:
            with self.subTest(cycle=cycle):
                for stage in ["design", "build", "test", "learn"]:
                    self.assertIn(f"{cycle}-{stage}", ids)
        for part in ENGINEERING_PARTS[10:15]:
            self.assertRegex(article.group(1), rf'<h3\b[^>]*id="{part}"')
        portraits = re.findall(r'<svg\b[^>]*\bdata-dbtl-portrait="[^"]+"[^>]*>.*?</svg>', page, re.S)
        # Reuse the existing portrait pool for additional cycles, without
        # requiring a new decorative image for every imported experiment.
        self.assertEqual(len(portraits), 44)
        sources = [re.search(r'<image\b[^>]*\bhref="([^"]+)"', portrait).group(1)
                   for portrait in portraits]
        self.assertEqual(len(set(sources)), 44)
        self.assertEqual(len({Path(source.lstrip('/')).read_bytes() for source in sources}), 44)

    def test_engineering_import_preserves_math_annotations_and_assets(self):
        page = self.get_text("/engineering")
        source = Path("docs/project/engineering.md").read_text()
        annotation = r'<annotation\b[^>]*encoding="application/x-tex"[^>]*>(.*?)</annotation>'
        expected = [html.unescape(value) for value in re.findall(annotation, source, re.S)]
        rendered = [html.unescape(value) for value in re.findall(annotation, page, re.S)]
        self.assertEqual(len(expected), 121)
        self.assertEqual(rendered, expected)
        self.assertEqual(page.count('class="engineering-equation"'), 39)
        self.assertEqual(page.count('class="engineering-math"'), 82)
        for formula in re.findall(r'<math\b.*?</math>', page, re.S):
            self.assertNotRegex(formula, r'<em\b')
        imported_images = re.findall(r'<img\b[^>]*src="(/assets/images/engineering-dry-dbtl/[^\"]+)"', page)
        self.assertEqual(len(imported_images), 19)
        for image in imported_images:
            response = self.client.get(image)
            self.assertEqual(response.status_code, 200, image)
            response.close()

    def test_markdown_image_is_resolved_through_assets_route(self):
        page = self.get_text("/description")
        self.assertIn("/assets/images/description/alzheimers-pathology.png", page)
        response = self.client.get("/assets/images/description/alzheimers-pathology.png")
        self.assertEqual(response.status_code, 200)
        response.close()

    def test_custom_pages_render_their_markdown_editable_section(self):
        expected = {
            "/dry-lab": "docs/dry-lab/dry-lab.md",
            "/model": "docs/dry-lab/model.md",
            "/brain-delivery": "docs/dry-lab/brain-delivery.md",
            "/offtarget-atlas": "docs/dry-lab/offtarget-atlas.md",
            "/software": "docs/dry-lab/software.md",
        }
        for route, source in expected.items():
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertIn(f'data-content-source="{source}"', page)
                self.assertIn("markdown-content--custom", page)

    def test_custom_page_section_navigation_has_valid_targets(self):
        for route in ["/dry-lab", "/model", "/brain-delivery", "/offtarget-atlas", "/software"]:
            with self.subTest(route=route):
                page = self.get_text(route)
                targets = re.findall(r'<a\b[^>]*\bhref="#([^"]+)"[^>]*>', page)
                self.assertTrue(targets)
                for target in targets:
                    self.assertIn(f'id="{target}"', page)

    def test_every_page_keeps_required_license_and_repository_link(self):
        for route in PUBLIC_ROUTES:
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertIn("creativecommons.org/licenses/by/4.0", page)
                self.assertIn("gitlab.igem.org/2026/sustech", page)

    def test_brain_model_discloses_hypothetical_placeholder_inputs(self):
        page = self.get_text("/brain-delivery")
        self.assertIn("Hypothetical candidate", page)
        self.assertIn("placeholder scalars", page)
        for section in ["states", "equations", "parameters", "sensitivity", "outputs", "limitations"]:
            self.assertIn(f'id="{section}"', page)

    def test_computational_results_link_to_archived_evidence(self):
        atlas = self.get_text("/offtarget-atlas")
        brain = self.get_text("/brain-delivery")
        self.assertIn("evidence/puf-atlas-example/summary.json", atlas)
        self.assertIn("evidence/puf-atlas-example/run_metadata.json", atlas)
        self.assertIn("evidence/brain-delivery-v4-summary.md", brain)


if __name__ == "__main__":
    unittest.main()
