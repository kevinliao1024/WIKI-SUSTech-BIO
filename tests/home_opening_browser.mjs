import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const base=process.env.WIKI_BASE_URL||'http://127.0.0.1:8147',out=process.env.OPENING_OUTPUT||'/private/tmp/orca-home-opening';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const checks=[];
try {
  for(const width of [1280,390]) {
    const page=await browser.newPage({viewport:{width,height:width===1280?800:844}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    let unblock;
    const blocked=new Promise(r=>unblock=r);
    await page.route('**/static/onetake/onetake.js',async route=>{await blocked;await route.continue();});
    await page.goto(base,{waitUntil:'commit'});
    await page.locator('.ot-hero-title').waitFor({state:'attached'});
    // Let the browser paint while the large animation module is deliberately held.
    await page.waitForTimeout(1200);
    const before=await page.evaluate(()=>({static:document.querySelector('[data-ot]').classList.contains('ot--static'),hero:getComputedStyle(document.querySelector('.ot-ch--hero')).opacity,ready:document.querySelector('[data-ot]').classList.contains('is-ready'),tv:getComputedStyle(document.querySelector('[data-crt-mount]')).display}));
    assert.equal(before.static,false);assert.equal(+before.hero,0);assert.equal(before.ready,false);assert.notEqual(before.tv,'none');
    await page.screenshot({path:`${out}/loading-tv-${width}.png`});
    unblock();
    await page.waitForFunction(()=>document.querySelector('[data-ot]').classList.contains('is-ready'),null,{timeout:60000});
    assert.equal(await page.locator('[data-ot]').getAttribute('data-crt-phase'),'television');
    assert.equal(+await page.locator('.ot-ch--hero').evaluate(e=>getComputedStyle(e).opacity),0);
    await page.screenshot({path:`${out}/ready-tv-${width}.png`});
    // Exercise navigation back from an inner page, including its transition.
    await page.goto(base+'/model');
    let releaseReturn;
    const returnBlocked=new Promise(r=>releaseReturn=r);
    await page.unroute('**/static/onetake/onetake.js');
    await page.route('**/static/onetake/onetake.js',async route=>{await returnBlocked;await route.continue();});
    await page.locator('nav[aria-label="Primary navigation"] a[href="/"]').first().click();
    await page.waitForURL(base+'/',{waitUntil:'commit'});
    await page.locator('.ot-hero-title').waitFor({state:'attached'});
    await page.waitForTimeout(1600);
    assert.equal(+await page.locator('.ot-ch--hero').evaluate(e=>getComputedStyle(e).opacity),0);
    assert.ok(await page.locator('[data-crt-mount]').isVisible());
    releaseReturn();await page.waitForFunction(()=>document.querySelector('[data-ot]').classList.contains('is-ready'),null,{timeout:60000});
    assert.deepEqual(errors,[]);checks.push(`first paint and inner-page return ${width}px`);
    await page.close();
  }
  const failed=await browser.newPage();
  await failed.route('**/static/onetake/onetake.js',r=>r.abort('failed'));
  await failed.goto(base);
  await failed.locator('[data-ot].ot--static.is-ready').waitFor();
  assert.equal(await failed.locator('[data-crt-mount]').isVisible(),false);
  assert.ok(await failed.locator('.ot-hero-title').isVisible());checks.push('failed module restores readable fallback');
  await failed.close();
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:844}});
  await nojs.goto(base);assert.ok(await nojs.locator('.ot-hero-title').isVisible());assert.equal(await nojs.locator('[data-crt-mount]').isVisible(),false);
  assert.ok(await nojs.getByText('PUF recognizes and binds the target RNA. APOBEC converts the target C to U.',{exact:true}).isVisible());checks.push('no-JavaScript readable fallback');await nojs.close();
  const reduce=await browser.newPage({reducedMotion:'reduce'});
  await reduce.goto(base+'/#ot-index-title');
  assert.equal(await reduce.locator('[data-crt-mount]').isVisible(),false);
  assert.equal(await reduce.locator('[data-explore-slides]').evaluate(e=>e.textContent.includes('↗')),false);
  assert.equal(await reduce.getByText('Conceptual editing mechanism',{exact:true}).count(),0);
  assert.equal(await reduce.getByText('Explore ORCA',{exact:false}).count(),0);
  await reduce.locator('#explore-selector-4').focus();
  await reduce.locator('[data-explore-directory]').scrollIntoViewIfNeeded();
  await reduce.screenshot({path:`${out}/clean-directory.png`});
  checks.push('reduced motion, directory arrows and unwanted captions removed');
  await reduce.close();
  await writeFile(`${out}/results.json`,JSON.stringify({checks},null,2));console.log(checks);
} finally {await browser.close();}
