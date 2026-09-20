"""The prepared mRNA layers are the source of truth for the RNA hero."""
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

    def test_home_uses_prepared_mrna_layers(self):
        page=app.test_client().get('/').get_data(as_text=True)
        for asset in ('wave_1.png', 'blue_spot_1.png', 'pink_spot_1.png', 'pink_spot_2.png'):
            self.assertIn(f'data-asset="{asset}"', page)
        self.assertIn('class="mrna-hero__canvas"', page)

    def test_markers_begin_hidden_and_debug_mode_is_preserved(self):
        stylesheet=Path('static/hero.css').read_text()
        script=Path('static/hero.js').read_text()
        self.assertIn('.mrna-hero__asset--marker {', stylesheet)
        self.assertIn('opacity: 0;', stylesheet)
        self.assertIn('transform: scale(.2);', stylesheet)
        self.assertIn("get('debugHero') === '1'", script)
        self.assertIn("data-hero-progress", app.test_client().get('/').get_data(as_text=True))

    def test_hero_has_no_animation_dependencies(self):
        page=app.test_client().get('/').get_data(as_text=True)
        script=Path('static/hero.js').read_text()
        self.assertNotIn('intro.js', page)
        self.assertNotIn('gsap', page.lower())
        self.assertNotIn('scrolltrigger', page.lower())
        self.assertNotIn('scaleY', script)
        self.assertEqual(script.count("addEventListener('scroll'"), 1)
        self.assertIn('requestAnimationFrame', script)
