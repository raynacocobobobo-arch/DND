import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group,buildCutaway,buildIsland,setRenderer,W,D,WATER_CENTER_X,WATER_CENTER_Z,WATER_AREA_FACTOR} from './v27-world.js?v=27a';
import {buildSite} from './v35-site.js?v=35a';
import {createNightEvents} from './v34-events.js?v=34a';
import {createSteadySeaClouds} from './v27-clouds.js?v=27a';
import {createFlyingGulls} from './v27-gulls.js?v=27a';
import {createOffshoreReefs} from './v35-reefs.js?v=35a';
import {createBoatNavigator} from './v35-boat-nav.js?v=35a';
import {normalizeMap,nativePrefabCatalog,
 createTerrainMesh,createPlacementLayer,addOpenOcean,applyNativeEdits,BASE_ASSETS}
 from './shared-map.js?v=44preview';
import {registerCoastalPalms} from '../lighthouse-editor/coastal-tree-prefabs.js?v=1a';
import {registerLegacyHarborPrefabs} from '../lighthouse-editor/legacy-harbor-assets.js?v=1a';
// This is an entirely separate editor-map GAME PREVIEW. The production v35-scene.js
// keeps the unedited, fixed-size original scene. This module alone loads the
// explicitly published editor-preview-map.json file from the gh-pages branch.
const response=await fetch(new URL('./editor-preview-map.json',import.meta.url),{cache:'no-store'});
if(!response.ok)throw Error('Unable to fetch editor preview map: HTTP '+response.status);
const worldMap=normalizeMap(await response.json());
const worldHasEdits=true;

const host=document.getElementById('viewport'),status=document.getElementById('status');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,860);
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
controls.minDistance=3.0;controls.maxDistance=640;controls.maxPolarAngle=Math.PI*.86;
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
let site,nightEvents,cloudBorder,gulls,reefs,boatNav,seaSurface,mode='day';

let dayBlend=0,transitionFrom=0,targetDayBlend=0,transitionElapsed=2.8;
let initialLighting=true;const sceneSky=new T.Color();
function applyLighting(blend){
 const b=T.MathUtils.clamp(blend,0,1),lerp=T.MathUtils.lerp;
 sceneSky.copy(skyNight).lerp(skyDay,b);scene.background=sceneSky;
 seaSurface?.userData.setBlend(b);
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
 else nightEvents?.transitionToNight();
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
 nightEvents=createNightEvents(group,(kind,origin)=>{
  if(!boatNav)return true;
  if(kind==='ship')return boatNav.canSpawnShip();
  if(kind==='tentacles')return boatNav.canSpawnTentacle(origin);
  return true;
 });
 cloudBorder=createSteadySeaClouds();
 gulls=createFlyingGulls();
 reefs=createOffshoreReefs();
 boatNav=createBoatNavigator({boat:site.boat,camera,canvas:renderer.domElement,world:group,reefSites:reefs.getState().sites,eventState:()=>nightEvents.getState(),mapWorld:worldHasEdits?worldMap:null});
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
 document.body.dataset.version='v35a';
 document.body.dataset.mapLinked='true';
 document.body.dataset.worldMapActive=String(worldHasEdits);
 document.body.dataset.worldMapSource='editor-published-preview';
 document.body.dataset.previewScene='true';
 document.body.dataset.clickRipple='true';
 document.body.dataset.dynamicHazards='true';
 document.body.dataset.clickToSail='true';
 document.body.dataset.defaultMode='day';
 document.body.dataset.reefStyle=reefs.getState().style;
 document.body.dataset.reefMeshes=String(reefs.getState().meshCount);
 document.body.dataset.characterCount='0';
 document.body.dataset.reefCount=String(reefs.getState().count);
 document.body.dataset.reefSafe=String(reefs.getState().safe);
 const sidewallCount=group.children.filter(c=>c.userData.waterSidewall).length;
 document.body.dataset.waterSidewallCount=String(sidewallCount);
 document.body.dataset.waterTopCapRemoved=String(seaSurface.userData.underwaterTopCapRemoved);
 if(sidewallCount!==4||!seaSurface.userData.underwaterTopCapRemoved)throw Error('Sea cap conflict audit failed');
 const facetedSea=!!(seaSurface?.userData.vectorFlat&&
  !seaSurface?.userData.faceted&&seaSurface.geometry.type==='BufferGeometry'&&
  seaSurface.geometry.attributes.position.count>=400&&
  seaSurface.geometry.attributes.color.count===seaSurface.geometry.attributes.position.count&&
  seaSurface.material.vertexColors&&seaSurface.material.type==='MeshBasicMaterial'&&
  seaSurface.material.opacity===1&&!seaSurface.material.transparent&&seaSurface.material.depthWrite);
 document.body.dataset.vectorSea=String(facetedSea);
 document.body.dataset.seaStyle='nearshore-deepwater-vector';
 document.body.dataset.waterThickness=String(seaSurface.userData.waterThickness);
 document.body.dataset.seabedThickness=String(seaSurface.userData.seabedThickness);
 document.body.dataset.waterFraction=String(seaSurface.userData.waterFraction);
 document.body.dataset.seaTriangles=String(seaSurface.geometry.attributes.position.count/3);
 document.body.dataset.seaPaletteCount=String(seaSurface.userData.paletteCount);
 document.body.dataset.seaHeight=String(seaSurface.userData.seaLevel);
 if(!facetedSea)throw Error('Two-tone flat sea geometry audit failed');
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
 // Apply the EXACT terrain JSON produced by /lighthouse-editor/.
 // Native prefab meshes were extracted from this running game scene,
 // so the editor and the player render identical model geometry.
 const prefabs=nativePrefabCatalog(group,reefs.root);
 registerLegacyHarborPrefabs(prefabs);
 await registerCoastalPalms(prefabs);
 const nativeEdits=applyNativeEdits(worldMap,group);
 let editorObjects=null,editorTerrain=null,outerWorldSea=null;
 if(worldHasEdits){
  editorTerrain=createTerrainMesh(worldMap);group.add(editorTerrain);
  editorObjects=createPlacementLayer(worldMap,prefabs,group);
  outerWorldSea=addOpenOcean(group,worldMap.width,worldMap.depth);
  for(const c of group.children)
   if(c.userData.waterSidewall||
    ['sea-geological-base','sea-soil-stratum','opaque-sea-cross-section'].includes(c.name))
    c.visible=false;
 }
 document.body.dataset.mapObjects=String(editorObjects?.layer.children.length||0);
 document.body.dataset.nativeAssetCount=String(prefabs.types.length);
 document.body.dataset.worldTerrainCells=String(editorTerrain?.userData.landCells||0);
 console.info('V35 shared editor world:',worldHasEdits,worldMap.objects.length,
  prefabs.types.length,'native asset categories');
 setMode('day');
 status.hidden=true;
}catch(err){status.textContent='V35 场景加载失败：'+(err?.message||err);status.hidden=false;console.error(err);throw err}
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
 renderer.render(scene,camera);let a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='Lighthouse_Camp_V35_'+mode+'.png';a.click();
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
 getReefs:()=>reefs?.getState(),
 getWorldMap:()=>worldMap,
 getMapInfo:()=>({
  active:worldHasEdits,source:'editor-published-preview',
  count:worldMap.objects.length,
  terrainCells:worldMap.heights.filter(y=>y>0).length,
  schema:worldMap.schema,nativeAssets:Object.keys(BASE_ASSETS),
  nativeEdits:applyNativeEdits(worldMap,group)
 }),
 getBoat:()=>{const {position,...state}=boatNav.getState();return state;},
 routeBoatTo:(x,z)=>boatNav.moveTo(x,z),
 testBoatSafe:(x,z)=>boatNav.isSafe(x,z),
 advanceBoatForTest:(seconds)=>{const {position,...state}=boatNav.advanceForTest(seconds);return state;},
 boatWorldAtClient:(x,y)=>boatNav.getWorldPointForClient(x,y),
 showRippleForTest:(x,z)=>boatNav.addRippleForTest(x,z),
 focusReefForTest:(index)=>{
  const p=reefs.getState().sites[index];
  if(!p)return;
  controls.autoRotate=false;
  camera.position.set(p.x+(index===0?-3.65:3.75),p.height*.74+1.65,p.z+4.0);
  controls.target.set(p.x,Math.min(1.65,p.height*.49),p.z);
  controls.update();
 },
 setCutawayViewForTest:()=>{
  controls.autoRotate=false;
  camera.position.set(WATER_CENTER_X,2.1,WATER_CENTER_Z+D*.77);
  controls.target.set(WATER_CENTER_X,-2.0,WATER_CENTER_Z);
  controls.update();
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
 boatNav?.update(dt);
 controls.update();renderer.render(scene,camera);
 if(++frames===10)document.body.dataset.rendered='true';
});
