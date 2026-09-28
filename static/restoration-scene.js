/* Scene 07 — resolution.
   The burdened cell group and the recovered group share one silhouette, so the
   recovery is a crossfade in place rather than a swap. The upright cleaners
   rise back into the frame: clearance is what the correction buys. */
(() => {
  'use strict';

  const api = window.OrcaScrub;
  if (!api) return;

  const { between, smooth, easeOut } = api;

  api.create({
    scene: '[data-restoration-scene]',
    viewport: '[data-restoration-viewport]',
    property: '--restoration-progress',
    param: 'restorationProgress',
    progress: document.querySelector('.restoration-scene__progress b'),
    labelNode: document.querySelector('[data-restoration-label]'),
    label: (p) => (p < .3 ? 'Recovering' : p < .68 ? 'Clearing' : 'Restored'),
    phase: (p) => (p < .24 ? 'burdened' : p < .56 ? 'repair' : p < .82 ? 'clearing' : 'restored'),
    refs: {
      copy: '[data-restoration-copy]',
      tissue: '[data-restoration-tissue]',
      burdened: '[data-restoration-state="burdened"]',
      healthy: '[data-restoration-state="healthy"]',
      cleaners: '[data-restoration-cleaners]',
      stream: '[data-restoration-stream]',
      spine: '[data-restoration-spine]',
      status: '[data-restoration-status]',
    },
    render(p, refs) {
      const copyIn = easeOut(between(p, .02, .18));
      if (refs.copy) {
        refs.copy.style.opacity = copyIn.toFixed(3);
        refs.copy.style.transform = `translate3d(0, ${((1 - copyIn) * 22).toFixed(2)}px, 0)`;
      }

      /* The group settles back as it heals — tension leaving the frame. */
      const settle = easeOut(between(p, .05, .6));
      if (refs.tissue) {
        const scale = .94 + settle * .06;
        refs.tissue.style.transform =
          `translate3d(-50%, calc(-50% + ${((1 - settle) * 26).toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;
      }

      /* The single narrative beat: the same cells, no longer in distress. */
      const recover = smooth(between(p, .18, .62));
      if (refs.burdened) {
        refs.burdened.style.opacity = (1 - recover).toFixed(3);
        refs.burdened.style.filter = `saturate(${(1 + recover * .1).toFixed(3)})`;
        refs.burdened.style.transform = `scale(${(1 - recover * .015).toFixed(4)})`;
      }
      if (refs.healthy) {
        const breathe = recover > .82 ? Math.sin((recover - .82) * Math.PI * 3) * .004 : 0;
        refs.healthy.style.opacity = recover.toFixed(3);
        refs.healthy.style.transform = `scale(${(.985 + recover * .015 + breathe).toFixed(4)})`;
      }

      if (refs.spine) {
        const spineIn = easeOut(between(p, .08, .4));
        refs.spine.style.opacity = (spineIn * .34).toFixed(3);
      }

      /* The cleaners were exhausted in Scene 03. Here they stand back up. */
      const rise = easeOut(between(p, .34, .72));
      if (refs.cleaners) {
        const sway = p > .8 ? Math.sin((p - .8) * Math.PI * 2) * .004 : 0;
        refs.cleaners.style.opacity = (rise * .98).toFixed(3);
        refs.cleaners.style.transform =
          `translate3d(-50%, ${((1 - rise) * 62).toFixed(2)}%, 0) scale(${(.9 + rise * .1 + sway).toFixed(4)})`;
      }

      if (refs.stream) {
        const driftIn = easeOut(between(p, .26, .8));
        refs.stream.style.opacity = (driftIn * .68).toFixed(3);
        refs.stream.style.transform =
          `translate3d(-50%, calc(-50% + ${(1 - driftIn) * 60 - driftIn * 18}px), 0) scale(${(.88 + driftIn * .16).toFixed(4)}) rotate(${(Math.sin(p * 6) * driftIn * .5).toFixed(3)}deg)`;
      }

      if (refs.status) {
        refs.status.style.opacity = smooth(between(p, .12, .3)).toFixed(3);
      }
    },
  });
})();
