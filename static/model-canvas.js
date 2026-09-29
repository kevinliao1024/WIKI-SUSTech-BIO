/* Canvas illustrations. Sequencing signals and binding motion are illustrative. */
(() => {
  const ink = '#39396d', muted = '#9292af', coral = '#dd8794';
  const colors = ['#696ab7', '#de8c99', '#aaa9d2', '#454777'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const canvas of document.querySelectorAll('[data-model-canvas]')) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const card = canvas.closest('.module-card');
    let active = false, progress = 0, time = 0, last = 0, frame = 0, visible = true;
    function line(points, color, width = 1) {
      if (!points.length) return;
      ctx.beginPath(); ctx.moveTo(...points[0]);
      for (const p of points.slice(1)) ctx.lineTo(...p);
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    }
    function text(value, x, y, size = 10, color = muted) {
      ctx.fillStyle = color; ctx.font = `${size}px monospace`; ctx.fillText(value, x, y);
    }
    function dot(x, y, r, color) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    }
    function sequence() {
      text('RNA-seq', 28, 28, 12, ink);
      text('SEQUENCING BY SYNTHESIS', 28, 48, 9);
      // A flow-cell plate with fixed, reproducible cluster positions.
      ctx.fillStyle = '#fffefc'; ctx.strokeStyle = '#b6b5cd'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(28, 70, 424, 128, 8); ctx.fill(); ctx.stroke();
      for (let lane = 0; lane < 4; lane++) {
        const y = 87 + lane * 30;
        line([[44, y], [436, y]], '#efedf5', 17);
        for (let n = 0; n < 25; n++) {
          const x = 50 + n * 15.8;
          const cycle = Math.floor(time / 2.8);
          const passed = (time % 2.8) / 2.8 > n / 25;
          const color = progress > .1 && passed ? colors[(n * 7 + lane * 3 + cycle) % 4] : '#cfccd9';
          dot(x, y + Math.sin(n * 9 + lane * 3) * 4, 2.5, color);
          dot(x + 3, y + 4, 1.3, color);
        }
      }
      if (progress > .01) {
        const x = 44 + (time % 2.8) / 2.8 * 391;
        ctx.globalAlpha = progress;
        ctx.fillStyle = '#6f71c114'; ctx.fillRect(x - 10, 77, 20, 114);
        line([[x, 75], [x, 193]], '#7775b8', 1);
        ctx.globalAlpha = 1;
      }
      const bases = 'A C G T A G C T A C G T';
      text(progress > .1 ? bases.slice(0, 2 + Math.floor(time % 2.8 / 2.8 * 22)) : 'A C G T', 30, 230, 15, ink);
      text(active ? 'READING →' : 'HOVER TO SEQUENCE →', 292, 230, 10, muted);
      text('cDNA library · illustrative cycles', 30, 253, 9);
    }
    function protein() {
      const data = window.ORCA_PUF_STRUCTURE;
      if (!data) return;
      text('PUF / RNA', 28, 28, 12, ink);
      text('STRUCTURAL MODEL', 28, 48, 9);
      const angle = progress * .16;
      function project(p, shift = 0) {
        return [240 + (p[0] * Math.cos(angle) + p[2] * Math.sin(angle)) * 3.05 + shift,
          137 - p[1] * 3.05 - shift * .45];
      }
      const segments = data.protein.slice(1).map((p, i) => ({a:data.protein[i], b:p, i, z:(p[2]+data.protein[i][2])/2})).sort((a,b)=>a.z-b.z);
      for (const s of segments) {
        const depth = Math.max(0, Math.min(1, (s.z + 22) / 44));
        const shade = Math.round(72 + depth * 74);
        const a = project(s.a), b = project(s.b);
        const before = project(data.protein[Math.max(0, s.i - 1)]);
        const after = project(data.protein[Math.min(data.protein.length - 1, s.i + 2)]);
        ctx.beginPath(); ctx.moveTo(...a);
        ctx.bezierCurveTo(a[0] + (b[0] - before[0]) / 6, a[1] + (b[1] - before[1]) / 6,
          b[0] - (after[0] - a[0]) / 6, b[1] - (after[1] - a[1]) / 6, ...b);
        ctx.strokeStyle = `rgb(${shade},${shade},${Math.round(123 + depth * 65)})`;
        ctx.lineWidth = 4.6; ctx.stroke();
        ctx.strokeStyle = `rgba(240,237,255,${depth * .25})`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (progress > .001) {
        ctx.globalAlpha = progress;
        const shift = (1 - progress) * 90;
        line(data.rna.map(r => project(r.sugar, shift)), coral, 2.8);
        for (const r of data.rna) {
          line([project(r.sugar, shift), project(r.base, shift)], coral, 2);
          const p = project(r.base, shift); dot(p[0], p[1], 2.6, coral);
        }
        ctx.globalAlpha = 1;
      }
      text('493 aa', 28, 244, 11, ink);
      text(active ? 'RNA · 17 nt' : 'HOVER TO BIND RNA →', 295, 244, 10, active ? coral : muted);
    }
    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(w / 480, 0, 0, h / 280, 0, 0);
      ctx.clearRect(0, 0, 480, 280); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (canvas.dataset.modelCanvas === 'sequence') sequence(); else protein();
    }
    function tick(now) {
      frame = 0;
      const dt = Math.min((now - (last || now)) / 1000, .05); last = now;
      const target = active ? 1 : 0;
      progress = reduced.matches ? target : progress + (target - progress) * Math.min(1, dt * 7);
      if (Math.abs(target - progress) < .002) progress = target;
      if (active && !reduced.matches) time += dt;
      draw();
      if (visible && !document.hidden && !reduced.matches && (active || progress !== target)) frame = requestAnimationFrame(tick);
    }
    function wake() { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } }
    function update() { active = card.matches(':hover') || card.contains(document.activeElement); wake(); }
    card.addEventListener('pointerenter', update); card.addEventListener('pointerleave', update);
    card.addEventListener('focusin', update); card.addEventListener('focusout', () => queueMicrotask(update));
    new ResizeObserver(() => { draw(); }).observe(canvas);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(canvas);
    document.addEventListener('visibilitychange', wake);
    reduced.addEventListener('change', wake);
    draw();
  }
})();
