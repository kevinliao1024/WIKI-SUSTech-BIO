(() => {
  const page = document.querySelector('.content-page');
  if (!page) return;
  const article = page.querySelector('.markdown-content');
  // A local wrapper keeps wide data tables scrollable without widening the page.
  article.querySelectorAll('table').forEach(table => {
    if (table.closest('.content-table, .table-shell')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'content-table';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Scrollable data table');
    table.before(wrapper);
    wrapper.append(table);
  });

  const directories = [...page.querySelectorAll('[data-content-directory]')];
  if (!directories.length) return;
  const headings = [...article.querySelectorAll('h2[id], h3[id]')];
  const mobile = page.querySelector('.content-mobile-directory');
  const groups = [...page.querySelectorAll('[data-content-group]')];
  let currentGroup;
  let scheduled = false;

  function expand(group, open) {
    const children = group.querySelector('.content-subnav');
    const toggle = group.querySelector('.content-group__toggle');
    if (!children || !toggle) return;
    children.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  groups.forEach(group => {
    const toggle = group.querySelector('.content-group__toggle');
    if (!toggle) return;
    toggle.hidden = false;
    expand(group, false);
    toggle.addEventListener('click', () => expand(group, toggle.getAttribute('aria-expanded') !== 'true'));
  });

  const links = [...page.querySelectorAll('[data-content-directory] a')];
  // Markdown TOC labels may contain encoded entities; use the rendered heading.
  links.forEach(link => {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading) link.textContent = heading.textContent;
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (mobile?.contains(link)) mobile.open = false;
    });
  });

  function update() {
    scheduled = false;
    const nav = document.querySelector('.site-nav');
    const top = (nav?.getBoundingClientRect().bottom || 100) +
      (innerWidth <= 760 && mobile ? mobile.querySelector('summary').offsetHeight : 0) + 48;
    let active = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= top) active = heading;
      else break;
    }
    if (!active) return;
    const activeLink = links.find(link => decodeURIComponent(link.hash.slice(1)) === active.id);
    const groupId = activeLink?.closest('[data-content-group]').dataset.contentGroup;
    if (groupId !== currentGroup) {
      groups.forEach(group => {
        // Keep keyboard focus available if the reader has opened another group.
        if (group.contains(document.activeElement) && group.dataset.contentGroup !== groupId) return;
        expand(group, group.dataset.contentGroup === groupId);
      });
      currentGroup = groupId;
    }
    links.forEach(link => {
      const id = decodeURIComponent(link.hash.slice(1));
      const isActive = id === active.id || (link.hasAttribute('data-content-major') && id === groupId);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  update();
})();
