/* The Forbidden Arcana — image-first reading, 22 in-depth stories */
(()=>{
const depth=window.ARCANA_DEPTH||[];
if(depth.length!==22 || typeof C==='undefined'){console.warn('Arcana depth unavailable');return;}
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cap=(text)=>esc(text);
const chapter=(n,title,body,cls='')=>'<section class="chapter '+cls+'"><div class="chapter-index">'+n+'</div><h3>'+title+'</h3><p>'+esc(body)+'</p></section>';
const dialog=document.querySelector('#modal .dialog');
const modalEl=document.querySelector('#modal');
const detailImg=document.querySelector('#detailImg');
const detailText=document.querySelector('#detailText');
const closeBtn=document.querySelector('#close');
const grid=document.querySelector('#grid');
const cardName=c=>c.roman+' · '+c.zh;
if(!dialog||!detailImg||!detailText||!grid)return;

// Keep cards as paintings first; metadata is visually secondary.
[...grid.querySelectorAll('.card')].forEach((el,i)=>{
  const meta=document.createElement('p');
  meta.className='card-line';
  meta.textContent=depth[i].title;
  el.appendChild(meta);
  el.setAttribute('aria-label','查看 '+C[i].zh+' 的高清原画与完整故事');
  el.setAttribute('title','查看 '+C[i].zh+' 及完整档案');
});

// Original story, literary provenance and tarot interpretation are deliberately separated.
function openDeep(c){
  const d=depth[c.id];
  if(!d)return;
  detailImg.src=c.img;
  detailImg.alt=c.zh+' · 864×1536 高清原画';
  detailImg.title='点击打开高清原画';
  const padded=String(c.id).padStart(2,'0');
  const sourceNames=(c.works||[]).map(esc).join(' · ');
  const up=(c.up||[]).map(esc).join(' · ');
  const rev=(c.rev||[]).map(esc).join(' · ');
  detailText.innerHTML=
    '<div class="eyebrow">THE FORBIDDEN ARCANA / '+padded+' OF 21</div>'+
    '<h2>'+esc(c.zh)+'</h2>'+
    '<div class="detail-subtitle">'+esc(d.title)+' · '+esc(c.en)+'</div>'+
    '<p class="entity">神话意象 / '+esc(c.entity)+'</p>'+
    '<a class="hd-open" target="_blank" rel="noopener noreferrer" href="'+esc(c.img)+'">单独查看 864 × 1536 高清原画 ↗</a>'+
    chapter('01 / ORIGINAL NARRATIVE','牌面的故事',d.scene,'chapter-story')+
    chapter('02 / VISUAL LANGUAGE','这幅画在讲什么',d.visual)+
    '<section class="chapter"><div class="chapter-index">03 / UPRIGHT</div><h3>正位 · 启示</h3><div class="keywords">'+up+'</div><div class="interpretation"><p>'+esc(d.up)+'</p></div></section>'+
    '<section class="chapter"><div class="chapter-index">04 / REVERSED</div><h3>逆位 · 阴影</h3><div class="keywords">'+rev+'</div><div class="interpretation shadow"><p>'+esc(d.rev)+'</p></div></section>'+
    chapter('05 / MYTHOS & SOURCES','原著中的线索',d.canon)+
    '<section class="chapter"><div class="chapter-index">06 / SELF-REFLECTION</div><h3>留给你的问题</h3><div class="callout">'+esc(d.q)+'</div></section>'+
    '<section class="chapter"><div class="chapter-index">SOURCE NOTE</div><h3>文学出处与创作边界</h3><p class="source">相关作品：'+sourceNames+'。本牌组基于洛夫克拉夫特神话进行独立视觉叙事；「牌面的故事」属于原创演绎，「原著中的线索」描述文学背景，不能把卡面细节直接当作小说原文。占卜解读用于自我反思，而非确定预言。</p></section>'+
    '<div class="detail-nav"><button id="prevArcana" type="button">← 上一张</button><button id="nextArcana" type="button">下一张 →</button></div>';
  detailText.querySelector('#prevArcana').onclick=()=>openDeep(C[(c.id+21)%22]);
  detailText.querySelector('#nextArcana').onclick=()=>openDeep(C[(c.id+1)%22]);
  modalEl.classList.add('open');
  document.body.style.overflow='hidden';
  detailText.scrollTop=0;
  dialog.scrollTop=0;
  closeBtn.focus({preventScroll:true});
}
show=openDeep;
detailImg.addEventListener('click',()=>{if(modalEl.classList.contains('open'))window.open(detailImg.src,'_blank','noopener,noreferrer');});
detailImg.style.cursor='zoom-in';

const resultEl=document.querySelector('#result');
const drawButton=document.querySelector('#drawBtn');
const input=document.querySelector('#question');
const seed32=text=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0};
function pick(n,daily){
  let pool=C.slice(),out=[];
  let random=Math.random;
  if(daily){
    let state=seed32(new Date().toLocaleDateString('en-CA'));
    random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
  }
  for(let i=0;i<n;i++){
    const j=Math.floor(random()*pool.length),c=pool.splice(j,1)[0];
    out.push({c,rev:random()<.3});
  }
  return out;
}
function deepDraw(){
  const mode=document.querySelector('#modes button.active');
  const howMany=Number(mode?.dataset.n||1),daily=!!mode?.dataset.daily;
  const chosen=pick(howMany,daily);
  const positions=howMany===3?['过去 · 事情的来路','现在 · 正在面对的课题','未来 · 值得观察的方向']:['此刻的启示'];
  const prompt=input.value.trim();
  const promptHTML=prompt?'<p class="reading-question">你提出的问题：'+esc(prompt)+'</p>':'';
  resultEl.className='result spread-'+(howMany===3?'three':'one');
  resultEl.innerHTML=
    '<div class="eyebrow">THE VEIL HAS PARTED / '+(daily?'DAILY ARCANA':(howMany===3?'THREE-CARD SPREAD':'SINGLE ARCANA'))+'</div>'+
    '<div class="result-cards">'+chosen.map(({c,rev},i)=>{
      const name=esc(c.zh),sign=rev?'逆位':'正位';
      return '<article class="result-card" data-id="'+c.id+'" tabindex="0" role="button" aria-label="查看'+name+'完整档案">'+
        '<img loading="eager" src="'+esc(c.img)+'" alt="'+name+'" style="'+(rev?'transform:rotate(180deg)':'')+'">'+
        '<h3>'+name+'</h3><p>'+positions[i]+' · '+sign+'</p>'+
        '<button type="button" class="full-card-link">阅读完整故事与解读 ↗</button></article>';
    }).join('')+'</div>'+
    '<div class="reading">'+promptHTML+chosen.map(({c,rev},i)=>{
      const d=depth[c.id];
      const sign=rev?'逆位':'正位';
      const positionIntro=howMany===3?[
       '这张牌放在「过去」，提示你回望已经形成的模式，而不是把过去当作注定重复的命运。',
       '这张牌放在「现在」，提示你识别此刻真正能够影响的选择。',
       '这张牌放在「未来」，不代表必然发生的预言，而是提醒你观察继续沿现有方向发展可能出现的课题。'
      ][i]:'这张牌像一段凝固在画面里的故事，提供一个重新看待问题的角度。';
      return '<section class="reading-section">'+
        '<div class="reading-tag">POSITION '+String(i+1).padStart(2,'0')+' / '+sign+'</div>'+
        '<h3>'+esc(c.zh)+' · '+esc(d.title)+'</h3>'+
        '<p>'+positionIntro+'</p>'+
        '<p><strong>牌面叙事：</strong>'+esc(d.scene)+'</p>'+
        '<p><strong>'+sign+'解读：</strong>'+esc(rev?d.rev:d.up)+'</p>'+
        '<p class="reading-question"><strong>请继续追问：</strong>'+esc(d.q)+'</p>'+
        '</section>';
    }).join('')+
    '<p class="hint">塔罗是一种以图像和叙事为媒介的自我反思工具，不替代事实判断，也不保证任何未来结果。点击任一张牌阅读原著关联及完整图像解析。</p></div>';
  resultEl.querySelectorAll('.result-card').forEach(e=>{
    const open=()=>openDeep(C[Number(e.dataset.id)]);
    e.onclick=open;
    e.onkeydown=v=>{if(v.key==='Enter'||v.key===' '){v.preventDefault();open();}};
  });
}
drawButton.onclick=deepDraw;

// Avoid reopening an offscreen or closed card due to an outdated browser copy.
window.addEventListener('pageshow',()=>{
  if(!modalEl.classList.contains('open'))document.body.style.overflow='';
});
console.info('Forbidden Arcana V2 editorial loaded:',depth.length,'complete dossiers');
})();