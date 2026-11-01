
import * as T from 'three';
import {group,M,rr,rng,clamp,smooth,coastalHeight,box,cyl,ico,add,pipe,beam,groundRock,material} from './world-v2.js?v=7g';


// Reference-inspired stone clusters: a few multi-faced boulders, never broad triangular wall-mountains.
function facetedBoulder(x,z,sx,sy,sz,angle=0){
 const g=new T.DodecahedronGeometry(1,0),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const vx=p.getX(i),vy=p.getY(i),vz=p.getZ(i);
  const k=1+.078*Math.sin(vx*6.2+vz*5.4+angle)+.045*Math.sin(vy*7.5+vx*4.3);
  p.setXYZ(i,vx*k,vy*k,vz*k);
 }
 const uvs=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){
   uvs[i*2]=(x+p.getX(i)*sx)*.27+.5;
   uvs[i*2+1]=(z+p.getZ(i)*sz)*.08+(.28+sy*.53+p.getY(i)*sy)*.30;
 }
 g.setAttribute('uv',new T.BufferAttribute(uvs,2));g.computeVertexNormals();
 // Bury the lower half into the island, so the rocks read as a natural mass.
 const o=add(g,M.stone,x,coastalHeight(x,z)+sy*.54,z);
 o.scale.set(sx,sy,sz);o.rotation.set(.02,angle,.025);
 return o;
}
export function buildCliffs(){
 // Left/rear rocky ridge; layered irregular stone blocks with subdued warm-grey facets.
 facetedBoulder(-4.43,-3.47,1.71,1.73,1.36,.23);
 facetedBoulder(-4.78,-4.05,1.38,1.94,1.19,-.30);
 facetedBoulder(-3.35,-3.55,1.41,1.40,1.11,.48);
 facetedBoulder(-5.42,-2.90,1.02,1.04,.83,-.14);
 facetedBoulder(-3.45,-4.39,1.19,.99,.86,.28);
 // Right/rear stone formation: stays behind the curled-prow wreck.
 facetedBoulder(3.26,-4.38,1.55,1.46,1.20,-.23);
 facetedBoulder(4.30,-4.83,1.64,1.62,1.19,.44);
 facetedBoulder(5.40,-4.33,1.06,1.09,.82,.16);
 facetedBoulder(2.28,-4.24,.87,.84,.77,-.43);
 // A few ground-supported small rocks around the main formations.
 groundRock(-5.63,-2.22,.89,.69,.79,M.stone,1);
 groundRock(5.55,-3.73,.80,.68,.74,M.stone,1);
 // Keep both docks and their pile foundations completely clear of rocks.
 const pierClearance=(x,z,margin=0)=>(
   (Math.abs(x+3.72)<.79+margin&&z>2.28-margin&&z<6.02+margin)||
   (Math.abs(x-3.70)<.85+margin&&z>2.20-margin&&z<6.05+margin)
 );
 // A few low coastal boulders, buried at the actual surface height.
 for(const [x,z,s] of [[-3.8,-.2,.64],[-3.75,1.85,.4],[-2.95,2.55,.48],[-4.10,2.4,.38],
 [-1.75,3.2,.38],[1.00,3.6,.31],[4.26,1.52,.38],[4.58,.72,.37],
 [3.3,2.65,.29],[3.5,3.45,.34],[-.1,3.48,.34]]){
  if(pierClearance(x,z,s*.65))continue;
  groundRock(x,z,s*1.30,s*.8,s,M.stone,2);
 }
 // Smaller stones only in sparse, ground-contact groups (never a random floating field).
 for(let i=0;i<37;i++){
  const a=rr(0,Math.PI*2),r=rr(.61,1.05),x=-.2+5.00*r*Math.cos(a),z=.25+3.88*r*Math.sin(a);
  const s=rr(.08,.25);
  if(pierClearance(x,z,s+.13))continue;
  const o=ico(1,M.stone,x,coastalHeight(x,z)+s*.15,z,1);
  o.scale.set(s*rr(1.05,1.7),s*.66,s*rr(.8,1.3));o.rotation.y=rr(-2,2);
 }
}

function ring(x,y,z,r,mat=M.metal){const o=add(new T.TorusGeometry(r,.025,8,64),mat,x,y,z);o.rotation.x=Math.PI/2;return o}
function columnLight(x,y,z){const p=new T.PointLight(0xffc87b,3.4,6,2);p.position.set(x,y,z);group.add(p);return p}
export function buildLighthouse(){
 const x=-.38,z=-.30,g=coastalHeight(x,z);
 // Door platform, heavy red base, tapered cylindrical masonry, 7 precise red/white bands.
 const plinth=cyl(.93,1.02,.25,24,M.stone,x,g+.10,z);
 cyl(.80,.86,.74,32,M.red,x,g+.49,z);
 const h=4.92,sections=8,base=g+.86;
 for(let i=0;i<sections;i++){
  const start=i/sections,end=(i+1)/sections;
  const rb=.755-(.17*start),rt=.755-(.17*end);
  cyl(rt,rb,h/sections+.008,32,i%2===0?M.white:M.red,x,base+(i+.5)*(h/sections),z);
 }
 const deck=base+h;
 cyl(.69,.73,.18,24,M.red,x,deck+.075,z);
 cyl(.79,.78,.12,24,M.metal,x,deck+.20,z);
 // Lantern glazing with its own structure.
 const lampCenter=deck+.65;
 cyl(.51,.51,.86,16,M.glass,x,lampCenter,z);
 cyl(.17,.22,.68,16,M.light,x,lampCenter,z);
 columnLight(x,lampCenter,z);
 // Soft photographic halo around the actual lantern glass (not a fake sky beam).
 const haloCanvas=document.createElement('canvas');haloCanvas.width=128;haloCanvas.height=128;
 const hc=haloCanvas.getContext('2d'),rg=hc.createRadialGradient(64,64,2,64,64,63);
 rg.addColorStop(0,'rgba(255,255,227,1)');rg.addColorStop(.19,'rgba(255,216,139,.80)');
 rg.addColorStop(.48,'rgba(255,175,95,.24)');rg.addColorStop(1,'rgba(255,167,80,0)');
 hc.fillStyle=rg;hc.fillRect(0,0,128,128);
 const haloTex=new T.CanvasTexture(haloCanvas);
 const halo=new T.Sprite(new T.SpriteMaterial({map:haloTex,transparent:true,depthWrite:false,
  blending:T.AdditiveBlending,color:0xffd9a4,opacity:.78}));
 halo.position.set(x,lampCenter,z);halo.scale.set(1.75,1.75,1);group.add(halo);
 // A pointed conical lighthouse crown: wide eave at the base, zero-radius apex.
 cyl(.81,.81,.10,32,M.red,x,deck+1.11,z);
 const shade=cyl(0,.80,.60,32,M.red,x,deck+1.46,z);
 shade.castShadow=true;
 cyl(.025,.025,.14,12,M.metal,x,deck+1.81,z);
 ico(.069,M.red,x,deck+1.91,z,2);
 for(let i=0;i<16;i++){
  let a=i*Math.PI*2/16;
  beam([x+.58*Math.sin(a),deck+.28,z+.58*Math.cos(a)],
       [x+.58*Math.sin(a),deck+1.04,z+.58*Math.cos(a)],.017,M.metal);
 }
 // Circular gallery: iron balusters and two uninterrupted rings.
 for(let j=0;j<2;j++)ring(x,deck+.20+j*.53,z,.77);
 for(let i=0;i<24;i++){
  let a=i*2*Math.PI/24,s=Math.sin(a),c=Math.cos(a);
  beam([x+.77*s,deck+.19,z+.77*c],[x+.77*s,deck+.76,z+.77*c],.017,M.metal);
 }
 // Lantern's 12 vertical frame divisions and dark caps.
 for(let i=0;i<12;i++){
  let a=i*2*Math.PI/12,s=Math.sin(a),c=Math.cos(a);
  beam([x+.52*s,deck+.29,z+.52*c],[x+.52*s,deck+1.03,z+.52*c],.022,M.metal);
 }
 ring(x,deck+.29,z,.53);ring(x,deck+1.03,z,.53);
 // Proper inset small windows, with curved tower orientation and separate surrounds.
 for(let i=0;i<7;i++){
  let yy=base+.31+(i+.35)*(h/sections),a=i%2?Math.PI*.54:Math.PI*.1;
  let radius=.755-.17*((yy-base)/h),nx=Math.sin(a),nz=Math.cos(a);
  const win=new T.Group();group.add(win);
  win.position.set(x+nx*(radius+.005),yy,z+nz*(radius+.005));
  win.rotation.y=a;
  box(.19,.26,.032,M.metal,0,0,.008,win);
  box(.125,.19,.045,i%3===0?M.window:M.glass,0,0,.035,win);
  box(.26,.045,.14,M.white,0,-.145,.04,win);
 }
 // Realistic entrance door and handle, not a black slot.
 box(.41,.83,.115,M.darkWood,x,g+.48,z+.851);
 box(.48,.085,.20,M.trims,x,g+.925,z+.85);
 box(.055,.055,.04,M.metal,x+.13,g+.51,z+.93);
 // Bolts and plinth seams subtle, not floating detail.
 for(let i=0;i<18;i++){
  let a=i*2*Math.PI/18;
  ico(.029,M.metal,x+.87*Math.sin(a),g+.65,z+.87*Math.cos(a),0);
 }
 return {x,z,g,deck};
}
function roofFace(pts,m){
 const v=[...pts[0],...pts[1],...pts[2],...pts[0],...pts[2],...pts[3]];
 const uv=[0,0,2.6,0,2.6,2.3,0,0,2.6,2.3,0,2.3];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return add(g,m);
}
function window(x,y,z,wall='front'){
 const parent=new T.Group();group.add(parent);
 parent.position.set(x,y,z);
 if(wall==='right')parent.rotation.y=Math.PI/2;
 if(wall==='left')parent.rotation.y=-Math.PI/2;
 box(.52,.59,.06,M.trims,0,0,.018,parent);
 box(.42,.49,.075,M.metal,0,0,.055,parent);
 box(.32,.39,.081,M.window,0,0,.10,parent);
 box(.043,.43,.12,M.trims,0,0,.112,parent);
 box(.36,.044,.12,M.trims,0,0,.115,parent);
 box(.63,.065,.20,M.trims,0,-.32,.09,parent);
}
export function buildCottage(){
 const x=2.16,z=1.22,g=coastalHeight(x,z);
 // Rebuild continuous plaster walls, no UV offset black half-house.
 const w=2.10,d=1.66,wall=1.48;
 box(w,.18,d,M.stone,x,g+.09,z);
 box(w,wall,d,M.plaster,x,g+.18+wall*.5,z);
 const edge=g+.18+wall,peak=edge+.66;
 const e=.12;
 roofFace([[x-w/2-e,edge,z-d/2-e],[x-w/2-e,edge,z+d/2+e],[x,peak,z+d/2+e],[x,peak,z-d/2-e]],M.roof);
 roofFace([[x,peak,z-d/2-e],[x,peak,z+d/2+e],[x+w/2+e,edge,z+d/2+e],[x+w/2+e,edge,z-d/2-e]],M.roof);
 beam([x,peak+.015,z-d/2-e],[x,peak+.015,z+d/2+e],.035,M.red);
 // Gable infill is pale wall material, not black backing.
 for(let s of [-1,1]){
  let zface=z+s*d/2;
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x-w/2,edge,zface,x+w/2,edge,zface,x,peak-.01,zface],3));
  geo.computeVertexNormals();add(geo,new T.MeshStandardMaterial({color:'#dfd3c3',side:T.DoubleSide,roughness:.95}));
 }
 // Small chimney and weathered stone corners.
 box(.27,.79,.29,M.trims,x+.60,peak+.03,z-.25);
 box(.36,.11,.36,M.stone,x+.60,peak+.43,z-.25);
 for(let cx of [x-w/2+.08,x+w/2-.08])for(let k=0;k<6;k++){
  box(.17,.10,.22,M.trims,cx,g+.29+k*.235,z+d/2+.035);
 }
 window(x-.47,g+.98,z+d/2+.047);window(x+.46,g+.98,z+d/2+.047);
 window(x+w/2+.045,g+.99,z-.06,'right');
 // Wooden front door on short edge with hinge bands and steps.
 box(.42,.92,.075,M.wood,x-.02,g+.65,z-d/2-.055);
 box(.48,.085,.18,M.trims,x-.02,g+1.18,z-d/2-.09);
 ico(.034,M.metal,x+.105,g+.61,z-d/2-.105,1);
 box(.64,.11,.42,M.stone,x-.02,g+.07,z-d/2-.25);
 // Roof rain gutters and split plank details, not excessive black checkers.
 for(let s of [-1,1]){
  beam([x+s*(w/2+.10),edge-.02,z-d/2-e],[x+s*(w/2+.10),edge-.02,z+d/2+e],.034,M.metal);
 }
 const glow=new T.PointLight(0xffc280,2.2,4,2);glow.position.set(x+.2,g+1.58,z+.55);group.add(glow);
 return {x,z,g};
}

// Forest kit based on the supplied illustration: faceted needles, single-piece polygon foliage,
// clearly visible trunks and restrained three-blade ground tufts.
export function buildTrees(){
 const wood=M.wood;
 const needle=[material('#809a32',1),material('#9ab43a',1),material('#728b34',1),material('#a4b64b',1)];
 const deciduous=[material('#6b943d',1),material('#819d3c',1),material('#92a63e',1),material('#5b813b',1)];
 for(const m of [...needle,...deciduous]){m.flatShading=true;}
 function fir(x,z,h,index=0){
   const y=coastalHeight(x,z);
   cyl(.055,.092,h*.69,7,wood,x,y+h*.345,z);
   const tiers=[
    {height:.51*h,center:.52*h,radius:.31*h},
    {height:.47*h,center:.715*h,radius:.255*h},
    {height:.53*h,center:.93*h,radius:.205*h}
   ];
   for(let i=0;i<tiers.length;i++){
     const t=tiers[i];
     const m=needle[(index+i)%needle.length];
     const mesh=add(new T.ConeGeometry(t.radius,t.height,5,1,false,Math.PI*.17),m,x,y+t.center,z);
     mesh.rotation.y=.17*(index+i);
   }
 }
 function oval(x,z,h,index=0,wide=false){
   const y=coastalHeight(x,z),trunk=wide?.49:.61;
   cyl(.046,.074,h*trunk,6,wood,x,y+h*trunk*.5,z);
   const radius=h*(wide?.285:.175),base=h*(wide?.45:.51);
   const height=h*(wide?.58:.66);
   const sides=7;
   const rings=[
      [0,.18],[.13,.74],[.36,1.0],[.68,.92],[.86,.58],[1,.10]
   ],v=[],ids=[];
   for(let j=0;j<rings.length;j++){
    const [t,r]=rings[j];
    for(let i=0;i<sides;i++){
      const a=(i/sides)*Math.PI*2+.23,variation=1+.045*Math.sin(i*3+index);
      v.push(radius*r*variation*Math.cos(a),base+t*height,radius*r*variation*Math.sin(a));
    }
   }
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){
     const a=j*sides+i,b=j*sides+(i+1)%sides,c=(j+1)*sides+i,d=(j+1)*sides+(i+1)%sides;
     ids.push(a,b,c,b,d,c);
   }
   const geo=new T.BufferGeometry();
   geo.setAttribute('position',new T.Float32BufferAttribute(v,3));
   geo.setIndex(ids);geo.computeVertexNormals();
   // Each face has a distinct angle, not 21 overlapping foliage spheres.
   const mesh=add(geo,deciduous[index%deciduous.length],x,y,z);
   mesh.material.side=T.DoubleSide;
 }
 // Tall pines lead on the left as in the user's reference; variety stays close to original positions.
 fir(-3.27,.42,1.99,0);
 fir(-2.90,1.12,1.36,2);
 fir(-2.48,-.98,1.81,1);
 fir(3.66,1.82,1.25,3);
 oval(-1.75,-1.67,1.73,0,true);
 oval(1.08,-1.84,1.95,1,false);
 oval(2.19,-1.51,1.71,2,true);
 oval(3.10,-1.25,1.78,3,false);
 oval(3.51,.27,1.48,1,false);
 // Handful of natural clumps near boulders and edges; keep sand and central path clear.
 const grassM=[material('#728b35',1),material('#9da448',1),material('#617d38',1)];
 for(let i=0;i<57;i++){
    const theta=rr(0,2*Math.PI),r=.46+rr(0,.39);
    const x=-.2+5*r*Math.cos(theta),z=.25+3.88*r*Math.sin(theta);
    if((Math.abs(x+3.72)<.88&&z>2.20)||
       (Math.abs(x-3.70)<.88&&z>2.15)||
       (Math.hypot(x+.38,z+.3)<1.18)||
       (Math.abs(x-2.16)<1.25&&Math.abs(z-1.22)<1.03))continue;
    const y=coastalHeight(x,z);
    for(let j=0;j<3;j++){
      const height=rr(.10,.21),a=(2*Math.PI*j)/3+rr(-.18,.18);
      const blade=add(new T.ConeGeometry(.019,height,3,1),grassM[(i+j)%grassM.length],
       x+Math.cos(a)*.046,y+height*.5,z+Math.sin(a)*.046);
      blade.rotation.z=Math.cos(a)*.24;blade.rotation.x=Math.sin(a)*.24;
      blade.castShadow=false;
    }
 }
}

export function buildPiers(){
 function makePier(x,z0,z1,width=1.06){
  const deck=.31,len=z1-z0;
  // Two stringers and individual boards with nails, no flat wood texture slab.
  for(let s of [-1,1])box(.16,.19,len,M.darkWood,x+s*width*.39,deck-.12,(z0+z1)/2);
  const count=Math.round(len/.20);
  for(let i=0;i<count;i++){
   let z=z0+(i+.5)*len/count,plank=box(width,.085,len/count*.86,M.wood,x,deck,z);
   plank.rotation.y=rr(-.008,.008);
   for(let s of [-1,1])ico(.012,M.metal,x+s*width*.36,deck+.046,z,0);
  }
  for(let i=0;i<5;i++){
   let z=z0+i/4*len;
   for(let s of [-1,1]){
    const xx=x+s*width*.46;
    cyl(.052,.065,2.04,8,M.darkWood,xx,-.67,z);
    cyl(.065,.065,.56,8,M.wood,xx,deck+.31,z);
   }
  }
  for(let s of [-1,1])for(let k=0;k<4;k++){
   let pts=[];for(let j=0;j<=10;j++){
    let t=j/10;pts.push([x+s*width*.46,deck+.56-.15*Math.sin(t*Math.PI),z0+(k+t)*len/4]);
   }pipe(pts,.017,M.rope);
  }
 }
 makePier(-3.72,2.78,5.65,1.07);
 makePier(3.70,2.68,5.77,1.19);
 // Pier barrel, dock blocks; no barrels floating.
 function barrel(x,z,y=.62){
  let obj=cyl(.19,.16,.40,12,M.wood,x,y,z);
  for(let t of [-.12,.12])cyl(.203,.203,.037,12,M.metal,x,y+t,z);
  return obj;
 }
 barrel(3.72,5.36,.58);
}

// Boat loft: full solid wooden hull, not a broken circular ring.
export function buildBoat(L=1.68,B=.50,finish=M.wood){
 const g=new T.Group();group.add(g);
 const ns=32,nv=6,verts=[],idx=[],uv=[];
 // One enclosed shell with bottom rising at the sharp tips.
 for(let side of [-1,1]){
  let offset=verts.length/3;
  for(let i=0;i<=ns;i++){
   let u=i/ns,t=u*2-1,wid=B*Math.pow(Math.max(0,1-t*t),.70),rise=.19*Math.pow(Math.abs(t),3);
   for(let j=0;j<=nv;j++){
    let v=j/nv;
    verts.push(t*L/2,-.31+rise+.43*v,side*wid*(.27+.73*v));
    uv.push(u,v);
   }
  }
  for(let i=0;i<ns;i++)for(let j=0;j<nv;j++){
   let a=offset+i*(nv+1)+j,b=a+nv+1;
   if(side===1)idx.push(a,b,a+1,a+1,b,b+1);
   else idx.push(a,a+1,b,a+1,b+1,b);
  }
 }
 // Close the bottom across both sides; otherwise water penetrates the open hull.
 const floorOffset=verts.length/3;
 for(let i=0;i<=ns;i++){
  const t=i/ns*2-1,wid=B*Math.pow(Math.max(0,1-t*t),.70),rise=.19*Math.pow(Math.abs(t),3);
  for(let side of [-1,1]){
   verts.push(t*L/2,-.302+rise,side*wid*.29);
   uv.push(i/ns,side===-1?0:1);
  }
 }
 for(let i=0;i<ns;i++){const a=floorOffset+i*2,b=a+2;idx.push(a,a+1,b,a+1,b+1,b)}
 const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geom.setIndex(idx);geom.computeVertexNormals();
 add(geom,new T.MeshStandardMaterial({color:0x76513c,roughness:.94,side:T.DoubleSide}),0,0,0,g);
 // Wooden interior sole just above the sealed bottom, hiding the water at all viewing angles.
 const sole=box(L*.76,.044,B*.91,M.darkWood,0,-.216,0,g);
 sole.castShadow=false;
 for(let side of [-1,1]){
  const pts=[];for(let i=0;i<=ns;i++){
   let t=i/ns*2-1,wid=B*Math.pow(Math.max(0,1-t*t),.70);
   pts.push([t*L/2,.12+.19*Math.pow(Math.abs(t),3),side*wid]);
  }pipe(pts,.048,finish,g);
 }
 // Thwarts, keel, cut bow, weathered seams and cross ribs.
 for(let i of [-.25,0,.25]){
  const wid=B*Math.pow(1-4*i*i,.7);
  box(.09,.06,wid*1.65,M.wood,i*L,.045,0,g);
 }
 beam([-L*.48,-.19,0],[L*.48,-.19,0],.043,M.darkWood,g);
 for(let i=-2;i<=2;i++){
  let x=i*L*.13,ww=B*Math.pow(Math.max(.2,1-(2*x/L)**2),.7);
  pipe([[x,-.28,0],[x,-.16,-ww*.5],[x,.12,-ww]],.024,M.darkWood,g);
  pipe([[x,-.28,0],[x,-.16,ww*.5],[x,.12,ww]],.024,M.darkWood,g);
 }
 return g;
}
export function buildShips(){
 // Rowboat: solid elliptical hull and oars. Tethered near right-hand pier.
 let boat=buildBoat(1.45,.45,M.wood);
 boat.position.set(.66,.51,4.89);boat.rotation.y=-.32;
 for(let s of [-1,1]){
  beam([-.05,.08,s*.22],[.22,.11,s*.98],.022,M.wood,boat);
  box(.13,.035,.17,M.wood,.22,.11,s*.98,boat);
 }
 pipe([[.6,.54,4.95],[1.9,.46,4.75],[3.5,.38,4.69]],.013,M.rope);
 // Rear-right ruined ship: strongly visible curled prow + broken hull + ribs.
 const wreck=buildBoat(3.10,.88,M.wreck);
 wreck.position.set(4.65,.57,-2.20);wreck.rotation.y=-.39;wreck.rotation.z=-.16;
 const tipx=-3.10/2;
 pipe([[tipx,0,0],[tipx-.18,.33,0],[tipx-.20,.94,0],[tipx-.01,1.23,0],[tipx+.24,1.19,0],[tipx+.35,.95,0]],.085,M.wood,wreck);
 // Exposed planks broken upright at the rear, with gradually varied height.
 for(let i=0;i<9;i++){
  const xx=rr(-1.12,1.3),side=i%2?1:-1;
  beam([xx,.02,side*.58],[xx+rr(-.4,.4),rr(.42,1.18),side*rr(.60,1.04)],rr(.027,.06),M.wreck,wreck);
 }
 for(let i=0;i<9;i++){
  const a=rr(-1.2,1.2),b=rr(-.9,.9);
  const plank=box(rr(.42,.8),.06,rr(.10,.20),M.wreck,a,.10,b,wreck);
  plank.rotation.y=rr(-.65,.65);
 }
 // Ancient stern debris around wreck, sparse and large rather than tiny noisy chips.
 for(let i=0;i<6;i++){
  let x=rr(4.4,6.6),z=rr(-3.4,-1.3),o=box(rr(.30,.80),.08,rr(.13,.27),M.wreck,x,.20,z);
  o.rotation.y=rr(-2,2);o.rotation.z=rr(-.2,.2);
 }
}
export function buildExtras(){
 // Sand track between tower door and keeper's cottage.
 const points=[[-.25,.53,.65],[.43,.53,.95],[1.05,.49,1.2],[1.62,.44,1.22]];
 for(let i=0;i<points.length;i++){let p=points[i];const o=ico(.20,M.sand,p[0],coastalHeight(p[0],p[2])+.015,p[2],1);o.scale.set(1.9,.09,1.3)}
 // Anchored wooden barrels, ropes and a few white flowerheads.
 for(let i=0;i<3;i++){
  let x=2.95+i*.25,z=.22+i*.23,y=coastalHeight(x,z);
  cyl(.17,.15,.36,12,M.wood,x,y+.18,z);
  for(let yy of [y+.08,y+.30])cyl(.177,.177,.021,12,M.metal,x,yy,z);
 }
 for(let i=0;i<48;i++){
  let a=rr(0,2*Math.PI),r=rr(.28,.76);
  let x=-.2+5.00*r*Math.cos(a),z=.25+3.88*r*Math.sin(a),y=coastalHeight(x,z);
  if(Math.hypot(x+.38,z+.3)<1.13||Math.abs(x-2.16)<1.1&&Math.abs(z-1.22)<1.03)continue;
  ico(.024,M.trims,x,y+.032,z,1);
 }
}
