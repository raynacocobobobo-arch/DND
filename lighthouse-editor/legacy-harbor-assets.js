import * as T from 'three';

/**
 * Recovered designs from build_lighthouse_cake.py (Lighthouse Cake V3/V4).
 * Western pier: width 1.05, 3.55 long.
 * Eastern pier: width 1.36, 3.95 long.
 * Shipwreck: abandoned ribbed wooden hull with broken mast.
 *
 * These are editable complete Three.js prefabs for the map editor.
 * Geometry is rebuilt from the ORIGINAL procedural design, not a photo or
 * newly invented asset. Z-up Blender design -> Y-up Three.js.
 */
const MAT={
 timber:new T.MeshLambertMaterial({color:'#896347',flatShading:true}),
 light:new T.MeshLambertMaterial({color:'#af8560',flatShading:true}),
 dark:new T.MeshLambertMaterial({color:'#533a2f',flatShading:true}),
 broken:new T.MeshLambertMaterial({color:'#684638',flatShading:true}),
 rope:new T.MeshLambertMaterial({color:'#bca785',flatShading:true}),
 iron:new T.MeshLambertMaterial({color:'#3b4245',flatShading:true})
};
function part(root,geometry,mat,name,pos=[0,0,0]){
 const m=new T.Mesh(geometry,mat);m.name=name;m.position.set(...pos);
 m.castShadow=true;m.receiveShadow=true;root.add(m);return m;
}
function box(root,name,x,y,z,w,h,d,mat=MAT.timber){
 return part(root,new T.BoxGeometry(w,h,d),mat,name,[x,y,z]);
}
function beam(root,name,a,b,r,mat=MAT.dark,sides=7){
 const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);
 const m=part(root,new T.CylinderGeometry(r,r,v.length(),sides),mat,name);
 m.position.copy(p).add(q).multiplyScalar(.5);
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
 return m;
}
function polyline(root,name,points,rad,material=MAT.rope){
 for(let i=1;i<points.length;i++)
  beam(root,name+'-segment-'+i,points[i-1],points[i],rad,material,5);
}
function pier(label,width,length){
 const g=new T.Group();g.name=label;g.userData.legacyAsset=true;
 // Local origin at the land-end, center of walkway at its lowest solid point.
 // Wooden pier goes toward negative Z and stands on exposed vertical pilings.
 const deck=2.4,planks=Math.ceil(length/.24);
 for(const sign of [-1,1]){
  const x=sign*width*.43;
  beam(g,'longitudinal-stringer-'+sign,[x,deck-.16,0],[x,deck-.16,-length],.083);
 }
 for(let i=0;i<planks;i++){
  const z=-(i+.5)*length/planks;
  const p=box(g,'separate-deck-plank-'+i,0,deck,z,
    width,.105,length/planks*.83,i%5===0?MAT.light:MAT.timber);
  p.rotation.y=Math.sin(i*13.9)*.011;
 }
 for(let i=0;i<5;i++)for(const sign of [-1,1]){
  const z=-length*i/4,x=sign*width*.43;
  beam(g,'load-bearing-piling-'+sign+'-'+i,[x,0,z],[x,deck-.02,z],.09);
  beam(g,'railing-post-'+sign+'-'+i,[x,deck,z],[x,deck+.56,z],.065,MAT.timber);
 }
 for(const sign of [-1,1]){
  const x=sign*width*.43;
  for(let i=0;i<4;i++){
   const pts=[];
   for(let k=0;k<=10;k++){
    const t=k/10,z=-length*(i+t)/4;
    pts.push([x,deck+.48-.17*Math.sin(Math.PI*t),z]);
   }
   polyline(g,'sagging-rope-'+sign+'-'+i,pts,.019);
  }
 }
 // The original posts were submerged below sea level; place-prefab origin
 // is bottom of the piling, allowing manual placement on edited terrain.
 g.userData.editorDefaultScale=1;
 return g;
}
function shipwreck(){
 const g=new T.Group();g.name='Shipwreck abandoned hull';
 g.userData.legacyAsset=true;
 // Original stations, made as open three-dimensional planked hull (not a solid box).
 const stations=[[-1.42,.06],[-.95,.43],[-.38,.53],[.38,.53],[.95,.43],[1.42,.06]];
 const L=1.35,verts=[],indexes=[];
 // Coordinates from source boat(): x is keel, +/- y is beam, z is height.
 // Local Three scene: x hull, Y height and Z width. Reference upright y=0.
 for(const [x,w] of stations){
  verts.push([x*L,.30*L,-w*L],[x*L,.30*L,w*L],
   [x*L,-.22*L,-w*.53*L],[x*L,-.22*L,w*.53*L]);
 }
 function quad(a,b,c,d){indexes.push(a,b,c,a,c,d);}
 for(let i=0;i<stations.length-1;i++){
  const a=i*4,b=(i+1)*4;
  quad(a,b,b+2,a+2);quad(a+3,b+3,b+1,a+1);
  quad(a+2,b+2,b+3,a+3);
 }
 const positions=[],normals=[];
 const V=i=>verts[i];
 for(let i=0;i<indexes.length;i+=3){
  const a=V(indexes[i]),b=V(indexes[i+1]),c=V(indexes[i+2]);
  // facet-by-facet: weathered timber with no smooth shading
  positions.push(...a,...b,...c);
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geo.computeVertexNormals();
 part(g,geo,MAT.broken,'weathered-open-hull');
 for(const sign of [-1,1]){
  polyline(g,'raised-gunwale-'+sign,stations.map(([x,w])=>[x*L,.31*L,sign*w*L]),.052,MAT.light);
 }
 for(const x of [-.43,.43]){
  beam(g,'broken-rower-bench-'+x,[x*L,.16*L,-.39*L],[x*L,.16*L,.39*L],.055,MAT.light);
 }
 // Seven exposed structural ribs, lifted above fractured deck.
 for(let i=0;i<7;i++){
  const x=(-1.12+i*.36)*L;
  beam(g,'exposed-curved-rib-'+i,[x,.06*L,-.45*L],
   [x+.06*L,(.75+(i%3)*.08)*L,-.33*L],.047,MAT.dark);
  beam(g,'rib-side-'+i,[x,.04*L,.41*L],
   [x-.03*L,(.48+(i%2)*.13)*L,.44*L],.037,MAT.timber);
 }
 // Fractured aft bulkhead and an angled, visibly broken mast.
 for(let i=0;i<5;i++)
  box(g,'fractured-side-plank-'+i,.25*L,(.35+i*.07)*L,(-.42+i*.04)*L,
   (.38+(i%2)*.11)*L,.07*L,.15*L,i%2?MAT.dark:MAT.timber);
 beam(g,'broken-mast',[.07*L,.02*L,0],[.67*L,1.36*L,.20*L],.105,MAT.dark,9);
 beam(g,'broken-mast-split',[.67*L,1.36*L,.20*L],[.77*L,1.56*L,.16*L],.064,MAT.light,5);
 for(let i=0;i<4;i++){
  const x=(-.90+i*.53)*L;
  beam(g,'loose-cross-timber-'+i,[x,.33*L,-.23*L],
   [x+.17*L,(.25+i*.07)*L,.28*L],.038,i%2?MAT.dark:MAT.timber,5);
 }
 // Rest hull on seabed of prefab footprint; coordinate position is stable.
 g.rotation.y=-Math.PI*.19;
 return g;
}
const specs=[
 {id:'legacy_shipwreck',label:'旧版沉船 · 破损船体',category:'船只'},
 {id:'legacy_pier_west',label:'旧版西侧木栈道 · 窄',category:'码头与栈道'},
 {id:'legacy_pier_east',label:'旧版东侧木栈道 · 宽',category:'码头与栈道'}
];
export function registerLegacyHarborPrefabs(catalog){
 const originals={
  legacy_shipwreck:shipwreck(),
  legacy_pier_west:pier('Western pier',1.05,3.55),
  legacy_pier_east:pier('Eastern pier',1.36,3.95)
 };
 const nativeCreate=catalog.create.bind(catalog);
 for(const {id,label,category} of specs){
  if(catalog.types.includes(id))throw Error('Duplicate legacy asset '+id);
  catalog.types.push(id);
  catalog.all[id]={label,category,kind:'complete',source:'Lighthouse Cake V3/V4'};
 }
 catalog.create=function(asset){
  const original=originals[asset];
  if(!original)return nativeCreate(asset);
  return original.clone(true);
 };
 return specs.map(({id,label})=>({id,label}));
}
