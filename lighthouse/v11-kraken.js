import * as T from 'three';

/**
 * Single nocturnal Kraken tentacle. Everything is local to this module:
 * no modification to the existing island, water shader, lighting, or geometry.
 *
 * Design: tapered, faceted red mantle, warm pale sucker rings,
 * spline-like lateral sweep and curled tip; never a straight Y translation.
 */
export function createKraken(parent,options={}){
 const root=new T.Group();
 root.name='kraken-single-tentacle';
 parent.add(root);
 const origin={x:6.95,z:-2.72};
 const seaY=.18+.045*Math.sin(origin.x*2.8+origin.z*.65)
                 +.024*Math.cos(origin.z*3.6-origin.x*.70)
                 +.012*Math.sin(origin.x*6+origin.z*4.7);
 const worldUp=new T.Vector3(0,1,0);
 const towardCamera=new T.Vector3(.58,0,.82).normalize();
 const tmp=new T.Vector3(),tan=new T.Vector3(),front=new T.Vector3(),side=new T.Vector3();
 const qFrom=new T.Vector3(0,0,1);
 const segments=36,sides=14,positions=new Float32Array((segments+1)*(sides+1)*3);
 const colors=new Float32Array(positions.length),indices=[];
 const outer=new T.Color('#b84d3b'),shadow=new T.Color('#87362f'),underside=new T.Color('#cf8276');
 for(let k=0;k<=segments;k++){
  const t=k/segments;
  for(let j=0;j<=sides;j++){
   const ang=j/sides*Math.PI*2,v=Math.cos(ang);
   const c=(v>.40?underside:outer).clone().lerp(shadow,.12+.15*(Math.sin(ang+2.4)+1)/2);
   c.multiplyScalar(.92+.08*(k%3)/2);
   let id=(k*(sides+1)+j)*3;colors[id]=c.r;colors[id+1]=c.g;colors[id+2]=c.b;
   if(k<segments&&j<sides){
    const a=k*(sides+1)+j,b=a+sides+1;
    indices.push(a,b,a+1,b,b+1,a+1);
   }
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.BufferAttribute(positions,3));
 geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 geometry.setIndex(indices);
 geometry.attributes.position.setUsage(T.DynamicDrawUsage);
 const skin=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:0,flatShading:true,side:T.DoubleSide});
 const mantle=new T.Mesh(geometry,skin);
 mantle.name='kraken-tapered-mantle';
 mantle.castShadow=true;mantle.receiveShadow=true;mantle.frustumCulled=false;root.add(mantle);

 const cupRim=new T.MeshStandardMaterial({color:'#e9d3c2',roughness:.82,side:T.DoubleSide});
 const cupInset=new T.MeshStandardMaterial({color:'#896362',roughness:1,side:T.DoubleSide});
 const rimGeometry=new T.TorusGeometry(1,.20,6,16);
 const insetGeometry=new T.CircleGeometry(.71,16);
 const cups=[];
 for(let row=0;row<2;row++)for(let index=0;index<12;index++){
  const t=.14+(index+.18*row)*.061;
  const rim=new T.Mesh(rimGeometry,cupRim);
  const inset=new T.Mesh(insetGeometry,cupInset);
  rim.name='kraken-sucker-rim';inset.name='kraken-sucker-center';
  rim.castShadow=false;inset.castShadow=false;
  root.add(rim,inset);
  cups.push({t,row,rim,inset});
 }

 const foamMaterials=[
  new T.MeshBasicMaterial({color:'#a5d4d5',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}),
  new T.MeshBasicMaterial({color:'#eff2da',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide})
 ];
 const rings=[];
 for(let i=0;i<2;i++){
  const ring=new T.Mesh(new T.TorusGeometry(1,.018+i*.005,7,64),foamMaterials[i]);
  ring.rotation.x=-Math.PI/2;
  ring.position.set(origin.x,seaY+.031+i*.008,origin.z);
  ring.renderOrder=8;ring.name='kraken-water-ripple';
  ring.castShadow=false;root.add(ring);rings.push(ring);
 }
 const mix=(a,b,t)=>a+(b-a)*t;
 const ease=t=>t*t*(3-2*t);
 const clamp=x=>Math.max(0,Math.min(1,x));
 const randWait=()=>5+Math.random()*5;
 let night=false,phase='day',elapsed=0,wait=randWait(),hold=3.0;
 let totalTime=0,growth=0,visibleOnce=false;
 function radius(t){return .42*Math.pow(1-t,.80)+.048}
 function center(t,g,time,out){
  const curl=ease(clamp((t-.63)/.37));
  const wave=Math.sin(time*1.24+t*3.1)*Math.sin(Math.PI*t);
  // The stem originates underwater while the upper section sweeps sideways, then folds back.
  out.set(
   origin.x+g*(.60*Math.sin(Math.PI*t)-1.02*curl+.19*wave),
   seaY-.37+g*(3.93*t-1.58*curl)+.09*g*Math.sin(time*.93+t*4.3)*Math.sin(Math.PI*t),
   origin.z+g*(-.40*Math.sin(Math.PI*t*.94)+.76*curl+.14*Math.cos(time*.84+t*4.0)*Math.sin(Math.PI*t))
  );
  return out;
 }
 const prev=new T.Vector3(),next=new T.Vector3(),p=new T.Vector3();
 const normal=new T.Vector3();
 function frame(t,g,time,position){
  center(t,g,time,position);
  center(Math.max(0,t-.006),g,time,prev);
  center(Math.min(1,t+.006),g,time,next);
  tan.copy(next).sub(prev).normalize();
  front.copy(towardCamera).addScaledVector(tan,-towardCamera.dot(tan)).normalize();
  if(front.lengthSq()<.01)front.set(0,0,1);
  side.crossVectors(tan,front).normalize();
 }
 function animateGeometry(g,time){
  for(let k=0;k<=segments;k++){
   const t=k/segments;
   frame(t,g,time,p);
   const radiusAt=radius(t);
   for(let j=0;j<=sides;j++){
    const theta=2*Math.PI*j/sides;
    const r=radiusAt*(1+.035*Math.cos(theta*5.0+t*22.0));
    const i=(k*(sides+1)+j)*3;
    positions[i]=p.x+r*(front.x*Math.cos(theta)+side.x*Math.sin(theta));
    positions[i+1]=p.y+r*(front.y*Math.cos(theta)+side.y*Math.sin(theta));
    positions[i+2]=p.z+r*(front.z*Math.cos(theta)+side.z*Math.sin(theta));
   }
  }
  geometry.attributes.position.needsUpdate=true;
  geometry.computeVertexNormals();
  for(const c of cups){
   frame(c.t,g,time,p);
   const angle=(c.row===0?-.43:.43);
   normal.copy(front).multiplyScalar(Math.cos(angle)).addScaledVector(side,Math.sin(angle)).normalize();
   const sz=.105*(1-c.t*.60);
   c.rim.position.copy(p).addScaledVector(normal,radius(c.t)+.017);
   c.rim.quaternion.setFromUnitVectors(qFrom,normal);
   c.rim.scale.setScalar(sz);
   c.inset.position.copy(p).addScaledVector(normal,radius(c.t)+.034);
   c.inset.quaternion.copy(c.rim.quaternion);
   c.inset.scale.setScalar(sz);
  }
  rings.forEach((ring,i)=>{
   const phase=time*(.43+i*.12);
   const scale=(.39+i*.17)+(phase%1.6)*.22;
   ring.scale.setScalar(scale);
   foamMaterials[i].opacity=(.26-i*.065)*Math.sin(Math.PI*clamp(g))*Math.max(0,1-(phase%1.6)/1.9);
  });
 }
 function publish(){
  document.body.dataset.krakenPhase=phase;
  document.body.dataset.krakenWait=wait.toFixed(3);
  document.body.dataset.krakenGrowth=growth.toFixed(3);
  document.body.dataset.krakenCount='1';
 }
 function setNight(enabled){
  night=!!enabled;
  elapsed=0;growth=0;
  phase=night?'waiting':'day';
  wait=randWait();hold=3+Math.random()*1.2;
  root.visible=false;
  publish();
 }
 function startEvent(){
  if(!night)return false;
  phase='rising';elapsed=0;growth=0;
  root.visible=true;visibleOnce=true;
  publish();
  return true;
 }
 function update(delta){
  // Time is intentionally frame-rate independent and clamped after tab/background suspension.
  const dt=Math.min(Math.max(delta||0,0),.10);
  if(!night){root.visible=false;return}
  totalTime+=dt;
  elapsed+=dt;
  if(phase==='waiting'){
   if(elapsed>=wait)startEvent();
   else {root.visible=false;publish();return}
  }
  if(phase==='rising'){
   growth=ease(clamp(elapsed/2.3));
   if(elapsed>=2.3){phase='hover';elapsed=0;growth=1}
  }else if(phase==='hover'){
   growth=1;
   if(elapsed>=hold){phase='retreat';elapsed=0}
  }else if(phase==='retreat'){
   growth=1-ease(clamp(elapsed/2.7));
   if(elapsed>=2.7){
    phase='waiting';elapsed=0;growth=0;wait=randWait();hold=3+Math.random()*1.2;
    root.visible=false;publish();return;
   }
  }
  root.visible=true;
  animateGeometry(growth,totalTime);
  publish();
 }
 setNight(false);
 return {
  root,setNight,update,
  getState:()=>({night,phase,elapsed,wait,hold,growth,origin:{...origin},seaY,
                count:1,visible:root.visible,everAppeared:visibleOnce}),
  forceEvent:()=>startEvent()
 };
}
