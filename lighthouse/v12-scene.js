import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group,buildCutaway,buildIsland,setRenderer,W,D,WATER_CENTER_X,WATER_CENTER_Z,WATER_AREA_FACTOR} from './v12-world.js?v=12b';
import {buildSite} from './v12-site.js?v=12b';
import {createNightEvents} from './v12-events.js?v=12b';
const host=document.getElementById('viewport'),status=document.getElementById('status');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,160);
const initial=new T.Vector3(29.8,20.7,34.2);
const target=new T.Vector3(WATER_CENTER_X,1.35,WATER_CENTER_Z);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
setRenderer(renderer);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.85));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
host.appendChild(renderer.domElement);scene.add(group);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.copy(initial);controls.target.copy(target);
controls.enableDamping=true;controls.dampingFactor=.057;
controls.minDistance=11;controls.maxDistance=86;controls.maxPolarAngle=Math.PI*.86;
controls.screenSpacePanning=true;controls.update();
const hemi=new T.HemisphereLight(0xd7ebfb,0x50505a,1.8);scene.add(hemi);
const key=new T.DirectionalLight(0xffd7af,3.2);
key.position.set(-8,20,11);key.castShadow=true;key.shadow.mapSize.set(3072,3072);
key.shadow.camera.left=-23;key.shadow.camera.right=23;key.shadow.camera.top=23;key.shadow.camera.bottom=-23;
key.shadow.camera.near=.5;key.shadow.camera.far=48;key.shadow.bias=-.00035;key.shadow.normalBias=.025;key.shadow.radius=3;
scene.add(key);
const fill=new T.DirectionalLight(0x93bce5,1.0);fill.position.set(8,7,-7);scene.add(fill);
const rim=new T.DirectionalLight(0xffbb89,.65);rim.position.set(-7,8,-10);scene.add(rim);
const skyDay=new T.Color('#8bbdd2'),skyNight=new T.Color('#071b2b');
let site,nightEvents,mode='night';
function setMode(next){
 mode=next==='day'?'day':'night';
 const night=mode==='night';
 scene.background=night?skyNight:skyDay;
 hemi.intensity=night?.48:2.15;
 hemi.color.set(night?0x8fb4d2:0xd7eeff);
 hemi.groundColor.set(night?0x243849:0x6a6660);
 key.intensity=night?.12:3.3;
 key.color.set(night?0x8eabc9:0xffd3a7);
 fill.intensity=night?.68:1.00;
 fill.color.set(night?0x477fba:0xa0d6f4);
 rim.intensity=night?.36:.72;
 rim.color.set(night?0x406c99:0xffcd9d);
 renderer.toneMappingExposure=night?1.55:1.20;
 site.lights.beacon.intensity=night?19:0;
 site.lights.beaconGlow.material.opacity=night?.95:.03;
 site.lights.fire.intensity=night?10:0;
 site.lights.house1.intensity=night?5.4:0;
 site.lights.house2.intensity=night?3.6:0;
 site.glowParts.warmWindow.emissiveIntensity=night?1.65:0;
 site.glowParts.lamplit.emissiveIntensity=night?3.5:0;
 site.glowParts.fireMat.emissiveIntensity=night?3.8:0;
 if(site.glowParts.stringBulbs)site.glowParts.stringBulbs.emissiveIntensity=night?2.1:0;
 if(site.lights.festoon)for(const bulb of site.lights.festoon)bulb.intensity=night?1.1:0;
 site.fire.visible=night;
 nightEvents?.reset(night);
 document.body.dataset.mode=mode;
 for(let which of ['day','night']){
  const button=document.getElementById('mode-'+which);
  if(button)button.setAttribute('aria-pressed',String(which===mode));
 }
}
try{
 buildCutaway();
 buildIsland();
 site=buildSite();
 nightEvents=createNightEvents(group);
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
 document.body.dataset.version='v12a';
 document.body.dataset.plantClusters='40';
 document.body.dataset.barrelCount='4';
 document.body.dataset.waterAreaFactor=WATER_AREA_FACTOR.toFixed(5);
 document.body.dataset.waterDimensions=`${W.toFixed(3)} × ${D.toFixed(3)}`;
 document.body.dataset.waterCenter=`${WATER_CENTER_X},${WATER_CENTER_Z}`;
 console.info('V12 interactive island and night encounters meshes:',count,'triangles:',Math.round(triCount));
 setMode('night');
 status.hidden=true;
}catch(err){status.textContent='V12 场景加载失败：'+(err?.message||err);status.hidden=false;console.error(err);throw err}
document.getElementById('mode-day')?.addEventListener('click',()=>setMode('day'));
document.getElementById('mode-night')?.addEventListener('click',()=>setMode('night'));
document.getElementById('reset')?.addEventListener('click',()=>{
 camera.up.set(0,1,0);camera.position.copy(initial);controls.target.copy(target);controls.update();
});
document.getElementById('topview')?.addEventListener('click',()=>{
 camera.up.set(0,0,-1);camera.position.set(WATER_CENTER_X+.001,39,WATER_CENTER_Z+.001);controls.target.set(WATER_CENTER_X,0,WATER_CENTER_Z);controls.update();
});
document.getElementById('rotate')?.addEventListener('click',e=>{
 controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.60;
 e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));
});
document.getElementById('capture')?.addEventListener('click',()=>{
 renderer.render(scene,camera);let a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='Lighthouse_Camp_V12_'+mode+'.png';a.click();
});
document.getElementById('fullscreen')?.addEventListener('click',()=>{
 if(!document.fullscreenElement)host.requestFullscreen?.();else document.exitFullscreen?.();
});
window.addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
// Inspectable event states for reproducible browser QA; no manual action shown on screen.
window.__lighthouseNightEvents={
 getState:()=>nightEvents?.getState(),
 forceEvent:(kind,count)=>nightEvents?.launch(kind,count),
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
 nightEvents?.update(dt);
 controls.update();renderer.render(scene,camera);
 if(++frames===10)document.body.dataset.rendered='true';
});
