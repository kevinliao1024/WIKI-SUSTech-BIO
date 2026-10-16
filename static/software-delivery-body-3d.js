/* Original anatomy scene. Local three.js; original continuous mesh; no model simulation. */
import * as THREE from './vendor/three/three.module.js';

const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const V = p => new THREE.Vector3(...p);
const STAGES = ['Administration and absorption', 'Circulation and tissue distribution', 'Blood–brain barrier transport', 'Cell uptake and expression', 'RNA editing', 'Clearance and degradation'];

async function readGeometry(url) {
  const response = await fetch(url, {credentials: 'same-origin'});
  if (!response.ok) throw new Error(`Body surface request failed (${response.status})`);
  const mesh = await response.json();
  let positions, normals, indices;
  if (Array.isArray(mesh.positions)) {
    positions = new Float32Array(mesh.positions); normals = new Float32Array(mesh.normals); indices = new Uint32Array(mesh.indices);
  } else {
    const result = await fetch(new URL(mesh.buffer, new URL(url, document.baseURI)), {credentials: 'same-origin'});
    if (!result.ok) throw new Error('Body surface buffer unavailable');
    const buffer = await result.arrayBuffer();
    positions = new Float32Array(buffer, mesh.positions.byte_offset, mesh.positions.count);
    normals = new Float32Array(buffer, mesh.normals.byte_offset, mesh.normals.count);
    indices = new Uint32Array(buffer, mesh.indices.byte_offset, mesh.indices.count);
  }
  if (!positions.length || positions.length % 3 || normals.length !== positions.length || !indices.length || indices.length % 3) throw new Error('Invalid body surface');
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

export async function mountBody(root) {
  const viewport = root.querySelector('[data-body-3d]');
  if (!viewport || viewport.hasAttribute('data-body-3d-ready')) return;
  const geometry = await readGeometry(viewport.getAttribute('data-body-mesh'));
  const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const canvas = renderer.domElement;
  canvas.setAttribute('data-body-3d-canvas', '');
  canvas.setAttribute('role', 'img'); canvas.tabIndex = 0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 20);
  camera.position.set(0, 0.90, 3.8); camera.lookAt(0, 0.90, 0);
  const pivot = new THREE.Group(); pivot.position.y = .88; scene.add(pivot);
  const anatomy = new THREE.Group(); anatomy.position.y = -.88; pivot.add(anatomy);
  const internal = new THREE.Group(); anatomy.add(internal);
  const ambient = new THREE.HemisphereLight(0xfff9f1, 0x78748f, 1.45); scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffe8d5, 2.7); key.position.set(-2, 3.4, 3.3); scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8dfff, 1.2); fill.position.set(2.4, 1.7, 1.6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe4dbfa, 2.8); rim.position.set(1.1, 2.5, -2); scene.add(rim);
  const skin = new THREE.MeshPhysicalMaterial({color: 0xd3b1a3, roughness: .48, metalness: 0, transparent: true, opacity: .55, depthWrite: false, side: THREE.FrontSide, clearcoat: .08, clearcoatRoughness: .65, sheen: .25, sheenColor: new THREE.Color(0xf2d6c1), sheenRoughness: .8});
  const body = new THREE.Mesh(geometry, skin); body.renderOrder = 5; anatomy.add(body);
  const floorCanvas = document.createElement('canvas'); floorCanvas.width = floorCanvas.height = 128;
  const floorContext = floorCanvas.getContext('2d');
  const gradient = floorContext.createRadialGradient(64,64,5,64,64,63); gradient.addColorStop(0,'rgba(67,48,66,.23)'); gradient.addColorStop(1,'rgba(67,48,66,0)'); floorContext.fillStyle = gradient; floorContext.fillRect(0,0,128,128);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(.68,.46), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(floorCanvas), transparent:true, depthWrite:false}));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,.003,.035); scene.add(floor);

  const materials = {
    brain: new THREE.MeshStandardMaterial({color:0xa784b9,roughness:.56,emissive:0x22112f,emissiveIntensity:.1}),
    liver: new THREE.MeshStandardMaterial({color:0xa5654b,roughness:.52,emissive:0x562611,emissiveIntensity:.04}),
    heart: new THREE.MeshStandardMaterial({color:0xad596d,roughness:.55}),
    lung: new THREE.MeshStandardMaterial({color:0x8facb4,roughness:.7,transparent:true,opacity:.26,depthWrite:false}),
    blood: new THREE.MeshStandardMaterial({color:0xb76a80,roughness:.5,emissive:0x5c2238,emissiveIntensity:.15}),
    vein: new THREE.MeshStandardMaterial({color:0x7791b0,roughness:.5,transparent:true,opacity:.6,depthWrite:false}),
    lymph: new THREE.MeshStandardMaterial({color:0x369b87,roughness:.46,emissive:0x123f35,emissiveIntensity:.15}),
    barrier: new THREE.MeshStandardMaterial({color:0x7d70be,roughness:.5,transparent:true,opacity:.35,depthWrite:false}),
    signal: new THREE.MeshStandardMaterial({color:0xcfa35d,roughness:.32,emissive:0xc27a1c,emissiveIntensity:.22})
  };
  function ellipsoid(position, scale, material, segments=36) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1,segments,24),material); mesh.position.copy(V(position)); mesh.scale.set(...scale); internal.add(mesh); return mesh;
  }
  function tube(points, radius, material, segments=50) {
    const curve = new THREE.CatmullRomCurve3(points.map(V));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,8,false), material); internal.add(mesh); return {mesh,curve};
  }
  // Organ forms convey location and relationships, not patient-specific anatomy.
  [-1,1].forEach(side => {
    const g = new THREE.SphereGeometry(1,48,32), p = g.attributes.position;
    for (let i=0;i<p.count;i+=1) {
      const x=p.getX(i), y=p.getY(i), z=p.getZ(i);
      const theta=Math.atan2(z,x), phi=Math.acos(clamp(y,-1,1));
      const fold=1 + .035*Math.sin(theta*13+phi*5)*Math.sin(phi*16) + .012*Math.cos(theta*25-phi*9);
      p.setXYZ(i,x*fold,y*fold,z*fold);
    }
    g.computeVertexNormals();
    const hemi=new THREE.Mesh(g,materials.brain); hemi.position.set(side*.029,1.64,-.003); hemi.scale.set(.040,.064,.065); internal.add(hemi);
    ellipsoid([side*.027,1.594,-.036],[.032,.023,.027],materials.brain);
    ellipsoid([side*.068,1.245,.005],[.048,.103,.047],materials.lung);
  });
  const liver=ellipsoid([-.040,1.115,.015],[.065,.040,.040],materials.liver); liver.rotation.z=-.15;
  const liverLeft=ellipsoid([.025,1.125,.015],[.045,.025,.028],materials.liver); liverLeft.rotation.z=-.1;
  const heart=ellipsoid([.022,1.235,.052],[.030,.048,.030],materials.heart); heart.rotation.z=-.22;
  const brainHalo=ellipsoid([0,1.64,-.002],[.078,.075,.078],materials.barrier);
  const depot=ellipsoid([-.112,.54,.078],[.016,.018,.009],materials.lymph);
  [.65,.77,.86].forEach((y,i)=>ellipsoid([-.105+i*.012,y,.047],[.006,.009,.006],materials.lymph,16));

  const circulation = [
    [[.012,1.23,.045],[.012,1.34,.014],[.004,1.46,.01],[.005,1.58,.012]],
    [[.012,1.25,.045],[.002,1.15,.035],[-.007,.99,.025],[-.008,.88,.02]],
    [[-.008,.88,.02],[-.10,.81,.026],[-.105,.57,.038],[-.11,.32,.02],[-.11,.10,.035]],
    [[-.008,.88,.02],[.10,.81,.026],[.105,.57,.038],[.11,.32,.02],[.11,.10,.035]],
    [[.01,1.35,.02],[-.17,1.36,.02],[-.255,1.19,.028],[-.31,1.02,.035],[-.39,.83,.025]],
    [[.01,1.35,.02],[.17,1.36,.02],[.255,1.19,.028],[.31,1.02,.035],[.39,.83,.025]],
    [[0,1.18,.033],[-.035,1.14,.025],[-.085,1.115,.020]],
  ];
  circulation.forEach((points,i)=>tube(points,i<2?.0045:.0028,materials.blood));
  circulation.slice(1,6).forEach(points=>tube(points.map(([x,y,z])=>[x+.012,y,z-.017]),.0022,materials.vein));
  [-1,1].forEach(side=>{
    tube([[.002,1.56,.012],[side*.035,1.62,.055],[side*.050,1.67,.030],[side*.034,1.684,-.016]],.0018,materials.blood,36);
    tube([[side*.011,1.46,.0],[side*.026,1.53,-.025],[side*.033,1.60,-.042]],.0016,materials.vein,24);
  });
  tube([[-.112,.54,.078],[-.108,.66,.052],[-.095,.80,.041],[-.05,.94,.021],[-.022,1.14,.0],[.005,1.35,.012]],.0022,materials.lymph);
  const paths = [
    {stage:0,points:[[-.112,.54,.078],[-.108,.66,.052],[-.095,.80,.041],[-.05,.94,.021],[-.022,1.14,.0],[.005,1.35,.012]]},
    {stage:0,points:[[-.112,.54,.078],[-.10,.70,.04],[-.06,.88,.03],[.007,1.13,.036],[.022,1.235,.052]]},
    {stage:1,points:[[.022,1.235,.052],[.012,1.34,.014],[.004,1.46,.01],[.005,1.58,.012],[.029,1.65,.04]]},
    {stage:1,points:[[.022,1.235,.052],[0,1.18,.033],[-.035,1.14,.025],[-.085,1.115,.020]]},
    {stage:1,points:[[.012,1.34,.014],[-.17,1.36,.02],[-.255,1.19,.028],[-.31,1.02,.035]]},
    {stage:2,points:[[.005,1.58,.012],[.035,1.625,.053],[.055,1.655,.038],[.029,1.66,.018]]},
    {stage:3,points:[[.047,1.66,.038],[.026,1.65,.024],[.016,1.66,.011]]},
    {stage:4,points:[[.016,1.66,.011],[.025,1.667,.024],[.039,1.655,.029]]},
    {stage:5,points:[[.003,1.180,.033],[-.021,1.152,.025],[-.040,1.128,.020],[-.064,1.115,.018]]},
    {stage:5,points:[[.028,1.132,.025],[.005,1.125,.027],[-.026,1.112,.024],[-.052,1.106,.020]]}
  ];
  const particleGeometry=new THREE.SphereGeometry(.007,12,8);
  const routes=paths.map(path=>{
    const activeMaterial=new THREE.MeshStandardMaterial({color:path.stage===5?0xc99440:path.stage===0?0x258d78:0x7a55bd,emissive:path.stage===5?0xc47d16:0x6f44aa,emissiveIntensity:.35,roughness:.32});
    const route=tube(path.points,.0026,activeMaterial,path.stage>1?28:54);
    const particles=Array.from({length:3},()=>{const dot=new THREE.Mesh(particleGeometry,activeMaterial);internal.add(dot);return dot;});
    return {...path,...route,particles};
  });
  let yaw=-.18,pitch=0,zoom=1,stage=Number(root.dataset.bodyCurrentStage||0),phase=0,stageProgress=0,surface=false,raf=0,drag=null,visible=true;
  function render() {
    raf=0;
    if(!visible||document.hidden)return;
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if (!width||!height) return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    // Preserve a full human silhouette on narrow canvases, with a little breathing room.
    const distance=Math.max(3.65,.52/(Math.tan(Math.PI/12)*camera.aspect));
    camera.position.z=distance/zoom;camera.updateProjectionMatrix();
    pivot.rotation.set(pitch,yaw,0);
    renderer.render(scene,camera);
    viewport.dataset.bodyYaw=yaw.toFixed(4);viewport.dataset.bodyPitch=pitch.toFixed(4);
  }
  function requestDraw(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
  function applyStage(){
    materials.brain.emissiveIntensity=[1,2,3,4].includes(stage)?.35:.05;
    materials.liver.emissiveIntensity=stage===5||stage===1?.32:.03;
    materials.blood.emissiveIntensity=stage===1?.45:.08;
    materials.lymph.emissiveIntensity=stage===0?.45:.08;
    brainHalo.visible=[2,3,4].includes(stage)&&!surface;
    brainHalo.material.opacity=(stage===2?.23:.12)+.035*Math.sin(phase*Math.PI*2);
    routes.forEach(route=>{
      const active=route.stage===stage&&!surface;route.mesh.visible=active;
      route.particles.forEach((dot,i)=>{
        const t=stage===5?clamp(stageProgress*1.2-i*.1,0,1):(phase+i/3)%1;
        dot.visible=active;dot.position.copy(route.curve.getPoint(t));
        dot.scale.setScalar(stage===5?Math.max(.06,1-t):.82+.18*Math.sin((phase+i/3)*Math.PI*2));
      });
    });
    canvas.setAttribute('aria-label',`Rotatable three-dimensional human anatomy. ${STAGES[stage]}. Drag or use arrow keys to rotate; Home resets the view.`);
    requestDraw();
  }
  root.addEventListener('body:stage',event=>{stage=event.detail.stage;phase=0;stageProgress=0;applyStage();});
  root.addEventListener('body:progress',event=>{stageProgress=event.detail.phase;phase=event.detail.flowPhase??event.detail.phase;applyStage();});
  function stopSequence(){const play=root.querySelector('[data-body-play]');if(play?.getAttribute('aria-pressed')==='true')play.click();}
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&event.button!==0)return; stopSequence();drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    yaw+=(event.clientX-drag.x)*.012;pitch=clamp(pitch+(event.clientY-drag.y)*.008,-.65,.65);drag.x=event.clientX;drag.y=event.clientY;requestDraw();
  });
  const endDrag=event=>{if(drag?.id===event.pointerId)drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);};
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
  function reset(){stopSequence();yaw=-.18;pitch=0;zoom=1;requestDraw();}
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','=','-'].includes(event.key))return;
    event.preventDefault();stopSequence();
    if(event.key==='ArrowLeft')yaw-=.18;if(event.key==='ArrowRight')yaw+=.18;
    if(event.key==='ArrowUp')pitch=clamp(pitch-.12,-.65,.65);if(event.key==='ArrowDown')pitch=clamp(pitch+.12,-.65,.65);
    if(event.key==='+'||event.key==='=')zoom=clamp(zoom+.08,.8,1.35);if(event.key==='-')zoom=clamp(zoom-.08,.8,1.35);
    if(event.key==='Home')reset();requestDraw();
  });
  root.querySelector('[data-body-3d-reset]').addEventListener('click',reset);
  const surfaceControl=root.querySelector('[data-body-3d-surface]');
  surfaceControl.addEventListener('click',()=>{
    surface=!surface;surfaceControl.setAttribute('aria-pressed',String(surface));surfaceControl.textContent=surface?'Show pathways':'Surface view';
    skin.opacity=surface?1:.55;skin.transparent=!surface;skin.depthWrite=surface;skin.needsUpdate=true;
    internal.visible=!surface;applyStage();
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();root.querySelector('[data-body-3d-status]').textContent='3D view temporarily unavailable. Reload to restore the view.';});
  if(window.ResizeObserver)new ResizeObserver(requestDraw).observe(viewport);else window.addEventListener('resize',requestDraw,{passive:true});
  if(window.IntersectionObserver)new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)requestDraw();},{rootMargin:'100px'}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw();});
  viewport.append(canvas);
  viewport.querySelector('.delivery-body__human').setAttribute('hidden','');
  root.querySelector('[data-body-3d-controls]').hidden=false;
  root.querySelector('[data-body-3d-status]').textContent='Drag to rotate · arrow keys to orbit · Home to reset';
  viewport.setAttribute('data-body-3d-ready','true');
  viewport.dataset.bodyVertices=String(geometry.attributes.position.count);
  viewport.dataset.bodyTriangles=String(geometry.index.count/3);
  applyStage();render();
}
