from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
import json, os, zlib, base64
from fontTools.ttLib import TTCollection
repo=Path(__file__).resolve().parents[2]
out=repo/'work/engineering-overview';out.mkdir(parents=True,exist_ok=True)
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
source=repo/'docs/design/engineering-overview/source.pptx'
groups={'edit-frame':{2,62},'edit-base':{79,80,81,109,271},'pod':set(range(63,76))|set(range(82,106)), 'cetus':(set(range(76,79))|set(range(106,115)))-{109},'deliver':{3,56,57,58,407},'measure':{4,115,269,411}|set(range(118,155))|set(range(401,407)), 'control-frame':{5,158,159,160,161,162}, 'gfa':{164,168}|set(range(170,176)), 'mre':{165,302}|set(range(180,210)), 'aso':{166,300,301}|set(range(210,243)), 'cre-loxp':{167}|set(range(243,259)), 'model-frame':{264,7,270,408,409,410}, 'model-rna-seq':set(range(10,19)), 'model-puf':set(range(19,24)), 'model-apobec':{24}, 'model-protein-label':{25}, 'model-lamar':set(range(26,48)), 'model-whole-body':set(range(48,55))}
groups.update({'fundamental-research':set(range(601,696)), 'functional-validation':set(range(696,758))|set(range(901,919)), 'stage-connectors':{919,920}})
with ZipFile(source) as zi:
 original=E.fromstring(zi.read('ppt/slides/slide1.xml'))
 shapes=original.find('p:cSld/p:spTree',ns)
 ids={int(s.find('.//p:cNvPr',ns).get('id')) for s in shapes if E.QName(s).localname in ('sp','cxnSp','pic')}
 assigned=[i for g in groups.values() for i in g if i in ids]
 assert set(assigned)==ids,(ids-set(assigned))
 assert len(assigned)==len(ids)
 for name,keep in groups.items():
  root=E.fromstring(zi.read('ppt/slides/slide1.xml'));tree=root.find('p:cSld/p:spTree',ns)
  for s in list(tree):
   if E.QName(s).localname in ('sp','cxnSp','pic') and int(s.find('.//p:cNvPr',ns).get('id')) not in keep:tree.remove(s)
  with ZipFile(out/f'{name}.pptx','w',ZIP_DEFLATED) as zo:
   for item in zi.infolist():zo.writestr(item.filename,E.tostring(root) if item.filename=='ppt/slides/slide1.xml' else zi.read(item.filename))
 (out/'layers.json').write_text(json.dumps({k:sorted(v&ids) for k,v in groups.items()},indent=2))
 print('Assigned',len(ids),'PPT objects to',len(groups),'semantic layers')

# Adapt the bundled PDF font tables locally; fonts are never committed or served.
font_out=out/'fonts';font_out.mkdir(exist_ok=True)
runtime=Path(os.environ['RUNTIME_NODE_MODULES'])
for p in (runtime/'@pdf-lib/standard-fonts/lib').glob('*.compressed.json'):
 if p.name.startswith('all-'):continue
 d=json.loads(zlib.decompress(base64.b64decode(json.loads(p.read_text()))));chars=d['CharMetrics'];names=[c['N'] for c in chars];pairs={};N=len(names)
 for left,right,val in d['KernPairs']:pairs.setdefault(val,[]).append(names.index(left)*N+names.index(right))
 kern=[]
 for val,codes in pairs.items():
  prev=0;delta=[]
  for c in sorted(codes):delta.append(c-prev);prev=c
  kern.extend([val,delta])
 v={'name':d['FontName'],'bbox':d['FontBBox'],'ascender':d.get('Ascender',0),'descender':d.get('Descender',0),'xHeight':d.get('XHeight',0),'capHeight':d.get('CapHeight',0),'glyphNames':' '.join(names),'glyphWidths':[c['WX'] for c in chars],'kernPairs':kern}
 (font_out/(d['FontName']+'.json')).write_text(json.dumps(v))
font_dir=Path(os.environ.get('ENGINEERING_FONT_DIR','/System/Library/Fonts/Supplemental'))
for f in TTCollection(font_dir/'Futura.ttc').fonts:
 f.save(font_out/('Futura-'+f['name'].getDebugName(2).replace(' ','')+'.ttf'))
