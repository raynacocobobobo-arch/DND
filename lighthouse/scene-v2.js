
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {W,D,group,setRenderer,buildCutaway,buildIsland,box,material} from './world-v2.js?v=7c';
import {buildCliffs,buildLighthouse,buildCottage,buildTrees,buildPiers,buildShips,buildExtras} from './structures-v2.js?v=7b';

const host=document.getElementById('viewport'),status=document.getElementById('status');
const camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,150);
const initial=new T.Vector3(18.8,14.5,21.2);
const target=new T.Vector3(0,1.05,0);
const scene=new T.Scene();
const sky=document.createElement('canvas');sky.width=1024;sky.height=1024;
const ctx=sky.getContext('2d');
const grad=ctx.createLinearGradient(0,0,0,1024);
grad.addColorStop(0,'#374f65');grad.addColorStop(.42,'#304b60');grad.addColorStop(.77,'#1b3449');grad.addColorStop(1,'#0e2233');
ctx.fillStyle=grad;ctx.fillRect(0,0,1024,1024);
let glow=ctx.createRadialGradient(130,290,10,130,290,510);
glow.addColorStop(0,'rgba(246,175,120,.35)');glow.addColorStop(.38,'rgba(227,177,133,.13)');glow.addColorStop(1,'rgba(240,188,121,0)');
ctx.fillStyle=glow;ctx.fillRect(0,0,1024,1024);
const skyTex=new T.CanvasTexture(sky);skyTex.colorSpace=T.SRGBColorSpace;
scene.background=skyTex;
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
setRenderer(renderer);renderer.setPixelRatio(Math.min(devicePixelRatio,1.85));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
host.appendChild(renderer.domElement);
scene.add(group);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.copy(initial);controls.target.copy(target);
controls.enableDamping=true;controls.dampingFactor=.065;
controls.minDistance=13;controls.maxDistance=52;controls.maxPolarAngle=Math.PI*.86;
controls.screenSpacePanning=true;controls.update();
const hemi=new T.HemisphereLight(0xdceeff,0x4c3d38,2.15);scene.add(hemi);
const key=new T.DirectionalLight(0xffd3a2,3.35);key.position.set(-10,15,11);key.castShadow=true;
key.shadow.mapSize.set(3072,3072);
key.shadow.camera.left=-14;key.shadow.camera.right=14;
key.shadow.camera.top=14;key.shadow.camera.bottom=-14;
key.shadow.camera.near=.3;key.shadow.camera.far=45;
key.shadow.bias=-.0003;key.shadow.normalBias=.028;key.shadow.radius=3;
scene.add(key);
const fill=new T.DirectionalLight(0x91c9ed,1.05);fill.position.set(10,7,-7);scene.add(fill);
const backlight=new T.DirectionalLight(0xf5c59e,.62);backlight.position.set(-4,7,-10);scene.add(backlight);
try{
 buildCutaway();
 buildIsland();
 buildCliffs();
 buildLighthouse();
 buildCottage();
 buildTrees();
 buildPiers();
 buildShips();
 buildExtras();
 // A dark tabletop that receives only the silhouette shadow; no visible horizon.
 const plane=new T.Mesh(new T.PlaneGeometry(160,160),new T.ShadowMaterial({opacity:.26}));
 plane.rotation.x=-Math.PI/2;plane.position.y=-5.93;plane.receiveShadow=true;scene.add(plane);
 let meshCount=0,triCount=0;
 scene.traverse(o=>{if(o.isMesh){meshCount++;const g=o.geometry;if(g?.index)triCount+=g.index.count/3;else if(g?.attributes?.position)triCount+=g.attributes.position.count/3;}});
 console.info('[Lighthouse rebuild] meshes:',meshCount,'triangles:',Math.round(triCount));
 status.hidden=true;
}catch(err){console.error(err);status.hidden=false;status.textContent='场景构建失败：'+(err?.message||String(err));throw err}
document.getElementById('reset')?.addEventListener('click',()=>{
 camera.position.copy(initial);controls.target.copy(target);controls.update();
});
document.getElementById('rotate')?.addEventListener('click',e=>{
 controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.65;
 e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));
});
document.getElementById('shadows')?.addEventListener('click',e=>{
 key.castShadow=!key.castShadow;renderer.shadowMap.needsUpdate=true;
 e.currentTarget.setAttribute('aria-pressed',String(key.castShadow));
});
document.getElementById('capture')?.addEventListener('click',()=>{
 renderer.render(scene,camera);const a=document.createElement('a');
 a.download='Lighthouse_Diorama_V7.png';a.href=renderer.domElement.toDataURL('image/png');a.click();
});
document.getElementById('fullscreen')?.addEventListener('click',()=>{
 if(!document.fullscreenElement)host.requestFullscreen?.();else document.exitFullscreen?.();
});
window.addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
});
let frame=0;renderer.setAnimationLoop(()=>{
 controls.update();renderer.render(scene,camera);
 if(++frame===10)document.body.dataset.rendered='true';
});
