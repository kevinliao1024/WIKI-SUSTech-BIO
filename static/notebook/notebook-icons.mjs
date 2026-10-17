// A shared 48px drawing grid, rounded strokes and small solid accents keep the
// nine editorial symbols consistent. These are navigation icons, not diagrams.
const drawings = {
  fundmental: [
    ['path', {d:'M15 6c0 15 18 21 18 36M33 6c0 15-18 21-18 36M16 10h16M18 17h12M19 31h10M16 38h16'}],
    ['circle', {cx:24,cy:24,r:3,fill:'currentColor',stroke:'none'}],
  ],
  puf: [
    ['path', {d:'M8 32c10 9 23 9 32-2M14 12l-5 6 5 6M22 8l-3 8 5 6M31 10l-1 8 6 4M39 17l1 7 5 3'}],
    ['path', {d:'m13 35 1-5m8 8 1-5m8 4-1-5',opacity:'.55'}],
  ],
  // APOBEC: a three-pronged trident; Gfa: a promoter / transcription arrow.
  apobec: [
    ['path', {d:'M24 42V6m-5 6 5-6 5 6M10 12v10c0 7 6 10 14 10s14-3 14-10V12M6 17l4-5 4 5m20 0 4-5 4 5M19 42h10'}],
  ],
  gfa: [
    ['path', {d:'M5 36h38M16 36V13h23m-7-7 7 7-7 7'}],
    ['path', {d:'M7 32v8m5-8v8',opacity:'.5'}],
  ],
  mre: [
    ['path', {d:'M8 37h12V17a7 7 0 0 1 14 0v20h7M20 19h14M20 25h14M20 31h14'}],
    ['path', {d:'M5 9v10m-3-5h6',opacity:'.55'}],
    ['circle', {cx:13,cy:37,r:2,fill:'currentColor',stroke:'none'}],
  ],
  aso: [
    ['path', {d:'M5 16h38M10 32h28M12 16v6m8-6v6m8-6v6m8-6v6M12 26v6m8-6v6m8-6v6m8-6v6'}],
    ['path', {d:'m7 13-3 3 3 3m30 10 3 3-3 3',opacity:'.55'}],
  ],
  // Front-facing edges of a projected regular icosahedron (20 triangular faces).
  aav: [
    ['path', {d:'M26.1 9.4 27.1 28.4M26.1 9.4 9.7 20.9M27.1 28.4 9.7 20.9M26.1 9.4 41.6 20.9M27.1 28.4 41.6 20.9M26.1 9.4 13.3 8.6M26.1 9.4 33.0 8.6M13.3 8.6 33.0 8.6M13.3 8.6 9.7 20.9M33.0 8.6 41.6 20.9M27.1 28.4 15.0 39.4M27.1 28.4 34.7 39.4M15.0 39.4 34.7 39.4M15.0 39.4 9.7 20.9M34.7 39.4 41.6 20.9M13.3 8.6 6.4 27.1M6.4 27.1 9.7 20.9M15.0 39.4 6.4 27.1'}],
  ],
  // Adapted from the team's SAP / SONAR symbol: broken concentric arcs + core.
  reporter: [
    ['path', {d:'M9 32a18 18 0 0 1 26-22M42 27a18 18 0 0 1-23 15M12 30a13 13 0 0 1 15-19M18 18a9 9 0 1 1 5 15M27 28a5 5 0 0 1-6 0'}],
    ['path', {d:'M34 15a14 14 0 0 1 4 8',opacity:'.45'}],
    ['circle', {cx:39,cy:12,r:1,fill:'currentColor',stroke:'none',opacity:'.45'}],
    ['circle', {cx:24,cy:24,r:2.2,fill:'currentColor',stroke:'none'}],
  ],
  fv: [
    ['path', {d:'M40 22A16 16 0 1 0 26 40M19 14c-7 0-9 9-4 13M27 14l3 3'}],
    ['circle', {cx:23,cy:24,r:4}],
    ['path', {d:'m29 34 5 5 10-12'}],
  ],
};

export function createTrackIcon(id) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key,value] of Object.entries({viewBox:'0 0 48 48',fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false','data-icon':id})) node.setAttribute(key,value);
  for (const [tag,attrs] of drawings[id] || []) {
    const shape = document.createElementNS(node.namespaceURI,tag);
    for (const [key,value] of Object.entries(attrs)) shape.setAttribute(key,value);
    node.append(shape);
  }
  return node;
}
