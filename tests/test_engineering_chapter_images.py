"""Release checks for the twelve approved Engineering chapter illustrations."""
import hashlib
import json
import unittest
from pathlib import Path
from lxml import html
from app import app


class EngineeringChapterImagesTest(unittest.TestCase):
    def test_all_chapter_cards_use_verified_uploads_in_production(self):
        manifest = json.loads(Path('assets/images/engineering-overviews/manifest.json').read_text())
        self.assertEqual(len(manifest), 12)
        previous = app.config['WIKI_ASSET_MODE']
        try:
            app.config['WIKI_ASSET_MODE'] = 'igem'
            response = app.test_client().get('/engineering')
            self.assertEqual(response.status_code, 200)
            document = html.fromstring(response.get_data(as_text=True))
        finally:
            app.config['WIKI_ASSET_MODE'] = previous
        images = document.xpath('//img[@class="engineering-overview-illustration"]')
        self.assertEqual(len(images), 12)
        for card in manifest:
            with self.subTest(chapter=card['overview']):
                original = Path('assets/images/engineering-overviews') / card['image']
                self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(), card['sha256'])
                container = document.get_element_by_id(card['overview']).getnext()
                candidates = container.xpath('self::img | .//img')
                self.assertEqual(len(candidates), 1)
                image = candidates[0]
                self.assertEqual(image.get('src'), card['url'])
                self.assertTrue(card['url'].startswith('https://static.igem.wiki/teams/6085/wiki/engineering-new/'))
                self.assertEqual((image.get('width'), image.get('height')), ('1800', '1080'))
                self.assertTrue(image.get('alt'))
