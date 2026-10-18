'use strict';
/* Thin browser adapter. Original SAP templates, charts, design engine and handlers
   are reused. The fixed analysis case replays saved outputs, never new FCS runs. */
const demoFetch = window.fetch.bind(window);
const demoCache = new Map();
async function demoRead(name) {
 if(!demoCache.has(name)) demoCache.set(name, demoFetch(new URL('data/'+name,document.baseURI)).then(r=>{if(!r.ok)throw Error('Example resource unavailable: '+name);return r.json();}));
 return structuredClone(await demoCache.get(name));
}
let demoExperiment=null;
try { demoExperiment=JSON.parse(sessionStorage.getItem('sap.preview.experiment')||'null'); }catch(e){}
wf.active=demoExperiment?.experiment_id||null;
wfRemember=function(){};
wfDraft=function(){const d=wf.data;return {cell_type:d.cell_type,experiment_notes:d.experiment_notes,channel_map:{...d.channel_map},reporter_construct:d.reporter_construct,population:d.population,calibration_mode:d.calibration_mode,bootstrap_repeats:d.bootstrap_repeats,files:d.files.filter(f=>f.stage==='sample').map(f=>({...f}))};};
wfSaveDraft=function(){};wfClearDraft=function(){};
function demoSave(d){demoExperiment=d;try{sessionStorage.setItem('sap.preview.experiment',JSON.stringify(d));}catch(e){}return structuredClone(d);}
function demoRequire(ok,message){if(!ok)throw Error(message);}
api=async function(path,body={}){
 const u=new URL(path,location.origin), route=u.pathname;
 if(route==='/api/session')return {token:'static-example'};
 if(route==='/api/overview'){const d=await demoRead('overview.json');if(u.searchParams.get('mode')==='routine')d.samples.forEach(s=>{s.RES.res_mass_fraction=null;s.RES.mode='routine';});return d;}
 if(route==='/api/analyze'){const d=await demoRead('samples/'+encodeURIComponent(body.sample_id)+'-'+encodeURIComponent(body.population||'reporter')+'.json');if(body.mode==='routine'){d.RES.res_mass_fraction=null;d.RES.mode='routine';d.provenance.mode='routine';}return d;}
 if(route==='/api/experiment-config')return {default_save_parent:'Browser example session'};
 if(route==='/api/experiments')return demoExperiment?[structuredClone(demoExperiment)]:[];
 if(route==='/api/analyses')return [];
 if(route==='/api/experiment'){demoRequire(demoExperiment,'Start the example experiment first.');return structuredClone(demoExperiment);}
 if(route==='/api/inverse'){demoRequire(Math.abs(body.ras-0.9562602659677872)<1e-12&&!body.interval,'This preview contains the existing example mapping. Use the full SAP application for other inputs.');return demoRead('inverse.json');}
 if(route==='/api/fit'){
  const rows=(body.csv||'').trim().split('\n');const source=(await demoRead('overview.json')).samples.filter(s=>s.series==='S7');
  demoRequire(rows.length===source.length+1&&source.every(s=>rows.slice(1).some(r=>{const a=r.split(',');return a[0]===s.well_id&&Math.abs(Number(a[1])-s.condition_label/100)<1e-12&&Math.abs(Number(a[2])-s.RAS.find(r=>r.population_mode==='reporter').ras)<1e-12;})),'Load the real reference wells to view their saved example fit.');
  return demoRead('fit.json');
 }
 if(route==='/api/validate') {const m=await demoFetch(new URL('site-integrity.json',document.baseURI)).then(r=>r.json());for(const name of ['data/overview.json','data/case.json']){const bytes=await demoFetch(new URL(name,document.baseURI)).then(r=>r.arrayBuffer());const h=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');demoRequire(h===m.files[name],'Snapshot integrity check failed.');}return {ok:true};}
 const source=await demoRead('case.json');let d=demoExperiment?structuredClone(demoExperiment):source;
 if(route==='/api/experiment-create'){d={...source,name:body.name||source.name,files:[],Theta:null,result:null,status:'mock_upload'};return demoSave(d);}
 demoRequire(demoExperiment,'Start the example experiment first.');
 if(route==='/api/experiment-example'){
  if(body.stage==='mock_upload'){d.files=source.files.filter(f=>f.stage==='mock');d.Theta=null;d.result=null;d.status='mock_upload';}
  else if(body.stage==='sample_upload'){demoRequire(d.Theta,'Confirm Θ first.');d.files=source.files;d.result=null;d.status='sample_upload';}
  else throw Error('Load the example at the controls or samples step.');
 }else if(route==='/api/experiment-layer0'){demoRequire(d.files.filter(f=>f.stage==='mock').length===2,'Load the prepared Mock example first.');d.Theta=source.Theta;d.status='theta_ready';}
 else if(route==='/api/experiment-confirm-theta'){demoRequire(d.Theta,'Preview Θ first.');d.status='sample_upload';}
 else if(route==='/api/experiment-compute'){demoRequire(d.Theta&&d.files.some(f=>f.stage==='sample'),'Load the prepared sample example first.');d.result=source.result;d.status='complete';}
 else if(route==='/api/experiment-revise'){d.result=null;d.status=body.stage==='mock'?'mock_upload':'sample_upload';if(body.stage==='mock'){d.Theta=null;d.files=d.files.filter(f=>f.stage==='mock');}}
 else if(route==='/api/experiment-remove-file'){const f=d.files.find(f=>f.file_id===body.file_id);d.files=d.files.filter(f=>f.file_id!==body.file_id);d.result=null;if(f?.stage==='mock'){d.Theta=null;d.status='mock_upload';}}
 else throw Error('This operation requires the full SAP application.');
 return demoSave(d);
};
window.fetch=async function(input,options){const u=new URL(typeof input==='string'?input:input.url,document.baseURI);if(u.pathname.startsWith('/api/')){if(u.pathname==='/api/experiment-export')return demoFetch(new URL('data/example-report.zip',document.baseURI));return new Response(JSON.stringify({error:'This preview uses the prepared example. Open full SAP for custom data.'}),{status:400,headers:{'Content-Type':'application/json'}});}return demoFetch(input,options);};
const demoNotice=notice;
notice=function(message,error=false){const messages={
 'Loaded a separately saved example experiment':'Prepared example loaded in this browser session.',
 'Report exported. A copy is also saved in the experiment folder.':'Saved example report exported.',
 'Verification passed: file hashes, current context and model dependencies match.':'Saved example snapshot hashes verified. Raw FCS files are not hosted in this preview.',
 'Real reference wells loaded for the fitting example; the new fit is saved separately.':'Real reference wells loaded; the example fit is a saved SAP output.'
};if(message==='Report exported. A copy is also saved in the experiment folder.'){demoTour.reportExported=true;setTimeout(demoGuide,0);}demoNotice(messages[message]||message,error);};
exportResults=async function(ids=null){const selected=ids||state.data.samples.map(s=>s.sample_id);const reports=await Promise.all(selected.map(id=>api('/api/analyze',{sample_id:id,population:state.population,mode:state.mode})));download(JSON.stringify({kind:'saved_SAP_reference_snapshots',reports},null,2),'SONAR_reference_results.json','application/json');notice('Saved reference results exported.');};
function demoGuide(){
 // Remove upload windows after original event binding, preserving surrounding UI.
 document.querySelectorAll('input[type="file"]').forEach(el=>{const container=el.closest('.file-picker,.dropzone')||(el.id==='fit-file'?el.closest('.field'):null);(container||el.closest('label')||el).remove();});
 document.querySelectorAll('#wf-drop,#wf-pick-files').forEach(el=>el.remove());
 // Frozen analysis parameters prevent presenting cached values as new calculations.
 document.querySelectorAll('#wf-save-parent,#wf-cell-type,#wf-notes,#wf-reporter,[data-wf-channel],[data-wf-setting],[data-wf-file],#ras-input,#ras-low,#ras-high,#fit-csv,#fit-name').forEach(el=>{if(el.tagName==='SELECT'||el.type==='checkbox')el.disabled=true;else el.readOnly=true;el.title='Prepared example; custom data and settings are available in full SAP.';});
 const bottom=$('.welcome-bottom > span');if(bottom)bottom.textContent='Prepared example · progress saved in this browser session.';
 const browse=$('#wf-browse');if(browse){browse.disabled=true;browse.title='This example is saved in browser session storage.';}
 const pill=$('.local-pill');if(pill&&!pill.dataset.demo){pill.innerHTML='<span class="live-dot"></span>Example preview';pill.title='Original SAP interface. Sequence design runs in the browser; analysis replays saved real-data outputs.';pill.dataset.demo='true';}
 demoTourUpdate();
}
const demoDesignRefresh=designRefresh;designRefresh=function(){if(demoTour.hidden)demoDesignRefresh();else renderDesigner();};
const demoBindDesigner=bindDesigner;bindDesigner=function(){demoBindDesigner();demoGuide();};
const demoBindWorkflow=bindWorkflow;bindWorkflow=function(){demoBindWorkflow();demoGuide();};
const demoBind=bind;bind=function(){demoBind();demoGuide();};
const demoRender=render;render=async function(){if(state.page==='import'){state.page='analyze';location.hash='analyze';}await demoRender();demoGuide();};
document.addEventListener('input',()=>queueMicrotask(demoGuide));
document.addEventListener('change',()=>queueMicrotask(demoGuide));
document.addEventListener('click',()=>setTimeout(demoGuide,0));

/* State-based onboarding follows the real SAP controls, including the workspace handoff. */
const demoTour={hidden:false,restartAnalysis:false,designExported:false,detailsSeen:false,reportExported:false,key:'',target:null};
function demoTourStep(){
 const step=(n,id,selector,title,text)=>({n,id,selector,title,text});
 const analysisNav='.area-switch [data-page="analyze"]';
 if(state.page==='home')return step(1,'open-design','.area-switch [data-page="design"]','Start with Design','Click Design to try the prepared sequence example. The green frame always marks your next action.');
 if(state.page==='design'){
  if(design.stage===0)return design.text?step(2,'extract','#design-input button[type="submit"]','Check the example sequence','The existing APOE example is loaded. Click Extract and check to review the recognition region and proposed reporter changes.'):step(1,'design-example','#design-example','Load the prepared design','Click Load example. SAP will fill in the example sequence, editing site and design name for you.');
  if(design.stage===1)return design.accepted?step(4,'generate','#design-generate','Generate the oligos','Click Confirm and generate oligos to see the original SAP sequence results and export options.'):step(3,'confirm-design','#design-accept','Review and confirm','Review the highlighted sequence changes and checks, then tick this confirmation box to continue.');
  if(!demoTour.designExported)return step(5,'design-export','#design-csv','Save the design example','Your oligos are ready. Click Export order CSV to download them. The next step takes you to Analysis.');
  return step(6,'handoff',analysisNav,'Continue to Analysis','Click Analysis in the top navigation to try the prepared flow-cytometry case. This is a separate example, not experimental validation of the sequence you just designed.');
 }
 if(state.page==='analyze'){
  if($('#detail')?.open&&wf.data?.status!=='complete')return step(12,'close-control-details','#detail [data-close]','Return to the walkthrough','Review the control diagnostics, then close this window to continue with the highlighted action.');
  if(wf.view==='new')return wf.newDraft.name?step(9,'initialize','#wf-new-form button[type="submit"]','Initialize the example','Click Initialize and continue. This preview keeps example progress in your browser session.'):step(8,'init-example','#wf-example','Use the example setup','Click Load example to fill in the prepared experiment name. No file or folder upload is needed.');
  if(!wf.active)return step(7,'start','#wf-start','Start the analysis walkthrough','Click Start experiment. You will load the prepared controls, review Θ, then view the sample results.');
  if(wf.data?.status==='mock_upload')return wf.data.files.filter(f=>f.stage==='mock').length===2?step(11,'theta','#wf-mock-form button[type="submit"]','Preview the control parameters','Both Mock controls are ready. Click Generate Θ and preview to open their saved gates, backgrounds and thresholds.'):step(10,'mock-example','#wf-example','Load the prepared controls','Click Load example to add the existing MOCK1 and MOCK2 case. The upload window has been removed.');
  if(wf.data?.status==='theta_ready')return step(12,'confirm-theta','#wf-confirm','Review Θ and continue','Inspect the original gate plots and background values, then click Confirm Θ and continue.');
  if(wf.data?.status==='sample_upload')return wf.data.files.some(f=>f.stage==='sample')?step(14,'compute','#wf-sample-form button[type="submit"]','Open the saved sample results','Click Calculate RAS and RES. This browser walkthrough displays the real case’s saved SAP output; it does not run a new FCS analysis.'):step(13,'sample-example','#wf-example','Load the prepared sample','Click Load example to add 90B, whose maintained condition is 75% AC DNA mass. The confirmed Θ is preserved.');
  if(wf.data?.status==='complete'){
   if(demoTour.restartAnalysis)return step(7,'restart-analysis','#wf-another','Start the analysis walkthrough','A previous example is already complete. Click Start next experiment to walk through the prepared analysis case from the beginning.');
   if($('#detail')?.open)return step(16,'close-details','#detail [data-close]','Return to the result summary','Explore the sample diagnostics, then click the highlighted close button to return and export the report.');
   if(!demoTour.detailsSeen)return step(15,'result-details','[data-pipe-detail]','Inspect the sample details','The original result page shows RAS, RES and selected events. Click View details to inspect the sample diagnostics and interpretation limits.');
   if(!demoTour.reportExported)return step(17,'report-export','#pipeline-export','Download the example report','Click Export report to download the saved case, including its results and Θ parameters. RES is an AC DNA mass reference equivalent, not RNA editing percentage.');
   return step(18,'complete','.area-switch [data-page="sources"]','Walkthrough complete','You have explored Design and Analysis. Click Data Sources to browse the original reference samples and model, or finish the guide and explore freely.');
  }
 }
 return null;
}
function demoTourElements(){
 let card=$('#demo-coach'),ring=$('#demo-target-ring'),resume=$('#demo-guide-resume');
 if(!card){
  card=document.createElement('section');card.id='demo-coach';card.setAttribute('role','dialog');card.setAttribute('aria-modal','false');card.setAttribute('aria-labelledby','demo-coach-title');
  card.innerHTML='<div class="demo-coach-top"><span id="demo-coach-progress"></span><button type="button" id="demo-guide-hide" aria-label="Hide walkthrough">×</button></div><h2 id="demo-coach-title"></h2><p id="demo-coach-text" aria-live="polite"></p><div class="demo-coach-bottom"><span>Click the green-framed control</span><button type="button" id="demo-guide-locate">Show me ↗</button></div>';
  document.body.append(card);
  $('#demo-guide-hide').onclick=()=>{demoTour.hidden=true;demoGuide();};
  $('#demo-guide-locate').onclick=()=>{demoTour.target?.scrollIntoView({block:'center',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});demoTour.target?.focus({preventScroll:true});};
  ring=document.createElement('div');ring.id='demo-target-ring';ring.setAttribute('aria-hidden','true');document.body.append(ring);
  resume=document.createElement('button');resume.id='demo-guide-resume';resume.type='button';resume.textContent='Resume walkthrough';resume.onclick=()=>{demoTour.hidden=false;demoTour.key='';demoGuide();};document.body.append(resume);
 }
 return {card,ring,resume};
}
function demoTourPosition(){
 const card=$('#demo-coach'),ring=$('#demo-target-ring');if(!card||card.hidden||!demoTour.target?.isConnected)return;
 const target=demoTour.target.id==='design-accept'?demoTour.target.closest('label'):demoTour.target;
 const r=target.getBoundingClientRect(),gap=20,pad=14,w=card.offsetWidth,h=card.offsetHeight,vw=innerWidth,vh=innerHeight;
 Object.assign(ring.style,{left:r.left-7+'px',top:r.top-7+'px',width:r.width+14+'px',height:r.height+14+'px'});
 ring.hidden=r.bottom<0||r.top>vh;
 const candidates=[{x:r.right-w,y:r.bottom+gap},{x:r.right-w,y:r.top-h-gap},{x:r.left-w-gap,y:r.top},{x:r.right+gap,y:r.top}];
 const fits=c=>c.x>=pad&&c.y>=pad&&c.x+w<=vw-pad&&c.y+h<=vh-pad;
 const chosen=candidates.find(fits)||{x:Math.min(Math.max(pad,r.left),vw-w-pad),y:r.top>vh/2?pad:vh-h-pad};
 Object.assign(card.style,{left:Math.max(pad,chosen.x)+'px',top:Math.max(pad,chosen.y)+'px'});
}
function demoTourUpdate(){
 const s=demoTourStep(),{card,ring,resume}=demoTourElements();
 document.documentElement.classList.toggle('demo-guided',!!s&&!demoTour.hidden);
 document.querySelectorAll('.demo-next').forEach(el=>el.classList.remove('demo-next'));
 if(demoTour.target)demoTour.target.removeAttribute('aria-describedby');
 const target=s?$(s.selector):null;
 card.hidden=!target||demoTour.hidden;ring.hidden=card.hidden;resume.hidden=!demoTour.hidden;
 const host=$('#detail')?.open?$('#detail'):document.body;if(card.parentElement!==host){host.append(card,ring,resume);}
 if(!target||demoTour.hidden){demoTour.target=null;return;}
 const isNew=s.id!==demoTour.key||target!==demoTour.target;
 demoTour.target=target;demoTour.key=s.id;
 target.classList.add('demo-next');target.setAttribute('aria-describedby','demo-coach-text');
 $('#demo-coach-progress').textContent=`GUIDED EXAMPLE · ${s.n} / 18`;
 $('#demo-coach-title').textContent=s.title;$('#demo-coach-text').textContent=s.text;
 $('#demo-guide-hide').setAttribute('aria-label',s.id==='complete'?'Finish walkthrough':'Hide walkthrough');
 requestAnimationFrame(()=>{if(isNew&&target===demoTour.target){const r=target.getBoundingClientRect();if(r.top<85||r.bottom>innerHeight-35)target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});}demoTourPosition();});
}
document.addEventListener('click',e=>{
 if(e.target.closest('.area-switch [data-page="analyze"]')&&state.page==='design')demoTour.restartAnalysis=true;
 if(e.target.closest('#wf-start,#wf-another'))demoTour.restartAnalysis=false;
 if(e.target.closest('#design-csv'))demoTour.designExported=true;
 if(e.target.closest('#design-new,#design-example'))demoTour.designExported=false;
 if(e.target.closest('[data-pipe-detail]'))demoTour.detailsSeen=true;
 if(e.target.closest('#wf-start,#wf-another,#wf-example,#wf-add-samples,#wf-back-mock')){demoTour.detailsSeen=false;demoTour.reportExported=false;}
});
document.addEventListener('close',()=>setTimeout(demoGuide,0),true);
window.addEventListener('resize',demoTourPosition);
document.addEventListener('scroll',()=>requestAnimationFrame(demoTourPosition),true);
