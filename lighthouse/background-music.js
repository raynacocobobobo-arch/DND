/* Lighthouse background soundtrack controller.
 * Browser autoplay rules require explicit click/tap to begin playback.
 * Bundled path is used after the MP3 file is published; local selection is a
 * functional fallback in the meantime, with no external music services.
 */
const player=document.getElementById('game-background-music');
const toggle=document.getElementById('music-toggle');
const filePicker=document.getElementById('music-file');
const status=document.getElementById('music-status');
const volume=document.getElementById('music-volume');
const label=document.getElementById('music-load-label');
const bundled='./audio/lighthouse_background_music.mp3';
let objectURL=null,ready=false,loading=false;
player.volume=.35;player.loop=true;
function notify(message){
 status.hidden=false;status.textContent=message;
}
function state(){
 toggle.setAttribute('aria-pressed',String(!player.paused));
 toggle.textContent=player.paused?'音乐：关闭':'音乐：播放中';
}
function applySource(url,isLocal=false){
 player.pause();
 if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}
 if(isLocal)objectURL=url;
 player.src=url;player.load();ready=true;
 state();
}
async function play(){
 if(!ready){
  notify('尚未载入背景音乐。请点击「载入音乐」选择 MP3 文件。');
  filePicker.click();return;
 }
 try{
  loading=true;await player.play();
  notify('背景音乐播放中（循环）');
 }catch(err){
  notify('浏览器未允许播放。请再次点击音乐按钮。');
 }finally{loading=false;state();}
}
toggle.addEventListener('click',()=>{
 if(loading)return;
 if(player.paused)play();else{player.pause();notify('背景音乐已暂停');state();}
});
filePicker.addEventListener('change',()=>{
 const file=filePicker.files?.[0];
 if(!file)return;
 if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a)$/i.test(file.name)){
  notify('请选择 MP3、WAV、OGG 或 M4A 音频文件。');return;
 }
 applySource(URL.createObjectURL(file),true);
 label.textContent='更换音乐';
 notify('已载入：'+file.name+' · 点击「音乐」开始播放');
 play();
});
volume.addEventListener('input',()=>{player.volume=Number(volume.value)/100;});
player.addEventListener('ended',state);
player.addEventListener('pause',state);
player.addEventListener('play',state);
player.addEventListener('error',()=>{if(ready)notify('音频无法读取，请重新选择本地文件。');});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden && !player.paused)player.pause();
});
window.__lighthouseMusic={
 getState:()=>({ready,playing:!player.paused,volume:player.volume,loop:player.loop,
 source:objectURL?'local-file':ready?'bundled':'none'}),
 play,pause:()=>player.pause()
};
// Only treat the bundled MP3 as available when server confirms its presence.
// Explicitly avoid 404 autoplay errors when the audio binary is not deployed.
fetch(bundled,{method:'HEAD'}).then(r=>{
 if(!r.ok)return;
 const type=r.headers.get('content-type')||'';
 if(/text\/html/.test(type))return;
 if(!ready){applySource(bundled,false);notify('背景音乐已就绪，点击「音乐」播放');}
}).catch(()=>{});
state();
