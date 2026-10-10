import {OSI,TCPIP} from './content.js';
import {ATLAS,protocolIds,LAYER_GUIDES} from './protocol-data.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svgStart=(p,height,suffix='work')=>`<svg class="protocol-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 ${height}" role="group" aria-label="${esc(p.name)}${suffix==='work'?' workflow diagram':' relationship diagram'}"><title>${esc(p.title)}</title><defs><marker id="arrow-${p.id}-${suffix}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#789a65"/></marker></defs>`;
// SVG与文字共用steps骤Data，点击或键盘激活图中steps骤即可查看解释。
export function workDiagram(p,active=0){
 let out='';
 if(p.diagram==='sequence'){
  const height=118+p.steps.length*65,xs=p.actors.map((_,i)=>110+i*480/(p.actors.length-1));
  out=svgStart(p,height)+p.actors.map((a,i)=>`<rect class="diagram-actor" x="${xs[i]-86}" y="16" width="172" height="46" rx="10"/><text class="diagram-actor-text" x="${xs[i]}" y="44" text-anchor="middle">${esc(a)}</text><path class="diagram-lifeline" d="M ${xs[i]} 69 V ${height-18}"/>`).join('');
  out+=p.steps.map((s,i)=>{
   const x1=xs[s.from],x2=xs[s.to],y=111+i*65,self=s.from===s.to,side=x1>350?-1:1,lost=s.label.includes('lost');
   const end=lost?(x1+x2)/2:x2;
   const path=self?`M ${x1} ${y-3} h ${side*36} v 24 h ${-side*36}`:`M ${x1} ${y+13} H ${end}`;
   const tx=self?x1+side*49:(x1+x2)/2,anchor=self?(side>0?'start':'end'):'middle';
   return `<g class="diagram-step ${i===active?'selected':''} ${lost?'lost':''}" data-diagram-step="${i}" role="button" tabindex="0" aria-pressed="${i===active}" aria-label="${esc(s.label)}"><rect class="diagram-hit" x="12" y="${y-23}" width="676" height="57" rx="8"/><text class="diagram-message" x="${tx}" y="${y-5}" text-anchor="${anchor}">${esc(s.label)}</text><path class="diagram-arrow" d="${path}" ${lost?'':`marker-end="url(#arrow-${p.id}-work)"`}/>${lost?`<text class="diagram-loss" x="${end+13}" y="${y+19}">×</text>`:''}<text class="diagram-number" x="28" y="${y+20}">${String(i+1).padStart(2,'0')}</text></g>`;
  }).join('');
 }else{
  // 蛇形布局保持处理路径简洁，最多三个节点并排。
  const positions=[[120,74],[350,74],[580,74],[580,229],[350,229],[120,229]];
  out=svgStart(p,330);
  out+=p.steps.map((s,i)=>{
   const [ax,ay]=positions[s.from],[bx,by]=positions[s.to],horizontal=ay===by,dir=bx>ax?1:-1;
   const x1=horizontal?ax+dir*88:ax,y1=horizontal?ay:ay+27,x2=horizontal?bx-dir*88:bx,y2=horizontal?by:by-27;
   return `<g class="diagram-step ${i===active?'selected':''}" data-diagram-step="${i}" role="button" tabindex="0" aria-pressed="${i===active}" aria-label="${esc(s.label)}"><rect class="diagram-hit" x="${horizontal?Math.min(ax,bx)+88:ax-25}" y="${horizontal?ay-28:ay+28}" width="${horizontal?54:50}" height="${horizontal?60:100}" rx="7"/><path class="diagram-arrow" d="M ${x1} ${y1} L ${x2} ${y2}" marker-end="url(#arrow-${p.id}-work)"/><text class="diagram-number" x="${horizontal?(ax+bx)/2:ax-35}" y="${horizontal?ay+36:(ay+by)/2+5}" text-anchor="middle">${i+1}</text></g>`;
  }).join('');
  out+=p.actors.map((a,i)=>{const[x,y]=positions[i],selected=p.steps[active].from===i||p.steps[active].to===i;return `<g class="flow-node ${selected?'node-active':''}"><rect x="${x-88}" y="${y-27}" width="176" height="54" rx="10"/><text x="${x}" y="${y+5}" text-anchor="middle">${esc(a)}</text></g>`;}).join('');
  out+='<text class="diagram-caption" x="350" y="302" text-anchor="middle">Arrows show processing order; select an arrow or a step below for details</text>';
 }
 return out+'</svg>';
}
export function relationDiagram(p){
 const height=Math.max(154,50+p.links.length*72),center=height/2;
 let out=svgStart(p,height,'relations');
 out+=`<rect class="relation-origin" x="25" y="${center-28}" width="165" height="56" rx="11"/><text class="relation-origin-text" x="107" y="${center+5}" text-anchor="middle">${esc(p.name)}</text>`;
 out+=p.links.map((l,i)=>{const y=43+i*72;return `<path class="relation-path" d="M 190 ${center} H 212 V ${y} H 493" marker-end="url(#arrow-${p.id}-relations)"/><rect class="relation-label-bg" x="224" y="${y-19}" width="263" height="25" rx="4"/><text class="relation-edge-text" x="233" y="${y-2}">${esc(l.text)}</text><g class="relation-target" data-related="${l.id}" role="button" tabindex="0" aria-label="View ${esc(ATLAS[l.id].name)} details"><rect x="505" y="${y-24}" width="170" height="48" rx="9"/><text x="590" y="${y+5}" text-anchor="middle">${esc(ATLAS[l.id].name)}</text></g>`;}).join('');
 return out+'</svg>';
}
export class ProtocolAtlas{
 constructor(root,onModel,onLocate){this.root=root;this.onModel=onModel;this.onLocate=onLocate;this.model='osi';this.layer='application';this.id='http';this.step=0;this.search='';this.open=new Map();this.render();}
 layers(){return this.model==='osi'?OSI:TCPIP;}
 setModel(model){this.model=model;const layer=this.layers().find(l=>protocolIds(model,l.id).includes(this.id));this.layer=layer?.id||this.layers()[0].id;this.render();}
 setLayer(id){this.layer=id;this.search='';this.id=protocolIds(this.model,id)[0];this.step=0;this.render();}
 select(id){if(!ATLAS[id])return;this.id=id;this.step=0;this.search='';this.layer=this.layers().find(l=>protocolIds(this.model,l.id).includes(id)).id;this.render();this.root.querySelector('#protocol-title')?.focus?.();}
 render(){
  const layer=this.layers().find(l=>l.id===this.layer);
  this.root.innerHTML=`<header class="protocol-page-heading"><div><span class="eyebrow">PROTOCOL ATLAS / ILLUSTRATED GUIDE</span><h1>How do protocols connect two hosts?</h1><p>Find protocols by layer, follow their diagrams, then explore mechanisms, fields and relationships.</p></div><div class="protocol-model" role="group" aria-label="Protocol catalogue network model"><button data-atlas-model="osi" class="${this.model==='osi'?'active':''}" aria-pressed="${this.model==='osi'}">OSI: 7 layers</button><button data-atlas-model="tcpip" class="${this.model==='tcpip'?'active':''}" aria-pressed="${this.model==='tcpip'}">TCP/IP: 4 layers</button></div></header>
  <nav class="protocol-layer-nav" aria-label="Browse protocols by layer">${this.layers().map(l=>`<button data-atlas-layer="${l.id}" class="${l.id===this.layer?'active':''}" style="--layer-color:${l.color}" aria-pressed="${l.id===this.layer}"><span>L${l.number}</span><b>${l.name}</b><small>${protocolIds(this.model,l.id).length} entries</small></button>`).join('')}</nav>
  <div class="protocol-layer-guide"><b>${layer.name}</b><p>${LAYER_GUIDES[this.layer]}</p><button id="locate-protocol-layer">Locate in 3D ↗</button></div>
  <div class="protocol-layout"><aside class="protocol-catalogue" aria-label="Protocols in this layer"><div class="catalogue-heading"><span class="eyebrow">${layer.name} · Protocols and mechanisms</span><label class="protocol-search-label">Filter this layer<input id="protocol-search" type="search" value="${esc(this.search)}" placeholder="Name or function keyword" autocomplete="off"></label></div><div id="protocol-list"></div><p class="catalogue-note">Includes ${Object.keys(ATLAS).length} common protocols, formats and technologies for courses and practical work; this is not an exhaustive catalogue.<br>TCP and UDP are transport protocols; the four-layer suite is called TCP/IP.</p></aside><article id="protocol-detail" class="protocol-detail"></article></div>`;
  this.root.querySelectorAll('[data-atlas-model]').forEach(b=>b.addEventListener('click',()=>this.onModel(b.dataset.atlasModel)));
  this.root.querySelectorAll('[data-atlas-layer]').forEach(b=>b.addEventListener('click',()=>this.setLayer(b.dataset.atlasLayer)));
  this.root.querySelector('#locate-protocol-layer').addEventListener('click',()=>this.onLocate(this.layer));
  this.root.querySelector('#protocol-search').addEventListener('input',e=>{this.search=e.target.value;this.renderList();});
  this.renderList();this.renderDetail();
 }
 renderList(){const ids=protocolIds(this.model,this.layer).filter(id=>`${ATLAS[id].name} ${ATLAS[id].title} ${ATLAS[id].role}`.toLowerCase().includes(this.search.trim().toLowerCase()));const list=this.root.querySelector('#protocol-list');list.innerHTML=ids.length?ids.map(id=>{const p=ATLAS[id];return `<button class="catalogue-item ${id===this.id?'active':''}" data-protocol="${id}" aria-pressed="${id===this.id}"><span class="protocol-type">${esc(p.kind)}</span><b>${esc(p.name)}<span>↗</span></b><small>${esc((ATLAS[id].title.split(' · ')[1]||p.title))}</small></button>`;}).join(''):'<p class="catalogue-empty">No matches in this layer. Try another keyword or layer.</p>';list.querySelectorAll('[data-protocol]').forEach(b=>b.addEventListener('click',()=>this.select(b.dataset.protocol)));}
 details(key,title,body,defaultOpen=false){return `<details class="protocol-fold" data-protocol-open="${key}" ${this.open.has(key)?this.open.get(key)?'open':'':defaultOpen?'open':''}><summary>${title}</summary><div class="protocol-fold-body">${body}</div></details>`;}
 renderDetail(){const p=ATLAS[this.id],s=p.steps[this.step];const body=this.root.querySelector('#protocol-detail');body.innerHTML=`<header class="protocol-detail-heading"><div><span class="protocol-type">${esc(p.kind)}</span><h2 id="protocol-title" tabindex="-1">${esc(p.title)}</h2><p>${esc(p.role)}</p></div><span class="protocol-meta">${esc(p.meta)}</span></header>
 ${this.details(p.id+'-definition','01 / Definition and responsibility',`<p>${esc(p.brief)}</p>`,true)}
 <section class="protocol-working" aria-label="Interactive workflow diagram"><div class="working-heading"><h3>02 / Understand the workflow</h3><span>${p.diagram==='sequence'?'Message sequence':'Processing flow'} · ${p.steps.length} steps</span></div><p class="diagram-instruction">Green marks the current step; red × marks example loss. Select an arrow or a step below.</p><div class="diagram-scroll">${workDiagram(p,this.step)}</div><nav class="diagram-step-nav" aria-label="Choose workflow step">${p.steps.map((v,i)=>`<button data-protocol-step="${i}" class="${i===this.step?'active':''}" aria-pressed="${i===this.step}"><span>${String(i+1).padStart(2,'0')}</span>${esc(v.label.replace(/^[①②③④⑤⑥]\s*/,''))}</button>`).join('')}</nav><div class="protocol-step-detail" aria-live="polite"><span class="step-badge">${String(this.step+1).padStart(2,'0')}</span><div><h4>${esc(s.label.replace(/^[①②③④⑤⑥]\s*/,''))}</h4><p>${esc(s.text)}</p></div></div><div class="protocol-step-controls"><button id="protocol-prev" ${this.step===0?'disabled':''}>← Previous</button><span>${this.step+1} / ${p.steps.length}</span><button id="protocol-next" ${this.step===p.steps.length-1?'disabled':''}>Next →</button><button id="protocol-reset">↺ Start over</button></div>${p.note?`<p class="protocol-diagram-note">Diagram scope: ${esc(p.note)}</p>`:''}</section>
 ${this.details(p.id+'-mechanisms','03 / Mechanisms and fields',`<div class="protocol-keypoint"><b>Key mechanism</b><p>${esc(p.focus)}</p></div>${p.topics.map(t=>`<section class="protocol-topic"><h4>${esc(t.title)}</h4><p>${esc(t.text)}</p></section>`).join('')}`)}
 ${this.details(p.id+'-relations','04 / Working with other protocols',`<p>Edges describe transport, formats or functional cooperation; <b>these protocols need not all be stacked in order</b>. Select a node to continue.</p><div class="diagram-scroll relation-scroll">${relationDiagram(p)}</div><div class="protocol-related-list">${p.links.map(l=>`<button data-related="${l.id}"><b>${esc(ATLAS[l.id].name)}</b><span>${esc(l.text)}</span><small>View illustrated guide →</small></button>`).join('')}</div>`,true)}
 <footer class="protocol-reference">${p.source?`<a href="${p.source}" target="_blank" rel="noopener noreferrer">Read ${p.source.includes('ieee')?'IEEE reference':'RFC standard'} ↗</a>`:'Application mechanism example · No single standard'}<button id="protocol-back-3d">Return to layer in 3D ↗</button><span>Diagrams simplify teaching concepts; consult the relevant standards for complete details.</span></footer>`;
 const choose=i=>{this.step=i;this.renderDetail();this.root.querySelector(`[data-protocol-step="${i}"]`)?.focus?.();};
 body.querySelectorAll('[data-protocol-step]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.protocolStep))));
 body.querySelectorAll('[data-diagram-step]').forEach(b=>{b.addEventListener('click',()=>choose(Number(b.dataset.diagramStep)));b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(Number(b.dataset.diagramStep));}});});
 body.querySelector('#protocol-prev').addEventListener('click',()=>choose(Math.max(0,this.step-1)));
 body.querySelector('#protocol-next').addEventListener('click',()=>choose(Math.min(p.steps.length-1,this.step+1)));
 body.querySelector('#protocol-reset').addEventListener('click',()=>choose(0));
 body.querySelectorAll('[data-related]').forEach(b=>{b.addEventListener('click',()=>this.select(b.dataset.related));b.addEventListener('keydown',e=>{if(b.tagName.toLowerCase()!=='button'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();this.select(b.dataset.related);}});});
 body.querySelectorAll('[data-protocol-open]').forEach(d=>d.addEventListener('toggle',()=>this.open.set(d.dataset.protocolOpen,d.open)));
 body.querySelector('#protocol-back-3d').addEventListener('click',()=>this.onLocate(this.layer));
 }
}
