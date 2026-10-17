import {mount as sequence} from './modules/sequence.mjs';
import {mount as reporter} from './modules/reporter.mjs';
import {mount as flow} from './modules/flow.mjs';
import {mount as layers} from './modules/layers.mjs';
import {mount as fit} from './modules/fit.mjs';
const mounted=[];
async function load(name){const response=await fetch(new URL(`./data/${name}`,import.meta.url));if(!response.ok)throw Error('Resource unavailable');return response.json();}
function mount(id,fn,config){const root=document.getElementById(id);if(!root)return;try{mounted.push(fn(root,config));}catch{const p=document.createElement('p');p.className='sonar-error';p.textContent='The interactive view is unavailable. Use the tutorial text and source resources below.';root.append(p);}}
mount('sonar-reporter-explorer',reporter);mount('sonar-fit-guide',fit);
load('sequence.v1.json').then(example=>mount('sonar-sequence-playground',sequence,{example})).catch(()=>{});
load('flow.v1.json').then(data=>{mount('sonar-flow-playground',flow,{data,onSelection:detail=>document.dispatchEvent(new CustomEvent('sonar:sample-selection',{detail}))});mount('sonar-layer-explorer',layers,{data,eventTarget:document});}).catch(()=>{mount('sonar-flow-playground',flow,{data:null});mount('sonar-layer-explorer',layers,{data:null,eventTarget:document});});
load('screenshots.json').then(items=>{for(const item of items){const gallery=document.querySelector(`[data-sap-gallery="${item.group}"]`);if(!gallery)continue;if(!gallery.querySelector('figure'))gallery.replaceChildren();const figure=document.createElement('figure'),a=document.createElement('a'),img=document.createElement('img'),caption=document.createElement('figcaption');a.href=new URL(item.file,import.meta.url).href;a.target='_blank';a.rel='noopener';img.src=a.href;img.alt=item.alt;img.loading='lazy';img.width=1440;img.height=1000;a.append(img);caption.textContent=item.caption;figure.append(a,caption);gallery.append(figure);}}).catch(()=>{});
window.addEventListener('pagehide',event=>{if(!event.persisted)mounted.forEach(instance=>instance?.destroy?.());},{once:true});
