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
function protocolMarkup(key){const p=PROTOCOLS[key];const save='protocol-'+key;return `<details class="protocol" data-save="${save}" ${openState.get(save)?'open':''}><summary><b>${escape(p.name)}</b><span>${escape(p.title)}</span><small>${escape(p.meta)}</small></summary><div class="protocol-body"><p>${escape(p.brief)}</p><dl>${p.topics.map(t=>`<dt>${escape(t.title)}</dt><dd>${escape(t.text)}</dd>`).join('')}</dl><button class="view-protocol-link" data-open-protocol="${key}">打开图文协议详解 →</button>${p.source?`<a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">阅读标准文档 ↗</a>`:''}</div></details>`;}
function saveAccordions(){document.querySelectorAll('[data-open-protocol]').forEach(b=>b.addEventListener('click',()=>{setView('protocols');protocolAtlas.select(b.dataset.openProtocol);}));document.querySelectorAll('details[data-save]').forEach(el=>el.addEventListener('toggle',()=>openState.set(el.dataset.save,el.open)));}

function renderLayers(){const ls=layers();$('layer-list').innerHTML=ls.map((l,i)=>`<button class="layer-item ${i===state.selected?'active':''}" style="--layer-color:${l.color}" data-layer="${i}" aria-pressed="${i===state.selected}"><span class="layer-num">${l.number.toString().padStart(2,'0')}</span><span><b>${l.name}</b><small>${l.en.toUpperCase()}</small></span><span class="arrow">›</span></button>`).join('');$('layer-list').querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>selectLayer(Number(btn.dataset.layer),true)));}
function inspectorLayer(){const l=layers()[state.selected];const k=l.id;const html=`<header class="inspector-heading"><div class="focus-label">03 / 本层知识<span class="layer-pill">LAYER ${l.number.toString().padStart(2,'0')}</span></div><h2>${l.name}</h2><span class="en">${l.en.toUpperCase()} LAYER</span><p class="focus-question">${l.question}</p><dl class="facts"><div><dt>数据单位</dt><dd>${l.unit}</dd></div><div><dt>主要范围</dt><dd>${l.scope}</dd></div></dl></header>
  ${section(k+'-def','01','基本定义',`<p>${l.definition}</p><p class="analogy">${l.analogy}</p>`,true)}
  ${section(k+'-core','02','核心功能与机制',`<ul>${l.features.map(([a,b])=>`<li><b>${a}</b><br>${b}</li>`).join('')}</ul>`)}
  ${section(k+'-protocols','03','协议与相关知识',l.protocols.map(protocolMarkup).join(''),true)}
  ${section(k+'-process','04','在这次通信中做什么',`<p>${l.process}</p>${(k==='transport'||k==='tcp-transport')?'<button class="view-protocol-link" id="go-lab">观察TCP / UDP传输实验 ↗</button>':''}`)}
  ${section(k+'-mistakes','05','常见误区',l.mistakes.map(([a,b])=>`<div class="misconception"><b>${a}</b>${b}</div>`).join(''))}
  ${section(k+'-advanced','06','深入理解本层',`<ul>${chapterKeys(k).flatMap(key=>CHAPTERS[key].goals).map(g=>`<li>${escape(g)}</li>`).join('')}</ul><button class="study-link" id="go-deep">展开原理与机制讲解 ↗</button>`,true)}
  <footer class="inspector-footer">OSI 的功能划分可帮助理解协议职责；具体协议的承载方式见各条目。<br>参考：<a href="https://www.rfc-editor.org/rfc/rfc1122.html" target="_blank" rel="noopener noreferrer">RFC 1122</a></footer>`;
  $('inspector-content').innerHTML=html;saveAccordions();$('go-lab')?.addEventListener('click',()=>setView('transport'));$('go-deep').addEventListener('click',()=>{pause();hub.jump('theory');});
}
function renderTransport(){const lab=LABS[state.lab];$('inspector-content').innerHTML=`<header class="inspector-heading"><div class="focus-label">03 / 传输实验<span class="layer-pill">${state.lab==='udp'?'UDP':'TCP'}</span></div><h2>连接与交付</h2><span class="en">TRANSPORT LAB</span><p class="focus-question">查看每一步的报文字段和连接状态。</p></header><div class="lab-select">${Object.entries(LABS).map(([key,l])=>`<button data-lab="${key}" class="${key===state.lab?'active':''}">${l.title}<span>→</span></button>`).join('')}</div><p class="test-note">选择实验后，在模型下方播放或逐步推进。网络链路在图中被简化，实验不发出真实报文。</p><div id="lab-state"></div>
 ${section('transport-diff','01','TCP与UDP如何选择？','<table class="mapping-table"><tr><th>特性</th><th>TCP</th><th>UDP</th></tr><tr><td>数据形式</td><td>字节流</td><td>数据报</td></tr><tr><td>消息边界</td><td>不保留</td><td>保留</td></tr><tr><td>可靠有序</td><td>提供</td><td>自身不保证</td></tr><tr><td>连接握手</td><td>需要</td><td>无需TCP式握手</td></tr><tr><td>首部</td><td>≥20字节</td><td>8字节</td></tr></table><p>TCP 提供可靠、有序的字节流；UDP 保留数据报边界，可靠性可由应用协议实现。选择取决于应用对交付、时延和消息边界的要求。</p>',true)}
 ${section('transport-protocols','02','协议说明',['tcp','udp','quic'].map(protocolMarkup).join(''))}
 ${section('transport-ack','03','ACK与ack到底有什么区别？','<p><b>ACK</b>：一个控制标志位，置1时说明确认字段有效。</p><p><b>ack</b>：确认号，是通常期待收到的下一个字节序号。例如收到seq=100的SYN后确认101，因为SYN消耗一个序号。</p><p><b>seq</b>：本段的序列号。TCP按字节编号，不是为每个包简单加1。</p>')}
 <footer class="inspector-footer">字段值为易读的教学示例；实际初始序列号不会固定为100与500。</footer>`;
 $('inspector-content').querySelectorAll('[data-lab]').forEach(btn=>btn.addEventListener('click',()=>setLab(btn.dataset.lab)));saveAccordions();updateLabState();}
function updateLabState(){if(state.view!=='transport')return;const s=currentSteps()[state.index];$('lab-state').innerHTML=`<div class="state-cards"><div class="state-card"><small>主机 A</small><code>${s?s.states[0]:state.lab==='close'?'ESTABLISHED':state.lab==='udp'?'无TCP连接状态':'CLOSED'}</code></div><div class="state-card"><small>主机 B</small><code>${s?s.states[1]:state.lab==='close'?'ESTABLISHED':state.lab==='udp'?'等待数据报':'LISTEN'}</code></div></div>${s?`<code class="wire">${escape(s.wire)}</code>`:'<p class="test-note">点击播放，开始观察报文与连接状态。</p>'}`;}
function renderInspector(){if(state.view==='transport')renderTransport();else inspectorLayer();}

function selectLayer(index,user=false){state.selected=index;scene.setSelected(index);hub.setLayer(layers()[index].id);renderLayers();if(user&&state.view!=='explore'){setView('explore');return;}if(user){pause();resetJourney();}if(state.view==='explore')inspectorLayer();if(user&&matchMedia('(max-width:640px)').matches){document.querySelector('.inspector').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}}
function setModel(model){pause();state.model=model;protocolAtlas.setModel(model);state.selected=0;scene.packet=null;scene.setLayers(layers());scene.setSelected(0);document.querySelectorAll('[data-model]').forEach(b=>b.classList.toggle('active',b.dataset.model===model));$('model-caption').textContent=model==='osi'?'开放系统互连参考模型':'互联网协议体系';$('model-note').textContent=model==='osi'?'OSI 七层按通信功能划分；这里的层块用于表示各层的位置。':'TCP/IP 使用应用层、传输层、网际层和网络接口层。它与 OSI 的功能划分大致对应，协议归属还要结合实际承载方式。';$('scene-mode').textContent=model==='osi'?'OSI / 7 LAYERS':'TCP/IP / 4 LAYERS';if(state.view==='transport'){state.selected=layers().findIndex(l=>l.id.includes('transport'));scene.setSelected(state.selected);}hub.setLayer(layers()[state.selected].id);renderLayers();renderInspector();resetJourney();}
function setView(view){pause();state.view=view;scene.packet=null;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view||(view==='transport'&&b.dataset.view==='explore')));$('explore-screen').hidden=view==='protocols';$('protocol-screen').hidden=view!=='protocols';if(view==='protocols'){protocolAtlas.setModel(state.model);window.scrollTo({top:0,behavior:'instant'});return;}scene.resize();if(view==='transport'){state.selected=layers().findIndex(l=>l.id.includes('transport'));scene.setSelected(state.selected);renderLayers();}$('scene-title').textContent=view==='transport'?LABS[state.lab].title:'封装与逐跳转发';$('scene-subtitle').textContent=view==='transport'?LABS[state.lab].subtitle:'发送端向下封装 · 接收端向上解封装';$('scenario').parentElement.hidden=view==='transport';hub.setLayer(layers()[state.selected].id);renderInspector();resetJourney();}
function setLab(lab){state.lab=lab;setView('transport');}


const currentSteps=()=>state.view==='transport'?buildTransportJourney(layers(),LABS[state.lab],state.lab):buildJourney(layers(),state.scenario);
function renderPacket(headers,target='packet-structure'){
 const labels={added:'+ 新增',removed:'− 移除',updated:'↻ 更新'};
 $(target).innerHTML=headers.map(h=>`<span class="packet-field ${h.kind} ${h.change?'change-'+h.change:''}">${h.change?`<b class="field-change">${labels[h.change]}</b>`:''}${escape(h.text)}</span>`).join('');
}
function hidePacketChanges(){
 $('packet-transition').hidden=true;$('packet-after-label').hidden=true;$('scene-change').hidden=true;
 $('packet-changes').innerHTML='';$('packet-before').innerHTML='';$('scene-change').textContent='';
}
function renderPacketChanges(before,step){
 const delta=packetChanges(before,step,layers());
 $('scene-change').textContent=`本步变化：${delta.summary}`;$('scene-change').hidden=false;
 $('packet-transition').hidden=false;$('packet-after-label').hidden=false;
 $('packet-changes').innerHTML=delta.changes.length?delta.changes.map(c=>`<li class="change-${c.action}">${escape(c.detail)}</li>`).join(''):`<li>${escape(delta.summary)}</li>`;
 renderPacket(delta.before,'packet-before');
 if(!delta.before.length)$('packet-before').innerHTML='<span class="packet-empty">尚未生成应用数据</span>';
 renderPacket(delta.after);
}
function resetJourney(){state.index=-1;state.elapsed=0;scene.packet=null;scene.setSelected(state.selected);hidePacketChanges();$('progress-fill').style.width='0';$('step-counter').textContent='准备开始';$('step-number').textContent='00';$('step-title').textContent=state.view==='transport'?'传输实验准备':'发送端准备数据';$('step-description').textContent=state.view==='transport'?'选择右侧实验，然后播放或单步查看报文和状态。':'点击播放，观察消息怎样穿过两台主机的网络层。';$('journey-title').textContent=state.view==='transport'?LABS[state.lab].title:'通信过程';$('journey-footnote').textContent=state.view==='transport'?LABS[state.lab].footnote:'教学示意：忽略DNS解析、ARP查询与TCP建连；中间设备为路由器。';$('next-step').disabled=false;renderPacket(state.view==='transport'?[]:[{text:state.scenario==='dns'?'DNS查询':'HTTP请求',kind:'payload'}]);updatePlayButton();updateLabState();scene.render();}
function showStep(index){
 const steps=currentSteps(),s=steps[index];state.index=index;
 $('step-title').textContent=s.title;$('step-description').textContent=s.description;
 $('step-number').textContent=(index+1).toString().padStart(2,'0');
 $('step-counter').textContent=`${index+1} / ${steps.length} 步`;
 $('progress-fill').style.width=`${(index+1)/steps.length*100}%`;
 $('next-step').disabled=index===steps.length-1;
 if(state.view==='transport'){
  state.selected=s.layer;scene.setSelected(s.layer);renderLayers();updateLabState();
 }else selectLayer(s.layer,false);
 scene.setFocus(s);
 if(state.view==='transport'){hidePacketChanges();renderPacket(s.headers);}else renderPacketChanges(index?steps[index-1].headers:[],s);
 scene.packet={anchor:s,tag:s.tag,drop:s.drop};updatePlayButton();scene.render();
}
function updatePlayButton(){$('play').innerHTML=state.playing?'<span>Ⅱ</span> 暂停过程':state.index===currentSteps().length-1?'<span>↺</span> 重新播放':'<span>▶</span> 播放过程';}
function pause(){state.playing=false;updatePlayButton();}
function togglePlay(){if(state.playing){pause();return;}if(state.index===currentSteps().length-1)resetJourney();if(state.index<0)showStep(0);state.playing=true;state.last=performance.now();updatePlayButton();}
function singleStep(){pause();state.elapsed=0;if(state.index<currentSteps().length-1)showStep(state.index+1);}
function tick(time){
 const delta=Math.max(0,time-state.last);state.last=time;
 if(state.playing&&!document.hidden){
  const clock=advanceClock(state.elapsed,delta);state.elapsed=clock.elapsed;
  for(let i=0;i<clock.steps&&state.playing;i++){
   if(state.index<currentSteps().length-1)showStep(state.index+1);
   else{pause();$('step-counter').textContent=`完成 · ${currentSteps().length} 步`;}
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
$('spread').addEventListener('click',e=>{scene.spread=!scene.spread;e.currentTarget.setAttribute('aria-pressed',String(scene.spread));e.currentTarget.querySelector('span').textContent=scene.spread?'分层':'紧凑';});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('help-dialog').querySelector('.dialog-close').addEventListener('click',()=>$('help-dialog').close());$('help-dialog').addEventListener('click',e=>{if(e.target===$('help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
renderLayers();renderInspector();resetJourney();requestAnimationFrame(tick);
