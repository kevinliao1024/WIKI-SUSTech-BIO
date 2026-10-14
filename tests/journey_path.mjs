import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { STATIONS, openingProgress, openingScroll, arcFraction, arcTable, parameterAtArc, propPosition, propOpacity, journeyMazeGraph } from '../static/onetake/journey-path.mjs';
import { createMazeNavigator } from '../static/onetake/maze-navigation.mjs';

// Arc-length inversion on a nonuniform curve must give equal travel distances.
const pointAt = t => [t * t * 12, 0, 0];
const arc = arcTable(pointAt);
for (let i = 0; i <= 100; i++) {
  const f = i / 100, t = parameterAtArc(arc, f);
  assert.ok(Math.abs(pointAt(t)[0] - 12 * f) < .00001);
}
assert.equal(parameterAtArc(arc, -1), 0); assert.equal(parameterAtArc(arc, 2), 1);
for (const station of STATIONS) {
  assert.ok(Math.abs(openingProgress(openingScroll(station.p, 5600), 5600) - station.p) < 1e-12);
  const original = station.at, changed = propPosition(station.id, original, station.change[1]);
  assert.notDeepEqual(changed, original);
  assert.deepEqual(propPosition(station.id, original, -1), original);
  for (const p of [-1, station.p, ...station.change, -.19]) {
    const forward = propPosition(station.id, original, p);
    propPosition(station.id, original, .03);
    assert.deepEqual(propPosition(station.id, original, p), forward);
  }
}
assert.equal(arcFraction(-1), 0); assert.equal(arcFraction(-.35), 1);
assert.equal(propOpacity('road', [5, -.35, 0], -1), 1);
assert.ok(propOpacity('road', [5, -.35, 0], -.35) < .1);
assert.ok(propPosition('road', [5, -.35, 0], -.35)[1] > -.35);
assert.ok(propPosition('road', [5, -.85, 0], -.35)[1] < -.85);

// Verify the companion's graph against the actual base generator so changes
// to the maze cannot silently turn the companion's route into wall crossings.
const source = readFileSync(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('const clamp ='), source.indexOf('/* An anatomical brain:'));
const actual = runInNewContext(`${helpers}\nmazeShape(500).navigation`), graph = journeyMazeGraph();
assert.deepEqual([...graph.adj].map(([a,b]) => [a,[...b]]), JSON.parse(JSON.stringify([...actual.adj])));
assert.deepEqual(graph.path, [...actual.path]);
for (const p of [-.19, -.16, -.12, -.075]) {
  const sample = () => { const nav = createMazeNavigator(graph, 0); nav.advance(Math.max(0, Math.min(1, (p + .19) / .115)) * graph.spacing * 4); return nav.position(); };
  const first = sample(); assert.deepEqual(sample(), first);
  assert.ok(first.every(Number.isFinite));
}
console.log('Passed journey arc-length, station scroll inversion, reversible props and exact maze graph parity.');
