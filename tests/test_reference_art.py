"""The original, complete brain composition is the source of truth."""
import unittest
import hashlib
import json
from pathlib import Path
from app import app


class ReferenceArtTest(unittest.TestCase):
    def test_display_reference_has_unchanged_original_bytes(self):
        directory=Path('static/assets/intro')
        records=json.loads((directory/'provenance.json').read_text())
        original=next(r for r in records if r.get('output')=='visual-system-reference.jpg')
        self.assertEqual(hashlib.sha256((directory/'visual-system-reference.jpg').read_bytes()).hexdigest(),original['sha256'])

    def test_home_uses_complete_reference_not_a_stretched_detail(self):
        page=app.test_client().get('/').get_data(as_text=True)
        self.assertIn('class="reference-plate"', page)
        self.assertIn('assets/intro/visual-system-reference.jpg', page)
        self.assertNotIn('brain-folds.png', page)
        self.assertNotIn('class="neural-corals"', page)

    def test_leader_comes_from_the_title_adjacent_reference_whale(self):
        page=app.test_client().get('/').get_data(as_text=True)
        self.assertIn('class="reference-whale-crop"', page)
        self.assertNotIn('assets/intro/fish-large-01.png', page)

    def test_no_second_drawn_route_is_added_to_original_composition(self):
        page=app.test_client().get('/').get_data(as_text=True)
        self.assertNotIn('id="research-route"', page)
        self.assertNotIn('class="route-ribbons"', page)
