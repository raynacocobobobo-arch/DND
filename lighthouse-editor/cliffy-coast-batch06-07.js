import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Staged Batch06+07 loader; NOT imported by the live editor until binary bundle is deployed.
// FBX vertex sizes are preserved. Only defaultScale changes placed instance sizes.
// All 24 models are packed in one gzip payload to avoid repeated small GitHub blob uploads.
export const CLIFFY_BATCH06_07_SPECS=[
 {id:'cliffy_coast_damagedtower',label:'Cliffy Coast · DamagedTower',file:'damagedtower.glb',triangles:4045,defaultScale:0.35,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_damagedtower2',label:'Cliffy Coast · DamagedTower2',file:'damagedtower2.glb',triangles:3939,defaultScale:0.35,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_damagedtower3',label:'Cliffy Coast · DamagedTower3',file:'damagedtower3.glb',triangles:4261,defaultScale:0.35,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_door',label:'Cliffy Coast · Door',file:'door.glb',triangles:1946,defaultScale:0.0090628,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_pergolamini',label:'Cliffy Coast · PergolaMini',file:'pergolamini.glb',triangles:154,defaultScale:0.685,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_pergola_large',label:'Cliffy Coast · Pergola_Large',file:'pergola_large.glb',triangles:446,defaultScale:0.685,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_pergola_small',label:'Cliffy Coast · Pergola_Small',file:'pergola_small.glb',triangles:310,defaultScale:0.685,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_well_roofblue',label:'Cliffy Coast · Well_RoofBlue',file:'well_roofblue.glb',triangles:1135,defaultScale:0.34,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_well_roofred',label:'Cliffy Coast · Well_RoofRed',file:'well_roofred.glb',triangles:1135,defaultScale:0.34,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_well_roofwood',label:'Cliffy Coast · Well_RoofWood',file:'well_roofwood.glb',triangles:1135,defaultScale:0.34,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_windmill1',label:'Cliffy Coast · Windmill1',file:'windmill1.glb',triangles:9525,defaultScale:0.18,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_windmill2',label:'Cliffy Coast · Windmill2',file:'windmill2.glb',triangles:6827,defaultScale:0.18,category:'Cliffy Coast 建筑'},
 {id:'cliffy_coast_house1_cornerstones',label:'Cliffy Coast · House1_Cornerstones',file:'house1_cornerstones.glb',triangles:690,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house1_exterior_only',label:'Cliffy Coast · House1_Exterior_Only',file:'house1_exterior_only.glb',triangles:13906,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house1_exteriour',label:'Cliffy Coast · House1_Exteriour',file:'house1_exteriour.glb',triangles:18105,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house1_interiour',label:'Cliffy Coast · House1_Interiour',file:'house1_interiour.glb',triangles:10874,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house2_exteriour',label:'Cliffy Coast · House2_Exteriour',file:'house2_exteriour.glb',triangles:8673,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house2_exteriour_only',label:'Cliffy Coast · House2_Exteriour_Only',file:'house2_exteriour_only.glb',triangles:6878,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house2_interiour',label:'Cliffy Coast · House2_Interiour',file:'house2_interiour.glb',triangles:6238,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house3_exteriour',label:'Cliffy Coast · House3_Exteriour',file:'house3_exteriour.glb',triangles:8673,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_house3_exteriour_only',label:'Cliffy Coast · House3_Exteriour_Only',file:'house3_exteriour_only.glb',triangles:7437,defaultScale:0.3,category:'Cliffy Coast 房屋'},
 {id:'cliffy_coast_topwindow',label:'Cliffy Coast · TopWindow',file:'topwindow.glb',triangles:673,defaultScale:0.3,category:'Cliffy Coast 房屋构件'},
 {id:'cliffy_coast_woodunderroof',label:'Cliffy Coast · WoodUnderRoof',file:'woodunderroof.glb',triangles:1083,defaultScale:0.3,category:'Cliffy Coast 房屋构件'},
 {id:'cliffy_coast_woodendoor_round',label:'Cliffy Coast · WoodenDoor_Round',file:'woodendoor_round.glb',triangles:506,defaultScale:0.3,category:'Cliffy Coast 房屋构件'}
];

function decodeBundle(buffer){
 const d=new DataView(buffer),u=new Uint8Array(buffer);
 if(u.length<8||String.fromCharCode(...u.subarray(0,4))!=='LCGB')throw Error('Invalid Cliffy Coast bundle');
 let pos=4;
 const take32=()=>{if(pos+4>d.byteLength)throw Error('Truncated Cliffy bundle');const v=d.getUint32(pos,true);pos+=4;return v;};
 const take16=()=>{if(pos+2>d.byteLength)throw Error('Truncated Cliffy bundle');const v=d.getUint16(pos,true);pos+=2;return v;};
 if(take32()!==1)throw Error('Unknown Cliffy bundle format');
 const count=take32();
 if(count!==CLIFFY_BATCH06_07_SPECS.length)throw Error('Cliffy asset count mismatch');
 const decoder=new TextDecoder();
 const result=new Map();
 for(let i=0;i<count;i++){
  const len=take16();
  if(len<1||pos+len>d.byteLength)throw Error('Invalid file entry');
  const name=decoder.decode(u.subarray(pos,pos+len));pos+=len;
  const size=take32();
  if(size<20||pos+size>d.byteLength)throw Error('Invalid GLB size: '+name);
  const data=u.slice(pos,pos+size).buffer;pos+=size;
  if(result.has(name))throw Error('Duplicate GLB: '+name);
  result.set(name,data);
 }
 if(pos!==u.length)throw Error('Trailing bytes in Cliffy bundle');
 return result;
}

export async function registerCliffyCoastBatch06_07(catalog){
 const url=new URL('./assets/cliffy-coast/cliffy_batch06_07.glbpack.gz',import.meta.url).href;
 const response=await fetch(url);
 if(!response.ok)throw Error('Cliffy Coast batch06-07 archive unavailable: HTTP '+response.status);
 if(typeof DecompressionStream==='undefined')throw Error('Browser lacks native gzip decompression');
 const compressed=await response.blob();
 const data=await new Response(compressed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const meshes=decodeBundle(data);
 const loader=new GLTFLoader(),templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const parsed=await Promise.allSettled(CLIFFY_BATCH06_07_SPECS.map(async spec=>{
  const glb=meshes.get(spec.file);
  if(!glb)throw Error('Missing bundled GLB: '+spec.file);
  const parsed=await loader.parseAsync(glb,url);
  const scene=parsed.scene,bounds=new T.Box3().setFromObject(scene);
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.y))throw Error('Empty mesh: '+spec.file);
  let triangles=0;
  scene.traverse(o=>{
   if(!o.isMesh)return;
   triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(triangles)!==spec.triangles)throw Error('Triangle mismatch: '+spec.file);
  const root=new T.Group();root.name=spec.id;
  // Modular architecture retains the FBX-authored pivot and relative offsets.
  // Centering each roof/wall independently destroys their shared assembly coordinates.
  // Props and cemetery items keep the original ground-centered placement behavior.
  const preserveAssemblyOrigin=spec.category==='Cliffy Coast 房屋构件';
  if(!preserveAssemblyOrigin){
   scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  }
  root.add(scene);
  return {root,bounds,spec};
 }));
 for(const entry of parsed){
  if(entry.status!=='fulfilled'){console.warn('Cliffy Coast batch06/07 failed:',entry.reason);continue;}
  const {root,bounds,spec}=entry.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate asset ID '+spec.id);
  const size=bounds.getSize(new T.Vector3());
  templates.set(spec.id,root);
  catalog.types.push(spec.id);
  catalog.all[spec.id]={label:spec.label,category:spec.category,kind:'complete',
   source:'Cliffy Coast user-supplied FBX',defaultScale:spec.defaultScale,\n   assemblyOriginPreserved: spec.category==='Cliffy Coast 房屋构件',
   triangles:spec.triangles,size:[size.x,size.y,size.z].map(x=>+x.toFixed(3))};
 }
 catalog.create=function(id){
  const source=templates.get(id);
  return source?source.clone(true):existingCreate(id);
 };
 return {loaded:templates.size,total:CLIFFY_BATCH06_07_SPECS.length,
  ids:[...templates.keys()],missing:CLIFFY_BATCH06_07_SPECS.length-templates.size};
}
