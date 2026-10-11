import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { matchBrainToMaze } from '../static/onetake/brain-correspondence.mjs';

// Use the actual maze and cortex, with the previous diagonal ordering as baseline.
const source = readFileSync(new URL('../static/onetake/onetake.js', import.meta.url), 'utf8');
const helpers = source.slice(source.indexOf('const clamp ='), source.indexOf('function astrocyteShape'));
const sorting = source.slice(source.indexOf('function sortShape'), source.indexOf('/* Shaders'));
const { maze, brain, baseline } = runInNewContext(`const small = true;
  ${helpers}\n${sorting}
  const maze = sortShape(mazeShape(2048), 2048), brain = brainShape(2048);
  ({ maze, brain, baseline: sortShape(brain, 2048) });`);
const matched = matchBrainToMaze(maze, brain);
const identities = shape => Array.from(shape.meta, (meta, i) =>
  [...shape.pos.subarray(i * 3, i * 3 + 3), meta].join(',')).sort();
assert.deepEqual(identities(matched), identities(brain), 'Matching lost or duplicated a neuron');
assert.equal(matched.foldLines, brain.foldLines, 'Contours must stay in the same anatomical frame');
assert.ok([...matched.pos, ...matched.foldLines].every(Number.isFinite));
assert.ok(matched.foldLines.length > 0);
const travel = shape => Array.from(shape.meta, (_, i) =>
  (maze.pos[i * 3] - shape.pos[i * 3]) ** 2 +
  (maze.pos[i * 3 + 1] - shape.pos[i * 3 + 1]) ** 2).reduce((a, b) => a + b);
assert.ok(travel(matched) < travel(baseline) * .65, 'Morph should preserve nearby regions');
console.log('Passed: every neuron preserved; local matching reduces planar morph travel; contours stay aligned.');
