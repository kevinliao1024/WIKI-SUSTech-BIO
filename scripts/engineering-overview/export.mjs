import {registerHooks} from 'node:module';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(repo,'work/engineering-overview');
const runtime=process.env.RUNTIME_NODE_MODULES;
if(!runtime) throw new Error('Set RUNTIME_NODE_MODULES to the installed artifact-tool runtime');
registerHooks({resolve(specifier,context,next){
 if(specifier.startsWith('#standard-fonts/')){
  const n=specifier.split('/')[1].replace(/^(Helvetica|Courier|Times)(.+)$/,'$1-$2');
  return {url:pathToFileURL(path.join(dir,'fonts',n+'.json')).href,shortCircuit:true};
 }
 return next(specifier,context);
}});
import fs from 'node:fs/promises';
const {PresentationFile,FileBlob,registerPdfFontFace}=await import(pathToFileURL(path.join(runtime,'@oai/artifact-tool/dist/artifact_tool.mjs')));
registerPdfFontFace({family:'Futura',source:new Uint8Array(await fs.readFile(`${dir}/fonts/Futura-Medium.ttf`)),weight:400});
registerPdfFontFace({family:'Futura',source:new Uint8Array(await fs.readFile(`${dir}/fonts/Futura-Bold.ttf`)),weight:700});
registerPdfFontFace({family:'Georgia',source:new Uint8Array(await fs.readFile(path.join(process.env.ENGINEERING_FONT_DIR || '/System/Library/Fonts/Supplemental','Georgia Bold.ttf'))),weight:700});
const layers=JSON.parse(await fs.readFile(`${dir}/layers.json`));
for (const name of [...Object.keys(layers),'full']) {
 const file=name==='full'?path.join(repo,'docs/design/engineering-overview/source.pptx'):`${dir}/${name}.pptx`;
 const p=await PresentationFile.importPptx(await FileBlob.load(file));
 const b=await p.export({format:'pdf'});
 await fs.writeFile(`${dir}/${name}.pdf`,new Uint8Array(await b.arrayBuffer()));
 console.log(name,b.size);
}
