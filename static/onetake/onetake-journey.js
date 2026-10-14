import { STATIONS, openingProgress, openingScroll, arcFraction, arcTable, parameterAtArc, propPosition, propOpacity, journeyMazeGraph, ramp, smooth } from './journey-path.mjs';
import { createMazeNavigator } from './maze-navigation.mjs';

const root = document.querySelector('[data-journey]');
const rail = root?.querySelector('[data-journey-track]');
const story = root?.querySelector('[data-ot-story]');
const ui = root?.querySelector('[data-journey-ui]');
const buttons = [...(root?.querySelectorAll('[data-journey-station]') || [])];
const panels = [...(root?.querySelectorAll('[data-journey-panel]') || [])];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

for (const button of buttons) button.addEventListener('click', () => {
  const station = STATIONS.find(s => s.id === button.dataset.journeyStation);
  if (root.classList.contains('ot--static')) {
    document.getElementById(`journey-${station.id}`).scrollIntoView({ behavior: 'auto', block: 'start' });
  } else {
    const top = rail.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + openingScroll(station.p, rail.offsetHeight), behavior: 'smooth' });
  }
});

// Register before the base module boots: the template deliberately loads this first.
root?.addEventListener('ot:ready', ({ detail: { THREE, scene, camera, renderer } }) => {
  const base = scene.children.find(o => o.isPoints && o.geometry.hasAttribute('aMaze'));
  if (!base) throw new Error('Journey requires the existing maze particle layer.');
  const baseLayers = [...scene.children];
  const mazeAttribute = base.geometry.getAttribute('aMaze');
  const mazeOriginal = mazeAttribute.array.slice();
  const graph = journeyMazeGraph();
  const entry = graph.point(graph.path[0]);
  const mazeEntry = new THREE.Vector3(entry[0], entry[1] + .2, graph.bowl(...entry) + .22);
  const curve = new THREE.CatmullRomCurve3([
    [-5.8181818, -.6, 0], ...STATIONS.map(s => s.at), [6, -.6, 0],
  ].map(a => new THREE.Vector3(...a)), false, 'centripetal');
  const arc = arcTable(t => curve.getPoint(t).toArray());
  const handoff = new THREE.CatmullRomCurve3([curve.getPoint(1), new THREE.Vector3(5, 2.5, .5), new THREE.Vector3(-3, 2.5, .5), mazeEntry]);
  const handoffArc = arcTable(t => handoff.getPoint(t).toArray());
  const companion = new THREE.Group(); companion.name = 'journey-companion';
  // Draw the matte companion on layer 2 after the base postprocessing. It still
  // shares this scene, camera, depth projection and canvas, but avoids bloom.
  const matte = new THREE.MeshStandardMaterial({ color: 0xf4f2eb, roughness: 1, metalness: 0, emissive: 0x000000, transparent: true });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.145, 12, 8), matte); head.position.y = .62;
  const body = new THREE.Mesh(new THREE.ConeGeometry(.24, .53, 8), matte); body.position.y = .29;
  companion.add(head, body); scene.add(companion);
  const light = new THREE.HemisphereLight(0xffffff, 0x9b9ef7, 3);
  const rim = new THREE.DirectionalLight(0x9fd0ff, .045); rim.position.set(-3, 3, 4);
  scene.add(light, rim);
  companion.traverse(object => object.layers.set(2));
  light.layers.set(2); rim.layers.set(2);

  const sources = [], ids = [];
  function line(id, a, b, count = 55) {
    for (let i = 0; i < count; i++) { const t = i / (count - 1); sources.push(a.map((x, k) => x + (b[k] - x) * t)); ids.push(id); }
  }
  // An open door, a bridge deck with quiet arches, and two edges of a road.
  line('home', [-4.55, -.6, 0], [-4.55, 1.6, 0]);
  line('home', [-4.55, 1.6, 0], [-3.45, 1.6, 0]);
  line('home', [-3.45, 1.6, 0], [-3.45, -.6, 0]);
  for (const z of [-.22, .22]) {
    line('bridge', [-1.35, -.6, z], [1.35, -.6, z]);
    for (let j = 0; j < 40; j++) {
      const x = -1.35 + 2.7 * j / 39, y = -.6 + .7 * Math.sin(Math.PI * j / 39);
      sources.push([x, y, z]); ids.push('bridge');
    }
  }
  for (const y of [-.85, -.35]) line('road', [2.5, y, 0], [5.6, y, 0], 85);
  const positions = new Float32Array(sources.length * 3);
  const colors = new Float32Array(sources.length * 3);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
  const props = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x9fd0ff, vertexColors: true, size: .038, transparent: true, opacity: .55, depthWrite: false }));
  props.frustumCulled = false; props.name = 'journey-props'; scene.add(props);
  const targets = sources.map((_, i) => {
    const index = Math.floor(i / sources.length * (mazeOriginal.length / 3 * .93)) * 3;
    return new THREE.Vector3(...mazeOriginal.subarray(index, index + 3));
  });
  const point = new THREE.Vector3(), tangent = new THREE.Vector3(), projected = new THREE.Vector3();
  let lastPanel = null;
  root.addEventListener('ot:frame', ({ detail: { take } }) => {
    if (root.classList.contains('ot--static')) return;
    const rect = rail.getBoundingClientRect();
    const p = story.getBoundingClientRect().top > 0 ? openingProgress(-rect.top, rail.offsetHeight) : take;
    root.style.setProperty('--journey-p', p.toFixed(6));
    ui.hidden = p >= .11;
    const current = panels.find(el => p >= +el.dataset.in && p < +el.dataset.out);
    if (current !== lastPanel) {
      for (const panel of panels) { panel.classList.toggle('is-on', panel === current); panel.setAttribute('aria-hidden', String(panel !== current)); }
      lastPanel = current;
    }
    root.querySelector('[data-journey-question]').textContent = p < -.79 ? 'What do we hold onto?' : p < -.35 ? 'What changes first?' : 'Why does the familiar become unfamiliar?';
    root.querySelector('[data-journey-question]').hidden = p >= -.075;
    root.querySelector('.ot-journey-stations').hidden = p >= -.26;
    for (const button of buttons) {
      const station = STATIONS.find(s => s.id === button.dataset.journeyStation);
      if (Math.abs(p - station.p) < .035) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    }
    companion.visible = p < .03; props.visible = p < -.19;
    light.visible = rim.visible = p < .03;
    if (p >= .03) return;
    // Opening stays in the shared wide camera, without elapsed-time dolly or
    // pointer parallax. At -.075 the unmodified base camera is exactly here too.
    if (p <= -.075) {
      const pull = Math.max(1, 1.15 / camera.aspect);
      camera.position.set(0, .2 - .1 * pull, 17.5 * pull); camera.lookAt(0, .2, 0); camera.updateMatrixWorld();
    }
    base.material.uniforms.uIntro.value = 1;
    base.material.uniforms.uTime.value = (p + 1) * 10;
    base.material.uniforms.uMouseOn.value = 0;
    base.material.uniforms.uMazeFollow.value = 0;
    mazeAttribute.array.set(mazeOriginal); mazeAttribute.needsUpdate = true;
    const merge = smooth(ramp(p, -.35, -.19));
    base.material.uniforms.uSceneAlpha.value *= merge;
    if (p < -.19) for (const layer of baseLayers) if (layer !== base) layer.visible = false;
    const parameter = parameterAtArc(arc, arcFraction(p));
    curve.getPoint(parameter, point); curve.getTangent(parameter, tangent);
    if (p > -.35) {
      const t = parameterAtArc(handoffArc, ramp(p, -.35, -.19));
      handoff.getPoint(t, point); handoff.getTangent(t, tangent);
    }
    if (p >= -.19) {
      // Recreate and advance from the same origin on every frame: no time state,
      // no reverse-scroll teleport and every travelled edge is an open passage.
      const nav = createMazeNavigator(graph, 0);
      const distance = ramp(p, -.19, -.075) * graph.spacing * 4;
      nav.advance(distance); const [x, y] = nav.position();
      point.set(x, y + .2, graph.bowl(x, y) + .22);
      const ahead = createMazeNavigator(graph, 0); ahead.advance(Math.min(graph.spacing * 4, distance + .001));
      const [ax, ay] = ahead.position(); tangent.set(ax - x, ay - y, 0);
    }
    const distance = camera.position.distanceTo(point);
    const scale = (2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * .06) / .765;
    const bob = Math.sin(arcFraction(p) * arc.length * 12) * .018 * (p < -.35 ? 1 : 0);
    companion.position.copy(point); companion.position.y += bob * scale;
    companion.scale.setScalar(scale); companion.rotation.z = Math.sin(arcFraction(p) * arc.length * 12) * .035;
    companion.rotation.y = Math.atan2(tangent.x, tangent.z);
    matte.opacity = 1 - smooth(ramp(p, -.075, .03));
    props.material.opacity = .55 * (1 - merge);
    sources.forEach((source, i) => {
      projected.fromArray(propPosition(ids[i], source, p)).lerp(targets[i], merge);
      positions.set(projected.toArray(), i * 3);
      const intensity = propOpacity(ids[i], source, p);
      colors.set([intensity, intensity, intensity], i * 3);
    });
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    // The base event runs immediately before composer.render(). A microtask
    // finishes the same frame, without a second RAF or an independent clock.
    queueMicrotask(() => {
      if (root.classList.contains('ot--static') || !companion.visible) return;
      const mask = camera.layers.mask, clear = renderer.autoClear;
      try {
        camera.layers.set(2); renderer.autoClear = false;
        // OutputPass's full-screen quad writes default-buffer depth. The world
        // is made of non-occluding particles; clear that quad depth, not color.
        renderer.clearDepth(); renderer.render(scene, camera);
      }
      finally { camera.layers.mask = mask; renderer.autoClear = clear; }
    });
  });
});

// A preference change switches immediately to the complete reading version.
reduced.addEventListener('change', e => {
  if (e.matches) root?.classList.add('ot--static');
});
new MutationObserver(() => {
  if (root.classList.contains('ot--static')) {
    ui.hidden = false;
    root.querySelector('.ot-journey-stations').hidden = false;
    for (const panel of panels) panel.removeAttribute('aria-hidden');
  }
}).observe(root, { attributes: true, attributeFilter: ['class'] });
