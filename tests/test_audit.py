import unittest

from pathlib import Path
import tempfile

from scripts.audit_build import (
    audit_document,
    audit_importmap,
    audit_internal_links,
    audit_script,
    audit_stylesheet,
)


VALID_DOCUMENT = """
<!doctype html><html><head>
<link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
<link rel="stylesheet" href="/static/style.css">
</head><body>
<img src="https://static.igem.wiki/common/icons/favicons/igem-2022.svg" alt="iGEM">
<a href="https://gitlab.igem.org/2026/sustech">Repository</a>
</body></html>
"""


class BuildAuditTest(unittest.TestCase):
    def test_accepts_igem_hosted_and_local_assets(self):
        self.assertEqual(audit_document("index.html", VALID_DOCUMENT), [])

    def test_rejects_third_party_runtime_asset(self):
        document = VALID_DOCUMENT.replace(
            "</head>", '<script src="https://cdn.example.com/app.js"></script></head>'
        )
        issues = audit_document("index.html", document)
        self.assertTrue(any("third-party runtime asset" in issue for issue in issues))

    def test_requires_license_and_repository_links(self):
        document = VALID_DOCUMENT.replace("creativecommons.org/licenses/by/4.0/", "example.com")
        document = document.replace("gitlab.igem.org/2026/sustech", "example.com/repo")
        issues = audit_document("index.html", document)
        self.assertTrue(any("license link" in issue for issue in issues))
        self.assertTrue(any("repository link" in issue for issue in issues))

    def test_rejects_excluded_spatial_model_terms(self):
        issues = audit_document("index.html", VALID_DOCUMENT.replace("Repository", "ParaView"))
        self.assertTrue(any("excluded term" in issue for issue in issues))

    def test_rejects_third_party_asset_in_stylesheet(self):
        issues = audit_stylesheet(
            "style.css", '.hero { background: url("https://cdn.example.com/hero.png"); }'
        )
        self.assertTrue(any("third-party stylesheet asset" in issue for issue in issues))

    def test_rejects_image_without_alt_text(self):
        document = VALID_DOCUMENT.replace('alt="iGEM"', "")
        issues = audit_document("index.html", document)
        self.assertTrue(any("missing alt text" in issue for issue in issues))

    def test_rejects_external_svg_assets(self):
        for tag in ('image', 'use'):
            for attribute in ('href', 'xlink:href'):
                for url in ('https://external.example/art.svg', '//external.example/art.svg'):
                    with self.subTest(tag=tag, attribute=attribute, url=url):
                        document = VALID_DOCUMENT.replace('</body>', f'<svg><{tag} {attribute}="{url}"/></svg></body>')
                        self.assertTrue(any('third-party runtime asset' in issue for issue in audit_document('index.html', document)))

    def test_svg_fragment_is_not_a_missing_file(self):
        with tempfile.TemporaryDirectory() as directory:
            document = '<svg><use href="#neural-route"/></svg>'
            self.assertEqual(audit_internal_links('index.html', document, Path(directory)), [])

    def test_missing_local_svg_image_is_reported(self):
        with tempfile.TemporaryDirectory() as directory:
            document = '<svg><image href="/static/missing-brain.png"/></svg>'
            issues = audit_internal_links('index.html', document, Path(directory))
            self.assertTrue(any('missing local asset' in issue for issue in issues))

    def test_rejects_broken_internal_link(self):
        with tempfile.TemporaryDirectory() as directory:
            document = VALID_DOCUMENT.replace("</body>", '<a href="missing-page">Missing</a></body>')
            issues = audit_internal_links("index.html", document, Path(directory))
        self.assertTrue(any("broken internal link" in issue for issue in issues))

    def test_accepts_local_esm_imports(self):
        source = "import * as THREE from './vendor/three/three.module.js';\nimport { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n"
        self.assertEqual(audit_script("scene.js", source), [])

    def test_rejects_remote_esm_import(self):
        samples = [
            "import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';",
            'import "https://unpkg.com/three@0.186.1/build/three.module.js";',
            "const m = await import('https://esm.sh/three@0.186.1');",
            "export { Scene } from 'https://cdn.example.com/three.js';",
        ]
        for source in samples:
            with self.subTest(source=source):
                issues = audit_script("scene.js", source)
                self.assertTrue(any("remote ESM import" in issue for issue in issues))

    def test_accepts_igem_hosted_esm_import(self):
        source = "import { Scene } from 'https://static.igem.wiki/sustech/three.module.js';"
        self.assertEqual(audit_script("scene.js", source), [])

    def test_import_map_resolves_to_local_vendor_files(self):
        importmap = (
            '{"imports": {"three": "./static/vendor/three/three.module.js", '
            '"three/addons/": "./static/vendor/three/addons/"}}'
        )
        self.assertEqual(audit_importmap("three-importmap.json", importmap), [])

    def test_rejects_remote_import_map_specifier(self):
        importmap = '{"imports": {"three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js"}}'
        issues = audit_importmap("three-importmap.json", importmap)
        self.assertTrue(any("remote import map specifier" in issue for issue in issues))

    def test_rejects_remote_import_map_scope(self):
        importmap = '{"scopes": {"/app/": {"three": "https://esm.sh/three@0.186.1"}}}'
        issues = audit_importmap("three-importmap.json", importmap)
        self.assertTrue(any("remote import map specifier" in issue for issue in issues))

    def test_ignores_unparseable_import_map(self):
        self.assertEqual(audit_importmap("broken.json", "{not json"), [])


if __name__ == "__main__":
    unittest.main()
