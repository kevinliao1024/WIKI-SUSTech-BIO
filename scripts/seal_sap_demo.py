"""Refresh the embedded SAP asset manifest after an intentional source edit."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'static/sap-demo'

if __name__ == '__main__':
    files = {
        p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted(ROOT.rglob('*'))
        if p.is_file() and p.name != 'site-integrity.json'
    }
    (ROOT / 'site-integrity.json').write_text(json.dumps({'files': files}, indent=2) + '\n')
    print(f'Sealed {len(files)} embedded SAP files.')
