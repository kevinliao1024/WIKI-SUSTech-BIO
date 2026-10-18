// Viewport-space rail morphs preserve date identity while the reader reflows.
let cleanup = null;
const ns='http://www.w3.org/2000/svg';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function cancelRailMotion(){cleanup?.();cleanup=null;}
export function captureRail(lane){
  if(!lane || reduced() || lane.g.closest('.is-initializing'))return null;
  const points=lane.events.map(({date,node})=>{
    const b=node.querySelector('.nb-event').getBoundingClientRect();
    return {date,x:b.x+b.width/2,y:b.y+b.height/2,r:b.width/2};
  });
  const visible=points.some(p=>p.x>=0&&p.x<=innerWidth&&p.y>=0&&p.y<=innerHeight);
  return visible?{points,color:lane.track.color}:null;
}
export function captureScene(app){
  const source=app.querySelector('.nb-timeline'),rect=source.getBoundingClientRect();
  const shell=document.createElement('div');shell.className='notebook-page nb-scene-ghost';shell.setAttribute('aria-hidden','true');shell.inert=true;
  const scene=document.createElement('section');scene.className=app.className;scene.classList.remove('is-morphing');
  scene.style.cssText=app.style.cssText;
  const clone=source.cloneNode(true);clone.style.width=`${rect.width}px`;
  clone.style.position='absolute';clone.style.left=`${rect.left}px`;clone.style.top=`${rect.top}px`;
  clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  scene.append(clone);shell.append(scene);
  return {shell,scroll:app.querySelector('[data-viewport]').scrollLeft};
}
export function morphRail(from,to,lane,app,scene){
  cancelRailMotion();
  if(!from||!to||reduced())return;
  const svg=document.createElementNS(ns,'svg');
  svg.classList.add('nb-rail-motion');svg.setAttribute('aria-hidden','true');
  svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
  svg.style.color=from.color;
  const path=document.createElementNS(ns,'path');
  path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');
  path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);
  const targets=new Map(to.points.map(p=>[p.date,p]));
  const pairs=from.points.filter(p=>targets.has(p.date)).map(p=>{
    const circle=document.createElementNS(ns,'circle');circle.setAttribute('fill','#fffefc');
    circle.setAttribute('stroke','currentColor');circle.setAttribute('stroke-width','2');svg.append(circle);
    return {from:p,to:targets.get(p.date),circle};
  });
  lane.g.style.visibility='hidden';app.classList.add('is-morphing');
  document.body.append(svg);
  const animations=[];
  if(scene){
    scene.shell.querySelector(`.nb-lane[data-track="${lane.track.id}"]`)?.remove();
    document.body.append(scene.shell);
    scene.shell.querySelector('[data-viewport]').scrollLeft=scene.scroll;
    animations.push(scene.shell.animate([{opacity:1},{opacity:0}],{duration:240,fill:'forwards',easing:'ease-out'}));
  }
  // Content waits briefly for the rail, then joins it rather than appearing abruptly.
  const content=app.classList.contains('is-focus')?[app.querySelector('[data-records]'),app.querySelector('[data-focus-heading]')]:[app.querySelector('[data-map]')];
  for(const node of content)animations.push(node.animate([{opacity:0},{opacity:1}],{duration:340,delay:180,fill:'backwards',easing:'ease-out'}));
  let frame,finished=false;
  const finish=()=>{
    if(finished)return;finished=true;cancelAnimationFrame(frame);
    svg.remove();scene?.shell.remove();lane.g.style.visibility='';app.classList.remove('is-morphing');
    animations.forEach(a=>a.cancel());
    window.removeEventListener('resize',finish);window.removeEventListener('wheel',finish);window.removeEventListener('touchstart',finish);
    if(cleanup===finish)cleanup=null;
  };
  cleanup=finish;
  window.addEventListener('resize',finish,{once:true});window.addEventListener('wheel',finish,{once:true,passive:true});window.addEventListener('touchstart',finish,{once:true,passive:true});
  const start=performance.now(),duration=620;
  const clamp=y=>Math.max(-80,Math.min(innerHeight+80,y));
  const entering=Math.abs(to.points[0].x-to.points.at(-1).x)<1;
  const vertical=entering?to.points:from.points;
  const first=Date.parse(from.points[0].date),span=Date.parse(from.points.at(-1).date)-first||1;
  // Rotate as one straight rail first, then unfold the variable-height record spacing.
  // Reversing the same two phases gathers the reader rail before returning it to its row.
  for(const pair of pairs){
    const fraction=(Date.parse(pair.from.date)-first)/span;
    pair.middle={x:vertical[0].x,y:clamp(vertical[0].y)+(clamp(vertical.at(-1).y)-clamp(vertical[0].y))*fraction};
  }
  const visible=p=>p.y>=0&&p.y<=innerHeight&&p.x>=0&&p.x<=innerWidth?1:0;
  const draw=now=>{
    const t=Math.min(1,(now-start)/duration),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const points=pairs.map(({from:a,to:b,middle,circle})=>{
      let begin,end,progress;
      if(entering){
        [begin,end,progress]=e<.7?[a,middle,e/.7]:[middle,b,(e-.7)/.3];
      }else{
        [begin,end,progress]=e<.3?[a,middle,e/.3]:[middle,b,(e-.3)/.7];
      }
      const x=begin.x+(end.x-begin.x)*progress,y=clamp(begin.y)+(clamp(end.y)-clamp(begin.y))*progress;
      circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r',a.r+(b.r-a.r)*e);
      circle.style.opacity=String(visible(a)+(visible(b)-visible(a))*e);
      return `${x} ${y}`;
    });
    path.setAttribute('d',points.length?`M ${points.join(' L ')}`:'');
    path.setAttribute('stroke-width',3.5);
    if(t<1)frame=requestAnimationFrame(draw);else finish();
  };
  draw(start);
}
