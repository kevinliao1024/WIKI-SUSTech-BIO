"""Integrity and deployment checks for the shipped primary Notebook sources."""
import hashlib
import json
from pathlib import Path
import unittest
from app import app
from wiki_content import CONTENT_PAGES, NAVIGATION

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'static/notebook'

class NotebookTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index=json.loads((BASE/'index.json').read_text())

    def test_pdf_and_preview_bytes_match_the_source_index(self):
        records=self.index['records']
        self.assertEqual(len(records),168)
        self.assertEqual(sum(r['pageCount'] for r in records),171)
        self.assertEqual(len({r['id'] for r in records}),len(records))
        fundmental=[r for r in records if r['trackId']=='fundmental']
        self.assertEqual(len(fundmental),15)
        self.assertEqual(max(r['date'] for r in fundmental),'2026-07-31')
        self.assertEqual({p.relative_to(BASE).as_posix() for p in (BASE/'pdfs').rglob('*.pdf')},{r['pdf'] for r in records})
        self.assertEqual({p.relative_to(BASE).as_posix() for p in (BASE/'previews').rglob('*.webp')},{p['preview'] for r in records for p in r['pages']})
        for r in records:
            with self.subTest(record=r['id']):
                data=(BASE/r['pdf']).read_bytes()
                self.assertTrue(data.startswith(b'%PDF-'))
                self.assertEqual(hashlib.sha256(data).hexdigest(),r['sha256'])
                self.assertEqual([p['number'] for p in r['pages']],list(range(1,r['pageCount']+1)))
                for p in r['pages']:
                    data=(BASE/p['preview']).read_bytes()
                    self.assertEqual(data[8:12],b'WEBP')
                    self.assertEqual(hashlib.sha256(data).hexdigest(),p['sha256'])

    def test_notebook_is_a_wetlab_custom_page_with_source_fallback(self):
        self.assertEqual(CONTENT_PAGES['notebook'].template,'pages/notebook.html')
        wet=next(g for g in NAVIGATION if g['label']=='Wet Lab')
        self.assertIn(('notebook','Notebook'),wet['items'])
        with app.test_client() as client:
            page=client.get('/notebook').get_data(as_text=True)
            self.assertIn('data-notebook',page)
            self.assertIn('notebook/catalog.html',page)
            self.assertIn('<noscript>',page)
            self.assertNotIn('Content pending team review',page)
            self.assertNotIn('<iframe',page)
            self.assertIn('creativecommons.org/licenses/by/4.0',page)
            self.assertEqual(client.get('/static/notebook/index.json').status_code,200)
            for r in self.index['records']:
                self.assertEqual(client.get('/static/notebook/'+r['pdf']).status_code,200)

    def test_public_index_has_no_private_paths_or_invented_engineering_targets(self):
        text=(BASE/'index.json').read_text()
        for private in ['/Users/','_work/','confirmation_history','date_is_estimated']:
            self.assertNotIn(private,text)
        for t in self.index['tracks']:
            for link in t['engineeringLinks']:
                self.assertIn(link['route'].split('#')[0].lstrip('/'),CONTENT_PAGES)
        self.assertEqual(self.index['milestones'],[])
