const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path'),root=path.join(__dirname,'../../static/sap-demo');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'reporter-designer.js'),'utf8'),context);
const set=JSON.parse(vm.runInContext('JSON.stringify(reporterControlSet)',context));
const engine=require(path.join(root,'reporter-engine.js')),vector=require(path.join(root,'reporter-vector.js'));
const expected={
 'AC-F':'CAGCATGGAGGACGTGTGA','AC-R':'TGCCTCACACGTCCTCCAT',
 'INAC-F':'CAGCACGTCAGTCATGGCC','INAC-R':'TGCCGGCCATGACTGACGT'
};
let checks=0;const check=fn=>{fn();checks++;};
check(()=>assert.equal(set.matched_wt_core,'ATGGAGGACGTGCGA'));
for(const c of set.controls){
 check(()=>assert.equal(c.core.length,15));
 for(const o of c.oligos){check(()=>assert.equal(o.sequence,expected[o.name]));check(()=>assert.equal(o.sequence.length,19));}
 check(()=>assert.equal(c.oligos[0].sequence,'CAGC'+c.core));
 check(()=>assert.equal(c.oligos[1].sequence,'TGCC'+engine.rc(c.core)));
 check(()=>assert.equal(engine.translate(c.core),c.id==='AC'?'MEDV*':'TSVMA'));
 const assembled=vector.sequence.slice(0,vector.leftKeep)+c.core+vector.sequence.slice(vector.rightStart);
 check(()=>assert.equal(engine.sites(assembled,true).length,0));
 check(()=>assert.equal(assembled.length,7474));
}
const csv=vm.runInContext('controlOligosCsv()',context);
check(()=>assert.equal(csv.split('\r\n').length,5));
for(const [name,seq] of Object.entries(expected))check(()=>assert.ok(csv.includes('"'+name+'","'+seq+'","19"')));
console.log(`PASS: ${checks} saved control sequence, overhang, translation, vector and CSV checks`);
