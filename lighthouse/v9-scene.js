import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group,buildCutaway,buildIsland,setRenderer} from './v9-world.js?v=9b';
import {buildSite} from './v9-site.js?v=9c';
const host=document.getElementById('viewport'),status=document.getElementById('status');
const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,160);
const initial=new T.Vector3(16.6,12.5,19.2);
const target=new T.Vector3(-.30,1.48,-.15);
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
controls.minDistance=11;controls.maxDistance=50;controls.maxPolarAngle=Math.PI*.86;
controls.screenSpacePanning=true;controls.update();
const hemi=new T.HemisphereLight(0xd7ebfb,0x50505a,1.8);scene.add(hemi);
const key=new T.DirectionalLight(0xffd7af,3.2);
key.position.set(-9,16,10);key.castShadow=true;key.shadow.mapSize.set(3072,3072);
key.shadow.camera.left=-14;key.shadow.camera.right=14;key.shadow.camera.top=14;key.shadow.camera.bottom=-14;
key.shadow.camera.near=.5;key.shadow.camera.far=48;key.shadow.bias=-.00035;key.shadow.normalBias=.025;key.shadow.radius=3;
scene.add(key);
const fill=new T.DirectionalLight(0x93bce5,1.0);fill.position.set(8,7,-7);scene.add(fill);
const rim=new T.DirectionalLight(0xffbb89,.65);rim.position.set(-7,8,-10);scene.add(rim);
const skyDay=new T.Color('#8bbdd2'),skyNight=new T.Color('#071b2b');
let site,mode='night';
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
 site.fire.visible=night;
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
 let count=0,triCount=0;
 scene.traverse(o=>{if(o.isMesh){count++;triCount+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3}});
 if(count<210)throw Error('Scene incomplete: '+count+' meshes');
 document.body.dataset.meshCount=String(count);
 document.body.dataset.version='v9';
 console.info('V9 reference-aligned lighthouse outpost meshes:',count,'triangles:',Math.round(triCount));
 setMode('night');
 status.hidden=true;
}catch(err){status.textContent='V8 场景加载失败：'+(err?.message||err);status.hidden=false;console.error(err);throw err}
document.getElementById('mode-day')?.addEventListener('click',()=>setMode('day'));
document.getElementById('mode-night')?.addEventListener('click',()=>setMode('night'));
document.getElementById('reset')?.addEventListener('click',()=>{
 camera.up.set(0,1,0);camera.position.copy(initial);controls.target.copy(target);controls.update();
});
document.getElementById('topview')?.addEventListener('click',()=>{
 camera.up.set(0,0,-1);camera.position.set(.001,27,.001);controls.target.set(0,0,0);controls.update();
});
document.getElementById('rotate')?.addEventListener('click',e=>{
 controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.60;
 e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));
});
document.getElementById('capture')?.addEventListener('click',()=>{
 renderer.render(scene,camera);let a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='Lighthouse_Camp_V8_'+mode+'.png';a.click();
});
document.getElementById('fullscreen')?.addEventListener('click',()=>{
 if(!document.fullscreenElement)host.requestFullscreen?.();else document.exitFullscreen?.();
});
window.addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
let frames=0;
renderer.setAnimationLoop(()=>{
 controls.update();renderer.render(scene,camera);
 if(++frames===10)document.body.dataset.rendered='true';
});
