import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createMazeNavigator, findMazePath } from '../static/onetake/maze-navigation.mjs';

// Exercise the actual deterministic maze, including its silhouette and dead ends.
const source = readFileSync(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('const clamp ='), source.indexOf('/* An anatomical brain:'));
const maze = runInNewContext(`${helpers}\nmazeShape(500).navigation`);
const cells = [...maze.adj.keys()];
for (const goal of cells) {
  const path = findMazePath(maze.adj, maze.path[0], goal);
  assert.equal(path[0], maze.path[0]); assert.equal(path.at(-1), goal);
  for (let i = 1; i < path.length; i++) assert.ok(maze.adj.get(path[i - 1]).includes(path[i]));
}

const edges = cells.flatMap(a => maze.adj.get(a).filter(b => a < b).map(b => [maze.point(a), maze.point(b)]));
const onEdge = (p, [a, b]) => {
  const cross = (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]);
  return Math.abs(cross) < 1e-7 && p.every((v, i) => v >= Math.min(a[i], b[i]) - 1e-7 && v <= Math.max(a[i], b[i]) + 1e-7);
};
const assertTrail = nav => {
  const trail = nav.trail();
  for (let i = 1; i < trail.length; i++) {
    assert.ok(edges.some(edge => onEdge(trail[i - 1], edge) && onEdge(trail[i], edge)), 'Tail crossed a wall or cut a corner');
  }
};
for (const phase of [0, 0.18, 0.499, 0.999]) {
  const nav = createMazeNavigator(maze, phase);
  for (let k = 0; k < 25; k++) {
    const goal = cells[(k * 71) % cells.length], before = nav.position();
    nav.setTarget(goal);
    assert.ok(Number.isFinite(nav.remaining()) && nav.remaining() >= 0);
    assert.ok(Math.hypot(...nav.position().map((v, i) => v - before[i])) < 1e-7, 'Retarget teleported the head');
    // Rapid moving targets followed by a held target, long enough to reach it.
    nav.advance(maze.spacing * (k % 3 === 0 ? 0.13 : 300));
    assertTrail(nav);
    if (k % 3 !== 0) {
      assert.ok(Math.hypot(...nav.position().map((v, i) => v - maze.point(goal)[i])) < 1e-7);
      assert.ok(nav.remaining() < 1e-7);
      nav.advance(1); assertTrail(nav); // hold at destination
    }
  }
  nav.setTarget(null);
  for (let i = 0; i < 500; i++) nav.advance(0.08);
  assertTrail(nav); // leave the maze and resume wandering
}
assert.deepEqual(findMazePath(new Map([[0, []], [1, []]]), 0, 1), []);
console.log(`Passed: all ${cells.length} targets reachable; head and tail stay in open passages during pursuit, reversal, holding and wandering.`);
