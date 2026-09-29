/* Scene 06 — the turning point.
   The three-lobed protein returns so the cytosine has something to sit on.
   Order: question -> the base is called out -> the page rewinds to the top
   with one corrective pulse -> the middle base reads U instead of C.

   The real rewind calls window.scrollTo(0) once. It is suppressed when
   ?reversalProgress= is present, so a frozen frame can be captured or the
   scene can be inspected without the page jumping under the viewer. */
(() => {
  'use strict';

  const api = window.OrcaScrub;
  if (!api) return;

  const { between, smooth, easeOut } = api;
  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  let rewound = false;
  const frozen = Number.isFinite(
    Number.parseFloat(new URLSearchParams(window.location.search).get('reversalProgress'))
  );

  api.create({
    scene: '[data-reversal-scene]',
    viewport: '[data-reversal-viewport]',
    property: '--reversal-progress',
    param: 'reversalProgress',
    progress: document.querySelector('.reversal-scene__progress b'),
    phase: (p) => (p < .3 ? 'question' : p < .6 ? 'callout' : p < .86 ? 'rewind' : 'corrected'),
    refs: {
      copy: '[data-reversal-copy]',
      sub: '[data-reversal-sub]',
      lobes: '[data-reversal-lobes]',
      spot: '[data-reversal-spot]',
      letter: '[data-reversal-letter]',
      u: '[data-reversal-base="u"]',
      focus: '[data-reversal-base="focus"]',
      c: '[data-reversal-base="c"]',
      rewind: '[data-reversal-rewind]',
      drain: '[data-reversal-drain]',
      flash: '[data-reversal-flash]',
    },
    render(p, refs) {
      const copyIn = easeOut(between(p, .02, .2));
      if (refs.copy) {
        refs.copy.style.opacity = (copyIn * (1 - smooth(between(p, .52, .74)) * .75)).toFixed(3);
        refs.copy.style.transform = `translate3d(0, ${(1 - copyIn) * 24 - smooth(between(p, .52, .74)) * 18}px, 0)`;
      }

      /* The lobes settle in, then shrink back as the base takes the stage. */
      const lobesIn = easeOut(between(p, .08, .34));
      const lobesShrink = easeOut(between(p, .58, .82));
      if (refs.lobes) {
        refs.lobes.style.opacity = (lobesIn * .96).toFixed(3);
        refs.lobes.style.transform =
          `translate3d(-50%, calc(-50% + ${(1 - lobesIn) * 54}px), 0) scale(${(.82 + lobesIn * .18 - lobesShrink * .22).toFixed(4)})`;
      }

      if (refs.spot) {
        const spotIn = easeOut(between(p, .14, .4));
        refs.spot.style.opacity = (spotIn * .5).toFixed(3);
        refs.spot.style.transform =
          `translate3d(-50%, -50%, 0) scale(${(.7 + spotIn * .3 - lobesShrink * .16).toFixed(4)})`;
      }

      /* Side bases ride on the outer lobes; the focus base lands centre. */
      const sideIn = easeOut(between(p, .24, .46));
      [refs.u, refs.c].forEach((node) => {
        if (!node) return;
        node.style.opacity = (sideIn * (1 - smooth(between(p, .7, .88)) * .35)).toFixed(3);
        node.style.transform = `translate3d(-50%, calc(-50% + ${(1 - sideIn) * 26}px), 0) scale(${(.4 + sideIn * .6).toFixed(4)})`;
      });

      const focusIn = easeOut(between(p, .18, .42));
      if (refs.focus) {
        const pulse = Math.sin(clamp01(between(p, .46, .92)) * Math.PI) * 6;
        refs.focus.style.opacity = focusIn.toFixed(3);
        refs.focus.style.transform = `translate3d(-50%, calc(-50% + ${(1 - focusIn) * 30}px), 0) scale(${(.4 + focusIn * .6).toFixed(4)})`;
        refs.focus.style.boxShadow =
          `0 0 0 ${(12 + pulse).toFixed(2)}px rgba(233,232,255,${(.74 + pulse / 100).toFixed(3)}), 0 18px 48px rgba(25,20,61,.2)`;
      }

      /* The letter is the single thing that changes. */
      const flip = clamp01(between(p, .62, .76));
      if (refs.letter) {
        const next = flip > .5 ? 'u' : 'c';
        if (refs.letter.textContent !== next) refs.letter.textContent = next;
        const scale = 1 + Math.sin(flip * Math.PI) * .22;
        refs.letter.style.transform = `scale(${scale.toFixed(4)})`;
        refs.letter.style.opacity = (1 - Math.sin(flip * Math.PI) * .35).toFixed(3);
      }
      if (refs.sub) {
        const text = flip > .5
          ? 'One letter corrected — the edited transcript reads G · U · G'
          : 'One letter decides which protein is made';
        if (refs.sub.textContent !== text) refs.sub.textContent = text;
      }
      const drain = easeOut(between(p, .5, .8));
      if (refs.rewind) refs.rewind.style.opacity = smooth(between(p, .46, .6)).toFixed(3);
      if (refs.drain) refs.drain.style.setProperty('--reversal-drain', (1 - drain).toFixed(4));

      if (refs.flash) {
        const flash = Math.sin(clamp01(between(p, .72, .88)) * Math.PI);
        refs.flash.style.opacity = (flash * .9).toFixed(3);
      }

      /* One real rewind per page load, live only. */
      if (p > .9 && !rewound && !frozen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        rewound = true;
        document.documentElement.dataset.reversed = 'true';
        window.dispatchEvent(new CustomEvent('orca:reversed'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  });
})();
