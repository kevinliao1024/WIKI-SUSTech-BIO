import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildScrollTrack } from '../static/onetake/burden-pacing.mjs';
const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)]
  .map(m => ({ p: +m[1], stage: +m[2] }));
const before = buildScrollTrack(keys, { burden: false }), after = buildScrollTrack(keys);
const distance = (mapping, take) => {
  const s = mapping.track.find(s => take >= s.from && take <= s.to);
  return s.start + (take - s.from) / (s.to - s.from) * (s.end - s.start);
};
const span = (mapping, a, b) => distance(mapping, b) - distance(mapping, a);
assert.ok(span(after, .747, .784) > 5 * span(before, .747, .784));
// Outside the comparison, the added page length exactly cancels the change
// in normalized progress. Earlier morphs and later editing keep their speed.
for (const [a, b] of [[-.19, .747], [.784, 1], [.43, .58], [.81, .905]]) {
  assert.ok(Math.abs(span(after, a, b) - span(before, a, b)) < 1e-10);
}
assert.equal(after.track[0].from, keys[0].p);
assert.equal(after.track.at(-1).to, 1);
for (let i = 1; i < after.track.length; i++) {
  assert.equal(after.track[i].from, after.track[i - 1].to);
  assert.equal(after.track[i].start, after.track[i - 1].end);
}
for (let q = -.19; q <= 1; q += .001) {
  const d = distance(after, q), s = after.track.find(s => d <= s.end);
  const reversed = s.from + (d - s.start) / (s.end - s.start) * (s.to - s.from);
  assert.ok(Math.abs(reversed - q) < 1e-10);
}
assert.ok(Math.abs(after.scale * before.length - after.length) < 1e-10);
console.log('Passed burden reading distance, unchanged surrounding speed, and reversible scroll checks');
