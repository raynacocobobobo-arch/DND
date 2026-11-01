import * as T from 'three';
import {W,D,WATER_CENTER_X,WATER_CENTER_Z,group} from './v14-world.js?v=14d';

/** Seven softly layered cloud veils conceal the outer 80-100% ocean perimeter.
 *  No square geometry is drawn at the boundary; fog dissolves into the sky.
 */
export function createPerimeterFog(){
 const root=new T.Group();root.name='ocean-perimeter-dense-fog';group.add(root);
 const dark=new T.Color('#49697a'),bright=new T.Color('#c5dce0'),tint=dark.clone();
 const skyNight=new T.Color('#071b2b'),skyDay=new T.Color('#8bbdd2'),sky=skyNight.clone();
 const uTime={value:0},uColor={value:tint},uSky={value:sky};
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
  'uniform vec3 uColor;uniform vec3 uSky;uniform float uTime;uniform float uStrength;',
  noise,
  // World-space radial distance with multi-scale noisy boundaries: no oval vignette.
  'void main(){float r=length((vUv-.5)*2.0)*1.12;',
  'float n1=n(vWorld.xz*.16+vec2(uTime*.004,-uTime*.005));',
  'float n2=n(vWorld.xz*.43+vec2(-uTime*.012,uTime*.006));',
  'float edge=r+.080*(n1-.5)+.035*(n2-.5);',
  // Thick cloud occupies the outer sea; it blends out to the exact sky color.
  'float bank=smoothstep(.78,.96,edge)*(1.0-smoothstep(1.00,1.27,edge));',
  'float mist=n(vWorld.xz*.27+vec2(uTime*.012,uTime*.003));',
  'float streak=n(vWorld.xz*.81-vec2(uTime*.018,uTime*.009));',
  'float density=clamp(.76+.22*mist+.18*streak,.50,1.25);',
  'float alpha=clamp(bank*density*uStrength,0.,.98);',
  'vec3 fogColor=mix(uColor,uSky,smoothstep(.90,1.19,edge));',
  'gl_FragColor=vec4(fogColor,alpha);}'
 ].join('\n');
 const curtain=[
  'varying vec2 vUv;varying vec3 vWorld;',
  'uniform vec3 uColor;uniform float uTime;uniform float uStrength;',
  'void main(){float wave=.86+.09*sin(vWorld.x*.51+vWorld.z*.62+uTime*.18);',
  'float alpha=clamp(wave*uStrength,0.,.97);gl_FragColor=vec4(uColor,alpha);}'
 ].join('\n');
 function mat(shader,opacity){
  return new T.ShaderMaterial({
   uniforms:{uTime,uColor,uSky,uStrength:{value:opacity}},
   vertexShader:vertex,fragmentShader:shader,transparent:true,
   side:T.DoubleSide,depthWrite:false,depthTest:true
  });
 }
 const fogMeshes=[];
 // Seven overlapping translucent banks hide the sea edge from elevated views.
 // Their irregular, wide sky-color fade prevents a conspicuous dark oval border.
 for(const [y,alpha] of [
   [.35,.58],[.73,.64],[1.12,.66],[1.57,.60],
   [2.05,.56],[2.62,.48],[3.23,.42]
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
  uTime.value=clock;
  const blend=T.MathUtils.clamp(dayBlend??(mode==='day'?1:0),0,1);
  tint.copy(dark).lerp(bright,blend);sky.copy(skyNight).lerp(skyDay,blend);
 }
 return {root,update,setMode,getState:()=>({veilCount:7,curtainCount:0,
  meshCount:fogMeshes.length,clearInterior:.78,denseAt:.96,mode})};
}
