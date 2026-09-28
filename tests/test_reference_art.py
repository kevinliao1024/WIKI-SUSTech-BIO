"""Hero storytelling and prepared mRNA layers verification."""
import unittest
import hashlib
import json
from pathlib import Path
from app import app


class ReferenceArtTest(unittest.TestCase):
    def test_display_reference_has_unchanged_original_bytes(self):
        directory = Path('static/assets/intro')
        records = json.loads((directory / 'provenance.json').read_text())
        original = next(r for r in records if r.get('output') == 'visual-system-reference.jpg')
        self.assertEqual(hashlib.sha256((directory / 'visual-system-reference.jpg').read_bytes()).hexdigest(), original['sha256'])

    def test_home_uses_layered_clearance_scene_assets(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('hero/clearance/cleaners-ready.png', page)
        self.assertIn('hero/clearance/cleaners-strained.png', page)
        self.assertIn('hero/clearance/cleaners-exhausted.png', page)
        self.assertIn('data-rna-opening', page)
        self.assertIn('data-rna-clearance-state="ready"', page)

    def test_cell_and_clearance_share_one_pinned_scene(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('class="rna-opening__cell-character"', page)
        self.assertIn('class="rna-opening__cleaners"', page)
        self.assertIn('class="rna-opening__clearance-copy"', page)
        self.assertNotIn('data-clearance-scene', page)

    def test_home_uses_layered_protein_reveal(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('data-protein-scene', page)
        self.assertIn('hero_lib/characters/axolotl_closeup_state_c.webp', page)
        self.assertIn('hero_lib/protein_states/apoe4_title.webp', page)
        self.assertIn('hero-scrub.js', page)
        self.assertIn('data-protein-bridge', page)
        self.assertEqual(page.count('class="protein-drop"'), 16)

    def test_home_stops_before_project_reveal(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertNotIn('data-solution-reveal', page)
        self.assertNotIn('class="research-sections"', page)
        self.assertNotIn('class="site-footer"', page)

    def test_global_burden_scene_uses_qualified_who_statistics(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('data-global-scene', page)
        self.assertIn('57000000', Path('static/global-scene.js').read_text())
        self.assertIn('60–70%', page)
        self.assertIn('people were living with dementia worldwide in 2021', page)
        self.assertIn('who.int/news-room/fact-sheets/detail/dementia', page)
