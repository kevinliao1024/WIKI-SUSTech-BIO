// Browser-independent scroll, arc-length and reversible prop functions.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ramp = (p, a, b) => clamp((p - a) / (b - a));
export const smooth = x => x * x * (3 - 2 * x);
export const STATIONS = [
  { id: 'home', p: -.90, at: [-4, -.6, 0], change: [-.86, -.79] },
  { id: 'bridge', p: -.68, at: [0, -.6, 0], change: [-.64, -.57] },
  { id: 'road', p: -.46, at: [4, -.6, 0], change: [-.42, -.35] },
];
export const openingProgress = (scroll, height) => -1 + .81 * clamp(scroll / Math.max(1, height));
export const openingScroll = (p, height) => clamp((p + 1) / .81) * height;
export const arcFraction = p => ramp(p, -1, -.35);
export function arcTable(pointAt, count = 1024) {
  const table = [{ t: 0, distance: 0 }];
  let previous = pointAt(0), distance = 0;
  for (let i = 1; i <= count; i++) {
    const point = pointAt(i / count);
    distance += Math.hypot(...point.map((x, k) => x - previous[k]));
    table.push({ t: i / count, distance }); previous = point;
  }
  return { table, length: distance };
}
export function parameterAtArc({ table, length }, fraction) {
  const distance = clamp(fraction) * length;
  let lo = 0, hi = table.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (table[mid].distance < distance) lo = mid; else hi = mid; }
  const a = table[lo], b = table[hi];
  return a.t + (b.t - a.t) * (distance - a.distance) / Math.max(1e-12, b.distance - a.distance);
}
export function propPosition(id, original, p) {
  const station = STATIONS.find(s => s.id === id), k = smooth(ramp(p, ...station.change));
  const [x, y, z] = original;
  if (id === 'home') return [x + 1.05 * k, y + .25 * k, z - .4 * k];
  if (id === 'bridge') { const side = x < 0 ? -1 : 1; return [x + side * .55 * k, y - (side > 0 ? .55 : 0) * k, z]; }
  const branch = Math.sign(y + .6 || 1) * Math.max(0, x - 3.5) * .7;
  return [x, y + branch * k, z - (x > 4 ? 1.4 : 0) * k];
}
export function propOpacity(id, original, p) {
  return id === 'road' && original[0] > 4
    ? 1 - smooth(ramp(p, -.42, -.35)) * .95 : 1;
}

// Mirrors ONLY the existing maze's seeded graph, not its particle shape.
// The parity test compares all edges with mazeShape; no separate wall model.
export function journeyMazeGraph() {
  let seed = 20260929;
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const W = 23, H = 15, spacing = .62;
  const cx = i => (i + .5 - W / 2) * spacing, cy = j => (j + .5 - H / 2) * spacing;
  const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < H && (cx(i) / 7.1) ** 2 + (cy(j) / 4.5) ** 2 < 1;
  const id = (i, j) => j * W + i;
  let si = 0; while (!inside(si, H >> 1)) si++;
  const start = id(si, H >> 1), seen = new Set([start]), stack = [[si, H >> 1]], adj = new Map();
  while (stack.length) {
    const [i, j] = stack.at(-1);
    const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [i + a, j + b]).filter(([a, b]) => inside(a, b) && !seen.has(id(a, b)));
    if (!next.length) { stack.pop(); continue; }
    const [a, b] = next[Math.floor(rnd() * next.length)], from = id(i, j), to = id(a, b);
    if (!adj.has(from)) adj.set(from, []); if (!adj.has(to)) adj.set(to, []);
    adj.get(from).push(to); adj.get(to).push(from); seen.add(to); stack.push([a, b]);
  }
  const path = [start]; let previous = -1;
  for (let i = 0; i < 110; i++) {
    const current = path.at(-1); let options = adj.get(current);
    if (options.length > 1 && rnd() < .9) options = options.filter(x => x !== previous);
    previous = current; path.push(options[Math.floor(rnd() * options.length)]);
  }
  return { adj, path, point: cell => [cx(cell % W), cy(Math.floor(cell / W))], spacing, bowl: (x, y) => -.03 * (x * x + y * y) };
}
