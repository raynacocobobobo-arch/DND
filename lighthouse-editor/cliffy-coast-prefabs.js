import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Original FBX geometry and material groups from the user's Cliffy Coast package.
// Each GLB remains at source dimensions. Placement uses per-asset lighthouse-height defaultScale;
// never bake this into vertices or alter the approved original island.
const SPECS = [
 {id:'cliffy_coast_tree1',label:'Cliffy Coast · Tree1',file:'tree1.glb',triangles:1203,defaultScale:0.18455},
 {id:'cliffy_coast_tree2',label:'Cliffy Coast · Tree2',file:'tree2.glb',triangles:770,defaultScale:0.18944},
 {id:'cliffy_coast_tree3',label:'Cliffy Coast · Tree3',file:'tree3.glb',triangles:639,defaultScale:0.174},
 {id:'cliffy_coast_treedamaged1',label:'Cliffy Coast · TreeDamaged1',file:'treedamaged1.glb',triangles:291,defaultScale:0.22361},
 {id:'cliffy_coast_treedamaged2',label:'Cliffy Coast · TreeDamaged2',file:'treedamaged2.glb',triangles:293,defaultScale:0.23641},
 {id:'cliffy_coast_treedamaged3',label:'Cliffy Coast · TreeDamaged3',file:'treedamaged3.glb',triangles:289,defaultScale:0.24061},
 {id:'cliffy_coast_plant',label:'Cliffy Coast · Plant',file:'plant.glb',triangles:165,defaultScale:0.41906},
 {id:'cliffy_coast_plant2',label:'Cliffy Coast · Plant2',file:'plant2.glb',triangles:165,defaultScale:0.47629},
 {id:'cliffy_coast_plant3',label:'Cliffy Coast · Plant3',file:'plant3.glb',triangles:165,defaultScale:0.44171},
 {id:'cliffy_coast_reed',label:'Cliffy Coast · Reed',file:'reed.glb',triangles:400,defaultScale:0.34797},
 {id:'cliffy_coast_reedbig',label:'Cliffy Coast · ReedBig',file:'reedbig.glb',triangles:1200,defaultScale:0.37486},
 {id:'cliffy_coast_ivy1',label:'Cliffy Coast · Ivy1',file:'ivy1.glb',triangles:756,defaultScale:0.28611},
 {id:'cliffy_coast_ivy2_housewall',label:'Cliffy Coast · Ivy2_HouseWall',file:'ivy2_housewall.glb',triangles:721,defaultScale:0.29639},
 {id:'cliffy_coast_field',label:'Cliffy Coast · Field',file:'field.glb',triangles:5941,defaultScale:0.45}
];

export async function registerCliffyCoastTrees(catalog) {
 const loader=new GLTFLoader(), templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const deletedCliffyIds=await fetch(new URL('./assets/cliffy-coast/removed.json',import.meta.url),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Cliffy Coast removed index unavailable');return r.json();})
  .then(data=>new Set(Array.isArray(data.ids)?data.ids:[]));
 const results=await Promise.allSettled(SPECS.filter(spec=>!deletedCliffyIds.has(spec.id)).map(async spec=>{
  const uri=new URL('./assets/cliffy-coast/'+spec.file,import.meta.url).href;
  const gltf=await loader.loadAsync(uri);
  const bounds=new T.Box3().setFromObject(gltf.scene);
  if(bounds.isEmpty())throw Error('Cliffy Coast invalid geometry: '+spec.id);
  let actualTriangles=0;
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   actualTriangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(actualTriangles)!==spec.triangles)
   throw Error('Cliffy Coast triangle mismatch: '+spec.id+' '+actualTriangles);
  const model=new T.Group();model.name=spec.id;
  gltf.scene.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  model.add(gltf.scene);
  return {spec,model,bounds};
 }));
 const loaded=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
 for(const result of results)if(result.status==='rejected')
  console.error('Cliffy Coast GLB failed to load; existing editor remains available:',result.reason);
 for(const {spec,model,bounds} of loaded){
  if(catalog.types.includes(spec.id))throw Error('Duplicate Cliffy Coast asset '+spec.id);
  templates.set(spec.id,model);
  catalog.types.push(spec.id);
  const size=bounds.getSize(new T.Vector3());
  catalog.all[spec.id]={
   label:spec.label,category:'Cliffy Coast 植物',kind:'complete',
   source:'Cliffy Coast original FBX GLB',defaultScale:spec.defaultScale,triangles:spec.triangles,
   size:[size.x,size.y,size.z].map(n=>+n.toFixed(3))
  };
 }
 catalog.create=function(id){
  const model=templates.get(id);
  return model?model.clone(true):existingCreate(id);
 };
 return loaded.map(({spec})=>({id:spec.id,label:spec.label,triangles:spec.triangles}));
}
