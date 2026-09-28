(() => {
  'use strict';

  const scene = document.querySelector('[data-rna-opening]');
  if (!scene) return;

  const viewport = scene.querySelector('[data-rna-viewport]');
  const brain = scene.querySelector('[data-journey-brain]');
  const astrocyte = scene.querySelector('[data-journey-astrocyte]');
  const intro = scene.querySelector('[data-journey-intro]');
  const rnaStage = scene.querySelector('[data-journey-rna]');
  const journeySteps = [...scene.querySelectorAll('[data-journey-step]')];
  const journeyLabels = [...scene.querySelectorAll('[data-journey-label]')];
  const source = scene.querySelector('[data-rna-source]');
  const guide = scene.querySelector('[data-rna-guide]');
  const strand = scene.querySelector('[data-rna-strand]');
  const openingCopy = scene.querySelector('.rna-opening__copy');
  const rnaCaption = scene.querySelector('[data-rna-caption]');
  const cue = scene.querySelector('[data-rna-cue]');
  const bases = {
    u: scene.querySelector('[data-rna-base="u"]'),
    focus: scene.querySelector('[data-rna-base="focus"]'),
    c: scene.querySelector('[data-rna-base="c"]'),
  };
  const tissue = scene.querySelector('[data-rna-cell-tissue]');
  const character = scene.querySelector('[data-rna-cell-character]');
  const particles = scene.querySelector('[data-rna-cell-particles]');
  const halo = scene.querySelector('[data-rna-cell-halo]');
  const cellCopy = scene.querySelector('[data-rna-cell-copy]');
  const cellCaption = scene.querySelector('[data-rna-cell-caption]');
  const clearanceCopy = scene.querySelector('[data-rna-clearance-copy]');
  const clearanceStatus = scene.querySelector('[data-rna-clearance-status]');
  const clearanceStates = {
    ready: scene.querySelector('[data-rna-clearance-state="ready"]'),
    strained: scene.querySelector('[data-rna-clearance-state="strained"]'),
    exhausted: scene.querySelector('[data-rna-clearance-state="exhausted"]'),
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const requested = Number.parseFloat(new URLSearchParams(window.location.search).get('rnaProgress'));
  const fixedProgress = Number.isFinite(requested) ? Math.max(0, Math.min(1, requested)) : null;
  scene.toggleAttribute('data-frozen', fixedProgress !== null);

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const between = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  let startY = 0;
  let range = 1;
  let raf = 0;
  let last = -1;

  function renderSideBase(node, progress, revealStart, revealEnd) {
    if (!node) return;
    const reveal = easeOut(between(progress, revealStart, revealEnd));
    const exit = smooth(between(progress, .56, .68));
    const scale = .35 + reveal * .65;
    node.style.opacity = (reveal * (1 - exit)).toFixed(4);
    node.style.transform = `translate3d(-50%, calc(-50% + ${(1 - reveal) * 22 - exit * 24}px), 0) scale(${scale.toFixed(4)})`;
  }

  function render(progressValue, force = false) {
    const total = clamp(progressValue);
    if (!force && Math.abs(total - last) < .0005) return;
    last = total;
    // One pinned camera: brain -> astrocyte -> RNA, then the existing C drop.
    const overall = .32 + .68 * between(total, .52, 1);
    const brainZoom = smooth(between(total, .045, .23));
    const brainOut = smooth(between(total, .15, .245));
    const astroIn = smooth(between(total, .15, .275));
    const astroZoom = smooth(between(total, .31, .465));
    const astroOut = smooth(between(total, .405, .505));
    const rnaIn = smooth(between(total, .405, .51));
    if (brain) {
      brain.style.opacity = (1 - brainOut).toFixed(4);
      const compact = window.innerWidth <= 800;
      const originX = compact ? 53 : 65;
      const originY = compact ? 62 : 49;
      brain.style.left = `${originX + (50 - originX) * brainZoom}%`;
      brain.style.top = `${originY + (50 - originY) * brainZoom}%`;
      brain.style.transform = `translate3d(${-50 - 19.4 * brainZoom}%, ${-50 - 10 * brainZoom}%, 0) scale(${(1 + brainZoom * 5.5).toFixed(4)}) rotate(${(-3 + brainZoom * 8).toFixed(3)}deg)`;
    }
    if (astrocyte) {
      astrocyte.style.opacity = (astroIn * (1 - astroOut)).toFixed(4);
      astrocyte.style.transform = `translate3d(-50%, -50%, 0) scale(${(.38 + astroIn * .62 + astroZoom * 5).toFixed(4)}) rotate(${(10 * (1 - astroIn) - astroZoom * 8).toFixed(3)}deg)`;
    }
    if (intro) {
      const exit = smooth(between(total, .025, .12));
      intro.style.opacity = (1 - exit).toFixed(4);
      intro.style.transform = `translate3d(0, ${-exit * 35}px, 0)`;
    }
    if (rnaStage) {
      rnaStage.style.opacity = rnaIn.toFixed(4);
      rnaStage.style.transform = `scale(${(.68 + .32 * rnaIn).toFixed(4)})`;
    }
    const chapter = total < .19 ? 'brain' : total < .44 ? 'astrocyte' : 'rna';
    journeySteps.forEach(node => node.classList.toggle('is-active', node.dataset.journeyStep === chapter));
    journeyLabels.forEach(node => {
      const label = node.dataset.journeyLabel;
      const alpha = label === 'brain' ? 1 - smooth(between(total,.04,.12)) : label === 'astrocyte' ? astroIn * (1 - smooth(between(total,.32,.4))) : rnaIn * (1 - smooth(between(total,.54,.62)));
      node.style.opacity = alpha.toFixed(4);
    });
    scene.style.setProperty('--journey-progress', total.toFixed(4));
    scene.dataset.journey = chapter;
    scene.style.setProperty('--rna-progress', overall.toFixed(4));

    // The original RNA-to-cell sequence occupies the first 68% of this one
    // continuous viewport. The remaining range adds the clearance response.
    const progress = clamp(overall / .68);

    const strandIn = smooth(between(progress, .08, .24));
    const settle = smooth(between(progress, .42, .56));
    const rnaOut = smooth(between(progress, .58, .72));
    const sourceDrop = smooth(between(progress, .03, .2));
    const sourceOut = smooth(between(progress, .18, .29));

    if (strand) {
      const scaleX = .82 + strandIn * .18;
      const scaleY = 1 - settle * .38;
      const y = -50 + (1 - strandIn) * 8 - rnaOut * 11;
      strand.style.opacity = (Math.min(1, strandIn * 1.25) * (1 - rnaOut)).toFixed(4);
      strand.style.transform = `translate3d(-50%, ${y.toFixed(2)}%, 0) scaleX(${scaleX.toFixed(4)}) scaleY(${scaleY.toFixed(4)})`;
    }

    if (source) {
      source.style.opacity = (1 - sourceOut).toFixed(4);
      source.style.transform = `translate3d(-50%, calc(-50% + ${(sourceDrop * 108).toFixed(2)}px), 0) scale(${(1 - sourceOut * .24).toFixed(4)})`;
    }

    if (guide) {
      const guideIn = smooth(between(progress, .03, .11));
      const guideOut = smooth(between(progress, .15, .26));
      guide.style.opacity = (guideIn * (1 - guideOut)).toFixed(4);
      guide.style.transform = `translate3d(-50%, ${(sourceDrop * 22).toFixed(2)}px, 0)`;
    }

    renderSideBase(bases.u, progress, .27, .37);
    renderSideBase(bases.c, progress, .34, .44);

    if (bases.focus) {
      const reveal = easeOut(between(progress, .2, .31));
      const drop = smooth(between(progress, .58, .79));
      const exit = smooth(between(progress, .73, .84));
      const scale = (.35 + reveal * .65) * (1 - drop * .24);
      bases.focus.style.top = `${(62 - settle * 3).toFixed(3)}%`;
      bases.focus.style.opacity = (reveal * (1 - exit)).toFixed(4);
      bases.focus.style.transform = `translate3d(-50%, calc(-50% + ${(1 - reveal) * 28 + drop * 112}px), 0) scale(${scale.toFixed(4)})`;
      bases.focus.style.boxShadow = `0 0 0 ${12 + drop * 12}px rgba(233,232,255,${(.72 * (1 - exit)).toFixed(3)}), 0 18px 48px rgba(25,20,61,${(.18 * (1 - exit)).toFixed(3)})`;
    }

    if (openingCopy) {
      const fade = smooth(between(progress, .24, .48));
      openingCopy.style.opacity = (1 - fade).toFixed(4);
      openingCopy.style.transform = `translate3d(0, ${(-fade * 22).toFixed(2)}px, 0)`;
    }

    if (rnaCaption) {
      const show = smooth(between(progress, .4, .5));
      const hide = smooth(between(progress, .57, .68));
      rnaCaption.style.opacity = (show * (1 - hide)).toFixed(4);
      rnaCaption.style.transform = `translate3d(-50%, ${(1 - show) * 12 - hide * 14}px, 0)`;
    }

    const tissueIn = easeOut(between(progress, .62, .81));
    const cellIn = easeOut(between(progress, .72, .89));
    const particleIn = smooth(between(progress, .79, .96));
    const copyIn = smooth(between(progress, .8, .94));

    if (tissue) {
      tissue.style.opacity = tissueIn.toFixed(4);
      tissue.style.transform = `translate3d(-50%, ${(1 - tissueIn) * 160}px, 0) scaleX(${(.94 + tissueIn * .06).toFixed(4)})`;
    }

    if (character) {
      const breathe = progress > .92 ? Math.sin((progress - .92) * Math.PI * 8) * .01 : 0;
      character.style.opacity = cellIn.toFixed(4);
      character.style.transform = `translate3d(-50%, ${(1 - cellIn) * 180}px, 0) scale(${(.82 + cellIn * .18 + breathe).toFixed(4)})`;
    }

    if (particles) {
      particles.style.opacity = (particleIn * .88).toFixed(4);
      particles.style.transform = `translate3d(-50%, calc(-50% + ${(1 - particleIn) * 42}px), 0) scale(${(.78 + particleIn * .22).toFixed(4)})`;
    }

    if (halo) {
      halo.style.opacity = (cellIn * .86).toFixed(4);
      halo.style.transform = `translate(-50%, -50%) scale(${(.72 + cellIn * .28).toFixed(4)})`;
    }

    // Finish the Scene 02 heading before Scene 03 begins so the two narrative
    // steps feel sequential even though they share one pinned viewport.
    const cellCopyOut = smooth(between(overall, .6, .68));

    if (cellCopy) {
      cellCopy.style.opacity = (copyIn * (1 - cellCopyOut)).toFixed(4);
      cellCopy.style.transform = `translate3d(0, ${(1 - copyIn) * 20}px, 0)`;
    }

    if (cellCaption) {
      cellCaption.style.opacity = (copyIn * (1 - cellCopyOut)).toFixed(4);
      cellCaption.style.transform = `translate3d(0, ${(1 - copyIn) * 12}px, 0)`;
    }

    const clearanceCopyIn = smooth(between(overall, .69, .78));
    // Clearance has three discrete beats. Each image reaches zero before the
    // next one starts, preventing the hand-drawn characters from ghosting.
    const responseIn = easeOut(between(overall, .66, .73));
    const responseOut = smooth(between(overall, .79, .815));
    const strainedIn = smooth(between(overall, .82, .855));
    const strainedOut = smooth(between(overall, .905, .93));
    const exhaustedIn = easeOut(between(overall, .935, .975));
    const burden = smooth(between(overall, .68, 1));

    if (clearanceStates.ready) {
      const visible = responseIn * (1 - responseOut);
      clearanceStates.ready.style.opacity = visible.toFixed(4);
      clearanceStates.ready.style.transform = `translate3d(${(1 - responseIn) * 90}px, 0, 0) scale(${(.96 + responseIn * .04).toFixed(4)})`;
    }
    if (clearanceStates.strained) {
      const visible = strainedIn * (1 - strainedOut);
      clearanceStates.strained.style.opacity = visible.toFixed(4);
      clearanceStates.strained.style.transform = `translate3d(0, ${(1 - strainedIn) * 18}px, 0) scale(${(.98 + strainedIn * .02).toFixed(4)})`;
    }
    if (clearanceStates.exhausted) {
      clearanceStates.exhausted.style.opacity = exhaustedIn.toFixed(4);
      clearanceStates.exhausted.style.transform = `translate3d(0, ${(1 - exhaustedIn) * 24}px, 0) scale(${(.98 + exhaustedIn * .02).toFixed(4)})`;
    }

    if (clearanceCopy) {
      clearanceCopy.style.opacity = clearanceCopyIn.toFixed(4);
      clearanceCopy.style.transform = `translate3d(0, ${(1 - clearanceCopyIn) * 20}px, 0)`;
    }
    if (clearanceStatus) {
      clearanceStatus.style.opacity = clearanceCopyIn.toFixed(4);
      clearanceStatus.style.transform = `translate3d(0, ${(1 - clearanceCopyIn) * 12}px, 0)`;
      const label = overall < .82 ? 'Recruiting' : overall < .935 ? 'Straining' : 'Overwhelmed';
      const target = clearanceStatus.querySelector('b');
      if (target && target.textContent !== label) target.textContent = label;
    }

    if (character && overall < .68) character.style.filter = '';
    if (character && overall >= .68) {
      character.style.transform = `translate3d(-50%, 0, 0) scale(${(1 - burden * .06).toFixed(4)})`;
      character.style.filter = `saturate(${(1 - burden * .08).toFixed(4)})`;
    }
    if (particles && overall >= .68) {
      particles.style.opacity = (.88 + burden * .12).toFixed(4);
      particles.style.transform = `translate3d(-50%, -50%, 0) scale(${(1 + burden * .16).toFixed(4)}) rotate(${(Math.sin(overall * 18) * burden * .7).toFixed(3)}deg)`;
    }
    if (halo && overall >= .68) halo.style.opacity = (.86 - burden * .32).toFixed(4);

    if (cue) cue.style.opacity = (1 - smooth(between(total, .025, .1))).toFixed(4);
    scene.dataset.phase = overall < .14 ? 'focus' : overall < .39 ? 'rna' : overall < .54 ? 'handoff' : overall < .7 ? 'cell' : overall < .9 ? 'clearance' : 'overwhelmed';
  }

  function measure() {
    const stickyTop = Number.parseFloat(getComputedStyle(viewport).top) || 0;
    startY = scene.getBoundingClientRect().top + window.scrollY - stickyTop;
    range = Math.max(1, scene.offsetHeight - viewport.offsetHeight);
    render(fixedProgress ?? (reducedMotion.matches ? 1 : (window.scrollY - startY) / range), true);
  }

  let previousFrame = 0;
  function update(time) {
    raf = 0;
    if (fixedProgress !== null || reducedMotion.matches) return;
    const target = clamp((window.scrollY - startY) / range);
    const elapsed = previousFrame ? Math.min(64, time - previousFrame) : 16;
    previousFrame = time;
    const current = Math.max(0, last);
    const next = current + (target - current) * (1 - Math.exp(-elapsed / 70));
    render(Math.abs(target - next) < .0005 ? target : next);
    if (Math.abs(target - next) >= .0005) raf = requestAnimationFrame(update);
    else previousFrame = 0;
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  if (fixedProgress === null) window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(measure), { passive: true });
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', measure);
  else reducedMotion.addListener(measure);

  window.addEventListener('orca:return-top', () => {
    if (fixedProgress !== null) return;
    cancelAnimationFrame(raf);
    raf = 0;
    previousFrame = 0;
    render(reducedMotion.matches ? 1 : 0, true);
  });

  measure();
})();
