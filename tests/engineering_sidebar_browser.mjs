// WIKI_BASE_URL=http://127.0.0.1:8898 PLAYWRIGHT_MODULE=/path/to/playwright node tests/engineering_sidebar_browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.WIKI_BASE_URL||'http://127.0.0.1:8898';
const out=process.env.ENGINEERING_OUTPUT||'work/engineering-sidebar-qa';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto(`${base}/engineering#pod-cycle-01`,{waitUntil:'networkidle'});
 const ws=page.locator('[data-engineering-workspace]');
 const group=id=>page.locator(`[data-diagram-group="${id}"]`);
 const child=id=>page.locator(`[data-diagram-part="${id}"]`);
 const expectPart=part=>page.waitForFunction(p=>document.querySelector('[data-dbtl-wheel]').dataset.part===p,part);
 const geometry=()=>page.evaluate(()=>{const b=s=>document.querySelector(s).getBoundingClientRect();const l=b('.engineering-sidebar-left'),r=b('.engineering-sidebar-right'),paper=b('.engineering-paper'),o=b('[data-reading-orbit]'),text=b('.engineering-copy .markdown-content'),t=b('[data-engineering-cycles]'),w=b('.dbtl-directory'),back=b('[data-engineering-map-back]');return {equal:l.width===r.width,order:w.bottom<=t.top&&t.bottom<=back.top,gutter:o.left-text.right,inside:o.right<paper.right&&o.left>paper.left};});
 let layout=await geometry();assert.ok(layout.equal&&layout.order&&layout.inside&&layout.gutter>=8);
 assert.equal(await page.locator('.engineering-sidebar-left [data-engineering-cycles]').count(),0);
 assert.equal(await page.locator('.engineering-sidebar-right [data-engineering-cycles]').count(),1);
 assert.equal(await page.locator('.engineering-paper>[data-reading-orbit]').count(),1);
 assert.equal(await group('edit').getAttribute('aria-expanded'),'true');
 assert.equal(await page.locator('.project-diagram img').count(),0);
 assert.equal(await page.locator('.diagram-tile svg').count(),7);
 // One genuine navigation route for every authored module and child.
 for(const [g,parts] of [['fundamental-research',[]],['edit',['pod','cetus','integrated-orca']],['control',['gfa','mre','aso','cre-loxp']],['deliver',[]],['measure',[]],['model',['model-rna-seq','model-puf','model-apobec','model-lamar','model-whole-body']]]){
  await group(g).click();
  if(!parts.length)await expectPart(g);
  for(const part of parts){await child(part).click();await expectPart(part);assert.equal(await page.locator('.engineering-part-panel:not([hidden])').count(),1);}
  assert.equal(await page.locator('.diagram-branch').count(),parts.length?1:0);
 }
 await group('control').click();
 let positions=await page.locator('.branch-control a').evaluateAll(es=>es.map(e=>({x:e.offsetLeft,y:e.offsetTop})));
 assert.equal(positions[0].y,positions[1].y);assert.equal(positions[2].y,positions[3].y);assert.ok(positions[2].y>positions[0].y);
 await group('model').click();positions=await page.locator('.branch-model a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));assert.equal(positions[0],positions[2]);assert.equal(positions[3],positions[4]);assert.ok(positions[3]>positions[0]);
 await group('functional-validation').click();
 for(const n of ['01','02','03']){await child(`functional-validation-cycle-${n}`).click();await page.waitForFunction(n=>document.querySelector('[data-dbtl-wheel]').dataset.cycle===`functional-validation-cycle-${n}`,n);assert.equal(await page.locator('[data-engineering-cycles]').isVisible(),false);}
 await group('edit').click();await child('pod').click();
 await page.locator('[data-engineering-cycle="01"]').focus();await page.locator('[data-engineering-cycle="01"]').press('ArrowDown');await page.waitForFunction(()=>document.querySelector('[data-dbtl-wheel]').dataset.cycle==='pod-cycle-02');
 await page.locator('[data-engineering-cycle="02"]').press('ArrowDown');await page.waitForFunction(()=>document.querySelector('[data-dbtl-wheel]').dataset.cycle==='pod-cycle-03');
 await page.locator('[data-engineering-cycle="03"]').press('ArrowUp');await page.waitForFunction(()=>document.querySelector('[data-dbtl-wheel]').dataset.cycle==='pod-cycle-02');
 await page.locator('[data-dbtl-stage="test"]').click();await page.waitForFunction(()=>document.querySelector('[data-dbtl-wheel]').dataset.stage==='test');
 const orbit=page.locator('[data-reading-orbit]');await orbit.focus();await orbit.press('End');await page.waitForFunction(()=>document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')==='100');await orbit.press('Home');await page.waitForFunction(()=>document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')==='0');
 // Drag while the reader is stationary, and verify its actual scroll position.
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const handle=await page.locator('[data-orbit-traveler]').boundingBox();await page.mouse.move(handle.x+16,handle.y+16);await page.mouse.down();await page.mouse.move(handle.x+16,handle.y+120,{steps:10});await page.mouse.up();await page.waitForFunction(()=>document.querySelector('[data-engineering-scroll]').scrollTop>50);
 await page.locator('[data-engineering-cycle="01"]').click();await page.screenshot({path:`${out}/desktop.png`});
 await page.setViewportSize({width:1280,height:720});await group('control').click();await child('mre').click();layout=await geometry();assert.ok(layout.equal&&layout.order&&layout.inside&&layout.gutter>=8);await page.screenshot({path:`${out}/compact.png`});
 await page.locator('[data-engineering-map-back]').click();await page.waitForFunction(()=>document.querySelector('[data-engineering-workspace]').dataset.engineeringView==='map');assert.equal(await page.locator('.engineering-sidebar-right').isVisible(),false);assert.equal(await page.locator('[data-engineering-group]').count(),7);await page.screenshot({path:`${out}/map.png`});
 for(const width of [820,390]){await page.setViewportSize({width,height:844});await page.goto(`${base}/engineering#pod-cycle-01`,{waitUntil:'networkidle'});await page.locator('.engineering-nav-toggle').click();await group('control').click();await expectPart('gfa');assert.equal(await page.locator('.engineering-nav-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const paper=await page.locator('.engineering-paper').boundingBox(),right=await page.locator('.engineering-sidebar-right').boundingBox();assert.ok(paper.width>width*(width<=550?.85:.65),'Mobile reader must retain readable width.');assert.ok(paper.height>350,'Mobile reader must retain readable height.');if(width<=550)assert.ok(right.y>=paper.y+paper.height,'Phone controls must sit below the paper.');await page.screenshot({path:`${out}/mobile-${width}.png`});}
 // Existing page-level orbit still binds to window, not the Engineering reader.
 await page.setViewportSize({width:1440,height:900});await page.goto(`${base}/description`,{waitUntil:'networkidle'});assert.equal(await orbit.getAttribute('data-scroll-target'),null);await orbit.focus();await orbit.press('End');await page.waitForFunction(()=>document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')==='100');await orbit.press('Home');await page.waitForFunction(()=>document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')==='0');
 assert.deepEqual(errors,[]);await writeFile(`${out}/results.json`,JSON.stringify({layout,errors,checks:['all modules and FV experiments','2x2 / 3+2 branches','vertical tuner keyboard and reveal','DBTL stages','reader orbit drag and keyboard','Back to map','desktop / tablet / phone','Description orbit regression']},null,2));console.log('Engineering sidebar checks passed.');
} finally {await browser.close();}
