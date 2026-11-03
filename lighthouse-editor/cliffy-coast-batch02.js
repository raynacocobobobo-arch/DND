import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Batch 02 source geometry remains at native FBX dimensions.
// Only prefab placement scales are calibrated against the V35 lighthouse.
export const CLIFFY_BATCH02_SPECS=[
 {id:'cliffy_coast_anvil',label:'Cliffy Coast · Anvil',file:'anvil.glb',triangles:180,defaultScale:0.68177,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_bucket1',label:'Cliffy Coast · Bucket1',file:'bucket1.glb',triangles:322,defaultScale:0.91282,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_bucket2',label:'Cliffy Coast · Bucket2',file:'bucket2.glb',triangles:322,defaultScale:1.17919,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_choppingblock',label:'Cliffy Coast · ChoppingBlock',file:'choppingblock.glb',triangles:150,defaultScale:1.04006,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_choppingblockwithhatchet',label:'Cliffy Coast · ChoppingBlockWithHatchet',file:'choppingblockwithhatchet.glb',triangles:292,defaultScale:0.81428,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_firewoodsingle',label:'Cliffy Coast · FirewoodSingle',file:'firewoodsingle.glb',triangles:72,defaultScale:1.52383,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_hammera',label:'Cliffy Coast · HammerA',file:'hammera.glb',triangles:154,defaultScale:0.96664,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_hatchet',label:'Cliffy Coast · Hatchet',file:'hatchet.glb',triangles:228,defaultScale:0.90758,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_pickaxe',label:'Cliffy Coast · Pickaxe',file:'pickaxe.glb',triangles:146,defaultScale:0.90651,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_pitchfork',label:'Cliffy Coast · Pitchfork',file:'pitchfork.glb',triangles:186,defaultScale:0.81525,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_scythe',label:'Cliffy Coast · Scythe',file:'scythe.glb',triangles:252,defaultScale:0.91291,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_shovel',label:'Cliffy Coast · Shovel',file:'shovel.glb',triangles:202,defaultScale:0.79975,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_waterbucket1',label:'Cliffy Coast · WaterBucket1',file:'waterbucket1.glb',triangles:322,defaultScale:0.91282,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_waterbucket2',label:'Cliffy Coast · WaterBucket2',file:'waterbucket2.glb',triangles:322,defaultScale:1.17919,category:'Cliffy Coast 工具'},
 {id:'cliffy_coast_candle1',label:'Cliffy Coast · Candle1',file:'candle1.glb',triangles:206,defaultScale:0.49671,category:'Cliffy Coast 家具'},
 {id:'cliffy_coast_candle2',label:'Cliffy Coast · Candle2',file:'candle2.glb',triangles:581,defaultScale:0.66601,category:'Cliffy Coast 家具'},
 {id:'cliffy_coast_stool',label:'Cliffy Coast · Stool',file:'stool.glb',triangles:156,defaultScale:0.52671,category:'Cliffy Coast 家具'},
 {id:'cliffy_coast_stool_old',label:'Cliffy Coast · Stool_Old',file:'stool_old.glb',triangles:212,defaultScale:0.52671,category:'Cliffy Coast 家具'},
 {id:'cliffy_coast_trophy',label:'Cliffy Coast · Trophy',file:'trophy.glb',triangles:3006,defaultScale:0.00658,category:'Cliffy Coast 家具'},
 {id:'cliffy_coast_woodentable2',label:'Cliffy Coast · WoodenTable2',file:'woodentable2.glb',triangles:550,defaultScale:0.74924,category:'Cliffy Coast 家具'}
];

export async function registerCliffyCoastBatch02(catalog){
 const loader=new GLTFLoader(),templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const deletedCliffyIds=await fetch(new URL('./assets/cliffy-coast/removed.json',import.meta.url),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Cliffy Coast removed index unavailable');return r.json();})
  .then(data=>new Set(Array.isArray(data.ids)?data.ids:[]));
 const results=await Promise.allSettled(CLIFFY_BATCH02_SPECS.filter(spec=>!deletedCliffyIds.has(spec.id)).map(async spec=>{
  const url=new URL('./assets/cliffy-coast/'+spec.file,import.meta.url);
  const gltf=await loader.loadAsync(url.href);
  const bounds=new T.Box3().setFromObject(gltf.scene);
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.y))throw Error('Missing geometry: '+spec.id);
  let actual=0;
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   actual+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(actual)!==spec.triangles)
   throw Error('Triangle count mismatch: '+spec.id+' expected '+spec.triangles+' got '+actual);
  const root=new T.Group();root.name=spec.id;
  gltf.scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  root.add(gltf.scene);
  return {spec,root,bounds};
 }));
 for(const result of results){
  if(result.status==='rejected'){console.error('Cliffy Coast Batch02 failed:',result.reason);continue;}
  const {spec,root,bounds}=result.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate Cliffy asset: '+spec.id);
  const dims=bounds.getSize(new T.Vector3());
  catalog.types.push(spec.id);
  templates.set(spec.id,root);
  catalog.all[spec.id]={
   label:spec.label,category:spec.category,kind:'complete',source:'Cliffy Coast original FBX GLB',
   defaultScale:spec.defaultScale,triangles:spec.triangles,
   size:[dims.x,dims.y,dims.z].map(n=>+n.toFixed(3))
  };
 }
 catalog.create=function(id){
  const model=templates.get(id);
  return model?model.clone(true):existingCreate(id);
 };
 return {loaded:templates.size,total:CLIFFY_BATCH02_SPECS.length,ids:[...templates.keys()]};
}
