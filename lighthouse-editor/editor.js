import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group as gameGroup,buildCutaway,buildIsland,setRenderer} from '../lighthouse/v27-world.js?v=27a';
import {buildSite} from '../lighthouse/v35-site.js?v=35a';
import {createOffshoreReefs} from '../lighthouse/v35-reefs.js?v=35a';
import {SHARED_MAP_KEY,emptyMap,normalizeMap,readPreviewMap,savePreviewMap,
 nativePrefabCatalog,createTerrainMesh,addOpenOcean,applyNativeEdits,
 BASE_ASSETS,SEA as GAME_SEA,groundY as gameGroundY} from '../lighthouse/shared-map.js?v=35a';
const $=id=>document.getElementById(id),view=$('view');
const GW=64,GH=56,WIDTH=146,DEPTH=129,CELLX=WIDTH/GW,CELLZ=DEPTH/GH;
const SEA=GAME_SEA,minH=-3,maxH=9,storeKey=SHARED_MAP_KEY;
const colors={water:0x276476,sand:0xc6b78a,grass:0x71866d,rock:0x71858c};
let world,activeTool='raise',brush=2,strength=1,selected=null,hover=null,stroke=false,lastStroke='',hist=[],future=[],dirty=false,isTop=false,objects=new Map(),renderObjectMeshes=[];
const empty=()=>({schema:'lighthouse-world-v1',version:1,width:WIDTH,depth:DEPTH,grid:[GW,GH],heights:Array(GW*GH).fill(-2),types:Array(GW*GH).fill('water'),objects:[]});
const idx=(x,z)=>z*GW+x,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const scene=new T.Scene();scene.background=new T.Color('#88b9c9');
const camera=new T.PerspectiveCamera(43,1,.1,550),renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
view.insertBefore(renderer.domElement,view.firstChild);scene.add(new T.HemisphereLight(0xc6e5ef,0x52626b,2.15));
const sunlight=new T.DirectionalLight(0xffe8bd,2.3);sunlight.position.set(-45,92,65);scene.add(sunlight);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.set(102,114,123);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.075;
controls.mouseButtons={LEFT:null,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.ROTATE};
controls.touches={ONE:null,TWO:T.TOUCH.DOLLY_PAN};controls.maxDistance=330;controls.minDistance=15;
controls.maxPolarAngle=Math.PI*.48;controls.update();
setRenderer(renderer);renderer.localClippingEnabled=true;
scene.add(gameGroup);
const originalSea=buildCutaway();buildIsland();buildSite();const originalReefs=createOffshoreReefs();
originalSea.userData.setBlend(1);
for(const child of gameGroup.children)
 if(child.userData.waterSidewall||['sea-geological-base','sea-soil-stratum','opaque-sea-cross-section'].includes(child.name))
  child.visible=false;
const catalog=nativePrefabCatalog(gameGroup,originalReefs.root);
if(catalog.types.length!==8)throw Error('游戏原模型提取不完整: '+catalog.types);
const nativeTargets=Object.fromEntries(Object.keys(BASE_ASSETS).map(id=>[id,gameGroup.getObjectByName('game-asset-'+id)]));
const root=new T.Group();scene.add(root);addOpenOcean(root);
let terrain=null,assetLayer=new T.Group();root.add(assetLayer);
const cursorMat=new T.MeshBasicMaterial({color:0xe9e5ba,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide});
const cursor=new T.Mesh(new T.RingGeometry(.86,1.0,40),cursorMat);cursor.rotation.x=-Math.PI/2;cursor.visible=false;root.add(cursor);
const nodeMeshes=()=>assetLayer.children.filter(m=>m.userData.recordId);
function uid(){return 'obj-'+Math.random().toString(36).slice(2,10);}
function initial(){
 const w=emptyMap();
 const forms=[[-23,5,19,14,5],[-47,-35,12,9,3],[43,-27,14,10,3],[34,35,18,10,4],[-49,43,10,8,2]];
 for(let z=0;z<GH;z++)for(let x=0;x<GW;x++){
  const px=(x+.5)*CELLX-WIDTH/2,pz=(z+.5)*CELLZ-DEPTH/2;
  let h=-2.5;
  for(const [cx,cz,rx,rz,peak] of forms){
   const d=Math.hypot((px-cx)/rx,(pz-cz)/rz);
   const v=peak*(1-d)+.33*Math.sin(px*.32+pz*.17)*Math.cos(pz*.27);
   h=Math.max(h,v);
  }
  h=Math.round(clamp(h,minH,maxH));
  const k=idx(x,z);w.heights[k]=h;
  w.types[k]=h<=0?'water':h===1?'sand':h>=5?'rock':'grass';
 }
 w.objects=[
  {id:uid(),asset:'shore_rock',name:'游戏礁石',x:13,z:-26,rotation:31,scale:1.5},
  {id:uid(),asset:'pine',name:'游戏松树',x:-29,z:0,rotation:0,scale:1},
  {id:uid(),asset:'lighthouse',name:'新灯塔',x:34,z:35,rotation:0,scale:1},
  {id:uid(),asset:'barrel',name:'游戏木桶',x:-43,z:-32,rotation:35,scale:1.25},
  {id:uid(),asset:'offshore_reef',name:'游戏礁石簇',x:25,z:5,rotation:0,scale:1}
 ];
 return w;
}
function validWorld(w){return normalizeMap(w)}
const snapshot=()=>JSON.stringify(world);
function history(){hist.push(snapshot());if(hist.length>30)hist.shift();future=[];}
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
function objModel(asset){return catalog.create(asset)}
function updateObjectsHeight(){
 for(const g of assetLayer.children){const rec=objects.get(g.userData.recordId);if(rec)g.position.y=terrainY(rec.x,rec.z);}
}
function rebuildObjects(){
 assetLayer.clear();objects.clear();
 for(const r of world.objects){
  const g=objModel(r.asset);g.userData.recordId=r.id;g.userData.mapId=r.id;g.name=r.name;
  g.position.set(r.x,terrainY(r.x,r.z),r.z);g.rotation.y=r.rotation*Math.PI/180;g.scale.setScalar(r.scale);
  g.traverse(m=>{if(m.isMesh)m.userData.recordId=r.id;});
  assetLayer.add(g);objects.set(r.id,r);
 }
 if(!selected||(!objects.has(selected)&&!selected.startsWith('native:')))selected=null;
 updateInspector();$('object-count').textContent=world.objects.length;
}
function redraw(){rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);setDirty(true);}
function setDirty(v){dirty=v;$('dirty').textContent=v?'有未导出修改':'已导出';}
function saveLocal(){try{savePreviewMap(world)}catch(e){console.warn('Local save unavailable',e);}}
function applyHistory(direction){
 const from=direction==='undo'?hist:future,to=direction==='undo'?future:hist;
 if(!from.length)return;
 to.push(snapshot());world=validWorld(JSON.parse(from.pop()));selected=null;redraw();saveLocal();toast(direction==='undo'?'已撤销':'已重做');
}
function toast(m){$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(toast.id);toast.id=setTimeout(()=>$('toast').classList.remove('show'),2200);}
function paint(x,z){
 const cell=getCellAt(x,z);if(!cell)return;
 let changed=false;
 const flat=world.heights[cell.index];
 for(let dz=-brush;dz<=brush;dz++)for(let dx=-brush;dx<=brush;dx++){
  const xx=cell.col+dx,zz=cell.row+dz;if(xx<0||zz<0||xx>=GW||zz>=GH||dx*dx+dz*dz>brush*brush)continue;
  const k=idx(xx,zz),old=world.heights[k],typ=world.types[k];
  let h=old,t=typ;
  if(activeTool==='raise'){h=clamp(old+strength,minH,maxH);if(h>0&&typ==='water')t='grass';}
  if(activeTool==='lower'){h=clamp(old-strength,minH,maxH);if(h<=0)t='water';}
  if(activeTool==='flatten'){h=flat;if(h<=0)t='water';}
  if(activeTool==='water'){h=Math.min(h,-1);t='water';}
  if(['sand','grass','rock'].includes(activeTool)){t=activeTool;if(h<=0)h=1;}
  if(h!==old||t!==typ){world.heights[k]=h;world.types[k]=t;changed=true;}
 }
 if(changed){rebuildTerrain();setDirty(true);saveLocal();}
}
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
 for(const hit of ray.intersectObjects([...assetLayer.children,...Object.values(nativeTargets).filter(Boolean)],true)){
  let parent=hit.object;
  while(parent){
   if(parent.userData.mapId)return parent.userData.mapId;
   for(const [id,obj] of Object.entries(nativeTargets))if(obj===parent)return 'native:'+id;
   parent=parent.parent;
  }
 }
 return null;
}
function currentRecord(){
 if(!selected)return null;
 if(selected.startsWith('native:')){
  const id=selected.slice(7),base=BASE_ASSETS[id],r=world.baseEdits?.[id]||{};
  if(!base)return null;
  return {id,asset:id,name:base.name,x:r.x??base.x,z:r.z??base.z,
   rotation:r.rotation??0,scale:r.scale??1,hidden:r.hidden??false};
 }
 return objects.get(selected)||null;
}
function nativeEdit(id){
 world.baseEdits??={};
 return world.baseEdits[id]??={x:BASE_ASSETS[id].x,z:BASE_ASSETS[id].z,
  rotation:0,scale:1,hidden:false};
}
function setTool(t){
 activeTool=t;document.querySelectorAll('[data-tool],[data-asset]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t||b.dataset.asset&&('asset:'+b.dataset.asset)===t));
 const names={raise:'抬高',lower:'降低',flatten:'平整',water:'挖水域',sand:'沙地',grass:'草地',rock:'岩地',select:'选择'};
 $('tool-name').textContent=names[t]||('放置 '+t.replace('asset:',''));
}
function mutateSelected(fn){
 if(!currentRecord())return;history();
 if(selected.startsWith('native:')){
  fn(nativeEdit(selected.slice(7)));applyNativeEdits(world,gameGroup);
 }else{fn(objects.get(selected));rebuildObjects();}
 updateInspector();setDirty(true);saveLocal();
}
function updateInspector(){
 const r=currentRecord();
 $('inspector').hidden=!r;$('none').hidden=!!r;if(!r)return;
 const native=selected.startsWith('native:');
 $('selected-name').value=r.name;$('selected-name').disabled=native;
 $('posx').value=r.x.toFixed(2);$('posz').value=r.z.toFixed(2);
 $('rot').value=r.rotation;$('rot-val').textContent=Math.round(r.rotation)+'°';
 $('scale').value=r.scale;$('scale-val').textContent=r.scale.toFixed(1);
 $('delete').textContent=native?'隐藏原版模型':'删除';
 $('restore-native').hidden=!native;
}
let draggingObj=false;
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 const p=pointAt(e);if(!p)return;
 if(activeTool==='select'){
  selected=findSelected(e);updateInspector();
  if(selected){history();draggingObj=true;renderer.domElement.setPointerCapture(e.pointerId);}
  return;
 }
 if(activeTool.startsWith('asset:')){
  const asset=activeTool.slice(6);
  history();const o={id:uid(),asset,name:asset,x:clamp(p.x,-WIDTH/2,WIDTH/2),
   z:clamp(p.z,-DEPTH/2,DEPTH/2),rotation:0,scale:1};
  world.objects.push(o);selected=o.id;rebuildObjects();setTool('select');setDirty(true);saveLocal();toast('已放置 '+asset);return;
 }
 history();stroke=true;lastStroke='';
 renderer.domElement.setPointerCapture(e.pointerId);
 paint(p.x,p.z);
},{passive:true});
renderer.domElement.addEventListener('pointermove',e=>{
 const p=pointAt(e);if(!p)return;
 $('cursor').textContent=p.x.toFixed(1)+' / '+p.z.toFixed(1);
 cursor.visible=true;cursor.position.set(p.x,terrainY(p.x,p.z)+.11,p.z);cursor.scale.setScalar(Math.max(.6,brush)*CELLX);
 if(draggingObj&&selected&&objects.has(selected)){
  const o=objects.get(selected);o.x=clamp(p.x,-WIDTH/2,WIDTH/2);o.z=clamp(p.z,-DEPTH/2,DEPTH/2);
  const g=assetLayer.children.find(x=>x.userData.recordId===selected);
  if(g)g.position.set(o.x,terrainY(o.x,o.z),o.z);
  $('posx').value=o.x.toFixed(2);$('posz').value=o.z.toFixed(2);setDirty(true);
 }else if(stroke){
  const cell=getCellAt(p.x,p.z),key=cell?.index;
  if(key!==undefined&&key!==lastStroke){paint(p.x,p.z);lastStroke=key;}
 }
},{passive:true});
function finish(e){
 if(draggingObj||stroke)saveLocal();
 draggingObj=false;stroke=false;lastStroke='';
 try{renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
}
renderer.domElement.addEventListener('pointerup',finish);
renderer.domElement.addEventListener('pointercancel',finish);
view.addEventListener('pointerleave',()=>cursor.visible=false);
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
document.querySelectorAll('[data-asset]').forEach(b=>b.onclick=()=>setTool('asset:'+b.dataset.asset));
$('brush').oninput=e=>{brush=+e.target.value;$('brush-val').textContent=brush;};
$('strength').oninput=e=>{strength=+e.target.value;$('strength-val').textContent=strength;};
$('undo').onclick=()=>applyHistory('undo');$('redo').onclick=()=>applyHistory('redo');
$('duplicate').onclick=()=>{
 if(!selected)return;history();
 const o=objects.get(selected);const clone={...o,id:uid(),name:o.name+' 复制',x:clamp(o.x+3,-WIDTH/2,WIDTH/2),z:clamp(o.z+3,-DEPTH/2,DEPTH/2)};
 world.objects.push(clone);selected=clone.id;rebuildObjects();setDirty(true);saveLocal();
};
$('delete').onclick=()=>{
 if(!selected)return;history();world.objects=world.objects.filter(x=>x.id!==selected);selected=null;rebuildObjects();setDirty(true);saveLocal();
};
$('selected-name').onchange=e=>mutateSelected(o=>o.name=e.target.value.slice(0,90));
for(const field of ['posx','posz'])$(field).onchange=e=>mutateSelected(o=>o[field==='posx'?'x':'z']=clamp(Number(e.target.value)||0,field==='posx'?-WIDTH/2:-DEPTH/2,field==='posx'?WIDTH/2:DEPTH/2));
$('rot').onchange=e=>mutateSelected(o=>o.rotation=+e.target.value);
$('rot').oninput=e=>$('rot-val').textContent=e.target.value+'°';
$('scale').onchange=e=>mutateSelected(o=>o.scale=+e.target.value);
$('scale').oninput=e=>$('scale-val').textContent=(+e.target.value).toFixed(1);
$('new-world').onclick=()=>{if(!confirm('新建海域会替换当前地图，建议先导出 JSON。继续吗？'))return;history();world=emptyMap();selected=null;redraw();saveLocal();toast('已新建空白海域');};
$('demo-world').onclick=()=>{if(!confirm('恢复预设群岛会覆盖当前地图。继续吗？'))return;history();world=initial();selected=null;redraw();saveLocal();toast('已恢复群岛模板');};
$('save').onclick=()=>{
 const data=JSON.stringify(world,null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='lighthouse-world-map.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);setDirty(false);saveLocal();toast('地图 JSON 已导出');
};
$('input-json').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{const input=validWorld(JSON.parse(await file.text()));history();world=input;selected=null;redraw();saveLocal();toast('地图已导入');}
 catch(err){toast('导入失败：'+err.message)}
 e.target.value='';
};
$('autosave').onclick=()=>{saveLocal();toast('预览地图已保存');};
$('open-game').onclick=()=>{saveLocal();window.open('../lighthouse/?map=editor','_blank','noopener');};
function resetCamera(){camera.position.set(102,114,123);camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();}
$('reset-view').onclick=resetCamera;
$('camera').onclick=()=>{
 isTop=!isTop;
 camera.position.set(isTop?.01:102,isTop?175:114,isTop?.01:123);
 camera.up.set(0,1,0);controls.target.set(0,0,0);controls.update();
 $('camera').textContent=isTop?'切换透视':'切换俯视';
};
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();applyHistory(e.shiftKey?'redo':'undo');}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();applyHistory('redo');}
 if(e.key==='Delete'&&selected)$('delete').click();
});
function fit(){
 const w=view.clientWidth,h=view.clientHeight;if(w<10||h<10)return;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
new ResizeObserver(fit).observe(view);fit();
try{const current=readPreviewMap(),old=localStorage.getItem('dnd-lighthouse-map-editor-v1');
 world=current?validWorld(current):old?validWorld(JSON.parse(old)):initial();}
catch(err){world=initial();console.warn('Map recovery fallback',err);}
rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);setDirty(false);setTool('raise');
window.__lighthouseEditor={
 getState:()=>({schema:world.schema,size:[WIDTH,DEPTH],grid:[GW,GH],objects:world.objects.length,
 heights:world.heights.length,tool:activeTool,selected,history:hist.length,
 realGameAssets:true,prefabTypes:catalog.types,sharedStoreKey:SHARED_MAP_KEY,rendered:!!renderer.domElement}),
 paintAt:(x,z,tool='raise')=>{setTool(tool);history();paint(x,z);return world.heights[getCellAt(x,z)?.index??0];},
 placeAt:(asset,x,z)=>{const valid=['rock','tree','lighthouse','hut','dock','wreck','fish','kraken'];if(!valid.includes(asset))return false;
  history();world.objects.push({id:uid(),asset,name:asset,x,z,rotation:0,scale:1});rebuildObjects();saveLocal();return true;},
 exportMap:()=>JSON.parse(snapshot()),importMap:w=>{history();world=validWorld(w);redraw();saveLocal();},
 getCatalog:()=>catalog.types.map(id=>({id,name:catalog.all[id].label})),
 getGameNative:()=>Object.fromEntries(Object.entries(nativeTargets).map(([id,o])=>
 [id,o?{x:o.position.x,z:o.position.z,visible:o.visible}:null]))
};
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
document.body.dataset.editorReady='true';
