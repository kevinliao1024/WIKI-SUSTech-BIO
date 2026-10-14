// Real browser regression for the project-anchor entry and protein dragging.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildScrollTrack } from '../static/onetake/burden-pacing.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8786';
const out = process.env.DRAG_OUTPUT || '/private/tmp/orca-drag-entry-20261013';
await mkdir(out, { recursive: true });
const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m => ({ p: +m[1], stage: +m[2] }));
const { track, length } = buildScrollTrack(keys);
const raw = q => { const s = track.find(s => q >= s.from && q <= s.to); return (s.start + (q-s.from)/(s.to-s.from)*(s.end-s.start))/length; };
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const errors = [], results = [];
let current;
try {
  for (const mobile of (process.env.DRAG_DEVICE === 'mobile' ? [true] : [false, true])) {
    const device = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, hasTouch: mobile, isMobile: mobile });
    const page = current = await context.newPage();
    page.setDefaultTimeout(60000);
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__dragEvents=[];
      for (const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture']) document.addEventListener(type,event => {
        if (window.__dragEvents.length<80) window.__dragEvents.push({type,kind:event.pointerType,button:event.button,target:event.target.getAttribute?.('data-bio-hit') || event.target.tagName,x:event.clientX,y:event.clientY});
      },true);
    });
    await page.goto(`${base}/next-journey#ot-index-title`);
    await page.waitForFunction(() => document.querySelector('[data-ot]').classList.contains('is-ready'));
    assert.equal(await page.locator('[data-ot]').evaluate(e => e.classList.contains('ot--static')), false, 'WebGL is active');
    await page.locator('[data-edit-start]').waitFor({ state: 'visible' });
    await page.screenshot({ path: `${out}/${device}-entry.png` });
    await page.locator('[data-edit-start]').click();
    await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'placement');
    console.log(`${device}: project entry reaches placement`);
    const startScroll = await page.evaluate(() => scrollY);
    const expectedScroll = await page.locator('[data-ot-story]').evaluate((e,p) => e.getBoundingClientRect().top + scrollY + (e.getBoundingClientRect().height-innerHeight)*p, raw(.55));
    assert.ok(Math.abs(startScroll-expectedScroll)<2, `RNA scroll position includes the journey opening: actual ${startScroll}, expected ${expectedScroll}`);
    const touch = mobile ? await context.newCDPSession(page) : null;
    async function coords(name) {
      return page.evaluate(name => {
        const handle = document.querySelector(`[data-bio-handle="${name}"]`).getBoundingClientRect();
        const target = document.querySelector(`[data-drop-site="${name}"]`).getBoundingClientRect();
        const disks = [...document.querySelector(`[data-bio-hit="${name}"]`).getAttribute('d').matchAll(/M([-\d.]+),([-\d.]+)a([-\d.]+),/g)];
        const m = disks.at(-1), r = +m[3];
        const grab = { x: +m[1]+r, y: +m[2]-(name === 'cetus' && !matchMedia('(max-width:760px)').matches ? .9*r : 0) };
        return { grab, destination: { x: grab.x+target.x+target.width/2-handle.x-handle.width/2, y: grab.y+target.y+target.height/2-handle.y-handle.height/2 }, home: { x:handle.x, y:handle.y }, outside: grab.y<handle.y || grab.x>handle.right, hit:document.elementFromPoint(grab.x,grab.y)?.getAttribute('data-bio-hit') };
      }, name);
    }
    async function start(point) {
      if (touch) await touch.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[point] });
      else { await page.mouse.move(point.x,point.y); await page.mouse.down(); }
    }
    async function move(from,to) {
      if (touch) for (let i=1;i<=12;i++) {
        await touch.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:from.x+(to.x-from.x)*i/12, y:from.y+(to.y-from.y)*i/12 }] });
        await page.waitForTimeout(30);
      } else await page.mouse.move(to.x,to.y,{ steps:12 });
    }
    async function end() {
      if (touch) await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      else await page.mouse.up();
    }
    const pod = await coords('pod');
    console.log(device,'outer particle grab',pod);
    assert.ok(pod.outside, 'grab the particle surface outside its text label');
    assert.equal(pod.hit,'pod');
    await start(pod.grab); await move(pod.grab,{ x:mobile?25:65,y:mobile?720:650 });
    assert.ok(await page.locator('[data-bio-handle="pod"]').evaluate(e => e.classList.contains('is-dragging')));
    await end();
    await page.waitForFunction(home => { const r=document.querySelector('[data-bio-handle="pod"]').getBoundingClientRect(); return Math.abs(r.x-home.x)<2 && Math.abs(r.y-home.y)<2; },pod.home);
    assert.equal(await page.locator('[data-bio-handle="pod"]').getAttribute('aria-pressed'),'false');
    for (const name of ['pod','cetus']) {
      const item=await coords(name);
      await start(item.grab); await move(item.grab,item.destination);
      await page.waitForFunction(name => document.querySelector(`[data-drop-site="${name}"]`).classList.contains('is-near'),name);
      await page.screenshot({path:`${out}/${device}-${name}-gold.png`});
      await end();
      await page.waitForFunction(name => document.querySelector(`[data-bio-handle="${name}"]`).getAttribute('aria-pressed') === 'true',name);
      assert.equal(await page.locator(`[data-bio-hit="${name}"]`).getAttribute('d'),'');
    }
    assert.ok(Math.abs(await page.evaluate(() => scrollY)-startScroll)<2,'dragging does not scroll the page');
    assert.equal(await page.locator('[data-ot]').getAttribute('data-edit-replay'),'placement');
    await page.screenshot({path:`${out}/${device}-placed.png`});
    if (touch) { const from={x:195,y:720},to={x:195,y:580}; await start(from);await move(from,to);await end(); }
    else await page.mouse.wheel(0,300);
    await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'edit');
    await page.waitForFunction(() => +document.querySelector('[data-bio-label="codon"]').style.getPropertyValue('--fix') > .99);
    await page.screenshot({path:`${out}/${device}-ugc.png`});
    await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'return');
    const projectScroll = await page.locator('[data-ot-story]').evaluate((e,p) => e.getBoundingClientRect().top+scrollY+(e.getBoundingClientRect().height-innerHeight)*p, raw(.955));
    assert.ok(Math.abs(await page.evaluate(() => scrollY)-projectScroll)<2,'return skips original chapters immediately');
    if (touch) {const from={x:195,y:720},to={x:195,y:580};await start(from);await move(from,to);await end();}
    else await page.mouse.wheel(0,150);
    assert.equal(await page.locator('[data-ot]').getAttribute('data-edit-replay'),'return','continuing the gesture keeps the project return active');
    assert.equal(await page.locator('[data-bio-label="codon"]').getAttribute('aria-label'),'UGC, intended APOE3-like RNA sequence','return never resets the visible edit to CGC');
    assert.equal(await page.locator('.ot-ch--stats').evaluate(e => e.classList.contains('is-on')),false,'AD crowd chapter remains inactive after editing');
    await page.screenshot({path:`${out}/${device}-project-return.png`});
    await page.waitForFunction(() => !document.querySelector('[data-ot]').dataset.editReplay);
    // The final return must actually reach the project in the offset story.
    await page.waitForFunction(() => !document.querySelector('[data-edit-start]').hidden);
    const finalScroll = await page.evaluate(() => scrollY);
    const expectedFinal = await page.locator('[data-ot-story]').evaluate((e,p) => e.getBoundingClientRect().top+scrollY+(e.getBoundingClientRect().height-innerHeight)*p, raw(.955));
    assert.ok(Math.abs(finalScroll-expectedFinal)<2,'return reaches the project after the journey opening');
    await page.locator('[data-edit-start]').click();
    await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'placement');
    for (const name of ['pod','cetus']) assert.equal(await page.locator(`[data-bio-handle="${name}"]`).getAttribute('aria-pressed'),'false','manual retry resets both modules');
    await page.locator('[data-edit-skip]').click();
    results.push({device,passed:true});
    console.log(`Passed ${device}: drag and edit, direct project return, no repeated CGC/AD chapter during continued scrolling, retry reset`);
    await context.close(); current=null;
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/results.json`,JSON.stringify({base,errors,results},null,2));
} catch (error) {
  if (current) console.log(await current.evaluate(() => ({phase:document.querySelector('[data-ot]').dataset.editReplay,events:window.__dragEvents,touchAction:[...document.querySelectorAll('.ot-bio-guides,[data-bio-hit]')].map(e=>({tag:e.tagName,action:getComputedStyle(e).touchAction}))})).catch(()=>null));
  if (current) await current.screenshot({path:`${out}/failure.png`}).catch(()=>{});
  console.log({errors}); throw error;
} finally {await browser.close();}
