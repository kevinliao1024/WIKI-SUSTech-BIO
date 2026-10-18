import {DAY, dayNumber, isoDay, formatDate, dateBounds, groupTrack, overviewX as calendarX, focusY, validateIndex} from './notebook-core.mjs';
import {createTrackIcon} from './notebook-icons.mjs';
import {recordActivities} from './notebook-activities.mjs';
import {captureRail, captureScene, morphRail, cancelRailMotion} from './notebook-motion.mjs';

const app = document.querySelector('[data-notebook]');
app.classList.add('is-initializing');
const $ = key => app.querySelector(`[data-${key}]`);
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
const svg = (tag, attrs = {}, text) => { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key,value] of Object.entries(attrs)) node.setAttribute(key, value); if(text) node.textContent = text; return node; };
const attr = (node, values) => {for (const [key,value] of Object.entries(values)) node.setAttribute(key,value);};
const baseURL = new URL(app.dataset.index, location.href);
const sourceURL = path => {
  const url = new URL(path, baseURL).href;
  return globalThis.wikiAssetURL?.(url) ?? url;
};
const shortDate = iso => new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(dayNumber(iso)*DAY));
let index, bounds, selected = null, groups = [], activeDate = null, overviewScroll = 0, overviewX = 0, overviewZoom = 100;
let labelLayer;
let ticks = [], lanes = [], months = [], milestones = [], rowElements = [], pendingLayout = 0;
const expanded = new Set();
let dateObserver;
const resizeObserver = new ResizeObserver(() => scheduleLayout());

function link(text, href) { const a = el('a', '', text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; }
function scheduleLayout() { cancelAnimationFrame(pendingLayout); pendingLayout = requestAnimationFrame(layoutMap); }
const clampZoom=value=>Math.max(100,Math.min(300,Number(value)||100));
function pinLabels(){
  if(!labelLayer)return;
  labelLayer.style.display=selected?'none':'';
  labelLayer.setAttribute('transform',`translate(${$('viewport').scrollLeft} 0)`);
}
function changeZoom(value,fit=false){
  if(selected||!bounds)return;
  cancelRailMotion();
  const viewport=$('viewport'),anchor=176+(viewport.clientWidth-176)/2;
  const fraction=(viewport.scrollLeft+anchor-176)/($('stage').clientWidth-208);
  overviewZoom=clampZoom(value);
  layoutMap();
  viewport.scrollLeft=fit?0:176+fraction*($('stage').clientWidth-208)-anchor;
  overviewX=viewport.scrollLeft;pinLabels();
  history.replaceState({...history.state,notebook:true,overviewZoom,overviewX,overviewScroll:scrollY},'');
}
function bindZoom(){
  $('zoom').addEventListener('input',()=>changeZoom($('zoom').value));
  $('zoom-out').addEventListener('click',()=>changeZoom(overviewZoom-25));
  $('zoom-in').addEventListener('click',()=>changeZoom(overviewZoom+25));
  $('zoom-fit').addEventListener('click',()=>changeZoom(100,true));
  const viewport=$('viewport');
  viewport.addEventListener('scroll',pinLabels,{passive:true});
  let pan=null,dragged=false;
  viewport.addEventListener('pointerdown',e=>{
    dragged=false;
    if(selected||e.pointerType!=='mouse'||e.button!==0||viewport.scrollWidth<=viewport.clientWidth)return;
    pan={id:e.pointerId,x:e.clientX,scroll:viewport.scrollLeft};
  });
  viewport.addEventListener('pointermove',e=>{
    if(!pan||e.pointerId!==pan.id)return;
    if(!(e.buttons&1)){pan=null;dragged=false;return;}
    const distance=e.clientX-pan.x;
    if(!dragged&&Math.abs(distance)<5)return;
    dragged=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-panning');
    viewport.scrollLeft=pan.scroll-distance;e.preventDefault();
  });
  const end=e=>{
    if(pan&&viewport.hasPointerCapture(pan.id))viewport.releasePointerCapture(pan.id);
    pan=null;viewport.classList.remove('is-panning');
    if(e.type==='pointercancel')dragged=false;
  };
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
  viewport.addEventListener('lostpointercapture',()=>{pan=null;viewport.classList.remove('is-panning');});
  viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;}},true);
}
function nearestDate(date) {
  if (!groups.length) return null;
  const target = date ? dayNumber(date) : dayNumber(groups[0].date);
  return groups.reduce((best, g) => Math.abs(dayNumber(g.date)-target) < Math.abs(dayNumber(best.date)-target) ? g : best).date;
}
function jumpTo(date, recordId, moveFocus = false) {
  const target = recordId ? document.getElementById(`record-${recordId}`) : rowElements.find(row => row.dataset.date === nearestDate(date));
  if (!target) return;
  // Use immediate scrolling: long notebook jumps are never animated across weeks.
  const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 100;
  window.scrollTo({top: target.getBoundingClientRect().top + scrollY - nav - $('back').closest('.nb-toolbar').offsetHeight - 20, behavior:'instant'});
  if(moveFocus) (target.querySelector('button') || target).focus({preventScroll:true});
  setActive(date || target.dataset.date);
}
function setActive(date) {
  if (!date || !selected) return;
  activeDate = nearestDate(date);
  $('jump').value = activeDate;
  for (const tick of ticks) tick.node.classList.toggle('is-active',tick.date === activeDate);
  for (const lane of lanes) for (const event of lane.events) {
    if(lane.track.id === selected && event.date === activeDate) event.node.setAttribute('aria-current','date');
    else event.node.removeAttribute('aria-current');
  }
}
function writeURL(track, date, record, replace = false) {
  const url = new URL(location.href);
  for (const key of ['track','date','record']) url.searchParams.delete(key);
  if(track) url.searchParams.set('track',track);
  if(date) url.searchParams.set('date',date);
  if(record) url.searchParams.set('record',record);
  history[replace ? 'replaceState' : 'pushState']({notebook:true, overviewScroll, overviewX, overviewZoom},'',url);
}
function readURL() {
  const query = new URL(location.href).searchParams;
  let track = query.get('track'), date = query.get('date'), record = query.get('record');
  if(record) { const r = index.records.find(r => r.id === record); if(r) {track=r.trackId;date=r.date;} else record=null; }
  if(!index.tracks.some(t => t.id === track && index.records.some(r => r.trackId === track))) track=null;
  try { if(date) dayNumber(date); } catch { date=null; }
  return {track,date,record};
}
function navigate(track, date, record) {
  if(!selected && track) {
    overviewScroll=scrollY;overviewX=$('viewport').scrollLeft;
    history.replaceState({...history.state, notebook:true, overviewScroll,overviewX,overviewZoom},'');
  }
  if(track && !date) {
    if(selected) date=activeDate;
    // A track opens at its beginning; a dated node opens exactly that day.
    else date=null;
  }
  writeURL(track,date,record);
  renderState({track,date,record},true);
}
function buildMap() {
  const map=$('map-group');
  labelLayer=svg('g',{class:'nb-label-layer'});
  labelLayer.append(svg('rect',{class:'nb-label-gutter',x:0,y:0,width:166,'data-label-gutter':''}));
  const bands=svg('g',{class:'nb-calendar-bands','aria-hidden':'true'});map.append(bands);
  map.append(svg('rect',{class:'nb-axis-panel',x:-54,width:108,rx:24,'data-axis-panel':''}));
  map.append(svg('line',{class:'nb-axis','data-axis':'',x1:0,x2:0}));
  for(let n=bounds.start;n<=bounds.end;n++) {
    const date=isoDay(n), d=new Date(n*DAY), major=d.getUTCDate()===1 || n===bounds.start, week=d.getUTCDay()===1;
    const node=svg('g',{class:`nb-tick${major?' is-month':''}`,'data-date':date});
    const line=svg('line',{class:'nb-tick-line',x1:major?-16:week?-9:-4,x2:major?16:week?9:4});
    const label=svg('text',{x:0,y:-10,'text-anchor':'middle'},major?new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}).format(d):week?String(d.getUTCDate()):'');
    const guide=svg('line',{class:'nb-week-guide'});
    const badge=svg('rect',{class:'nb-month-badge',x:-51,y:-25,width:102,height:32,rx:12});
    if(major) {
      const band=svg('rect',{class:`nb-month-band${months.length%2?' is-alternate':''}`});
      bands.append(band);months.push({date,band});
    }
    node.append(guide,line,...(major?[badge]:[]),label);
    map.append(node);ticks.push({node,line,guide,badge,label,date,major,week});
  }
  for(const [i,track] of index.tracks.entries()) {
    const records=index.records.filter(r => r.trackId===track.id);
    if(!records.length) continue;
    const range=dateBounds(records), dates=[...new Set(records.map(r=>r.date))].sort();
    const g=svg('g',{class:'nb-lane',role:'button',tabindex:0,'aria-label':`${track.label}: ${formatDate(isoDay(range.start))} to ${formatDate(isoDay(range.end))}, ${records.length} records`,'data-track':track.id});
    g.style.color=track.color;
    const title=svg('title',{},g.getAttribute('aria-label'));
    const wash=svg('path',{class:'nb-track-wash',stroke:'currentColor'});
    const hit=svg('path',{class:'nb-lane-hit'}), path=svg('path',{class:'nb-track-line',stroke:'currentColor'});
    const label=svg('text',{class:'nb-line-label','text-anchor':'middle',y:-18},track.label);
    const labelWidth=Math.max(68,track.label.length*9+18);
    const labelPanel=svg('rect',{class:'nb-line-label-panel',x:-labelWidth/2,width:labelWidth,height:30,rx:9,fill:track.color});
    const row=svg('path',{class:'nb-lane-row',stroke:'currentColor',fill:'none'});
    const start=svg('circle',{class:'nb-terminal',r:8}), end=svg('circle',{class:'nb-terminal',r:8});
    g.append(title,row,hit,wash,path,labelPanel,label,start,end);
    const events=dates.map(date=>{
      const target=svg('g',{class:'nb-date-target',role:'button',tabindex:-1,'aria-label':`${track.label}, ${formatDate(date)}`,'data-date':date});
      const entries=records.filter(r=>r.date===date);
      target.setAttribute('aria-label',`${track.label}, ${formatDate(date)}: ${entries.length} ${entries.length===1?'record':'records'}`);
      target.append(svg('title',{},`${track.label} · ${formatDate(date)}\n${entries.map(r=>r.title).join('\n')}`),svg('rect',{class:'nb-date-hit',x:-13,y:-13,width:26,height:26,fill:'transparent'}),svg('circle',{class:'nb-event',r:entries.length>1?6:5.5}));
      target.addEventListener('click',e=>{e.stopPropagation();if(selected===track.id){writeURL(selected,date);jumpTo(date,null,true);}else navigate(track.id,date);});
      target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
      g.append(target);return {date,node:target};
    });
    g.addEventListener('click',()=>navigate(track.id));
    g.addEventListener('keydown',e=>{if(e.target===g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();navigate(track.id);}});
    g.addEventListener('pointerenter',()=>highlight(track.id));g.addEventListener('pointerleave',()=>highlight(null));
    g.addEventListener('focusin',()=>highlight(track.id));g.addEventListener('focusout',()=>highlight(null));
    const heading=svg('g',{class:'nb-lane-heading','data-label-track':track.id});heading.style.color=track.color;
    heading.append(labelPanel,label);labelLayer.append(heading);
    heading.addEventListener('click',()=>navigate(track.id));
    heading.addEventListener('pointerenter',()=>highlight(track.id));heading.addEventListener('pointerleave',()=>highlight(null));
    map.append(g);lanes.push({track,range,g,row,hit,wash,path,label,labelPanel,heading,start,end,events,index:i});
  }
  for (const milestone of index.milestones || []) {
    const node=svg('g',{class:'nb-milestone',role:'button',tabindex:0,'aria-label':milestone.label});
    node.append(svg('title',{},milestone.label),svg('path',{d:'M 0 -9 L 9 0 L 0 9 L -9 0 Z'}));
    const open=()=>{const r=index.records.find(r=>r.id===milestone.recordIds[0]);navigate(r.trackId,r.date,r.id);};
    node.addEventListener('click',open);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    map.append(node);milestones.push({node,data:milestone});
  }
  map.append(labelLayer);
}
function highlight(id) {
  for(const lane of lanes) {lane.g.classList.toggle('is-highlighted',lane.track.id===id);lane.heading.classList.toggle('is-highlighted',lane.track.id===id);lane.g.classList.toggle('is-muted',!!id&&lane.track.id!==id);}
}
function layoutMap() {
  if(!bounds) return;
  const stage=$('stage'),small=innerWidth<=600;
  const base=Math.max($('viewport').clientWidth,small?800:900);
  stage.style.width=selected?'100%':`${208+(base-208)*overviewZoom/100}px`;
  const width=stage.clientWidth;
  $('zoom').value=overviewZoom;$('zoom').setAttribute('aria-valuetext',`${overviewZoom} percent`);
  $('zoom-value').textContent=`${overviewZoom}%`;$('zoom-out').disabled=overviewZoom<=100;$('zoom-in').disabled=overviewZoom>=300;
  $('viewport').classList.toggle('can-pan',!selected&&width>$('viewport').clientWidth);
  // A compact overview exposes every track at once, without compressing calendar dates.
  const height=selected?Math.max(240,$('records').offsetHeight):Math.max(340,Math.min(530,innerHeight-stage.getBoundingClientRect().top-scrollY-20));
  stage.style.height=`${height}px`;
  attr(labelLayer.querySelector('[data-label-gutter]'),{height});pinLabels();
  const axisX=selected?(small?10:innerWidth<=1000?70:100):0;
  $('map-group').style.transform=`translateX(${axisX}px)`;
  const left=176, right=width-32, scale=(right-left)/(bounds.end-bounds.start || 1);
  const x=date=>left+calendarX(date,bounds.start,scale);
  const rows=rowElements.map(row=>({day:dayNumber(row.dataset.date),y:row.offsetTop+row.querySelector('.nb-card').offsetTop+25}));
  const y=date=>focusY(date,rows,height);
  const laneY=lane=>68+lane.index*(height-102)/Math.max(1,lanes.length-1);
  attr(app.querySelector('[data-axis]'),selected?{x1:0,x2:0,y1:24,y2:height-28}:{x1:left,x2:right,y1:43,y2:43});
  app.querySelector('[data-axis-panel]').style.display='none';
  for(const [i,month] of months.entries()) {
    const start=x(month.date),end=months[i+1]?x(months[i+1].date):right;
    attr(month.band,{x:start,y:44,width:Math.max(0,end-start),height:height-60});
  }
  for(const tick of ticks) {
    const inFocus=groups.some(g=>g.date===tick.date);
    tick.node.style.display=selected&&!inFocus?'none':'';
    tick.node.setAttribute('transform',selected?`translate(0 ${y(tick.date)})`:`translate(${x(tick.date)} 43)`);
    tick.label.textContent=selected?shortDate(tick.date):tick.major?new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(new Date(dayNumber(tick.date)*DAY)).toUpperCase():'';
    if(selected) {
      attr(tick.line,{x1:-8,x2:8,y1:0,y2:0});
      attr(tick.label,{x:small?0:-20,y:4,'text-anchor':'end'});
    } else {
      const monthIndex=months.findIndex(m=>m.date===tick.date);
      const end=monthIndex>=0&&months[monthIndex+1]?x(months[monthIndex+1].date):right;
      attr(tick.label,{x:tick.major?(end-x(tick.date))/2:0,y:-18,'text-anchor':'middle'});
      attr(tick.line,{x1:0,x2:0,y1:0,y2:tick.major?8:tick.week?5:2});
    }
    tick.badge.style.display='none';
    attr(tick.guide,{x1:0,x2:0,y1:0,y2:height-60});
    tick.guide.style.display=!selected&&tick.major?'':'none';
  }
  for(const lane of lanes) {
    const rowY=laneY(lane), startDate=isoDay(lane.range.start),endDate=isoDay(lane.range.end);
    lane.g.style.transform='none';
    const start=selected?{x:0,y:y(startDate)}:{x:x(startDate),y:rowY};
    const end=selected?{x:0,y:y(endDate)}:{x:x(endDate),y:rowY};
    const d=`M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    attr(lane.row,{d:`M ${left} ${rowY} H ${right}`});
    attr(lane.hit,{d});attr(lane.wash,{d});attr(lane.path,{d});
    attr(lane.start,{cx:start.x,cy:start.y});attr(lane.end,{cx:end.x,cy:end.y});
    attr(lane.label,{x:30,y:rowY+5,'text-anchor':'start'});
    attr(lane.labelPanel,{x:18,y:rowY-16,width:142,height:32,rx:9});
    const hidden=!!selected&&lane.track.id!==selected;
    lane.g.style.display=hidden?'none':'';
    lane.g.setAttribute('aria-hidden',String(hidden));lane.g.setAttribute('tabindex',hidden?'-1':'0');
    lane.g.classList.toggle('is-selected',lane.track.id===selected);
    lane.g.setAttribute('aria-pressed',String(lane.track.id===selected));
    for(const event of lane.events) {
      event.node.setAttribute('transform',selected?`translate(0 ${y(event.date)})`:`translate(${x(event.date)} ${rowY})`);
      event.node.setAttribute('tabindex',selected===lane.track.id?'0':'-1');
      const hitWidth=selected?26:Math.max(3,scale);
      attr(event.node.querySelector('.nb-date-hit'),{x:-hitWidth/2,width:hitWidth});
    }
  }
  for(const {node,data} of milestones) {
    const lane=lanes.find(l=>l.track.id===data.trackId);
    node.setAttribute('transform',selected?`translate(0 ${y(data.date)})`:`translate(${x(data.date)} ${lane?laneY(lane):43})`);
    node.style.display=selected&&data.trackId&&data.trackId!==selected?'none':'';
  }
  for(const node of app.querySelectorAll('.nb-connector')) node.remove();
  if(selected)for(const row of rows)$('map-group').prepend(svg('line',{class:'nb-connector',x1:0,x2:$('records').offsetLeft-axisX-8,y1:row.y,y2:row.y}));
}
function makePages(record,body) {
  body.replaceChildren();
  const actions=el('div','nb-source-actions');
  const source=link('Open original PDF ↗',`${sourceURL(record.pdf)}#page=${record.pages[0].number}`);
  source.title=record.originalFilename;
  actions.append(source);body.append(actions);
  const pages=el('div','nb-pages');body.append(pages);
  for(const page of record.pages) {
    const figure=el('figure','nb-pdf-page');
    const full=link('',sourceURL(page.preview));full.setAttribute('aria-label',`Open full-size original page ${page.number}: ${record.title}`);
    const img=el('img');img.alt=`Original Notebook page ${page.number} of ${record.pageCount}: ${record.title}, ${formatDate(record.date)}.`;img.width=page.width;img.height=page.height;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{full.hidden=true;const error=el('p','nb-page-error','This page preview could not load. ');error.append(link('Open the original PDF instead.',`${sourceURL(record.pdf)}#page=${page.number}`));figure.prepend(error);},{once:true});
    img.src=sourceURL(page.preview);full.append(img);
    const caption=el('figcaption','nb-page-caption');caption.append(el('span','',`Source PDF · page ${page.number} of ${record.pageCount}`),link('View full size ↗',sourceURL(page.preview)));
    figure.append(full,caption);pages.append(figure);
  }
}
function makeCard(record) {
  const card=el('article','nb-card');card.id=`record-${record.id}`;card.dataset.track=record.trackId;
  const button=el('button','nb-card-toggle');button.type='button';button.setAttribute('aria-controls',`pages-${record.id}`);
  const title=el('span','nb-card-heading');
  const activities=el('span','nb-card-activities');
  for(const activity of recordActivities(record.title)) activities.append(el('span','nb-activity',activity));
  title.append(activities,el('span','nb-card-title',record.title),el('span','nb-card-meta',`${record.experimenter} · ${record.pageCount} ${record.pageCount===1?'page':'pages'}`));
  const arrow=el('span','nb-chevron'), actionLabel=el('span','','View record');
  const chevron=svg('svg',{viewBox:'0 0 16 16','aria-hidden':'true',focusable:'false'});
  chevron.append(svg('path',{d:'m4 6 4 4 4-4',fill:'none',stroke:'currentColor','stroke-width':1.6,'stroke-linecap':'round','stroke-linejoin':'round'}));
  arrow.append(actionLabel,chevron);button.append(title,arrow);
  const body=el('div','nb-card-body');body.id=`pages-${record.id}`;
  const update=()=>{const isOpen=expanded.has(record.id);actionLabel.textContent=isOpen?'Close record':'View record';card.classList.toggle('is-open',isOpen);button.setAttribute('aria-expanded',String(isOpen));body.hidden=!isOpen;if(isOpen)makePages(record,body);else body.replaceChildren();scheduleLayout();};
  button.addEventListener('click',()=>{if(expanded.has(record.id))expanded.delete(record.id);else expanded.add(record.id);update();});
  card.append(button,body);update();return card;
}
function renderRecords(track) {
  resizeObserver.disconnect();dateObserver?.disconnect();$('records').replaceChildren();rowElements=[];
  for(const group of groups) {
    const row=el('section','nb-day');row.dataset.date=group.date;row.id=`day-${group.date}`;row.setAttribute('aria-label',`${track.label}, ${formatDate(group.date)}`);
    const heading=el('h3','nb-day-label');const time=el('time','',formatDate(group.date));time.dateTime=group.date;heading.append(time);row.append(heading);
    for(const record of group.records) row.append(makeCard(record));
    $('records').append(row);rowElements.push(row);resizeObserver.observe(row);
  }
  resizeObserver.observe($('records'));resizeObserver.observe($('viewport'));
  dateObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(visible.length)setActive(visible[0].target.dataset.date);
  },{rootMargin:'-25% 0px -55% 0px',threshold:0});
  rowElements.forEach(row=>dateObserver.observe(row));
}
function renderState(state,userAction=false) {
  cancelRailMotion();
  const track=index.tracks.find(t=>t.id===state.track), previous=selected;
  const movingLane=lanes.find(l=>l.track.id===(previous||track?.id));
  const from=previous!== (track?.id||null)?captureRail(movingLane):null;
  const scene=from?captureScene(app):null;
  selected=track?.id||null;groups=selected?groupTrack(index.records,selected):[];
  if(state.record)expanded.add(state.record);
  app.classList.toggle('is-focus',!!selected);app.dataset.mode=selected?'focus':'overview';
  // The track directory stays below the overview; the focused reader uses its switcher.
  app.style.setProperty('--track',track?.color||'#3d409b');
  $('back').hidden=!selected;$('jump-label').hidden=!selected;$('switch-label').hidden=!selected;if(selected)$('switch').value=selected;$('focus-heading').hidden=!selected;$('end').hidden=!selected;
  for(const button of $('tracks').children) button.setAttribute('aria-pressed',String(button.dataset.track===selected));
  $('view-label').textContent=track?track.label:'';
  $('status').textContent='';
  if(track) {
    $('viewport').scrollLeft=0;
    $('focus-heading').replaceChildren(el('h2','',track.label),el('p','',track.description));
    $('jump').replaceChildren(...groups.map(g=>{const o=el('option','',formatDate(g.date));o.value=g.date;return o;}));
    renderRecords(track);
    $('end').replaceChildren();
    for(const destination of track.engineeringLinks||[]) {
      const a=el('a','',`${destination.label || 'Explore the Engineering Process'} →`);a.href=new URL(`../../${destination.route.replace(/^\//,'')}`,baseURL).href;$('end').append(a);
    }
    const back=el('button','nb-back','← Return to all tracks');back.type='button';back.addEventListener('click',()=>navigate(null));$('end').append(back);
  } else {
    resizeObserver.disconnect();dateObserver?.disconnect();$('records').replaceChildren();rowElements=[];
    highlight(null);resizeObserver.observe($('viewport'));
  }
  layoutMap();
  const finish=()=>{
    layoutMap();
    if(selected) {
      setActive(state.date||groups[0].date);
      if(state.date||state.record)jumpTo(state.date||groups[0].date,state.record);
      else if(userAction) {
        const nav=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||100;
        window.scrollTo({top:$('focus-heading').getBoundingClientRect().top+scrollY-nav-app.querySelector('.nb-toolbar').offsetHeight-12,behavior:'instant'});
      }
      if(userAction)$('focus-heading').focus({preventScroll:true});
    } else if(previous || history.state?.notebook) {
      window.scrollTo({top:overviewScroll,behavior:'instant'});$('viewport').scrollLeft=overviewX;pinLabels();
      if(userAction)lanes.find(l=>l.track.id===previous)?.g.focus({preventScroll:true});
    }
    if(from && movingLane && (!selected||selected===movingLane.track.id))morphRail(from,captureRail(movingLane),movingLane,app,scene);
  };
  // Commit geometry and scrolling together before painting the moving rail.
  finish();
}
async function init() {
  try {
    const response=await fetch(baseURL);if(!response.ok)throw new Error('Source index request failed.');index=validateIndex(await response.json());bounds=dateBounds(index.records);
    if(!bounds){$('status').textContent='Original notebook records will appear here after they have been verified and indexed.';return;}
    for(const track of index.tracks) {
      const records=index.records.filter(r=>r.trackId===track.id),range=dateBounds(records);if(!range)continue;
      const button=el('button','nb-track-chip');button.type='button';button.dataset.track=track.id;button.style.setProperty('--track',track.color);button.setAttribute('aria-pressed','false');button.title=`${track.description} · ${formatDate(isoDay(range.start))} – ${formatDate(isoDay(range.end))}`;
      const icon=el('span','nb-track-icon');icon.append(createTrackIcon(track.id));
      const title=el('span','nb-track-title',track.label);
      const description=el('span','nb-track-description',track.description);
      const dates=el('span','nb-track-dates',`${shortDate(isoDay(range.start))} — ${shortDate(isoDay(range.end))}`);
      button.append(icon,title,description,dates);button.addEventListener('click',()=>navigate(track.id));button.addEventListener('pointerenter',()=>highlight(track.id));button.addEventListener('pointerleave',()=>highlight(null));$('tracks').append(button);
    }
    $('switch').replaceChildren(...index.tracks.filter(t=>index.records.some(r=>r.trackId===t.id)).map(t=>{const option=el('option','',t.label);option.value=t.id;return option;}));
    $('switch').addEventListener('change',()=>navigate($('switch').value,activeDate));
    buildMap();bindZoom();
    if(history.state?.notebook){overviewScroll=history.state.overviewScroll||0;overviewX=history.state.overviewX||0;overviewZoom=clampZoom(history.state.overviewZoom);}
    $('back').addEventListener('click',()=>navigate(null));
    $('jump').addEventListener('change',()=>{writeURL(selected,$('jump').value);jumpTo($('jump').value,null,true);});
    window.addEventListener('popstate',()=>{if(history.state?.notebook){overviewScroll=history.state.overviewScroll||0;overviewX=history.state.overviewX||0;overviewZoom=clampZoom(history.state.overviewZoom);}renderState(readURL());});
    window.addEventListener('resize',scheduleLayout);
    renderState(readURL());
  } catch(error) {
    console.error('Notebook initialization failed:',error);$('status').replaceChildren(el('span','','The timeline could not load. '),link('Browse the original PDF index.',sourceURL('catalog.html')));
  } finally {app.setAttribute('aria-busy','false');requestAnimationFrame(()=>requestAnimationFrame(()=>app.classList.remove('is-initializing')));}
}
init();
