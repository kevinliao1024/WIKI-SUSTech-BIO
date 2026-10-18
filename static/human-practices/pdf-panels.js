/* Quiet, resizable previews rendered from the unchanged source PDFs. */
(() => {
  const base = new URL('pdf-previews/', document.currentScript.src);
  const links = [...document.querySelectorAll('.hp-manuscript a[href]')].filter(link => /\/attachments\/[^/]+\.pdf(?:[?#]|$)/i.test(link.href));
  if (!links.length) return;

  function sourceDetails(link) {
    const filename = decodeURIComponent(new URL(link.href).pathname.split('/').pop());
    const title = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    const paragraph = link.closest('p');
    const anchor = paragraph && paragraph.children.length === 1 && paragraph.textContent.trim() === link.textContent.trim() ? paragraph : link;
    anchor.classList.add('hp-pdf-source');
    link.textContent = 'Download original PDF';
    link.setAttribute('aria-label', `Download original PDF: ${title}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    return { filename, title, anchor };
  }

  const sources = links.map(link => ({link, ...sourceDetails(link)}));
  function build(source, data, index) {
    if (!Array.isArray(data.pages) || !data.pages.length) return;
    if (!data.pages.every(page => page.file && page.width > 0 && page.height > 0)) return;
    const {anchor, title} = source;
    const panel = document.createElement('section');
    panel.className = 'hp-pdf-preview';
    panel.setAttribute('aria-label', `PDF preview: ${title}`);
    const viewport = document.createElement('div');
    viewport.className = 'hp-pdf-viewport';
    viewport.id = `hp-pdf-pages-${index}`;
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', `${title}. Scroll to read the PDF pages.`);
    const pages = document.createElement('div');
    pages.className = 'hp-pdf-pages';
    for (const [pageIndex, page] of data.pages.entries()) {
      const wrap = document.createElement('div');
      wrap.className = 'hp-pdf-page';
      const image = document.createElement('img');
      image.alt = `${title}, page ${pageIndex + 1} of ${data.pages.length}`;
      image.width = page.width;
      image.height = page.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        panel.hidden = true;
        anchor.hidden = false;
      }, {once: true});
      image.src = new URL(page.file, base);
      wrap.append(image);
      pages.append(wrap);
    }
    viewport.append(pages);
    const resize = document.createElement('div');
    resize.className = 'hp-pdf-resize';
    resize.tabIndex = 0;
    resize.setAttribute('role', 'separator');
    resize.setAttribute('aria-orientation', 'horizontal');
    resize.setAttribute('aria-controls', viewport.id);
    resize.setAttribute('aria-label', 'Resize PDF preview. Drag or use the up and down arrow keys.');
    resize.setAttribute('aria-valuemin', '240');
    resize.setAttribute('aria-valuemax', '900');
    function setHeight(height) {
      const value = Math.round(Math.max(240, Math.min(900, height)));
      viewport.style.height = `${value}px`;
      resize.setAttribute('aria-valuenow', String(value));
    }
    let drag;
    resize.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      drag = {y: event.clientY, height: viewport.clientHeight};
      resize.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    resize.addEventListener('pointermove', event => {
      if (drag) setHeight(drag.height + event.clientY - drag.y);
    });
    const endDrag = () => { drag = null; };
    resize.addEventListener('pointerup', endDrag);
    resize.addEventListener('pointercancel', endDrag);
    resize.addEventListener('lostpointercapture', endDrag);
    resize.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      setHeight(event.key === 'Home' ? 240 : event.key === 'End' ? 900 : viewport.clientHeight + (event.key === 'ArrowUp' ? -40 : 40));
    });
    panel.append(viewport, resize);
    anchor.before(panel);
    anchor.hidden = true;
    resize.setAttribute('aria-valuenow', String(viewport.clientHeight));
  }

  fetch(new URL('manifest.json', base)).then(response => {
    if (!response.ok) throw new Error('PDF preview manifest unavailable');
    return response.json();
  }).then(manifest => sources.forEach((source, index) => {
    if (manifest[source.filename]) build(source, manifest[source.filename], index);
  })).catch(() => {
    // English source links remain visible when preview enhancement is unavailable.
  });
})();
