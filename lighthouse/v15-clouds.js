import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v15-world.js?v=15a';

/** Opaque, faceted 3-D cloud puffs along all FOUR sides of a square ocean.
 * No mist, post-processing vignette, transparent planes, or circular cloud ring.
 * All cloud meshes are instanced to keep the island interactive on low-end GPUs.
 */
export function createSquareCloudBorder(){
 const root=new T.Group();root.name='square-lowpoly-cloud-border';group.add(root);
 let seed=50261102;
 function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
 const R=(a,b)=>a+(b-a)*rnd();
 const halfW=W/2,halfD=D/2,cx=WATER_CENTER_X,cz=WATER_CENTER_Z;
 const palette=[
  ['#eef1ed','#586c7e'],['#f8f8f3','#708397'],['#d9e1e0','#45596c'],
  ['#fbfbf6','#7f91a0'],['#cbd5d7','#40576c']
 ];
 const parts=palette.map(()=>[]);
 const clusters=[];
 const addCluster=(side,u,band)=>{
  // band 0: dense near the water edge; band 1: staggered background cloud bank.
  const t=u*2-1,edge=band===0?.94:1.095;
  let x,z,alongX,alongZ,outX,outZ;
  if(side===0){x=cx+t*halfW;z=cz-edge*halfD;alongX=1;alongZ=0;outX=0;outZ=-1;}
  else if(side===1){x=cx+edge*halfW;z=cz+t*halfD;alongX=0;alongZ=1;outX=1;outZ=0;}
  else if(side===2){x=cx-t*halfW;z=cz+edge*halfD;alongX=-1;alongZ=0;outX=0;outZ=1;}
  else {x=cx-edge*halfW;z=cz-t*halfD;alongX=0;alongZ=-1;outX=-1;outZ=0;}
  const lift=band===0?R(1.10,2.28):R(2.15,3.18);
  const length=band===0?R(2.35,3.80):R(2.55,4.35);
  const puffCount=6+Math.floor(rnd()*4),phase=R(0,Math.PI*2);
  const id=clusters.length;
  clusters.push({x,z,side,band,phase,lift,puffCount});
  // A broad, squat cumulus silhouette made from overlapping irregular polyhedra.
  // Every puff is solid (opaque). Different shapes/colors create readable facets.
  for(let j=0;j<puffCount;j++){
   const span=j/(puffCount-1)*2-1;
   const middle=1-.43*Math.abs(span);
   const wide=length*(.10+.18*middle)*R(.78,1.10);
   const high=R(.39,.87)*middle+R(.18,.33);
   const deep=R(.48,.92);
   const pX=x+alongX*span*length*.38+outX*R(-.44,.35);
   const pZ=z+alongZ*span*length*.38+outZ*R(-.44,.35);
   const y=lift+R(-.27,.20)+(j%3===0?.37:0);
   const matIndex=Math.floor(rnd()*palette.length);
   parts[matIndex].push({id,x:pX,y,z:pZ,sx:wide,sy:high,sz:deep,
     yaw:R(-.60,.60),phase:phase+R(-.35,.35),side,band});
  }
 };
 // Two staggered rows on each straight edge; corners intentionally overlap.
 for(let side=0;side<4;side++){
  const inner=side%2===0?18:16,outer=side%2===0?13:12;
  for(let i=0;i<inner;i++)addCluster(side,(i+.10+R(-.14,.14))/(inner-1),0);
  for(let i=0;i<outer;i++)addCluster(side,(i+.35+R(-.11,.11))/(outer-1),1);
 }
 const geometry=new T.IcosahedronGeometry(1,0);
 const proxy=new T.Object3D();
 const meshes=parts.map((rec,i)=>{
  const material=new T.MeshLambertMaterial({color:palette[i][1],flatShading:true,side:T.FrontSide});
  material.emissive=new T.Color(palette[i][1]);
  material.emissiveIntensity=.16;
  const mesh=new T.InstancedMesh(geometry,material,rec.length);
  mesh.name='lowpoly-cumulus-puffs';
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  mesh.frustumCulled=false;
  mesh.castShadow=false;mesh.receiveShadow=false;root.add(mesh);
  return mesh;
 });
 let clock=0,lastDraw=-1,dayBlend=0,mode='night';
 function update(dt,blend){
  clock+=Math.min(Math.max(dt||0,0),.25);
  dayBlend=T.MathUtils.clamp(blend??dayBlend,0,1);
  for(let i=0;i<meshes.length;i++){
   const color=new T.Color(palette[i][1]).lerp(new T.Color(palette[i][0]),dayBlend);
   meshes[i].material.color.copy(color);
   meshes[i].material.emissive.copy(color);
  }
  if(clock-lastDraw<.07)return;
  lastDraw=clock;
  for(let m=0;m<meshes.length;m++){
   const rec=parts[m],mesh=meshes[m];
   for(let i=0;i<rec.length;i++){
    const p=rec[i],drift=Math.sin(clock*.085+p.phase)*.16;
    const bob=Math.sin(clock*.31+p.phase)*.105;
    const alongX=(p.side===0||p.side===2)?1:0;
    const alongZ=alongX?0:1;
    proxy.position.set(p.x+alongX*drift,p.y+bob,p.z+alongZ*drift);
    proxy.rotation.set(.06*Math.sin(p.phase),p.yaw,0);
    proxy.scale.set(p.sx,p.sy,p.sz);
    proxy.updateMatrix();mesh.setMatrixAt(i,proxy.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 update(.1,0);
 function setMode(next){mode=next==='day'?'day':'night';}
 const puffCount=parts.reduce((n,a)=>n+a.length,0);
 return {root,update,setMode,getState:()=>({
   shape:'square',clusterCount:clusters.length,puffCount,meshCount:meshes.length,
   opaque:true,fogMeshCount:0,edgeInner:.94,edgeOuter:1.095,
   bounds:{width:W,depth:D},mode
 })};
}
