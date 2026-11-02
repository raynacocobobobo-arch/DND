/* Lighthouse looping background soundtrack.
 * Try unmuted autoplay on page load. Browsers that disallow audible
 * autoplay will start on the first user gesture anywhere on the scene.
 * The bundled MP3 must be published at ./audio/lighthouse_background_music.mp3.
 */
const player=document.getElementById('game-background-music');
const toggle=document.getElementById('music-toggle');
const status=document.getElementById('music-status');
const volume=document.getElementById('music-volume');
const bundled='./audio/lighthouse_background_music.mp3';
let assetPresent=false,playingRequested=true,attempting=false;
player.volume=.35;player.loop=true;player.preload='auto';
function notify(message){status.hidden=false;status.textContent=message;}
function state(){
 const playing=!player.paused;
 toggle.setAttribute('aria-pressed',String(playing));
 toggle.textContent=playing?'音乐：播放中':'音乐：关闭';
}
async function begin(){
 if(!assetPresent||!playingRequested||attempting||!player.paused)return;
 attempting=true;
 try{
  await player.play();
  removeGestureRetry();
  notify('背景音乐自动循环播放中');
 }catch(e){
  // NotAllowedError is expected in browsers blocking audible autoplay.
  if(e.name==='NotAllowedError')notify('浏览器限制自动播放，点击游戏画面后将自动播放音乐');
  else notify('背景音乐暂时无法播放');
 }finally{attempting=false;state();}
}
function gestureRetry(){if(playingRequested)begin();}
function removeGestureRetry(){
 for(const type of ['pointerdown','keydown','touchstart'])window.removeEventListener(type,gestureRetry,true);
}
function setupGestureRetry(){
 for(const type of ['pointerdown','keydown','touchstart'])
  window.addEventListener(type,gestureRetry,{capture:true});
}
toggle.addEventListener('click',()=>{
 if(!player.paused){
  playingRequested=false;player.pause();
  notify('背景音乐已暂停');removeGestureRetry();
 }else{
  playingRequested=true;setupGestureRetry();begin();
 }
 state();
});
volume.addEventListener('input',()=>{player.volume=Number(volume.value)/100;});
player.addEventListener('play',state);
player.addEventListener('pause',state);
player.addEventListener('error',()=>{
 notify('音乐文件未加载成功，请检查网页音频资源是否已发布');
});
window.__lighthouseMusic={
 getState:()=>({assetPresent,ready:assetPresent,playing:!player.paused,
  autoPlayRequested:playingRequested,loop:player.loop,volume:player.volume,
  source:assetPresent?'bundled':'missing'}),
 play:()=>{playingRequested=true;begin();},
 pause:()=>{playingRequested=false;player.pause();state();}
};
setupGestureRetry();
// HEAD preflight avoids treating GitHub Pages' HTML fallback as MP3.
fetch(bundled,{method:'HEAD',cache:'no-store'}).then(r=>{
 if(!r.ok)return;
 const type=r.headers.get('content-type')||'';
 if(/text\/html/i.test(type))return;
 assetPresent=true;
 player.src=bundled;player.load();
 begin(); // attempt automatic playback immediately on every visit
}).catch(()=>{});
state();
