// PLAYWRIGHT_MODULE=/absolute/path/playwright node tests/reading_orbit_drag_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.ORBIT_OUTPUT || `/tmp/wiki-reading-orbit-drag-${Date.now()}`;
const [markup, css, script, cursorCss, cursorScript, arrowSvg, probeSvg] = await Promise.all([
  readFile(new URL('../wiki/components/reading_orbit.html', import.meta.url), 'utf8'),
  readFile(new URL('../static/reading-orbit/reading-orbit.css', import.meta.url), 'utf8'),
  readFile(new URL('../static/reading-orbit/reading-orbit.js', import.meta.url), 'utf8'),
  readFile(new URL('../static/cursor/orca-cursor.css', import.meta.url), 'utf8'),
  readFile(new URL('../static/cursor/orca-cursor.js', import.meta.url), 'utf8'),
  readFile(new URL('../static/cursor/arrow.svg', import.meta.url), 'utf8'),
  readFile(new URL('../static/cursor/probe.svg', import.meta.url), 'utf8'),
]);
const fixtureCursorCss = cursorCss.replace('"arrow.svg"', `"data:image/svg+xml;base64,${Buffer.from(arrowSvg).toString('base64')}"`)
  .replaceAll('"probe.svg"', `"data:image/svg+xml;base64,${Buffer.from(probeSvg).toString('base64')}"`);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const errors = [];
const results = [];
function record(message) { results.push(message); console.log(message); }
async function fixture(page, short = false) {
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>html{scroll-behavior:smooth}body{margin:0;background:#f5f7fb;color:#285858;font:18px/1.6 sans-serif}
    main{min-height:${short ? 180 : 4000}px;padding:30px 70px 0 24px;box-sizing:border-box}footer{height:${short ? 40 : 420}px;background:#07142b}
    h1{font-size:34px}p{max-width:700px}${css}${fixtureCursorCss}</style></head><body><main id="main-content">
    <h1>Reading navigation</h1><p>Drag the orbit up and down to move through this page. The same control also follows ordinary scrolling.</p>
    <button id="under-track" style="position:fixed;right:8px;top:70%;width:50px;height:36px">Link</button>
    </main><footer></footer>${markup}<script>${script}</script><script>${cursorScript}</script></body></html>`);
  await page.waitForFunction(() => document.querySelector('[data-reading-orbit]').hasAttribute('aria-disabled'));
}
async function cursorState(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return page.evaluate(() => {
    const halo = document.querySelector('.orca-cursor-halo');
    const traveler = document.querySelector('[data-orbit-traveler]');
    return { visible: halo.classList.contains('is-visible'), pressed: halo.classList.contains('is-pressed'),
      circular: getComputedStyle(halo, '::before').borderRadius === '50%',
      activeHandle: traveler.hasAttribute('data-orca-cursor'),
      handleOutline: getComputedStyle(traveler).outlineStyle,
      artworkOutline: getComputedStyle(traveler.querySelector('svg')).outlineStyle,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  });
}
async function state(page) {
  return page.evaluate(() => {
    const orbit = document.querySelector('[data-reading-orbit]');
    const traveler = orbit.querySelector('[data-orbit-traveler]');
    const rect = traveler.getBoundingClientRect();
    return { percent: Number(orbit.getAttribute('aria-valuenow')), angle: parseFloat(orbit.style.getPropertyValue('--orbit-turn')),
      y: scrollY, max: document.documentElement.scrollHeight - innerHeight, travel: orbit.clientHeight - traveler.offsetHeight,
      trackTop: orbit.getBoundingClientRect().top, x: rect.x, top: rect.top, width: rect.width, height: rect.height,
      dragging: orbit.classList.contains('is-dragging'), footer: orbit.classList.contains('is-over-footer'),
      disabled: orbit.getAttribute('aria-disabled'), tabIndex: orbit.tabIndex };
  });
}
async function scrollFraction(page, ratio) {
  await page.evaluate(ratio => scrollTo({ top: ratio * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }), ratio);
  await page.waitForFunction(ratio => Math.abs(Number(document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')) - ratio * 100) <= 1, ratio);
  return state(page);
}
async function mouseDrag(page, ratio, grabFraction = .3) {
  const before = await state(page);
  const offset = before.height * grabFraction;
  await page.mouse.move(before.x + before.width / 2, before.top + offset);
  await page.mouse.down();
  const grabbed = await state(page);
  assert.ok(grabbed.dragging);
  assert.ok(Math.abs(grabbed.y - before.y) <= 1, 'grabbing must not jump the document');
  let cursor = await cursorState(page);
  assert.ok(cursor.activeHandle && cursor.circular, 'reading handle uses the same circular custom cursor as navigation');
  assert.equal(cursor.visible, !cursor.reduced);
  assert.ok(cursor.pressed);
  assert.equal(cursor.handleOutline, 'none', 'mouse drag must not draw a rectangular outline');
  assert.equal(cursor.artworkOutline, 'none', 'mouse drag must not lock a focus ring onto the artwork');
  // Move outside the handle horizontally: capture must keep the drag active.
  await page.mouse.move(before.x - 80, before.trackTop + ratio * before.travel + offset, { steps: 6 });
  if (ratio >= 0 && ratio <= 1) {
    cursor = await cursorState(page);
    assert.equal(cursor.visible, !cursor.reduced, 'pointer capture retains the circular cursor while the page scrolls beneath it');
  }
  await page.mouse.up();
  cursor = await cursorState(page);
  assert.ok(!cursor.pressed && !cursor.activeHandle, 'release restores ordinary hover targeting');
  const after = await state(page);
  assert.ok(!after.dragging);
  assert.ok(Math.abs(after.percent - Math.max(0, Math.min(100, ratio * 100))) <= 1, JSON.stringify(after));
  return after;
}
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await fixture(page);
  await scrollFraction(page, .25);
  await mouseDrag(page, .73, .8);
  await mouseDrag(page, .19);
  assert.equal((await mouseDrag(page, 1.2)).percent, 100);
  assert.equal((await state(page)).footer, true);
  assert.equal((await mouseDrag(page, -.2)).percent, 0);
  await page.mouse.move(300, 400);
  assert.equal((await state(page)).percent, 0, 'release must stop the drag');
  record('Desktop: downward/upward drag, grab offset, pointer capture, both clamped endpoints and release passed; circular custom cursor follows capture and restores on release without a rectangular focus outline.');

  const slider = page.getByRole('slider', { name: 'Page reading position' });
  await slider.focus();
  assert.equal(await slider.getAttribute('aria-orientation'), 'vertical');
  await page.keyboard.press('ArrowDown');
  assert.equal((await state(page)).y, 40);
  await page.keyboard.press('ArrowUp');
  assert.equal((await state(page)).y, 0);
  await page.keyboard.press('PageDown');
  assert.equal((await state(page)).y, 900);
  await page.keyboard.press('PageUp');
  assert.equal((await state(page)).y, 0);
  await page.keyboard.press('End');
  assert.equal((await state(page)).percent, 100);
  await page.keyboard.press('Home');
  assert.equal((await state(page)).percent, 0);
  assert.equal(await slider.getAttribute('aria-valuetext'), '0% of page');
  assert.equal(await page.locator('[data-orbit-traveler]').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
  assert.equal(await page.locator('.reading-orbit__form').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
  assert.equal(await page.locator('.reading-orbit__form').evaluate(el => getComputedStyle(el).borderRadius), '50%');
  record('Keyboard: Arrow Up/Down, Page Up/Down, Home/End, accessible slider values and circular artwork focus ring passed.');

  await page.mouse.move(400, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForFunction(() => scrollY >= 590);
  assert.ok((await state(page)).percent > 0);
  await scrollFraction(page, .43);
  let current = await state(page);
  assert.ok(Math.abs(current.angle - 309.6) < .2, 'rotation follows the rounded document scroll offset');
  await page.locator('#under-track').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'under-track', 'empty track must remain click-through');
  await page.screenshot({ path: `${output}/orbit-desktop.png` });
  record('Ordinary wheel/programmatic scroll, rotation, footer theme and click-through track passed.');

  await page.mouse.move(current.x + current.width / 2, current.top + 20);
  await page.mouse.down();
  await page.setViewportSize({ width: 1440, height: 820 });
  await page.waitForFunction(() => Number(document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')) === Math.round(scrollY / (document.documentElement.scrollHeight - innerHeight) * 100));
  assert.ok(Math.abs((await state(page)).y - current.y) <= 1, 'resize must not jump the document');
  const resized = await state(page);
  await page.mouse.move(current.x + current.width / 2, current.top + 60);
  await page.mouse.up();
  assert.ok(Math.abs((await state(page)).percent - (resized.y / resized.max + 40 / resized.travel) * 100) <= 1);
  current = await state(page);
  await page.mouse.move(current.x + current.width / 2, current.top + 20);
  await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.ok(!(await state(page)).dragging);
  await page.mouse.up();
  await page.evaluate(() => document.querySelector('main').style.minHeight = '5200px');
  await page.waitForFunction(() => Number(document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow')) === Math.round(scrollY / (document.documentElement.scrollHeight - innerHeight) * 100));
  record('Active resize, document-height changes and window-blur cleanup passed.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await scrollFraction(page, .3);
  await mouseDrag(page, .6);
  assert.equal((await state(page)).angle, 0);
  await page.keyboard.press('End');
  assert.equal((await state(page)).percent, 100);
  assert.equal((await state(page)).angle, 0);
  record('Reduced motion: dragging and keyboard remain usable with no artwork rotation.');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const touchPage = await mobile.newPage();
  await fixture(touchPage);
  const cdp = await mobile.newCDPSession(touchPage);
  async function touchDrag(ratio, cancel = false) {
    const before = await state(touchPage);
    assert.ok(before.width >= 44 && before.height >= 44, 'mobile hit target must be at least 44px');
    // Use the extra hit area beside the artwork, not its 30px visible center.
    const x = before.x + 5;
    const y = before.top + 20;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    assert.ok((await state(touchPage)).dragging);
    assert.ok(Math.abs((await state(touchPage)).y - before.y) <= 1);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: before.trackTop + ratio * before.travel + 20, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
    assert.ok(!(await state(touchPage)).dragging);
    assert.ok(Math.abs((await state(touchPage)).percent - Math.max(0, Math.min(100, ratio * 100))) <= 1);
  }
  await touchDrag(.75);
  await touchDrag(.2);
  await touchDrag(.6, true);
  await touchDrag(1);
  await touchDrag(0);
  await touchDrag(.43);
  assert.ok(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await touchPage.screenshot({ path: `${output}/orbit-mobile.png` });
  record('390px touch: extended 44px hit target, both drag directions/endpoints, pointercancel recovery and no horizontal overflow passed.');

  const shortPage = await context.newPage();
  await fixture(shortPage, true);
  const short = await state(shortPage);
  assert.equal(short.percent, 0);
  assert.equal(short.disabled, 'true');
  assert.equal(short.tabIndex, -1);
  await shortPage.mouse.move(short.x + 20, short.top + 20);
  await shortPage.mouse.down();
  await shortPage.mouse.move(short.x + 20, short.top + 100);
  await shortPage.mouse.up();
  assert.equal((await state(shortPage)).y, 0);
  assert.ok(!(await state(shortPage)).dragging);
  record('Non-scrollable page: 0%, disabled, removed from tab order and no drag side effects passed.');

  if (process.env.WIKI_BASE_URL) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const route of ['model', 'software']) {
      await page.goto(`${process.env.WIKI_BASE_URL}/${route}`, { waitUntil: 'networkidle' });
      await scrollFraction(page, .25);
      await mouseDrag(page, .62);
      await mouseDrag(page, .18);
      await mouseDrag(page, 1);
      await mouseDrag(page, 0);
      await page.getByRole('slider', { name: 'Page reading position' }).focus();
      await page.keyboard.press('End');
      assert.equal((await state(page)).percent, 100);
      await page.keyboard.press('Home');
      assert.equal((await state(page)).percent, 0);
      assert.equal(await page.locator('[data-reading-orbit]').evaluate(el => getComputedStyle(el).outlineStyle), 'none', 'focus ring belongs on the handle, not the full track');
      assert.equal(await page.locator('[data-orbit-traveler]').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
      assert.equal(await page.locator('.reading-orbit__form').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      assert.equal(await page.locator('.reading-orbit__form').evaluate(el => getComputedStyle(el).borderRadius), '50%');
      await scrollFraction(page, .43);
      await page.screenshot({ path: `${output}/${route}-desktop.png` });
      current = await state(page);
      await page.mouse.move(current.x + current.width / 2, current.top + 20);
      await cursorState(page);
      await page.mouse.down();
      await page.mouse.move(current.x - 50, current.trackTop + .48 * current.travel + 20, { steps: 6 });
      assert.ok((await cursorState(page)).visible);
      await page.screenshot({ path: `${output}/${route}-drag-cursor.png` });
      await page.mouse.up();
      assert.ok(!(await cursorState(page)).pressed);
      await touchPage.goto(`${process.env.WIKI_BASE_URL}/${route}`, { waitUntil: 'networkidle' });
      await scrollFraction(touchPage, .3);
      await touchDrag(.6);
      await touchDrag(.2);
      await touchDrag(.43);
      await touchPage.screenshot({ path: `${output}/${route}-mobile.png` });
      record(`Live /${route}: desktop and mobile drag in both directions, desktop endpoints and keyboard passed.`);
    }
  }

  assert.deepEqual(errors, []);
  await writeFile(`${output}/result.json`, JSON.stringify({ passed: true, browser: await browser.version(), results, errors }, null, 2));
  console.log(`Screenshots and results: ${output}`);
} finally { await browser.close(); }
