import assert from 'node:assert/strict';
import {OSI,TCPIP,LABS} from '../dist/content.js';
import {buildJourney,buildTransportJourney,packetChanges} from '../dist/flows.js';
import {advanceClock,STEP_INTERVAL} from '../dist/playback.js';
import {NetworkScene} from '../dist/scene.js';

assert.equal(STEP_INTERVAL,1000);
assert.deepEqual(advanceClock(0,999),{steps:0,elapsed:999});
assert.deepEqual(advanceClock(999,1),{steps:1,elapsed:0});
assert.deepEqual(advanceClock(950,2100),{steps:3,elapsed:50},'Slow frames must preserve the one-second cadence');

for(const layers of [OSI,TCPIP]){
 const transport=layers.findIndex(l=>l.id.includes('transport'));
 const network=layers.findIndex(l=>l.id==='network'||l.id==='internet');
 for(const scenario of ['http','dns']){
  const steps=buildJourney(layers,scenario);
  const changes=steps.map((s,i)=>packetChanges(i?steps[i-1].headers:[],s,layers));
  assert.deepEqual(changes[transport].changes.map(c=>[c.key,c.action]),[['transport','added']]);
  assert.deepEqual(changes[network].changes.map(c=>[c.key,c.action]),[['network','added']]);
  const routerIndex=steps.findIndex(s=>s.router),bridgeIndex=steps.findIndex(s=>s.bridge);
  assert.deepEqual(changes[routerIndex].changes.map(c=>[c.key,c.action]),[['link','removed'],['network','updated'],['fcs','removed']]);
  assert.ok(changes[routerIndex].summary.includes('TTL 64 → TTL 63'));
  assert.deepEqual(changes[bridgeIndex].changes.map(c=>[c.key,c.action]),[['link','added'],['fcs','added']]);
  assert.ok(changes[bridgeIndex].after.filter(h=>h.change==='added').some(h=>h.text==='FCS'));
  const receiveTransport=steps.findIndex(s=>s.host===1&&!s.bridge&&s.layer===transport);
  assert.deepEqual(changes[receiveTransport].changes.map(c=>[c.key,c.action]),[['transport','removed']]);
  assert.equal(changes.at(-1).after.length,1);
  if(layers===OSI){
   for(const index of [1,2]){assert.equal(changes[index].changes.length,0);assert.ok(changes[index].summary.includes('不添加独立首部'));}
   assert.ok(changes[layers.length-1].summary.includes('帧 → 比特/信号'));
  }
  assert.equal(steps[transport].tag,scenario==='dns'?'UDP数据报':'TCP报文段');
  const receivedLink=steps.find(s=>s.host===1&&!s.bridge&&['datalink','interface'].includes(layers[s.layer].id));
  assert.equal(receivedLink.tag,'IP分组','A removed Ethernet header must not retain a frame label');
  const receivedIP=steps.find(s=>s.host===1&&!s.bridge&&s.layer===network);
  assert.equal(receivedIP.tag,scenario==='dns'?'UDP数据报':'TCP报文段');
 }
 for(const [key,lab] of Object.entries(LABS)){
  const steps=buildTransportJourney(layers,lab,key);
  const scene=Object.create(NetworkScene.prototype);
  Object.assign(scene,{layers,hosts:[-3.45,3.45],spread:true,selected:0,labelEls:[]});
  for(const step of steps){
   if(!step.router&&!step.bridge&&!step.link&&step.layer===transport){
    assert.ok(step.tag.startsWith(key==='udp'?'UDP数据报':'TCP报文段'),'Lab packet type must match its transport protocol');
   }
   if(key==='udp'&&!step.completed)assert.ok(!/丢失|到达|延迟/.test(step.tag),'Transit labels must not claim loss or arrival early');
   scene.setFocus(step);scene.packet={anchor:step};
   const point=scene.packetPosition();
   assert.ok(point.every(Number.isFinite));
   if(step.router){
    assert.equal(point[0],0);assert.equal(step.layer,network);
    assert.ok(!step.headers.some(h=>h.kind==='link'));
   }else if(step.bridge||step.link){
    assert.equal(point[0],scene.hosts[step.host]/2);
    assert.equal(scene.isActive(step.layer,step.host),false);
   }else{
    const box=scene.boxes().find(b=>b.layer===step.layer&&b.pos[0]===point[0]);
    assert.ok(box,'A packet must be anchored to a block of the selected model');
    assert.equal(point[1],box.pos[1]+.22);
    assert.ok(scene.isActive(step.layer,step.host));
    assert.equal(scene.isActive(step.layer,1-step.host),false,'Only the current endpoint is highlighted');
    scene.spread=false;
    assert.equal(scene.packetPosition()[1],scene.boxes().find(b=>b.layer===step.layer&&b.pos[0]===point[0]).pos[1]+.22);
    scene.spread=true;
   }
  }
  for(const [index,message] of lab.steps.entries()){
   const phases=steps.filter(s=>s.messageIndex===index),last=phases.at(-1);
   assert.deepEqual(last.states,message.states);assert.ok(last.completed);
   const sender=message.direction===-1?1:0,receiver=1-sender;
   if(!(key==='udp'&&index===3))assert.equal(phases[0].host,sender);
   if(message.drop||message.delay){
    assert.ok(last.link||last.bridge);
    assert.ok(!phases.some(s=>s.host===receiver&&!s.bridge&&!s.link));
   }else{
    assert.equal(last.host,receiver);assert.equal(last.layer,transport);
   }
  }
  if(key==='handshake'){
   const syn=steps.filter(s=>s.messageIndex===0);
   assert.ok(syn.slice(0,-1).every(s=>s.states[1]==='LISTEN'),'B cannot accept SYN before it reaches transport');
   assert.equal(syn.at(-1).states[1],'SYN-RECEIVED');
   assert.ok(steps.filter(s=>s.messageIndex===2).slice(0,-1).every(s=>s.states[1]==='SYN-RECEIVED'));
  }
  if(key==='udp'){
   const resume=steps.filter(s=>s.messageIndex===3);
   assert.ok(resume[0].bridge);
   assert.ok(resume.every(s=>s.host!==0&&!s.router),'Delayed datagram resumes without retransmission');
  }
 }
}
console.log('PASS: One-second timing, model-specific packet units and anchors, both TCP directions, state changes on delivery, UDP loss and delayed delivery.');
