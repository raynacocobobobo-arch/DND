import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const host=document.getElementById('viewport'), status=document.getElementById('status');
const scene=new T.Scene();
scene.background=new T.Color(0x152a3a);
scene.fog=new T.FogExp2(0x243b4e,.010);
const camera=new T.PerspectiveCamera(39,innerWidth/innerHeight,.1,120);
const initial=new T.Vector3(17,13.5,19);
camera.position.copy(initial);
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
host.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,.85,0);
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.minDistance=12;
controls.maxDistance=42;
controls.maxPolarAngle=Math.PI*.84;
controls.update();

let seed=842926;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function between(a,b){return a+(b-a)*rand();}
function mat(color,roughness=.83,metalness=0,extra={}){return new T.MeshStandardMaterial({color,roughness,metalness,...extra});}
function noisyTex(base,mode,contrast=.12){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d'),img=ctx.createImageData(256,256);
  const rgb=new T.Color(base);const r=Math.round(rgb.r*255),g=Math.round(rgb.g*255),b=Math.round(rgb.b*255);
  function hash(x,y,s){let v=Math.sin(x*127.1+y*311.7+s*73.4)*43758.5453;return v-Math.floor(v)}
  function smooth(x,y,s){let ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);let a=hash(ix,iy,s),b=hash(ix+1,iy,s),c=hash(ix,iy+1,s),d=hash(ix+1,iy+1,s);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy}
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    let f=.54*smooth(x/43,y/43,2)+.31*smooth(x/15,y/15,4)+.15*smooth(x/4,y/4,9);
    let n=(f-.5)*2*contrast;
    if(mode==='rock')n+=(Math.sin((x*.27+y*.15)+smooth(x/27,y/27,8)*12)>.96?-.12:0);
    if(mode==='wood')n+=(Math.sin(x*.085+3*smooth(x/43,y/53,8)))*.048;
    if(mode==='sand')n+=(hash(x,y,8)-.5)*.09;
    if(mode==='roof'){
      let row=Math.floor(y/32),offset=(row%2)*20,v=(x+offset)%52;
      if(y%32<2||v<2)n-=.27;
      if(y%32>26)n-=.09;
    }
    let k=(y*256+x)*4,boost=1+n;
    img.data[k]=Math.max(0,Math.min(255,r*boost));
    img.data[k+1]=Math.max(0,Math.min(255,g*boost));
    img.data[k+2]=Math.max(0,Math.min(255,b*boost));
    img.data[k+3]=255;
  }
  ctx.putImageData(img,0,0);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;
}
const M={
rock:mat('#fff',.98,0,{map:noisyTex('#5d6568','rock',.24)}),
deep:mat('#fff',.99,0,{map:noisyTex('#35424b','rock',.22)}),
sand:mat('#fff',.97,0,{map:noisyTex('#d9bb82','sand',.18)}),
grass:mat('#fff',.99,0,{map:noisyTex('#668257','grass',.27)}),
wood:mat('#fff',.91,0,{map:noisyTex('#876243','wood',.25)}),
wreck:mat('#fff',.96,0,{map:noisyTex('#4a3026','wood',.25)}),
plaster:mat('#fff',.91,0,{map:noisyTex('#e9ddc7','plaster',.055)}),
roof:mat('#fff',.88,0,{map:noisyTex('#a64c3c','roof',.18),side:T.DoubleSide}),
red:mat('#ad3d33',.78),
white:mat('#dfd5c4',.88),
metal:mat('#252e33',.52,.55),
glass:mat('#bfd5d0',.15,.24,{transparent:true,opacity:.63,depthWrite:false,side:T.DoubleSide}),
light:new T.MeshStandardMaterial({color:0xffe8a4,emissive:0xffbc55,emissiveIntensity:3,roughness:.4}),
waterSide:mat('#267686',.34,.06,{map:noisyTex('#2c8b9a','water',.14),transparent:true,opacity:.84,side:T.DoubleSide}),
foam:new T.MeshBasicMaterial({color:0xe0f7ee,transparent:true,opacity:.69,depthWrite:false}),
soil:mat('#8c7463',.98),
rope:mat('#a7977b',1),
leaf1:mat('#5b8450',.93),leaf2:mat('#7a9856',.93),leaf3:mat('#a2a859',.93),
pine:mat('#315849',.93)
};
const root=new T.Group();scene.add(root);
function add(geo,m,x=0,y=0,z=0,parent=root){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cube(w,h,d,m,x,y,z,parent=root){return add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
function cyl(rt,rb,h,n,m,x,y,z,parent=root){return add(new T.CylinderGeometry(rt,rb,h,n),m,x,y,z,parent);}
function sphere(rad,m,x,y,z,parent=root,detail=1){return add(new T.IcosahedronGeometry(rad,detail),m,x,y,z,parent);}
function rod(a,b,r,m,parent=root){const d=new T.Vector3().subVectors(b,a),o=add(new T.CylinderGeometry(r,r,d.length(),8),m,0,0,0,parent);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
function curve(points,r,m,parent=root){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(16,points.length*6),r,6,false),m,0,0,0,parent);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mix(a,b,t){return a*(1-t)+b*t}
function smoothstep(a,b,x){let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}

// Cutaway: contiguous geological volume with clean faces, no white scribbles or mosaic patches.
const base=cube(15.7,4.0,14.2,M.deep,0,-4.06,0);base.castShadow=false;
const sediment=cube(15.72,.28,14.22,M.soil,0,-1.94,0);sediment.castShadow=false;
const underwater=cube(15.72,1.76,14.22,M.waterSide,0,-.96,0);
underwater.castShadow=false;
const seabed=cube(15.65,.10,14.15,M.sand,0,-1.77,0);seabed.castShadow=false;
// Individual large underwater rocks, embedded in seabed rather than floating.
for(let i=0;i<30;i++){let x=between(-7,7),z=between(-6.3,6.3),rr=between(.22,.75);let o=sphere(rr,i%3?M.rock:M.deep,x,-1.68+rr*.25,z);o.scale.set(1.5,.7,1.1);}

// Water surface is above water-volume top, with deliberately separated faces to prevent z fighting.
const wg=new T.PlaneGeometry(15.68,14.18,86,78);
const p=wg.attributes.position;const cols=[];
for(let i=0;i<p.count;i++){
 const x=p.getX(i),z=p.getY(i);
 const wave=.055*Math.sin(x*2.5+z*.8)+.038*Math.sin(z*3.7-x*.63)+.022*Math.sin(x*5.2+z*3.9);
 p.setZ(i,.15+wave);
 const t=.5+.5*Math.sin(x*.75+z*.62),c=new T.Color().setRGB(mix(.15,.24,t),mix(.47,.65,t),mix(.58,.69,t));
 cols.push(c.r,c.g,c.b);
}
wg.setAttribute('color',new T.Float32BufferAttribute(cols,3));wg.computeVertexNormals();
const surface=add(wg,new T.MeshPhysicalMaterial({color:'#b5eeec',vertexColors:true,roughness:.22,metalness:.05,transparent:true,opacity:.77,depthWrite:false,side:T.DoubleSide}),0,0,0);
surface.rotation.x=-Math.PI/2;surface.castShadow=false;surface.receiveShadow=false;surface.renderOrder=2;

// A thin continuous coastal island mesh, not a raised grass slab.
function islandHeight(x,z){
 const r=Math.hypot((x+.12)/5.12,(z-.40)/3.75);
 return .10+ .51*Math.pow(Math.max(0,1-r),1.35)+(.025*Math.sin(x*2.3+z*2.9))*(1-smoothstep(.70,1,r));
}
function islandRadius(a){return 1+.036*Math.sin(7*a)+.018*Math.sin(13*a+1.7)+.018*Math.sin(19*a)}
const ng=34,na=112,verts=[],uv=[],cl=[],ids=[];
for(let j=0;j<=ng;j++)for(let i=0;i<=na;i++){
 const a=i/na*Math.PI*2,r=j/ng,edge=islandRadius(a);
 const x=-.12+Math.cos(a)*5.12*r*edge,z=.40+Math.sin(a)*3.75*r*edge;
 const y=islandHeight(x,z)+.016*Math.sin(4*a+3*r)*r;
 verts.push(x,y,z);uv.push((x+8)/16,(z+8)/16);
 const grass=1-smoothstep(.62,.80,r),col=new T.Color('#d9c18e').lerp(new T.Color('#728955'),grass);
 col.multiplyScalar(1+.035*Math.sin(21*a+8*r));cl.push(col.r,col.g,col.b);
 if(j<ng&&i<na){let q=j*(na+1)+i;ids.push(q,q+na+1,q+1,q+1,q+na+1,q+na+2)}
}
const ig=new T.BufferGeometry();ig.setAttribute('position',new T.Float32BufferAttribute(verts,3));
ig.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ig.setAttribute('color',new T.Float32BufferAttribute(cl,3));ig.setIndex(ids);ig.computeVertexNormals();
const terrain=add(ig,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));
terrain.castShadow=false;terrain.receiveShadow=true;
const foampts=[];for(let i=0;i<=144;i++){let a=i/144*2*Math.PI,r=1.025*islandRadius(a);foampts.push([-.12+Math.cos(a)*5.12*r,.18+.013*Math.sin(17*a),.40+Math.sin(a)*3.75*r]);}
curve(foampts,.017,M.foam).castShadow=false;

// Rock forms with locally coherent ridges, anchored into the island.
function rock(x,z,sx,sy,sz,detail=2){
 const geometry=new T.IcosahedronGeometry(1,detail),v=geometry.attributes.position;
 for(let i=0;i<v.count;i++){let ax=v.getX(i),ay=v.getY(i),az=v.getZ(i);let k=1+.10*Math.sin(ax*12+az*6)+.10*Math.sin(ay*9-ax*5)+.055*Math.sin(az*18+ax*14);v.setXYZ(i,ax*k,ay*k,az*k)}
 geometry.computeVertexNormals();
 const o=add(geometry,M.rock,x,islandHeight(x,z)+sy*.42,z);o.scale.set(sx,sy,sz);return o;
}
rock(-4.15,-2.25,2.45,2.75,1.42,3);
rock(-5.2,-1.25,1.45,1.6,1.08);
rock(3.65,-2.9,2.5,2.55,1.6,3);
rock(5.05,-2.0,1.3,1.7,1.2);
for(let i=0;i<30;i++){
 let angle=rand()*Math.PI*2,r=between(.60,1.01),x=-.12+5.12*r*Math.cos(angle),z=.4+3.75*r*Math.sin(angle),s=between(.10,.42);
 let o=sphere(s,i%4?M.rock:M.deep,x,islandHeight(x,z)+s*.16,z);
 o.scale.set(between(.95,1.55),between(.53,.9),between(.85,1.3));o.rotation.set(rand(),rand(),rand());
}

// Lighthouse: independent solid-color materials eliminate texture-atlas UV errors.
const lx=-.64,lz=-.27,ly=islandHeight(lx,lz);
cyl(.95,1.05,.42,16,M.red,lx,ly+.21,lz);
const stripeH=.73;
for(let i=0;i<7;i++){
 const o=cyl(.55-i*.024,.64-i*.024,stripeH+.011,16,i%2?M.white:M.red,lx,ly+.43+stripeH*(i+.5),lz);
 if(i===1||i===3||i===5){
  let wy=ly+.43+stripeH*(i+.5),z=lz+(.65-i*.024);
  cube(.22,.32,.09,M.metal,lx,wy,z);
  cube(.14,.23,.105,M.light,lx,wy,z+.018);
  cube(.25,.037,.15,M.white,lx,wy-.17,z+.04);
 }
}
const towerTop=ly+.43+stripeH*7;
cyl(.76,.75,.20,18,M.red,lx,towerTop+.07,lz);
cyl(.69,.70,.73,16,M.glass,lx,towerTop+.48,lz);
cyl(.26,.26,.5,12,M.light,lx,towerTop+.50,lz);
cyl(.81,.81,.12,18,M.red,lx,towerTop+.9,lz);
cyl(.02,.84,.48,18,M.red,lx,towerTop+1.16,lz);
sphere(.075,M.red,lx,towerTop+1.43,lz,root,2);
for(let i=0;i<16;i++){
 const a=2*Math.PI*i/16,x=lx+.78*Math.cos(a),z=lz+.78*Math.sin(a);
 rod(new T.Vector3(x,towerTop+.11,z),new T.Vector3(x,towerTop+.68,z),.020,M.metal);
}
for(const y of [towerTop+.17,towerTop+.65]){
 const o=add(new T.TorusGeometry(.78,.019,7,48),M.metal,lx,y,lz);o.rotation.x=Math.PI/2;
}
for(let i=0;i<10;i++){let a=i*Math.PI*2/10,x=lx+.54*Math.sin(a),z=lz+.54*Math.cos(a),y=ly+.76+i%2*.03;const win=cube(.14,.18,.08,M.metal,x,y,z);win.rotation.y=a}
cube(.49,.83,.11,M.wreck,lx,ly+.62,lz+.99);
const beacon=new T.PointLight(0xffc06d,19,9,2);beacon.position.set(lx,towerTop+.50,lz);root.add(beacon);

// Keeper's cottage: cream walls all sides, clear roof plane geometry + UV, warm windows.
const hx=2.03,hz=1.53,hy=islandHeight(hx,hz);
cube(2.35,1.60,1.85,M.plaster,hx,hy+.80,hz);
function roofQuad(a,b,c,d){
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
 geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));
 geo.computeVertexNormals();return add(geo,M.roof);
}
const e=hy+1.57,peak=hy+2.37,w=1.31,d=1.08;
roofQuad([hx-w,e,hz-d],[hx-w,e,hz+d],[hx,peak,hz+d],[hx,peak,hz-d]);
roofQuad([hx,peak,hz-d],[hx,peak,hz+d],[hx+w,e,hz+d],[hx+w,e,hz-d]);
rod(new T.Vector3(hx,peak+.015,hz-d),new T.Vector3(hx,peak+.015,hz+d),.045,M.roof);
cube(.27,.56,.27,M.plaster,hx+.56,peak+.04,hz-.34);
function windowFront(x,y,z,sc=1){
 cube(.48*sc,.58*sc,.07,M.metal,x,y,z);
 cube(.37*sc,.46*sc,.088,M.light,x,y,z+.012);
 cube(.045*sc,.48*sc,.10,M.white,x,y,z+.04);cube(.40*sc,.045*sc,.10,M.white,x,y,z+.04);
 cube(.60*sc,.07*sc,.18,M.plaster,x,y-.30*sc,z+.04);
}
windowFront(hx-.61,hy+.95,hz+.95);windowFront(hx+.64,hy+.95,hz+.95);
cube(.43,1.00,.08,M.wood,hx,hy+.52,hz+.98);
function windowSide(x,y,z){cube(.07,.52,.45,M.metal,x,y,z);cube(.09,.42,.34,M.light,x+.018,y,z);cube(.10,.46,.035,M.white,x+.08,y,z)}
windowSide(hx+1.19,hy+.94,hz-.28);
const cottageLight=new T.PointLight(0xffbd71,2.1,3);cottageLight.position.set(hx+.3,hy+1.55,hz+.7);root.add(cottageLight);

// Tree shapes, leafy clusters with warm/cool variation; roots grounded on terrain.
function tree(x,z,h=2){
 const y=islandHeight(x,z);
 cyl(.11,.18,h*.58,8,M.wood,x,y+h*.29,z);
 for(let j=0;j<10;j++){let a=rand()*6.28,r=between(.08,.55),yy=between(.60,.92)*h,sz=between(.35,.61);
  const o=sphere(sz,[M.leaf1,M.leaf2,M.leaf3][j%3],x+Math.cos(a)*r,y+yy,z+Math.sin(a)*r,root,2);
  o.scale.set(1,between(.7,1.1),1)}
}
function pine(x,z,h=1.6){
 const y=islandHeight(x,z);cyl(.08,.11,h*.65,8,M.wood,x,y+h*.32,z);
 for(let i=0;i<3;i++)cyl(.15+i*.18,0,h*.43,9,M.pine,x,y+h*(.75-i*.16),z);
}
[[-2.95,-1.15,1.8],[-2.2,-1.7,2.15],[1.15,-1.95,2.10],[2.2,-1.35,2.0],[3.50,.14,1.85],[3.37,2.27,1.75]].forEach(v=>tree(...v));
[[-3.1,.95,1.55],[-2.5,1.65,1.35],[3.7,1.75,1.45]].forEach(v=>pine(...v));
for(let i=0;i<130;i++){
 const a=rand()*2*Math.PI,r=Math.sqrt(rand())*.74,x=-.12+5.12*r*Math.cos(a),z=.4+3.75*r*Math.sin(a);
 if(Math.hypot(x-lx,z-lz)<1.28||Math.abs(x-hx)<1.4&&Math.abs(z-hz)<1.2)continue;
 const y=islandHeight(x,z),s=between(.045,.10),o=sphere(s,[M.leaf1,M.leaf2,M.leaf3][i%3],x,y+s*.5,z,root,0);o.scale.y=between(.55,1.25);
}

// Pier planks, pile foundations and soft rope guide rails.
function pier(x,z0,z1,width=1.1){
 const dockY=.38,n=Math.round(Math.abs(z1-z0)/.20),sg=Math.sign(z1-z0);
 for(let i=0;i<n;i++){
  let z=z0+sg*(i+.5)*Math.abs(z1-z0)/n,b=cube(width,0.11,Math.abs(z1-z0)/n*.88,M.wood,x,dockY,z);
  b.rotation.y=between(-.008,.008);
 }
 for(let i=0;i<5;i++){
  let z=mix(z0,z1,i/4);
  for(let side of [-1,1]){let px=x+side*(width*.55);
   cyl(.055,.07,2.6,7,M.wreck,px,-.57,z);
   cyl(.065,.065,.65,7,M.wood,px,dockY+.34,z);
  }
 }
 for(let side of [-1,1]){const pts=[];for(let i=0;i<=16;i++){let t=i/16;pts.push([x+side*width*.55,dockY+.55-.13*Math.sin(t*4*Math.PI),mix(z0,z1,t)])}curve(pts,.021,M.rope)}
}
pier(-3.25,2.65,5.75,1.15);
pier(3.25,3.14,5.87,1.25);
// Small rowboat with actual curved hull, thwarts and rim.
function buildBoat(parent,length,width,m){
 const g=new T.BufferGeometry(),v=[],ind=[],steps=15,rings=7;
 for(let j=0;j<rings;j++){
  const a=(j/(rings-1))*Math.PI,yy=-.35+.34*Math.sin(a),rad=Math.sin(a)*width;
  for(let i=0;i<=steps;i++){let t=i/steps*2-1,x=t*length/2,w=Math.pow(Math.max(.008,1-t*t),.55)*rad;v.push(x,yy-.12*(1-t*t),Math.cos(a)*w)}
 }
 for(let j=0;j<rings-1;j++)for(let i=0;i<steps;i++){let q=j*(steps+1)+i;ind.push(q,q+1,q+steps+1,q+1,q+steps+2,q+steps+1)}
 g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ind);g.computeVertexNormals();
 add(g,m,0,0,0,parent);
 for(let i=0;i<3;i++){let xx=(i-1)*length*.22;cube(.13,.08,width*.78,m,xx,-.16,0,parent)}
 for(let z of [-width*.8,width*.8]){let points=[];for(let i=0;i<=12;i++){let t=i/12*2-1;points.push([t*length/2,-.08,Math.sign(z)*Math.pow(Math.max(.008,1-t*t),.55)*width])}curve(points,.046,m,parent)}
}
const rowboat=new T.Group();root.add(rowboat);rowboat.position.set(.58,.33,5.05);rowboat.rotation.y=.38;buildBoat(rowboat,1.55,.46,M.wood);
rod(new T.Vector3(.43,.35,4.6),new T.Vector3(1.35,.35,5.7),.023,M.rope);

// Shipwreck: damaged identifiable hull and scroll prow, not a triangular pile of twigs.
const wreck=new T.Group();root.add(wreck);wreck.position.set(4.90,.09,-3.15);wreck.rotation.y=-.47;wreck.rotation.z=-.07;
buildBoat(wreck,3.45,.94,M.wreck);
for(let i=0;i<8;i++){
 let x=-1.40+i*.36,rad=.76*Math.sqrt(Math.max(.04,1-(x/1.72)**2));
 curve([[x,-.30,-rad],[x,-.04,-rad*.8],[x,.19,0],[x,-.04,rad*.8],[x,-.30,rad]],.043,M.wood,wreck);
}
curve([[1.34,-.18,0],[1.67,.35,0],[1.72,.95,0],[1.50,1.30,0],[1.19,1.29,0],[1.10,1.02,0]],.088,M.wood,wreck);
for(let i=0;i<7;i++){
 const x=between(-1.4,1.4),z=between(-.78,.78);
 const a=new T.Vector3(x,between(-.05,.2),z),b=a.clone().add(new T.Vector3(between(-.35,.6),between(.3,.9),between(-.1,.15)));
 rod(a,b,.05,M.wreck,wreck);
}
for(let i=0;i<4;i++){let x=between(3.8,5.85),z=between(-5.2,-2.4);let o=cube(between(.35,.75),.07,.11,M.wreck,x,.14,z);o.rotation.y=rand()*6.28}

// Atmosphere and ground contact shadows.
const hemi=new T.HemisphereLight(0xe4f4ff,0x2c2930,2.05);scene.add(hemi);
const sun=new T.DirectionalLight(0xffd5a0,3.8);
sun.position.set(-9,16,10);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;
sun.shadow.camera.near=.5;sun.shadow.camera.far=40;sun.shadow.bias=-.00035;
sun.shadow.normalBias=.025;sun.shadow.radius=3.0;scene.add(sun);
const fill=new T.DirectionalLight(0x7ab9df,1.25);fill.position.set(8,7,-8);scene.add(fill);
const shadowPlane=add(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.20}),0,-6.15,0);
shadowPlane.rotation.x=-Math.PI/2;shadowPlane.receiveShadow=true;shadowPlane.castShadow=false;

document.getElementById('reset').addEventListener('click',()=>{camera.position.copy(initial);controls.target.set(0,.85,0);controls.update()});
document.getElementById('rotate').addEventListener('click',e=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.65;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate))});
document.getElementById('shadows').addEventListener('click',e=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;sun.castShadow=renderer.shadowMap.enabled;e.currentTarget.setAttribute('aria-pressed',String(renderer.shadowMap.enabled));renderer.shadowMap.needsUpdate=true});
document.getElementById('capture').addEventListener('click',()=>{renderer.render(scene,camera);let a=document.createElement('a');a.download='Lighthouse_Island_3D.png';a.href=renderer.domElement.toDataURL('image/png');a.click()});
document.getElementById('fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)host.requestFullscreen?.();else document.exitFullscreen?.()});
window.addEventListener('resize',()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)});
status.hidden=true;
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
