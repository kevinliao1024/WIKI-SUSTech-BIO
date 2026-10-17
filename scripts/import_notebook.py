#!/usr/bin/env python3
"""Import the finalized ORCA Notebook without rewriting its PDF evidence.

Usage: python scripts/import_notebook.py /path/to/Notebook
Requires PyMuPDF and Pillow for deterministic page previews (authoring only).
"""
import argparse
import hashlib
import html
import json
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    import fitz
    from PIL import Image
    source = args.source.resolve()
    root = Path(__file__).resolve().parents[1]
    dest = root / 'static/notebook'
    finalized = json.loads((source / 'FINALIZATION.json').read_text())
    assert finalized['status'] == 'final'
    records = [r for f in sorted(source.glob('20*/records.json'))
               for r in json.loads(f.read_text())['records']]
    by_id = {r['id']: r for r in records}
    assert len(by_id) == len(records) == len(finalized['entries'])
    track_specs = [
        ('Fundmental', 'Fundmental', 'Core editor & foundational assays', '#6466ab', 'edit'),
        ('PUF', 'PUF', 'PUF mutant construction & screening', '#41469a', 'edit'),
        ('Apobec', 'Apobec', 'APOBEC mutant construction & screening', '#96705d', 'edit'),
        ('Gfa', 'Gfa', 'GFAP promoter experiments', '#387e85', 'control'),
        ('MRE', 'MRE', 'MicroRNA response elements', '#7161a1', 'control'),
        ('ASO', 'ASO', 'Antisense oligonucleotide experiments', '#a85374', 'control'),
        ('AAV', 'AAV', 'AAV construction & delivery', '#b36c50', 'deliver'),
        ('Reporter', 'Reporter', 'Reporter construction & measurement', '#4b789b', 'measure'),
        ('FV', 'FV', 'Functional validation experiments', '#6b814d', 'validation'),
    ]
    tracks = [dict(id=b.lower(), label=label, archiveBranch=b, description=desc,
                   color=color, category=category, engineeringLinks=[])
              for b, label, desc, color, category in track_specs]
    index = dict(schemaVersion=1, title='ORCA research notebook',
                 finalizedOn=finalized['finalized_on'],
                 datePolicy='All finalized record dates confirmed by the project owner for this timeline on 2026-10-17.',
                 tracks=tracks, records=[], milestones=[])
    dest.mkdir(parents=True, exist_ok=True)
    for order, entry in enumerate(finalized['entries']):
        r = by_id[entry['id']]
        relative = Path(r['branch']) / r['filename']
        assert relative.as_posix() == entry['file']
        assert entry['status'] == 'final'  # Finalization covers legacy daily records without status.
        pdf = source / relative
        digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
        assert digest == entry['sha256'], f'PDF changed since finalization: {relative}'
        doc = fitz.open(pdf)
        assert len(doc) == entry['pages']
        assert r['date'] in '\n'.join(page.get_text() for page in doc)
        out = dest / 'pdfs' / relative
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(pdf, out)
        pages = []
        for i, page in enumerate(doc):
            preview = Path('previews') / r['branch'] / f'{pdf.stem}-p{i+1}.webp'
            target = dest / preview
            target.parent.mkdir(parents=True, exist_ok=True)
            pix = page.get_pixmap(matrix=fitz.Matrix(1600 / page.rect.width, 1600 / page.rect.width), alpha=False)
            Image.frombytes('RGB', [pix.width, pix.height], pix.samples).save(target, 'WEBP', lossless=True)
            pages.append(dict(number=i+1, preview=preview.as_posix(), width=pix.width, height=pix.height,
                              sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
        index['records'].append(dict(id=r['id'], trackId=r['branch'].lower(), date=r['date'],
            title=r['experiment'], experimenter=r['experimenter'], order=order,
            pdf='pdfs/' + relative.as_posix(), originalFilename=r['filename'],
            pageCount=len(doc), pages=pages, sha256=digest,
            sourceNote='Finalized Notebook PDF; title and calendar date matched to the approved daily index.'))
    index['records'].sort(key=lambda r: (r['date'], r['order']))
    (dest / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    rows = ''.join(f'<tr><td>{r["date"]}</td><td>{html.escape(next(t["label"] for t in tracks if t["id"] == r["trackId"]))}</td><td><a href="{html.escape(r["pdf"])}">{html.escape(r["title"])}</a></td><td>{html.escape(r["experimenter"])}</td></tr>' for r in index['records'])
    (dest / 'catalog.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORCA Notebook source index</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:20px;color:#2e3065}table{border-collapse:collapse;width:100%}td,th{padding:12px;border-bottom:1px solid #d6d8ff;text-align:left}a{color:#3d409b}td:first-child{white-space:nowrap}.table{overflow:auto}</style><h1>ORCA Notebook source index</h1><p>Finalized experiment records and their original PDFs.</p><p><a href="../../notebook">Return to the interactive Notebook</a></p><div class="table"><table><thead><tr><th>Date</th><th>Track</th><th>Experiment / original PDF</th><th>Experimenter</th></tr></thead><tbody>' + rows + '</tbody></table></div></html>')
    print(f'Imported {len(index["records"])} PDFs / {sum(r["pageCount"] for r in index["records"])} pages; original hashes preserved.')

if __name__ == '__main__':
    main()
