"""Figure 2 RNA-seq workflow with downstream module links; no model computation.
Usage: python generate.py --repository REPO --output NEW_DIRECTORY
Requires the already available matplotlib (and its NumPy dependency).
The output directory must not already contain generated previews.
"""
from pathlib import Path
import argparse, base64, hashlib, html, json, platform, re, shutil, sys
import xml.etree.ElementTree as ET
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import Circle, Ellipse, Rectangle, Polygon, PathPatch, FancyArrowPatch, FancyBboxPatch, Arc
from matplotlib.path import Path as MP
from matplotlib.transforms import Affine2D
import numpy as np

P=argparse.ArgumentParser();P.add_argument('--repository',type=Path,required=True);P.add_argument('--output',type=Path,required=True);args=P.parse_args()
ROOT=args.repository.resolve();OUT=args.output.resolve()
if (OUT/'manifest.json').exists() or list(OUT.glob('figure-*.svg')): raise FileExistsError('Use a new output directory; originals and previous previews are immutable.')
OUT.mkdir(parents=True,exist_ok=True)
C=dict(ink='#171536',purple='#2E267C',violet='#5D5AD7',light='#9D9CF4',lavender='#E9E8FF',orange='#E89B3C',teal='#27877F',coral='#F58F9C',pale='#FFD1D5',muted='#6B6880',line='#D9D7E5',paper='#FFFEFC')
fonts={f.name for f in font_manager.fontManager.ttflist};FONT=next(f for f in ['Futura','Arial','DejaVu Sans'] if f in fonts)
plt.rcParams.update({'font.family':[FONT,'Arial','DejaVu Sans'],'svg.fonttype':'none','pdf.fonttype':42,'font.weight':'medium','text.color':C['ink'],'figure.facecolor':C['paper']})
AX=None;FIG=None;TEXT=[];SHAPES=[];EDGES=[];W=1200;H=700

def start(h=700,w=1200):
 global AX,FIG,TEXT,SHAPES,EDGES,W,H
 W=w;H=h;FIG,AX=plt.subplots(figsize=(w/100,h/100));FIG.subplots_adjust(0,0,1,1);AX.set(xlim=(0,w),ylim=(h,0));AX.axis('off');TEXT=[];SHAPES=[];EDGES=[]

def text(x,y,s,size=24,color=None,ha='center',va='top',weight='medium',track=True):
 t=AX.text(x,y,s,fontsize=size*.72,ha=ha,va=va,color=color or C['ink'],linespacing=1.28,weight=weight,zorder=5)
 if track:TEXT.append(t)
 return t

def line(points,c=None,lw=2.6,style='-',z=2):
 p=AX.plot([p[0] for p in points],[p[1] for p in points],color=c or C['purple'],lw=lw,solid_capstyle='round',solid_joinstyle='round',ls=style,zorder=z)[0];return p

def path(points,codes=None,fill='none',stroke=None,lw=2.5,z=2):
 p=PathPatch(MP(points,codes),facecolor=fill,edgecolor=stroke or C['purple'],lw=lw,joinstyle='round',capstyle='round',zorder=z);AX.add_patch(p);return p

def circle(x,y,r,fill=None,stroke=None,lw=2.5):
 p=Circle((x,y),r,facecolor=fill or C['paper'],edgecolor=stroke or C['purple'],lw=lw,zorder=3);AX.add_patch(p);return p

def rect(x,y,w,h,fill=None,stroke=None,lw=2.5,r=0):
 p=FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',facecolor=fill or C['paper'],edgecolor=stroke or C['purple'],lw=lw,zorder=2);AX.add_patch(p);return p

def ellipse(x,y,w,h,fill=None,stroke=None,lw=2.5,angle=0):
 p=Ellipse((x,y),w,h,angle=angle,facecolor=fill or C['paper'],edgecolor=stroke or C['purple'],lw=lw,zorder=3);AX.add_patch(p);return p

def arrow(a,b,c=None,rad=0,style='-',label=None):
 p=FancyArrowPatch(a,b,arrowstyle='-|>',mutation_scale=14,connectionstyle=f'arc3,rad={rad}',lw=2.0,color=c or C['purple'],linestyle=style,shrinkA=0,shrinkB=0,zorder=1);AX.add_patch(p)
 if label: EDGES.append(label)
 return p

def route(points,c=None,label=None):
 line(points[:-1],c,lw=2.0,z=1);arrow(points[-2],points[-1],c=c)
 if label: EDGES.append(label)

def small_tag(x,y,s,col='teal'):
 text(x,y,s,19,C[col],weight='bold')

def node(x,y,kind,title,sub='',scale=1,col='purple'):
 icon(kind,x,y,scale,col);text(x,y+75*scale,title,25,weight='medium')
 if sub:text(x,y+75*scale+32*len(title.split('\n'))+8,sub,20,C['muted'])

def icon(kind,x,y,s=1,col='purple'):
 co=C[col];pale=C['lavender'] if col!='teal' else '#E4F3F0'
 def L(p,c=None,lw=2.6):return line([(x+a*s,y+b*s) for a,b in p],c or co,lw*s)
 def Q(a,b,r,fill=None,c=None,lw=2.5):return circle(x+a*s,y+b*s,r*s,fill or C['paper'],c or co,lw*s)
 def R(a,b,w,h,fill=None,c=None,lw=2.5,r=0):return rect(x+a*s,y+b*s,w*s,h*s,fill or C['paper'],c or co,lw*s,r*s)
 def E(a,b,w,h,fill=None,c=None,lw=2.5,angle=0):return ellipse(x+a*s,y+b*s,w*s,h*s,fill or C['paper'],c or co,lw*s,angle)
 def T(a,b,st,sz=20,c=None):return text(x+a*s,y+b*s,st,sz*s,c or co,va='center',track=False)
 def RNA(yy=0,mark=False):
  pts=[(-59,yy+4),(-42,yy-8),(-24,yy+7),(-6,yy-6),(12,yy+8),(30,yy-7),(48,yy+5),(60,yy-3)];L(pts,co,3)
  for k,(a,b) in enumerate(pts[1:-1]):
   Q(a,b,5,C['orange'] if mark and k==3 else C['paper'],c=co,lw=1.8)
 def PROT(dx=0,dy=0,sz=1):
  pts=[(-40,-7),(-46,-26),(-22,-39),(-6,-24),(13,-37),(40,-21),(29,-4),(44,14),(22,32),(7,20),(-11,39),(-35,24),(-29,6),(-40,-7)]
  path([(x+(a*sz+dx)*s,y+(b*sz+dy)*s) for a,b in pts],[MP.MOVETO]+[MP.CURVE3]*12+[MP.LINETO],fill=pale,stroke=co,lw=2.5*s)
 if kind=='rna': RNA(0,True)
 elif kind=='reads':
  for i in range(4):
   yy=-42+i*26;L([(-54+(i%2)*12,yy),(48-(i%2)*8,yy)],co,4)
   for j in range(4):R(-40+j*21+(i%2)*12,yy-5,8,10,fill=C['light'] if j!=2 else C['orange'],c=C['paper'],lw=0)
 elif kind=='sample':
  for a in [-36,0,36]:
   R(a-11,-52,22,69,pale,r=9);R(a-14,-57,28,9,co,c=co,lw=1,r=2);L([(a-7,-11),(a+7,-11)],C['orange'],6)
  L([(-58,24),(-58,43),(58,43),(58,24)],co,3)
 elif kind=='trim':
  RNA(-24)
  Q(-22,30,13,fill=pale);Q(14,38,13,fill=pale);L([(-12,21),(27,-15)],co,3);L([(7,26),(-25,-15)],co,3)
  # Exact intersection of the two unchanged blade centre lines.
  blade_a=np.array([-12.,21.]);blade_b=np.array([27.,-15.]);blade_c=np.array([7.,26.]);blade_d=np.array([-25.,-15.])
  t,_=np.linalg.solve(np.column_stack((blade_b-blade_a,-(blade_d-blade_c))),blade_c-blade_a)
  pivot=blade_a+t*(blade_b-blade_a);Q(*pivot,4,fill=C['orange'],c=C['orange'])
 elif kind=='align':
  for i in range(3):
   yy=-38+i*28;L([(-55,yy),(56,yy)],C['line'],3)
   for a,w in [(-50+10*(i%2),36),(2-12*(i%2),32)]:R(a,yy-6,w,12,pale,c=co,lw=1.4)
  L([(-53,55),(58,55)],C['teal'],4)
 elif kind=='detect':
  L([(-72,-32),(-54,-43),(-36,-29),(-18,-40),(0,-31)],co,3)
  for a,b in [(-54,-43),(-36,-29),(-18,-40)]:Q(a,b,4.5,fill=C['paper'],lw=1.8)
  Q(34,11,28);L([(54,31),(75,52)],co,6);Q(34,11,7,fill=C['orange'],c=C['orange'],lw=1)
 elif kind=='filter':
  for a,b in [(-43,-43),(-13,-47),(18,-43),(45,-49)]:Q(a,b,6,fill=C['orange'] if a==-13 else pale,lw=1.6)
  path([(x-57*s,y-25*s),(x+57*s,y-25*s),(x+17*s,y+13*s),(x+17*s,y+45*s),(x-17*s,y+57*s),(x-17*s,y+13*s),(x-57*s,y-25*s)],fill=pale,stroke=co,lw=2.5*s)
 elif kind=='quantify':
  L([(-55,-48),(-55,50),(57,50)],co,2.5)
  for i,yy in enumerate([-5,-22,-12,-30]):
   a=-32+i*24;L([(a,yy-15),(a,yy+13)],C['light'],2);Q(a,yy,6,fill=C['light'],c=C['light'],lw=1)
  L([(-41,-17),(52,-17)],C['orange'],4)
 elif kind=='compare':
  L([(-55,-48),(-55,51),(59,51)],co,2.5)
  for a,h,c in [(-40,48,C['light']),(-10,75,C['teal']),(20,63,C['orange'])]:R(a,51-h,20,h,c,c=c,lw=0)
 elif kind=='sites':
  RNA(0,False)
  for a,b in [(-24,7),(30,-7)]:Q(a,b,13,fill='none',c=C['orange'],lw=3)
 elif kind=='protein': PROT();L([(-24,-10),(-4,-20),(17,-5),(9,14)],C['light'],3)
 elif kind=='puf':
  for i in range(7):
   a=-52+i*17;b=-10+0.008*a*a;E(a,b,18,43,fill=pale,c=co,lw=2,angle=(-a*.7))
  RNA(44)
 elif kind=='complex': PROT(0,-19,1.02);RNA(37,True);L([(8,13),(12,37)],C['orange'],3)
 elif kind=='computer':
  R(-60,-47,120,77,pale,r=7);L([(-28,50),(28,50)],co,3);L([(0,30),(0,50)],co,3)
  for a,b in [(-34,-20),(-2,-3),(32,-26)]:Q(a,b,7,fill=C['paper']);
  L([(-28,-17),(-9,-6),(25,-23)],C['orange'],2.5)
 elif kind=='network' or kind=='frozen':
  nodes=[(-44,-30),(-44,28),(0,-49),(0,0),(0,49),(44,-27),(44,29)]
  for i,j in [(0,2),(0,3),(1,3),(1,4),(2,5),(3,5),(3,6),(4,6)]:L([nodes[i],nodes[j]],C['light'],2)
  for a,b in nodes:Q(a,b,10,fill=pale,c=co,lw=2)
  if kind=='frozen':
   R(67,28,34,29,fill=C['orange'],c=C['paper'],lw=1,r=4);AX.add_patch(Arc((x+84*s,y+29*s),20*s,24*s,theta1=180,theta2=360,color=co,lw=2*s,zorder=4))
 elif kind=='matrix':
  for i in range(4):
   for j in range(5):R(-56+j*23,-44+i*25,18,18,co if j==(i*2)%5 else pale,c=co,lw=.8)
 elif kind=='ridge':
  for i,lab in enumerate(['C295','C388','C871']):
   R(-48,-56+i*41,96,28,fill=pale,r=6);T(0,-42+i*41,lab,18)
 elif kind=='cv':
  for i in range(3):
   for j in range(4):R(-55+j*29,-39+i*29,23,22,C['orange'] if j==i else pale,c=C['paper'],lw=1)
  L([(-54,55),(-29,55),(-15,37)],C['teal'],3)
 elif kind=='rank':
  for i,ww in enumerate([77,58,37]):
   yy=-39+i*39;Q(-45,yy,13,fill=pale,c=co,lw=1.5);T(-45,yy,str(i+1),16);R(-19,yy-8,ww,16,co if i==0 else C['light'],c=co,lw=0,r=4)
 elif kind=='score':
  L([(-49,-36),(-49,34),(-29,34)],co,3);L([(49,-36),(49,34),(29,34)],co,3)
  T(0,-4,'S',70);Q(0,55,4,C['orange'],c=C['orange'],lw=1)
 elif kind=='mask':
  for j in range(5):R(-62+j*26,-16,21,34,C['orange'] if j==2 else pale,c=co,lw=1.6,r=4)
  T(0,1,'?',21);L([(-52,-34),(52,-34)],co,2);L([(-52,36),(52,36)],co,2)
 elif kind=='allpos':
  icon('puf',x,y-8*s,s*.8,col)
  for a in [-48,-24,0,24,48]:Q(a,-40,6,C['orange'],c=C['orange'],lw=1)
 elif kind=='trm':
  icon('puf',x,y-8*s,s*.8,col)
  for a in [-24,24]:Q(a,-40,7,C['orange'],c=C['orange'],lw=1)
 elif kind=='dual':
  icon('network',x-43*s,y,s*.58,col);icon('network',x+43*s,y,s*.58,'teal')
 elif kind=='plate':
  R(-62,-41,124,88,pale,r=9)
  for i in range(3):
   for j in range(5):Q(-43+j*22,-21+i*23,6,fill=C['orange'] if (i+j)%4==0 else C['paper'],c=co,lw=1.3)
 elif kind=='audit':
  PROT(-30,-18,.65)
  L([(-68,32),(-51,23),(-34,36),(-17,25),(0,32)],co,2.6)
  L([(-12,3),(-17,25)],C['orange'],2.5)
  for a,b in [(-51,23),(-34,36),(-17,25)]:Q(a,b,4.3,fill=C['paper'],lw=1.7)
  Q(40,12,27);L([(59,31),(78,50)],co,6)
  L([(28,13),(37,22),(54,2)],C['teal'],3).set_zorder(4)
 elif kind=='mutant':
  PROT();Q(25,-21,11,fill=C['orange'],c=C['paper'],lw=2);L([(21,-21),(29,-21)],co,2)
 elif kind=='combine':
  PROT();Q(-27,-20,10,fill=C['orange'],c=C['paper'],lw=1);Q(25,5,10,fill=C['teal'],c=C['paper'],lw=1);Q(-6,28,10,fill=C['coral'],c=C['paper'],lw=1)
 elif kind=='update':
  icon('protein',x,y,s*.72,col)
  # A single curved arrow keeps its head tangent to the circular shaft.
  circular_path=MP.arc(20,292).transformed(Affine2D().scale(62*s).translate(x,y))
  AX.add_patch(FancyArrowPatch(path=circular_path,arrowstyle='-|>',mutation_scale=14,lw=2.4*s,color=co,zorder=1))
 elif kind=='database':
  R(-46,-35,92,70,pale,c=co,lw=2.3)
  for yy in [35,10,-13,-35]:E(0,yy,92,24,fill=pale,c=co,lw=2)
 elif kind=='dedup':
  for a,b in [(-27,-25),(-10,-10),(7,5)]:R(a-25,b-25,65,65,pale,c=co,lw=1.8,r=5)
  L([(-5,14),(9,28),(40,-7)],C['teal'],4)
 elif kind=='encoder':
  for yy in [21,0,-21]:path([(x-57*s,y+(yy-10)*s),(x+18*s,y+(yy-28)*s),(x+58*s,y+yy*s),(x-17*s,y+(yy+19)*s),(x-57*s,y+(yy-10)*s)],fill=pale,stroke=co,lw=2.2*s)
  for a,b in [(-21,-23),(2,-28),(23,-14)]:Q(a,b,4,fill=C['orange'],c=C['orange'],lw=.6)
 elif kind=='predict':
  Q(0,-35,12,fill=pale)
  for i,lab in enumerate('ACGTN'):
   a=-56+i*28;L([(0,-22),(a,6)],C['light'],1.6);Q(a,24,12,fill=C['paper'],c=co,lw=1.6);T(a,24,lab,15)
 elif kind=='splice':
  L([(-61,18),(61,18)],co,2);R(-58,3,35,30,pale);R(23,3,35,30,pale);path([(x-23*s,y+5*s),(x,y-50*s),(x+23*s,y+5*s)],[MP.MOVETO,MP.CURVE3,MP.CURVE3],stroke=C['orange'],lw=3*s)
 elif kind=='translation':
  RNA(26);E(0,-1,65,49,pale,co);L([(4,-28),(16,-43),(35,-40),(45,-57)],C['orange'],4)
 elif kind=='ires':
  RNA(34);L([(-24,21),(-24,-20),(-10,-36),(10,-36),(24,-20),(24,21)],co,3);L([(-21,-10),(21,-10)],C['light'],2);L([(-21,3),(21,3)],C['light'],2);arrow((x-62*s,y-29*s),(x-29*s,y-13*s),c=C['orange'])
 elif kind=='degrade':
  L([(-59,-7),(-39,-22),(-19,-9)],co,3);L([(7,6),(26,-7)],C['light'],3);L([(43,29),(59,21)],C['light'],3);Q(-38,-23,5,fill=C['paper']);Q(26,-7,5,fill=C['paper']);Q(59,21,5,fill=C['orange'],c=C['orange']);
 elif kind=='window':
  for yy in [-36,-7,22]:L([(-63,yy),(63,yy)],C['light'],3)
  for a,b in [(-58,-48),(-25,-19),(8,10)]:R(a,b,57,24,pale,c=co,lw=1.8,r=3)
 elif kind=='region':
  RNA(4);R(-39,-24,78,57,fill='none',c=C['teal'],lw=2.5,r=5);Q(12,8,9,fill=C['orange'],c=C['orange'],lw=1)
 elif kind=='cytidine':
  RNA(0);Q(12,8,17,fill=C['orange'],c=C['paper'],lw=2);T(12,8,'C',18,C['ink']);L([(-59,-39),(-59,-31),(60,-31),(60,-39)],co,2)
 elif kind=='binary':
  Q(-28,-18,23,fill=pale);L([(-39,-18),(-30,-8),(-15,-29)],C['teal'],3).set_zorder(4);Q(29,25,23,fill=C['paper']);L([(18,14),(40,36)],C['muted'],3).set_zorder(4);L([(40,14),(18,36)],C['muted'],3).set_zorder(4)
 elif kind=='binding':
  PROT(0,-20,.8);RNA(35,True)
 else: raise ValueError(kind)


# Preserve the approved six-step workflow and all its labels.
start(840)
original_nodes = [
    (200, 110, 'trim', 'Adapter trimming', 'fastp'),
    (600, 110, 'align', 'Read alignment', 'STAR / GATK'),
    (1000, 110, 'detect', 'Candidate detection', 'REDItools2 / VEP'),
    (1000, 360, 'filter', 'SNP / sequence filters', 'Control / FDR screening'),
    (600, 360, 'quantify', 'Editing quantification', 'Four-replicate medians'),
    (200, 360, 'compare', 'Editor comparison', 'Sites / targets / context'),
]
for x, y, kind, title, sub in original_nodes:
    node(x, y, kind, title, sub, .9)
for a, b in [((285,110),(515,110)), ((685,110),(915,110)),
             ((915,360),(685,360)), ((515,360),(285,360))]:
    arrow(a, b)
route([(1083,110),(1147,110),(1147,360),(1083,360)])
EDGES.extend([
    ['Adapter trimming', 'Read alignment'],
    ['Read alignment', 'Candidate detection'],
    ['Candidate detection', 'SNP / sequence filters'],
    ['SNP / sequence filters', 'Editing quantification'],
    ['Editing quantification', 'Editor comparison'],
])

# Leave Editor comparison from its left side and branch below all six steps.
# A shared bus makes the three relationships explicit without crossing labels.
line([(143,360),(55,360),(55,550),(1000,550)], C['purple'], lw=2.0, z=1)
tasks = [
    (200, 'puf', 'Module 2', 'PUF specificity design'),
    (600, 'protein', 'Module 3', 'APOBEC engineering'),
    (1000, 'rank', 'Module 4', 'LAMAR prioritization'),
]
for x, kind, module, task in tasks:
    arrow((x,550), (x,590), c=C['purple'])
    icon(kind, x, 660, .82, 'teal')
    text(x, 732, module, 25, C['teal'], weight='bold')
    text(x, 770, task, 23, C['ink'])
    EDGES.append(['Editor comparison', f'{module}: {task}'])

FIG.canvas.draw()
renderer = FIG.canvas.get_renderer()
outside, overlaps = [], []
for item in TEXT:
    box = item.get_window_extent(renderer)
    if not all(FIG.bbox.contains(*point) for point in box.get_points()):
        outside.append(item.get_text())
for index, item in enumerate(TEXT):
    for other in TEXT[index+1:]:
        if item.get_window_extent(renderer).overlaps(other.get_window_extent(renderer)):
            overlaps.append([item.get_text(), other.get_text()])
assert not outside, outside
assert not overlaps, overlaps

stem = 'figure-02-rna-seq'
for ext in ['svg', 'png', 'pdf']:
    FIG.savefig(OUT/f'{stem}.{ext}', format=ext, dpi=160, facecolor=C['paper'])
plt.close(FIG)
# Matplotlib path output contains trailing spaces; normalize before hashing.
svg_file = OUT/f'{stem}.svg'
svg_file.write_text('\n'.join(line.rstrip() for line in svg_file.read_text().splitlines())+'\n')
svg_root = ET.parse(OUT/f'{stem}.svg').getroot()
image_count = sum(element.tag.rsplit('}',1)[-1] == 'image' for element in svg_root.iter())
assert image_count == 0

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

original = 'static/assets/model/icon-flowcharts-20261016/figure-02-rna-seq.svg'
primitives = 'static/assets/model/icon-flowcharts-20261016/generate.py'
manifest = {
    'figure': 'Figure 2',
    'title': 'RNA-seq candidate detection and downstream module tasks',
    'revision': 'module-links-20261016',
    'source': original,
    'source_sha256': sha(ROOT/original),
    'drawing_primitives_source': primitives,
    'drawing_primitives_source_sha256': sha(ROOT/primitives),
    'change': 'Keep all six approved RNA-seq steps and labels. Add a left-side branch from Editor comparison to Module 2 PUF specificity design, Module 3 APOBEC engineering, and Module 4 LAMAR prioritization.',
    'canvas': [W,H],
    'native_svg': True,
    'svg_image_nodes': image_count,
    'text_outside_canvas': outside,
    'text_overlap_pairs': overlaps,
    'directed_relationships': EDGES,
    'model_recomputed': False,
    'scientific_values_changed': False,
    'runtime': {'python': platform.python_version(), 'matplotlib': matplotlib.__version__, 'numpy': np.__version__, 'font': FONT},
    'files': {ext: f'{stem}.{ext}' for ext in ['svg','png','pdf']},
    'sha256': {ext: sha(OUT/f'{stem}.{ext}') for ext in ['svg','png','pdf']},
}
(OUT/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
(OUT/'README.md').write_text("""# Figure 2: RNA-seq workflow and downstream module tasks

The six approved RNA-seq steps, labels and ordering are retained. A left-side branch from **Editor comparison** leads to three tasks below: **Module 2 — PUF specificity design**, **Module 3 — APOBEC engineering**, and **Module 4 — LAMAR prioritization**. The added arrows show how the editing evidence connects to the other modeling tasks; they do not represent a new experiment or model result.

The 1200 × 840 SVG is fully native vector artwork with editable text. A 1920 × 1344 PNG and vector PDF accompany it. Original figure assets remain unchanged.

Reproduce with an existing Python environment containing Matplotlib and NumPy:

    python generate.py --repository /path/to/WIKI_SUSTech-BIO --output /path/to/new-output

Use a new output directory: the generator refuses to overwrite a generated figure set. Source hashes, runtime versions, directed relationships and text-layout checks are recorded in manifest.json. No biological calculations or scientific values are changed. The icon primitives are derived from the repository's approved icon-flowcharts-20261016/generate.py drawing code.
""")
if Path(__file__).resolve() != OUT/'generate.py':
    shutil.copy2(__file__, OUT/'generate.py')
print(json.dumps({'canvas':[W,H], 'text_overlap_pairs':overlaps, 'text_outside_canvas':outside, 'svg_image_nodes':image_count, 'directed_relationship_count':len(EDGES)}))
