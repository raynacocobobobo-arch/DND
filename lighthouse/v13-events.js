import {createKraken} from './v13-tentacle.js?v=13a';
import {createPirateShip} from './v13-pirate.js?v=13b';

/**
 * Independent night-only encounters:
 * - 1–3 arms chosen from five ocean locations, one of four shapes per arm
 * - one two-masted pirate ship crossing a fixed navigable corridor
 * - ship and arms CAN coexist, but no emergence zone intersects the ship corridor
 */
export function createNightEvents(parent){
 const positions=[
   {x:-8.15,z:3.55},
   {x:-8.20,z:-3.60},
   {x:-3.10,z:-7.20},
   {x:3.50,z:-7.20},
   {x:8.25,z:2.95}
 ];
 const shapeLabels=['swept','arch','hook','s-curve'];
 const shipRoute={z:7.50,xMin:-8.52,xMax:8.45,halfWidth:1.15};
 const maxTentacleDepthReach=1.30;
 // Safety corridor: the ship's hull, sails and wake never enter the emergence buffer.
 const siteClearances=positions.map(p=>Math.abs(shipRoute.z-p.z)-shipRoute.halfWidth-maxTentacleDepthReach);
 const corridorClear=siteClearances.every(d=>d>1.0);
 if(!corridorClear)throw new Error('Pirate sailing channel intersects a Kraken emergence site');
 const arms=positions.map((origin,i)=>{
   const arm=createKraken(parent,{
     origin,externalControl:true,curlDirection:(i%2===0?1:-1),
     heightScale:[.97,1.05,.89,1.10,1.01][i],phaseOffset:i*2.17,variant:i%4
   });
   arm.root.name='kraken-site-'+i;
   return arm;
 });
 const ship=createPirateShip(parent);
 let night=false,phase='day',elapsed=0,wait=5+Math.random()*5;
 let selected=[],completed=0,lastKind='none',lastVariants=[];
 let shipWait=11+Math.random()*13,shipElapsed=0,shipVisits=0;
 const randomWait=()=>5+Math.random()*5;
 const randomShipWait=()=>11+Math.random()*13;
 function publish(){
   document.body.dataset.nightEvent=phase;
   document.body.dataset.krakenCount=String(selected.length);
   document.body.dataset.krakenSites=String(positions.length);
   document.body.dataset.shipVisible=String(ship.getState().visible);
   document.body.dataset.nightEventWait=wait.toFixed(3);
   document.body.dataset.sailingClearance=String(corridorClear);
 }
 function reset(isNight){
   night=!!isNight;phase=night?'waiting':'day';elapsed=0;wait=randomWait();
   selected=[];lastVariants=[];
   arms.forEach(a=>a.setNight(night));
   ship.stop();shipWait=randomShipWait();shipElapsed=0;
   publish();
 }
 function launch(type,count=null,variants=null){
   if(!night)return false;
   if(type==='ship'){
     ship.start();shipElapsed=0;shipWait=randomShipWait();lastKind='ship';
   }else if(type==='tentacles'){
     // Do not interrupt a simultaneous pirate ship.
     const n=count==null?1+Math.floor(Math.random()*3):Math.max(1,Math.min(3,Math.floor(count)));
     const order=[0,1,2,3,4];
     for(let i=order.length-1;i>0;i--){
       const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];
     }
     // Reset all five arms before selecting the next batch, preventing stale visible arms.
     arms.forEach(a=>a.setNight(true));
     // Each tentacle event is freshly chosen from five sites and four visual profiles.
     selected=order.slice(0,n);
     lastVariants=selected.map((index,k)=>{
       const v=Array.isArray(variants)?Math.abs(Math.floor(variants[k]??0))%4:Math.floor(Math.random()*4);
       const arm=arms[index];arm.setNight(true);arm.setVariant(v);arm.forceEvent();
       return v;
     });
     phase='tentacles';elapsed=0;lastKind='tentacles';
   }else return false;
   publish();return true;
 }
 function update(dt){
   if(!night)return;
   const raw=Math.max(0,dt||0),step=Math.min(raw,1.6);
   elapsed+=raw;shipElapsed+=raw;
   // Autonomous Kraken scheduler retains the requested 5-10s idle between events.
   if(phase==='waiting'&&elapsed>=wait)launch('tentacles');
   if(phase==='tentacles'){
     for(const i of selected)arms[i].update(step);
     if(selected.length&&selected.every(i=>arms[i].getState().phase==='waiting')){
       completed++;phase='waiting';selected=[];wait=randomWait();elapsed=0;
     }
   }
   // Separate ship scheduler: a pirate ship may pass WHILE Kraken arms are up.
   if(ship.getState().active){
     ship.update(step);
     if(!ship.getState().active){shipVisits++;shipElapsed=0;shipWait=randomShipWait()}
   }else if(shipElapsed>=shipWait){
     launch('ship');
   }
   publish();
 }
 function getState(){
   return {
     night,phase,elapsed,wait,activeCount:selected.length,
     positions:positions.map(p=>({...p})),selected:[...selected],completed,
     lastKind,lastVariants:[...lastVariants],variants:shapeLabels,
     arms:arms.map((a,i)=>({index:i,...a.getState()})),
     ship:ship.getState(),shipWait,shipElapsed,shipVisits,
     shipRoute:{...shipRoute},siteClearances:[...siteClearances],
     corridorClear,concurrent:selected.length>0&&ship.getState().active
   };
 }
 reset(false);
 return {reset,update,launch,getState,positions,arms,ship};
}
