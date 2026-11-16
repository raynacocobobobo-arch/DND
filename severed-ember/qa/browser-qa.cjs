/* Browser regression suite for Severed Ember · run from repo root in GitHub Actions. */
const {chromium} = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const HOST='http://127.0.0.1:8765';
const OUT=path.join(__dirname,'output'); fs.mkdirSync(OUT,{recursive:true});
const views=['home','campaigns','people','organization','armory','places','chronicle','restricted','reader'];
const chapters=['01-overview','02-siofra','03-organization','04-arsenal','05-campaigns','06-secrets','07-other-histories','08-rites','09-characters','10-restricted'];
const cases=[
  {name:'desktop',width:1440,height:900,isMobile:false},
  {name:'tablet',width:768,height:1024,isMobile:false},
  {name:'iphone',width:390,height:844,isMobile:true},
  {name:'small',width:320,height:700,isMobile:true},
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const failures=[],records=[];
 const fail=(item,reason)=>failures.push({item,reason});
 const captured=new Set();
 for(const v of cases){
  const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,
    isMobile:v.isMobile,hasTouch:v.isMobile,locale:'zh-CN'});
  const errors=[],http404=[];
  page.on('pageerror',e=>errors.push('PAGE: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text())});
  page.on('response',r=>{if(r.status()>=400)http404.push(r.status()+' '+r.url())});
  let resp=await page.goto(HOST+'/index.html',{waitUntil:'networkidle',timeout:30000});
  if(resp.status()!==200)fail(v.name+':root','status '+resp.status());
  for(const view of views){
    await page.goto(HOST+'/index.html#'+view,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(120);
    // Load below-fold images before screenshots and broken-image assertions.
    await page.evaluate(async()=>{
      const images=[...document.querySelectorAll('.view.active img')];
      await Promise.all(images.map(im=>{
        im.loading='eager';
        if(im.complete)return Promise.resolve();
        return new Promise(resolve=>{
          im.addEventListener('load',resolve,{once:true});
          im.addEventListener('error',resolve,{once:true});
          setTimeout(resolve,9000);
        });
      }));
    });
    if(view==='home'){
      const deedImages=await page.evaluate(()=>[...document.querySelectorAll('#view-home .deed-card .deed-visual img')].map(im=>{
        const r=im.getBoundingClientRect();
        return {src:im.getAttribute('src'),width:r.width,height:r.height,naturalWidth:im.naturalWidth};
      }));
      deedImages.forEach((im,i)=>{
        if(im.width<90||im.height<80||!im.naturalWidth)
          fail(v.name+':deed:'+String(i+1),'invisible image '+JSON.stringify(im));
      });
    }
    const r=await page.evaluate(view=>{
      const el=document.querySelector('#view-'+view),active=document.querySelectorAll('.view.active');
      const html=document.documentElement;
      const badImages=[...document.querySelectorAll('.view.active img')].filter(im=>im.complete&&im.naturalWidth===0).map(im=>im.getAttribute('src'));
      return {
        active:!!el&&el.classList.contains('active')&&active.length===1,
        documentWidth:html.scrollWidth,windowWidth:window.innerWidth,
        badImages, visible:!!el&&getComputedStyle(el).display!=='none',
        height:html.scrollHeight,
      };
    },view);
    if(!r.active||!r.visible)fail(v.name+':'+view,'view inactive');
    if(r.documentWidth>r.windowWidth+2)fail(v.name+':'+view,'horizontal overflow '+r.documentWidth+' > '+r.windowWidth);
    if(r.badImages.length)fail(v.name+':'+view,'broken images '+JSON.stringify(r.badImages));
    const name=v.name+'-'+view;
    if(['home','campaigns','organization','people'].includes(view)&&
       ['desktop','iphone','small'].includes(v.name)&&!captured.has(name)){
      await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:view==='home'});
      captured.add(name);
    }
    records.push({viewport:v.name,view,...r});
  }
  // The golden mosaic in Volume I must span the viewport, rather than the text column.
  await page.goto(HOST+'/index.html#codex-v01',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(180);
  const mural=await page.evaluate(()=>{
    const fig=document.querySelector('#view-overview figure.codex-golden-overview');
    const img=fig?.querySelector('img'),r=fig?.getBoundingClientRect();
    return {visible:!!fig&&getComputedStyle(fig).display!=='none',
      width:r?.width,left:r?.left,viewport:window.innerWidth,
      src:img?.getAttribute('src'),ratio:img?.getAttribute('width')/img?.getAttribute('height')};
  });
  if(!mural.visible||!mural.width||Math.abs(mural.width-mural.viewport)>mural.viewport*.02||
     Math.abs(mural.left)>Math.max(24,mural.viewport*.02)||!mural.src)
    fail(v.name+':overview','mosaic not viewport-wide '+JSON.stringify(mural));
  records.push({viewport:v.name,type:'overview',...mural});
  await page.goto(HOST+'/index.html#home',{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{
    await Promise.all([...document.images].map(im=>{
      im.loading='eager';
      if(im.complete)return Promise.resolve();
      return new Promise(resolve=>{
        im.addEventListener('load',resolve,{once:true});
        im.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,9000);
      });
    }));
  });
  const summary=await page.evaluate(()=>({
    categories:document.querySelectorAll('#view-home .menu-grid .category').length,
    deeds:document.querySelectorAll('#view-home .deed-card').length,
    panoramas:[...document.querySelectorAll('#codex-v09 figure.v09-persona-panorama img')].map(im=>({
      src:im.getAttribute('src'),link:im.closest('a')?.getAttribute('href'),
      width:Number(im.getAttribute('width')),height:Number(im.getAttribute('height')),
    })),
    failed:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.getAttribute('src')),
  }));
  if(summary.categories!==5||summary.deeds!==4||summary.panoramas.length!==9)
    fail(v.name+':count','current-layout counts '+JSON.stringify({
      categories:summary.categories,deeds:summary.deeds,panoramas:summary.panoramas.length,
    }));
  summary.panoramas.forEach((im,i)=>{
    if(!im.src||im.src!==im.link||!im.width||!im.height||Math.abs(im.width/im.height-3)>.015)
      fail(v.name+':panorama:'+String(i+1),'invalid 3:1 source/link '+JSON.stringify(im));
  });
  if(summary.failed.length)fail(v.name+':images','broken '+JSON.stringify(summary.failed));
  records.push({viewport:v.name,type:'content',...summary});
  for(const ch of chapters){
    let response=await page.goto(HOST+'/chapters/'+ch+'.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.evaluate(async()=>{
    await Promise.all([...document.images].map(im=>{
      im.loading='eager';
      if(im.complete)return Promise.resolve();
      return new Promise(resolve=>{
        im.addEventListener('load',resolve,{once:true});
        im.addEventListener('error',resolve,{once:true});
        setTimeout(resolve,9000);
      });
    }));
  });
    const vres=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,
      win:window.innerWidth,heading:document.querySelector('h1')?.textContent,
      images:[...document.images].filter(im=>im.complete&&im.naturalWidth===0).map(im=>im.getAttribute('src'))}));
    if(response.status()!==200)fail(v.name+':chapter:'+ch,'HTTP '+response.status());
    if(vres.doc>vres.win+2)fail(v.name+':chapter:'+ch,'horizontal overflow '+vres.doc+' > '+vres.win);
    if(vres.images.length)fail(v.name+':chapter:'+ch,'broken image '+vres.images.join(','));
    if(!vres.heading)fail(v.name+':chapter:'+ch,'missing heading');
    records.push({viewport:v.name,chapter:ch,...vres});
    if(ch==='05-campaigns'&&['desktop','iphone'].includes(v.name))
      await page.screenshot({path:path.join(OUT,v.name+'-chapter-05.png'),fullPage:false});
  }
  if(v.name==='desktop'){
    const samples=[
      ['/assets/portraits/approved-20261115/v09-04-severin-20261115.webp','人物志：塞维林'],
      ['/assets/portraits/approved-20261115/v09-03-reginald-industrial-halfphase-20261115.png','人物志：雷金纳德'],
      ['/assets/campaigns/revised-20261116/v05-03.webp','第五卷：第二次三伪星之战'],
      ['/assets/campaigns/revised-20261116/v05-04.webp','第五卷：钢铁风暴'],
      ['/assets/campaigns/revised-20261116/v05-11.webp','第五卷：深渊之井'],
      ['/assets/campaigns/revised-20261116/v05-10.webp','第五卷：熵火熔铸']
    ];
    await page.setContent('<html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#101918;color:#e4d1ae;font:20px sans-serif"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+samples.map(([src,label])=>'<figure style="margin:0;border:1px solid #8e7756"><img src="'+HOST+src+'" style="display:block;width:100%;height:350px;object-fit:contain;background:#111"/><figcaption style="padding:12px">'+label+'</figcaption></figure>').join('')+'</div></body></html>');
    await page.waitForFunction(()=>[...document.images].every(x=>x.complete),{timeout:12000});
    await page.screenshot({path:path.join(OUT,'artwork-candidate-comparison.png'),fullPage:true});
  }
  for(const e of [...new Set(errors)])fail(v.name+':JS',e);
  for(const e of [...new Set(http404)])fail(v.name+':HTTP',e);
  await page.close();
 }
 await browser.close();
 const report={ok:failures.length===0,runAt:new Date().toISOString(),
   browser:'Chromium via Playwright (not physical iPhone Safari)',
   viewportCases:cases.map(v=>v.name+' '+v.width+'x'+v.height),
   failures,records,screenshots:[...captured]};
 fs.writeFileSync(path.join(OUT,'qa-report.json'),JSON.stringify(report,null,2));
 console.log('SEVERED_EMBER_BROWSER_QA',JSON.stringify({
   ok:report.ok,failures,viewsChecked:cases.length*views.length,
   chaptersChecked:cases.length*chapters.length,contentChecks:cases.length,
   screenshots:captured.size
 }));
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error('SEVERED_EMBER_BROWSER_QA_CRASH',e);process.exitCode=1});
