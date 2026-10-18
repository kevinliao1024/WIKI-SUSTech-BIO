(() => {
  'use strict';
  if (customElements.get('orca-interviews')) return;
  const CONTENT = /*__CONTENT__*/ {};
  const LABELS = /*__LABELS__*/ {};
  const CSS = /*__CSS__*/ '';
  const MODULE_BASE = new URL('.', document.currentScript?.src || document.baseURI);
  const FILES = {liInterview:'interview-li-original.png', fuAvatar:'avatar-fu-jiawen.png', liAvatar:'avatar-yali-teacher.png', wangAvatar:'avatar-wang-sijie.png'};
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase().replace(/[\u2010-\u2015]/g,'-');

  class OrcaInterviews extends HTMLElement {
    static get observedAttributes() { return ['asset-base']; }
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this._teacher=0; this._topic=0; this._full=false; this._query=''; this._selectedPair=-1; this._assetMap={};
    }
    set assets(value) { this._assetMap=value || {}; if(this._ready)this._render(); }
    get assets() { return {...this._assetMap}; }
    attributeChangedCallback() { if(this._ready)this._render(); }
    connectedCallback() {
      this.lang='en';
      if(this._ready)return;
      if(Object.prototype.hasOwnProperty.call(this,'assets')) { const value=this.assets; delete this.assets; this.assets=value; }
      this.shadowRoot.innerHTML=`<style>${CSS}</style><section class="widget en" lang="en">
        <header class="head"><div><h2></h2><p></p></div></header>
        <div class="search"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><input type="search" maxlength="200" autocomplete="off"><button type="button" data-action="clear" hidden></button></div>
        <p class="sr-only interaction-status" role="status" aria-live="polite" aria-atomic="true"></p><div class="content"></div><p class="source-note"></p><section class="records"></section>
        <dialog aria-labelledby="orca-evidence-title"><div class="dialog-head"><h3 id="orca-evidence-title"></h3><button type="button" class="close-dialog" data-action="close"></button></div><img><div class="dialog-caption"><p></p><a target="_blank" rel="noopener"></a></div></dialog>
      </section>`;
      this._ready=true;
      this._input=this.shadowRoot.querySelector('input');
      this._dialog=this.shadowRoot.querySelector('dialog');
      this._input.addEventListener('input',()=>{this._query=this._input.value;this._renderContent();});
      this._input.addEventListener('keydown',event=>{if(event.key==='Escape'){this._query='';this._input.value='';this._renderContent();}});
      this.shadowRoot.addEventListener('click',event=>this._click(event));
      this._dialog.addEventListener('click',event=>{if(event.target===this._dialog){const r=this._dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this._dialog.close();}});
      this._dialog.addEventListener('close',()=>this.shadowRoot.querySelector('[data-action="evidence"]')?.focus({preventScroll:true}));
      this._render();
    }
    _asset(key) {
      if(this._assetMap[key])return new URL(this._assetMap[key],document.baseURI).href;
      const configured=this.getAttribute('asset-base');
      const base=configured?new URL(configured.replace(/\/?$/,'/'),document.baseURI):new URL('assets/',MODULE_BASE);
      const url = new URL(FILES[key],base).href;
      return globalThis.wikiAssetURL?.(url) ?? url;
    }
    _portrait(person,extra='') {
      const ui=LABELS;
      const personName=person==='fu'?CONTENT.interviewer.name:CONTENT.teachers[person==='li'?0:1].name;
      return `<span class="portrait ${extra}"><img src="${escape(this._asset(person+'Avatar'))}" alt="${escape(personName+' · '+ui.avatar)}"></span>`;
    }
    _render() {
      const ui=LABELS, root=this.shadowRoot;
      root.querySelector('.head h2').textContent=ui.title;
      root.querySelector('.head p').textContent=ui.subtitle;
      this._input.placeholder=ui.placeholder;
      this._input.setAttribute('aria-label',ui.search);
      root.querySelector('.source-note').textContent=ui.note;
      root.querySelector('.records').innerHTML=`<h3>${escape(ui.recordsTitle)}</h3><figure class="record"><button type="button" data-action="evidence" aria-haspopup="dialog"><img src="${escape(this._asset('liInterview'))}" alt="${escape(ui.recordCaption)}" width="2880" height="829" loading="lazy" decoding="async"><span class="record-label"><span>${escape(ui.recordCaption)}</span><span>${escape(ui.expand)}</span></span></button></figure>`;
      this._dialog.querySelector('h3').textContent=ui.recordCaption;
      this._dialog.querySelector('img').src=this._asset('liInterview');
      this._dialog.querySelector('img').alt=ui.recordCaption;
      this._dialog.querySelector('.close-dialog').textContent=ui.close;
      this._dialog.querySelector('p').textContent=ui.imageNote;
      this._dialog.querySelector('a').textContent=ui.original;
      this._dialog.querySelector('a').href=this._asset('liInterview');
      this._renderContent();
    }
    _message(text,isQuestion) {
      const data=CONTENT,teacher=data.teachers[this._teacher];
      return `<div class="message ${isQuestion?'question':'answer'}">${this._portrait(isQuestion?'fu':this._teacher===0?'li':'wang','message-face')}<div class="body"><span class="speaker">${escape(isQuestion?data.interviewer.name:teacher.name)}</span><div class="bubble">${escape(text)}</div></div></div>`;
    }
    _terms() { return normalize(this._query).trim().split(/\s+/).filter(Boolean).slice(0,10); }
    _matches() {
      const terms=this._terms(), matches=[];
      CONTENT.teachers.forEach((teacher,ti)=>teacher.sections.forEach((section,si)=>section.pairs.forEach((pair,pi)=>{
        const text=[teacher.name,teacher.role,section.title,pair.q,pair.a].join(' ');
        if(terms.every(term=>normalize(text).includes(term)))matches.push({ti,si,pi});
      })));
      return matches;
    }
    _highlight(text) {
      const terms=this._query.trim().split(/\s+/).filter(Boolean).slice(0,10).sort((a,b)=>b.length-a.length);
      if(!terms.length)return escape(text);
      const pattern=terms.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
      const regex=new RegExp(pattern,'giu');
      let result='',from=0;
      for(const match of text.matchAll(regex)){result+=escape(text.slice(from,match.index))+'<mark>'+escape(match[0])+'</mark>';from=match.index+match[0].length;}
      return result+escape(text.slice(from));
    }
    _renderContent() {
      const ui=LABELS,data=CONTENT,teacher=data.teachers[this._teacher];
      const clear=this.shadowRoot.querySelector('[data-action="clear"]');clear.textContent=ui.clear;clear.hidden=!this._query;
      const target=this.shadowRoot.querySelector('.content');
      const status=this.shadowRoot.querySelector('.interaction-status');
      if(this._query.trim()) {
        const matches=this._matches();
        status.textContent=`${matches.length} ${ui.matches}. ${ui.resultLabel}.`;
        target.innerHTML=`<p class="results-title">${matches.length} ${escape(ui.matches)} · ${escape(ui.resultLabel)}</p><div class="results" aria-label="${escape(ui.searchResults)}">${matches.length?matches.map(({ti,si,pi})=>{
          const t=data.teachers[ti],s=t.sections[si],p=s.pairs[pi],limit=300,snippet=p.a.length>limit?p.a.slice(0,limit)+'…':p.a;
          return `<article class="result"><div class="result-meta">${this._portrait(ti===0?'li':'wang')}<span>${escape(t.name)} · ${escape(s.title)}</span></div><h3>${this._highlight(p.q)}</h3><p>${this._highlight(snippet)}</p><button type="button" data-action="result" data-teacher="${ti}" data-topic="${si}" data-pair="${pi}">${escape(ui.viewAnswer)}</button></article>`;
        }).join(''):`<p class="empty">${escape(ui.noResults)}</p>`}</div>`;
        return;
      }
      status.textContent=`${teacher.name}. ${this._full?ui.all:teacher.sections[this._topic].title}.`;
      const sections=this._full?teacher.sections:[teacher.sections[this._topic]];
      const feed=sections.map((s,index)=>(this._full?`<h3 class="section-title">${escape(s.title)}</h3>`:'')+s.pairs.map((p,pi)=>`<div class="pair ${!this._full&&pi===this._selectedPair?'active':''}" data-pair="${pi}" tabindex="-1">${this._message(p.q,true)}${this._message(p.a,false)}</div>`).join('')).join('');
      target.innerHTML=`<nav class="teachers" aria-label="${escape(ui.teachers)}">${data.teachers.map((t,i)=>`<button type="button" class="teacher" data-action="teacher" data-teacher="${i}" aria-pressed="${i===this._teacher}">${this._portrait(i===0?'li':'wang')}<strong>${escape(t.name)}</strong></button>`).join('')}</nav>
      <div class="panel"><aside class="sidebar"><div class="profile">${this._portrait(this._teacher===0?'li':'wang','large')}<h3>${escape(teacher.name)}</h3><p>${escape(teacher.role)}</p></div><nav class="topics" aria-label="${escape(ui.topics)}">${data.topics.map((topic,i)=>`<button type="button" data-action="topic" data-topic="${i}" aria-current="${!this._full&&i===this._topic}"><span class="topic-number">0${i+1}</span>${escape(topic)}</button>`).join('')}</nav></aside>
      <div class="main"><header class="room"><h3>${escape(data.interviewer.name)} × ${escape(teacher.name)}</h3><button type="button" class="text-button" data-action="full" aria-pressed="${this._full}">${escape(this._full?ui.byTopic:ui.full)}</button></header>
      <div class="feed">${feed}</div><footer class="bottom"><span class="counter">${escape(this._full?ui.all:ui.topic+' 0'+(this._topic+1)+' / 05')}</span><div class="steps"><button type="button" data-action="previous" ${this._full||this._topic===0?'disabled':''}>${escape(ui.previous)}</button><button type="button" data-action="next" ${this._full||this._topic===4?'disabled':''}>${escape(ui.next)}</button></div></footer></div></div>`;
    }
    _click(event) {
      const button=event.target.closest('[data-action]');if(!button || button.disabled)return;
      const action=button.dataset.action;
      if(action==='evidence'){this._dialog.showModal();return;}
      if(action==='close'){this._dialog.close();return;}
      this._selectedPair=-1;
      if(action==='clear'){this._query='';this._input.value='';this._renderContent();this._input.focus();return;}
      if(action==='teacher'){this._teacher=Number(button.dataset.teacher);this._full=false;}
      if(action==='topic'){this._topic=Number(button.dataset.topic);this._full=false;}
      if(action==='full')this._full=!this._full;
      if(action==='previous')this._topic=Math.max(0,this._topic-1);
      if(action==='next')this._topic=Math.min(4,this._topic+1);
      if(action==='result'){this._teacher=Number(button.dataset.teacher);this._topic=Number(button.dataset.topic);this._selectedPair=Number(button.dataset.pair);this._full=false;this._query='';this._input.value='';}
      this._renderContent();
      let focus=action==='result'?this.shadowRoot.querySelector('.pair.active'):action==='teacher'?this.shadowRoot.querySelector(`[data-action="teacher"][data-teacher="${this._teacher}"]`):action==='topic'?this.shadowRoot.querySelector(`[data-action="topic"][data-topic="${this._topic}"]`):this.shadowRoot.querySelector(`[data-action="${action}"]`);
      if(focus?.disabled)focus=this.shadowRoot.querySelector(`[data-action="topic"][data-topic="${this._topic}"]`);
      focus?.focus({preventScroll:true});if(action==='result')focus?.scrollIntoView({block:'nearest',behavior:'auto'});
    }
  }
  customElements.define('orca-interviews',OrcaInterviews);
})();
