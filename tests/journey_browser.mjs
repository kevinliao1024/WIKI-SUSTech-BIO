// WIKI_BASE_URL=http://127.0.0.1:8786 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/journey_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8786';
const out = process.env.JOURNEY_OUTPUT || '/private/tmp/orca-journey'; await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }), errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  document.addEventListener('ot:ready', e => {
    const { scene, camera, renderer, THREE } = e.detail;
    window.__journeyReview = { scene, camera, bright: 0 };
    e.target.addEventListener('ot:frame', () => {
      if (window.__journeyReview.bright > 160) return;
      queueMicrotask(() => queueMicrotask(() => {
        const person = scene.getObjectByName('journey-companion');
        if (!person?.visible) return;
        // Read the actual final canvas, not just mesh.visible: postprocessing
        // can leave depth that silently prevents an otherwise valid mesh draw.
        const point = new THREE.Vector3(0, .62, 0); person.localToWorld(point); point.project(camera);
        const x = Math.floor((point.x * .5 + .5) * renderer.domElement.width);
        const y = Math.floor((point.y * .5 + .5) * renderer.domElement.height);
        const gl = renderer.getContext(), pixels = new Uint8Array(4 * 25);
        gl.readPixels(x - 2, y - 2, 5, 5, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let bright = 0; for (let i = 0; i < pixels.length; i += 4) bright = Math.max(bright, (pixels[i] + pixels[i+1] + pixels[i+2]) / 3);
        window.__journeyReview.bright = bright;
      }));
    });
  }, true);
});
const state = () => page.evaluate(() => {
  const person = window.__journeyReview.scene.getObjectByName('journey-companion');
  const props = window.__journeyReview.scene.getObjectByName('journey-props');
  return { person: person.position.toArray(), scale: person.scale.x, visible: person.visible, opacity: person.children[0].material.opacity,
    particles: [...props.geometry.attributes.position.array], colors: [...props.geometry.attributes.color.array], p: +document.querySelector('[data-journey]').style.getPropertyValue('--journey-p') };
});
const settle = p => page.waitForFunction(p => Math.abs(+document.querySelector('[data-journey]').style.getPropertyValue('--journey-p') - p) < .0001, p, { timeout: 60000 });
const scroll = async p => {
  await page.evaluate(p => { const rail = document.querySelector('[data-journey-track]'); window.scrollTo({ top: rail.getBoundingClientRect().top + scrollY + (p + 1) / .81 * rail.offsetHeight, behavior: 'instant' }); }, p);
  await settle(p);
};
try {
  await page.goto(`${base}/next-journey`); await page.waitForFunction(() => window.__journeyReview);
  await settle(-1);
  assert.equal(await page.locator('[data-ot-canvas]').count(), 1);
  assert.equal(await page.locator('[data-crt-picture]').count(), 0);
  const identity = await page.locator('.ot-journey-identity').boundingBox(), menu = await page.locator('.site-nav').boundingBox();
  assert.ok(identity.y >= menu.y + menu.height && identity.y < 800, 'Project identity must clear the shared menu');
  assert.ok((await state()).opacity > .99); await page.screenshot({ path: `${out}/01-opening.png` });
  assert.ok(await page.evaluate(() => window.__journeyReview.bright > 160), 'Companion must actually draw pale pixels in the first frame');
  const initial = await state();
  for (const [id, p] of [['home', -.90], ['bridge', -.68], ['road', -.46]]) {
    const button = page.locator(`[data-journey-station="${id}"]`);
    await button.focus(); await button.press('Enter'); await settle(p);
    assert.equal(await button.getAttribute('aria-current'), 'step');
    await page.screenshot({ path: `${out}/02-${id}.png` });
  }
  for (const p of [-.82, -.60, -.38, -.24]) {
    await scroll(p); const forward = await state(); await scroll(-1); await scroll(p);
    assert.deepEqual(await state(), forward, `Reverse restore at ${p}`);
  }
  await scroll(-1); assert.deepEqual(await state(), initial);
  await scroll(-.24); await page.screenshot({ path: `${out}/03-merge.png` });
  // Observe the existing base take past the handoff without rewriting its keys.
  await page.evaluate(() => {
    const story = document.querySelector('[data-ot-story]');
    window.scrollTo({ top: story.getBoundingClientRect().top + scrollY + .15 * (story.offsetHeight - innerHeight), behavior: 'instant' });
  });
  await page.waitForFunction(() => +document.querySelector('[data-journey]').style.getPropertyValue('--journey-p') > .03);
  assert.equal((await state()).visible, false);
  await page.screenshot({ path: `${out}/04-brain.png` });
  await page.locator('.ot-journey-skip').click();
  await page.waitForFunction(() => document.querySelector('#ot-index-title').getBoundingClientRect().top < innerHeight);
  await page.setViewportSize({ width: 390, height: 844 }); await page.reload(); await scroll(-1);
  for (const id of ['home', 'bridge', 'road']) {
    const rect = await page.locator(`[data-journey-station="${id}"]`).boundingBox();
    assert.ok(rect.height >= 44 && rect.x >= 0 && rect.x + rect.width <= 390);
  }
  await page.screenshot({ path: `${out}/05-mobile.png` });
  const mobileIdentity = await page.locator('.ot-journey-identity').boundingBox(), mobileMenu = await page.locator('.site-nav').boundingBox();
  assert.ok(mobileIdentity.y >= mobileMenu.y + mobileMenu.height);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload();
  assert.equal(await page.locator('[data-journey].ot--static').count(), 1);
  for (const id of ['home', 'bridge', 'road']) assert.ok(await page.locator(`#journey-${id}`).isVisible());
  await page.locator('[data-journey-station="road"]').click();
  const staticRoad = await page.locator('#journey-road').boundingBox(); assert.ok(staticRoad.y >= 0 && staticRoad.y < 844);
  await page.screenshot({ path: `${out}/06-static.png` });
  const noGL = await browser.newPage();
  await noGL.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /^webgl/.test(type) ? null : get.call(this, type, ...args); }; });
  await noGL.goto(`${base}/next-journey`); await noGL.waitForSelector('[data-journey].ot--static.is-ready');
  assert.ok(await noGL.locator('#journey-home').isVisible()); await noGL.close();
  assert.deepEqual(errors, []);
  await writeFile(`${out}/results.json`, JSON.stringify({ errors, checks: ['one shared canvas', 'first-frame companion', 'keyboard stations', 'reverse exact restoration', 'maze handoff', 'skip', '44px mobile targets', 'reduced motion', 'no WebGL'] }, null, 2));
  console.log(`Passed journey browser checks; screenshots in ${out}`);
} catch (e) { await page.screenshot({ path: `${out}/failure.png` }); console.log(errors); throw e; }
finally { await browser.close(); }
