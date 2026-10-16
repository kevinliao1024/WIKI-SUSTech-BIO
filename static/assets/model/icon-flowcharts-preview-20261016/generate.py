"""Original ORCA-style, native vector icon previews; no model computation.
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
  Q(-22,30,13,fill=pale);Q(14,38,13,fill=pale);L([(-12,21),(27,-15)],co,3);L([(7,26),(-25,-15)],co,3);Q(0,12,4,fill=C['orange'],c=C['orange'])
 elif kind=='align':
  for i in range(3):
   yy=-38+i*28;L([(-55,yy),(56,yy)],C['line'],3)
   for a,w in [(-50+10*(i%2),36),(2-12*(i%2),32)]:R(a,yy-6,w,12,pale,c=co,lw=1.4)
  L([(-53,55),(58,55)],C['teal'],4)
 elif kind=='detect':
  icon('rna',x-10*s,y-15*s,s*.78,col);Q(13,7,30,fill='none');L([(35,30),(56,51)],co,7);Q(13,7,7,fill=C['orange'],c=C['orange'],lw=1)
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
   R(28,20,34,29,fill=C['orange'],c=C['paper'],lw=1,r=4);AX.add_patch(Arc((x+45*s,y+21*s),20*s,24*s,theta1=180,theta2=360,color=co,lw=2*s,zorder=4))
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
  icon('network',x-28*s,y-12*s,s*.67,col);icon('network',x+29*s,y+18*s,s*.67,'teal')
 elif kind=='plate':
  R(-62,-41,124,88,pale,r=9)
  for i in range(3):
   for j in range(5):Q(-43+j*22,-21+i*23,6,fill=C['orange'] if (i+j)%4==0 else C['paper'],c=co,lw=1.3)
 elif kind=='audit':
  icon('complex',x-16*s,y-5*s,s*.73,col);Q(26,19,30,fill='none');L([(47,40),(62,55)],co,6);L([(10,20),(23,31),(44,8)],C['teal'],3)
 elif kind=='mutant':
  PROT();Q(25,-21,11,fill=C['orange'],c=C['paper'],lw=2);L([(21,-21),(29,-21)],co,2)
 elif kind=='combine':
  PROT();Q(-27,-20,10,fill=C['orange'],c=C['paper'],lw=1);Q(25,5,10,fill=C['teal'],c=C['paper'],lw=1);Q(-6,28,10,fill=C['coral'],c=C['paper'],lw=1)
 elif kind=='update':
  icon('protein',x,y,s*.72,col)
  AX.add_patch(Arc((x,y),124*s,124*s,theta1=20,theta2=292,color=co,lw=2.4*s,zorder=1));arrow((x+26*s,y-55*s),(x+48*s,y-39*s),c=co)
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

# Metadata and prose are outside the scientific illustration canvas.
SPECS=[
 dict(id='figure-01-overview',number='Figure 1',title='Integrated modeling decisions',source='assets/images/orca-model-overview-v16.png',url='/assets/images/orca-model-overview-v16.png',alt='Four icon-based modeling areas connect RNA-seq evidence, PUF recognition, APOBEC catalytic design and LAMAR site ranking, with matched validation feeding updated editing profiles.',caption='The four modeling areas share an activity-and-selectivity objective. Historical contact-probability models, the current ESM ranker and inverse-folding nominations remain distinct. Matched validation returns new evidence to editing-profile analysis.'),
 dict(id='figure-02-rna-seq',number='Figure 2',title='RNA-seq candidate detection',source='static/assets/model/igem_module1/assets/01_module1_workflow_illustrated.png',url='/static/assets/model/igem_module1/assets/01_module1_workflow_illustrated.png',alt='Adapter trimming, alignment, candidate detection, control and sequence filtering, replicate quantification and editor comparison form a six-step RNA-seq workflow.',caption='36 libraries, nine groups and four biological replicates per group; GRCh38 with GENCODE v50. The original screening and recounting rules remain in the Model page. Candidate sites and editing profiles support planned training and evaluation.'),
 dict(id='figure-10-puf-esm',number='Figure 10',title='PUF-ESM specificity ranking',source='static/assets/model/igem_module2/wiki/figures/architecture/figure@2x.png',url='/static/assets/model/igem_module2/wiki/figures/architecture/figure@2x.png',alt='A 493-amino-acid PUF sequence feeds frozen ESM-2 scores and reference-centred one-hot features. Grouped inner validation selects Ridge settings, which predict three editing outputs, specificity and held-out ranks.',caption='The original feature branches and three endpoint outputs are preserved. Grouped inner cross-validation selects settings using Spearman correlation; the held-out assessment contains 66 complete constructs, including Top30 comparison with random expectation.'),
 dict(id='figure-20-inverse-folding',number='Figure 20',title='Structure-conditioned PUF nomination',source='static/assets/model/igem_module2/wiki/inverse_folding_20260928/figures/workflow/figure@2x.png',url='/static/assets/model/igem_module2/wiki/inverse_folding_20260928/figures/workflow/figure@2x.png',alt='The fixed PUF–RNA complex branches into all-position and TRM-only masks, each sampled with two pretrained inverse-folding models, screened and compared with measured constructs.',caption='Each model and mask used 10,000 samples, temperature 0.5 and seed 111. The AiCE-inspired screen yielded 128 non-TRM and 10 TRM nominations, with 46 and 0 exact dual-model matches, respectively. Comparison used 81 measured constructs; nominations do not imply experimental validation.'),
 dict(id='figure-25-structure-assay',number='Figure 25',title='Structural hypotheses and assay feedback',source='static/assets/model/igem_module3/wiki/figures/workflow/rendered/workflow.png',url='/static/assets/model/igem_module3/wiki/figures/workflow/rendered/workflow.png',alt='A closed six-step cycle compares RNA contexts, audits structural models, screens single mutants, combines hits, tests within batches and updates designs around a conceptual protein–RNA complex.',caption='The original six-step order and feedback connection are unchanged. RNA comparisons address the +1 base and sequence context; selection pairs preference with retained activity, and each batch uses its matched parental normalization. The central complex is schematic.'),
 dict(id='figure-33-lamar-foundation',number='Figure 33 · workflow panels',title='LAMAR corpus, pretraining and downstream tasks',source='static/assets/model/revisions/20261011/module4-figures/figure-1.png',url='/static/assets/model/revisions/20261011/module4-figures/figure-1.png',alt='RefSeq and RNAcentral sequences are deduplicated into a corpus, used for masked nucleotide prediction with a Transformer encoder, and fine-tuned for four separate RNA regulatory tasks.',caption='Redraw scope is the original workflow panels A, C and D. The numerical corpus-composition plots in panel B are not redrawn and remain in the original image. This preview is not a full replacement for the mixed workflow-and-data figure. Source attribution: adapted from Zhou et al. (2025), as on the current Model page.',partial=True),
 dict(id='figure-extra-lamar-two-stage',number='Additional workflow · Section 4.3',title='LAMAR region selection and cytidine ranking',source='wiki/components/model/module4.html',url='/model#module4-strategy',alt='The earlier 101-nucleotide binary classification task is shown separately from the current two-stage application: 1024-nucleotide region scoring followed by 101-nucleotide cytidine context scoring and ranked follow-up.',caption='The current application links Stage I region selection to Stage II ranking. Stage I outputs a probability of at least one RNA-seq-supported site; Stage II outputs a scalar editing-associated score. The design uses 1,024-nt windows with 128-nt overlap, although the evaluated data also include shorter regions. The reported Stage II evaluation scored cytidines in positive regions directly; the combined application is not presented as an evaluated end-to-end cascade.',text_source=True)
]

# Figure 1: separate design strands rather than an invented sequential pipeline.
start(1200)
icon('rna',600,85,1.0);text(600,143,'APOE4 RNA editing',28,weight='bold');text(600,179,'Activity × selectivity',22,C['teal'])
# Evidence lane
text(48,245,'RNA-seq evidence',26,C['purple'],ha='left',weight='bold');line([(48,284),(1152,284)],C['line'],1.2)
for x,k,t in [(230,'sample','Biological libraries'),(600,'reads','Editing profiles'),(970,'sites','Candidate sites')]:node(x,358,k,t,scale=.75)
arrow((312,358),(516,358),label=['libraries','editing profiles']);arrow((682,358),(886,358),label=['editing profiles','candidate sites'])
# Recognition and catalytic areas side by side, no interbranch arrows
text(48,485,'PUF recognition design',26,C['teal'],ha='left',weight='bold');text(650,485,'APOBEC catalytic design',26,C['purple'],ha='left',weight='bold')
line([(48,525),(550,525)],C['line'],1.2);line([(650,525),(1152,525)],C['line'],1.2)
for x,k,t,su in [(135,'complex','Historical\nCP models','Five candidates\ntested'),(305,'computer','Current\nESM ranker','Variant\nranking'),(475,'puf','Inverse\nfolding','Nominated\nvariants')]:node(x,601,k,t,su,.62,'teal')
for x,k,t in [(707,'audit','AF3\nhypotheses'),(843,'mutant','Single\nmutants'),(979,'combine','Combinations'),(1115,'plate','Assays')]:node(x,601,k,t,scale=.55)
for a,b in [(750,800),(886,936),(1022,1072)]:arrow((a,601),(b,601),label=['APOBEC sequence','next stage'])
text(48,808,'LAMAR site prioritization',26,C['purple'],ha='left',weight='bold');line([(48,848),(1152,848)],C['line'],1.2)
for x,k,t in [(180,'database','RNA-seq labels\n+ transcripts'),(460,'region','Region scores'),(740,'rank','Cytidine ranking'),(1020,'plate','Matched validation')]:node(x,920,k,t,scale=.65)
for a,b in [(245,395),(525,675),(805,955)]:arrow((a,920),(b,920),label=['LAMAR workflow','next stage'])
route([(1020,1055),(1020,1117),(535,1117)],C['teal'],label=['matched validation','updated editing profiles']);icon('reads',500,1117,.45,'teal');text(500,1160,'Updated editing profiles',21,C['teal'])
route([(468,1117),(25,1117),(25,358),(139,358)],C['teal'],label=['updated editing profiles','RNA-seq evidence'])
# Assay-to-validation connection stays in right gutter, away from labels.
route([(1159,601),(1182,601),(1182,920),(1085,920)],C['teal'],label=['assays','matched validation'])

def finish(spec):
 FIG.canvas.draw();r=FIG.canvas.get_renderer();outside=[];overlap=[]
 for t in TEXT:
  b=t.get_window_extent(r)
  if not FIG.bbox.contains(*b.get_points()[0]) or not FIG.bbox.contains(*b.get_points()[1]):outside.append(t.get_text())
 for i,t in enumerate(TEXT):
  for u in TEXT[i+1:]:
   if t.get_window_extent(r).overlaps(u.get_window_extent(r)):overlap.append([t.get_text(),u.get_text()])
 for ext in ['svg','png','pdf']:FIG.savefig(OUT/f"{spec['id']}.{ext}",format=ext,dpi=160,facecolor=C['paper'])
 plt.close(FIG)
 svg=OUT/f"{spec['id']}.svg";root=ET.parse(svg).getroot();image_count=sum(e.tag.rsplit('}',1)[-1]=='image' for e in root.iter());assert image_count==0
 spec.update(canvas=[W,H],native_svg=True,svg_image_nodes=image_count,text_outside_canvas=outside,text_overlap_pairs=overlap,directed_relationships=EDGES.copy(),font=FONT)
 print(spec['id'], 'text_overlap',overlap,'outside',outside)
finish(SPECS[0])

# Figure 2: six-step snake in exact original order.
start(690)
small_tag(600,32,'36 libraries · 9 groups · 4 biological replicates per group')
for x,y,k,t,sub in [(200,170,'trim','Adapter trimming','fastp'),(600,170,'align','Read alignment','STAR / GATK'),(1000,170,'detect','Candidate detection','REDItools2 / VEP'),(1000,466,'filter','SNP / sequence filters','Control / FDR screening'),(600,466,'quantify','Editing quantification','Four-replicate medians'),(200,466,'compare','Editor comparison','Sites / targets / context')]:node(x,y,k,t,sub,.9)
for a,b in [((285,170),(515,170)),((685,170),(915,170)),((915,466),(685,466)),((515,466),(285,466))]:arrow(a,b)
route([(1083,170),(1147,170),(1147,466),(1083,466)])
text(600,637,'GRCh38 + GENCODE v50',21,C['muted'])
EDGES.extend([['Adapter trimming','Read alignment'],['Read alignment','Candidate detection'],['Candidate detection','SNP / sequence filters'],['SNP / sequence filters','Editing quantification'],['Editing quantification','Editor comparison']]);finish(SPECS[1])

# Figure 10: two feature branches, separate training-side choice, three outputs.
start(720)
node(150,296,'puf','PUF sequence','493 amino acids',.9)
node(445,145,'frozen','Frozen ESM-2','35M mutation score',.82)
node(445,441,'matrix','One-hot encoding','Reference-centred',.82)
node(780,296,'ridge','Ridge outputs','Per-endpoint fitting',.9)
node(780,70,'cv','Grouped inner CV','λ selected by Spearman',.60)
# CV label beneath icon, downward arrow offset to avoid labels.
route([(853,70),(922,70),(922,250),(846,270)],C['teal'],label=['grouped inner CV','Ridge settings'])
route([(230,296),(274,296),(274,145),(365,145)],label=['PUF sequence','ESM score']);route([(230,296),(274,296),(274,441),(365,441)],label=['PUF sequence','one-hot features'])
route([(525,145),(610,145),(610,276),(698,276)],label=['ESM score','Ridge outputs']);route([(525,441),(610,441),(610,316),(698,316)],label=['one-hot features','Ridge outputs'])
node(1060,296,'score','Specificity','Predicted S',.86)
arrow((864,296),(980,296),label=['Ridge outputs','specificity'])
text(932,497,'S = C388 − (C295 + C871) / 2',24,C['purple'])
icon('rank',982,610,.65,'teal');text(830,572,'66 held-out predictions',23,ha='right',weight='bold');text(830,610,'Top30 vs random expectation',20,C['muted'],ha='right')
route([(1060,438),(1136,438),(1136,610),(1048,610)],C['teal'],label=['specificity','held-out ranking'])
finish(SPECS[2])

# Figure 20: two masks merge into paired models, then screen and compare.
start(865)
node(155,265,'complex','Fixed PUF–RNA','493 aa · 17 nt',.95)
node(465,135,'allpos','All-position mask','493 mutable',.83,'teal')
node(465,430,'trm','TRM-only mask','36 mutable · 457 fixed',.83,'teal')
node(832,265,'dual','ProteinMPNN\n+ LigandMPNN','10,000 samples / model / mask',.98)
route([(236,265),(286,265),(286,135),(382,135)],label=['fixed complex','all-position mask']);route([(236,265),(286,265),(286,430),(382,430)],label=['fixed complex','TRM-only mask'])
route([(548,135),(647,135),(647,245),(738,245)],label=['all-position mask','paired models']);route([(548,430),(647,430),(647,285),(738,285)],label=['TRM-only mask','paired models'])
text(832,32,'Pretrained weights · T = 0.5 · seed 111',21,C['muted'])
node(832,635,'filter','AiCE-inspired screen','128 non-TRM / 10 TRM nominations',.84)
node(313,635,'plate','Assay comparison','81 measured constructs',.84,'teal')
route([(934,265),(1119,265),(1119,635),(918,635)],label=['paired models','AiCE-inspired screen']);arrow((746,635),(398,635),label=['screened nominations','assay comparison'])
text(832,786,'Exact dual-model matches: 46 / 0',20,C['muted']);text(313,786,'Exact substitutions + motif matches\nC295 · C388 · C871',20,C['muted'])
finish(SPECS[3])

# Figure 25: six-step cycle, conceptual complex at the centre.
start(760)
for x,y,k,t,su in [(200,155,'rna','Compare RNA','+1 base and context'),(600,155,'audit','Audit models','Contacts and controls'),(1000,155,'mutant','Screen single mutants','Ratio and retention'),(1000,520,'combine','Combine hits','Joint objectives'),(600,520,'plate','Test each batch','Normalize to parent'),(200,520,'update','Update designs','Keep, revise, retest')]:node(x,y,k,t,su,.86)
for a,b in [((285,155),(515,155)),((685,155),(915,155)),((915,520),(685,520)),((515,520),(285,520))]:arrow(a,b)
route([(1082,155),(1146,155),(1146,520),(1082,520)])
route([(118,520),(54,520),(54,155),(118,155)],C['teal'])
icon('complex',600,356,.75,'teal');text(600,425,'APOBEC–RNA editing',22,C['teal'])
EDGES.extend([['Compare RNA','Audit models'],['Audit models','Screen single mutants'],['Screen single mutants','Combine hits'],['Combine hits','Test each batch'],['Test each batch','Update designs'],['Update designs','Compare RNA']]);finish(SPECS[4])

# Figure 33: A/C/D only. No source quantitative panel B is re-created.
start(1050)
text(48,34,'A  ·  CORPUS',19,C['purple'],ha='left',weight='bold');line([(210,48),(1150,48)],C['line'],1)
for x,k,t,su in [(200,'database','RefSeq + RNAcentral','RNA sequence resources'),(600,'dedup','Reduce redundancy','Sequence clustering'),(1000,'reads','Pretraining corpus','~15 million genes / transcripts\nMammals + viruses')]:node(x,145,k,t,su,.82)
arrow((284,145),(516,145),label=['sequence resources','reduce redundancy']);arrow((684,145),(916,145),label=['reduce redundancy','pretraining corpus'])
text(72,338,'C  ·  MASKED PREDICTION',19,C['purple'],ha='left',weight='bold');line([(375,352),(1150,352)],C['line'],1)
for x,k,t,su in [(160,'rna','RNA input',''),(450,'mask','Mask bases',''),(740,'encoder','Encoder stack','Attention + feed-forward'),(1040,'predict','Prediction head','Nucleotide probabilities')]:node(x,448,k,t,su,.77)
for a,b in [(240,370),(530,660),(820,960)]:arrow((a,448),(b,448))
route([(1125,145),(1178,145),(1178,308),(35,308),(35,448),(80,448)],C['teal'],label=['pretraining corpus','RNA input'])
text(740,617,'Add & norm after each sublayer',20,C['muted'])
text(48,697,'D  ·  TASK-SPECIFIC FINE-TUNING',19,C['purple'],ha='left',weight='bold');line([(450,711),(1150,711)],C['line'],1)
# Four downstream tasks branch from a shared pretrained representation.
route([(740,650),(740,756),(160,756),(160,795)],C['teal'],label=['pretrained encoder','splice-site task'])
for xx in [450,740,1040]:
 line([(xx,756),(xx,795)],C['teal'],2);arrow((xx,780),(xx,795),c=C['teal']);
line([(740,756),(1040,756)],C['teal'],2)
for x,k,t in [(160,'splice','Splice-site\nprediction'),(450,'translation','Translation\nefficiency'),(740,'ires','IRES activity'),(1040,'degrade','RNA degradation\nrate')]:node(x,860,k,t,scale=.73,col='teal')
EDGES.extend([['RNA input','masked input'],['masked input','Transformer encoder'],['Transformer encoder','base probabilities'],['pretrained encoder','task-specific fine-tuning']]);finish(SPECS[5])

# Extra text workflow: historical classifier separated from current application.
start(890)
small_tag(182,34,'EARLIER FORMULATION',col='muted');line([(340,48),(1152,48)],C['line'],1)
node(285,135,'cytidine','101-nt C-centred input',scale=.70)
node(870,135,'binary','Edited / not edited','Direct binary classification',.70)
arrow((370,135),(785,135),c=C['muted'],label=['earlier 101-nt input','earlier binary output'])
small_tag(145,335,'CURRENT APPLICATION',col='teal');line([(320,349),(1152,349)],C['line'],1)
for x,k,t,su in [(170,'window','Transcript windows','1,024 nt · 128-nt overlap'),(550,'region','Stage I · region score','P(≥1 supported editing site)'),(1010,'cytidine','Cytidine contexts','101 nt, centred on C')]:node(x,453,k,t,su,.86,'teal')
arrow((255,453),(465,453),label=['transcript windows','Stage I probability']);arrow((638,453),(925,453),label=['selected regions','101-nt C contexts']);text(782,417,'Select regions',20,C['teal'])
node(1010,718,'encoder','Stage II · site score','Scalar editing-associated score',.70)
node(460,718,'rank','Ranked cytidines','Follow-up shortlist',.70,'teal')
route([(1092,453),(1150,453),(1150,718),(1083,718)],label=['101-nt C contexts','Stage II scalar score']);arrow((932,718),(535,718),label=['Stage II scalar score','ranked shortlist'])
finish(SPECS[6])

# Source verification, companion text, and fully self-contained gallery.
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'status':'preview only; no mounted Model assets replaced','generated_date':'2026-10-16','style':'ORCA original native vector icon system','model_recomputed':False,'scientific_values_changed':False,'native_svg_text':True,'runtime':{'python':platform.python_version(),'matplotlib':matplotlib.__version__,'numpy':np.__version__,'font':FONT},'figures':SPECS,'excluded':{'data_figures':'All quantitative panels, including Figure 31 and Figure 33B, are outside redraw scope.','decorative':'Typing hero excluded.','unmounted':'Historical module*-dbtl.html files are not mounted on /model and are excluded.'}}
source_lines=['# Sources and scope','', 'These are layout-only previews. All source images and mounted Model components remain unchanged. The original URLs below identify the mounted sources. No result or model was recomputed.','']
cards=[]
for sp in SPECS:
 src=ROOT/sp['source'];assert src.is_file(),src;sp['source_sha256']=sha(src)
 sp['files']={ext:sp['id']+'.'+ext for ext in ['svg','png','pdf']};sp['output_sha256']={ext:sha(OUT/sp['files'][ext]) for ext in ['svg','png','pdf']}
 source_lines += [f"## {sp['number']}: {sp['title']}",f"- Source path: `{sp['source']}`",f"- Original URL: `{sp['url']}`",f"- SHA-256: `{sp['source_sha256']}`",f"- Preview: `{sp['id']}.svg`",f"- Scope: {sp['caption']}",'']
 if sp.get('text_source'):
  original='<div class="original-text"><h4>Initial strategy</h4><pre>Input: 101-nt RNA sequence centred on a cytidine\nOutput: Edited / not edited</pre><h4>Stage I</h4><pre>Input: 1,024-nt transcript sequence window\nOutput: Probability of at least one\nRNA-seq-supported editing site</pre><h4>Stage II</h4><pre>Output: Editing-associated score</pre><p>The application combines region selection with cytidine ranking.</p></div>'
 else:
  original='<img class="original" loading="lazy" src="data:image/png;base64,'+base64.b64encode(src.read_bytes()).decode()+'" alt="Original '+html.escape(sp['number'])+' source image">'
 svg=(OUT/(sp['id']+'.svg')).read_text();svg=svg[svg.index('<svg'):];ids=re.findall(r'\bid="([^"]+)"',svg)
 for old_id in ids:
  new_id=sp['id']+'--'+old_id
  svg=svg.replace('id="'+old_id+'"','id="'+new_id+'"').replace('url(#'+old_id+')','url(#'+new_id+')').replace('href="#'+old_id+'"','href="#'+new_id+'"')
 svg=svg.replace('<svg ','<svg role="img" aria-label="'+html.escape(sp['alt'],quote=True)+'" ',1)
 links=' · '.join('<a href="'+sp['id']+'.'+ext+'" download>'+ext.upper()+'</a>' for ext in ['svg','png','pdf'])
 cards.append(f'''<section id="{sp['id']}" class="card"><header><div><span class="eyebrow">{sp['number']}</span><h2>{sp['title']}</h2></div><nav aria-label="Download {sp['number']}">{links}</nav></header><div class="panel-label">Icon preview <a href="{sp['id']}.svg" target="_blank" rel="noopener">Open full size ↗</a></div><div class="canvas" tabindex="0" role="region" aria-label="Scrollable {sp['number']} vector preview">{svg}</div><p class="caption">{sp['caption']}</p><details><summary>Compare with original</summary><p class="source">Mounted source: <a href="{sp['url']}" target="_blank" rel="noopener">{sp['url']}</a></p>{original}</details></section>''')
nav=''.join('<a href="#'+s['id']+'">'+s['number'].replace(' · workflow panels','').replace('Additional workflow · Section 4.3','Two-stage LAMAR')+'</a>' for s in SPECS)
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dry Model · Icon Flowchart Previews</title><style>
:root{color-scheme:light;--ink:#171536;--purple:#2E267C;--teal:#27877F;--muted:#6B6880;--line:#D9D7E5;--paper:#FFFEFC}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:18px}body{margin:0;background:#F4F3F8;color:var(--ink);font:16px/1.55 Futura,"Trebuchet MS",Arial,sans-serif}a{color:var(--purple);text-underline-offset:3px}main{max-width:1260px;margin:auto;padding:54px 28px 80px}.masthead{max-width:940px;margin-bottom:30px}.eyebrow{display:block;text-transform:uppercase;letter-spacing:.10em;font-size:12px;font-weight:700;color:var(--teal)}h1{font-size:clamp(32px,4vw,50px);line-height:1.1;letter-spacing:-.035em;margin:12px 0 18px}h2{font-size:25px;line-height:1.25;margin:6px 0 0;font-weight:600}.intro{max-width:830px;color:var(--muted);margin:0}.jump{display:flex;flex-wrap:wrap;gap:9px;margin-top:23px}.jump a{border:1px solid var(--line);border-radius:30px;padding:7px 13px;text-decoration:none;font-size:14px;background:white}.card{background:var(--paper);margin:32px 0;border:1px solid var(--line);border-radius:18px;overflow:hidden}.card header{display:flex;gap:20px;align-items:center;justify-content:space-between;padding:25px 28px 18px}.card header nav{white-space:nowrap;font-size:13px}.panel-label{display:flex;align-items:center;justify-content:space-between;border-block:1px solid #E9E8EF;padding:9px 28px;font-size:12px;letter-spacing:.035em;color:var(--muted)}.canvas{overflow-x:auto;overscroll-behavior-inline:contain}.canvas svg{display:block;width:100%;height:auto}.caption{margin:0;padding:15px 28px 21px;color:var(--muted);font-size:14px;max-width:1100px}details{border-top:1px solid #E9E8EF;background:white}summary{padding:17px 28px;cursor:pointer;color:var(--purple);font-size:15px}.source{font-size:12px;padding:0 28px;overflow-wrap:anywhere;color:var(--muted)}.original{width:100%;max-width:100%;height:auto;display:block;background:white}.original-text{max-width:920px;margin:18px auto 30px;padding:0 28px}.original-text h4{color:var(--teal);margin:22px 0 8px}.original-text pre{background:#F4F3F8;padding:16px;white-space:pre-wrap;font:14px/1.6 ui-monospace,monospace}.footer{font-size:13px;color:var(--muted)}.mobile-hint{display:none}:focus-visible{outline:3px solid #E89B3C;outline-offset:-3px}@media(max-width:700px){main{padding:30px 13px 50px}.card{margin:22px 0;border-radius:13px}.card header{padding:20px 17px 15px;align-items:flex-start;flex-direction:column;gap:12px}h2{font-size:22px}.panel-label{padding:9px 17px}.caption{padding:16px 17px;font-size:13px}.canvas svg{width:900px;max-width:none}.source,summary{padding-inline:17px}.mobile-hint{display:block;color:var(--muted);font-size:13px}.jump a{font-size:12px}.original{min-width:0}.original-text{padding:0 17px}.original-text pre{font-size:12px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><main><div class="masthead"><span class="eyebrow">Preview only · 7 workflows</span><h1>Dry Model, redrawn with icons.</h1><p class="intro">Original vector pictograms, concise process labels and consistent arrows. These previews are separate from the current Model page. Open the original beneath each preview to compare the scientific flow.</p><p class="mobile-hint">Swipe the vector canvas horizontally for readable labels, or open a figure full size.</p><nav class="jump" aria-label="Jump to preview">'''+nav+'''</nav></div>'''+''.join(cards)+'''<p class="footer">Editable SVG text and paths · PNG previews · PDF vectors · <a href="manifest.json">Manifest</a> · <a href="sources.md">Source mapping</a> · <a href="generate.py">Reproducible drawing code</a></p></main></body></html>'''
(OUT/'index.html').write_text(page);(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(OUT/'sources.md').write_text('\n'.join(source_lines));
(OUT/'figure-plan.md').write_text('''# Figure plan\n\nAudience: readers of the public Dry Model page.\nPurpose: review icon-based alternatives without replacing the mounted figures.\n\nStyle: original flat pictograms, ORCA indigo/teal/orange palette, warm-white canvas, Futura with Arial/DejaVu fallbacks. Each pictogram is drawn as vector geometry; the SVGs contain native editable text and zero embedded raster images. Arrows are explicit process relationships, not decorative connectors. Titles, captions, source attribution and scope notes remain outside the canvas.\n\nScope: six numbered workflow-bearing figures plus the unnumbered Section 4.3 formulation/two-stage workflow. Figure 33 retains quantitative panel B as an original-source panel; only A/C/D are redrawn. Quantitative plots elsewhere, the decorative typing hero and unmounted historical DBTL components are excluded.\n\nThe preview gallery embeds all original PNGs and generated SVGs, and needs no network or script to display. Download links refer to adjacent files. Original source links refer to the wiki paths. On narrow screens the vector canvas scrolls horizontally at a readable minimum width.\n\nValidation: parse every SVG; confirm zero image nodes; detect label collisions and clipping using the actual renderer; inspect original/new images, then test the gallery in desktop and mobile browsers. No model reruns, threshold changes, data-panel redrawing or existing asset replacements.\n''')
(OUT/'README.md').write_text('''# Dry Model icon-flowchart previews\n\nOpen `index.html` in a browser. It contains the seven icon previews and embedded original images for offline comparison. None of these files is mounted on the Model page.\n\nEach figure is supplied as an editable native SVG, vector PDF and 1.6× PNG. Text remains text in SVG. The pictograms are original schematic drawings; they are not measured structures, quantitative charts or specific sequence designs. `manifest.json` maps sources, scope, hashes, captions, alt text and unchanged relations. Figure 33 covers workflow panels A/C/D only; its numerical panel B remains unchanged in the original.\n\n## Reproduce\n\nUse an existing Python environment with Matplotlib and NumPy. No dependency installation is required by this package. Runtime versions and chosen font are recorded in the manifest. Run:\n\n```sh\npython generate.py --repository /path/to/WIKI_SUSTech-BIO --output /path/to/new-preview-directory\n```\n\nUse a new output directory. The generator refuses to overwrite an existing generated set. The repository supplies the immutable source PNGs and Module 4 text. The generator does not run a scientific model.\n\n## Attribution\n\nNative icon artwork and layouts were prepared for ORCA using its supplied palette and figure rules. Original-source attribution is unchanged; Figure 33 is adapted from Zhou et al. (2025) as documented in the Model page. Review the source mapping before any future replacement.\n''')
shutil.copy2(Path(__file__),OUT/'generate.py')
validation={'svg_count':len(SPECS),'svg_image_nodes_total':sum(s['svg_image_nodes'] for s in SPECS),'native_text':True,'label_clipping':{s['id']:s['text_outside_canvas'] for s in SPECS},'label_overlaps':{s['id']:s['text_overlap_pairs'] for s in SPECS},'source_files_unchanged':True,'model_computation':False,'browser_qa':'pending','figure_count':7}
(OUT/'validation.json').write_text(json.dumps(validation,indent=2))
print(json.dumps({'output':str(OUT),'count':len(SPECS),'gallery_bytes':(OUT/'index.html').stat().st_size}))
