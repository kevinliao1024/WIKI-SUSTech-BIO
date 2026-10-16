"""Original neutral adult surface; analytic implicit shapes + marching tetrahedra.
No downloaded geometry, scientific model or third-party meshing dependency.
Requires only NumPy. Y is up, Z is front, metres are nominal artistic units.
"""
import json
from pathlib import Path
import sys
import numpy as np

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('outputs/software_visuals_v3/human-body')
OUT.mkdir(parents=True, exist_ok=True)
for filename in ('body-surface.bin', 'body-surface.json', 'body-parameters.json'):
    if (OUT / filename).exists():
        raise FileExistsError(f'Refusing to overwrite existing output: {OUT / filename}. Choose a new output directory.')
H = .006
axes = [np.arange(-.47,.471,H,dtype=np.float32), np.arange(-.012,1.80,H,dtype=np.float32), np.arange(-.15,.223,H,dtype=np.float32)]
X,Y,Z = np.meshgrid(*axes,indexing='ij',sparse=True)
shape = tuple(len(a) for a in axes)
F = np.full(shape,10,dtype=np.float32)
primitives=[]

def blend(a,b,k):
    t=np.maximum(k-np.abs(a-b),0)/k
    return np.minimum(a,b)-t*t*k*.25

def ellipsoid(center,radii,k=.018,angle=0):
    global F
    cx,cy,cz=center; rx,ry,rz=radii
    ca,sa=np.cos(angle),np.sin(angle)
    dx=(X-cx)*ca+(Y-cy)*sa
    dy=-(X-cx)*sa+(Y-cy)*ca
    dz=Z-cz
    # First-order Euclidean approximation to ellipsoid signed distance.
    q=np.sqrt((dx/rx)**2+(dy/ry)**2+(dz/rz)**2)
    r=np.sqrt((dx/(rx*rx))**2+(dy/(ry*ry))**2+(dz/(rz*rz))**2)
    d=q*(q-1)/np.maximum(r,1e-7)
    F=blend(F,d,k)
    primitives.append(dict(kind='ellipsoid',center=center,radii=radii,blend=k,angle=angle))

def capsule(a,b,r0,r1,k=.01):
    global F
    a=np.array(a);b=np.array(b);v=b-a
    t=np.clip(((X-a[0])*v[0]+(Y-a[1])*v[1]+(Z-a[2])*v[2])/float(v@v),0,1)
    d=np.sqrt((X-a[0]-t*v[0])**2+(Y-a[1]-t*v[1])**2+(Z-a[2]-t*v[2])**2)-(r0+(r1-r0)*t)
    F=blend(F,d,k)
    primitives.append(dict(kind='tapered_capsule',a=a.tolist(),b=b.tolist(),r0=r0,r1=r1,blend=k))

def smooth_profile(y,knots,values):
    knots=np.array(knots);values=np.array(values)
    slopes=np.gradient(values,knots)
    i=np.clip(np.searchsorted(knots,y)-1,0,len(knots)-2)
    length=knots[i+1]-knots[i];t=np.clip((y-knots[i])/length,0,1)
    return (2*t**3-3*t*t+1)*values[i]+(t**3-2*t*t+t)*slopes[i]*length+(-2*t**3+3*t*t)*values[i+1]+(t**3-t*t)*slopes[i+1]*length

# Continuous torso loft: chest, waist and pelvis share one implicit surface.
ky=[.775,.82,.89,.97,1.055,1.15,1.25,1.33,1.385,1.425]
rx=[.055,.120,.151,.143,.128,.146,.174,.188,.164,.058]
rz=[.055,.080,.103,.100,.083,.093,.111,.102,.074,.045]
yc=np.clip(Y,ky[0],ky[-1]);xr=smooth_profile(yc,ky,rx);zr=smooth_profile(yc,ky,rz)
zc=smooth_profile(yc,ky,[0,0,-.008,-.008,0,.006,.012,.005,-.003,-.006])
radial=(np.sqrt((X/xr)**2+((Z-zc)/zr)**2)-1)*np.minimum(xr,zr)
vertical=np.maximum(ky[0]-Y,Y-ky[-1])
F=np.maximum(radial,vertical).astype(np.float32)
primitives.append(dict(kind='smooth_torso_loft',y=ky,rx=rx,rz=rz))
# Shoulder/neck transitions, cranium, face and small pinnae.
ellipsoid((0,1.453,-.006),(.053,.105,.053),.035)
ellipsoid((0,1.642,-.005),(.079,.116,.084),.024)
ellipsoid((0,1.587,.024),(.065,.070,.071),.018)
ellipsoid((0,1.554,.038),(.045,.027,.044),.012)
ellipsoid((0,1.638,.078),(.013,.031,.021),.009)
ellipsoid((0,1.624,.095),(.015,.013,.020),.007)
ellipsoid((0,1.591,.084),(.025,.008,.009),.005)
for side in [-1,1]:
    ellipsoid((side*.080,1.636,-.003),(.014,.030,.016),.009)
    # Deltoid blends into clavicular shoulder; tapered upper arm and forearm.
    ellipsoid((side*.178,1.354,-.002),(.067,.075,.068),.035,side*.3)
    capsule((side*.203,1.340,-.002),(side*.274,1.116,.005),.049,.034,.023)
    ellipsoid((side*.241,1.223,.004),(.046,.116,.047),.018,side*.30)
    capsule((side*.274,1.116,.005),(side*.343,.913,.017),.034,.022,.018)
    ellipsoid((side*.296,1.055,.014),(.035,.088,.035),.015,side*.33)
    # Palm lies mostly in the frontal plane, with relaxed fingers slightly splayed.
    ellipsoid((side*.362,.858,.020),(.031,.063,.018),.013,side*.25)
    d=np.array([side*.245,-.970,.035]);u=np.array([side*.970,.245,0])
    palm=np.array([side*.366,.830,.021])
    for offset,length,radius,spread in [(-.023,.066,.007, -.012),(-.007,.080,.0075,-.002),(.009,.076,.007,.006),(.024,.061,.006,.014)]:
        start=palm+u*offset+d*.012
        middle=start+d*(length*.53)+u*spread*.4+np.array([0,0,.003])
        end=start+d*length+u*spread+np.array([0,0,.009])
        capsule(start,middle,radius,radius*.95,.004)
        capsule(middle,end,radius*.95,radius*.72,.004)
    capsule((side*.341,.864,.029),(side*.321,.823,.041),.010,.008,.009)
    capsule((side*.321,.823,.041),(side*.319,.799,.047),.008,.006,.005)
    # Upper leg, patella, calf and ankle form a continuous softly blended limb.
    ellipsoid((side*.085,.710,-.003),(.083,.217,.091),.032,side*-.03)
    ellipsoid((side*.096,.519,.012),(.051,.072,.055),.020)
    ellipsoid((side*.101,.348,-.009),(.052,.194,.062),.025,side*.015)
    ellipsoid((side*.103,.155,-.002),(.029,.105,.036),.018)
    ellipsoid((side*.103,.061,.060),(.042,.047,.101),.022)
    ellipsoid((side*.103,.037,.129),(.044,.031,.055),.012)

print('field',shape,'range',float(F.min()),float(F.max()),flush=True)
# March only cubes that cross the surface. Consistent six-tetrahedron split.
corner=np.array([[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]])
vals=np.stack([F[c[0]:shape[0]-1+c[0],c[1]:shape[1]-1+c[1],c[2]:shape[2]-1+c[2]] for c in corner],axis=-1)
mask=(vals.min(-1)<0)&(vals.max(-1)>=0)
ix=np.argwhere(mask);v=vals[mask];del vals,mask
ids=(ix[:,None,:]+corner[None,:,:]);gids=(ids[:,:,0]*shape[1]+ids[:,:,1])*shape[2]+ids[:,:,2]
flat=F.ravel()
tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]]
edges=np.array([[0,1],[1,2],[2,0],[0,3],[1,3],[2,3]])
table={1:[[0,3,2]],2:[[0,1,4]],3:[[1,4,2],[2,4,3]],4:[[1,2,5]],5:[[0,3,5],[0,5,1]],6:[[0,2,5],[0,5,4]],7:[[5,4,3]],8:[[3,4,5]],9:[[4,5,0],[5,2,0]],10:[[1,5,0],[5,3,0]],11:[[5,2,1]],12:[[3,4,2],[2,4,1]],13:[[4,1,0]],14:[[2,3,0]]}
all_edges=[]
for tet in tetra:
    tv=v[:,tet];ti=gids[:,tet];codes=((tv<0)*np.array([1,2,4,8])).sum(1)
    for code,triangles in table.items():
        chosen=ti[codes==code]
        if not len(chosen):continue
        pairs=edges[np.array(triangles).ravel()]
        e=chosen[:,pairs].reshape(-1,2);e.sort(axis=1);all_edges.append(e)
edge_array=np.concatenate(all_edges)
unique,inverse=np.unique(edge_array,axis=0,return_inverse=True)
triangles=inverse.reshape(-1,3)
def coord(ids):
    iz=ids%shape[2];iy=(ids//shape[2])%shape[1];ix=ids//(shape[1]*shape[2])
    return np.stack([axes[0][ix],axes[1][iy],axes[2][iz]],axis=1)
p0=coord(unique[:,0]);p1=coord(unique[:,1]);f0=flat[unique[:,0]];f1=flat[unique[:,1]]
t=(f0/(f0-f1))[:,None];vertices=p0+t*(p1-p0)
# Cluster sub-grid intersections to control download size; hands retain finer geometry.
hands=(np.abs(vertices[:,0])>.30)&(vertices[:,1]<.92)
cell_size=np.where(hands,.0035,.0065)
keys=np.round(vertices/cell_size[:,None]).astype(np.int64)
keys=np.concatenate([hands[:,None].astype(np.int64),keys],axis=1)
_,cluster=np.unique(keys,axis=0,return_inverse=True)
counts=np.bincount(cluster)
merged=np.stack([np.bincount(cluster,weights=vertices[:,i])/counts for i in range(3)],axis=1)
triangles=cluster[triangles];good=(triangles[:,0]!=triangles[:,1])&(triangles[:,0]!=triangles[:,2])&(triangles[:,1]!=triangles[:,2]);triangles=triangles[good]
_,keep=np.unique(np.sort(triangles,axis=1),axis=0,return_index=True);triangles=triangles[np.sort(keep)]
vertices=merged
# Smooth normals sample the finite-difference gradient of the original field.
grad=np.gradient(F,H)
q=(vertices-np.array([a[0] for a in axes]))/H
lo=np.floor(q).astype(int);frac=q-lo;normals=np.zeros_like(vertices)
for c in corner:
    cell=lo+c;cell=np.clip(cell,0,np.array(shape)-1)
    weight=np.prod(np.where(c,frac,1-frac),axis=1)
    normals+=np.stack([g[cell[:,0],cell[:,1],cell[:,2]] for g in grad],axis=1)*weight[:,None]
normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-12)
a,b,c=vertices[triangles[:,0]],vertices[triangles[:,1]],vertices[triangles[:,2]]
face=np.cross(b-a,c-a);average=normals[triangles].mean(1)
flip=(face*average).sum(1)<0;triangles[flip]=triangles[flip][:,[0,2,1]]
# Remove zero-area faces introduced by clustering.
area=np.linalg.norm(face,axis=1);triangles=triangles[area>1e-12]
vertices=vertices.astype('<f4');normals=normals.astype('<f4');triangles=triangles.astype('<u4')
payload=vertices.tobytes()+normals.tobytes()+triangles.tobytes()
(OUT/'body-surface.bin').write_bytes(payload)
n=len(vertices);m=triangles.size
metadata={'format':'body-mesh-v1','buffer':'body-surface.bin','vertex_count':n,'index_count':m,'positions':{'byte_offset':0,'count':n*3},'normals':{'byte_offset':n*12,'count':n*3},'indices':{'byte_offset':n*24,'count':m},'coordinate_system':{'up':'+Y','front':'+Z','height':float(vertices[:,1].max()-vertices[:,1].min()),'units':'nominal metres, artistic anatomy'},'bounds':{'min':vertices.min(0).tolist(),'max':vertices.max(0).tolist()},'landmarks':{'brain':[0,1.64,0],'liver':[-.065,1.08,.035],'chest':[0,1.25,.02],'pelvis':[0,.88,0]},'provenance':{'original_geometry':True,'method':'smooth implicit torso loft and blended anatomical primitives, extracted by marching tetrahedra','not_patient_specific':True,'external_assets':False,'python_version':sys.version.split()[0],'numpy_version':np.__version__,'mesh_purpose':'Illustrative surface rendering; vertex clustering does not guarantee a watertight/manifold manufacturing mesh.'}}
(OUT/'body-surface.json').write_text(json.dumps(metadata,indent=2)+'\n')
(OUT/'body-parameters.json').write_text(json.dumps({'grid_step':H,'primitives':primitives,'geometry_purpose':'Neutral nonclinical adult anatomy for conceptual delivery visualization'},indent=2)+'\n')
print(json.dumps({'vertices':n,'triangles':len(triangles),'bytes':len(payload),'output':str(OUT),'bounds':metadata['bounds']},indent=2),flush=True)
