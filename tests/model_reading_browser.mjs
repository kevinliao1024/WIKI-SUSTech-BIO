// WIKI_BASE_URL=http://127.0.0.1:8767 PLAYWRIGHT_MODULE=/path/to/playwright node tests/model_reading_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8767';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const output = process.env.MODEL_READING_OUTPUT || `work/model-reading-browser/${runId}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const errors = [];
const layouts = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.on('pageerror', error => errors.push(error.message));

const state = () => page.evaluate(() => ({
  module: document.querySelector('[data-module-link][aria-current]')?.dataset.module,
  chapter: document.querySelector('[data-chapter-link][aria-current], [data-subchapter-link][aria-current]')?.hash,
  expanded: [...document.querySelectorAll('[data-module-link][aria-expanded="true"]')].map(link => link.dataset.module),
  panels: [...document.querySelectorAll('.module-subnav:not([hidden])')].map(panel => panel.id),
}));

async function activeModule(id) {
  try {
    await page.waitForFunction(id => document.querySelector('[data-module-link][aria-current]')?.dataset.module === id, id);
  } catch (error) {
    console.error('Module selection diagnostic:', id, await state(), await page.evaluate(id => ({
      scroll: scrollY, hash: location.hash, targetTop: document.getElementById(id)?.getBoundingClientRect().top,
    }), id));
    throw error;
  }
  // Selection changes before scrolling and directory collapse finish.
  await page.waitForFunction(() => !document.querySelector('.is-model-navigating, .module-subnav.is-animating'));
  const selected = await state();
  assert.deepEqual(selected.expanded, [id], JSON.stringify(selected));
  assert.equal(selected.panels.length, 1, JSON.stringify(selected));
}

async function jump(id) {
  await page.evaluate(id => {
    if (location.hash === `#${id}`) document.getElementById(id).scrollIntoView({ block: 'start' });
    else location.hash = id;
  }, id);
  await page.evaluate(async id => {
    let previous = null, stable = 0;
    for (let frame = 0; frame < 120 && stable < 3; frame++) {
      await new Promise(requestAnimationFrame);
      const top = document.getElementById(id).getBoundingClientRect().top;
      stable = previous !== null && Math.abs(top - previous) < 0.5 ? stable + 1 : 0;
      previous = top;
    }
  }, id);
  await activeModule(id.split('-')[0]);
}

async function checkAlignment(id) {
  await page.waitForFunction(() => !document.querySelector('.is-model-navigating, .module-subnav.is-animating'));
  const bounds = await page.evaluate(id => {
    const target = document.getElementById(id).getBoundingClientRect();
    const sidebar = document.querySelector('.model-sidebar').getBoundingClientRect();
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
    return { top: target.top, min: innerWidth <= 760 ? sidebar.bottom : header, viewport: innerHeight };
  }, id);
  assert.ok(bounds.top >= bounds.min - 1 && bounds.top < bounds.viewport - 80, `${id}: ${JSON.stringify(bounds)}`);
}

async function screenshot(name) {
  // Keep any earlier deliverable intact; a rerun uses its own output directory.
  await page.mouse.move(0, 0);
  await writeFile(path.join(output, name), await page.screenshot(), { flag: 'wx' });
}

try {
  await page.goto(`${base}/model`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('.model-page').style.getPropertyValue('--model-directory-height') !== '');
  assert.equal(await page.locator('.model-sidebar').evaluate(element => element.inert), true);
  assert.equal(await page.locator('[data-model-back-to-top]').evaluate(element => element.inert), true);
  assert.equal(await page.locator('body > [data-back-to-top]').count(), 0);
  await page.locator('#model-content').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.waitForFunction(() => !document.querySelector('.model-sidebar').inert && !document.querySelector('[data-model-back-to-top]').inert);
  assert.equal(await page.locator('.model-sweeper__caption textPath').count(), 2);
  assert.equal(await page.locator('.model-back-top__label').count(), 0, 'The caption belongs to the illustration, without a separate badge.');
  await page.locator('[data-model-back-to-top]').focus();
  const focusStyle = await page.locator('[data-model-back-to-top]').evaluate(element => ({
    visible: element.matches(':focus-visible'), outline: getComputedStyle(element).outlineStyle,
  }));
  assert.ok(focusStyle.visible && focusStyle.outline !== 'none', JSON.stringify(focusStyle));
  await page.locator('[data-model-back-to-top]').evaluate(element => element.blur());
  await page.locator('[data-model-back-to-top]').hover();
  const captionStyle = await page.locator('.model-sweeper__caption--full').evaluate(element => ({
    decoration: getComputedStyle(element).textDecorationLine, stroke: getComputedStyle(element).stroke,
    background: getComputedStyle(element.closest('button')).backgroundColor,
  }));
  assert.equal(captionStyle.decoration, 'none');
  assert.notEqual(captionStyle.stroke, 'none', 'The lettering keeps a fine contrast edge on the dark footer.');
  assert.equal(captionStyle.background, 'rgba(0, 0, 0, 0)');
  console.log('Integrated arc lettering has no badge or hover underline, a contrast edge, and visible keyboard focus.');
  const sweep = await page.locator('.model-sweeper__arm').evaluate(async element => {
    const before = getComputedStyle(element).transform;
    await new Promise(resolve => setTimeout(resolve, 220));
    return { before, after: getComputedStyle(element).transform, state: getComputedStyle(element).animationPlayState };
  });
  assert.equal(sweep.state, 'running');
  assert.notEqual(sweep.before, sweep.after, 'The broom arm should visibly sweep in normal motion.');
  await page.locator('[data-model-back-to-top]').click();
  await page.waitForFunction(() => scrollY <= 1 && document.querySelector('.model-sidebar').inert && document.querySelector('[data-model-back-to-top]').inert);
  // Let Chromium dispatch the final scrollend before starting a new hash jump.
  await page.waitForTimeout(250);
  assert.equal(new URL(page.url()).hash, '');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'model-overview');
  console.log('The sweeper and sidebar appear together at the story introduction, animate, and return to the top with focus.');
  const modules = await page.locator('[data-model-module]').evaluateAll(items => items.map(item => item.id));
  assert.equal(modules.length, 4);

  for (const module of modules) {
    await jump(module);
    await checkAlignment(module);
    const chapters = await page.locator(`#${module} [data-model-chapter]`).evaluateAll(items => items.map(item => item.id));
    for (const chapter of chapters) {
      await jump(chapter);
      await page.waitForFunction(id => document.querySelector('[data-chapter-link][aria-current]')?.hash === `#${id}`, chapter);
      await checkAlignment(chapter);
    }
  }
  console.log('All four modules and every primary chapter: correct expansion, active item, and anchor alignment.');

  assert.equal(await page.locator('[data-model-subchapter], [data-subchapter-link]').count(), 0);
  for (const id of ['module2-ranking-results', 'module2-feature-ablations', 'module2-readout-layers']) {
    await jump(id);
    await activeModule('module2');
    await checkAlignment(id);
    await page.waitForFunction(() => document.querySelector('[data-chapter-link][aria-current]')?.hash === '#module2-2');
    assert.equal(await page.locator('.module-subnav [aria-current]').count(), 1);
  }
  console.log('Legacy result anchors remain reachable and keep Specificity ranking selected without subsection entries.');

  await jump('module3');
  await page.locator('.model-sidebar').evaluate(element => { element.scrollTop = 0; });
  const hoverButton = await page.locator('[data-module="module1"]').boundingBox();
  assert.ok(hoverButton && hoverButton.y >= 100, 'Hover target is visible without moving the page.');
  await page.mouse.move(hoverButton.x + hoverButton.width / 2, hoverButton.y + hoverButton.height / 2);
  assert.deepEqual((await state()).expanded, ['module3'], 'Hover must not switch the reading directory.');
  await page.locator('[data-module="module2"]').click();
  await activeModule('module2');
  assert.equal(new URL(page.url()).hash, '#module2');
  const chapterToClick = await page.locator('#module-subnav-2 [data-chapter-link]').nth(2).getAttribute('href');
  await page.evaluate(() => {
    window.modelChapterTrajectory = new Promise(resolve => {
      const initial = scrollY, armed = performance.now(), samples = [];
      let started;
      const sample = time => {
        const navigating = Boolean(document.querySelector('.is-model-navigating'));
        if (started === undefined) {
          if (!navigating && time - armed < 3000) {
            requestAnimationFrame(sample);
            return;
          }
          started = time;
        }
        samples.push({ elapsed: time - started, top: scrollY });
        if (navigating && time - armed < 3000) requestAnimationFrame(sample);
        else resolve({ initial, samples });
      };
      requestAnimationFrame(sample);
    });
  });
  await page.locator(`#module-subnav-2 [href="${chapterToClick}"]`).click();
  await page.waitForFunction(hash => document.querySelector('[data-chapter-link][aria-current]')?.hash === hash, chapterToClick);
  await checkAlignment(chapterToClick.slice(1));
  const trajectory = await page.evaluate(() => window.modelChapterTrajectory);
  const end = trajectory.samples.at(-1), travel = Math.abs(end.top - trajectory.initial);
  const atFraction = fraction => trajectory.samples.reduce((nearest, sample) =>
    Math.abs(sample.elapsed - end.elapsed * fraction) < Math.abs(nearest.elapsed - end.elapsed * fraction) ? sample : nearest);
  assert.ok(travel > 100 && end.elapsed >= 500, JSON.stringify(trajectory));
  assert.ok(Math.abs(atFraction(.25).top - trajectory.initial) / travel > .45, 'Chapter scrolling should begin promptly.');
  assert.ok(Math.abs(end.top - atFraction(.75).top) / travel < .1, 'Chapter scrolling should ease gently to its destination.');
  await page.locator('[data-module="module3"]').focus();
  await page.keyboard.press('Enter');
  await activeModule('module3');
  await checkAlignment('module3');
  console.log('Hover preserves current module; pointer and keyboard jumps work, and a chapter click starts promptly and eases to its destination.');

  for (const module of ['module4', 'module3', 'module2', 'module1', 'module2']) {
    await page.evaluate(id => {
      const top = document.getElementById(id).getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + 250, behavior: 'instant' });
    }, module);
    await activeModule(module);
  }
  console.log('Scrolling forward and backward updates the module without requiring a hash change.');

  const legacy = await page.locator('.model-prose h4[id]:not([data-model-chapter])').evaluateAll(items => items.map(item => item.id));
  assert.ok(legacy.length, 'Legacy subsection anchors remain present.');
  for (const id of legacy) {
    await jump(id);
    await checkAlignment(id);
  }
  console.log(`${legacy.length} legacy subsection anchors retain usable scroll alignment.`);
  assert.equal(await page.locator('[data-model-resource-links]').count(), 4);
  assert.ok(await page.locator('.model-reading a').evaluateAll(links => links.length > 0 && links.every(link => link.closest('[data-model-resource-links]'))), 'Article hyperlinks are confined to the four resource sections.');
  assert.equal(await page.locator('.model-reading .ev-badge').count(), 0, 'Evidence badges are removed.');
  const citationTarget = '#module4-ref-lamar';
  await jump(citationTarget.slice(1));
  await activeModule('module4');
  await checkAlignment(citationTarget.slice(1));
  console.log('Plain-text bibliography retains usable anchors; hyperlinks are confined to resource sections and evidence badges are absent.');

  for (const width of [1440, 1280, 1024, 768, 760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await jump('module4-3');
    await checkAlignment('module4-3');
    const metrics = await page.evaluate(() => {
      const reading = document.querySelector('.model-reading').getBoundingClientRect();
      const sidebar = document.querySelector('.model-sidebar').getBoundingClientRect();
      const mascot = document.querySelector('[data-model-back-to-top]').getBoundingClientRect();
      const prose = document.querySelector('#module4 .model-prose');
      const proseBounds = prose.getBoundingClientRect();
      const figures = [...document.querySelectorAll('.model-prose figure:not(.model-overview-figure)')].map(item => item.getBoundingClientRect().width);
      return { width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        sidebarHeight: sidebar.height, sidebarRight: sidebar.right, readingLeft: reading.left,
        mascotLeft: mascot.left, mascotRight: mascot.right, mascotWidth: mascot.width, mascotBottom: mascot.bottom,
        proseRight: proseBounds.right, proseWidth: proseBounds.width, proseFont: parseFloat(getComputedStyle(prose).fontSize),
        chapterFont: parseFloat(getComputedStyle(document.querySelector('[data-chapter-link][aria-current] .module-chapter-label')).fontSize),
        moduleFont: parseFloat(getComputedStyle(document.querySelector('[data-module-link][aria-current] .module-nav-label')).fontSize),
        maxFigure: Math.max(0, ...figures),
        overviewFigure: document.querySelector('.model-overview-figure').getBoundingClientRect().width,
        overviewProse: document.querySelector('#model-content .model-prose').getBoundingClientRect().width };
    });
    assert.ok(metrics.scroll <= metrics.width + 1, `${width}px horizontal overflow: ${JSON.stringify(metrics)}`);
    assert.ok(metrics.overviewFigure <= metrics.overviewProse + 1, `${width}px overview exceeds its reading column`);
    assert.ok(metrics.maxFigure <= 721, `${width}px figure width: ${JSON.stringify(metrics)}`);
    assert.ok(metrics.mascotLeft >= metrics.proseRight - 1, `${width}px sweeper covers the prose: ${JSON.stringify(metrics)}`);
    assert.ok(metrics.mascotRight <= width && metrics.mascotBottom <= 900, `${width}px sweeper outside the viewport`);
    assert.ok(metrics.mascotWidth >= 44, `${width}px sweeper touch target too small`);
    assert.ok(metrics.proseFont >= (width > 760 ? 18 : 16), `${width}px larger reading type missing`);
    assert.equal(metrics.chapterFont, 15, `${width}px chapter labels must retain the requested size`);
    if (width > 760) assert.equal(metrics.moduleFont, 20, `${width}px module labels must retain the requested size`);
    if (width <= 390) assert.ok(metrics.proseWidth >= width - 90, `${width}px mobile text column too narrow: ${JSON.stringify(metrics)}`);
    layouts.push({ viewport: width, proseWidth: Math.round(metrics.proseWidth * 10) / 10,
      fontSize: metrics.proseFont, controlWidth: metrics.mascotWidth });
    if (width > 760) assert.ok(metrics.sidebarRight < metrics.readingLeft, `${width}px overlapping columns`);
    else assert.ok(metrics.sidebarHeight <= 112, `${width}px mobile directory too tall`);
  }
  console.log('Seven viewport widths: no overflow, bounded figures, larger text, readable mobile width, and a 44px+ sweeper clear of the prose.');
  console.log('Measured layout (px):', JSON.stringify(layouts));

  await page.setViewportSize({ width: 1280, height: 500 });
  await jump('module4-7');
  const shortDirectory = await page.locator('.model-sidebar').evaluate(nav => {
    const style = getComputedStyle(nav);
    return { position: style.position, overflow: style.overflowY, scroll: nav.scrollTop };
  });
  assert.equal(shortDirectory.position, 'relative');
  assert.equal(shortDirectory.overflow, 'visible');
  assert.equal(shortDirectory.scroll, 0);
  console.log('Short desktop viewport uses document flow without a separate directory scrollbar.');

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await jump('module2-feature-ablations');
    const directory = await page.locator('.model-sidebar').evaluate(nav => ({
      top: nav.getBoundingClientRect().top, bottom: nav.getBoundingClientRect().bottom,
      overflow: getComputedStyle(nav).overflowY, scroll: nav.scrollTop,
    }));
    assert.equal(directory.overflow, 'visible');
    assert.equal(directory.scroll, 0);
    assert.ok(directory.bottom <= viewport.height, JSON.stringify({ viewport, directory }));
  }
  console.log('The longest directory fits three desktop viewport sizes without independent scrolling.');

  await page.setViewportSize({ width: 390, height: 844 });
  await jump('module4-7');
  // The directory's native smooth scrolling can outlast the page jump.
  await page.waitForFunction(() => {
    const link = document.querySelector('[data-chapter-link][aria-current][href="#module4-7"]');
    if (!link) return false;
    const item = link.getBoundingClientRect(), nav = link.parentElement.getBoundingClientRect();
    return item.left >= nav.left && item.right <= nav.right + 1;
  });
  const horizontal = await page.locator('[data-chapter-link][aria-current]').evaluate(link => {
    const item = link.getBoundingClientRect(), nav = link.parentElement.getBoundingClientRect();
    return { left: item.left, right: item.right, navLeft: nav.left, navRight: nav.right };
  });
  assert.ok(horizontal.left >= horizontal.navLeft && horizontal.right <= horizontal.navRight + 1, JSON.stringify(horizontal));
  await jump(legacy[0]);
  await checkAlignment(legacy[0]);
  await jump(citationTarget.slice(1));
  await checkAlignment(citationTarget.slice(1));
  console.log('Mobile active chapter scrolls into the horizontal row; legacy jumps clear both navigation rows.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await jump('module1-1');
  const duration = await page.locator('.model-sidebar').evaluate(item => getComputedStyle(item).transitionDuration);
  // The shared reduced-motion reset uses 0.01ms with !important.
  assert.ok(duration.split(',').every(value => parseFloat(value) <= 0.001), duration);
  assert.equal(await page.locator('.model-sidebar').evaluate(item => getComputedStyle(item).transform), 'none');
  assert.equal(await page.locator('.model-sweeper__arm').evaluate(item => getComputedStyle(item).animationName), 'none');
  await screenshot('model-mobile-sweeper.png');
  await page.locator('[data-model-back-to-top]').click();
  await page.waitForFunction(() => scrollY <= 1 && document.querySelector('[data-model-back-to-top]').inert);
  assert.equal(await page.locator('.model-sweeper__arm').evaluate(item => getComputedStyle(item).animationName), 'none');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await jump('module1-3');
  await screenshot('model-desktop-sweeper.png');
  await page.locator('#model-content').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.waitForFunction(() => !document.querySelector('.model-sidebar').inert && !document.querySelector('[data-model-back-to-top]').inert);
  await screenshot('model-story-desktop-sweeper.png');
  await jump('module4-7');
  await screenshot('model-references-desktop-sweeper.png');
  await page.setViewportSize({ width: 320, height: 844 });
  await jump('module1-1');
  await screenshot('model-mobile-320-sweeper.png');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(`Reduced motion and browser runtime checks passed (Chrome ${browser.version()}, Node ${process.version}); screenshots: ${output}`);
} finally {
  await browser.close();
}
