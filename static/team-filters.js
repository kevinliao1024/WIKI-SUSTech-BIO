/* Folder filters use the supplied roles of formal members only. */
(() => {
  const members = document.querySelector('#team-members');
  const buttons = [...document.querySelectorAll('[data-team-filter]')];
  if (!members || !buttons.length) return;

  const normalizeRole = role => {
    const normalized = role.trim().toLowerCase();
    return normalized === 'hp' ? 'human practices' : normalized;
  };
  const cards = [...members.querySelectorAll('[data-member-card]')].map(card => ({
    card,
    roles: new Set(JSON.parse(card.dataset.memberRoles || '[]').map(normalizeRole)),
  }));
  if (!cards.length) return;

  const deck = document.querySelector('#team-deck');
  const otherGroups = [...deck.querySelectorAll('.team-category')]
    .filter(group => group !== members)
    .map(group => ({ group, wasHidden: group.hidden }));
  const count = members.querySelector('[data-team-member-count]');
  const empty = members.querySelector('[data-team-filter-empty]');
  const summary = document.querySelector('[data-team-filter-summary]');
  const status = document.querySelector('[data-team-filter-status]');
  const reset = document.querySelector('[data-team-filter-reset]');
  let active = '';

  const show = (label, interacted = true) => {
    active = label;
    const role = normalizeRole(label);
    let visible = 0;
    for (const { card, roles } of cards) {
      card.hidden = Boolean(role && !roles.has(role));
      if (!card.hidden) visible += 1;
    }
    for (const { group, wasHidden } of otherGroups) group.hidden = Boolean(role) || wasHidden;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.teamFilter === label));
    if (count) count.textContent = role ? `${visible} / ${cards.length}` : String(cards.length);
    if (status) status.textContent = role
      ? `${label} · ${visible} of ${cards.length} team members`
      : `All ${cards.length} team members`;
    if (empty) {
      empty.hidden = visible > 0;
      empty.textContent = visible ? '' : `No team members tagged ${label}.`;
    }
    if (reset) reset.hidden = !role;
    if (interacted) deck.classList.add('team-deck--filter-used');
  };

  for (const button of buttons) {
    button.addEventListener('click', () => show(active === button.dataset.teamFilter ? '' : button.dataset.teamFilter));
    button.disabled = false;
  }
  reset?.addEventListener('click', () => {
    const selected = buttons.find(button => button.dataset.teamFilter === active);
    show('');
    selected?.focus();
  });
  show('', false);
  if (summary) summary.hidden = false;
})();
