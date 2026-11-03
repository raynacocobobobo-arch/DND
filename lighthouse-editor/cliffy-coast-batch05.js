import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Batch 05: models retain source FBX dimensions; scale is applied once at placement.
// Within cobbled-road, stone-fence and fort-wall families scale stays identical.
// Bounding-box snapping is approximate; this does not weld mesh vertices.
export const CLIFFY_BATCH05_SPECS=[
 {'id':'cliffy_coast_bridgestone','label':'Cliffy Coast · BridgeStone','file':'bridgestone.glb','triangles':3620,'defaultScale':0.471032,'category':'Cliffy Coast 桥梁'},
 {'id':'cliffy_coast_bridgewood','label':'Cliffy Coast · BridgeWood','file':'bridgewood.glb','triangles':1318,'defaultScale':0.6517988,'category':'Cliffy Coast 桥梁'},
 {'id':'cliffy_coast_hangingbridgelong','label':'Cliffy Coast · HangingBridgeLong','file':'hangingbridgelong.glb','triangles':4375,'defaultScale':0.3709649,'category':'Cliffy Coast 桥梁'},
 {'id':'cliffy_coast_cobbledstreet1','label':'Cliffy Coast · CobbledStreet1','file':'cobbledstreet1.glb','triangles':1373,'defaultScale':0.298,'category':'Cliffy Coast 道路'},
 {'id':'cliffy_coast_cobbledstreet1_half','label':'Cliffy Coast · CobbledStreet1_Half','file':'cobbledstreet1_half.glb','triangles':1183,'defaultScale':0.298,'category':'Cliffy Coast 道路'},
 {'id':'cliffy_coast_cobbledstreet2','label':'Cliffy Coast · CobbledStreet2','file':'cobbledstreet2.glb','triangles':942,'defaultScale':0.298,'category':'Cliffy Coast 道路'},
 {'id':'cliffy_coast_cobbledstreet2_half','label':'Cliffy Coast · CobbledStreet2_Half','file':'cobbledstreet2_half.glb','triangles':452,'defaultScale':0.298,'category':'Cliffy Coast 道路'},
 {'id':'cliffy_coast_fencestone','label':'Cliffy Coast · FenceStone','file':'fencestone.glb','triangles':612,'defaultScale':0.33,'category':'Cliffy Coast 围墙'},
 {'id':'cliffy_coast_fencestoneend','label':'Cliffy Coast · FenceStoneEnd','file':'fencestoneend.glb','triangles':56,'defaultScale':0.33,'category':'Cliffy Coast 围墙'},
 {'id':'cliffy_coast_fencestraight3','label':'Cliffy Coast · FenceStraight3','file':'fencestraight3.glb','triangles':205,'defaultScale':0.3512515,'category':'Cliffy Coast 围墙'},
 {'id':'cliffy_coast_damagedfortwall1','label':'Cliffy Coast · DamagedFortWall1','file':'damagedfortwall1.glb','triangles':761,'defaultScale':0.32,'category':'Cliffy Coast 围墙'},
 {'id':'cliffy_coast_damagedfortwall2','label':'Cliffy Coast · DamagedFortWall2','file':'damagedfortwall2.glb','triangles':692,'defaultScale':0.32,'category':'Cliffy Coast 围墙'},
 {'id':'cliffy_coast_damagedfortwall3','label':'Cliffy Coast · DamagedFortWall3','file':'damagedfortwall3.glb','triangles':722,'defaultScale':0.32,'category':'Cliffy Coast 围墙'},
];

export async function registerCliffyCoastBatch05(catalog){
 const loader=new GLTFLoader(),templates=new Map();
 const previousCreate=catalog.create.bind(catalog);
 const deletedCliffyIds=await fetch(new URL('./assets/cliffy-coast/removed.json',import.meta.url),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Cliffy Coast removed index unavailable');return r.json();})
  .then(data=>new Set(Array.isArray(data.ids)?data.ids:[]));
 const loaded=await Promise.allSettled(CLIFFY_BATCH05_SPECS.filter(spec=>!deletedCliffyIds.has(spec.id)).map(async spec=>{
  const src=new URL('./assets/cliffy-coast/'+spec.file,import.meta.url).href;
  const gltf=await loader.loadAsync(src);
  const box=new T.Box3().setFromObject(gltf.scene);
  if(box.isEmpty()||!Number.isFinite(box.min.y))throw Error('Empty batch05 model: '+spec.id);
  let triangles=0;
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   o.castShadow=true;o.receiveShadow=true;
  });
  if(Math.round(triangles)!==spec.triangles)
   throw Error('Batch05 triangle mismatch: '+spec.id+' expected '+spec.triangles+' got '+triangles);
  const root=new T.Group();root.name=spec.id;
  gltf.scene.position.set(-(box.min.x+box.max.x)/2,-box.min.y,-(box.min.z+box.max.z)/2);
  root.add(gltf.scene);
  return {spec,root,box};
 }));
 for(const item of loaded){
  if(item.status==='rejected'){console.error('Cliffy Coast Batch05 GLB failed:',item.reason);continue;}
  const {spec,root,box}=item.value;
  if(catalog.types.includes(spec.id))throw Error('Duplicate Cliffy Coast ID: '+spec.id);
  const d=box.getSize(new T.Vector3());
  catalog.types.push(spec.id);
  templates.set(spec.id,root);
  catalog.all[spec.id]={
   label:spec.label,category:spec.category,kind:'complete',
   source:'Cliffy Coast original FBX GLB',defaultScale:spec.defaultScale,
   triangles:spec.triangles,size:[d.x,d.y,d.z].map(v=>+v.toFixed(4))
  };
 }
 catalog.create=function(id){const source=templates.get(id);return source?source.clone(true):previousCreate(id);};
 return {loaded:templates.size,total:CLIFFY_BATCH05_SPECS.length,ids:[...templates.keys()]};
}
