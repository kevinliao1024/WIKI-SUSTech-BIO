"""Integration checks for SAP under the Wiki's static subdirectory."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import unittest
from urllib.parse import urlsplit

from app import app

ROOT = Path(__file__).resolve().parents[1] / 'static/sap-demo'


class URLs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.frames = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'iframe':
            self.frames.append(attrs)
        for key in ('src', 'href'):
            if attrs.get(key):
                self.urls.append(attrs[key])


class SAPDemoTest(unittest.TestCase):
    def test_both_contribution_pages_embed_the_complete_app(self):
        client = app.test_client()
        for route in ('/contribution', '/project-contribution-sonar'):
            with self.subTest(route=route):
                html = client.get(route).get_data(as_text=True)
                parser = URLs()
                parser.feed(html)
                frames = [f for f in parser.frames if 'sap-demo/' in f.get('src', '')]
                self.assertEqual(len(frames), 1)
                self.assertEqual(frames[0]['src'], 'static/sap-demo/index.html#design')
                self.assertIn('Design, Analysis and Data Sources', frames[0]['title'])
                self.assertIn('sap-demo-embed.mjs', html)
        self.assertNotIn('sap-demo-embed.mjs', client.get('/description').get_data(as_text=True))

    def test_entry_assets_work_under_team_prefix(self):
        # Relative app paths must remain inside /sustech/static/sap-demo/.
        from urllib.parse import urljoin
        parser = URLs()
        parser.feed((ROOT / 'index.html').read_text())
        client = app.test_client()
        for value in parser.urls:
            if value.startswith('#'):
                continue
            parsed = urlsplit(value)
            if parsed.scheme:
                self.assertEqual(parsed.netloc, 'static.igem.wiki')
            else:
                self.assertTrue(urljoin('/sustech/static/sap-demo/index.html', value).startswith('/sustech/static/sap-demo/'))
                with client.get('/static/sap-demo/' + value) as response:
                    self.assertEqual(response.status_code, 200)

    def test_production_middleware_preserves_snapshot_hashes(self):
        client = app.test_client()
        previous = app.config['WIKI_ASSET_MODE']
        try:
            app.config['WIKI_ASSET_MODE'] = 'igem'
            for name in ('data/case.json', 'data/overview.json', 'site-integrity.json'):
                with client.get('/static/sap-demo/' + name) as response:
                    self.assertEqual(response.data, (ROOT / name).read_bytes())
        finally:
            app.config['WIKI_ASSET_MODE'] = previous

    def test_media_urls_include_dynamic_map_viewers(self):
        media = json.loads((ROOT / 'wiki-media.json').read_text())
        self.assertEqual(len(media['images']), 7)
        self.assertEqual(media['font']['url'], 'https://static.igem.wiki/teams/6085/wiki/sonar-web/manrope-variable.ttf')
        self.assertIn(media['font']['url'], (ROOT / 'brand-home.css').read_text())
        for item in media['images']:
            self.assertEqual(urlsplit(item['url']).netloc, 'static.igem.wiki')
            self.assertTrue(item['url'].startswith('https://static.igem.wiki/teams/6085/wiki/sonar-web/'))
        designer = (ROOT / 'reporter-designer.js').read_text()
        self.assertNotIn('reporter-maps/${map.file}', designer)
        self.assertIn('https://static.igem.wiki/teams/6085/wiki/sonar-web/universal-reporter-cds.svg', designer)
        self.assertIn('https://static.igem.wiki/teams/6085/wiki/sonar-web/universal-reporter-plasmid.svg', designer)
        self.assertIn('https://static.igem.wiki/teams/6085/wiki/sonar-web/sonar-welcome.svg', (ROOT / 'app.js').read_text())

    def test_sealed_package_and_reference_snapshots(self):
        files = json.loads((ROOT / 'site-integrity.json').read_text())['files']
        actual = {p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and p.name != 'site-integrity.json'}
        self.assertEqual(actual, set(files))
        for name, expected in files.items():
            self.assertEqual(hashlib.sha256((ROOT / name).read_bytes()).hexdigest(), expected, name)
        self.assertEqual(len(list((ROOT / 'data/samples').glob('*.json'))), 96)
        sample = json.loads((ROOT / 'data/case.json').read_text())['result']['samples'][0]
        self.assertEqual(sample['sample_id'], '90B')
        self.assertEqual(sample['RAS']['n_selected'], 32207)
        self.assertIsNone(sample['RES']['routine_res_mass_fraction'])
        self.assertIsNone(sample['RES']['validated_RNA_editing_fraction'])

    def test_no_private_paths_or_raw_uploads(self):
        for file in ROOT.rglob('*'):
            if not file.is_file():
                continue
            self.assertNotIn(file.suffix.lower(), {'.fcs', '.env', '.py'})
            if file.suffix in {'.js', '.json', '.html', '.css', '.csv'}:
                text = file.read_text()
                self.assertNotIn('/Users/', text, file.name)
                self.assertNotIn('/private/', text, file.name)
