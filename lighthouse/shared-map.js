import * as T from 'three';
import {createKraken} from './v34-tentacle.js?v=34a';
import {createPirateShip} from './v27-pirate.js?v=27a';

// One schema / one material and prefab source for BOTH pages.
// Stored on the same GitHub Pages origin, hence same-browser preview works.
export const SHARED_MAP_KEY='dnd-lighthouse-world-map-v2';
export const WORLD_SCHEMA='lighthouse-world-v2';
export const GW=64,GH=56,WIDTH=146,DEPTH=129,SEA=.1815;
export const MAX_EDITOR_GRID=192;
export const MIN_OBJECT_Y=-50,MAX_OBJECT_Y=100;
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

/**
 * Non-destructive per-instance color correction used by the editor and game preview.
 * Original GLB geometries, textures and authored source materials are retained.
 * Updates use uniforms so sliders do not recompile shaders for each pointer move.
 */
const appearanceOriginalMaterials=new WeakMap();
const appearanceRange=(value,defaultValue,min,max)=>{
 const n=Number(value??defaultValue);
 return Number.isFinite(n)?clamp(n,min,max):defaultValue;
};
export function applyModelAppearance(object,options={}){
 if(!object)return;
 const b=appearanceRange(options.brightness,1,0,2);
 const sat=appearanceRange(options.saturation,1,0,2);
 const hue=appearanceRange(options.hue,0,-180,180);
 object.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.material)return;
  const stored=appearanceOriginalMaterials.get(mesh);
  if(!stored && b===1 && sat===1 && hue===0)return;
  if(!stored)appearanceOriginalMaterials.set(mesh,mesh.material);
  const current=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(current.every(m=>m?.userData?.lighthouseAppearance)){
   for(const m of current){
    m.userData.lighthouseAppearance.brightness.value=b;
    m.userData.lighthouseAppearance.saturation.value=sat;
    m.userData.lighthouseAppearance.hue.value=hue;
   }
   return;
  }
  const original=appearanceOriginalMaterials.get(mesh);
  const patch=m=>{
   if(!m)return m;
   const material=m.clone();
   const oldCompile=m.onBeforeCompile;
   const brightness={value:b},saturation={value:sat},hueOffset={value:hue};
   material.userData.lighthouseAppearance={brightness,saturation,hue:hueOffset};
   material.onBeforeCompile=shader=>{
    oldCompile?.(shader);
    shader.uniforms.lighthouseBrightness=brightness;
    shader.uniforms.lighthouseSaturation=saturation;
    shader.uniforms.lighthouseHue=hueOffset;
    shader.fragmentShader='uniform float lighthouseBrightness;\nuniform float lighthouseSaturation;\nuniform float lighthouseHue;\n'+shader.fragmentShader;
    const marker='#include <map_fragment>';
    const correction='\nvec3 lighthouseAxis=vec3(0.57735026919);\nfloat lighthouseAngle=radians(lighthouseHue);\nfloat lighthouseCos=cos(lighthouseAngle);\nfloat lighthouseSin=sin(lighthouseAngle);\nvec3 lighthouseRGB=diffuseColor.rgb;\ndiffuseColor.rgb=lighthouseRGB*lighthouseCos+cross(lighthouseAxis,lighthouseRGB)*lighthouseSin+lighthouseAxis*dot(lighthouseAxis,lighthouseRGB)*(1.0-lighthouseCos);\nfloat lighthouseLuma=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));\ndiffuseColor.rgb=clamp(mix(vec3(lighthouseLuma),diffuseColor.rgb,lighthouseSaturation)*lighthouseBrightness,0.0,1.0);\n';
    shader.fragmentShader=shader.fragmentShader.replace(marker,marker+correction);
   };
   material.customProgramCacheKey=()=>((m.customProgramCacheKey?.()||'')+'-lighthouse-hsb-v2');
   return material;
  };
  mesh.material=Array.isArray(original)?original.map(patch):patch(original);
 });
}

export function emptyMap(options={}){
 const grid=options.grid||[GW,GH],width=options.width||WIDTH,depth=options.depth||DEPTH;
 const gx=grid[0],gz=grid[1];
 if(!Number.isInteger(gx)||!Number.isInteger(gz)||gx<4||gz<4||
    gx>MAX_EDITOR_GRID||gz>MAX_EDITOR_GRID||
    !Number.isFinite(width)||!Number.isFinite(depth)||width<1||depth<1)
  throw Error('地图尺寸或网格无效');
 return {schema:WORLD_SCHEMA,version:2,width,depth,grid:[gx,gz],
  heights:Array(gx*gz).fill(-3),types:Array(gx*gz).fill('water'),objects:[],baseEdits:{},assetDefaults:{},regions:[],assetScaleVersion:'cliffy-batch01-source-unit-v1'};
}
export function normalizeMap(v){
 const grid=v?.grid;
 const gw=Array.isArray(grid)?Number(grid[0]):NaN;
 const gh=Array.isArray(grid)?Number(grid[1]):NaN;
 const width=Number(v?.width),depth=Number(v?.depth);
 if(!v||!Number.isInteger(gw)||!Number.isInteger(gh)||
  gw<4||gh<4||gw>MAX_EDITOR_GRID||gh>MAX_EDITOR_GRID||
  !Number.isFinite(width)||!Number.isFinite(depth)||width<1||depth<1||
  width>1000||depth>1000||
  !Array.isArray(v.heights)||v.heights.length!==gw*gh||
  !Array.isArray(v.types)||v.types.length!==gw*gh||
  !Array.isArray(v.objects)||v.objects.length>1000||
  !['lighthouse-world-v1',WORLD_SCHEMA].includes(v.schema))
  throw Error('不兼容的地图：请使用地图编辑器导出的世界 JSON');
 const w=emptyMap({grid:[gw,gh],width,depth});
 w.heights=v.heights.map(t=>clamp(Math.round(Number(t)||0),-3,9));
 w.types=v.types.map(t=>['water','sand','grass','rock'].includes(t)?t:'water');
 w.baseEdits={};
 if(v.baseEdits&&typeof v.baseEdits==='object'){
  for(const [id,rec] of Object.entries(v.baseEdits)){
   if(!['lighthouse','boathouse','campfire','service_boat','coastal_flora'].includes(id)&&! /^(tree|rock|barrel|reef)-\d+$/.test(id))continue;
   if(!rec||typeof rec!=='object')continue;
   w.baseEdits[id]={
    x:clamp(Number(rec.x)||0,-w.width/2,w.width/2),
     y:clamp(Number(rec.y)||0,MIN_OBJECT_Y,MAX_OBJECT_Y),
    z:clamp(Number(rec.z)||0,-w.depth/2,w.depth/2),
    rotation:((Number(rec.rotation)||0)%360+360)%360,
    scale:clamp(Number(rec.scale??1)||1,.001,2),
    brightness:clamp(Number(rec.brightness??1),0,2),saturation:clamp(Number(rec.saturation??1),0,2),hue:clamp(Number(rec.hue??0),-180,180),
    hidden:!!rec.hidden,locked:!!rec.locked
   };
  }
 }

 // Presets overwrite the editor's component settings, not the original GLB bytes.
 // Keep them in the world file so a portable JSON imports its own model presets.
 w.assetDefaults={};
 if(v.assetDefaults&&typeof v.assetDefaults==='object'&&!Array.isArray(v.assetDefaults)){
  for(const [key,rec] of Object.entries(v.assetDefaults).slice(0,300)){
   const allowed=!!ASSETS[key]||/^part_[0-9]{5}$/.test(key)||
    /^(pine_tree|barrel_single|reef_single)_[0-9]+$/.test(key)||
    /^coastal_tree_t0[1-4]$/.test(key)||
    /^legacy_(shipwreck|pier_west|pier_east)$/.test(key)||
    /^ext_glb_[0-9a-f]{24}$/.test(key)||
    /^cliffy_coast_[a-z0-9_]{1,40}$/.test(key)||/^pirates_[a-z0-9_]{1,80}$/.test(key);
   if(!allowed||!rec||typeof rec!=='object')continue;
   w.assetDefaults[key]={
    scale:appearanceRange(rec.scale,1,.001,2),
    brightness:appearanceRange(rec.brightness,1,0,2),
    saturation:appearanceRange(rec.saturation,1,0,2),
    hue:appearanceRange(rec.hue,0,-180,180)
   };
  }
 }
 // Region outlines preserve the designer intent for later terrain-model generation.
 w.regions=Array.isArray(v.regions)?v.regions.slice(0,128).map((r,i)=>({
  id:String(r.id||'region-'+i).slice(0,60),
  height:clamp(Math.round(Number(r.height)||1),1,9),
  material:['sand','grass','rock'].includes(r.material)?r.material:'grass',
  points:Array.isArray(r.points)?r.points.slice(0,256).filter(p=>Array.isArray(p)&&p.length===2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])).map(p=>[clamp(+p[0],-w.width/2,w.width/2),clamp(+p[1],-w.depth/2,w.depth/2)]):[]
 })).filter(r=>r.points.length>=3):[];
 const seen=new Set();
 w.objects=v.objects.map((obj,i)=>{
  const asset=former[obj.asset]||obj.asset;
  if(!ASSETS[asset]&&!/^part_[0-9]{5}$/.test(asset)&&! /^(pine_tree|barrel_single|reef_single)_[0-9]+$/.test(asset)&&! /^coastal_tree_t0[1-4]$/.test(asset)&&! /^legacy_(shipwreck|pier_west|pier_east)$/.test(asset)&&! /^ext_glb_[0-9a-f]{24}$/.test(asset)&&! /^cliffy_coast_[a-z0-9_]{1,40}$/.test(asset)&&! /^pirates_[a-z0-9_]{1,80}$/.test(asset))return null;
  const id=String(obj.id||'item-'+i).slice(0,60);
  if(seen.has(id))return null;
  seen.add(id);
  return {id,asset,name:String(obj.name||ASSETS[asset]?.label||asset).slice(0,90),
   x:clamp(Number(obj.x)||0,-w.width/2,w.width/2),
    y:clamp(Number(obj.y)||0,MIN_OBJECT_Y,MAX_OBJECT_Y),
   z:clamp(Number(obj.z)||0,-w.depth/2,w.depth/2),
   rotation:((Number(obj.rotation)||0)%360+360)%360,
   scale:clamp((Number(obj.scale)||1)*(!v.assetScaleVersion&&['cliffy_coast_tree1','cliffy_coast_tree3'].includes(asset)?.3:1),.001,2),brightness:clamp(Number(obj.brightness??1),0,2),saturation:clamp(Number(obj.saturation??1),0,2),hue:clamp(Number(obj.hue??0),-180,180),
   hidden:!!obj.hidden,locked:!!obj.locked,
   group:typeof obj.group==='string'&&/^grp_[a-z0-9]{6,20}$/.test(obj.group)?obj.group:null};
 }).filter(Boolean);
 return w;
}
export function getHeight(w,x,z){
 const gw=w.grid[0],gh=w.grid[1];
 const i=Math.floor((x+w.width/2)/(w.width/gw)),j=Math.floor((z+w.depth/2)/(w.depth/gh));
 if(i<0||j<0||i>=gw||j>=gh)return -3;
 return w.heights[j*gw+i];
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
 registerNativeSceneAssets(group,reefRoot);
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
  instance.position.set(obj.x,groundY(w,obj.x,obj.z)+(obj.y??0),obj.z);
  instance.rotation.y=obj.rotation*Math.PI/180;
  instance.scale.setScalar(obj.scale);instance.visible=!obj.hidden;
   applyModelAppearance(instance,obj);
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
// Exactly the V35 ocean palette and distance-based bathymetric gradient.
// The original nearshore mesh stays at the original world size, and this
// larger surface continues its appearance in the editor's expandable water.
export function createEditorOceanGeometry(width=WIDTH,depth=DEPTH){
 const vertex=[],color=[];
 const near=new T.Color('#66b9c6'),far=new T.Color('#247491');
 const centerX=-.20,centerZ=.25;
 const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
 // One consistent continuous flat mesh, not an untextured solid-color plane.
 const nx=Math.max(32,Math.min(240,Math.ceil(width/.85)));
 const nz=Math.max(32,Math.min(240,Math.ceil(depth/.85)));
 const put=(x,z)=>{
  vertex.push(x,SEA-.005,z);
  const distance=Math.hypot((x-centerX)/5.38,(z-centerZ)/4.34);
  const t=smooth(1.10,2.85,distance);
  const c=near.clone().lerp(far,t);
  color.push(c.r,c.g,c.b);
 };
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const x0=-width/2+i*width/nx,x1=-width/2+(i+1)*width/nx;
  const z0=-depth/2+j*depth/nz,z1=-depth/2+(j+1)*depth/nz;
  put(x0,z0);put(x1,z0);put(x0,z1);
  put(x1,z0);put(x1,z1);put(x0,z1);
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(vertex,3));
 geo.setAttribute('color',new T.Float32BufferAttribute(color,3));
 geo.computeBoundingSphere();
 return geo;
}
export function addOpenOcean(root,width=WIDTH,depth=DEPTH){
 const material=new T.MeshBasicMaterial({
  color:0xffffff,vertexColors:true,side:T.DoubleSide,
  depthWrite:true,depthTest:true,toneMapped:false
 });
 const mesh=new T.Mesh(createEditorOceanGeometry(width,depth),material);
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

// The V35 island and sea are immutable terrain; authored original models
// are individually addressable without redrawing or reparenting the meshes.
export const BASE_ASSETS={
 lighthouse:{name:'原版灯塔',x:.82,z:-2.38},
 boathouse:{name:'原版木屋与平台',x:-3.48,z:.88}
};
const nativeObjects=new Map();
function registerNativeSceneAssets(group,reefRoot){
 nativeObjects.clear();
 const register=(id,name,node,anchor=null)=>{
  if(!node)return;
  node.updateWorldMatrix(true,true);
  const box=new T.Box3().setFromObject(node);
  if(box.isEmpty())return;
  const x=anchor?.x??(box.min.x+box.max.x)*.5;
  const z=anchor?.z??(box.min.z+box.max.z)*.5;
  BASE_ASSETS[id]={name,x,z};
  nativeObjects.set(id,{
   node,position:node.position.clone(),quaternion:node.quaternion.clone(),
   scale:node.scale.clone(),x,z
  });
 };
 register('lighthouse','原版灯塔',group.getObjectByName('game-asset-lighthouse'),{x:.82,z:-2.38});
 register('boathouse','原版木屋与平台',group.getObjectByName('game-asset-boathouse'),{x:-3.48,z:.88});
 register('campfire','原版营火',group.getObjectByName('game-asset-campfire'));
 register('coastal_flora','原版海岸植被组',group.getObjectByName('game-asset-coastal-flora'));
 register('service_boat','原版小船',group.getObjectByName('serviceBoat'));
 const forest=group.getObjectByName('game-asset-pine-forest');
 for(const node of forest?.children||[]){
  const n=/^game-asset-tree-(\d+)$/.exec(node.name);
  if(n)register('tree-'+n[1],'原版松树 '+(+n[1]+1),node);
 }
 const rocks=group.getObjectByName('game-asset-shore-rocks');
 (rocks?.children||[]).filter(o=>o.isMesh).forEach((node,i)=>
  register('rock-'+i,'原版岸边礁石 '+(i+1),node));
 const barrels=group.getObjectByName('game-asset-supply-barrels');
 for(const node of barrels?.children||[]){
  const n=/^game-asset-barrel-(\d+)$/.exec(node.name);
  if(n)register('barrel-'+n[1],'原版木桶 '+(+n[1]+1),node);
 }
 (reefRoot?.children||[]).filter(o=>/^reef-\d+$/.test(o.name)).forEach((node,i)=>
  register('reef-'+i,'原版外海礁石 '+(i+1),node));
}
export function nativeGameTargets(){
 return Object.fromEntries([...nativeObjects.entries()].map(([id,record])=>[id,record.node]));
}
export function applyNativeEdits(w,group){
 const results=[];
 for(const [id,record] of nativeObjects){
  const base=BASE_ASSETS[id];
  const edit=w.baseEdits?.[id]||{};
  const node=record.node;
  node.position.copy(record.position);
  node.position.x+=(edit.x??base.x)-base.x;
  node.position.y+=edit.y??0;
  node.position.z+=(edit.z??base.z)-base.z;
  node.quaternion.copy(record.quaternion);
  if(edit.rotation)node.rotateY(edit.rotation*Math.PI/180);
  node.scale.copy(record.scale).multiplyScalar(edit.scale??1);
  node.visible=!edit.hidden;
  results.push({id,x:edit.x??base.x,y:edit.y??0,z:edit.z??base.z,visible:node.visible});
 }
 return results;
}
