// Isolated browser verification; does not touch the user's open browser tabs.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/dementia_burden_browser.mjs
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildScrollTrack } from '../static/onetake/burden-pacing.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8081';
const out = process.env.BURDEN_OUTPUT || '/private/tmp/orca-burden-review';
await mkdir(out, { recursive: true });
const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)].map(m => [+m[1], +m[2]]);
const { track, length } = buildScrollTrack(keys.map(([p, stage]) => ({ p, stage })));
const progress = take => {
  const part = track.find(s => take >= s.from && take <= s.to);
  return (part.start + (take - part.from) / (part.to - part.from) * (part.end - part.start)) / length;
};
const take = .763, part = track.find(s => take >= s.from && take <= s.to);
const raw = (part.start + (take - part.from) / (part.to - part.from) * (part.end - part.start)) / length;
const url = `${base}/?p=${raw}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultNavigationTimeout(90000);
page.setDefaultTimeout(60000);
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', request => requests.push(request.url()));
const ready = async () => {
  await page.waitForFunction(() => document.querySelector('[data-ot]')?.classList.contains('is-ready'));
  await page.waitForFunction(() => document.querySelector('.ot-ch--stats')?.classList.contains('is-on'));
  await page.waitForFunction(() => document.querySelector('[data-burden]')?.classList.contains('is-rendered'));
};
try {
  await page.goto(url); await ready();
  await page.waitForTimeout(1400); // Finish the particle entrance before visual QA.
  assert.equal(await page.locator('[data-ot]').evaluate(el => el.classList.contains('ot--static')), false);
  assert.match(await page.locator('[data-burden-equivalent]').innerText(), /432/);
  await page.screenshot({ path: `${out}/desktop.png` });

  await page.locator('[data-burden-year="3"]').click();
  assert.match(await page.locator('[data-burden-context]').innerText(), /2050.*Projected.*152\.8/);
  assert.match(await page.locator('[data-burden-equivalent]').innerText(), /1,158/);
  assert.match(await page.locator('[data-burden-selection]').innerText(), /130\.8–175\.9/);
  const chart = await page.locator('.burden__chart').boundingBox();
  await page.mouse.move(chart.x + chart.width * .4, chart.y + chart.height * .4);
  await page.mouse.down();
  await page.mouse.move(chart.x + chart.width * .67, chart.y + chart.height * .3, { steps: 8 });
  await page.mouse.up();
  assert.equal(await page.locator('[data-burden]').getAttribute('data-year'), '2040');

  await page.locator('[data-burden-mode="incidence"]').click();
  const slider = page.locator('[data-burden-time]');
  await slider.press('End');
  assert.equal(await page.locator('[data-burden]').getAttribute('data-fill'), '1.000');
  assert.equal(await page.locator('[data-burden-days]').innerText(), '4.8 days');
  await slider.press('Home');
  assert.equal(await page.locator('[data-burden]').getAttribute('data-fill'), '0.000');
  await page.waitForTimeout(3500); // Regress idle time being counted as playback.
  await page.locator('[data-burden-play]').click();
  assert.equal(await page.locator('[data-burden-play]').innerText(), 'Pause accelerated playback');
  assert.ok(+(await slider.inputValue()) < .5, 'playback begins from zero after idle');
  await page.waitForFunction(() => +document.querySelector('[data-burden-time]').value > .8);
  await page.locator('[data-burden-play]').click();
  const paused = await slider.inputValue();
  await page.waitForTimeout(350);
  assert.equal(await slider.inputValue(), paused, 'pause holds simulated time');
  await page.locator('[data-burden-play]').click();
  await page.waitForFunction(() => document.querySelector('[data-burden]').dataset.fill === '1.000', null, { timeout: 16000 });
  assert.match(await page.locator('[data-burden-play]').innerText(), /^Play/);
  await page.screenshot({ path: `${out}/filled.png` });

  await page.locator('[data-burden-mode="snapshot"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1800); // Let the comparison return to the WHO snapshot.
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const heading = await page.locator('#burden-title').boundingBox();
  const nav = await page.locator('.site-nav').boundingBox();
  assert.ok(heading.y >= nav.y + nav.height, 'mobile title clears navigation');
  await page.locator('[data-burden-stadium]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/mobile.png` });
  const stadium = await page.locator('[data-burden-stadium]').boundingBox();
  assert.ok(stadium.x >= 0 && stadium.x + stadium.width <= 390);

  // The full-screen chapter must still let the user scroll onward, and
  // incidence playback must stop as soon as the chapter leaves view.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('[data-ot]').classList.contains('is-ready'));
  const readingDistance = await page.locator('[data-ot-story]').evaluate((el, span) =>
    (el.getBoundingClientRect().height - innerHeight) * span / innerHeight,
    progress(.784) - progress(.747));
  assert.ok(readingDistance >= 2.5, 'comparison has at least 2.5 screens of reading distance');
  await page.evaluate(p => {
    const story = document.querySelector('[data-ot-story]');
    window.scrollTo(0, story.offsetTop + (story.getBoundingClientRect().height - innerHeight) * p);
  }, raw);
  await page.waitForFunction(() => document.querySelector('.ot-ch--stats').classList.contains('is-on'));
  await page.locator('[data-burden-mode="incidence"]').click();
  await page.locator('[data-burden-play]').click();
  await page.mouse.move(900, 430); await page.mouse.wheel(0, 480);
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.ot-ch--stats').evaluate(el => el.classList.contains('is-on')), true,
    'a normal wheel gesture does not skip the comparison');
  await page.mouse.wheel(0, 2200);
  await page.waitForFunction(() => !document.querySelector('.ot-ch--stats').classList.contains('is-on'));
  assert.match(await page.locator('[data-burden-play]').textContent(), /^Play/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(url);
  await page.waitForFunction(() => document.querySelector('[data-ot]').classList.contains('is-ready'));
  assert.equal(await page.locator('[data-ot]').evaluate(el => el.classList.contains('ot--static')), true);
  await page.locator('[data-burden-mode="incidence"]').click();
  await page.locator('[data-burden-play]').click();
  assert.equal(await page.locator('[data-burden]').getAttribute('data-fill'), '1.000');
  await slider.press('Home');
  assert.equal(await page.locator('[data-burden]').getAttribute('data-fill'), '0.000');

  assert.deepEqual(errors, []);
  assert.ok(requests.every(request => request.startsWith(base) || request.startsWith('data:')), 'no third-party runtime requests');
  await writeFile(`${out}/results.json`, JSON.stringify({ errors, checks: [
    'real particle homepage', 'WHO 2021 snapshot', 'GBD milestone selection and drag',
    'projection/uncertainty labels', 'capacity conversion', 'time slider',
    'idle playback timing', 'pause/resume', 'full stadium endpoint',
    'mobile navigation clearance and overflow', 'normal-scroll reading distance', 'scroll continuation and exit pause', 'reduced-motion interaction',
    'no external runtime assets'
  ] }, null, 2));
  console.log(`Passed dementia burden browser checks; screenshots in ${out}`);
} finally { await browser.close(); }
