// The dementia comparison keeps a short window of its own. This checks that
// the window stays short (it used to be stretched to almost three screens and
// read as a separate page), that every other chapter keeps its exact speed,
// and that the mapping stays reversible.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildScrollTrack, BURDEN_IN, BURDEN_OUT } from '../static/onetake/burden-pacing.mjs';

const source = await readFile(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const keys = [...source.matchAll(/\{ p: ([-\d.]+), stage: ([-\d.]+)/g)]
  .map(m => ({ p: +m[1], stage: +m[2] }));

const before = buildScrollTrack(keys, { burden: false });
const after = buildScrollTrack(keys);

const distance = (mapping, take) => {
  const s = mapping.track.find(s => take >= s.from && take <= s.to);
  return s.start + (take - s.from) / (s.to - s.from) * (s.end - s.start);
};
const span = (mapping, a, b) => distance(mapping, b) - distance(mapping, a);

// The comparison is still given more room than the bare camera keys allow,
// but far less than the old 8x stretch: it must stay under 8% of the page.
const share = span(after, BURDEN_IN, BURDEN_OUT) / after.length;
assert.ok(span(after, BURDEN_IN, BURDEN_OUT) > span(before, BURDEN_IN, BURDEN_OUT),
  'the comparison still gets extra reading distance');
assert.ok(share < .08, `comparison must stay a short segment, got ${(share * 100).toFixed(1)}%`);
assert.ok(share > .02, `comparison must remain readable, got ${(share * 100).toFixed(1)}%`);

// Every chapter outside the comparison keeps exactly its original speed, so
// shortening this segment cannot speed up the surrounding take.
for (const [a, b] of [[-.19, BURDEN_IN], [BURDEN_OUT, 1], [.43, .58], [.81, .905], [.11, .2]]) {
  assert.ok(Math.abs(span(after, a, b) - span(before, a, b)) < 1e-10,
    `speed outside the comparison changed between ${a} and ${b}`);
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
console.log(`Passed: comparison occupies ${(share * 100).toFixed(1)}% of the take, surrounding speed unchanged, scroll reversible`);
