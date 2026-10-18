import csv
import json
import tempfile
import unittest
from pathlib import Path

from app import app
from igem_assets import read_mapping, resolve_url, rewrite_text
from scripts.audit_igem_assets import inspect_build, issues_for_report


class AssetResolverTest(unittest.TestCase):
    def setUp(self):
        self.mapping = {'/assets/figure.png': 'https://static.igem.wiki/teams/6085/wiki/figure.avif'}

    def test_relative_encoded_paths_preserve_query_and_fragment(self):
        self.assertEqual(resolve_url('../assets/figure%2Epng?v=2#panel', '/chapter/index.html', self.mapping),
                         self.mapping['/assets/figure.png'] + '?v=2#panel')
        for url in ['#panel', 'data:image/png;base64,x', 'https://example.org/assets/figure.png', '/assets/unknown.png']:
            self.assertEqual(resolve_url(url, '/', self.mapping), url)

    def test_css_and_srcset_preserve_layout_descriptors(self):
        result = rewrite_text('<img width="72" srcset="assets/figure.png 1x, assets/unknown.png 2x" style="background:url(assets/figure.png)">', '/', 'html', self.mapping)
        self.assertIn('width="72"', result)
        self.assertIn('figure.avif 1x, assets/unknown.png 2x', result)
        self.assertIn('background:url(https://static.igem.wiki/', result)

    def test_reject_non_official_mapping(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'mapping.csv'
            path.write_text('local_path,igem_url,match_status\nassets/x.png,https://evil.example/x.png,matched\n')
            with self.assertRaises(ValueError):
                read_mapping(path)

    def test_json_resolution_does_not_change_numbers_or_keys(self):
        data = {'file': '/assets/figure.png', 'measurement': [0.123456789, 42], 'caption': 'unchanged'}
        result = json.loads(rewrite_text(json.dumps(data), '/data/index.json', 'json', self.mapping))
        self.assertEqual(result['file'], self.mapping['/assets/figure.png'])
        self.assertEqual(result['measurement'], data['measurement'])
        self.assertEqual(result['caption'], data['caption'])


class ProductionRoutesTest(unittest.TestCase):
    def setUp(self):
        self.mode = app.config['WIKI_ASSET_MODE']
        self.client = app.test_client()

    def tearDown(self):
        app.config['WIKI_ASSET_MODE'] = self.mode

    def get_text(self, url):
        response = self.client.get(url)
        try:
            self.assertEqual(response.status_code, 200)
            return response.get_data(as_text=True)
        finally:
            response.close()

    def test_local_mode_still_uses_original_images(self):
        app.config['WIKI_ASSET_MODE'] = 'local'
        page = self.get_text('/engineering')
        self.assertIn('/assets/images/engineering/mascot-thinking.png', page)
        self.assertNotIn('asset-runtime.js', page)

    def test_production_renders_dynamic_jinja_and_markdown_images(self):
        app.config['WIKI_ASSET_MODE'] = 'igem'
        page = self.get_text('/engineering')
        self.assertIn('wiki/10-18/engineering-mascot-thinking.avif', page)
        self.assertIn('wiki/10-18/engineering-deliver-figure-01.avif', page)
        self.assertNotIn('href="/assets/images/engineering/mascot-', page)
        self.assertLess(page.index('asset-runtime.js'), page.index('whitehole'))
        self.assertIn('src="asset-runtime.js"', page)

    def test_css_cursor_and_dbtl_backgrounds_use_cdn(self):
        app.config['WIKI_ASSET_MODE'] = 'igem'
        css = self.get_text('/static/engineering-workspace.css')
        self.assertIn('wiki/10-18/dbtl-design.avif', css)
        font = app.extensions['igem_assets'].get('/static/fonts/source-sans-3-variable.woff2', 'fonts/source-sans-3-variable.woff2')
        self.assertIn("url('" + font + "')", css)
        cursor = self.get_text('/static/cursor/orca-cursor.css')
        self.assertIn('https://static.igem.wiki/', cursor)
        self.assertIn('3 3, auto', cursor)

    def test_notebook_schema_is_preserved_and_hp_manifest_is_rewritten(self):
        app.config['WIKI_ASSET_MODE'] = 'igem'
        notebook = json.loads(self.get_text('/static/notebook/index.json'))
        for record in notebook['records']:
            for page in record['pages']:
                self.assertTrue(page['preview'].startswith('previews/'), page['preview'])
                self.assertIn('/static/notebook/' + page['preview'], app.extensions['igem_assets'])
        hp = json.loads(self.get_text('/static/human-practices/pdf-previews/manifest.json'))
        for document in hp.values():
            for page in document['pages']:
                self.assertTrue(page['file'].startswith('https://static.igem.wiki/'))

    def test_standalone_protocol_reader_gets_cdn_images(self):
        app.config['WIKI_ASSET_MODE'] = 'igem'
        page = self.get_text('/static/experiments/entries/M02/index.html')
        self.assertIn('experiment-m02-page-001.webp', page)
        self.assertNotIn('src="page-001.webp"', page)
        self.assertIn('src="../../../../asset-runtime.js"', page)


class ProductionAuditTest(unittest.TestCase):
    def test_audit_detects_css_fonts_and_nested_reader_images(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'nested').mkdir()
            (root / 'index.html').write_text('<link href="a.css"><iframe src="nested/index.html">')
            (root / 'a.css').write_text('@font-face {src:url(missing.woff2)}')
            (root / 'nested/index.html').write_text('<img src="missing.webp">')
            report = inspect_build(root, {})
            self.assertEqual(set(report['local_media']), {'missing.woff2', 'nested/missing.webp'})
            self.assertEqual(len(issues_for_report(report)), 4)

    def test_all_confirmed_urls_come_from_provided_upload_record(self):
        uploads = set(json.loads(Path('asset_uploads.json').read_text())['urls'])
        mapping = read_mapping('asset_mapping.csv')
        self.assertTrue(set(mapping.values()) <= uploads)
        with open('asset_mapping.csv') as stream:
            for row in csv.DictReader(stream):
                self.assertTrue(Path(row['local_path']).is_file())
