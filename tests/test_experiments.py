"""Check source PDF integrity, static links and Wet Lab integration."""
import hashlib
from pathlib import Path
import unittest

from app import app
from wiki_content import CONTENT_PAGES, NAVIGATION, load_markdown_content

ROOT = Path(__file__).resolve().parents[1]


class ExperimentsTest(unittest.TestCase):
    def test_protocol_sources_and_links(self):
        content = load_markdown_content('wet-lab/experiments.md')
        groups = content.metadata['protocol_groups']
        records = [p for g in groups for p in g['protocols']]
        self.assertEqual(len(groups), 8)
        self.assertEqual(len(records), 36)
        self.assertEqual(len({p['id'] for p in records}), len(records))
        with app.test_client() as client:
            response = client.get('/experiments')
            self.assertEqual(response.status_code, 200)
            html = response.get_data(as_text=True)
            self.assertNotIn('Content pending team review', html)
            self.assertNotIn('/Users/', html)
            self.assertIn('creativecommons.org/licenses/by/4.0', html)
            for p in records:
                with self.subTest(protocol=p['id']):
                    raw = (ROOT / 'static' / p['file']).read_bytes()
                    self.assertTrue(raw.startswith(b'%PDF-'))
                    self.assertEqual(hashlib.sha256(raw).hexdigest(), p['sha256'])
                    self.assertIn('id="' + p['id'] + '"', html)
                    source = client.get('/static/' + p['file'])
                    self.assertEqual(source.status_code, 200)
                    self.assertEqual(source.mimetype, 'application/pdf')
                    source.close()

    def test_existing_wet_lab_route_uses_catalog_template(self):
        self.assertEqual(CONTENT_PAGES['experiments'].template, 'pages/experiments.html')
        wetlab = next(g for g in NAVIGATION if g['label'] == 'Wet Lab')
        self.assertIn('experiments', [route for route, label in wetlab['items']])


if __name__ == '__main__':
    unittest.main()
