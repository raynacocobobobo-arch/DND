import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {group as gameGroup,buildCutaway,buildIsland,setRenderer} from '../lighthouse/v27-world.js?v=27a';
import {buildSite} from '../lighthouse/v35-site.js?v=35a';
import {createOffshoreReefs} from '../lighthouse/v35-reefs.js?v=35a';
import {SHARED_MAP_KEY,emptyMap,normalizeMap,readPreviewMap,savePreviewMap,
 nativePrefabCatalog,createTerrainMesh,addOpenOcean,applyNativeEdits,MAX_EDITOR_GRID,
 BASE_ASSETS,nativeGameTargets,SEA as GAME_SEA,groundY as gameGroundY} from '../lighthouse/shared-map.js?v=38a';
const $=id=>document.getElementById(id),view=$('view');
let GW=64,GH=56,WIDTH=146,DEPTH=129,CELLX=WIDTH/GW,CELLZ=DEPTH/GH;
const SEA=GAME_SEA,minH=-3,maxH=9,storeKey=SHARED_MAP_KEY;
const colors={water:0x276476,sand:0xc6b78a,grass:0x71866d,rock:0x71858c};
let world,activeTool='select',brush=2,strength=1,selected=null,hover=null,stroke=false,lastStroke='',hist=[],future=[],dirty=false,isTop=false,objects=new Map(),renderObjectMeshes=[];
const empty=()=>({schema:'lighthouse-world-v1',version:1,width:WIDTH,depth:DEPTH,grid:[GW,GH],heights:Array(GW*GH).fill(-2),types:Array(GW*GH).fill('water'),objects:[]});
const idx=(x,z)=>z*GW+x,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const scene=new T.Scene();scene.background=new T.Color('#88b9c9');
const camera=new T.PerspectiveCamera(43,1,.1,1000),renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
view.insertBefore(renderer.domElement,view.firstChild);scene.add(new T.HemisphereLight(0xc6e5ef,0x52626b,2.15));
const sunlight=new T.DirectionalLight(0xffe8bd,2.3);sunlight.position.set(-45,92,65);scene.add(sunlight);
const controls=new OrbitControls(camera,renderer.domElement);
camera.position.set(40,38,46);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.075;
controls.mouseButtons={LEFT:null,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.ROTATE};
controls.touches={ONE:null,TWO:T.TOUCH.DOLLY_PAN};controls.maxDistance=720;controls.minDistance=15;
controls.maxPolarAngle=Math.PI*.48;controls.update();
setRenderer(renderer);renderer.localClippingEnabled=true;
scene.add(gameGroup);
const originalSea=buildCutaway();buildIsland();buildSite();const originalReefs=createOffshoreReefs();
originalSea.userData.setBlend(1);
for(const child of gameGroup.children)
 if(child.userData.waterSidewall||['sea-geological-base','sea-soil-stratum','opaque-sea-cross-section'].includes(child.name))
  child.visible=false;
const catalog=nativePrefabCatalog(gameGroup,originalReefs.root);
if(catalog.types.length<80)throw Error('游戏场景模型扫描不完整: '+catalog.types.length);
gameGroup.visible=true; // original V35 island, lighthouse, trees and props remain the editable scene
const nativeTargets=nativeGameTargets();
const root=new T.Group();scene.add(root);
const openSea=addOpenOcean(root);openSea.scale.set(2.5,2.5,1);
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
 openSea.geometry=new T.PlaneGeometry(WIDTH*2.5,DEPTH*2.5);
 openSea.scale.set(1,1,1);
 edgeFog.geometry.dispose();
 edgeFog.geometry=new T.PlaneGeometry(WIDTH*2.5,DEPTH*2.5);
 edgeFog.material.uniforms.halfSize.value.set(WIDTH/2,DEPTH/2);
 $('size').textContent=WIDTH.toFixed(1)+' × '+DEPTH.toFixed(1);
 $('grid-size').textContent=GW+' × '+GH;
}
function expandOcean(factor){
 const source=world,oldX=source.grid[0],oldZ=source.grid[1];
 // Add equal numbers of cells on opposite sides, preserving center coordinates.
 const nextX=2*Math.ceil(oldX*factor/2),nextZ=2*Math.ceil(oldZ*factor/2);
 if(nextX>MAX_EDITOR_GRID||nextZ>MAX_EDITOR_GRID){
  toast('已达到当前编辑器的最大海域网格，请先保存地图');return;
 }
 const newW=+(source.width*nextX/oldX).toFixed(6);
 const newD=+(source.depth*nextZ/oldZ).toFixed(6);
 const expanded=emptyMap({width:newW,depth:newD,grid:[nextX,nextZ]});
 const offsetX=(nextX-oldX)/2,offsetZ=(nextZ-oldZ)/2;
 for(let z=0;z<oldZ;z++)for(let x=0;x<oldX;x++){
  const src=z*oldX+x,dst=(z+offsetZ)*nextX+x+offsetX;
  expanded.heights[dst]=source.heights[src];
  expanded.types[dst]=source.types[src];
 }
 expanded.objects=source.objects.map(o=>({...o}));
 expanded.baseEdits=JSON.parse(JSON.stringify(source.baseEdits||{}));
 expanded.regions=JSON.parse(JSON.stringify(source.regions||[]));
 history();world=expanded;redraw();saveLocal();
 $('size').textContent=newW.toFixed(1)+' × '+newD.toFixed(1);
 toast('海域已扩大，新增部分全部为海面，原岛屿及物件位置不变');
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
let outlinePoints=[],outlinePreview=null;
function resetOutline(){outlinePoints=[];if(outlinePreview){root.remove(outlinePreview);outlinePreview.geometry.dispose();outlinePreview.material.dispose();outlinePreview=null;}}
function previewOutline(){
 if(outlinePreview){root.remove(outlinePreview);outlinePreview.geometry.dispose();outlinePreview.material.dispose();}
 if(!outlinePoints.length){outlinePreview=null;return;}
 outlinePreview=new T.Line(new T.BufferGeometry().setFromPoints(outlinePoints.map(([x,z])=>new T.Vector3(x,SEA+.2,z))),new T.LineBasicMaterial({color:0xffe2a0,depthTest:false}));
 outlinePreview.renderOrder=20;root.add(outlinePreview);
}
function insidePolygon(x,z,pts){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){
 const a=pts[i],b=pts[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
}return inside;}
function finishOutline(){
 if(outlinePoints.length<3){toast('请至少标记三个边界点');return;}
 const h=+document.getElementById('terrain-height').value,mat=document.getElementById('terrain-material').value,cells=[];
 for(let z=0;z<GH;z++)for(let x=0;x<GW;x++){
  const px=(x+.5)*CELLX-WIDTH/2,pz=(z+.5)*CELLZ-DEPTH/2;
  if(insidePolygon(px,pz,outlinePoints))cells.push(idx(x,z));
 }
 if(!cells.length){toast('区域太小，没有覆盖地形网格');return;}
 history();for(const k of cells){world.heights[k]=h;world.types[k]=mat;}
 world.regions??=[];world.regions.push({id:uid(),points:outlinePoints.map(p=>[...p]),height:h,material:mat});
 resetOutline();rebuildTerrain();setDirty(true);saveLocal();toast('已绘制 '+cells.length+' 格地形，高度 '+h);
}
function uid(){return 'obj-'+Math.random().toString(36).slice(2,10);}
function initial(){
 const w=emptyMap({width:WIDTH,depth:DEPTH,grid:[GW,GH]});
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
 assetLayer.clear();objects.clear();selectionHelper.visible=false;
 for(const r of world.objects){
  const g=objModel(r.asset);g.userData.recordId=r.id;g.userData.mapId=r.id;g.name=r.name;
  g.position.set(r.x,terrainY(r.x,r.z),r.z);g.rotation.y=r.rotation*Math.PI/180;g.scale.setScalar(r.scale);
  g.traverse(m=>{if(m.isMesh)m.userData.recordId=r.id;});
  assetLayer.add(g);objects.set(r.id,r);
 }
 if(!selected||(!objects.has(selected)&&!selected.startsWith('native:')))selected=null;
 updateInspector();$('object-count').textContent=world.objects.length+' 新增 / '+Object.keys(nativeTargets).length+' 原版';
}
function redraw(){syncWorldDimensions();rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);setDirty(true);}
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
 for(const hit of ray.intersectObjects([...assetLayer.children,...(gameGroup.visible?Object.values(nativeTargets).filter(o=>o&&o.visible):[])],true)){
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
 const names={raise:'抬高',lower:'降低',flatten:'平整',water:'挖水域',sand:'沙地',grass:'草地',rock:'岩地',select:'选择',outline:'绘制岛屿轮廓'};
 $('tool-name').textContent=names[t]||('放置 '+t.replace('asset:',''));
 const selectedAsset=t.startsWith('asset:')?t.slice(6):'';
 $('selected-asset').textContent=selectedAsset?(catalog.all[selectedAsset]?.label||selectedAsset):'无';
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
 if(activeTool==='outline'){if(outlinePoints.length>=256){toast('最多256个轮廓点');return;}
  outlinePoints.push([clamp(p.x,-WIDTH/2,WIDTH/2),clamp(p.z,-DEPTH/2,DEPTH/2)]);previewOutline();return;}
 if(activeTool==='select'){
  selected=findSelected(e);updateInspector();
  if(selected){history();draggingObj=true;renderer.domElement.setPointerCapture(e.pointerId);}
  return;
 }
 if(activeTool.startsWith('asset:')){
  const asset=activeTool.slice(6);
  history();const o={id:uid(),asset,name:catalog.all[asset]?.label||asset,x:clamp(p.x,-WIDTH/2,WIDTH/2),
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
 if(draggingObj&&currentRecord()){
   const native=selected.startsWith('native:');
   const o=native?nativeEdit(selected.slice(7)):objects.get(selected);
   o.x=clamp(p.x,-WIDTH/2,WIDTH/2);o.z=clamp(p.z,-DEPTH/2,DEPTH/2);
   if(native)applyNativeEdits(world,gameGroup);
   else{
    const g=assetLayer.children.find(x=>x.userData.mapId===selected);
    if(g)g.position.set(o.x,terrainY(o.x,o.z),o.z);
   }
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
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{
 if(b.dataset.tool!=='outline')resetOutline();setTool(b.dataset.tool);
});
document.getElementById('finish-region').onclick=finishOutline;
document.getElementById('cancel-region').onclick=()=>{resetOutline();toast('已取消轮廓');};
document.getElementById('terrain-height').oninput=e=>document.getElementById('terrain-height-val').textContent=e.target.value;
$('expand-sea-50').onclick=()=>expandOcean(1.5);
$('expand-sea-100').onclick=()=>expandOcean(2);
$('frame-world').onclick=frameWholeMap;
$('toggle-original').onclick=()=>{
 gameGroup.visible=!gameGroup.visible;
 $('toggle-original').textContent=gameGroup.visible?'隐藏原版岛屿':'显示原版岛屿';
 $('toggle-original').setAttribute('aria-pressed',String(gameGroup.visible));
 selected=null;updateInspector();toast(gameGroup.visible?'已显示完整 V35 原版岛屿':'仅暂时隐藏原版岛屿，未删除模型');
};
function renderAssetLibrary(){
 const query=$('asset-search').value.trim().toLowerCase();
 const group=$('asset-filter').value;
 const found=catalog.types.filter(id=>{
  const entry=catalog.all[id]||{};
  return (group==='complete'?entry.kind!=='detail':group==='parts'?entry.kind==='detail':!group||((entry.category||'完整元件')===group))&&
   (!query||(entry.label||id).toLowerCase().includes(query)||id.includes(query));
 });
 const box=$('assets');box.replaceChildren();
 // Large scenes stay usable: show the first 120, allow searching/filtering
 // to reach every mesh; no assets are omitted from the registry.
 for(const id of found){
  const o=catalog.all[id];const btn=document.createElement('button');
  btn.type='button';btn.dataset.asset=id;btn.title=o.label;
  const title=document.createElement('span');
  title.textContent=id.startsWith('part_')?'◈':'⬡';
  const label=document.createTextNode(o.label);
  btn.append(title,label);btn.onclick=()=>setTool('asset:'+id);box.append(btn);
 }
  $('asset-result').textContent=found.length+' 个可复用模型 / 原版素材共 '+catalog.types.length+' 项';
}
const categories=[...new Set(catalog.types.map(id=>catalog.all[id]?.category||'整组模型'))];
for(const c of categories){
 const option=document.createElement('option');option.value=c;option.textContent=c;
 $('asset-filter').append(option);
}
$('asset-search').addEventListener('input',renderAssetLibrary);
$('asset-filter').addEventListener('change',renderAssetLibrary);
renderAssetLibrary();
$('brush').oninput=e=>{brush=+e.target.value;$('brush-val').textContent=brush;};
$('strength').oninput=e=>{strength=+e.target.value;$('strength-val').textContent=strength;};
$('undo').onclick=()=>applyHistory('undo');$('redo').onclick=()=>applyHistory('redo');
$('duplicate').onclick=()=>{
 if(!selected)return;
 const r=currentRecord();if(!r)return;history();
 const obj={...r,id:uid(),asset:r.asset,name:r.name+' 复制',
  x:clamp(r.x+3,-WIDTH/2,WIDTH/2),z:clamp(r.z+3,-DEPTH/2,DEPTH/2)};
 delete obj.hidden;
 world.objects.push(obj);selected=obj.id;rebuildObjects();setDirty(true);saveLocal();
};
$('delete').onclick=()=>{
 if(!selected)return;history();
 if(selected.startsWith('native:')){
  nativeEdit(selected.slice(7)).hidden=true;
  applyNativeEdits(world,gameGroup);
 }else{
  world.objects=world.objects.filter(x=>x.id!==selected);
  selected=null;rebuildObjects();
 }
 updateInspector();setDirty(true);saveLocal();
};
$('restore-native').onclick=()=>{
 if(!selected?.startsWith('native:'))return;history();
 delete world.baseEdits[selected.slice(7)];
 applyNativeEdits(world,gameGroup);updateInspector();setDirty(true);saveLocal();
};
$('selected-name').onchange=e=>mutateSelected(o=>o.name=e.target.value.slice(0,90));
for(const field of ['posx','posz'])$(field).onchange=e=>mutateSelected(o=>o[field==='posx'?'x':'z']=clamp(Number(e.target.value)||0,field==='posx'?-WIDTH/2:-DEPTH/2,field==='posx'?WIDTH/2:DEPTH/2));
$('rot').onchange=e=>mutateSelected(o=>o.rotation=+e.target.value);
$('rot').oninput=e=>$('rot-val').textContent=e.target.value+'°';
$('scale').onchange=e=>mutateSelected(o=>o.scale=+e.target.value);
$('scale').oninput=e=>$('scale-val').textContent=(+e.target.value).toFixed(1);
$('new-world').onclick=()=>{if(!confirm('清空新增地形与模型？原游戏岛屿和原始物件保持不变；建议先导出 JSON。'))return;history();world=emptyMap({width:WIDTH,depth:DEPTH,grid:[GW,GH]});selected=null;redraw();saveLocal();toast('已清空新增内容，保留画布大小和原版岛屿');};
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
function resetCamera(){camera.position.set(40,38,46);camera.lookAt(0,0,0);controls.target.set(0,0,0);controls.update();}
$('reset-view').onclick=resetCamera;
$('camera').onclick=()=>{
 isTop=!isTop;
 camera.position.set(isTop?.01:40,isTop?76:38,isTop?.01:46);
 camera.up.set(0,1,0);controls.target.set(0,0,0);controls.update();
 $('camera').textContent=isTop?'切换透视':'切换俯视';
};
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();applyHistory(e.shiftKey?'redo':'undo');}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();applyHistory('redo');}
 if(e.key==='Delete'&&selected)$('delete').click();
 if(e.key==='Escape'){resetOutline();selected=null;updateInspector();}
 if(e.key==='Enter'&&activeTool==='outline')finishOutline();
});
function fit(){
 const w=view.clientWidth,h=view.clientHeight;if(w<10||h<10)return;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
new ResizeObserver(fit).observe(view);fit();
try{const current=readPreviewMap(),old=localStorage.getItem('dnd-lighthouse-map-editor-v1');
 world=current?validWorld(current):old?validWorld(JSON.parse(old)):emptyMap();}
catch(err){world=emptyMap();console.warn('Map recovery fallback',err);}
syncWorldDimensions();rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);setDirty(false);setTool('select');
window.__lighthouseEditor={
 getState:()=>({schema:world.schema,size:[WIDTH,DEPTH],grid:[GW,GH],objects:world.objects.length,expandable:true,
 heights:world.heights.length,regions:world.regions?.length||0,tool:activeTool,selected,history:hist.length,
 realGameAssets:true,originalIslandVisible:gameGroup.visible,nativeObjectCount:Object.keys(nativeTargets).length,prefabTypes:catalog.types,assetCount:catalog.types.length,sharedStoreKey:SHARED_MAP_KEY,rendered:!!renderer.domElement}),
 paintAt:(x,z,tool='raise')=>{setTool(tool);history();paint(x,z);return world.heights[getCellAt(x,z)?.index??0];},
 placeAt:(asset,x,z)=>{if(!catalog.types.includes(asset))return false;
  history();world.objects.push({id:uid(),asset,name:asset,x,z,rotation:0,scale:1});rebuildObjects();saveLocal();return true;},
 exportMap:()=>JSON.parse(snapshot()),importMap:w=>{history();world=validWorld(w);redraw();saveLocal();},
 selectNative:id=>{if(!BASE_ASSETS[id])return false;selected='native:'+id;updateInspector();return true;},
 editNative:(id,change)=>{
  if(!BASE_ASSETS[id])return false;history();
  Object.assign(nativeEdit(id),change);applyNativeEdits(world,gameGroup);
  setDirty(true);saveLocal();return true;
 },
 getCatalog:()=>catalog.types.map(id=>({id,name:catalog.all[id].label})),
 getGameNative:()=>Object.fromEntries(Object.entries(nativeTargets).map(([id,o])=>
 [id,o?{x:o.position.x,z:o.position.z,visible:o.visible}:null]))
};
renderer.setAnimationLoop(()=>{
 controls.update();let selectedGroup=selected?assetLayer.children.find(g=>g.userData.mapId===selected):null;
 if(!selectedGroup&&selected?.startsWith('native:')&&gameGroup.visible)selectedGroup=nativeTargets[selected.slice(7)];
 if(selectedGroup&&selectedGroup.visible){selectedGroup.updateWorldMatrix(true,true);selectionBounds.setFromObject(selectedGroup);selectionHelper.visible=!selectionBounds.isEmpty();}
 else selectionHelper.visible=false;
 renderer.render(scene,camera);
});
document.body.dataset.editorReady='true';
