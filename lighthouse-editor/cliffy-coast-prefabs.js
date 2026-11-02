import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Original FBX geometry and material groups from the user's Cliffy Coast package.
// Each GLB remains at source dimensions. Placement uses defaultScale=0.3;
// never bake this into vertices or alter the approved original island.
const SPECS = [
 {id:'cliffy_coast_tree1', label:'Cliffy Coast · Tree1', file:'tree1.glb', triangles:1203},
 {id:'cliffy_coast_tree3', label:'Cliffy Coast · Tree3', file:'tree3.glb', triangles:639}
];

export async function registerCliffyCoastTrees(catalog) {
 const loader=new GLTFLoader(), templates=new Map();
 const existingCreate=catalog.create.bind(catalog);
 const results=await Promise.allSettled(SPECS.map(async spec=>{
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
   label:spec.label,category:'Cliffy Coast 树木',kind:'complete',
   source:'Cliffy Coast original FBX GLB',defaultScale:0.3,triangles:spec.triangles,
   size:[size.x,size.y,size.z].map(n=>+n.toFixed(3))
  };
 }
 catalog.create=function(id){
  const model=templates.get(id);
  return model?model.clone(true):existingCreate(id);
 };
 return SPECS.map(({id,label,triangles})=>({id,label,triangles}));
}
