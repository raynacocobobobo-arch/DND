import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Batch 03: 10 daily items, 7 weapons, 1 earth-pile decoration.
// The GLBs retain native FBX dimensions; only prefab defaultScale is modified.
// Height/length targets are calibrated to the unchanged V35 lighthouse (~7.43 units).
export const CLIFFY_BATCH03_SPECS=[
 {id:'cliffy_coast_bowlempty',label:'Cliffy Coast · BowlEmpty',file:'bowlempty.glb',triangles:218,defaultScale:1.1076943,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_bowlsmallempty',label:'Cliffy Coast · BowlSmallEmpty',file:'bowlsmallempty.glb',triangles:116,defaultScale:1.0549091,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_choppedwood',label:'Cliffy Coast · ChoppedWood',file:'choppedwood.glb',triangles:1380,defaultScale:0.7740904,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_crate',label:'Cliffy Coast · Crate',file:'crate.glb',triangles:284,defaultScale:0.78,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_dumplingbowl',label:'Cliffy Coast · DumplingBowl',file:'dumplingbowl.glb',triangles:432,defaultScale:1.1309783,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_feedingtrough',label:'Cliffy Coast · FeedingTrough',file:'feedingtrough.glb',triangles:282,defaultScale:0.5762493,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_haybale',label:'Cliffy Coast · HayBale',file:'haybale.glb',triangles:801,defaultScale:0.4910681,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_plateempty',label:'Cliffy Coast · PlateEmpty',file:'plateempty.glb',triangles:76,defaultScale:0.9039407,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_platemeal',label:'Cliffy Coast · PlateMeal',file:'platemeal.glb',triangles:376,defaultScale:0.9039407,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_platesoup',label:'Cliffy Coast · PlateSoup',file:'platesoup.glb',triangles:76,defaultScale:1.0062157,category:'Cliffy Coast 物品'},
 {id:'cliffy_coast_hellebard',label:'Cliffy Coast · Hellebard',file:'hellebard.glb',triangles:382,defaultScale:0.6590149,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_morningstar',label:'Cliffy Coast · MorningStar',file:'morningstar.glb',triangles:238,defaultScale:0.851047,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_onehandaxe',label:'Cliffy Coast · OnehandAxe',file:'onehandaxe.glb',triangles:492,defaultScale:1.0640832,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_sword_a',label:'Cliffy Coast · Sword_A',file:'sword_a.glb',triangles:423,defaultScale:0.730865,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_sword_b',label:'Cliffy Coast · Sword_B',file:'sword_b.glb',triangles:451,defaultScale:0.7695956,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_sword_c',label:'Cliffy Coast · Sword_C',file:'sword_c.glb',triangles:269,defaultScale:0.7838537,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_twohandaxe',label:'Cliffy Coast · TwohandAxe',file:'twohandaxe.glb',triangles:512,defaultScale:1.1066932,category:'Cliffy Coast 武器'},
 {id:'cliffy_coast_earthpile',label:'Cliffy Coast · EarthPile',file:'earthpile.glb',triangles:387,defaultScale:0.5427557,category:'Cliffy Coast 装饰'}
];

export async function registerCliffyCoastBatch03(catalog){
 const loader=new GLTFLoader(),templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const results=await Promise.allSettled(CLIFFY_BATCH03_SPECS.map(async spec=>{
  const uri=new URL('./assets/cliffy-coast/'+spec.file,import.meta.url).href;
  const gltf=await loader.loadAsync(uri);
  const bounds=new T.Box3().setFromObject(gltf.scene);
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.y))throw Error('Missing geometry: '+spec.id);
  let actual=0;
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   actual+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(actual)!==spec.triangles)
   throw Error('Triangle count mismatch: '+spec.id+' expected '+spec.triangles+' actual '+actual);
  const root=new T.Group();root.name=spec.id;
  gltf.scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  root.add(gltf.scene);
  return {spec,root,bounds};
 }));
 for(const result of results){
  if(result.status==='rejected'){console.error('Cliffy Coast Batch03 failed:',result.reason);continue;}
  const {spec,root,bounds}=result.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate Cliffy asset: '+spec.id);
  const size=bounds.getSize(new T.Vector3());
  templates.set(spec.id,root);catalog.types.push(spec.id);
  catalog.all[spec.id]={
   label:spec.label,category:spec.category,kind:'complete',source:'Cliffy Coast FBX GLB',
   defaultScale:spec.defaultScale,triangles:spec.triangles,
   size:[size.x,size.y,size.z].map(x=>+x.toFixed(3))
  };
 }
 catalog.create=function(id){
  const item=templates.get(id);
  return item?item.clone(true):existingCreate(id);
 };
 return {loaded:templates.size,total:CLIFFY_BATCH03_SPECS.length,ids:[...templates.keys()]};
}
