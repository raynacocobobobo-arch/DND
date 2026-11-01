import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v14-world.js?v=14b';

/** Layered, gently moving fog from 85-100% normalized edge distance.
 *  Horizontal veils work from above; full-height curtains hide the cutaway side.
 */
export function createPerimeterFog(){
 const root=new T.Group();root.name='ocean-perimeter-dense-fog';group.add(root);
 const dark=new T.Color('#0b2536'),bright=new T.Color('#9bbdc6'),tint=dark.clone();
 const uTime={value:0},uColor={value:tint};
 const vertex=[
  'varying vec2 vUv;varying vec3 vWorld;',
  'void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vWorld=w.xyz;',
  'gl_Position=projectionMatrix*viewMatrix*w;}'
 ].join('\n');
 const noise=[
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
  'return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}'
 ].join('\n');
 const horizontal=[
  'varying vec2 vUv;varying vec3 vWorld;',
  'uniform vec3 uColor;uniform float uTime;uniform float uStrength;',
  noise,
  'void main(){float r=length((vUv-.5)*2.0)*1.12;',
  'r+=.038*(n(vWorld.xz*.23+vec2(uTime*.009,0.))-.5);',
  'float a=smoothstep(.75,.96,r)*(1.0-smoothstep(1.028,1.115,r));',
  'float mist=n(vWorld.xz*.28+vec2(uTime*.021,uTime*.010));',
  'float wisp=n(vWorld.xz*.66-vec2(0.,uTime*.029));',
  'float alpha=clamp(a*(.68+.27*mist+.14*wisp)*uStrength,0.,.98);',
  'gl_FragColor=vec4(uColor,alpha);}'
 ].join('\n');
 const curtain=[
  'varying vec2 vUv;varying vec3 vWorld;',
  'uniform vec3 uColor;uniform float uTime;uniform float uStrength;',
  'void main(){float wave=.86+.09*sin(vWorld.x*.51+vWorld.z*.62+uTime*.18);',
  'float alpha=clamp(wave*uStrength,0.,.97);gl_FragColor=vec4(uColor,alpha);}'
 ].join('\n');
 function mat(shader,opacity){
  return new T.ShaderMaterial({
   uniforms:{uTime,uColor,uStrength:{value:opacity}},
   vertexShader:vertex,fragmentShader:shader,transparent:true,
   side:T.DoubleSide,depthWrite:false,depthTest:true
  });
 }
 const fogMeshes=[];
 // Seven overlapping translucent banks create a volume without flat vertical
 // rectangles or any exposed top edges; all fade spatially from 85-100%.
 for(const [y,alpha] of [
   [.35,.51],[.73,.56],[1.12,.61],[1.57,.62],
   [2.05,.55],[2.62,.50],[3.23,.38]
 ]){
  const o=new T.Mesh(new T.PlaneGeometry(W*1.12,D*1.12),mat(horizontal,alpha));
  o.rotation.x=-Math.PI/2;o.position.set(WATER_CENTER_X,y,WATER_CENTER_Z);
  o.name='perimeter-fog-horizontal';o.frustumCulled=false;o.renderOrder=32;
  o.castShadow=false;root.add(o);fogMeshes.push(o);
 }
 let clock=0,mode='night';
 function setMode(next){mode=next==='day'?'day':'night';}
 function update(dt,dayBlend){
  clock+=Math.min(Math.max(0,dt||0),.5);
  uTime.value=clock;tint.copy(dark).lerp(bright,T.MathUtils.clamp(dayBlend??(mode==='day'?1:0),0,1));
 }
 return {root,update,setMode,getState:()=>({veilCount:7,curtainCount:0,
  meshCount:fogMeshes.length,clearInterior:.85,denseAt:1.0,mode})};
}
