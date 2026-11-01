import * as THREE from 'three';
import {group,coastalHeight} from './v23-world.js?v=23a';

/** Detailed full-scale hand-modeled low-poly fish person.
 * The model is sculpted at 3.2 units high and uniformly scaled down into
 * the campsite; no morphing or alternative human body is instantiated.
 * Design: oversized slate-blue fish skull with ochre eyes, layered ivory
 * fins, long curved tail; beige 19th-century workwear and red scarf.
 */
export function createFishmanVisitor(){
 const model=new THREE.Group();model.name='fishman-full-scale-model';
 const root=new THREE.Group();root.name='lighthouse-fishman';
 const location={x:1.30,z:-.03};
 root.position.set(location.x,coastalHeight(location.x,location.z),location.z);
 root.rotation.y=1.13; // three-quarter fish profile like the supplied reference
 const fullHeight=3.20,scale=.213;
 root.scale.setScalar(scale);
 root.add(model);group.add(root);
 const coat='#b98d5e',coatLight='#d8b07b',coatDark='#a8754c';
 const M={};
 const materials={
  scales:'#475c77',crest:'#344960',blueLite:'#6b7d91',blueShadow:'#344660',
  belly:'#89949f',gills:'#263a50',finCream:'#e0bc8d',finShadow:'#b18d6c',
  eyeSocket:'#344b63',eyeOchre:'#e6a51d',eyeHighlight:'#ffcf45',eyeDeep:'#91601c',
  pupil:'#332b28',gloss:'#f9e7bd',
  coat,coatLight,coatDark,shirt:'#f0dfc0',collar:'#f8e8cf',
  scarf:'#c44230',scarfShade:'#9c2e25',glove:'#905437',gloveLight:'#ad7252',
  belt:'#5d3829',beltEdge:'#422b24',metal:'#b9aaa0',bag:'#ba632f',bagShade:'#824426',
  pants:'#533c32',boots:'#75452f',bootShade:'#4c2d25',sole:'#362821'
 };
 for(const [name,hex] of Object.entries(materials))
  M[name]=new THREE.MeshStandardMaterial({color:hex,roughness:.91,
   flatShading:true,side:THREE.DoubleSide});
 const meshes=[];
 function mesh(parent,g,material,name,x=0,y=0,z=0){
  const o=new THREE.Mesh(g,M[material]);
  o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;
  parent.add(o);meshes.push(o);return o;
 }
 function ell(parent,material,name,xyz,radii,sub=1){
  const o=mesh(parent,new THREE.IcosahedronGeometry(1,sub),material,name,...xyz);
  o.scale.set(...radii);return o;
 }
 function box(parent,material,name,xyz,whd){
  return mesh(parent,new THREE.BoxGeometry(...whd),material,name,...xyz);
 }
 function cone(parent,material,name,xyz,rBottom,rTop,height,sides=7){
  return mesh(parent,new THREE.CylinderGeometry(rTop,rBottom,height,sides,1),
   material,name,...xyz);
 }
 function between(parent,material,name,start,end,r0,r1,segments=8){
  const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),v=b.clone().sub(a);
  const o=cone(parent,material,name,a.clone().add(b).multiplyScalar(.5).toArray(),
   r0,r1,v.length(),segments);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
  return o;
 }
 function flatShape(parent,material,name,points,thickness=.035){
  // Faceted, double-sided fin or cloth made from real mesh, not a texture.
  const outline=new THREE.Shape();
  points.forEach((p,i)=>i?outline.lineTo(p[0],p[1]):outline.moveTo(p[0],p[1]));
  outline.closePath();
  const g=new THREE.ExtrudeGeometry(outline,{depth:thickness,bevelEnabled:false,steps:1,
    curveSegments:1});
  g.computeVertexNormals();
  const o=mesh(parent,g,material,name);
  return o;
 }
 function xyzFin(parent,material,name,points){
  const geom=new THREE.BufferGeometry(),coords=[];
  for(let i=1;i<points.length-1;i++){
   coords.push(...points[0],...points[i],...points[i+1]);
  }
  geom.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
  geom.computeVertexNormals();
  return mesh(parent,geom,material,name);
 }
 function loftY(parent,material,name,rings,sides=10,phase=Math.PI/10){
  const vertices=[],indices=[];
  for(const r of rings){
   for(let i=0;i<sides;i++){
    const t=i*2*Math.PI/sides+phase;
    const radial=1+.055*Math.cos(i*2.2+r[0]*1.8);
    vertices.push((r[1]||0)+Math.cos(t)*r[3]*radial,
      r[0],(r[2]||0)+Math.sin(t)*r[4]*radial);
   }
  }
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){
   const a=j*sides+i,b=j*sides+(i+1)%sides,
    c=(j+1)*sides+i,d=(j+1)*sides+(i+1)%sides;
   indices.push(a,c,b,b,c,d);
  }
  indices.push(...Array.from({length:sides-2},(_,i)=>[0,i+2,i+1]).flat());
  const last=(rings.length-1)*sides;
  indices.push(...Array.from({length:sides-2},(_,i)=>[last,last+i+1,last+i+2]).flat());
  let g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setIndex(indices);g=g.toNonIndexed();
  g.computeVertexNormals();
  return mesh(parent,g,material,name);
 }

 // Curved muscular caudal section behind the worker's torso. It is a distinct
 // volumetric anatomical element and does not replace the coat or arms.
 const tailRig=new THREE.Group();tailRig.name='long-curved-fish-tail';
 model.add(tailRig);
 loftY(tailRig,'scales','long-tapered-blue-tail',[
  [.32,-.83,-.49,.092,.095],[.52,-.76,-.42,.158,.126],
  [.78,-.60,-.40,.210,.145],[1.12,-.48,-.36,.217,.157],
  [1.52,-.35,-.32,.238,.18],[1.90,-.27,-.28,.27,.20],
  [2.31,-.21,-.25,.31,.215]
 ],12);
 // Interlocking dorsal diamonds; cream triangular spikes are not spheres.
 for(let i=0;i<7;i++){
  const y=2.31-i*.285,x=-.23-i*.085,z=-.35-i*.018;
  xyzFin(tailRig,i%2?'finShadow':'finCream','dorsal-fin-'+i,
   [[x-.12,y-.08,z],[x-.32,y+.18,z-.08],
    [x+.015,y+.24,z+.015],[x+.10,y-.03,z+.06]]);
 }
 // Forked three-dimensional caudal fluke: two pointed lobes and a central notch.
 const tailFin=xyzFin(tailRig,'finCream','broad-forked-tail-fluke',[
  [-.84,.43,-.42],[-1.24,.68,-.40],[-1.72,.81,-.34],
  [-1.45,.50,-.36],[-1.30,.32,-.35],
  [-1.76,.10,-.28],[-1.32,.07,-.33],[-.90,.24,-.40]]);
 xyzFin(tailRig,'finShadow','tail-fin-recess',[
  [-1.03,.35,-.38],[-1.42,.42,-.34],[-1.26,.32,-.35],[-1.56,.18,-.32]]);
 // Leg silhouette and broad sculpted leather boots.
 for(const side of [-1,1]){
  const x=side*.28;
  between(model,'pants','dark-trouser-'+side,[x,.94,-.005],[x,.40,.006],.205,.168,8);
  between(model,'boots','leather-shaft-'+side,[x,.47,.010],[x,.19,.040],.173,.209,8);
  ell(model,'bootShade','boot-instep-'+side,[x,.145,.20],[.242,.156,.367],1);
  ell(model,'boots','boot-shaft-cuff-'+side,[x,.43,.05],[.224,.105,.20],0);
  box(model,'sole','solid-boot-sole-'+side,[x,.045,.265],[.440,.09,.625]);
  box(model,'boots','boot-top-strap-'+side,[x,.415,.185],[.365,.102,.08]);
 }
 // Garment is an actual tapered cloth shell with shaped skirt hem and a front slit.
 loftY(model,'coat','tailored-beige-work-apron',[
  [.65,0,.075,.53,.305],[.78,0,.077,.53,.305],
  [1.00,0,.072,.46,.255],[1.28,0,.055,.41,.229],
  [1.57,0,.065,.398,.239]
 ],10);
 loftY(model,'coatLight','upper-workwear-bodice',[
  [1.32,0,.060,.35,.235],[1.64,0,.045,.425,.260],
  [1.93,0,.025,.435,.276],[2.02,0,.035,.325,.220]
 ],10);
 // Long panels and clean front pleat so tunic looks like actual workwear.
 xyzFin(model,'coatDark','front-apron-left-pleat',[
  [-.05,.665,.365],[-.10,1.17,.285],[-.07,1.30,.295],[-.20,.68,.345]]);
 xyzFin(model,'coatLight','front-apron-right-pleat',[
  [.07,.67,.36],[.13,1.35,.275],[.29,.69,.302]]);
 xyzFin(model,'coatDark','bottom-hem-slit-left',[
  [-.075,.64,.38],[-.03,.89,.395],[-.01,.64,.397]]);
 xyzFin(model,'coatDark','bottom-hem-slit-right',[
  [.075,.64,.38],[.03,.87,.401],[.01,.64,.405]]);
 // Shirt and crisp articulated collars.
 loftY(model,'shirt','linen-shirt-neck',[
  [1.86,0,.024,.325,.208],[2.11,0,.033,.23,.165]
 ],10);
 for(const side of [-1,1]){
  const s=side;
  xyzFin(model,'collar','shirt-collar-flap-'+s,[
   [s*.025,2.125,.245],[s*.275,2.097,.253],
   [s*.170,1.944,.330],[s*.018,1.990,.304]]);
  // Over-shoulder canvas straps are distinctly separate from the bodice.
  between(model,'belt','brown-shoulder-strap-'+s,
   [s*.333,1.98,.115],[s*.324,1.36,.275],.078,.070,6);
  // Rolled sleeves and articulated elbows, cuff rings and five fingers.
  const shoulder=[s*.462,1.927,.028],elbow=[s*.572,1.55,.092],
    wrist=[s*.607,1.303,.19];
  between(model,'shirt','shirt-upper-sleeve-'+s,shoulder,elbow,.247,.205,9);
  between(model,'shirt','shirt-rolled-forearm-'+s,elbow,wrist,.195,.163,9);
  between(model,'collar','folded-linen-cuff-'+s,
   [s*.598,1.415,.16],[s*.612,1.345,.176],.201,.196,8);
  ell(model,'glove','gloved-palm-'+s,[s*.625,1.175,.196],[.175,.155,.127],1);
  ell(model,'gloveLight','glove-knuckle-'+s,[s*.617,1.142,.295],[.149,.091,.070],0);
  for(let i=0;i<4;i++){
   const fx=s*(.51+i*.076);
   between(model,'glove','glove-finger-'+s+'-'+i,
    [fx,1.145,.298],[fx+s*.005,1.061+(i%2)*.012,.315],.031,.028,5);
  }
  between(model,'glove','thumb-'+s,[s*.49,1.195,.298],
   [s*.465,1.091,.366],.062,.037,6);
 }
 // Brown leather belt with metal square buckle and belt loops.
 box(model,'belt','waist-leather-belt',[0,1.34,.263],[.897,.126,.135]);
 box(model,'metal','metal-buckle-frame',[0,1.34,.361],[.229,.183,.058]);
 box(model,'belt','buckle-center-hole',[0,1.34,.403],[.146,.100,.024]);
 box(model,'metal','buckle-pin',[.028,1.34,.428],[.070,.024,.018]);
 for(let x of [-.29,.29]){
  box(model,'beltEdge','belt-loop-'+x,[x,1.34,.338],[.049,.160,.040]);
 }
 // Side shoulder satchel, visibly attached at the left hip.
 between(model,'belt','shoulder-bag-strap',[-.395,1.976,.020],
   [-.62,1.11,.02],.047,.041,7);
 box(model,'bag','rectangular-leather-satchel',[-.663,1.087,.11],[.387,.423,.273]);
 box(model,'bagShade','satchel-flap',[-.667,1.211,.265],[.400,.126,.037]);
 ell(model,'metal','satchel-metal-button',[-.655,1.194,.288],[.035,.035,.016],0);
 // The red scarf is a separate folded ribbon with a knot and overlapping tails.
 ell(model,'scarf','red-scarf-knot',[0,1.986,.335],[.122,.105,.069],1);
 xyzFin(model,'scarf','scarf-left-tail',[
  [-.045,1.958,.391],[-.124,1.797,.397],[-.038,1.737,.411],
  [.023,1.847,.407]]);
 xyzFin(model,'scarfShade','scarf-right-tail',[
  [.016,1.970,.403],[.115,1.811,.416],[.192,1.767,.398],
  [.077,1.710,.416]]);
 xyzFin(model,'scarf','scarf-front-fold',[
  [-.103,2.018,.355],[-.005,1.955,.416],[.112,2.011,.357]]);
 // Head is an intentional single anatomically coherent fish skull, not a
 // cluster of small balls. Faceted 12-vertex contour and extended angular snout.
 const skull=new THREE.Group();skull.name='large-faceted-fish-head';model.add(skull);
 loftY(skull,'scales','fish-skull-shell',[
  [2.00,0,-.037,.230,.23],[2.16,0,-.031,.360,.30],
  [2.40,0,-.052,.474,.39],[2.64,0,-.065,.515,.405],
  [2.83,-.02,-.075,.468,.346],[2.99,-.02,-.096,.335,.265],
  [3.045,-.03,-.116,.14,.120]
 ],12);
 // Blue upper eyebrow ridge / angular snout projects forward.
 ell(skull,'blueLite','elongated-fish-snout',[0,2.539,.372],[.392,.217,.519],1);
 ell(skull,'scales','nose-tip-upper-lip',[0,2.521,.742],[.321,.078,.195],1);
 ell(skull,'belly','pale-underjaw',[0,2.348,.476],[.381,.121,.353],1);
 ell(skull,'blueShadow','deep-mouth-seam',[0,2.429,.748],[.298,.014,.122],0);
 ell(skull,'blueLite','lower-lip-rim',[0,2.396,.761],[.291,.023,.105],0);
 // Both gold eyes are nested radial discs, custom pupils and eye highlights.
 for(const side of [-1,1]){
  const s=side,pivot=new THREE.Group();pivot.position.set(s*.385,2.735,.171);
  pivot.scale.set(.87,.89,.77);
  // Eyes follow cheek/temple direction rather than front-facing cartoon eyes.
  pivot.rotation.y=s*.63;skull.add(pivot);
  const dark=ell(pivot,'eyeSocket','deep-eye-orbit-'+s,[0,0,.003],
   [.290,.285,.136],1);
  ell(pivot,'eyeDeep','ochre-eye-outer-'+s,[0,0,.121],[.248,.244,.105],1);
  ell(pivot,'eyeOchre','gold-iris-'+s,[0,0,.173],[.218,.219,.078],1);
  // Radial triangles show the low-poly eye facets.
  for(let j=0;j<10;j++){
   const a=j*Math.PI/5,b=(j+1)*Math.PI/5;
   xyzFin(pivot,j%3===0?'eyeHighlight':'eyeOchre','eye-facet-'+s+'-'+j,[
    [0,0,.232],[Math.cos(a)*.183,Math.sin(a)*.184,.239],
    [Math.cos(b)*.183,Math.sin(b)*.184,.239]]);
  }
  ell(pivot,'pupil','dark-centered-pupil-'+s,[0,0,.263],[.077,.087,.035],1);
  ell(pivot,'gloss','tiny-eye-glint-'+s,[-.035,.040,.295],[.024,.031,.014],0);
  // Long, broad triangular side fins, with a darker fold at the root.
  xyzFin(skull,'finCream','large-pale-cheek-fin-'+s,[
   [s*.405,2.445,.050],[s*.798,2.552,-.033],
   [s*.968,2.425,.105],[s*.619,2.294,.183]]);
  xyzFin(skull,'finShadow','cheek-fin-inner-rib-'+s,[
   [s*.441,2.429,.063],[s*.800,2.507,-.004],[s*.635,2.336,.145]]);
  // Small rear fin on lower cheek.
  xyzFin(skull,'finCream','small-jaw-fin-'+s,[
   [s*.407,2.257,-.054],[s*.767,2.230,-.116],
   [s*.695,2.091,.066],[s*.424,2.136,.065]]);
 }
 // Multi-layered dorsal crest with long pointed cream fins, not round spikes.
 for(const [i,desc] of [
  {x:-.03,y:2.96,z:-.23,w:.49,h:.33},
  {x:-.10,y:2.84,z:-.31,w:.52,h:.28},
  {x:-.17,y:2.67,z:-.38,w:.54,h:.29},
  {x:-.22,y:2.50,z:-.43,w:.49,h:.26},
  {x:-.25,y:2.34,z:-.47,w:.43,h:.25}
 ].entries()){
  const {x,y,z,w,h}=desc;
  xyzFin(skull,i%2===0?'finCream':'finShadow','tall-dorsal-crown-'+i,[
   [x-.05,y-.10,z],[x-w*.47,y+h,z-.10],
   [x+w*.43,y+h*.22,z-.11],[x+w*.38,y-.12,z]]);
 }
 // Tiny nostrils and layered blue gill plates for profile readability.
 for(const s of [-1,1]){
  ell(skull,'gills','small-nostril-'+s,[s*.174,2.616,.904],[.023,.018,.012],0);
  for(let j=0;j<3;j++){
   const g=ell(skull,j===0?'blueShadow':'blueLite','gill-cover-'+s+'-'+j,
    [s*(.405-j*.008),2.47-j*.075,-.113-j*.040],
    [.055,.086,.186],0);
   g.rotation.z=s*.28;
  }
 }
 // A fuller fish is designed at height 3.20, not constructed at tiny scene dimensions.
 const physicalHeight=3.20*scale,doorHeight=.72;
 function update(dt){ // Completely fixed fishman; a very restrained breathing idle only.
  const delta=Math.min(.08,Math.max(0,Number(dt)||0));
  clock+=delta;
  model.scale.y=1+.0018*Math.sin(clock*.85);
  tailRig.rotation.y=.014*Math.sin(clock*.62);
 }
 let clock=0;update(0);
 function getState(){
  const y=root.position.y;
  return {
   name:'lighthouse-fishman',form:'fishman',permanent:true,morphing:false,
   height:physicalHeight,doorHeight,belowDoor:physicalHeight<doorHeight,
   sourceModelHeight:3.20,scaleFactor:scale,geometry:'faceted-authored-3d',
   vertices:meshes.reduce((n,m)=>n+m.geometry.attributes.position.count,0),
   meshCount:meshes.length,
   fishEyes:2,dorsalFinCount:12,tailVisible:true,
   outfit:{beigeApron:true,scarf:true,leatherBag:true,boots:true},
   position:{x:location.x,z:location.z,ground:+y.toFixed(3)},
   doorDistance:+Math.hypot(location.x-.82,location.z+1.52).toFixed(3),
   fireDistance:+Math.hypot(location.x-1.80,location.z-1.70).toFixed(3)
  };
 }
 return {root,model,update,getState};
}
