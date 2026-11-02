import * as T from 'three';
import {createKraken} from './v34-tentacle.js?v=34a';
import {createPirateShip} from './v27-pirate.js?v=27a';

// One schema / one material and prefab source for BOTH pages.
// Stored on the same GitHub Pages origin, hence same-browser preview works.
export const SHARED_MAP_KEY='dnd-lighthouse-world-map-v2';
export const WORLD_SCHEMA='lighthouse-world-v2';
export const GW=64,GH=56,WIDTH=146,DEPTH=129,SEA=.1815;
const ASSETS={
 shore_rock:{label:'岸边原版礁石',radius:.95},
 pine:{label:'原版松树',radius:.75},
 lighthouse:{label:'原版灯塔',radius:1.4},
 boathouse:{label:'原版红色木屋与平台',radius:3.3},
 barrel:{label:'原版木桶',radius:.38},
 campfire:{label:'原版营火',radius:.8},
 service_boat:{label:'原版小船',radius:1.3},
 offshore_reef:{label:'原版外海礁石',radius:1.8},
 pine_forest:{label:'整组松林',radius:6},
 shore_rocks:{label:'整组原版岸礁',radius:7},
 coastal_flora:{label:'整组海岸植被',radius:6},
 supply_barrels:{label:'整组补给木桶',radius:2},
 pirate_ship:{label:'原版双桅海盗船（完整）',radius:3},
 kraken_variant_0:{label:'原版触手 · 回卷型（完整）',radius:2},
 kraken_variant_1:{label:'原版触手 · 桥拱型（完整）',radius:2},
 kraken_variant_2:{label:'原版触手 · 短钩型（完整）',radius:2},
 kraken_variant_3:{label:'原版触手 · S曲线型（完整）',radius:2}
};
export const ASSET_TYPES=Object.keys(ASSETS);
const former={rock:'shore_rock',tree:'pine',hut:'boathouse',dock:'boathouse'};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function emptyMap(){
 return {schema:WORLD_SCHEMA,version:2,width:WIDTH,depth:DEPTH,grid:[GW,GH],
 heights:Array(GW*GH).fill(-3),types:Array(GW*GH).fill('water'),objects:[],baseEdits:{},regions:[]};
}
export function normalizeMap(v){
 if(!v||!Array.isArray(v.heights)||v.heights.length!==GW*GH||
  !Array.isArray(v.types)||v.types.length!==GW*GH||
  !Array.isArray(v.objects)||v.objects.length>1000||
  !['lighthouse-world-v1',WORLD_SCHEMA].includes(v.schema))
  throw Error('不兼容的地图：请使用地图编辑器导出的世界 JSON');
 const w=emptyMap();
 w.heights=v.heights.map(t=>clamp(Math.round(Number(t)||0),-3,9));
 w.types=v.types.map(t=>['water','sand','grass','rock'].includes(t)?t:'water');
 w.baseEdits={};
 if(v.baseEdits&&typeof v.baseEdits==='object'){
  for(const id of ['lighthouse','boathouse']){
   const rec=v.baseEdits[id];if(!rec)continue;
   w.baseEdits[id]={
    x:clamp(Number(rec.x)||0,-WIDTH/2,WIDTH/2),
    z:clamp(Number(rec.z)||0,-DEPTH/2,DEPTH/2),
    rotation:((Number(rec.rotation)||0)%360+360)%360,
    scale:clamp(Number(rec.scale)||1,.3,3),
    hidden:!!rec.hidden
   };
  }
 }
 // Region outlines preserve the designer intent for later terrain-model generation.
 w.regions=Array.isArray(v.regions)?v.regions.slice(0,128).map((r,i)=>({
  id:String(r.id||'region-'+i).slice(0,60),
  height:clamp(Math.round(Number(r.height)||1),1,9),
  material:['sand','grass','rock'].includes(r.material)?r.material:'grass',
  points:Array.isArray(r.points)?r.points.slice(0,256).filter(p=>Array.isArray(p)&&p.length===2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])).map(p=>[clamp(+p[0],-WIDTH/2,WIDTH/2),clamp(+p[1],-DEPTH/2,DEPTH/2)]):[]
 })).filter(r=>r.points.length>=3):[];
 const seen=new Set();
 w.objects=v.objects.map((obj,i)=>{
  const asset=former[obj.asset]||obj.asset;
  if(!ASSETS[asset]&&!/^part_[0-9]{5}$/.test(asset)&&! /^(pine_tree|barrel_single|reef_single)_[0-9]+$/.test(asset))return null;
  const id=String(obj.id||'item-'+i).slice(0,60);
  if(seen.has(id))return null;
  seen.add(id);
  return {id,asset,name:String(obj.name||ASSETS[asset]?.label||asset).slice(0,90),
   x:clamp(Number(obj.x)||0,-WIDTH/2,WIDTH/2),
   z:clamp(Number(obj.z)||0,-DEPTH/2,DEPTH/2),
   rotation:((Number(obj.rotation)||0)%360+360)%360,
   scale:clamp(Number(obj.scale)||1,.3,3)};
 }).filter(Boolean);
 return w;
}
export function getHeight(w,x,z){
 const i=Math.floor((x+WIDTH/2)/(WIDTH/GW)),j=Math.floor((z+DEPTH/2)/(DEPTH/GH));
 if(i<0||j<0||i>=GW||j>=GH)return -3;
 return w.heights[j*GW+i];
}
export function groundY(w,x,z){
 return Math.max(SEA+.035,getHeight(w,x,z)+.035);
}
export function hasGameLand(w,x,z){return getHeight(w,x,z)>0;}
export function nativePrefabCatalog(group,reefRoot){
 const rockRoots=group.getObjectByName('game-asset-shore-rocks');
 const forest=group.getObjectByName('game-asset-pine-forest');
 const barrels=group.getObjectByName('game-asset-supply-barrels');
 const candidates={
  shore_rock:{node:rockRoots?.children.find(o=>o.isMesh),anchor:null},
  pine:{node:forest?.getObjectByName('game-asset-tree-0'),anchor:[-4.75,0,-1.64]},
  lighthouse:{node:group.getObjectByName('game-asset-lighthouse'),anchor:[.82,0,-2.38]},
  boathouse:{node:group.getObjectByName('game-asset-boathouse'),anchor:[-3.48,0,.88]},
  barrel:{node:barrels?.getObjectByName('game-asset-barrel-0'),anchor:[-.58,0,.17]},
  campfire:{node:group.getObjectByName('game-asset-campfire'),anchor:[1.80,0,1.70]},
  service_boat:{node:group.getObjectByName('serviceBoat'),anchor:[-2.55,.5,5.10]},
  offshore_reef:{node:reefRoot?.getObjectByName('reef-0'),anchor:[-13.3,0,7.7]},
   pine_forest:{node:forest,anchor:[0,0,0]},
   shore_rocks:{node:rockRoots,anchor:[0,0,0]},
   coastal_flora:{node:group.getObjectByName('game-asset-coastal-flora'),anchor:[0,0,0]},
   supply_barrels:{node:barrels,anchor:[0,0,0]}
 };
 const templates=new Map();
 const labels=Object.fromEntries(Object.entries(ASSETS).map(([key,v])=>[key,{...v,category:'完整元件',kind:'complete'}]));
 // Whole assemblies: one tree includes trunk and crowns; a barrel contains all its parts.
 for(const [nodes,prefix,label] of [
  [forest?.children||[],'pine_tree','完整松树'],
  [barrels?.children||[],'barrel_single','完整木桶'],
  [reefRoot?.children||[],'reef_single','完整外海礁石']
 ]){
  nodes.filter(n=>n.type==='Group').forEach((node,i)=>{
   const id=prefix+'_'+i;
   const bounds=new T.Box3().setFromObject(node);
   candidates[id]={node,anchor:[(bounds.min.x+bounds.max.x)/2,0,(bounds.min.z+bounds.max.z)/2]};
   labels[id]={label:label+' '+(i+1),category:'完整元件',kind:'complete'};
  });
 }
 for(const [asset,{node,anchor}] of Object.entries(candidates)){
  if(!node)continue;
  // The source is the actual THREE.Object3D from lighthouse V35 scene.
  const base=node.clone(true), origin=anchor||[node.position.x,0,node.position.z];
  const bbox=new T.Box3().setFromObject(node);
  // Normalize every genuine game model to its bottom contact plane.
  const lowerY=Number.isFinite(bbox.min.y)?bbox.min.y:0;
  const prefab=new T.Group();
  prefab.name='shared-original-'+asset;
  base.position.set(base.position.x-origin[0],base.position.y-lowerY,base.position.z-origin[2]);
  prefab.add(base);
  // Generated clones are not treated as original boat / Kraken UI sources.
  prefab.userData.assetType=asset;
  templates.set(asset,prefab);
 }
 // Discover ALL distinct real scene meshes, not just eight hand-picked
 // prefabs. Stable ordinal IDs follow deterministic build order shared by
 // the game and editor, including the detailed building parts and foliage.
 // Exclude sea, soil, terrain, light sprites, and ocean boundary geometry:
 // those are world infrastructure rather than movable asset instances.
 const skip=new Set(['nearshore-deepwater-vector-sea',
  'opaque-sea-cross-section','sea-geological-base',
  'sea-soil-stratum','flat-vector-coastline-outline']);
 let ordinal=0;
 group.updateMatrixWorld(true);
 group.traverse(o=>{
  if(!o.isMesh||!o.geometry||skip.has(o.name)||o.userData.isWaterVolume||
   o.userData.isWaterSurface||o.userData.waterSidewall||
   o.name.startsWith('water-sidewall')||o.name.startsWith('sea-'))return;
  // The editor and game construct these SAME authored asset families.
  // Dynamic clouds/gulls/ships/tentacles (and water infrastructure) must
  // NOT shift deterministic identifiers between the two processes.
  let ancestor=o.parent,authored=false;
  while(ancestor&&ancestor!==group){
   if(ancestor.name?.startsWith('game-asset-')||
      ancestor.name==='serviceBoat'||
      ancestor===reefRoot){authored=true;break;}
   ancestor=ancestor.parent;
  }
  if(!authored)return;
  const asset='part_'+String(++ordinal).padStart(5,'0');
  const ancestry=[];let parent=o.parent;
  while(parent&&parent!==group){
   if(parent.name?.startsWith('game-asset-')){
    ancestry.unshift(parent.name.slice('game-asset-'.length));break;
   }
   parent=parent.parent;
  }
  const category=ancestry[0]||'场景细节';
  const title=o.name&&o.name!=='Mesh'?o.name:(o.geometry.type.replace('Geometry',''));
  const parentLabel=category==='boathouse'?'木屋与平台':category==='shore-rocks'?'岸边石头':
   category==='pine-forest'?'松林':category==='supply-barrels'?'补给木桶':
   category==='lighthouse'?'灯塔':category==='campfire'?'营火':
   category.startsWith('tree-')?'松树':category;
  labels[asset]={label:parentLabel+' · '+title+' #'+String(ordinal).padStart(3,'0'),
   category:parentLabel,kind:'detail',sourceName:o.name||'',meshType:o.geometry.type,
   sourceId:o.uuid};
  // The standalone mesh uses its actual original material and geometry;
  // keep original world rotation / scale but recenter its bounding box
  // for sensible brush placement. No model is redrawn.
  const cloned=o.clone(false);
  const geomBounds=new T.Box3().setFromObject(o);
  const cx=(geomBounds.min.x+geomBounds.max.x)/2,
    cz=(geomBounds.min.z+geomBounds.max.z)/2,
    low=geomBounds.min.y;
  const pos=new T.Vector3(),quat=new T.Quaternion(),scale=new T.Vector3();
  o.matrixWorld.decompose(pos,quat,scale);
  cloned.position.set(pos.x-cx,pos.y-low,pos.z-cz);
  cloned.quaternion.copy(quat);cloned.scale.copy(scale);
  const holder=new T.Group();holder.name='native-mesh-'+asset;holder.add(cloned);
  holder.userData.assetType=asset;
  templates.set(asset,holder);
 });
 for(const id of ['pirate_ship','kraken_variant_0','kraken_variant_1','kraken_variant_2','kraken_variant_3'])
  templates.set(id,new T.Group());
 return {
  all:labels,
  types:[...templates.keys()],
  create:(asset)=>{
   // These procedural prefabs use exactly the same source model builders as live events.
   if(asset==='pirate_ship'){
    const root=new T.Group();root.name='placed-whole-pirate-ship';
    const boat=createPirateShip(root);boat.ship.visible=true;
    // The roaming ship is clipped to the live route; a placed editor instance must not be.
    boat.ship.traverse(o=>{if(!o.isMesh)return;
     for(const mat of (Array.isArray(o.material)?o.material:[o.material])){mat.clippingPlanes=null;mat.needsUpdate=true;}
    });return root;
   }
   if(/^kraken_variant_[0-3]$/.test(asset)){
    const root=new T.Group();root.name='placed-whole-'+asset;
    const arm=createKraken(root,{origin:{x:0,z:0},externalControl:true,variant:Number(asset.slice(-1))});
    arm.setNight(true);arm.forceEvent();
    for(let i=0;i<5;i++)arm.update(1.6);
    arm.setNight(false);arm.root.visible=true;return root;
   }
   const original=templates.get(asset);
   if(!original)throw Error('Game asset unavailable: '+asset);
   const clone=original.clone(true);
   clone.traverse(o=>{if(o.isMesh){
    o.castShadow=true;o.receiveShadow=true;
    // Do not count clones as fixed QA props or collision tests.
    delete o.userData.isShoreObstacle;
    delete o.userData.isLandingStep;
    delete o.userData.isPathLamp;
    delete o.userData.footprint;
   }});
   return clone;
  }
 };
}
export function createPlacementLayer(w,catalog,root){
 const layer=new T.Group();layer.name='saved-game-map-objects';root.add(layer);
 const records=new Map();
 for(const obj of w.objects){
  if(!catalog.types.includes(obj.asset))continue;
  const instance=catalog.create(obj.asset);
  instance.userData.mapId=obj.id;instance.name='placed-'+obj.asset+'-'+obj.id;
  instance.position.set(obj.x,groundY(w,obj.x,obj.z),obj.z);
  instance.rotation.y=obj.rotation*Math.PI/180;
  instance.scale.setScalar(obj.scale);
  instance.traverse(n=>{if(n.isMesh)n.userData.mapObjectId=obj.id});
  layer.add(instance);records.set(obj.id,instance);
 }
 return {layer,records};
}
const palettes={sand:0x9d9c7f,grass:0x566c4c,rock:0x677b82,water:0x336978};
export function createTerrainMesh(w){
 // Only draw land: the game's opaque sea surface stays visible around it.
 const positions=[],colors=[],normals=[];
 const tint=new T.Color();
 const gw=w.grid[0],gh=w.grid[1],dx=w.width/gw,dz=w.depth/gh;
 function triangle(a,b,c,hex,shade){
  tint.setHex(hex).multiplyScalar(shade);
  const normal=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a))
   .cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a))).normalize();
  for(const q of [a,b,c]){
   positions.push(...q);colors.push(tint.r,tint.g,tint.b);
   normals.push(normal.x,normal.y,normal.z);
  }
 }
 function quad(a,b,c,d,hex,shade){
  triangle(a,b,d,hex,shade);triangle(b,c,d,hex,shade);
 }
 let landCells=0;
 for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){
  const k=j*gw+i,h=w.heights[k];
  if(h<=0)continue;
  landCells++;
  const mat=palettes[w.types[k]]||palettes.grass;
  const a=i*dx-w.width/2,b=(i+1)*dx-w.width/2;
  const c=j*dz-w.depth/2,d=(j+1)*dz-w.depth/2;
  quad([a,h,c],[b,h,c],[b,h,d],[a,h,d],mat,.95+.04*Math.sin(i*2.7+j*3.4));
  for(const f of [
   {di:-1,dj:0,e:[[a,d],[a,c]],shade:.71},
   {di:1,dj:0,e:[[b,c],[b,d]],shade:.78},
   {di:0,dj:-1,e:[[a,c],[b,c]],shade:.85},
   {di:0,dj:1,e:[[b,d],[a,d]],shade:.81}
  ]){
   const ni=i+f.di,nj=j+f.dj;
   const neighbor=ni<0||nj<0||ni>=gw||nj>=gh?SEA:w.heights[nj*gw+ni];
   if(neighbor>=h)continue;
   const bot=Math.max(SEA,neighbor);
   quad([f.e[0][0],h,f.e[0][1]],[f.e[1][0],h,f.e[1][1]],
    [f.e[1][0],bot,f.e[1][1]],[f.e[0][0],bot,f.e[0][1]],mat,f.shade);
  }
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
 const mesh=new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
 mesh.name='shared-world-sculpted-terrain';
 mesh.userData.landCells=landCells;mesh.castShadow=true;mesh.receiveShadow=true;
 return mesh;
}
export function addOpenOcean(root){
 // The existing vector sea stays intact at the lighthouse. Extend the
 // surrounding water to the editable 20x world area without changing meshes.
 const material=new T.MeshBasicMaterial({color:0x377d88,side:T.DoubleSide,depthWrite:true});
 const mesh=new T.Mesh(new T.PlaneGeometry(WIDTH,DEPTH),material);
 mesh.rotation.x=-Math.PI/2;mesh.position.y=SEA-.008;
 mesh.name='shared-world-wide-sea';root.add(mesh);return mesh;
}
export function savePreviewMap(w){
 const text=JSON.stringify(normalizeMap(w));
 localStorage.setItem(SHARED_MAP_KEY,text);
 return text;
}
export function readPreviewMap(){
 try{const raw=localStorage.getItem(SHARED_MAP_KEY);return raw?normalizeMap(JSON.parse(raw)):null;}
 catch(e){console.warn('Invalid saved map preview:',e);return null;}
}

export const BASE_ASSETS={
 lighthouse:{name:'原版灯塔',x:.82,z:-2.38},
 boathouse:{name:'原版木屋与平台',x:-3.48,z:.88}
};
export function applyNativeEdits(w,group){
 const results=[];
 for(const [id,defaultInfo] of Object.entries(BASE_ASSETS)){
  const root=group.getObjectByName('game-asset-'+id);
  if(!root)continue;
  const edit=w.baseEdits?.[id];
  root.position.set(edit?.x??defaultInfo.x,0,edit?.z??defaultInfo.z);
  root.rotation.y=(edit?.rotation??0)*Math.PI/180;
  root.scale.setScalar(edit?.scale??1);
  root.visible=!(edit?.hidden);
  results.push({id,x:root.position.x,z:root.position.z,visible:root.visible});
 }
 return results;
}
