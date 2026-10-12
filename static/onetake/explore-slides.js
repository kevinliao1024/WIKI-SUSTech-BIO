/* Progressive enhancement: the server-rendered directory works without this file. */
(() => {
  document.querySelectorAll('[data-explore-slides]').forEach((root) => {
    if (root.classList.contains('is-enhanced')) return;
    const deck = root.querySelector('[data-explore-deck]');
    const controls = Array.from(root.querySelectorAll('[data-explore-select]'));
    const panels = Array.from(root.querySelectorAll('[data-explore-panel]'));
    const status = root.querySelector('[data-explore-status]');
    const panelById = new Map(panels.map((panel) => [panel.id, panel]));
    if (!deck || !controls.length || controls.length !== panels.length ||
        controls.some((control) => !panelById.has(control.dataset.exploreSelect))) return;

    const select = (control, announce = true) => {
      const selectedId = control.dataset.exploreSelect;
      controls.forEach((item) => item.setAttribute('aria-pressed', String(item === control)));
      panels.forEach((panel) => {
        const inactive = panel.id !== selectedId;
        panel.hidden = inactive;
        // Inactive panels reserve space to avoid scroll jumps, but are never interactive.
        panel.inert = inactive;
      });
      if (announce && status) {
        const panel = panelById.get(selectedId);
        const name = control.querySelector('.explore-slide__name').textContent.trim();
        status.textContent = `${name}: ${panel.querySelectorAll('a').length} pages. Links below.`;
      }
    };

    controls.forEach((control) => control.addEventListener('click', () => select(control)));
    select(controls.find((control) => control.hasAttribute('data-explore-default')) || controls[0], false);
    root.classList.add('is-enhanced');
    deck.hidden = false;
  });
})();
