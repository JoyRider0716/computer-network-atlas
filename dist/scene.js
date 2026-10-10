// 轻量WebGL场景：全部几何由代码生成，无外部模型或CDN依赖。
export const vec = {
 sub:(a,b)=>a.map((v,i)=>v-b[i]), add:(a,b)=>a.map((v,i)=>v+b[i]),
 dot:(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 norm:a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n)}, scale:(a,n)=>a.map(v=>v*n)
};
export function multiply(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),n=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*n,-1,0,0,2*far*near*n,0]);}
function lookAt(eye,target){const z=vec.norm(vec.sub(eye,target)),x=vec.norm(vec.cross([0,1,0],z)),y=vec.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-vec.dot(x,eye),-vec.dot(y,eye),-vec.dot(z,eye),1]);}
export function rayBox(origin,dir,pos,size){let lo=-Infinity,hi=Infinity;for(let i=0;i<3;i++){const a=pos[i]-size[i]/2,b=pos[i]+size[i]/2;if(Math.abs(dir[i])<1e-8){if(origin[i]<a||origin[i]>b)return null;continue;}let t1=(a-origin[i])/dir[i],t2=(b-origin[i])/dir[i];if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return null;}return hi>=0?Math.max(lo,0):null;}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
const boxFaces=[
 {n:[0,0,1],p:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},
 {n:[0,0,-1],p:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},
 {n:[1,0,0],p:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},
 {n:[-1,0,0],p:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]},
 {n:[0,1,0],p:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},
 {n:[0,-1,0],p:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]}
];

export class NetworkScene {
 constructor(canvas,labels,onSelect){
  this.canvas=canvas;this.labelsRoot=labels;this.onSelect=onSelect;this.layers=[];this.selected=0;this.spread=true;this.angle=.13;this.pitch=.34;this.zoom=1;this.auto=false;this.packet=null;this.objects=[];this.vp=null;this.hosts=[-3.45,3.45];this.labelEls=[];this.last=0;
  this.gl=canvas.getContext('webgl',{alpha:true,antialias:true});
  if(this.gl)this.initGL();else{canvas.remove();this.canvas=document.createElement('canvas');this.canvas.id='scene-canvas';this.canvas.tabIndex=0;canvas.parentElement?.appendChild(this.canvas);this.labelsRoot.before(this.canvas);this.ctx=this.canvas.getContext('2d');const note=document.createElement('div');note.className='scene-fallback';note.textContent='已切换到兼容显示模式';labels.parentElement.appendChild(note);}
  this.bind();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.canvas.parentElement);this.resize();requestAnimationFrame(t=>this.frame(t));
 }
 initGL(){const gl=this.gl;const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,'attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uVP;uniform vec3 uPos;uniform vec3 uSize;varying vec3 vNormal;void main(){vNormal=aNormal;gl_Position=uVP*vec4(aPosition*uSize+uPos,1.0);}'));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec4 uColor;uniform float uUnlit;varying vec3 vNormal;void main(){float light=0.53+0.47*max(dot(normalize(vNormal+vec3(0.0001)),normalize(vec3(-0.4,0.9,0.5))),0.0);gl_FragColor=vec4(uColor.rgb*mix(light,1.0,uUnlit),uColor.a);}'));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
  this.uniforms=Object.fromEntries(['VP','Pos','Size','Color','Unlit'].map(k=>[k,gl.getUniformLocation(this.program,'u'+k)]));this.aPos=gl.getAttribLocation(this.program,'aPosition');this.aNormal=gl.getAttribLocation(this.program,'aNormal');
  const data=[];for(const face of boxFaces)for(const i of [0,1,2,0,2,3])data.push(...face.p[i],...face.n);this.boxBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.boxBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);this.lineBuffer=gl.createBuffer();gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 }
 bind(){let dragging=false,start=null,last=null;const pointers=new Map();let pinch=0;
  this.canvas.addEventListener('pointerdown',e=>{this.auto=false;document.getElementById('rotate').setAttribute('aria-pressed','false');pointers.set(e.pointerId,[e.clientX,e.clientY]);this.canvas.setPointerCapture(e.pointerId);if(pointers.size===1){dragging=true;start=last=[e.clientX,e.clientY];}else{dragging=false;const a=[...pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);}});
  this.canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()];const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch&&d)this.zoom=Math.max(.68,Math.min(1.65,this.zoom*pinch/d));pinch=d;}else if(dragging){this.angle+=(e.clientX-last[0])*.005;this.pitch=Math.max(.08,Math.min(.75,this.pitch+(e.clientY-last[1])*.004));last=[e.clientX,e.clientY];}});
  this.canvas.addEventListener('pointerup',e=>{if(dragging&&start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])<6)this.pick(e.clientX,e.clientY);pointers.delete(e.pointerId);dragging=false;start=null;pinch=0;});
  this.canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);dragging=false;});
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.max(.68,Math.min(1.65,this.zoom*Math.exp(e.deltaY*.001)));},{passive:false});
  this.canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')this.angle-=.12;if(e.key==='ArrowRight')this.angle+=.12;if(e.key==='ArrowUp')this.pitch=Math.min(.75,this.pitch+.06);if(e.key==='ArrowDown')this.pitch=Math.max(.08,this.pitch-.06);if(e.key==='+')this.zoom=Math.max(.68,this.zoom*.9);if(e.key==='-')this.zoom=Math.min(1.65,this.zoom/ .9);if(e.key==='Home')this.reset();});
 }
 resize(){const rect=this.canvas.parentElement.getBoundingClientRect();this.width=rect.width;this.height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.dpr=dpr;this.measureLabels();this.canvas.parentElement.classList.toggle('scene-labels-below',this.width<2*Math.max(...this.labelEls.filter(a=>a.layer!==undefined).map(a=>a.width),0)+300);this.packetLabelSize=null;}
 reset(){this.angle=.13;this.pitch=.34;this.zoom=1;this.auto=false;}
 setLayers(layers){this.layers=layers;this.selected=0;this.makeLabels();this.resize();}
 setSelected(index){this.selected=index;for(const a of this.labelEls)if(a.layer!==undefined)a.el.classList.toggle('active',a.layer===index);}
 layerY(i){const n=this.layers.length;return this.spread?.82+(n-1-i)*(n===7?.47:.9):.9+(n-1-i)*.24;}
 makeLabels(){this.labelsRoot.replaceChildren();this.labelEls=[];this.labelLines=document.createElementNS('http://www.w3.org/2000/svg','svg');this.labelLines.classList.add('label-connectors');this.labelLines.setAttribute('aria-hidden','true');this.labelsRoot.appendChild(this.labelLines);for(let h=0;h<2;h++){
   const host=document.createElement('div');host.className='model-label host-label';host.innerHTML=`<b>${h?'B':'A'}</b> ${h?'接收主机':'发送主机'}<small>${h?'192.168.2.20':'192.168.1.10'} /24</small>`;this.labelsRoot.appendChild(host);this.labelEls.push({el:host,host:h});
   this.layers.forEach((l,i)=>{const el=document.createElement('button');el.className='model-label layer-label';el.innerHTML=`<span class="layer-index">L${l.number}</span><span class="layer-name">${l.name}</span>`;el.style.setProperty('--label-color',l.color);el.setAttribute('aria-label',`${h?'接收':'发送'}主机：${l.name}`);el.addEventListener('click',()=>this.onSelect(i));const line=document.createElementNS('http://www.w3.org/2000/svg','path');this.labelLines.appendChild(line);this.labelsRoot.appendChild(el);this.labelEls.push({el,line,layer:i,host:h});});
  }const router=document.createElement('div');router.className='model-label router-label';router.innerHTML='路由器<small>IPv4 转发 · TTL 减 1</small>';this.labelsRoot.appendChild(router);this.labelEls.push({el:router,router:true});this.measureLabels();}
 measureLabels(){for(const a of this.labelEls){const display=a.el.style.display;a.el.style.display='';a.width=a.el.offsetWidth;a.height=a.el.offsetHeight;a.el.style.display=display;}}
 renderLabels(){
  // Labels use screen coordinates so their spacing stays readable as the camera turns.
  if(!this.labelEls.length)return;
  this.labelRects=[];
  const margin=12,heading=this.canvas.parentElement.querySelector('.scene-heading');
  const headingBottom=heading?heading.offsetTop+heading.offsetHeight:110;
  this.labelTop=this.modelBand?this.modelBand.bottom+12:headingBottom+12;
  const router=this.labelEls.find(a=>a.router);
  const groups=this.hosts.map((x,host)=>({host,x:this.project([x,1.7,0]).x,labels:this.labelEls.filter(a=>a.host===host&&a.layer!==undefined&&(this.spread||a.layer===this.selected))})).sort((a,b)=>a.x-b.x);
  const labelWidth=Math.max(...this.labelEls.filter(a=>a.layer!==undefined).map(a=>a.width),1);
  const columns=this.modelBand?[margin+labelWidth/2,this.width-margin-labelWidth/2]:[
   Math.max(margin+labelWidth/2,this.modelBounds.left-12-labelWidth/2),
   Math.min(this.width-margin-labelWidth/2,this.modelBounds.right+12+labelWidth/2)
  ];
  const hostLabels=groups.map(g=>this.labelEls.find(a=>a.host===g.host&&a.layer===undefined));
  const hostInset=this.modelBand?margin:labelWidth+24;
  const hostXs=groups.map((g,i)=>Math.max(hostInset+hostLabels[i].width/2,Math.min(this.width-hostInset-hostLabels[i].width/2,this.project([this.hosts[g.host],this.layerY(0)+.139,0]).x)));
  const hostSeparation=(hostLabels[0].width+hostLabels[1].width)/2+12;
  if(hostXs[1]-hostXs[0]<hostSeparation){
   const middle=Math.max(hostInset+hostLabels[0].width/2+hostSeparation/2,Math.min(this.width-hostInset-hostLabels[1].width/2-hostSeparation/2,(hostXs[0]+hostXs[1])/2));
   hostXs[0]=middle-hostSeparation/2;hostXs[1]=middle+hostSeparation/2;
  }
  const stackTop=Math.min(...this.hosts.flatMap(x=>[-1.23,1.23].flatMap(dx=>[-.75,.78].map(z=>this.project([x+dx,this.layerY(0)+.139,z]).y))));
  const hostYs=hostLabels.map(host=>Math.max(headingBottom+host.height/2+10,stackTop-host.height/2-12));
  const hostBottom=Math.max(...hostYs.map((y,i)=>y+hostLabels[i].height/2));
  let lowest=0;
  for(const a of this.labelEls)if(a.layer!==undefined){const visible=this.spread||a.layer===this.selected;a.el.style.display=visible?'':'none';a.line.style.display=visible?'':'none';}
  groups.forEach((g,column)=>{
   const host=this.labelEls.find(a=>a.host===g.host&&a.layer===undefined);
   const entries=g.labels.map(a=>({...a,anchor:this.project([this.hosts[a.host],this.layerY(a.layer)+.02,.78])})).sort((a,b)=>a.anchor.y-b.anchor.y);
   if(!entries.length)return;
   const height=Math.max(...entries.map(a=>a.height)),gap=height+7;
   const top=Math.max((this.modelBand?this.modelBand.bottom:headingBottom)+28,hostBottom+12)+height/2,bottom=this.height-88-router.height-18-height/2;
   const ys=entries.map((a,i)=>this.modelBand?top+i*gap:a.anchor.y);
   for(let i=1;i<ys.length;i++)ys[i]=Math.max(ys[i],ys[i-1]+gap);
   const shift=this.modelBand?0:entries.reduce((sum,a,i)=>sum+a.anchor.y-ys[i],0)/entries.length;
   const offset=Math.max(top-ys[0],Math.min(bottom-ys.at(-1),shift));
   entries.forEach((a,i)=>{
    const x=columns[column],y=ys[i]+offset;
    a.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    a.el.style.display=a.anchor.visible?'':'none';
    if(a.anchor.visible)this.labelRects.push({x:x-a.width/2,y:y-a.height/2,width:a.width,height:a.height});
    const edge=x+(a.anchor.x>=x?1:-1)*a.width/2;
    a.line.setAttribute('d',`M ${a.anchor.x} ${a.anchor.y} L ${edge} ${y}`);
    a.line.setAttribute('stroke',a.layer===this.selected?'#edb47c':this.layers[a.layer].color);
    a.line.style.display=a.anchor.visible&&Math.hypot(a.anchor.x-edge,a.anchor.y-y)>12?'':'none';
    a.line.classList.toggle('active',a.layer===this.selected);
    lowest=Math.max(lowest,y+a.height/2);
   });
   const hostAnchor=this.project([this.hosts[g.host],this.layerY(0)+.139,0]);
   const hostY=hostYs[column];
   const hostX=hostXs[column];
   host.el.style.transform=`translate(${hostX}px,${hostY}px) translate(-50%,-50%)`;
   host.el.style.display=hostAnchor.visible?'':'none';
   if(hostAnchor.visible)this.labelRects.push({x:hostX-host.width/2,y:hostY-host.height/2,width:host.width,height:host.height});
  });
  const p=this.project([0,-.39,1.55]);
  const routerY=Math.min(this.height-88-router.height/2,Math.max(p.y,lowest+router.height/2+18));
  const routerX=Math.max(router.width/2+margin,Math.min(this.width-router.width/2-margin,p.x));
  router.el.style.transform=`translate(${routerX}px,${routerY}px) translate(-50%,-50%)`;
  router.el.style.display=p.visible?'':'none';
  if(p.visible)this.labelRects.push({x:routerX-router.width/2,y:routerY-router.height/2,width:router.width,height:router.height});
 }
 renderPacketLabel(){
  const label=document.getElementById('packet-label');
  if(!this.packet){label.hidden=true;return;}
  label.hidden=false;
  if(label.textContent!==this.packet.tag){label.textContent=this.packet.tag;this.packetLabelSize=null;}
  if(!this.packetLabelSize)this.packetLabelSize={width:label.offsetWidth,height:label.offsetHeight};
  const {width,height}=this.packetLabelSize,p=this.project(this.packet.position);
  const clampX=x=>Math.max(width/2+12,Math.min(this.width-width/2-12,x));
  const clampY=y=>Math.max(this.labelTop+height/2,Math.min(this.height-88-height/2,y));
  const desired={x:clampX(p.x),y:clampY(p.y-25-height/2)};
  const candidates=[desired,{x:this.width/2,y:desired.y}];
  for(let y=this.labelTop+height/2;y<=this.height-88-height/2;y+=8)candidates.push({x:this.width/2,y});
  const clear=({x,y})=>!(this.labelRects||[]).some(r=>x+width/2+5>r.x&&x-width/2-5<r.x+r.width&&y+height/2+5>r.y&&y-height/2-5<r.y+r.height);
  const positions=candidates.filter(clear).sort((a,b)=>Math.hypot(a.x-desired.x,a.y-desired.y)-Math.hypot(b.x-desired.x,b.y-desired.y));
  const position=positions[0]||desired;
  label.style.transform=`translate(${position.x}px,${position.y}px) translate(-50%,-50%)`;
 }
 camera(){const aspect=this.width/this.height;const radius=Math.max(12.7,13/aspect)*this.zoom;const target=[0,1.7,0];this.eye=[Math.sin(this.angle)*Math.cos(this.pitch)*radius,target[1]+Math.sin(this.pitch)*radius,Math.cos(this.angle)*Math.cos(this.pitch)*radius];this.target=target;this.vp=multiply(perspective(Math.PI/4,aspect,.1,100),lookAt(this.eye,target));this.fitModelBetweenLabels();}
 fitModelBetweenLabels(){
  this.projectionFit={scale:1,shift:0,shiftY:0};
  this.modelBand=null;
  const labelWidth=Math.max(...this.labelEls.filter(a=>a.layer!==undefined).map(a=>a.width),0);
  if(!labelWidth||!this.layers.length)return;
  const narrow=this.width<2*labelWidth+300;
  const inset=narrow?24:labelWidth+24,available=Math.max(1,this.width-2*inset);
  const points=[];
  // Fit the blocks between desktop labels; keep the whole model above narrow-screen labels.
  const boxes=this.boxes();
  if(this.packet)boxes.pop(); // Moving packets must not change camera framing.
  for(const box of boxes.filter(b=>narrow?b.layer!==null||b.pos[1]<.75:b.layer!==null)){
   for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5])points.push(this.project(box.pos.map((v,i)=>v+[x,y,z][i]*box.size[i])));
  }
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x));
  let scale=Math.min(1,available/Math.max(1,right-left)),shiftY=0;
  const heading=this.canvas.parentElement.querySelector('.scene-heading');
  const hostHeight=Math.max(...this.labelEls.filter(a=>a.host!==undefined&&a.layer===undefined).map(a=>a.height),32);
  const top=(heading?heading.offsetTop+heading.offsetHeight:110)+hostHeight+30;
  const modelTop=Math.min(...points.map(p=>p.y)),modelBottom=Math.max(...points.map(p=>p.y));
  if(narrow){
   this.modelBand={top,bottom:top+190};
   scale=Math.min(scale,190/Math.max(1,modelBottom-modelTop));
   shiftY=1-(this.modelBand.top+this.modelBand.bottom)/this.height-scale*(1-(modelTop+modelBottom)/this.height);
  }else{
   const bottom=this.height-120;
   scale=Math.min(scale,Math.max(1,bottom-top)/Math.max(1,modelBottom-modelTop));
   const projectedTop=(modelTop-this.height/2)*scale+this.height/2;
   const projectedBottom=(modelBottom-this.height/2)*scale+this.height/2;
   const offset=Math.max(top-projectedTop,Math.min(bottom-projectedBottom,0));
   shiftY=-2*offset/this.height;
  }
  const center=(left+right)/2,shift=scale*(1-2*center/this.width);
  this.projectionFit={scale,shift,shiftY};
  this.modelBounds={left:(left-this.width/2)*scale+this.width/2+shift*this.width/2,right:(right-this.width/2)*scale+this.width/2+shift*this.width/2};
  for(let col=0;col<4;col++){
   const offset=col*4;
   this.vp[offset]=this.vp[offset]*scale+this.vp[offset+3]*shift;
   this.vp[offset+1]=this.vp[offset+1]*scale+this.vp[offset+3]*shiftY;
  }
 }
 project(p){const m=this.vp;const r=[0,0,0,0];for(let row=0;row<4;row++)r[row]=m[row]*p[0]+m[4+row]*p[1]+m[8+row]*p[2]+m[12+row];return {x:(r[0]/r[3]+1)*this.width/2,y:(1-r[1]/r[3])*this.height/2,z:r[2]/r[3],visible:r[3]>0};}
 boxes(){const out=[];const add=(pos,size,color,layer=null)=>out.push({pos,size,color:typeof color==='string'?rgb(color):color,layer});
  for(const x of this.hosts){add([x,-.16,.25],[3.05,.16,2.95],'#244253');add([x,-.045,.25],[2.88,.045,2.78],'#294e5e');add([x,.25,1.28],[1.6,.44,.65],'#193641');add([x,.49,1.26],[1.55,.035,.60],'#51777a');
   add([x,.62,1.54],[.56,.12,.04],'#538c80');add([x+.63,.33,1.625],[.045,.045,.012],'#8dccad');add([x,.54,-.73],[2.36,.27,.25],'#426575');
   add([x,.72,1.65],[1.13,.52,.085],'#17313f');add([x,.72,1.70],[1.0,.39,.012],'#346e73');add([x-.16,.82,1.71],[.48,.018,.014],'#78b2aa');add([x-.24,.75,1.71],[.32,.018,.014],'#619d99');add([x-.29,.68,1.71],[.22,.018,.014],'#619d99');
   for(const dx of [-1.15,1.15])add([x+dx,1.98,-.57],[.045,3.3,.045],'#436c76');
   this.layers.forEach((l,i)=>{const active=i===this.selected;const y=this.layerY(i);const color=active?[.86,.58,.34]:mix(rgb(l.color),[.14,.26,.31],.32);add([x,y,0],[2.46,.22,1.5],color,i);add([x,y+.115,0],[2.38,.024,1.42],active?'#e6bb81':mix(rgb(l.color),[.61,.78,.74],.28));add([x-1.16,y,.755],[.05,.10,.015],active?'#ffdc9d':'#b7d8cf');});
  }
  add([0,.09,1.05],[1.55,.26,.95],'#344e5e');add([0,.235,1.05],[1.51,.035,.91],'#567583');for(let i=0;i<4;i++){add([-.44+i*.29,.11,1.534],[.17,.085,.015],'#152c35');add([-.41+i*.29,.17,1.55],[.03,.025,.012],'#8bc4a4');}
  if(this.packet){const point=this.packet.position;add(point,[.16,.16,.16],this.packet.drop?'#db8275':'#f1cf80');}
  return out;
 }
 line(points,color,alpha=1){if(this.gl){const gl=this.gl,arr=[];for(const p of points)arr.push(...p,0,1,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.lineBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.DYNAMIC_DRAW);this.attributes();gl.uniform3fv(this.uniforms.Pos,[0,0,0]);gl.uniform3fv(this.uniforms.Size,[1,1,1]);gl.uniform4fv(this.uniforms.Color,[...color,alpha]);gl.uniform1f(this.uniforms.Unlit,1);gl.drawArrays(gl.LINES,0,points.length);}else{const c=this.ctx;c.strokeStyle=`rgba(${color.map(x=>Math.round(x*255)).join(',')},${alpha})`;c.lineWidth=1;for(let i=0;i<points.length;i+=2){const a=this.project(points[i]),b=this.project(points[i+1]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}}
 attributes(){const gl=this.gl;gl.enableVertexAttribArray(this.aPos);gl.vertexAttribPointer(this.aPos,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(this.aNormal);gl.vertexAttribPointer(this.aNormal,3,gl.FLOAT,false,24,12);}
 render(){if(!this.width||!this.height||this.canvas.parentElement.getBoundingClientRect().width===0)return;this.camera();this.objects=this.boxes();if(this.gl){const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.uniforms.VP,false,this.vp);}else{this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.ctx.clearRect(0,0,this.width,this.height);}
  const grid=[];for(let x=-12;x<=12;x++)grid.push([x,-.27,-10],[x,-.27,8],[-12,-.27,x],[12,-.27,x]);this.line(grid,rgb('#274755'),.4);
  const cables=[[-3.45,.035,1.14],[-1.0,.035,1.14],[-1.0,.035,1.14],[0,.035,1.14],[0,.035,1.14],[1.0,.035,1.14],[1.0,.035,1.14],[3.45,.035,1.14]];this.line(cables,rgb('#62b3a2'),.85);
  if(this.gl){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.boxBuffer);this.attributes();gl.uniform1f(this.uniforms.Unlit,0);for(const b of this.objects){gl.uniform3fv(this.uniforms.Pos,b.pos);gl.uniform3fv(this.uniforms.Size,b.size);gl.uniform4fv(this.uniforms.Color,[...b.color,1]);gl.drawArrays(gl.TRIANGLES,0,36);}}
  else this.renderFallback();
  if(this.layers.length){const y=this.layerY(this.selected)+.16;const peer=[];for(let x=-2.15;x<2.15;x+=.28)peer.push([x,y,0],[x+.13,y,0]);this.line(peer,rgb('#9f9980'),.42);}
  this.renderLabels();
  this.renderPacketLabel();
 }
 renderFallback(){const faces=[];for(const b of this.objects)for(const face of boxFaces){const verts=face.p.map(p=>vec.add(b.pos,p.map((v,i)=>v*b.size[i])));const center=verts.reduce((a,p)=>vec.add(a,vec.scale(p,.25)),[0,0,0]);if(vec.dot(face.n,vec.sub(this.eye,center))<=0)continue;faces.push({points:verts.map(p=>this.project(p)),depth:vec.dot(vec.sub(center,this.eye),vec.norm(vec.sub(this.target,this.eye))),color:b.color.map(v=>Math.round(v*(.53+.47*Math.max(vec.dot(face.n,vec.norm([-.4,.9,.5])),0))*255))});}faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){const c=this.ctx;c.beginPath();f.points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=`rgb(${f.color.join(',')})`;c.fill();}}
 pick(clientX,clientY){const rect=this.canvas.getBoundingClientRect(),nx=(clientX-rect.left)/this.width*2-1,ny=1-(clientY-rect.top)/this.height*2;const {scale,shift,shiftY}=this.projectionFit||{scale:1,shift:0,shiftY:0},px=(nx-shift)/scale,py=(ny-shiftY)/scale;const forward=vec.norm(vec.sub(this.target,this.eye)),right=vec.norm(vec.cross(forward,[0,1,0])),up=vec.cross(right,forward),f=Math.tan(Math.PI/8);const dir=vec.norm(vec.add(forward,vec.add(vec.scale(right,px*f*this.width/this.height),vec.scale(up,py*f))));let hit=null,best=Infinity;for(const box of this.objects){if(box.layer===null)continue;const t=rayBox(this.eye,dir,box.pos,box.size);if(t!==null&&t<best){best=t;hit=box.layer;}}if(hit!==null)this.onSelect(hit);}
 frame(t){const dt=Math.min(t-this.last,60);this.last=t;if(this.auto&&!document.hidden)this.angle+=dt*.00009;if(!document.hidden)this.render();requestAnimationFrame(n=>this.frame(n));}
}
