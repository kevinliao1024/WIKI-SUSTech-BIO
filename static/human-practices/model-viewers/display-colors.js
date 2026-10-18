/*
 * Display-only color blocks, visually matched to the supplied model posters.
 * The STL has no material IDs. These coordinates approximate the painted
 * appearance; they are not anatomical or cellular segmentation data.
 * Coordinates are normalized to each source mesh's bounds, with Z pointing up.
 */
export const DISPLAY_PALETTES = {
  brain: {
    blue: '#367dc7', cyan: '#08b5d1', yellow: '#f5dd2f',
    red: '#fa5556', orange: '#f4a229', cream: '#d5cf90',
  },
  cell: {
    yellow: '#f2db25', blue: '#2648bd', purple: '#ad85d5',
    cyan: '#079dbb', orange: '#f5a22f', cream: '#e1d5a1',
  },
};

export function displayColorKey(modelId, x, y, z) {
  if (modelId === 'brain') {
    // Lower cream and orange areas, then the poster's blue/cyan/yellow/red cap.
    if (z < 0.12) return 'cream';
    if (z < 0.44 && y > 0.48) return 'orange';
    if (z < 0.35) return 'cream';
    if (y > 0.69 - 0.08 * (z - 0.6)) return 'red';
    if (y < 0.20 + 0.12 * (z - 0.6)) return 'blue';
    if (z > 0.73 - 0.06 * y) return 'yellow';
    return 'cyan';
  }

  // Match the yellow body and cream outer edge before adding local accents.
  const radial = Math.hypot((x - 0.5) / 0.5, (y - 0.5) / 0.5);
  if (z < 0.48) return 'yellow';
  if (radial > 0.91) return 'cream';

  const center = ((x - 0.47) / 0.22) ** 2 + ((y - 0.38) / 0.24) ** 2;
  if (center < 1 && z > 0.64) {
    // A purple inset in the blue raised area recalls the poster's cutaway.
    return x > 0.49 && y < 0.43 && z < 0.87 ? 'purple' : 'blue';
  }
  if (center < 2.45 && z > 0.63) return 'cyan';
  if (z > 0.57 && x + y > 1.10) return 'orange';
  if (z > 0.60) return 'cream';
  return 'yellow';
}
