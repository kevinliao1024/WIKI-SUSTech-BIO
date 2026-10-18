// PLAYWRIGHT_MODULE=/path/to/playwright NOTEBOOK_BASE=http://127.0.0.1:8127 node tests/notebook_browser.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.NOTEBOOK_BASE||'http://127.0.0.1:8127';
const output=process.env.NOTEBOOK_OUTPUT||'/tmp/orca-notebook-qa';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[], errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));
const requests=[];page.on('request',r=>requests.push(r.url()));
await page.goto(`${base}/notebook`);await page.waitForSelector('[data-mode="overview"]');
await page.evaluate(()=>{window.notebookOriginalMap=document.querySelector('[data-map-group]');});
const overviewOrder=await page.evaluate(()=>({
 months:[...document.querySelectorAll('.nb-tick.is-month')].map(n=>({label:n.querySelector('text').textContent,y:n.getBoundingClientRect().top})),
 stage:document.querySelector('[data-stage]').getBoundingClientRect().bottom,
 cards:document.querySelector('[data-tracks]').getBoundingClientRect().top,
 firstMonth:document.querySelector('.nb-tick.is-month').getBoundingClientRect().top,
 height:innerHeight,
}));
assert.deepEqual(overviewOrder.months.map(m=>m.label),['OCT','SEPT','AUG','JUL','JUN']);
assert.ok(overviewOrder.months.every((m,i,all)=>!i||m.y>all[i-1].y),'Months descend from October to June');
assert.ok(overviewOrder.cards>=overviewOrder.stage,'Track cards follow the entire timeline');
assert.ok(overviewOrder.firstMonth<overviewOrder.height,'October is visible on entry');

assert.equal(requests.filter(r=>r.includes('/previews/')||r.endsWith('.pdf')).length,0,'Overview must not preload PDF pages');
const point=async(track,date)=>page.locator(`.nb-lane[data-track="${track}"] .nb-date-target[data-date="${date}"]`).evaluate(n=>{const b=n.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2};});
const a=await point('aav','2026-09-26'), b=await point('reporter','2026-09-26');assert.ok(Math.abs(a.y-b.y)<1,'Concurrent tracks share calendar y');
await page.waitForTimeout(550);await page.screenshot({path:`${output}/desktop-overview.png`,fullPage:true});
await page.evaluate(()=>scrollTo(0,1600));await page.waitForTimeout(150);
await page.locator('.nb-lane[data-track="aav"]').focus();await page.keyboard.press('Enter');
await page.waitForSelector('[data-mode="focus"]');await page.waitForTimeout(550);
assert.equal(await page.evaluate(()=>window.notebookOriginalMap===document.querySelector('[data-map-group]')),true,'Same timeline DOM survives reflow');
assert.equal(await page.locator('.nb-card:not([data-track="aav"])').count(),0);
assert.equal(await page.locator('.nb-card').count(),17);
await page.screenshot({path:`${output}/desktop-focus.png`});
await page.locator('[data-jump]').selectOption('2026-09-26');await page.waitForTimeout(100);
const jumpY=await page.locator('#day-2026-09-26').evaluate(n=>n.getBoundingClientRect().top);assert.ok(jumpY>=100&&jumpY<350,'Date jump is below fixed nav');
// Focus exposes only the selected lane; the toolbar remains the track switcher.
assert.equal(await page.locator('.nb-lane:visible').count(),1);
assert.equal(await page.locator('.nb-lane[aria-hidden="true"][tabindex="0"]').count(),0);
await page.locator('[data-switch]').selectOption('reporter');await page.waitForTimeout(550);
assert.equal(await page.locator('.nb-card').count(),33);
assert.equal(await page.locator('.nb-card:not([data-track="reporter"])').count(),0);
await page.locator('[data-back]').click();await page.waitForTimeout(550);

assert.ok(Math.abs(await page.evaluate(()=>scrollY-history.state.overviewScroll))<3,'Return restores original overview context');
results.push('Overview: no source downloads, shared calendar coordinates, persistent map DOM, strict AAV/Reporter switching, keyboard activation and overview scroll restoration.');
await page.goto(`${base}/notebook?track=puf&date=2026-07-27&record=QX01`);await page.waitForSelector('#record-QX01 [aria-expanded="true"]');await page.waitForTimeout(550);
assert.equal(await page.locator('#record-QX01 img').count(),2);
assert.ok((await page.locator('#record-QX01 img').first().boundingBox()).width<=500,'Original pages retain a compact reading width');
await page.locator('#record-QX01 img').first().scrollIntoViewIfNeeded();
await page.waitForFunction(()=>document.querySelector('#record-QX01 img').naturalWidth>0);
const aligned=await page.evaluate(()=>{
 const out=[];
 for(const row of document.querySelectorAll('.nb-day')){
 const node=document.querySelector(`.nb-lane.is-selected .nb-date-target[data-date="${row.dataset.date}"]`);
 const n=node.getBoundingClientRect();const card=row.querySelector('.nb-card').getBoundingClientRect();
 out.push(Math.abs(n.top+n.height/2-card.top-25));
 }return Math.max(...out);
});assert.ok(aligned<2,`Expanded source pages preserve date alignment (${aligned})`);
await page.screenshot({path:`${output}/desktop-original-pdf.png`});
await page.locator('#record-QX01 button').click();assert.equal(await page.locator('#record-QX01 img').count(),0,'Collapse releases page DOM');
await page.locator('[data-back]').click();await page.goBack();await page.waitForSelector('[data-mode="focus"]');await page.goForward();await page.waitForSelector('[data-mode="overview"]');
results.push('Focus: multipage record deep link, original image load, measured node/card alignment, resource cleanup and Back/Forward.');
// Static-host prefix is handled by relative asset paths, independently of the dev root.
for(const size of [{width:834,height:1112},{width:390,height:844},{width:320,height:740}]) {
 await page.setViewportSize(size);await page.goto(`${base}/notebook`);await page.waitForSelector('[data-mode="overview"]');await page.waitForTimeout(300);
 await page.screenshot({path:`${output}/overview-${size.width}.png`});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page-wide horizontal overflow');
 await page.locator('.nb-track-chip[data-track="puf"]').click();await page.waitForTimeout(550);
 await page.locator('[data-jump]').selectOption('2026-07-27');await page.locator('#record-QX01 button').click();
 await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`${output}/focus-${size.width}.png`});
}
results.push('Responsive: 834px tablet, 390px and 320px mobile; no document overflow; selected-track date jump and PDF expansion.');
await page.emulateMedia({reducedMotion:'reduce'});
assert.equal(await page.locator('[data-map-group]').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
results.push('Reduced motion disables the timeline movement without disabling navigation.');
await page.route('**/previews/**',route=>route.abort());
await page.goto(`${base}/notebook?record=QX01`);await page.waitForSelector('.nb-page-error');
assert.ok(await page.locator('.nb-page-error a').first().getAttribute('href'));
results.push('Unavailable preview shows a readable error and a direct original PDF fallback.');
await page.unroute('**/previews/**');
await page.route('**/notebook/index.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,tracks:[],records:[],milestones:[]})}));
await page.goto(`${base}/notebook`);await page.waitForSelector('[data-notebook][aria-busy="false"]');assert.match(await page.locator('[data-status]').innerText(),/verified and indexed/);
results.push('Empty source index remains truthful and usable.');
assert.deepEqual(errors,[]);
await writeFile(`${output}/results.json`,JSON.stringify({results,errors},null,2));
console.log(results.join('\n'));await browser.close();
