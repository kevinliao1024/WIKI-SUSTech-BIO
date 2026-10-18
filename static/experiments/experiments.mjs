const root = document.querySelector('[data-experiments]');
if (root) {
  const search = root.querySelector('[data-search]');
  const categories = [...root.querySelectorAll('[data-category]')];
  const groups = [...root.querySelectorAll('[data-group]')];
  const protocols = [...root.querySelectorAll('[data-protocol]')];
  const dialog = root.querySelector('[data-reader]');
  const host = root.querySelector('[data-reader-host]');
  const directory = root.querySelector('.exp-sidebar nav');
  const indicator = root.querySelector('[data-category-indicator]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let category = 'all';
  let returnHash = '#protocol-library';
  let trigger = null;
  const normalize = text => text.toLowerCase().normalize('NFKD').replace(/β/g, 'beta')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const searchIndex = new Map(protocols.map(protocol => [protocol,
    normalize(`${protocol.dataset.searchText} ${protocol.id.replace(/^([A-Z]+)0+(\d+)/, '$1$2')}`),
  ]));
  function updateIndicator() {
    const active = categories.find(link => link.dataset.category === category);
    if (!active) return;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.classList.add('is-visible');
    if (directory.scrollWidth > directory.clientWidth) {
      directory.scrollTo({
        left: Math.max(0, active.offsetLeft - (directory.clientWidth - active.offsetWidth) / 2),
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    }
  }
  function filter() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    const hasQuery = search.value.trim().length > 0;
    let total = 0, allMatches = 0, groupCount = 0;
    for (const protocol of protocols) {
      const matches = !hasQuery || (terms.length > 0 && terms.every(term => searchIndex.get(protocol).includes(term)));
      if (matches) allMatches++;
      const show = (category === 'all' || protocol.dataset.categoryCode === category) && matches;
      protocol.hidden = !show;
      if (show) total++;
    }
    for (const group of groups) {
      const count = [...group.querySelectorAll('[data-protocol]')].filter(p => !p.hidden).length;
      group.hidden = !count;
      if (count) groupCount++;
    }
    for (const link of categories) {
      const active = link.dataset.category === category;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const result = root.querySelector('[data-result-count]');
    const scope = categories.find(link => link.dataset.category === category).textContent.trim();
    result.textContent = hasQuery
      ? `${total} ${total === 1 ? 'match' : 'matches'} for “${search.value.trim()}” · ${scope}`
      : `${total} experiments · ${groupCount} categories`;
    result.classList.toggle('exp-sr-only', !hasQuery);
    root.querySelector('[data-search-clear]').hidden = !search.value;
    root.querySelector('[data-reset]').hidden = !hasQuery && category === 'all';
    const searchAll = root.querySelector('[data-search-all]');
    searchAll.hidden = !hasQuery || category === 'all' || allMatches <= total;
    searchAll.textContent = `Search all categories (${allMatches})`;
    root.querySelector('[data-empty-message]').textContent = allMatches > 0 && category !== 'all'
      ? `No matches in ${scope}. Search all categories to see the other matches.`
      : 'Try another name, experiment ID, or keyword.';
    root.querySelector('[data-empty]').hidden = total !== 0;
    updateIndicator();
  }
  function releaseReader() {
    if (dialog.open) dialog.close();
    host.replaceChildren();
    document.body.classList.remove('exp-reader-open');
  }
  function openReader(protocol) {
    root.querySelector('[data-reader-title]').textContent = protocol.dataset.title;
    root.querySelector('[data-reader-meta]').textContent = `${protocol.id} · Version ${protocol.dataset.version}`;
    for (const a of root.querySelectorAll('[data-reader-original], [data-reader-download]')) a.href = protocol.href;
    root.querySelector('[data-reader-measurement]').hidden = protocol.dataset.categoryCode !== 'RP';
    host.replaceChildren();
    const frame = document.createElement('iframe');
    const sections = root.querySelector('[data-reader-sections]');
    sections.replaceChildren();
    frame.addEventListener('load', () => {
      if (!frame.isConnected) return;
      const content = frame.contentDocument;
      content.documentElement.classList.add('is-embedded');
      for (const source of content.querySelectorAll('.section-links a')) {
        const link = source.cloneNode(true);
        link.href = `${frame.src}${source.hash}`;
        link.addEventListener('click', event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          content.getElementById(source.hash.slice(1))?.scrollIntoView({block:'start'});
        });
        sections.append(link);
      }
    }, {once:true});
    frame.src = protocol.dataset.readerUrl;
    frame.title = `${protocol.id} — ${protocol.dataset.title}`;
    host.append(frame);
    document.body.classList.add('exp-reader-open');
    if (!dialog.open) dialog.showModal();
    root.querySelector('[data-reader-close]').focus({preventScroll:true});
  }
  function showRoute(hash) {
    const group = groups.find(g => `#category-${g.dataset.group}` === hash);
    category = group?.dataset.group || 'all';
    filter();
  }
  function applyHash(scroll = false) {
    const hash = location.hash || '#protocol-library';
    const protocol = protocols.find(p => `#${p.id}` === hash);
    if (protocol) {
      returnHash = history.state?.experimentReturnHash || `#category-${protocol.dataset.categoryCode}`;
      showRoute(returnHash);
      openReader(protocol);
    } else {
      releaseReader();
      showRoute(hash);
      const guide = hash === '#how-to-read' ? root.querySelector('#how-to-read') : null;
      if (guide) guide.open = true;
      if (scroll) {
        const navBottom = document.querySelector('.site-nav')?.getBoundingClientRect().bottom || 100;
        const target = guide || root.querySelector('#experiment-workspace');
        const top = window.scrollY + target.getBoundingClientRect().top - navBottom - 24;
        window.scrollTo({top, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
      }
    }
  }
  function navigate(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    applyHash(true);
  }
  function selectProtocol(protocol, source) {
    trigger = source;
    returnHash = location.hash || '#protocol-library';
    history.pushState({experimentReturnHash:returnHash}, '', `#${protocol.id}`);
    openReader(protocol);
  }
  function closeReader() {
    history.replaceState(null, '', returnHash);
    releaseReader();
    // Keep the query and cards intact when returning from an experiment.
    if (trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus({preventScroll:true});
    trigger = null;
  }
  const ordinaryClick = e => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  root.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', event => {
    if (!ordinaryClick(event)) return;
    event.preventDefault();
    const hash = link.getAttribute('href');
    const protocol = protocols.find(p => `#${p.id}` === hash);
    if (protocol) selectProtocol(protocol, link);
    else navigate(hash);
  }));
  protocols.forEach(protocol => protocol.addEventListener('click', event => {
    if (!ordinaryClick(event)) return;
    event.preventDefault();
    selectProtocol(protocol, protocol);
  }));
  root.querySelector('[data-reader-close]').addEventListener('click', closeReader);
  dialog.addEventListener('cancel', e => { e.preventDefault(); closeReader(); });
  search.addEventListener('input', filter);
  root.querySelector('[data-search-tools]').addEventListener('submit', event => {
    event.preventDefault();
    filter();
  });
  const clearSearch = () => { search.value = ''; filter(); search.focus({preventScroll:true}); };
  root.querySelector('[data-search-clear]').addEventListener('click', clearSearch);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && search.value) { event.preventDefault(); clearSearch(); }
  });
  root.querySelector('[data-search-all]').addEventListener('click', () => navigate('#protocol-library'));
  const reset = () => { search.value = ''; navigate('#protocol-library'); search.focus({preventScroll:true}); };
  root.querySelector('[data-reset]').addEventListener('click', reset);
  root.querySelector('[data-clear]').addEventListener('click', reset);
  window.addEventListener('hashchange', () => applyHash(true));
  root.querySelector('[data-search-tools]').hidden = false;
  applyHash(Boolean(location.hash));
  new ResizeObserver(updateIndicator).observe(directory);
  document.fonts.ready.then(updateIndicator);
}
