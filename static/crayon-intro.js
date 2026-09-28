/* Draw real SVG geometry. Scrolling interrupts the opening without locking input. */
(() => {
  const scene = document.querySelector('.brain-journey');
  const title = scene?.querySelector('[data-crayon-title]');
  const brain = scene?.querySelector('[data-crayon-brain]');
  if (!title || !brain) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const frozen = new URLSearchParams(location.search).has('rnaProgress');
  const titlePaths = [...title.querySelectorAll('[data-crayon-stroke]')].map(node => ({node, start:+node.dataset.start, duration:+node.dataset.duration, kind:'title', length:node.getTotalLength()}));
  const brainPaths = [...brain.querySelector('.crayon-brain-ink').querySelectorAll('path')].filter(node => !node.closest('defs')).map((node,i) => ({node, start:.5+i*.043, duration:i<5?1.15:.65, kind:'brain', length:node.getTotalLength()}));
  const paths = [...titlePaths,...brainPaths];
  const tips = {title:title.querySelector('[data-crayon-tip]'),brain:brain.querySelector('[data-crayon-tip]')};
  let frame = 0, startTime = null, finished = false;
  const duration = Math.max(...paths.map(p=>p.start+p.duration))*1000;
  function finish() {
    finished = true;
    cancelAnimationFrame(frame);
    paths.forEach(({node}) => { node.style.removeProperty('stroke-dasharray'); node.style.removeProperty('stroke-dashoffset'); node.style.removeProperty('fill-opacity'); node.style.removeProperty('opacity'); });
    Object.values(tips).forEach(tip=>tip.style.opacity='0');
    scene.classList.remove('is-crayon-drawing');
    scene.classList.add('is-crayon-complete');
  }
  if (reduce.matches || frozen || scrollY > 10) { finish(); return; }
  paths.forEach(({node,length}) => {node.style.strokeDasharray=length;node.style.strokeDashoffset=length;node.style.opacity='0';node.style.fillOpacity='0';});
  scene.classList.add('is-crayon-drawing');
  function moveTip(kind,path,progress) {
    const svg = kind === 'title' ? title : brain;
    const point = path.node.getPointAtLength(path.length*progress);
    const matrix = svg.getScreenCTM()?.inverse().multiply(path.node.getScreenCTM());
    if (!matrix) return;
    const p = new DOMPoint(point.x,point.y).matrixTransform(matrix);
    tips[kind].setAttribute('transform',`translate(${p.x},${p.y})`);
    tips[kind].style.opacity='1';
  }
  function draw(time) {
    if (finished) return;
    if (startTime === null) startTime=time;
    const elapsed=(time-startTime)/1000;
    const active={};
    paths.forEach(p=>{
      const progress=Math.max(0,Math.min(1,(elapsed-p.start)/p.duration));
      p.node.style.opacity=progress>0?'1':'0';
      p.node.style.strokeDashoffset=String(p.length*(1-progress));
      p.node.style.fillOpacity=String(Math.max(0,(progress-.25)/.75));
      if(progress>0&&progress<1) active[p.kind]={path:p,progress};
    });
    for(const kind of ['title','brain']) {
      if(active[kind]) moveTip(kind,active[kind].path,active[kind].progress);
      else tips[kind].style.opacity='0';
    }
    if(time-startTime>=duration) finish();
    else frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
  addEventListener('scroll',()=>{if(scrollY>10&&!finished)finish();},{passive:true});
  reduce.addEventListener('change',()=>{if(reduce.matches)finish();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!finished)finish();});
})();
