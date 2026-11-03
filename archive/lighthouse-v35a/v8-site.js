import * as T from 'three';
import {group,rr,rng,coastalHeight,add,box,cyl,ico,beam,pipe,material,M} from './world-v2.js?v=8a';
const pineMat=['#243f35','#2c4d3a','#365a43','#45654a','#536b43'].map(c=>material(c,.98,0,{flatShading:true}));
const warmRock=material('#747e82',.97,0,{flatShading:true});
const shoreRock=material('#59676e',.99,0,{flatShading:true});
const redCladding=material('#a83933',.92);
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
 // No two artificial rear peaks; compact boulder groups encircle the inhabited island.
 const rocks=[
 [-4.65,-2.92,1.06,1.14,.91],[-3.96,-3.55,.95,1.16,.95],[-3.21,-3.02,.81,.75,.83],
 [4.01,-3.20,.91,1.03,.86],[4.58,-2.62,.83,.91,.73],[3.68,-3.62,.74,.78,.69],
 [4.61,1.62,.80,.60,.90],[4.12,2.66,.79,.64,.83],[3.48,3.04,.71,.50,.68],
 [2.81,3.62,.67,.57,.63],[1.95,3.89,.53,.50,.50],[.76,3.82,.60,.41,.64],
 [-.92,3.63,.68,.57,.73],[-1.97,3.72,.53,.44,.67],[-3.92,3.44,.69,.59,.74],
 [-4.77,1.65,.56,.51,.73],[-4.85,.40,.55,.47,.59],[4.62,.28,.62,.42,.56],
 [1.43,-3.48,.58,.43,.58],[.18,-3.57,.52,.47,.61]
 ];
 for(let i=0;i<rocks.length;i++){
  let [x,z,a,b,c]=rocks[i];preciseRocks(x,z,a,b,c,i%3===0?shoreRock:warmRock,rr(-.8,.8));
 }
 // Group the smaller pebbles naturally, never inside docks, building, or the fire pit.
 for(let i=0;i<31;i++){
  const side=i%3, cx=side===0?3.62:side===1?-4.13:1.85,cz=side===0?2.60:side===1?-2.81:3.62;
  const x=cx+rr(-.75,.75),z=cz+rr(-.62,.62);
  const s=rr(.11,.31);preciseRocks(x,z,s*1.32,s*.78,s,i%2?warmRock:shoreRock,rr(0,6.28));
 }
 // Pebbles beneath wooden stilt foundations, no rocks placed on plank deck.
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
 // Tall silhouette trees behind tower/house; smaller trees frame outer right shore.
 const positions=[
 [-3.68,-2.00,2.18,.59],[-2.52,-2.68,2.95,.77],[-1.63,-2.94,1.78,.52],
 [1.52,-2.70,3.52,.84],[2.63,-2.64,3.14,.77],[3.35,-1.85,2.90,.67],
 [4.05,-.76,2.55,.62],[4.48,.30,1.65,.42],[3.26,.24,2.13,.57],
 [2.85,1.80,1.39,.38],[-4.08,-.62,1.78,.53],
 [-2.97,-1.01,1.38,.41]
 ];
 positions.forEach(([x,z,h,w],i)=>makePine(x,z,h,w,i));
 // Ground cover is concentrated under trees, not spread across the entire island.
 const tufts=[[-3.65,-1.13],[-3.48,-2.45],[-2.5,-3.0],[-1.63,-2.10],
 [1.58,-3.42],[2.72,-3.34],[3.42,-1.11],[4.2,-1.49],[4.15,.64],
 [3.71,1.52],[2.83,.22],[-4.44,-1.82],[3.75,2.5]];
 const grasses=[material('#637b45'),material('#839151'),material('#526a43')];
 for(let i=0;i<tufts.length;i++)for(let k=0;k<3;k++){
   const [tx,tz]=tufts[i],x=tx+rr(-.20,.20),z=tz+rr(-.21,.21),h=rr(.075,.175);
   const o=add(new T.ConeGeometry(rr(.025,.05),h,3),grasses[(i+k)%3],x,coastalHeight(x,z)+h*.5,z);
   o.rotation.z=rr(-.2,.2);o.castShadow=false;
 }
}

export function buildLighthouse(){
 const x=.05,z=-1.20,ground=coastalHeight(x,z),height=5.55;
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
 g.computeVertexNormals();return add(g,m);
}
export function buildDeckAndHouse(){
 const x=-2.42,z=1.62,deck=1.36,ww=4.48,dd=3.56;
 // Elevated large timber platform is a coherent construction, not separate piers.
 for(let side of [-1,1]){
  box(.19,.21,dd,woodEdge,x+side*(ww*.45),deck-.14,z);
 }
 for(let i=0;i<Math.round(ww/.18);i++){
  const left=x-ww/2,dx=ww/Math.round(ww/.18);
  const b=box(dx*.94,.105,dd,woodTop,left+(i+.5)*dx,deck,z);
  b.rotation.y=rr(-.004,.004);
 }
 // Visible support legs, cross braces and low timber beams below platform.
 for(let ix of [-1,0,1])for(let iz of [-1,1]){
   let xx=x+ix*(ww*.435),zz=z+iz*dd*.435;
   cyl(.095,.12,2.83,8,woodEdge,xx,-.07,zz);
   box(.14,.16,.14,wood,xx,deck-.05,zz);
 }
 for(let side of [-1,1]){
  beam([x+side*1.96,-.75,z-1.46],[x+side*1.25,deck-.11,z+1.47],.061,woodEdge);
 }
 // House sits toward the back of its platform; front porch stays visible.
 const hx=-2.70,hz=1.20,base=deck+.07,w=3.11,d=2.16,wall=1.87;
 const wallY=base+wall*.5;
 box(w,wall,d,redCladding,hx,wallY,hz);
 // Horizontal clapboard shadow lines provide scale and readable exterior.
 for(let i=0;i<9;i++){
   const yy=base+.12+i*.205;
   box(w+.024,.022,.045,redTrim,hx,yy,hz+d/2+.025);
   box(.045,.020,d+.035,redTrim,hx-w/2-.018,yy,hz);
 }
 // Gable roof: charcoal double slopes with generous overhang.
 const e=base+wall-.025,peak=e+1.02;
 const left=hx-w/2-.16,right=hx+w/2+.16;
 roofPlane([[left,e,hz-d/2-.20],[left,e,hz+d/2+.20],[hx,peak,hz+d/2+.20],[hx,peak,hz-d/2-.20]],roof);
 roofPlane([[hx,peak,hz-d/2-.20],[hx,peak,hz+d/2+.20],[right,e,hz+d/2+.20],[right,e,hz-d/2-.20]],roof);
 for(let front of [-1,1]){
  const zz=hz+front*d/2;
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute([hx-w/2,e,zz,hx+w/2,e,zz,hx,peak,zz],3));
  g.computeVertexNormals();
  add(g,redCladding);
 }
 beam([hx,peak+.012,hz-d/2-.2],[hx,peak+.012,hz+d/2+.2],.044,roof);
 // Porch entry: blue door, warm square windows, pale crisp fascia.
 const front=hz+d/2+.04;
 function framedWindow(x0,y0,z0,s=.47){
   box(s+.13,s+.18,.06,cream,x0,y0,z0);
   box(s,s+.06,.09,warmWindow,x0,y0,z0+.04);
   box(.037,s+.06,.12,cream,x0,y0,z0+.07);
   box(s,.037,.12,cream,x0,y0,z0+.07);
   box(s+.23,.068,.19,cream,x0,y0-s*.67,z0+.07);
 }
 framedWindow(hx-1.0,base+1.15,front,.40);
 framedWindow(hx+.94,base+1.15,front,.40);
 box(.59,1.19,.095,cream,hx,base+.60,front);
 box(.48,1.07,.11,door,hx,base+.58,front+.03);
 ico(.029,copper,hx+.16,base+.55,front+.10,1);
 framedWindow(hx-w/2-.027,base+1.14,hz,.43); // window on left end; detail physically inset
 // Stone and wood landing accessories.
 box(.62,.09,.34,woodEdge,hx,deck+.06,front+.25);
 box(.82,.12,.45,woodTop,hx,deck+.02,front+.45);
 // Cable-free deck railing: posts and planks, plus a small gap for the stairs.
 for(let side of [-1,1])for(let k=0;k<5;k++){
   let zz=z-dd/2+k*dd/4;
   cyl(.049,.063,.72,7,woodEdge,x+side*(ww/2-.07),deck+.41,zz);
 }
 for(let i=0;i<6;i++){
  if(i===2||i===3)continue;
  const xx=x-ww/2+.36+i*ww/6;
  cyl(.049,.063,.74,7,woodEdge,xx,deck+.42,z+dd/2-.08);
 }
 // Roof-side lanterns on porch.
 lights.house1=new T.PointLight(0xffa35f,0,7,1.6);
 lights.house1.position.set(hx-.9,base+1.4,front+.4);group.add(lights.house1);
 lights.house2=new T.PointLight(0xffaa67,0,6,1.6);
 lights.house2.position.set(hx+.94,base+1.4,front+.35);group.add(lights.house2);
 // Timber stair descent from the high front-right deck toward the middle shore.
 const stX=x+ww/2-.44,stZ=z+dd/2-.38;
 for(let i=0;i<4;i++){
  const y=deck-(i+1)*.205,zz=stZ+.20+i*.33;
  box(1.05,.14,.39,woodTop,stX,y,zz);
  box(.08,.30,.39,woodEdge,stX-.48,y-.14,zz);
  box(.08,.30,.39,woodEdge,stX+.48,y-.14,zz);
 }
 // A short narrow walkway leads toward the campfire clearing, no dock clutter.
 for(let i=0;i<8;i++)box(.31,.085,1.00,woodTop,stX+.67+i*.305,.49,stZ+.66);
}

function buildBoat(){
 // A small fully closed hull at the base of the large platform; no mooring line.
 const parent=new T.Group();group.add(parent);
 parent.position.set(-1.05,.41,5.09);parent.rotation.y=-.43;
 const L=2.18,B=.72,n=28,segments=5,v=[],uv=[],id=[];
 for(let side of [-1,1]){
  const start=v.length/3;
  for(let i=0;i<=n;i++){
   const t=i/n*2-1,sw=Math.pow(Math.max(0,1-t*t),.62);
   for(let j=0;j<=segments;j++){
     const s=j/segments,ly=-.27+.41*s+.15*Math.pow(Math.abs(t),3);
     v.push(t*L/2,ly,side*B*sw*(.26+.74*s));uv.push(i/n,s);
   }
  }
  for(let i=0;i<n;i++)for(let j=0;j<segments;j++){
   const a=start+i*(segments+1)+j,b=a+segments+1;
   id.push(a,b,a+1,a+1,b,b+1);
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(id);g.computeVertexNormals();
 add(g,new T.MeshStandardMaterial({color:0x36596a,roughness:.66,side:T.DoubleSide}),0,0,0,parent);
 box(L*.81,.06,B*.88,woodEdge,0,-.22,0,parent);
 for(let i of [-.26,0,.26]){
  box(.10,.075,B*1.55,woodTop,i*L,.053,0,parent);
 }
 for(let side of [-1,1]){
  const pts=[];for(let i=0;i<=n;i++){
   const t=i/n*2-1;pts.push([t*L/2,.15+.15*Math.pow(Math.abs(t),3),side*B*Math.pow(Math.max(0,1-t*t),.62)]);
  }
  pipe(pts,.036,cream,parent);
 }
 // Square white cabin with warm porthole; silhouette resembles supplied working boat.
 box(.62,.56,.71,waterBoat,-.16,.40,0,parent);
 box(.68,.08,.75,roof,-.16,.70,0,parent);
 box(.36,.29,.028,warmWindow,-.16,.47,-.37,parent);
 box(.36,.29,.028,warmWindow,-.16,.47,.37,parent);
 cyl(.13,.15,.12,12,copper,.67,.18,0,parent);
}

export function buildCampfire(){
 const x=1.85,z=1.65,ground=coastalHeight(x,z);
 // Ground clearing with circular stones; smaller than lighthouse and house.
 const patch=cyl(.94,1.03,.046,16,material('#586549'),x,ground+.025,z);
 for(let i=0;i<13;i++){
  const a=i*2*Math.PI/13,s=rr(.13,.26);
  const stone=ico(1,i%3===0?warmRock:shoreRock,x+Math.cos(a)*.47,ground+.075,z+Math.sin(a)*.47,0);
  stone.scale.set(s*.94,s*.64,s*.85);
 }
 for(let i=0;i<4;i++){
  const a=i*2*Math.PI/4;
  beam([x-.35*Math.cos(a),ground+.09,z-.35*Math.sin(a)],
       [x+.35*Math.cos(a),ground+.09,z+.35*Math.sin(a)],.055,woodEdge);
 }
 const fireGroup=new T.Group();group.add(fireGroup);fireGroup.position.set(x,ground+.16,z);
 const flameA=add(new T.ConeGeometry(.20,.60,5),fireMat,0,.26,0,fireGroup);
 const flameB=add(new T.ConeGeometry(.135,.44,5),lamplit,.07,.20,.06,fireGroup);
 fireGroup.userData.isFire=true;
 lights.fire=new T.PointLight(0xff873d,0,6,1.5);
 lights.fire.position.set(x,ground+.52,z);group.add(lights.fire);
 // Two simple camp stools on outer side (no sharp weapons / unrealistic details).
 for(let p of [[2.75,1.37],[1.74,2.60]]){
  const yy=coastalHeight(p[0],p[1]);
  cyl(.28,.27,.12,9,woodTop,p[0],yy+.49,p[1]);
  for(let k=0;k<3;k++){let a=k*2*Math.PI/3;
   cyl(.035,.045,.48,6,woodEdge,p[0]+Math.cos(a)*.19,yy+.24,p[1]+Math.sin(a)*.19);
  }
 }
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
