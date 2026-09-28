/* Scene 04 — APOE4 protein burden.
   One neuron, three expression states, protein load rising underneath it. */
(() => {
  'use strict';

  const api = window.OrcaScrub;
  if (!api) return;

  const { between, smooth, easeOut, fadeWindow } = api;
  const falling = Array.from(document.querySelectorAll('[data-protein-rain] .protein-drop'));

  api.create({
    scene: '[data-protein-scene]',
    viewport: '[data-protein-viewport]',
    property: '--protein-progress',
    param: 'proteinProgress',
    progress: document.querySelector('.protein-scene__progress b'),
    labelNode: document.querySelector('[data-protein-status] b'),
    label: (p) => (p < .38 ? 'Rising' : p < .72 ? 'Sustained' : 'Overwhelmed'),
    phase: (p) => (p < .3 ? 'arrive' : p < .64 ? 'load' : 'burden'),
    refs: {
      copy: '[data-protein-copy]',
      bridge: '[data-protein-bridge]',
      wave: '[data-protein-wave]',
      spine: '[data-protein-spine]',
      neuron: '[data-protein-neuron]',
      load: '[data-protein-load]',
      drift: '[data-protein-drift]',
      title: '[data-protein-title]',
      calm: '[data-protein-state="calm"]',
      strained: '[data-protein-state="strained"]',
      burdened: '[data-protein-state="burdened"]',
    },
    render(p, refs) {
      const copyIn = easeOut(between(p, .02, .16));
      if (refs.copy) {
        refs.copy.style.opacity = copyIn.toFixed(3);
        refs.copy.style.transform = `translate3d(0, ${(1 - copyIn) * 20}px, 0)`;
      }

      if (refs.wave) {
        refs.wave.style.transform = `translate3d(-50%, ${(1 - easeOut(between(p, .0, .3))) * 70}px, 0)`;
      }

      if (refs.bridge) {
        const retreat = smooth(between(p, .03, .27));
        refs.bridge.style.opacity = (.96 * (1 - retreat)).toFixed(3);
        refs.bridge.style.transform = `translate3d(-50%, ${(-retreat * 96).toFixed(2)}px, 0) rotate(180deg)`;
      }

      const travel = Math.max(760, window.innerHeight * 1.08);
      falling.forEach((node) => {
        const start = Number.parseFloat(node.dataset.start || '0');
        const end = Number.parseFloat(node.dataset.end || '.6');
        const drift = Number.parseFloat(node.dataset.drift || '0');
        const spin = Number.parseFloat(node.dataset.spin || '0');
        const fall = smooth(between(p, start, end));
        const visible = fadeWindow(p, start, start + .035, end - .06, end);
        const y = -110 + fall * travel;
        node.style.opacity = (visible * .92).toFixed(3);
        node.style.transform = `translate3d(calc(-50% + ${(drift * fall).toFixed(2)}px), ${y.toFixed(2)}px, 0) rotate(${(spin * fall).toFixed(2)}deg) scale(${(.62 + fall * .28).toFixed(3)})`;
      });

      if (refs.spine) {
        const inSpine = easeOut(between(p, .06, .3));
        refs.spine.style.opacity = (inSpine * .34 * (1 - easeOut(between(p, .66, .9)))).toFixed(3);
      }

      /* The cell fills the frame, then yields ground as the protein takes over. */
      const approach = easeOut(between(p, .04, .34));
      const recede = easeOut(between(p, .6, .96));
      if (refs.neuron) {
        const scale = .74 + approach * .3 - recede * .16;
        refs.neuron.style.transform = `translate3d(-50%, 0, 0) scale(${scale.toFixed(4)})`;
      }

      const calm = fadeWindow(p, .04, .18, .3, .44);
      const strained = fadeWindow(p, .3, .44, .6, .76);
      const burdened = easeOut(between(p, .6, .84));
      [[refs.calm, calm, 1], [refs.strained, strained, 1.015], [refs.burdened, burdened, 1.03]]
        .forEach(([node, opacity, scale]) => {
          if (!node) return;
          node.style.opacity = opacity.toFixed(3);
          node.style.transform = `scale(${(scale - (1 - opacity) * .03).toFixed(4)})`;
        });

      const loadIn = easeOut(between(p, .22, .78));
      if (refs.load) {
        refs.load.style.opacity = (.16 + loadIn * .84).toFixed(3);
        refs.load.style.transform =
          `translate3d(-50%, calc(-50% + ${(1 - loadIn) * 58 - loadIn * 14}px), 0) scale(${(.88 + loadIn * .2).toFixed(4)})`;
      }

      if (refs.drift) {
        const driftIn = easeOut(between(p, .42, .86));
        refs.drift.style.opacity = (driftIn * .72).toFixed(3);
        refs.drift.style.transform =
          `translate3d(-50%, calc(-50% + ${(1 - driftIn) * 90}px), 0) scale(${(.84 + driftIn * .18).toFixed(4)})`;
      }

      if (refs.title) {
        const reveal = smooth(between(p, .52, .78));
        const out = smooth(between(p, .9, 1));
        refs.title.style.opacity = (reveal * (1 - out * .5)).toFixed(3);
        refs.title.style.clipPath = `inset(0 0 ${((1 - reveal) * 100).toFixed(2)}% 0)`;
        refs.title.style.transform = `translate3d(0, ${((1 - reveal) * 16).toFixed(2)}px, 0)`;
      }
    },
  });
})();
