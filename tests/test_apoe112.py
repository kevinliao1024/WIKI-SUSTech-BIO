"""Scientific source and preview isolation checks for the structure plates."""
import hashlib
import json
import unittest
from pathlib import Path

from app import app


class Apoe112PreviewTest(unittest.TestCase):
    def test_structure_assets_are_only_loaded_on_preview(self):
        with app.test_client() as client:
            home = client.get('/').get_data(as_text=True)
            preview = client.get('/next').get_data(as_text=True)
            self.assertNotIn('data-apoe112', home)
            self.assertNotIn('onetake/apoe112', home)
            self.assertNotIn('data-structure-preview', home)
            self.assertIn('data-structure-preview', preview)
            self.assertIn('data-apoe112', preview)
            self.assertIn('data-ot-story', preview)
            self.assertIn('ot-index-title', preview)
            for source in ['1b68-plate.webp', '1lpe-plate.webp']:
                response = client.get('/assets/figures/apoe112/'+source)
                self.assertEqual(response.status_code, 200)
                response.close()

    def test_sources_and_actual_residues_match_labels(self):
        folder = Path('assets/figures/apoe112')
        metadata = json.loads((folder/'provenance.json').read_text())
        for entry in metadata['entries']:
            source = (folder/f"source/{entry['pdb']}.pdb").read_bytes()
            self.assertEqual(hashlib.sha256(source).hexdigest(), entry['sha256'])
            lines = source.decode().splitlines()
            for number, identity in [(112,entry['residue112']),(158,'ARG')]:
                target = [line for line in lines if line.startswith('ATOM') and line[21] == 'A' and int(line[22:26]) == number]
                self.assertTrue(target)
                self.assertEqual({line[17:20] for line in target}, {identity})
            resolution = next(line for line in lines if line.startswith('REMARK   2 RESOLUTION.'))
            self.assertIn(f"{entry['resolution_angstrom']:.2f}", resolution)
        self.assertGreater(metadata['alignment']['count'], 100)
        self.assertLess(metadata['alignment']['rmsd_angstrom'], .5)


if __name__ == '__main__':
    unittest.main()
