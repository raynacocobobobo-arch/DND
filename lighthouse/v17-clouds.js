import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v15-world.js?v=15a';

/** Ten offshore positions, only one to three free-floating Low Poly cumulus.
 * No rectangular cloud border, no fog, and no inner/outer cloud banks.
 * Changes of position happen with soft fade-outs and fade-ins.
 */
export function createOpenSeaClouds(){
 const root=new T.Group();root.name='sparse-open-sea-cumulus';group.add(root);
 const sites=[
  {x:-10.8,z:-9.5},{x:-3.5,z:-10.6},{x:4.0,z:-10.9},{x:10.5,z:-9.0},
  {x:-11.6,z:-2.2},{x:11.4,z:-1.5},{x:-11.7,z:4.2},{x:11.7,z:4.1},
  {x:-8.8,z:11.1},{x:8.7,z:11.3}
 ];
 const safe=sites.every(p=>
  Math.abs(p.x-WATER_CENTER_X)<W*.5-2.0&&
  Math.abs(p.z-WATER_CENTER_Z)<D*.5-2.0&&
  Math.hypot(p.x+.2,p.z-.25)>8.1
 );
 if(!safe)throw new Error('Cloud candidate overlaps island or sea boundary');
 let seed=6152026;
 function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
 const R=(a,b)=>a+(b-a)*rnd();
 const warm=new T.Color('#eff2ee'),night=new T.Color('#566e7e');
 const pale=new T.Color('#f9f9f4'),shade=new T.Color('#d5dfe0');
 const geometry=new T.IcosahedronGeometry(1,1);
 const lobes=[
  {x:0,y:0,z:0,rx:1.14,ry:.78,rz:.79},
  {x:-.85,y:-.19,z:.08,rx:.76,ry:.59,rz:.69},
  {x:.83,y:-.14,z:-.11,rx:.82,ry:.63,rz:.71},
  {x:-.34,y:.36,z:-.17,rx:.68,ry:.70,rz:.65},
  {x:.36,y:.31,z:.10,rx:.67,ry:.69,rz:.68},
  {x:-1.33,y:-.30,z:-.03,rx:.44,ry:.36,rz:.49},
  {x:1.33,y:-.27,z:.03,rx:.43,ry:.38,rz:.52}
 ];
 const slots=Array.from({length:3},(_,i)=>{
  const obj=new T.Group();obj.name='sea-cloud-'+i;root.add(obj);
  const tint=i===1?pale:i===2?shade:warm;
  const material=new T.MeshLambertMaterial({
    color:night.clone(),transparent:true,opacity:0,
    depthWrite:false,flatShading:true
  });
  const variants=lobes.slice(0,6+(i%2));
  for(let j=0;j<variants.length;j++){
   const p=variants[j],mesh=new T.Mesh(geometry,material);
   mesh.name='faceted-cloud-lobe';
   mesh.position.set(p.x+R(-.13,.13),p.y+R(-.07,.06),p.z+R(-.10,.10));
   mesh.rotation.set(R(-.16,.16),R(-.45,.45),R(-.10,.10));
   mesh.scale.set(p.rx*R(.92,1.08),p.ry*R(.90,1.12),p.rz*R(.92,1.08));
   mesh.castShadow=false;mesh.receiveShadow=false;obj.add(mesh);
  }
  // Different silhouettes / scales; substantially smaller than the former border clouds.
  obj.scale.setScalar([.84,1.06,.93][i]);
  obj.visible=false;
  return {obj,material,tint,site:-1,pending:-1,phase:'hidden',
    opacity:0,elapsed:0,phaseOffset:R(0,6.28),baseY:3.18+i*.33};
 });
 let clock=0,mode='night',nextShuffle=R(30,47),changes=0;
 const visited=new Set();
 const smooth=t=>{const x=T.MathUtils.clamp(t,0,1);return x*x*(3-2*x);};
 function move(slot,idx){
  slot.site=idx;slot.pending=-1;
  if(idx<0){slot.obj.visible=false;slot.phase='hidden';slot.opacity=0;slot.material.opacity=0;return;}
  const p=sites[idx];
  slot.obj.position.set(p.x,slot.baseY,p.z);
  slot.obj.rotation.y=R(-.30,.30);
  slot.obj.visible=true;slot.phase='entering';slot.elapsed=0;slot.opacity=0;
  slot.material.opacity=0;visited.add(idx);
 }
 function chooseSites(exclude,count){
  const candidates=sites.map((_,i)=>i).filter(i=>!exclude.includes(i));
  for(let i=candidates.length-1;i>0;i--){
   const j=Math.floor(rnd()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  return candidates.slice(0,count);
 }
 const initialCount=1+Math.floor(rnd()*3);
 chooseSites([],initialCount).forEach((site,i)=>{
  move(slots[i],site);slots[i].phase='steady';slots[i].opacity=1;slots[i].material.opacity=1;
 });
 function rearrange(){
  // Retain one visible cloud while the other slots exit/re-enter:
  // there is never a zero-cloud gap, and never more than three.
  const available=slots.filter(s=>s.phase!=='hidden'&&s.phase!=='exiting');
  const keeper=available[Math.floor(rnd()*available.length)]||slots[0];
  const targetCount=1+Math.floor(rnd()*3);
  const newSites=chooseSites([keeper.site],targetCount-1);
  let cursor=0;
  for(const s of slots){
   if(s===keeper)continue;
   const desired=cursor<newSites.length?newSites[cursor++]:-1;
   if(s.phase==='hidden'){
    if(desired>=0)move(s,desired);
   }else{
    s.pending=desired;s.phase='exiting';s.elapsed=0;
   }
  }
  changes++;
  nextShuffle=clock+R(34,55);
 }
 function update(dt,dayBlend=0){
  const delta=Math.max(0,Math.min(dt||0,.25));
  clock+=delta;
  for(const s of slots){
   s.material.color.copy(night).lerp(s.tint,T.MathUtils.clamp(dayBlend,0,1));
   if(s.phase==='entering'){
    s.elapsed+=delta;s.opacity=smooth(s.elapsed/3.2);
    if(s.elapsed>=3.2){s.phase='steady';s.opacity=1;}
   }else if(s.phase==='exiting'){
    s.elapsed+=delta;s.opacity=1-smooth(s.elapsed/3.0);
    if(s.elapsed>=3.0){move(s,s.pending);}
   }
   s.material.opacity=s.opacity;
   if(s.site>=0&&s.obj.visible){
    const p=sites[s.site],t=clock;
    s.obj.position.set(
      p.x+.13*Math.sin(t*.11+s.phaseOffset),
      s.baseY+.09*Math.sin(t*.25+s.phaseOffset),
      p.z+.10*Math.sin(t*.085+s.phaseOffset*.63)
    );
   }
  }
  if(clock>=nextShuffle)rearrange();
 }
 function setMode(next){mode=next==='day'?'day':'night';}
 function getState(){
  const active=slots.filter(s=>s.site>=0&&s.obj.visible&&s.opacity>.015);
  return {style:'open-sea',siteCount:sites.length,clusterCount:active.length,
   slotCount:slots.length,layerCount:0,fogMeshCount:0,mode,
   totalChanges:changes,visitedSites:[...visited].sort((a,b)=>a-b),
   candidatePositions:sites.map(p=>({...p})),
   activeSites:active.map(s=>s.site),
   clouds:slots.map(s=>({site:s.site,phase:s.phase,
      opacity:+s.opacity.toFixed(3),visible:s.obj.visible,
      position:{x:+s.obj.position.x.toFixed(2),y:+s.obj.position.y.toFixed(2),
       z:+s.obj.position.z.toFixed(2)}}))
  };
 }
 function advanceForTest(seconds){
  const n=Math.ceil(Math.min(Math.max(seconds||0,0),300)/.1);
  for(let i=0;i<n;i++)update(.1,mode==='day'?1:0);
  return getState();
 }
 update(.05,0);
 return {root,update,setMode,getState,advanceForTest};
}
