import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {registerLegacyHarborPrefabs} from './legacy-harbor-assets.js?v=1a';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {group as gameGroup,buildCutaway,buildIsland,setRenderer} from '../lighthouse/v27-world.js?v=27a';
import {buildSite} from '../lighthouse/v35-site.js?v=35a';
import {createOffshoreReefs} from '../lighthouse/v35-reefs.js?v=35a';
import {SHARED_MAP_KEY,emptyMap,normalizeMap,readPreviewMap,savePreviewMap,
 nativePrefabCatalog,createTerrainMesh,addOpenOcean,createEditorOceanGeometry,applyNativeEdits,MAX_EDITOR_GRID,
 BASE_ASSETS,nativeGameTargets,SEA as GAME_SEA,groundY as gameGroundY} from '../lighthouse/shared-map.js?v=41a';
const $=id=>document.getElementById(id),view=$('view');
let GW=64,GH=56,WIDTH=146,DEPTH=129,CELLX=WIDTH/GW,CELLZ=DEPTH/GH;
const SEA=GAME_SEA,minH=-3,maxH=9,storeKey=SHARED_MAP_KEY;
const BASE_CELL_X=146/64,BASE_CELL_Z=129/56,MIN_WIDTH=34,MIN_DEPTH=30,MAX_SIZE=430;
const colors={water:0x276476,sand:0xc6b78a,grass:0x71866d,rock:0x71858c};
let world,activeTool='select',brush=2,strength=1,selected=null,selectedIds=new Set(),hover=null,stroke=false,lastStroke='',hist=[],future=[],dirty=false,isTop=false,objects=new Map(),renderObjectMeshes=[];
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
const transform=new TransformControls(camera,renderer.domElement);
const transformProxy=new T.Object3D();scene.add(transformProxy);scene.add(transform);
transform.setSize(.82);transform.setMode('translate');
let transformMode='translate',syncingProxy=false,transformLast=new T.Vector2(),dragHistoryTaken=false;
setRenderer(renderer);renderer.localClippingEnabled=true;
scene.add(gameGroup);
const originalSea=buildCutaway();buildIsland();buildSite();const originalReefs=createOffshoreReefs();
originalSea.userData.setBlend(1);
for(const child of gameGroup.children)
 if(child.userData.waterSidewall||['sea-geological-base','sea-soil-stratum','opaque-sea-cross-section'].includes(child.name))
  child.visible=false;
const catalog=nativePrefabCatalog(gameGroup,originalReefs.root);
const legacyHarborAssets=registerLegacyHarborPrefabs(catalog);
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
 history();world=result;resetOutline();selected=null;redraw();saveLocal();
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
  g.position.set(r.x,terrainY(r.x,r.z),r.z);g.rotation.y=r.rotation*Math.PI/180;g.scale.setScalar(r.scale);g.visible=!r.hidden;
  g.traverse(m=>{if(m.isMesh)m.userData.recordId=r.id;});
  assetLayer.add(g);objects.set(r.id,r);
 }
 if(!selected||(!objects.has(selected)&&!selected.startsWith('native:')))selected=null;
 selectedIds=new Set([...selectedIds].filter(id=>id.startsWith('native:')||objects.has(id)));
 if(selected&&!selectedIds.has(selected))selectedIds.add(selected);
 updateInspector();$('object-count').textContent=world.objects.length+' 新增 / '+Object.keys(nativeTargets).length+' 原版';
}
function redraw(){syncWorldDimensions();rebuildTerrain();rebuildObjects();applyNativeEdits(world,gameGroup);setDirty(true);}
function setDirty(v){dirty=v;$('dirty').textContent=v?'有未导出修改':'已导出';}
function saveLocal(){try{savePreviewMap(world)}catch(e){console.warn('Local save unavailable',e);}}
function applyHistory(direction){
 const from=direction==='undo'?hist:future,to=direction==='undo'?future:hist;
 if(!from.length)return;
 to.push(snapshot());world=validWorld(JSON.parse(from.pop()));selected=null;selectedIds.clear();redraw();saveLocal();toast(direction==='undo'?'已撤销':'已重做');
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
  return {id,asset:key,name:base.name,x:r.x??base.x,z:r.z??base.z,
   rotation:r.rotation??0,scale:r.scale??1,hidden:r.hidden??false,locked:r.locked??false};
 }
 return objects.get(id)||null;
}
function currentRecord(){return recordById(selected);}
function actualRecord(id){
 return id.startsWith('native:')?nativeEdit(id.slice(7)):objects.get(id);
}
function isLocked(id){return !!recordById(id)?.locked;}
function selectItem(id,multi=false){
 if(!multi)selectedIds.clear();
 if(id){
  if(multi&&selectedIds.has(id))selectedIds.delete(id);
  else selectedIds.add(id);
 }
 selected=[...selectedIds].at(-1)||null;
 updateInspector();
}
function nativeEdit(id){
 world.baseEdits??={};
 return world.baseEdits[id]??={x:BASE_ASSETS[id].x,z:BASE_ASSETS[id].z,
  rotation:0,scale:1,hidden:false,locked:false};
}
function setTool(t){
 activeTool=t;document.querySelectorAll('[data-tool],[data-asset]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t||b.dataset.asset&&('asset:'+b.dataset.asset)===t));
 const names={raise:'抬高',lower:'降低',flatten:'平整',water:'挖水域',sand:'沙地',grass:'草地',rock:'岩地',select:'选择',outline:'绘制岛屿轮廓'};
 $('tool-name').textContent=names[t]||('放置 '+t.replace('asset:',''));
 const selectedAsset=t.startsWith('asset:')?t.slice(6):'';
 $('selected-asset').textContent=selectedAsset?(catalog.all[selectedAsset]?.label||selectedAsset):'无';
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
 $('inspector').hidden=!r;$('none').hidden=!!r;
 if(r){
  const native=selected.startsWith('native:'),locked=!!r.locked;
  $('multi-hint').hidden=!multi;
  $('multi-hint').textContent=multi?'已选 '+selectedIds.size+' 项；可整体移动，旋转或缩放请先单选。':'';
  $('selected-name').value=r.name;$('selected-name').disabled=native||locked||multi;
  $('posx').value=r.x.toFixed(2);$('posz').value=r.z.toFixed(2);
  $('rot').value=r.rotation;$('rot-val').textContent=Math.round(r.rotation)+'°';
  $('scale').value=r.scale;$('scale-val').textContent=r.scale.toFixed(1);
  for(const field of ['posx','posz','rot','scale'])$(field).disabled=locked||multi;
  $('delete').textContent=multi?'删除 / 隐藏选中 '+selectedIds.size+' 项':native?'隐藏原版模型':'删除';
  $('duplicate').disabled=locked||multi;
  $('restore-native').hidden=!native;
 }
 renderSceneObjects();syncTransform();
}
function renderSceneObjects(){
 if(!world)return;
 const box=$('scene-list'),scroll=box.scrollTop,q=$('scene-search').value.trim().toLowerCase();
 const groups=[['原版游戏物件',Object.keys(nativeTargets).map(id=>'native:'+id)],
  ['新增地图物件',world.objects.map(o=>o.id)]];
 const fragment=document.createDocumentFragment();
 let found=0,hidden=0;
 for(const [heading,ids] of groups){
  const entries=ids.map(id=>({id,r:recordById(id)})).filter(e=>e.r);
  hidden+=entries.filter(e=>e.r.hidden).length;
  const shown=entries.filter(({id,r})=>!q||r.name.toLowerCase().includes(q)||id.toLowerCase().includes(q));
  if(!shown.length)continue;
  const h=document.createElement('div');h.className='scene-heading';h.textContent=heading+' · '+shown.length;fragment.append(h);
  for(const {id,r} of shown){
   found++;
   const row=document.createElement('div');row.className='scene-row'+(selectedIds.has(id)?' selected':'')+(r.hidden?' hidden-item':'')+(r.locked?' locked-item':'');
   const name=document.createElement('button');name.type='button';name.className='scene-pick';
   name.textContent=r.name;name.title=id+' · X '+r.x.toFixed(1)+' · Z '+r.z.toFixed(1);
   name.onclick=e=>selectItem(id,e.shiftKey);row.append(name);
   for(const [flag,value,label] of [['hidden',r.hidden?'◌':'◉',r.hidden?'显示':'隐藏'],['locked',r.locked?'▣':'▢',r.locked?'解锁':'锁定']]){
    const button=document.createElement('button');button.type='button';button.className='scene-action';
    button.textContent=value;button.title=label+' '+r.name;button.setAttribute('aria-label',label+' '+r.name);
    button.onclick=e=>{e.stopPropagation();changeFlags([id],flag,!r[flag]);};
    row.append(button);
   }
   fragment.append(row);
  }
 }
 box.replaceChildren(fragment);box.scrollTop=scroll;
 $('scene-count').textContent=Object.keys(nativeTargets).length+' 原版 / '+world.objects.length+' 新增 / '+hidden+' 隐藏'+(q?' · 匹配 '+found:'');
}
function changeFlags(ids,flag,value){
 const valid=[...new Set(ids)].filter(id=>recordById(id));if(!valid.length)return;
 history();
 for(const id of valid){
  const r=actualRecord(id);r[flag]=value;
  if(!id.startsWith('native:')&&flag==='hidden'){
   const mesh=assetLayer.children.find(o=>o.userData.mapId===id);
   if(mesh)mesh.visible=!value;
  }
 }
 applyNativeEdits(world,gameGroup);updateInspector();setDirty(true);saveLocal();
}
for(const [id,flag,value] of [['scene-hide','hidden',true],['scene-show','hidden',false],
 ['scene-lock','locked',true],['scene-unlock','locked',false]])
 $(id).onclick=()=>changeFlags([...selectedIds],flag,value);
$('scene-search').addEventListener('input',renderSceneObjects);
function syncTransform(){
 if(!world||syncingProxy||transform.dragging)return;
 const selectedEntries=[...selectedIds].map(id=>({id,r:recordById(id)}))
  .filter(({r})=>r&&!r.locked&&!r.hidden);
 transform.detach();
 if(!selectedEntries.length)return;
 const mode=selectedEntries.length>1?'translate':transformMode;
 transform.setMode(mode);
 transform.showX=mode!=='rotate';transform.showY=mode!=='translate';transform.showZ=mode!=='rotate';
 transformProxy.position.set(selectedEntries.reduce((n,e)=>n+e.r.x,0)/selectedEntries.length,
  SEA+1.25,selectedEntries.reduce((n,e)=>n+e.r.z,0)/selectedEntries.length);
 transformProxy.rotation.set(0,selectedEntries.length===1?selectedEntries[0].r.rotation*Math.PI/180:0,0);
 transformProxy.scale.setScalar(selectedEntries.length===1?selectedEntries[0].r.scale:1);
 transformLast.set(transformProxy.position.x,transformProxy.position.z);transform.attach(transformProxy);
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
transform.addEventListener('dragging-changed',e=>{controls.enabled=!e.value;});
transform.addEventListener('mouseDown',()=>{if(selectedIds.size)history();});
transform.addEventListener('objectChange',()=>{
 if(syncingProxy||!world)return;
 syncingProxy=true;
 const entries=[...selectedIds].map(id=>({id,r:recordById(id)})).filter(({r})=>r&&!r.hidden&&!r.locked);
 if(entries.length){
  const mode=entries.length>1?'translate':transformMode;
  if(mode==='translate'){
   const dx=transformProxy.position.x-transformLast.x,dz=transformProxy.position.z-transformLast.y;
   for(const {id} of entries){const r=actualRecord(id);r.x=clamp(r.x+dx,-WIDTH/2,WIDTH/2);r.z=clamp(r.z+dz,-DEPTH/2,DEPTH/2);}
   transformLast.set(transformProxy.position.x,transformProxy.position.z);
  }else if(entries.length===1){
   const r=actualRecord(entries[0].id);
   if(mode==='rotate')r.rotation=((T.MathUtils.radToDeg(transformProxy.rotation.y)%360)+360)%360;
   if(mode==='scale'){r.scale=clamp(transformProxy.scale.x,.3,3);transformProxy.scale.setScalar(r.scale);}
  }
  let nativeChanged=false;
  for(const {id} of entries){
   if(id.startsWith('native:')){nativeChanged=true;continue;}
   const r=objects.get(id),mesh=assetLayer.children.find(o=>o.userData.mapId===id);
   if(r&&mesh){mesh.position.set(r.x,terrainY(r.x,r.z),r.z);
    mesh.rotation.y=r.rotation*Math.PI/180;mesh.scale.setScalar(r.scale);}
  }
  if(nativeChanged)applyNativeEdits(world,gameGroup);
  const r=currentRecord();if(r){$('posx').value=r.x.toFixed(2);$('posz').value=r.z.toFixed(2);
   $('rot').value=Math.round(r.rotation);$('rot-val').textContent=Math.round(r.rotation)+'°';
   $('scale').value=r.scale;$('scale-val').textContent=r.scale.toFixed(1);}
  setDirty(true);
 }
 syncingProxy=false;
});
transform.addEventListener('mouseUp',()=>{saveLocal();renderSceneObjects();syncTransform();});
let draggingObj=false;
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 const p=pointAt(e);if(!p)return;
 if(activeTool==='outline'){if(outlinePoints.length>=256){toast('最多256个轮廓点');return;}
  outlinePoints.push([clamp(p.x,-WIDTH/2,WIDTH/2),clamp(p.z,-DEPTH/2,DEPTH/2)]);previewOutline();return;}
 if(activeTool==='select'){
  if(transform.dragging||transform.axis)return;
  const hit=findSelected(e),multi=e.shiftKey;
  selectItem(hit,multi);
  if(hit&&!multi&&!isLocked(hit)&&!recordById(hit)?.hidden){
   draggingObj=true;dragHistoryTaken=false;renderer.domElement.setPointerCapture(e.pointerId);
  }
  return;
 }
 if(activeTool.startsWith('asset:')){
  const asset=activeTool.slice(6);
  history();const o={id:uid(),asset,name:catalog.all[asset]?.label||asset,x:clamp(p.x,-WIDTH/2,WIDTH/2),
   z:clamp(p.z,-DEPTH/2,DEPTH/2),rotation:0,scale:1};
  world.objects.push(o);selected=o.id;selectedIds=new Set([o.id]);rebuildObjects();setTool('select');setDirty(true);saveLocal();toast('已放置 '+asset);return;
 }
 history();stroke=true;lastStroke='';
 renderer.domElement.setPointerCapture(e.pointerId);
 paint(p.x,p.z);
},{passive:true});
renderer.domElement.addEventListener('pointermove',e=>{
 const p=pointAt(e);if(!p)return;
 $('cursor').textContent=p.x.toFixed(1)+' / '+p.z.toFixed(1);
 cursor.visible=true;cursor.position.set(p.x,terrainY(p.x,p.z)+.11,p.z);cursor.scale.setScalar(Math.max(.6,brush)*CELLX);
 if(draggingObj&&currentRecord()&&!isLocked(selected)){
   const native=selected.startsWith('native:');
   const o=native?nativeEdit(selected.slice(7)):objects.get(selected);
   const nx=clamp(p.x,-WIDTH/2,WIDTH/2),nz=clamp(p.z,-DEPTH/2,DEPTH/2);
   if(!dragHistoryTaken&&(Math.abs(nx-o.x)+Math.abs(nz-o.z))>.02){history();dragHistoryTaken=true;}
   if(!dragHistoryTaken)return;
   o.x=nx;o.z=nz;
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
 if(draggingObj){renderSceneObjects();syncTransform();}
 draggingObj=false;dragHistoryTaken=false;stroke=false;lastStroke='';
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
$('apply-map-size').onclick=()=>resizeMapTo($('map-width').value,$('map-depth').value);
for(const id of ['map-width','map-depth'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){$('apply-map-size').click();e.preventDefault();}});
$('frame-world').onclick=frameWholeMap;
$('toggle-original').onclick=()=>{
 gameGroup.visible=!gameGroup.visible;
 $('toggle-original').textContent=gameGroup.visible?'隐藏原版岛屿':'显示原版岛屿';
 $('toggle-original').setAttribute('aria-pressed',String(gameGroup.visible));
 selected=null;updateInspector();toast(gameGroup.visible?'已显示完整 V35 原版岛屿':'仅暂时隐藏原版岛屿，未删除模型');
};
// Human-readable asset families; meshes under 'parts' retain authored type names.
function assetCategory(id,meta={}){
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
 const order=['灯塔与建筑','树木与植被','礁石与海岸','船只','码头与栈道','营地与道具','海怪与事件'];
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
   btn.onclick=()=>{setTool('asset:'+id);document.querySelectorAll('.asset-card')
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
$('open-game').onclick=()=>{saveLocal();window.open('../lighthouse/','_blank','noopener');};
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
 getState:()=>({schema:world.schema,size:[WIDTH,DEPTH],grid:[GW,GH],objects:world.objects.length,resizeBounds:[MIN_WIDTH,MIN_DEPTH,MAX_SIZE],expandable:true,
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
 getCatalog:()=>catalog.types.map(id=>({id,name:catalog.all[id].label,category:assetCategory(id,catalog.all[id])})),
 resizeMap:(width,depth)=>resizeMapTo(width,depth),
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
