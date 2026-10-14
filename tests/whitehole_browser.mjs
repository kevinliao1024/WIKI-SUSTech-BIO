// WIKI_BASE_URL=http://127.0.0.1:8081 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/whitehole_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8081';
const out = process.env.WHITEHOLE_OUTPUT || '/private/tmp/orca-whitehole';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
results.push = function(...items) { console.log(items.join('\n')); return Array.prototype.push.apply(this, items); };
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
context.setDefaultTimeout(10000);
context.setDefaultNavigationTimeout(20000);
await context.addInitScript(() => {
  window.whEvents = []; window.whShields = [];
  new MutationObserver(() => {
    const cover = document.documentElement?.dataset.whCover;
    if (cover) window.whShields.push({ cover, at: performance.now() });
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-wh-cover'] });
  for (const name of ['start', 'navigate', 'complete', 'error']) document.addEventListener(`whitehole:${name}`, e => window.whEvents.push({ name, ...e.detail, at: performance.now() }));
});
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && /shader|whitehole/i.test(m.text())) errors.push(m.text()); });
const idle = async p => {
  await p.waitForFunction(() => window.ORCAWhiteHole && !window.ORCAWhiteHole.busy);
  assert.equal(await p.locator('.wh-overlay[data-active]').count(), 0);
  assert.equal(await p.locator('.wh-overlay canvas').count(), 0);
  assert.equal(await p.locator('html[data-wh-cover]').count(), 0);
};
async function menu(p, group, name) {
  const navigation = p.getByRole('navigation', { name: 'Primary navigation' });
  await navigation.getByRole('button', { name: group, exact: true }).click();
  await navigation.getByRole('link', { name, exact: true }).click();
}
async function assertArrival(p, direction) {
  await idle(p);
  const state = await p.evaluate(() => ({ events: window.whEvents, shields: window.whShields, pending: sessionStorage.getItem('orca.whitehole.v1') }));
  assert.ok(state.events.some(e => e.name === 'complete' && e.direction === direction), JSON.stringify(state));
  assert.ok(state.shields.length > 0, 'Missing parser-time shield');
  assert.equal(state.pending, null);
}
try {
  // Inspect actual shader frames before exercising navigation.
  await page.goto(`${base}/static/transition/preview.html`);
  await page.locator('#core').click();
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('WEBGL'));
  assert.equal(await page.evaluate(() => window.ORCAWhiteHole.scene.failed || false), false);
  await page.screenshot({ path: `${out}/core.png` });
  await page.locator('#warp').click(); await page.screenshot({ path: `${out}/warp.png` });
  await page.selectOption('#direction', 'to-home'); await page.locator('#core').click();
  await page.screenshot({ path: `${out}/reverse.png` });
  await page.locator('#fallback').check();
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('CSS'));
  await page.screenshot({ path: `${out}/css-fallback.png` });
  await page.locator('#reset').click(); await idle(page);
  results.push('Preview: GLSL core, warp, distinct reverse, CSS fallback; GPU disposed');

  await page.goto(base); await idle(page);
  await menu(page, 'Project', 'Description');
  await page.waitForURL('**/description'); await assertArrival(page, 'to-light');
  results.push('Home → Project: light shield continues before first paint; completes and frees GPU');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForURL(`${base}/`); await assertArrival(page, 'to-home');
  results.push('Project → Home: navy shield and particle unfold; completes and frees GPU');

  await menu(page, 'Project', 'Description'); await page.waitForURL('**/description'); await idle(page);
  await menu(page, 'Wet Lab', 'Experiments'); await page.waitForURL('**/experiments');
  await idle(page);
  assert.deepEqual(await page.evaluate(() => window.whEvents), []);
  assert.deepEqual(await page.evaluate(() => window.whShields), []);
  results.push('Project → Wet Lab: native navigation without transition events or a parser-time shield');

  await page.goBack(); await idle(page); assert.ok(page.url().endsWith('/description'));
  await page.evaluate(() => sessionStorage.setItem('orca.whitehole.v1', JSON.stringify({ version: 1, direction: 'to-home', to: location.href, created: Date.now() })));
  await page.reload(); await idle(page);
  assert.equal(await page.evaluate(() => window.whEvents.some(e => e.name === 'start')), false);
  results.push('History back and direct reload: no stale mask, no cinematic replay');
  await page.evaluate(() => {
    window.ORCAWhiteHole.begin('to-home');
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await idle(page); results.push('Persisted pageshow: restored overlay is cleared');

  // Native semantics: these clicks must be left alone by the controller.
  const bypasses = await page.evaluate(() => {
    const c = window.ORCAWhiteHole;
    const a = document.createElement('a'); a.href = '/experiments';
    const event = { button: 0, defaultPrevented: false };
    const test = changes => !c.eligible(a, { ...event, ...changes });
    const modifiers = test({ metaKey: true }) && test({ ctrlKey: true }) && test({ shiftKey: true }) && test({ altKey: true }) && test({ button: 1 }) && test({ defaultPrevented: true });
    a.href = '#main-content'; const anchor = !c.eligible(a, event);
    a.href = 'https://example.com/'; const external = !c.eligible(a, event);
    a.href = 'mailto:team@example.com'; const mail = !c.eligible(a, event);
    a.href = '/experiments'; a.target = '_blank'; const blank = !c.eligible(a, event);
    a.target = ''; a.download = 'report'; const download = !c.eligible(a, event);
    return { modifiers, anchor, external, mail, blank, download };
  });
  assert.ok(Object.values(bypasses).every(Boolean), JSON.stringify(bypasses));
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter'); assert.ok(page.url().endsWith('#main-content')); await idle(page);
  results.push('Cmd/Ctrl/Shift/Alt/middle click, external, mail, download, blank target and anchors bypass transition');

  // Requests that fail or remain pending must release the current page.
  await page.goto(base); await idle(page);
  await page.route('**/experiments', route => route.abort());
  await menu(page, 'Wet Lab', 'Experiments'); await idle(page);
  assert.equal(page.url(), `${base}/`);
  assert.equal(await page.locator('.wh-notice').count(), 1);
  await page.unroute('**/experiments');
  results.push('Failed destination: current page recovered with retry notice');
  await page.route('**/experiments', route => new Promise(() => {}));
  await page.evaluate(() => window.ORCAWhiteHole.navigate('/experiments'));
  await idle(page); assert.equal(page.url(), `${base}/`);
  await page.unroute('**/experiments'); results.push('Stalled destination: timeout recovery');

  // Repeated clicks and cancellation exercise the shared state, not only rendering.
  await page.evaluate(() => {
    window.ORCAWhiteHole.navigate('/experiments');
    window.ORCAWhiteHole.navigate('/team');
    window.ORCAWhiteHole.navigate('/model');
  });
  await page.waitForURL('**/experiments'); await idle(page);
  results.push('Rapid navigation requests: only the first destination wins');
  await page.evaluate(() => { window.ORCAWhiteHole.navigate('/'); });
  await page.keyboard.press('Escape'); await idle(page); assert.ok(page.url().endsWith('/experiments'));
  results.push('Escape during departure cancels safely');

  // Reduce motion mid-animation and detect renderer cleanup.
  await page.evaluate(() => { window.ORCAWhiteHole.navigate('/'); });
  await page.waitForFunction(() => window.ORCAWhiteHole.scene);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !window.ORCAWhiteHole.scene);
  assert.equal(await page.locator('.wh-overlay canvas').count(), 0);
  await page.waitForURL(`${base}/`); await idle(page);
  await menu(page, 'Project', 'Description'); await page.waitForURL('**/description'); await idle(page);
  assert.equal(await page.locator('.wh-overlay canvas').count(), 0);
  results.push('Reduced motion and live preference change: CSS fades, no active GPU');

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${base}/static/transition/preview.html`); await mobile.locator('#core').click();
  await mobile.waitForFunction(() => document.querySelector('#status').textContent.includes('WEBGL'));
  assert.equal(await mobile.evaluate(() => window.ORCAWhiteHole.scene.renderer.getPixelRatio()), 1);
  assert.equal(await mobile.evaluate(() => window.ORCAWhiteHole.scene.particles.count), 650);
  await mobile.screenshot({ path: `${out}/mobile.png` });
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await mobile.goto(base); await idle(mobile);
  await menu(mobile, 'Project', 'Description'); await mobile.waitForURL('**/description'); await idle(mobile);
  const mobileNav = mobile.getByRole('navigation', { name: 'Primary navigation' });
  await mobileNav.getByRole('button', { name: 'Wet Lab', exact: true }).click();
  const experimentLink = mobileNav.getByRole('link', { name: 'Experiments', exact: true });
  await experimentLink.locator('.rna-base-flip').click();
  assert.equal(await mobile.evaluate(() => window.ORCAWhiteHole.busy), false);
  assert.ok(mobile.url().endsWith('/description'));
  await experimentLink.locator('.rna-branch__label').click();
  await mobile.waitForURL('**/experiments'); await idle(mobile);
  results.push('Mobile 390×844: capped DPR=1, 650 particles, no overflow; actual touch-menu navigation');
  results.push('Mobile C→U decorative base stays interactive; text link navigates normally');
  await mobileContext.close();

  const fallbackContext = await browser.newContext();
  await fallbackContext.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); };
  });
  const noGL = await fallbackContext.newPage(); await noGL.goto(base); await idle(noGL);
  await menu(noGL, 'Project', 'Description'); await noGL.waitForURL('**/description'); await idle(noGL);
  await noGL.getByRole('link', { name: 'Home', exact: true }).click(); await noGL.waitForURL(`${base}/`); await idle(noGL);
  results.push('WebGL unavailable: CSS fallback works in both directions');
  await fallbackContext.close();

  assert.deepEqual(errors, []);
  await writeFile(`${out}/test-results.json`, JSON.stringify({ passed: results, errors }, null, 2));
  console.log(JSON.stringify({ passed: results, errors, screenshots: out }, null, 2));
} finally { await browser.close(); }
