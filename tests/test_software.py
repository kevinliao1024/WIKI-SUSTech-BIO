"""Software delivery contracts: grouping, downloads, and two-section scope."""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
import zipfile
from app import app


class SoftwareParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.modules = []
        self.figures = []
        self.links = []
        self.images = []
        self.figure_numbers = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'section' and 'data-model-module' in a:
            self.modules.append(a.get('id'))
        if tag == 'figure' and 'data-panel-count' in a:
            self.figures.append(int(a['data-panel-count']))
            self.figure_numbers.append(int(a['data-figure-number']))
        if tag == 'a':
            self.links.append(a)
        if tag == 'img':
            self.images.append(a)


class SoftwareDeliveryTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        response = self.client.get('/software')
        self.assertEqual(response.status_code, 200)
        self.html = response.get_data(as_text=True)
        self.page = SoftwareParser()
        self.page.feed(self.html)

    def test_two_requested_sections_replace_old_page(self):
        self.assertEqual(self.page.modules, ['rewire', 'workbench'])
        for old in ['id="software-tools"', 'id="handoff"', 'id="reproduce"', 'id="guardrails"']:
            self.assertNotIn(old, self.html)
        self.assertIn('https://github.com/pdx12320/igem_software', self.html)
        self.assertIn('unscored design candidates', self.html)
        self.assertRegex(self.html, r'<h2[^>]*>Whole-body Delivery Model</h2>')
        self.assertIn('<h2>PUF Website</h2>', self.html)
        self.assertNotRegex(self.html, r'[\u4e00-\u9fff]')
        chapter_numbers = re.findall(r'<h3 id="[^"]+" data-model-chapter><span class="chapter-number">([\d.]+)</span>', self.html)
        expected_numbers = [f'{section}.{chapter}' for section in (1, 2) for chapter in range(1, 7)]
        self.assertEqual(chapter_numbers, expected_numbers)
        sidebar_numbers = re.findall(r'<span class="module-chapter-number">([\d.]+)</span>', self.html)
        self.assertEqual(sidebar_numbers, expected_numbers)

    def test_each_figure_has_no_more_than_four_panels(self):
        self.assertGreater(len(self.page.figures), 20)
        self.assertTrue(all(1 <= count <= 4 for count in self.page.figures))
        images = [a for a in self.page.images if '/assets/software/rewire/' in a.get('src', '')]
        # The two interactive figures use native SVG and Canvas, respectively.
        self.assertEqual(len(images) + 2, len(self.page.figures))
        for a in images:
            self.assertTrue(a.get('alt'))
            response = self.client.get(a['src'])
            self.assertEqual(response.status_code, 200, a['src'])
            svg = ET.fromstring(response.data)
            self.assertEqual(list(svg.iter('{http://www.w3.org/2000/svg}image')), [])
            response.close()

    def test_downloads_are_archives_with_matching_checksums(self):
        base = Path('static/downloads')
        rows = (base / 'rewire-downloads.sha256').read_text().splitlines()
        self.assertEqual(len(rows), 1)
        for row in rows:
            checksum, name = row.split()
            path = base / name
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), checksum)
            with zipfile.ZipFile(path) as archive:
                self.assertIsNone(archive.testzip())
                self.assertTrue(any(p.endswith('.py') for p in archive.namelist()))
                self.assertTrue(any('README' in p for p in archive.namelist()))
            response = self.client.get('/static/downloads/' + name)
            self.assertEqual(response.status_code, 200)
            response.close()

    def test_unresolved_schematic_and_mega_atlas_are_not_embedded(self):
        for image in self.page.images:
            self.assertNotIn('apoe_editing_logic', image.get('src', ''))
            self.assertNotIn('dbtl_model_loop', image.get('src', ''))
            self.assertNotIn('all_grouped', image.get('src', ''))
        for link in self.page.links:
            if link.get('target') == '_blank':
                self.assertIn('noopener', link.get('rel', ''))

    def test_numbered_figures_and_descriptive_names(self):
        self.assertEqual(self.page.figure_numbers, list(range(1, 41)))
        self.assertLess(self.html.index('id="software-figure-1"'), self.html.index('id="rewire-purpose"'))
        first_figure = self.html.split('id="software-figure-1"', 1)[1].split('</figure>', 1)[0]
        self.assertIn('14_full_model_workflow/figure.svg', first_figure)
        self.assertIn('Figure 1. Delivery-to-editing model.', first_figure)
        self.assertIn('Figure 2. Whole-body delivery.', self.html)
        for number in self.page.figure_numbers:
            self.assertIn(f'<strong>Figure {number}.', self.html)
        self.assertIn("Module 2's assay-informed PUF specificity ranking", self.html)
        self.assertIn("Module 4's LAMAR-based RNA-site prioritization", self.html)
        self.assertNotIn('DBTL', self.html.upper())

    def test_references_and_code_last_without_body_hyperlinks(self):
        sections, start, depth = [], None, 0
        for tag in re.finditer(r'<(/?)section\b[^>]*>', self.html):
            if start is None:
                if not tag[1] and 'data-model-module' in tag[0]:
                    start, depth = tag.end(), 1
            else:
                depth += -1 if tag[1] else 1
                if depth == 0:
                    sections.append(self.html[start:tag.start()])
                    start = None
        self.assertEqual(len(sections), 2)
        for section in sections:
            headings = re.findall(r'<h3 id="([^"]+)"', section)
            self.assertTrue(headings[-1].endswith('-reuse'))
            self.assertIn('class="software-references"', section)
            self.assertIn('doi:', section)
            parser = SoftwareParser()
            parser.feed(section)
            self.assertTrue(all('download' in link for link in parser.links))

    def test_saved_spatial_data_has_all_doses_frames_and_cells(self):
        source = Path('static/assets/software/brain-delivery/brain-delivery-spatial.json')
        data = json.loads(source.read_text())
        self.assertEqual(data['times_h'], list(range(0, 73, 2)))
        self.assertEqual([d['dose'] for d in data['doses']], [0.3, 1.0, 3.0])
        self.assertEqual(len(data['cells']['positions_um']), 1480)
        self.assertEqual(len(data['field_positions_um']), 288)
        for dose in data['doses']:
            for key, size in [('field_values', 288), ('editing_fraction', 1480)]:
                self.assertEqual(len(dose[key]), 37)
                self.assertTrue(all(len(frame) == size for frame in dose[key]))
        self.assertFalse(data['provenance']['model_rerun'])
        self.assertIn('data-spatial-viewer', self.html)
        self.assertIn('data-delivery-body', self.html)

    def test_videos_preserve_recorded_assets_and_support_range_requests(self):
        for folder in ('puf-tutorial', 'demo'):
            with self.subTest(video=folder):
                base = Path('static/assets/software') / folder
                record = json.loads((base / 'provenance.json').read_text())
                video = base / record['asset_filename']
                self.assertEqual(hashlib.sha256(video.read_bytes()).hexdigest(), record['sha256'])
                self.assertIn('/' + video.as_posix(), self.html)
                response = self.client.get('/' + video.as_posix(), headers={'Range': 'bytes=0-1023'})
                self.assertEqual(response.status_code, 206)
                self.assertEqual(len(response.data), 1024)
                response.close()
        self.assertEqual(self.html.count('controls playsinline preload="metadata"'), 2)
        self.assertLess(self.html.index('id="workbench-demo"'), self.html.index('id="workbench-tutorial"'))
        self.assertNotIn('autoplay', self.html)
