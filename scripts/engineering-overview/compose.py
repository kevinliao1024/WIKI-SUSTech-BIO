from pathlib import Path
from lxml import etree as E
from zipfile import ZipFile
import fitz,json,re,hashlib,os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
repo=Path(__file__).resolve().parents[2];out=repo/'work/engineering-overview'
S='http://www.w3.org/2000/svg';X='http://www.w3.org/1999/xlink';Q=lambda s:'{'+S+'}'+s
svg=E.Element(Q('svg'),nsmap={None:S,'xlink':X},attrib={'viewBox':'0 0 732 1602','class':'engineering-overview-art','data-engineering-overview':'','role':'group','aria-labelledby':'engineering-overview-title engineering-overview-desc'})
E.SubElement(svg,Q('title'),id='engineering-overview-title').text='ORCA project overview'
E.SubElement(svg,Q('desc'),id='engineering-overview-desc').text='Hover or focus a module to highlight its matching branch. Select either the diagram or the mind map to read the chapter.'
defs=E.SubElement(svg,Q('defs'))
f=TTFont(str(Path(os.environ.get('ENGINEERING_FONT_DIR','/System/Library/Fonts/Supplemental'))/'Arial.ttf'));gs=f.getGlyphSet();pen=SVGPathPen(gs);gs[f.getBestCmap()[0x2032]].draw(TransformPen(pen,(1/f['head'].unitsPerEm,0,0,1/f['head'].unitsPerEm,0,0)));E.SubElement(defs,Q('path'),id='eo-prime',d=pen.getCommands())
E.SubElement(svg,Q('rect'),width='732',height='1602',fill='white')
for layer in json.loads((out/'layers.json').read_text()):
 r=E.fromstring(fitz.open(out/f'{layer}.pdf')[0].get_svg_image().encode())
 for e in list(r.iter()):
  if E.QName(e).localname=='path' and e.get('d')=='M0 0H976V2136H0Z':e.getparent().remove(e)
  elif e.get('mask') and e.find('.//'+Q('image')) is not None:
   im=E.Element(Q('image'),x='139.5',y='384.75',width='67.5',height='67.5',href='__AAV_URL__');e.getparent().replace(e,im)
 for e in list(r.iter()):
  if E.QName(e).localname=='mask':e.getparent().remove(e)
 for e in r.iter():
  if e.get('id'):e.set('id','eo-'+layer+'-'+e.get('id'))
  for key,value in list(e.attrib.items()):
   if key.endswith('href') and value.startswith('#'):e.set(key,'#eo-'+layer+'-'+value[1:])
   elif 'url(#' in value:e.set(key,value.replace('url(#','url(#eo-'+layer+'-'))
  if e.get('data-text')=='�':e.set('{'+X+'}href','#eo-prime');e.set('data-text','′')
 group=('edit' if layer in ['edit-frame','edit-base','pod','cetus'] else 'control' if layer in ['control-frame','gfa','mre','aso','cre-loxp'] else 'model' if layer.startswith('model-') else layer)
 parts={'edit-frame':'','edit-base':'integrated-orca','pod':'pod integrated-orca','cetus':'cetus integrated-orca','control-frame':'','model-frame':'','model-protein-label':'model-puf model-apobec'}.get(layer,layer)
 g=E.SubElement(svg,Q('g'),attrib={'class':'overview-layer','data-overview-layer':layer,'data-overview-family':group,'data-overview-parts':parts,'aria-hidden':'true'})
 for e in list(r):
  if E.QName(e).localname=='defs':
   for child in list(e):defs.append(child)
  else:g.append(e)
# Transparent link surfaces use the unchanged PPT coordinate system.
hits=E.SubElement(svg,Q('g'),attrib={'class':'overview-links','transform':'scale(.75)'})
def hit(part,label,xy,group=None):
 a=E.SubElement(hits,Q('a'),href='#'+part,attrib={'data-overview-target':part,'aria-label':label+', open chapter'})
 if group:a.set('data-overview-select-group',group)
 E.SubElement(a,Q('title')).text=label
 x,y,w,h=xy
 if not part.startswith(('fundamental-research', 'functional-validation')):y+=380
 E.SubElement(a,Q('rect'),x=str(x),y=str(y),width=str(w),height=str(h),rx='8')
hit('fundamental-research','Fundamental Research',(32,32,912,70),'fundamental-research')
hit('fundamental-research-cycle-01','Fundamental Research · Cycle 1',(52,114,430,220))
hit('fundamental-research-cycle-02','Fundamental Research · Cycle 2',(540,114,380,220))
hit('deliver','Deliver · AAV9',(32,32,268,230),'deliver')
hit('model-rna-seq','Model',(320,32,624,230),'model')
hit('model-rna-seq','RNA-seq Off-target Analysis',(340,119,140,121))
hit('model-puf','PUF Specificity Design',(484,119,72,121))
hit('model-apobec','APOBEC Engineering',(556,119,67,121))
hit('model-lamar','LAMAR Prioritization',(628,119,140,121))
hit('model-whole-body','Whole-body Delivery Model',(778,119,150,121))
hit('pod','Edit',(32,290,500,480),'edit')
hit('integrated-orca','Integrated ORCA',(214,310,278,46))
hit('integrated-orca','Integrated ORCA · APOE4 RNA',(64,634,430,105))
hit('pod','Edit',(52,310,148,46),'edit')
hit('pod','POD',(100,425,250,132))
hit('cetus','CETUS',(350,446,125,190))
hit('measure','Measure · SONAR',(552,290,392,480),'measure')
hit('gfa','Control',(32,798,912,526),'control')
hit('gfa','GFA',(86,886,389,184))
hit('mre','MRE',(510,886,379,184))
hit('aso','ASO',(86,1094,389,217))
hit('cre-loxp','Cre-loxP',(510,1094,379,217))
hit('functional-validation','Functional Validation',(32,1772,912,66),'functional-validation')
hit('functional-validation-cycle-01','Functional Validation · Experiment I',(52,1840,280,250))
hit('functional-validation-cycle-02','Functional Validation · Experiment II',(350,1840,280,250))
hit('functional-validation-cycle-03','Functional Validation · Experiment III',(648,1840,280,250))
text=E.tostring(svg,encoding='unicode')
(repo/'wiki/components/engineering_overview.html').write_text(text.replace('__AAV_URL__',"{{ url_for('static', filename='engineering-overview/aav9.png') }}"))
(out/'combined.svg').write_text(text.replace('__AAV_URL__','../../static/engineering-overview/aav9.png'))
source=repo/'docs/design/engineering-overview/source.pptx'
asset=repo/'static/engineering-overview';asset.mkdir(exist_ok=True)
with ZipFile(source) as z:(asset/'aav9.png').write_bytes(z.read('ppt/media/image1.png'))
(repo/'docs/design/engineering-overview/provenance.json').write_text(json.dumps({'source':'docs/design/engineering-overview/source.pptx','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'objects':sum(len(v) for v in json.loads((out/'layers.json').read_text()).values()),'semantic_layers':len(json.loads((out/'layers.json').read_text())),'model_labels':'Futura Bold 14.25 pt','raster_assets':1},indent=2))
print('SVG template:',len(text),'characters; one original AAV raster asset')
