import unittest
from pathlib import Path

from app import app


PUBLIC_ROUTES = [
    "/",
    "/team",
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

    def test_home_contains_memory_story_and_art_slots(self):
        page = self.get_text("/")
        self.assertIn("Memory should not fade alone", page)
        self.assertIn('data-asset-key="orca-forgotten"', page)
        self.assertIn('data-asset-key="orca-remembered"', page)
        self.assertIn('data-story-progress', page)

    def test_visible_brand_is_orca(self):
        home = self.get_text("/")
        team = self.get_text("/team")
        for page in [home, team]:
            self.assertIn("ORCA", page)
            self.assertNotIn("REWIRE", page)
        self.assertIn("On-target RNA Correction for Alzheimer’s Disease", home)

    def test_home_uses_orca_ocean_composition_hooks(self):
        page = self.get_text("/")
        for hook in ["data-orca-pod", "data-ocean-current", "data-coral-garden", "data-white-current"]:
            self.assertIn(hook, page)

    def test_stylesheet_uses_approved_orca_palette(self):
        stylesheet = Path("static/style.css").read_text(encoding="utf-8")
        for color in ["#2e3065", "#f2989f", "#9b9ef7", "#5f62cd", "#3d409b", "#191a59", "#d6d8ff", "#6f71c1"]:
            self.assertIn(color, stylesheet.lower())
        self.assertIn('--serif: Georgia,', stylesheet)
        self.assertIn('--sans: Futura,', stylesheet)

    def test_development_server_uses_documented_port(self):
        app_source = Path("app.py").read_text(encoding="utf-8")
        self.assertIn('app.run(host="127.0.0.1", port=8080)', app_source)

    def test_home_uses_original_raster_whales_instead_of_drawn_whales(self):
        page = self.get_text("/")
        for asset in ["static/assets/wiki1-main-orca.png", "static/assets/wiki1-orca-pod.png"]:
            self.assertIn(asset, page)
            self.assertTrue(Path(asset).is_file(), asset)
        self.assertIn('data-source-art="wiki1"', page)
        self.assertNotIn('class="orca-pod', page)
        self.assertNotIn("medallion-orca", page)

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
