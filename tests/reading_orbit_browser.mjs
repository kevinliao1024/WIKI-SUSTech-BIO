// WIKI_BASE_URL=http://127.0.0.1:8774 PLAYWRIGHT_MODULE=/absolute/path/playwright node tests/reading_orbit_browser.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WIKI_BASE_URL || 'http://127.0.0.1:8774';
const output = process.env.ORBIT_OUTPUT || `/tmp/wiki-reading-orbit-${Date.now()}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({channel:'chrome', headless:true, chromiumSandbox:true});
const errors = [];
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.setDefaultTimeout(10000);
const orbit = () => page.evaluate(() => {
  const el = document.querySelector('[data-reading-orbit]');
  const form = el.querySelector('svg').getBoundingClientRect();
  return {percent:Number(el.getAttribute('aria-valuenow')), y:parseFloat(el.style.getPropertyValue('--orbit-y')),
    angle:parseFloat(el.style.getPropertyValue('--orbit-turn')), display:getComputedStyle(el).display,
    top:form.top,bottom:form.bottom,left:form.left,right:form.right,width:innerWidth,height:innerHeight};
});
async function scrollFraction(ratio) {
  await page.evaluate(ratio => scrollTo({top:ratio*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}),ratio);
  await page.waitForFunction(ratio => Math.abs(Number(document.querySelector('[data-reading-orbit]').getAttribute('aria-valuenow'))-ratio*100)<2,ratio);
  return orbit();
}
const engineeringGroups = {
  edit:['pod','cetus','integrated-orca'],
  control:['gfa','mre','aso','cre-loxp'],
  deliver:['deliver'],
  measure:['measure'],
  model:['model-rna-seq','model-puf','model-apobec','model-lamar','model-whole-body']
};
const engineeringParts = Object.values(engineeringGroups).flat();
const wetCycleCounts = {pod:3,cetus:6,'integrated-orca':1,gfa:2,mre:3,aso:6,'cre-loxp':0,deliver:3,measure:10};
const cycleNumbers = part => Array.from({length: wetCycleCounts[part] ?? (part === 'model-puf' ? 6 : 5)}, (_, index) => String(index + 1).padStart(2, '0'));
const cycleIds = part => cycleNumbers(part).map(number => `${part}-cycle-${number}`);
const engineeringReadingTarget = id => /^model-.+-cycle-01$/.test(id) ? id.replace(/-cycle-01$/, '-overview') : id;
async function engineeringState() {
  return page.evaluate(() => {
    const scroller = document.querySelector('[data-engineering-scroll]');
    const controls = document.querySelector('.engineering-controls').getBoundingClientRect();
    const paper = document.querySelector('.engineering-paper').getBoundingClientRect();
    return {windowScroll:scrollY, part:document.querySelector('[data-engineering-workspace]').dataset.engineeringActivePanel,
      scroll:scroller.scrollTop, maxScroll:scroller.scrollHeight-scroller.clientHeight,
      controls:{x:controls.x,y:controls.y,width:controls.width,height:controls.height},
      paper:{x:paper.x,y:paper.y,width:paper.width,height:paper.height}};
  });
}
async function assertEngineeringFixed(before) {
  const after = await engineeringState();
  assert.equal(after.windowScroll,0,'Engineering must scroll its article, not the window.');
  for (const area of ['controls','paper']) {
    for (const key of ['x','y','width','height']) {
      // Mobile record navigation may need another row for a different module.
      // Within one article all geometry stays fixed; across modules the paper
      // may resize vertically while retaining its bottom and horizontal bounds.
      if (before.part !== after.part && page.viewportSize().width <= 760 &&
          (key === 'height' || (area === 'paper' && key === 'y'))) continue;
      assert.ok(Math.abs(after[area][key]-before[area][key])<1,
        `Engineering ${area} moved: ${JSON.stringify({before:before[area],after:after[area]})}`);
    }
  }
  assert.ok(Math.abs(after.paper.y+after.paper.height-before.paper.y-before.paper.height)<1,
    'Engineering paper bottom must stay within the same viewport boundary.');
}
async function assertEngineeringView(view) {
  await page.waitForFunction(view=>document.querySelector('[data-engineering-workspace]').dataset.engineeringView===view,view);
  assert.equal(await page.locator('[data-engineering-map]').isVisible(),view==='map');
  assert.equal(await page.locator('.engineering-controls').isVisible(),view==='reader');
  assert.equal(await page.locator('.engineering-paper').isVisible(),view==='reader');
  assert.equal(await page.evaluate(()=>scrollY),0);
}
async function assertEngineeringShell(view='map') {
  assert.equal(await page.locator('[data-reading-orbit]').count(),0);
  assert.equal(await page.locator('footer').count(),0);
  assert.equal(await page.locator('[data-model-back-to-top], [data-back-to-top]').count(),0);
  assert.equal(await page.locator('[data-engineering-scroll]').count(),1);
  assert.equal(await page.locator('[data-engineering-map]').count(),1);
  assert.equal(await page.locator('[data-engineering-map-back]').count(),1);
  assert.equal(await page.locator('.engineering-module-nav').count(),0,'The former bottom navigation must be removed.');
  if (view==='map') assert.equal(await page.locator('[data-engineering-cycle]').count(),0);
  assert.equal(await page.locator('[data-dbtl-wheel] [class*="inner-arrow"], [data-dbtl-wheel] .dbtl-wheel__thread').count(),0);
  await assertEngineeringView(view);
  const sources = await page.locator('svg[data-dbtl-portrait] image').evaluateAll(images=>images.map(image=>image.getAttribute('href')));
  assert.equal(sources.length,44);
  assert.equal(new Set(sources).size,44,'The original supplied portrait pool is retained.');
  if (view==='map') {
    assert.deepEqual(await page.locator('[data-engineering-group]').evaluateAll(elements=>elements.map(el=>el.dataset.engineeringGroup)),Object.keys(engineeringGroups));
    const groups = await page.locator('[data-engineering-map-data]').evaluate(el=>JSON.parse(el.textContent));
    assert.deepEqual(Object.fromEntries(groups.map(group=>[group.id,group.parts.map(part=>part.id)])),engineeringGroups);
    const leafParts = engineeringParts.filter(part=>!['deliver','measure'].includes(part));
    assert.deepEqual((await page.locator('[data-engineering-map] [data-engineering-part]').evaluateAll(elements=>elements.map(el=>el.dataset.engineeringPart))).sort(),leafParts.sort());
    assert.doesNotMatch(await page.locator('[data-engineering-map]').innerText(),/Ideas in motion|Choose a cycle|Choose a branch, then a cycle\./i);
    assert.equal(await page.locator('[data-map-hint], [data-map-cycle-title]').count(),0);
    assert.equal(await page.locator('[data-engineering-map] img, [data-engineering-map] image, [data-map-lines] defs, .engineering-map-water-art, .stream-droplet').count(),0);
    assert.equal(await page.locator('[data-map-cycle]').count(),0,'Cycle links are generated for the selected module.');
    assert.equal(await page.locator('[data-map-cycle] > .map-label').count(),0);
    return;
  }
  await engineeringPortrait();
  const layout = await page.evaluate(() => {
    const controls = document.querySelector('.engineering-controls').getBoundingClientRect();
    const paper = document.querySelector('.engineering-paper').getBoundingClientRect();
    const cycles = document.querySelector('[data-engineering-cycles]').getBoundingClientRect();
    const wheel = document.querySelector('[data-dbtl-wheel]').getBoundingClientRect();
    return {cyclesTop:cycles.top,wheelBottom:wheel.bottom,controlsBottom:controls.bottom,paperBottom:paper.bottom,
      contentLeft:Math.min(controls.left,paper.left),contentRight:Math.max(controls.right,paper.right),height:innerHeight,width:innerWidth};
  });
  assert.ok(layout.cyclesTop>=layout.wheelBottom-1,'Reader Cycle links must sit below the DBTL wheel.');
  assert.ok(layout.controlsBottom<=layout.height+1 && layout.paperBottom<=layout.height+1,JSON.stringify(layout));
  assert.ok(layout.contentLeft>=0 && layout.contentRight<=layout.width+1,JSON.stringify(layout));
}
async function assertEngineeringMapCollapsed() {
  assert.equal(await page.locator('[data-engineering-map]').getAttribute('data-selected-group'),'');
  assert.equal(await page.locator('[data-engineering-map] button').count(),0,'No visible or invisible arrow toggle remains.');
  const overview = await page.locator('[data-engineering-map]').getAttribute('data-overview')==='true';
  assert.equal(await page.locator('[data-map-branch-group]:visible').count(),overview ? 3 : 0);
  assert.equal(await page.locator('[data-map-cycle]:visible').count(),0);
  await assertEngineeringStreams(false);
}
async function assertEngineeringStreams(expectActive=true) {
  await page.waitForFunction(() => {
    const map = document.querySelector('[data-engineering-map]');
    const groups = JSON.parse(document.querySelector('[data-engineering-map-data]').textContent);
    const expected = groups.map(group=>`engineering>${group.id}`);
    const selected = groups.find(group=>group.id===map.dataset.selectedGroup);
    const visibleGroups = map.dataset.overview==='true' ? groups.filter(group=>group.parts.length>1) : selected?.parts.length>1 ? [selected] : [];
    for (const group of visibleGroups) expected.push(...group.parts.map(part=>`${group.id}>${part.id}`));
    if (!map.querySelector('#engineering-map-cycle-picker').hidden) {
      const links = [...map.querySelectorAll('[data-map-cycle]')];
      const part = links[0].hash.slice(1).replace(/-cycle-01$/,'');
      expected.push(...links.map(link=>`${part}>${link.hash.slice(1)}`));
    }
    const actual = [...map.querySelectorAll('g.engineering-map-stream')].map(group=>`${group.dataset.from}>${group.dataset.to}`);
    return JSON.stringify(actual.sort())===JSON.stringify(expected.sort());
  });
  const flow = await page.locator('[data-map-lines]').evaluate(svg=>({
    reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
    nodeAnimations:[...svg.closest('[data-engineering-map]').querySelectorAll('.map-label, .engineering-map-root h1')]
      .filter(node=>node.getClientRects().length>0).map(node=>getComputedStyle(node).animationName),
    streams:[...svg.querySelectorAll('g.engineering-map-stream')].map(group=>({
      from:group.dataset.from,to:group.dataset.to,active:group.classList.contains('is-active'),
      path:(()=>{
        const paths=group.querySelectorAll('path');
        const path=group.querySelector('path.map-connection-path');
        const d=path?.getAttribute('d') || '';
        const length=path?.getTotalLength() || 0;
        return {count:paths.length,valid:Boolean(path) && /^M.+C.+/.test(d) && !/NaN|Infinity/.test(d) && length>0,
          endpoints:path ? [path.getPointAtLength(0),path.getPointAtLength(length)].map(point=>({x:point.x,y:point.y})) : []};
      })(),
      circleCount:group.querySelectorAll('circle').length,
      anchors:[...group.querySelectorAll('circle.map-connection-anchor')].map(dot=>{
        const style=getComputedStyle(dot), x=dot.getAttribute('cx'), y=dot.getAttribute('cy');
        return {animation:style.animationName,offsetPath:style.offsetPath,
          valid:x!==null && y!==null && x.trim()!=='' && y.trim()!=='' && Number.isFinite(Number(x)) && Number.isFinite(Number(y)),
          x:Number(x),y:Number(y)};
      }),
    }))
  }));
  for (const stream of flow.streams) {
    assert.ok(stream.from && stream.to,'Every connection must identify its parent and child.');
    assert.ok(stream.path.count===1 && stream.path.valid,'Each connection needs one valid cubic path.');
    assert.equal(stream.circleCount,2);
    assert.equal(stream.anchors.length,2);
    for (const [index,anchor] of stream.anchors.entries()) {
      assert.ok(anchor.valid && anchor.animation==='none' && anchor.offsetPath==='none','Connection anchors must have numeric, static coordinates.');
      assert.ok(Math.hypot(anchor.x-stream.path.endpoints[index].x,anchor.y-stream.path.endpoints[index].y)<1,
        'Connection anchors must stay at the path endpoints.');
    }
  }
  assert.ok(flow.nodeAnimations.length>0);
  assert.ok(flow.nodeAnimations.every(name=>flow.reduced ? name==='none' : name.split(',').map(value=>value.trim()).includes('map-node-float')),
    'Map labels must float gently, and stop when reduced motion is requested.');
  assert.equal(flow.streams.some(stream=>stream.active),expectActive);
}
async function engineeringPortrait() {
  const portrait = await page.evaluate(() => {
    const wheel = document.querySelector('[data-dbtl-wheel]');
    const portraits = [...wheel.querySelectorAll('svg[data-dbtl-portrait]')];
    const visible = portraits.filter(el=>getComputedStyle(el).display!=='none' && getComputedStyle(el).visibility!=='hidden' && el.getBoundingClientRect().width>0);
    return {selected:wheel.dataset.portrait,total:portraits.length,
      sources:portraits.map(el=>el.querySelector('image').getAttribute('href')),
      visible:visible.map(el=>({name:el.dataset.dbtlPortrait,source:el.querySelector('image').getAttribute('href')}))};
  });
  assert.equal(portrait.total,44,'The existing portrait pool remains available for new cycles.');
  assert.equal(new Set(portrait.sources).size,44,'Cycle portraits must use forty-four distinct image assets.');
  assert.equal(portrait.visible.length,1,'Exactly one portrait SVG must be visible.');
  assert.equal(portrait.visible[0].name,portrait.selected,'The visible portrait must match the wheel state.');
  return portrait.visible[0];
}
async function assertEngineeringInstant(id) {
  id = engineeringReadingTarget(id);
  // Read once immediately after the click; no polling or animation wait may mask a smooth-scroll regression.
  const state = await page.evaluate(id => {
    const reader = document.querySelector('[data-engineering-scroll]');
    const target = document.getElementById(id);
    const padding = parseFloat(getComputedStyle(reader).scrollPaddingTop)||0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop)||0;
    const destination = Math.max(0,Math.min(reader.scrollHeight-reader.clientHeight,
      reader.scrollTop+target.getBoundingClientRect().top-reader.getBoundingClientRect().top-reader.clientTop-padding-margin));
    return {scroll:reader.scrollTop,destination,
      focus:document.activeElement.id,windowScroll:scrollY};
  },id);
  assert.ok(Math.abs(state.scroll-state.destination)<3,`Engineering navigation must jump immediately to the clamped target: ${JSON.stringify({id,...state})}`);
  assert.equal(state.focus,id);
  assert.equal(state.windowScroll,0);
}
async function assertEngineeringContext(part,number,{overview=false}={}) {
  await assertEngineeringView('reader');
  await page.waitForFunction(({part,number}) => {
    const wheel = document.querySelector('[data-dbtl-wheel]');
    return wheel.dataset.part===part && wheel.dataset.cycle===`${part}-cycle-${number}`;
  },{part,number});
  const panels = await page.locator('.engineering-part-panel').evaluateAll(elements=>elements.map(el=>({
    part:el.dataset.engineeringPanel,hidden:el.hidden,
    visible:getComputedStyle(el).display!=='none' && getComputedStyle(el).visibility!=='hidden' && el.getBoundingClientRect().height>0,
    cycles:[...el.querySelectorAll(':is(h2,h3,h4,h5,h6)[id]')].map(heading=>heading.id).filter(id=>/^.+-cycle-\d{2}$/.test(id))
  })));
  const visiblePanels = panels.filter(panel=>panel.visible);
  assert.deepEqual(visiblePanels.map(panel=>panel.part),[part],'Only the selected part may display its article panel.');
  assert.deepEqual(visiblePanels[0].cycles,cycleIds(part),
    'The selected part panel must contain all and only its authored cycle headings.');
  assert.ok(panels.every(panel=>panel.part===part ? !panel.hidden : panel.hidden),
    'Every other part and supplementary panel must remain hidden.');
  assert.deepEqual(await page.locator('[data-engineering-cycle]').evaluateAll(elements=>elements.map(el=>el.getAttribute('href'))),
    cycleIds(part).map(id=>`#${id}`));
  if (overview) assert.equal(await page.locator('[data-engineering-overview][aria-current]').count(),1);
  else assert.equal(await page.locator('[data-engineering-cycle][aria-current]').getAttribute('data-engineering-cycle'),number);
  for (const name of ['design','build','test','learn']) {
    assert.equal(await page.locator(`[data-dbtl-stage="${name}"]`).getAttribute('href'),`#${part}-cycle-${number}-${name}`);
  }
}
async function waitForEngineeringTarget(id,{focus=true}={}) {
  id = engineeringReadingTarget(id);
  await page.waitForFunction(({id,focus}) => {
    const scroller = document.querySelector('[data-engineering-scroll]');
    const target = document.getElementById(id);
    const panel = target.closest('.engineering-part-panel');
    if (!panel || panel.hidden || !panel.getClientRects().length) return false;
    const top = scroller.getBoundingClientRect().top+scroller.clientTop;
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop)||0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop)||0;
    const destination = Math.max(0,Math.min(scroller.scrollHeight-scroller.clientHeight,
      scroller.scrollTop+target.getBoundingClientRect().top-top-padding-margin));
    return (!focus || document.activeElement.id===id) && Math.abs(scroller.scrollTop-destination)<3 && scrollY===0;
  },{id,focus});
  const bounds = await page.evaluate(id => {
    const scroller = document.querySelector('[data-engineering-scroll]').getBoundingClientRect();
    const target = document.getElementById(id).getBoundingClientRect();
    return {top:target.top,bottom:target.bottom,viewportTop:scroller.top,viewportBottom:scroller.bottom};
  },id);
  assert.ok(bounds.top>=bounds.viewportTop-1 && bounds.bottom<=bounds.viewportBottom+1,JSON.stringify(bounds));
}
async function openEngineeringPart(part,number='01',interaction=page.viewportSize().width>760 ? 'hover' : 'click') {
  if (await page.locator('[data-engineering-map-back]').isVisible()) {
    await page.locator('[data-engineering-map-back]').click();
  }
  await assertEngineeringView('map');
  const mapHash = new URL(page.url()).hash;
  const group = Object.keys(engineeringGroups).find(group=>engineeringGroups[group].includes(part));
  const parent = page.locator(`[data-engineering-group="${group}"]`);
  await parent[interaction==='click' ? 'focus' : interaction]();
  await page.waitForFunction(group=>document.querySelector('[data-engineering-map]').dataset.selectedGroup===group,group);
  await assertEngineeringView('map');
  if (engineeringGroups[group].length>1) {
    const leaf = page.locator(`[data-engineering-map] [data-engineering-part="${part}"]`);
    // Direct label clicks enter the overview; focus/hover still explore the
    // optional cycle chooser without entering the article.
    await leaf[interaction==='click' ? 'focus' : 'hover']();
  }
  if (!cycleNumbers(part).length) {
    await page.locator(`[data-engineering-map] [data-engineering-part="${part}"]`).click();
    await assertEngineeringView('reader');
    assert.equal(await page.locator(`[data-engineering-panel="${part}"]`).isVisible(),true);
    assert.equal(await page.locator('[data-engineering-cycle]').count(),0);
    assert.equal(await page.locator('[data-dbtl-wheel]').isVisible(),false);
    return;
  }
  await page.waitForFunction(part=>document.querySelector('[data-map-cycle="01"]').getAttribute('href')===`#${part}-cycle-01` && !document.querySelector('#engineering-map-cycle-picker').hidden,part);
  await assertEngineeringView('map');
  assert.equal(new URL(page.url()).hash,mapHash,'Expanding a part must not enter or navigate the reader.');
  const cycles = page.locator('[data-map-cycle]');
  assert.deepEqual(await cycles.evaluateAll(elements=>elements.map(el=>el.getAttribute('href'))),
    cycleIds(part).map(id=>`#${id}`));
  assert.equal(await page.locator('[data-map-cycle="01"]').isVisible(),true);
  assert.equal(await page.locator('[data-map-cycle="02"]').isVisible(),cycleNumbers(part).length>1);
  await assertEngineeringStreams();
  await page.locator(`[data-map-cycle="${number}"]`).click();
  await assertEngineeringInstant(`${part}-cycle-${number}`);
  await assertEngineeringContext(part,number);
  assert.equal(new URL(page.url()).hash,`#${part}-cycle-${number}`);
}
async function engineeringKeyboardMap() {
  const group = page.locator('[data-engineering-group="control"]');
  await group.focus();
  await assertEngineeringView('map');
  assert.equal(await page.locator('[data-engineering-map]').getAttribute('data-selected-group'),'control');
  await assertEngineeringStreams();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.engineeringPart),'gfa');
  await assertEngineeringView('map');
  assert.equal(await page.locator('[data-map-cycle="01"]').getAttribute('href'),'#gfa-cycle-01');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.mapCycle),'01');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.engineeringPart),'gfa');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.engineeringGroup),'control');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await waitForEngineeringTarget('gfa-cycle-01');
  await assertEngineeringContext('gfa','01');
  await page.locator('[data-engineering-map-back]').click();
  await assertEngineeringView('map');
  assert.equal(await page.locator('[data-map-cycle="01"]').getAttribute('href'),'#gfa-cycle-01');
  assert.equal(await page.locator('[data-map-cycle="01"]').isVisible(),true);
}
async function engineeringModules() {
  for (const part of engineeringParts) {
    await openEngineeringPart(part);
    if (!cycleNumbers(part).length) continue;
    await assertEngineeringShell('reader');
    const before = await engineeringState();
    const firstPortrait = await engineeringPortrait();
    if (cycleNumbers(part).length>1) {
      await page.locator('[data-engineering-cycle="02"]').click();
      await assertEngineeringInstant(`${part}-cycle-02`);
      await assertEngineeringContext(part,'02');
      const secondPortrait = await engineeringPortrait();
      assert.notEqual(secondPortrait.name,firstPortrait.name,'Cycle 02 must display a different portrait from Cycle 01.');
      assert.notEqual(secondPortrait.source,firstPortrait.source,'The cycle change must replace the actual portrait image.');
      await stage('build',`${part}-cycle-02`);
    }
    await assertEngineeringFixed(before);
    await page.locator('[data-engineering-map-back]').click();
    await assertEngineeringView('map');
  }
  await openEngineeringPart('pod');
  // Hash navigation and browser history must switch the visible reader panel.
  await page.evaluate(()=>{ location.hash='#aso-cycle-02-learn'; });
  await waitForEngineeringTarget('aso-cycle-02-learn',{focus:false});
  await assertEngineeringContext('aso','02');
  await page.goBack();
  await waitForEngineeringTarget('pod-cycle-01',{focus:false});
  await assertEngineeringContext('pod','01');
  await page.goForward();
  await waitForEngineeringTarget('aso-cycle-02-learn',{focus:false});
  await assertEngineeringContext('aso','02');
  await page.locator('[data-engineering-map-back]').click();
  await assertEngineeringView('map');
  assert.equal(new URL(page.url()).hash,'#map');
  await page.goBack();
  await waitForEngineeringTarget('aso-cycle-02-learn',{focus:false});
  await assertEngineeringContext('aso','02');
  await page.goForward();
  await assertEngineeringView('map');
  await openEngineeringPart('pod');
}
async function engineeringBoundaryNavigation() {
  const reader = page.locator('[data-engineering-scroll]');
  await openEngineeringPart('pod');
  const before = await engineeringState();
  await reader.focus();
  await reader.evaluate(el=>el.scrollTo({top:el.scrollHeight,behavior:'instant'}));
  await page.keyboard.press('PageDown');
  await assertEngineeringContext('cetus','01',{overview:true});
  assert.equal((await engineeringState()).scroll,0,'Boundary navigation refreshes the complete article from its top.');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'engineering-reading');
  await assertEngineeringContext('cetus','01',{overview:true});
  assert.equal(new URL(page.url()).hash,'#cetus');

  await reader.focus();
  await reader.evaluate(el=>el.scrollTo({top:0,behavior:'instant'}));
  await page.keyboard.press('PageUp');
  await assertEngineeringContext('pod','03');
  const previousEnd = await engineeringState();
  assert.ok(Math.abs(previousEnd.scroll-previousEnd.maxScroll)<3,
    'PageUp at the article start must return to the previous part at its bottom.');
  assert.equal(await page.locator('[data-dbtl-stage][aria-current]').getAttribute('data-dbtl-stage'),'learn');
  assert.equal(new URL(page.url()).hash,await page.locator('[data-engineering-panel="pod"] :is(h2,h3,h4,h5,h6)[id]').last().evaluate(el=>'#'+el.id));

  await openEngineeringPart('model-whole-body');
  const finalHash = new URL(page.url()).hash;
  await reader.focus();
  await reader.evaluate(el=>el.scrollTo({top:el.scrollHeight,behavior:'instant'}));
  await page.keyboard.press('PageDown');
  await assertEngineeringContext('model-whole-body','05');
  const finalEnd = await engineeringState();
  assert.ok(Math.abs(finalEnd.scroll-finalEnd.maxScroll)<3,'Model must remain at the final article boundary.');
  assert.equal(new URL(page.url()).hash,finalHash,'PageDown at the final Model part must not wrap to POD.');
  await assertEngineeringFixed(before);

  // Start a fresh document so the first event is unambiguously a new gesture.
  // Dispatch its inertial tail synchronously, avoiding timing-dependent gaps
  // between browser commands. Every tail event must cancel native scrolling.
  await page.goto(`${base}/engineering?wheel-check=${Date.now()}#pod-cycle-01`,{waitUntil:'networkidle'});
  const burst = await reader.evaluate(el => {
    el.scrollTo({top:el.scrollHeight,behavior:'instant'});
    const send = () => {
      const event = new WheelEvent('wheel',{deltaY:2400,bubbles:true,cancelable:true});
      el.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const firstPrevented = send();
    const start = el.scrollTop;
    const firstPart = document.querySelector('[data-dbtl-wheel]').dataset.part;
    const tailPrevented = Array.from({length:8},send);
    return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,firstPrevented,firstPart,tailPrevented,start,end:el.scrollTop,
      finalPart:document.querySelector('[data-dbtl-wheel]').dataset.part,
      progress:Number(document.querySelector('[data-engineering-workspace]').dataset.engineeringTurnProgress),windowScroll:scrollY};
  });
  assert.equal(burst.firstPart,'pod');
  assert.equal(burst.progress,1,'The fresh gesture must actually advance the picker, not hit an earlier navigation lock.');
  assert.equal(burst.finalPart,burst.firstPart,'The article remains stable through the initial wheel burst.');
  assert.equal(burst.firstPrevented,true);
  assert.ok(burst.tailPrevented.every(Boolean),'Inertial wheel events must not scroll or skip the next article.');
  assert.ok(Math.abs(burst.end-burst.start)<1,'The current article must remain stable while the picker is receiving input.');
  assert.equal(burst.windowScroll,0);
  await assertEngineeringContext('cetus','01',{overview:true});
  assert.equal((await engineeringState()).scroll,0,'After the title animation, the next article begins at its top.');
  await assertEngineeringFixed(before);
  await openEngineeringPart('pod');
}
async function stage(name,cycle='pod-cycle-01') {
  const before = await engineeringState();
  const portrait = await engineeringPortrait();
  await page.locator(`[data-dbtl-stage="${name}"]`).click();
  try {
    await waitForEngineeringTarget(`${cycle}-${name}`);
  } catch(error) {
    console.log('DBTL diagnostic',name, await page.evaluate(id=>({hash:location.hash,focus:document.activeElement.id,
      top:document.getElementById(id).getBoundingClientRect().top,margin:getComputedStyle(document.getElementById(id)).scrollMarginTop,
      scrollerTop:document.querySelector('[data-engineering-scroll]').getBoundingClientRect().top,
      articleScroll:document.querySelector('[data-engineering-scroll]').scrollTop,
      padding:getComputedStyle(document.querySelector('[data-engineering-scroll]')).scrollPaddingTop,
      active:document.querySelector('[data-dbtl-stage][aria-current]')?.dataset.dbtlStage,
      cycle:document.querySelector('[data-dbtl-wheel]').dataset.cycle,windowScroll:scrollY}),`${cycle}-${name}`));
    await page.screenshot({path:`${output}/dbtl-failure.png`});
    throw error;
  }
  assert.equal(new URL(page.url()).hash,`#${cycle}-${name}`);
  assert.equal(await page.locator('[data-dbtl-stage][aria-current]').getAttribute('data-dbtl-stage'),name);
  assert.deepEqual(await engineeringPortrait(),portrait,'Changing DBTL stage must retain the cycle portrait.');
  await assertEngineeringFixed(before);
}
try {
  for (const route of ['/', '/next', '/description', '/model']) {
    await page.goto(`${base}${route}${route==='/' || route==='/next' ? '?p=0.43' : ''}`,{waitUntil:'networkidle'});
    if (route === '/') {
      assert.equal(await page.locator('[data-reading-orbit]').count(),0);
      console.log('Home: reading navigation is omitted.');
      continue;
    }
    assert.equal(await page.locator('[data-reading-orbit]').count(),1);
    assert.equal(await page.locator('[data-story-progress]').count(),0);
    const start = await scrollFraction(0);
    const middle = await scrollFraction(.43);
    if(route==='/' || route==='/description') await page.screenshot({path:`${output}/${route==='/'?'home':'general'}-desktop.png`});
    const end = await scrollFraction(1);
    assert.equal(start.percent,0); assert.equal(end.percent,100);
    assert.ok(middle.y>start.y && end.y>middle.y);
    assert.ok(middle.angle>start.angle && end.angle>middle.angle);
    assert.equal(end.angle,720);
    for (const state of [start,middle,end]) assert.ok(state.display!=='none' && state.top>=0 && state.bottom<=state.height && state.left>=0 && state.right<=state.width,JSON.stringify(state));
    console.log(`${route}: progress 0 → 43 → 100; translation, rotation and viewport bounds passed.`);
  }
  await page.mouse.move(0,0);
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  await assertEngineeringShell();
  await assertEngineeringMapCollapsed();
  for (const number of ['01','02']) assert.equal(await page.locator(`[data-map-cycle="${number}"]`).isVisible(),false);
  await page.screenshot({path:`${output}/engineering-map-desktop.png`});
  const engineeringIds = await page.locator('.markdown-content [id]').evaluateAll(elements=>elements.map(el=>el.id));
  assert.equal(new Set(engineeringIds).size,engineeringIds.length,'Engineering anchor IDs must be unique.');
  for (const part of engineeringParts) {
    const cycleId = new RegExp(`^${part}-cycle-\\d{2}$`);
    assert.deepEqual(engineeringIds.filter(id=>cycleId.test(id)),
      cycleIds(part));
    for (const number of cycleNumbers(part)) {
      assert.deepEqual(engineeringIds.filter(id=>id.startsWith(`${part}-cycle-${number}-`)),
        ['design','build','test','learn'].map(name=>`${part}-cycle-${number}-${name}`));
    }
  }
  await engineeringKeyboardMap();
  await openEngineeringPart('deliver','01','click');
  await engineeringModules();
  for (const name of ['design','build','test','learn']) await stage(name);
  await page.screenshot({path:`${output}/dbtl-desktop.png`});
  assert.equal(await page.locator('[data-dbtl-wheel] select').count(), 0);
  assert.deepEqual((await page.locator('[data-dbtl-wheel]').innerText()).trim().split(/\s+/), ['Design', 'Build', 'Test', 'Learn']);
  await page.goto(`${base}/engineering#cycle-02-learn`,{waitUntil:'networkidle'});
  await waitForEngineeringTarget('pod-cycle-02-learn',{focus:false});
  assert.equal(new URL(page.url()).hash,'#cycle-02-learn','Legacy hashes remain in the address bar.');
  await assertEngineeringContext('pod','02');
  for (const name of ['design','build','test','learn']) await stage(name,'pod-cycle-02');
  await page.goto(`${base}/engineering#cycle-01-test`,{waitUntil:'networkidle'});
  await waitForEngineeringTarget('pod-cycle-01-test',{focus:false});
  assert.equal(new URL(page.url()).hash,'#cycle-01-test');
  await assertEngineeringContext('pod','01');
  assert.equal(await page.locator('[data-dbtl-stage][aria-current]').getAttribute('data-dbtl-stage'),'test');
  for (const legacy of ['program','model']) {
    for (const suffix of ['', '-cycle-02-learn']) {
      const canonical = `model-rna-seq${suffix}`;
      await page.goto(`${base}/engineering#${legacy}${suffix}`,{waitUntil:'networkidle'});
      await waitForEngineeringTarget(canonical,{focus:false});
      await assertEngineeringContext('model-rna-seq',suffix ? '02' : '01',{overview:!suffix});
      assert.equal(new URL(page.url()).hash,`#${legacy}${suffix}`,'Legacy Program/Model links must retain their shareable hash.');
    }
  }
  await page.goto(`${base}/engineering#model-lamar-cycle-02-test`,{waitUntil:'networkidle'});
  await waitForEngineeringTarget('model-lamar-cycle-02-test',{focus:false});
  await assertEngineeringContext('model-lamar','02');
  await page.goto(`${base}/engineering#aso-cycle-02-learn`,{waitUntil:'networkidle'});
  await waitForEngineeringTarget('aso-cycle-02-learn',{focus:false});
  await assertEngineeringContext('aso','02');
  const beforeScroll = await engineeringState();
  await page.locator('#aso-cycle-01-build').evaluate(el => {
    const scroller = document.querySelector('[data-engineering-scroll]');
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop)||0;
    scroller.scrollTo({top:scroller.scrollTop+el.getBoundingClientRect().top-scroller.getBoundingClientRect().top-scroller.clientTop-padding,behavior:'instant'});
  });
  const scrollBox = await page.locator('[data-engineering-scroll]').boundingBox();
  await page.mouse.move(scrollBox.x+scrollBox.width/2,scrollBox.y+scrollBox.height/2);
  await page.mouse.wheel(0,1);
  await page.waitForFunction(() => document.querySelector('[data-dbtl-wheel]').dataset.cycle==='aso-cycle-01' && document.querySelector('[data-dbtl-stage][aria-current]').dataset.dbtlStage==='build');
  await assertEngineeringContext('aso','01');
  await assertEngineeringFixed(beforeScroll);
  await page.locator('[data-dbtl-stage="learn"]').focus();
  await page.keyboard.press('Enter');
  await waitForEngineeringTarget('aso-cycle-01-learn');
  await assertEngineeringContext('aso','01');
  await engineeringBoundaryNavigation();
  console.log('Engineering: optional map cycle chooser, fourteen part panels, forty-four distinct cycle portraits, reader/map return, history and deep links, boundary keyboard turns, wheel inertia guard and article scroll tracking passed.');
  await page.setViewportSize({width:390,height:844});
  await page.mouse.move(0,0);
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  await assertEngineeringShell();
  await assertEngineeringMapCollapsed();
  await page.screenshot({path:`${output}/engineering-map-mobile.png`});
  await engineeringModules();
  await engineeringBoundaryNavigation();
  for (const name of ['design','build','test','learn']) await stage(name);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/dbtl-mobile.png`});
  for(const route of ['/description','/model']) {
    await page.goto(`${base}${route}${route==='/' ? '?p=0.43' : ''}`,{waitUntil:'networkidle'});
    const middle=await scrollFraction(.43);
    assert.ok(middle.left>=0 && middle.right<=390 && middle.bottom<844,JSON.stringify(middle));
    await page.screenshot({path:`${output}/${route==='/'?'home':route.slice(1)}-mobile.png`});
  }
  console.log('390px mobile: Engineering article targets unobscured with fixed controls; other pages retain reading progress inside the viewport.');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.mouse.move(0,0);
  await page.goto(`${base}/engineering`,{waitUntil:'networkidle'});
  await assertEngineeringShell();
  await assertEngineeringMapCollapsed();
  await openEngineeringPart('pod');
  for(const name of ['build','test','learn']) await stage(name);
  assert.equal(await page.locator('[data-reading-orbit]').count(),0);
  assert.ok(await page.locator('.dbtl-wheel__rotor').evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration)<.001));
  assert.ok(await page.locator('.dbtl-wheel__spin').evaluateAll(elements=>elements.every(el=>getComputedStyle(el).animationName==='none')));
  const beforeBottom = await engineeringState();
  await page.locator('[data-engineering-scroll]').evaluate(el=>el.scrollTo({top:el.scrollHeight,behavior:'instant'}));
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-engineering-scroll]');
    return Math.abs(el.scrollTop-(el.scrollHeight-el.clientHeight))<1;
  });
  assert.ok((await engineeringState()).scroll>0,'Engineering article must have independently scrollable content.');
  await assertEngineeringFixed(beforeBottom);
  await page.goto(`${base}/description`,{waitUntil:'networkidle'});
  await scrollFraction(1);
  assert.equal((await orbit()).angle,0);
  assert.equal((await orbit()).percent,100);
  assert.deepEqual(errors,[]);
  console.log(`Reduced motion, runtime errors and focus passed. Screenshots: ${output}`);
  await writeFile(`${output}/result.json`,JSON.stringify({passed:true,errors},null,2));
} finally { await browser.close(); }
