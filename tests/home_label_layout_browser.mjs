import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {buildScrollTrack} from '../static/onetake/burden-pacing.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const source=await readFile(new URL('../static/onetake/onetake.js',import.meta.url),'utf8');
const keys=[...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m=>({p:+m[1],stage:+m[2]}));
const {track,length}=buildScrollTrack(keys);
const take=.891,segment=track.find(s=>take>=s.from&&take<=s.to);
const raw=(segment.start+(take-segment.from)/(segment.to-segment.from)*(segment.end-segment.start))/length;
const base=process.env.WIKI_BASE_URL||'http://127.0.0.1:8147',out=process.env.LABEL_OUTPUT||'/private/tmp/orca-home-labels';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const results=[],errors=[];
try {
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900]]) {
    const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/?p=${raw}`);
    await page.waitForFunction(()=>document.querySelector('[data-ot]').classList.contains('is-ready'),null,{timeout:60000});
    await page.waitForFunction(t=>Math.abs(+document.querySelector('[data-ot]').style.getPropertyValue('--ot-p')-t)<.001,take);
    await page.waitForTimeout(600);
    const boxes=await page.locator('[data-bio-label="codon"],[data-bio-callout],.ot-ch.is-on .ot-narrative').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {name:el.dataset.bioLabel||'narrative',x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
    await page.screenshot({path:`${out}/labels-${width}.png`});
    for(const box of boxes) {
      assert.ok(box.x>=0&&box.right<=width+1&&box.y>=112&&box.bottom<=height,JSON.stringify({width,box}));
      for(const other of boxes) if(box.name!==other.name) assert.ok(box.right<=other.x||other.right<=box.x||box.bottom<=other.y||other.bottom<=box.y,JSON.stringify({width,box,other}));
    }
    results.push({width,height,boxes});await page.close();
  }
  assert.deepEqual(errors,[]);await writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));console.log('Annotation and narrative bounds/spacing passed at 320, 390, 768 and 1440px.');
} finally {await browser.close();}
