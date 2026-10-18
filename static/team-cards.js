/* Each card stays readable as two stacked faces until enhancement succeeds. */
(() => {
  const cards = [...document.querySelectorAll('[data-member-card]')];
  const fits = new ResizeObserver(entries => {
    for (const { target } of entries) fitCard(target);
  });

  function fitText(text, box, initial, minimum, maxHeight) {
    if (!text || !box.clientWidth) return;
    let size = box.clientWidth * initial;
    text.style.fontSize = `${size}px`;
    const floor = box.clientWidth * minimum;
    while (size > floor && (text.scrollWidth > box.clientWidth + 1 || text.scrollHeight > maxHeight + 1)) {
      size -= 1;
      text.style.fontSize = `${size}px`;
    }
  }

  function fitCard(card) {
    const name = card.querySelector('[data-fit-name]');
    const quote = card.querySelector('[data-fit-quote]');
    const quoteBox = quote.closest('.member-card__quote');
    fitText(name, name.parentElement, .29, .075, name.parentElement.clientHeight);
    fitText(quote, quoteBox, .16, .045, quoteBox.clientHeight * (quoteBox.querySelector('small') ? .65 : .86));
  }

  for (const card of cards) {
    const button = card.querySelector('[data-card-toggle]');
    const front = card.querySelector('[data-card-front]');
    const back = card.querySelector('[data-card-back]');
    const photo = card.querySelector('.member-card__photo');
    const name = card.dataset.memberName;
    const rolesId = card.querySelector('.member-card__roles').id;
    const leaderId = card.querySelector('[data-card-leader]')?.id;
    const frontDescription = [leaderId, rolesId].filter(Boolean).join(' ');
    const quoteId = card.querySelector('.member-card__quote').id;
    const flip = flipped => {
      card.classList.toggle('is-flipped', flipped);
      button.setAttribute('aria-pressed', String(flipped));
      button.setAttribute('aria-label', flipped ? `Show ${name} portrait` : `Flip ${name} card`);
      button.setAttribute('aria-describedby', flipped ? quoteId : frontDescription);
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
    };
    const canHover = matchMedia('(hover:hover) and (pointer:fine)');
    if (canHover.matches) {
      card.addEventListener('pointerenter', () => flip(true));
      card.addEventListener('pointerleave', () => {
        if (document.activeElement !== button) flip(false);
      });
    }
    button.addEventListener('click', () => flip(button.getAttribute('aria-pressed') !== 'true'));
    card.addEventListener('click', event => {
      if (card.classList.contains('is-flipped') && !event.target.closest('[data-card-toggle]')) flip(false);
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape') { flip(false); event.preventDefault(); }
    });
    if (photo) {
      const missing = () => {
        photo.hidden = true;
        card.querySelector('.member-card__missing').hidden = false;
        card.querySelector('[data-photo-status]').textContent = 'Portrait unavailable';
      };
      photo.addEventListener('error', missing);
      if (photo.complete && !photo.naturalWidth) missing();
    }
    card.classList.add('is-ready');
    button.hidden = false;
    flip(false);
    fits.observe(card);
    fitCard(card);
  }
  const flipHint = document.querySelector('[data-flip-hint]');
  if (cards.length && flipHint) flipHint.hidden = false;
  document.fonts.ready.then(() => cards.forEach(fitCard));
})();
