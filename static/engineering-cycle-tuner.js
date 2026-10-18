/* Radio-style cycle selector. Titles come directly from the authored headings. */
(() => {
  window.ORCACycleTuner = function (nav) {
    let links = [], viewport, track, needle, previous, next, active = -1;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    function reveal(index, instant = false) {
      const link = links[index];
      if (!link) return;
      const left = link.offsetLeft, right = left + link.offsetWidth;
      if (left < viewport.scrollLeft || right > viewport.scrollLeft + viewport.clientWidth) {
        viewport.scrollTo({ left: left - (viewport.clientWidth - link.offsetWidth) / 2, behavior: instant || reduced.matches ? 'instant' : 'smooth' });
      }
    }
    function choose(index) {
      if (!links[index]) return;
      links[index].click();
      links[index].focus({ preventScroll: true });
    }
    nav.addEventListener('keydown', event => {
      const index = links.indexOf(event.target.closest('[data-engineering-cycle]'));
      if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : null;
      if (target !== null) { event.preventDefault(); choose(target); }
    });
    return {
      render(record, number, overview) {
        const changed = nav.dataset.part !== record.id;
        nav.hidden = !record.cycles.length;
        nav.setAttribute('aria-label', `${record.label} engineering cycles`);
        if (changed) {
          nav.dataset.part = record.id;
          nav.dataset.cycleCount = record.cycles.length;
          nav.classList.add('engineering-cycle-tuner');
          viewport = document.createElement('div');
          viewport.className = 'cycle-tuner-viewport';
          track = document.createElement('div');
          track.className = 'cycle-tuner-track';
          track.style.setProperty('--tuner-count', Math.max(1, record.cycles.length));
          track.dataset.expanded = String(record.cycles.length > 3);
          needle = document.createElement('div');
          needle.className = 'cycle-tuner-needle';
          needle.setAttribute('aria-hidden', 'true');
          links = record.cycles.map(n => {
            const link = document.createElement('a');
            link.dataset.engineeringCycle = n;
            link.href = `#${record.id}-cycle-${n}`;
            const label = document.createElement('strong');
            label.className = 'cycle-tuner-label';
            label.textContent = record.cycleLabels[n];
            const subtitle = document.createElement('small');
            subtitle.className = 'cycle-tuner-subtitle';
            subtitle.textContent = record.cycleSubtitles[n];
            link.setAttribute('aria-label', `${record.label}, ${label.textContent}: ${subtitle.textContent}`);
            link.append(label, subtitle);
            return link;
          });
          track.append(needle, ...links);
          viewport.append(track);
          previous = document.createElement('button');
          next = document.createElement('button');
          for (const [button, delta, symbol, name] of [[previous, -1, '‹', 'Previous cycle'], [next, 1, '›', 'Next cycle']]) {
            button.type = 'button'; button.className = 'cycle-tuner-step';
            button.textContent = symbol; button.setAttribute('aria-label', name);
            button.addEventListener('click', () => choose(active + delta));
          }
          nav.replaceChildren(previous, viewport, next);
          active = -1;
        }
        if (!links.length) return;
        const index = Math.max(0, record.cycles.indexOf(number));
        links.forEach((link, i) => {
          if (i === index && !overview) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        nav.dataset.intro = String(overview);
        track.style.setProperty('--tuner-index', index);
        previous.disabled = index === 0;
        next.disabled = index === links.length - 1;
        if (changed || active !== index) requestAnimationFrame(() => reveal(index, changed));
        active = index;
      },
    };
  };
})();
