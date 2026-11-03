/* Lighthouse background soundtrack V4.
 * The soundtrack is shipped with the game; no file picker, sound button,
 * volume slider or separate music overlay is required.
 *
 * Browser policy: attempt audible playback on page load; where blocked by
 * Safari / Chrome, retry synchronously with the first user gesture anywhere
 * within the game. Do not attempt to circumvent the browser restriction.
 */
const audio=document.getElementById('game-background-music');
audio.volume=0.35;
audio.muted=false;
audio.loop=true;
audio.preload='auto';
let inFlight=false;
let lastError=null;
let startedOnce=false;
function state(value){document.body.dataset.musicStatus=value;}
function stopRetry(){
 for(const t of ['pointerdown','touchstart','keydown'])
   window.removeEventListener(t,attemptAutoplay,true);
}
function attemptAutoplay(){
 if(document.hidden||inFlight||!audio.paused||audio.error)return;
 inFlight=true;
 let promise;
 try { promise=audio.play(); }
 catch(e){inFlight=false;lastError=e?.name||String(e);state('blocked');return;}
 Promise.resolve(promise).then(()=>{
   startedOnce=true;lastError=null;state('playing');stopRetry();
 }).catch(e=>{
   lastError=e?.name||String(e);
   state(e?.name==='NotAllowedError'?'gesture-needed':'error');
 }).finally(()=>{inFlight=false;});
}
for(const t of ['pointerdown','touchstart','keydown'])
  window.addEventListener(t,attemptAutoplay,{capture:true,passive:t!=='keydown'});
audio.addEventListener('play',()=>state('playing'));
audio.addEventListener('pause',()=>{if(!document.hidden)state('paused');});
audio.addEventListener('error',()=>state('load-error'));
audio.addEventListener('canplay',attemptAutoplay);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){audio.pause();state('background-paused');}
 else attemptAutoplay();
});
window.addEventListener('pageshow',attemptAutoplay);
window.__lighthouseMusic={
 getState:()=>({
  playing:!audio.paused,ready:audio.readyState>=2,
  loop:audio.loop,volume:audio.volume,muted:audio.muted,
  duration:Number.isFinite(audio.duration)?audio.duration:null,
  source:audio.currentSrc,status:document.body.dataset.musicStatus,
  startedOnce,lastError
 }),
 play:attemptAutoplay,
 pause:()=>audio.pause()
};
state('loading');
attemptAutoplay();
