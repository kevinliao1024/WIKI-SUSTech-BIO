// Shared reversible scroll mapping. Camera keys remain unchanged; only the
// reading distance of the dementia comparison is extended.
export function buildScrollTrack(keys, { burden = true } = {}) {
  let baselineLength = 0, length = 0;
  const track = [];
  keys.slice(1).forEach((key, i) => {
    const previous = keys[i];
    const weight = key.stage === previous.stage
      ? (key.stage === 2 ? 3.6 : key.stage === 4 ? 6.5 : 1.6) : 1;
    baselineLength += (key.p - previous.p) * weight;
    const cuts = [previous.p, ...(burden ? [.747, .784] : [])
      .filter(p => p > previous.p && p < key.p), key.p];
    for (let j = 1; j < cuts.length; j++) {
      const from = cuts[j - 1], to = cuts[j], middle = (from + to) / 2;
      const start = length;
      length += (to - from) * (burden && middle >= .747 && middle <= .784 ? 8 : weight);
      track.push({ start, end: length, from, to });
    }
  });
  return { track, length, scale: length / baselineLength };
}
