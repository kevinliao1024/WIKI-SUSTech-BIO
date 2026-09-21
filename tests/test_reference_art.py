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

    def test_home_uses_storyboard_full_hero_asset(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('hero/storyboard-full.png', page)
        self.assertIn('data-hero-storyboard', page)

    def test_hero_story_has_clean_structure(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('class="hero-story"', page)
        self.assertIn('class="hero-story__viewport"', page)
        self.assertIn('class="hero-story__track"', page)
