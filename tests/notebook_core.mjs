import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dayNumber,isoDay,groupTrack,dateBounds,overviewY,focusY,validateIndex} from '../static/notebook/notebook-core.mjs';
const index=JSON.parse(readFileSync(new URL('../static/notebook/index.json',import.meta.url)));
validateIndex(index);
assert.equal(index.records.length,178);
assert.equal(index.records.reduce((n,r)=>n+r.pages.length,0),181);
const bounds=dateBounds(index.records);
assert.equal(isoDay(bounds.start),'2026-06-21');assert.equal(isoDay(bounds.end),'2026-10-13');
// Equal calendar gaps stay equal, including months and unrecorded dates.
assert.equal(overviewY('2026-07-11',bounds.start)-overviewY('2026-07-01',bounds.start),overviewY('2026-09-11',bounds.start)-overviewY('2026-09-01',bounds.start));
const day='2026-09-26';
assert.ok(index.records.some(r=>r.trackId==='aav'&&r.date===day));
assert.ok(index.records.some(r=>r.trackId==='reporter'&&r.date===day));
for(const t of index.tracks){const groups=groupTrack(index.records,t.id);assert.ok(groups.every(g=>g.records.every(r=>r.trackId===t.id)));assert.deepEqual(groups.map(g=>g.date),groups.map(g=>g.date).sort());}
assert.equal(groupTrack(index.records,'puf').find(g=>g.date==='2026-07-28').records.length,2);
assert.equal(isoDay(dayNumber('2026-10-01')),'2026-10-01');
for(const bad of ['2026-02-30','2026-13-01','26-07-01','2026-07-01T00:00:00Z'])assert.throws(()=>dayNumber(bad));
const rows=[{day:dayNumber('2026-07-27'),y:58},{day:dayNumber('2026-07-28'),y:2200}];
assert.equal(focusY('2026-07-28',rows,2400),2200);
assert.equal(focusY('2026-07-27',rows,2400),58);
const duplicate=structuredClone(index);duplicate.records.push(duplicate.records[0]);assert.throws(()=>validateIndex(duplicate));
const badPage=structuredClone(index);badPage.records[0].pages[0].number=3;assert.throws(()=>validateIndex(badPage));
const unsafe=structuredClone(index);unsafe.records[0].pdf='../private.pdf';assert.throws(()=>validateIndex(unsafe));
assert.equal(dateBounds([]),null);assert.deepEqual(groupTrack([],'aav'),[]);
console.log('Notebook core: real-date scale, concurrent tracks, strict filtering, same-day records, variable-height mapping, invalid/empty index and date-only parsing passed.');
