import * as T from 'three';
import {group,W,D,WATER_CENTER_X,WATER_CENTER_Z} from './v26-world.js?v=26a';

/** Exactly three permanently visible, different-sized gray-violet offshore rocks.
 * Triangulated, individually colored faceted stone; ocean remains fully flat.
 */
export function createOffshoreReefs(){
 const root=new T.Group();root.name='three-offshore-lowpoly-reefs';group.add(root);
 const sites=[
  {x:-11.0,z:8.0,height:1.70,sx:1.13,sz:.83,lean:-.19,seed:17,shape:'tall-spire'},
  {x:9.0,z:7.0,height:1.32,sx:.93,sz:.75,lean:.24,seed:38,shape:'slanted-spire'},
  {x:-6.0,z:-8.0,height:.69,sx:1.18,sz:.70,lean:-.07,seed:61,shape:'low-outcrop'}
 ];
 const tentacleSites=[
  [-12.2,3.4],[-12.4,-3.3],[-9.4,-9.3],[-3.3,-11.3],
  [3.4,-11.2],[9.4,-9],[12.4,-3],[12.2,3.3]
 ];
 const pirateStart=[9.5,WATER_CENTER_Z-D/2];
 const pirateEnd=[WATER_CENTER_X+W/2,
  pirateStart[1]+(WATER_CENTER_X+W/2-pirateStart[0])];
 function segmentDistance(x,z,a,b){
  const dx=b[0]-a[0],dz=b[1]-a[1];
  const t=T.MathUtils.clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
 }
 const minKrakenGap=sites.map(p=>Math.min(...tentacleSites.map(
  ([x,z])=>Math.hypot(p.x-x,p.z-z))));
 const shipGaps=sites.map(p=>segmentDistance(p.x,p.z,pirateStart,pirateEnd));
 const withinBounds=sites.every(p=>
  Math.abs(p.x-WATER_CENTER_X)+p.sx<W*.5-1&&
  Math.abs(p.z-WATER_CENTER_Z)+p.sz<D*.5-1);
 const outsideIsland=sites.every(p=>
  Math.hypot((p.x+.2)/5.38,(p.z-.25)/4.34)>1.55);
 // Rock footprint + Kraken reach and pirate half-widths are included.
 const safe=withinBounds&&outsideIsland&&minKrakenGap.every((d,i)=>d>sites[i].sx+2.1)
  &&shipGaps.every((d,i)=>d>sites[i].sx+2.1)&&
  sites.every(p=>Math.hypot(p.x+2,p.z-6.1)>6.0);
 if(!safe)throw new Error('Offshore reef collides with island, small boat or night route');
 const palette=['#777483','#8b8696','#696978','#9791a1','#777988','#5e6171','#aaa2aa'];
 let count=0;
 const specimens=sites.map((s,index)=>{
  const vertices=[],colors=[];
  const sides=index===2?10:9;
  const rings=[
   {y:-.34,rad:1.00,shift:.0},
   {y:s.height*.18,rad:.93,shift:.07},
   {y:s.height*.60,rad:index===2?.67:.58,shift:s.lean*.44},
   {y:s.height*.86,rad:index===2?.40:.30,shift:s.lean*.80}
  ];
  const angles=Array.from({length:sides},(_,i)=>{
   const a=i*2*Math.PI/sides+.2;
   const mod=1+.17*Math.sin(i*2.62+s.seed)+.09*Math.cos(i*4.5+s.seed);
   return {a,mod};
  });
  const ringPoint=(j,i)=>{
   const ring=rings[j],v=angles[i%sides];
   return [
    s.lean*ring.shift+Math.cos(v.a)*s.sx*ring.rad*v.mod,
    ring.y+.030*Math.sin(v.a*3+s.seed),
    Math.sin(v.a)*s.sz*ring.rad*v.mod
   ];
  };
  const colorFor=(j,i,k)=>{
   const h=Math.abs(Math.sin((s.seed+j*17+i*29+k*5)*.31));
   const id=(Math.floor(h*palette.length)+j+i)%palette.length;
   return new T.Color(palette[id]);
  };
  function triangle(a,b,c,col){
   for(const p of [a,b,c]){vertices.push(...p);colors.push(col.r,col.g,col.b);}
  }
  for(let j=0;j<rings.length-1;j++){
   for(let i=0;i<sides;i++){
    const a=ringPoint(j,i),b=ringPoint(j,(i+1)%sides);
    const c=ringPoint(j+1,i),d=ringPoint(j+1,(i+1)%sides);
    triangle(a,b,c,colorFor(j,i,0));
    triangle(b,d,c,colorFor(j,i,1));
   }
  }
  const apex=[s.lean*s.height*.34,s.height, s.sz*.07];
  for(let i=0;i<sides;i++){
   triangle(ringPoint(rings.length-1,i),
    ringPoint(rings.length-1,(i+1)%sides),apex,colorFor(5,i,2));
  }
  // Submerged underside cap (not a flat visible disc on top of the sea).
  for(let i=1;i<sides-1;i++){
   triangle(ringPoint(0,0),ringPoint(0,i+1),ringPoint(0,i),colorFor(0,i,3));
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({
   vertexColors:true,flatShading:true,roughness:1,metalness:0,
   side:T.DoubleSide,transparent:false
  });
  const stone=new T.Mesh(geometry,mat);
  stone.name='offshore-reef-'+index+'-'+s.shape;
  stone.position.set(s.x,.1815,s.z);
  stone.castShadow=true;stone.receiveShadow=true;
  root.add(stone);count++;
  return {name:s.shape,x:s.x,z:s.z,height:s.height,
   footprint:s.sx,triangles:vertices.length/9,
   tentacleClearance:+minKrakenGap[index].toFixed(3),
   pirateClearance:+shipGaps[index].toFixed(3)};
 });
 return {root,getState:()=>({count,solid:true,safe,sites:specimens})};
}
