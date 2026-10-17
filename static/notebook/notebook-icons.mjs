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
  apobec: [
    ['path', {d:'M10 29V14l13-7 13 7v10M10 29l13 8 6-4M17 16l6-3 6 3M17 28l6 3'}],
    ['path', {d:'m29 30 9-9 5 5-9 9-7 2zM36 23l5 5'}],
  ],
  gfa: [
    ['circle', {cx:24,cy:24,r:6}],
    ['path', {d:'M24 18V9l-4-4m4 4 5-3M30 24h9l4-4m-4 4 3 5M24 30v9l-4 4m4-4 5 3M18 24H9l-4-4m4 4-3 5M20 20l-8-8M28 20l8-8M28 28l8 8M20 28l-8 8'}],
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
  aav: [
    ['path', {d:'m24 4 17 10v20L24 44 7 34V14zM7 14l17 10 17-10M24 24v20M24 4v10M7 34l8-5m26 5-8-5'}],
    ['circle', {cx:24,cy:24,r:4,fill:'currentColor',stroke:'none'}],
  ],
  reporter: [
    ['path', {d:'M7 10v29h34M14 31v-7m9 7V18m9 13v-9M33 7v8m-4-4h8M39 17h4m-2-2v4'}],
    ['circle', {cx:23,cy:13,r:2,fill:'currentColor',stroke:'none'}],
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
