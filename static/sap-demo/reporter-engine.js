/* Pure sequence design engine. Coordinates are 1-based on the supplied sense strand. */
'use strict';
const ReporterDesign = (() => {
 const code={};const bases='TCAG',amino='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';let j=0;
 for(const a of bases)for(const b of bases)for(const c of bases)code[a+b+c]=amino[j++];
 const rc=s=>s.split('').reverse().map(c=>({A:'T',T:'A',C:'G',G:'C'}[c]||'N')).join('');
 function translate(s){if(s.length%3)throw Error('Sequence length does not preserve a complete reading frame.');return s.match(/.{3}/g)?.map(c=>code[c]||'X').join('')||'';}
 function parse(text){
  if(typeof text!=='string'||text.length>1000000)throw Error('Enter a single sequence of no more than 200,000 nt.');
  const lines=text.trim().split(/\r?\n/);let name='',headers=0,parts=[];
  for(const line of lines){if(line.trim().startsWith('>')){headers++;if(parts.length||headers>1)throw Error('Upload one FASTA record at a time.');name=line.trim().slice(1).trim();}else parts.push(line);}
  const raw=parts.join('').replace(/\s/g,'').toUpperCase();
  if(!raw||raw.length>200000)throw Error('Sequence length must be 1–200,000 nt.');
  if(/[^ACGTURYSWKMBDHVN]/.test(raw))throw Error('Non-nucleotide characters found. Use a plain sequence or single FASTA record without line numbers.');
  return {sequence:raw.replace(/U/g,'T'),name,rna:raw.includes('U'),length:raw.length};
 }
 function integer(value,min,max,label){if(value===''||value==null||!Number.isInteger(Number(value))||Number(value)<min||Number(value)>max)throw Error(`${label} must be an integer from ${min}–${max}.`);return Number(value);}
 function prepare(input){
  const parsed=parse(input.text),s=parsed.sequence,t=integer(input.target,1,s.length,'Editing site')-1;
  const footprint=integer(input.footprint,4,60,'Recognition length'),spacer=integer(input.spacer,0,30,'Spacer length');
  if(s[t]!=='C')throw Error(`Position ${t+1} is ${s[t]}; select a C for C→U editing.`);
  const recognitionStart=t-spacer-footprint,padding=(3-(footprint+spacer)%3)%3,start=recognitionStart-padding,end=t+3;
  if(start<0)throw Error(`The editing site requires at least ${footprint+spacer+padding} nt upstream (including ${padding} nt frame padding). Add upstream sequence.`);
  if(end>s.length)throw Error('At least 2 nt are required after the editing site to preserve the complete target codon.');
  const original=s.slice(start,end);if(/[^ACGT]/.test(original))throw Error('The extracted region contains ambiguous bases. Confirm the recognition region, spacer and target codon sequence.');
  const triplet=s.slice(t,t+3),candidates=['CGA','CAA','CAG'].map(c=>({codon:c,amino:code[c],edited:'T'+c.slice(1),changes:[...c].filter((v,i)=>v!==triplet[i]).length,sameAmino:code[c]===code[triplet]}));
  candidates.sort((a,b)=>(b.sameAmino-a.sameAmino)||(a.changes-b.changes));
  return {name:String(input.name||parsed.name||'Reporter').trim().slice(0,100),input:parsed,target:t+1,footprint,spacer,padding,start:start+1,end,recognitionStart:recognitionStart+1,recognitionEnd:t-spacer,original,triplet,targetOffset:t-start,candidates};
 }
 function sites(s,circular=false){const result=[],seq=s+(circular?s.slice(0,5):'');for(let i=0;i<s.length;i++){const motif=seq.slice(i,i+6);if(motif==='GGTCTC'||motif==='GAGACC')result.push({position:i+1,motif});}return result;}
 function build(p,codon,v){
  if(!p.candidates.some(c=>c.codon===codon))throw Error('Select a codon that becomes a stop codon after C→U editing.');
  const core=p.original.slice(0,-3)+codon,edited=core.slice(0,p.targetOffset)+'T'+core.slice(p.targetOffset+1);
  const changes=[...core].flatMap((b,i)=>b===p.original[i]?[]:[{input_position:p.start+i,from:p.original[i],to:b}]);
  const delta=core.length-(v.rightStart-v.leftKeep),assembled=v.sequence.slice(0,v.leftKeep)+core+v.sequence.slice(v.rightStart),editedAssembled=v.sequence.slice(0,v.leftKeep)+edited+v.sequence.slice(v.rightStart);
  const protein=translate(assembled.slice(v.cdsStart,v.cdsEnd+delta)),editedProtein=translate(editedAssembled.slice(v.cdsStart,v.cdsEnd+delta)),targetAA=(v.leftKeep+p.targetOffset-v.cdsStart)/3;
  const junction='GGCAGC'+core+'GGCAGC',cuts=sites(assembled,true),editedCuts=sites(editedAssembled,true);
  const stops=[...protein].flatMap((a,i)=>a==='*'?[i]:[]),editedStops=[...editedProtein].flatMap((a,i)=>a==='*'?[i]:[]);
  const checks=[
   {label:'Recognition region and spacer preserved',pass:core.slice(p.padding,p.targetOffset)===p.original.slice(p.padding,p.targetOffset)},
   {label:'Reading frame preserved after assembly',pass:core.length%3===0&&Number.isInteger(targetAA)},
   {label:'No premature stop in WT',pass:stops.length===1&&stops[0]===protein.length-1,detail:stops.filter(i=>i!==protein.length-1).map(i=>`Position ${i+1} codon`).join(', ')},
   {label:'Editing creates a stop at the selected position',pass:editedStops[0]===targetAA},
   {label:'No BsaI sites in the full assembled plasmid',pass:cuts.length===0&&editedCuts.length===0,detail:cuts.map(x=>`${x.motif} @ ${x.position}`).join(', ')},
   {label:'Complementary oligo cores and correct overhangs',pass:rc(rc(core))===core&&v.forwardEnd==='CAGC'&&v.reverseEnd==='TGCC'}
  ];
  return {schema:'sonar-reporter-design-v1',name:p.name,coordinates:{basis:'1-based, supplied 5-to-3 sense strand',target:p.target,start:p.start,end:p.end,recognitionStart:p.recognitionStart,recognitionEnd:p.recognitionEnd},settings:{footprint:p.footprint,spacer:p.spacer,padding:p.padding},input:p.input,original:p.original,core,editedCore:edited,codon,editedCodon:'T'+codon.slice(1),changes,oligos:[{name:p.name+'-WT-F',sequence:v.forwardEnd+core},{name:p.name+'-WT-R',sequence:v.reverseEnd+rc(core)}],junction,junctionProtein:translate(junction),editedJunctionProtein:translate('GGCAGC'+edited+'GGCAGC'),assembled,editedAssembled,protein,editedProtein,checks,valid:checks.every(c=>c.pass),vector:{name:v.name,source:v.source,source_sha256:v.source_sha256,package_sha256:v.package_sha256,cds_source:v.cds_source,cds_sha256:v.cds_sha256,length:v.sequence.length,status:v.status},protocols:v.protocols,synthesis:{five_prime:'phosphate on both strands',three_prime:'free OH',purification:'PAGE recommended'},scope:'Computational sequence design; physical acceptor and constructed clone require sequence confirmation.'};
 }
 return {parse,prepare,build,rc,translate,sites};
})();
if(typeof module!=='undefined')module.exports=ReporterDesign;
