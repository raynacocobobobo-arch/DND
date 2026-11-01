import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v15-world.js?v=15a';

/** 1 permanent patrolling gull; 0–2 occasional gulls traverse opposite world edges. */
export function createFlyingGulls(){
 const flock=new T.Group();flock.name='sparse-lowpoly-seagulls';group.add(flock);
 const white=new T.MeshLambertMaterial({color:'#dce1e0',flatShading:true,side:T.DoubleSide});
 const shade=new T.MeshLambertMaterial({color:'#aebbc1',flatShading:true,side:T.DoubleSide});
 const orange=new T.MeshLambertMaterial({color:'#db663b',flatShading:true,side:T.DoubleSide});
 const eye=new T.MeshBasicMaterial({color:'#273039'});
 const bodyGeo=new T.IcosahedronGeometry(1,0),wingGeoCache={};
 function add(parent,geo,mat,x,y,z){
  const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);
  mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh;
 }
 function wingGeom(side){
  if(wingGeoCache[side])return wingGeoCache[side];
  const points=[[0,0,-.02],[.36,.11,-.25],[1.00,.21,-.16],
   [1.72,.13,.37],[1.24,.01,.36],[.66,-.03,.27],[.04,-.04,.20]];
  const faces=[[0,1,5],[1,2,5],[2,3,4],[2,4,5],[0,5,6]];
  const coords=[];
  for(const f of faces)for(const k of f)coords.push(points[k][0]*side,points[k][1],points[k][2]);
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(coords,3));
  geo.computeVertexNormals();
  wingGeoCache[side]=geo;return geo;
 }
 function makeGull(i){
  const root=new T.Group();root.name='seagull-'+i;flock.add(root);
  const body=add(root,bodyGeo,white,0,0,0);body.scale.set(.23,.17,.55);
  const head=add(root,bodyGeo,white,0,.10,-.44);head.scale.set(.18,.17,.19);
  const cap=add(root,bodyGeo,shade,0,.19,-.46);cap.scale.set(.14,.050,.14);
  for(const s of [-1,1]){
   const e=add(root,bodyGeo,eye,s*.155,.10,-.53);e.scale.setScalar(.028);
   const tail=add(root,new T.ConeGeometry(.1,.38,3),shade,s*.10,-.035,.48);
   tail.rotation.x=Math.PI/2;tail.rotation.z=s*.14;
  }
  const beak=add(root,new T.ConeGeometry(.075,.25,4),orange,0,.03,-.69);
  beak.rotation.x=-Math.PI/2;
  const wings=[];
  for(const s of [-1,1]){
   const pivot=new T.Group();pivot.position.set(s*.17,.095,-.02);root.add(pivot);
   add(pivot,wingGeom(s),s===1?white:shade,0,0,0);
   wings.push({pivot,side:s});
  }
  root.scale.setScalar(i===0?.43:i===1?.38:.35);
  return {root,wings,index:i};
 }
 const resident=makeGull(0),transients=[makeGull(1),makeGull(2)];
 let seed=20261102;
 const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 const R=(a,b)=>a+(b-a)*rnd();
 const edges=[
  // The four start/out points are just beyond the world, not camera-dependent.
  {side:0},{side:1},{side:2},{side:3}
 ];
 const hx=W*.5,hz=D*.5,cx=WATER_CENTER_X,cz=WATER_CENTER_Z;
 const edgePoint=(side,t,margin)=>{
  if(side===0)return new T.Vector3(cx+t*hx,0,cz-hz-margin);
  if(side===1)return new T.Vector3(cx+hx+margin,0,cz+t*hz);
  if(side===2)return new T.Vector3(cx+t*hx,0,cz+hz+margin);
  return new T.Vector3(cx-hx-margin,0,cz+t*hz);
 };
 let time=0,nextArrival=R(8,14),entered=0,exited=0,maxVisible=1;
 const active=new Map();
 function schedule(){
  // Natural long quiet intervals; the second bird sometimes joins after first.
  nextArrival=time+R(active.size===0?12:9,active.size===0?21:16);
 }
 function startTransient(bird){
  const side=Math.floor(rnd()*4);
  let dest=(side+2+(rnd()<.30?1:0))%4;
  if(dest===side)dest=(side+2)%4;
  const from=edgePoint(side,R(-.76,.76),R(3.2,5.8));
  const to=edgePoint(dest,R(-.70,.70),R(3.6,6.0));
  const h=R(5.0,7.1),dh=R(-.6,.7);
  from.y=h;to.y=h+dh;
  const middle=from.clone().lerp(to,.48);
  middle.x+=R(-2.2,2.2);middle.z+=R(-2.4,2.4);middle.y+=R(-.50,.80);
  const curve=new T.QuadraticBezierCurve3(from,middle,to);
  const duration=R(17,25),offset=R(0,6.28);
  const slot={bird,curve,elapsed:0,duration,offset,from:side,to:dest};
  active.set(bird.index,slot);bird.root.visible=true;entered++;
 }
 function pose(bird,position,direction,t){
  bird.root.position.copy(position);
  bird.root.rotation.y=Math.atan2(-direction.x,-direction.z);
  bird.root.rotation.z=.07*Math.sin(time*.62+bird.index*1.17);
  for(const w of bird.wings){
   // Uneven flap periods separated by long glides, not constant mechanical waving.
   const beat=Math.sin(time*(3.1+bird.index*.23)+t+bird.index*2.4);
   const glide=.20+.16*Math.sin(time*.32+bird.index);
   w.pivot.rotation.z=w.side*(glide+.38*Math.max(-.55,beat));
   w.pivot.rotation.x=.035*Math.cos(time*2.2+bird.index);
  }
 }
 function residentPose(){
  const t=time*.145+.32;
  const x=cx+8.0*Math.cos(t),z=cz+6.55*Math.sin(t);
  const y=5.4+.30*Math.sin(t*1.7);
  const p=new T.Vector3(x,y,z);
  const d=new T.Vector3(-8*Math.sin(t),.30*1.7*Math.cos(t*1.7),6.55*Math.cos(t));
  pose(resident,p,d,t);
  resident.root.visible=true;
 }
 for(const g of transients)g.root.visible=false;
 function update(dt){
  const d=Math.max(0,Math.min(dt||0,.25));time+=d;
  residentPose();
  for(const [i,s] of active){
   s.elapsed+=d;
   const t=Math.min(1,s.elapsed/s.duration);
   if(t>=1){
    s.bird.root.visible=false;active.delete(i);exited++;continue;
   }
   const p=s.curve.getPoint(t),v=s.curve.getTangent(t);
   pose(s.bird,p,v,s.offset);
  }
  if(time>=nextArrival && active.size<2){
   const idle=transients.find(g=>!active.has(g.index));
   if(idle)startTransient(idle);
   schedule();
  }
  const visible=1+active.size;
  maxVisible=Math.max(maxVisible,visible);
 }
 function getState(){
  const positions=[resident,...transients].map(g=>({
   index:g.index,visible:g.root.visible,
   x:+g.root.position.x.toFixed(3),y:+g.root.position.y.toFixed(3),
   z:+g.root.position.z.toFixed(3)
  }));
  return {count:1,residentCount:1,transientCapacity:2,
   visibleCount:1+active.size,activeTransients:active.size,
   entered,exited,maxVisible,flapping:true,flying:true,
   positions,wingAngle:+resident.wings[0].pivot.rotation.z.toFixed(4),
   activeRoutes:[...active.values()].map(s=>({from:s.from,to:s.to,
    progress:+(s.elapsed/s.duration).toFixed(3)})),
   elapsed:+time.toFixed(3),nextArrival:+nextArrival.toFixed(3)
  };
 }
 update(.016);
 return {flock,update,getState,advanceForTest:(seconds)=>{
  const steps=Math.ceil(Math.min(Math.max(0,seconds),400)/.10);
  for(let i=0;i<steps;i++)update(.10);
  return getState();
 }};
}
