import {OSI,TCPIP,PROTOCOLS,LABS} from './content.js';
import {NetworkScene} from './scene.js';
import {buildJourney,buildTransportJourney,packetChanges} from './flows.js';
import {advanceClock} from './playback.js';
import {LearningHub} from './learning.js';
import {ProtocolAtlas} from './protocols.js';
import {CHAPTERS,chapterKeys} from './curriculum.js';

const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={model:'osi',view:'explore',selected:0,scenario:'http',lab:'handshake',index:-1,playing:false,elapsed:0,last:0};
const openState=new Map();
const layers=()=>state.model==='osi'?OSI:TCPIP;
const scene=new NetworkScene($('scene-canvas'),$('scene-labels'),index=>selectLayer(index,true));
scene.setLayers(layers());scene.setSelected(0);
const hub=new LearningHub($('learning-hub'),key=>{const index=layers().findIndex(l=>chapterKeys(l.id).includes(key));if(index>=0)selectLayer(index,true);document.querySelector('.scene').scrollIntoView({behavior:'smooth',block:'start'});});
const protocolAtlas=new ProtocolAtlas($('protocol-screen'),model=>setModel(model),id=>{setView('explore');const index=layers().findIndex(l=>l.id===id);if(index>=0)selectLayer(index,true);document.querySelector('.scene').scrollIntoView({behavior:'smooth',block:'start'});});


const section=(key,index,title,body,defaultOpen=false)=>`<details class="knowledge-section" data-save="${key}" ${openState.has(key)?openState.get(key)?'open':'':defaultOpen?'open':''}><summary data-index="${index}">${title}</summary><div class="knowledge-content">${body}</div></details>`;
function protocolMarkup(key){const p=PROTOCOLS[key];const save='protocol-'+key;return `<details class="protocol" data-save="${save}" ${openState.get(save)?'open':''}><summary><b>${escape(p.name)}</b><span>${escape(p.title)}</span><small>${escape(p.meta)}</small></summary><div class="protocol-body"><p>${escape(p.brief)}</p><dl>${p.topics.map(t=>`<dt>${escape(t.title)}</dt><dd>${escape(t.text)}</dd>`).join('')}</dl><button class="view-protocol-link" data-open-protocol="${key}">Open illustrated protocol guide →</button>${p.source?`<a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">Read the standard ↗</a>`:''}</div></details>`;}
function saveAccordions(){document.querySelectorAll('[data-open-protocol]').forEach(b=>b.addEventListener('click',()=>{setView('protocols');protocolAtlas.select(b.dataset.openProtocol);}));document.querySelectorAll('details[data-save]').forEach(el=>el.addEventListener('toggle',()=>openState.set(el.dataset.save,el.open)));}

function renderLayers(){const ls=layers();$('layer-list').innerHTML=ls.map((l,i)=>`<button class="layer-item ${i===state.selected?'active':''}" style="--layer-color:${l.color}" data-layer="${i}" aria-pressed="${i===state.selected}"><span class="layer-num">${l.number.toString().padStart(2,'0')}</span><span><b>${l.name}</b><small>${l.en.toUpperCase()}</small></span><span class="arrow">›</span></button>`).join('');$('layer-list').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>selectLayer(Number(btn.dataset.layer),true)));}
function inspectorLayer(){const l=layers()[state.selected];const k=l.id;const html=`<header class="inspector-heading"><div class="focus-label">03 / LAYER KNOWLEDGE<span class="layer-pill">LAYER ${l.number.toString().padStart(2,'0')}</span></div><h2>${l.name}</h2><span class="en">${l.en.toUpperCase()} LAYER</span><p class="focus-question">${l.question}</p><dl class="facts"><div><dt>Data unit</dt><dd>${l.unit}</dd></div><div><dt>Main scope</dt><dd>${l.scope}</dd></div></dl></header>
  ${section(k+'-def','01','Definition',`<p>${l.definition}</p><p class="analogy">${l.analogy}</p>`,true)}
  ${section(k+'-core','02','Core functions and mechanisms',`<ul>${l.features.map(([a,b])=>`<li><b>${a}</b><br>${b}</li>`).join('')}</ul>`)}
  ${section(k+'-protocols','03','Protocols and related concepts',l.protocols.map(protocolMarkup).join(''),true)}
  ${section(k+'-process','04','Role in this communication',`<p>${l.process}</p>${(k==='transport'||k==='tcp-transport')?'<button class="view-protocol-link" id="go-lab">Explore TCP / UDP labs ↗</button>':''}`)}
  ${section(k+'-mistakes','05','Common misconceptions',l.mistakes.map(([a,b])=>`<div class="misconception"><b>${a}</b>${b}</div>`).join(''))}
  ${section(k+'-advanced','06','Understand this layer in depth',`<ul>${chapterKeys(k).flatMap(key=>CHAPTERS[key].goals).map(g=>`<li>${escape(g)}</li>`).join('')}</ul><button class="study-link" id="go-deep">Explore principles and mechanisms ↗</button>`,true)}
  <footer class="inspector-footer">OSI functions help explain protocol responsibilities; each entry describes its actual carriage.<br>References:<a href="https://www.rfc-editor.org/rfc/rfc1122.html" target="_blank" rel="noopener noreferrer">RFC 1122</a></footer>`;
  $('inspector-content').innerHTML=html;saveAccordions();$('go-lab')?.addEventListener('click',()=>setView('transport'));$('go-deep').addEventListener('click',()=>{pause();hub.jump('theory');});
}
function renderTransport(){const lab=LABS[state.lab];$('inspector-content').innerHTML=`<header class="inspector-heading"><div class="focus-label">03 / TRANSPORT LAB<span class="layer-pill">${state.lab==='udp'?'UDP':'TCP'}</span></div><h2>Connections and delivery</h2><span class="en">TRANSPORT LAB</span><p class="focus-question">Inspect packet fields and connection states at each step.</p></header><div class="lab-select">${Object.entries(LABS).map(([key,l])=>`<button data-lab="${key}" class="${key===state.lab?'active':''}">${l.title}<span>→</span></button>`).join('')}</div><p class="test-note">Choose a lab, then play or advance below the model. Links are simplified; no real packets are sent.</p><div id="lab-state"></div>
 ${section('transport-diff','01','Choosing TCP or UDP','<table class="mapping-table"><tr><th>Property</th><th>TCP</th><th>UDP</th></tr><tr><td>Data format</td><td>Byte stream</td><td>Datagram</td></tr><tr><td>Message boundaries</td><td>Not preserved</td><td>Preserved</td></tr><tr><td>Reliable and ordered</td><td>Provided</td><td>Not guaranteed by UDP</td></tr><tr><td>Connection handshake</td><td>Required</td><td>No TCP-style handshake</td></tr><tr><td>Header</td><td>≥20 bytes</td><td>8 bytes</td></tr></table><p>TCP provides a reliable, ordered byte stream. UDP preserves datagram boundaries; application protocols can add reliability. Choose according to delivery, delay and message-boundary requirements.</p>',true)}
 ${section('transport-protocols','02','Protocol notes',['tcp','udp','quic'].map(protocolMarkup).join(''))}
 ${section('transport-ack','03','What is the difference between ACK and ack?','<p><b>ACK</b>: A control flag. When set to 1, the acknowledgment field is valid.</p><p><b>ack</b>: The acknowledgment number, normally the next expected byte. A SYN with seq=100 is acknowledged as 101 because SYN consumes one number.</p><p><b>seq</b>: The segment sequence number. TCP counts bytes rather than simply adding one per packet.</p>')}
 <footer class="inspector-footer">Values are readable teaching examples; actual initial sequence numbers are not fixed at 100 and 500.</footer>`;
 $('inspector-content').querySelectorAll('[data-lab]').forEach(btn=>btn.addEventListener('click',()=>setLab(btn.dataset.lab)));saveAccordions();updateLabState();}
function updateLabState(){if(state.view!=='transport')return;const s=currentSteps()[state.index];$('lab-state').innerHTML=`<div class="state-cards"><div class="state-card"><small>Host A</small><code>${s?s.states[0]:state.lab==='close'?'ESTABLISHED':state.lab==='udp'?'No TCP connection state':'CLOSED'}</code></div><div class="state-card"><small>Host B</small><code>${s?s.states[1]:state.lab==='close'?'ESTABLISHED':state.lab==='udp'?'Waiting for a datagram':'LISTEN'}</code></div></div>${s?`<code class="wire">${escape(s.wire)}</code>`:'<p class="test-note">Press Play to observe segments and connection state.</p>'}`;}
function renderInspector(){if(state.view==='transport')renderTransport();else inspectorLayer();}

function selectLayer(index,user=false){state.selected=index;scene.setSelected(index);hub.setLayer(layers()[index].id);renderLayers();if(user&&state.view!=='explore'){setView('explore');return;}if(user){pause();resetJourney();}if(state.view==='explore')inspectorLayer();if(user&&matchMedia('(max-width:640px)').matches){document.querySelector('.inspector').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}}
function setModel(model){pause();state.model=model;protocolAtlas.setModel(model);state.selected=0;scene.packet=null;scene.setLayers(layers());scene.setSelected(0);document.querySelectorAll('[data-model]').forEach(b=>b.classList.toggle('active',b.dataset.model===model));$('model-caption').textContent=model==='osi'?'Open Systems Interconnection reference model':'Internet protocol suite';$('model-note').textContent=model==='osi'?'OSI separates communication functions into seven layers; the blocks show their positions in the stack.':'TCP/IP uses application, transport, internet and network interface layers. These broadly correspond to OSI functions; protocol classification also depends on actual carriage.';$('scene-mode').textContent=model==='osi'?'OSI / 7 LAYERS':'TCP/IP / 4 LAYERS';if(state.view==='transport'){state.selected=layers().findIndex(l=>l.id.includes('transport'));scene.setSelected(state.selected);}hub.setLayer(layers()[state.selected].id);renderLayers();renderInspector();resetJourney();}
function setView(view){pause();state.view=view;scene.packet=null;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view||(view==='transport'&&b.dataset.view==='explore')));$('explore-screen').hidden=view==='protocols';$('protocol-screen').hidden=view!=='protocols';if(view==='protocols'){protocolAtlas.setModel(state.model);window.scrollTo({top:0,behavior:'instant'});return;}scene.resize();if(view==='transport'){state.selected=layers().findIndex(l=>l.id.includes('transport'));scene.setSelected(state.selected);renderLayers();}$('scene-title').textContent=view==='transport'?LABS[state.lab].title:'Encapsulation and hop-by-hop forwarding';$('scene-subtitle').textContent=view==='transport'?LABS[state.lab].subtitle:'Encapsulate down the sender stack · Decapsulate up the receiver stack';$('scenario').parentElement.hidden=view==='transport';hub.setLayer(layers()[state.selected].id);renderInspector();resetJourney();}
function setLab(lab){state.lab=lab;setView('transport');}


const currentSteps=()=>state.view==='transport'?buildTransportJourney(layers(),LABS[state.lab],state.lab):buildJourney(layers(),state.scenario);
function renderPacket(headers,target='packet-structure'){
 const labels={added:'+ Added',removed:'− Removed',updated:'↻ Updated'};
 $(target).innerHTML=headers.map(h=>`<span class="packet-field ${h.kind} ${h.change?'change-'+h.change:''}">${h.change?`<b class="field-change">${labels[h.change]}</b>`:''}${escape(h.text)}</span>`).join('');
}
function hidePacketChanges(){
 $('packet-transition').hidden=true;$('packet-after-label').hidden=true;$('scene-change').hidden=true;
 $('packet-changes').innerHTML='';$('packet-before').innerHTML='';$('scene-change').textContent='';
}
function renderPacketChanges(before,step){
 const delta=packetChanges(before,step,layers());
 $('scene-change').textContent=`This step: ${delta.summary}`;$('scene-change').hidden=false;
 $('packet-transition').hidden=false;$('packet-after-label').hidden=false;
 $('packet-changes').innerHTML=delta.changes.length?delta.changes.map(c=>`<li class="change-${c.action}">${escape(c.detail)}</li>`).join(''):`<li>${escape(delta.summary)}</li>`;
 renderPacket(delta.before,'packet-before');
 if(!delta.before.length)$('packet-before').innerHTML='<span class="packet-empty">Application data has not been generated</span>';
 renderPacket(delta.after);
}
function resetJourney(){state.index=-1;state.elapsed=0;scene.packet=null;scene.setSelected(state.selected);hidePacketChanges();$('progress-fill').style.width='0';$('step-counter').textContent='Ready to start';$('step-number').textContent='00';$('step-title').textContent=state.view==='transport'?'Transport lab ready':'Sender prepares data';$('step-description').textContent=state.view==='transport'?'Choose a lab on the right, then play or step through packets and state.':'Press Play to watch a message pass through both host stacks.';$('journey-title').textContent=state.view==='transport'?LABS[state.lab].title:'Communication flow';$('journey-footnote').textContent=state.view==='transport'?LABS[state.lab].footnote:'Teaching model: DNS lookup, ARP and TCP establishment are omitted; the intermediate device is a router.';$('next-step').disabled=false;renderPacket(state.view==='transport'?[]:[{text:state.scenario==='dns'?'DNS query':'HTTP request',kind:'payload'}]);updatePlayButton();updateLabState();scene.render();}
function showStep(index){
 const steps=currentSteps(),s=steps[index];state.index=index;
 $('step-title').textContent=s.title;$('step-description').textContent=s.description;
 $('step-number').textContent=(index+1).toString().padStart(2,'0');
 $('step-counter').textContent=`${index+1} / ${steps.length} steps`;
 $('progress-fill').style.width=`${(index+1)/steps.length*100}%`;
 $('next-step').disabled=index===steps.length-1;
 if(state.view==='transport'){
  state.selected=s.layer;scene.setSelected(s.layer);renderLayers();updateLabState();
 }else selectLayer(s.layer,false);
 scene.setFocus(s);
 if(state.view==='transport'){hidePacketChanges();renderPacket(s.headers);}else renderPacketChanges(index?steps[index-1].headers:[],s);
 scene.packet={anchor:s,tag:s.tag,drop:s.drop};updatePlayButton();scene.render();
}
function updatePlayButton(){$('play').innerHTML=state.playing?'<span>Ⅱ</span> Pause':state.index===currentSteps().length-1?'<span>↺</span> Replay':'<span>▶</span> Play';}
function pause(){state.playing=false;updatePlayButton();}
function togglePlay(){if(state.playing){pause();return;}if(state.index===currentSteps().length-1)resetJourney();if(state.index<0)showStep(0);state.playing=true;state.last=performance.now();updatePlayButton();}
function singleStep(){pause();state.elapsed=0;if(state.index<currentSteps().length-1)showStep(state.index+1);}
function tick(time){
 const delta=Math.max(0,time-state.last);state.last=time;
 if(state.playing&&!document.hidden){
  const clock=advanceClock(state.elapsed,delta);state.elapsed=clock.elapsed;
  for(let i=0;i<clock.steps&&state.playing;i++){
   if(state.index<currentSteps().length-1)showStep(state.index+1);
   else{pause();$('step-counter').textContent=`Complete · ${currentSteps().length} steps`;}
  }
 }
 requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{state.last=performance.now();});

document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>setModel(b.dataset.model)));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('open-learning').addEventListener('click',()=>{if(state.view==='protocols')setView('explore');pause();hub.jump('theory');});
$('scenario').addEventListener('change',e=>{pause();state.scenario=e.target.value;resetJourney();});
$('play').addEventListener('click',togglePlay);$('next-step').addEventListener('click',singleStep);
$('restart').addEventListener('click',()=>{pause();resetJourney();});
$('rotate').addEventListener('click',e=>{scene.auto=!scene.auto;e.currentTarget.setAttribute('aria-pressed',String(scene.auto));});
$('reset-camera').addEventListener('click',()=>{scene.reset();$('rotate').setAttribute('aria-pressed','false');});
$('spread').addEventListener('click',e=>{scene.spread=!scene.spread;e.currentTarget.setAttribute('aria-pressed',String(scene.spread));e.currentTarget.querySelector('span').textContent=scene.spread?'Layers':'Compact';});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('help-dialog').querySelector('.dialog-close').addEventListener('click',()=>$('help-dialog').close());$('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
renderLayers();renderInspector();resetJourney();requestAnimationFrame(tick);
