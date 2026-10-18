/* Lazy, local-only viewers for the team's supplied STL geometry. */
const MODELS = [
  { id: 'brain', image: 'biology-brain-model-render.webp', name: 'Brain structure', camera: [1.9, 0.35, 1.0] },
  { id: 'cell', image: 'biology-cell-model-render.webp', name: 'Animal cell structure', camera: [1.0, 1.9, -0.9] },
];
const DATA_URL = new URL('./data/meshes/', import.meta.url);
let libraries;

function loadLibraries() {
  libraries ??= Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]);
  return libraries;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(label, action, title = label) {
  const node = element('button', 'hp-model-button', label);
  node.type = 'button';
  node.title = title;
  node.setAttribute('aria-label', title);
  if (action) node.addEventListener('click', action);
  return node;
}

/** Display colors only: the source STL has no materials or segmentation labels. */
function addDisplayColors(THREE, geometry, modelId) {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const palette = (modelId === 'brain'
    ? ['#2358c9', '#00b7d4', '#f2cd18', '#ee5753', '#955ac9']
    : ['#f0c719', '#ef9124', '#08b8d4', '#3d52c2', '#a26acb']
  ).map(value => new THREE.Color(value));
  const box = geometry.boundingBox;
  const size = box.getSize(new THREE.Vector3());
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = (positions.getX(index) - box.min.x) / size.x;
    const y = (positions.getY(index) - box.min.y) / size.y;
    const z = (positions.getZ(index) - box.min.z) / size.z;
    const value = Math.max(0, Math.min(0.9999, modelId === 'brain'
      ? (0.55 * z + 0.35 * y + 0.1 * x)
      : (0.52 * y + 0.35 * x + 0.13 * z))) * (palette.length - 1);
    const first = Math.floor(value);
    color.copy(palette[first]).lerp(palette[Math.min(first + 1, palette.length - 1)], value - first);
    color.toArray(colors, index * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

async function createScene(view, config) {
  const [[THREE, { OrbitControls }], manifestResponse] = await Promise.all([
    loadLibraries(), fetch(new URL(`${config.id}.json`, DATA_URL)),
  ]);
  if (!manifestResponse.ok) throw new Error('Model metadata could not be loaded.');
  const manifest = await manifestResponse.json();
  const response = await fetch(new URL(manifest.mesh, DATA_URL));
  if (!response.ok) throw new Error('Model geometry could not be loaded.');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== manifest.byteLength || manifest.indexByteOffset !== manifest.vertices * 12) {
    throw new Error('Model geometry is incomplete.');
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bytes, 0, manifest.vertices * 3), 3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(bytes, manifest.indexByteOffset, manifest.triangles * 3), 1));
  geometry.computeBoundingBox();
  addDisplayColors(THREE, geometry, config.id);
  geometry.center();
  geometry.computeVertexNormals();
  const scene = new THREE.Scene();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.63, metalness: 0.02, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // Supplied STL files use Z as their vertical axis; Three.js uses Y.
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x686b94, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbecbff, 0.9);
  rim.position.set(-3, 1, -2);
  scene.add(rim);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20);
  camera.position.set(...config.camera);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.domElement.className = 'hp-model-canvas';
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', `${config.name} 3D model. Drag or use arrow keys to rotate, plus and minus to zoom, and R to reset.`);
  view.stage.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 0.85;
  controls.maxDistance = 4;
  controls.autoRotate = false;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.8;
  controls.update();
  controls.saveState();
  let visible = true;
  const render = () => { if (visible) renderer.render(scene, camera); };
  controls.addEventListener('change', render);
  const resize = () => {
    const width = view.stage.clientWidth;
    const height = view.stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(view.stage);
  renderer.domElement.addEventListener('pointerdown', () => renderer.domElement.focus({ preventScroll: true }));
  renderer.domElement.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') controls.rotateLeft(0.15);
    else if (event.key === 'ArrowRight') controls.rotateLeft(-0.15);
    else if (event.key === 'ArrowUp') controls.rotateUp(0.15);
    else if (event.key === 'ArrowDown') controls.rotateUp(-0.15);
    else if (event.key === '+' || event.key === '=') controls.dollyIn(0.85);
    else if (event.key === '-') controls.dollyOut(0.85);
    else if (event.key.toLowerCase() === 'r') controls.reset();
    else return;
    event.preventDefault();
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    view.showPoster();
    view.status.textContent = 'The 3D view is paused. The original image remains available; refresh to reload the model.';
    view.activate.disabled = true;
  });
  resize();
  return {
    zoomIn: () => controls.dollyIn(0.85),
    zoomOut: () => controls.dollyOut(0.85),
    reset: () => controls.reset(),
    show: () => { visible = true; renderer.domElement.hidden = false; resize(); },
    hide: () => { visible = false; renderer.domElement.hidden = true; },
  };
}

function enhanceFigure(image, config) {
  const figure = image.closest('figure');
  if (!figure || figure.dataset.modelViewer) return;
  figure.dataset.modelViewer = config.id;
  const shell = element('section', 'hp-model-viewer');
  shell.setAttribute('aria-label', `${config.name} interactive model`);
  const header = element('div', 'hp-model-header');
  const heading = element('div', 'hp-model-heading');
  heading.append(element('span', 'hp-model-kicker', 'EXPLORE IN 3D'), element('strong', '', config.name));
  const badge = element('span', 'hp-model-badge', 'Drag to explore');
  header.append(heading, badge);
  const stage = element('div', 'hp-model-stage');
  const activate = button('Open 3D model', null, `Open ${config.name.toLowerCase()} in 3D`);
  activate.classList.add('hp-model-activate');
  const status = element('p', 'hp-model-status', 'Open the interactive model, or explore the original image first.');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const toolbar = element('div', 'hp-model-toolbar');
  toolbar.hidden = true;
  const note = element('p', 'hp-model-note', 'Geometry from the original STL. Colors are for display and do not represent verified biological regions.');
  shell.append(header, stage, toolbar, status, note);
  image.before(shell);
  image.classList.add('hp-model-poster');
  stage.append(image, activate);
  let scene;
  const view = {
    stage, status, activate,
    showPoster() {
      scene?.hide();
      shell.classList.remove('is-active');
      image.hidden = false;
      activate.hidden = false;
      toolbar.hidden = true;
      status.textContent = 'Original image displayed. You can reopen the 3D model at any time.';
    },
  };
  const showScene = () => {
    shell.classList.add('is-active');
    image.hidden = true;
    activate.hidden = true;
    toolbar.hidden = false;
    scene.show();
    status.textContent = 'Drag to rotate · Scroll or pinch to zoom · Arrow keys to rotate · R to reset';
  };
  toolbar.append(
    button('＋', () => scene.zoomIn(), 'Zoom in on the 3D model'),
    button('−', () => scene.zoomOut(), 'Zoom out of the 3D model'),
    button('Reset', () => scene.reset(), 'Reset the model view'),
    button('Original image', () => view.showPoster()),
  );
  activate.addEventListener('click', async () => {
    if (scene) { showScene(); return; }
    activate.disabled = true;
    activate.textContent = 'Loading…';
    status.textContent = 'Loading the model. Please wait…';
    try {
      scene = await createScene(view, config);
      showScene();
    } catch (error) {
      stage.querySelector('canvas')?.remove();
      status.textContent = 'The 3D model could not load. You can still view the original image or download the original STL below.';
      console.warn(`Human Practices ${config.id} viewer:`, error);
    } finally {
      activate.disabled = false;
      activate.textContent = 'Open 3D model';
    }
  });
}

export function enhanceModelViewers(root = document) {
  for (const model of MODELS) {
    for (const image of root.querySelectorAll(`img[src*="${model.image}"]`)) enhanceFigure(image, model);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => enhanceModelViewers(), { once: true });
} else enhanceModelViewers();
