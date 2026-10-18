import assert from 'node:assert/strict';
import { test } from 'node:test';
import '../static/engineering-boundary.js';
const Gate = globalThis.ORCAChapterBoundary;
const parts = ['pod', 'cetus', 'integrated-orca', 'gfa', 'mre', 'aso', 'cre-loxp', 'deliver', 'measure', 'model-rna-seq', 'model-puf', 'model-apobec', 'model-lamar', 'model-whole-body'];
const input = (gate, extra = {}) => gate.input({ direction: 1, chapter: 'cetus', edge: true, gesture: 'wheel-1', distance: 120, ...extra });

test('every chapter boundary requires a new gesture in both directions; endpoints do not wrap', () => {
  for (let i = 0; i < parts.length; i++) for (const direction of [-1, 1]) {
    const gate = new Gate(); const chapter = parts[i + direction];
    assert.equal(input(gate, { direction, chapter }).action, chapter ? 'hint' : 'read');
    for (let n = 0; n < 30; n++) assert.equal(input(gate, { direction, chapter }).action, chapter ? 'hint' : 'read');
    assert.equal(input(gate, { direction, chapter, gesture: 'wheel-2' }).action, chapter ? 'turn' : 'read');
  }
});
test('arrival at a boundary displays a hint but the same gesture and its tail cannot confirm', () => {
  const gate = new Gate();
  assert.equal(input(gate, { edge: false }).action, 'read');
  assert.equal(gate.offer(1, 'cetus', 'wheel-1').action, 'hint');
  for (const distance of [200, 80, 20, 3, .01]) assert.equal(input(gate, { distance }).action, 'hint');
  assert.equal(input(gate, { gesture: 'wheel-2' }).action, 'turn');
});
test('confirmation accumulates deliberate movement, not a tiny stray event', () => {
  const gate = new Gate(); input(gate);
  assert.equal(input(gate, { gesture: 'wheel-2', distance: 1 }).action, 'hint');
  assert.equal(input(gate, { gesture: 'wheel-2', distance: 15 }).action, 'hint');
  assert.equal(input(gate, { gesture: 'wheel-2', distance: 16 }).action, 'turn');
});
test('a reverse gesture releases normal reading immediately; reaching the edge again starts over', () => {
  const gate = new Gate(); input(gate);
  assert.equal(input(gate, { direction: -1, edge: false, chapter: 'pod' }).action, 'read');
  assert.equal(gate.preview, null);
  assert.equal(input(gate, { gesture: 'wheel-2' }).action, 'hint');
});
test('after a turn only the consumed gesture tail is absorbed, with no time-based lock on reversal', () => {
  const gate = new Gate(); input(gate); input(gate, { gesture: 'wheel-2' });
  gate.clear(false); // Panel navigation preserves the gesture, not the hint.
  assert.equal(input(gate, { gesture: 'wheel-2', edge: false }).action, 'absorb');
  assert.equal(input(gate, { gesture: 'wheel-2', direction: -1, edge: false }).action, 'read');
  assert.equal(input(gate, { gesture: 'wheel-3', edge: false }).action, 'read');
});
test('touch release and a second key press are separate confirmations; held inputs are not', () => {
  for (const source of ['touch', 'key']) {
    const gate = new Gate();
    assert.equal(input(gate, { gesture: `${source}-1` }).action, 'hint');
    assert.equal(input(gate, { gesture: `${source}-1` }).action, 'hint');
    assert.equal(input(gate, { gesture: `${source}-2` }).action, 'turn');
  }
});
test('direct navigation clears pending confirmation and the consumed gesture', () => {
  const gate = new Gate(); input(gate); input(gate, { gesture: 'wheel-2' }); gate.clear();
  assert.equal(input(gate, { gesture: 'wheel-2' }).action, 'hint');
});

const Wheel = globalThis.ORCAWheelGestures;
test('a renewed trackpad stroke is recognized inside the previous momentum tail with no quiet gap', () => {
  for (const direction of [-1, 1]) {
    const wheel = new Wheel(); const gate = new Gate(); let time = 0;
    const send = magnitude => {
      const gesture = wheel.next(magnitude * direction, time += 16);
      return input(gate, { direction, gesture, distance: magnitude, threshold: 12 });
    };
    for (const magnitude of [60, 54, 38, 25, 16, 8, 4, 2]) assert.equal(send(magnitude).action, 'hint');
    assert.equal(send(9).action, 'hint');
    assert.equal(send(15).action, 'turn', 'A second stroke must confirm within two events, not after a 300ms silence.');
  }
});
test('multi-second decaying momentum does not create another gesture or auto-turn', () => {
  const wheel = new Wheel(); const gate = new Gate(); let time = 0; let id;
  for (let n = 0; n < 240; n++) {
    const magnitude = 80 * .96 ** n;
    const gesture = wheel.next(magnitude, time += 16);
    id ??= gesture;
    assert.equal(gesture, id);
    if (magnitude >= 2) assert.equal(input(gate, { gesture, distance: magnitude, threshold: 12 }).action, 'hint');
  }
  const gesture = wheel.next(14, time + 16);
  assert.notEqual(gesture, id);
  assert.equal(input(gate, { gesture, distance: 14, threshold: 12 }).action, 'turn');
});
test('a new mouse notch after 120ms is responsive without mouse movement', () => {
  const wheel = new Wheel(); const gate = new Gate();
  assert.equal(input(gate, { gesture: wheel.next(120, 0), threshold: 12 }).action, 'hint');
  assert.equal(input(gate, { gesture: wheel.next(120, 120), threshold: 12 }).action, 'turn');
});
test('small momentum noise cannot imitate the acceleration of a new stroke', () => {
  const wheel = new Wheel(); const values = [60, 40, 20, 8, 4, 3, 4, 2, 3, 2, 2.8, 2.2, 3];
  assert.equal(new Set(values.map((delta, i) => wheel.next(delta, i * 16))).size, 1);
});
test('reversing direction is immediate, even during a consumed gesture', () => {
  const wheel = new Wheel(); const first = wheel.next(60, 0);
  assert.notEqual(wheel.next(-15, 16), first);
});
