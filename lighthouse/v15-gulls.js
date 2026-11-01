import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v15-world.js?v=15a';

/** Eight small faceted gulls, modeled after geometric low-poly paper birds.
 * Each gull has articulated wings, a white-grey body and an orange beak.
 */
export function createFlyingGulls(){
 const flock=new T.Group();flock.name='flying-lowpoly-gulls';group.add(flock);
 const white=new T.MeshLambertMaterial({color:'#dce1e0',flatShading:true,side:T.DoubleSide});
 const wingShade=new T.MeshLambertMaterial({color:'#adb9be',flatShading:true,side:T.DoubleSide});
 const dark=new T.MeshLambertMaterial({color:'#4a5159',flatShading:true});
 const beak=new T.MeshLambertMaterial({color:'#dc6133',flatShading:true});
 const eye=new T.MeshBasicMaterial({color:'#21252b'});
 function mesh(parent,geometry,material,x=0,y=0,z=0){
  const obj=new T.Mesh(geometry,material);obj.position.set(x,y,z);
  obj.castShadow=false;obj.receiveShadow=false;parent.add(obj);return obj;
 }
 function wingGeometry(side){
  // Wing points sweep backward; the sharp wing tip and broken silhouette echo the reference.
  const outline=[
   [0,.00,-.02],[.33,.13,-.26],[.90,.20,-.12],
   [1.68,.14,.42],[1.28,.02,.37],[.64,-.035,.26],[.04,-.04,.22]
  ];
  const tris=[[0,1,5],[1,2,5],[2,3,4],[2,4,5],[0,5,6]];
  const arr=[],colors=[];
  for(let t=0;t<tris.length;t++)for(const k of tris[t]){
   const p=outline[k];arr.push(p[0]*side,p[1]+(t%2)*.014,p[2]);
   const v=t%2===0?.91:1.0;colors.push(v,v,v);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(arr,3));
  geo.computeVertexNormals();return geo;
 }
 const gulls=[];
 for(let i=0;i<9;i++){
  const root=new T.Group();root.name='flying-seagull-'+i;flock.add(root);
  const body=mesh(root,new T.IcosahedronGeometry(1,0),white,0,0,0);
  body.scale.set(.22,.17,.53);
  const head=mesh(root,new T.IcosahedronGeometry(1,0),white,0,.085,-.44);
  head.scale.set(.17,.17,.20);
  const cap=mesh(root,new T.IcosahedronGeometry(1,0),wingShade,0,.19,-.46);
  cap.scale.set(.13,.052,.14);
  for(const s of [-1,1]){
   const eyeball=mesh(root,new T.IcosahedronGeometry(1,0),eye,s*.148,.09,-.53);
   eyeball.scale.setScalar(.027);
  }
  const tip=mesh(root,new T.ConeGeometry(.078,.24,4),beak,0,.018,-.70);
  tip.rotation.x=-Math.PI/2;
  // Narrow forked tail, two low-poly feathers.
  for(const s of [-1,1]){
   const tail=mesh(root,new T.ConeGeometry(.10,.38,3),wingShade,s*.11,-.025,.48);
   tail.rotation.x=Math.PI/2;tail.rotation.z=s*.16;
  }
  const wings=[];
  for(const s of [-1,1]){
   const pivot=new T.Group();pivot.position.set(s*.15,.095,-.035);root.add(pivot);
   mesh(pivot,wingGeometry(s),s===1?white:wingShade);
   wings.push({pivot,side:s});
  }
  const offset=i*2*Math.PI/9;
  const radiusX=6.0+(i%4)*1.10,radiusZ=5.5+(i%3)*1.38;
  const speed=.14+(i%4)*.016,scale=.36+(i%3)*.085;
  root.scale.setScalar(scale);
  gulls.push({root,wings,offset,radiusX,radiusZ,speed,scale});
 }
 let time=0;
 function update(dt){
  time+=Math.max(0,Math.min(dt||0,.25));
  for(let i=0;i<gulls.length;i++){
   const g=gulls[i],t=time*g.speed+g.offset;
   const x=WATER_CENTER_X+g.radiusX*Math.cos(t);
   const z=WATER_CENTER_Z+g.radiusZ*Math.sin(t);
   const y=5.0+(i%4)*.62+.20*Math.sin(time*.75+g.offset);
   g.root.position.set(x,y,z);
   const dx=-g.radiusX*Math.sin(t),dz=g.radiusZ*Math.cos(t);
   g.root.rotation.y=Math.atan2(-dx,-dz);
   g.root.rotation.z=.10*Math.sin(time*.37+g.offset);
   for(const w of g.wings){
    w.pivot.rotation.z=w.side*(.17+.33*Math.sin(time*4.0+g.offset+i*.27));
    w.pivot.rotation.x=.065*Math.cos(time*3.1+g.offset);
   }
  }
 }
 update(.016);
 return {flock,update,getState:()=>({
  count:gulls.length,flying:true,flapping:true,
  positions:gulls.map(g=>({x:+g.root.position.x.toFixed(2),
   y:+g.root.position.y.toFixed(2),z:+g.root.position.z.toFixed(2)})),
  wingAngle:+gulls[0].wings[0].pivot.rotation.z.toFixed(4),
  elapsed:+time.toFixed(3)
 })};
}
