/* ORCA — white-hole portal transition: the controller.
 *
 * A plain deferred script, mounted once from layout.html. It never turns the
 * wiki into an SPA: every hop is a normal browser navigation. The controller
 * only decides how the old page leaves and how the new one arrives.
 *
 *   dark home  -> light page   "toLight"  white hole, then the flat light world
 *   light page -> dark home    "toDark"   dark entrance, then a bright exit
 *   light page -> light page   "quick"    ~300ms veil and filament
 *
 * The hop is handed across documents through sessionStorage. An inline script
 * in <head> reads it before first paint (see layout.html) and holds the page
 * behind a matching mask; this script then plays the arrival. A direct visit,
 * a reload or back/forward never carries a fresh hop, so they never animate.
 */
(() => {
  const root = document.getElementById('wh');
  if (!root) return;

  const KEY = 'wh:hop';
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = root.querySelector('.wh__canvas');

  /* Must match the normalisation in the <head> script. */
  const norm = (href) => {
    const u = new URL(href, document.baseURI);
    return u.pathname.replace(/\/index\.html$/, '/').replace(/(.)\/$/, '$1') + u.search;
  };

  const darkSet = new Set((root.dataset.dark || '').split('|').filter(Boolean).map(norm));
  const sceneUrl = new URL(root.dataset.scene, document.baseURI).href;
  const here = norm(location.href);
  const darkHere = document.body.classList.contains('ot');

  const FILE = /\.(pdf|zip|rar|7z|gz|png|jpe?g|gif|svg|webp|avif|mp4|webm|mov|mp3|wav|csv|tsv|xlsx?|docx?|pptx?|txt|json|xml|gb|gbk|fasta|fa|pdb|cif)$/i;

  let busy = false;
  let stage = null;
  let failTimer = 0;
  const timers = [];

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  /* ------------------------------------------------------- scene loading -- */

  let scenePromise = null;
  const loadScene = () =>
    scenePromise ||
    (scenePromise = import(sceneUrl).catch((err) => {
      scenePromise = null;
      throw err;
    }));

  let glOK = null;
  const hasWebGL = () => {
    if (glOK === null) {
      try {
        const c = document.createElement('canvas');
        glOK = !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch (e) {
        glOK = false;
      }
    }
    return glOK;
  };

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('wh: scene load timeout')), ms)),
    ]);

  /* Intent-based preloading: the scene module on the first hover over a link
     that would open the portal, and the target document itself. */
  const prefetched = new Set();
  const prefetch = (href) => {
    if (prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };

  /* ------------------------------------------------------- classification -- */

  const classify = (a) => {
    if (a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return null;
    const target = (a.getAttribute('target') || '').toLowerCase();
    if (target && target !== '_self') return null;
    if (/\bexternal\b/i.test(a.getAttribute('rel') || '')) return null;

    let url;
    try {
      url = new URL(a.href, document.baseURI);
    } catch (e) {
      return null;
    }
    if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return null;
    if (norm(url.href) === here) return null; // in-page anchors and self-links
    if (FILE.test(url.pathname) || /\/(static|assets)\//.test(url.pathname)) return null;

    const toDark = darkSet.has(norm(url.href));
    if (darkHere && !toDark) return 'toLight';
    if (!darkHere && toDark) return 'toDark';
    return 'quick';
  };

  /* ------------------------------------------------------------- leaving -- */

  const reset = () => {
    clearTimeout(failTimer);
    while (timers.length) clearTimeout(timers.pop());
    if (stage) {
      try {
        stage.dispose();
      } catch (e) {
        /* ignore */
      }
      stage = null;
    }
    root.className = '';
    root.removeAttribute('style');
    html.classList.remove('wh-pending', 'wh-quick-in');
    busy = false;
  };

  const leave = (href, kind) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ kind, to: norm(href), t: Date.now() }));
    } catch (e) {
      /* private mode: the hop simply arrives without an animation */
    }
    /* If the browser never leaves (offline, blocked, slow server), drop the
       cover so the user is never stranded behind it. */
    failTimer = setTimeout(reset, 8000);
    location.assign(href);
  };

  const show = (...classes) => {
    root.classList.add('is-active', ...classes);
    void root.offsetWidth;
  };

  const quickOut = (href) => {
    root.style.setProperty('--wh-veil-color', darkHere ? 'var(--wh-navy)' : 'var(--wh-warm)');
    show('is-quick', 'is-veil-on');
    root.classList.add('is-shown');
    later(() => leave(href, 'quick'), 170);
  };

  const fallbackOut = (href, kind) => {
    if (kind === 'toLight') {
      root.style.setProperty('--wh-veil-color', 'var(--wh-navy)');
      show('is-fallback', 'is-out', 'is-shown');
      root.classList.add('is-veil-on');
      later(() => leave(href, kind), 1180);
    } else {
      show('is-fallback', 'is-in', 'is-instant', 'is-shown');
      later(() => leave(href, kind), 900);
    }
  };

  const portalOut = async (href, kind) => {
    if (!hasWebGL()) return fallbackOut(href, kind);

    let mod;
    try {
      mod = await withTimeout(loadScene(), 700);
    } catch (e) {
      return fallbackOut(href, kind);
    }

    show('is-instant', 'is-shown');
    stage = await mod.createStage(canvas);
    if (kind === 'toLight') await stage.runOut(1250);
    else await stage.runIn(1150);
    leave(href, kind);
  };

  const go = async (href, kind) => {
    busy = true;
    prefetch(href);
    try {
      if (kind === 'quick') quickOut(href);
      else await portalOut(href, kind);
    } catch (err) {
      console.warn('[wh] transition failed, navigating directly', err);
      leave(href, kind);
    }
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!a || reduce.matches) return;
    if (busy) {
      event.preventDefault(); // a hop is already under way
      return;
    }
    const kind = classify(a);
    if (!kind) return;
    event.preventDefault();
    go(a.href, kind);
  });

  const warm = (event) => {
    const a = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!a || reduce.matches) return;
    const kind = classify(a);
    if (!kind) return;
    prefetch(a.href);
    if (kind !== 'quick' && hasWebGL()) loadScene().catch(() => {});
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm);

  /* The page is leaving: give the GPU back right away. */
  window.addEventListener('pagehide', () => {
    if (stage) {
      try {
        stage.dispose();
      } catch (e) {
        /* ignore */
      }
      stage = null;
    }
  });

  /* Restored from the back/forward cache mid-transition: clear everything. */
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });

  /* ------------------------------------------------------------ arriving -- */

  const hop = window.__whHop;
  window.__whHop = null;

  const arriveLight = () => {
    root.style.setProperty('--wh-veil-color', 'var(--wh-warm)');
    show('is-instant', 'is-shown', 'is-veil-on', 'is-world');
    html.classList.remove('wh-pending');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.classList.remove('is-instant');
        root.classList.add('is-world-play');
        root.style.setProperty('--wh-veil-color', 'var(--wh-warm)');
        later(() => {
          root.querySelector('.wh__veil').style.transition = 'opacity .5s ease';
          root.classList.remove('is-veil-on');
        }, 260);
        later(() => root.classList.add('is-world-out'), 720);
        later(() => root.classList.remove('is-shown'), 900);
        later(reset, 1300);
      }),
    );
  };

  const arriveDark = () => {
    root.style.setProperty('--wh-veil-color', 'var(--wh-navy)');
    show('is-instant', 'is-shown', 'is-veil-on');
    html.classList.remove('wh-pending');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.classList.remove('is-instant');
        root.classList.add('is-exit');
        later(() => {
          root.querySelector('.wh__veil').style.transition = 'opacity .7s ease';
          root.classList.remove('is-veil-on');
        }, 220);
        later(reset, 1150);
      }),
    );
  };

  if (hop && !reduce.matches) {
    try {
      if (hop.kind === 'quick') later(() => html.classList.remove('wh-quick-in'), 420);
      else if (hop.kind === 'toLight') arriveLight();
      else if (hop.kind === 'toDark') arriveDark();
      else reset();
    } catch (err) {
      reset();
    }
  } else {
    html.classList.remove('wh-pending', 'wh-quick-in');
  }
})();
