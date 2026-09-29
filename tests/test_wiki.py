import re
import unittest
from pathlib import Path

from app import app


PUBLIC_ROUTES = [
    "/",
    "/team",
    "/attributions",
    "/description",
    "/engineering",
    "/results",
    "/contribution",
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
    "/entrepreneurship",
    "/human-practices",
    "/education",
    "/inclusivity",
    "/sustainability",
]

PLACEHOLDER_ROUTES = [
    "/team",
    "/attributions",
    "/description",
    "/engineering",
    "/results",
    "/contribution",
    "/parts",
    "/experiments",
    "/notebook",
    "/measurement",
    "/alternative-platform",
    "/safety-and-security",
    "/hardware",
    "/entrepreneurship",
    "/human-practices",
    "/education",
    "/inclusivity",
    "/sustainability",
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
        response = self.client.get("/this-page-does-not-exist")
        self.assertEqual(response.status_code, 404)
        self.assertIn("Lost in the current", response.get_data(as_text=True))

    def test_static_404_route_renders_for_frozen_hosting(self):
        page = self.get_text("/404.html")
        self.assertIn("Lost in the current", page)

    def test_home_contains_layered_hero_and_stops_after_global_scene(self):
        page = self.get_text("/")
        self.assertIn('data-rna-clearance-state="ready"', page)
        self.assertIn('data-global-scene', page)
        self.assertNotIn('data-solution-reveal', page)
        self.assertNotIn('class="site-footer"', page)

    def test_visible_brand_is_orca(self):
        home = self.get_text("/")
        team = self.get_text("/team")
        for page in [home, team]:
            self.assertIn("ORCA", page)
            self.assertNotIn("REWIRE", page)
        self.assertIn("On-target RNA Correction for Alzheimer’s Disease", home)

    def test_home_uses_layered_clearance_assets(self):
        page = self.get_text("/")
        self.assertIn('hero/clearance/cleaners-ready.png', page)
        self.assertIn('hero/clearance/cleaners-exhausted.png', page)
        self.assertIn('class="rna-opening__cleaners"', page)
        self.assertIn('class="rna-opening__clearance-copy"', page)

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

    def test_dry_lab_pages_show_evidence_status(self):
        for route in ["/dry-lab", "/model", "/brain-delivery", "/offtarget-atlas", "/software"]:
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertIn("Evidence status", page)
                self.assertIn('data-evidence=', page)

    def test_spatial_model_is_not_publicly_mentioned(self):
        for route in PUBLIC_ROUTES:
            with self.subTest(route=route):
                page = self.get_text(route).lower()
                self.assertNotIn("physicell", page)
                self.assertNotIn("paraview", page)

    def test_framework_pages_are_explicitly_pending_without_lorem_ipsum(self):
        for route in PLACEHOLDER_ROUTES:
            with self.subTest(route=route):
                page = self.get_text(route)
                self.assertIn('data-content-status="pending"', page)
                self.assertIn("Content pending team review", page)
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
                self.assertIn('class="markdown-content"', page)

    def test_markdown_image_is_resolved_through_assets_route(self):
        page = self.get_text("/description")
        self.assertIn("/assets/figures/three-cell-clearance-mechanism.webp", page)
        response = self.client.get("/assets/figures/three-cell-clearance-mechanism.webp")
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
                targets = re.findall(r'<a href="#([^"]+)">', page)
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
