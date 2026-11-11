(()=>{
  'use strict';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const msg=$('#status-toast');let toastTimer;
  function notify(s){if(!msg)return;msg.textContent=s;msg.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>msg.classList.remove('show'),2100)}
  const root=document.documentElement;
  let night=localStorage.getItem('ember-reader-mode')==='night';
  if(night)root.dataset.mode='night';
  let fscale=Math.min(1.22,Math.max(.88,Number(localStorage.getItem('ember-font-scale')||1)));
  root.style.setProperty('--font-scale',fscale.toFixed(2));
  $('#theme-button')?.addEventListener('click',()=>{night=!night;root.dataset.mode=night?'night':'';localStorage.setItem('ember-reader-mode',night?'night':'paper');notify(night?'切换至夜间阅读':'切换至羊皮纸阅读')});
  $('#font-button')?.addEventListener('click',()=>{fscale=fscale>=1.20?.90:Math.round((fscale+.08)*100)/100;root.style.setProperty('--font-scale',fscale.toFixed(2));localStorage.setItem('ember-font-scale',String(fscale));notify('正文比例 '+Math.round(fscale*100)+'%')});
  const modal=$('#search-backdrop'), field=$('#search-field'), results=$('#search-results');
  function showSearch(){modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>field?.focus(),40);renderSearch()}
  function hideSearch(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  $('#search-button')?.addEventListener('click',showSearch);
  $('#search-close')?.addEventListener('click',hideSearch);
  modal?.addEventListener('click',e=>{if(e.target===modal)hideSearch()});
  const esc=(str)=>String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  function renderSearch(){if(!results||!field)return;const q=field.value.trim().toLocaleLowerCase();results.replaceChildren();const all=window.EMBER_SEARCH||[];
    if(!q){results.innerHTML='<div class="search-empty">输入人物、战役、地点、年份，搜索 V3.7 完整原稿。<br>例如：伊瑟林、Σ-7、567.M34、深渊之数。</div>';return;}
    const match=[];for(const doc of all){const title=doc.title.toLocaleLowerCase(),body=doc.body.toLocaleLowerCase();let pos=body.indexOf(q),tpos=title.indexOf(q);if(pos!==-1||tpos!==-1){match.push({doc,score:(tpos!==-1?4:0)+(pos!==-1?1:0),pos});}}
    match.sort((a,b)=>b.score-a.score||a.doc.order-b.doc.order);if(!match.length){results.innerHTML='<div class="search-empty">没有找到相关档案。请尝试更短的关键词。</div>';return;}
    for(const item of match.slice(0,25)){const {doc,pos}=item;const begin=Math.max(0,pos-28),end=Math.min(doc.body.length,Math.max(pos+q.length+85,120));const sample=pos>=0?doc.body.slice(begin,end):doc.body.slice(0,120);
      const link=document.createElement('a');link.className='search-result';link.href=(location.pathname.includes('/chapters/')?'../':'')+doc.url;
      const tag=document.createElement('div');tag.className='r-tag';tag.textContent=doc.chapter;
      const title=document.createElement('div');title.className='r-title';title.textContent=doc.title;
      const excerpt=document.createElement('div');excerpt.className='r-excerpt';excerpt.textContent=(begin?'…':'')+sample+(end<doc.body.length?'…':'');
      link.append(tag,title,excerpt);results.append(link);
    }
    if(match.length>25){const info=document.createElement('p');info.className='search-empty';info.textContent='找到 '+match.length+' 项，仅显示前25项，请输入更精确的关键词。';results.append(info)}
  }
  field?.addEventListener('input',renderSearch);
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSearch()}
    if(e.key==='Escape'){hideSearch();closeMenu()}
  });
  const drawer=$('#mobile-drawer'),shade=$('#drawer-shade');
  function openMenu(){drawer?.classList.add('open');shade?.classList.add('open');$('#menu-button')?.setAttribute('aria-expanded','true')}
  function closeMenu(){drawer?.classList.remove('open');shade?.classList.remove('open');$('#menu-button')?.setAttribute('aria-expanded','false')}
  $('#menu-button')?.addEventListener('click',()=>drawer?.classList.contains('open')?closeMenu():openMenu());shade?.addEventListener('click',closeMenu);
  $$('#mobile-drawer a').forEach(a=>a.addEventListener('click',closeMenu));
  $('#print-button')?.addEventListener('click',()=>window.print());
  $('#copy-link')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);notify('已复制当前档案链接')}catch{notify('可从浏览器地址栏复制链接')}});
  const progress=$('#article-progress');
  if(progress){const update=()=>{const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;progress.style.width=(max>0?Math.max(0,Math.min(100,100*d.scrollTop/max)):0)+'%'};addEventListener('scroll',update,{passive:true});update();}
  const heads=$$('.codex-body h3[id],.codex-body h4[id],.codex-body h5[id]');
  if(heads.length){const chapter=$('main.reader-main')?.dataset.chapter||'';const obs=new IntersectionObserver(entries=>{
    const seen=entries.filter(v=>v.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(!seen.length)return;const id=seen[0].target.id;
    $$('.page-outline a,.rail-sub a').forEach(a=>a.classList.toggle('active',a.hash==='#'+id));
    try{localStorage.setItem('ember-last-read',JSON.stringify({page:location.pathname.split('/').pop(),chapter,anchor:id,time:Date.now()}))}catch{}
  },{rootMargin:'-115px 0px -72% 0px',threshold:0});heads.forEach(h=>obs.observe(h));}

  // Independent scroll position for each document, with an explicit continue action.
  const pageName=location.pathname.split('/').pop()||'index.html';
  const currentChapter=document.querySelector('.reader-main');
  const toTop=$('#back-to-top');
  let lastSaved=0;
  function updateReadingScroll(){
    toTop?.classList.toggle('show',window.scrollY>520);
    if(!currentChapter)return;
    const now=Date.now();if(now-lastSaved<650)return;lastSaved=now;
    try{localStorage.setItem('ember-scroll',JSON.stringify({page:pageName,y:Math.round(window.scrollY),time:now}));}catch{}
  }
  window.addEventListener('scroll',updateReadingScroll,{passive:true});updateReadingScroll();
  toTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  if(currentChapter && new URLSearchParams(location.search).has('resume')){
    try{const previous=JSON.parse(localStorage.getItem('ember-scroll')||'null');if(previous?.page===pageName && previous.y>0)window.requestAnimationFrame(()=>window.scrollTo(0,previous.y));}catch{}
  }
  // Close the mobile inline table of contents after choosing a chapter section.
  document.querySelectorAll('.chapter-quicknav a').forEach(a=>a.addEventListener('click',()=>a.closest('details')?.removeAttribute('open')));
  const continueLink=$('#continue-reading');if(continueLink){try{const v=JSON.parse(localStorage.getItem('ember-last-read')||'null');if(v?.page){continueLink.href='chapters/'+v.page+'?resume=1';continueLink.hidden=false;continueLink.textContent='继续上次阅读 · '+(v.chapter||'档案')}}catch{}}
})();
