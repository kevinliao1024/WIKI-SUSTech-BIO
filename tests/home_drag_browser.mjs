// Focused regression: drag the visible protein surface, not just its label.
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {buildScrollTrack} from '../static/onetake/burden-pacing.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.WIKI_BASE_URL || 'http://127.0.0.1:8082';
const out=process.env.DRAG_OUTPUT || '/private/tmp/orca-drag-final';
await mkdir(out,{recursive:true});
const source=await readFile(new URL('../static/onetake/onetake.js',import.meta.url),'utf8');
const keys=[...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m=>({p:+m[1],stage:+m[2]}));
const {track,length}=buildScrollTrack(keys);
const raw=q=>{const s=track.find(s=>q>=s.from&&q<=s.to);return (s.start+(q-s.from)/(s.to-s.from)*(s.end-s.start))/length;};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const errors=[];
try {
 for (const mobile of [false,true]) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});
  const page=await context.newPage(), device=mobile?'mobile':'desktop';
  // Software WebGL can compile slowly while other preview checks are running.
  page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>document.querySelector('[data-ot]').classList.contains('is-ready'));
  await page.goto(`${base}/?p=${raw(.71)}`);await ready();
  const copy=page.getByText('Alzheimer’s disease involves multiple interacting pathways. APOE4 influences several of them, including lipid metabolism, amyloid-β handling and inflammation.',{exact:true});
  assert.equal(await copy.isVisible(),true);
  await page.screenshot({path:`${out}/${device}-pathways.png`});
  await page.goto(base);await ready();
  await page.mouse.wheel(0,await page.locator('[data-ot-story]').evaluate((e,p)=>(e.getBoundingClientRect().height-innerHeight)*p,raw(.798)));
  await page.waitForFunction(()=>document.querySelector('[data-ot]').dataset.editReplay==='placement',null,{timeout:120000});
  const startScroll=await page.evaluate(()=>scrollY);
  const touch=mobile?await context.newCDPSession(page):null;
  async function coordinates(name) {
   return page.evaluate(n=>{
    const handle=document.querySelector(`[data-bio-handle="${n}"]`).getBoundingClientRect();
    const target=document.querySelector(`[data-drop-site="${n}"]`).getBoundingClientRect();
    const disks=[...document.querySelector(`[data-bio-hit="${n}"]`).getAttribute('d').matchAll(/M([-\d.]+),([-\d.]+)a([-\d.]+),/g)];
    const m=disks.at(-1), r=+m[3];
    const grab={x:+m[1]+r,y:+m[2]-(n==='cetus'&&!matchMedia('(max-width:760px)').matches?r*.9:0)};
    return {grab, destination:{x:grab.x+target.x+target.width/2-handle.x-handle.width/2,y:grab.y+target.y+target.height/2-handle.y-handle.height/2},home:{x:handle.x,y:handle.y},outside:grab.y<handle.y||grab.x>handle.right,hit:document.elementFromPoint(grab.x,grab.y)?.getAttribute('data-bio-hit')};
   },name);
  }
  async function start(point) {
   if(touch) await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
   else {await page.mouse.move(point.x,point.y);await page.mouse.down();}
  }
  async function move(from,to) {
   if(touch) for(let i=1;i<=12;i++) {
    await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/12,y:from.y+(to.y-from.y)*i/12}]});
    await page.waitForTimeout(35);
   }
   else await page.mouse.move(to.x,to.y,{steps:12});
  }
  async function end() {
   if(touch) await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   else await page.mouse.up();
  }
  const pod=await coordinates('pod');
  assert.ok(pod.outside,'protein end can be grabbed outside the label');
  assert.equal(pod.hit,'pod');
  await start(pod.grab);await move(pod.grab,{x:mobile?25:65,y:mobile?720:650});
  assert.equal(await page.locator('[data-bio-handle="pod"]').evaluate(e=>e.classList.contains('is-dragging')),true);
  assert.equal(await page.locator('[data-drop-site="pod"]').evaluate(e=>e.classList.contains('is-near')),false);
  await end();
  await page.waitForFunction(p=>Math.abs(document.querySelector('[data-bio-handle="pod"]').getBoundingClientRect().x-p.x)<2&&Math.abs(document.querySelector('[data-bio-handle="pod"]').getBoundingClientRect().y-p.y)<2,pod.home);
  assert.equal(await page.locator('[data-bio-handle="pod"]').getAttribute('aria-pressed'),'false');
  for(const name of ['pod','cetus']) {
   const item=await coordinates(name);
   if(name==='pod') assert.equal(item.hit,'pod');
   await start(item.grab);await move(item.grab,item.destination);
   await page.waitForFunction(n=>document.querySelector(`[data-drop-site="${n}"]`).classList.contains('is-near'),name);
   await page.screenshot({path:`${out}/${device}-${name}-gold.png`});
   await end();
   await page.waitForFunction(n=>document.querySelector(`[data-bio-handle="${n}"]`).getAttribute('aria-pressed')==='true',name);
   assert.equal(await page.locator(`[data-bio-hit="${name}"]`).getAttribute('d'),'');
  }
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-startScroll)<2,'dragging does not scroll the page');
  assert.equal(await page.locator('[data-ot]').getAttribute('data-edit-replay'),'placement');
  await page.screenshot({path:`${out}/${device}-placed.png`});
  if(touch) {const from={x:195,y:720},to={x:195,y:580};await start(from);await move(from,to);await end();}
  else await page.mouse.wheel(0,300);
  await page.waitForFunction(()=>document.querySelector('[data-ot]').dataset.editReplay==='edit');
  await page.waitForFunction(()=>+document.querySelector('[data-bio-label="codon"]').style.getPropertyValue('--fix')>.99,null,{timeout:60000});
  await page.screenshot({path:`${out}/${device}-ugc.png`});
  await page.waitForFunction(()=>!document.querySelector('[data-ot]').dataset.editReplay,null,{timeout:60000});
  console.log(`Passed ${device}: protein-surface drag, wrong-drop return, gold outline, fixed placement and one-gesture edit.`);
  await context.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile(`${out}/results.json`,JSON.stringify({errors,checks:['updated pathway copy','desktop protein-surface drag','mobile protein-surface touch drag','wrong-drop return','gold target outlines','snap and fixed placement','one-gesture complete edit']},null,2));
} catch(error) {console.log({errors});throw error;} finally {await browser.close();}
