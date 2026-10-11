/* Routing uses the very same open passages that generated the maze walls. */
export function findMazePath(adj, start, goal) {
  const parents = new Map([[start, null]]), queue = [start];
  for (let i = 0; i < queue.length && !parents.has(goal); i++) {
    for (const next of adj.get(queue[i]) || []) {
      if (parents.has(next)) continue;
      parents.set(next, queue[i]); queue.push(next);
    }
  }
  if (!parents.has(goal)) return [];
  const path = [];
  for (let cell = goal; cell !== null; cell = parents.get(cell)) path.push(cell);
  return path.reverse();
}

export function createMazeNavigator({ adj, path, point, spacing }, phase) {
  const progress = phase * (path.length - 1);
  const index = Math.min(path.length - 2, Math.floor(progress));
  let from = path[index], to = path[index + 1], t = progress - index;
  let target = null, pending = [], steps = index, previous = from;
  const blend = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const position = () => blend(point(from), point(to), t);
  const history = path.slice(Math.max(0, index - 20), index + 1).map(point);
  history.push(position());

  const setTarget = (cell) => {
    if (cell === target) return;
    target = cell; pending = [];
    if (cell === null) return;
    if (t >= 1 - 1e-8) {
      from = to; t = 0;
      pending = findMazePath(adj, from, cell).slice(1);
      to = pending.shift() ?? from;
      return;
    }
    // Reversal is legal on the current passage; never cut across a corner.
    const forward = findMazePath(adj, to, cell);
    const backward = findMazePath(adj, from, cell);
    if (t + backward.length - 1 < 1 - t + forward.length - 1) {
      [from, to] = [to, from]; t = 1 - t;
      pending = backward.slice(1);
    } else pending = forward.slice(1);
  };

  const advance = (distance) => {
    while (distance > 1e-8) {
      if (t >= 1 - 1e-8 || from === to) {
        previous = from; from = to; t = 0;
        if (target !== null) {
          to = pending.shift() ?? from;
          if (to === from) break;
        } else {
          const options = (adj.get(from) || []).filter(cell => cell !== previous);
          to = options.length ? options[(++steps * 17) % options.length] : previous;
        }
      }
      const amount = Math.min(distance, (1 - t) * spacing);
      t += amount / spacing; distance -= amount;
      history.push(position());
    }
    // Keep actual travelled corners. A straight interpolation across turns
    // would let the glowing tail cross walls even with a valid head path.
    let length = 0;
    for (let i = history.length - 1; i > 0; i--) {
      length += Math.hypot(history[i][0] - history[i - 1][0], history[i][1] - history[i - 1][1]);
      if (length > spacing * 20) { history.splice(0, i); break; }
    }
  };

  const trail = () => {
    const points = [history[0]];
    for (let i = 1; i < history.length; i++) {
      const p = history[i], last = points[points.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-8) points.push(p);
    }
    return points;
  };
  const remaining = () => target === null ? 0 : ((from === to ? 0 : 1 - t) + pending.length) * spacing;
  return { setTarget, advance, trail, position, remaining };
}
