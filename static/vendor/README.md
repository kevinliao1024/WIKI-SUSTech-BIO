# Vendored frontend assets

`cobe.js` is the browser ESM distribution of [Cobe](https://github.com/shuding/cobe) 2.0.1, installed with pnpm. Cobe is released under the MIT License.

## three.js

`three/` holds the browser ESM build of [three.js](https://github.com/mrdoob/three.js) **0.186.1**, installed with pnpm (`pnpm add three@0.186.1 --save-exact`) and copied in verbatim. three.js is released under the MIT License; the upstream license text is kept at `three/LICENSE.txt`.

| File | Notes |
|---|---|
| `three/three.module.js` | Public entry point. Re-exports everything and imports from `./three.core.js`. |
| `three/three.core.js` | Sibling module required by `three.module.js`. Self-contained, no remote imports. |
| `three/addons/controls/OrbitControls.js` | Addon, copied only when a scene needs it. |
| `three/three-importmap.json` | Import map mapping bare specifiers to the local files above. |

The files are copied **byte-identical** to upstream. Never hand-edit them to rewrite a `from 'three'` specifier into a relative path — that is what the import map is for, and edits here are lost the next time the version is bumped. Verify a copy with `shasum -a 256` against `node_modules/three/`.

### Adding a version bump or another addon

```sh
pnpm add three@<version> --save-exact
cp node_modules/three/build/three.module.js node_modules/three/build/three.core.js static/vendor/three/
cp node_modules/three/examples/jsm/controls/OrbitControls.js static/vendor/three/addons/controls/
```

`three.module.js` and `three.core.js` must always be copied as a matching pair — the entry point imports the core module by relative path, so a mismatched pair fails at runtime. Only copy the addons actually used; each addon may pull in its own imports, which the import map resolves.

### Using it in a page

```html
<script type="importmap">{{ ...three-importmap.json... }}</script>
<script type="module" src="{{ url_for('static', filename='your-scene.js') }}"></script>
```

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

Bare specifiers resolve through the import map, so scene code reads exactly like upstream three.js examples and addons stay unmodified.

## Why vendoring instead of a CDN

iGEM requires everything the wiki loads to be served from iGEM infrastructure (see [README.md](../../README.md)). Linking three.js from jsDelivr, unpkg or esm.sh would both break that rule and leave the wiki dependent on a third party staying up. `scripts/audit_build.py` enforces this: `audit_script` rejects `https://` ESM import specifiers in any frozen `.js`, and `audit_importmap` does the same for import map values. Both allow `static.igem.wiki` and `video.igem.org`.

Note that the audit checks the **frozen output** under `public/`. A local `node_modules/` copy is not what ships — the files under `static/vendor/` are, so keep them in git.
