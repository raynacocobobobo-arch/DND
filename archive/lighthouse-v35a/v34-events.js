import {createKraken} from './v34-tentacle.js?v=34a';
import {createPirateShip} from './v27-pirate.js?v=27a';

/** Eight sites, at most five tentacles by day OR night; pirate only at night.
 * Daytime Kraken waiting interval is 10–15s, nighttime remains 5–10s.
 * Both surfacing and retreat last 6.6s; hovering remains 6–8.4s.
 * Changing time of day never interrupts an active
 * arm. Pirate ships retain their graceful exit when daytime begins.
 */
export function createNightEvents(parent,canSpawn){
 const positions=[
  {x:-12.20,z:3.40},{x:-12.40,z:-3.30},
  {x:-9.40,z:-9.30},{x:-3.30,z:-11.30},
  {x:3.40,z:-11.20},{x:9.40,z:-9.00},
  {x:12.40,z:-3.00},{x:12.20,z:3.30}
 ];
 const labels=['swept','arch','hook','s-curve'];
 const seaNorth=.25-(12.2*2*Math.sqrt(1.4))/2;
 const northCrossX=9.50;
 const shipRoute={
   xEntry:northCrossX,zEntry:seaNorth,
   xExit:-.20+(13.8*2*Math.sqrt(1.4))/2,
   zExit:seaNorth+(-.20+(13.8*2*Math.sqrt(1.4))/2-northCrossX),
   headingDegrees:45,halfWidth:1.15
 };
 const maxArmReach=1.35;
 const p0={x:shipRoute.xEntry,z:shipRoute.zEntry};
 const p1={x:shipRoute.xExit,z:shipRoute.zExit};
 // Perpendicular distance to the finite sea-edge-to-sea-edge line segment.
 function pointToSegment(p){
  const vx=p1.x-p0.x,vz=p1.z-p0.z;
  const t=Math.max(0,Math.min(1,((p.x-p0.x)*vx+(p.z-p0.z)*vz)/(vx*vx+vz*vz)));
  return Math.hypot(p.x-(p0.x+vx*t),p.z-(p0.z+vz*t));
 }
 const siteClearances=positions.map(p=>
   pointToSegment(p)-shipRoute.halfWidth-maxArmReach);
 const corridorClear=siteClearances.every(d=>d>1.0);
 if(!corridorClear)throw new Error('Offshore pirate diagonal conflicts with Kraken sites');
 const arms=positions.map((origin,i)=>{
  const a=createKraken(parent,{origin,externalControl:true,
   curlDirection:i%2===0?1:-1,
   heightScale:[1.03,.94,1.10,.88,1.04,.92,1.08,.98][i],
   phaseOffset:i*2.15,variant:i%4});
  a.root.name='kraken-site-'+i;return a;
 });
 const ship=createPirateShip(parent);
 let night=false,phase='waiting',elapsed=0,wait=10+Math.random()*5;
 let selected=[],completed=0,lastKind='none',lastVariants=[];
 let shipWait=10+Math.random()*13,shipElapsed=0,shipVisits=0;
 const nightWait=()=>5+Math.random()*5;
 const dayWait=()=>10+Math.random()*5;
 const randWait=()=>night?nightWait():dayWait();
 const randShip=()=>10+Math.random()*13;
 function publish(){
  document.body.dataset.nightEvent=phase;
  document.body.dataset.krakenCount=String(selected.length);
  document.body.dataset.krakenSites=String(positions.length);
  document.body.dataset.shipVisible=String(ship.getState().visible);
  document.body.dataset.nightEventWait=wait.toFixed(3);
  document.body.dataset.krakenActiveMode=night?'night':'day';
  document.body.dataset.dayTentacleEnabled='true';
  document.body.dataset.dayTentacleWaitRange='10-15';
  document.body.dataset.krakenRiseSeconds='6.6';
  document.body.dataset.krakenRetreatSeconds='6.6';
  document.body.dataset.sailingClearance=String(corridorClear);
 }
 function reset(isNight){
  // Only used for initial setup. Tentacle geometry is enabled 24h/day;
  // the event scheduler, not the mesh, controls day/night frequency.
  night=!!isNight;phase='waiting';elapsed=0;wait=randWait();
  selected=[];lastVariants=[];completed=0;
  arms.forEach(a=>a.setNight(true));
  ship.stop();shipWait=randShip();shipElapsed=0;
  publish();
 }
 function changeTimeOfDay(nextNight){
  if(night===!!nextNight){publish();return;}
  const wasNight=night,remaining=Math.max(0,wait-elapsed);
  night=!!nextNight;
  // Keep progress in the current waiting interval, adjusting only the
  // unelapsed part so no tentacle is abruptly spawned or removed.
  if(phase==='waiting'){
   // Preserve elapsed progress while moving between different random wait
   // ranges. Ratios use mean waits (day=12.5s, night=7.5s).
   wait=elapsed+remaining*(night?.6:5/3);
  }
  // Existing tentacles keep growing/hovering/retracting across the switch.
  // Existing pirate ship keeps sailing offscreen; daytime launches none.
  if(wasNight&&!night)shipElapsed=0;
  if(!wasNight&&night){shipElapsed=0;shipWait=randShip();}
  publish();
 }
 function transitionToDay(){changeTimeOfDay(false);}
 function transitionToNight(){changeTimeOfDay(true);}
 function launch(type,count=null,variants=null){
  if(type==='ship'&&!night)return false;
  if(type==='tentacles'&&phase==='tentacles')return false;
  if(type==='ship'){
   // Hold the event if the player's boat occupies the shipping corridor.
   if(canSpawn&&!canSpawn('ship',null))return false;
   ship.start();shipElapsed=0;shipWait=randShip();lastKind='ship';
  }else if(type==='tentacles'){
   const n=count==null?1+Math.floor(Math.random()*5):Math.max(1,Math.min(5,Math.floor(count)));
   const order=positions.map((_,i)=>i);
   for(let i=order.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];
   }
   // Free water stays navigable. Only safe sites may emerge; if the boat
   // currently occupies a site it is excluded instead of spawning on it.
   const available=order.filter(i=>!canSpawn||canSpawn('tentacles',positions[i]));
   if(available.length===0)return false;
   selected=available.slice(0,n);
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
  // Kraken events occur during BOTH day and night, and don't reset
  // when the sky mode changes.
  if(phase==='waiting'){
   elapsed+=raw;
   if(elapsed>=wait)launch('tentacles');
  }else if(phase==='tentacles'){
   for(const i of selected)arms[i].update(step);
   if(selected.length&&selected.every(i=>arms[i].getState().phase==='waiting')){
    completed++;phase='waiting';selected=[];elapsed=0;wait=randWait();
   }
  }
  // Pirate ship remains night-only, except an already active ship finishes
  // its visible exit after sunrise.
  if(ship.getState().active){
   ship.update(step);
   if(!ship.getState().active){
    shipVisits++;shipElapsed=0;shipWait=randShip();
   }
  }else if(night){
   shipElapsed+=raw;
   if(shipElapsed>=shipWait)launch('ship');
  }
  publish();
 }
 function getState(){
  return {
   night,phase,elapsed,wait,activeCount:selected.length,
   daytimeEnabled:true,dayWaitRange:[10,15],nightWaitRange:[5,10],
   riseDuration:6.6,retreatDuration:6.6,hoverRange:[6,8.4],
   positions:positions.map(p=>({...p})),selected:[...selected],
   completed,lastKind,lastVariants:[...lastVariants],variants:labels,
   arms:arms.map((a,i)=>({index:i,...a.getState()})),
   ship:ship.getState(),shipWait,shipElapsed,shipVisits,
   shipRoute:{...shipRoute},siteClearances:[...siteClearances],corridorClear,
   concurrent:selected.length>0&&ship.getState().active,
   smoothlyExiting:!night&&ship.getState().active,
   tentaclesContinueAcrossDayNight:true
  };
 }
 reset(false);
 return {reset,transitionToDay,transitionToNight,update,launch,getState,positions,arms,ship};
}
