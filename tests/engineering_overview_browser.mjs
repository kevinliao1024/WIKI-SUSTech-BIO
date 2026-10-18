// WIKI_BASE_URL=http://127.0.0.1:8796 PLAYWRIGHT_MODULE=/path/to/playwright node tests/engineering_overview_browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.WIKI_BASE_URL || 'http://127.0.0.1:8796';
const output=process.env.ENGINEERING_OUTPUT || 'work/linked-map/qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
page.setDefaultTimeout(8000);
const map=()=>page.locator('[data-engineering-map]');
const art=()=>page.locator('[data-engineering-overview]');
async function selected(part){await page.waitForFunction(part=>document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart===part,part);}
async function back(){await page.locator('[data-engineering-map-back]').click();}
async function assertColor(part,group){
 await page.waitForFunction(({part,group})=>{const a=document.querySelector('[data-engineering-overview]');return a.dataset.activeGroup===group && a.dataset.activePart===part;},{part,group});
 await page.waitForFunction(({part,group})=>[...document.querySelectorAll('[data-overview-layer]')].every(layer=>{
  const colored=layer.dataset.overviewFamily===group && (!part || layer.dataset.overviewParts.split(' ').includes(part));
  const paint=[...layer.querySelectorAll('[fill], [stroke]')].flatMap(node=>['fill','stroke'].map(key=>node.getAttribute(key))).filter(value=>/^#[0-9a-f]{6}$/i.test(value || ''));
  const chromatic=paint.filter(color=>color.slice(1,3)!==color.slice(3,5)||color.slice(3,5)!==color.slice(5,7));
  return colored ? chromatic.length>0 : chromatic.length===0;
 }),{part,group});
}
try {
 await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
 const groups=await page.locator('[data-engineering-map-data]').evaluate(e=>JSON.parse(e.textContent));
 assert.equal(await page.locator('.engineering-map-cycles,[data-map-cycle]').count(),0);
 assert.equal(await art().locator('image').count(),1);
 assert.equal(await art().locator('[data-overview-layer]').count(),18);
 const left=await page.locator('[data-map-canvas]').boundingBox(),right=await art().boundingBox();
 assert.ok(left.x+left.width<right.x,'Mind map is entirely left of overview.');
 for(const group of groups){
  const parent=page.locator(`[data-engineering-group="${group.id}"]`);
  await parent.hover();await assertColor('',group.id);
  for(const part of group.parts){
   if(group.parts.length>1){await page.locator(`[data-engineering-part="${part.id}"]`).hover();await assertColor(part.id,group.id);}
   const diagram=page.locator(`[data-overview-target="${part.id}"]${group.parts.length>1?':not([data-overview-select-group])':''}`).first();
   // Enter from outside the artwork, avoiding stationary-pointer artifacts.
   await page.mouse.move(8,105);await diagram.hover();
   assert.equal(await map().getAttribute('data-selected-group'),group.id);
   if(group.parts.length>1){
    assert.equal(await map().getAttribute('data-selected-part'),part.id);
    assert.ok(await page.locator(`[data-engineering-part="${part.id}"]`).isVisible());
    await assertColor(part.id,group.id);
   }
   await diagram.click();await selected(part.id);
   assert.equal(new URL(page.url()).hash,`#${part.id}`);
   await back();
   const tree=group.parts.length>1?page.locator(`[data-engineering-part="${part.id}"]`):parent;
   await tree.click();await selected(part.id);await back();
  }
 }
 // Keyboard focus uses the same highlight and chapter destination as a pointer.
 const keyboardTarget=page.locator('[data-overview-target="gfa"]:not([data-overview-select-group])');
 await keyboardTarget.focus();await assertColor('gfa','control');await page.keyboard.press('Enter');await selected('gfa');await back();
 await page.locator('[data-engineering-group="control"]').hover();await assertColor('','control');
 await page.screenshot({path:`${output}/desktop-control.png`});
 await page.locator('[data-overview-target="model-apobec"]').hover();await assertColor('model-apobec','model');
 await page.screenshot({path:`${output}/desktop-model.png`});
 // Motion-enabled navigation must not throw, and all touch links remain accessible.
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('[data-engineering-group="edit"]').hover();await page.waitForTimeout(350);
 await page.locator('[data-engineering-part="cetus"]').click();await selected('cetus');await back();
 for (const width of [1024,768,627,390]){
  await page.setViewportSize({width,height:844});await page.waitForTimeout(100);
  assert.ok(await map().evaluate(e=>e.scrollWidth<=e.clientWidth+1),`No horizontal overflow at ${width}px`);
  if(width<600){assert.equal(await page.locator('[data-map-branch-group]:visible').count(),3);}
  await page.screenshot({path:`${output}/layout-${width}.png`});
 }
 await page.locator('[data-overview-target="cre-loxp"]').click();await selected('cre-loxp');await back();
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const mobile=await touch.newPage();await mobile.goto(`${base}/engineering`,{waitUntil:'networkidle'});
 await mobile.locator('[data-overview-target="aso"]').tap();
 await mobile.waitForFunction(()=>document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart==='aso');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/result.json`,JSON.stringify({passed:true,parts:groups.flatMap(g=>g.parts).length,rasterAssets:1,layers:18,checks:['bidirectional hover','grayscale isolation','both chapter destinations','keyboard Enter','reader return','motion','responsive overflow','touch tap'],errors},null,2));
 console.log('PASS: all 14 chapters from both sides, hover color isolation, keyboard, motion, mobile and touch.');
} finally {await browser.close();}
