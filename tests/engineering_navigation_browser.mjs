// WIKI_BASE_URL=http://127.0.0.1:8784 PLAYWRIGHT_MODULE=/path/to/playwright node tests/engineering_navigation_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8784';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const output = process.env.ENGINEERING_OUTPUT || `work/engineering-navigation-browser/${runId}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(10000);
const reader = () => page.locator('[data-engineering-scroll]');
const selected = () => page.locator('[data-engineering-workspace]').getAttribute('data-engineering-active-part');

async function expectPart(part) {
  await page.waitForFunction(part => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === part, part);
  assert.equal(await page.locator('.engineering-part-panel:not([hidden])').count(), 1);
  assert.equal(await page.locator('.engineering-part-panel:not([hidden])').getAttribute('data-engineering-panel'), part);
}
async function jump(part) {
  await page.goto(`${base}/engineering#${part}-cycle-01`, { waitUntil: 'networkidle' });
  await expectPart(part);
}
async function bottom() {
  await reader().evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(40);
}
async function wheel(deltaY) {
  const rect = await reader().boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(50);
}
async function screenshot(name) {
  await writeFile(path.join(output, name), await page.screenshot(), { flag: 'wx' });
}

try {
  await page.goto(`${base}/engineering`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-content-status]').count(), 0, 'The generic review-status box is omitted.');
  assert.equal(await page.locator('[data-engineering-map] button').count(), 0, 'The removed arrows must not leave empty controls.');
  const groups = await page.locator('[data-engineering-map-data]').evaluate(node => JSON.parse(node.textContent));
  for (const group of groups) {
    await page.locator(`[data-engineering-group="${group.id}"]`).click();
    await expectPart(group.parts[0].id);
    assert.equal(new URL(page.url()).hash, `#${group.parts[0].id}-cycle-01`);
    assert.equal(await page.locator('[data-engineering-heading-group]').textContent(), group.label);
    assert.equal(await page.locator('[data-engineering-heading-part]').textContent(), group.parts[0].label === group.label ? '' : group.parts[0].label);
    await page.locator('[data-engineering-map-back]').click();
  }
  for (const group of groups.filter(group => group.parts.length > 1)) {
    await page.locator(`[data-engineering-group="${group.id}"]`).focus();
    for (const part of group.parts) {
      await page.locator(`[data-engineering-part="${part.id}"]`).click();
      await expectPart(part.id);
      assert.equal(new URL(page.url()).hash, `#${part.id}-cycle-01`);
      await page.locator('[data-engineering-map-back]').click();
    }
  }
  console.log('All five category labels and twelve branch labels enter their first cycle directly.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('[data-engineering-map]').dataset.overview === 'true');
  assert.equal(await page.locator('[data-map-branch-group]:visible').count(), 3);
  assert.equal(await page.locator('[data-engineering-part]:visible').count(), 12);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => document.querySelector('[data-engineering-map]').dataset.overview === 'false');
  assert.equal(await page.locator('[data-map-branch-group]:visible').count(), 1);
  assert.equal(await page.locator('[data-map-branch-group]:visible').getAttribute('data-map-branch-group'), 'model');

  await page.locator('[data-engineering-group="edit"]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.engineeringPart), 'pod');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.mapCycle), '01');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expectPart('pod');
  await page.locator('[data-engineering-cycle="02"]').click();
  assert.equal(new URL(page.url()).hash, '#pod-cycle-02');
  await page.locator('[data-engineering-map-back]').click();
  await page.locator('[data-engineering-group="control"]').focus();
  await page.keyboard.press('Enter');
  await expectPart('gfa');
  console.log('Keyboard branch exploration, direct Enter navigation, and existing Cycle 02 navigation work.');
  await page.locator('[data-engineering-map-back]').click();
  await page.locator('[data-engineering-group="edit"]').focus();
  await page.locator('[data-engineering-part="pod"]').focus();
  await screenshot('engineering-map-desktop.png');

  await jump('pod');
  await reader().evaluate(element => { element.scrollTop = element.scrollHeight - element.clientHeight - 180; });
  await wheel(300);
  assert.equal(await selected(), 'pod', 'The gesture that first reaches the bottom stays in the current article.');
  await wheel(3);
  assert.equal(await selected(), 'pod', 'A light push previews an intermediate choice without committing.');
  assert.ok(Number(await page.locator('[data-engineering-workspace]').getAttribute('data-engineering-turn-progress')) > 0);
  await wheel(40);
  await wheel(40);
  await expectPart('cetus');
  assert.equal(await reader().evaluate(element => element.scrollTop), 0, 'The new article starts at its complete top.');
  for (let count = 0; count < 5; count++) await wheel(70);
  assert.equal(await selected(), 'cetus');
  assert.equal(await reader().evaluate(element => element.scrollTop), 0, 'Wheel inertia cannot skip the new article introduction.');
  await page.waitForTimeout(450);
  await bottom();
  await wheel(100);
  await wheel(100);
  await expectPart('integrated-orca');
  assert.equal(await reader().evaluate(element => element.scrollTop), 0);
  console.log('POD → CETUS → Integrated ORCA previews on a light continuation and selects the nearest item after scrolling stops, resets to the top, and absorbs wheel inertia.');

  // Cross every boundary with independent keyboard gestures, then test the final stop.
  const parts = groups.flatMap(group => group.parts.map(part => part.id));
  for (const part of parts.slice(3)) {
    await bottom();
    await reader().focus();
    await page.keyboard.press('PageDown');
    await expectPart(part);
    assert.equal(await reader().evaluate(element => element.scrollTop), 0);
  }
  await bottom();
  await page.keyboard.press('PageDown');
  assert.equal(await selected(), parts.at(-1), 'The final part never wraps to the first.');
  await page.waitForTimeout(450);
  await wheel(100);
  assert.equal(await selected(), parts.at(-1));
  console.log('All fourteen parts follow the visible map order and stop at the final part.');

  await jump('pod');
  await bottom();
  await reader().focus();
  await page.keyboard.down('PageDown');
  await expectPart('cetus');
  for (let count = 0; count < 5; count++) await page.keyboard.down('PageDown');
  assert.equal(await selected(), 'cetus');
  assert.equal(await reader().evaluate(element => element.scrollTop), 0, 'Held key repeats must not scroll past the refreshed beginning.');
  await page.keyboard.up('PageDown');
  await page.keyboard.press('PageUp');
  await expectPart('pod');
  assert.ok(await reader().evaluate(element => element.scrollTop >= element.scrollHeight - element.clientHeight - 2));
  await jump(parts[0]);
  await reader().evaluate(element => { element.scrollTop = 0; });
  await reader().focus();
  await page.keyboard.press('PageUp');
  assert.equal(await selected(), parts[0], 'The first part never wraps backward.');

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 640 }, { width: 1280, height: 500 }]) {
    await page.setViewportSize(viewport);
    await jump('integrated-orca');
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('.engineering-heading');
      const boxes = [...heading.children].map(node => node.getBoundingClientRect().toJSON());
      const paper = document.querySelector('.engineering-paper').getBoundingClientRect();
      const reader = document.querySelector('[data-engineering-scroll]');
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, boxes,
        paper: paper.toJSON(), readerHeight: reader.clientHeight, readerWidth: reader.clientWidth,
        contentWidth: reader.scrollWidth };
    });
    assert.ok(layout.boxes[0].bottom <= layout.boxes[1].top && layout.boxes[1].bottom <= layout.boxes[2].top, JSON.stringify(layout));
    assert.ok(layout.scrollWidth <= viewport.width && layout.contentWidth <= layout.readerWidth + 1, JSON.stringify(layout));
    assert.ok(layout.paper.bottom <= viewport.height && layout.readerHeight >= 130, JSON.stringify(layout));
    await screenshot(`engineering-reader-${viewport.width}x${viewport.height}.png`);
  }
  console.log('Five desktop/mobile/short viewports retain a vertical title hierarchy and usable article without horizontal overflow.');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const touchPage = await mobile.newPage();
  touchPage.on('pageerror', error => errors.push(error.message));
  await touchPage.goto(`${base}/engineering`, { waitUntil: 'networkidle' });
  assert.equal(await touchPage.locator('[data-engineering-part]:visible').count(), 12);
  for (const part of parts) {
    const link = touchPage.locator(`[data-engineering-${['deliver', 'measure'].includes(part) ? 'group' : 'part'}="${part}"]`);
    await link.tap();
    await touchPage.waitForFunction(part => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === part, part);
    await touchPage.locator('[data-engineering-map-back]').tap();
  }
  console.log('Touch screens expose all fourteen module entries without expand arrows.');
  await touchPage.locator('[data-engineering-part="cetus"]').tap();
  await touchPage.waitForFunction(() => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === 'cetus');
  await touchPage.locator('[data-engineering-map-back]').tap();
  await touchPage.locator('[data-engineering-group="edit"]').tap();
  await touchPage.waitForFunction(() => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === 'pod');
  await touchPage.evaluate(() => document.fonts.ready);
  await touchPage.waitForTimeout(150);
  const client = await mobile.newCDPSession(touchPage);
  const touchReader = touchPage.locator('[data-engineering-scroll]');
  await touchReader.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await touchPage.waitForTimeout(40);
  const touchRect = await touchReader.boundingBox();
  const x = touchRect.x + touchRect.width / 2, y = touchRect.y + touchRect.height * .7;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (const distance of [25, 45, 80, 110, 140]) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touchPage.waitForTimeout(300);
  assert.equal(await touchPage.locator('[data-engineering-workspace]').getAttribute('data-engineering-active-part'), 'cetus');
  assert.equal(await touchReader.evaluate(element => element.scrollTop), 0, 'Native touch momentum must not skip the next article introduction.');
  console.log('Touch category/branch selection and an outward swipe advance exactly once with the next article at its beginning.');

  // Re-touching a snap catches it in place, including while the finger is held.
  await touchPage.emulateMedia({ reducedMotion: 'no-preference' });
  await touchPage.goto(`${base}/engineering?touch-recatch#pod-cycle-01`, { waitUntil: 'networkidle' });
  await touchReader.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await touchPage.waitForTimeout(40);
  const caughtState = () => touchPage.evaluate(() => {
    const root = document.querySelector('[data-engineering-workspace]');
    return { part: root.dataset.engineeringActivePart, phase: root.dataset.engineeringTurning,
      progress: Number(root.dataset.engineeringTurnProgress), hash: location.hash };
  });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 65 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touchPage.waitForTimeout(45);
  assert.equal((await caughtState()).phase, 'settling');
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y - 65 }] });
  const caught = await caughtState();
  assert.equal(caught.phase, 'dragging');
  assert.ok(caught.progress > .5 && caught.progress < 1);
  await touchPage.waitForTimeout(420);
  assert.deepEqual(await caughtState(), caught, 'Holding a caught touch snap must freeze the picker and old article.');
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 35 }] });
  assert.ok((await caughtState()).progress < .5, 'A caught snap can be dragged back to the current article.');
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touchPage.waitForTimeout(250);
  assert.equal((await caughtState()).part, 'pod');
  assert.equal((await caughtState()).phase, undefined);
  console.log('Ordinary-motion touch snap can be caught, held, reversed and released without an unwanted article change.');
  await mobile.close();
  // Ordinary motion exercises the continuous picker, its reversible snap,
  // and atomic article commit. Reduced motion keeps the same choice semantics.
  const animatedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const animated = await animatedContext.newPage();
  animated.on('pageerror', error => errors.push(error.message));
  const ar = animated.locator('[data-engineering-scroll]');
  const readTurn = () => animated.evaluate(() => {
    const root = document.querySelector('[data-engineering-workspace]');
    const reader = document.querySelector('[data-engineering-scroll]');
    const wheel = document.querySelector('[data-dbtl-wheel]');
    return { part: root.dataset.engineeringActivePart, panel: root.dataset.engineeringActivePanel,
      cycle: wheel.dataset.cycle, hash: location.hash, top: reader.scrollTop,
      phase: root.dataset.engineeringTurning || '', progress: Number(root.dataset.engineeringTurnProgress || 0),
      rows: [...document.querySelectorAll('[data-engineering-heading-row]')].map(row => ({
        current: row.querySelector('p').textContent, transform: row.querySelector('p').style.transform,
        previous: row.querySelector('[data-engineering-preview="previous"]').textContent,
        next: row.querySelector('[data-engineering-preview="next"]').textContent,
      })) };
  });
  let animatedCase = 0;
  const animatedJump = async part => {
    await animated.goto(`${base}/engineering?carousel-check=${++animatedCase}#${part}-cycle-01`, { waitUntil: 'networkidle' });
    await animated.evaluate(() => document.fonts.ready);
  };
  const sendWheel = delta => ar.evaluate((node, delta) => {
    const event = new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true });
    node.dispatchEvent(event); return event.defaultPrevented;
  }, delta);
  const begin = async (part, direction = 1) => {
    await animatedJump(part);
    await ar.evaluate((node, direction) => { node.scrollTop = direction > 0 ? node.scrollHeight : 0; }, direction);
    await animated.waitForTimeout(40);
    return readTurn();
  };
  const finish = async part => {
    await animated.waitForFunction(part => document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePart === part && !document.querySelector('[data-engineering-workspace]').hasAttribute('data-engineering-turning'), part);
    assert.equal(await animated.locator('.engineering-part-panel:not([hidden])').count(), 1);
  };
  const unchanged = (state, before, label) => {
    for (const key of ['part', 'panel', 'cycle', 'hash', 'top']) assert.equal(state[key], before[key], `${label}: ${key} changed before selection settled`);
  };

  let before = await begin('pod');
  await sendWheel(10);
  let state = await readTurn();
  assert.ok(state.progress > 0 && state.progress < .5 && state.phase === 'dragging');
  unchanged(state, before, 'small push');
  await finish('pod');
  unchanged(await readTurn(), before, 'snap back');
  assert.equal(await sendWheel(10), true, 'Returning to the same item must not create a completed-turn lock.');
  assert.equal((await readTurn()).phase, 'dragging');

  // A real wheel gesture can reach the end and continue lightly into the picker.
  await begin('pod');
  await ar.evaluate(node => { node.scrollTop = node.scrollHeight - node.clientHeight - 30; });
  const box = await ar.boundingBox();
  await animated.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await animated.mouse.wheel(0, 45);
  await animated.waitForTimeout(35);
  await animated.mouse.wheel(0, 3);
  await animated.waitForTimeout(25);
  assert.ok((await readTurn()).progress > 0);
  assert.equal((await readTurn()).part, 'pod');
  await sendWheel(40); await sendWheel(40);
  await finish('cetus');
  assert.equal((await readTurn()).top, 0);

  before = await begin('pod');
  await animated.mouse.wheel(0, 120);
  await animated.waitForTimeout(25);
  state = await readTurn();
  assert.ok(state.progress >= .5 && state.progress < 1, 'One ordinary mouse notch reaches the next selection while showing an intermediate position.');
  unchanged(state, before, 'ordinary mouse notch');
  await finish('cetus');
  assert.equal((await readTurn()).top, 0);

  // Reversing below halfway returns to the current article. Resuming a snap
  // continues from its current visible position instead of jumping from zero.
  await begin('mre');
  await sendWheel(45); await sendWheel(35); await sendWheel(-50);
  assert.ok((await readTurn()).progress < .5);
  await finish('mre');
  await begin('mre');
  await sendWheel(40);
  await animated.waitForTimeout(185);
  const snapping = await readTurn();
  assert.equal(snapping.phase, 'settling');
  await sendWheel(35);
  const resumed = await readTurn();
  assert.equal(resumed.phase, 'dragging');
  assert.ok(Math.abs(resumed.progress - (snapping.progress + 35 / 130)) < .08, JSON.stringify({ snapping, resumed }));
  await sendWheel(40);
  await finish('aso');

  for (const [from, to, cross] of [['mre', 'aso', false], ['integrated-orca', 'gfa', true], ['cre-loxp', 'deliver', true], ['deliver', 'measure', true], ['measure', 'model-rna-seq', true]]) {
    before = await begin(from);
    await sendWheel(30); await sendWheel(30); await sendWheel(30);
    state = await readTurn();
    assert.ok(state.progress > .5 && state.progress < 1);
    assert.equal(state.rows[0].transform.includes('+ 0px'), !cross, JSON.stringify(state.rows));
    unchanged(state, before, from);
    await animated.waitForTimeout(165);
    unchanged(await readTurn(), before, `${from} snapping`);
    await finish(to);
    assert.equal((await readTurn()).top, 0);
  }
  before = await begin('cetus', -1);
  await sendWheel(-45); await sendWheel(-45);
  unchanged(await readTurn(), before, 'reverse dragging');
  await finish('pod');
  assert.ok(await ar.evaluate(node => node.scrollTop >= node.scrollHeight - node.clientHeight - 2));
  assert.equal((await readTurn()).cycle, 'pod-cycle-02');
  console.log('Continuous wheel progress, light edge entry, reversal, snap interruption, nearest-item selection, same-group/cross-group tracks and delayed article commit pass.');

  await begin('pod');
  await ar.focus();
  await animated.keyboard.down('PageDown');
  const held = [];
  for (let index = 0; index < 10; index++) {
    held.push(await sendWheel(120));
    await animated.keyboard.down('PageDown');
    await animated.waitForTimeout(55);
  }
  assert.ok(held.every(Boolean));
  await finish('cetus');
  assert.equal((await readTurn()).top, 0);
  await animated.keyboard.up('PageDown');
  for (const cancel of ['map', 'cycle', 'hash']) {
    await begin('pod');
    await sendWheel(45); await sendWheel(45);
    if (cancel === 'map') await animated.locator('[data-engineering-map-back]').click();
    else if (cancel === 'cycle') await animated.locator('[data-engineering-cycle="02"]').click();
    else await animated.evaluate(() => { location.hash = '#gfa-cycle-01'; });
    await animated.waitForTimeout(450);
    state = await readTurn();
    assert.equal(state.phase, '');
    if (cancel === 'map') assert.equal(await animated.locator('[data-engineering-map]').isVisible(), true);
    else assert.equal(state.hash, cancel === 'cycle' ? '#pod-cycle-02' : '#gfa-cycle-01');
  }
  await begin('pod');
  await sendWheel(10);
  await animated.emulateMedia({ reducedMotion: 'reduce' });
  await finish('pod');
  await animated.emulateMedia({ reducedMotion: 'no-preference' });
  await begin('pod');
  await sendWheel(45); await sendWheel(45);
  await animated.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await finish('cetus');
  console.log('Keyboard selection, cross-input tails, cancellation, reduced-motion selection parity and simulated tab hiding pass.');

  const expectedPreviews = { pod: ['', '', '', 'CETUS'], mre: ['', '', 'GFA', 'ASO'],
    'integrated-orca': ['', 'Control', 'CETUS', 'GFA'], gfa: ['Edit', '', 'Integrated ORCA', 'MRE'],
    'model-whole-body': ['', '', 'LAMAR Prioritization', ''] };
  for (const [part, expected] of Object.entries(expectedPreviews)) {
    await animatedJump(part);
    const { rows } = await readTurn();
    assert.deepEqual([rows[0].previous, rows[0].next, rows[1].previous, rows[1].next], expected);
    assert.ok(await animated.locator('[data-engineering-preview]').evaluateAll(nodes => nodes.every(node => node.getAttribute('aria-hidden') === 'true' && node.tabIndex < 0)));
    if (['mre', 'integrated-orca'].includes(part)) await writeFile(path.join(output, `engineering-carousel-${part}-desktop.png`), await animated.screenshot(), { flag: 'wx' });
  }
  for (const part of ['mre', 'integrated-orca']) {
    await begin(part);
    await sendWheel(40);
    await animated.evaluate(() => {
      window.pickerPreviewHold = setInterval(() => document.querySelector('[data-engineering-scroll]').dispatchEvent(new WheelEvent('wheel', { deltaY: .001, bubbles: true, cancelable: true })), 70);
    });
    const middle = await readTurn();
    await writeFile(path.join(output, `engineering-carousel-intermediate-${part}.png`), await animated.screenshot(), { flag: 'wx' });
    await animated.evaluate(() => clearInterval(window.pickerPreviewHold));
    await writeFile(path.join(output, `engineering-carousel-intermediate-${part}.json`), JSON.stringify(middle, null, 2), { flag: 'wx' });
  }
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 640 }, { width: 1280, height: 500 }]) {
    const narrow = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
    await narrow.goto(`${base}/engineering#model-whole-body-cycle-01`, { waitUntil: 'networkidle' });
    const current = await narrow.locator('[data-engineering-heading-part]').evaluate(node => ({ height: node.clientHeight, scrollHeight: node.scrollHeight, width: node.clientWidth, scrollWidth: node.scrollWidth, text: node.textContent, paper: document.querySelector('.engineering-paper').getBoundingClientRect().toJSON() }));
    assert.equal(current.text, 'Whole-body Delivery Model');
    assert.ok(current.scrollHeight <= current.height && current.scrollWidth <= current.width, JSON.stringify(current));
    assert.ok(current.paper.height >= 130 && current.paper.bottom <= viewport.height, JSON.stringify(current));
    await writeFile(path.join(output, `engineering-carousel-long-${viewport.width}.png`), await narrow.screenshot(), { flag: 'wx' });
    await narrow.close();
  }
  await animatedContext.close();
  console.log('Preview semantics and complete long titles at narrow/short viewports pass; intermediate-position evidence saved.');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(`Engineering navigation passed (Chrome ${browser.version()}, Node ${process.version}); screenshots: ${output}`);
} finally {
  await browser.close();
}
