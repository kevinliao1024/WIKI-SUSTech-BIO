const root = document.querySelector('[data-experiments]');
if (root) {
  const search = root.querySelector('[data-search]');
  const categories = [...root.querySelectorAll('[data-category]')];
  const groups = [...root.querySelectorAll('[data-group]')];
  const protocols = [...root.querySelectorAll('[data-protocol]')];
  const dialog = root.querySelector('[data-reader]');
  const host = root.querySelector('[data-reader-host]');
  let category = 'all';
  let returnHash = '#protocol-library';
  let trigger = null;
  const normalize = text => text.toLowerCase().normalize('NFKD').replace(/β/g, 'beta').replace(/[\u0300-\u036f]/g, '');
  function filter() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let total = 0, groupCount = 0;
    for (const protocol of protocols) {
      const show = (category === 'all' || protocol.dataset.categoryCode === category)
        && terms.every(term => normalize(protocol.dataset.searchText).includes(term));
      protocol.hidden = !show;
      if (show) total++;
    }
    for (const group of groups) {
      const count = [...group.querySelectorAll('[data-protocol]')].filter(p => !p.hidden).length;
      group.hidden = !count;
      group.querySelector('[data-group-count]').textContent = count;
      if (count) groupCount++;
    }
    for (const link of categories) {
      const active = link.dataset.category === category;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    root.querySelector('[data-result-count]').textContent = `${total} ${total === 1 ? 'experiment' : 'experiments'} · ${groupCount} ${groupCount === 1 ? 'category' : 'categories'}`;
    root.querySelector('[data-empty]').hidden = total !== 0;
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
      if (hash === '#how-to-read') root.querySelector('.exp-guide').open = true;
      if (scroll && hash !== '#how-to-read') {
        const navBottom = document.querySelector('.site-nav')?.getBoundingClientRect().bottom || 100;
        const top = window.scrollY + root.querySelector('#experiment-workspace').getBoundingClientRect().top - navBottom - 24;
        window.scrollTo({top, behavior:'instant'});
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
  const reset = () => { search.value = ''; navigate('#protocol-library'); search.focus({preventScroll:true}); };
  root.querySelector('[data-reset]').addEventListener('click', reset);
  root.querySelector('[data-clear]').addEventListener('click', reset);
  window.addEventListener('hashchange', () => applyHash(true));
  root.querySelector('[data-search-tools]').hidden = false;
  applyHash(Boolean(location.hash));
}
