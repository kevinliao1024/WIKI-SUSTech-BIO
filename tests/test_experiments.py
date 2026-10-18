"""Check source PDF integrity, static links and Wet Lab integration."""
import hashlib
from pathlib import Path
import unittest
from html.parser import HTMLParser
from urllib.parse import urlsplit
import yaml

from app import app
from wiki_content import CONTENT_PAGES, NAVIGATION, load_markdown_content

ROOT = Path(__file__).resolve().parents[1]


class ExperimentsTest(unittest.TestCase):
    def test_protocol_sources_and_links(self):
        content = load_markdown_content('wet-lab/experiments.md')
        groups = content.metadata['protocol_groups']
        records = [p for g in groups for p in g['protocols']]
        self.assertEqual([g['code'] for g in groups], ['M', 'C', 'MR', 'RP', 'AS', 'AA', 'FV'])
        self.assertEqual(len(groups[0]['protocols']), 15)
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

    def test_minimal_library_and_reader_sections(self):
        guide = yaml.safe_load((ROOT / 'docs/wet-lab/experiment-guide.yaml').read_text())
        content = load_markdown_content('wet-lab/experiments.md')
        self.assertEqual(content.title, 'Experiment')
        self.assertEqual(content.metadata['guide'], guide)
        self.assertEqual(len(guide['find_steps']), 4)
        self.assertEqual(len(guide['read_modules']), 9)
        class Document(HTMLParser):
            def __init__(self):
                super().__init__()
                self.ids, self.links, self.images, self.styles = [], [], [], []
            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                if 'id' in a: self.ids.append(a['id'])
                if tag == 'a': self.links.append(a.get('href', ''))
                if tag == 'img': self.images.append(a['src'])
                if tag == 'link': self.styles.append(a['href'])
        for group in content.metadata['protocol_groups']:
            for record in group['protocols']:
                path = ROOT / 'static' / record['reader']
                reader = path.read_text()
                parser = Document()
                parser.feed(reader)
                with self.subTest(entry=record['id']):
                    self.assertEqual(len(parser.ids), len(set(parser.ids)))
                    self.assertIn('experiment-information', parser.ids)
                    self.assertIn('procedure', parser.ids)
                    self.assertNotIn('/Users/', reader)
                    for link in parser.links:
                        if link.startswith('#'): self.assertIn(link[1:], parser.ids)
                    for asset in parser.images + parser.styles:
                        self.assertFalse(urlsplit(asset).scheme, 'Reader media is served locally')
                        self.assertTrue((path.parent / asset).is_file(), asset)
        with app.test_client() as client:
            html = client.get('/experiments').get_data(as_text=True)
            for removed in ('WET LAB / EXPERIMENT LIBRARY',
                            'BROWSE BY METHOD', 'Follow the research timeline',
                            'One connected research journey.', 'Methods to build on.',
                            'class="exp-family"', 'class="exp-group-count"'):
                self.assertNotIn(removed, html)
            from html import escape
            self.assertIn('<details class="exp-guide" id="how-to-read">', html)
            self.assertLess(html.index('id="how-to-read"'), html.index('id="experiment-workspace"'))
            self.assertEqual(html.count('class="exp-step-number"'), 13)
            for item in guide['find_steps'] + guide['read_modules']:
                self.assertIn(escape(item['text'], quote=False), html)
            self.assertIn(guide['clarification_lead'], html)
            for group in content.metadata['protocol_groups']:
                self.assertIn(escape(group['title']), html)
            self.assertIn('data-category-indicator', html)

    def test_existing_wet_lab_route_uses_catalog_template(self):
        self.assertEqual(CONTENT_PAGES['experiments'].template, 'pages/experiments.html')
        wetlab = next(g for g in NAVIGATION if g['label'] == 'Wet Lab')
        self.assertIn('experiments', [route for route, label in wetlab['items']])


if __name__ == '__main__':
    unittest.main()
