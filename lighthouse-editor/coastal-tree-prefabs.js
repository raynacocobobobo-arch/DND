import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

/**
 * Four original colored Low-poly palm GLBs.
 * Native local Y-up origins are on the trunk bottom; geometry and color
 * are retained verbatim from the approved GLBs (no procedural substitutes).
 */
const SPECS = [
 {id:'coastal_tree_t01',label:'T01 海风高椰',slug:'t01_seabreeze_tall'},
 {id:'coastal_tree_t02',label:'T02 矮冠椰树',slug:'t02_compact_wide'},
 {id:'coastal_tree_t03',label:'T03 迎风斜椰',slug:'t03_windswept_lean'},
 {id:'coastal_tree_t04',label:'T04 幼年小椰',slug:'t04_young_palm'}
];

export async function registerCoastalPalms(catalog){
 const loader=new GLTFLoader();
 const templates=new Map();
 // Load once before populating the palette, since catalog.create() is sync.
 const resp=await fetch(new URL('./assets/palms/manifest.json',import.meta.url),{cache:'no-store'});
 if(!resp.ok)throw Error('Palm manifest unavailable');
 const index=await resp.json();
 const enabled=new Set(Array.isArray(index.assets)?index.assets.map(x=>x.id):[]);
 const loaded=await Promise.all(SPECS.filter(spec=>enabled.has(spec.id)).map(async spec=>{
  const url=new URL('./assets/palms/'+spec.slug+'.glb',import.meta.url).href;
  const gltf=await loader.loadAsync(url);
  const model=gltf.scene;
  model.name=spec.id;
  model.traverse(part=>{
   if(part.isMesh){part.castShadow=true;part.receiveShadow=true;}
  });
  return {spec,model};
 }));
 const previousCreate=catalog.create.bind(catalog);
 for(const {spec,model} of loaded){
  if(catalog.types.includes(spec.id))throw Error('Duplicate coastal tree '+spec.id);
  templates.set(spec.id,model);
  catalog.types.push(spec.id);
  catalog.all[spec.id]={
   label:spec.label,category:'树木与植被',kind:'complete',
   source:'Coastal Low-poly Tree GLB T01–T04'
  };
 }
 catalog.create=function(asset){
  const template=templates.get(asset);
  return template?template.clone(true):previousCreate(asset);
 };
 return loaded.map(({spec})=>({id:spec.id,label:spec.label}));
}
