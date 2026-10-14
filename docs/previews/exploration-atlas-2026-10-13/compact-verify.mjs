import { chromium } from '/Users/kevinliao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
const page = await browser.newPage({ viewport: { width: 736, height: 650 } });
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(7000);

try {
  await page.goto('file://' + base + '/compact-preview.html');
  const frame = page.frames().find(item => item.parentFrame());
  await frame.waitForSelector('#orca-compact-exploration .chain-group');
  assert.equal(await frame.locator('[data-variant="左侧竖链"] .chain-count').innerText(), '4/19');
  await frame.locator('[data-variant="左侧竖链"] .chain-group').first().click();
  assert.equal(await frame.locator('[data-variant="左侧竖链"] .chain-popup-page').count(), 4);
  await frame.getByRole('button', { name: 'Contribution，未探索，选择页面' }).click();
  assert.equal(await frame.locator('[data-variant="左侧竖链"] .chain-count').innerText(), '5/19');
  assert.equal(await frame.locator('[data-variant="左侧竖链"] h2').innerText(), 'Contribution');
  await frame.locator('[data-variant="左侧竖链"] .chain-group').first().click();
  await frame.getByRole('button', { name: 'Contribution，当前页面，选择页面' }).click();
  assert.equal(await frame.locator('[data-variant="左侧竖链"] .chain-count').innerText(), '5/19');
  checks.push('点开分类可选页面；新页面计数增加，重复访问不增加。');
  for (const variant of ['左侧竖链', '横向细链']) {
    await frame.evaluate(name => document.querySelectorAll('#orca-compact-exploration [data-variant]').forEach(section => { section.hidden = section.dataset.variant !== name; }), variant);
    for (const width of [736, 390, 320]) {
      await page.setViewportSize({ width, height: 650 });
      const info = await frame.evaluate(() => {
        const active = [...document.querySelectorAll('#orca-compact-exploration [data-variant]')].find(section => !section.hidden);
        const product = active.querySelector('.chain-page');
        const article = active.querySelector('.chain-article');
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, productWidth: product.getBoundingClientRect().width, articleRight: article.getBoundingClientRect().right, productRight: product.getBoundingClientRect().right };
      });
      assert.ok(info.scrollWidth <= info.viewport + 1, JSON.stringify(info));
      assert.ok(info.articleRight <= info.productRight + 1, JSON.stringify(info));
      await page.screenshot({ path: base + `/compact-${variant === '左侧竖链' ? 'rail' : 'line'}-${width}.png`, animations: 'disabled', fullPage: true });
    }
    const scope = frame.locator(`[data-variant="${variant}"]`);
    await scope.locator('.chain-group').nth(1).click();
    assert.equal(await scope.locator('.chain-popup-page').count(), 6);
    await scope.locator('.chain-popup-close').click();
    assert.equal(await scope.locator('.chain-popup').isHidden(), true);
    checks.push(`${variant}：736、390、320px 无横向溢出；分类展开和关闭正常。`);
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(base + '/compact-checks.json', JSON.stringify({ checks, errors }, null, 2) + '\n');
  console.log(checks.join('\n'));
} finally {
  await browser.close();
}
