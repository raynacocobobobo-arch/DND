import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id),view=$('view');
const GW=64,GH=56,WIDTH=146,DEPTH=129,CELLX=WIDTH/GW,CELLZ=DEPTH/GH;
const SEA=0, minH=-3,maxH=9,storeKey='dnd-lighthouse-map-editor-v1';
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
const root=new T.Group();scene.add(root);
const ocean=new T.Mesh(new T.PlaneGeometry(WIDTH+1,DEPTH+1),new T.MeshStandardMaterial({color:0x2b849b,roughness:.58,metalness:.05,transparent:true,opacity:.77,depthWrite:false,side:T.DoubleSide}));
ocean.rotation.x=-Math.PI/2;ocean.position.y=SEA+.018;root.add(ocean);
const bed=new T.Mesh(new T.BoxGeometry(WIDTH+1,.28,DEPTH+1),new T.MeshStandardMaterial({color:0x2c4c54,roughness:1}));
bed.position.y=-3.3;root.add(bed);
const frame=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(WIDTH+.8,3.9,DEPTH+.8)),new T.LineBasicMaterial({color:0x90c8cd,transparent:true,opacity:.30}));
frame.position.y=-1.55;root.add(frame);
let terrain=null,assetLayer=new T.Group();root.add(assetLayer);
const cursorMat=new T.MeshBasicMaterial({color:0xe9e5ba,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide});
const cursor=new T.Mesh(new T.RingGeometry(.86,1.0,40),cursorMat);cursor.rotation.x=-Math.PI/2;cursor.visible=false;root.add(cursor);
const nodeMeshes=()=>assetLayer.children.filter(m=>m.userData.recordId);
function uid(){return 'obj-'+Math.random().toString(36).slice(2,10);}
function initial(){
 const w=empty();
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
  {id:uid(),asset:'lighthouse',name:'起始灯塔',x:-25,z:5,rotation:0,scale:1},
  {id:uid(),asset:'hut',name:'渔夫木屋',x:-16,z:9,rotation:55,scale:1},
  {id:uid(),asset:'dock',name:'起始码头',x:-18,z:19,rotation:0,scale:1},
  {id:uid(),asset:'rock',name:'礁石',x:13,z:-26,rotation:31,scale:1.5},
  {id:uid(),asset:'rock',name:'礁石',x:23,z:-32,rotation:70,scale:.9},
  {id:uid(),asset:'tree',name:'松树',x:-29,z:0,rotation:0,scale:1},
  {id:uid(),asset:'fish',name:'近海鱼群区',x:8,z:26,rotation:0,scale:2},
  {id:uid(),asset:'kraken',name:'触手生成区',x:57,z:-11,rotation:0,scale:1.5}
 ];
 return w;
}
function validWorld(w){
 if(!w||w.schema!=='lighthouse-world-v1'||w.grid?.[0]!==GW||w.grid?.[1]!==GH||
 !Array.isArray(w.heights)||w.heights.length!==GW*GH||!Array.isArray(w.types)||w.types.length!==GW*GH||
 !Array.isArray(w.objects)||w.objects.length>3500)throw Error('文件不是兼容的灯塔地图 JSON');
 const assets=['rock','tree','lighthouse','hut','dock','wreck','fish','kraken'];
 return {schema:'lighthouse-world-v1',version:1,width:WIDTH,depth:DEPTH,grid:[GW,GH],
 heights:w.heights.map(v=>clamp(Math.round(Number(v)||0),minH,maxH)),
 types:w.types.map(v=>['water','sand','grass','rock'].includes(v)?v:'water'),
 objects:w.objects.filter(o=>assets.includes(o.asset)).map(o=>({
 id:String(o.id||uid()).slice(0,60),asset:o.asset,name:String(o.name||o.asset).slice(0,90),
 x:clamp(Number(o.x)||0,-WIDTH/2,WIDTH/2),z:clamp(Number(o.z)||0,-DEPTH/2,DEPTH/2),
 rotation:((Number(o.rotation)||0)%360+360)%360,scale:clamp(Number(o.scale)||1,.3,3)
 }))};
}
const snapshot=()=>JSON.stringify(world);
function history(){hist.push(snapshot());if(hist.length>30)hist.shift();future=[];}
function getCellAt(x,z){
 const col=Math.floor((x+WIDTH/2)/CELLX),row=Math.floor((z+DEPTH/2)/CELLZ);
 if(col<0||row<0||col>=GW||row>=GH)return null;
 return {col,row,index:idx(col,row)};
}
function heightAt(x,z){const cell=getCellAt(x,z);return cell?world.heights[cell.index]:-2;}
function terrainY(x,z){return Math.max(SEA+.04,heightAt(x,z)+.07);}
function rebuildTerrain(){
 if(terrain){root.remove(terrain);terrain.geometry.dispose();}
 const v=[],c=[],normal=[],color=new T.Color();
 function pushTri(a,b,d,hex,light=1){
  color.set(hex).multiplyScalar(light);
  const va=new T.Vector3(...a),vb=new T.Vector3(...b),vc=new T.Vector3(...d);
  const n=vb.clone().sub(va).cross(vc.clone().sub(va)).normalize();
  for(const q of [a,b,d]){v.push(...q);c.push(color.r,color.g,color.b);normal.push(n.x,n.y,n.z);}
 }
 function quad(a,b,c,d,mat,l=1){pushTri(a,b,d,mat,l);pushTri(b,c,d,mat,l);}
 for(let z=0;z<GH;z++)for(let x=0;x<GW;x++){
  const k=idx(x,z),h=world.heights[k],type=world.types[k];
  const x0=x*CELLX-WIDTH/2,z0=z*CELLZ-DEPTH/2,x1=x0+CELLX,z1=z0+CELLZ;
  const mat=colors[type]??colors.grass;
  quad([x0,h,z0],[x1,h,z0],[x1,h,z1],[x0,h,z1],mat,.92+.055*Math.sin(x*2.3+z*4.1));
  const faces=[
   {dx:0,dz:-1,points:[[x0,z0],[x1,z0]],shade:.77},
   {dx:1,dz:0,points:[[x1,z0],[x1,z1]],shade:.70},
   {dx:0,dz:1,points:[[x1,z1],[x0,z1]],shade:.81},
   {dx:-1,dz:0,points:[[x0,z1],[x0,z0]],shade:.66}
  ];
  for(const f of faces){
   const nx=x+f.dx,nz=z+f.dz;
   const neighbor=nx<0||nz<0||nx>=GW||nz>=GH?minH:world.heights[idx(nx,nz)];
   if(h<=neighbor)continue;
   const [[ax,az],[bx,bz]]=f.points;
   quad([ax,h,az],[bx,h,bz],[bx,neighbor,bz],[ax,neighbor,az],mat,f.shade);
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));
 geo.setAttribute('color',new T.Float32BufferAttribute(c,3));
 geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));
 terrain=new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
 terrain.name='editable-terrain';root.add(terrain);
 updateObjectsHeight();
}
function standard(hex){return new T.MeshStandardMaterial({color:hex,roughness:.94,flatShading:true});}
const mat={
 stone:standard(0x66777b),stone2:standard(0x899a96),tree:standard(0x416b58),trunk:standard(0x785e45),
 white:standard(0xece2c7),red:standard(0x9f4942),wood:standard(0x8c6d4e),sand:standard(0xb7a789),
 copper:standard(0xd8bb77),wreck:standard(0x59493c),fish:new T.MeshBasicMaterial({color:0x92d9d6,transparent:true,opacity:.75,depthWrite:false,side:T.DoubleSide}),
 kraken:new T.MeshBasicMaterial({color:0xc77d82,transparent:true,opacity:.80,depthWrite:false,side:T.DoubleSide})
};
function part(g,geometry,m,x=0,y=0,z=0){const o=new T.Mesh(geometry,m);o.position.set(x,y,z);g.add(o);return o;}
function objModel(asset){
 const g=new T.Group();
 if(asset==='rock'){
  let a=part(g,new T.DodecahedronGeometry(1.8,0),mat.stone,0,1.4,0);a.scale.set(1,.85,1.1);
  a=part(g,new T.DodecahedronGeometry(.94,0),mat.stone2,1.15,.76,.53);a.scale.set(1,.6,1);
 }else if(asset==='tree'){
  part(g,new T.CylinderGeometry(.25,.34,2,7),mat.trunk,0,1,0);
  for(let i=0;i<3;i++)part(g,new T.ConeGeometry(1.65-i*.25,2.6-i*.38,6),mat.tree,0,2.6+i*.65,0);
 }else if(asset==='lighthouse'){
  part(g,new T.CylinderGeometry(.95,1.38,5.2,8),mat.white,0,2.6,0);
  part(g,new T.CylinderGeometry(1.23,1.23,.72,8),mat.red,0,5.45,0);
  part(g,new T.CylinderGeometry(.88,.88,.7,8),mat.copper,0,5.96,0);
  part(g,new T.ConeGeometry(1.45,1.15,8),mat.red,0,6.85,0);
 }else if(asset==='hut'){
  part(g,new T.BoxGeometry(3,2.15,2.5),mat.wood,0,1.08,0);
  const roof=part(g,new T.ConeGeometry(2.65,1.4,4),mat.red,0,2.75,0);
  roof.rotation.y=Math.PI/4;
 }else if(asset==='dock'){
  part(g,new T.BoxGeometry(2.6,.28,6),mat.wood,0,.7,0);
  for(const x of [-1.1,1.1])for(const z of [-2.6,2.6])part(g,new T.CylinderGeometry(.18,.22,1.8,6),mat.trunk,x,.55,z);
 }else if(asset==='wreck'){
  part(g,new T.BoxGeometry(4.5,1,1.3),mat.wreck,0,.75,0).rotation.z=-.2;
  part(g,new T.CylinderGeometry(.13,.17,5,7),mat.trunk,-.5,2.9,0).rotation.z=.32;
  part(g,new T.ConeGeometry(1.1,2.5,3),mat.white,-.1,3.3,0).rotation.z=.15;
 }else if(asset==='fish'||asset==='kraken'){
  const ring=part(g,new T.RingGeometry(1.1,1.28,40),asset==='fish'?mat.fish:mat.kraken);
  ring.rotation.x=-Math.PI/2;ring.position.y=.18;
  const pole=part(g,new T.CylinderGeometry(.07,.07,1,8),asset==='fish'?mat.fish:mat.kraken,0,.65,0);
  pole.position.y=.55;
  part(g,asset==='fish'?new T.OctahedronGeometry(.3):new T.ConeGeometry(.45,.8,5),asset==='fish'?mat.fish:mat.kraken,0,1.4,0);
 }
 return g;
}
function updateObjectsHeight(){
 for(const g of assetLayer.children){const rec=objects.get(g.userData.recordId);if(rec)g.position.y=terrainY(rec.x,rec.z);}
}
function rebuildObjects(){
 assetLayer.clear();objects.clear();
 for(const r of world.objects){
  const g=objModel(r.asset);g.userData.recordId=r.id;g.name=r.name;
  g.position.set(r.x,terrainY(r.x,r.z),r.z);g.rotation.y=r.rotation*Math.PI/180;g.scale.setScalar(r.scale);
  g.traverse(m=>{if(m.isMesh)m.userData.recordId=r.id;});
  assetLayer.add(g);objects.set(r.id,r);
 }
 if(!selected||!objects.has(selected))selected=null;
 updateInspector();$('object-count').textContent=world.objects.length;
}
function redraw(){rebuildTerrain();rebuildObjects();setDirty(true);}
function setDirty(v){dirty=v;$('dirty').textContent=v?'有未导出修改':'已导出';}
function saveLocal(){try{localStorage.setItem(storeKey,snapshot());}catch(e){console.warn('Local save unavailable',e);}}
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
 const rect=renderer.domElement.getBoundingClientRect();ndc.set((evt.clientX-rect.left)/rect.width*2-1,-(evt.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(ndc,camera);
 const hits=ray.intersectObjects(assetLayer.children,true);
 return hits.find(h=>h.object.userData.recordId)?.object.userData.recordId||null;
}
function setTool(t){
 activeTool=t;document.querySelectorAll('[data-tool],[data-asset]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t||b.dataset.asset&&('asset:'+b.dataset.asset)===t));
 const names={raise:'抬高',lower:'降低',flatten:'平整',water:'挖水域',sand:'沙地',grass:'草地',rock:'岩地',select:'选择'};
 $('tool-name').textContent=names[t]||('放置 '+t.replace('asset:',''));
}
function mutateSelected(fn){
 if(!selected||!objects.has(selected))return;
 history();fn(objects.get(selected));rebuildObjects();setDirty(true);saveLocal();
}
function updateInspector(){
 const r=objects.get(selected);
 $('inspector').hidden=!r;$('none').hidden=!!r;
 if(!r)return;
 $('selected-name').value=r.name;$('posx').value=r.x.toFixed(2);$('posz').value=r.z.toFixed(2);
 $('rot').value=r.rotation;$('rot-val').textContent=Math.round(r.rotation)+'°';
 $('scale').value=r.scale;$('scale-val').textContent=r.scale.toFixed(1);
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
$('new-world').onclick=()=>{if(!confirm('新建海域会替换当前地图，建议先导出 JSON。继续吗？'))return;history();world=empty();selected=null;redraw();saveLocal();toast('已新建空白海域');};
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
$('autosave').onclick=()=>{saveLocal();toast('已保存到当前浏览器');};
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
try{const old=localStorage.getItem(storeKey);world=old?validWorld(JSON.parse(old)):initial();}
catch(err){world=initial();console.warn('Map recovery fallback',err);}
rebuildTerrain();rebuildObjects();setDirty(false);setTool('raise');
window.__lighthouseEditor={
 getState:()=>({schema:world.schema,size:[WIDTH,DEPTH],grid:[GW,GH],objects:world.objects.length,
  heights:world.heights.length,tool:activeTool,selected,history:hist.length,daylight:true,rendered:!!renderer.domElement}),
 paintAt:(x,z,tool='raise')=>{setTool(tool);history();paint(x,z);return world.heights[getCellAt(x,z)?.index??0];},
 placeAt:(asset,x,z)=>{const valid=['rock','tree','lighthouse','hut','dock','wreck','fish','kraken'];if(!valid.includes(asset))return false;
  history();world.objects.push({id:uid(),asset,name:asset,x,z,rotation:0,scale:1});rebuildObjects();saveLocal();return true;},
 exportMap:()=>JSON.parse(snapshot()),importMap:w=>{history();world=validWorld(w);redraw();saveLocal();}
};
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
document.body.dataset.editorReady='true';
