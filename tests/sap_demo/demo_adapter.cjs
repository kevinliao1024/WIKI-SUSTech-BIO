const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../static/sap-demo');const calls=[];const store=new Map();
const context={URL,Response,structuredClone,console,queueMicrotask,setTimeout,crypto:require('node:crypto').webcrypto,
 location:{origin:'http://example.test',href:'http://example.test/team/sonar/'},document:{baseURI:'http://example.test/team/sonar/',addEventListener(){}},
 sessionStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},wf:{},notice(){},designRefresh(){},bindDesigner(){},bindWorkflow(){},bind(){},render(){},state:{population:'reporter',mode:'research'},api(){},download(){},exportResults(){}};
context.window={addEventListener(){},fetch:async input=>{const u=new URL(input);calls.push(u.pathname);assert.ok(u.pathname.startsWith('/team/sonar/'),'Must resolve under hosted subdirectory');return new Response(fs.readFileSync(path.join(root,u.pathname.replace('/team/sonar/',''))));}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'demo.js'),'utf8'),context);
(async()=>{
 const api=context.api;assert.equal((await api('/api/overview')).samples.length,32);
 let d=await api('/api/experiment-create',{name:'Example experiment · Reporter'});assert.equal(d.files.length,0);
 await assert.rejects(api('/api/experiment-compute'),/Load/);
 d=await api('/api/experiment-example',{stage:'mock_upload'});assert.equal(d.files.length,2);assert.equal(d.Theta,null);
 d=await api('/api/experiment-layer0');assert.equal(d.status,'theta_ready');assert.equal(d.Theta.controls.length,2);
 d=await api('/api/experiment-confirm-theta');assert.equal(d.status,'sample_upload');
 d=await api('/api/experiment-example',{stage:'sample_upload'});assert.equal(d.files.length,3);
 d=await api('/api/experiment-compute');assert.equal(d.status,'complete');assert.equal(d.result.samples[0].RAS.n_selected,32207);assert.ok(Math.abs(d.result.samples[0].RES.model_estimate_res_mass_fraction-.7454898213131972)<1e-12);
 assert.equal((await api('/api/experiments')).length,1);
 d=await api('/api/experiment-revise',{stage:'mock'});assert.equal(d.Theta,null);assert.equal(d.result,null);assert.equal(d.files.length,2);
 d=await api('/api/experiment-remove-file',{file_id:d.files[0].file_id});assert.equal(d.files.length,1);await assert.rejects(api('/api/experiment-layer0'),/Load/);
 const overview=await api('/api/overview');const id=overview.samples[0].sample_id;
 const research=await api('/api/analyze',{sample_id:id,population:'reporter'});assert.ok(research.diagnostic_points.points.length>0);
 const routine=await api('/api/analyze',{sample_id:id,population:'reporter',mode:'routine'});assert.equal(routine.RES.res_mass_fraction,null);
 await assert.rejects(api('/api/inverse',{ras:2}),/existing example/);
 assert.equal((await context.window.fetch('/api/import')).status,400);
 assert.ok(!calls.some(p=>p.includes('/api/')));
 // Onboarding follows each required click, including the Design → Analysis handoff.
 let detailOpen=false;context.$=selector=>selector==='#detail'?{open:detailOpen}:null;
 context.design={stage:0,text:'',accepted:false};context.state.page='design';
 const step=n=>assert.equal(context.demoTourStep().n,n);
 const tour=value=>vm.runInContext(value,context);
 step(1);context.design.text='example';step(2);context.design.stage=1;step(3);
 context.design.accepted=true;step(4);context.design.stage=2;step(5);
 tour('demoTour.designExported=true');step(6);assert.equal(context.demoTourStep().selector,'.area-switch [data-page="analyze"]');
 context.state.page='analyze';context.wf.view='welcome';context.wf.active=null;step(7);
 context.wf.view='new';context.wf.newDraft={name:''};step(8);context.wf.newDraft.name='Example';step(9);
 context.wf.view='experiment';context.wf.active='example';context.wf.data={status:'mock_upload',files:[]};step(10);
 context.wf.data.files=[{stage:'mock'},{stage:'mock'}];step(11);context.wf.data.status='theta_ready';step(12);
 context.wf.data.status='sample_upload';step(13);context.wf.data.files.push({stage:'sample'});step(14);
 context.wf.data.status='complete';step(15);detailOpen=true;step(16);detailOpen=false;
 tour('demoTour.detailsSeen=true');step(17);tour('demoTour.reportExported=true');step(18);
 tour('demoTour.restartAnalysis=true');step(7);assert.equal(context.demoTourStep().selector,'#wf-another');
 console.log('PASS: all 18 tutorial actions, checkbox confirmation, modal close, exports and workspace handoff.');
 console.log('PASS: staged example, invalidation, real results, reference diagnostics, routine mode and subdirectory isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
