import * as T from 'three';

// Editor-native grouped prefabs. Original Cliffy Coast parts remain individually available.
// Layout uses measured mesh bounds because the FBX modules do not expose reliable assembly anchors.
export function registerCliffyCoastHouses(catalog){
 const createPart=catalog.create.bind(catalog);
 const combinations=[
  ['house1_red','房屋1 · 红屋顶','house1_exterior_only','house1_interiour','roof_red'],
  ['house1_blue','房屋1 · 蓝屋顶','house1_exterior_only','house1_interiour','roof_blue'],
  ['house1_grey','房屋1 · 灰屋顶','house1_exterior_only','house1_interiour','roof_grey'],
  ['house2_red','房屋2 · 红屋顶','house2_exteriour_only','house2_interiour','roof_red'],
  ['house2_blue','房屋2 · 蓝屋顶','house2_exteriour_only','house2_interiour','roof_blue'],
  ['house3_grey','房屋3 · 灰屋顶','house3_exteriour_only',null,'roof_grey']
 ];
 const built=new Map();
 for(const [suffix,label,wallId,insideId,roofId] of combinations){
  const wallAsset='cliffy_coast_'+wallId,insideAsset=insideId?'cliffy_coast_'+insideId:null,roofAsset='cliffy_coast_'+roofId;
  if(!catalog.types.includes(wallAsset)||!catalog.types.includes(roofAsset)||(insideAsset&&!catalog.types.includes(insideAsset)))continue;
  const wall=createPart(wallAsset),roof=createPart(roofAsset),inside=insideAsset?createPart(insideAsset):null;
  if(!wall||!roof||(insideAsset&&!inside))continue;
  // Align the wall, inner structure and roof as one hierarchy.
  const group=new T.Group(),structure=new T.Group();
  structure.add(wall);
  const wb=new T.Box3().setFromObject(wall);
  if(inside){
   const ib=new T.Box3().setFromObject(inside);
   const wc=wb.getCenter(new T.Vector3()),ic=ib.getCenter(new T.Vector3());
   inside.position.x+=wc.x-ic.x;
   inside.position.z+=wc.z-ic.z;
   inside.position.y+=wb.min.y-ib.min.y;
   structure.add(inside);
  }
  const rb=new T.Box3().setFromObject(roof),rc=rb.getCenter(new T.Vector3()),wc=wb.getCenter(new T.Vector3());
  roof.position.x+=wc.x-rc.x;
  roof.position.z+=wc.z-rc.z;
  roof.position.y+=wb.max.y-rb.min.y;
  structure.add(roof);
  const total=new T.Box3().setFromObject(structure),center=total.getCenter(new T.Vector3());
  structure.position.set(-center.x,-total.min.y,-center.z);
  group.add(structure);
  const id='cliffy_coast_complete_'+suffix;
  group.name=id;built.set(id,group);
  catalog.types.push(id);
  const size=total.getSize(new T.Vector3());
  catalog.all[id]={label:'Cliffy Coast · '+label,category:'Cliffy Coast 完整房屋',kind:'complete',
   source:'Cliffy Coast grouped editor prefab',defaultScale:0.3,
   size:[size.x,size.y,size.z].map(v=>+v.toFixed(3)),
   assemblyParts:[wallAsset,...(insideAsset?[insideAsset]:[]),roofAsset],
   groupedPrefab:true};
 }
 catalog.create=function(id){const item=built.get(id);return item?item.clone(true):createPart(id);};
 return {loaded:built.size,ids:[...built.keys()]};
}
