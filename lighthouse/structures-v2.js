
import * as T from 'three';
import {group,M,rr,rng,clamp,smooth,coastalHeight,box,cyl,ico,add,pipe,beam,groundRock,material} from './world-v2.js?v=7d';


function cliffMass(cx,cz,length,width,height,phase){
 // Connected non-spherical ridge mesh: the silhouette follows terrain geology.
 const positions=[],colors=[],n=13,base=.20,front=cz+width*.53,back=cz-width*.52;
 const warm=new T.Color('#77736a'),shadow=new T.Color('#51595b'),sunlit=new T.Color('#90897b');
 function vertex(p,color){positions.push(...p);colors.push(color.r,color.g,color.b)}
 function tri(a,b,c,face){
  const shade=face==='front'?sunlit:face==='back'?shadow:warm;
  let col=shade.clone().multiplyScalar(.87+.23*rr(0,1));
  vertex(a,col);vertex(b,col);vertex(c,col);
 }
 for(let i=0;i<n;i++){
  let t=i/n,t2=(i+1)/n;
  function ridge(q){
   const x=cx+(q-.5)*length;
   const plateau=smooth(0,.23,q)*(1-smooth(.73,1,q));const h=height*plateau*(.72+.17*Math.sin(q*6+phase)+.08*Math.cos(q*16+phase));
   return [x,base+h,cz+.16*Math.sin(q*7+phase)];
  }
  const r0=ridge(t),r1=ridge(t2);
  const ff0=[cx+(t-.5)*length,base,front-.07*Math.sin(t*11+phase)],
        ff1=[cx+(t2-.5)*length,base,front-.07*Math.sin(t2*11+phase)];
  const bb0=[cx+(t-.5)*length,base,back+.08*Math.cos(t*8+phase)],
        bb1=[cx+(t2-.5)*length,base,back+.08*Math.cos(t2*8+phase)];
  const ffmid=[(r0[0]+r1[0])*.5,base+height*.16+(r0[1]+r1[1])*.19,(r0[2]+front)*.5];
  tri(r0,ff0,ffmid,'front');tri(ff0,ff1,ffmid,'front');tri(ffmid,ff1,r1,'front');tri(r0,ffmid,r1,'front');
  const bbmid=[(r0[0]+r1[0])*.5,base+height*.11+(r0[1]+r1[1])*.21,(r0[2]+back)*.5];
  tri(r0,bbmid,bb0,'back');tri(bb0,bbmid,bb1,'back');tri(bbmid,r1,bb1,'back');tri(r0,r1,bbmid,'back');
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 return add(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide,flatShading:true}));
}
export function buildCliffs(){
 cliffMass(-4.45,-3.13,4.15,2.16,2.93,.7);
 cliffMass(-3.1,-3.55,2.0,1.6,1.95,2.3);
 cliffMass(3.63,-4.15,3.50,1.95,2.27,1.6);
 groundRock(-5.6,-2.28,.96,.82,.88,M.stone,2);
 groundRock(5.68,-3.87,.83,.75,.75,M.stone,2);
 // A few low coastal boulders, buried at the actual surface height.
 for(const [x,z,s] of [[-3.8,-.2,.64],[-3.75,1.85,.4],[-2.95,2.55,.48],[-4.10,2.4,.38],
 [-1.75,3.2,.38],[1.00,3.6,.31],[4.26,1.52,.38],[4.58,.72,.37],
 [3.3,2.65,.29],[3.5,3.45,.34],[-.1,3.48,.34]]){
  groundRock(x,z,s*1.30,s*.8,s,rr(0,1)>.6?M.stone:M.cliff,2);
 }
 // Smaller stones only in sparse, ground-contact groups (never a random floating field).
 for(let i=0;i<37;i++){
  const a=rr(0,Math.PI*2),r=rr(.61,1.05),x=-.2+5.00*r*Math.cos(a),z=.25+3.88*r*Math.sin(a);
  const s=rr(.08,.25),o=ico(1,i%5?M.stone:M.cliff,x,coastalHeight(x,z)+s*.15,z,1);
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
 const shade=cyl(.83,.52,.37,18,M.red,x,deck+1.28,z);
 shade.castShadow=true;
 cyl(.025,.025,.14,12,M.metal,x,deck+1.51,z);
 ico(.078,M.red,x,deck+1.59,z,2);
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

export function buildTrees(){
 function leafy(x,z,h,spread=.62){
  let y=coastalHeight(x,z);
  const trunk=cyl(.075,.15,h*.52,9,M.wood,x,y+h*.26,z);
  for(let i=0;i<3;i++){
   let a=i*2.4+rr(-.2,.2),s=.28;
   beam([x,y+h*.48,z],[x+Math.cos(a)*s,y+h*.70,z+Math.sin(a)*s],.045,M.wood);
  }
  for(let i=0;i<21;i++){
   let a=rr(0,Math.PI*2),r=rr(.1,spread),height=rr(.63,.95)*h,s=rr(.22,.42)*h/2;
   const o=ico(s,M.foliage[i%M.foliage.length],x+Math.cos(a)*r,y+height,z+Math.sin(a)*r,2);
   o.scale.set(rr(.8,1.2),rr(.72,1.18),rr(.8,1.2));
  }
 }
 function pine(x,z,h){
  let y=coastalHeight(x,z);
  cyl(.06,.09,h*.6,8,M.wood,x,y+.3*h,z);
  for(let i=0;i<4;i++)cyl(0,.47-i*.09,h*.37,9,M.pine,x,y+.38*h+i*.18*h,z);
 }
 // Vegetation stays behind building, not hiding entrance or boat.
 [[-2.55,-.95,2.05],[-1.75,-1.7,1.9],[1.1,-1.82,2.15],[2.19,-1.5,2.05],
 [3.08,-1.26,1.75],[3.5,.24,1.45]].forEach(v=>leafy(...v));
 [[-3.26,.43,1.45],[-2.91,1.1,1.16],[3.63,1.8,1.25]].forEach(v=>pine(...v));
 // Very thin turf tufts, along contours, no tall grass slab.
 for(let i=0;i<220;i++){
  const a=rr(0,2*Math.PI),r=Math.sqrt(rng())*.77;
  const x=-.2+5.00*r*Math.cos(a),z=.25+3.88*r*Math.sin(a);
  if(Math.hypot(x+.38,z+.3)<1.1||Math.abs(x-2.16)<1.25&&Math.abs(z-1.22)<.95)continue;
  const y=coastalHeight(x,z),h=rr(.025,.091);
  if(i%11===0){let f=ico(.027,M.trims,x,y+.02,z,1);f.scale.y=.48;continue}
  const o=cyl(0,rr(.012,.026),h,3,M.foliage[i%4],x,y+h*.5,z);
  o.castShadow=false;
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
 const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geom.setIndex(idx);geom.computeVertexNormals();
 add(geom,new T.MeshStandardMaterial({color:0x76513c,roughness:.94,side:T.DoubleSide}),0,0,0,g);
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
 boat.position.set(.66,.32,4.89);boat.rotation.y=-.32;
 for(let s of [-1,1]){
  beam([-.05,.08,s*.22],[.22,.11,s*.98],.022,M.wood,boat);
  box(.13,.035,.17,M.wood,.22,.11,s*.98,boat);
 }
 pipe([[.6,.38,4.95],[1.9,.42,4.75],[3.5,.38,4.69]],.013,M.rope);
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
