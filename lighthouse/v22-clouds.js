import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v22-world.js?v=22a';

/** Three permanently visible, fully opaque low-poly clouds over open water.
 * They gently drift left/right over 10 seconds per direction (20s cycle).
 * No randomness, spawn/despawn, material fading or border cloud bank.
 */
export function createSteadySeaClouds(){
 const root=new T.Group();
 root.name='three-solid-sea-clouds';
 group.add(root);
 // Separate, stable open-water locations, leaving the camp and sailing channel legible.
 const positions=[
  {x:-8.8,z:-9.5,y:3.45,scale:.88,amplitude:.40,sign:1},
  {x:10.2,z:-8.8,y:3.72,scale:1.02,amplitude:.34,sign:-1},
  {x:-8.7,z:10.2,y:3.25,scale:.83,amplitude:.46,sign:1}
 ];
 const safe=positions.every(p=>
  Math.abs(p.x-WATER_CENTER_X)+p.amplitude+1.8<W*.5-1.0 &&
  Math.abs(p.z-WATER_CENTER_Z)+1.5<D*.5-1.0 &&
  Math.hypot(p.x-WATER_CENTER_X,p.z-WATER_CENTER_Z)>8.2
 );
 if(!safe)throw new Error('A permanent cloud overlaps the camp or water edge');
 const palette=[
  {day:'#f1f3ef',night:'#6c8191'},
  {day:'#faf9f3',night:'#667b90'},
  {day:'#dee6e6',night:'#596e82'}
 ];
 const lobes=[
  {x:0,y:0,z:0,rx:1.14,ry:.78,rz:.79},
  {x:-.85,y:-.19,z:.08,rx:.76,ry:.59,rz:.69},
  {x:.83,y:-.14,z:-.11,rx:.82,ry:.63,rz:.71},
  {x:-.34,y:.36,z:-.17,rx:.68,ry:.70,rz:.65},
  {x:.36,y:.31,z:.10,rx:.67,ry:.69,rz:.68},
  {x:-1.33,y:-.30,z:-.03,rx:.44,ry:.36,rz:.49},
  {x:1.33,y:-.27,z:.03,rx:.43,ry:.38,rz:.52}
 ];
 const geometry=new T.IcosahedronGeometry(1,1);
 let seed=481522;
 const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 const R=(a,b)=>a+(b-a)*rnd();
 const slots=positions.map((p,i)=>{
  const obj=new T.Group();
  obj.name='solid-sea-cloud-'+i;
  root.add(obj);
  // Opaque materials and depth writes solve the see-through artifact
  // at overhead/oblique camera angles and when individual lobes overlap.
  const material=new T.MeshLambertMaterial({
    color:palette[i].night,flatShading:true,
    transparent:false,opacity:1,depthWrite:true,depthTest:true,
    side:T.FrontSide
  });
  for(const l of lobes.slice(0, i===1?7:6)){
   const mesh=new T.Mesh(geometry,material);
   mesh.name='solid-faceted-cloud-lobe';
   mesh.position.set(l.x+R(-.09,.09),l.y+R(-.06,.06),l.z+R(-.07,.07));
   mesh.rotation.set(R(-.11,.11),R(-.32,.32),R(-.08,.08));
   mesh.scale.set(l.rx*R(.94,1.06),l.ry*R(.95,1.08),l.rz*R(.96,1.08));
   mesh.castShadow=false;
   mesh.receiveShadow=false;
   obj.add(mesh);
  }
  obj.scale.setScalar(p.scale);
  // Each cloud has a unique facing angle and slight banking, not identical silhouettes.
  const angles=[[-.10,-.60,.06],[.075,.54,-.08],[-.045,1.16,.11]];
  obj.rotation.set(...angles[i]);
  obj.visible=true;
  return {obj,material,position:p,night:new T.Color(palette[i].night),
    day:new T.Color(palette[i].day),index:i};
 });
 let elapsed=0,mode='night';
 const movementSeconds=10,cycleSeconds=20;
 function update(dt,dayBlend=0){
  elapsed+=Math.max(0,Math.min(Number(dt)||0,.25));
  const blend=T.MathUtils.clamp(dayBlend,0,1);
  // -cos(pi*t/10) reaches the opposite extremum after 10s,
  // turns smoothly, returning after 20s.
  const progress=Math.PI*elapsed/movementSeconds;
  for(const s of slots){
   const p=s.position;
   const dx=p.amplitude*p.sign*(-Math.cos(progress));
   s.obj.position.set(
    p.x+dx,
    p.y+.035*Math.sin(elapsed*.17+s.index*.7),
    p.z
   );
   s.material.color.copy(s.night).lerp(s.day,blend);
  }
 }
 function setMode(next){mode=next==='day'?'day':'night';}
 function getState(){
  return {
    style:'permanent-open-sea',siteCount:3,clusterCount:slots.length,
    fixedCount:3,activeCount:slots.filter(s=>s.obj.visible).length,
    opaque:slots.every(s=>!s.material.transparent&&s.material.depthWrite&&
      s.material.depthTest&&s.material.opacity===1&&s.obj.visible),
    opacity:1,randomSpawns:false,fadeTransitions:false,
    driftSecondsEachDirection:movementSeconds,cycleSeconds,
    layerCount:0,fogMeshCount:0,mode,elapsed:+elapsed.toFixed(2),
    clouds:slots.map(s=>({index:s.index,visible:s.obj.visible,
      opacity:s.material.opacity,transparent:s.material.transparent,
      x:+s.obj.position.x.toFixed(3),
      y:+s.obj.position.y.toFixed(3),
      z:+s.obj.position.z.toFixed(3),
      originX:s.position.x,amplitude:s.position.amplitude,
      rotationY:+s.obj.rotation.y.toFixed(3)
    }))
  };
 }
 function advanceForTest(seconds){
  const steps=Math.ceil(Math.max(0,Math.min(seconds||0,300))/.1);
  for(let i=0;i<steps;i++)update(.1,mode==='day'?1:0);
  return getState();
 }
 update(.01,0);
 return {root,update,setMode,getState,advanceForTest};
}
