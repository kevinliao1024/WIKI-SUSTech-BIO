"""Import official upload links using the flat package's Git content fingerprint.

Only exact, unique package stems are accepted. Image conversion and corrected
font extensions are allowed; unrelated documents/scripts remain upload evidence,
not media mappings. Existing confirmed mappings are preserved.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from igem_assets import MEDIA_EXTENSIONS

IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico'}
FONT_EXTENSIONS = {'.ttf', '.otf', '.woff', '.woff2'}


def normalized_stem(value):
    return re.sub(r'[^a-z0-9]+', '-', Path(unquote(value)).stem.lower()).strip('-')


def package_name(path, data):
    blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    slug = re.sub(r'[^a-zA-Z0-9._-]+', '-', path.rsplit('.', 1)[0].replace('/', '--')).strip('-').lower()
    return slug[:175] + '--' + blob[:10] + Path(path).suffix.lower()


def compatible(local, remote):
    a, b = Path(local).suffix.lower(), Path(remote).suffix.lower()
    return a == b or {a, b} <= IMAGE_EXTENSIONS or {a, b} <= FONT_EXTENSIONS


def import_uploads(root, text):
    urls = set(re.findall(r'https://static\.igem\.wiki/[^\s<>"\]]+', text))
    if not urls:
        raise ValueError('No official upload URLs found')
    for url in urls:
        parsed = urlsplit(url)
        if parsed.netloc != 'static.igem.wiki' or not parsed.path.startswith('/teams/6085/') or parsed.query or parsed.fragment:
            raise ValueError(f'Unexpected upload URL: {url}')
    by_stem = defaultdict(list)
    for url in sorted(urls):
        by_stem[normalized_stem(urlsplit(url).path)].append(url)
    evidence_path = root / 'asset_uploads.json'
    evidence = json.loads(evidence_path.read_text())
    records = {r['local_path']: r for r in evidence['confirmed_mapping']}
    paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
    added = []
    for path in sorted(paths):
        if not path.startswith(('assets/', 'static/')) or Path(path).suffix.lower() not in MEDIA_EXTENSIONS:
            continue
        data = (root / path).read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        current = records.get(path)
        if current and current['sha256'] == sha and current['url'] in urls:
            continue
        candidates = [url for url in by_stem[normalized_stem(package_name(path, data))]
                      if compatible(path, urlsplit(url).path)]
        if len(candidates) > 1:
            raise ValueError(f'Ambiguous upload for {path}: {candidates}')
        if candidates:
            records[path] = {'local_path': path, 'url': candidates[0], 'sha256': sha,
                             'evidence': 'user_upload_list_flat_filename_and_git_blob_fingerprint'}
            added.append(path)
    evidence['urls'] = sorted(set(evidence['urls']) | urls)
    evidence['confirmed_mapping'] = list(records.values())
    evidence['source'] = ('User-provided official upload lists; flat-package additions matched by '
                          'normalized filename and source Git blob fingerprint. '
                          'This import does not claim remote byte identity after image conversion.')
    evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n')
    return added


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('upload_list', type=Path)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    added = import_uploads(args.root, args.upload_list.read_text())
    print(f'Imported {len(added)} confirmed local media mappings; run scripts/build_asset_mapping.py next.')
