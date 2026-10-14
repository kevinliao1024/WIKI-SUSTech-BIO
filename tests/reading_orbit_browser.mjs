// WIKI_BASE_URL=http://127.0.0.1:8774 PLAYWRIGHT_MODULE=/absolute/path/playwright node tests/reading_orbit_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8774';
const output = process.env.ORBIT_OUTPUT || `/tmp/wiki-reading-orbit-${Date.now()}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({channel:'chrome', headless:true, chromiumSandbox:true});
const errors = [];
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(10000);
const orbit = () => page.evaluate(() => {
  const el = document.querySelector('[data-reading-orbit]');
  const form = el.querySelector('svg').getBoundingClientRect();
  return {percent:Number(el.getAttribute('aria-valuenow')), y:parseFloat(el.style.getPropertyValue('--orbit-y')),
    angle:parseFloat(el.style.getPropertyValue('--orbit-turn')), display:getComputedStyle(el).display,
    top:form.top,bottom:form.bottom,left:form.left,right:form.right,width:innerWidth,height:innerHeight};
});
async function scrollFraction(ratio) {
  await page.evaluate(ratio => scrollTo({top:ratio*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),ratio);
  await page.waitForFunction(ratio => Math.abs(Number(document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow'))-ratio*100)<2,ratio);
  return orbit();
}
async function stage(name,cycle='cycle-01') {
  await page.locator(`[data-dbtl-stage="${name}"]`).click();
  try {
    await page.waitForFunction(id => document.activeElement.id===id &&
      Math.abs(document.getElementById(id).getBoundingClientRect().top-parseFloat(getComputedStyle(document.getElementById(id)).scrollMarginTop))<3,`${cycle}-${name}`);
  } catch(error) {
    console.log('DBTL diagnostic',name, await page.evaluate(id=>({hash:location.hash,focus:document.activeElement.id,
      top:document.getElementById(id).getBoundingClientRect().top,margin:getComputedStyle(document.getElementById(id)).scrollMarginTop,
      active:document.querySelector('[data-dbtl-stage][aria-current]')?.dataset.dbtlStage,
      cycle:document.querySelector('[data-dbtl-cycle]').value,scroll:scrollY}),`${cycle}-${name}`));
    await page.screenshot({path:`${output}/dbtl-failure.png`});
    throw error;
  }
  assert.equal(new URL(page.url()).hash,`#${cycle}-${name}`);
  assert.equal(await page.locator('[data-dbtl-stage][aria-current]').getAttribute('data-dbtl-stage'),name);
  const target = await page.locator(`#${cycle}-${name}`).boundingBox();
  const dock = await page.locator('.dbtl-directory').boundingBox();
  const nav = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')));
  assert.ok(target.y >= (page.viewportSize().width<=991 ? dock.y+dock.height : nav)-1,JSON.stringify({target,dock,nav}));
}
try {
  for (const route of ['/', '/next', '/description', '/model']) {
    await page.goto(`${base}${route}${route==='/' || route==='/next' ? '?p=0.43' : ''}`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-reading-orbit]').count(),1);
    assert.equal(await page.locator('[data-story-progress]').count(),0);
    const start = await scrollFraction(0);
    const middle = await scrollFraction(.43);
    if(route==='/' || route==='/description') await page.screenshot({path:`${output}/${route==='/'?'home':'general'}-desktop.png`});
    const end = await scrollFraction(1);
    assert.equal(start.percent,0); assert.equal(end.percent,100);
    assert.ok(middle.y>start.y && end.y>middle.y);
    assert.ok(middle.angle>start.angle && end.angle>middle.angle);
    assert.equal(end.angle,720);
    for (const state of [start,middle,end]) assert.ok(state.display!=='none' && state.top>=0 && state.bottom<=state.height && state.left>=0 && state.right<=state.width,JSON.stringify(state));
    console.log(`${route}: progress 0 → 43 → 100; translation, rotation and viewport bounds passed.`);
  }
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  for (const name of ['design','build','test','learn']) await stage(name);
  await page.screenshot({path:`${output}/dbtl-desktop.png`});
  await page.locator('[data-dbtl-cycle]').selectOption('cycle-02');
  await page.waitForFunction(() => document.activeElement.id==='cycle-02-learn');
  for (const name of ['design','build','test','learn']) await stage(name,'cycle-02');
  await page.goto(`${base}/engineering#cycle-01-test`,{waitUntil:'networkidle'});
  await page.waitForFunction(() => Math.abs(document.getElementById('cycle-01-test').getBoundingClientRect().top-parseFloat(getComputedStyle(document.getElementById('cycle-01-test')).scrollMarginTop))<3);
  assert.equal(await page.locator('[data-dbtl-stage][aria-current]').getAttribute('data-dbtl-stage'),'test');
  await page.locator('#cycle-02-build').evaluate(el => scrollTo({top:scrollY+el.getBoundingClientRect().top-parseFloat(getComputedStyle(el).scrollMarginTop),behavior:'instant'}));
  await page.mouse.wheel(0,1);
  await page.waitForFunction(() => document.querySelector('[data-dbtl-cycle]').value==='cycle-02' && document.querySelector('[data-dbtl-stage][aria-current]').dataset.dbtlStage==='build');
  await page.locator('[data-dbtl-stage="learn"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement.id==='cycle-02-learn');
  console.log('DBTL: four stages, two cycles, scroll tracking, direct hash and keyboard activation passed.');
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  for (const name of ['design','build','test','learn']) await stage(name);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/dbtl-mobile.png`});
  for(const route of ['/', '/description','/model']) {
    await page.goto(`${base}${route}${route==='/' ? '?p=0.43' : ''}`,{waitUntil:'networkidle'});
    const middle=await scrollFraction(.43);
    assert.ok(middle.left>=0 && middle.right<=390 && middle.bottom<844,JSON.stringify(middle));
    await page.screenshot({path:`${output}/${route==='/'?'home':route.slice(1)}-mobile.png`});
  }
  console.log('390px mobile: sticky DBTL targets unobscured; progress stays inside viewport.');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  for(const name of ['build','test','learn']) await stage(name);
  assert.equal((await orbit()).angle,0);
  assert.ok(await page.locator('.dbtl-wheel__rotor').evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration)<.001));
  await scrollFraction(1);
  assert.equal((await orbit()).percent,100);
  assert.deepEqual(errors,[]);
  console.log(`Reduced motion, runtime errors and focus passed. Screenshots: ${output}`);
  await writeFile(`${output}/result.json`,JSON.stringify({passed:true,errors},null,2));
} finally { await browser.close(); }
