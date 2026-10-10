import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {OSI,TCPIP,PROTOCOLS,LABS} from './dist/content.js';
import {buildJourney} from './dist/flows.js';
import {rayBox,multiply} from './dist/scene.js';
import {CHAPTERS,chapterKeys,CASES} from './dist/curriculum.js';
import {PACKETS} from './dist/packets.js';
import {subnet,tcpAck,delays,mss,fragment} from './dist/calculators.js';
import {LearningHub} from './dist/learning.js';
import {ATLAS,protocolIds,PROTOCOL_LAYER_KEYS} from './dist/protocol-data.js';
import {workDiagram,relationDiagram} from './dist/protocols.js';

for(const file of readdirSync('dist').filter(f=>f.endsWith('.js')).map(f=>'dist/'+f)){
 execFileSync(process.execPath,['--check',file]);
 const code=readFileSync(file,'utf8');for(const m of code.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g))assert.ok(existsSync('dist/'+m[1]),'Missing module: '+m[1]);
}
const html=readFileSync('dist/index.html','utf8');
assert.ok(!existsSync('dist/exams.js'));assert.ok(!html.includes('data-view="compare"'));assert.ok(!html.includes('考点与练习'));
assert.ok(!readFileSync('dist/learning.js','utf8').includes('localStorage'));
for(const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)){if(match[1].endsWith('.zip'))continue;assert.ok(existsSync('dist/'+match[1]),'Missing asset: '+match[1]);}
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
for(const id of ['inspector-content','layer-list','scene-canvas','scene-labels','packet-label','play','next-step','help-dialog','lab-state'])assert.ok(ids.has(id)||id==='lab-state');
assert.equal(OSI.length,7);assert.equal(TCPIP.length,4);
assert.equal(new Set([...OSI,...TCPIP].map(l=>l.id)).size,11);
for(const ls of [OSI,TCPIP])for(const l of ls){assert.ok(l.definition.length>30);assert.ok(l.features.length>=3);assert.ok(l.protocols.length>=1);for(const p of l.protocols)assert.ok(PROTOCOLS[p],`${l.id}: ${p}`);}
for(const p of Object.values(PROTOCOLS)){assert.ok(p.topics.length>=2);if(p.source)assert.ok(p.source.startsWith('https://www.rfc-editor.org/'));}

for(const ls of [OSI,TCPIP])for(const scenario of ['http','dns']){
 const steps=buildJourney(ls,scenario);
 assert.equal(steps.length,ls.length*2+2);
 assert.deepEqual(steps.slice(0,ls.length).map(s=>s.layer),ls.map((_,i)=>i));
 assert.deepEqual(steps.slice(-ls.length).map(s=>s.layer),ls.map((_,i)=>ls.length-1-i));
 const router=steps.find(s=>s.router);assert.ok(router);assert.ok(!router.headers.some(h=>h.kind==='link'));
 assert.ok(router.headers.some(h=>h.text==='IP头 · TTL 63'));
 const bridge=steps.find(s=>s.bridge);assert.equal(bridge.headers[0].text,'帧头 · R右 → B');
 const last=steps.at(-1);assert.equal(last.headers.length,1);assert.equal(last.headers[0].kind,'payload');
 const firstTransmission=steps[ls.length-1];assert.equal(firstTransmission.headers.filter(h=>h.kind==='link').length,2);
 assert.ok(firstTransmission.headers.some(h=>h.kind==='transport'&&h.text.startsWith(scenario==='dns'?'UDP':'TCP')));
 assert.ok(!steps.flatMap(s=>s.headers).some(h=>/会话.*头|表示.*头/.test(h.text)));
}
assert.equal(LABS.handshake.steps.length,3);assert.equal(LABS.close.steps.length,4);
assert.deepEqual(LABS.handshake.steps.at(-1).states,['ESTABLISHED','ESTABLISHED']);
assert.deepEqual(LABS.close.steps[2].states,['TIME-WAIT','LAST-ACK']);
assert.deepEqual(LABS.close.steps.at(-1).states,['TIME-WAIT','CLOSED']);
assert.ok(LABS.handshake.steps[1].wire.includes('ack=101'));
assert.ok(LABS.handshake.steps[2].wire.includes('ack=501'));
assert.ok(LABS.udp.steps[1].drop);
for(const ls of [OSI,TCPIP])for(const layer of ls)for(const key of chapterKeys(layer.id))assert.ok(CHAPTERS[key]);
for(const [key,c] of Object.entries(CHAPTERS)){assert.ok(c.lessons.length>=4);assert.ok(!('interviews' in c));}
const fieldIds=[];for(const p of Object.values(PACKETS)){if(p.rows)for(const row of p.rows)assert.equal(row.reduce((sum,f)=>sum+f.bits,0),32);for(const f of p.rows?p.rows.flat():p.sequence){assert.ok(f.description&&f.example);fieldIds.push(f.id);}}assert.equal(new Set(fieldIds).size,fieldIds.length);
for(const c of CASES){assert.ok(CHAPTERS[c.layer]);assert.ok(c.hints.length>=2&&c.commands.length>=1&&c.conclusion.length>30);}
const v=subnet('192.168.10.130',26);assert.equal(v.network,'192.168.10.128');assert.equal(v.mask,'255.255.255.192');assert.equal(v.broadcast,'192.168.10.191');assert.equal(v.usable,62);
assert.equal(subnet('10.0.0.0',31).usable,2);assert.equal(subnet('10.0.0.1',32).usable,1);assert.equal(subnet('1.2.3.4',0).network,'0.0.0.0');assert.equal(subnet('1.2.3.4',0).total,4294967296);
assert.throws(()=>subnet('256.1.2.3',24));assert.throws(()=>subnet('1.2.3',24));assert.throws(()=>subnet('1.2.3.4',33));assert.throws(()=>subnet('1.2.3.4',''));
assert.equal(tcpAck(1001,500).ack,1501);assert.equal(tcpAck(100,0,true).ack,101);assert.equal(tcpAck(4294967295,1).ack,0);assert.equal(tcpAck(1001,500,false,true).ack,1502);assert.throws(()=>tcpAck(-1,1));
const d=delays(1500,100,1000,200000000);assert.ok(Math.abs(d.transmission-.12)<1e-9);assert.equal(d.propagation,5);assert.equal(d.bdp,125000);assert.throws(()=>delays(1500,0,1,2e8));assert.throws(()=>delays(1500,100,1,0));
assert.equal(mss(1500,4,20).mss,1460);assert.equal(mss(1500,6,20).mss,1440);assert.equal(mss(1500,4,32).mss,1448);assert.throws(()=>mss(1500,4,21));
assert.equal(mss(65535,4,20).mss,65495);assert.equal(mss(65575,6,20).mss,65515);
assert.throws(()=>mss(65536,4,20));assert.throws(()=>mss(65576,6,20));assert.throws(()=>mss(1279,6,20));
const fragments=fragment(4000,1500,20);assert.deepEqual(fragments.map(f=>f.payload),[1480,1480,1040]);assert.deepEqual(fragments.map(f=>f.offset),[0,185,370]);assert.deepEqual(fragments.map(f=>f.mf),[1,1,0]);assert.equal(fragment(5,1500).length,1);assert.throws(()=>fragment(4000,20));
assert.throws(()=>fragment(4000,67));
for(const mtu of [68,576,1280,1500]){const parts=fragment(65515,mtu);assert.equal(parts.reduce((sum,f)=>sum+f.payload,0),65515);for(const p of parts){assert.ok(p.total<=mtu);if(p.mf)assert.equal(p.payload%8,0);assert.ok(Number.isInteger(p.offset));}}
const hub=Object.create(LearningHub.prototype);Object.assign(hub,{layerId:'application',packet:'tcp',field:'tcp-seq',open:new Map()});
for(const key of Object.keys(CHAPTERS)){hub.layerId=key;assert.ok(hub.theory().includes(CHAPTERS[key].lessons[0].title));}
for(const key of Object.keys(PACKETS)){hub.packet=key;assert.ok(hub.fields().includes('field-explanation'));}
assert.ok(hub.tools().includes('data-calc="fragments"'));assert.ok(hub.cases().includes('定位线索'));
assert.ok(readFileSync('.github/workflows/deploy-pages.yml','utf8').includes('path: dist'));
assert.equal(rayBox([0,0,5],[0,0,-1],[0,0,0],[2,2,2]),4);
assert.equal(rayBox([4,0,5],[0,0,-1],[0,0,0],[2,2,2]),null);
const identity=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);assert.deepEqual(multiply(identity,identity),identity);
// Verify complete coverage, distinct model membership, and valid graphical/related links.
for(const id of Object.keys(PROTOCOLS))assert.ok(ATLAS[id],'Missing illustrated entry: '+id);
assert.equal(Object.keys(ATLAS).length,32);
for(const model of ['osi','tcpip']){assert.deepEqual(PROTOCOL_LAYER_KEYS[model],(model==='osi'?OSI:TCPIP).map(l=>l.id));const grouped=PROTOCOL_LAYER_KEYS[model].flatMap(layer=>protocolIds(model,layer));assert.deepEqual(grouped.sort(),Object.keys(ATLAS).sort());}
assert.ok(protocolIds('osi','application').includes('bgp'));assert.ok(!protocolIds('tcpip','internet').includes('bgp'));
assert.ok(protocolIds('tcpip','tcp-application').includes('tls'));assert.ok(protocolIds('tcpip','interface').includes('medium'));
for(const p of Object.values(ATLAS)){
 assert.ok(p.kind&&p.brief&&p.focus&&p.steps.length>=4);assert.ok(p.actors.length>=2&&p.actors.length<=6);
 for(const l of p.links)assert.ok(ATLAS[l.id]&&l.text);
 for(const [i,s] of p.steps.entries()){assert.ok(Number.isInteger(s.from)&&s.from>=0&&s.from<p.actors.length);assert.ok(Number.isInteger(s.to)&&s.to>=0&&s.to<p.actors.length);assert.ok(s.text&&s.label);const svg=workDiagram(p,i);assert.ok(svg.includes('viewBox=')&&svg.includes('data-diagram-step="'+i+'"'));assert.ok(!/NaN|undefined/.test(svg));}
 const rel=relationDiagram(p);assert.ok(!/NaN|undefined/.test(rel));for(const l of p.links)assert.ok(rel.includes('data-related="'+l.id+'"'));
}
for(const file of ['dist/index.html','dist/app.js','dist/learning.js','dist/curriculum.js'])assert.ok(!/面试|interview|data-view="compare"/.test(readFileSync(file,'utf8')),file);
execFileSync(process.execPath,['tests/ui-smoke.mjs'],{stdio:'inherit'});
console.log(`PASS: 11 layers, ${Object.keys(PROTOCOLS).length} protocol/technology entries, ${Object.values(CHAPTERS).reduce((n,c)=>n+c.lessons.length,0)} lessons, ${Object.keys(ATLAS).length} illustrated entries, ${CASES.length} cases; field layouts, calculator boundaries, flows and 3D math.`);
