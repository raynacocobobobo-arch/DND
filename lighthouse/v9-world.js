
import * as T from 'three';
export const W=13.8,D=12.2;
let seed=93218;
export const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
export const rr=(a,b)=>a+(b-a)*rng();
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const smooth=(a,b,x)=>{let t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
export const group=new T.Group();
export let renderer;
export function setRenderer(r){renderer=r}
export function material(hex,rough=.8,metal=0,opt={}){return new T.MeshStandardMaterial({color:hex,roughness:rough,metalness:metal,...opt})}
export function add(geo,m,x=0,y=0,z=0,parent=group){
 const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function box(w,h,d,m,x=0,y=0,z=0,parent=group){
 return add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
}
export function cyl(top,bottom,h,n,m,x=0,y=0,z=0,parent=group){
 return add(new T.CylinderGeometry(top,bottom,h,n),m,x,y,z,parent);
}
export function ico(r,m,x=0,y=0,z=0,detail=1,parent=group){
 return add(new T.IcosahedronGeometry(r,detail),m,x,y,z,parent);
}
export function pipe(points,r,m,parent=group,segments=null){
 let curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
 let o=add(new T.TubeGeometry(curve,segments||Math.max(24,points.length*8),r,7,false),m,0,0,0,parent);
 return o;
}
export function beam(a,b,r,m,parent=group,n=8){
 let va=new T.Vector3(...a),vb=new T.Vector3(...b),v=vb.clone().sub(va);
 const o=add(new T.CylinderGeometry(r,r,v.length(),n),m,0,0,0,parent);
 o.position.copy(va).add(vb).multiplyScalar(.5);
 o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;
}
export function textured(hex,kind,rough=.9,repeat=[1,1]){
 let can=document.createElement('canvas');can.width=512;can.height=512;
 let ctx=can.getContext('2d'),pix=ctx.createImageData(512,512);
 let col=new T.Color(hex).convertLinearToSRGB(),red=col.r*255,green=col.g*255,blue=col.b*255;
 function hash(x,y,k){let t=Math.sin(x*127.1+y*311.7+k*74.72)*43758.5453123;return t-Math.floor(t)}
 function lerp(a,b,t){return a+(b-a)*t}
 function noise(x,y,k=1){let a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return lerp(lerp(hash(a,b,k),hash(a+1,b,k),u),lerp(hash(a,b+1,k),hash(a+1,b+1,k),u),v)}
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  let f=.55*noise(x/100,y/100)+.28*noise(x/27,y/27,4)+.17*noise(x/6,y/6,6);
  let d=(f-.5)*.38;
  if(kind==='sand')d+=(hash(x,y,5)-.5)*.15;
  if(kind==='plaster')d=(f-.5)*.085+(hash(x,y,2)-.5)*.025;
  if(kind==='wood')d+=(Math.sin(x*.09+noise(x/45,y/85,9)*7))*.11;
  if(kind==='grass')d+=(hash(x,y,9)-.5)*.13;
  if(kind==='rock')d+=(Math.sin(x*.019+y*.045+noise(x/44,y/44,5)*10))*.08;
  if(kind==='soil')d=(f-.5)*.29+(hash(x,y,8)-.5)*.12;
  if(kind==='roof')d=(f-.5)*.18;
  const i=(y*512+x)*4,v=Math.max(.56,1+d);
  pix.data[i]=clamp(red*v,0,255);pix.data[i+1]=clamp(green*v,0,255);pix.data[i+2]=clamp(blue*v,0,255);pix.data[i+3]=255;
 }
 ctx.putImageData(pix,0,0);
 if(kind==='roof'){
  for(let row=0;row<14;row++){
   const y=row*37,offset=(row%2)*35;
   ctx.strokeStyle='rgba(37,16,14,.29)';ctx.lineWidth=3.2;
   ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();
   for(let x=-offset;x<550;x+=70){
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+36);ctx.stroke();
    ctx.strokeStyle='rgba(255,201,144,.10)';ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.lineTo(x+66,y+4);ctx.stroke();
    ctx.strokeStyle='rgba(37,16,14,.29)';
   }
  }
 }
 if(kind==='wood'){
  ctx.strokeStyle='rgba(31,20,13,.17)';
  for(let i=0;i<100;i++){
   let x=rr(0,512),y=rr(0,512);ctx.lineWidth=rr(.3,2.2);
   ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+rr(-2,2),y+rr(6,24),x+rr(-3,3),y+rr(33,54),x+rr(-2,2),y+rr(66,110));ctx.stroke();
  }
 }
 const tex=new T.CanvasTexture(can);tex.colorSpace=T.SRGBColorSpace;
 tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(...repeat);
 tex.anisotropy=8;return tex;
}
export const M={
 sand:material('#ffffff',.98,0,{map:textured('#d2b58c','sand',1,[2.5,2.5])}),
 soil:material('#ffffff',.97,0,{map:textured('#877665','soil',1,[3,1])}),
 stone:material('#ffffff',.97,0,{map:textured('#85817d','rock',1,[1.3,1.1]),flatShading:true}),
 basalt:material('#ffffff',.97,0,{map:textured('#343e47','rock',1,[2,2])}),
 cliff:material('#ffffff',.97,0,{map:textured('#85817d','rock',1,[1.3,1.1]),flatShading:true}),
 grass:material('#ffffff',.95,0,{map:textured('#718d57','grass',1,[3,3])}),
 plaster:material('#ffffff',.95,0,{map:textured('#e8dccc','plaster')}),
 red:material('#a73832',.8),white:material('#e3e0d5',.9),
 trims:material('#e2d6b7',.87), metal:material('#333e41',.52,.6),
 roof:material('#ffffff',.86,0,{map:textured('#a94334','roof',.86),side:T.DoubleSide}),
 wood:material('#ffffff',.93,0,{map:textured('#9f7450','wood')}),
 wreck:material('#ffffff',.99,0,{map:textured('#65412e','wood')}),
 darkWood:material('#483125',.95),
 rope:material('#b8a185',.99),
 glass:material('#9eafb5',.16,.15,{transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide}),
 light:new T.MeshStandardMaterial({color:0xfff0ae,emissive:0xffb348,emissiveIntensity:3.8,roughness:.26}),
 window:new T.MeshStandardMaterial({color:0xffebc4,emissive:0xf1a951,emissiveIntensity:1.15,roughness:.3}),
 foliage:[material('#476b40'),material('#688844'),material('#8e9951'),material('#4d774b'),material('#9da859')],
 pine:material('#385a48'),
 foam:new T.MeshBasicMaterial({color:0xf1f6ed,transparent:true,opacity:.75,depthWrite:false,side:T.DoubleSide})
};
export function coastalHeight(x,z){
 const dx=(x+.20)/5.38,dz=(z-.25)/4.34;
 const r=Math.sqrt(dx*dx+dz*dz);
 let hill=.24+.57*(1-smooth(.43,1.03,r))+.15*Math.exp(-((x-2.9)**2+(z-.1)**2)/9);
 hill+=.07*Math.exp(-((x+2)**2+(z+1.2)**2)/7);
 hill+=.03*Math.sin(x*2.7+z*.9)*Math.max(0,1-r);
 return hill;
}
export function ellipseRadius(a){
 return 1+.067*Math.sin(a*5+.2)+.042*Math.cos(a*11)+.026*Math.sin(a*19+.7);
}
export function groundRock(cx,cz,sx,sy,sz,mat=M.cliff,details=2){
 let geo=new T.IcosahedronGeometry(1,details),p=geo.attributes.position;
 let offset=rr(0,30);
 for(let i=0;i<p.count;i++){
  let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  let mult=1+.09*Math.sin(x*6+z*5+offset)+.053*Math.sin(y*14+x*7+offset)+.032*Math.sin(z*21+x*12);
  p.setXYZ(i,x*mult,y*mult,z*mult);
 }
 // Match the geological ridge UV scale so nearby stones share one consistent texture.
 const y=coastalHeight(cx,cz)+sy*.28;
 const uvs=geo.attributes.uv;
 if(uvs){
   for(let i=0;i<p.count;i++){
     uvs.setXY(i,(cx+p.getX(i)*sx)*.27+.5,(y+p.getY(i)*sy)*.30+(cz+p.getZ(i)*sz)*.08);
   }
   uvs.needsUpdate=true;
 }
 geo.computeVertexNormals();
 const o=add(geo,mat,cx,y,cz);o.scale.set(sx,sy,sz);o.rotation.y=rr(-1,1);o.rotation.z=rr(-.07,.07);return o;
}
function softWave(x,z){return .045*Math.sin(x*2.8+z*.65)+.024*Math.cos(z*3.6-x*.70)+.012*Math.sin(x*6.0+z*4.7)}
export function buildCutaway(){
 box(W,4.05,D,M.basalt,0,-3.87,0).castShadow=false; // bedrock extends to -5.895
 box(W+.01,.28,D+.01,M.soil,0,-1.705,0).castShadow=false;
 // water is a continuous thin gradient over the soil and bedrock; no coplanar decorations.
 let sides=[];
 const makeSide=(along,zfixed,sign)=>{
  let w=along?W:D,seg=100,v=[],uv=[],id=[];
  for(let j=0;j<=24;j++)for(let i=0;i<=seg;i++){
   let x=-w/2+w*i/seg,y=-1.56+j/24*1.70;
   const p=along?[x,y,zfixed]:[zfixed,y,x];
   v.push(...p);uv.push(i/seg*2,j/24);
   if(j<24&&i<seg){let k=j*(seg+1)+i;id.push(k,k+1,k+seg+1,k+1,k+seg+2,k+seg+1)}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(id);geo.computeVertexNormals();
  const mesh=add(geo,new T.MeshPhysicalMaterial({color:0x348796,transparent:true,opacity:.78,roughness:.27,metalness:.06,side:T.DoubleSide,depthWrite:true}));
  mesh.castShadow=false;return mesh;
 };
 const waterVolume=box(W,1.66,D,material('#164452',.48),0,-.735,0); waterVolume.castShadow=false;waterVolume.userData.isWaterVolume=true;
 makeSide(true,D/2+.018,1);makeSide(true,-D/2-.018,-1);
 makeSide(false,W/2+.018,1);makeSide(false,-W/2-.018,-1);
 // Build the sea surface as a ring with a true hole matching the island's shoreline.
 // A full rectangular plane placed under the island used to show through in top views.
 const nA=224,nR=32,verts=[],uvs=[],colors=[],faces=[];
 const cx=-.20,cz=.25,rx=5.38,rz=4.34;
 for(let j=0;j<=nR;j++)for(let i=0;i<=nA;i++){
   const a=2*Math.PI*i/nA,dx=Math.cos(a)*rx,dz=Math.sin(a)*rz;
   const tx=Math.abs(dx)<1e-8?Infinity:((dx>0?W*.5:-W*.5)-cx)/dx;
   const tz=Math.abs(dz)<1e-8?Infinity:((dz>0?D*.5:-D*.5)-cz)/dz;
   const outer=Math.min(tx,tz)-.0025,inner=ellipseRadius(a)+.004;
   const t=inner+(outer-inner)*j/nR;
   const x=cx+dx*t,z=cz+dz*t;
   verts.push(x,.18+softWave(x,z),z);
   uvs.push(x/W+.5,z/D+.5);
   const shoal=1-smooth(.97,1.72,t);
   const c=new T.Color('#1c596b').lerp(new T.Color('#448890'),shoal*.54);
   c.multiplyScalar(1+.075*Math.sin(x*1.45+z*.87)+.04*Math.sin(x*3.1-z*1.8));
   colors.push(c.r,c.g,c.b);
   if(j<nR&&i<nA){
     const q=j*(nA+1)+i;
     faces.push(q,q+1,q+nA+1,q+1,q+nA+2,q+nA+1);
   }
 }
 const wg=new T.BufferGeometry();
 wg.setAttribute('position',new T.Float32BufferAttribute(verts,3));
 wg.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
 wg.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 wg.setIndex(faces);wg.computeVertexNormals();
 const water=new T.Mesh(wg,new T.MeshPhysicalMaterial({
   vertexColors:true,color:0xffffff,roughness:.44,metalness:.025,
   clearcoat:.43,clearcoatRoughness:.28,side:T.DoubleSide
 }));
 water.castShadow=false;water.receiveShadow=true;water.userData.isWaterSurface=true;group.add(water);
 const underwater=new T.Group();group.add(underwater);
 for(let i=0;i<30;i++){
  const x=rr(-W/2+.5,W/2-.5),z=rr(-D/2+.5,D/2-.5);
  if(Math.hypot((x+.2)/4.8,(z-.25)/3.7)<.9)continue;
  const scale=rr(.22,.82);
  let obj=ico(1,M.stone,x,-1.57+scale*.22,z,1,underwater);
  obj.scale.set(scale*rr(1,1.7),scale*.55,scale*rr(.7,1.1));
 }
 return water;
}
export function buildIsland(){
 const nr=35,ns=156,p=[],uv=[],c=[],idx=[];
 for(let j=0;j<=nr;j++)for(let i=0;i<=ns;i++){
  const a=2*Math.PI*i/ns,r=j/nr,er=ellipseRadius(a);
  const x=-.20+Math.cos(a)*5.38*r*er,z=.25+Math.sin(a)*4.34*r*er;
  const y=coastalHeight(x,z);
  p.push(x,y,z);uv.push((x+7.7)/15.4,(z+7.1)/14.2);
  const grass=1-smooth(.68,.94,r),col=new T.Color('#8f9590').lerp(new T.Color('#546747'),grass);
  col.multiplyScalar(1+.038*Math.cos(18*a+11*r));
  c.push(col.r,col.g,col.b);
  if(j<nr&&i<ns){let k=j*(ns+1)+i;idx.push(k,k+ns+1,k+1,k+1,k+ns+1,k+ns+2)}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setIndex(idx);g.computeVertexNormals();
 add(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));
 // braided shore break: 3 narrow ribbons solely on horizontal ocean surface
 for(let band=0;band<3;band++){
  let v=[],a=[],indices=[];
  for(let i=0;i<=220;i++){
   let theta=i/220*2*Math.PI,edge=ellipseRadius(theta);
   for(let t of [0,1]){
    let rr0=edge*(1.014+.026*band+.013*t)+.006*Math.sin(22*theta+band*2);
    let x=-.2+5.38*rr0*Math.cos(theta),z=.25+4.34*rr0*Math.sin(theta);
    v.push(x,.193+softWave(x,z)+.015, z);
    a.push((i%10===0?1:.78)*(1-.20*band));
   }
   if(i<220){let q=2*i;indices.push(q,q+1,q+2,q+1,q+3,q+2)}
  }
  let geom=new T.BufferGeometry();
  geom.setAttribute('position',new T.Float32BufferAttribute(v,3));geom.setIndex(indices);geom.computeVertexNormals();
  const foam=add(geom,new T.MeshBasicMaterial({color:0xeef6ea,transparent:true,opacity:.65-.16*band,depthWrite:false,side:T.DoubleSide}));
  foam.castShadow=false;foam.renderOrder=3;
 }
}
