import * as T from 'three';
import {group,W,D,WATER_CENTER_X,WATER_CENTER_Z,M} from './v27-world.js?v=27a';

/**
 * V29: match the actual island shore boulders, not an invented stone shader.
 * Exact SAME M.cliff material, IcosahedronGeometry(1,2), UV projection,
 * distortion style, flat faceted normals and shadow flags as groundRock().
 * Three offshore compositions: one tall but blunt, one thick broken block,
 * one lower and broader outcrop. All contours are irregular, NOT cone tips.
 */
export function createOffshoreReefs(){
 const seaY=.1815;
 const root=new T.Group();root.name='three-island-style-offshore-reefs';group.add(root);
 const sites=[
  {name:'tall-blunt-boulder',x:-13.3,z:7.7,height:2.87,footprint:.91},
  {name:'broad-boulder',x:9.0,z:7.0,height:1.96,footprint:1.22},
  {name:'low-reef-cluster',x:-6.0,z:-8.0,height:1.17,footprint:1.22}
 ];
 const arms=[
  [-12.2,3.4],[-12.4,-3.3],[-9.4,-9.3],[-3.3,-11.3],
  [3.4,-11.2],[9.4,-9],[12.4,-3],[12.2,3.3]
 ];
 const routeA=[9.5,WATER_CENTER_Z-D/2];
 const routeB=[WATER_CENTER_X+W/2,routeA[1]+(WATER_CENTER_X+W/2-routeA[0])];
 function segmentDistance(site){
  const vx=routeB[0]-routeA[0],vz=routeB[1]-routeA[1];
  const t=T.MathUtils.clamp(((site.x-routeA[0])*vx+(site.z-routeA[1])*vz)/(vx*vx+vz*vz),0,1);
  return Math.hypot(site.x-routeA[0]-t*vx,site.z-routeA[1]-t*vz);
 }
 const margins=sites.map(s=>({
  tentacle:Math.min(...arms.map(([x,z])=>Math.hypot(x-s.x,z-s.z))),
  pirate:segmentDistance(s),littleBoat:Math.hypot(s.x+2,s.z-6.1)
 }));
 const safe=sites.every((s,i)=>
  Math.abs(s.x-WATER_CENTER_X)+s.footprint<W*.5-1 &&
  Math.abs(s.z-WATER_CENTER_Z)+s.footprint<D*.5-1 &&
  Math.hypot((s.x+.2)/5.38,(s.z-.25)/4.34)>1.55 &&
  margins[i].tentacle>s.footprint+2.1 &&
  margins[i].pirate>s.footprint+2.1 &&
  margins[i].littleBoat>6
 );
 if(!safe)throw Error('V29 rock placement conflicts with water or event routes');

 // Use the EXACT shared reference, including its UV rock texture.
 // No gray-purple override, clone, per-face vertexColor or swirly new shader.
 const stoneMaterial=M.cliff;
 const meshes=[];
 const distort=(x,y,z,seed)=>{
  // GroundRock-equivalent, deterministic vertex distortion: repeated vertices
  // remain welded visually, so no holes appear in the silhouette.
  return 1+.075*Math.sin(x*6.0+z*5.0+seed)
    +.045*Math.sin(y*14.0+x*7.0+seed)+.028*Math.sin(z*21+x*12+seed);
 };
 function rock(parent,label,worldX,worldZ,o){
  // Start from the identical geometrical primitive/detail as island rocks.
  const geometry=new T.IcosahedronGeometry(1,2);
  const positions=geometry.attributes.position;
  const uvs=geometry.attributes.uv;
  const top=o.height,bottom=-(o.submerged??.28);
  const half=(top-bottom)/2,mid=(top+bottom)/2;
  for(let i=0;i<positions.count;i++){
   const originalX=positions.getX(i),originalY=positions.getY(i),originalZ=positions.getZ(i);
   // A bluff, fractured boulder: full mass through the centre, taper only
   // mildly at the top. Rounded ridge, never a drawn-out sharp apex.
   const rise=(originalY+1)*.5;
   const crown=Math.max(0,(originalY-.64)/.36);
   const taper=1-.12*crown;
   const swell=1+.09*Math.sin(rise*Math.PI);
   const rough=distort(originalX,originalY,originalZ,o.seed);
   const x=(originalX*o.rx*rough*taper*swell)+o.lean*rise
     +.035*Math.sin(originalY*3.8+o.seed);
   let y=mid+originalY*half;
   // Slightly flatten / chip off a sharp tip rather than forming a spike.
   if(originalY>.79)y-=half*(originalY-.79)*.48;
   y+=.032*Math.sin(originalX*4.3+originalZ*5.1+o.seed)*Math.max(0,1-Math.abs(originalY));
   const z=originalZ*o.rz*rough*taper+swell*.035*Math.sin(originalX*6+o.seed);
   positions.setXYZ(i,x,y,z);
   if(uvs){
    // Same stone UV projection as v27-world.js groundRock().
    uvs.setXY(i,(worldX+x)*.27+.5,
      (seaY+y)*.30+(worldZ+z)*.08);
   }
  }
  positions.needsUpdate=true;if(uvs)uvs.needsUpdate=true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const m=new T.Mesh(geometry,stoneMaterial);
  m.name=label;m.castShadow=true;m.receiveShadow=true;
  m.position.set(o.x||0,o.y||0,o.z||0);
  m.rotation.y=o.rotation||0;
  m.rotation.z=o.bank||0;
  m.userData.isReferenceIslandStyleRock=true;
  parent.add(m);meshes.push(m);
  return m;
 }
 // Keeping composite lobes low and thick prevents single尖塔 silhouettes.
 const builds=[
  [
   {label:'tall-natural-rock-main',rx:.77,rz:.72,height:2.87,
    submerged:.34,lean:-.14,seed:12,rotation:.29,bank:-.035},
   {label:'tall-natural-rock-buttress',rx:.46,rz:.50,height:.92,
    submerged:.22,lean:-.06,seed:20,x:-.36,z:.25,rotation:-.45}
  ],
  [
   {label:'broad-natural-rock-main',rx:1.08,rz:.94,height:1.96,
    submerged:.31,lean:-.16,seed:29,rotation:-.17,bank:.05},
   {label:'broad-natural-rock-shoulder',rx:.65,rz:.57,height:1.05,
    submerged:.25,lean:.08,seed:37,x:-.58,z:.16,rotation:.46},
   {label:'broad-natural-rock-low-wedge',rx:.43,rz:.42,height:.77,
    submerged:.20,lean:.07,seed:44,x:.49,z:-.37,rotation:-.34}
  ],
  [
   {label:'low-natural-rock-main',rx:1.03,rz:.88,height:1.17,
    submerged:.29,lean:-.10,seed:53,rotation:.21,bank:-.02},
   {label:'low-natural-rock-left',rx:.58,rz:.56,height:.87,
    submerged:.22,lean:.05,seed:64,x:-.62,z:.22,rotation:-.48},
   {label:'low-natural-rock-right',rx:.50,rz:.48,height:.72,
    submerged:.20,lean:.09,seed:71,x:.58,z:-.18,rotation:.52}
  ]
 ];
 const physical=sites.map((s,index)=>{
  const assembly=new T.Group();assembly.name='island-stone-reef-'+index;
  assembly.position.set(s.x,seaY,s.z);root.add(assembly);
  for(const part of builds[index])rock(assembly,part.label,s.x+ (part.x||0),s.z+(part.z||0),part);
  return {
   name:s.name,x:s.x,z:s.z,height:s.height,footprint:s.footprint,
   parts:builds[index].length,
   tentacleClearance:+margins[index].tentacle.toFixed(3),
   pirateClearance:+margins[index].pirate.toFixed(3),
   littleBoatClearance:+margins[index].littleBoat.toFixed(3)
  };
 });
 return {root,getState:()=>({
  count:physical.length,solid:true,safe,style:'shore-boulder-matched',
  referenceMaterialExact:meshes.every(m=>m.material===M.cliff),
  referenceTextureExact:meshes.every(m=>m.material.map===M.cliff.map),
  referenceGeometry:meshes.every(m=>m.geometry.type==='IcosahedronGeometry'),
  referenceDetail:2,
  fullyOpaque:meshes.every(m=>!m.material.transparent&&m.material.depthWrite),
  noExtraTints:meshes.every(m=>m.geometry.getAttribute('color')===undefined),
  meshes:meshes.length,
  parts:meshes.map(m=>({name:m.name,vertices:m.geometry.attributes.position.count,
    material:m.material.type})),
  sites:physical
 })};
}
