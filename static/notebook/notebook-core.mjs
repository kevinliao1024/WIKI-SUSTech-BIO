// Date-only arithmetic deliberately never uses local time zones.
export const DAY = 86400000;
export function dayNumber(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`Invalid calendar date: ${iso}`);
  const value = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(value) || new Date(value).toISOString().slice(0, 10) !== iso) throw new Error(`Invalid calendar date: ${iso}`);
  return value / DAY;
}
export const isoDay = number => new Date(number * DAY).toISOString().slice(0, 10);
export const formatDate = iso => new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'}).format(new Date(dayNumber(iso) * DAY));
export const sortRecords = records => [...records].sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order || a.id.localeCompare(b.id));
export function groupTrack(records, trackId) {
  const groups = new Map();
  for (const r of sortRecords(records.filter(r => r.trackId === trackId))) {
    if (!groups.has(r.date)) groups.set(r.date, []);
    groups.get(r.date).push(r);
  }
  return [...groups].map(([date, records]) => ({date, records}));
}
export function dateBounds(records) {
  const dates = records.map(r => dayNumber(r.date));
  return dates.length ? {start: Math.min(...dates), end: Math.max(...dates)} : null;
}
export const overviewY = (date, end, scale = 20) => 70 + (end - dayNumber(date)) * scale;
export function focusY(date, rows, height) {
  const n = dayNumber(date);
  if (!rows.length) return 30;
  if (n < rows[0].day) return Math.max(16, rows[0].y - 24);
  if (n > rows.at(-1).day) return Math.min(height - 16, rows.at(-1).y + 36);
  for (let i = 0; i < rows.length; i++) {
    if (n === rows[i].day) return rows[i].y;
    if (n < rows[i].day) {
      const prev = rows[i-1], next = rows[i];
      return prev.y + (n - prev.day) / (next.day - prev.day) * (next.y - prev.y);
    }
  }
  return rows.at(-1).y;
}
export function validateIndex(index) {
  if (index.schemaVersion !== 1 || !Array.isArray(index.tracks) || !Array.isArray(index.records)) throw new Error('Unsupported source index.');
  const tracks = new Set(index.tracks.map(t => t.id)), ids = new Set(), sources = new Set();
  if (tracks.size !== index.tracks.length) throw new Error('Duplicate track ID.');
  for (const r of index.records) {
    dayNumber(r.date);
    if (!tracks.has(r.trackId) || ids.has(r.id) || !r.title || !r.pages?.length) throw new Error(`Invalid record: ${r.id}`);
    ids.add(r.id);
    const key = `${r.trackId}:${r.pdf}:${r.pages.map(p => p.number).join(',')}`;
    if (sources.has(key)) throw new Error(`Duplicate source mapping: ${r.id}`);
    sources.add(key);
    for (const file of [r.pdf, ...r.pages.map(p => p.preview)]) {
      if (!file || file.startsWith('/') || file.includes('..') || /^[a-z]+:/i.test(file)) throw new Error('Unsafe source path.');
    }
    for (const p of r.pages) if (!Number.isInteger(p.number) || p.number < 1 || p.number > r.pageCount) throw new Error(`Invalid page: ${r.id}`);
  }
  for (const m of index.milestones || []) {
    dayNumber(m.date);
    if (!m.recordIds?.length || m.recordIds.some(id => !ids.has(id))) throw new Error(`Unsupported milestone: ${m.id}`);
  }
  return index;
}
