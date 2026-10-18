import re
import unittest
from app import app
from wiki_content import CONTENT_PAGES

class SonarContributionTest(unittest.TestCase):
    def setUp(self): self.client=app.test_client()
    def test_route_hub_and_case(self):
        self.assertIn('project-contribution-sonar',CONTENT_PAGES)
        for route in ['/project-contribution-sonar','/project-contribution-SONAR']:
            self.assertEqual(self.client.get(route).status_code,200)
        self.assertIn(b'id="sonar-sequence-playground"',self.client.get('/contribution').data)
    def test_fallbacks_and_anchors(self):
        html=self.client.get('/project-contribution-sonar').get_data(as_text=True)
        for anchor in ['intro','getting-started','step-1','oligo-design','reporter-construction','step-2','transfection-editing','flow-cytometry','data-analysis','going-further','adapting-sonar','resources','sonar-sequence-playground','sonar-reporter-explorer','sonar-flow-playground','sonar-layer-explorer','sonar-fit-guide']:
            self.assertEqual(len(re.findall('id="'+anchor+'"',html)),1)
        self.assertIn('Neither score is a directly measured RNA editing percentage',html)
        self.assertIn('ratio of corrected signal sums',html)
        # Public desktop packages are now available; downloads also work without JS.
        self.assertIn('id="sap-download"',html)
        for asset in ['SAP-1.4.0rc1-macos-arm64.dmg', 'SAP-1.4.0rc1-windows-x64-portable.zip']:
            self.assertIn('https://github.com/Hansen614/SONAR-Analysis-Program/releases/download/v1.4.0rc1/'+asset,html)
    def test_assets_scoped(self):
        self.assertIn(b'sonar-contribution/index.mjs',self.client.get('/project-contribution-sonar').data)
        self.assertNotIn(b'sonar-contribution/index.mjs',self.client.get('/description').data)
        self.assertEqual(self.client.get('/static/sonar-contribution/index.mjs').status_code,200)

    def test_approved_resources_and_hashes(self):
        from pathlib import Path
        import json, hashlib
        root=Path(__file__).resolve().parents[1]
        manifest=json.loads((root/'static/sonar-contribution/data/provenance.json').read_text())
        self.assertGreaterEqual(len(manifest),17)
        for item in manifest:
            file=root/item['file']
            self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),item['sha256'])
            self.assertEqual(self.client.get('/'+item['file']).status_code,200)
        shots=json.loads((root/'static/sonar-contribution/data/screenshots.json').read_text())
        self.assertEqual(len(shots),8)
        html=self.client.get('/project-contribution-sonar').get_data(as_text=True)
        self.assertNotIn('publication pending</span>',html)
        for key in ['RP01','RP02','C04','RP06']:
            self.assertIn('resources/'+key+'.pdf',html)
