/* The result groups and their order come directly from the navigation template. */
(() => {
  const search = document.querySelector('[data-wiki-search]');
  if (!search) return;
  const summary = search.querySelector('summary');
  const input = search.querySelector('input');
  const rows = [...search.querySelectorAll('[data-wiki-search-row]')];
  const headings = [...search.querySelectorAll('.wiki-search-group')];
  const empty = search.querySelector('.wiki-search-empty');
  const status = search.querySelector('[role="status"]');
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let count = 0;
    rows.forEach(row => {
      row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
      if (!row.hidden) count += 1;
    });
    headings.forEach(heading => {
      heading.hidden = !rows.some(row => !row.hidden && row.dataset.wikiSearchGroup === heading.dataset.wikiSearchGroup);
    });
    empty.hidden = count > 0;
    status.textContent = `${count} ${count === 1 ? 'page' : 'pages'} found.`;
  };
  const close = (restoreFocus = false) => {
    search.open = false;
    if (restoreFocus) summary.focus({ preventScroll: true });
  };
  summary.addEventListener('click', () => {
    if (search.open) return;
    // Use the existing menu's keyboard dismissal behavior, including cleanup
    // of its particle animation, before the search disclosure opens.
    const activeMenu = search.closest('nav')?.querySelector('.rna-toggle[aria-expanded="true"]');
    if (activeMenu) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
  input.addEventListener('input', filter);
  input.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    const first = rows.find(row => !row.hidden)?.querySelector('a');
    if (first) {
      event.preventDefault();
      first.focus();
    }
  });
  search.addEventListener('toggle', () => {
    if (!search.open) return;
    filter();
    input.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && search.open) {
      event.preventDefault();
      close(true);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (search.open && !search.contains(event.target)) close();
  });
  search.addEventListener('focusout', event => {
    if (search.open && event.relatedTarget && !search.contains(event.relatedTarget)) close();
  });
})();
