import hashlib
import json
import unittest
from pathlib import Path

from app import app
from igem_assets import localize_text
from scripts.import_asset_uploads import compatible, normalized_stem, package_name


class UploadImportTest(unittest.TestCase):
    def test_flat_upload_renaming_preserves_unique_content_fingerprint(self):
        name = package_name('static/team/person_name.png', b'original')
        uploaded = name.replace('--', '-').replace('_', '-').replace('.png', '.avif')
        self.assertEqual(normalized_stem(name), normalized_stem(uploaded))
        self.assertNotEqual(normalized_stem(name), normalized_stem(package_name('static/team/person_name.png', b'changed')))
        self.assertTrue(compatible(name, uploaded))
        self.assertTrue(compatible('font.otf', 'font.ttf'))
        self.assertFalse(compatible('font.otf', 'image.avif'))

    def test_new_evidence_matches_current_source_bytes_and_provided_urls(self):
        evidence = json.loads(Path('asset_uploads.json').read_text())
        count = 0
        for record in evidence['confirmed_mapping']:
            if record['evidence'] != 'user_upload_list_flat_filename_and_git_blob_fingerprint':
                continue
            count += 1
            self.assertEqual(hashlib.sha256(Path(record['local_path']).read_bytes()).hexdigest(), record['sha256'])
            self.assertIn(record['url'], evidence['urls'])
        self.assertGreater(count, 100)


class DualEnvironmentTest(unittest.TestCase):
    def setUp(self):
        self.mode = app.config['WIKI_ASSET_MODE']
        self.client = app.test_client()

    def tearDown(self):
        app.config['WIKI_ASSET_MODE'] = self.mode

    def test_local_404_uses_original_png_including_error_responses(self):
        app.config['WIKI_ASSET_MODE'] = 'local'
        for route, status in [('/404.html', 200), ('/missing-dual-env-page', 404)]:
            with self.client.get(route) as response:
                self.assertEqual(response.status_code, status)
                text = response.get_data(as_text=True)
                self.assertIn('/static/not-found/assets/background.png', text)
                self.assertNotIn('wiki/not-found/not-found-background.avif', text)
                self.assertNotIn('asset-runtime.js', text)

    def test_production_404_keeps_official_images_and_resolver(self):
        app.config['WIKI_ASSET_MODE'] = 'igem'
        with self.client.get('/missing-dual-env-page') as response:
            self.assertEqual(response.status_code, 404)
            text = response.get_data(as_text=True)
            self.assertIn('https://static.igem.wiki/teams/6085/wiki/not-found/not-found-background.avif', text)
            self.assertIn('asset-runtime.js', text)

    def test_corrected_font_mapping_and_new_portrait(self):
        mapping = app.extensions['igem_assets']
        font = mapping['/static/fonts/team/Futura-Bold.otf']
        self.assertTrue(font.endswith('.ttf'), font)
        self.assertIn('/10-18-10-44/', mapping['/static/assets/team/portraits/benxiang_xiao.avif'])

    def test_local_reverse_mapping_preserves_suffix_and_mount_point(self):
        remote = 'https://static.igem.wiki/teams/6085/wiki/test.avif'
        result = localize_text(f'<img src="{remote}?v=1#part">', {'/assets/test.png': remote}, '/preview')
        self.assertEqual(result, '<img src="/preview/assets/test.png?v=1#part">')
        unknown = 'https://static.igem.wiki/teams/6085/wiki/unknown.png'
        self.assertEqual(localize_text(unknown, {}), unknown)

    def test_archival_data_bytes_are_unchanged_in_local_mode(self):
        app.config['WIKI_ASSET_MODE'] = 'local'
        for path in ['static/notebook/index.json', 'static/sap-demo/data/catalog.json']:
            if not Path(path).is_file():
                continue
            with self.client.get('/' + path) as response:
                self.assertEqual(response.data, Path(path).read_bytes())
