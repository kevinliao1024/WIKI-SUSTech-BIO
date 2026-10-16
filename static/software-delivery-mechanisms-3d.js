/* Original illustrative mechanisms. Local geometry only; no model values or simulation. */
import * as THREE from './vendor/three/three.module.js';

const V = p => new THREE.Vector3(...p);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const MAT = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.43,metalness:.02,...extra});
const interval = (p,a,b) => clamp((p-a)/(b-a),0,1);
const ease = t => t*t*(3-2*t);
function cargo(parent,scale=1){
  const group=new THREE.Group(),shell=MAT(0xc99034,{roughness:.36}),capsomer=MAT(0xf3ce7a,{roughness:.52});
  const geometry=new THREE.IcosahedronGeometry(.071,0);group.add(new THREE.Mesh(geometry,shell));
  const seen=new Set(),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(4)).join(',');if(seen.has(key))continue;seen.add(key);sphere(group,[p.getX(i),p.getY(i),p.getZ(i)],[.018,.018,.018],capsomer,10);}
  group.scale.setScalar(scale);parent.add(group);return group;
}
function focus(view,active,step){
  view.host.dataset.mechanismActive=String(active);view.host.dataset.mechanismStep=step;
  view.host.closest('.delivery-mechanisms__card').classList.toggle('is-active',active);
}
function reveal(route,fraction){route.mesh.geometry.setDrawRange(0,Math.floor(route.mesh.geometry.index.count*clamp(fraction,0,1)/3)*3);}

function sphere(group,position,scale,material,segments=28){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,segments,20),material);mesh.position.copy(V(position));mesh.scale.set(...scale);group.add(mesh);return mesh;
}
function tube(group,points,radius,material,segments=54){
  const curve=new THREE.CatmullRomCurve3(points.map(V));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,8,false),material);group.add(mesh);return {mesh,curve};
}
function roundedBox(width,height,depth,radius){
  const w=width/2,h=height/2,r=radius,s=new THREE.Shape();
  s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1,curveSegments:8});g.translate(0,0,-depth/2);return g;
}
function letter(text,color){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle=color;c.beginPath();c.arc(64,64,53,0,Math.PI*2);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();c.font='bold 67px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.fillText(text,64,66);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false}));sprite.scale.set(.19,.19,1);sprite.renderOrder=10;return sprite;
}

function createView(host,type,root){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0xffffff,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.01,30),pivot=new THREE.Group();scene.add(pivot);
  const ambient=new THREE.HemisphereLight(0xfffaf3,0x6f6885,.95);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xffeedc,2.7);key.position.set(-3,4,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xdedbff,.95);fill.position.set(3,1,2);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xd9e8ef,1.7);rim.position.set(2,2,-3);scene.add(rim);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('data-mechanism-canvas',type);
  canvas.setAttribute('aria-label',`${type==='barrier'?'Blood–brain barrier transport':'Intracellular expression and RNA editing'} in three dimensions. Drag or use arrow keys to rotate; Home resets.`);
  const initial={yaw:type==='barrier'?-.22:-.20,pitch:type==='barrier'?.13:.18};
  let yaw=initial.yaw,pitch=initial.pitch,raf=0,drag=null,visible=true;
  function render(){
    raf=0;if(!visible||document.hidden)return;
    const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    camera.position.set(0,.04,Math.max(3.70,1.52/(Math.tan(Math.PI/11.25)*camera.aspect)));camera.lookAt(0,0,0);camera.updateProjectionMatrix();pivot.rotation.set(pitch,yaw,0);
    renderer.render(scene,camera);host.dataset.mechanismYaw=yaw.toFixed(4);host.dataset.mechanismPitch=pitch.toFixed(4);
  }
  function draw(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
  function stop(){const b=root.querySelector('[data-body-play]');if(b?.getAttribute('aria-pressed')==='true')b.click();}
  function reset(){stop();yaw=initial.yaw;pitch=initial.pitch;draw();}
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;stop();drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;yaw+=(e.clientX-drag.x)*.012;pitch=clamp(pitch+(e.clientY-drag.y)*.008,-.85,.85);drag.x=e.clientX;drag.y=e.clientY;draw();});
  const end=e=>{if(drag?.id===e.pointerId)drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();stop();if(e.key==='Home'){reset();return;}if(e.key==='ArrowLeft')yaw-=.18;if(e.key==='ArrowRight')yaw+=.18;if(e.key==='ArrowUp')pitch=clamp(pitch-.12,-.85,.85);if(e.key==='ArrowDown')pitch=clamp(pitch+.12,-.85,.85);draw();});
  root.querySelector(`[data-mechanism-reset='${type}']`).addEventListener('click',reset);
  if(window.ResizeObserver)new ResizeObserver(draw).observe(host);else window.addEventListener('resize',draw,{passive:true});
  if(window.IntersectionObserver)new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)draw();},{rootMargin:'100px'}).observe(host);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();const wrapper=host.closest('[data-delivery-mechanisms-3d]');wrapper.querySelector('[data-mechanism-scenes]').hidden=true;wrapper.querySelector('[data-mechanism-fallback]').hidden=false;wrapper.dataset.mechanismReady='false';});
  host.append(canvas);host.dataset.mechanismReady='true';
  return {group:pivot,draw,host,renderer};
}

function buildBarrier(view){
  const g=view.group;
  const shellMat=MAT(0x469b9c,{transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide});
  const membraneMat=MAT(0x4f9997,{roughness:.56}),tailMat=MAT(0x8db9ad,{transparent:true,opacity:.5,depthWrite:false});
  const shell=new THREE.Mesh(roundedBox(1.04,1.34,.72,.18),shellMat);g.add(shell);
  // A cutaway endothelial cell with two membrane leaflets on each transport face.
  const headGeo=new THREE.SphereGeometry(.024,10,8),tailGeo=new THREE.CylinderGeometry(.006,.006,.065,5);tailGeo.rotateZ(Math.PI/2);
  [-1,1].forEach(side=>{
    for(let y=-.54;y<=.55;y+=.13)for(let z=-.27;z<=.28;z+=.135){
      [.495,.555].forEach(x=>{const head=new THREE.Mesh(headGeo,membraneMat);head.position.set(side*x,y,z);g.add(head);});
      const tail=new THREE.Mesh(tailGeo,tailMat);tail.position.set(side*.525,y,z);g.add(tail);
    }
    // Junction edges frame the tissue barrier without covering the cargo path.
    tube(g,[[side*.53,-.60,-.30],[side*.53,-.65,0],[side*.53,-.60,.30]],.019,membraneMat,24);
    tube(g,[[side*.53,.60,-.30],[side*.53,.65,0],[side*.53,.60,.30]],.019,membraneMat,24);
  });
  sphere(g,[-.04,-.30,-.14],[.23,.16,.16],MAT(0x987bb3,{transparent:true,opacity:.45,depthWrite:false}));
  for(let i=0;i<3;i++)tube(g,[[-.36,-.29-i*.065,-.08],[-.20,-.18-i*.07,-.10],[.09,-.22-i*.07,-.11],[.28,-.31-i*.045,-.08]],.009,MAT(0x8aafaa,{transparent:true,opacity:.42,depthWrite:false}),26);
  // Blood and interstitial boundaries stay behind the transport cutaway.
  const boundaryMat=MAT(0x99b7c3,{transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide});
  sphere(g,[1.17,0,-.16],[.31,.56,.30],boundaryMat);
  const bloodMat=MAT(0xb85775,{roughness:.6});
  const redCells=[];
  [-.42,.07,.47].forEach((y,i)=>{
    const geo=new THREE.SphereGeometry(1,28,18),v=geo.attributes.position;
    for(let j=0;j<v.count;j++){const x=v.getX(j),z=v.getZ(j),d=x*x+z*z;v.setY(j,v.getY(j)*(.32+.68*Math.min(1,d*2.5)));}geo.computeVertexNormals();
    const cell=new THREE.Mesh(geo,bloodMat);cell.scale.set(.14,.065,.12);cell.position.set(-1.17+(i%2)*.13,y,-.14);cell.rotation.set(.2,.1,.4+i*.35);g.add(cell);redCells.push(cell);
  });
  const route=tube(g,[[-1.29,.20,.22],[-.75,.20,.22],[-.44,.20,.22],[0,.22,.22],[.43,.20,.22],[.76,.20,.22],[1.28,.20,.22]],.009,MAT(0x82709d,{transparent:true,opacity:.30,depthWrite:false}),72);
  const recycled=tube(g,[[.05,.19,.22],[.22,-.02,.24],[.12,-.48,.25],[-.67,-.45,.25],[-1.19,-.24,.23]],.008,MAT(0x509c90,{transparent:true,opacity:.40,depthWrite:false}),50);
  const particle=cargo(g,1.15),returnCargo=cargo(g,.72);
  const vesicle=new THREE.Group();g.add(vesicle);
  const vesicleMat=MAT(0x399e9a,{transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide});
  sphere(vesicle,[0,0,0],[.166,.166,.166],vesicleMat,32);
  const ringMat=MAT(0x408f89,{transparent:true,opacity:.7,depthWrite:false});
  for(let axis=0;axis<2;axis++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.168,.007,6,48),ringMat);if(axis)ring.rotation.y=Math.PI/2;vesicle.add(ring);}
  const pitLeft=new THREE.Mesh(new THREE.TorusGeometry(.15,.018,10,36),membraneMat);pitLeft.rotation.y=Math.PI/2;pitLeft.position.set(-.53,.20,.22);g.add(pitLeft);
  const pitRight=pitLeft.clone();pitRight.position.x=.53;g.add(pitRight);
  const releaseHalo=new THREE.Mesh(new THREE.TorusGeometry(.16,.012,8,40),MAT(0x478f87,{transparent:true,opacity:0,depthWrite:false}));releaseHalo.rotation.y=Math.PI/2;releaseHalo.position.set(.57,.2,.22);g.add(releaseHalo);
  // Intracellular loss ends within the endothelium, separate from release to ISF.
  const lossRoute=tube(g,[[.05,.10,.23],[.19,-.08,.25],[.28,-.29,.23],[.25,-.43,.20]],.009,MAT(0xb58a51,{transparent:true,opacity:.40,depthWrite:false}),40);
  const lost=cargo(g,.9);
  return(stage,phase)=>{
    const active=stage===2,p=clamp(phase,0,1),loss=stage===5;
    focus(view,active||loss,loss?'degradation':!active?'overview':p<.27?'uptake':p<.69?'vesicle transit':'release');
    const t=active?(p<.27?.29*ease(p/.27):p<.69?.29+.41*ease((p-.27)/.42):.70+.30*ease((p-.69)/.31)):.08;
    particle.position.copy(route.curve.getPoint(t));particle.rotation.set(.2+t*2,t*3,.12);particle.visible=!loss;
    const envelope=active?ease(interval(p,.15,.30))*(1-ease(interval(p,.68,.82))):0;
    vesicle.position.copy(particle.position);vesicle.visible=active&&envelope>.002;vesicle.scale.setScalar(.35+.65*envelope);
    vesicleMat.opacity=.28*envelope;ringMat.opacity=.8*envelope;
    pitLeft.scale.setScalar(1+.15*Math.sin(Math.PI*interval(p,0,.3)));pitRight.scale.setScalar(1+.15*Math.sin(Math.PI*interval(p,.66,.88)));
    releaseHalo.visible=active&&p>.69&&p<.94;releaseHalo.scale.setScalar(1+interval(p,.69,.94)*.85);releaseHalo.material.opacity=.75*(1-interval(p,.69,.94));
    returnCargo.visible=active&&p>.42&&p<.94;returnCargo.position.copy(recycled.curve.getPoint(ease(interval(p,.42,.94))));
    recycled.mesh.material.opacity=active?.5:.14;route.mesh.material.opacity=active?.45:.18;
    membraneMat.emissive.setHex(active?0x174b44:0x000000);membraneMat.emissiveIntensity=active?.12:0;
    lost.visible=loss;lossRoute.mesh.visible=loss;
    if(loss){lost.position.copy(lossRoute.curve.getPoint(ease(p)));lost.scale.setScalar(.9*(1-p));lost.rotation.set(p*3,p*4,0);}
    redCells.forEach((cell,i)=>{cell.position.y=[-.42,.07,.47][i]+(active?Math.sin(p*Math.PI*2+i)*.025:0);});
    view.host.dataset.cargoPosition=particle.position.toArray().map(v=>v.toFixed(3)).join(',');
    view.host.dataset.vesicleEnvelope=envelope.toFixed(3);view.draw();
  };
}

function buildCell(view,wrapper){
  const g=view.group;
  const shellMat=MAT(0x6fa79c,{transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide});
  // An open front exposes the nucleus and cytoplasmic RNA; it is a schematic cutaway.
  const shell=new THREE.Mesh(new THREE.SphereGeometry(1,60,36,Math.PI,Math.PI),shellMat);shell.scale.set(1.28,.79,.69);g.add(shell);
  const rim=[],innerRim=[];
  for(let i=0;i<=80;i++){const t=i/80*Math.PI*2;rim.push([Math.cos(t)*1.28,Math.sin(t)*.79,0]);innerRim.push([Math.cos(t)*1.245,Math.sin(t)*.755,.012]);}
  tube(g,rim,.021,MAT(0x3c8d82),90);tube(g,innerRim,.009,MAT(0x88b9a9),90);
  for(let i=0;i<70;i++){const t=i/70*Math.PI*2;sphere(g,[Math.cos(t)*1.28,Math.sin(t)*.79,0],[.013,.013,.013],MAT(0x84b3a3),8);}
  const nucleusMat=MAT(0x9570b7,{transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide});
  sphere(g,[-.48,.14,-.10],[.40,.37,.33],nucleusMat,44);
  sphere(g,[-.48,.14,-.10],[.365,.337,.30],MAT(0xbd9acf,{transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide}),36);
  const poreMat=MAT(0x735093,{roughness:.52});
  [[-.12,.20,.15],[-.33,.47,.10],[-.70,.37,.12]].forEach((p,i)=>{const pore=new THREE.Mesh(new THREE.TorusGeometry(.043,.012,8,20),poreMat);pore.position.set(...p);pore.rotation.y=i===0?1.05:-.2;g.add(pore);});
  const dnaA=[],dnaB=[],dnaMat=[MAT(0x735095),MAT(0xb576aa)];
  for(let i=0;i<=72;i++){const t=i/72,a=t*Math.PI*5;dnaA.push([-.49+Math.cos(a)*.105,-.11+t*.50,-.015+Math.sin(a)*.105]);dnaB.push([-.49-Math.cos(a)*.105,-.11+t*.50,-.015-Math.sin(a)*.105]);}
  tube(g,dnaA,.014,dnaMat[0],90);tube(g,dnaB,.014,dnaMat[1],90);
  for(let i=0;i<=72;i+=6)tube(g,[dnaA[i],dnaB[i]],.009,MAT(0xc9a6ca),6);
  // Mitochondrial folds and endoplasmic contours add depth without adding model states.
  [[-.73,-.39,-.15],[.80,-.02,-.19],[.30,.53,-.24]].forEach((p,i)=>{
    const organ=new THREE.Group();organ.position.set(...p);organ.rotation.z=i*.45-.30;g.add(organ);
    sphere(organ,[0,0,0],[.16,.065,.065],MAT(0xae806e,{roughness:.65}),24);
    const folds=[];for(let j=0;j<=18;j++){const t=j/18;folds.push([-.12+t*.24,Math.sin(t*Math.PI*8)*.031,.058]);}tube(organ,folds,.007,MAT(0x775a58),36);
  });
  for(let i=0;i<3;i++)tube(g,[[-.87,.28-i*.08,-.24],[-.96,.04-i*.07,-.22],[-.80,-.20-i*.05,-.20],[-.43,-.25-i*.07,-.20]],.012,MAT(0x72a39a,{transparent:true,opacity:.45,depthWrite:false}),30);
  const rnaMat=MAT(0x278a84,{roughness:.48}),message=[];
  for(let i=0;i<=60;i++){const t=i/60;message.push([-.15+t*.81,.16+Math.sin(t*Math.PI*6)*.035,.18+Math.cos(t*Math.PI*4)*.02]);}
  const messageRoute=tube(g,message,.018,rnaMat,90);
  // The ribosome straddles the exported mRNA; the editor is produced in the cytoplasm.
  const ribosome=new THREE.Group();ribosome.position.set(.34,.16,.18);g.add(ribosome);
  sphere(ribosome,[0,.047,-.015],[.125,.089,.08],MAT(0x769796),32);
  sphere(ribosome,[.005,-.042,.013],[.095,.052,.078],MAT(0xb4c0ae),28);
  const editor=new THREE.Group();g.add(editor);
  const repeatMat=MAT(0xc48d32,{roughness:.40}),catalyticMat=MAT(0xd99a4e,{roughness:.36}),editorBack=MAT(0x9f6323);
  const repeats=[];
  // A stylized curved repeat assembly conveys RNA recognition, not an atomic structure.
  for(let i=0;i<8;i++){const a=-1.12+i/7*2.24;const p=[Math.sin(a)*.18,-Math.cos(a)*.14,0];repeats.push(p);const bead=sphere(editor,p,[.043,.052,.039],repeatMat,18);bead.rotation.z=-a*.65;}
  tube(editor,repeats,.018,editorBack,35);
  sphere(editor,[.205,-.033,.008],[.09,.083,.069],catalyticMat,28);sphere(editor,[.247,-.083,.01],[.055,.054,.050],catalyticMat,24);
  const targetGroup=new THREE.Group();g.add(targetGroup);const target=[];
  for(let i=0;i<=72;i++){const t=i/72;target.push([-.07+t*1.03,-.37+Math.sin(t*Math.PI*6)*.027,.22+Math.cos(t*Math.PI*5)*.02]);}
  const targetRoute=tube(targetGroup,target,.018,rnaMat,96);
  for(let i=0;i<12;i++){
    const t=(i+.5)/12,point=targetRoute.curve.getPoint(t);
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.055,6),rnaMat);stalk.position.copy(point).add(new THREE.Vector3(0,.023,0));targetGroup.add(stalk);
    sphere(targetGroup,[point.x,point.y+.056,point.z],[.023,.018,.018],MAT(i%3===0?0xc6b1cf:0x74b8ae),12);
  }
  const cytidine=letter('C','#9863a9'),uridine=letter('U','#368f81');cytidine.position.set(.43,-.365,.30);uridine.position.copy(cytidine.position);targetGroup.add(cytidine,uridine);
  const bindingHalo=new THREE.Mesh(new THREE.TorusGeometry(.17,.007,8,48),MAT(0xd39c4a,{transparent:true,opacity:0,depthWrite:false}));bindingHalo.position.set(.43,-.34,.26);g.add(bindingHalo);
  const uptake=tube(g,[[1.23,.38,.08],[.91,.37,.17],[.44,.38,.21],[-.03,.31,.18],[-.13,.20,.15],[-.46,.19,.11]],.008,MAT(0xc9a05b,{transparent:true,opacity:.22,depthWrite:false}),70);
  const transcription=tube(g,[[-.46,.19,.11],[-.26,.20,.14],[-.12,.20,.17],[.10,.16,.20],[.34,.16,.20],[.64,.18,.18]],.008,MAT(0x438e85,{transparent:true,opacity:.2,depthWrite:false}),60);
  const particle=cargo(g,.90),endosome=sphere(g,[0,0,0],[.12,.12,.12],MAT(0x509f94,{transparent:true,opacity:.18,depthWrite:false}),24);
  const transcript=sphere(g,[0,0,0],[.032,.032,.032],rnaMat,14);
  const nascent=[];for(let i=0;i<=28;i++){const t=i/28;nascent.push([.36+t*.30,.25+Math.sin(t*Math.PI*4)*.025,.20]);}
  const proteinChain=tube(g,nascent,.016,repeatMat,42);
  let lastLabel='';
  return(stage,phase)=>{
    const expression=stage===3,editing=stage===4,p=clamp(phase,0,1);
    const step=expression?(p<.36?'nuclear entry':p<.66?'transcription':'translation'):editing?(p<.32?'RNA binding':p<.66?'base conversion':'product release'):'overview';
    focus(view,expression||editing,step);
    particle.visible=expression&&p<.46;endosome.visible=expression&&p<.26;transcript.visible=expression&&p>.34&&p<.82;
    uptake.mesh.visible=expression;transcription.mesh.visible=expression;proteinChain.mesh.visible=expression&&p>.63&&p<.94;
    if(expression){
      particle.position.copy(uptake.curve.getPoint(ease(interval(p,0,.45))));particle.scale.setScalar(.90*(1-ease(interval(p,.38,.46))));particle.rotation.set(p*3,p*4,0);
      endosome.position.copy(particle.position);endosome.material.opacity=.20*(1-ease(interval(p,.18,.26)));
      transcript.position.copy(transcription.curve.getPoint(ease(interval(p,.35,.79))));reveal(messageRoute,interval(p,.43,.78));reveal(proteinChain,interval(p,.64,.90));
    }else reveal(messageRoute,1);
    let bind=0,release=0;
    if(editing){bind=ease(interval(p,0,.32));release=ease(interval(p,.69,1));editor.position.set(.65-.24*bind+.30*release,.28-.43*bind+.19*release,.21+.07*bind);editor.rotation.z=-.12*bind+.24*release;editor.rotation.y=.10*Math.sin(p*Math.PI);}
    else {editor.position.set(.65,.28,.21);editor.rotation.set(0,0,0);}
    const size=expression?.12+.88*ease(interval(p,.69,.94)):1;editor.scale.setScalar(size);editor.visible=!expression||p>.65;
    targetGroup.position.x=editing?.13*release:0;targetGroup.position.y=editing?-.05*release:0;
    const converted=editing&&p>=.57;cytidine.visible=!converted;uridine.visible=converted;
    const label=converted?'C → U':'C → U';if(lastLabel!==label){wrapper.querySelector('[data-mechanism-edit-state]').textContent=label;lastLabel=label;}
    wrapper.querySelector('[data-mechanism-edit-state]').classList.toggle('is-converted',converted);
    bindingHalo.visible=editing&&p>.26&&p<.80;bindingHalo.scale.setScalar(.85+.25*Math.sin(Math.PI*interval(p,.26,.80)));bindingHalo.material.opacity=editing?.60*Math.sin(Math.PI*interval(p,.26,.80)):0;
    nucleusMat.opacity=expression?.35:.28;repeatMat.emissive.setHex(editing?0x673a0b:0x000000);repeatMat.emissiveIntensity=editing?.10:0;
    view.host.dataset.baseState=converted?'U':'C';view.host.dataset.editorPosition=editor.position.toArray().map(v=>v.toFixed(3)).join(',');
    view.draw();
  };
}

export async function mountMechanisms(root){
  const wrapper=root.querySelector('[data-delivery-mechanisms-3d]');if(!wrapper||wrapper.dataset.mechanismReady==='true')return;
  const scenes=wrapper.querySelector('[data-mechanism-scenes]'),fallback=wrapper.querySelector('[data-mechanism-fallback]');
  let barrier,cell;
  try {
    barrier=createView(wrapper.querySelector("[data-mechanism-3d='barrier']"),'barrier',root);
    cell=createView(wrapper.querySelector("[data-mechanism-3d='cell']"),'cell',root);
    const updateBarrier=buildBarrier(barrier),updateCell=buildCell(cell,wrapper);
    let stage=Number(root.dataset.bodyCurrentStage||0),phase=0;
    const apply=()=>{updateBarrier(stage,phase);updateCell(stage,phase);};
    root.addEventListener('body:stage',event=>{stage=event.detail.stage;phase=0;apply();});
    root.addEventListener('body:progress',event=>{stage=event.detail.stage;phase=event.detail.phase;if(stage===2||stage===5)updateBarrier(stage,phase);if(stage===3||stage===4)updateCell(stage,phase);});
    fallback.setAttribute('hidden','');scenes.hidden=false;wrapper.dataset.mechanismReady='true';apply();
    root.dispatchEvent(new CustomEvent('body:mechanisms-ready',{detail:{views:['barrier','cell']}}));
  } catch(error){barrier?.renderer.dispose();cell?.renderer.dispose();scenes.hidden=true;fallback.removeAttribute('hidden');wrapper.dataset.mechanismReady='false';throw error;}
}
