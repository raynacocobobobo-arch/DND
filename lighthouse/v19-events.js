import {createKraken} from './v14-tentacle.js?v=14a';
import {createPirateShip} from './v19-pirate.js?v=19a';

/** Eight safe sites / up to five random shapes, independent pirate ship channel.
 *  Day switch: no despawning; active arms retract, ship sails out of the scene.
 */
export function createNightEvents(parent){
 const positions=[
  {x:-12.20,z:3.40},{x:-12.40,z:-3.30},
  {x:-9.40,z:-9.30},{x:-3.30,z:-11.30},
  {x:3.40,z:-11.20},{x:9.40,z:-9.00},
  {x:12.40,z:-3.00},{x:12.20,z:3.30}
 ];
 const labels=['swept','arch','hook','s-curve'];
 const shipRoute={z:7.02,xMin:-14.95,xMax:14.85,halfWidth:1.15};
 const maxArmReach=1.35;
 const siteClearances=positions.map(p=>Math.abs(shipRoute.z-p.z)-shipRoute.halfWidth-maxArmReach);
 const corridorClear=siteClearances.every(d=>d>1.0);
 if(!corridorClear)throw new Error('Kraken spawn conflicts with pirate channel');
 const arms=positions.map((origin,i)=>{
  const a=createKraken(parent,{origin,externalControl:true,
   curlDirection:i%2===0?1:-1,
   heightScale:[1.03,.94,1.10,.88,1.04,.92,1.08,.98][i],
   phaseOffset:i*2.15,variant:i%4});
  a.root.name='kraken-site-'+i;return a;
 });
 const ship=createPirateShip(parent);
 let night=false,phase='day',elapsed=0,wait=5+Math.random()*5;
 let selected=[],completed=0,lastKind='none',lastVariants=[];
 let shipWait=10+Math.random()*13,shipElapsed=0,shipVisits=0;
 const randWait=()=>5+Math.random()*5,randShip=()=>10+Math.random()*13;
 function publish(){
  document.body.dataset.nightEvent=phase;
  document.body.dataset.krakenCount=String(selected.length);
  document.body.dataset.krakenSites=String(positions.length);
  document.body.dataset.shipVisible=String(ship.getState().visible);
  document.body.dataset.nightEventWait=wait.toFixed(3);
  document.body.dataset.sailingClearance=String(corridorClear);
 }
 function reset(isNight){
  night=!!isNight;phase=night?'waiting':'day';elapsed=0;wait=randWait();
  selected=[];lastVariants=[];
  arms.forEach(a=>a.setNight(night));
  ship.stop();shipWait=randShip();shipElapsed=0;
  publish();
 }
 function transitionToDay(){
  // Keep visible objects in the scene until their own exit animation completes.
  night=false;elapsed=0;
  for(let i=0;i<arms.length;i++){
   if(selected.includes(i))arms[i].retreatNow();
   else arms[i].setNight(false);
  }
  phase=selected.some(i=>arms[i].getState().visible)?'retracting':'day';
  // Deliberately do NOT call ship.stop(): the ship continues to the edge.
  publish();
 }
 function launch(type,count=null,variants=null){
  if(!night)return false;
  if(type==='ship'){
   ship.start();shipElapsed=0;shipWait=randShip();lastKind='ship';
  }else if(type==='tentacles'){
   const n=count==null?1+Math.floor(Math.random()*5):Math.max(1,Math.min(5,Math.floor(count)));
   const order=positions.map((_,i)=>i);
   for(let i=order.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];
   }
   arms.forEach(a=>a.setNight(true));
   selected=order.slice(0,n);
   lastVariants=selected.map((index,k)=>{
    const v=Array.isArray(variants)?Math.abs(Math.floor(variants[k]??0))%4:Math.floor(Math.random()*4);
    const a=arms[index];a.setVariant(v);a.forceEvent();return v;
   });
   phase='tentacles';elapsed=0;lastKind='tentacles';
  }else return false;
  publish();return true;
 }
 function update(dt){
  const raw=Math.max(0,dt||0),step=Math.min(raw,1.6);
  if(!night){
   if(phase==='retracting'){
    for(const i of selected)arms[i].update(step);
    if(selected.every(i=>!arms[i].getState().visible)){
      selected=[];phase='day';
    }
   }
   if(ship.getState().active)ship.update(step);
   publish();
   return;
  }
  elapsed+=raw;shipElapsed+=raw;
  if(phase==='waiting'&&elapsed>=wait)launch('tentacles');
  if(phase==='tentacles'){
   for(const i of selected)arms[i].update(step);
   if(selected.length&&selected.every(i=>arms[i].getState().phase==='waiting')){
    completed++;phase='waiting';selected=[];elapsed=0;wait=randWait();
   }
  }
  if(ship.getState().active){
   ship.update(step);
   if(!ship.getState().active){shipVisits++;shipElapsed=0;shipWait=randShip();}
  }else if(shipElapsed>=shipWait)launch('ship');
  publish();
 }
 function getState(){
  return {
   night,phase,elapsed,wait,activeCount:selected.length,
   positions:positions.map(p=>({...p})),selected:[...selected],
   completed,lastKind,lastVariants:[...lastVariants],variants:labels,
   arms:arms.map((a,i)=>({index:i,...a.getState()})),
   ship:ship.getState(),shipWait,shipElapsed,shipVisits,
   shipRoute:{...shipRoute},siteClearances:[...siteClearances],corridorClear,
   concurrent:selected.length>0&&ship.getState().active,
   smoothlyExiting:!night&&(phase==='retracting'||ship.getState().active)
  };
 }
 reset(false);
 return {reset,transitionToDay,update,launch,getState,positions,arms,ship};
}
