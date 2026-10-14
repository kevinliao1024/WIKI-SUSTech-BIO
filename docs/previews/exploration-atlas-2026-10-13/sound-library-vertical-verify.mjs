import { chromium } from '/Users/kevinliao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel:'chrome', headless:true, chromiumSandbox:true });
const page = await browser.newPage({ viewport:{ width:736, height:650 } });
const errors=[]; const checks=[];
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(7000);
try {
  await page.goto('file://' + base + '/sound-library-vertical-preview.html');
  const frame=page.frames().find(item => item.parentFrame());
  await frame.waitForSelector('#orca-sound-board .sound-group');
  const paper=frame.locator('[data-variant="声纹手稿"]');
  assert.equal(await paper.locator('.sound-glyph').count(),19);
  assert.equal(await paper.locator('.sound-total').innerText(),'04 voices');
  await paper.locator('.sound-group').first().click();
  assert.equal(await paper.locator('.sound-page-link').count(),4);
  await paper.getByRole('button',{ name:'Contribution，静默，选择页面' }).click();
  assert.equal(await paper.locator('.sound-total').innerText(),'05 voices');
  assert.equal(await paper.locator('h2').innerText(),'Contribution');
  await paper.locator('.sound-group').first().click();
  await paper.getByRole('button',{ name:'Contribution，正在刻录，选择页面' }).click();
  assert.equal(await paper.locator('.sound-total').innerText(),'05 voices');
  checks.push('19 个页面分属 5 组；打开、重复访问和当前页状态正确。');
  for (const [name,slug] of [['声纹手稿','paper'],['磁带刻槽','tape'],['玻片谱条','slides']]) {
    await frame.evaluate(value => document.querySelectorAll('#orca-sound-board [data-variant]').forEach(section => { section.hidden=section.dataset.variant!==value; }),name);
    const section=frame.locator(`[data-variant="${name}"]`);
    for (const width of [736,390,320]) {
      await page.setViewportSize({ width,height:650 });
      const metrics=await frame.evaluate(() => {
        const section=[...document.querySelectorAll('#orca-sound-board [data-variant]')].find(node => !node.hidden);
        const page=section.querySelector('.sound-page');
        const article=section.querySelector('.sound-article');
        const rail=section.querySelector('.sound-rail');
        return { viewport:innerWidth, scroll:document.documentElement.scrollWidth, pageRight:page.getBoundingClientRect().right, articleRight:article.getBoundingClientRect().right, railBottom:rail.getBoundingClientRect().bottom, lastGroupBottom:rail.lastElementChild.getBoundingClientRect().bottom };
      });
      assert.ok(metrics.scroll<=metrics.viewport+1,JSON.stringify(metrics));
      assert.ok(metrics.articleRight<=metrics.pageRight+1,JSON.stringify(metrics));
      assert.ok(metrics.lastGroupBottom<=metrics.railBottom+1,JSON.stringify(metrics));
      await page.screenshot({ path:`${base}/sound-${slug}-${width}.png`, animations:'disabled', fullPage:true });
    }
    await section.locator('.sound-group').nth(1).click();
    assert.equal(await section.locator('.sound-page-link').count(),6);
    const popupBounds=await frame.evaluate(() => {
      const section=[...document.querySelectorAll('#orca-sound-board [data-variant]')].find(node => !node.hidden);
      return { popupBottom:section.querySelector('.sound-popover').getBoundingClientRect().bottom, pageBottom:section.querySelector('.sound-page').getBoundingClientRect().bottom };
    });
    assert.ok(popupBounds.popupBottom<=popupBounds.pageBottom+1,JSON.stringify(popupBounds));
    await page.screenshot({ path:`${base}/sound-${slug}-open-320.png`, animations:'disabled', fullPage:true });
    await section.locator('.sound-close').click();
    assert.equal(await section.locator('.sound-popover').isHidden(),true);
    checks.push(`${name} 在 736、390、320px 无横向溢出，分组操作正常。`);
  }
  assert.deepEqual(errors,[]);
  await fs.writeFile(base+'/sound-library-vertical-checks.json',JSON.stringify({ checks,errors },null,2)+'\n');
  console.log(checks.join('\n'));
} finally { await browser.close(); }
