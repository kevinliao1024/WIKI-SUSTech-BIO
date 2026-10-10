"""Preserved reference art and home storytelling evidence verification."""
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

    def test_home_preserves_qualified_who_statistics(self):
        page = app.test_client().get('/').get_data(as_text=True)
        self.assertIn('57,000,000+', page)
        self.assertIn('60–70%', page)
        self.assertIn('people were living with dementia worldwide in 2021', page)
        self.assertIn('of dementia cases are estimated to be attributable to Alzheimer disease', page)
