# Local and iGEM media

Local Flask development defaults to `WIKI_ASSET_MODE=local`. Source HTML,
Markdown, original images, fonts, geometry and scientific data remain in the
repository. No runtime dependency was added.

## Mapping evidence

- `asset_uploads.json`: the supplied 943 official URLs, confirmed path pairs,
  original-file SHA256 values, and 193 downloaded WebP/SVG content hashes.
- `asset_mapping.csv`: all tracked/unignored repository media, confirmed URLs,
  matching method, references with line numbers, and candidate references.
- `asset_unmatched.csv`: everything without a confirmed URL. Source references
  include inactive templates, documentation and previews; this is not the list
  of deployment blockers.
- `asset_uploads_unmatched.csv`: upload records without a confirmed local file.
  Some are duplicate uploads or older exports. Do not invent local paths for them.
- `asset_external_references.csv`: external media mentions, including source
  credits. An external citation is not automatically a runtime request.

Regenerate after a source or upload-record update:

```sh
python scripts/build_asset_mapping.py
```

The generator never constructs an iGEM URL. It uses only recorded URLs, explicit
source-hash-locked pairs, identical downloaded hashes, or unique normalized
filenames. Case, punctuation and PNG/JPG-to-AVIF conversion can differ. Duplicate
local names require confirmation; changed explicitly matched source files require
renewed evidence. Record new confirmed pairs in `asset_uploads.json` with the
current local SHA256 and matching evidence, then regenerate and review the CSV.

## Rendering

`igem_assets.py` is installed by `app.py`. In iGEM mode it resolves known URLs
in rendered HTML/Jinja/Markdown, CSS `url()`, inline SVG image references, srcset,
and image manifests. Original source files are not rewritten. Scripts and styles
continue to be served by the iGEM GitLab site. Unmatched media stays local during
preview; the strict production audit blocks deployment until resolved.

The production HTML receives `asset-runtime.js` before application scripts.
`globalThis.wikiAssetURL(value, base)` resolves known dynamic local paths and
preserves query strings and fragments. It understands the deployment subpath.
It does not patch browser APIs or change fetch/Image behavior globally.
Notebook, the interview component, PDF previews and the screenshot gallery call
this resolver. Notebook's validated relative-path index stays unchanged, and
its preview URL is resolved only when the image is loaded.

Current WebGL scenes use procedural geometry and `CanvasTexture`; these have no
uploadable texture file and are unchanged. For a new file-backed texture use
`loader.load(globalThis.wikiAssetURL?.(url) ?? url)` or a dedicated Three.js
LoadingManager URL modifier. CORS must permit cross-origin image use; the current
CDN AVIF texture was successfully uploaded to WebGL in the browser check.

## Build and verify

Use the repository's pinned `dependencies.txt` in an isolated Python 3.12
environment or the documented project environment. Use a fresh task-specific
destination for each local freeze. Freezing does not remove unrelated old files.

```sh
WIKI_ASSET_MODE=local python -m unittest discover -s tests -v
node tests/notebook_core.mjs

WIKI_ASSET_MODE=local FREEZER_DESTINATION=/tmp/wiki-local-UNIQUE \
  python -m flask --app app.py freeze
python scripts/audit_build.py --public-dir /tmp/wiki-local-UNIQUE

WIKI_ASSET_MODE=igem FREEZER_DESTINATION=/tmp/wiki-igem-UNIQUE \
  python -m flask --app app.py freeze
python scripts/audit_build.py --public-dir /tmp/wiki-igem-UNIQUE \
  --require-cdn --asset-report /tmp/wiki-igem-assets-UNIQUE.json
```

The strict audit follows root pages, nested HTML readers, CSS, modules and known
dynamic media indexes. It reports remaining local media separately from missing
files. It is not a proof of every possible future computed JS URL. Add a resolver
and a runtime test when introducing a new dynamic media loader.

## Deployment gate

`.gitlab-ci.yml` explicitly tests local mode, freezes in iGEM mode, then invokes
`audit_build.py --require-cdn`. It retains the existing default-branch-only rule.
An unresolved production-media error fails the Pages job, so the build cannot
silently publish partial CDN migration.

The 37 pending images/fonts now resolve to verified HTTP 200 official URLs.
All three font downloads are byte-identical to their original local files.
Only two Software videos remain local in the production audit. Video integration
is deferred at the owner's request; the strict CI gate remains enabled.
The full inventory also includes inactive assets without mappings; those are not
reachable production dependencies in the current build.

After these are resolved, regenerate the mapping, rerun local tests, iGEM freeze
and the strict audit, review the diff, and only then commit/push with the owner's
approval. This task does not push, merge or change the remote GitLab project.
