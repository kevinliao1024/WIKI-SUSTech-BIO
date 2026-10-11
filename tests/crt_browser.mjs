// WIKI_BASE_URL=http://127.0.0.1:8081 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/crt_browser.mjs
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.WIKI_BASE_URL || 'http://127.0.0.1:8081';
const out=process.env.CRT_OUTPUT || '/private/tmp/orca-crt'; await mkdir(out,{recursive:true});
const source=await readFile(new URL('../static/onetake/onetake.js',import.meta.url),'utf8');
const injected=source.replace('let raf = requestAnimationFrame(frame);',`window.__orcaReview={
  get state(){return {stage:uniforms.uStage.value,signal:uniforms.uSignal.value,core:foldMaterial.opacity / .22,filledBrain:scene.children.filter(o=>o.isMesh&&o!==ring).length,phase:root.dataset.crtPhase,active:!!navigator,rot:uniforms.uRot.value,finite:[...brainPos,...mazePos].every(Number.isFinite)};},
  setTake(take){const s=TRACK.find(s=>take>=s.from&&take<=s.to); const progress=(s.start+(take-s.from)/(s.to-s.from)*(s.end-s.start))/trackLength;window.scrollTo(0,progress*(story.getBoundingClientRect().height-innerHeight));},
  point(cell){const [x,y]=mazeNav.point(cell);const v=new THREE.Vector3(x,y+.2,mazeNav.bowl(x,y)).project(camera); const r=root.querySelector('[data-crt-picture]')?.getBoundingClientRect()||{x:0,y:0,width:innerWidth,height:innerHeight};return [r.x+(v.x*.5+.5)*r.width,r.y+(-v.y*.5+.5)*r.height];}
};let raf = requestAnimationFrame(frame);`);
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1280,height:800}}), errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.route('**/static/onetake/onetake.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:injected}));
const settle=async take=>{await page.evaluate(t=>window.__orcaReview.setTake(t),take);await page.waitForFunction(t=>Math.abs(parseFloat(document.querySelector('[data-ot]').style.getPropertyValue('--ot-p'))-t)<.0005,take,{timeout:60000});};
try{
 await page.goto(base);await page.waitForFunction(()=>window.__orcaReview&&document.querySelector('[data-ot]').classList.contains('is-ready'));
 await page.waitForTimeout(2000);await page.screenshot({path:`${out}/01-television.png`});
 assert.equal(await page.evaluate(()=>window.__orcaReview.state.phase),'television');
 assert.equal(await page.evaluate(()=>window.__orcaReview.state.signal),0);
 await settle(-.165);await page.screenshot({path:`${out}/02-snow-to-maze.png`});
 const emerging=await page.evaluate(()=>window.__orcaReview.state);assert.ok(emerging.signal>0&&emerging.signal<1);
 await settle(-.12);await page.screenshot({path:`${out}/03-maze.png`});
 assert.equal(await page.evaluate(()=>window.__orcaReview.state.phase),'maze');
 const aperture=await page.locator('[data-crt-picture]').boundingBox();assert.ok(Math.abs(aperture.width-1280)<1);assert.ok(Math.abs(aperture.height-800)<1);
 await page.mouse.move(...await page.evaluate(()=>window.__orcaReview.point(180)));await page.waitForFunction(()=>window.__orcaReview.state.active);
 await settle(-.03);await page.screenshot({path:`${out}/04-inflating.png`});
 assert.equal(await page.evaluate(()=>window.__orcaReview.state.rot),0);
 await settle(.005);await page.screenshot({path:`${out}/05-folds.png`});
 await settle(.065);await page.screenshot({path:`${out}/06-brain.png`});
 assert.ok(await page.evaluate(()=>window.__orcaReview.state.core)>.99);assert.ok(await page.evaluate(()=>window.__orcaReview.state.finite));assert.equal(await page.evaluate(()=>window.__orcaReview.state.filledBrain),0);
 await settle(.46);await page.screenshot({path:`${out}/07-rna.png`});assert.equal(await page.evaluate(()=>window.__orcaReview.state.core),0);
 // Crossing the new question starts the placement replay; exercise its skip
 // before checking the independent brain-return and reverse-scroll behavior.
 await page.evaluate(()=>window.__orcaReview.setTake(.97));
 await page.locator('[data-edit-skip]').waitFor({state:'visible',timeout:60000});
 await page.locator('[data-edit-skip]').click();
 await settle(.97);await page.screenshot({path:`${out}/08-return.png`});assert.ok(await page.evaluate(()=>window.__orcaReview.state.core)>.99);
 await settle(-.19);assert.equal(await page.evaluate(()=>window.__orcaReview.state.signal),0);
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.__orcaReview);await page.waitForTimeout(2000);
 await page.screenshot({path:`${out}/09-mobile-tv.png`});
 const mobile=await page.locator('[data-crt-mount]').boundingBox();assert.ok(mobile.x>=0&&mobile.x+mobile.width<=390);
 await settle(-.12);await page.screenshot({path:`${out}/10-mobile-maze.png`});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('[data-ot].ot--static').count(),1);
 assert.equal(await page.locator('[data-crt-mount]').isVisible(),false);
 assert.deepEqual(errors,[]);await writeFile(`${out}/results.json`,JSON.stringify({errors,checks:['CRT opening','same-particle snow to maze','full-screen aperture','mouse pursuit','inflation without rotation','particle brain with fine contours and no filled surface','RNA core hidden','brain return','reverse scroll','mobile layout','reduced motion']},null,2));
 console.log(`Passed CRT/brain browser checks; screenshots in ${out}`);
}catch(e){console.log(errors);await page.screenshot({path:`${out}/failure.png`});throw e;}finally{await browser.close();}
