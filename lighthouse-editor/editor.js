import {registerPiratePrefabs} from './pirates-prefabs.js?v=parrot-colors-v2';
import {registerCliffyCoastHouses} from './cliffy-coast-houses.js?v=2';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {registerLegacyHarborPrefabs} from './legacy-harbor-assets.js?v=1a';
import {registerCoastalPalms} from './coastal-tree-prefabs.js?v=1';
import {createExternalGLBLibrary} from './external-glb-library.js?v=1';
import {registerCliffyCoastTrees} from './cliffy-coast-prefabs.js?v=2-batch01';
import {registerCliffyCoastBatch02} from './cliffy-coast-batch02.js?v=1';
import {registerCliffyCoastBatch03} from './cliffy-coast-batch03.js?v=1';
import {registerCliffyCoastBatch04} from './cliffy-coast-batch04.js?v=1';
import {registerCliffyCoastBatch05} from './cliffy-coast-batch05.js?v=1';
import {registerCliffyCoastBatch06_07} from './cliffy-coast-batch06-07.js?v=2-house-pivot';
import {registerCliffyCoastBatch08_10} from './cliffy-coast-batch08-10.js?v=2-house-pivot';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {group as gameGroup,buildCutaway,buildIsland,setRenderer} from '../lighthouse/v27-world.js?v=27a';
import {buildSite} from '../lighthouse/v35-site.js?v=35a';
import {createOffshoreReefs} from '../lighthouse/v35-reefs.js?v=35a';
import {SHARED_MAP_KEY,emptyMap,normalizeMap,readPreviewMap,savePreviewMap,
 nativePrefabCatalog,createTerrainMesh,addOpenOcean,createEditorOceanGeometry,applyNativeEdits,applyModelAppearance,MAX_EDITOR_GRID,
 BASE_ASSETS,nativeGameTargets,MIN_OBJECT_Y,MAX_OBJECT_Y,SEA as GAME_SEA,groundY as gameGroundY} from '../lighthouse/shared-map.js?v=vertex-color-hsb-v3';
const $=id=>document.getElementById(id),view=$('view');
const bootElement=$('startup-status'),bootMessage=$('startup-message');
const loadingText=message=>{if(bootElement&&!bootElement.dataset.error){bootElement.hidden=false;bootMessage.textContent=message;}};
loadingText('正在创建灯塔场景…');
const touchMedia=window.matchMedia('(pointer:coarse)');
let touchInteraction=touchMedia.matches?'orbit':'edit';
let GW=64,GH=56,WIDTH=146,DEPTH=129,CELLX=WIDTH/GW,CELLZ=DEPTH/GH;
const SEA=GAME_SEA,minH=-3,maxH=9,storeKey=SHARED_MAP_KEY;
const BASE_CELL_X=146/64,BASE_CELL_Z=129/56,MIN_WIDTH=34,MIN_DEPTH=30,MAX_SIZE=430;
const colors={water:0x276476,sand:0xc6b78a,grass:0x71866d,rock:0x71858c};
let world,activeTool='select',selected=null,selectedIds=new Set(),hover=null,hist=[],future=[],dirty=false,isTop=false,objects=new Map(),renderObjectMeshes=[];
const empty=()=>({schema:'lighthouse-world-v1',version:1,width:WIDTH,depth:DEPTH,grid:[GW,GH],heights:Array(GW*GH).fill(-2),types:Array(GW*GH).fill('water'),objects:[]});
const idx=(x,z)=>z*GW+x,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const scene=new T.Scene();scene.background=new T.Color('#88b9c9');
const camera=new T.PerspectiveCamera(43,1,.1,1000),renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,touchMedia.matches?1.2:1.6));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
view.insertBefore(renderer.domElement,view.firstChild);renderer.domElement.tabIndex=-1;scene.add(new T.HemisphereLight(0xc6e5ef,0x52626b,2.15));
const sunlight=new T.DirectionalLight(0xffe8bd,2.3);sunlight.position.set(-45,92,65);scene.add(sunlight);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.set(40,38,46);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.075;
controls.mouseButtons={LEFT:null,MIDDLE:T.MOUSE.PAN,RIGHT:T.MOUSE.ROTATE};controls.enablePan=true;
controls.touches={ONE:touchMedia.matches?T.TOUCH.ROTATE:null,TWO:T.TOUCH.DOLLY_PAN};controls.maxDistance=720;controls.minDistance=15;
controls.maxPolarAngle=Math.PI*.48;controls.update();
const transform=new TransformControls(camera,renderer.domElement);
const transformProxy=new T.Object3D();scene.add(transformProxy);scene.add(transform);
transform.setSize(.82);transform.setMode('translate');
let transformMode='translate',syncingProxy=false,transformLast=new T.Vector3(),dragHistoryTaken=false;
setRenderer(renderer);renderer.localClippingEnabled=true;
scene.add(gameGroup);
const originalSea=buildCutaway();buildIsland();buildSite();const originalReefs=createOffshoreReefs();
// Start drawing before awaiting optional GLB downloads, so slow mobile networks do
// not show an empty 3D canvas. The final editor loop replaces this boot renderer.
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
loadingText('场景已创建，正在加载 3D 模型素材…');
originalSea.userData.setBlend(1);
for(const child of gameGroup.children)
 if(child.userData.waterSidewall||['sea-geological-base','sea-soil-stratum','opaque-sea-cross-section'].includes(child.name))
  child.visible=false;
const catalog=nativePrefabCatalog(gameGroup,originalReefs.root);
const legacyHarborAssets=registerLegacyHarborPrefabs(catalog);
const coastalPalmAssets=await registerCoastalPalms(catalog);loadingText('正在读取素材库 · 植被和道具…');
const cliffyCoastTrees=await registerCliffyCoastTrees(catalog);
const cliffyBatch02=await registerCliffyCoastBatch02(catalog);
const cliffyBatch03=await registerCliffyCoastBatch03(catalog);
const cliffyBatch04=await registerCliffyCoastBatch04(catalog);
const cliffyBatch05=await registerCliffyCoastBatch05(catalog);loadingText('正在读取素材库 · 建筑和屋顶…');
const cliffyBatch06_07=await registerCliffyCoastBatch06_07(catalog).catch(err=>{console.error('Cliffy Coast 06-07 bundle not loaded:',err);return {loaded:0};});
const cliffyBatch08_10=await registerCliffyCoastBatch08_10(catalog).catch(err=>{console.error('Cliffy Coast 08-10 bundle not loaded:',err);return {loaded:0};});
const cliffyHouses=registerCliffyCoastHouses(catalog);
console.info('[Lighthouse V5.2.1] complete houses registered:',cliffyHouses.loaded,cliffyHouses.ids);
window.__LIGHTHOUSE_HOUSES_STATUS__={version:'V5.2.1',loaded:cliffyHouses.loaded,ids:cliffyHouses.ids};
loadingText('正在读取素材库 · 海盗模型…');
const piratesAssets=await registerPiratePrefabs(catalog).catch(err=>{console.error('Pirates manifest unavailable:',err);return {loaded:0,total:0,errors:[String(err)]};});
window.__LIGHTHOUSE_PIRATES_STATUS__=piratesAssets;
loadingText('正在恢复浏览器里的 GLB 模型…');
const glbLibrary=await createExternalGLBLibrary(catalog);
if(catalog.types.length<80)throw Error('游戏场景模型扫描不完整: '+catalog.types.length);
gameGroup.visible=true; // original V35 island, lighthouse, trees and props remain the editable scene
const nativeTargets=nativeGameTargets();
const root=new T.Group();scene.add(root);
const openSea=addOpenOcean(root);
scene.fog=new T.Fog(0x88b9c9,88,265);
const edgeFog=new T.Mesh(new T.PlaneGeometry(WIDTH*2.5,DEPTH*2.5),new T.ShaderMaterial({
 uniforms:{fogColor:{value:new T.Color('#88b9c9')},halfSize:{value:new T.Vector2(WIDTH*.5,DEPTH*.5)}},
 vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform vec3 fogColor;uniform vec2 halfSize;varying vec2 p;void main(){float q=max(abs(p.x)/halfSize.x,abs(p.y)/halfSize.y);gl_FragColor=vec4(fogColor,smoothstep(.88,1.03,q));}',
 transparent:true,depthWrite:false,side:T.DoubleSide
}));edgeFog.rotation.x=-Math.PI/2;edgeFog.position.y=SEA+.08;edgeFog.renderOrder=9;root.add(edgeFog);
let terrain=null,assetLayer=new T.Group();root.add(assetLayer);
function syncWorldDimensions(){
 const cols=world.grid[0],rows=world.grid[1];
 if(WIDTH===world.width&&DEPTH===world.depth&&GW===cols&&GH===rows)return;
 GW=cols;GH=rows;WIDTH=world.width;DEPTH=world.depth;
 CELLX=WIDTH/GW;CELLZ=DEPTH/GH;
 openSea.geometry.dispose();
 openSea.geometry=createEditorOceanGeometry(WIDTH,DEPTH);
 edgeFog.geometry.dispose();
 edgeFog.geometry=new T.PlaneGeometry(WIDTH*2.5,DEPTH*2.5);
 edgeFog.material.uniforms.halfSize.value.set(WIDTH/2,DEPTH/2);
 $('size').textContent=WIDTH.toFixed(1)+' × '+DEPTH.toFixed(1);
 $('grid-size').textContent=GW+' × '+GH;
 $('map-width').value=+WIDTH.toFixed(2);
 $('map-depth').value=+DEPTH.toFixed(2);
}
// Preserve unchanged original island and every prefab X/Z position.
// Only the editable terrain grid is resampled; new cells are open sea.
function resizeMapTo(width,depth){
 const newW=Number(width),newD=Number(depth),source=world;
 if(!Number.isFinite(newW)||!Number.isFinite(newD)||
    newW<MIN_WIDTH||newD<MIN_DEPTH||newW>MAX_SIZE||newD>MAX_SIZE){
  toast('宽度需 '+MIN_WIDTH+'–'+MAX_SIZE+'，深度需 '+MIN_DEPTH+'–'+MAX_SIZE);return false;
 }
 if(Math.abs(newW-source.width)<.0001&&Math.abs(newD-source.depth)<.0001){
  toast('地图尺寸没有变化');return true;
 }
 const halfX=newW/2,halfZ=newD/2;
 const out=(x,z)=>Math.abs(x)>halfX||Math.abs(z)>halfZ;
 const excluded=source.objects.filter(o=>out(o.x,o.z));
 const regionsOutside=(source.regions||[]).some(r=>r.points.some(p=>out(p[0],p[1])));
 let landOutside=false;
 const [oldGX,oldGZ]=source.grid,cx=source.width/oldGX,cz=source.depth/oldGZ;
 for(let z=0;z<oldGZ&&!landOutside;z++)for(let x=0;x<oldGX;x++){
  const i=z*oldGX+x;
  if(source.heights[i]>0&&out((x+.5)*cx-source.width/2,(z+.5)*cz-source.depth/2)){
   landOutside=true;break;
  }
 }
 const nativesOutside=Object.entries(source.baseEdits||{}).some(([id,r])=>
  r&&!r.hidden&&out(r.x??BASE_ASSETS[id]?.x??0,r.z??BASE_ASSETS[id]?.z??0));
 if(excluded.length||regionsOutside||landOutside||nativesOutside){
  toast('新边界会裁掉已有地形或元件。请先移回范围内，防止丢失内容。');return false;
 }
 const nextX=Math.max(16,2*Math.round(newW/BASE_CELL_X/2));
 const nextZ=Math.max(16,2*Math.round(newD/BASE_CELL_Z/2));
 if(nextX>MAX_EDITOR_GRID||nextZ>MAX_EDITOR_GRID){
  toast('目标网格超出支持范围，最大为 '+MAX_EDITOR_GRID+' × '+MAX_EDITOR_GRID);return false;
 }
 const result=emptyMap({width:+newW.toFixed(3),depth:+newD.toFixed(3),grid:[nextX,nextZ]});
 result.baseEdits=JSON.parse(JSON.stringify(source.baseEdits||{}));
 result.assetDefaults=JSON.parse(JSON.stringify(source.assetDefaults||{}));
 result.objects=source.objects.map(o=>({...o}));
 result.regions=JSON.parse(JSON.stringify(source.regions||[]));
 for(let z=0;z<nextZ;z++)for(let x=0;x<nextX;x++){
  const wx=(x+.5)*result.width/nextX-result.width/2;
  const wz=(z+.5)*result.depth/nextZ-result.depth/2;
  const ox=Math.floor((wx+source.width/2)/cx),oz=Math.floor((wz+source.depth/2)/cz);
  if(ox>=0&&ox<oldGX&&oz>=0&&oz<oldGZ){
   const i=oz*oldGX+ox,j=z*nextX+x;
   result.heights[j]=source.heights[i];
   result.types[j]=source.types[i];
  }
 }
 history();world=result;selected=null;redraw();saveLocal();
 toast('地图尺寸已更新；新增海域默认为海，原游戏岛屿与物件保持原位');
 return true;
}
function frameWholeMap(){
 const diagonal=Math.hypot(WIDTH,DEPTH),distance=Math.min(680,Math.max(55,diagonal*1.24));
 camera.position.set(distance*.59,distance*.64,distance*.73);
 controls.target.set(0,0,0);controls.update();
}
const cursorMat=new T.MeshBasicMaterial({color:0xe9e5ba,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide});
const cursor=new T.Mesh(new T.RingGeometry(.86,1.0,40),cursorMat);cursor.rotation.x=-Math.PI/2;cursor.visible=false;root.add(cursor);
const nodeMeshes=()=>assetLayer.children.filter(m=>m.userData.recordId);
const selectionBounds=new T.Box3(),selectionHelper=new T.Box3Helper(selectionBounds,0xf2d99b);
selectionHelper.visible=false;scene.add(selectionHelper);
function uid(){return 'obj-'+Math.random().toString(36).slice(2,10);}
function validWorld(w){return normalizeMap(w)}
const snapshot=()=>JSON.stringify(world);
function history(){hist.push(snapshot());if(hist.length>30)hist.shift();future=[];}
function snapGridX(x){return clamp(Math.round((x+WIDTH/2)/CELLX)*CELLX-WIDTH/2,-WIDTH/2,WIDTH/2);}
function snapGridZ(z){return clamp(Math.round((z+DEPTH/2)/CELLZ)*CELLZ-DEPTH/2,-DEPTH/2,DEPTH/2);}
function snappedXZ(x,z){return $('gizmo-snap').checked?[snapGridX(x),snapGridZ(z)]:[x,z];}
function getCellAt(x,z){
 const col=Math.floor((x+WIDTH/2)/CELLX),row=Math.floor((z+DEPTH/2)/CELLZ);
 if(col<0||row<0||col>=GW||row>=GH)return null;
 return {col,row,index:idx(col,row)};
}
function heightAt(x,z){const cell=getCellAt(x,z);return cell?world.heights[cell.index]:-2;}
function terrainY(x,z){return gameGroundY(world,x,z);}
function rebuildTerrain(){
 if(terrain){root.remove(terrain);terrain.geometry.dispose();}
 terrain=createTerrainMesh(world);root.add(terrain);updateObjectsHeight();
}
function objModel(asset){
 if(asset.startsWith('ext_glb_')&&!glbLibrary.has(asset)){
  const missing=new T.Mesh(new T.BoxGeometry(2,2,2),
   new T.MeshBasicMaterial({color:0xff5075,wireframe:true}));
  missing.name='缺失 GLB：'+asset;
  const g=new T.Group();g.add(missing);return g;
 }
 return catalog.create(asset);
}
function updateObjectsHeight(){
 for(const g of assetLayer.children){const rec=objects.get(g.userData.recordId);if(rec)g.position.y=terrainY(rec.x,rec.z)+(rec.y??0);}
}

// Reuse the same material shader pipeline in both editor and game preview.
function refreshSelectedAppearance(){
 if(!selected||selectedIds.size!==1)return;
 const r=currentRecord();if(!r)return;
 const node=selected.startsWith('native:')?nativeTargets[selected.slice(7)]:
  assetLayer.children.find(g=>g.userData.recordId===selected);
 if(node)applyModelAppearance(node,r);
}

function rebuildObjects(){
 assetLayer.clear();objects.clear();selectionHelper.visible=false;
 for(const r of world.objects){
  const g=objModel(r.asset);g.userData.recordId=r.id;g.userData.mapId=r.id;g.name=r.name;
  g.position.set(r.x,terrainY(r.x,r.z)+(r.y??0),r.z);g.rotation.y=r.rotation*Math.PI/180;g.scale.setScalar(r.scale);g.visible=!r.hidden;
  g.traverse(m=>{if(m.isMesh)m.userData.recordId=r.id;});
   applyModelAppearance(g,r);
  assetLayer.add(g);objects.set(r.id,r);
 }
 if(!selected||(!objects.has(selected)&&!selected.startsWith('native:')))selected=null;
 selectedIds=new Set([...selectedIds].filter(id=>id.startsWith('native:')||objects.has(id)));
 if(selected&&!selectedIds.has(selected))selectedIds.add(selected);
 updateInspector();$('object-count').textContent=world.objects.length+' 新增 / '+Object.keys(nativeTargets).length+' 原版';
}
function redraw(){syncWorldDimensions();rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);applyAllNativeAppearance();setDirty(true);}
function applyAllNativeAppearance(){
 for(const [id,node] of Object.entries(nativeTargets))
  applyModelAppearance(node,world.baseEdits?.[id]||{});
}
function setDirty(v){dirty=v;$('dirty').textContent=v?'有未导出修改':'已导出';}
function saveLocal(){try{savePreviewMap(world)}catch(e){console.warn('Local save unavailable',e);}}
function applyHistory(direction){
 const from=direction==='undo'?hist:future,to=direction==='undo'?future:hist;
 if(!from.length)return;
 to.push(snapshot());world=validWorld(JSON.parse(from.pop()));selected=null;selectedIds.clear();redraw();saveLocal();toast(direction==='undo'?'已撤销':'已重做');
}
function toast(m){$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(toast.id);toast.id=setTimeout(()=>$('toast').classList.remove('show'),2200);}
const plane=new T.Plane(new T.Vector3(0,1,0),0),ray=new T.Raycaster(),ndc=new T.Vector2();
function pointAt(evt){
 const rect=renderer.domElement.getBoundingClientRect();
 ndc.set((evt.clientX-rect.left)/rect.width*2-1,-(evt.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(ndc,camera);
 const point=new T.Vector3();if(!ray.ray.intersectPlane(plane,point))return null;
 return point;
}
function findSelected(evt){
 const rect=renderer.domElement.getBoundingClientRect();
 ndc.set((evt.clientX-rect.left)/rect.width*2-1,-(evt.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(ndc,camera);
 for(const hit of ray.intersectObjects([...assetLayer.children,...(gameGroup.visible?Object.values(nativeTargets).filter(o=>o&&o.visible):[])],true)){
  let parent=hit.object;
  while(parent){
   if(parent.userData.mapId){const id=parent.userData.mapId;if(!objects.get(id)?.locked)return id;break;}
   for(const [id,obj] of Object.entries(nativeTargets))if(obj===parent){if(!world.baseEdits?.[id]?.locked)return 'native:'+id;break;}
   parent=parent.parent;
  }
 }
 return null;
}
function recordById(id){
 if(!id)return null;
 if(id.startsWith('native:')){
  const key=id.slice(7),base=BASE_ASSETS[key],r=world.baseEdits?.[key]||{};
  if(!base)return null;
  return {id,asset:key,name:base.name,x:r.x??base.x,y:r.y??0,z:r.z??base.z,
   rotation:r.rotation??0,scale:r.scale??1,brightness:r.brightness??1,saturation:r.saturation??1,hue:r.hue??0,hidden:r.hidden??false,locked:r.locked??false};
 }
 return objects.get(id)||null;
}
function currentRecord(){return recordById(selected);}
function actualRecord(id){
 return id.startsWith('native:')?nativeEdit(id.slice(7)):objects.get(id);
}
function isLocked(id){return !!recordById(id)?.locked;}
function selectItem(id,multi=false){
 if(id&&activeTool!=='select')setTool('select');
 if(!multi)selectedIds.clear();
 if(id){
  const group=!multi?recordById(id)?.group:null;
  if(group)for(const r of world.objects)if(r.group===group)selectedIds.add(r.id);
  if(multi&&selectedIds.has(id))selectedIds.delete(id);
  else selectedIds.add(id);
 }
 selected=id&&selectedIds.has(id)?id:([...selectedIds].at(-1)||null);
 updateInspector();
 
}
function nativeEdit(id){
 world.baseEdits??={};
 return world.baseEdits[id]??={x:BASE_ASSETS[id].x,y:0,z:BASE_ASSETS[id].z,
  rotation:0,scale:1,hidden:false,locked:false};
}
function setTool(t){
 activeTool=t;document.querySelectorAll('[data-tool],[data-asset]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t||b.dataset.asset&&('asset:'+b.dataset.asset)===t));
 const names={select:'选择'};
 $('tool-name').textContent=names[t]||('放置 '+t.replace('asset:',''));
 const selectedAsset=t.startsWith('asset:')?t.slice(6):'';
 $('selected-asset').textContent=selectedAsset?(catalog.all[selectedAsset]?.label||selectedAsset):'无';
 if(t==='select')syncTransform();else transform.detach();
}
function mutateSelected(fn){
 if(!currentRecord()||isLocked(selected)||selectedIds.size>1)return;history();
 if(selected.startsWith('native:')){
  fn(nativeEdit(selected.slice(7)));applyNativeEdits(world,gameGroup);
 }else{fn(objects.get(selected));rebuildObjects();}
 updateInspector();setDirty(true);saveLocal();
}
function updateInspector(){
 const r=currentRecord(),multi=selectedIds.size>1;
 const editable=!!r&&!multi&&!r.locked;
 const editablePrefab=editable&&!selected.startsWith('native:')&&catalog.types.includes(r.asset);
 for(const field of ['rot','rot-deg','scale','scale-pct'])$(field).disabled=!editable;
 $('transform-numeric').style.opacity=editable?'1':'.55';
 $('inspector').hidden=!r;$('none').hidden=!!r;
 if(r){
  const native=selected.startsWith('native:'),locked=!!r.locked;
  $('multi-hint').hidden=!multi;
  $('multi-hint').textContent=multi?'已选 '+selectedIds.size+' 项；可整体移动，旋转或缩放请先单选。':'';
  $('selected-name').value=r.name;$('selected-name').disabled=native||locked||multi;
  $('posx').value=r.x.toFixed(2);$('posy').value=(r.y??0).toFixed(2);$('posz').value=r.z.toFixed(2);
  $('rot').value=r.rotation;$('rot-deg').value=+r.rotation.toFixed(1);$('rot-val').textContent=Math.round(r.rotation)+'°';
  $('scale').value=r.scale;$('scale-pct').value=+(r.scale*100).toFixed(3);$('scale-val').textContent=+(r.scale*100).toFixed(2)+'%';
   for(const key of ['brightness','saturation']){
    $('appearance-'+key).value=Math.round((r[key]??1)*100);
    $('appearance-'+key+'-value').textContent=Math.round((r[key]??1)*100)+'%';
    $('appearance-'+key).disabled=!editable;
   }
   $('appearance-hue').value=r.hue??0;
   $('appearance-hue-value').textContent=Math.round(r.hue??0)+'°';
   $('appearance-hue').disabled=!editable;
   $('overwrite-asset').disabled=!editablePrefab;
   $('restore-asset-defaults').disabled=!editablePrefab||!world.assetDefaults?.[r.asset];
   $('asset-default-status').textContent=editablePrefab&&world.assetDefaults?.[r.asset]?'该素材已有自定义默认值':'当前为单个模型实例修改';
   $('appearance-reset').disabled=!editable;
  for(const field of ['posx','posy','posz'])$(field).disabled=locked||multi;
  $('delete').textContent=multi?'删除 / 隐藏选中 '+selectedIds.size+' 项':native?'隐藏原版模型':'删除';
  $('duplicate').disabled=locked||multi;
  $('restore-native').hidden=!native;
 }
 $('gizmo-rotate').disabled=multi;
 $('gizmo-scale').disabled=multi;
 syncTransform();
}

function syncTransform(){
 if(!world||syncingProxy||transform.dragging)return;
 if(activeTool!=='select'||(touchMedia.matches&&touchInteraction==='orbit')){transform.detach();return;}
 const selectedEntries=[...selectedIds].map(id=>({id,r:recordById(id)}))
  .filter(({r})=>r&&!r.locked&&!r.hidden);
 transform.detach();
 if(!selectedEntries.length)return;
 const mode=selectedEntries.length>1?'translate':transformMode;
 transform.setMode(mode);
 transform.showX=mode!=='rotate';transform.showY=true;transform.showZ=mode!=='rotate';
 transformProxy.position.set(selectedEntries.reduce((n,e)=>n+e.r.x,0)/selectedEntries.length,
  selectedEntries.reduce((n,e)=>n+terrainY(e.r.x,e.r.z)+(e.r.y??0),0)/selectedEntries.length+1.25,
  selectedEntries.reduce((n,e)=>n+e.r.z,0)/selectedEntries.length);
 transformProxy.rotation.set(0,selectedEntries.length===1?selectedEntries[0].r.rotation*Math.PI/180:0,0);
 transformProxy.scale.setScalar(selectedEntries.length===1?selectedEntries[0].r.scale:1);
 transformLast.copy(transformProxy.position);transform.attach(transformProxy);
}
function setTransformMode(mode){
 transformMode=mode;
 for(const [id,m] of [['gizmo-move','translate'],['gizmo-rotate','rotate'],['gizmo-scale','scale']]){
  $(id).classList.toggle('active',mode===m);
  $(id).disabled=selectedIds.size>1&&m!=='translate';
 }
 syncTransform();
}
for(const [id,mode] of [['gizmo-move','translate'],['gizmo-rotate','rotate'],['gizmo-scale','scale']])
 $(id).onclick=()=>setTransformMode(mode);
$('gizmo-snap').onchange=e=>{
 const on=e.target.checked;
 transform.setTranslationSnap(on?.5:null);
 transform.setRotationSnap(on?Math.PI/12:null);
 transform.setScaleSnap(on?.1:null);
};
// Track screen movement before accepting gizmo changes. Small pointer jitter
// must not alter the model, including when the user clicks a gizmo handle.
const gizmoPointer={startX:0,startY:0,x:0,y:0};
let gizmoDragActive=false,gizmoDragStarted=false;
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.button===0){gizmoPointer.startX=e.clientX;gizmoPointer.startY=e.clientY;
  gizmoPointer.x=e.clientX;gizmoPointer.y=e.clientY;}
},true);
renderer.domElement.addEventListener('pointermove',e=>{
 gizmoPointer.x=e.clientX;gizmoPointer.y=e.clientY;
},true);
transform.addEventListener('dragging-changed',e=>{
 controls.enabled=!e.value;
 if(!e.value)syncTransform();
});
transform.addEventListener('mouseDown',()=>{
 gizmoDragActive=true;gizmoDragStarted=false;
});
transform.addEventListener('objectChange',()=>{
 if(gizmoDragActive&&!gizmoDragStarted){
  const travelled=Math.hypot(gizmoPointer.x-gizmoPointer.startX,gizmoPointer.y-gizmoPointer.startY);
  if(travelled<DIRECT_DRAG_THRESHOLD)return;
  gizmoDragStarted=true;history();
 }
 if(syncingProxy||!world)return;
 syncingProxy=true;
 const entries=[...selectedIds].map(id=>({id,r:recordById(id)})).filter(({r})=>r&&!r.hidden&&!r.locked);
 if(entries.length){
  const mode=entries.length>1?'translate':transformMode;
  if(mode==='translate'){
   const dx=transformProxy.position.x-transformLast.x;
   const dy=transformProxy.position.y-transformLast.y;
   const dz=transformProxy.position.z-transformLast.z;
   for(const {id} of entries){
    const r=actualRecord(id);
    r.x=clamp(r.x+dx,-WIDTH/2,WIDTH/2);
    r.y=clamp((r.y??0)+dy,MIN_OBJECT_Y,MAX_OBJECT_Y);
    r.z=clamp(r.z+dz,-DEPTH/2,DEPTH/2);
   }
   transformLast.copy(transformProxy.position);
  }else if(entries.length===1){
   const r=actualRecord(entries[0].id);
   if(mode==='rotate')r.rotation=((T.MathUtils.radToDeg(transformProxy.rotation.y)%360)+360)%360;
   if(mode==='scale'){r.scale=clamp(transformProxy.scale.x,.001,2);transformProxy.scale.setScalar(r.scale);}
  }
  let nativeChanged=false;
  for(const {id} of entries){
   if(id.startsWith('native:')){nativeChanged=true;continue;}
   const r=objects.get(id),mesh=assetLayer.children.find(o=>o.userData.mapId===id);
   if(r&&mesh){mesh.position.set(r.x,terrainY(r.x,r.z)+(r.y??0),r.z);
    mesh.rotation.y=r.rotation*Math.PI/180;mesh.scale.setScalar(r.scale);}
  }
  if(nativeChanged)applyNativeEdits(world,gameGroup);
  const r=currentRecord();if(r){$('posx').value=r.x.toFixed(2);$('posz').value=r.z.toFixed(2);
   $('rot').value=Math.round(r.rotation);$('rot-deg').value=+r.rotation.toFixed(1);$('rot-val').textContent=Math.round(r.rotation)+'°';
   $('scale').value=r.scale;$('scale-pct').value=+(r.scale*100).toFixed(3);$('scale-val').textContent=+(r.scale*100).toFixed(2)+'%';}
  setDirty(true);
 }
 syncingProxy=false;
});
transform.addEventListener('mouseUp',()=>{
 if(gizmoDragStarted)saveLocal();
 gizmoDragActive=false;gizmoDragStarted=false;
 // TransformControls dispatches mouseUp before setting dragging=false.
 // The dragging-changed listener above resets the proxy after release.
});
// Selecting never moves a model. A drag must travel at least 8 screen pixels
// and uses the pointer's original offset relative to the selected model.
const DIRECT_DRAG_THRESHOLD=8;
let directDrag=null;
const mobileTouches=new Set();
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch')return;
 mobileTouches.add(e.pointerId);
 if(mobileTouches.size>1)directDrag=null;
},true);
for(const type of ['pointerup','pointercancel','lostpointercapture']){
 renderer.domElement.addEventListener(type,e=>{if(e.pointerType==='touch')mobileTouches.delete(e.pointerId);},true);
}
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 if(e.pointerType==='touch'&&(touchInteraction==='orbit'||mobileTouches.size>1||!e.isPrimary))return;
 // Clicking the canvas commits the previously focused parameter field.
 if(document.activeElement?.matches?.('input, textarea, select'))document.activeElement.blur();
 renderer.domElement.focus({preventScroll:true});
 const p=pointAt(e);if(!p)return;
 if(activeTool==='select'){
  if(transform.dragging||transform.axis)return;
  const hit=findSelected(e),multi=e.shiftKey;
  selectItem(hit,multi);
  if(hit&&!multi&&selectedIds.size===1&&!isLocked(hit)&&!recordById(hit)?.hidden){
   const r=recordById(hit);
   directDrag={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,
    anchorX:p.x,anchorZ:p.z,originX:r.x,originZ:r.z,started:false};
   renderer.domElement.setPointerCapture(e.pointerId);
  }else directDrag=null;
  return;
 }
 if(activeTool.startsWith('asset:')){
  const asset=activeTool.slice(6);
  history();const [px,pz]=snappedXZ(p.x,p.z);
  const o={id:uid(),asset,name:catalog.all[asset]?.label||asset,x:clamp(px,-WIDTH/2,WIDTH/2),
   z:clamp(pz,-DEPTH/2,DEPTH/2),y:0,rotation:0,...initialAppearanceFor(asset)};
  world.objects.push(o);selected=o.id;selectedIds=new Set([o.id]);rebuildObjects();setTool('select');setDirty(true);saveLocal();toast('已放置 '+asset);
   
   return;
 }
 
},{passive:true});
renderer.domElement.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch'&&(touchInteraction==='orbit'||mobileTouches.size>1))return;
 const p=pointAt(e);if(!p)return;
 $('cursor').textContent=p.x.toFixed(1)+' / '+p.z.toFixed(1);
 cursor.visible=true;cursor.position.set(p.x,terrainY(p.x,p.z)+.11,p.z);cursor.scale.setScalar(Math.max(.6,CELLX*.7));
 if(directDrag&&directDrag.pointerId===e.pointerId&&currentRecord()&&!isLocked(selected)){
   const drag=directDrag;
   if(!drag.started){
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<DIRECT_DRAG_THRESHOLD)return;
    drag.started=true;history();
   }
   const native=selected.startsWith('native:');
   const o=native?nativeEdit(selected.slice(7)):objects.get(selected);
   // Apply mouse movement delta, not the mouse's absolute ground coordinates.
   const nx=clamp(drag.originX+(p.x-drag.anchorX),-WIDTH/2,WIDTH/2);
   const nz=clamp(drag.originZ+(p.z-drag.anchorZ),-DEPTH/2,DEPTH/2);
   [o.x,o.z]=snappedXZ(nx,nz);
   if(native)applyNativeEdits(world,gameGroup);
   else{
    const g=assetLayer.children.find(x=>x.userData.mapId===selected);
    if(g)g.position.set(o.x,terrainY(o.x,o.z)+(o.y??0),o.z);
   }
   $('posx').value=o.x.toFixed(2);$('posz').value=o.z.toFixed(2);setDirty(true);
 }
},{passive:true});
function finish(e){
 if(e.pointerType==='touch'&&touchInteraction==='orbit'){directDrag=null;return;}
 if(directDrag&&directDrag.pointerId===e.pointerId){
  if(directDrag.started)saveLocal();
  directDrag=null;syncTransform();
 }
 try{renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
}
renderer.domElement.addEventListener('pointerup',finish);
renderer.domElement.addEventListener('pointercancel',finish);
view.addEventListener('pointerleave',()=>cursor.visible=false);
$('apply-map-size').onclick=()=>resizeMapTo($('map-width').value,$('map-depth').value);
for(const id of ['map-width','map-depth'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){$('apply-map-size').click();e.preventDefault();}});
$('frame-world').onclick=frameWholeMap;
$('toggle-original').onclick=()=>{
 gameGroup.visible=!gameGroup.visible;
 $('toggle-original').textContent=gameGroup.visible?'隐藏原版岛屿':'显示原版岛屿';
 $('toggle-original').setAttribute('aria-pressed',String(gameGroup.visible));
 selected=null;selectedIds.clear();updateInspector();toast(gameGroup.visible?'已显示完整 V35 原版岛屿':'仅暂时隐藏原版岛屿，未删除模型');
};
// Human-readable asset families; meshes under 'parts' retain authored type names.
function assetCategory(id,meta={}){
 if(id.startsWith('ext_glb_'))return meta.category||'外部模型 GLB';
 if(id.startsWith('cliffy_coast_'))return meta.category||'Cliffy Coast 素材';
 if(meta.kind==='detail'){
  const cat=meta.category||'其他';
  if(cat.includes('lighthouse')||cat.includes('灯塔'))return '细节构件 / 灯塔';
  if(cat.includes('boathouse')||cat.includes('木屋'))return '细节构件 / 木屋与平台';
  if(cat.includes('pine')||cat.includes('松'))return '细节构件 / 树木';
  if(cat.includes('shore')||cat.includes('石')||cat.includes('reef'))return '细节构件 / 礁石';
  return '细节构件 / '+cat;
 }
 if(id.startsWith('kraken_'))return '海怪与事件';
 if(id==='pirate_ship'||id==='service_boat'||id==='legacy_shipwreck')return '船只';
 if(id==='legacy_pier_west'||id==='legacy_pier_east')return '码头与栈道';
 if(id.includes('reef')||id.includes('rock'))return '礁石与海岸';
 if(id.includes('pine')||id.includes('tree')||id.includes('flora'))return '树木与植被';
 if(id==='lighthouse'||id==='boathouse')return '灯塔与建筑';
 if(id.includes('barrel')||id==='campfire')return '营地与道具';
 return '其他完整模型';
}
// Genuine scene-model snapshots: a tiny isolated 3D studio and camera,
// rendered lazily only for cards inside / near the visible sidebar viewport.
const previewCache=new Map(),pendingPreviews=[];
let previewObserver=null,previewScheduled=false,previewRenderer=null;
const previewScene=new T.Scene();
previewScene.background=new T.Color('#1e3742');
previewScene.add(new T.HemisphereLight(0xe9f6f5,0x425766,2.25));
const previewKey=new T.DirectionalLight(0xffeac6,2.1);
previewKey.position.set(-6,12,9);previewScene.add(previewKey);
const previewCamera=new T.PerspectiveCamera(38,4/3,.01,2000);
function renderPrefabPreview(id){
 if(previewCache.has(id))return previewCache.get(id);
 if(!previewRenderer){
  previewRenderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,
   alpha:false,powerPreference:'low-power'});
  previewRenderer.setPixelRatio(1);
  previewRenderer.setSize(160,120,false);
  previewRenderer.outputColorSpace=T.SRGBColorSpace;
  previewRenderer.toneMapping=T.ACESFilmicToneMapping;
  previewRenderer.toneMappingExposure=1.12;
 }
 const model=catalog.create(id);
 const preset=world?.assetDefaults?.[id];
 if(preset){model.scale.setScalar(clamp(preset.scale,.001,2));applyModelAppearance(model,preset);}
 const box=new T.Box3().setFromObject(model);
 if(box.isEmpty())return null;
 const sphere=box.getBoundingSphere(new T.Sphere());
 const radius=Math.max(.18,sphere.radius),fov=previewCamera.fov*Math.PI/180;
 const distance=Math.min(1400,Math.max(2,radius/Math.sin(fov/2)*1.35));
 const facing=new T.Vector3(1.30,.86,1.48).normalize();
 previewCamera.position.copy(sphere.center).addScaledVector(facing,distance);
 previewCamera.near=Math.max(.01,distance-radius*2.5);
 previewCamera.far=distance+radius*4+10;
 previewCamera.lookAt(sphere.center);
 previewCamera.updateProjectionMatrix();
 previewScene.add(model);
 previewRenderer.render(previewScene,previewCamera);
 const result=previewRenderer.domElement.toDataURL('image/webp',.82);
 previewScene.remove(model);
 previewCache.set(id,result);
 return result;
}
function schedulePreview(){
 if(previewScheduled||!pendingPreviews.length)return;
 previewScheduled=true;
 requestAnimationFrame(()=>{
  previewScheduled=false;
  const img=pendingPreviews.shift();
  if(img?.isConnected&&!img.src){
   try{const image=renderPrefabPreview(img.dataset.asset);if(image)img.src=image;}
   catch(err){img.alt='无法预览 '+img.dataset.asset;console.warn('Prefab preview:',img.dataset.asset,err);}
  }
  if(pendingPreviews.length)schedulePreview();
 });
}
function renderAssetLibrary(){
 const query=$('asset-search').value.trim().toLowerCase();
 const mode=$('asset-filter').value;
 const found=catalog.types.filter(id=>{
  const meta=catalog.all[id]||{},category=assetCategory(id,meta);
  const filter=mode==='complete'?meta.kind!=='detail':
   mode==='parts'?meta.kind==='detail':
   !mode||meta.category===mode||category===mode;
  return filter&&(!query||(meta.label||id).toLowerCase().includes(query)||
   category.toLowerCase().includes(query)||id.includes(query));
 });
 if(previewObserver)previewObserver.disconnect();
 pendingPreviews.length=0;
 previewObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   previewObserver.unobserve(entry.target);
   const cached=previewCache.get(entry.target.dataset.asset);
   if(cached)entry.target.src=cached;
   else pendingPreviews.push(entry.target);
  }
  schedulePreview();
 },{root:$('left'),rootMargin:'180px'});
 const buckets=new Map();
 for(const id of found){
  const category=assetCategory(id,catalog.all[id]);
  if(!buckets.has(category))buckets.set(category,[]);
  buckets.get(category).push(id);
 }
 const box=$('assets');box.replaceChildren();
 const order=['Cliffy Coast 完整房屋','外部地形 GLB','外部模型 GLB','Cliffy Coast 植物','Cliffy Coast 工具','Cliffy Coast 家具','Cliffy Coast 物品','Cliffy Coast 武器','Cliffy Coast 装饰','Cliffy Coast 灯具','Cliffy Coast 摊位','Cliffy Coast 推车','Cliffy Coast 岩块','Cliffy Coast 道路杂件','Cliffy Coast 营火','Cliffy Coast 桥梁','Cliffy Coast 道路','Cliffy Coast 围墙','Cliffy Coast 建筑','Cliffy Coast 房屋','Cliffy Coast 房屋构件','Cliffy Coast 房屋屋顶','Cliffy Coast 墓园','灯塔与建筑','树木与植被','礁石与海岸','船只','码头与栈道','营地与道具','海怪与事件'];
 const sorted=[...buckets.keys()].sort((a,b)=>{
  const ia=order.indexOf(a),ib=order.indexOf(b);
  return (ia<0?100:ia)-(ib<0?100:ib)||a.localeCompare(b,'zh-CN');
 });
 for(const cat of sorted){
  const ids=buckets.get(cat),section=document.createElement('section');
  section.className='asset-category';
  const title=document.createElement('h3');title.textContent=cat;
  const count=document.createElement('span');count.textContent=ids.length+' 项';
  title.append(count);section.append(title);
  const grid=document.createElement('div');grid.className='asset-grid';
  for(const id of ids){
   const meta=catalog.all[id],btn=document.createElement('button');
   btn.type='button';btn.className='asset-card';btn.dataset.asset=id;
   btn.title=meta.label+' · '+id;
   const img=document.createElement('img');img.className='asset-preview';
   img.alt=meta.label+' 原版模型缩略图';img.dataset.asset=id;
   img.loading='lazy';img.width=160;img.height=120;
   const label=document.createElement('span');label.className='asset-label';
   label.textContent=meta.label;
   btn.append(img,label);
    if(world?.assetDefaults?.[id]){const badge=document.createElement('span');badge.className='asset-overridden';badge.textContent='已覆盖';btn.append(badge);}
   btn.onclick=()=>{setTool('asset:'+id);if(touchMedia.matches)setTouchInteraction('edit');document.querySelectorAll('.asset-card')
     .forEach(item=>item.classList.toggle('active',item===btn));};
   grid.append(btn);
   const cached=previewCache.get(id);
   if(cached)img.src=cached;else previewObserver.observe(img);
  }
  section.append(grid);box.append(section);
 }
 $('asset-result').textContent=found.length+' 个可复用模型 / '+buckets.size+
  ' 个大类 / 原版素材共 '+catalog.types.length+' 项';
}
const categories=[...new Set(catalog.types.map(id=>catalog.all[id]?.category||'整组模型'))];
for(const c of categories){
 const option=document.createElement('option');option.value=c;option.textContent=c;
 $('asset-filter').append(option);
}
$('asset-search').addEventListener('input',renderAssetLibrary);
$('asset-filter').addEventListener('change',renderAssetLibrary);
renderAssetLibrary();
const houseFilter=document.getElementById('asset-filter');
if(cliffyHouses.loaded){houseFilter.value='Cliffy Coast 完整房屋';renderAssetLibrary();}
$('undo').onclick=()=>applyHistory('undo');$('redo').onclick=()=>applyHistory('redo');
$('duplicate').onclick=()=>{
 if(!selected||selectedIds.size!==1||isLocked(selected))return;
 const r=currentRecord();if(!r)return;
 if(!catalog.types.includes(r.asset)){toast('此原版对象不能直接复制，请从模型库放置');return;}
 history();
 const o={id:uid(),asset:r.asset,name:r.name+' 复制',x:clamp(r.x+3,-WIDTH/2,WIDTH/2),
  z:clamp(r.z+3,-DEPTH/2,DEPTH/2),rotation:r.rotation,scale:r.scale,brightness:r.brightness??1,saturation:r.saturation??1,hue:r.hue??0,hidden:false,locked:false};
 world.objects.push(o);selected=o.id;selectedIds=new Set([o.id]);rebuildObjects();setDirty(true);saveLocal();
};
$('delete').onclick=()=>{
 const ids=[...selectedIds].filter(id=>!isLocked(id));
 if(!ids.length){toast('没有可删除对象；锁定对象请先解锁');return;}
 history();const removed=new Set(ids.filter(id=>!id.startsWith('native:')));
 for(const id of ids)if(id.startsWith('native:'))nativeEdit(id.slice(7)).hidden=true;
 world.objects=world.objects.filter(o=>!removed.has(o.id));
 selected=null;selectedIds.clear();rebuildObjects();applyNativeEdits(world,gameGroup);
 updateInspector();setDirty(true);saveLocal();
};
$('restore-native').onclick=()=>{
 if(!selected?.startsWith('native:'))return;history();
 delete world.baseEdits[selected.slice(7)];applyNativeEdits(world,gameGroup);
 updateInspector();setDirty(true);saveLocal();
};
// Equality checks also prevent Enter + blur from adding duplicate undo states.
function setSelectedNumber(key,value){
 const rec=currentRecord();
 if(!rec||selectedIds.size!==1||isLocked(selected)||!Number.isFinite(value))return;
 if(Math.abs((Number(rec[key])||0)-value)<1e-7){updateInspector();return;}
 mutateSelected(obj=>{obj[key]=value;});
}
function setSelectedName(value){
 const rec=currentRecord();
 if(!rec||selectedIds.size!==1||selected.startsWith('native:')||isLocked(selected))return;
 const next=String(value).slice(0,90);
 if(next!==rec.name)mutateSelected(obj=>{obj.name=next;});
}
function numberOr(raw,fallback){
 if(String(raw).trim()==='')return fallback;
 const n=Number(raw);return Number.isFinite(n)?n:fallback;
}
function degrees(v){return ((numberOr(v,0)%360)+360)%360;}
function percentage(v){return clamp(numberOr(v,100),.1,200)/100;}

function initialAppearanceFor(asset){
 const preset=world?.assetDefaults?.[asset];
 return {
  scale:clamp(preset?.scale??catalog.all[asset]?.defaultScale??(asset.startsWith('ext_glb_')?.3:1),.001,2),
  brightness:preset?.brightness??1,
  saturation:preset?.saturation??1,
  hue:preset?.hue??0
 };
}
$('overwrite-asset').onclick=()=>{
 const r=currentRecord();
 if(!r||selectedIds.size!==1||selected.startsWith('native:')||isLocked(selected)||!catalog.types.includes(r.asset))return;
 const label=catalog.all[r.asset]?.label||r.asset;
 const values={scale:r.scale,brightness:r.brightness??1,saturation:r.saturation??1,hue:r.hue??0};
 const ask='将「'+label+'」当前的缩放和颜色保存为素材默认值？\n\n后续放置的同类元件自动使用这些参数，已经放置的其他实例不变。原始 GLB 与贴图保持不变。';
 if(!confirm(ask))return;
 history();world.assetDefaults??={};world.assetDefaults[r.asset]=values;
 previewCache.delete(r.asset);renderAssetLibrary();updateInspector();setDirty(true);saveLocal();
 toast('已覆盖「'+label+'」的默认缩放和颜色');
};
$('restore-asset-defaults').onclick=()=>{
 const r=currentRecord();
 if(!r||selectedIds.size!==1||selected.startsWith('native:')||isLocked(selected)||!world.assetDefaults?.[r.asset])return;
 history();delete world.assetDefaults[r.asset];
 previewCache.delete(r.asset);renderAssetLibrary();updateInspector();setDirty(true);saveLocal();
 toast('已恢复此元件的素材默认设置');
};

// Keep the current model on screen while dragging; commit one undo step on release.
for(const key of ['brightness','saturation','hue']){
 const input=$('appearance-'+key);
 let before=null;
 const neutral=key==='hue'?0:1;
 input.addEventListener('pointerdown',()=>{before=currentRecord()?.[key]??neutral;});
 input.addEventListener('input',()=>{
  const r=currentRecord();if(!r||selectedIds.size!==1||isLocked(selected))return;
  actualRecord(selected)[key]=key==='hue'?Number(input.value):Number(input.value)/100;
  $('appearance-'+key+'-value').textContent=input.value+(key==='hue'?'°':'%');
  refreshSelectedAppearance();setDirty(true);
 });
 input.addEventListener('change',()=>{
  const r=currentRecord();if(!r||selectedIds.size!==1||isLocked(selected))return;
  const next=key==='hue'?Number(input.value):Number(input.value)/100;
  if(before!==null&&Math.abs(before-next)>1e-7){
   const old=actualRecord(selected)[key];
   actualRecord(selected)[key]=before;history();actualRecord(selected)[key]=old;
  }
  before=null;saveLocal();
 });
}
$('appearance-reset').onclick=()=>{
 if(!currentRecord()||selectedIds.size!==1||isLocked(selected))return;
 mutateSelected(r=>{r.brightness=1;r.saturation=1;r.hue=0;});
 refreshSelectedAppearance();
};
$('selected-name').onchange=e=>setSelectedName(e.target.value);
for(const field of ['posx','posz'])$(field).onchange=e=>{
 const key=field==='posx'?'x':'z',limit=key==='x'?WIDTH/2:DEPTH/2;
 setSelectedNumber(key,clamp(numberOr(e.target.value,currentRecord()?.[key]??0),-limit,limit));
};
$('posy').onchange=e=>setSelectedNumber('y',clamp(numberOr(e.target.value,currentRecord()?.y??0),MIN_OBJECT_Y,MAX_OBJECT_Y));
$('rot').onchange=e=>setSelectedNumber('rotation',degrees(e.target.value));
$('rot').oninput=e=>{$('rot-val').textContent=Math.round(+e.target.value)+'°';$('rot-deg').value=e.target.value;};
$('rot-deg').onchange=e=>setSelectedNumber('rotation',degrees(e.target.value));
$('scale').onchange=e=>setSelectedNumber('scale',percentage(+e.target.value*100));
$('scale').oninput=e=>{$('scale-val').textContent=Math.round(+e.target.value*100)+'%';$('scale-pct').value=Math.round(+e.target.value*100);};
$('scale-pct').onchange=e=>setSelectedNumber('scale',percentage(e.target.value));
// Explicit Enter commit is supported for all object parameter input fields.
for(const id of ['selected-name','posx','posy','posz','rot-deg','scale-pct']){
 $(id).addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  e.preventDefault();e.stopPropagation();
  e.currentTarget.dispatchEvent(new Event('change'));
  e.currentTarget.blur();
  renderer.domElement.focus({preventScroll:true});
 });
}
// External assets: import to a persistent browser library, then use existing
// click-to-place palette, inspector, 3-axis gizmo, and map object records.
function updateGLBStatus(extra=''){
 $('glb-status').textContent='已加载 '+glbLibrary.count()+' 个外部 GLB'
  +(glbLibrary.persistent?' · IndexedDB 本地持久保存':' · 浏览器不支持持久保存')
  +(extra?' · '+extra:'');
}
function addExternalCategoryOption(){
 for(const category of ['外部地形 GLB','外部模型 GLB']){
  if([...$('asset-filter').options].some(o=>o.value===category))continue;
  const opt=document.createElement('option');opt.value=category;opt.textContent=category;
  $('asset-filter').append(opt);
 }
}
updateGLBStatus();addExternalCategoryOption();
$('import-glb').onchange=async event=>{
 const input=event.target,files=[...(input.files||[])];
 if(!files.length)return;
 input.disabled=true;updateGLBStatus('正在读取模型');
 try{
  const result=await glbLibrary.importFiles(files);
  updateGLBStatus(result.errors.length?'失败 '+result.errors.length+' 个':'导入完成');
  if(result.added.length){$('asset-search').value='';$('asset-filter').value='complete';}
  renderAssetLibrary();rebuildObjects();
  if(result.added.length){
   const last=result.added.at(-1);
   setTool('asset:'+last.id);
  }
  const errors=result.errors.slice(0,2).map(r=>r.name+': '+r.error);
  toast('成功 '+result.added.length+' 个'+(errors.length?'；'+errors.join('；'):'') );
  console.info('GLB import',result);
 }catch(err){updateGLBStatus('导入失败');toast('模型导入失败：'+err.message);}
 finally{input.value='';input.disabled=false;}
};
function downloadJSON(data,filename){
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
$('export-portable').onclick=async()=>{
 const button=$('export-portable');button.disabled=true;
 try{
  const portable=await glbLibrary.exportPortable(world);
  downloadJSON(portable,'lighthouse-world-portable.json');
  toast('完整工程已导出：包含 '+portable.externalGLBs.length+' 个 GLB');
 }catch(err){toast('完整工程导出失败：'+err.message);}
 finally{button.disabled=false;}
};
// World-space bounding-box alignment. This is a positioning tool only;
// geometry is not welded and incompatible edge silhouettes are not hidden.
$('snap-neighbor').onclick=()=>{
 if(selectedIds.size!==1||!selected||selected.startsWith('native:')){
  toast('先单选一个新增 GLB 模型');return;
 }
 const a=objects.get(selected);
 if(!a?.asset.startsWith('ext_glb_')){toast('贴边功能适用于外部 GLB 地形模块');return;}
 const modelA=assetLayer.children.find(g=>g.userData.mapId===selected);
 if(!modelA)return;
 modelA.updateWorldMatrix(true,true);
 const ba=new T.Box3().setFromObject(modelA);
 let best=null;
 const overlap=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0);
 for(const modelB of assetLayer.children){
  const other=objects.get(modelB.userData.mapId);
  if(!other||other.id===a.id||!other.asset.startsWith('ext_glb_')||other.hidden)continue;
  modelB.updateWorldMatrix(true,true);
  const bb=new T.Box3().setFromObject(modelB);
  const zOverlap=overlap(ba.min.z,ba.max.z,bb.min.z,bb.max.z);
  const xOverlap=overlap(ba.min.x,ba.max.x,bb.min.x,bb.max.x);
  const pairs=[];
  if(zOverlap>0.1)pairs.push({axis:'x',delta:bb.max.x-ba.min.x},{axis:'x',delta:bb.min.x-ba.max.x});
  if(xOverlap>0.1)pairs.push({axis:'z',delta:bb.max.z-ba.min.z},{axis:'z',delta:bb.min.z-ba.max.z});
  for(const p of pairs){
   const distance=Math.abs(p.delta);
   if(!best||distance<best.distance)best={...p,distance,other:other.name,heightGap:Math.abs(ba.min.y-bb.min.y)};
  }
 }
 if(!best||best.distance>Math.max(4,Math.min(12,Math.max(CELLX,CELLZ)*4))){
  toast('附近未找到可贴边的外部 GLB；请先移动到相邻位置');return;
 }
 history();
 if(best.axis==='x')a.x=clamp(a.x+best.delta,-WIDTH/2,WIDTH/2);
 else a.z=clamp(a.z+best.delta,-DEPTH/2,DEPTH/2);
 rebuildObjects();setDirty(true);saveLocal();
 toast('已对齐 '+best.other+' 的外框'+(best.heightGap>.5?'；高度有差异，请检查接缝':'；请检查实际网格接缝'));
};
$('save').onclick=()=>{
 const data=JSON.stringify(world,null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='lighthouse-world-map.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);setDirty(false);saveLocal();toast('地图 JSON 已导出');
};
$('input-json').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const raw=JSON.parse(await file.text());
  const imported=await glbLibrary.importPortable(raw);
  const input=validWorld(raw);
  history();world=input;selected=null;selectedIds.clear();
  renderAssetLibrary();redraw();saveLocal();updateGLBStatus();
  const missing=new Set(world.objects.filter(o=>o.asset.startsWith('ext_glb_')&&!glbLibrary.has(o.asset)).map(o=>o.asset));
  toast('地图已导入'+(imported.added.length?'，恢复 '+imported.added.length+' 个 GLB':'')
   +(missing.size?'；缺少 '+missing.size+' 个 GLB，请重新导入文件':'')
   +(imported.errors.length?'；'+imported.errors.length+' 个模型读取失败':''));
 }catch(err){toast('导入失败：'+err.message)}
 e.target.value='';
};

/* Lightweight navigational minimap: click or drag to move the camera target.
   Does not change model coordinates or alter the world. */
const miniCanvas=$('minimap-canvas');
const miniCtx=miniCanvas.getContext('2d',{alpha:false});
function miniGeometry(){
 const w=miniCanvas.width,h=miniCanvas.height,padding=9;
 const unit=Math.min((w-2*padding)/WIDTH,(h-2*padding)/DEPTH);
 return {w,h,unit,x0:(w-WIDTH*unit)/2,y0:(h-DEPTH*unit)/2};
}
function minimapPoint(x,z,g){return [g.x0+(x+WIDTH/2)*g.unit,g.y0+(z+DEPTH/2)*g.unit];}
function gotoMapPoint(x,z){
 const next=new T.Vector3(clamp(x,-WIDTH/2,WIDTH/2),0,clamp(z,-DEPTH/2,DEPTH/2));
 const change=next.clone().sub(controls.target);
 controls.target.copy(next);
 camera.position.add(change);
 controls.update();
}
function navigateFromMinimap(e){
 if(!world)return;
 const g=miniGeometry(),rect=miniCanvas.getBoundingClientRect();
 const x=(e.clientX-rect.left)/rect.width*g.w,z=(e.clientY-rect.top)/rect.height*g.h;
 gotoMapPoint((x-g.x0)/g.unit-WIDTH/2,(z-g.y0)/g.unit-DEPTH/2);
 renderMinimap();
}
miniCanvas.addEventListener('pointerdown',e=>{
 e.preventDefault();miniCanvas.setPointerCapture(e.pointerId);navigateFromMinimap(e);
});
miniCanvas.addEventListener('pointermove',e=>{if(e.buttons&1&&miniCanvas.hasPointerCapture(e.pointerId))navigateFromMinimap(e);});
miniCanvas.addEventListener('keydown',e=>{
 if(!['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
 e.preventDefault();
 if(e.key==='Enter'||e.key===' ')gotoMapPoint(0,0);
 else gotoMapPoint(controls.target.x+(e.key==='ArrowLeft'?-8:e.key==='ArrowRight'?8:0),controls.target.z+(e.key==='ArrowUp'?-8:e.key==='ArrowDown'?8:0));
 renderMinimap();
});
$('minimap-center').onclick=()=>gotoMapPoint(0,0);
let miniLastDraw=0;
function renderMinimap(){
 if(!miniCtx||!world)return;
 const ctx=miniCtx,g=miniGeometry(),[gw,gh]=world.grid,dx=WIDTH/gw,dz=DEPTH/gh;
 ctx.fillStyle='#173b49';ctx.fillRect(0,0,g.w,g.h);
 ctx.fillStyle='#255366';ctx.fillRect(g.x0,g.y0,WIDTH*g.unit,DEPTH*g.unit);
 for(let row=0;row<gh;row++)for(let col=0;col<gw;col++){
  const i=row*gw+col,h=world.heights[i];
  if(h<=0)continue;
  ctx.fillStyle=world.types[i]==='sand'?'#c5aa7a':world.types[i]==='rock'?'#777e7f':'#6f9a72';
  ctx.fillRect(g.x0+col*dx*g.unit,g.y0+row*dz*g.unit,Math.ceil(dx*g.unit+.35),Math.ceil(dz*g.unit+.35));
 }
 if(gameGroup.visible){
  const [ix,iz]=minimapPoint(0,0,g);
  ctx.fillStyle='#6d9b78';ctx.strokeStyle='#aac4a6';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.ellipse(ix,iz,Math.max(3,16*g.unit),Math.max(3,13.5*g.unit),.16,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 for(const obj of world.objects){
  if(obj.hidden)continue;
  const [x,y]=minimapPoint(obj.x,obj.z,g);
  ctx.fillStyle=obj.id===selected?'#ffdf8f':'#e9ede4';
  ctx.beginPath();ctx.arc(x,y,obj.id===selected?4:2.5,0,Math.PI*2);ctx.fill();
 }
 const [cx,cy]=minimapPoint(controls.target.x,controls.target.z,g);
 const range=Math.min(180,Math.max(8,camera.position.distanceTo(controls.target)*Math.tan(T.MathUtils.degToRad(camera.fov/2))*.8));
 ctx.strokeStyle='#96e4ed';ctx.lineWidth=1;ctx.setLineDash([4,3]);
 ctx.strokeRect(cx-range*g.unit,cy-range*g.unit,range*g.unit*2,range*g.unit*2);ctx.setLineDash([]);
 ctx.strokeStyle='#b7ffff';ctx.lineWidth=1.8;
 ctx.beginPath();ctx.moveTo(cx-6,cy);ctx.lineTo(cx+6,cy);ctx.moveTo(cx,cy-6);ctx.lineTo(cx,cy+6);ctx.stroke();
 ctx.fillStyle='#d5f2f2';ctx.font='10px sans-serif';ctx.fillText('N',g.w/2-3,10);
}
const BACKUP_KEY='dnd-lighthouse-editor-snapshots-v1';
function loadBackups(){
 try{
  const data=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]');
  return Array.isArray(data)?data.filter(b=>b&&typeof b.id==='string'&&b.world&&typeof b.world==='object').slice(0,30):[];
 }catch(e){console.warn('Backup storage invalid:',e);return [];}
}
function renderBackupList(preferredId){
 const backups=loadBackups(),sel=$('backup-list'),keep=preferredId??sel.value;
 sel.replaceChildren();
 if(!backups.length){
  const opt=new Option('暂无备份','');sel.add(opt);
 }else for(const b of backups){
  const date=new Date(b.createdAt);
  const stamp=Number.isNaN(date.getTime())?'':date.toLocaleString('zh-CN',{hour12:false});
  sel.add(new Option(b.name+' · '+stamp,b.id));
 }
 if(keep&&backups.some(b=>b.id===keep))sel.value=keep;
 $('backup-restore').disabled=!backups.length;
 $('backup-delete').disabled=!backups.length;
 $('backup-status').textContent='当前浏览器保存 '+backups.length+' 份备份';
}
function backupDefaultName(){
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}
function createBackup(){
 if(!world)return;
 const backups=loadBackups();
 if(backups.length>=30){toast('已达到30份备份上限，请先删除旧备份');return;}
 const name=prompt('备份名称',backupDefaultName());
 if(name===null)return;
 const title=name.trim().slice(0,80)||backupDefaultName();
 const entry={id:'backup-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),name:title,createdAt:Date.now(),world:JSON.parse(snapshot())};
 try{localStorage.setItem(BACKUP_KEY,JSON.stringify([entry,...backups]));}
 catch(err){toast('备份失败：本机存储空间不足或不可用');console.warn(err);return;}
 renderBackupList(entry.id);toast('已备份：'+title);
}
function restoreBackup(){
 const b=loadBackups().find(v=>v.id===$('backup-list').value);if(!b)return;
 if(!confirm('恢复「'+b.name+'」？当前未备份的地图修改将被覆盖。'))return;
 try{
  const restored=validWorld(b.world);
  history();world=restored;selected=null;selectedIds.clear();
  redraw();renderAssetLibrary();saveLocal();renderBackupList(b.id);
  toast('已恢复备份：'+b.name);
 }catch(err){toast('恢复失败：'+(err?.message||err));}
}
function deleteBackup(){
 const backups=loadBackups(),b=backups.find(v=>v.id===$('backup-list').value);if(!b)return;
 if(!confirm('删除备份「'+b.name+'」？此操作无法撤销。'))return;
 try{localStorage.setItem(BACKUP_KEY,JSON.stringify(backups.filter(v=>v.id!==b.id)));renderBackupList();toast('已删除备份');}
 catch(err){toast('删除备份失败：'+(err?.message||err));}
}
$('quick-backup').onclick=createBackup;
$('backup-create').onclick=createBackup;
$('backup-restore').onclick=restoreBackup;
$('backup-delete').onclick=deleteBackup;

$('play-map').onclick=()=>{
 try{
  savePreviewMap(world);
  window.open('../lighthouse/preview.html?source=local','_blank','noopener');
 }catch(err){toast('试玩地图保存失败：'+(err?.message||err));}
};
$('open-game').onclick=()=>window.open('../lighthouse/','_blank','noopener');
function resetCamera(){camera.position.set(40,38,46);camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();}
$('reset-view').onclick=resetCamera;
$('camera').onclick=()=>{
 isTop=!isTop;
 camera.position.copy(controls.target).add(new T.Vector3(isTop?.01:40,isTop?76:38,isTop?.01:46));
 camera.up.set(0,1,0);controls.update();
 $('camera').textContent=isTop?'切换透视':'切换俯视';
};
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented)return;
 const focus=document.activeElement;
 if(focus?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(focus?.tagName))return;
 if((e.key==='Delete'||e.code==='Delete')&&selectedIds.size){
  e.preventDefault();$('delete').click();return;
 }
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();applyHistory(e.shiftKey?'redo':'undo');}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();applyHistory('redo');}
 if(e.key==='Escape'){selected=null;selectedIds.clear();updateInspector();}
 if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&selectedIds.size){
  const key=e.key.toLowerCase();
  if(key==='g')setTransformMode('translate');
  if(key==='r')setTransformMode('rotate');
  if(key==='s')setTransformMode('scale');
 }
});

/* Unified desktop UI: only touch interaction requires mode switching.
   A touch on "browse" rotates; two fingers pan/zoom. "edit" allows taps
   to select/place assets without moving the camera target. */
function setTouchInteraction(mode){
 touchInteraction=mode==='edit'?'edit':'orbit';
 controls.touches.ONE=touchMedia.matches&&touchInteraction==='orbit'?T.TOUCH.ROTATE:null;
 controls.touches.TWO=T.TOUCH.DOLLY_PAN;
 $('touch-orbit').classList.toggle('active',touchInteraction==='orbit');
 $('touch-edit').classList.toggle('active',touchInteraction==='edit');
 $('touch-orbit').setAttribute('aria-pressed',String(touchInteraction==='orbit'));
 $('touch-edit').setAttribute('aria-pressed',String(touchInteraction==='edit'));
 directDrag=null;
 syncTransform();
}
$('touch-orbit').onclick=()=>setTouchInteraction('orbit');
$('touch-edit').onclick=()=>setTouchInteraction('edit');
touchMedia.addEventListener('change',()=>{
 renderer.setPixelRatio(Math.min(devicePixelRatio,touchMedia.matches?1.2:1.6));
 setTouchInteraction(touchMedia.matches?'orbit':'edit');
 fit();
});
setTouchInteraction(touchMedia.matches?'orbit':'edit');

function fit(){
 const w=view.clientWidth,h=view.clientHeight;if(w<10||h<10)return;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
new ResizeObserver(fit).observe(view);fit();
try{const current=readPreviewMap(),old=localStorage.getItem('dnd-lighthouse-map-editor-v1');
 world=current?validWorld(current):old?validWorld(JSON.parse(old)):emptyMap();}
catch(err){world=emptyMap();console.warn('Map recovery fallback',err);}
syncWorldDimensions();rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);applyAllNativeAppearance();setDirty(false);setTool('select');renderBackupList();
window.__lighthouseEditor={
 getState:()=>({schema:world.schema,size:[WIDTH,DEPTH],grid:[GW,GH],objects:world.objects.length,resizeBounds:[MIN_WIDTH,MIN_DEPTH,MAX_SIZE],expandable:true,
 heights:world.heights.length,regions:world.regions?.length||0,assetDefaults:Object.keys(world.assetDefaults||{}).length,tool:activeTool,selected,selectedIds:[...selectedIds],transformMode,history:hist.length,
 realGameAssets:true,originalIslandVisible:gameGroup.visible,nativeObjectCount:Object.keys(nativeTargets).length,prefabTypes:catalog.types,assetCount:catalog.types.length,sharedStoreKey:SHARED_MAP_KEY,rendered:!!renderer.domElement}),
 placeAt:(asset,x,z)=>{if(!catalog.types.includes(asset))return false;
  history();world.objects.push({id:uid(),asset,name:asset,x,y:0,z,rotation:0,...initialAppearanceFor(asset),hidden:false,locked:false});rebuildObjects();saveLocal();return true;},
 exportMap:()=>JSON.parse(snapshot()),importMap:w=>{history();world=validWorld(w);selected=null;selectedIds.clear();redraw();saveLocal();},
 selectNative:id=>{if(!BASE_ASSETS[id])return false;selectItem('native:'+id);return true;},
 editNative:(id,change)=>{
  if(!BASE_ASSETS[id])return false;history();
  Object.assign(nativeEdit(id),change);applyNativeEdits(world,gameGroup);applyAllNativeAppearance();
  setDirty(true);saveLocal();return true;
 },
 getCatalog:()=>catalog.types.map(id=>({id,name:catalog.all[id].label,category:assetCategory(id,catalog.all[id])})),
 selectObject:(id,multi=false)=>{if(!recordById(id))return false;selectItem(id,multi);return true;},
 setTransformMode:mode=>{if(!['translate','rotate','scale'].includes(mode))return false;setTransformMode(mode);return true;},
 resizeMap:(width,depth)=>resizeMapTo(width,depth),
 getGameNative:()=>Object.fromEntries(Object.entries(nativeTargets).map(([id,o])=>
 [id,o?{x:o.position.x,y:o.position.y,z:o.position.z,visible:o.visible}:null]))
};
const tempSelectionBounds=new T.Box3();
renderer.setAnimationLoop(()=>{
 controls.update();
 if(performance.now()-miniLastDraw>150){miniLastDraw=performance.now();renderMinimap();}selectionBounds.makeEmpty();
 for(const id of selectedIds){
  const target=id.startsWith('native:')?(gameGroup.visible?nativeTargets[id.slice(7)]:null):
   assetLayer.children.find(g=>g.userData.mapId===id);
  if(!target||!target.visible)continue;
  target.updateWorldMatrix(true,true);
  tempSelectionBounds.setFromObject(target);
  if(!tempSelectionBounds.isEmpty())selectionBounds.union(tempSelectionBounds);
 }
 selectionHelper.visible=!selectionBounds.isEmpty();
 renderer.render(scene,camera);
});
document.body.dataset.editorReady='true';
if(bootElement&&!bootElement.dataset.error)bootElement.hidden=true;
