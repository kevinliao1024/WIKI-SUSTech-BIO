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
async function expectCycle(part, number) {
  await page.waitForFunction(({ part, number }) => document.querySelector('[data-dbtl-wheel]').dataset.cycle === `${part}-cycle-${number}`, { part, number });
  assert.equal(await current(), part);
  assert.equal(await page.locator('.engineering-part-panel:not([hidden])').getAttribute('data-engineering-panel'), part);
  assert.equal(await page.locator('[data-engineering-cycle][aria-current]').getAttribute('data-engineering-cycle'), number);
  assert.equal(await page.locator('svg[data-dbtl-portrait]:not(.is-hidden)').getAttribute('data-dbtl-cycle'), `${part}-cycle-${number}`);
  assert.equal(await page.locator('svg[data-dbtl-portrait]:not(.is-hidden)').count(), 1);
  for (const stage of ['design', 'build', 'test', 'learn']) {
    assert.equal(await page.locator(`[data-dbtl-stage="${stage}"]`).getAttribute('href'), `#${part}-cycle-${number}-${stage}`);
  }
}
try {
  await page.goto(`${base}/engineering#model-puf-cycle-06`, { waitUntil: 'networkidle' });
  await expectCycle('model-puf', '06');
  const authored = await page.locator('.markdown-content :is(h3,h4)[id]').evaluateAll(nodes => nodes.map(node => node.id).filter(id => /-cycle-\d{2}$/.test(id)));
  assert.equal(authored.length, 44);
  assert.equal(new Set(authored).size, 44);
  assert.equal(await page.locator('[data-dbtl-portrait]').count(), 44);
  assert.equal(await page.locator('[data-dbtl-portrait] image').evaluateAll(nodes => new Set(nodes.map(node => node.getAttribute('href'))).size), 28);
  for (const [part, count] of Object.entries(counts)) {
    await page.evaluate(part => { location.hash = `#${part}-cycle-01`; }, part);
    await expectCycle(part, '01');
    assert.equal(await page.locator('[data-engineering-cycle]').count(), count);
    for (let index = 1; index <= count; index++) {
      const number = String(index).padStart(2, '0');
      await page.locator(`[data-engineering-cycle="${number}"]`).click();
      await expectCycle(part, number);
      await page.locator('[data-dbtl-stage="learn"]').click();
      assert.equal(new URL(page.url()).hash, `#${part}-cycle-${number}-learn`);
    }
  }
  for (const [from, previous] of [['model-puf', 'model-rna-seq'], ['model-apobec', 'model-puf'], ['model-lamar', 'model-apobec'], ['model-whole-body', 'model-lamar']]) {
    await page.evaluate(part => { location.hash = `#${part}-cycle-01`; }, from);
    await expectCycle(from, '01');
    await reader.evaluate(node => { node.scrollTop = 0; });
    await reader.focus();
    await page.keyboard.press('PageUp');
    const last = String(counts[previous]).padStart(2, '0');
    await expectCycle(previous, last);
    assert.equal(new URL(page.url()).hash, `#${previous}-cycle-${last}-learn`);
    assert.ok(await reader.evaluate(node => node.scrollTop >= node.scrollHeight - node.clientHeight - 2));
  }
  for (const [id, part] of [['dry-dbtl-overview', 'model-rna-seq'], ['dry-dbtl-references', 'model-whole-body'], ['references', 'model-whole-body']]) {
    await page.evaluate(id => { location.hash = `#${id}`; }, id);
    await page.waitForFunction(part => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === part, part);
    assert.equal(await page.locator(`#${id}`).evaluate(node => node.closest('[data-engineering-panel]').hidden), false);
    if (id !== 'references') assert.equal(await page.locator(`#${id}`).isVisible(), true);
    assert.equal(await page.locator('[data-dbtl-wheel]').getAttribute('data-part'), part);
  }
  await page.locator('.engineering-part-panel:not([hidden]) a[href="#dry-dbtl-overview"]').click();
  await page.waitForFunction(() => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === 'model-rna-seq');
  await page.locator('.engineering-part-panel:not([hidden]) a[href="#dry-dbtl-references"]').click();
  await page.waitForFunction(() => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === 'model-whole-body');
  console.log('44 authored cycles, all 26 Model cycle buttons and DBTL targets, direct Cycle 06, last-cycle reverse navigation and cross-module overview/references pass.');

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
