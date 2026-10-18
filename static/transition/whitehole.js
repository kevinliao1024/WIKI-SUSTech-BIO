/* Vanilla controller, installed without changing any navigation handlers. */
(() => {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const path = url => new URL(url, location.href).pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Project letters on one helical tunnel wall through the particle camera.
  // FOV and camera advance match whitehole-scene.js (62 degrees, 0 → -0.7).
  // Units returned in vh keep the perspective aspect-correct on narrow screens.
  function loadingPose(progress, index) {
    const travel = clamp((progress - 0.10) / 0.86);
    const cameraZ = -0.7 * smooth(0.46, 0.84, progress);
    // Keep the word readable on the wall, then let it pass the camera.
    const depth = 4.8 - 4 * Math.pow(travel, 5);
    const radius = 0.55 + 0.23 * travel;
    const theta = -0.8 + travel * 18.85 - depth * 0.24 + (index - 3) * 0.35;
    const distance = Math.max(0.12, depth + cameraZ + (index - 3) * 0.025);
    const projection = 50 / Math.tan(31 * Math.PI / 180) / distance;
    return {
      x: Math.cos(theta) * radius * projection,
      y: -Math.sin(theta) * radius * projection,
      rotation: -theta * 180 / Math.PI - 90,
      size: 0.22 * projection,
    };
  }

  class TransitionTimeline {
    play(duration, draw) {
      this.cancel();
      return new Promise(resolve => {
        this.resolve = resolve;
        const start = performance.now();
        const tick = now => {
          const p = clamp((now - start) / duration);
          draw(p);
          if (p < 1) this.frame = requestAnimationFrame(tick);
          else { this.resolve = null; resolve(true); }
        };
        draw(0); this.frame = requestAnimationFrame(tick);
      });
    }
    cancel() { cancelAnimationFrame(this.frame); this.resolve?.(false); this.resolve = null; }
  }

  class PageTransitionController {
    constructor(config) {
      this.config = config; this.busy = false; this.generation = 0;
      this.timeline = new TransitionTimeline();
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.overlay = document.createElement('div');
      this.overlay.className = 'wh-overlay'; this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.dataset.renderer = 'css';
      this.overlay.innerHTML = '<div class="wh-backdrop"></div><div class="wh-fallback"></div><div class="wh-seal"></div>' +
        '<svg class="wh-ink-defs" width="0" height="0" aria-hidden="true"><defs>' +
        '<filter id="wh-ink-bleed" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".055 .1" numOctaves="3" seed="7" result="grain"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="grain" scale="3" xChannelSelector="R" yChannelSelector="G" result="ink"/>' +
        '<feGaussianBlur in="ink" stdDeviation=".55" result="bleed"/>' +
        '<feMerge><feMergeNode in="bleed"/><feMergeNode in="ink"/></feMerge></filter></defs></svg>';
      // HTML/CSS only: readable even while the optional GPU module is unavailable.
      const loading = document.createElement('div');
      loading.className = 'wh-loading';
      const word = '<span class="wh-loading__word">' + Array.from('LOADING', (letter, i) =>
        `<span class="wh-loading__letter" style="--wh-letter:${i}"><span class="wh-loading__glyph">${letter}</span></span>`).join('') + '</span>';
      // One continuous word follows the tunnel wall; no duplicate streams.
      loading.innerHTML = `<span class="wh-loading__flight">${word}</span>`;
      this.overlay.append(loading);
      this.loadingLetters = Array.from(loading.querySelectorAll('.wh-loading__letter'));
      document.body.append(this.overlay);
      this.click = event => {
        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        const url = this.eligible(link, event);
        if (!url) return;
        event.preventDefault();
        if (!this.busy) void this.navigate(url);
      };
      document.addEventListener('click', this.click);
      this.keydown = event => {
        if (!this.busy) return;
        if (event.key === 'Escape' && !this.committed) this.reset();
        if (!document.documentElement.hasAttribute('data-wh-preview') && ['Tab', 'Enter', ' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) event.preventDefault();
      };
      document.addEventListener('keydown', this.keydown);
      this.wheel = event => { if (this.busy) event.preventDefault(); };
      document.addEventListener('wheel', this.wheel, { passive: false });
      this.pagehide = () => this.reset(false);
      addEventListener('pagehide', this.pagehide);
      this.motionChange = () => {
        if (this.motion.matches) { this.scene?.dispose(); this.scene = null; }
      };
      this.motion.addEventListener('change', this.motionChange);
      if (config.incoming) void this.arrive(config.incoming);
      else clearTimeout(config.watchdog);
      // Fetch code/shaders while idle; create no idle GPU contexts.
      if (!this.motion.matches && !navigator.connection?.saveData) {
        const preload = () => this.loadScene().catch(() => {});
        if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 2000 });
        else setTimeout(preload, 700);
      }
    }
    eligible(link, event) {
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.hasAttribute('download') || (link.target && link.target !== '_self') ||
          link.closest('[data-wh-exclude]') || link.rel.split(/\s+/).includes('external')) return null;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return null;
      let url; try { url = new URL(href, location.href); } catch { return null; }
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== location.origin ||
          url.username || url.password || path(url) === path(location.href)) return null;
      if (path(url) === path(this.config.home)) return url;
      const homeBase = path(this.config.home).replace(/\/$/, '');
      const prefix = homeBase === '/' ? '/' : `${homeBase}/`;
      if (!url.pathname.startsWith(prefix) && path(url) !== path(this.config.home)) return null;
      const relative = url.pathname.slice(prefix.length).replace(/\/$/, '');
      // Wiki routes are extensionless, single segments (also supports frozen /sustech/ hosting).
      if (relative && !/^[a-z0-9-]+$/i.test(relative)) return null;
      return this.direction(url) === 'light' ? null : url;
    }
    direction(url) {
      const home = value => path(value) === path(this.config.home) || path(value) === path(new URL('next', this.config.home));
      if (home(location.href) && !home(url)) return 'to-light';
      if (!home(location.href) && home(url)) return 'to-home';
      return 'light';
    }
    async loadScene() {
      this.module ||= import(new URL('whitehole-scene.js', this.config.base).href);
      const module = await this.module; await module.PortalShader.load(); return module;
    }
    async prepareScene(token) {
      if (this.motion.matches || navigator.connection?.saveData) return;
      let abandoned = false;
      const work = (async () => {
        const module = await this.loadScene();
        if (token !== this.generation || abandoned || this.motion.matches) return;
        const scene = await module.WhiteHoleScene.create(this.overlay);
        if (token !== this.generation || abandoned) { scene.dispose(); return; }
        this.scene = scene;
      })().catch(() => { this.overlay.dataset.renderer = 'css'; });
      await Promise.race([work, delay(450)]);
      if (!this.scene) abandoned = true;
    }
    preloadDestination(html, url) {
      // Parse inert markup: fetch page assets without running its opening/scripts.
      if (typeof DOMParser === 'undefined') return;
      const page = new DOMParser().parseFromString(html, 'text/html');
      this.preloads ||= [];
      const seen = new Set();
      const base = new URL(page.querySelector('base[href]')?.getAttribute('href') || url.href, url);
      const warm = (value, as, module = false) => {
        if (!value || this.preloads.length >= 48) return;
        let asset; try { asset = new URL(value, base); } catch { return; }
        if (!['http:', 'https:'].includes(asset.protocol) ||
            (asset.origin !== location.origin && asset.hostname !== 'static.igem.wiki')) return;
        const key = `${as}:${asset.href}`;
        if (seen.has(key)) return;
        seen.add(key);
        const link = document.createElement('link');
        link.rel = module ? 'modulepreload' : 'preload'; link.as = as; link.href = asset.href;
        if (module || as === 'font') link.crossOrigin = 'anonymous';
        this.preloads.push(link); document.head.append(link);
      };
      for (const style of page.querySelectorAll('link[rel~="stylesheet"][href]')) warm(style.getAttribute('href'), 'style');
      for (const script of page.querySelectorAll('script[src]')) {
        const type = (script.getAttribute('type') || '').toLowerCase();
        if (!type || ['module', 'text/javascript', 'application/javascript'].includes(type)) {
          warm(script.getAttribute('src'), 'script', type === 'module');
        }
      }
      for (const font of page.querySelectorAll('link[rel="preload"][as="font"][href]')) warm(font.getAttribute('href'), 'font');
      // The first content images can be marked lazy yet enter the first screen.
      // Warm just two of those, then a few explicitly eager images; leave the rest lazy.
      const images = [
        ...Array.from(page.querySelectorAll('main img[src]')).slice(0, 2),
        ...Array.from(page.querySelectorAll('img[src]:not([loading="lazy"])')).slice(0, 2),
      ];
      for (const image of images) warm(image.getAttribute('src'), 'image');
    }
    begin(direction) {
      this.busy = true; this.committed = false; this.directionName = direction;
      this.overlay.dataset.direction = direction; this.overlay.dataset.phase = 'departure';
      this.overlay.setAttribute('data-active', '');
      document.documentElement.dataset.whBusy = '';
      this.notice?.remove();
      this.emit('start', { direction });
      return ++this.generation;
    }
    draw(p, reveal = 0, flowTime) {
      const style = this.overlay.style;
      this.loadingLetters?.forEach((letter, index) => {
        const pose = loadingPose(p, index);
        letter.style.setProperty('--wh-letter-x', `${pose.x}vh`);
        letter.style.setProperty('--wh-letter-y', `${pose.y}vh`);
        letter.style.setProperty('--wh-letter-rotation', `${pose.rotation}deg`);
        // Keep the ink/font raster fixed; scaling a cached glyph avoids per-frame font/filter repaint.
        letter.style.setProperty('--wh-letter-scale', String(pose.size / 6));
      });
      style.setProperty('--wh-train-opacity', String(smooth(0.10, 0.18, p) * (1 - smooth(0.90, 0.97, p))));
      // The train sits in the luminous core: dark ink stays legible there.
      style.setProperty('--wh-train-ink', this.directionName === 'to-home' ? '#f8f7f4' : '#082c60');
      style.setProperty('--wh-opacity', String(smooth(0, 0.13, p) * (1 - reveal)));
      style.setProperty('--wh-scale', String(0.15 + smooth(0.08, 0.6, p) * 1.6 + Math.pow(smooth(0.65, 1, p), 3) * 16));
      style.setProperty('--wh-cover', String(smooth(0.98, 1, p) * (1 - reveal)));
      this.overlay.style.opacity = String(1 - reveal);
      try { this.scene?.render(p, this.directionName, reveal, flowTime); }
      catch { this.scene?.dispose(); this.scene = null; this.overlay.dataset.renderer = 'css'; }
    }
    async ready() {
      // The deferred controller already has parsed content and styles. Offscreen
      // images must not hold the entire page behind a blank cover.
      await Promise.race([document.fonts?.ready || Promise.resolve(), delay(350)]);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    async arrive(state) {
      if (!['to-light', 'to-home'].includes(state.direction)) { this.reset(); return; }
      // Let authored page openings own their arrival without an extra loading act.
      if (state.direction === 'to-light' && document.querySelector('[data-team-opening], [data-design-opening], [data-wh-own-opening]')) {
        this.reset(); return;
      }
      const token = this.begin(state.direction);
      this.overlay.dataset.phase = 'arrival';
      this.draw(1);
      // The parser-time shield overlaps the real overlay for one paint.
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (token !== this.generation) return;
      document.documentElement.removeAttribute('data-wh-cover'); clearTimeout(this.config.watchdog);
      // The outgoing word has left the viewport. Reveal the parsed page promptly.
      if (state.direction === 'to-home') await this.ready();
      if (token !== this.generation) return;
      if (state.direction === 'to-home') await this.prepareScene(token);
      if (token !== this.generation) return;
      this.overlay.dataset.phase = 'reveal';
      const duration = this.motion.matches ? 80 : state.direction === 'to-light' ? 90 : 320;
      await this.timeline.play(duration, p => this.draw(1, smooth(0, 1, p)));
      if (token === this.generation) { this.emit('complete', { direction: state.direction }); this.reset(); }
    }
    async navigate(value) {
      if (this.busy) return false;
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return false;
      const direction = this.direction(url);
      if (direction === 'light') { location.assign(url.href); return true; }
      const token = this.begin(direction);
      this.abort = new AbortController(); const signal = this.abort.signal;
      const timeout = setTimeout(() => this.abort?.abort(), 8000);
      // Check the destination while the animation runs. A failed fetch returns to the current page.
      let destinationSettled = false;
      const destination = fetch(url.href, { signal, credentials: 'same-origin', headers: { Accept: 'text/html' } })
        .then(response => {
          if (!response.ok || new URL(response.url).origin !== location.origin ||
              !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
          return response.text().then(html => ({ html, url: new URL(response.url) }));
        }).then(page => {
          if (token === this.generation) {
            try { this.preloadDestination(page.html, page.url); } catch { /* Warming is optional. */ }
          }
          return true;
        }).catch(() => false).then(ok => { destinationSettled = true; return ok; });
      // Start the CSS portal immediately; GPU preparation runs alongside it.
      void this.prepareScene(token);
      if (token !== this.generation) { clearTimeout(timeout); return false; }
      const duration = this.motion.matches ? 80 : direction === 'to-light' ? 4200 : 1500;
      // Most of the word's slow orbit is unchanged; reserve only a short exit.
      const handoff = direction === 'to-light' && !this.motion.matches ? 0.94 : 1;
      const completed = await this.timeline.play(duration * handoff, p => this.draw(p * handoff));
      if (!completed || token !== this.generation) { clearTimeout(timeout); return false; }
      if (!destinationSettled && handoff < 1) {
        // A slow response must not freeze the white-ray frame. Keep the wall flowing.
        const waitingSince = performance.now();
        const flow = now => {
          if (token !== this.generation) return;
          this.draw(handoff, 0, handoff * 1.5 + (now - waitingSince) / 1000);
          this.waitFrame = requestAnimationFrame(flow);
        };
        this.waitFrame = requestAnimationFrame(flow);
      }
      const ok = await destination; clearTimeout(timeout); cancelAnimationFrame(this.waitFrame);
      if (token !== this.generation) return false;
      if (!ok) {
        this.emit('error', { url: url.href }); this.reset();
        this.showNotice('This page could not be opened. Please try again.'); return false;
      }
      if (handoff < 1) {
        const exited = await this.timeline.play(70, p => this.draw(handoff + (1 - handoff) * p));
        if (!exited || token !== this.generation) return false;
      }
      this.overlay.dataset.phase = 'covered'; this.scene?.dispose(); this.scene = null;
      const state = { version: 1, direction, to: url.href, created: Date.now() };
      try { sessionStorage.setItem(this.config.key, JSON.stringify(state)); } catch { /* CSS departure still works. */ }
      this.committed = true; this.emit('navigate', { url: url.href, direction });
      // Browser navigation failure or cancellation must never trap the current document.
      this.escapeTimer = setTimeout(() => this.reset(), 6000);
      try { location.assign(url.href); } catch { this.reset(); }
      return true;
    }
    reset(clearPending = true) {
      ++this.generation; this.timeline.cancel(); cancelAnimationFrame(this.waitFrame);
      this.abort?.abort(); this.abort = null;
      this.preloads?.forEach(link => link.remove()); this.preloads = [];
      clearTimeout(this.escapeTimer); clearTimeout(this.config.watchdog);
      this.scene?.dispose(); this.scene = null;
      this.overlay.removeAttribute('data-active'); this.overlay.style.opacity = '';
      this.overlay.dataset.phase = 'idle'; this.overlay.style.setProperty('--wh-cover', '0');
      document.documentElement.removeAttribute('data-wh-cover');
      document.documentElement.removeAttribute('data-wh-busy');
      this.busy = false; this.committed = false;
      if (clearPending) try { sessionStorage.removeItem(this.config.key); } catch { /* optional */ }
    }
    showNotice(message) {
      this.notice?.remove(); this.notice = document.createElement('div');
      this.notice.className = 'wh-notice'; this.notice.setAttribute('role', 'status');
      this.notice.textContent = message; document.body.append(this.notice);
      setTimeout(() => this.notice?.remove(), 5000);
    }
    emit(name, detail) { document.dispatchEvent(new CustomEvent(`whitehole:${name}`, { detail })); }
    destroy() {
      this.reset(); document.removeEventListener('click', this.click);
      document.removeEventListener('keydown', this.keydown); document.removeEventListener('wheel', this.wheel);
      removeEventListener('pagehide', this.pagehide); this.motion.removeEventListener('change', this.motionChange);
      this.overlay.remove(); this.notice?.remove();
    }
  }
  window.ORCAWhiteHoleClasses = { TransitionTimeline, PageTransitionController, loadingPose };
  const config = window.__orcaWhiteHole;
  if (config && !document.documentElement.hasAttribute('data-wh-preview')) {
    window.ORCAWhiteHole = new PageTransitionController(config);
  }
})();
