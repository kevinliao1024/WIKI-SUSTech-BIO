// WIKI_BASE_URL=http://127.0.0.1:8788 PLAYWRIGHT_MODULE=/path/to/playwright \
// SUBMISSION_OUTPUT=/path/to/task/work/submission-browser node tests/submission_browser.mjs
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.WIKI_BASE_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
assert.ok(process.env.SUBMISSION_OUTPUT, 'Set SUBMISSION_OUTPUT to a dedicated task work directory.');
const output = resolve(process.env.SUBMISSION_OUTPUT);
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true, chromiumSandbox: true});
const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
const failedResources = [];
const checks = [];
const figures = new Set();
const importedPrefix = '/assets/images/submission-20261017/';
const routes = [
  {path: '/blueprint', title: 'Blueprint', figures: 2, heading: /Fundamental/},
  {path: '/results', title: 'Results', figures: 8, heading: /Functional Validation/},
  {path: '/future', title: 'Future', figures: 2, heading: /^Short-Term/},
  {path: '/measurement', title: 'Measurement', figures: 15, heading: /The Measurement Challenge/},
];
const wetCounts = {pod: 3, cetus: 6, 'integrated-orca': 1, gfa: 2, mre: 3, aso: 6, 'cre-loxp': 0, deliver: 3, measure: 10};
const modelCounts = {'model-rna-seq': 5, 'model-puf': 6, 'model-apobec': 5, 'model-lamar': 5, 'model-whole-body': 5};
const cycleNumbers = count => Array.from({length: count}, (_, index) => String(index + 1).padStart(2, '0'));
page.on('pageerror', error => errors.push({url: page.url(), message: error.message}));
page.on('response', response => {
  if (response.status() >= 400 && new URL(response.url()).origin === new URL(base).origin) {
    failedResources.push({url: response.url(), status: response.status()});
  }
});

async function open(path) {
  const response = await page.goto(base + path, {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200, path);
  await page.locator('.markdown-content').waitFor({state: 'attached'});
  await page.evaluate(() => document.fonts.ready);
}

async function noOverflow(label) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(dimensions.document <= dimensions.viewport + 1 && dimensions.body <= dimensions.viewport + 1,
    `${label}: document overflow ${JSON.stringify(dimensions)}`);
}

async function importedAssets(expected, label) {
  const urls = await page.locator('.markdown-content').evaluate((article, prefix) => {
    return [...new Set([...article.querySelectorAll('img[src], a[href]')]
      .map(node => node.tagName === 'IMG' ? node.src : node.href)
      .filter(url => new URL(url).pathname.includes(prefix)))];
  }, importedPrefix);
  assert.equal(urls.length, expected, `${label}: all supplied figure references, including linked supplements`);
  for (const url of urls) figures.add(new URL(url).pathname);
  // Eager loading also validates figures in currently hidden Engineering panels.
  const broken = await page.locator('.markdown-content img').evaluateAll(async images => {
    return (await Promise.all(images.map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch { return image.src; }
      return image.naturalWidth > 0 && image.naturalHeight > 0 ? null : image.src;
    }))).filter(Boolean);
  });
  assert.deepEqual(broken, [], `${label}: every embedded figure decodes`);
  return urls;
}

async function validLinks(selector, label) {
  const broken = await page.locator(selector).evaluateAll(links => links
    .filter(link => link.getAttribute('href')?.startsWith('#'))
    .filter(link => !document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .map(link => link.getAttribute('href')));
  assert.deepEqual(broken, [], `${label}: navigation points to authored headings`);
}

async function assertSelected(part) {
  await page.waitForFunction(part => {
    const workspace = document.querySelector('[data-engineering-workspace]');
    return workspace.dataset.engineeringView === 'reader' && workspace.dataset.engineeringActivePanel === part;
  }, part);
  const visible = page.locator('.engineering-part-panel:visible');
  assert.equal(await visible.count(), 1, 'Exactly one complete module is visible');
  assert.equal(await visible.getAttribute('data-engineering-panel'), part);
  await validLinks('[data-engineering-cycles] a, [data-dbtl-stage][href]', part);
  await noOverflow(part);
}

async function returnToMap() {
  await page.locator('[data-engineering-map-back]').click();
  await page.waitForFunction(() => document.querySelector('[data-engineering-workspace]').dataset.engineeringView === 'map');
}

async function mapPart(part) {
  const group = await page.evaluate(part => window.ORCAEngineering.groups.find(group => group.parts.some(item => item.id === part)), part);
  const parent = page.locator(`[data-engineering-group="${group.id}"]`);
  await parent.focus();
  if (group.parts.length > 1) {
    const leaf = page.locator(`[data-engineering-map] [data-engineering-part="${part}"]`);
    await leaf.waitFor({state: 'visible'});
    await leaf.click();
  } else {
    await parent.click();
  }
  await assertSelected(part);
}

async function checkModule(part, count, width) {
  await mapPart(part);
  const panel = page.locator(`[data-engineering-panel="${part}"]`);
  const headings = await panel.locator(':is(h2,h3,h4,h5,h6)[id]').evaluateAll(nodes => nodes.map(node => ({id: node.id, text: node.textContent.trim()})));
  const expected = cycleNumbers(count).map(number => `${part}-cycle-${number}`);
  assert.deepEqual(headings.filter(heading => /^.+-cycle-\d{2}$/.test(heading.id)).map(heading => heading.id), expected,
    `${part}: source-authored cycle count`);
  const cycleLinks = page.locator('[data-engineering-cycle]');
  assert.deepEqual(await cycleLinks.evaluateAll(links => links.map(link => link.hash.slice(1))), expected);
  assert.equal(await page.locator(`[data-engineering-cycles] a[href="#${part}"]`).count(), 1,
    `${part}: overview/proposal remains directly reachable`);
  for (const title of [/^Overview$/i, /Rationale/i, /Conclusion/i]) {
    const heading = headings.find(heading => title.test(heading.text));
    assert.ok(heading, `${part}: original ${title} content is retained`);
    assert.equal(await panel.locator(`[id="${heading.id}"]`).isVisible(), true, `${part}: ${heading.text} is in the active article`);
  }
  if (!count) {
    assert.equal(await page.locator('[data-dbtl-wheel]').isVisible(), false, 'Cre–loxP proposal has no fabricated DBTL wheel');
    assert.ok(headings.some(heading => /Proposed Design/.test(heading.text)));
    assert.ok(!headings.some(heading => /cycle-\d/.test(heading.id)));
    await page.screenshot({path: `${output}/cre-proposal-${width}.png`});
  } else {
    const last = cycleNumbers(count).at(-1);
    await page.locator(`[data-engineering-cycle="${last}"]`).click();
    await page.waitForFunction(id => document.querySelector('[data-dbtl-wheel]').dataset.cycle === id, `${part}-cycle-${last}`);
    for (const stage of ['design', 'build', 'test', 'learn']) {
      const link = page.locator(`[data-dbtl-stage="${stage}"]`);
      const id = `${part}-cycle-${last}-${stage}`;
      assert.equal(await link.getAttribute('href'), `#${id}`);
      assert.equal(await panel.locator(`[id="${id}"]`).count(), 1);
      await link.click();
      await page.waitForFunction(id => location.hash === `#${id}` && document.activeElement.id === id, id);
      await assertSelected(part);
    }
    if (part === 'measure' || part === 'cetus') {
      await page.screenshot({path: `${output}/${part}-last-cycle-${width}.png`});
    }
  }
  await returnToMap();
  await validLinks('[data-engineering-map] a[href]', `${part} map`);
  const mapCycles = page.locator('[data-map-cycle]');
  assert.deepEqual(await mapCycles.evaluateAll(links => links.map(link => link.hash.slice(1))), expected);
  if (count && (part === 'cetus' || part === 'measure')) {
    const last = cycleNumbers(count).at(-1);
    const link = page.locator(`[data-map-cycle="${last}"]`);
    await link.scrollIntoViewIfNeeded();
    assert.equal(await link.isVisible(), true, `${part}: last map cycle accessible at ${width}px`);
    await link.click();
    await assertSelected(part);
    assert.equal(new URL(page.url()).hash, `#${part}-cycle-${last}`);
    await returnToMap();
  }
}

try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: width === 1440 ? 1000 : 844});
    for (const route of routes) {
      await open(route.path);
      assert.equal(await page.locator('main > header h1').innerText(), route.title);
      assert.ok((await page.locator('.markdown-content :is(h2,h3)').allTextContents()).some(title => route.heading.test(title)));
      await importedAssets(route.figures, `${route.path} ${width}`);
      await validLinks('.content-directory a[href^="#"], .content-mobile-directory a[href^="#"]', route.path);
      if (route.path === '/future') {
        assert.equal(await page.locator('.markdown-content #results').count(), 0);
        const firstHeading = await page.locator('.markdown-content').evaluate(article => {
          const first = article.firstElementChild;
          const style = getComputedStyle(first);
          return {tag: first.tagName, border: style.borderTopWidth, padding: style.paddingTop, margin: style.marginTop};
        });
        assert.deepEqual(firstHeading, {tag: 'H2', border: '0px', padding: '0px', margin: '0px'},
          'Future starts with its heading without an empty block or separator');
        assert.deepEqual(await page.locator('.markdown-content h2').allTextContents(),
          ['Short-Term — Platform Optimization', 'Long-Term — Therapeutic Translation']);
      }
      if (route.path === '/blueprint' || route.path === '/results') {
        const headings = await page.locator('.markdown-content :is(h2,h3)').allTextContents();
        assert.ok(headings.some(title => title.startsWith('05. MODEL')));
        assert.ok(!headings.some(title => title.includes('PROGRAM')));
        assert.ok(await page.locator('.markdown-content a[href="/model"]').count() > 0);
      }
      if (route.path === '/measurement') {
        const labels = await page.locator('nav.site-nav a[href]').evaluateAll(links => links
          .filter(link => new URL(link.href).pathname.replace(/\/$/, '') === '/measurement')
          .map(link => (link.querySelector('.rna-branch__label') || link).textContent.trim()));
        assert.ok(labels.length > 0 && labels.every(label => label === 'Measurement'), 'Wet Lab navigation uses Measurement');
        assert.ok(await page.locator('.markdown-content math').count() > 0, 'Measurement equations render as MathML');
      }
      await noOverflow(`${route.path} ${width}`);
      await page.screenshot({path: `${output}/${route.path.slice(1)}-${width}.png`});
    }
    await open('/engineering');
    await page.waitForFunction(() => window.ORCAEngineering && document.querySelector('[data-engineering-panel]'));
    await importedAssets(91, `engineering ${width}`);
    const counts = await page.evaluate(() => Object.fromEntries(window.ORCAEngineering.groups.flatMap(group => group.parts.map(part => [part.id, part.cycles.length]))));
    assert.deepEqual(counts, {...wetCounts, ...modelCounts});
    const ids = await page.locator('.markdown-content [id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(new Set(ids).size, ids.length, 'Imported Engineering IDs are unique');
    await validLinks('[data-engineering-map] a[href]', 'initial Engineering map');
    await noOverflow(`Engineering map ${width}`);
    for (const [part, count] of Object.entries(wetCounts)) await checkModule(part, count, width);
    checks.push({width, contentRoutes: routes.map(route => route.path), engineeringModules: Object.keys(wetCounts)});
  }
  assert.equal(figures.size, 118, 'Exactly 118 distinct supplied figure files across the imported pages');
  // The supplementary Results figure is linked instead of embedded. Decode all
  // distinct supplied files once to cover that download as well as article images.
  const unavailable = await page.evaluate(async paths => {
    const failed = [];
    for (const path of paths) {
      const image = new Image();
      image.src = path;
      try { await image.decode(); } catch { failed.push(path); }
    }
    return failed;
  }, [...figures]);
  assert.deepEqual(unavailable, [], 'All 118 figure assets decode');
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  assert.deepEqual(failedResources, [], 'No missing local resources');
  const result = {passed: true, uniqueImportedFigures: figures.size, checks, errors, failedResources};
  await writeFile(`${output}/results.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} catch (error) {
  await page.screenshot({path: `${output}/failure.png`}).catch(() => {});
  const result = {passed: false, message: error.message, url: page.url(), checks, errors, failedResources};
  await writeFile(`${output}/results.json`, JSON.stringify(result, null, 2));
  console.error(JSON.stringify(result));
  throw error;
} finally {
  await browser.close();
}
