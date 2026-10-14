import { chromium } from '/Users/kevinliao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
const page=await browser.newPage({viewport:{width:850,height:1200}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.setDefaultTimeout(7000);
const results=[];
try {
  await page.goto('file://'+base+'/preview.html');
  const frame=page.frames().find(f=>f.parentFrame());
  await frame.waitForSelector('.oa-node');
  assert.match(await frame.locator('.oa-total').first().innerText(),/^04/);
  await frame.locator('[data-design="atlas"] [data-page-link="contribution"]').click();
  assert.match(await frame.locator('.oa-total').first().innerText(),/^05/);
  await frame.locator('[data-design="atlas"] [data-page-link="contribution"]').click();
  assert.match(await frame.locator('.oa-total').first().innerText(),/^05/);
  results.push('New exploration adds one; revisiting does not add another.');
  await page.screenshot({path:base+'/atlas-desktop.png',fullPage:true});
  for(const design of ['atlas','reef','slides']){
    await frame.evaluate(design=>{document.querySelectorAll('[data-variant]').forEach(s=>s.hidden=!s.querySelector('[data-design="'+design+'"]'));},design);
    await frame.locator('[data-design="'+design+'"] .oa-groupbtn[data-group="2"]').click();
    await frame.locator('[data-design="'+design+'"] [data-page-link="software"]').click();
    assert.match(await frame.locator('[data-design="'+design+'"] .oa-total').innerText(),/^06/);
    await page.setViewportSize({width:850,height:1200});
    await page.screenshot({path:base+'/'+design+'-desktop.png',fullPage:true});
    for(const width of [320,390]){
      await page.setViewportSize({width,height:1400});
      await frame.locator('[data-design="'+design+'"] .oa-groupbtn[data-group="1"]').click();
      const layout=await frame.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
      assert.ok(layout.content<=layout.width+1,JSON.stringify(layout));
      await page.screenshot({path:base+'/'+design+'-'+width+'.png',fullPage:true});
    }
    results.push(design+': category switching, shared footprint and 320/390px no-overflow passed.');
  }
  assert.deepEqual(errors,[]);
  await fs.writeFile(base+'/checks.json',JSON.stringify({results,errors},null,2)+'\n');
  console.log(results.join('\n'));
} catch(error){console.log('Errors:',errors);console.log(await page.frames().find(f=>f.parentFrame())?.locator('#orca-atlas-directions').innerText());await page.screenshot({path:base+'/check-failure.png',fullPage:true});throw error;} finally {await browser.close();}
