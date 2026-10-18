// WIKI_BASE_URL=http://127.0.0.1:8784 PLAYWRIGHT_MODULE=/path/to/playwright node tests/engineering_dry_cycles_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8784';
const output = `work/engineering-dry-cycles/${new Date().toISOString().replace(/[:.]/g, '-')}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(10000);
const counts = { 'model-rna-seq': 5, 'model-puf': 6, 'model-apobec': 5, 'model-lamar': 5, 'model-whole-body': 5 };
const reader = page.locator('[data-engineering-scroll]');
const current = () => page.locator('[data-engineering-workspace]').getAttribute('data-engineering-active-part');
async function expectCycle(part, number, overview = false) {
  await page.waitForFunction(({ part, number }) => document.querySelector('[data-dbtl-wheel]').dataset.cycle === `${part}-cycle-${number}`, { part, number });
  assert.equal(await current(), part);
  assert.equal(await page.locator('.engineering-part-panel:not([hidden])').getAttribute('data-engineering-panel'), part);
  if (overview) {
    assert.equal(await page.locator('[data-engineering-overview]').getAttribute('aria-current'), 'location');
    assert.equal(await page.locator('[data-engineering-cycle][aria-current]').count(), 0);
  } else {
    assert.equal(await page.locator('[data-engineering-cycle][aria-current]').getAttribute('data-engineering-cycle'), number);
    assert.equal(await page.locator('[data-engineering-overview][aria-current]').count(), 0);
  }
  assert.equal(await page.locator('svg[data-dbtl-portrait]:not(.is-hidden)').getAttribute('data-dbtl-cycle'), `${part}-cycle-${number}`);
  assert.equal(await page.locator('svg[data-dbtl-portrait]:not(.is-hidden)').count(), 1);
  for (const stage of ['design', 'build', 'test', 'learn']) {
    assert.equal(await page.locator(`[data-dbtl-stage="${stage}"]`).getAttribute('href'), `#${part}-cycle-${number}-${stage}`);
  }
}
async function expectOverview(part, focus = false) {
  await expectCycle(part, '01');
  const state = await page.locator(`#${part}-overview`).evaluate(node => {
    const reader = document.querySelector('[data-engineering-scroll]');
    const surface = node.closest('.engineering-overview-card') || node;
    return { gap: surface.getBoundingClientRect().top - reader.getBoundingClientRect().top,
      focus: document.activeElement.id, stage: document.querySelector('[data-dbtl-wheel]').dataset.stage };
  });
  assert.ok(Math.abs(state.gap - 24) < 2, `Cycle 01 must start at its own module overview: ${JSON.stringify({ part, state })}`);
  assert.equal(state.stage, 'design');
  if (focus) assert.equal(state.focus, `${part}-overview`);
  assert.equal(new URL(page.url()).hash, `#${part}-cycle-01`);
}
async function expectModuleOverview(part) {
  await expectCycle(part, '01', true);
  const state = await page.locator(`#${part}`).evaluate(node => ({
    gap: node.getBoundingClientRect().top - document.querySelector('[data-engineering-scroll]').getBoundingClientRect().top,
    focus: document.activeElement.id,
    stage: document.querySelector('[data-dbtl-wheel]').dataset.stage,
  }));
  assert.ok(Math.abs(state.gap - 24) < 2, `The module overview must reveal its chapter title: ${JSON.stringify({ part, state })}`);
  assert.equal(state.focus, part);
  assert.equal(state.stage, 'design');
  assert.equal(new URL(page.url()).hash, `#${part}`);
}
try {
  await page.goto(`${base}/engineering#model-puf-cycle-06`, { waitUntil: 'networkidle' });
  await expectCycle('model-puf', '06');
  const authored = await page.locator('.markdown-content :is(h3,h4)[id]').evaluateAll(nodes => nodes.map(node => node.id).filter(id => /-cycle-\d{2}$/.test(id)));
  assert.equal(authored.length, 60);
  assert.equal(new Set(authored).size, 60);
  assert.equal(await page.locator('[data-dbtl-portrait]').count(), 44);
  assert.equal(await page.locator('[data-dbtl-portrait] image').evaluateAll(nodes => new Set(nodes.map(node => node.getAttribute('href'))).size), 44);
  const modelCycles = authored.filter(id => id.startsWith('model-'));
  const portraitCycles = await page.locator('[data-dbtl-portrait]').evaluateAll(nodes => nodes.map(node => node.dataset.dbtlCycle));
  assert.equal(modelCycles.length, 26);
  assert.ok(modelCycles.every(id => portraitCycles.includes(id)), 'Every Model cycle must retain its corresponding portrait.');
  const loadedPortraits = await page.locator('[data-dbtl-portrait] image').evaluateAll(nodes => Promise.all(nodes.map(node => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
    image.onerror = () => resolve(false);
    image.src = node.getAttribute('href');
  }))));
  assert.ok(loadedPortraits.every(Boolean), 'Every cycle portrait must load successfully in the browser.');
  assert.equal(await page.locator('.markdown-content a[href="#dry-dbtl-overview"], .markdown-content a[href="#dry-dbtl-references"]').count(), 0);
  for (const [part, count] of Object.entries(counts)) {
    await page.goto(`${base}/engineering?overview-entry=${part}#${part}-cycle-01`, { waitUntil: 'networkidle' });
    await expectOverview(part);
    assert.equal(await page.locator('[data-engineering-cycle]').count(), count);
    for (let index = 1; index <= count; index++) {
      const number = String(index).padStart(2, '0');
      await page.locator(`[data-engineering-cycle="${number}"]`).click();
      await expectCycle(part, number);
      if (number === '01') await expectOverview(part, true);
      await page.locator('[data-dbtl-stage="learn"]').click();
      assert.equal(new URL(page.url()).hash, `#${part}-cycle-${number}-learn`);
    }
    await page.locator('[data-engineering-map-back]').click();
    await page.locator(`[data-engineering-part="${part}"]`).click();
    await expectModuleOverview(part);
    await page.locator('[data-engineering-map-back]').click();
    await page.locator('[data-map-cycle="01"]').click();
    await expectOverview(part, true);
    await page.locator('[data-dbtl-stage="design"]').click();
    assert.equal(new URL(page.url()).hash, `#${part}-cycle-01-design`);
    assert.equal(await page.evaluate(() => document.activeElement.id), `${part}-cycle-01-design`);
  }
  for (const [from, previous] of [['model-puf', 'model-rna-seq'], ['model-apobec', 'model-puf'], ['model-lamar', 'model-apobec'], ['model-whole-body', 'model-lamar']]) {
    await page.evaluate(part => { location.hash = `#${part}-cycle-01`; }, from);
    await expectCycle(from, '01');
    await reader.evaluate(node => { node.scrollTop = 0; });
    await reader.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await reader.focus();
    await page.keyboard.press('Escape');
    await page.keyboard.press('PageUp');
    assert.equal(await current(), from);
    assert.equal(await page.locator('.engineering-boundary[data-open]').getAttribute('aria-hidden'), 'false');
    await page.keyboard.press('PageUp');
    const last = String(counts[previous]).padStart(2, '0');
    await expectCycle(previous, last);
    assert.equal(new URL(page.url()).hash, `#${previous}-references`);
    assert.equal(await page.locator(`#${previous}-references`).evaluate(node => node.closest('[data-engineering-panel]').hidden), false);
    assert.ok(await reader.evaluate(node => node.scrollTop >= node.scrollHeight - node.clientHeight - 2));
  }
  for (const [id, part] of [['dry-dbtl-overview', 'model-rna-seq'], ['dry-dbtl-references', 'model-whole-body'], ['references', 'model-whole-body']]) {
    await page.evaluate(id => { location.hash = `#${id}`; }, id);
    await page.waitForFunction(part => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === part, part);
    assert.equal(await page.locator(`#${id}`).evaluate(node => node.closest('[data-engineering-panel]').hidden), false);
    if (id !== 'references') assert.equal(await page.locator(`#${id}`).isVisible(), true);
    assert.equal(await page.locator('[data-dbtl-wheel]').getAttribute('data-part'), part);
  }
  console.log('60 authored cycle headings, 44 existing portraits including all 26 Model cycles, all Model cycle buttons and DBTL targets, module Overview and Cycle 01 entries, direct Cycle 06, reverse navigation to module References with the last cycle retained, and legacy overview/reference deep links pass.');

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 769, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }, { width: 1280, height: 500 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${base}/engineering?cycles-${viewport.width}#model-puf-cycle-06`, { waitUntil: 'networkidle' });
    await expectCycle('model-puf', '06');
    const bounds = await page.locator('[data-engineering-cycle]').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    }));
    assert.equal(bounds.length, 6);
    assert.ok(bounds.every(box => box.x >= 0 && box.right <= viewport.width && box.y >= 0 && box.bottom <= viewport.height && box.height >= 44 && box.width >= (viewport.width <= 760 ? 40 : 36)), JSON.stringify({ viewport, bounds }));
    assert.ok(await page.locator('[data-engineering-cycle] span').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), 'Cycle labels must fit within their own click targets.');
    assert.ok(await reader.evaluate(node => node.clientHeight >= 130 && node.scrollWidth <= node.clientWidth + 1));
    await page.locator('[data-engineering-cycle="05"]').click();
    await expectCycle('model-puf', '05');
    await page.locator('[data-engineering-cycle="06"]').click();
    await expectCycle('model-puf', '06');
    await writeFile(`${output}/engineering-dry-cycles-${viewport.width}.png`, await page.screenshot(), { flag: 'wx' });
    await page.locator('[data-engineering-map-back]').click();
    assert.equal(await page.locator('[data-map-cycle]').count(), 6);
    await page.locator('[data-map-cycle="06"]').focus();
    await page.keyboard.press('Enter');
    await expectCycle('model-puf', '06');
  }
  assert.deepEqual(errors, []);
  console.log(`Six-cycle controls remain visible/clickable across five viewports and the map's Cycle 06 is keyboard-accessible. Screenshots: ${output}`);
} finally {
  await browser.close();
}
