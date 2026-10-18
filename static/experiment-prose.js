(() => {
  const rules = {
    'docs/project/blueprint.md': /^Cycle [12]\s*[—–-]/,
    'docs/project/results.md': /^Experiment (?:I|II|III)\s*[—–-]/,
  };
  const source = document.querySelector('.markdown-page[data-content-source]');
  const pattern = rules[source?.dataset.contentSource];
  const article = source?.querySelector('.markdown-content');
  if (!pattern || !article) return;

  // Follow heading boundaries so surrounding summaries and references stay unchanged.
  let section = null;
  for (const node of article.children) {
    if (/^H[2-6]$/.test(node.tagName)) {
      const level = Number(node.tagName.slice(1));
      if (node.tagName === 'H3' && pattern.test(node.textContent.trim())) {
        section = { level, id: node.id };
      } else if (section && level <= section.level) section = null;
      continue;
    }
    if (!section) continue;
    const prose = [...node.querySelectorAll('p, li, blockquote')];
    if (node.matches('p, li, blockquote')) prose.unshift(node);
    for (const element of prose) {
      if (!element.closest('figure, figcaption, .figure-caption, table, pre') &&
          !element.querySelector('img, table, pre')) {
        element.classList.add('experiment-prose');
        element.dataset.proseSection = section.id;
      }
    }
  }
})();
