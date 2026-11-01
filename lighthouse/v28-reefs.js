import * as T from 'three';
import {group,W,D,WATER_CENTER_X,WATER_CENTER_Z,M} from './v27-world.js?v=27a';

/** V28: Three individually sculpted island-style reefs. NOT cones or round
 * extrusions. Silhouettes follow the supplied reference: bulky irregular
 * crag, high slender pinnacle, and asymmetrically fractured spiky cluster.
 * Matte grey-lavender, flat geological facets, shared island stone texture.
 */
export function createOffshoreReefs(){
 const root=new T.Group();root.name='reference-sculpted-three-reefs';group.add(root);
 const seaY=.1815;
 // Locations are the vetted V27 offshore sites; keep ship, little boat, and
 // every Kraken spawning site clear.
 const defs=[
  {name:'slender-pinnacle',x:-11,z:8,height:3.08,footprint:.70},
  {name:'broad-crag',x:9,z:7,height:2.28,footprint:1.22},
  {name:'jagged-ridge',x:-6,z:-8,height:1.74,footprint:1.24}
 ];
 const kraken=[
  [-12.2,3.4],[-12.4,-3.3],[-9.4,-9.3],[-3.3,-11.3],
  [3.4,-11.2],[9.4,-9],[12.4,-3],[12.2,3.3]
 ];
 const p0=[9.5,WATER_CENTER_Z-D/2];
 const p1=[WATER_CENTER_X+W/2,p0[1]+(WATER_CENTER_X+W/2-p0[0])];
 function lineGap(p,a,b){
  const vx=b[0]-a[0],vz=b[1]-a[1];
  const t=T.MathUtils.clamp(((p.x-a[0])*vx+(p.z-a[1])*vz)/(vx*vx+vz*vz),0,1);
  return Math.hypot(p.x-a[0]-vx*t,p.z-a[1]-vz*t);
 }
 const gaps=defs.map(d=>({
  kraken:Math.min(...kraken.map(p=>Math.hypot(d.x-p[0],d.z-p[1]))),
  ship:lineGap(d,p0,p1),
  boat:Math.hypot(d.x+2,d.z-6.1)
 }));
 const safe=defs.every((d,i)=>
  Math.abs(d.x-WATER_CENTER_X)+d.footprint<W*.5-1&&
  Math.abs(d.z-WATER_CENTER_Z)+d.footprint<D*.5-1&&
  Math.hypot((d.x+.2)/5.38,(d.z-.25)/4.34)>1.55&&
  gaps[i].kraken>d.footprint+2.1&&
  gaps[i].ship>d.footprint+2.1&&gaps[i].boat>6);
 if(!safe)throw Error('V28 reefs intersect sea routes');

 // Exactly the island cliff map and stone light response; slight violet
 // coloring brings the material closer to the grey-lavender reference.
 const rockMaterial=M.cliff.clone();
 rockMaterial.color.set('#c9c4d4');
 rockMaterial.vertexColors=true;
 rockMaterial.flatShading=true;
 rockMaterial.roughness=1;
 rockMaterial.metalness=0;
 rockMaterial.side=T.DoubleSide;

 function seeded(n){let state=n>>>0;return ()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};}
 const meshes=[];
 function body(parent,label,rings,apex,opts={}){
  const sides=rings[0].length;
  if(rings.some(r=>r.length!==sides))throw Error('Bad authored rock ring');
  const rng=seeded(opts.seed||41);
  const vertices=[],colors=[],uvs=[];
  // Face-level variations are restrained, never a noisy random mosaic.
  const shades=[.91,.96,1.01,.98,.94,1.04,.97,1.00,1.06,.93];
  function face(a,b,c,sector,layer){
   const variant=shades[(sector*3+layer*7+(opts.seed||0))%shades.length];
   const tint=new T.Color().setRGB(variant,variant*.996,variant*1.013);
   for(const v of [a,b,c]){
    vertices.push(...v);
    colors.push(tint.r,tint.g,tint.b);
    uvs.push((v[0]+(opts.x||0))*.27+.50,
             (v[1]+seaY)*.30+(v[2]+(opts.z||0))*.08);
   }
  }
  // Vertically shifting and staggered ridge control points build authentic
  // flat broken rock faces. No regular circular cylinder section exists.
  for(let layer=0;layer<rings.length-1;layer++){
   for(let i=0;i<sides;i++){
    const ni=(i+1)%sides;
    const a=rings[layer][i],b=rings[layer][ni],
      c=rings[layer+1][i],d=rings[layer+1][ni];
    if((i+layer)%3===0){face(a,b,d,i,layer);face(a,d,c,i,layer+1);}
    else{face(a,b,c,i,layer);face(b,d,c,i,layer+1);}
   }
  }
  for(let i=0;i<sides;i++)
   face(rings[rings.length-1][i],rings[rings.length-1][(i+1)%sides],
     apex,i,rings.length+1);
  // Close the base beneath the sea surface.
  const baseCenter=[0,-.44,0];
  for(let i=0;i<sides;i++)
   face(baseCenter,rings[0][(i+1)%sides],rings[0][i],i,99);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geometry.computeVertexNormals();
  const m=new T.Mesh(geometry,rockMaterial);
  m.name=label;m.castShadow=true;m.receiveShadow=true;
  m.userData.sculptedRock=true;parent.add(m);meshes.push(m);
  return m;
 }
 // The shape comes from intentionally asymmetrical, hand-positioned polygon
 // outlines. Each ring is an irregular contour, not a radially generated circle.
 const base=[
  [-.94,-.40,-.47],[-.56,-.41,-.86],[.14,-.39,-.83],[.75,-.38,-.57],
  [1.03,-.42,-.09],[.68,-.40,.63],[.10,-.43,.86],[-.58,-.40,.75],[-1.03,-.42,.15]
 ];
 function ringFrom(outline,y,sx,sz,shiftX=0,shiftZ=0,skew=[]){
  return outline.map((p,i)=>{
   const dy=skew[i]||0;
   return [p[0]*sx+shiftX,y+dy,p[2]*sz+shiftZ];
  });
 }
 function liftModel(parent,label,shape){
  // Authored geology: the top is a displaced ridge, not a centered cone tip.
  if(shape==='slender'){
   const r0=ringFrom(base,-.36,.64,.66,0,0,[0,.03,-.01,.02,-.02,0,.01,-.01,.02]);
   const r1=ringFrom(base,.40,.63,.59,-.06,-.04,[.02,-.05,.10,.04,-.06,.09,.01,-.04,.03]);
   const r2=ringFrom(base,1.45,.49,.44,-.17,-.13,[.09,.04,-.04,.13,.02,-.09,.06,.08,-.04]);
   const r3=ringFrom(base,2.45,.27,.25,-.29,-.21,[.10,-.04,.07,.02,-.06,.04,-.07,.09,-.03]);
   body(parent,label,[r0,r1,r2,r3],[-.42,3.08,-.18],{seed:11});
  }else if(shape==='broad'){
   const r0=ringFrom(base,-.40,1.14,1.02,0,.0);
   const r1=ringFrom(base,.40,1.05,.94,-.13,.03,[.04,-.07,.09,.05,.02,-.04,-.01,.10,-.03]);
   const r2=ringFrom(base,1.20,.82,.68,-.19,-.10,[.01,.10,-.08,.18,-.06,.06,.03,-.10,.12]);
   const r3=ringFrom(base,1.86,.45,.45,-.31,-.18,[.03,.10,-.05,-.07,.13,-.05,.07,.01,-.09]);
   body(parent,label,[r0,r1,r2,r3],[-.46,2.28,-.21],{seed:27});
  }
 }
 // A fractured tapering stone wedge, with its lean and tip deliberately
 // displaced; fractured edges are varied, not smooth cones.
 function shard(parent,label,scale,tip,heading,seed){
  const baseRing=[
   [-.53,-.32,-.26],[-.21,-.34,-.48],[.34,-.32,-.46],
   [.53,-.35,-.05],[.36,-.31,.44],[-.16,-.32,.47],[-.55,-.33,.12]
  ];
  const middle=baseRing.map((p,i)=>[
    p[0]*.64+tip[0]*.37,
    scale[1]*(i%3===0?.46:.53),
    p[2]*.67+tip[2]*.37
  ]);
  const upper=baseRing.map((p,i)=>[
    p[0]*.25+tip[0]*.78,
    scale[1]*(i%4===0?.82:.74),
    p[2]*.27+tip[2]*.78
  ]);
  const rock=body(parent,label,[baseRing,middle,upper],
   [tip[0],scale[1],tip[2]],{seed});
  rock.scale.set(scale[0],1,scale[2]);
  rock.rotation.y=heading;
  return rock;
 }
 const instances=[];
 defs.forEach((d,i)=>{
  const assembly=new T.Group();
  assembly.name='reef-assembly-'+d.name;
  assembly.position.set(d.x,seaY,d.z);root.add(assembly);
  if(i===0){
   liftModel(assembly,'sculpted-slim-rock','slender');
   // Irregular buttress fused into lower side, similar to reference's base.
   const baseWing=shard(assembly,'slender-base-buttress',[.52,.83,.56],
       [-.29,.79,-.15],-.22,9);
   baseWing.position.set(-.35,-.10,.20);
  }else if(i===1){
   liftModel(assembly,'sculpted-wide-rock','broad');
   const shoulder=shard(assembly,'side-shoulder-stone',[.74,.91,.67],
       [-.20,.86,-.09],.29,19);
   shoulder.position.set(-.66,-.04,.09);
  }else{
   // A fan of angular stone slabs, rising at unequal angles and heights:
   // broad intertwined base and three separately pointed ridges.
   const back=shard(assembly,'ridge-back-blade',[.92,1.70,.69],
     [.25,1.70,-.35],-.27,57);
   back.position.set(-.34,-.03,-.17);
   const right=shard(assembly,'ridge-right-blade',[.84,1.45,.64],
     [.53,1.45,-.18],.48,71);
   right.position.set(.35,-.04,.04);
   const front=shard(assembly,'ridge-front-slab',[1.10,1.04,.91],
     [-.14,1.04,.11],-.55,85);
   front.position.set(-.17,-.03,.31);
   const splinter=shard(assembly,'ridge-small-splinter',[.53,.85,.43],
     [.22,.85,-.12],.30,93);
   splinter.position.set(.69,.02,-.29);
  }
  instances.push({name:d.name,x:d.x,z:d.z,height:d.height,
   footprint:d.footprint,tentacleClearance:+gaps[i].kraken.toFixed(3),
   pirateClearance:+gaps[i].ship.toFixed(3)});
 });
 return {root,getState:()=>({
  count:instances.length,solid:true,safe,style:'reference-sculpted-rocks',
  materialType:rockMaterial.type,materialMatchesIslandMap:rockMaterial.map===M.cliff.map,
  sharedMaterial:meshes.every(m=>m.material===rockMaterial),
  meshes:meshes.length,sculptedPieces:meshes.map(m=>m.name),
  geometryTypes:meshes.map(m=>m.geometry.type),
  sites:instances
 })};
}
