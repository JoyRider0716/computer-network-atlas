// Verify translation completeness without changing identifiers, numbers or data shape.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const han=/\p{Script=Han}/u;
function compare(zh,en,path){
 if(typeof zh==='string'){
  assert.equal(typeof en,'string',path);
  if(han.test(zh))assert.ok(en.length>0&&!han.test(en),`Untranslated content: ${path}`);
  else assert.equal(en,zh,`Changed identifier/reference: ${path}`);
 }else if(zh&&typeof zh==='object'){
  assert.deepEqual(Object.keys(en),Object.keys(zh),`Changed shape: ${path}`);
  for(const key of Object.keys(zh))compare(zh[key],en[key],path+'.'+key);
 }else assert.equal(en,zh,path);
}
for(const [file,exports] of Object.entries({
 'content.js':['OSI','TCPIP','PROTOCOLS','LABS'],
 'curriculum.js':['CHAPTERS','CASES'],
 'packets.js':['PACKETS'],
 'protocol-data.js':['ATLAS','LAYER_GUIDES','PROTOCOL_LAYER_KEYS']
})){
 const zh=await import('../dist/'+file),en=await import('../dist/en/'+file);
 for(const name of exports)compare(zh[name],en[name],file+'.'+name);
}
for(const file of readdirSync('dist/en').filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check','dist/en/'+file]);
for(const [dir,lang,current,target] of [['dist/','zh-CN','zh','./en/'],['dist/en/','en','en','../']]){
 const html=readFileSync(dir+'index.html','utf8');
 assert.ok(html.includes(`<html lang="${lang}">`));
 assert.ok(html.includes(`data-language="${current}"`));
 assert.ok(html.includes(`href="${target}"`));
 assert.ok(html.includes('aria-current="page"'));
 for(const m of html.matchAll(/(?:src|href)="((?:\.\/|\.\.\/)[^"#]*)"/g)){
  if(m[1].endsWith('.zip'))continue;
  assert.ok(existsSync(dir+m[1]),`Missing asset/link: ${dir+m[1]}`);
 }
}
const zhCalc=await import('../dist/calculators.js'),enCalc=await import('../dist/en/calculators.js');
for(const [fn,args] of [['subnet',['192.168.10.130',26]],['tcpAck',[1001,500,true,true]],['delays',[1500,100,1000,200000000]],['mss',[1500,6,20]],['fragment',[4000,1500,20]]])compare(zhCalc[fn](...args),enCalc[fn](...args),fn);
assert.throws(()=>enCalc.subnet('999.1.1.1',24),/Address octet must be within/);
const {buildJourney}=await import('../dist/en/flows.js');
const {OSI,TCPIP}=await import('../dist/en/content.js');
for(const layers of [OSI,TCPIP])for(const scenario of ['http','dns']){
 const steps=buildJourney(layers,scenario);
 assert.equal(steps.length,layers.length*2+2);
 assert.ok(!han.test(JSON.stringify(steps)));
 assert.equal(steps.find(s=>s.router).headers.find(h=>h.kind==='network').text,'IP header · TTL 63');
 assert.equal(steps.at(-1).headers[0].text,scenario==='dns'?'DNS query':'HTTP request');
}
const {ATLAS}=await import('../dist/en/protocol-data.js');
const {workDiagram}=await import('../dist/en/protocols.js');
assert.ok(workDiagram(ATLAS.udp,1).includes('lost'));
assert.ok(workDiagram(ATLAS.tcp,2).includes('diagram-loss'));
console.log('PASS: Both languages have matching content structure, identifiers, calculations, flows, links and loss markers; English content is complete.');
