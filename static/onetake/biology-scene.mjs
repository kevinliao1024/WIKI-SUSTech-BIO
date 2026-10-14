// Conceptual, independently identified particle objects. No measured molecular
// trajectories, exact protein structures or functional rescue are implied.
const clamp = x => Math.max(0, Math.min(1, x));
const ramp = (x, a, b) => clamp((x - a) / (b - a));
const smooth = x => x * x * (3 - 2 * x);
const windowOf = (q, a, b, c, d) => smooth(ramp(q, a, b)) * (1 - smooth(ramp(q, c, d)));

export function editState(progress) {
  return {
    pod: smooth(ramp(progress, .05, .25)),
    cetus: smooth(ramp(progress, .28, .48)),
    fix: smooth(ramp(progress, .54, .77)),
    pulse: Math.sin(Math.PI * ramp(progress, .51, .8)),
    leave: smooth(ramp(progress, .92, 1)),
  };
}

const vertex = `
attribute vec3 aEnd, aColor;
attribute float aKind, aSeed;
uniform float uTime, uOpacity, uGather, uFix, uPulse, uMotion, uPR, uScale, uSize, uDock;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec3 p = mix(position, aEnd, uGather);
  float target = step(1.5, aKind) * (1. - step(2.5, aKind));
  float cargo = step(3.5, aKind);
  float drift = mix(.008, .07 * (1. - uGather) + .008, cargo) * uMotion;
  p += vec3(sin(uTime*.42+aSeed*43.),cos(uTime*.33+aSeed*71.),sin(uTime*.29+aSeed*91.)) * drift;
  vec4 mv = modelViewMatrix * vec4(p,1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * uPR * (11./max(1.,-mv.z)) * sqrt(uScale), 1., 5. * uPR);
  vColor = mix(aColor, mix(vec3(.96,.56,.61),vec3(.36,1.,.72),uFix),target);
  vColor = mix(vColor,vec3(.55,.9,.79),uDock);
  vColor += vec3(.12,.26,.18) * uPulse * target;
  vAlpha = uOpacity * (.65 + .35*aSeed) * (1. + .35*uPulse*target);
  vAlpha *= mix(.025,1.,smoothstep(.03,.2,uScale));
  vAlpha *= mix(1., smoothstep(.06,.6,uGather-aSeed*.28),cargo);
}`;
const fragment = `
varying vec3 vColor; varying float vAlpha;
void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.03,d);
gl_FragColor=vec4(vColor,a*a*vAlpha); }`;

export function createBiologyScene(THREE, scene, { root, cell, strand, small, onReady }) {
  let seed = 4102026;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const direction = () => {
    const z = random() * 2 - 1, a = random() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    return [r * Math.cos(a), r * Math.sin(a), z];
  };
  const layers = [];
  function points(name, positions, colors, kinds, ends = positions, size = 1.8) {
    const n = positions.length / 3, geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aEnd', new THREE.Float32BufferAttribute(ends, 3));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('aKind', new THREE.Float32BufferAttribute(kinds, 1));
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(Array.from({ length: n }, random), 1));
    const uniforms = {
      uTime: { value: 0 }, uOpacity: { value: 0 }, uGather: { value: 0 },
      uFix: { value: 0 }, uPulse: { value: 0 }, uMotion: { value: 1 },
      uPR: { value: 1 }, uScale: { value: 1 }, uSize: { value: size }, uDock: { value: 0 },
    };
    const object = new THREE.Points(geometry, new THREE.ShaderMaterial({ uniforms,
      vertexShader: vertex, fragmentShader: fragment, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending }));
    object.name = name;
    object.frustumCulled = false;
    scene.add(object);
    layers.push(object);
    return { object, uniforms };
  }

  // A persistent, sparse cell boundary bridges the change in scale.
  const cp = [], cc = [], ck = [];
  for (let i = 0; i < cell.meta.length; i += 3) {
    cp.push(...cell.pos.subarray(i * 3, i * 3 + 3));
    const nuclear = cell.meta[i] === 2;
    cc.push(...(nuclear ? [.24,.21,.55] : [.48,.47,.82])); ck.push(0);
  }
  const context = points('astrocyte-context', cp, cc, ck, cp, 1.3);

  // The transcript is its own particle object, selected within the same cell.
  const rp = [], rc = [], rk = [], targetX = strand.target.x;
  const stride = small ? 2 : 3;
  for (let i = 0; i < strand.meta.length; i += stride) {
    const kind = strand.meta[i];
    rp.push(strand.pos[i * 3] - targetX, strand.pos[i * 3 + 1], strand.pos[i * 3 + 2]);
    rc.push(...(kind === 0 ? [.62,.72,.95] : [.38,.37,.74])); rk.push(kind);
  }
  const rna = points('apoe-rna', rp, rc, rk, rp, 1.65);

  // Three base heads are distinguishable even before the labels appear.
  const bp = [], bc = [], bk = [];
  const basePositions = [0, .62, 1.24].map(x => new THREE.Vector3(x, Math.cos((targetX + 22 + x) / 6.2 * Math.PI * 2) * .72, Math.sin((targetX + 22 + x) / 6.2 * Math.PI * 2) * .72));
  for (let b = 0; b < 3; b++) for (let i = 0; i < (small ? 100 : 160); i++) {
    const d = direction(), r = .11 * Math.cbrt(random()), p = basePositions[b];
    bp.push(p.x + d[0]*r, p.y + d[1]*r, p.z + d[2]*r);
    bc.push(...(b === 0 ? [.96,.56,.61] : [.72,.72,.96])); bk.push(b === 0 ? 2 : 1);
  }
  const bases = points('codon-cgc-ugc', bp, bc, bk, bp, 1.8);

  function protein(name, centers, color, radii) {
    const p = [], c = [], k = [];
    for (const center of centers) for (let i = 0; i < (small ? 160 : 240); i++) {
      const d = direction(), r = .8 + .2*random();
      p.push(...center.map((v, axis) => v + d[axis]*r*radii[axis])); c.push(...color); k.push(0);
    }
    return points(name, p, c, k, p, 1.9);
  }
  // Stylised segmented binding surface, not a claim about repeat count.
  const podCenters = Array.from({ length: 7 }, (_, i) => {
    const x = -2.85 + i*.36, a = (targetX + 22 + x) / 6.2 * Math.PI * 2;
    return [x, Math.cos(a)*1.47, Math.sin(a)*1.47];
  });
  const pod = protein('pod-recognition', podCenters, [.61,.61,.96], [.23,.25,.24]);
  const cetus = protein('cetus-editing', [[.18,1.5,.7]], [.62,.82,1.], [.42,.34,.37]);
  const podSlot = protein('pod-docking-outline', podCenters, [.92,.8,.55], [.265,.29,.28]);
  const cetusSlot = protein('cetus-docking-outline', [[.18,1.5,.7]], [.92,.8,.55], [.48,.39,.43]);
  const lp = [], lc = [], lk = [];
  const start = new THREE.Vector3(...podCenters.at(-1)), end = new THREE.Vector3(.18,1.5,.7);
  for (let i = 0; i < 150; i++) {
    const t = i / 149, p = start.clone().lerp(end, t); p.y += Math.sin(t*Math.PI)*.3;
    lp.push(p.x,p.y,p.z); lc.push(.4,.45,.7); lk.push(0);
  }
  const linker = points('editor-linker', lp, lc, lk, lp, 1.3);

  // Amyloid particles have independent starting positions and destinations.
  // They never come from RNA or disappear as a consequence of uFix.
  const ap = [], ae = [], ac = [], ak = [];
  const clusters = Array.from({ length: 24 }, () => {
    const d = direction(), r = 2.8 + random()*2.3;
    return d.map(v => v*r);
  });
  for (let i = 0; i < (small ? 1800 : 3200); i++) {
    const center = clusters[i % clusters.length], d = direction(), r = .1 + random()*.22;
    ae.push(...center.map((v,a) => v+d[a]*r));
    const out = direction(), distance = 6+random()*4;
    ap.push(...out.map(v => v*distance)); ac.push(.96,.56,.61); ak.push(4);
  }
  const amyloid = points('extracellular-amyloid', ap, ac, ak, ae, 2.1);

  const labels = Object.fromEntries([...root.querySelectorAll('[data-bio-label]')].map(el => [el.dataset.bioLabel, el]));
  const projected = new THREE.Vector3();
  function label(name, position, opacity, camera, offset = 0) {
    const el = labels[name]; if (!el) return;
    projected.copy(position).project(camera);
    const visible = opacity > .02 && projected.z < 1 && projected.z > -1;
    el.style.opacity = visible ? opacity.toFixed(3) : '0';
    el.style.visibility = visible ? 'visible' : 'hidden';
    if (visible) {
      const margin = small ? 44 : 60;
      const x = Math.max(margin, Math.min(innerWidth-margin,(projected.x*.5+.5)*innerWidth));
      const y = Math.max(182, Math.min(innerHeight-150,(-projected.y*.5+.5)*innerHeight + offset));
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;
    }
  }
  const preview = new THREE.Vector3(.55,.2,.78), final = new THREE.Vector3(targetX,0,0);
  const ui = root.querySelector('[data-bio-interaction]');
  const instruction = root.querySelector('[data-placement-instruction]');
  const podCenter = podCenters.reduce((sum,p) => sum.add(new THREE.Vector3(...p)),new THREE.Vector3()).multiplyScalar(1/podCenters.length);
  const items = {
    pod: { layer: pod, slot: podSlot, center: podCenter, centers: podCenters, radii: [.23,.25,.24], offset: new THREE.Vector3(), home: new THREE.Vector3(), placed: false },
    cetus: { layer: cetus, slot: cetusSlot, center: new THREE.Vector3(.18,1.5,.7), centers: [[.18,1.5,.7]], radii: [.42,.34,.37], offset: new THREE.Vector3(), home: new THREE.Vector3(), placed: false },
  };
  let placementInitialized = false, dragging = null, activeCamera = null, activePlacement = false;
  let placementSession = '';
  const world = new THREE.Vector3();
  const screenOf = p => {
    const v = p.clone().project(activeCamera);
    return { x:(v.x*.5+.5)*innerWidth, y:(-v.y*.5+.5)*innerHeight, z:v.z };
  };
  const fixedCenter = item => final.clone().add(item.center);
  // The visible protein is the drag target, including its outer bead surfaces.
  // Separate projected disks follow each segment without blocking the canvas.
  const hitPath = item => item.centers.map(coords => {
    const center = final.clone().add(item.offset).add(new THREE.Vector3(...coords));
    const p = screenOf(center);
    let radius = 0;
    for (let axis=0;axis<3;axis++) for (const sign of [-1,1]) {
      const edge = center.clone(); edge.setComponent(axis,edge.getComponent(axis)+sign*item.radii[axis]);
      const e = screenOf(edge); radius = Math.max(radius,Math.hypot(e.x-p.x,e.y-p.y));
    }
    radius += small ? 8 : 6;
    return `M${p.x-radius},${p.y}a${radius},${radius} 0 1,0 ${radius*2},0a${radius},${radius} 0 1,0 ${-radius*2},0`;
  }).join(' ');
  const near = item => {
    const target = screenOf(fixedCenter(item)), actual = screenOf(fixedCenter(item).add(item.offset));
    return Math.hypot(target.x-actual.x,target.y-actual.y) < (small?52:85);
  };
  function place(item) {
    item.offset.set(0,0,0); item.placed = true;
    const ready = Object.values(items).every(i => i.placed);
    onReady?.(ready);
    if (instruction) instruction.textContent = ready ? 'Both are in place. Scroll once to edit.' : 'Drag the other module to the RNA.';
  }
  for (const [name,item] of Object.entries(items)) {
    item.button = root.querySelector(`[data-bio-handle="${name}"]`);
    item.drop = root.querySelector(`[data-drop-site="${name}"]`);
    item.guide = root.querySelector(`[data-bio-guide="${name}"]`);
    item.hit = root.querySelector(`[data-bio-hit="${name}"]`);
    const button = item.button;
    const grab = event => {
      if (!activePlacement || item.placed || dragging || event.button !== 0) return;
      event.preventDefault();
      const center = fixedCenter(item).add(item.offset), projected = center.clone().project(activeCamera);
      const point = new THREE.Vector3(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2,projected.z).unproject(activeCamera);
      dragging = { item, depth: projected.z, grab: point.sub(center), pointer: event.pointerId, capture: event.currentTarget };
      dragging.capture.setPointerCapture(event.pointerId);
      button.classList.add('is-dragging');
      item.hit?.classList.add('is-dragging');
    };
    const move = event => {
      if (!dragging || dragging.item !== item || dragging.pointer !== event.pointerId) return;
      world.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2,dragging.depth).unproject(activeCamera);
      item.offset.copy(world).sub(dragging.grab).sub(fixedCenter(item));
    };
    const release = event => {
      if (!dragging || dragging.item !== item || dragging.pointer !== event.pointerId) return;
      const capture = dragging.capture;
      if (activePlacement && event.type === 'pointerup' && near(item)) place(item);
      else item.offset.copy(item.home);
      button.classList.remove('is-dragging'); dragging = null;
      item.hit?.classList.remove('is-dragging');
      if (capture.hasPointerCapture(event.pointerId)) capture.releasePointerCapture(event.pointerId);
    };
    for (const target of [button,item.hit]) {
      target?.addEventListener('pointerdown',grab);
      target?.addEventListener('pointermove',move);
      target?.addEventListener('pointerup',release);
      target?.addEventListener('pointercancel',release);
      target?.addEventListener('lostpointercapture',release);
    }
    button?.addEventListener('keydown',event => {
      if (activePlacement && !item.placed && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.stopPropagation(); place(item); }
    });
  }
  return {
    update(q, time, camera, motion, replay) {
      const entrance = smooth(ramp(q,.335,.435));
      const transcript = windowOf(q,.272,.302,.602,.657) + windowOf(q,.775,.81,.9,.939);
      const placement = replay?.phase === 'placement';
      const replayEdit = replay && ['target','placement','edit','return'].includes(replay.phase);
      activePlacement = placement; activeCamera = camera;
      if (ui) ui.hidden = !placement;
      if (placement && (!placementInitialized || placementSession !== root.dataset.editSession)) {
        placementInitialized = true;
        placementSession = root.dataset.editSession;
        onReady?.(false);
        if (instruction) instruction.textContent = 'Drag POD and CETUS to the RNA.';
        for (const [name,item] of Object.entries(items)) {
          item.placed = false;
          const target = screenOf(fixedCenter(item));
          const x = name === 'pod' ? (small?.19:.18) : (small?.81:.82);
          world.set(x*2-1,1-.59*2,target.z).unproject(camera);
          item.home.copy(world).sub(fixedCenter(item)); item.offset.copy(item.home);
        }
      }
      const progress = replayEdit ? replay.edit : ramp(q,.798,.907);
      const edit = editState(progress || 0);
      if (placementInitialized && replay && ['edit','return'].includes(replay.phase)) {
        edit.pod = edit.cetus = 1;
        edit.fix = smooth(ramp(progress,.12,.6));
        edit.pulse = Math.sin(Math.PI*ramp(progress,.1,.65));
      }
      const editVisible = replayEdit ? (replay.phase === 'return' ? 1-replay.cameraBlend : 1) : windowOf(q,.782,.8,.906,.928);
      rna.object.position.copy(preview).lerp(final, entrance);
      rna.object.scale.setScalar(.023 + .977*entrance);
      rna.uniforms.uOpacity.value = replayEdit ? editVisible*.74 : transcript*.74;
      rna.uniforms.uScale.value = rna.object.scale.x;
      for (const layer of [bases,pod,cetus,linker]) {
        layer.object.position.copy(final); layer.object.scale.setScalar(1);
      }
      bases.uniforms.uOpacity.value = (replayEdit ? editVisible : transcript)*smooth(ramp(q,.46,.51))*.8;
      pod.object.position.x -= (1-edit.pod)*3;
      pod.object.position.y += (1-edit.pod)*1.5;
      cetus.object.position.y += (1-edit.cetus)*3;
      pod.uniforms.uOpacity.value = editVisible*edit.pod*(1-.55*edit.leave)*.85;
      cetus.uniforms.uOpacity.value = editVisible*edit.cetus*(1-.55*edit.leave)*.85;
      linker.uniforms.uOpacity.value = editVisible*edit.cetus*.4;
      podSlot.object.position.copy(final); cetusSlot.object.position.copy(final);
      podSlot.uniforms.uOpacity.value = cetusSlot.uniforms.uOpacity.value = 0;
      if (placement) {
        for (const [name,item] of Object.entries(items)) {
          item.layer.object.position.copy(final).add(item.offset);
          item.layer.uniforms.uOpacity.value = .9;
          item.layer.uniforms.uDock.value = item.placed ? .35 : 0;
          const target = screenOf(fixedCenter(item)), actual = screenOf(fixedCenter(item).add(item.offset));
          const close = !!dragging && dragging.item === item && near(item);
          item.slot.uniforms.uOpacity.value = close && !item.placed ? .68 : 0;
          if (item.button) {
            item.button.style.transform = `translate3d(${actual.x}px,${actual.y}px,0) translate(-50%,-50%)`;
            item.button.classList.toggle('is-placed',item.placed);
            item.button.setAttribute('aria-pressed',String(item.placed));
          }
          if (item.drop) {
            item.drop.style.transform = `translate3d(${target.x}px,${target.y}px,0) translate(-50%,-50%)`;
            item.drop.classList.toggle('is-near',close);
          }
          if (item.guide) {
            item.guide.setAttribute('d',`M${actual.x},${actual.y} Q${(actual.x+target.x)/2},${Math.min(actual.y,target.y)-40} ${target.x},${target.y}`);
            item.guide.style.opacity = item.placed ? '0' : '.45';
          }
          if (item.hit) {
            item.hit.setAttribute('d',item.placed ? '' : hitPath(item));
            item.hit.style.pointerEvents = item.placed ? 'none' : 'all';
          }
        }
        linker.uniforms.uOpacity.value = Object.values(items).every(i=>i.placed) ? .36 : 0;
      } else {
        pod.uniforms.uDock.value = cetus.uniforms.uDock.value = placementInitialized && replayEdit ? Math.max(.35,edit.fix) : edit.fix;
      }
      for (const layer of [rna,bases]) {
        layer.uniforms.uFix.value = editVisible > .01 ? edit.fix : 0;
        layer.uniforms.uPulse.value = editVisible > .01 ? edit.pulse : 0;
      }
      context.uniforms.uOpacity.value = windowOf(q,.31,.34,.415,.47)*.32;
      amyloid.uniforms.uOpacity.value = windowOf(q,.608,.647,.785,.815)*.85;
      amyloid.uniforms.uGather.value = smooth(ramp(q,.615,.755));
      for (const layer of layers) {
        const u = layer.material.uniforms;
        u.uTime.value = time; u.uMotion.value = motion;
        u.uPR.value = Math.min(devicePixelRatio,small?1.5:1.75);
        layer.visible = u.uOpacity.value > .001;
      }
      const codonOn = replayEdit ? editVisible : windowOf(q,.495,.523,.598,.622)+windowOf(q,.806,.826,.902,.924);
      const codon = labels.codon;
      if (codon) {
        codon.style.setProperty('--fix', editVisible > .01 ? edit.fix.toFixed(3) : '0');
        codon.setAttribute('aria-label', edit.fix > .5 && editVisible > .01 ? 'UGC, intended APOE3-like RNA sequence' : 'CGC, APOE4 RNA target');
      }
      label('codon', final.clone().add(new THREE.Vector3(.62,.95,.2)),codonOn,camera,-18);
      label('pod', fixedCenter(items.pod).add(new THREE.Vector3(-.45,-.25,0)),placement?0:editVisible*edit.pod,camera,22);
      label('cetus', fixedCenter(items.cetus),placement?0:editVisible*edit.cetus,camera,small?-85:-28);
      label('amyloid',new THREE.Vector3(-2.7,2.1,1.2),amyloid.uniforms.uOpacity.value,camera,-14);
      label('nucleus',new THREE.Vector3(.15,-.3,.45),windowOf(q,.26,.28,.326,.348),camera,30);
      return edit;
    },
  };
}
