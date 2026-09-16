/* Timed arrival → reversible scroll-driven dive. No runtime dependencies. */
(() => {
  'use strict';
  const root = document.querySelector('[data-intro]');
  if (!root) return;
  const menu = document.querySelector('.story-menu-toggle');
  const links = document.querySelector('.story-links');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  }));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Read the media query on configuration, not each frame: polling .matches
  // during emulation can consume Chromium's pending media-query change.
  let motionReduced = reduced.matches;
  const camera = root.querySelector('[data-camera]');
  const neural = root.querySelector('[data-neural]');
  const project = root.querySelector('[data-project]');
  const title = project.querySelector('h1');
  const subtitle = root.querySelector('[data-subtitle]');
  const caption = root.querySelector('[data-path-caption]');
  const scrollCue = root.querySelector('.intro-scroll');
  const chapter = root.querySelector('[data-chapter]');
  const guide = root.querySelector('.intro-guide');
  const path = root.querySelector('#neural-route');
  const paths = new Map();
  // Sample each authored SVG route once; no per-frame DOM geometry queries.
  function geometry(selector) {
    if (!paths.has(selector)) {
      const route = root.querySelector(selector) || path;
      const total = route.getTotalLength();
      paths.set(selector, Array.from({length:601}, (_, i) => {
        const p = route.getPointAtLength(total * i / 600);
        return {x:p.x, y:p.y};
      }));
    }
    return paths.get(selector);
  }
  const optionalNumber = value => value === undefined || value === '' ? null : Number(value);
  const fish = [...root.querySelectorAll('[data-fish]')].map(node => ({
    node, image:node.querySelector('img'), kind:node.dataset.kind,
    originalStyle:node.getAttribute('style') || '',
    index:Number(node.dataset.index), speed:Number(node.dataset.speed),
    delay:Number(node.dataset.delay), wobble:Number(node.dataset.wobble),
    initialX:optionalNumber(node.dataset.initialX), initialY:optionalNumber(node.dataset.initialY),
    rotation:Number(node.dataset.rotation || 0), opacity:Number(node.dataset.opacity || 1),
    samples:geometry(node.dataset.path || '#neural-route')
  }));
  const clamp = x => Math.max(0, Math.min(1, x));
  const phase = (p,a,b) => clamp((p-a)/(b-a));
  const smooth = p => p*p*(3-2*p);
  const cubic = (a,b,c,d,t) => (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
  let width=0, height=0, start=0, range=1, target=0, progress=0, raf=0, inView=true;
  let referenceScale=1, referenceTop=0;
  const ARRIVAL_MS=4000, HANDOFF=.46;
  let arrivalElapsed=0, lastFrame=null, assetsReady=false;
  const finishArrival=()=>{arrivalElapsed=ARRIVAL_MS;};
  const point = (fraction, samples) => {
    const value=clamp(fraction)*600, index=Math.min(599,Math.floor(value)), mix=value-index;
    const a=samples[index], b=samples[index+1];
    return {x:(a.x+(b.x-a.x)*mix)*referenceScale, y:referenceTop+(a.y+(b.y-a.y)*mix)*referenceScale};
  };
  const measure = () => {
    width=root.clientWidth; height=root.querySelector('.intro-stage').clientHeight;
    const navigation=document.querySelector('.story-nav, .site-nav');
    referenceTop=navigation ? navigation.offsetHeight : 0;
    // Fit the complete brain (source y=0..455) below navigation. Never stretch
    // the source or zoom into one fold; the original tail extends below it.
    referenceScale=Math.min(width/712,Math.max(1,Math.min(height,innerHeight)-referenceTop-24)/455);
    document.body.style.setProperty('--intro-stage-height', `${height}px`);
    document.body.style.setProperty('--reference-top', `${referenceTop}px`);
    document.body.style.setProperty('--reference-scale', referenceScale);
    document.body.style.setProperty('--reference-width', `${712*referenceScale}px`);
    document.body.style.setProperty('--reference-height', `${1080*referenceScale}px`);
    start=root.getBoundingClientRect().top+scrollY;
    range=Math.max(1,root.offsetHeight-height);
    target=clamp((scrollY-start)/range);
  };
  function render(scrollProgress, time) {
    const arrival=clamp(arrivalElapsed/ARRIVAL_MS);
    const p=arrival<1 ? HANDOFF*arrival : HANDOFF+(1-HANDOFF)*scrollProgress;
    const mobile=width<=650;
    const cameraTravel=Math.max(0,referenceTop+1048*referenceScale-height*.7);
    const cameraY=smooth(phase(p,.65,1))*cameraTravel;
    camera.style.transform=`translate3d(0,${-cameraY}px,0)`;
    const reveal=smooth(phase(p,.28,.42));
    project.style.opacity=reveal;
    project.style.transform=`translate3d(0,${12*(1-reveal)}px,0)`;
    title.style.letterSpacing=`${.12*(1-reveal)-.035*reveal}em`;
    subtitle.style.opacity=smooth(phase(p,.31,.45));
    const referenceReveal=smooth(phase(p,.28,.42));
    neural.style.opacity=referenceReveal;
    caption.style.opacity=smooth(phase(p,.7,.8));
    chapter.textContent=p<.28?'01 / A new direction':p<.48?'02 / ORCA':p<.65?'03 / Connections':p<.85?'04 / Follow the pathway':'05 / Into the research';
    scrollCue.style.opacity=arrival===1 ? 1-smooth(phase(scrollProgress,.05,.28)) : 0;
    guide.style.opacity=1-smooth(phase(scrollProgress,.85,.95));
    guide.style.pointerEvents=scrollProgress<.95?'auto':'none';
    root.dataset.progress=scrollProgress.toFixed(4);
    root.dataset.autoProgress=arrival.toFixed(4);
    root.dataset.introState=arrival===1?'ready':p<.26?'entering':'revealing';
    for (const f of fish) {
      if ((mobile && ((f.kind==='route' && f.index>=6)||(f.kind==='escort' && f.index>=2))) || (!mobile && width<=1000 && f.kind==='route' && f.index>=8)) continue;
      let x,y,angle=0,opacity=1;
      const wobble=Math.sin(time/700+f.index*1.7)*f.wobble;
      if (f.kind==='leader'||f.kind==='escort') {
        const escort=f.kind==='escort';
        const t=1-(1-phase((p-f.delay)*f.speed,0,.26))**3;
        const endX=(escort?[206,259,306,350][f.index]:28)*referenceScale;
        const endY=referenceTop+(escort?[45,11,50,4][f.index]:82)*referenceScale;
        x=cubic(width*(f.initialX ?? (1.12+f.index*.04)),width*.85,width*.31,endX,t);
        y=cubic(height*(f.initialY ?? (.06+f.index*.03)),height*-.03,height*.42,endY,t);
        x+=escort?Math.sin(time/1100+f.index)*3:0;
        y+=wobble*smooth(phase(p,.2,.28));
        angle=Math.sin(time/1500+f.index)*(escort?2:1);
        // Crossfade into the SAME whale/pod already present in the full plate.
        // Once settled, the reference itself is the final composition.
        opacity=phase(p,0,.025)*(1-referenceReveal);
      } else {
        const q=phase(p-f.delay,.48,.97);
        const location=clamp(q*f.speed);
        const s=point(location,f.samples);
        const ahead=point(Math.min(1,location+.002),f.samples);
        const behind=point(Math.max(0,location-.002),f.samples);
        const dx=ahead.x-behind.x,dy=ahead.y-behind.y;
        angle=Math.atan2(dy,dx)*180/Math.PI-180;
        const normal=Math.atan2(dy,dx)+Math.PI/2;
        const offset=((f.index%3)-1)*10*referenceScale+wobble;
        x=s.x+Math.cos(normal)*offset;
        y=s.y+Math.sin(normal)*offset;
        if(f.initialX!==null) x+=f.initialX*width-f.samples[0].x*referenceScale;
        if(f.initialY!==null) y+=f.initialY*height-referenceTop-f.samples[0].y*referenceScale;
        opacity=phase(p-f.delay,.48,.52);
      }
      f.node.style.opacity=opacity*clamp(f.opacity);
      f.node.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle+f.rotation}deg)`;
    }
  }
  function frame(time) {
    raf=0;
    if(motionReduced||!assetsReady||!inView||document.hidden) {lastFrame=null;return;}
    if(target>.001) finishArrival();
    if(lastFrame!==null) arrivalElapsed=Math.min(ARRIVAL_MS,arrivalElapsed+Math.min(100,time-lastFrame));
    lastFrame=time;
    progress+= (target-progress)*.18;
    if(Math.abs(target-progress)<.0001) progress=target;
    render(progress,time);
    raf=requestAnimationFrame(frame);
  }
  const wake=()=>{if(!raf&&!motionReduced&&inView&&!document.hidden) raf=requestAnimationFrame(frame);};
  function configure() {
    motionReduced=reduced.matches;
    cancelAnimationFrame(raf); raf=0;
    lastFrame=null;
    document.body.classList.toggle('intro-ready',!motionReduced);
    if(motionReduced) {
      measure();
      finishArrival();
      [camera,neural,project,subtitle,caption,scrollCue,guide].forEach(n=>n.removeAttribute('style'));
      fish.forEach(f=>f.node.setAttribute('style',f.originalStyle));
      title.style.removeProperty('letter-spacing');
      root.dataset.progress='static';
      root.dataset.introState='static';
    } else {measure();if(target>.001) finishArrival();progress=target;render(progress,0);wake();}
  }
  addEventListener('scroll',()=>{target=clamp((scrollY-start)/range);if(target>.001) finishArrival();wake();},{passive:true});
  addEventListener('resize',()=>{measure();wake();},{passive:true});
  document.addEventListener('visibilitychange',()=>{lastFrame=null;wake();});
  reduced.addEventListener('change',configure);
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;lastFrame=null;wake();},{rootMargin:'150px'}).observe(root);
  configure();
  // Decode real artwork before timing its entrance; a failed image must not
  // prevent visitors from reaching the content or using the skip link.
  Promise.all([root.querySelector('.reference-plate img'),...fish.filter(f=>f.kind!=='route').map(f=>f.image)].map(img=>img.decode().catch(()=>{}))).then(()=>{
    assetsReady=true;lastFrame=null;wake();
  });
})();
