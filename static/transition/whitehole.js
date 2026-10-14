/* Vanilla controller, installed without changing any navigation handlers. */
(() => {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const path = url => new URL(url, location.href).pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
      this.overlay.innerHTML = '<div class="wh-backdrop"></div><div class="wh-fallback"></div><div class="wh-seal"></div>';
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
    begin(direction) {
      this.busy = true; this.committed = false; this.directionName = direction;
      this.overlay.dataset.direction = direction; this.overlay.dataset.phase = 'departure';
      this.overlay.setAttribute('data-active', '');
      document.documentElement.dataset.whBusy = '';
      this.notice?.remove();
      this.emit('start', { direction });
      return ++this.generation;
    }
    draw(p, reveal = 0) {
      const style = this.overlay.style;
      style.setProperty('--wh-opacity', String(smooth(0, 0.13, p) * (1 - reveal)));
      style.setProperty('--wh-scale', String(0.15 + smooth(0.08, 0.6, p) * 1.6 + Math.pow(smooth(0.65, 1, p), 3) * 16));
      style.setProperty('--wh-cover', String(smooth(0.87, 1, p) * (1 - reveal)));
      this.overlay.style.opacity = String(1 - reveal);
      try { this.scene?.render(p, this.directionName, reveal); }
      catch { this.scene?.dispose(); this.scene = null; this.overlay.dataset.renderer = 'css'; }
    }
    async ready() {
      const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => addEventListener('load', resolve, { once: true }));
      await Promise.race([Promise.all([loaded, document.fonts?.ready || Promise.resolve()]), delay(1400)]);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    async arrive(state) {
      if (!['to-light', 'to-home'].includes(state.direction)) { this.reset(); return; }
      const token = this.begin(state.direction);
      this.overlay.dataset.phase = 'arrival';
      this.draw(1);
      // The parser-time shield overlaps the real overlay for one paint.
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (token !== this.generation) return;
      document.documentElement.removeAttribute('data-wh-cover'); clearTimeout(this.config.watchdog);
      await this.ready();
      if (token !== this.generation) return;
      if (state.direction === 'to-home') await this.prepareScene(token);
      if (token !== this.generation) return;
      const duration = this.motion.matches ? 80 : 500;
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
      const destination = fetch(url.href, { signal, credentials: 'same-origin', headers: { Accept: 'text/html' } })
        .then(response => {
          if (!response.ok || new URL(response.url).origin !== location.origin ||
              !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
          return response.text();
        }).then(() => true).catch(() => false);
      await this.prepareScene(token);
      if (token !== this.generation) { clearTimeout(timeout); return false; }
      const duration = this.motion.matches ? 80 : 1500;
      const completed = await this.timeline.play(duration, p => this.draw(p));
      if (!completed || token !== this.generation) { clearTimeout(timeout); return false; }
      this.overlay.dataset.phase = 'covered'; this.scene?.dispose(); this.scene = null;
      const ok = await destination; clearTimeout(timeout);
      if (token !== this.generation) return false;
      if (!ok) {
        this.emit('error', { url: url.href }); this.reset();
        this.showNotice('This page could not be opened. Please try again.'); return false;
      }
      const state = { version: 1, direction, to: url.href, created: Date.now() };
      try { sessionStorage.setItem(this.config.key, JSON.stringify(state)); } catch { /* CSS departure still works. */ }
      this.committed = true; this.emit('navigate', { url: url.href, direction });
      // Browser navigation failure or cancellation must never trap the current document.
      this.escapeTimer = setTimeout(() => this.reset(), 6000);
      try { location.assign(url.href); } catch { this.reset(); }
      return true;
    }
    reset(clearPending = true) {
      ++this.generation; this.timeline.cancel(); this.abort?.abort(); this.abort = null;
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
  window.ORCAWhiteHoleClasses = { TransitionTimeline, PageTransitionController };
  const config = window.__orcaWhiteHole;
  if (config && !document.documentElement.hasAttribute('data-wh-preview')) {
    window.ORCAWhiteHole = new PageTransitionController(config);
  }
})();
