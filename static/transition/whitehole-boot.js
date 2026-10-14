/* Runs in <head>, before the first page paint. Never imports WebGL here. */
(() => {
  'use strict';
  const script = document.currentScript;
  const key = 'orca.whitehole.v1';
  const root = document.documentElement;
  const canonical = url => new URL(url, location.href).pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  let incoming = null;
  try {
    const pending = JSON.parse(sessionStorage.getItem(key) || 'null');
    const type = performance.getEntriesByType('navigation')[0]?.type;
    if (pending?.version === 1 && ['to-light', 'to-home'].includes(pending.direction) && Date.now() - pending.created < 20000 &&
        Date.now() >= pending.created && canonical(pending.to) === canonical(location.href) &&
        type !== 'reload' && type !== 'back_forward') incoming = pending;
    sessionStorage.removeItem(key);
  } catch { /* Storage can be disabled. Native navigation remains usable. */ }
  if (incoming) root.dataset.whCover = incoming.direction === 'to-home' ? 'home' : 'light';
  const watchdog = setTimeout(() => root.removeAttribute('data-wh-cover'), 4500);
  // Prevent a departure overlay from surviving a bfcache history restoration.
  addEventListener('pageshow', event => {
    if (event.persisted) {
      root.removeAttribute('data-wh-cover');
      window.ORCAWhiteHole?.reset();
    }
  });
  window.__orcaWhiteHole = {
    key, incoming, watchdog,
    base: new URL('.', script.src).href,
    home: new URL(script.dataset.home || '../../', location.href).href,
  };
})();
