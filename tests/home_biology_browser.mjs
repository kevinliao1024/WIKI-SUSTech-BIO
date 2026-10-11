// Isolated real-WebGL verification; never uses the user's browser profile.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs WIKI_BASE_URL=http://127.0.0.1:8082 node tests/home_biology_browser.mjs
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildScrollTrack } from '../static/onetake/burden-pacing.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8082';
const out = process.env.BIOLOGY_OUTPUT || '/private/tmp/orca-biology';
await mkdir(out, { recursive: true });
const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m => [+m[1], +m[2]]);
const { track, length } = buildScrollTrack(keys.map(([p, stage]) => ({ p, stage })));
const raw = take => { const s = track.find(s => take >= s.from && take <= s.to); return (s.start+(take-s.from)/(s.to-s.from)*(s.end-s.start))/length; };
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const root = page.locator('[data-ot]');
const ready = () => page.waitForFunction(() => document.querySelector('[data-ot]')?.classList.contains('is-ready'));
async function outerPodPoint() {
  return page.locator('[data-bio-hit="pod"]').evaluate(el => {
    const disks=[...el.getAttribute('d').matchAll(/M([-\d.]+),([-\d.]+)a([-\d.]+),/g)];
    const disk=disks.at(-1);
    return {x:+disk[1]+ +disk[3],y:+disk[2]};
  });
}
async function pinned(take, name) {
  await page.goto(`${base}/?p=${raw(take)}`); await ready();
  await page.waitForFunction(q => Math.abs(+document.querySelector('[data-ot]').style.getPropertyValue('--ot-p')-q)<.001, take);
  await page.waitForTimeout(1800); // Canvas/DOM entrance opacity, not simulation timing.
  await page.screenshot({ path: `${out}/${name}.png` });
  assert.equal(await root.evaluate(e => e.classList.contains('ot--static')), false);
}
try {
  await pinned(.29, '01-cell');
  await pinned(.37, '02-cell-rna');
  await pinned(.55, '03-cgc');
  assert.equal(await page.locator('[data-bio-label="codon"]').getAttribute('aria-label'), 'CGC, APOE4 RNA target');
  await pinned(.71, '04-amyloid');
  await pinned(.763, '05-numbers');
  await pinned(.803, '06-question');
  await pinned(.85, '07-docking');
  for (const name of ['pod','cetus']) assert.ok(await page.locator(`[data-bio-label="${name}"]`).evaluate(e => +e.style.opacity) > .8);
  await pinned(.891, '08-ugc');
  assert.equal(await page.locator('[data-bio-label="codon"]').getAttribute('aria-label'), 'UGC, intended APOE3-like RNA sequence');

  await page.goto(base); await ready();
  await page.mouse.wheel(0, await page.locator('[data-ot-story]').evaluate((e,p) => (e.getBoundingClientRect().height-innerHeight)*p,raw(.798)));
  await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'question', null, { timeout: 60000 });
  await page.screenshot({ path: `${out}/09-replay-question.png` });
  const before = await page.evaluate(() => scrollY);
  await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'placement', null, { timeout: 60000 });
  assert.ok(await page.evaluate(() => scrollY) < before-500, 'page actually scrolls upward to C');
  await page.screenshot({ path: `${out}/10a-placement.png` });
  const originalPod = await page.locator('[data-bio-handle="pod"]').boundingBox();
  const outerPod = await outerPodPoint();
  assert.ok(outerPod.y<originalPod.y || outerPod.x>originalPod.x+originalPod.width,'grab the protein outside its label button');
  assert.equal(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.getAttribute('data-bio-hit'),outerPod),'pod');
  await page.mouse.move(outerPod.x,outerPod.y);
  await page.mouse.down(); await page.mouse.move(65,650,{steps:10});
  assert.equal(await page.locator('[data-bio-handle="pod"]').evaluate(e=>e.classList.contains('is-dragging')),true);
  assert.equal(await page.locator('[data-drop-site="pod"]').evaluate(e=>e.classList.contains('is-near')),false);
  await page.mouse.up();
  await page.waitForFunction(x => Math.abs(document.querySelector('[data-bio-handle="pod"]').getBoundingClientRect().x-x)<2,originalPod.x);
  assert.equal(await page.locator('[data-bio-handle="pod"]').getAttribute('aria-pressed'),'false');
  await page.mouse.wheel(0,300);
  assert.equal(await root.getAttribute('data-edit-replay'),'placement','scroll cannot start an incomplete placement');
  for (const name of ['pod','cetus']) {
    const source = await page.locator(`[data-bio-handle="${name}"]`).boundingBox();
    const target = await page.locator(`[data-drop-site="${name}"]`).boundingBox();
    const grab = name==='pod' ? await outerPodPoint() : {x:source.x+source.width/2,y:source.y+source.height/2};
    await page.mouse.move(grab.x,grab.y); await page.mouse.down();
    await page.mouse.move(grab.x+target.x+target.width/2-source.x-source.width/2,grab.y+target.y+target.height/2-source.y-source.height/2,{steps:18});
    await page.waitForFunction(n => document.querySelector(`[data-drop-site="${n}"]`).classList.contains('is-near'),name);
    await page.screenshot({ path: `${out}/10b-${name}-gold-outline.png` });
    await page.mouse.up();
    await page.waitForFunction(n => document.querySelector(`[data-bio-handle="${n}"]`).getAttribute('aria-pressed') === 'true',name);
  }
  assert.equal(await page.getByText('Both are in place. Scroll once to edit.',{exact:true}).isVisible(),true);
  assert.equal(await root.getAttribute('data-edit-replay'),'placement');
  await page.mouse.wheel(0,300); // Exactly one gesture starts the complete edit.
  await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'edit', null, { timeout: 60000 });
  const start = Date.now();
  await page.waitForFunction(() => +document.querySelector('[data-bio-label="cetus"]').style.opacity > .8, null, { timeout: 60000 });
  await page.screenshot({ path: `${out}/10-replay-edit.png` });
  await page.waitForFunction(() => +document.querySelector('[data-bio-label="codon"]').style.getPropertyValue('--fix') > .99, null, { timeout: 60000 });
  await page.screenshot({ path: `${out}/11-replay-ugc.png` });
  await page.waitForFunction(() => !document.querySelector('[data-ot]').dataset.editReplay, null, { timeout: 60000 });
  assert.ok(Date.now()-start >= 8000, 'edit is given readable time');
  assert.ok(await root.evaluate(e => +e.style.getPropertyValue('--ot-p')) >= .94);
  await page.screenshot({ path: `${out}/12-project.png` });
  await page.getByRole('link',{name:'Explore ORCA'}).click();
  await page.waitForFunction(() => document.querySelector('#ot-index-title').getBoundingClientRect().top<innerHeight);

  await page.goto(base); await ready();
  await page.mouse.wheel(0, await page.locator('[data-ot-story]').evaluate((e,p) => (e.getBoundingClientRect().height-innerHeight)*p,raw(.798)));
  await page.waitForFunction(() => !!document.querySelector('[data-ot]').dataset.editReplay, null, { timeout: 60000 });
  await page.mouse.wheel(0,-200);
  await page.waitForFunction(() => !document.querySelector('[data-ot]').dataset.editReplay);
  assert.equal(await page.locator('[data-edit-skip]').isVisible(), false);

  await page.setViewportSize({ width: 390, height: 844 });
  await pinned(.29, '13-mobile-cell');
  await pinned(.891, '14-mobile-edit');
  for (const name of ['codon','pod','cetus']) {
    const box = await page.locator(`[data-bio-label="${name}"]`).boundingBox();
    assert.ok(box.x >= 0 && box.x+box.width <= 390 && box.y >= 112);
  }
  const touch = await page.context().newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  async function swipe(from,to) {
    await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y}]});
    for (let i=1;i<=10;i++) {
      await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/10,y:from.y+(to.y-from.y)*i/10}]});
      await page.waitForTimeout(50);
    }
    await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  await page.goto(base); await ready();
  await page.mouse.wheel(0, await page.locator('[data-ot-story]').evaluate((e,p) => (e.getBoundingClientRect().height-innerHeight)*p,raw(.798)));
  await page.waitForFunction(() => document.querySelector('[data-ot]').dataset.editReplay === 'placement',null,{timeout:60000});
  const mobileScroll = await page.evaluate(()=>scrollY);
  for (const name of ['pod','cetus']) {
    const source = await page.locator(`[data-bio-handle="${name}"]`).boundingBox();
    const target = await page.locator(`[data-drop-site="${name}"]`).boundingBox();
    const grab = name==='pod' ? await outerPodPoint() : {x:source.x+source.width/2,y:source.y+source.height/2};
    await swipe(grab,{x:grab.x+target.x+target.width/2-source.x-source.width/2,y:grab.y+target.y+target.height/2-source.y-source.height/2});
    await page.waitForFunction(n=>document.querySelector(`[data-bio-handle="${n}"]`).getAttribute('aria-pressed')==='true',name);
  }
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-mobileScroll)<2,'touch dragging holds the scene still');
  await page.screenshot({path:`${out}/15-mobile-placed.png`});
  await swipe({x:195,y:720},{x:195,y:580});
  await page.waitForFunction(()=>document.querySelector('[data-ot]').dataset.editReplay==='edit');
  await page.waitForFunction(()=>+document.querySelector('[data-bio-label="codon"]').style.getPropertyValue('--fix')>.99,null,{timeout:60000});
  await page.screenshot({path:`${out}/16-mobile-ugc.png`});
  await page.waitForFunction(()=>!document.querySelector('[data-ot]').dataset.editReplay,null,{timeout:60000});
  await touch.detach();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(base);
  assert.equal(await root.evaluate(e => e.classList.contains('ot--static')), true);
  assert.equal(await page.locator('[data-edit-skip]').isVisible(), false);
  assert.equal(await page.getByText('POD recognises the RNA. CETUS edits the target C to U.', { exact: true }).isVisible(), true);
  assert.deepEqual(errors, []);
  await writeFile(`${out}/results.json`, JSON.stringify({ errors, checks: ['real particle rendering','CGC first-position target','protein surface grab outside label','POD and CETUS drag and snap','incorrect drop returns home','gold destination contours','placement pause','one-scroll full edit','UGC product','automatic upward scroll','8.5 second edit hold','project continuation and link','user interruption','mobile label bounds','mobile protein surface touch drag and one swipe edit','reduced motion'] },null,2));
  console.log(`Passed biology browser checks; screenshots in ${out}`);
} catch (error) {
  console.log(errors); await page.screenshot({ path: `${out}/failure.png` }); throw error;
} finally { await browser.close(); }
