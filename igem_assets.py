"""Explicit, allow-listed media URLs; local development stays local.

Only CSV rows marked matched are used. Unknown assets are never assigned a
guessed URL: they remain local and the production audit reports them.
"""
import csv
import json
import os
import posixpath
import re
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit

MEDIA_EXTENSIONS = frozenset({
    '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.otf', '.eot', '.ktx', '.ktx2', '.hdr',
    '.exr', '.basis', '.mp4', '.webm', '.mp3', '.wav',
})
CSS_URL = re.compile(r'''url\(\s*(["']?)([^\s)'"<>]+)\1\s*\)''', re.I)
HTML_URL = re.compile(
    r'''(?P<prefix>\b(?:src|href|xlink:href|poster|data-src|data-image|data-texture)\s*=\s*)(?P<q>["'])(?P<url>[^"']*)(?P=q)''', re.I)
SRCSET = re.compile(r'''(\bsrcset\s*=\s*)(["'])(.*?)\2''', re.I)


def read_mapping(path):
    mapping = {}
    with Path(path).open(encoding='utf-8-sig', newline='') as stream:
        for row in csv.DictReader(stream):
            if row['match_status'] != 'matched':
                continue
            local, remote = row['local_path'], row['igem_url']
            parsed = urlsplit(remote)
            if parsed.scheme != 'https' or parsed.netloc != 'static.igem.wiki':
                raise ValueError(f'Not an official upload URL: {remote}')
            if not local.startswith(('assets/', 'static/')) or '..' in local.split('/'):
                raise ValueError(f'Invalid local media path: {local}')
            key = '/' + local
            if key in mapping and mapping[key] != remote:
                raise ValueError(f'Conflicting mapping: {local}')
            mapping[key] = remote
    return mapping


def resolve_url(value, base, mapping):
    """Resolve local URLs relative to the document, preserving query/fragment."""
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return value
    local = unquote(urlsplit(urljoin(base, value)).path)
    remote = mapping.get(posixpath.normpath(local))
    if not remote:
        return value
    target = urlsplit(remote)
    query = '&'.join(filter(None, (target.query, parsed.query)))
    return urlunsplit((target.scheme, target.netloc, target.path, query, parsed.fragment))


def rewrite_text(text, base, kind, mapping):
    resolve = lambda value: resolve_url(value, base, mapping)
    if kind == 'json':
        # This gallery resolves file values against the consuming module.
        if base.endswith('/sonar-contribution/data/screenshots.json'):
            base = base.replace('/data/screenshots.json', '/index.mjs')
        def walk(value):
            if isinstance(value, str):
                return resolve_url(value, base, mapping)
            if isinstance(value, list):
                return [walk(item) for item in value]
            if isinstance(value, dict):
                return {key: walk(item) for key, item in value.items()}
            return value
        return json.dumps(walk(json.loads(text)), ensure_ascii=False)
    if kind in {'html', 'svg'}:
        text = HTML_URL.sub(lambda m: m['prefix'] + m['q'] + resolve(m['url']) + m['q'], text)
        def srcset(match):
            if 'data:' in match[3]:
                return match[0]
            candidates = []
            for item in match[3].split(','):
                fields = item.split()
                if fields:
                    fields[0] = resolve(fields[0])
                candidates.append(' '.join(fields))
            return match[1] + match[2] + ', '.join(candidates) + match[2]
        text = SRCSET.sub(srcset, text)
    return CSS_URL.sub(lambda m: 'url(' + m[1] + resolve(m[2]) + m[1] + ')', text)


def runtime_script(mapping):
    # An explicit resolver, not a monkey-patch of Image/fetch/WebGL/browser APIs.
    return '''(() => {
  const mapping = MAPPING;
  const root = new URL('.', document.currentScript.src);
  globalThis.wikiAssetURL = (value, base = document.baseURI) => {
    const resolved = new URL(value, base);
    if (resolved.origin !== root.origin || !resolved.pathname.startsWith(root.pathname)) return resolved.href;
    const key = '/' + decodeURIComponent(resolved.pathname.slice(root.pathname.length));
    const target = mapping[key];
    if (!target) return resolved.href;
    const remote = new URL(target);
    if (resolved.search) remote.search += (remote.search ? '&' : '?') + resolved.search.slice(1);
    remote.hash = resolved.hash;
    return remote.href;
  };
})();'''.replace('MAPPING', json.dumps(mapping, ensure_ascii=True).replace('</', '<\\/'))


def install(app):
    from flask import Response, request, url_for

    mode = os.environ.get('WIKI_ASSET_MODE', 'local')
    if mode not in {'local', 'igem'}:
        raise ValueError('WIKI_ASSET_MODE must be local or igem')
    app.config['WIKI_ASSET_MODE'] = mode
    mapping = read_mapping(Path(app.root_path) / 'asset_mapping.csv')
    app.extensions['igem_assets'] = mapping

    @app.get('/asset-runtime.js')
    def asset_runtime():
        active = mapping if app.config['WIKI_ASSET_MODE'] == 'igem' else {}
        return Response(runtime_script(active), mimetype='application/javascript')

    @app.after_request
    def rewrite_media(response):
        if app.config['WIKI_ASSET_MODE'] != 'igem' or response.status_code != 200:
            return response
        # Notebook's validated archival schema deliberately permits only local
        # paths. Its sourceURL() resolves previews at the last possible moment.
        if request.path == '/static/notebook/index.json':
            return response
        kinds = {'text/html': 'html', 'text/css': 'css', 'image/svg+xml': 'svg', 'application/json': 'json'}
        kind = kinds.get(response.mimetype)
        if kind is None:
            return response
        response.direct_passthrough = False
        text = response.get_data(as_text=True)
        text = rewrite_text(text, request.path, kind, mapping)
        if kind == 'html' and re.search(r'<head\b[^>]*>', text, re.I):
            # Register with Frozen-Flask and load before any inline/module code.
            runtime_path = urlsplit(url_for('asset_runtime')).path
            if request.script_root:
                runtime_path = runtime_path.removeprefix(request.script_root)
            relative = posixpath.relpath(runtime_path, posixpath.dirname(request.path) or '/')
            script = '<script src="' + relative + '"></script>'
            text = re.sub(r'(<head\b[^>]*>)', lambda m: m[0] + script, text, count=1, flags=re.I)
        response.set_data(text)
        response.headers.pop('ETag', None)
        response.headers.pop('Last-Modified', None)
        return response
