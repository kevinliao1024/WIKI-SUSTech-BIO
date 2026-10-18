"""Regenerate the media inventory from checked-in upload evidence.

No URL is synthesized. Ambiguous names stay unresolved. All tracked sources
are scanned, including inactive previews (source reference != live usage).
"""
import argparse
import csv
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

TEXT_EXTENSIONS = {'.html', '.jinja', '.jinja2', '.j2', '.md', '.css', '.js', '.mjs', '.py', '.json', '.svg'}
TOKEN = re.compile(r'''(?<![\w@%+./~:-])(?:https?://)?[\w@%+./~:-]{1,500}\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|ktx2?|hdr|exr|basis|mp4|webm|mp3|wav)(?:[?#][^\s"'<>)]*)?''', re.I)


def normal(value):
    return re.sub(r'[^a-z0-9]', '', Path(unquote(value)).stem.lower())


def inventory(root, uploads):
    paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
    media = {p for p in paths if Path(p).suffix.lower() in MEDIA_EXTENSIONS and (root / p).is_file()}
    references = defaultdict(set)
    candidates = defaultdict(set)
    external = defaultdict(set)
    by_name = defaultdict(list)
    for p in media:
        by_name[Path(p).name].append(p)
    for filename in paths:
        if filename == 'asset_uploads.json' or Path(filename).suffix not in TEXT_EXTENSIONS or not (root / filename).is_file():
            continue
        for number, line in enumerate((root / filename).read_text(errors='replace').splitlines(), 1):
            for match in TOKEN.finditer(line):
                value = match[0]
                location = f'{filename}:{number}'
                parsed = urlsplit(value)
                if parsed.scheme or parsed.netloc:
                    external[value].add(location)
                    continue
                token = unquote(parsed.path)
                options = {token.lstrip('/'), 'static/' + token, 'assets/' + token}
                relative = (root / filename).parent / token
                try:
                    options.add(relative.resolve().relative_to(root.resolve()).as_posix())
                except ValueError:
                    pass
                exact = options & media
                if exact:
                    for p in exact:
                        references[p].add(location)
                else:
                    suffixes = [p for p in by_name[Path(token).name] if p.endswith(token.lstrip('./'))]
                    for p in suffixes:
                        candidates[p].add(location)
    # These files are constructed at runtime rather than spelled out as URLs.
    wheel = root / 'wiki/components/dbtl_wheel.html'
    for mood in re.findall(r"\('[^']+', '([^']+)',", wheel.read_text()):
        references[f'assets/images/engineering/mascot-{mood}.png'].add('wiki/components/dbtl_wheel.html:66 (dynamic mood)')
    for p in media:
        if p.startswith('static/assets/software/rewire/') and p.endswith('/figure.svg'):
            references[p].add('wiki/pages/software.html:13 (Markdown figures metadata)')
        if p.startswith('static/human-practices/interviews/assets/avatar-'):
            references[p].add('static/human-practices/interviews/orca-interviews.js:8 (FILES/base)')
    return media, references, candidates, external


def build(root):
    evidence = json.loads((root / 'asset_uploads.json').read_text())
    urls = set(evidence['urls'])
    media, references, candidates, external = inventory(root, urls)
    by_name = defaultdict(set)
    for url in urls:
        by_name[normal(urlsplit(url).path)].add(url)
    by_hash = defaultdict(set)
    for item in evidence['content_hashes']:
        if item.get('sha256') and item['url'] in urls:
            by_hash[item['sha256']].add(item['url'])
    explicit = {x['local_path']: x for x in evidence['confirmed_mapping']}
    local_names = defaultdict(set)
    for p in media:
        local_names[normal(p)].add(p)
    rows = []
    used = set()
    for p in sorted(media):
        sha = hashlib.sha256((root / p).read_bytes()).hexdigest()
        choices = set()
        method = ''
        if p in explicit:
            record = explicit[p]
            if record['sha256'] == sha and record['url'] in urls:
                choices = {record['url']}
                method = record['evidence']
            else:
                method = 'source_changed_or_upload_record_missing'
        if not choices and by_hash[sha]:
            choices = by_hash[sha]
            method = 'verified_identical_sha256'
        if not choices and p not in explicit:
            if len(local_names[normal(p)]) == 1:
                choices = by_name[normal(p)]
                method = 'unique_normalized_filename_in_upload_record'
            else:
                method = 'non_unique_local_filename_requires_confirmation'
        # Multiple uploaded copies with identical bytes are interchangeable.
        if len(choices) > 1 and method == 'verified_identical_sha256':
            choices = {sorted(choices)[0]}
        status = 'matched' if len(choices) == 1 else ('ambiguous' if choices else 'unmatched')
        remote = next(iter(choices)) if status == 'matched' else ''
        used.update([remote] if remote else [])
        rows.append({
            'local_path': p, 'igem_url': remote, 'match_status': status,
            'match_method': method, 'references': '; '.join(sorted(references[p])),
            'possible_references': '; '.join(sorted(candidates[p] - references[p])),
            'usage': 'source_reference' if references[p] else ('candidate_reference' if candidates[p] else 'no_literal_reference'),
            'sha256': sha, 'candidate_urls': '; '.join(sorted(choices)) if status != 'matched' else '',
        })
    fields = list(rows[0])
    for name, values in [('asset_mapping.csv', rows), ('asset_unmatched.csv', [r for r in rows if r['match_status'] != 'matched'])]:
        with (root / name).open('w', encoding='utf-8', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=fields)
            writer.writeheader()
            writer.writerows(values)
    with (root / 'asset_external_references.csv').open('w', encoding='utf-8', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(['url', 'references', 'host_status'])
        for url, refs in sorted(external.items()):
            host = urlsplit(url).hostname
            writer.writerow([url, '; '.join(sorted(refs)), 'official' if host in {'static.igem.wiki', 'video.igem.org'} else 'review_external_reference'])
    with (root / 'asset_uploads_unmatched.csv').open('w', encoding='utf-8', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(['uploaded_url', 'status'])
        for url in sorted(urls - used):
            writer.writerow([url, 'no_confirmed_local_file'])
    return rows


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    rows = build(args.root)
    print(f'{len(rows)} local media files; {sum(r["match_status"] == "matched" for r in rows)} matched. See asset_unmatched.csv.')
