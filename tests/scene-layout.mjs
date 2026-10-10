import assert from 'node:assert/strict';
import {NetworkScene} from '../dist/scene.js';
import {OSI,TCPIP} from '../dist/content.js';

// Project actual block corners, then check the space available to the visible labels.
for(const [width,height,labelWidth] of [[296,780,100],[366,880,132],[818,640,150]]){
 for(const layers of [OSI,TCPIP])for(const angle of [0,.8,1.6,3.2])for(const zoom of [.68,1,1.65]){
  const scene=Object.create(NetworkScene.prototype);
  Object.assign(scene,{width,height,layers,hosts:[-3.45,3.45],spread:true,selected:0,angle,pitch:.34,zoom,packet:null,labelEls:[{layer:0,width:labelWidth}],canvas:{parentElement:{querySelector:()=>({offsetTop:25,offsetHeight:100})},getBoundingClientRect:()=>({left:0,top:0})}});
  scene.camera();
  const projection=scene.vp.slice();scene.packet={position:[0,.35,1.05],tag:'TCP'};scene.camera();
  assert.deepEqual(scene.vp,projection,'Packet animation must not move the fitted camera');
  scene.packet=null;scene.objects=scene.boxes();
  for(const box of scene.objects.filter(b=>b.layer!==null)){
   for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5]){
    const point=scene.project(box.pos.map((v,i)=>v+[x,y,z][i]*box.size[i]));
    if(scene.modelBand){
     assert.ok(point.y>=scene.modelBand.top-.01&&point.y<=scene.modelBand.bottom+.01,'Narrow-screen blocks must stay above labels');
    }else{
     assert.ok(point.y>=125+32+30-.01,'Blocks must leave space for host information above them');
     assert.ok(point.x>=labelWidth+24-.01&&point.x<=width-labelWidth-24+.01,'Blocks must leave room for both outer label columns');
    }
   }
  }
  if(angle===0){
   const box=scene.objects.find(b=>b.layer===2);
   const point=scene.project(box.pos.map((v,i)=>v+(i===2?box.size[2]/2+.001:0)));
   let selected=null;scene.onSelect=i=>selected=i;scene.pick(point.x,point.y);
   assert.equal(selected,2,'A visible block must remain clickable after the camera is fitted');
  }
 }
}
console.log('PASS: Projected blocks leave space for outer labels; narrow-screen labels have a separate area; fitted blocks remain clickable.');
