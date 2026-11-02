import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Cliffy Coast Batch 04: 18 independent props. Source FBX dimensions preserved.
// Imported assets use per-item lighthouse-calibrated placement scale.
// Cross-pack atlas references are approximated by the supplied Cliffy Coast Main atlas;
// check MarketStand, lantern and campfire material colors before visual approval.
export const CLIFFY_BATCH04_SPECS=[
 {id:'cliffy_coast_lantern_metal',label:'Cliffy Coast · Lantern_Metal',file:'lantern_metal.glb',triangles:764,defaultScale:0.2038912,category:'Cliffy Coast 灯具'},
 {id:'cliffy_coast_lantern_metaldouble',label:'Cliffy Coast · Lantern_MetalDouble',file:'lantern_metaldouble.glb',triangles:1644,defaultScale:0.2393066,category:'Cliffy Coast 灯具'},
 {id:'cliffy_coast_lantern_wall',label:'Cliffy Coast · Lantern_Wall',file:'lantern_wall.glb',triangles:737,defaultScale:0.5177158,category:'Cliffy Coast 灯具'},
 {id:'cliffy_coast_lantern_wood',label:'Cliffy Coast · Lantern_Wood',file:'lantern_wood.glb',triangles:694,defaultScale:0.2038912,category:'Cliffy Coast 灯具'},
 {id:'cliffy_coast_marketstand_blue',label:'Cliffy Coast · MarketStand_Blue',file:'marketstand_blue.glb',triangles:2138,defaultScale:0.9114409,category:'Cliffy Coast 摊位'},
 {id:'cliffy_coast_marketstand_green',label:'Cliffy Coast · MarketStand_Green',file:'marketstand_green.glb',triangles:2138,defaultScale:0.9114409,category:'Cliffy Coast 摊位'},
 {id:'cliffy_coast_marketstand_red',label:'Cliffy Coast · MarketStand_Red',file:'marketstand_red.glb',triangles:2138,defaultScale:0.9114409,category:'Cliffy Coast 摊位'},
 {id:'cliffy_coast_marketstand_white',label:'Cliffy Coast · MarketStand_White',file:'marketstand_white.glb',triangles:2138,defaultScale:0.9114409,category:'Cliffy Coast 摊位'},
 {id:'cliffy_coast_cartbig1',label:'Cliffy Coast · CartBig1',file:'cartbig1.glb',triangles:3260,defaultScale:0.4718236,category:'Cliffy Coast 推车'},
 {id:'cliffy_coast_muddplane',label:'Cliffy Coast · MuddPlane',file:'muddplane.glb',triangles:71,defaultScale:0.1174676,category:'Cliffy Coast 道路杂件'},
 {id:'cliffy_coast_rockblock1',label:'Cliffy Coast · RockBlock1',file:'rockblock1.glb',triangles:212,defaultScale:1.0840003,category:'Cliffy Coast 岩块'},
 {id:'cliffy_coast_rockblock3',label:'Cliffy Coast · RockBlock3',file:'rockblock3.glb',triangles:240,defaultScale:1.4065778,category:'Cliffy Coast 岩块'},
 {id:'cliffy_coast_rockblock_torch1',label:'Cliffy Coast · RockBlock_Torch1',file:'rockblock_torch1.glb',triangles:774,defaultScale:0.9561659,category:'Cliffy Coast 岩块'},
 {id:'cliffy_coast_rockblock_torch2',label:'Cliffy Coast · RockBlock_Torch2',file:'rockblock_torch2.glb',triangles:822,defaultScale:1.0738483,category:'Cliffy Coast 岩块'},
 {id:'cliffy_coast_stonepath_curve',label:'Cliffy Coast · StonePath_Curve',file:'stonepath_curve.glb',triangles:324,defaultScale:0.2117068,category:'Cliffy Coast 道路杂件'},
 {id:'cliffy_coast_stonepath_straight',label:'Cliffy Coast · StonePath_Straight',file:'stonepath_straight.glb',triangles:303,defaultScale:0.2055706,category:'Cliffy Coast 道路杂件'},
 {id:'cliffy_coast_woodenploorpatch1',label:'Cliffy Coast · WoodenPloorPatch1',file:'woodenploorpatch1.glb',triangles:202,defaultScale:0.2444971,category:'Cliffy Coast 道路杂件'},
 {id:'cliffy_coast_campfire',label:'Cliffy Coast · Campfire',file:'campfire.glb',triangles:490,defaultScale:0.4360982,category:'Cliffy Coast 营火'}
];

export async function registerCliffyCoastBatch04(catalog){
 const loader=new GLTFLoader(),templates=new Map();
 const previousCreate=catalog.create.bind(catalog);
 const results=await Promise.allSettled(CLIFFY_BATCH04_SPECS.map(async spec=>{
  const uri=new URL('./assets/cliffy-coast/'+spec.file,import.meta.url).href;
  const gltf=await loader.loadAsync(uri);
  const bounds=new T.Box3().setFromObject(gltf.scene);
  if(bounds.isEmpty()||!Number.isFinite(bounds.min.y))throw Error('Invalid GLB: '+spec.id);
  let triangles=0;
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(triangles)!==spec.triangles)throw Error(
   'Triangle mismatch: '+spec.id+' expected '+spec.triangles+' got '+triangles);
  const root=new T.Group();root.name=spec.id;
  gltf.scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  root.add(gltf.scene);
  return {spec,root,bounds};
 }));
 for(const result of results){
  if(result.status==='rejected'){
   console.error('Cliffy Coast Batch04 failed:',result.reason);continue;
  }
  const {spec,root,bounds}=result.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate Cliffy Coast asset: '+spec.id);
  templates.set(spec.id,root);catalog.types.push(spec.id);
  const dimensions=bounds.getSize(new T.Vector3());
  catalog.all[spec.id]={
   label:spec.label,category:spec.category,kind:'complete',
   source:'Cliffy Coast FBX converted to GLB',defaultScale:spec.defaultScale,
   triangles:spec.triangles,size:[dimensions.x,dimensions.y,dimensions.z].map(n=>+n.toFixed(3))
  };
 }
 catalog.create=function(id){
  const template=templates.get(id);
  return template?template.clone(true):previousCreate(id);
 };
 return {loaded:templates.size,total:CLIFFY_BATCH04_SPECS.length,ids:[...templates.keys()]};
}
