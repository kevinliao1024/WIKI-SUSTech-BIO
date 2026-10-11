/* No dependencies or media requests. The trend is one published GBD series;
   WHO's 2021 snapshot is an independent reference, never spliced into it. */
export const CAPACITY = 132000;
export const NEW_CASES_PER_YEAR = 10000000;
export const DAYS_TO_FILL = CAPACITY / NEW_CASES_PER_YEAR * 365;
export const TREND = Object.freeze([
  { year: 2019, million: 57.4, low: 50.4, high: 65.1, projected: false, x: 46, y: 157.3 },
  { year: 2030, million: 83.2, low: 73.0, high: 94.6, projected: true, x: 177, y: 120.2 },
  { year: 2040, million: 116.0, low: 100.7, high: 132.1, projected: true, x: 296, y: 73 },
  { year: 2050, million: 152.8, low: 130.8, high: 175.9, projected: true, x: 416, y: 20 },
]);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;

function mount(el) {
  const chapter = el.closest('[data-ot-chapter]');
  const root = el.closest('[data-ot]');
  const canvas = el.querySelector('[data-burden-canvas]');
  const ctx = canvas.getContext('2d');
  const svg = el.querySelector('.burden__chart');
  const chart = el.querySelector('[data-burden-chart]');
  const cursor = el.querySelector('[data-burden-cursor]');
  const context = el.querySelector('[data-burden-context]');
  const equivalent = el.querySelector('[data-burden-equivalent]');
  const selection = el.querySelector('[data-burden-selection]');
  const note = el.querySelector('[data-burden-note]');
  const stadium = el.querySelector('[data-burden-stadium]');
  const incidence = el.querySelector('[data-burden-incidence]');
  const range = el.querySelector('[data-burden-time]');
  const daysOutput = el.querySelector('[data-burden-days]');
  const playButton = el.querySelector('[data-burden-play]');
  const modeButtons = [...el.querySelectorAll('[data-burden-mode]')];
  const yearButtons = [...el.querySelectorAll('[data-burden-year]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'snapshot', stadiumCount = 57000000 / CAPACITY, displayedCount = stadiumCount;
  let fill = 1, days = 0, playing = false, active = false, intersects = false;
  let width = 0, height = 0, raf = 0, lastTime = 0, entered = 0, yaw = 0, pointerYaw = 0;
  const random = i => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  // Seat dots form a bowl of tiers with aisles, rather than a flat ring.
  const seats = [];
  for (let tier = 0; tier < 24; tier++) {
    const total = 230 + tier * 12;
    for (let i = 0; i < total; i++) {
      const turn = i / total, sector = turn * 20;
      if (sector % 1 < .055) continue;
      seats.push({ angle: turn * Math.PI * 2, tier: tier / 23,
        order: (Math.floor(sector) + tier / 24) / 20, noise: random(tier * 600 + i) });
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    schedule();
  }
  function setEquivalent(prefix, number, suffix) {
    equivalent.replaceChildren(document.createTextNode(prefix));
    const strong = document.createElement('strong'); strong.textContent = number;
    equivalent.append(strong, document.createTextNode(suffix));
  }
  function markButtons() {
    for (const b of modeButtons) b.setAttribute('aria-pressed', String(mode === b.dataset.burdenMode));
  }
  function stopPlayback() { playing = false; playButton.textContent = 'Play 5 days in 10 seconds ↗'; }
  function setYear(index) {
    const datum = TREND[index]; if (!datum) return;
    stopPlayback(); mode = 'trend'; incidence.hidden = true; markButtons();
    stadiumCount = datum.million * 1000000 / CAPACITY; fill = 1;
    cursor.removeAttribute('hidden');
    cursor.querySelector('path').setAttribute('d', `M${datum.x} ${datum.y}V240`);
    for (const circle of cursor.querySelectorAll('circle')) { circle.setAttribute('cx', datum.x); circle.setAttribute('cy', datum.y); }
    for (const b of yearButtons) b.setAttribute('aria-pressed', String(+b.dataset.burdenYear === index));
    selection.textContent = `${datum.year} · ${datum.million.toFixed(1)} million · ${datum.projected ? 'projection' : 'estimate'} (95% UI ${datum.low.toFixed(1)}–${datum.high.toFixed(1)}M)`;
    context.textContent = `${datum.year} · ${datum.projected ? 'Projected' : 'Estimated'} ${datum.million.toFixed(1)} million people · GBD 2019`;
    setEquivalent('Enough to fill ', `≈${Math.round(stadiumCount).toLocaleString('en-US')}`, ' stadiums.');
    note.textContent = 'Each small stadium = 132,000 people. Choose another year to see the scale change.';
    stadium.setAttribute('aria-label', `${datum.year}: ${datum.million} million ${datum.projected ? 'projected' : 'estimated'} dementia cases, approximately ${Math.round(stadiumCount)} stadium capacities. Each small stadium represents 132,000 people.`);
    el.dataset.mode = mode; el.dataset.year = datum.year; schedule();
  }
  function updateDays(value) {
    days = clamp(value, 0, DAYS_TO_FILL); fill = days / DAYS_TO_FILL;
    range.value = days.toFixed(3);
    daysOutput.textContent = `${days.toFixed(1)} days`;
    range.setAttribute('aria-valuetext', `${days.toFixed(1)} days, ${Math.round(fill * 100)} percent of one stadium`);
    stadium.setAttribute('aria-label', `${days.toFixed(1)} days of new dementia cases at the approximate annual average: ${Math.round(fill * 100)} percent of one 132,000-seat stadium. Accelerated illustration, not live case reporting.`);
    el.dataset.fill = fill.toFixed(3); schedule();
  }
  function setMode(next) {
    stopPlayback(); mode = next; markButtons();
    cursor.setAttribute('hidden', '');
    for (const b of yearButtons) b.setAttribute('aria-pressed', 'false');
    incidence.hidden = mode !== 'incidence';
    delete el.dataset.year; el.dataset.mode = mode;
    selection.textContent = '2019–2050 · one study, one projection series.';
    if (mode === 'snapshot') {
      fill = 1; stadiumCount = 57000000 / CAPACITY;
      context.textContent = '57 million people · WHO 2021 estimate';
      setEquivalent('Enough to fill ', '≈432', ' stadiums.');
      note.textContent = 'Each small stadium = 132,000 people. A capacity comparison, not an actual gathering.';
      stadium.setAttribute('aria-label', 'WHO 2021 snapshot: 57 million people living with dementia, approximately 432 stadium capacities. Each small stadium represents 132,000 people.');
    } else {
      context.textContent = 'Nearly 10 million new dementia cases each year · WHO';
      setEquivalent('One stadium fills in ', '≈4.8', ' days.');
      note.textContent = 'Accelerated illustration using ≈10 million new cases/year. Seat dots are grouped; the annual average is not a live count.';
      updateDays(0);
    }
    schedule();
  }
  for (const b of yearButtons) b.addEventListener('click', () => setYear(+b.dataset.burdenYear));
  for (const b of modeButtons) b.addEventListener('click', () => setMode(b.dataset.burdenMode));
  range.addEventListener('input', () => { stopPlayback(); updateDays(+range.value); });
  playButton.addEventListener('click', () => {
    if (playing) { stopPlayback(); return; }
    if (reduce.matches) { updateDays(DAYS_TO_FILL); return; }
    if (days >= DAYS_TO_FILL - .001) updateDays(0);
    // An idle canvas has no recent frame timestamp. Start/resume the clock
    // here so time spent reading is never counted as simulated playback.
    lastTime = 0;
    playing = true; playButton.textContent = 'Pause accelerated playback'; schedule();
  });
  // Select only published milestones; never invent annual patient estimates.
  const yearAtPointer = event => {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const matrix = svg.getScreenCTM(); if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    let nearest = 0;
    for (let i = 1; i < TREND.length; i++) if (Math.abs(TREND[i].x - local.x) < Math.abs(TREND[nearest].x - local.x)) nearest = i;
    setYear(nearest);
  };
  let dragging = false;
  chart.addEventListener('pointerdown', event => { if (event.button !== 0) return; dragging = true; chart.setPointerCapture(event.pointerId); yearAtPointer(event); });
  chart.addEventListener('pointermove', event => { if (dragging) yearAtPointer(event); });
  const release = () => { dragging = false; };
  chart.addEventListener('pointerup', release); chart.addEventListener('pointercancel', release);
  stadium.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') pointerYaw = clamp((event.clientX - stadium.getBoundingClientRect().left) / width) * 2 - 1; schedule(); });
  stadium.addEventListener('pointerleave', () => { pointerYaw = 0; schedule(); });

  function draw(time, entry) {
    if (!ctx || width <= 0 || height <= 0) return;
    ctx.clearRect(0, 0, width, height);
    const cx = width * .5, cy = height * .45, rx = width * .45, rz = height * .29;
    const tilt = .63, sin = Math.sin(tilt), cos = Math.cos(tilt);
    const project = (x, y, z) => {
      const rotatedX = x * Math.cos(yaw) + z * Math.sin(yaw), rotatedZ = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const depth = 1 + rotatedZ / (width * 4);
      return [cx + rotatedX * depth, cy + (rotatedZ * sin - y * cos) * depth];
    };
    const outline = (xRadius, zRadius, elevation, opacity, color = '#9d9cf4') => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * Math.PI * 2, p = project(Math.cos(a) * xRadius, elevation, Math.sin(a) * zRadius);
        if (i) ctx.lineTo(...p); else ctx.moveTo(...p);
      }
      ctx.strokeStyle = color; ctx.globalAlpha = opacity * entry; ctx.lineWidth = .65; ctx.stroke();
    };
    // Dim structural tiers keep the empty stadium legible in incidence mode.
    for (let tier = 0; tier < 13; tier++) {
      const t = tier / 12;
      outline(rx * mix(.48, 1, t), rz * mix(.52, 1, t), t * height * .20, .12 + t * .08);
    }
    outline(rx, rz, height * .2, .3); outline(rx, rz, height * .15, .15);
    outline(rx * .46, rz * .49, -3, .22, '#f58f9c');
    // Pitch lines suggest cricket without adding an opaque green field.
    ctx.beginPath();
    for (const [i, p] of [[-.03,-.045],[.03,-.045],[.03,.045],[-.03,.045],[-.03,-.045]].entries()) {
      const q = project(width * p[0], -3, height * p[1]); if (i) ctx.lineTo(...q); else ctx.moveTo(...q);
    }
    ctx.globalAlpha = .5 * entry; ctx.strokeStyle = '#f58f9c'; ctx.stroke();
    const emerge = reduce.matches ? 1 : clamp(entry * 1.3);
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i], t = seat.tier, a = seat.angle;
      if (seat.noise > emerge) continue;
      const p = project(Math.cos(a) * rx * mix(.49, .99, t), t * height * .20, Math.sin(a) * rz * mix(.53, .99, t));
      const isFilled = seat.order <= fill;
      ctx.globalAlpha = (isFilled ? .4 + seat.noise * .45 : .085) * entry;
      ctx.fillStyle = isFilled && mode === 'incidence' ? '#f58f9c' : '#9d9cf4';
      const size = width < 400 ? .72 : .9;
      ctx.fillRect(p[0], p[1], size, size);
    }
    // A perspective field uses one tiny bowl per stadium capacity, not one
    // dot per person. This remains countable at a fixed maximum scale.
    if (mode !== 'incidence') {
      const count = Math.ceil(displayedCount);
      const columns = Math.ceil(Math.sqrt(count * 2)), rows = Math.ceil(count / columns);
      const top = height * .68, bottom = height * .91;
      for (let row = rows - 1; row >= 0; row--) {
        const depth = row / Math.max(1, rows - 1), span = mix(width * .80, width * .97, depth);
        const gap = span / columns, y = mix(top, bottom, depth);
        for (let col = 0; col < columns; col++) {
          const index = row * columns + col; if (index >= count) continue;
          const x = cx - span / 2 + (col + .5) * gap, size = gap * .33;
          ctx.globalAlpha = (.13 + depth * .23) * entry * clamp(displayedCount - index);
          ctx.strokeStyle = index >= 432 ? '#f58f9c' : '#9d9cf4'; ctx.lineWidth = .6;
          ctx.beginPath(); ctx.ellipse(x, y, size, size * .32, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
    } else if (playing && !reduce.matches) {
      // A soft marker is a pace cue, never a claim of live reporting.
      const pulse = (time / 3200) % 1;
      ctx.globalAlpha = (1 - pulse) * .25; ctx.strokeStyle = '#f58f9c';
      ctx.beginPath(); ctx.ellipse(cx, cy, 5 + pulse * 18, 2 + pulse * 7, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function schedule() { if (active && !document.hidden && !raf) raf = requestAnimationFrame(frame); }
  function frame(time) {
    raf = 0; if (!active || document.hidden) { lastTime = 0; return; }
    const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
    const dt = Math.min(elapsed, .05); lastTime = time;
    entered += elapsed;
    const entry = reduce.matches ? 1 : clamp(entered / 1.1);
    yaw = reduce.matches ? 0 : mix(yaw, pointerYaw * .10, 1 - Math.exp(-dt * 5));
    displayedCount = reduce.matches ? stadiumCount : mix(displayedCount, stadiumCount, 1 - Math.exp(-elapsed * 4));
    if (playing) {
      updateDays(days + elapsed * DAYS_TO_FILL / 10);
      if (days >= DAYS_TO_FILL - .00001) stopPlayback();
    }
    draw(time, entry);
    if (!reduce.matches && (playing || entry < 1 || Math.abs(displayedCount - stadiumCount) > .02 || Math.abs(yaw - pointerYaw * .10) > .0001)) schedule();
  }
  function syncVisibility() {
    const next = intersects && (root.classList.contains('ot--static') || chapter.classList.contains('is-on'));
    if (next === active) return;
    active = next; lastTime = 0;
    if (active) { entered = 0; resize(); schedule(); }
    else { stopPlayback(); if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  new MutationObserver(syncVisibility).observe(chapter, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(syncVisibility).observe(root, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(entries => { intersects = entries[0].isIntersecting; syncVisibility(); }).observe(stadium);
  new ResizeObserver(resize).observe(stadium);
  document.addEventListener('visibilitychange', () => { lastTime = 0; if (document.hidden) { stopPlayback(); if (raf) cancelAnimationFrame(raf); raf = 0; } else schedule(); });
  reduce.addEventListener('change', () => { stopPlayback(); entered = 2; resize(); });
  if (ctx) el.classList.add('is-rendered');
  setMode('snapshot');
}

if (typeof document !== 'undefined') for (const el of document.querySelectorAll('[data-burden]')) mount(el);
