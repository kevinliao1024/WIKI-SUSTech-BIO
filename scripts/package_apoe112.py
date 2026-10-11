"""Package the offline render as two identically composed, lightweight plates."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('render_dir', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / 'assets/figures/apoe112'
metadata = json.loads((args.render_dir/'render-metadata.json').read_text())
entries = []
for pdb, residue, resolution in [('1B68','ARG',2.00), ('1LPE','CYS',2.25)]:
    stem = pdb.lower()
    plate = Image.new('RGBA', (1200,900), (255,254,252,255))
    for part, size, position in [('domain',(600,800),(0,25)), ('sidechain',(600,450),(600,200))]:
        image = Image.open(args.render_dir/f'{stem}-{part}.png')
        image.save(output/f'{stem}-{part}.webp', quality=94, method=6)
        image = image.resize(size, Image.Resampling.LANCZOS)
        plate.alpha_composite(image, position)
    plate.convert('RGB').save(output/f'{stem}-plate.webp', quality=94, method=6)
    plate.convert('RGB').save(output/f'{stem}-plate.png')
    source = output/f'source/{pdb}.pdb'
    entries.append({'pdb':pdb, 'source':f'https://files.rcsb.org/download/{pdb}.pdb', 'entry':f'https://www.rcsb.org/structure/{pdb}', 'resolution_angstrom':resolution, 'method':'X-ray diffraction', 'chain':'A', 'residue112':residue, 'residue158':'ARG', 'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
metadata.update({'retrieved':'2026-10-11', 'renderer':'Blender 5.2.1 LTS, Cycles, orthographic camera', 'composition':'Domain 600×800 at (0,25), sidechain 600×450 at (600,200); identical for both entries', 'entries':entries, 'evidence_status':'Public reference structures, not team editing measurements', 'hosting_status':'Local review assets; upload production images to static.igem.wiki before public deployment'})
(output/'provenance.json').write_text(json.dumps(metadata, indent=2, ensure_ascii=False)+'\n')
print(json.dumps({p.name:p.stat().st_size for p in output.glob('*.webp')},indent=2))
