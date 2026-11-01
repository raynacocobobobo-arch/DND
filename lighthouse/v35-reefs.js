import * as T from 'three';
import {group,W,D,WATER_CENTER_X,WATER_CENTER_Z} from './v27-world.js?v=27a';
import {makeShoreStoneGeometry,warmRock,shoreRock} from './v35-site.js?v=35a';

/** Offshore rocks are constructed from precisely the same low-face
 * dodecahedron geometry and matte UNTEXTURED stone materials as the existing
 * island bank. No spherical subdivision, noise map or sharpened apexes.
 */
export function createOffshoreReefs(){
 const root=new T.Group();root.name='actual-island-stone-reefs';group.add(root);
 const seaY=.1815;
 const sites=[
  {name:'blunt-upright',x:-13.3,z:7.7,height:2.18,footprint:.72},
  {name:'chunky-boulder',x:9,z:7,height:1.23,footprint:.95},
  {name:'low-outcrop',x:-6,z:-8,height:.74,footprint:.94}
 ];
 const arms=[
  [-12.2,3.4],[-12.4,-3.3],[-9.4,-9.3],[-3.3,-11.3],
  [3.4,-11.2],[9.4,-9],[12.4,-3],[12.2,3.3]
 ];
 const entry=[9.5,WATER_CENTER_Z-D/2];
 const exit=[WATER_CENTER_X+W/2,entry[1]+(WATER_CENTER_X+W/2-entry[0])];
 function lineGap(s){
  const dx=exit[0]-entry[0],dz=exit[1]-entry[1];
  const t=T.MathUtils.clamp(((s.x-entry[0])*dx+(s.z-entry[1])*dz)/(dx*dx+dz*dz),0,1);
  return Math.hypot(s.x-entry[0]-t*dx,s.z-entry[1]-t*dz);
 }
 const gaps=sites.map(s=>({
  arms:Math.min(...arms.map(([x,z])=>Math.hypot(s.x-x,s.z-z))),
  ship:lineGap(s),skiff:Math.hypot(s.x+2,s.z-6.1)
 }));
 const safe=sites.every((s,i)=>
  Math.abs(s.x-WATER_CENTER_X)+s.footprint<W/2-1 &&
  Math.abs(s.z-WATER_CENTER_Z)+s.footprint<D/2-1 &&
  Math.hypot((s.x+.2)/5.38,(s.z-.25)/4.34)>1.55 &&
  gaps[i].arms>s.footprint+2.1&&
  gaps[i].ship>s.footprint+2.1&&gaps[i].skiff>6
 );
 if(!safe)throw Error('V30 reef conflicts with sea navigation or island');
 const meshes=[];
 function stone(parent,name,p){
  // This shared factory is the island's actual preciseRocks geometry.
  const geo=makeShoreStoneGeometry();
  geo.computeBoundingBox();
  const box=geo.boundingBox;
  const heightScale=(p.height+(p.submerged||.22))/(box.max.y-box.min.y);
  const m=new T.Mesh(geo,p.dark?shoreRock:warmRock);
  m.name=name;
  m.scale.set(p.rx,heightScale,p.rz);
  m.position.set(p.x||0,seaY+p.height-box.max.y*heightScale,p.z||0);
  m.rotation.y=p.yaw||0;
  m.rotation.z=p.bank||0;
  m.castShadow=true;m.receiveShadow=true;
  m.userData.actualShoreRock=true;
  parent.add(m);meshes.push(m);
 }
 // Shape is derived from bold blocky shore stones, not from elongated balls.
 // Tall rock stays somewhat narrow but its five-sided crown is blunted;
 // large former foreground rock is reduced substantially.
 const components=[
  [
   {rx:.55,rz:.57,height:2.18,submerged:.28,yaw:.36,bank:-.04},
   {x:-.28,z:.18,rx:.32,rz:.37,height:.69,submerged:.21,yaw:-.25,dark:true}
  ],
  [
   {rx:.77,rz:.72,height:1.23,submerged:.26,yaw:-.21,bank:.05},
   {x:-.43,z:.18,rx:.44,rz:.46,height:.70,submerged:.22,yaw:.52,dark:true}
  ],
  [
   {rx:.71,rz:.72,height:.74,submerged:.23,yaw:.29},
   {x:.41,z:-.13,rx:.41,rz:.40,height:.49,submerged:.19,yaw:-.43,dark:true}
  ]
 ];
 const description=sites.map((s,i)=>{
  const g=new T.Group();g.position.set(s.x,0,s.z);g.name='reef-'+i;root.add(g);
  components[i].forEach((v,j)=>stone(g,s.name+'-'+j,v));
  return {name:s.name,x:s.x,z:s.z,height:s.height,footprint:s.footprint,
   parts:components[i].length,
   tentacleClearance:+gaps[i].arms.toFixed(3),
   pirateClearance:+gaps[i].ship.toFixed(3)};
 });
 return {root,getState:()=>({
  style:'island-shorestone-direct',count:sites.length,meshCount:meshes.length,
  solid:true,safe,exactIslandMaterials:meshes.every(m=>m.material===warmRock||m.material===shoreRock),
  noTextureMaps:meshes.every(m=>m.material.map===null),
  referenceGeometry:meshes.every(m=>m.geometry.type==='DodecahedronGeometry'),
  lowFacets:meshes.every(m=>m.geometry.attributes.position.count<=110),
  materialColors:[warmRock.color.getHexString(),shoreRock.color.getHexString()],
  sites:description
 })};
}
