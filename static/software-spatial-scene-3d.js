/* Saved spatial results, rendered in Three.js. No simulation or value interpolation.
 * Vessel geometry: tissue_geometry.py, TissueGeometry and _endothelial_positions.
 * The nominal cylinder has radius 12 µm, axis x, center y=z=0. Cell radii and
 * positions are read from the archive. Type-specific meshes are display glyphs,
 * not reconstructed cell morphology. Field cubes mark the sampled 10 µm voxels.
 */
import * as THREE from './vendor/three/three.module.js';

const FIELD = [[233,232,255],[157,156,244],[46,38,124]];
const EDIT = [[255,238,224],[232,155,60],[142,78,22]];
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const rgb = new THREE.Color();
function valueColor(value,range,palette) {
  const t=clamp((value-range[0])/(range[1]-range[0]||1),0,1)*2;
  const i=Math.min(1,Math.floor(t)),f=t-i;
  const c=palette[i].map((v,k)=>Math.round(v+(palette[i+1][k]-v)*f));
  return rgb.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);
}

export function createSpatialScenes(canvases,data,ranges,onContextLost) {
  // Probe before touching either visible canvas, so failure preserves the fallback.
  const probe=document.createElement('canvas');
  const gl=probe.getContext('webgl2');
  if(!gl) throw new Error('WebGL 2 is unavailable');
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  const size=data.bounds_um.map(b=>b[1]-b[0]);
  const center=data.bounds_um.map(b=>(b[0]+b[1])/2);
  const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3();
  const quaternion=new THREE.Quaternion();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let current=null;
  const views=[];

  function createView(canvas,kind) {
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setClearColor(0xffffff,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.NoToneMapping;
    renderer.localClippingEnabled=true;
    const scene=new THREE.Scene(),pivot=new THREE.Group();scene.add(pivot);
    const camera=new THREE.PerspectiveCamera(34,1,1,2500);
    scene.add(new THREE.AmbientLight(0xffffff,.85));
    const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(-400,550,700);scene.add(key);
    const fill=new THREE.DirectionalLight(0xffffff,.55);fill.position.set(500,-60,250);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,.6);rim.position.set(-250,300,-500);scene.add(rim);
    const materials=[],meshes=[];
    const material=(color,extra={})=>{
      const m=new THREE.MeshStandardMaterial({color,roughness:.65,metalness:0,...extra});materials.push(m);return m;
    };
    const bounds=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)),new THREE.LineBasicMaterial({color:0xb9b5cf,transparent:true,opacity:.65}));
    pivot.add(bounds);
    // The floor marks the archived domain boundary; it adds no tissue structure.
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[2]),new THREE.MeshBasicMaterial({color:0xe8e6f2,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-size[1]/2;pivot.add(floor);
    const vessel=new THREE.Mesh(new THREE.CylinderGeometry(12,12,size[0],32,1,true),material(0xb77386,{transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false}));
    vessel.rotation.z=Math.PI/2;vessel.position.set(-center[0],-center[1],-center[2]);pivot.add(vessel);
    [-size[0]/2,size[0]/2].forEach(x=>{
      const ring=new THREE.Mesh(new THREE.TorusGeometry(12,.65,8,40),material(0xa66f87));
      ring.rotation.y=Math.PI/2;ring.position.set(x,-center[1],-center[2]);pivot.add(ring);
    });
    const planeMesh=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshBasicMaterial({color:0x8175b0,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));
    const planeOutline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(size[0],size[1])),new THREE.LineBasicMaterial({color:0x8175b0,transparent:true,opacity:.6}));
    planeMesh.visible=planeOutline.visible=false;pivot.add(planeMesh,planeOutline);
    const clipPlane=new THREE.Plane(new THREE.Vector3(0,0,-1),size[2]/2);

    function instances(indices,geometry,mat,positions,radii,isData=true) {
      const mesh=new THREE.InstancedMesh(geometry,mat,indices.length);
      indices.forEach((index,i)=>{
        position.fromArray(positions[index]).sub(new THREE.Vector3(...center));
        scale.setScalar(radii ? radii[index] : 1);
        matrix.compose(position,quaternion,scale);mesh.setMatrixAt(i,matrix);
      });
      mesh.instanceMatrix.needsUpdate=true;
      mesh.userData.indices=indices;mesh.userData.isData=isData;
      mesh.frustumCulled=false;pivot.add(mesh);meshes.push(mesh);return mesh;
    }
    if(kind==='field') {
      const fieldIndices=data.field_positions_um.map((_,i)=>i);
      instances(fieldIndices,new THREE.BoxGeometry(10,10,10),material(0xffffff),data.field_positions_um,null);
      // Exact saved endothelial agents locate the modeled capillary in both views.
      const endothelial=data.cells.types.map((t,i)=>t===0?i:-1).filter(i=>i>=0);
      instances(endothelial,new THREE.SphereGeometry(1,10,8),material(0xb993a4,{roughness:.9}),data.cells.positions_um,data.cells.radius_um,false);
    } else {
      const shapes=[new THREE.BoxGeometry(2/Math.sqrt(3),2/Math.sqrt(3),2/Math.sqrt(3)),new THREE.SphereGeometry(1,16,12),new THREE.IcosahedronGeometry(1,1)];
      shapes.forEach((shape,type)=>{
        const indices=data.cells.types.map((t,i)=>t===type?i:-1).filter(i=>i>=0);
        const mesh=instances(indices,shape,material(0xffffff),data.cells.positions_um,data.cells.radius_um);
        mesh.userData.cellType=type;
      });
    }
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onContextLost();});
    return {renderer,scene,pivot,camera,meshes,materials,clipPlane,planeMesh,planeOutline,canvas,kind,lastKey:null};
  }
  try {views.push(createView(canvases[0],'field'));views.push(createView(canvases[1],'cells'));}
  catch(error) {views.forEach(v=>v.renderer.dispose());throw error;}

  function render(state) {
    current=state;
    const dose=data.doses[state.dose],clipped=state.slice<100;
    const clipZ=data.bounds_um[2][0]+size[2]*state.slice/100;
    views.forEach(view=>{
      const width=view.canvas.clientWidth,height=view.canvas.clientHeight;
      if(width<2||height<2)return;
      view.renderer.setSize(width,height,false);
      view.camera.aspect=width/height;
      view.pivot.rotation.set(state.pitch,state.yaw,0);view.pivot.updateMatrixWorld(true);
      // Fit all eight corners, including perspective depth. Clipping and filters
      // never change the framing, so subset exploration does not imply a rescale.
      const tan=Math.tan(THREE.MathUtils.degToRad(view.camera.fov/2));
      let distance=0;
      for(let i=0;i<8;i++) {
        const corner=new THREE.Vector3(size[0]*(i&1?.5:-.5),size[1]*(i&2?.5:-.5),size[2]*(i&4?.5:-.5)).applyMatrix4(view.pivot.matrixWorld);
        distance=Math.max(distance,corner.z+Math.abs(corner.x)/(tan*view.camera.aspect),corner.z+Math.abs(corner.y)/tan);
      }
      view.camera.position.set(0,0,distance*1.08);
      view.camera.lookAt(0,0,0);view.camera.updateProjectionMatrix();
      view.clipPlane.set(new THREE.Vector3(0,0,-1),clipZ-center[2]).applyMatrix4(view.pivot.matrixWorld);
      view.materials.forEach(m=>{m.clippingPlanes=clipped?[view.clipPlane]:[];});
      view.planeMesh.visible=view.planeOutline.visible=clipped;
      view.planeMesh.position.z=view.planeOutline.position.z=clipZ-center[2];
      const key=`${state.dose}:${state.frame}`;
      view.meshes.forEach(mesh=>{
        if(view.kind==='cells')mesh.visible=state.filter==='all'||String(mesh.userData.cellType)===state.filter;
        if(view.lastKey!==key&&mesh.userData.isData) {
          const values=view.kind==='field'?dose.field_values[state.frame]:dose.editing_fraction[state.frame];
          const range=view.kind==='field'?ranges.field_values:ranges.editing_fraction;
          const palette=view.kind==='field'?FIELD:EDIT;
          mesh.userData.indices.forEach((index,i)=>mesh.setColorAt(i,valueColor(values[index],range,palette)));
          mesh.instanceColor.needsUpdate=true;
        }
      });
      view.lastKey=key;view.renderer.render(view.scene,view.camera);
      view.canvas.dataset.spatialRenderer='webgl';
      view.canvas.dataset.spatialYaw=state.yaw.toFixed(4);view.canvas.dataset.spatialPitch=state.pitch.toFixed(4);
    });
    return {clipZ,visibleCells:data.cells.positions_um.reduce((n,p,i)=>n+((!clipped||p[2]<=clipZ)&&(state.filter==='all'||String(data.cells.types[i])===state.filter)?1:0),0)};
  }
  function pick(viewIndex,event) {
    if(!current)return null;
    const view=views[viewIndex],rect=view.canvas.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,view.camera);
    const hits=raycaster.intersectObjects(view.meshes.filter(m=>m.visible&&m.userData.isData),false);
    const clipZ=data.bounds_um[2][0]+size[2]*current.slice/100;
    for(const hit of hits) {
      if(current.slice<100&&view.pivot.worldToLocal(hit.point.clone()).z+center[2]>clipZ+1e-6)continue;
      const index=hit.object.userData.indices[hit.instanceId];
      const dose=data.doses[current.dose];
      return {index,value:(viewIndex?dose.editing_fraction:dose.field_values)[current.frame][index]};
    }
    return null;
  }
  function dispose() {
    views.forEach(v=>{v.scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});v.renderer.dispose();});
  }
  return {render,pick,dispose};
}
