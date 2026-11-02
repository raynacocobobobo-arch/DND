import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Cliffy Coast Roof & Cemetery loader: batch 08/09/10 packed model geometries; loads in editor and game preview.
// FBX vertex sizes are preserved. Only defaultScale changes placed instance sizes.
// All 24 models are packed in one gzip payload to avoid repeated small GitHub blob uploads.
export const CLIFFY_BATCH08_10_SPECS=[
 {
  "id": "cliffy_coast_roof_red",
  "label": "Cliffy Coast · Roof_Red",
  "file": "roof_red.glb",
  "triangles": 904,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_blue",
  "label": "Cliffy Coast · Roof_Blue",
  "file": "roof_blue.glb",
  "triangles": 904,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_small_roof_top_blue",
  "label": "Cliffy Coast · Small_Roof_Top_Blue",
  "file": "small_roof_top_blue.glb",
  "triangles": 196,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_woodplanks",
  "label": "Cliffy Coast · Roof_WoodPlanks",
  "file": "roof_woodplanks.glb",
  "triangles": 1670,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_redplanks",
  "label": "Cliffy Coast · Roof_RedPlanks",
  "file": "roof_redplanks.glb",
  "triangles": 1670,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_grey",
  "label": "Cliffy Coast · Roof_Grey",
  "file": "roof_grey.glb",
  "triangles": 904,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_chimney",
  "label": "Cliffy Coast · Chimney",
  "file": "chimney.glb",
  "triangles": 102,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_small_roof_top_red",
  "label": "Cliffy Coast · Small_Roof_Top_Red",
  "file": "small_roof_top_red.glb",
  "triangles": 196,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_greyplanks",
  "label": "Cliffy Coast · Roof_GreyPlanks",
  "file": "roof_greyplanks.glb",
  "triangles": 1670,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_blueplanks",
  "label": "Cliffy Coast · Roof_BluePlanks",
  "file": "roof_blueplanks.glb",
  "triangles": 1670,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_roof_wood",
  "label": "Cliffy Coast · Roof_Wood",
  "file": "roof_wood.glb",
  "triangles": 904,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_small_roof_top_grey",
  "label": "Cliffy Coast · Small_Roof_Top_Grey",
  "file": "small_roof_top_grey.glb",
  "triangles": 196,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_small_roof_top_wood",
  "label": "Cliffy Coast · Small_Roof_Top_Wood",
  "file": "small_roof_top_wood.glb",
  "triangles": 196,
  "defaultScale": 0.3,
  "category": "Cliffy Coast 房屋屋顶"
 },
 {
  "id": "cliffy_coast_tombstone8",
  "label": "Cliffy Coast · Tombstone8",
  "file": "tombstone8.glb",
  "triangles": 190,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone10",
  "label": "Cliffy Coast · Tombstone10",
  "file": "tombstone10.glb",
  "triangles": 230,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_cross2",
  "label": "Cliffy Coast · Cross2",
  "file": "cross2.glb",
  "triangles": 416,
  "defaultScale": 1.1126315,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone3",
  "label": "Cliffy Coast · Tombstone3",
  "file": "tombstone3.glb",
  "triangles": 286,
  "defaultScale": 0.7720055,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone6",
  "label": "Cliffy Coast · Tombstone6",
  "file": "tombstone6.glb",
  "triangles": 174,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_cross1",
  "label": "Cliffy Coast · Cross1",
  "file": "cross1.glb",
  "triangles": 160,
  "defaultScale": 1.1531906,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstoneblank2",
  "label": "Cliffy Coast · TombstoneBlank2",
  "file": "tombstoneblank2.glb",
  "triangles": 126,
  "defaultScale": 0.6458162,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone2",
  "label": "Cliffy Coast · Tombstone2",
  "file": "tombstone2.glb",
  "triangles": 286,
  "defaultScale": 0.7720055,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstonedamaged1",
  "label": "Cliffy Coast · TombstoneDamaged1",
  "file": "tombstonedamaged1.glb",
  "triangles": 156,
  "defaultScale": 0.6829321,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone11",
  "label": "Cliffy Coast · Tombstone11",
  "file": "tombstone11.glb",
  "triangles": 174,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstonedamaged2",
  "label": "Cliffy Coast · TombstoneDamaged2",
  "file": "tombstonedamaged2.glb",
  "triangles": 160,
  "defaultScale": 0.6829321,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstonedamaged3",
  "label": "Cliffy Coast · TombstoneDamaged3",
  "file": "tombstonedamaged3.glb",
  "triangles": 164,
  "defaultScale": 0.6829321,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone_cross2_gold",
  "label": "Cliffy Coast · Tombstone_Cross2_Gold",
  "file": "tombstone_cross2_gold.glb",
  "triangles": 464,
  "defaultScale": 0.7392781,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_cross2_gold",
  "label": "Cliffy Coast · Cross2_Gold",
  "file": "cross2_gold.glb",
  "triangles": 416,
  "defaultScale": 1.1126315,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone1",
  "label": "Cliffy Coast · Tombstone1",
  "file": "tombstone1.glb",
  "triangles": 210,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstoneblank3",
  "label": "Cliffy Coast · TombstoneBlank3",
  "file": "tombstoneblank3.glb",
  "triangles": 86,
  "defaultScale": 0.6458162,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstoneblank1",
  "label": "Cliffy Coast · TombstoneBlank1",
  "file": "tombstoneblank1.glb",
  "triangles": 70,
  "defaultScale": 0.6458162,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_mausoleum",
  "label": "Cliffy Coast · Mausoleum",
  "file": "mausoleum.glb",
  "triangles": 4090,
  "defaultScale": 0.4019478,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone_cross2",
  "label": "Cliffy Coast · Tombstone_Cross2",
  "file": "tombstone_cross2.glb",
  "triangles": 478,
  "defaultScale": 0.7392781,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone4",
  "label": "Cliffy Coast · Tombstone4",
  "file": "tombstone4.glb",
  "triangles": 188,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone7",
  "label": "Cliffy Coast · Tombstone7",
  "file": "tombstone7.glb",
  "triangles": 230,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_tombstone9",
  "label": "Cliffy Coast · Tombstone9",
  "file": "tombstone9.glb",
  "triangles": 190,
  "defaultScale": 0.7720102,
  "category": "Cliffy Coast 墓园"
 },
 {
  "id": "cliffy_coast_cross1_gold",
  "label": "Cliffy Coast · Cross1_Gold",
  "file": "cross1_gold.glb",
  "triangles": 160,
  "defaultScale": 1.1531906,
  "category": "Cliffy Coast 墓园"
 }
];

function decodeBundle(buffer){
 const d=new DataView(buffer),u=new Uint8Array(buffer);
 if(u.length<8||String.fromCharCode(...u.subarray(0,4))!=='LCGB')throw Error('Invalid Cliffy Coast bundle');
 let pos=4;
 const take32=()=>{if(pos+4>d.byteLength)throw Error('Truncated Cliffy bundle');const v=d.getUint32(pos,true);pos+=4;return v;};
 const take16=()=>{if(pos+2>d.byteLength)throw Error('Truncated Cliffy bundle');const v=d.getUint16(pos,true);pos+=2;return v;};
 if(take32()!==1)throw Error('Unknown Cliffy bundle format');
 const count=take32();
 if(count!==CLIFFY_BATCH08_10_SPECS.length)throw Error('Cliffy asset count mismatch');
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

export async function registerCliffyCoastBatch08_10(catalog){
 const url=new URL('./assets/cliffy-coast/cliffy_batch08_10.glbpack.gz',import.meta.url).href;
 const response=await fetch(url);
 if(!response.ok)throw Error('Cliffy Coast batch06-07 archive unavailable: HTTP '+response.status);
 if(typeof DecompressionStream==='undefined')throw Error('Browser lacks native gzip decompression');
 const compressed=await response.blob();
 const data=await new Response(compressed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const meshes=decodeBundle(data);
 const loader=new GLTFLoader(),templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const parsed=await Promise.allSettled(CLIFFY_BATCH08_10_SPECS.map(async spec=>{
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
  const preserveAssemblyOrigin=spec.category==='Cliffy Coast 房屋屋顶';
  if(!preserveAssemblyOrigin){
   scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  }
  root.add(scene);
  return {root,bounds,spec};
 }));
 for(const entry of parsed){
  if(entry.status!=='fulfilled'){console.warn('Cliffy Coast batch08/10 failed:',entry.reason);continue;}
  const {root,bounds,spec}=entry.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate asset ID '+spec.id);
  const size=bounds.getSize(new T.Vector3());
  templates.set(spec.id,root);
  catalog.types.push(spec.id);
  catalog.all[spec.id]={label:spec.label,category:spec.category,kind:'complete',
   source:'Cliffy Coast user-supplied FBX',defaultScale:spec.defaultScale,\n   assemblyOriginPreserved: spec.category==='Cliffy Coast 房屋屋顶',
   triangles:spec.triangles,size:[size.x,size.y,size.z].map(x=>+x.toFixed(3))};
 }
 catalog.create=function(id){
  const source=templates.get(id);
  return source?source.clone(true):existingCreate(id);
 };
 return {loaded:templates.size,total:CLIFFY_BATCH08_10_SPECS.length,
  ids:[...templates.keys()],missing:CLIFFY_BATCH08_10_SPECS.length-templates.size};
}
