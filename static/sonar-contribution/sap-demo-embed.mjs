// Keep SAP in its own document so the Wiki and app styles cannot interfere.
for (const panel of document.querySelectorAll('[data-sap-embed]')) {
  const button = panel.querySelector('[data-sap-fullscreen]');
  if (!document.fullscreenEnabled || !panel.requestFullscreen) continue;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === panel) await document.exitFullscreen();
      else await panel.requestFullscreen();
    } catch {
      button.textContent = 'Use “Open in a new tab”';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    button.textContent = document.fullscreenElement === panel ? 'Exit full screen' : 'Full screen';
    button.setAttribute('aria-pressed', String(document.fullscreenElement === panel));
  });
}
