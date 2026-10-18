"""Follow frozen page dependencies and report media still served locally.

Known dynamic indexes are explicit, so inactive source previews do not become
deployment blockers merely because Frozen-Flask copied their files.
"""
import json
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from igem_assets import MEDIA_EXTENSIONS, CSS_URL

CODE_EXTENSIONS = {'.css', '.js', '.mjs', '.json', '.html', '.svg'}
QUOTED = re.compile(r'''["'`]([^"'`\s<>]{1,500})["'`]''')
DYNAMIC_DEPENDENCIES = {
    'static/notebook/notebook.mjs': ['static/notebook/index.json'],
    'static/human-practices/pdf-panels.js': ['static/human-practices/pdf-previews/manifest.json'],
    'static/sonar-contribution/index.mjs': ['static/sonar-contribution/data/screenshots.json'],
    'static/human-practices/interviews/orca-interviews.js': [
        'static/human-practices/interviews/assets/' + name for name in
        ['interview-li-original.png', 'avatar-fu-jiawen.png', 'avatar-yali-teacher.png', 'avatar-wang-sijie.png']
    ],
}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if not value:
                continue
            if key == 'srcset' and not value.startswith('data:'):
                self.urls.extend(item.strip().split()[0] for item in value.split(',') if item.strip())
            elif tag == 'a' and key == 'href':
                # Bibliography/source/download links are not loaded media.
                if not urlsplit(value).netloc and Path(urlsplit(value).path).suffix in MEDIA_EXTENSIONS:
                    self.urls.append(value)
            elif key in {'src', 'href', 'xlink:href', 'poster'} or key.startswith('data-'):
                self.urls.append(value)


def json_strings(value, key=None):
    if isinstance(value, str):
        if key in {'file', 'preview', 'src', 'uri', 'texture'}:
            yield value
    elif isinstance(value, list):
        for item in value:
            yield from json_strings(item, key)
    elif isinstance(value, dict):
        for child_key, item in value.items():
            yield from json_strings(item, child_key)


def inspect_build(root, mapping):
    root = root.resolve()
    queue = [p.name for p in root.iterdir() if p.is_file() and (not p.suffix or p.suffix == '.html')]
    seen = set()
    local = defaultdict(set)
    remote = defaultdict(set)
    missing = defaultdict(set)
    dynamic = defaultdict(set)

    def visit(value, source, base=None, runtime=False):
        parsed = urlsplit(value)
        if parsed.scheme in {'data', 'blob', 'mailto', 'javascript'} or not parsed.path:
            return
        suffix = Path(parsed.path).suffix.lower()
        if suffix not in MEDIA_EXTENSIONS | CODE_EXTENSIONS:
            return
        if parsed.netloc or parsed.scheme:
            if suffix in MEDIA_EXTENSIONS:
                remote[value].add(source)
            return
        target = unquote(urlsplit(urljoin('/' + (base or source), value)).path).lstrip('/')
        if runtime and '/' + target in mapping:
            remote[mapping['/' + target]].add(source + ' (runtime resolver)')
            dynamic[target].add(source)
            return
        if suffix in MEDIA_EXTENSIONS:
            local[target].add(source)
        resolved = (root / target).resolve()
        if not resolved.is_relative_to(root) or not resolved.is_file():
            missing[target].add(source)
        elif suffix in CODE_EXTENSIONS and target != 'asset-runtime.js':
            queue.append(target)

    while queue:
        filename = queue.pop()
        if filename in seen:
            continue
        seen.add(filename)
        path = root / filename
        text = path.read_text(encoding='utf-8', errors='replace')
        suffix = path.suffix
        if not suffix or suffix in {'.html', '.svg'}:
            parser = References()
            parser.feed(text)
            for value in parser.urls:
                visit(value, filename)
            for match in CSS_URL.finditer(text):
                visit(match[2], filename)
        elif suffix == '.css':
            for match in CSS_URL.finditer(text):
                visit(match[2], filename)
            for value in re.findall(r'''@import\s+["']([^"']+)["']''', text):
                visit(value, filename)
        elif suffix == '.json':
            if 'provenance' in filename:
                continue
            base = filename.replace('/data/screenshots.json', '/index.mjs') if filename.endswith('/sonar-contribution/data/screenshots.json') else filename
            for value in json_strings(json.loads(text)):
                visit(value, filename, base, runtime=filename == 'static/notebook/index.json')
        else:
            # Complete literal URLs/imports; dynamic expressions are covered by
            # the explicit indexes above and by caller-side resolver tests.
            for match in QUOTED.finditer(text):
                value = match[1]
                if '${' in value or value.startswith('#'):
                    continue
                target = root / unquote(urlsplit(urljoin('/' + filename, value)).path).lstrip('/')
                if target.is_file() or urlsplit(value).netloc:
                    visit(value, filename, runtime=True)
        for dependency in DYNAMIC_DEPENDENCIES.get(filename, []):
            visit('/' + dependency, filename, runtime=True)
    return {
        'visited_documents': sorted(seen),
        'local_media': {k: sorted(v) for k, v in sorted(local.items())},
        'remote_media': {k: sorted(v) for k, v in sorted(remote.items())},
        'missing_files': {k: sorted(v) for k, v in sorted(missing.items())},
        'runtime_resolved': {k: sorted(v) for k, v in sorted(dynamic.items())},
    }


def issues_for_report(report):
    issues = [f'production media still local: {p} ({refs[0]})' for p, refs in report['local_media'].items()]
    issues += [f'missing dependency: {p} ({refs[0]})' for p, refs in report['missing_files'].items()]
    for url, refs in report['remote_media'].items():
        if urlsplit(url).hostname not in {'static.igem.wiki', 'video.igem.org'}:
            issues.append(f'non-iGEM media: {url} ({refs[0]})')
    return issues
