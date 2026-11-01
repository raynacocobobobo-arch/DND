import {createKraken} from './v12-tentacle.js?v=12a';
import {createPirateShip} from './v12-pirate.js?v=12a';
/** Exclusive night encounters: either 1..3 Kraken arms, OR one passing ship. */
export function createNightEvents(parent){
 const positions=[
   {x:-8.4,z:-3.0}, // western water
   {x:7.35,z:-3.85},// northeastern open sea
   {x:4.9,z:7.25}   // southern ocean, beyond coast
 ];
 const arms=positions.map((origin,i)=>{
   const arm=createKraken(parent,{
     origin,externalControl:true,curlDirection:i===1?-1:1,
     heightScale:[1.03,.92,1.13][i],phaseOffset:i*2.17
   });
   arm.root.name='kraken-arm-'+i;
   return arm;
 });
 const ship=createPirateShip(parent);
 let night=false,phase='day',elapsed=0,wait=5+Math.random()*5;
 let selected=[],lastKind='none',completed=0;
 const randomWait=()=>5+Math.random()*5;
 function reset(isNight){
  night=!!isNight;phase=night?'waiting':'day';elapsed=0;wait=randomWait();selected=[];
  arms.forEach(a=>a.setNight(night));
  ship.stop();
  publish();
 }
 function publish(){
  document.body.dataset.nightEvent=phase;
  document.body.dataset.krakenCount=String(selected.length);
  document.body.dataset.shipVisible=String(ship.getState().visible);
  document.body.dataset.nightEventWait=wait.toFixed(3);
 }
 function launch(type,count=null){
  if(!night)return false;
  arms.forEach(a=>a.setNight(true));
  ship.stop();
  elapsed=0;
  if(type==='ship'){
    phase='ship';selected=[];ship.start();lastKind='ship';
  }else{
    const n=count==null?1+Math.floor(Math.random()*3):Math.max(1,Math.min(3,count));
    const order=[0,1,2];
    for(let i=order.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];
    }
    selected=order.slice(0,n);
    for(const i of selected)arms[i].forceEvent();
    phase='tentacles';lastKind='tentacles';
  }
  publish();return true;
 }
 function update(dt){
  if(!night)return;
  const raw=Math.max(0,dt||0),step=Math.min(raw,1.6);
  elapsed+=raw;
  if(phase==='waiting'&&elapsed>=wait){
    // Ships appear less often; both types are exclusively nighttime.
    launch(Math.random()<.29?'ship':'tentacles');
  }
  if(phase==='tentacles'){
    for(const i of selected)arms[i].update(step);
    if(selected.length>0&&selected.every(i=>arms[i].getState().phase==='waiting')){
      completed++;phase='waiting';selected=[];wait=randomWait();elapsed=0;
    }
  }else if(phase==='ship'){
    ship.update(step);
    if(!ship.getState().active){
      completed++;phase='waiting';wait=randomWait();elapsed=0;
    }
  }
  publish();
 }
 function getState(){
  return {
   night,phase,elapsed,wait,activeCount:selected.length,
   positions:positions.map(p=>({...p})),selected:[...selected],completed,lastKind,
   arms:arms.map((a,i)=>({index:i,...a.getState()})),
   ship:ship.getState(),
   mutualExclusion:!(selected.length>0&&ship.getState().active)
  };
 }
 reset(false);
 return {reset,update,launch,getState,positions,arms,ship};
}
