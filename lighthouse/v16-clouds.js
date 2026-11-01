import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v15-world.js?v=15a';

/** One irregular row of large opaque Low Poly cumulus, concealing the square sea edge.
 * Intentionally asymmetrical, with no inner/outer rings, mirrored spacing or fog planes.
 */
export function createSquareCloudBorder(){
 const root=new T.Group();root.name='single-irregular-cloud-bank';group.add(root);
 const centerX=WATER_CENTER_X,centerZ=WATER_CENTER_Z,hx=W*.5,hz=D*.5;
 // side: north/east/south/west; along: -1..1; depth: distance from center / half-extent.
 // Four sides have different density, scale, penetration and spacing. No second row.
 const specs=[
  {side:0,along:-.92,depth:.88,width:8.0,up:2.65,bulk:1.15,seed:11},
  {side:0,along:-.36,depth:.91,width:6.5,up:2.95,bulk:.98,seed:19},
  {side:0,along:.20,depth:.84,width:9.2,up:2.35,bulk:1.34,seed:27},
  {side:0,along:.87,depth:.95,width:6.4,up:3.22,bulk:.90,seed:39},
  {side:1,along:-.83,depth:.89,width:8.8,up:2.60,bulk:1.14,seed:41},
  {side:1,along:-.09,depth:.83,width:9.6,up:2.10,bulk:1.40,seed:53},
  {side:1,along:.78,depth:.96,width:6.8,up:3.04,bulk:.86,seed:61},
  {side:2,along:-.94,depth:.94,width:7.6,up:2.80,bulk:1.09,seed:73},
  {side:2,along:-.48,depth:.84,width:9.6,up:2.24,bulk:1.36,seed:83},
  {side:2,along:.15,depth:.93,width:6.3,up:3.12,bulk:.97,seed:97},
  {side:2,along:.82,depth:.86,width:9.0,up:2.50,bulk:1.30,seed:103},
  {side:3,along:-.78,depth:.91,width:7.3,up:2.86,bulk:1.03,seed:113},
  {side:3,along:.02,depth:.82,width:9.4,up:2.16,bulk:1.35,seed:127},
  {side:3,along:.88,depth:.94,width:7.4,up:2.95,bulk:1.01,seed:139}
 ];
 let seed=26021102;
 const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 const range=(a,b)=>a+(b-a)*random();
 const palette=[
  {day:'#eef1ef',night:'#596c7e'},
  {day:'#f6f7f3',night:'#667a8a'},
  {day:'#dce4e5',night:'#4a6073'},
  {day:'#e7eeec',night:'#536a7d'}
 ];
 const parts=palette.map(()=>[]);
 const clusters=[];
 for(const s of specs){
  const axisX=s.side%2===0,sign=(s.side===0||s.side===3)?-1:1;
  // Tangential axis is X for north/south and Z for east/west.
  const x=centerX+(axisX?s.along*hx:sign*s.depth*hx);
  const z=centerZ+(axisX?sign*s.depth*hz:s.along*hz);
  const tangentX=axisX?1:0,tangentZ=axisX?0:1;
  const inwardX=axisX?0:-sign,inwardZ=axisX?-sign:0;
  const id=clusters.length,phase=range(0,Math.PI*2);
  clusters.push({id,side:s.side,x,z,width:s.width,penetration:1-s.depth,altitude:s.up});
  // One large central nucleus, then asymmetrical, progressively smaller cloud lobes.
  // Overall silhouette ranges from tall cumulus to long, low windswept clusters.
  const bulk=s.bulk;
  const layout=[
   {a:-.08,h:.10,wt:1.00,ht:1.0,d:1.0},
   {a:-.44,h:-.20,wt:.76,ht:.72,d:.75},
   {a:.40,h:-.16,wt:.79,ht:.77,d:.79},
   {a:-.70,h:-.34,wt:.52,ht:.59,d:.60},
   {a:.72,h:-.30,wt:.50,ht:.56,d:.58},
   {a:.08,h:.55,wt:.61,ht:.68,d:.60},
   {a:-.26,h:.43,wt:.45,ht:.59,d:.54},
   {a:.90,h:-.49,wt:.33,ht:.40,d:.42}
  ];
  const count=6+(s.seed%3);
  const materialIndex=s.seed%palette.length;
  for(let j=0;j<count;j++){
   const p=layout[j],jitter=range(.88,1.12);
   const px=x+tangentX*(p.a*s.width*.48+range(-.22,.22))+
     inwardX*range(-.65,.42);
   const pz=z+tangentZ*(p.a*s.width*.48+range(-.22,.22))+
     inwardZ*range(-.65,.42);
   const horiz=s.width*(j===0?.255:.21)*p.wt*jitter;
   const height=(1.38+.24*bulk)*p.ht*range(.91,1.08);
   const depth=(1.95+.27*bulk)*p.d*range(.90,1.08);
   const py=s.up+p.h*(1.45+.20*bulk)+range(-.11,.11);
   parts[materialIndex].push({id,side:s.side,
    x:px,y:py,z:pz,sx:horiz,sy:height,sz:depth,
    yaw:range(-.32,.32),phase});
  }
 }
 // Only 4 instanced draw calls, even with large faceted compound clouds.
 const geometry=new T.IcosahedronGeometry(1,1),dummy=new T.Object3D();
 const meshes=parts.map((rec,i)=>{
  const mat=new T.MeshLambertMaterial({color:palette[i].night,flatShading:true});
  const mesh=new T.InstancedMesh(geometry,mat,rec.length);
  mesh.name='irregular-cumulus-lobes';mesh.frustumCulled=false;
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  mesh.castShadow=false;mesh.receiveShadow=false;root.add(mesh);
  return mesh;
 });
 let elapsed=0,mode='night',lastUpdate=-1;
 function update(dt,dayBlend=0){
  elapsed+=Math.max(0,Math.min(dt||0,.3));
  const blend=T.MathUtils.clamp(dayBlend,0,1);
  meshes.forEach((mesh,i)=>{
   mesh.material.color.copy(new T.Color(palette[i].night))
     .lerp(new T.Color(palette[i].day),blend);
  });
  if(elapsed-lastUpdate<.055)return;
  lastUpdate=elapsed;
  for(let m=0;m<meshes.length;m++){
   const rec=parts[m],mesh=meshes[m];
   for(let i=0;i<rec.length;i++){
    const p=rec[i];
    const drift=.075*Math.sin(elapsed*.11+p.phase);
    dummy.position.set(p.x+(p.side%2===0?drift:0),
      p.y+.055*Math.sin(elapsed*.23+p.phase),
      p.z+(p.side%2!==0?drift:0));
    dummy.rotation.set(0,p.yaw,0);
    dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();
    mesh.setMatrixAt(i,dummy.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 function setMode(value){mode=value==='day'?'day':'night';}
 update(.1,0);
 const puffCount=parts.reduce((sum,a)=>sum+a.length,0);
 return {root,update,setMode,getState:()=>({
  shape:'square',layerCount:1,clusterCount:clusters.length,puffCount,
  meshCount:meshes.length,opaque:true,fogMeshCount:0,mode,
  edgePenetration:{min:Math.min(...clusters.map(c=>c.penetration)),
    max:Math.max(...clusters.map(c=>c.penetration))},
  bounds:{width:W,depth:D},
  clusters:clusters.map(c=>({...c}))
 })};
}
