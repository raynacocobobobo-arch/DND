import * as T from 'three';
import {group,rr,rng,coastalHeight,add,box,cyl,ico,beam,pipe,material,M} from './v9-world.js?v=10b';
const pineMat=['#243f35','#2c4d3a','#365a43','#45654a','#536b43'].map(c=>material(c,.98,0,{flatShading:true}));
const warmRock=material('#747e82',.97,0,{flatShading:true});
const shoreRock=material('#59676e',.99,0,{flatShading:true});
const redCladding=material('#963a35',.89);
const redTrim=material('#8e302c',.9);
const cream=material('#ede5d6',.82);
const roof=material('#32383c',.95);
const door=material('#4a7190',.78);
const dark=material('#252b2c',.93);
const wood=material('#806046',.94);
const woodTop=material('#ae8561',.94);
const woodEdge=material('#674931',.99);
const warmWindow=new T.MeshStandardMaterial({color:0xf1d7a8,roughness:.24,emissive:0xffa653,emissiveIntensity:.0});
const waterBoat=material('#e5e6d4',.85);
const boatHull=material('#335363',.66);
const copper=material('#b56845',.65,.18);
const lamplit=material('#fff2c8',.32,0,{emissive:0xffd67e,emissiveIntensity:0});
const fireMat=material('#e4a560',.42,0,{emissive:0xff6b20,emissiveIntensity:0});
const glowParts={warmWindow,lamplit,fireMat};
const lights={};
function preciseRocks(x,z,rx,ry,rz,c=warmRock,rot=0){
 const geo=new T.DodecahedronGeometry(1,0),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
   const a=p.getX(i),b=p.getY(i),d=p.getZ(i);
   const scale=1+.07*Math.sin(a*7+d*4)+.08*Math.cos(b*5+a*2);
   p.setXYZ(i,a*scale,b*scale,d*scale);
 }
 const item=add(geo,c,x,coastalHeight(x,z)+ry*.31,z);
 item.scale.set(rx,ry,rz);item.rotation.y=rot;return item;
}

export function buildRockyIsland(){
 // Shoreline rocky banks follow the reference: continuous stone clusters at right foreground.
 const edge=[
 [4.75,1.20,.80,.68,.75],[4.62,2.12,.91,.83,.79],[4.12,2.93,1.08,.91,.88],
 [3.34,3.76,.80,.74,.82],[2.56,4.13,.56,.45,.58],
 [.97,4.30,.43,.39,.44],
 [4.65,-.02,.69,.62,.74],[4.58,-1.03,.63,.61,.75],
 [4.04,-3.10,.84,.90,.87],[3.47,-3.69,.70,.73,.68],
 [-4.80,-2.45,1.15,.90,1.08],[-4.38,-3.22,1.02,1.08,.96],
 [-5.00,.38,.76,.76,.74],[-5.06,1.38,.78,.71,.69],[-4.97,2.48,.60,.56,.65]
 ];
 for(let i=0;i<edge.length;i++){
  let [x,z,rx,ry,rz]=edge[i];preciseRocks(x,z,rx,ry,rz,i%4===0?shoreRock:warmRock,rr(-1,1));
 }
 // Larger, unified rocks form the island bank under the porch and front stairs.
 for(const [x,z,a,b,c] of [[.40,3.90,.34,.32,.38],
 [1.63,3.81,.63,.55,.64],[3.90,1.12,.72,.55,.70],[-.98,3.65,.46,.42,.49]]){
  preciseRocks(x,z,a,b,c,shoreRock,rr(-.8,.8));
 }
 for(let i=0;i<13;i++){
  const sector=i%3, cx=sector===0?4.07:sector===1?.75:3.25,cz=sector===0?2.55:sector===1?4.0:3.65;
  const x=cx+rr(-.50,.50),z=cz+rr(-.51,.51),s=rr(.14,.30);
  preciseRocks(x,z,s*1.18,s*.90,s,i%4===0?shoreRock:warmRock,rr(-2,2));
 }
}

function makePine(x,z,height,radius,seed){
 const y=coastalHeight(x,z),base=y+.012;
 cyl(.07,.115,height*.73,7,woodEdge,x,base+height*.34,z);
 for(let k=0;k<4;k++){
   const h=height*(.40-k*.071),width=radius*(1-k*.17),cy=base+height*(.42+k*.158);
   const cone=add(new T.ConeGeometry(width,h,5,1,false,Math.PI*.12),pineMat[(seed+k)%pineMat.length],x,cy,z);
   cone.rotation.y=(seed+k)*.3;
 }
}

export function buildPineForest(){
 // Layered pine silhouettes rise behind the lighthouse and form a dense right-hand forest.
 const positions=[
 [-4.75,-1.64,2.30,.59],[-3.53,-2.87,2.62,.73],[-2.44,-3.39,2.23,.56],
 [1.94,-3.20,3.32,.78],[2.97,-2.89,3.16,.76],[3.95,-2.20,2.83,.68],
 [4.35,-.94,2.50,.61],[4.72,.28,1.82,.46],
 [3.34,-.64,2.56,.60],[3.41,.86,1.80,.48],[4.15,1.28,1.42,.38],
 [2.37,.36,1.47,.41],[1.46,-3.70,1.58,.43]
 ];
 for(let i=0;i<positions.length;i++)makePine(...positions[i],i);
 const tufts=[[-4.70,-2.35],[-4.10,-3.00],[-2.5,-3.70],
 [1.80,-3.88],[2.66,-3.47],[3.32,-1.08],[4.31,-1.48],[4.56,.84],
 [3.85,1.64],[3.50,2.28],[4.22,2.66]];
 const grasses=[material('#576d42'),material('#788c50'),material('#485b39')];
 for(let i=0;i<tufts.length;i++)for(let k=0;k<3;k++){
  const [tx,tz]=tufts[i],x=tx+rr(-.16,.16),z=tz+rr(-.17,.17),h=rr(.09,.19);
  const o=add(new T.ConeGeometry(rr(.024,.041),h,3),grasses[(i+k)%3],
   x,coastalHeight(x,z)+h*.5,z);o.rotation.z=rr(-.24,.24);o.castShadow=false;
 }
}

export function buildLighthouse(){
 const x=.82,z=-2.38,ground=coastalHeight(x,z),height=4.86;
 cyl(.88,1.05,.34,24,M.stone,x,ground+.15,z);
 cyl(.77,.91,.75,24,redTrim,x,ground+.53,z);
 const sections=9,base=ground+.92;
 for(let i=0;i<sections;i++){
   let t=i/sections,tn=(i+1)/sections;
   cyl(.48+(1-tn)*.26,.48+(1-t)*.26,height/sections+.007,24,
     i%2===0?M.white:redCladding,x,base+(i+.5)*height/sections,z);
 }
 const deck=base+height;
 cyl(.68,.72,.14,24,cream,x,deck+.08,z);
 cyl(.75,.72,.11,24,roof,x,deck+.17,z);
 // Glass lantern with lit central lens, a gallery railing and conical red tip.
 cyl(.49,.49,.69,12,M.glass,x,deck+.61,z);
 cyl(.19,.20,.62,12,lamplit,x,deck+.61,z);
 cyl(.56,.56,.09,16,cream,x,deck+1.02,z);
 cyl(0,.60,.48,20,redCladding,x,deck+1.31,z);
 ico(.047,copper,x,deck+1.58,z,1);
 for(let i=0;i<14;i++){
  const a=i*2*Math.PI/14,xx=x+.70*Math.cos(a),zz=z+.70*Math.sin(a);
  beam([xx,deck+.16,zz],[xx,deck+.78,zz],.017,dark);
  beam([x+.49*Math.cos(a),deck+.28,z+.49*Math.sin(a)],
       [x+.49*Math.cos(a),deck+1.00,z+.49*Math.sin(a)],.016,dark);
 }
 for(const y of [deck+.19,deck+.77]){
   const tor=add(new T.TorusGeometry(.70,.022,7,52),dark,x,y,z);tor.rotation.x=Math.PI/2;
 }
 // Small inset square tower windows on front and near-facing left.
 for(let j of [1,3,5,7]){
  const y=base+j*height/sections;
  const r=.48+(1-(j+.5)/sections)*.26;
  box(.19,.29,.052,cream,x,y,z+r+.03);
  box(.105,.21,.064,j===5?warmWindow:M.glass,x,y,z+r+.069);
 }
 box(.40,.72,.12,woodEdge,x,ground+.54,z+.86);
 box(.46,.07,.15,cream,x,ground+.92,z+.87);
 lights.beacon=new T.PointLight(0xffcf7e,0,11,1.4);
 lights.beacon.position.set(x,deck+.63,z);group.add(lights.beacon);
 const can=document.createElement('canvas');can.width=128;can.height=128;
 const ctx=can.getContext('2d'),g=ctx.createRadialGradient(64,64,3,64,64,63);
 g.addColorStop(0,'rgba(255,252,202,1)');g.addColorStop(.23,'rgba(255,221,146,.76)');
 g.addColorStop(1,'rgba(255,190,98,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const tex=new T.CanvasTexture(can);
 const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));
 sprite.position.set(x,deck+.63,z);sprite.scale.set(2.05,2.05,1);group.add(sprite);
 lights.beaconGlow=sprite;
}


function roofPlane(pts,m){
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute([...pts[0],...pts[1],...pts[2],...pts[0],...pts[2],...pts[3]],3));
 g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));
 g.computeVertexNormals();
 const o=add(g,m);o.material.side=T.DoubleSide;return o;
}
export function buildDeckAndHouse(){
 const x=-3.22,z=1.57,deck=1.49,ww=4.75,dd=3.96;
 const rear=z-dd/2,front=z+dd/2,left=x-ww/2,right=x+ww/2;
 // Cohesive platform: distinct decking plank spacing, framing beams, sill and structural stilts.
 const n=27,plank=dd/n;
 for(let i=0;i<n;i++){
   box(ww-.06,.085,plank*.89,woodTop,x,deck,rear+(i+.5)*plank);
 }
 for(let sx of [-1,1]){
  box(.17,.24,dd+.06,woodEdge,x+sx*(ww/2-.1),deck-.135,z);
 }
 for(let sz of [-1,1]){
  box(ww,.17,.14,woodEdge,x,deck-.13,z+sz*(dd/2-.06));
 }
 for(let ix of [-1,0,1])for(let iz of [-1,1]){
  const xx=x+ix*(ww*.455),zz=z+iz*(dd*.43);
  cyl(.11,.14,2.75,8,woodEdge,xx,.06,zz);
  box(.24,.13,.23,woodTop,xx,deck-.09,zz);
 }
 // Diagonal braces are kept below floor level so they cannot intersect house walls.
 for(let s of [-1,1]){
  const xx=x+s*ww*.44;
  beam([xx,-.65,rear+.20],[xx-s*.68,deck-.24,front-.33],.058,woodEdge);
  beam([xx,-.48,front-.21],[xx-s*.44,deck-.22,rear+.15],.045,woodEdge);
 }
 // Painted timber boathouse, facing viewer with side gable and broad front wall.
 const hx=-3.48,hz=.88,base=deck+.055,w=3.40,d=2.35,wall=1.88;
 const eave=base+wall,peak=eave+.99;
 const houseFront=hz+d/2;
 box(w,wall,d,redCladding,hx,base+wall*.5,hz);
 // Continuously painted wood siding: small shadow seams rather than oversize horizontal rods.
 for(let i=1;i<11;i++){
  const yy=base+i*wall/11;
  for(let sign of [-1,1]){
   box(w+.018,.015,.035,redTrim,hx,yy,hz+sign*(d/2+.016));
   box(.037,.015,d+.01,redTrim,hx+sign*(w/2+.014),yy,hz);
  }
 }
 // Local beams and corner boards stand proud of the walls.
 for(let sx of [-1,1]){
  box(.13,wall+.10,.10,redTrim,hx+sx*(w/2-.025),base+wall*.5,houseFront+.05);
 }
 // Genuine gabled roof: ridge runs across X. Roof slopes toward FRONT and BACK, not side walls.
 const xmin=hx-w/2-.22,xmax=hx+w/2+.22,zmin=hz-d/2-.22,zmax=hz+d/2+.22;
 const darkRoof=material('#30363d',.99,0,{side:T.DoubleSide,flatShading:true});
 roofPlane([[xmin,eave,zmin],[xmax,eave,zmin],[xmax,peak,hz],[xmin,peak,hz]],darkRoof);
 roofPlane([[xmin,peak,hz],[xmax,peak,hz],[xmax,eave,zmax],[xmin,eave,zmax]],darkRoof);
 // Triangular gable fills at both ends, the key geometry missing in V8.
 const gable=(xx)=>{
  const gg=new T.BufferGeometry();
  gg.setAttribute('position',new T.Float32BufferAttribute([
   xx,eave,hz-d/2, xx,eave,hz+d/2, xx,peak-.016,hz
  ],3));
  gg.computeVertexNormals();
  return add(gg,new T.MeshStandardMaterial({color:'#a33c34',roughness:.96,side:T.DoubleSide}));
 };
 gable(hx-w/2);gable(hx+w/2);
 // Dark fascia and ridge; each edge is flush with the roof, no floating strips.
 beam([xmin,peak+.007,hz],[xmax,peak+.007,hz],.028,darkRoof);
 for(let xx of [xmin,xmax]){
  beam([xx,eave,zmin],[xx,peak,hz],.035,woodEdge);
  beam([xx,peak,hz],[xx,eave,zmax],.035,woodEdge);
 }
 for(let zz of [zmin,zmax])beam([xmin,eave,zz],[xmax,eave,zz],.039,woodEdge);
 // Individual roof shingle seams across roof planes, following slopes.
 for(let k=1;k<8;k++)for(let side of [-1,1]){
  let t=k/8,zz=hz+side*(d/2+.22)*t,yy=peak-(peak-eave)*t+.010;
  beam([xmin+.03,yy,zz],[xmax-.03,yy,zz],.009,roof);
 }
 // Front door/window frames are mounted on exterior faces and never through the roof.
 const yWindow=base+1.11,face=houseFront+.041;
 function frontWindow(wx,y,s=.46){
  box(s+.15,s+.15,.067,cream,wx,y,face);
  box(s,s,.075,warmWindow,wx,y,face+.050);
  box(.036,s+.04,.096,cream,wx,y,face+.092);
  box(s+.04,.034,.098,cream,wx,y,face+.094);
  box(s+.25,.075,.20,cream,wx,y-s*.65,face+.055);
  // Deep dark red window shutters make the cottage a readable finished building.
  for(let side of [-1,1])box(.11,s+.10,.075,redTrim,wx+side*(s*.60+.08),y,face+.048);
 }
 frontWindow(hx-1.06,yWindow,.42);
 frontWindow(hx+1.06,yWindow,.43);
 // Blue entrance and door transom on the cabin's broad front facade.
 const dx=hx+.05,doorY=base+.605;
 box(.69,1.27,.055,cream,dx,doorY,face);
 box(.56,1.14,.092,door,dx,doorY,face+.049);
 box(.036,.036,.045,copper,dx+.18,doorY-.11,face+.11);
 box(.82,.11,.30,woodEdge,dx,base+.06,face+.20);
 // White paneled service/garage doors on the gable end facing the viewer.
 const sideX=hx+w/2+.055,garageZ=hz-.06;
 box(.085,1.53,1.67,cream,sideX,base+.80,garageZ);
 box(.103,1.39,1.51,material('#e7e1d0',.84),sideX+.042,base+.78,garageZ);
 box(.112,1.30,.038,redTrim,sideX+.094,base+.77,garageZ);
 for(let i=0;i<3;i++)for(let k=0;k<2;k++){
  box(.022,.35,.57,cream,sideX+.111,base+.33+i*.40,garageZ+(k-.5)*.72);
 }
 // A compact triangular attic window, kept within gable boundaries.
 const attic=new T.Group();group.add(attic);attic.position.set(sideX+.09,eave+.31,hz);
 box(.042,.23,.27,cream,0,0,0,attic);
 box(.055,.16,.17,warmWindow,.025,0,0,attic);
 // Small working details: rain gutters, electrical meters, a side vent and exterior sconce.
 const graphite=material('#485052',.69,.22);
 for(let side of [-1,1]){ // rain gutters along roof edges
  beam([xmin,eave-.058,hz+side*(d/2+.24)],[xmax,eave-.058,hz+side*(d/2+.24)],.027,graphite);
 }
 box(.23,.35,.15,material('#ded8c9',.81),hx+.93,base+.60,houseFront+.10);
 box(.12,.12,.18,graphite,hx+.93,base+.57,houseFront+.23);

 const lampM=material('#f8d29b',.35,0,{emissive:0xffbd6a,emissiveIntensity:2.0});
 box(.14,.21,.10,graphite,hx+.63,base+1.64,houseFront+.09);
 box(.088,.14,.12,lampM,hx+.63,base+1.64,houseFront+.13);
 // A low front shelf and porch crates, not a dark bar above the left window.
 for(const [px,pz] of [[hx-1.18,face+.68],[hx+.96,face+.57]]){
  box(.43,.36,.38,wood,px,deck+.21,pz);
  box(.45,.058,.41,woodTop,px,deck+.43,pz);
 }
 // Porch rail posts, no arbitrary floating ropes.
 for(let i=0;i<6;i++){
  const xx=left+.31+i*(ww-.62)/5;
  if(i===3||i===4)continue;
  cyl(.045,.060,.71,7,woodEdge,xx,deck+.40,front-.09);
 }
 for(const sx of [-1,1])for(let i=0;i<4;i++){
  cyl(.045,.060,.69,7,woodEdge,x+sx*(ww/2-.09),deck+.40,rear+.23+i*(dd-.46)/3);
 }
 // Front-to-right wood stair, not intersecting the island rocks or sea.
 const sx=right-.42,sz=front-1.12;
 for(let i=0;i<5;i++){
  const stepY=deck-(i+.5)*.18;
  const stepX=sx+(i+.55)*.28;
  box(1.07,.095,.48,woodTop,stepX,stepY,sz);
  for(let side of [-1,1])box(.067,.13,.52,woodEdge,stepX,stepY-.10,sz+side*.25);
 }
 // Thin upright timber ladder against lower platform, explicitly below the edge.
 for(let s of [-1,1]){
  beam([left+.65+s*.29,-.60,front-.18],[left+.65+s*.29,deck-.20,front-.18],.045,woodEdge);
 }
 for(let i=0;i<7;i++)box(.69,.045,.07,woodTop,left+.65,-.48+i*.28,front-.18);

 // Horizontal safety rails connecting selected porch posts, with a gap for the stair landing.
 for(const side of [-1,1]){
  const xx=x+side*(ww/2-.10);
  for(let height of [.47,.72]){
   beam([xx,deck+height,rear+.25],[xx,deck+height,front-1.10],.030,woodEdge);
  }
 }
 for(const side of [-1,1]){
  const zz=front-.10;
  const x0=side<0?left+.27:right-1.35;
  const x1=side<0?x-.45:right-.24;
  for(let height of [.47,.70])beam([x0,deck+height,zz],[x1,deck+height,zz],.028,woodEdge);
 }
 // Three timber crates with corner edges and nailed slats; staggered, not tiled.
 const crate=(px,pz,w=.39,h=.32)=>{
  box(w,h,w,wood,px,deck+h*.50+.035,pz);
  box(w+.012,.035,w+.012,woodTop,px,deck+h+.047,pz);
  for(let sy of [-1,1]){
   box(w+.016,.028,.035,woodEdge,px,deck+.13,pz+sy*w*.51);
   box(w+.016,.028,.035,woodEdge,px,deck+.30,pz+sy*w*.51);
  }
 };
 crate(left+.43,front-.56,.40);
 crate(left+.83,front-.66,.32);
 crate(right-.45,rear+.57,.28,.29);
 // Fishing-tool rack, wall ventilation and a coiled cable on an exterior workbench.
 box(.72,.055,.29,woodTop,right-.69,deck+.62,rear+.48);
 for(let i=0;i<3;i++){
  beam([right-.98+i*.18,deck+.38,rear+.47],[right-.98+i*.18,deck+.83,rear+.47],.015,graphite);
 }
 const ring=add(new T.TorusGeometry(.15,.015,6,36),woodEdge,right-.69,deck+.68,rear+.46);
 ring.rotation.x=Math.PI*.48;
 // Light-garland supports run from the left railing to the house, carefully separated from cabin.
 const lampBulb=material('#f4e4a6',.40,0,{emissive:0xffcf83,emissiveIntensity:.9});
 glowParts.stringBulbs=lampBulb;
 const festoon=material('#464343',1);
 const postA=[left-.12,deck+1.92,front-.37],postB=[right-.68,deck+2.10,front-.12];
 beam([postA[0],deck+.12,postA[2]],postA,.034,woodEdge);
 beam([postB[0],deck+.12,postB[2]],postB,.034,woodEdge);
 const positions=[];
 lights.festoon=[];
 for(let i=0;i<=12;i++){
   const t=i/12;
   const px=postA[0]+(postB[0]-postA[0])*t;
   const py=postA[1]+(postB[1]-postA[1])*t-.22*Math.sin(t*Math.PI);
   const pz=postA[2]+(postB[2]-postA[2])*t;
   positions.push([px,py,pz]);
   if(i>0 && i<12 && i%2===0){
     ico(.056,lampBulb,px,py-.052,pz,1);
     beam([px,py,pz],[px,py-.058,pz],.012,graphite);
     const little=new T.PointLight(0xffc67a,0,3.2,1.8);
     little.position.set(px,py-.07,pz);group.add(little);
     lights.festoon.push(little);
   }
 }
 pipe(positions,.010,festoon);
 // On the right, shorter accent lights reveal the stair and camp entrance at night.
 const lamp2=[right+.25,deck+1.55,front-.95];
 beam([lamp2[0],deck-.10,lamp2[2]],lamp2,.038,woodEdge);
 box(.11,.13,.10,lampBulb,lamp2[0],deck+1.47,lamp2[2]);

 // Braced beams beneath the front row, visible from the low-angle camera.
 for(let i of [-1,1]){
  beam([x+i*(ww*.42),deck-.14,front-.14],[x+i*(ww*.25),-.63,front-.17],.047,woodEdge);
 }
 // Shoreward path: a few stepping timbers follow the actual terrain, not a raised artificial patch.
 const stepping=[[.50,2.45],[.80,2.36],[1.07,2.27],[1.30,2.13]];
 for(const [px,pz] of stepping){
  const gy=coastalHeight(px,pz);
  const st=box(.28,.060,.51,woodTop,px,gy+.026,pz);
  st.rotation.y=.08;
 }
 // Supply barrels near the stairs (not seating or stools).
 function supplyBarrel(px,pz){
  const gy=coastalHeight(px,pz),height=.53;
  cyl(.18,.17,height,11,wood,px,gy+height*.5,pz);
  for(const t of [.09,.45])cyl(.19,.19,.036,11,graphite,px,gy+t,pz);
  const cap=cyl(.178,.178,.025,11,woodTop,px,gy+height+.008,pz);
  cap.castShadow=true;
 }
 supplyBarrel(-.59,2.71);
 // A small dark utility pole by the walkway with a warm lamp.
 beam([.83,coastalHeight(.83,2.37),2.37],[.83,1.87,2.37],.029,woodEdge);
 const pathLamp=box(.10,.12,.10,lampBulb,.83,1.76,2.37);
 lights.house1=new T.PointLight(0xffaa6b,0,8,1.5);lights.house1.position.set(hx-.9,base+1.40,houseFront+.66);group.add(lights.house1);
 lights.house2=new T.PointLight(0xffba73,0,7,1.5);lights.house2.position.set(hx+1.1,base+1.32,houseFront+.63);group.add(lights.house2);
}

function buildBoat(){
 // Fully solid small service skiff, no mooring rope. The water cannot intersect its open interior.
 const parent=new T.Group();group.add(parent);
 parent.name='serviceBoat';
 parent.position.set(-2.55,.50,5.10);parent.rotation.y=-.36;
 const L=2.34,B=.66,n=32,rings=5,vertices=[],uv=[],indices=[];
 const hull=material('#315768',.60,0,{side:T.DoubleSide});
 const rubber=material('#d9d5c9',.81);
 // Two plank-sided hull halves with a solid dark floor placed safely ABOVE water surface.
 for(let side of [-1,1]){
   const start=vertices.length/3;
   for(let i=0;i<=n;i++){
    const t=i/n*2-1,width=B*Math.pow(Math.max(.005,1-t*t),.72),rise=.10*Math.pow(Math.abs(t),3);
    for(let j=0;j<=rings;j++){
      const a=j/rings;
      vertices.push(t*L*.5,-.28+.43*a+rise,side*width*(.28+.72*a));
      uv.push(i/n,a);
    }
   }
   for(let i=0;i<n;i++)for(let j=0;j<rings;j++){
     const a=start+i*(rings+1)+j,b=a+rings+1;
     indices.push(a,a+1,b,a+1,b+1,b);
   }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 add(g,hull,0,0,0,parent);
 const floorV=[],floorUV=[],floorId=[];
 for(let i=0;i<=n;i++){
   const t=i/n*2-1,width=B*.88*Math.pow(Math.max(.005,1-t*t),.72);
   floorV.push(t*L*.5,-.105,-width,t*L*.5,-.105,width);
   floorUV.push(i/n,0,i/n,1);
   if(i<n){let a=i*2;floorId.push(a,a+2,a+1,a+1,a+2,a+3)}
 }
 const solid=new T.BufferGeometry();solid.setAttribute('position',new T.Float32BufferAttribute(floorV,3));solid.setAttribute('uv',new T.Float32BufferAttribute(floorUV,2));solid.setIndex(floorId);solid.computeVertexNormals();
 add(solid,new T.MeshStandardMaterial({color:'#574539',roughness:1,side:T.DoubleSide}),0,0,0,parent);
 // Complete bow and stern bulkheads and gunwales.
 for(let side of [-1,1]){
  const pts=[];for(let i=0;i<=n;i++){
   const t=i/n*2-1;
   pts.push([t*L/2,.155+.10*Math.pow(Math.abs(t),3),side*B*Math.pow(Math.max(.005,1-t*t),.72)]);
  }
  pipe(pts,.027,rubber,parent);
 }
 for(const t of [-.88,.88]){
  box(.12,.34,.25,hull,t*L*.5,-.07,0,parent);
 }
 // Seats live above the watertight floor and never cross the surface.
 for(const tx of [-.62,.52]){
  box(.11,.07,B*1.43,woodTop,tx,.012,0,parent);
 }
 // Compact wheelhouse with cream paneling, dark roof, warm circular portholes.
 box(.76,.59,.76,waterBoat,-.20,.43,0,parent);
 box(.87,.085,.89,roof,-.20,.75,0,parent);
 box(.09,.56,.76,cream,-.59,.42,0,parent);
 const portholeMat=material('#ffdf99',.33,0,{emissive:0xffac52,emissiveIntensity:2.2});
 for(const sign of [-1,1]){
  const o=add(new T.TorusGeometry(.122,.029,8,24),copper,-.21,.48,sign*.391,parent);
  o.rotation.x=Math.PI/2;
  const disk=add(new T.CircleGeometry(.105,24),portholeMat,-.21,.48,sign*.402,parent);
  disk.rotation.y=sign===1?0:Math.PI;
 }
 // Wheelhouse forward pane and white railing.
 box(.47,.29,.024,M.glass,.22,.50,0,parent);
 const bow=box(.46,.060,B*.82,redTrim,.79,.19,0,parent);
 beam([.72,.19,-B*.80],[.72,.19,B*.80],.025,cream,parent);
 // Fenders with individual dark painted accents: no loop / ring-only hull.
 for(const sign of [-1,1])for(let i=0;i<3;i++){
  ico(.062,waterBoat,-.68+i*.60,.04,sign*.57,1,parent);
 }
}
export function buildCampfire(){
 const x=1.80,z=1.70,ground=coastalHeight(x,z);
 // No raised green disk: stones and logs touch the CONTINUOUS island terrain.
 for(let i=0;i<13;i++){
  const a=i*2*Math.PI/13,r=.48,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
  const local=coastalHeight(px,pz),size=rr(.12,.22);
  const stone=ico(1,i%3===0?warmRock:shoreRock,px,local+.045,pz,0);
  stone.scale.set(size,Math.max(.095,size*.55),size*.88);
 }
 for(let i=0;i<4;i++){
  const a=i*Math.PI/4,dx=Math.cos(a)*.34,dz=Math.sin(a)*.34;
  beam([x-dx,ground+.10,z-dz],[x+dx,ground+.10,z+dz],.046,woodEdge);
 }
 const fireGroup=new T.Group();group.add(fireGroup);
 fireGroup.position.set(x,ground+.125,z);
 add(new T.ConeGeometry(.19,.53,6),fireMat,0,.27,0,fireGroup);
 add(new T.ConeGeometry(.12,.40,6),lamplit,.045,.21,.045,fireGroup);
 fireGroup.userData.isFire=true;
 lights.fire=new T.PointLight(0xff873d,0,6.5,1.5);
 lights.fire.position.set(x,ground+.50,z);group.add(lights.fire);
 return fireGroup;
}
export function buildSite(){
 buildRockyIsland();
 buildPineForest();
 buildLighthouse();
 buildDeckAndHouse();
 buildBoat();
 const fire=buildCampfire();
 return {lights,glowParts,fire};
}
