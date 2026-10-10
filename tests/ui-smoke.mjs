// Minimal DOM harness for JS interaction wiring; not a browser or layout test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const english=process.env.ATLAS_LANGUAGE==='en';
const siteBase=english?'../dist/en/':'../dist/';
const text=(zh,en)=>english?en:zh;
const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
class Text {constructor(text){this.textContent=decode(text);}}
class Element {
 constructor(tag='div',attrs={}){this.tagName=tag.toLowerCase();this.attrs={...attrs};this.children=[];this.style={setProperty(name,value){this[name]=String(value);}};this.listeners={};this.parentElement=null;this._value=undefined;this.hidden=Object.hasOwn(attrs,'hidden');this.disabled=false;this.checked=Object.hasOwn(attrs,'checked');this.open=Object.hasOwn(attrs,'open');this.classList={toggle:(name,force)=>{const set=new Set((this.className||'').split(/\s+/).filter(Boolean));const yes=force===undefined?!set.has(name):force;yes?set.add(name):set.delete(name);this.className=[...set].join(' ');return yes;},add:name=>this.classList.toggle(name,true),remove:name=>this.classList.toggle(name,false)};}
 get id(){return this.attrs.id||'';}set id(v){this.attrs.id=v;}
 get className(){return this.attrs.class||'';}set className(v){this.attrs.class=v;}
 get dataset(){const data={};for(const [key,v] of Object.entries(this.attrs))if(key.startsWith('data-'))data[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;return data;}
 get value(){if(this._value!==undefined)return this._value;if(this.tagName==='select'){const opts=this.querySelectorAll('option');return (opts.find(o=>Object.hasOwn(o.attrs,'selected'))||opts[0])?.value||'';}return this.attrs.value??this.textContent;}
 set value(v){this._value=String(v);}
 get textContent(){return this.children.map(c=>c.textContent||'').join('');}
 set textContent(text){this.children=[new Text(String(text))];}
 get innerHTML(){return this._html||'';}
 set innerHTML(html){this._html=String(html);this.children=[];parseInto(this,String(html));}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
 dispatch(type,extra={}){const event={target:this,currentTarget:this,preventDefault(){},...extra};for(const fn of this.listeners[type]||[])fn(event);}
 click(){if(!this.disabled)this.dispatch('click');}
 appendChild(el){if(el.parentElement)el.remove();this.children.push(el);el.parentElement=this;return el;}
 remove(){if(this.parentElement){const list=this.parentElement.children;list.splice(list.indexOf(this),1);this.parentElement=null;}}
 before(el){const p=this.parentElement;if(!p)return;if(el.parentElement)el.remove();p.children.splice(p.children.indexOf(this),0,el);el.parentElement=p;}
 replaceChildren(...els){this.children=[];for(const el of els)this.appendChild(el);}
 matches(selector){const m=selector.match(/^([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/);if(!m)throw new Error('Unsupported harness selector: '+selector);return(!m[1]||m[1]===this.tagName)&&(!m[2]||m[2]===this.id)&&(!m[3]||this.className.split(/\s+/).includes(m[3]))&&(!m[4]||(Object.hasOwn(this.attrs,m[4])&&(m[5]===undefined||this.attrs[m[4]]===m[5])));}
 querySelectorAll(selector){const out=[];const walk=node=>{for(const c of node.children||[]){if(c instanceof Element){if(c.matches(selector))out.push(c);walk(c);}}};walk(this);return out;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 get offsetWidth(){return this.className.includes('layer-label')?118:this.className.includes('host-label')?126:this.className.includes('router-label')?140:780;}
 get offsetHeight(){return this.className.includes('layer-label')?28:this.className.includes('scene-heading')?100:this.className.includes('model-label')?40:550;}
 get offsetTop(){return this.className.includes('scene-heading')?26:0;}
 getBoundingClientRect(){return{width:780,height:550,left:0,top:0,right:780,bottom:550};}
 getContext(type){if(type==='webgl')return null;return new Proxy({},{get:()=>()=>{}});}
 setPointerCapture(){}scrollIntoView(){}showModal(){this.open=true;}close(){this.open=false;}
}
function parseInto(root,html){const stack=[root];const voids=new Set(['meta','interface','input','br','hr','img','source']);for(const token of html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)||[]){if(token.startsWith('<!--')||token.startsWith('<!'))continue;if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(token.startsWith('<')){const m=token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);if(!m)continue;const attrs={};for(const a of m[2].matchAll(/([\w-]+)(?:\s*=\s*"([^"]*)")?/g))attrs[a[1]]=decode(a[2]??'');const el=new Element(m[1],attrs);stack.at(-1).appendChild(el);if(!voids.has(el.tagName)&&!token.endsWith('/>'))stack.push(el);}else stack.at(-1).children.push(new Text(token));}}

const doc=new Element('document');doc.innerHTML=readFileSync(new URL(siteBase+'index.html',import.meta.url),'utf8');
doc.getElementById=id=>doc.querySelector('#'+id);doc.createElement=tag=>new Element(tag);doc.createElementNS=(_namespace,tag)=>new Element(tag);doc.hidden=false;
globalThis.document=doc;globalThis.window={scrollY:0,scrollTo(o){this.scrollY=o.top;}};
globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}};
const frames=[];globalThis.requestAnimationFrame=fn=>frames.push(fn);
globalThis.matchMedia=()=>({matches:false});
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(k,v)=>storage.set(k,v)};
globalThis.FormData=class{constructor(form){this.data=new Map();for(const el of [...form.querySelectorAll('input'),...form.querySelectorAll('select')]){if(el.attrs.type==='checkbox'&&!el.checked)continue;this.data.set(el.attrs.name,el.value);}}get(k){return this.data.get(k)??null;}has(k){return this.data.has(k);}};
const el=id=>{const node=doc.getElementById(id);assert.ok(node,'Missing live element: '+id);return node;};
const click=(selector)=>{const node=doc.querySelector(selector);assert.ok(node,'Missing control: '+selector);node.click();};

await import(siteBase+'app.js');
assert.equal(el('layer-list').querySelectorAll('button').length,7);
assert.equal(doc.querySelectorAll('[data-study-tab]').length,4);
assert.equal(doc.querySelectorAll('[data-view="compare"]').length,0);
assert.equal(doc.querySelectorAll('[data-study-tab="exam"]').length,0);
assert.ok(el('study-body').textContent.includes(text('网页访问','web visit')));
click('[data-model="tcpip"]');assert.equal(el('layer-list').querySelectorAll('button').length,4);
assert.ok(el('study-body').textContent.includes(text('字符、字节','Characters, bytes')));
click('[data-layer="3"]');assert.ok(el('study-body').textContent.includes(text('发送时延','Transmission')));
click('[data-view="transport"]');assert.ok(el('study-context').textContent.includes(text('传输层','Transport layer')));
for(let i=0;i<3;i++)el('next-step').click();assert.ok(el('lab-state').textContent.includes('ESTABLISHED'));
click('[data-lab="close"]');for(let i=0;i<3;i++)el('next-step').click();assert.ok(el('lab-state').textContent.includes('TIME-WAIT'));assert.ok(el('lab-state').textContent.includes('LAST-ACK'));
el('next-step').click();assert.ok(el('lab-state').textContent.includes('CLOSED'));
click('[data-model="osi"]');assert.equal(el('layer-list').querySelectorAll('button').length,7);assert.ok(el('study-context').textContent.includes(text('传输层','Transport layer')));

click('[data-study-tab="fields"]');click('[data-packet="ipv4"]');click('[data-field="ip-offset"]');assert.ok(el('study-body').textContent.includes(text('185 → 1480字节','185 → 1480 bytes')));
click('[data-study-tab="tools"]');assert.equal(doc.querySelectorAll('[data-calc]').length,5);assert.ok(el('study-body').textContent.includes('192.168.10.128/26'));assert.ok(el('study-body').textContent.includes('1501'));
const form=doc.querySelector('[data-calc="subnet"]');form.querySelector('[name="prefix"]').value='31';form.dispatch('submit');assert.ok(form.querySelector('.calculator-result').textContent.includes(text('点对点','point-to-point')));
form.querySelector('[name="ip"]').value='999.1.1.1';form.dispatch('submit');assert.ok(form.querySelector('.calculator-result').className.includes('error'));

el('open-learning').click();assert.ok(el('study-body').textContent.includes(text('学习目标','Learning objectives')));
assert.equal(storage.size,0);
click('[data-study-tab="cases"]');assert.equal(doc.querySelectorAll('.case-reveal').length,24);
// Dedicated protocol screen, relationships, filtering, step navigation and return to 3D.
assert.equal(doc.querySelectorAll('[data-study-tab="interview"]').length,0);
click('[data-view="protocols"]');assert.equal(el('explore-screen').hidden,true);assert.equal(el('protocol-screen').hidden,false);
assert.equal(doc.querySelectorAll('[data-atlas-layer]').length,7);
click('[data-protocol="dns"]');assert.ok(el('protocol-detail').textContent.includes('DNS'));
el('protocol-next').click();assert.ok(doc.querySelector('[data-protocol-step="1"]').className.includes('active'));assert.ok(doc.querySelector('.protocol-step-detail').textContent.includes('TTL'));
click('[data-diagram-step="4"]');assert.ok(doc.querySelector('.protocol-step-detail').textContent.includes(text('返回解析结果','Return resolution result')));assert.ok(Object.hasOwn(el('protocol-next').attrs,'disabled'));
click('[data-related="tls"]');assert.ok(el('protocol-title').textContent.includes('TLS 1.3'));assert.ok(el('protocol-detail').textContent.includes(text('证书','certificate')));
click('[data-atlas-model="tcpip"]');assert.equal(doc.querySelectorAll('[data-atlas-layer]').length,4);assert.equal(el('layer-list').querySelectorAll('button').length,4);
click('[data-protocol="bgp"]');assert.ok(el('protocol-detail').textContent.includes('TCP 179'));assert.ok(el('protocol-detail').textContent.includes(text('应用层','application-layer')));
const search=el('protocol-search');search.value=text('邮件','mail');search.dispatch('input');assert.ok(doc.querySelectorAll('[data-protocol]').length>=3);search.value=text('找不到的协议','no-such-protocol');search.dispatch('input');assert.equal(doc.querySelectorAll('[data-protocol]').length,0);
search.value='';search.dispatch('input');click('[data-atlas-layer="interface"]');click('[data-protocol="stp"]');click('[data-protocol-step="2"]');assert.ok(doc.querySelector('.protocol-step-detail').textContent.includes(text('冗余','redundant')));
el('protocol-back-3d').click();assert.equal(el('explore-screen').hidden,false);assert.equal(el('protocol-screen').hidden,true);assert.ok(el('inspector-content').textContent.includes(text('网络接口层','Network access layer')));
click('[data-open-protocol="arp"]');assert.equal(el('protocol-screen').hidden,false);assert.ok(el('protocol-title').textContent.includes('ARP'));
el('open-learning').click();assert.equal(el('explore-screen').hidden,false);assert.equal(el('protocol-screen').hidden,true);
// Exercise every entry in both models; the selected diagram step must match its text.
const {ATLAS}=await import(siteBase+'protocol-data.js');
for(const model of ['osi','tcpip']){click('[data-view="protocols"]');click('[data-atlas-model="'+model+'"]');for(const p of Object.values(ATLAS)){const {PROTOCOL_LAYER_KEYS,protocolIds}=await import(siteBase+'protocol-data.js');const layer=PROTOCOL_LAYER_KEYS[model].find(l=>protocolIds(model,l).includes(p.id));click('[data-atlas-layer="'+layer+'"]');click('[data-protocol="'+p.id+'"]');for(let i=0;i<p.steps.length;i++){click('[data-protocol-step="'+i+'"]');assert.ok(doc.querySelector('.protocol-step-detail').textContent.includes(p.steps[i].text));}if(english)assert.ok(!/\p{Script=Han}/u.test(el('protocol-screen').textContent));assert.ok(doc.querySelector('[data-related="'+p.links[0].id+'"]'));}}
click('[data-view="explore"]');
el('help').click();assert.equal(el('help-dialog').open,true);doc.querySelector('.dialog-close').click();assert.equal(el('help-dialog').open,false);
// Exercise one compatible-rendering frame and DOM label positioning without a real browser.
frames[0](100);assert.ok(doc.querySelector('.layer-label').style.transform.includes('translate'));
assert.ok(!/NaN|undefined/.test(doc.querySelector('.layer-label').style.transform));
console.log((english?'EN ':'ZH ')+'PASS: DOM wiring smoke checks: model/layer switches, transport labs, field explorer, 5 calculators, learning navigation, all 32 illustrated protocols in both models, diagram steps, relationships, filtering and help. Browser layout checks run separately.');
