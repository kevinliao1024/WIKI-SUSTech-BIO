(() => {
  const names = { arrow: 'A · 细箭头', whale: 'B · 迷你鲸鱼', pearl: 'C · 微光圆点' };
  let clicks = 0;
  document.querySelectorAll('input[name="cursor"]').forEach(input => {
    input.addEventListener('change', () => {
      document.documentElement.dataset.choice = input.value;
      document.getElementById('active-name').textContent = `正在试用 ${names[input.value]}`;
      document.getElementById('feedback').textContent = `已切换为 ${names[input.value]}，移动到按钮上体验原尺寸光标`;
    });
  });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.target.closest('[data-try]')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(forced-colors: active)').matches) return;
    if (document.querySelectorAll('.tap').length >= 4) document.querySelector('.tap').remove();
    const tap = document.createElement('span');
    tap.className = 'tap';
    tap.setAttribute('aria-hidden', 'true');
    tap.style.left = `${event.clientX}px`;
    tap.style.top = `${event.clientY}px`;
    tap.addEventListener('animationend', () => tap.remove(), { once: true });
    document.body.append(tap);
  }, { passive: true });
  document.querySelectorAll('[data-try]').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById('feedback').textContent = `已响应 ${++clicks} 次点击 · ${names[document.documentElement.dataset.choice]}`;
    });
  });
})();
