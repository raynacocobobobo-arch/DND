import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group,buildCutaway,buildIsland,setRenderer,W,D,WATER_CENTER_X,WATER_CENTER_Z,WATER_AREA_FACTOR} from './v23-world.js?v=23a';
import {buildSite} from './v23-site.js?v=23a';
import {createNightEvents} from './v23-events.js?v=23a';
import {createSteadySeaClouds} from './v23-clouds.js?v=23a';
import {createFlyingGulls} from './v23-gulls.js?v=23a';
import {createDayNightVisitor} from './v24-character.js?v=24b';
const host=document.getElementById('viewport'),status=document.getElementById('status');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,160);
const initial=new T.Vector3(36.2,24.5,41.4);
const target=new T.Vector3(WATER_CENTER_X,1.35,WATER_CENTER_Z);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
setRenderer(renderer);
renderer.localClippingEnabled=true;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.85));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
host.appendChild(renderer.domElement);scene.add(group);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.copy(initial);controls.target.copy(target);
controls.enableDamping=true;controls.dampingFactor=.057;
controls.minDistance=11;controls.maxDistance=105;controls.maxPolarAngle=Math.PI*.86;
controls.screenSpacePanning=true;controls.update();
const hemi=new T.HemisphereLight(0xd7ebfb,0x50505a,1.8);scene.add(hemi);
const key=new T.DirectionalLight(0xffd7af,3.2);
key.position.set(-8,20,11);key.castShadow=true;key.shadow.mapSize.set(3072,3072);
key.shadow.camera.left=-28;key.shadow.camera.right=28;key.shadow.camera.top=28;key.shadow.camera.bottom=-28;
key.shadow.camera.near=.5;key.shadow.camera.far=48;key.shadow.bias=-.00035;key.shadow.normalBias=.025;key.shadow.radius=3;
scene.add(key);
const fill=new T.DirectionalLight(0x93bce5,1.0);fill.position.set(8,7,-7);scene.add(fill);
const rim=new T.DirectionalLight(0xffbb89,.65);rim.position.set(-7,8,-10);scene.add(rim);
const skyDay=new T.Color('#8bbdd2'),skyNight=new T.Color('#071b2b');
let site,nightEvents,cloudBorder,gulls,visitor,seaSurface,mode='night';
const seaNightColor=new T.Color('#1b526a'),seaDayColor=new T.Color('#34859a');
let dayBlend=0,transitionFrom=0,targetDayBlend=0,transitionElapsed=2.8;
let initialLighting=true;const sceneSky=new T.Color();
function applyLighting(blend){
 const b=T.MathUtils.clamp(blend,0,1),lerp=T.MathUtils.lerp;
 sceneSky.copy(skyNight).lerp(skyDay,b);scene.background=sceneSky;
 if(seaSurface)seaSurface.material.color.copy(seaNightColor).lerp(seaDayColor,b);
 hemi.intensity=lerp(.48,2.15,b);
 hemi.color.set(0x8fb4d2).lerp(new T.Color(0xd7eeff),b);
 hemi.groundColor.set(0x243849).lerp(new T.Color(0x6a6660),b);
 key.intensity=lerp(.12,3.3,b);key.color.set(0x8eabc9).lerp(new T.Color(0xffd3a7),b);
 fill.intensity=lerp(.68,1.0,b);fill.color.set(0x477fba).lerp(new T.Color(0xa0d6f4),b);
 rim.intensity=lerp(.36,.72,b);rim.color.set(0x406c99).lerp(new T.Color(0xffcd9d),b);
 renderer.toneMappingExposure=lerp(1.55,1.20,b);
 site.lights.beacon.intensity=19*(1-b);
 site.lights.beaconGlow.material.opacity=.03+.92*(1-b);
 site.lights.fire.intensity=10*(1-b);
 site.lights.house1.intensity=5.4*(1-b);
 site.lights.house2.intensity=3.6*(1-b);
 site.glowParts.warmWindow.emissiveIntensity=1.65*(1-b);
 site.glowParts.lamplit.emissiveIntensity=3.5*(1-b);
 site.glowParts.fireMat.emissiveIntensity=3.8*(1-b);
 if(site.glowParts.stringBulbs)site.glowParts.stringBulbs.emissiveIntensity=2.1*(1-b);
 if(site.lights.festoon)for(const bulb of site.lights.festoon)bulb.intensity=1.1*(1-b);
 site.fire.visible=b<.998;
}
function setMode(next){
 const newMode=next==='day'?'day':'night';
 if(newMode===mode&&!initialLighting)return;
 mode=newMode;transitionFrom=dayBlend;
 targetDayBlend=mode==='day'?1:0;transitionElapsed=0;
 if(initialLighting){dayBlend=targetDayBlend;transitionElapsed=2.8;initialLighting=false;}
 if(mode==='day')nightEvents?.transitionToDay();
 else nightEvents?.reset(true);
 cloudBorder?.setMode(mode);
 applyLighting(dayBlend);
 document.body.dataset.mode=mode;
 for(const which of ['day','night']){
  const b=document.getElementById('mode-'+which);
  if(b)b.setAttribute('aria-pressed',String(which===mode));
 }
}
function updateLighting(dt){
 if(transitionElapsed>=2.8)return;
 transitionElapsed=Math.min(2.8,transitionElapsed+Math.max(0,Math.min(dt,1.6)));
 const t=transitionElapsed/2.8,e=t*t*(3-2*t);
 dayBlend=T.MathUtils.lerp(transitionFrom,targetDayBlend,e);
 applyLighting(dayBlend);
}

try{
 seaSurface=buildCutaway();
 buildIsland();
 site=buildSite();
 nightEvents=createNightEvents(group);
 cloudBorder=createSteadySeaClouds();
 gulls=createFlyingGulls();
 visitor=createDayNightVisitor();
 // Geometry QA checks, independent of screenshot or WebGL availability.
 const audit={tyres:[],steps:[],lamps:[],crates:[]};
 group.traverse(object=>{
   if(object.name==='hanging-tyre')audit.tyres.push(object.position.clone());
   if(object.userData.isLandingStep)audit.steps.push(object.position.clone());
   if(object.userData.isPathLamp)audit.lamps.push(object.position.clone());
   if(object.name==='supply-crate')audit.crates.push(object.userData.footprint);
 });
 const fireCenter={x:1.80,z:1.70};
 const stepClear=audit.steps.every(p=>Math.hypot(p.x-fireCenter.x,p.z-fireCenter.z)>1.0);
 const lampClear=audit.lamps.length===1&&
   audit.steps.every(p=>Math.hypot(p.x-audit.lamps[0].x,p.z-audit.lamps[0].z)>.35);
 const crateClear=audit.crates.every((a,i)=>audit.crates.slice(i+1).every(b=>
   Math.abs(a.x-b.x)>(a.width+b.width)/2+.035||
   Math.abs(a.z-b.z)>(a.width+b.width)/2+.035));
 const geometryOk=audit.tyres.length===6&&audit.steps.length===3&&
   audit.lamps.length===1&&audit.crates.length===3&&stepClear&&lampClear&&crateClear;
 document.body.dataset.geometryAudit=geometryOk?'pass':'fail';
 document.body.dataset.tyreCount=String(audit.tyres.length);
 if(!geometryOk)throw new Error('Geometry audit failed: '+JSON.stringify({
   tyres:audit.tyres.length,steps:audit.steps.length,lamps:audit.lamps.length,
   crates:audit.crates.length,stepClear,lampClear,crateClear
 }));
 let count=0,triCount=0;
 scene.traverse(o=>{if(o.isMesh){count++;triCount+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});
 if(count<210)throw Error('Scene incomplete: '+count+' meshes');
 document.body.dataset.meshCount=String(count);
 document.body.dataset.version='v24a';
 document.body.dataset.visitorHeight=String(visitor.getState().height.toFixed(4));
 document.body.dataset.visitorBelowDoor=String(visitor.getState().belowDoor);
 const sidewallCount=group.children.filter(c=>c.userData.waterSidewall).length;
 document.body.dataset.waterSidewallCount=String(sidewallCount);
 document.body.dataset.waterTopCapRemoved=String(seaSurface.userData.underwaterTopCapRemoved);
 if(sidewallCount!==4||!seaSurface.userData.underwaterTopCapRemoved)throw Error('Sea cap conflict audit failed');
 const flatSea=seaSurface&&seaSurface.userData.vectorFlat&&
  seaSurface.geometry.type==='PlaneGeometry'&&
  seaSurface.geometry.attributes.position.count===4&&
  seaSurface.material.type==='MeshBasicMaterial'&&
  seaSurface.material.opacity===1&&!seaSurface.material.transparent&&
  !seaSurface.material.vertexColors&&seaSurface.material.depthWrite;
 document.body.dataset.vectorSea=String(!!flatSea);
 document.body.dataset.seaTriangles=String(seaSurface?.geometry.index?.count/3||0);
 document.body.dataset.seaHeight=String(seaSurface?.position.y);
 if(!flatSea)throw Error('Flat vector sea audit failed');
 document.body.dataset.fogMeshCount='0';
 document.body.dataset.waterVolumeCount=String(group.children.filter(c=>c.userData.isWaterVolume).length);
 document.body.dataset.shipClippingEnabled=String(renderer.localClippingEnabled);
 document.body.dataset.cloudCount=String(cloudBorder.getState().clusterCount);
 document.body.dataset.cloudSites=String(cloudBorder.getState().siteCount);
 document.body.dataset.cloudOpaque=String(cloudBorder.getState().opaque);
 document.body.dataset.gullCount=String(gulls.getState().count);
 document.body.dataset.gullScaleFactor=String(gulls.getState().gullScaleFactor);
 document.body.dataset.gullMaxVisible=String(gulls.getState().transientCapacity+1);
 document.body.dataset.perimeterShape='square';
 document.body.dataset.cloudStyle='permanent-open-sea';
 document.body.dataset.plantClusters='40';
 document.body.dataset.barrelCount='4';
 document.body.dataset.waterAreaFactor=WATER_AREA_FACTOR.toFixed(5);
 document.body.dataset.waterDimensions=`${W.toFixed(3)} × ${D.toFixed(3)}`;
 document.body.dataset.waterCenter=`${WATER_CENTER_X},${WATER_CENTER_Z}`;
 console.info('V24 daylight visitor transforms into low-poly fishman after dark:',count,'triangles:',Math.round(triCount));
 setMode('night');
 status.hidden=true;
}catch(err){status.textContent='V24 场景加载失败：'+(err?.message||err);status.hidden=false;console.error(err);throw err}
document.getElementById('mode-day')?.addEventListener('click',()=>setMode('day'));
document.getElementById('mode-night')?.addEventListener('click',()=>setMode('night'));
document.getElementById('reset')?.addEventListener('click',()=>{
 camera.up.set(0,1,0);camera.position.copy(initial);controls.target.copy(target);controls.update();
});
document.getElementById('rotate')?.addEventListener('click',e=>{
 controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.60;
 e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));
});
document.getElementById('capture')?.addEventListener('click',()=>{
 renderer.render(scene,camera);let a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='Lighthouse_Camp_V24_'+mode+'.png';a.click();
});
document.getElementById('fullscreen')?.addEventListener('click',()=>{
 if(!document.fullscreenElement)host.requestFullscreen?.();else document.exitFullscreen?.();
});
window.addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
// Inspectable event states for reproducible browser QA; no manual action shown on screen.
let pauseNightEventsForQA=false;
window.__lighthouseSea=seaSurface;
window.__lighthouseNightEvents={
 getState:()=>nightEvents?.getState(),
 getVisitor:()=>visitor?.getState(),
 focusVisitorForTest:()=>{
  const p=visitor.root.position;
  controls.autoRotate=false;
  camera.position.set(p.x+1.50,p.y+1.04,p.z+2.25);
  controls.target.set(p.x,p.y+.36,p.z);
  controls.update();
 },
 resetCameraForTest:()=>{
  camera.up.set(0,1,0);camera.position.copy(initial);
  controls.target.copy(target);controls.update();
 },
 getClouds:()=>cloudBorder?.getState(),
 advanceCloudsForTest:(seconds)=>cloudBorder?.advanceForTest(seconds),
 getGulls:()=>gulls?.getState(),
 advanceGullsForTest:(seconds)=>gulls?.advanceForTest(seconds),
 getLight:()=>({dayBlend,mode}),
 pauseForTest:(v)=>{pauseNightEventsForQA=!!v;return pauseNightEventsForQA;},
 forceEvent:(kind,count,variants)=>nightEvents?.launch(kind,count,variants),
 advanceForTest:(seconds)=>{
  const count=Math.max(0,Math.min(300,Math.ceil(seconds/.1)));
  for(let i=0;i<count;i++)nightEvents?.update(.1);
  return nightEvents?.getState();
 }
};
const animationClock=new T.Clock();
let frames=0;
renderer.setAnimationLoop(()=>{
 const dt=animationClock.getDelta();
 if(!pauseNightEventsForQA)nightEvents?.update(dt);
 updateLighting(dt);
 cloudBorder?.update(dt,dayBlend);
 gulls?.update(dt);
 visitor?.update(dt,dayBlend);
 controls.update();renderer.render(scene,camera);
 if(++frames===10)document.body.dataset.rendered='true';
});
