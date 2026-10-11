/* Pair nearby regions in two dimensions instead of independently sorting
   both shapes along one diagonal. Each leaf keeps its local neighbourhood. */
export function matchBrainToMaze(maze, brain) {
  const n = maze.meta.length;
  const a = Array.from({ length: n }, (_, i) => i), b = a.slice();
  const pos = new Float32Array(n * 3), meta = new Float32Array(n);
  const divide = (lo, hi, depth) => {
    const axis = depth % 2;
    const sort = (ids, shape) => {
      const local = ids.slice(lo, hi).sort((i, j) => shape.pos[i * 3 + axis] - shape.pos[j * 3 + axis]);
      for (let k = lo; k < hi; k++) ids[k] = local[k - lo];
    };
    sort(a, maze); sort(b, brain);
    if (hi - lo > 48) {
      const mid = (lo + hi) >> 1;
      divide(lo, mid, depth + 1); divide(mid, hi, depth + 1);
    } else for (let k = lo; k < hi; k++) {
      pos.set(brain.pos.subarray(b[k] * 3, b[k] * 3 + 3), a[k] * 3);
      meta[a[k]] = brain.meta[b[k]];
    }
  };
  divide(0, n, 0);
  return { ...brain, pos, meta };
}
