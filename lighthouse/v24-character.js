import * as T from 'three';
import {group,coastalHeight} from './v23-world.js?v=23a';

/** One consistent body, day human / night fish form.
 * Referenced by the supplied low-poly character paintings.
 * Sized below the lighthouse entrance (0.72 scene units, character max 0.69).
 */
export function createDayNightVisitor(){
 const door={x:.82,z:-1.52,height:.72};
 const fire={x:1.80,z:1.70};
 // On the path from tower doorway to campfire, outside both footprints.
 const x=1.30,z=-.03,ground=coastalHeight(x,z);
 const root=new T.Group();root.name='day-night-fishman-visitor';
 root.position.set(x,ground,z);
 // Face partly toward the standard camera (+x,+z).
 root.rotation.y=.62;
 group.add(root);
 const size=.595,fishHeight=1.19*size,humanHeight=1.18*size;
 root.scale.setScalar(size);
 const color=(c)=>new T.MeshLambertMaterial({
  color:c,flatShading:true,side:T.DoubleSide
 });
 const m={
  coat:color('#cfa366'),coatSide:color('#ae8150'),shirt:color('#eee1c8'),
  collar:color('#f8ecda'),skin:color('#bb7c55'),skinLight:color('#d4a27a'),
  trousers:color('#493a32'),boots:color('#76452d'),sole:color('#47312a'),
  dark:color('#2a2522'),belt:color('#553a2b'),metal:color('#b5a89a'),
  scarf:color('#c33f31'),scarfDark:color('#982e28'),
  bag:color('#a65a29'),bagTrim:color('#713920'),strap:color('#6b442c'),
  hair:color('#65402c'),hairLight:color('#7e512e'),
  eyeWhite:color('#f3e2c9'),iris:color('#3d281d'),eyebrow:color('#4e3023'),
  fish:color('#42566f'),fishLight:color('#62778a'),fishTop:color('#31465e'),
  fishBelly:color('#8992a0'),fin:color('#d3aa81'),
  gold:color('#f6bd37'),goldShadow:color('#d69121'),
  pupil:color('#30282a')
 };
 function add(parent,geometry,mat,x0=0,y0=0,z0=0){
  const mesh=new T.Mesh(geometry,mat);
  mesh.position.set(x0,y0,z0);mesh.castShadow=true;mesh.receiveShadow=true;
  parent.add(mesh);return mesh;
 }
 function ell(parent,mat,x0,y0,z0,sx,sy,sz,detail=0){
  const ob=add(parent,new T.IcosahedronGeometry(1,detail),mat,x0,y0,z0);
  ob.scale.set(sx,sy,sz);return ob;
 }
 function block(parent,mat,x0,y0,z0,w,h,d){
  return add(parent,new T.BoxGeometry(w,h,d),mat,x0,y0,z0);
 }
 function taper(parent,mat,a,b,ra,rb,sides=6){
  const p=new T.Vector3(...a),q=new T.Vector3(...b);
  const v=q.clone().sub(p),ob=add(parent,new T.CylinderGeometry(rb,ra,v.length(),sides),mat);
  ob.position.copy(p).add(q).multiplyScalar(.5);
  ob.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
  return ob;
 }
 function fin(parent,mat,coords){
  const geom=new T.BufferGeometry(),points=[];
  for(const [a,b,c] of [[0,1,2],[0,2,3]]){
   for(const k of [a,b,c])points.push(...coords[k]);
  }
  geom.setAttribute('position',new T.Float32BufferAttribute(points,3));
  geom.computeVertexNormals();
  return add(parent,geom,mat);
 }
 // COMMON body: exactly the same clothing, stature, hands, boots and position.
 const common=new T.Group();root.add(common);
 const jacket=ell(common,m.shirt,0,.552,-.006,.224,.228,.150,1);
 ell(common,m.coat,0,.495,.095,.216,.224,.128,1);
 block(common,m.coat,0,.358,.117,.395,.275,.235);
 // Main beige waistcoat / long apron, darker angular seam on one side.
 const apron=add(common,new T.CylinderGeometry(.212,.247,.43,5),m.coat,0,.384,.038);
 apron.rotation.y=Math.PI/5;
 block(common,m.coatSide,-.158,.355,.154,.076,.28,.021);
 // Light collar and shirt lapels.
 ell(common,m.collar,-.102,.712,.094,.103,.056,.054,0);
 ell(common,m.collar,.106,.712,.094,.103,.056,.054,0);
 // Red scarf knot with two long folded tails.
 ell(common,m.scarf,0,.689,.183,.055,.060,.050,0);
 taper(common,m.scarf,[-.016,.662,.206],[-.055,.565,.203],.052,.018,3);
 taper(common,m.scarfDark,[.017,.665,.213],[.065,.572,.207],.047,.021,3);
 // Leather belt, buckle, and side satchel.
 block(common,m.belt,0,.327,.137,.452,.069,.307);
 block(common,m.metal,.012,.325,.312,.090,.075,.024);
 block(common,m.belt,.012,.324,.331,.058,.047,.018);
 taper(common,m.strap,[-.174,.673,.012],[-.218,.318,.018],.036,.026,5);
 block(common,m.bag,-.265,.259,.080,.155,.180,.155);
 block(common,m.bagTrim,-.266,.294,.173,.153,.065,.024);
 ell(common,m.metal,-.263,.288,.187,.017,.015,.012);
 for(const s of [-1,1]){
  // Sleeves, forearms, five-sided mitten-like hands.
  const arm=ell(common,m.shirt,s*.218,.573,0,.103,.171,.120,1);
  arm.rotation.z=-s*.20;
  taper(common,m.shirt,[s*.245,.52,.012],[s*.262,.396,.033],.100,.080,7);
  ell(common,m.collar,s*.265,.407,.038,.087,.041,.097,0);
  ell(common,m.skin,s*.274,.334,.055,.074,.089,.079,0);
  block(common,m.trousers,s*.119,.205,-.020,.177,.260,.187);
  taper(common,m.boots,[s*.119,.190,.010],[s*.127,.098,.014],.103,.105,6);
  ell(common,m.boots,s*.132,.078,.067,.128,.094,.166,0);
  block(common,m.sole,s*.132,.029,.098,.242,.046,.255);
  ell(common,m.boots,s*.126,.144,.018,.106,.049,.108,0);
 }
 const collar=ell(common,m.skinLight,0,.729,.006,.087,.092,.088,0);
 // DAY: human face and short, angular chestnut-brown hair.
 const human=new T.Group();human.name='day-human-head';root.add(human);
 ell(human,m.skinLight,0,.889,.012,.176,.185,.150,1);
 ell(human,m.skinLight,0,.858,.151,.102,.081,.072,0); // nose
 ell(human,m.skin,-.168,.866,.007,.044,.066,.050,0);
 ell(human,m.skin,.168,.866,.007,.044,.066,.050,0);
 for(const s of [-1,1]){
  ell(human,m.eyeWhite,s*.076,.911,.141,.037,.032,.019);
  ell(human,m.iris,s*.075,.913,.158,.019,.025,.013);
  const brow=ell(human,m.eyebrow,s*.079,.957,.145,.051,.014,.018);
  brow.rotation.z=s*.14;
 }
 ell(human,m.skin,0,.807,.151,.071,.014,.013); // restrained closed-mouth smile
 ell(human,m.hair,0,1.035,-.040,.193,.092,.160,1);
 const hairPieces=[
  [-.135,1.030,.052,-.48],[.115,1.067,.043,.40],
  [-.055,1.099,.028,-.20],[.055,1.099,.043,.22],
  [-.157,.986,-.055,-.20],[.147,1.009,-.033,.20],
  [0,1.047,-.161,0],[-.045,1.032,.120,-.45]
 ];
 hairPieces.forEach(([xx,yy,zz,rz],i)=>{
  const t=ell(human,i%3===0?m.hairLight:m.hair,xx,yy,zz,
    .088,.080,.084,0);
  t.rotation.z=rz;
 });
 // NIGHT: broad blue-grey fish skull, yellow eyes, creamy cheek fins.
 const fish=new T.Group();fish.name='night-fish-head';root.add(fish);
 ell(fish,m.fish,0,.893,-.039,.204,.195,.183,1);
 ell(fish,m.fishTop,0,1.015,-.093,.185,.071,.132,0);
 ell(fish,m.fishLight,0,.851,.135,.191,.097,.166,1); // elongated snout
 ell(fish,m.fishBelly,0,.797,.136,.181,.058,.145,0);
 block(fish,m.fishTop,0,.842,.259,.245,.020,.033); // dark mouth line
 ell(fish,m.fishLight,0,.804,.263,.174,.022,.043,0);
 for(const s of [-1,1]){
  ell(fish,m.goldShadow,s*.167,.957,.083,.111,.113,.070,1);
  ell(fish,m.gold,s*.169,.963,.126,.091,.096,.042,1);
  ell(fish,m.pupil,s*.169,.961,.169,.035,.045,.018,0);
  // Geometric side fins stick out distinctly from the head.
  fin(fish,m.fin,[[s*.19,.861,-.045],[s*.38,.923,.001],
    [s*.29,.774,.060],[s*.17,.787,.027]]);
 }
 // Fish spines behind the head.
 for(const [i,yy] of [1.09,1.025,.957].entries()){
  fin(fish,m.fin,[[-.084,yy,-.17],[.01,yy+.09-i*.018,-.22],
    [.107,yy-.002,-.205],[.032,yy-.045,-.164]]);
 }
 // Long fish dorsal body and tail behind the shared work clothes.
 const fins=new T.Group();fins.name='night-dorsal-fins-and-tail';root.add(fins);
 for(let i=0;i<6;i++){
  let yy=.73-i*.107;
  ell(fins,i%2===0?m.fish:m.fishLight,0,yy,-.205-i*.013,
    .164-i*.012,.102,.100,0);
 }
 const tailStem=taper(fins,m.fish,[0,.205,-.228],[0,.170,-.350],.077,.059,6);
 fin(fins,m.fishLight,[[0,.177,-.340],[-.220,.340,-.500],
   [-.155,.170,-.535],[0,.123,-.380]]);
 fin(fins,m.fin,[[0,.178,-.340],[.198,.259,-.493],
   [.160,.055,-.527],[0,.121,-.386]]);
 // Animation: shared body fixed; smooth shape-only transformation, no teleport.
 let dayBlend=0,clock=0;
 function update(dt,blend=0){
  clock+=Math.min(Math.max(0,Number(dt)||0),.10);
  dayBlend=T.MathUtils.clamp(blend,0,1);
  const smooth=t=>t*t*(3-2*t);
  const day=smooth(dayBlend),night=1-day;
  const humanScale=Math.max(.001,day),fishScale=Math.max(.001,night);
  // Transform in place: same feet, hands, coat, satchel and orientation.
  human.scale.setScalar(humanScale);
  fish.scale.setScalar(fishScale);
  fins.scale.setScalar(fishScale);
  human.visible=day>.0001;fish.visible=night>.0001;fins.visible=night>.0001;
  common.scale.y=1+.004*Math.sin(clock*1.0);
  const headBob=.003*Math.sin(clock*.9);
  human.position.y=(1-humanScale)*.89+headBob;
  fish.position.y=(1-fishScale)*.89+headBob;
  fins.position.y=(1-fishScale)*.47;
 }
 update(0,0);
 function getState(){
  return {
   name:'lighthouse-visitor',form:dayBlend>.98?'human':dayBlend<.02?'fishman':'morphing',
   dayBlend:+dayBlend.toFixed(4),humanScale:+human.scale.x.toFixed(4),
   fishScale:+fish.scale.x.toFixed(4),fishFinsVisible:fins.visible,
   sharedBody:true,position:{x,z,ground:+ground.toFixed(3)},
   height:Math.max(fishHeight,humanHeight),
   doorHeight:door.height,belowDoor:Math.max(fishHeight,humanHeight)<door.height,
   doorDistance:+Math.hypot(x-door.x,z-door.z).toFixed(3),
   fireDistance:+Math.hypot(x-fire.x,z-fire.z).toFixed(3),
   visiblePartCount:root.children.filter(x=>x.visible).length
  };
 }
 return {root,update,getState};
}
