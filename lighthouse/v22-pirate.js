import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z} from './v22-world.js?v=22a';
/** Low-poly two-masted pirate ship, uniquely visible during its own night event.
 *  Sails are genuine deforming meshes, not rotating cards or static planes.
 */
export function createPirateShip(parent){
 const ship=new T.Group();ship.name='wandering-pirate-ship';ship.visible=false;parent.add(ship);
 const wood=new T.MeshStandardMaterial({color:'#6d4935',roughness:.96,flatShading:true,side:T.DoubleSide});
 const edges=new T.MeshStandardMaterial({color:'#9d7049',roughness:.92,flatShading:true});
 const dark=new T.MeshStandardMaterial({color:'#35292a',roughness:.91});
 const metal=new T.MeshStandardMaterial({color:'#a18c66',metalness:.38,roughness:.7});
 const black=new T.MeshStandardMaterial({color:'#272d31',roughness:1,side:T.DoubleSide});
 const seaFoam=new T.MeshBasicMaterial({color:'#7cbdc3',transparent:true,opacity:.35,depthWrite:false});
 function mesh(g,m,x=0,y=0,z=0,into=ship){
  const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;into.add(o);return o;
 }
 function beam(a,b,r=.027,mat=edges){
  const va=new T.Vector3(...a),vb=new T.Vector3(...b),v=vb.clone().sub(va);
  const o=mesh(new T.CylinderGeometry(r,r,v.length(),7),mat);
  o.position.copy(va.add(vb).multiplyScalar(.5));
  o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
  return o;
 }
 function cub(w,h,d,mat,x,y,z){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z)}
 const n=24,verts=[],uvs=[],idx=[],length=4.10,halfWidth=.67;
 const rings=[{y:-.39,w:.30},{y:-.23,w:.69},{y:.07,w:1},{y:.30,w:1.02}];
 for(let i=0;i<=n;i++){
  const t=-1+2*i/n,point=Math.pow(Math.max(0,1-t*t),.65);
  const bevel=.11*Math.pow(Math.abs(t),4);
  for(let j=0;j<rings.length;j++){
   const r=rings[j],w=halfWidth*r.w*point;
   for(let side of [-1,1]){
    verts.push(t*length/2,r.y+bevel,side*w);uvs.push(i/n,j/(rings.length-1));
   }
  }
 }
 const stride=rings.length*2;
 for(let i=0;i<n;i++)for(let j=0;j<rings.length-1;j++){
  for(let side=0;side<2;side++){
   let a=i*stride+j*2+side,b=(i+1)*stride+j*2+side;
   idx.push(a,b,a+2,a+2,b,b+2);
  }
 }
 const hullGeo=new T.BufferGeometry();
 hullGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));
 hullGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));hullGeo.setIndex(idx);hullGeo.computeVertexNormals();
 mesh(hullGeo,wood);
 // Solid visible deck + dark plank seams, gunwales and ribs.
 cub(3.39,.077,.98,edges,0,.14,0);
 for(let i=-9;i<=9;i++)cub(.018,.015,.99,wood,i*.183,.189,0);
 for(let side of [-1,1]){
  for(let i=0;i<18;i++){
   const x=-1.64+i*.19,t=x/(length/2),z=side*halfWidth*Math.pow(Math.max(0,1-t*t),.65);
   const rib=beam([x,-.24,z*.64],[x,.31,z],.022,edges);
   rib.castShadow=false;
  }
  const points=[];
  for(let i=0;i<=32;i++){
   const t=-1+2*i/32;
   points.push(new T.Vector3(t*length/2,.29+.11*Math.pow(Math.abs(t),4),
     side*halfWidth*1.02*Math.pow(Math.max(0,1-t*t),.65)));
  }
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.04,6,false),edges);
 }
 // Detailed prow, stern rail, bowsprit and a small open stern platform.
 beam([1.65,.15,0],[2.68,.62,0],.048,wood);
 cub(.55,.10,.81,edges,-1.62,.40,0);
 for(const side of [-1,1])beam([-1.79,.43,side*.39],[-1.79,.88,side*.39],.025,wood);
 beam([-1.79,.86,-.39],[-1.79,.86,.39],.023,wood);
 // Two masts. Two black sails per mast with subtly different proportions.
 const sailRecords=[];
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#292f33';ctx.fillRect(0,0,256,256);
 ctx.fillStyle='#e0dfd2';
 ctx.beginPath();ctx.ellipse(128,108,46,49,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#292f33';
 ctx.beginPath();ctx.ellipse(110,108,13,15,0,0,Math.PI*2);ctx.ellipse(147,108,13,15,0,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.moveTo(128,125);ctx.lineTo(119,141);ctx.lineTo(136,141);ctx.closePath();ctx.fill();
 ctx.fillStyle='#e0dfd2';ctx.fillRect(106,148,44,22);
 ctx.fillStyle='#292f33';for(let j=0;j<4;j++)ctx.fillRect(112+j*11,155,4,18);
 const skullTexture=new T.CanvasTexture(canvas);skullTexture.colorSpace=T.SRGBColorSpace;
 const plainSail=new T.MeshStandardMaterial({color:'#30353a',roughness:1,side:T.DoubleSide,flatShading:true});
 const skullSail=new T.MeshStandardMaterial({map:skullTexture,roughness:1,side:T.DoubleSide,flatShading:true});
 // Ship longitudinal axis is X. Every yard and sail runs across Z (beamwise),
 // perpendicular to travel, exactly as on the two-masted reference pirate ship.
 function sail(mastX,cy,w,h,sign,withSkull,seed){
  const col=12,row=9,arr=[],uv=[],indices=[],topY=cy+h/2;
  for(let j=0;j<=row;j++)for(let i=0;i<=col;i++){
   const u=i/col,v=j/row;
   const z=(u-.5)*w;
   const y=topY-v*h;
   const x=mastX+.09*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
   arr.push(x,y,z);
   // UV follows the horizontal yard (Z) and the vertical fold (Y).
   uv.push(u,1-v);
   if(j<row&&i<col){let a=j*(col+1)+i,b=a+col+1;indices.push(a,b,a+1,a+1,b,b+1)}
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(arr,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  const part=mesh(geo,withSkull?skullSail:plainSail);
  part.name='fluttering-pirate-sail';part.frustumCulled=false;
  sailRecords.push({geo,coords:geo.attributes.position,original:Float32Array.from(arr),width:w,seed});
  const left=-w/2,right=w/2;
  beam([mastX,topY,left],[mastX,topY,right],.032,edges);
  beam([mastX,topY-h-.04,left],[mastX,topY-h-.04,right],.024,edges);
  // Thin standing rigging runs toward the two ends of each cross-yard.
  for(const side of [-1,1]){
   beam([mastX,topY+.18,0],[mastX,topY,side*w*.53],.008,dark);
   beam([mastX,topY-h,side*w*.53],[mastX,.46,0],.008,dark);
  }
 }
 const mastXs=[-.90,.82];
 for(let i=0;i<2;i++){
  const x=mastXs[i],mastHeight=i===0?3.50:3.16;
  beam([x,.17,0],[x,mastHeight,0],.063,wood);
  sail(x,1.93,i===0?2.00:1.60,1.28,1,i===0,i+.9);
  sail(x,3.02,i===0?1.20:1.03,.73,1,false,4+i);
  // Pennants are attached to mast tips and face the same direction as the sails.
  const flag=mesh(new T.PlaneGeometry(.42,.23),black,x+.14,mastHeight+.08,0);
  flag.name='pirate-flag';flag.rotation.y=Math.PI/2;
  beam([x,mastHeight-.04,0],[x+.40,mastHeight-.04,0],.012,wood);
 }
 // Repeating on-board stern lantern.
 const lampMat=new T.MeshStandardMaterial({color:'#ffc978',emissive:0xff9e45,emissiveIntensity:1.4,roughness:.5});
 cub(.14,.20,.16,lampMat,-1.48,.62,-.46);
 cub(.14,.20,.16,lampMat,-1.48,.62,.46);
 const lanternFill=new T.PointLight(0xffcb88,3.8,7.5,1.6);
 lanternFill.position.set(-.15,1.4,.3);lanternFill.castShadow=false;ship.add(lanternFill);
 const wake=mesh(new T.TorusGeometry(1.0,.025,6,48),seaFoam);
 wake.rotation.x=Math.PI/2;wake.castShadow=false;
 wake.position.y=-.15;wake.scale.set(2.35,.95,1);
 // V20: 45-degree, north-edge -> east-edge route in the far offshore corner.
 // The navigation corridor is projected into the default camera and never
 // overlaps the little boat or any Kraken site.
 const edge={
   west:WATER_CENTER_X-W*.5,
   east:WATER_CENTER_X+W*.5,
   north:WATER_CENTER_Z-D*.5,
   south:WATER_CENTER_Z+D*.5
 };
 const heading=Math.PI/4,angle=-Math.PI/4;
 const direction=new T.Vector3(Math.SQRT1_2,0,Math.SQRT1_2);
 const northCross=new T.Vector3(9.50,0,edge.north);
 const eastCross=new T.Vector3(edge.east,0,edge.north+edge.east-northCross.x);
 // Start with the bowsprit just outside the north sea face and finish only
 // after the stern/wake have cleared the eastern sea face.
 const startPoint=northCross.clone().addScaledVector(direction,-3.18);
 const endPoint=eastCross.clone().addScaledVector(direction,3.22);
 const clippingPlanes=[
   new T.Plane(new T.Vector3(1,0,0),-edge.west),
   new T.Plane(new T.Vector3(-1,0,0),edge.east),
   new T.Plane(new T.Vector3(0,0,1),-edge.north),
   new T.Plane(new T.Vector3(0,0,-1),edge.south)
 ];
 ship.traverse(o=>{
   if(!o.isMesh)return;
   const materials=Array.isArray(o.material)?o.material:[o.material];
   for(const m of materials){
     m.clippingPlanes=clippingPlanes;
     m.clipShadows=true;
     m.needsUpdate=true;
   }
 });
 // Geometric separation from every possible Kraken spawn, including the
 // combined half-width of the pirate and the maximum tentacle reach.
 const shipRoute={
   type:'offshore-diagonal',
   angleDegrees:45,
   entryEdge:'north',
   exitEdge:'east',
   entry:{x:northCross.x,z:northCross.z},
   exit:{x:eastCross.x,z:eastCross.z},
   from:{x:startPoint.x,z:startPoint.z},
   to:{x:endPoint.x,z:endPoint.z},
   boundingSea:{...edge},
   heading:{x:direction.x,z:direction.z}
 };
 const setPos=(fraction,time)=>{
  const t=Math.min(1,Math.max(0,fraction));
  ship.position.set(
    T.MathUtils.lerp(startPoint.x,endPoint.x,t),
    .23+.025*Math.sin(time*2.3),
    T.MathUtils.lerp(startPoint.z,endPoint.z,t)
  );
  // Ship's longitudinal X axis follows the 45-degree travel vector.
  ship.rotation.set(.015*Math.sin(time*1.3),angle,.012*Math.sin(time*1.71));
  for(const record of sailRecords){
   const {coords,original,seed}=record;
   for(let k=0;k<coords.count;k++){
    const u=original[3*k+2],y=original[3*k+1];
    const flutter=.085*Math.sin(time*1.65+u*3.3+seed)+.035*Math.sin(time*2.6+y*2.0+seed);
    const rowPos=(k%(13))/12;
    const fold=Math.sin(Math.PI*rowPos);
    coords.setXYZ(k,original[3*k]+flutter*fold,y,
      u+.035*Math.cos(time*1.34+y*1.35+seed)*Math.sin(Math.PI*rowPos));
   }
   coords.needsUpdate=true;record.geo.computeVertexNormals();
  }
  ship.visible=true;
 };
 const state={active:false,progress:0,elapsed:0,duration:17,everAppeared:false};
 const stop=()=>{state.active=false;state.progress=0;state.elapsed=0;ship.visible=false};
 function start(){
  stop();state.active=true;state.everAppeared=true;
  state.duration=23+Math.random()*2;
  setPos(0,0);
 }
 function update(dt){
  if(!state.active)return;
  state.elapsed+=Math.max(0,dt);
  state.progress=Math.min(1,state.elapsed/state.duration);
  setPos(state.progress,state.elapsed);
  if(state.progress>=1)stop();
 }
 const getState=()=>{
  // Longitudinal visible-span approximation is continuous at both edges.
  // The real pixels are clipped by the four sea-face clipping planes above.
  const d=direction.x;
  const entering=Math.max(0,Math.min(1,(
   (ship.position.z-edge.north)/d+2.75)/5.15));
  const exiting=Math.max(0,Math.min(1,(
   (edge.east-ship.position.x)/d+2.40)/5.15));
  const visibleFraction=state.active?Math.min(entering,exiting):0;
  return {...state,visible:ship.visible,sails:sailRecords.length,
   sailMotion:sailRecords[0]?.coords.getX(37)??0,
   sailAxis:'transverse-Z',routeZ:+ship.position.z.toFixed(3),
   route:{...shipRoute},channel:[startPoint.x,endPoint.x],
   clipped:true,visibleFraction,
   x:+ship.position.x.toFixed(3),z:+ship.position.z.toFixed(3),
   yawDegrees:45,shipLength:4.10,
   distanceToDockBoat:+Math.hypot(ship.position.x+2,ship.position.z-6.1).toFixed(2)};
 };
 return {ship,start,stop,update,getState};
}
