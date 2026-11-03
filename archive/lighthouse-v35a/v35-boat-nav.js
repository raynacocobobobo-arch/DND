import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z} from './v27-world.js?v=27a';
import {getHeight} from './shared-map.js?v=35a';

/**
 * Click/tap-to-sail for the original service skiff. Two-dimensional A*
 * searches only navigable ocean; visibility pruning straightens routes.
 * The coast, shore stones and reefs remain permanent obstacles.
 * Kraken sites are blocked ONLY while their actual tentacles are visible,
 * and the pirate lane is blocked ONLY while a pirate ship is active.
 * Night event spawn checks defer or relocate hazards that would overlap
 * the boat. Motion replans immediately on new hazards.
 */
export function createBoatNavigator({boat,camera,canvas,world,reefSites,eventState,mapWorld=null}){
 const seaY=.1815,baseY=boat.position.y;
 const start={x:boat.position.x,z:boat.position.z};
 const radius=.97,coastBuffer=.76,edgeBuffer=1.18,reefBuffer=1.30;
 const piratesBuffer=2.75,tentacleBuffer=2.6;
 const gridStep=mapWorld?1.25:.69;
 const boundW=mapWorld?mapWorld.width:W,boundD=mapWorld?mapWorld.depth:D;
 const centerX=mapWorld?0:WATER_CENTER_X,centerZ=mapWorld?0:WATER_CENTER_Z;
 const minX=centerX-boundW/2+edgeBuffer,maxX=centerX+boundW/2-edgeBuffer;
 const minZ=centerZ-boundD/2+edgeBuffer,maxZ=centerZ+boundD/2-edgeBuffer;
 const nx=Math.floor((maxX-minX)/gridStep)+1,nz=Math.floor((maxZ-minZ)/gridStep)+1;
 const shipLane={
  a:{x:9.50,z:WATER_CENTER_Z-D/2},
  b:{x:WATER_CENTER_X+W/2,z:WATER_CENTER_Z-D/2+(WATER_CENTER_X+W/2-9.50)}
 };
 const krakenSites=[
  [-12.2,3.4],[-12.4,-3.3],[-9.4,-9.3],[-3.3,-11.3],
  [3.4,-11.2],[9.4,-9],[12.4,-3],[12.2,3.3]
 ];
 const stones=[];
 world.traverse(o=>{
  if(!o.userData.isShoreObstacle)return;
  const pos=new T.Vector3();o.getWorldPosition(pos);
  stones.push({x:pos.x,z:pos.z,r:(o.userData.collisionFootprint||.4)});
 });
 const obstacles=[
  ...reefSites.map(o=>({x:o.x,z:o.z,r:o.footprint+reefBuffer,type:'reef'})),
  ...stones.map(s=>({...s,r:s.r+radius*.9,type:'shore-rock'})),
  ...(mapWorld?.objects||[]).filter(o=>o.asset!=='pine'&&o.asset!=='barrel'&&o.asset!=='campfire')
    .map(o=>({x:o.x,z:o.z,r:(o.asset==='boathouse'?3:o.asset==='lighthouse'?1.5:o.asset==='service_boat'?1.3:1.7)*o.scale+.7,type:'map-asset'}))
 ];
 const position=()=>({x:boat.position.x,z:boat.position.z});
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function segmentDistance(p,a,b){
  const vx=b.x-a.x,vz=b.z-a.z;
  const denom=vx*vx+vz*vz;
  const t=denom>0?T.MathUtils.clamp(((p.x-a.x)*vx+(p.z-a.z)*vz)/denom,0,1):0;
  return Math.hypot(p.x-a.x-t*vx,p.z-a.z-t*vz);
 }
 function staticSafe(p){
  if(p.x<minX||p.x>maxX||p.z<minZ||p.z>maxZ)return false;
  const sx=(p.x-WATER_CENTER_X)/(5.38+coastBuffer);
  const sz=(p.z-WATER_CENTER_Z)/(4.34+coastBuffer);
  if(sx*sx+sz*sz<1)return false;
  if(mapWorld&&getHeight(mapWorld,p.x,p.z)>0)return false;
  for(const o of obstacles)
   if((p.x-o.x)**2+(p.z-o.z)**2<o.r*o.r)return false;
  return true;
 }
 function pirateActive(event){
  return Boolean(event?.ship?.active);
 }
 function visibleTentacles(event){
  return (event?.arms||[]).filter(arm=>arm.visible&&arm.origin&&
    Number.isFinite(arm.origin.x)&&Number.isFinite(arm.origin.z));
 }
 function dynamicSafe(p){
  const event=eventState?.();
  // A 45-degree shipping route remains completely usable when the ship
  // is absent; temporarily close it while the actual pirate sails through.
  if(pirateActive(event)&&segmentDistance(p,shipLane.a,shipLane.b)<piratesBuffer)
   return false;
  // All 8 Kraken sites are FREE until selected tentacles actually appear.
  // During daytime retraction they stay blocked until fully submerged.
  for(const arm of visibleTentacles(event))
   if(dist(p,arm.origin)<tentacleBuffer+.30)return false;
  return true;
 }
 function canSpawnTentacle(origin){
  if(!origin||!Number.isFinite(origin.x)||!Number.isFinite(origin.z))return false;
  return dist(position(),origin)>tentacleBuffer+.55;
 }
 function canSpawnShip(){
  // A ship cannot materialize along a corridor occupied by a player boat.
  // Night event scheduling retries after the player clears the lane.
  return segmentDistance(position(),shipLane.a,shipLane.b)>piratesBuffer+.45;
 }
 function safe(p){return staticSafe(p)&&dynamicSafe(p);}
 function clearLine(a,b){
  const n=Math.max(1,Math.ceil(dist(a,b)/.29));
  for(let i=0;i<=n;i++){
   const t=i/n;
   if(!safe({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t}))return false;
  }
  return true;
 }
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 const ixz=(x,z)=>z*nx+x;
 const inGrid=(x,z)=>x>=0&&z>=0&&x<nx&&z<nz;
 const node=(i,j)=>({x:minX+i*gridStep,z:minZ+j*gridStep});
 function nearestValidCell(point){
  const ix=Math.round((point.x-minX)/gridStep),
        iz=Math.round((point.z-minZ)/gridStep);
  let best=null;
  for(let r=0;r<7;r++){
   for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
    const i=ix+dx,j=iz+dz;if(!inGrid(i,j))continue;
    const p=node(i,j);
    if(!safe(p)||!clearLine(point,p))continue;
    const d=dist(point,p);
    if(!best||d<best.d)best={i,j,p,d};
   }
   if(best)return best;
  }
  return best;
 }
 let path=[],target=null,moving=false,lastReason='idle',travelled=0,
     lastRequest=null,accepted=0,rejected=0,blockedCount=0;
 function plan(goal){
  const p=position();
  if(!safe(p))return null;
  if(!safe(goal))return null;
  if(clearLine(p,goal))return [goal];
  const src=nearestValidCell(p),dst=nearestValidCell(goal);
  if(!src||!dst)return null;
  const size=nx*nz,g=new Float64Array(size).fill(Infinity),
        f=new Float64Array(size).fill(Infinity),
        previous=new Int32Array(size).fill(-1),
        closed=new Uint8Array(size),open=[];
  const startId=ixz(src.i,src.j),endId=ixz(dst.i,dst.j);
  g[startId]=0;f[startId]=dist(src.p,dst.p);open.push(startId);
  let iterations=0,reached=false;
  while(open.length&&iterations++<size*7){
   let best=0;
   for(let k=1;k<open.length;k++)if(f[open[k]]<f[open[best]])best=k;
   const current=open.splice(best,1)[0];
   if(closed[current])continue;
   if(current===endId){reached=true;break;}
   closed[current]=1;
   const i=current%nx,j=Math.floor(current/nx),from=node(i,j);
   for(const [di,dj] of dirs){
    const ni=i+di,nj=j+dj;
    if(!inGrid(ni,nj))continue;
    const nextId=ixz(ni,nj);
    if(closed[nextId])continue;
    const to=node(ni,nj);
    if(!safe(to)||!clearLine(from,to))continue;
    const tentative=g[current]+dist(from,to);
    if(tentative>=g[nextId])continue;
    previous[nextId]=current;g[nextId]=tentative;
    f[nextId]=tentative+dist(to,dst.p);
    open.push(nextId);
   }
  }
  if(!reached)return null;
  const way=[],rev=[];
  let current=endId;
  while(current!==-1){
   rev.push(node(current%nx,Math.floor(current/nx)));
   if(current===startId)break;
   current=previous[current];
  }
  if(current!==startId)return null;
  rev.reverse();
  const anchors=[p,...rev,goal];
  let index=0;
  while(index<anchors.length-1){
   let furthest=index+1;
   for(let k=anchors.length-1;k>furthest;k--){
    if(clearLine(anchors[index],anchors[k])){furthest=k;break;}
   }
   way.push(anchors[furthest]);index=furthest;
  }
  // The final physical itinerary excludes the current position.
  if(way.length===0)return null;
  return way;
 }
 // This planner deliberately rejects blocked targets instead of moving through
 // obstacles to reach them, or teleporting the original boat.
 function moveTo(x,z){
  const goal={x:Number(x),z:Number(z)};
  if(!Number.isFinite(goal.x)||!Number.isFinite(goal.z))return false;
  lastRequest=goal;
  if(dist(goal,position())<.20){lastReason='already-here';return false;}
  if(!safe(goal)){rejected++;lastReason='blocked-destination';return false;}
  const computed=plan(goal);
  if(!computed?.length){rejected++;lastReason='no-safe-route';return false;}
  path=computed;target=goal;moving=true;accepted++;lastReason='sailing';
  return true;
 }
 function cancel(reason='cancelled'){
  path=[];target=null;moving=false;lastReason=reason;
 }
 // Make all turns continuous. The skiff's longitudinal model axis is +X.
 let elapsed=0;
 function update(rawDt){
  const dt=T.MathUtils.clamp(Number(rawDt)||0,0,.06);
  elapsed+=dt;
  updateRipples(dt);
  if(!moving||!path.length){
   boat.position.y=baseY+.009*Math.sin(elapsed*1.1);
   return;
  }
  let next=path[0],at=position(),d=dist(at,next);
  if(d<.15){
   path.shift();
   if(!path.length){cancel('arrived');return;}
   next=path[0];d=dist(at,next);
  }
  // If event geometry changes, never move the boat into collision.
  const goalDirection=Math.atan2(next.z-at.z,next.x-at.x);
  const yaw=-goalDirection;
  const shortest=Math.atan2(Math.sin(yaw-boat.rotation.y),
    Math.cos(yaw-boat.rotation.y));
  boat.rotation.y+=T.MathUtils.clamp(shortest,-dt*2.0,dt*2.0);
  const speed=.86;
  const travel=Math.min(d,speed*dt*(.55+.45*Math.max(0,Math.cos(shortest))));
  const trial={x:at.x+(next.x-at.x)*travel/d,
    z:at.z+(next.z-at.z)*travel/d};
  if(!safe(trial)||!clearLine(at,trial)){
   blockedCount++;
   if(target){
    const replanned=plan(target);
    if(replanned?.length)path=replanned;
    else cancel('route-blocked');
   }else cancel('route-blocked');
   return;
  }
  boat.position.x=trial.x;boat.position.z=trial.z;
  boat.position.y=baseY+.010*Math.sin(elapsed*3.2);
  travelled+=travel;
 }
 // On touchscreens OrbitControls keeps one-finger dragging for orbit;
 // a short, stationary tap requests navigation instead.
 const raycaster=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-seaY);
 const pointer=new T.Vector2(),hit=new T.Vector3();
 const active=new Map();
 let maxTouches=0,tapCount=0;
 // A subtle, small circular click marker sits above the single opaque sea
 // plane. Thin mint-grey rings spread gently and disappear in 0.95 seconds.
 // Nothing changes the sea mesh, depth buffer, navigation or world lighting.
 const rippleGeometry=new T.RingGeometry(.945,1.055,40);
 const rippleMaterial=new T.MeshBasicMaterial({
  color:'#d3edf0',side:T.DoubleSide,transparent:true,opacity:1,
  depthWrite:false,depthTest:true,toneMapped:false
 });
 const ripples=[];
 let rippleCreated=0,rippleExpired=0;
 function disposeRipple(r){
  for(const ring of r.meshes){
   world.remove(ring);
   ring.material.dispose();
  }
 }
 function spawnRipple(x,z){
  if(ripples.length>=8){
   disposeRipple(ripples.shift());
   rippleExpired++;
  }
  const meshes=[];
  for(let i=0;i<2;i++){
   const ring=new T.Mesh(rippleGeometry,rippleMaterial.clone());
   ring.name='boat-click-water-ripple-'+i;
   ring.rotation.x=-Math.PI/2;
   ring.position.set(x,seaY+.036+i*.003,z);
   ring.scale.setScalar(.135);
   ring.renderOrder=5;
   ring.castShadow=false;ring.receiveShadow=false;
   world.add(ring);meshes.push(ring);
  }
  ripples.push({x,z,age:0,duration:.95,meshes});
  rippleCreated++;
 }
 function updateRipples(dt){
  for(let i=ripples.length-1;i>=0;i--){
   const r=ripples[i];r.age+=dt;
   if(r.age>=r.duration){
    disposeRipple(r);ripples.splice(i,1);rippleExpired++;continue;
   }
   const p=r.age/r.duration;
   for(let j=0;j<r.meshes.length;j++){
    const pulse=Math.max(0,Math.min(1,(p-j*.14)/(.86-j*.14)));
    const mesh=r.meshes[j];
    const scale=.135+.29*pulse;
    mesh.scale.setScalar(scale);
    const fade=Math.pow(1-pulse,1.45);
    mesh.material.opacity=(j===0?.67:.39)*fade;
    mesh.visible=p>=j*.14;
   }
  }
 }
 function worldAtClient(x,y){
  const rect=canvas.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0)return null;
  pointer.set(2*(x-rect.left)/rect.width-1,1-2*(y-rect.top)/rect.height);
  raycaster.setFromCamera(pointer,camera);
  if(!raycaster.ray.intersectPlane(plane,hit))return null;
  return {x:hit.x,z:hit.z};
 }
 canvas.addEventListener('pointerdown',e=>{
  active.set(e.pointerId,{x:e.clientX,y:e.clientY,time:performance.now()});
  maxTouches=Math.max(maxTouches,active.size);
 },{passive:true});
 canvas.addEventListener('pointercancel',e=>{
  active.delete(e.pointerId);if(!active.size)maxTouches=0;
 },{passive:true});
 canvas.addEventListener('pointerup',e=>{
  const started=active.get(e.pointerId);
  active.delete(e.pointerId);
  if(!started){if(!active.size)maxTouches=0;return;}
  const isTap=maxTouches===1&&Math.hypot(e.clientX-started.x,
    e.clientY-started.y)<9&&performance.now()-started.time<650;
  if(isTap){
   const requested=worldAtClient(e.clientX,e.clientY);
   if(requested){
    tapCount++;
    if(moveTo(requested.x,requested.z))spawnRipple(requested.x,requested.z);
   }
  }
  if(!active.size)maxTouches=0;
 },{passive:true});
 // deterministic diagnostics for desktop/touch and safe-route browser tests
 const getState=()=>({
  position, // removed by scene's diagnostic wrapper
  x:+boat.position.x.toFixed(3),z:+boat.position.z.toFixed(3),
  yaw:+boat.rotation.y.toFixed(3),moving,
  waypointCount:path.length,destination:target,
  lastReason,lastRequest,accepted,rejected,tapCount,blockedCount,
  travelled:+travelled.toFixed(3),safe:safe(position()),
  rippleCount:ripples.length,ripplesCreated:rippleCreated,
  ripplesExpired:rippleExpired,
  rippleDuration:.95,rippleMaxRadius:.424,
  ripplePositions:ripples.map(r=>({x:+r.x.toFixed(3),
   z:+r.z.toFixed(3),progress:+(r.age/r.duration).toFixed(3)})),
  shoreStoneCount:stones.length,reefCount:reefSites.length,
  krakenSiteCount:krakenSites.length,
  krakenReserveCount:visibleTentacles(eventState?.()).length,
  pirateLaneReserved:pirateActive(eventState?.()),
  pirateLaneBlocked:pirateActive(eventState?.()),
  tentacleBlockedCount:visibleTentacles(eventState?.()).length,
  canSpawnShip:canSpawnShip(),
  idleHazardsPassable:true,
  planner:'grid-a-star-and-line-of-sight',mapWorldLoaded:!!mapWorld,
  start,grid:{nx,nz,step:gridStep}
 });
 return {moveTo,cancel,update,getState,canSpawnShip,canSpawnTentacle,
  addRippleForTest:(x,z)=>{if(!safe({x,z}))return false;spawnRipple(x,z);return true;},
  isSafe:(x,z)=>safe({x,z}),
  getWorldPointForClient:worldAtClient,
  advanceForTest:(seconds)=>{
   const ticks=Math.ceil(Math.min(60,Math.max(0,seconds))/.05);
   for(let i=0;i<ticks;i++)update(.05);
   return getState();
  }
 };
}
