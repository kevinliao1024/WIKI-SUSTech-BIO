// Shared reversible scroll mapping. Camera keys remain unchanged; the dementia
// comparison gets a short window of its own so its dots can assemble and then
// hand the page back to the particle take.
export const BURDEN_IN = .747;
export const BURDEN_OUT = .78;
// How much extra reading distance the comparison buys. The old value was 8,
// which stretched it to ~2.8 screens and made it read as a separate page.
const BURDEN_WEIGHT = 4.5;

export function buildScrollTrack(keys, { burden = true } = {}) {
  let baselineLength = 0, length = 0;
  const track = [];
  const cuts = burden ? [BURDEN_IN, BURDEN_OUT] : [];
  keys.slice(1).forEach((key, i) => {
    const previous = keys[i];
    const weight = key.stage === previous.stage
      ? (key.stage === 2 ? 3.6 : key.stage === 4 ? 6.5 : 1.6) : 1;
    baselineLength += (key.p - previous.p) * weight;
    const edges = [previous.p, ...cuts.filter(p => p > previous.p && p < key.p), key.p];
    for (let j = 1; j < edges.length; j++) {
      const from = edges[j - 1], to = edges[j], middle = (from + to) / 2;
      const start = length;
      const inBurden = middle >= BURDEN_IN && middle <= BURDEN_OUT;
      length += (to - from) * (inBurden ? BURDEN_WEIGHT : weight);
      track.push({ start, end: length, from, to });
    }
  });
  return { track, length, scale: length / baselineLength };
}
