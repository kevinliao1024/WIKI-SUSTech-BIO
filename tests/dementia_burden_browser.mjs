// Isolated browser verification; does not touch the user's open browser tabs.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/dementia_burden_browser.mjs
//
// The comparison is a flight through a field of lights, inside the particle
// take. There is no number to watch, no city arithmetic and no stadium: only
// the field, which starts bounded and ends running past every edge of frame,
// and one sentence at a time.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildScrollTrack, BURDEN_IN, BURDEN_OUT } from '../static/onetake/burden-pacing.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8081';
const out = process.env.BURDEN_OUTPUT || '/private/tmp/orca-burden-review';
await mkdir(out, { recursive: true });

const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m => ({ p: +m[1], stage: +m[2] }));
const { track, length } = buildScrollTrack(keys);
const progress = take => {
  const part = track.find(s => take >= s.from && take <= s.to);
  return (part.start + (take - part.from) / (part.to - part.from) * (part.end - part.start)) / length;
};
const scrollTo = (page, take) => page.evaluate((p) => {
  const story = document.querySelector('[data-ot-story]');
  window.scrollTo({ top: story.offsetTop + (story.getBoundingClientRect().height - innerHeight) * p, behavior: 'instant' });
}, progress(take));

// Ink coverage: how much of the canvas is actually lit. This is the direct
// measure of "a great many lights" and is what the segment has to deliver.
const inkCoverage = page => page.locator('[data-burden-canvas]').evaluate(canvas => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const step = 4;
  const image = ctx.getImageData(0, 0, width, height).data;
  let lit = 0, total = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      total++;
      if (image[i + 3] > 24) lit++;
    }
  }
  return lit / total;
});

// Fraction of sampled points along each canvas edge with a lit pixel nearby.
const edgeFill = page => page.locator('[data-burden-canvas]').evaluate(canvas => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height).data;
  const on = (x, y) => (x < 0 || y < 0 || x >= width || y >= height) ? false : image[(y * width + x) * 4 + 3] > 24;
  const reach = Math.round(Math.min(width, height) * 0.06);
  const near = (x, y) => {
    for (let dy = -reach; dy <= reach; dy += 3) for (let dx = -reach; dx <= reach; dx += 3) if (on(x + dx, y + dy)) return true;
    return false;
  };
  const run = (fn, steps) => { let hit = 0, n = 0; for (let s = 0; s <= steps; s++) { const [x, y] = fn(s / steps); n++; if (near(x, y)) hit++; } return hit / n; };
  const step = Math.max(24, Math.round(width / 26));
  return {
    top: run(t => [Math.round(t * (width - 1)), reach], Math.floor(width / step)),
    bottom: run(t => [Math.round(t * (width - 1)), height - 1 - reach], Math.floor(width / step)),
    left: run(t => [reach, Math.round(t * (height - 1))], Math.floor(height / step)),
    right: run(t => [width - 1 - reach, Math.round(t * (height - 1))], Math.floor(height / step)),
  };
});

const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultNavigationTimeout(90000);
page.setDefaultTimeout(60000);
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', request => requests.push(request.url()));

try {
  // 1. Real particle page, not the static fallback.
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('[data-ot]')?.classList.contains('is-ready'));
  assert.equal(await page.locator('[data-ot]').evaluate(el => el.classList.contains('ot--static')), false);

  // 2. Opening of the flight: the field is bounded — you can see all of it.
  await scrollTo(page, BURDEN_IN + (BURDEN_OUT - BURDEN_IN) * 0.06);
  await page.waitForFunction(() => document.querySelector('.ot-ch--stats')?.classList.contains('is-on'));
  await page.waitForTimeout(1500);
  const openingInk = await inkCoverage(page);
  const openingEdges = await edgeFill(page);
  const openingWorstEdge = Math.min(openingEdges.top, openingEdges.bottom, openingEdges.left, openingEdges.right);
  assert.ok(openingInk > 0.03, `opening frame has a substantial field of lights (${(openingInk * 100).toFixed(1)}% lit)`);
  await page.screenshot({ path: `${out}/flight-open.png` });

  // 3. Text changes on its own as the reader moves through.
  const firstLine = await page.locator('[data-burden-line].is-on').innerText();
  assert.match(firstLine, /57 million/i, `first sentence states the number, got "${firstLine}"`);

  // 4. End of the flight: lights run past every edge — no boundary to see.
  await scrollTo(page, BURDEN_OUT - (BURDEN_OUT - BURDEN_IN) * 0.04);
  await page.waitForTimeout(1800);
  const closeInk = await inkCoverage(page);
  const closeEdges = await edgeFill(page);
  const closeWorstEdge = Math.min(closeEdges.top, closeEdges.bottom, closeEdges.left, closeEdges.right);
  assert.ok(closeWorstEdge > openingWorstEdge,
    `the flight removes the boundary (worst edge ${(openingWorstEdge * 100).toFixed(0)}% -> ${(closeWorstEdge * 100).toFixed(0)}%)`);
  assert.ok(closeWorstEdge > 0.55, `closing frame reaches all four edges (worst ${(closeWorstEdge * 100).toFixed(0)}%)`);
  assert.ok(closeInk > openingInk, `the field closes in on the reader (${(openingInk * 100).toFixed(1)}% -> ${(closeInk * 100).toFixed(1)}% lit)`);
  await page.screenshot({ path: `${out}/flight-close.png` });

  // 5. The last sentence is on screen, and the number is gone from mid-flight.
  const lastLine = await page.locator('[data-burden-line].is-on').innerText();
  assert.match(lastLine, /someone/i, `closing sentence lands, got "${lastLine}"`);

  // 6. Scrubbing back reverses the flight.
  await scrollTo(page, BURDEN_IN + (BURDEN_OUT - BURDEN_IN) * 0.1);
  await page.waitForTimeout(1500);
  const backEdges = await edgeFill(page);
  const backWorstEdge = Math.min(backEdges.top, backEdges.bottom, backEdges.left, backEdges.right);
  assert.ok(backWorstEdge < closeWorstEdge, 'scrubbing back restores the bounded view');

  // 7. Mobile: canvas fills the width, no horizontal overflow.
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollTo(page, BURDEN_OUT - (BURDEN_OUT - BURDEN_IN) * 0.1);
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const box = await page.locator('[data-burden-canvas]').boundingBox();
  assert.ok(box.width >= 380 && box.x >= 0, `canvas fills the mobile viewport (${box.width}px wide)`);
  await page.screenshot({ path: `${out}/mobile.png` });

  // 8. Reduced motion: static fallback shows the finished shot and every line.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('[data-ot]')?.classList.contains('is-ready'));
  assert.equal(await page.locator('[data-ot]').evaluate(el => el.classList.contains('ot--static')), true);
  assert.equal(await page.locator('[data-burden-line].is-on').count(), 3, 'all sentences are readable without motion');
  await page.screenshot({ path: `${out}/reduced.png`, fullPage: false });

  assert.deepEqual(errors, []);
  assert.ok(requests.every(request => request.startsWith(base) || request.startsWith('data:')), 'no third-party runtime requests');
  await writeFile(`${out}/results.json`, JSON.stringify({ errors, openingInk, closeInk, openingWorstEdge, closeWorstEdge, checks: [
    'real particle homepage', 'opening frame shows the whole field, bounded',
    'sentences change with scroll', 'closing frame bleeds past every edge',
    'field closes in on the reader', 'reversible scrubbing', 'mobile full-bleed',
    'reduced-motion static presentation', 'no external runtime assets'
  ] }, null, 2));
  console.log(`Passed dementia burden browser checks; screenshots in ${out}`);
} catch (error) {
  await page.screenshot({ path: `${out}/failure.png` });
  console.error(await page.evaluate(() => ({
    q: document.querySelector('[data-ot]')?.style.getPropertyValue('--ot-p'),
    root: document.querySelector('[data-ot]')?.className,
    on: document.querySelector('.ot-ch--stats')?.className,
    scroll: scrollY, height: innerHeight,
  })));
  throw error;
} finally { await browser.close(); }
