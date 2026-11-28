/* Browser regression suite for Severed Ember · run from repo root in GitHub Actions. */
const {chromium} = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const HOST='http://127.0.0.1:8765';
const OUT=path.join(__dirname,'output'); fs.mkdirSync(OUT,{recursive:true});
const views=['home','campaigns','people','organization','armory','places','chronicle','restricted','reader','rules'];
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
  const firstLoad=await page.evaluate(()=>({
    rulesPreloaded:!!document.getElementById('rules-start'),
    hasExternalCSS:['index-base.css','index-overrides.css','index-editorial-20261128.css'].every(file=>[...document.querySelectorAll('link[rel="stylesheet"][href]')].some(link=>new URL(link.href).pathname.endsWith('/'+file)&&!!link.sheet&&performance.getEntriesByName(link.href).some(e=>e.entryType==='resource'))),
    hasExternalJS:[...document.querySelectorAll('script[src]')].some(script=>/^index-app(?:-[a-z0-9-]+)?\.js$/i.test(new URL(script.src).pathname.split('/').pop())&&performance.getEntriesByName(script.src).some(e=>e.entryType==='resource')),
    htmlBytes:document.documentElement.outerHTML.length
  }));
  if(firstLoad.rulesPreloaded)fail(v.name+':lazy','rules should not be included in the homepage');
  if(!firstLoad.hasExternalCSS||!firstLoad.hasExternalJS)
    fail(v.name+':cache','external cacheable CSS or JS missing');
  if(firstLoad.htmlBytes>185000)fail(v.name+':payload','homepage HTML remains too large '+firstLoad.htmlBytes);
  records.push({viewport:v.name,type:'first-load',...firstLoad});
  const homeLogos=await page.evaluate(()=>{
    const selectors=['.topbar .brand .crest>img','.right-rail .fact-emblem>img'];
    return selectors.map(sel=>{
      const el=document.querySelector(sel);
      return el?{selector:sel,width:el.getBoundingClientRect().width,
        transform:getComputedStyle(el).transform}:null;
    });
  });
  const expectedHomeLogo=v.width<=800?27:36, expectedArchiveLogo=v.width<=800?30:40.5;
  if(!homeLogos[0]||Math.abs(homeLogos[0].width-expectedHomeLogo)>1)
    fail(v.name+':logo','header logo size '+JSON.stringify(homeLogos[0]));
  // The right rail is intentionally hidden on tablet and mobile layouts.
  if(homeLogos[1]?.width>0&&Math.abs(homeLogos[1].width-expectedArchiveLogo)>1)
    fail(v.name+':logo','archive logo size '+JSON.stringify(homeLogos[1]));
  for(const view of views){
    await page.goto(HOST+'/index.html#'+view,{waitUntil:'domcontentloaded',timeout:30000});
    if(view==='rules'){
      try{await page.locator('#rules-start').waitFor({state:'attached',timeout:15000})}
      catch(_){fail(v.name+':rules','lazy rules fragment failed to load')}
      const atlasCount=await page.locator('#atlas-grid .rules-atlas-card').count();
      if(atlasCount<45)fail(v.name+':rules','unit atlas not restored after lazy load '+atlasCount);
    }
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
    // The chapter directory must remain reachable after leaving the overview.
    if(view==='campaigns'){
      const nav=await page.evaluate(()=>{
        const rail=document.getElementById('drawer');
        const quick=document.getElementById('nav-quick');
        const rect=rail?.getBoundingClientRect();
        const quickRect=quick?.getBoundingClientRect();
        return {railVisible:!!rect&&rect.width>0&&rect.left<innerWidth&&rect.right>0,
          quickVisible:!!quick&&!quick.hidden&&!!quickRect&&quickRect.width>40,
          hasOverview:!!rail?.querySelector('a[href="#home"]')};
      });
      if(!nav.hasOverview)fail(v.name+':rail','overview return link missing');
      if(v.width>800&&!nav.railVisible)fail(v.name+':rail','desktop directory vanished '+JSON.stringify(nav));
      if(v.width<=800){
        if(!nav.quickVisible)fail(v.name+':rail','mobile persistent directory trigger missing '+JSON.stringify(nav));
        else{
          await page.click('#nav-quick');
          const opened=await page.evaluate(()=>document.querySelector('#drawer')?.classList.contains('open')&&document.querySelector('#nav-shade')?.hidden===false);
          if(!opened)fail(v.name+':rail','mobile chapter drawer failed to open');
          await page.evaluate(()=>document.querySelector('#nav-shade')?.click());
          const closed=await page.evaluate(()=>!document.querySelector('#drawer')?.classList.contains('open'));
          if(!closed)fail(v.name+':rail','mobile chapter drawer failed to close');
        }
      }
    }
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
  // Golden mosaic stays within the viewport, preserving the approved 9:16 portrait composition.
  await page.goto(HOST+'/index.html#codex-v01',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(180);
  const mural=await page.evaluate(()=>{
    const fig=document.querySelector('#view-overview figure.codex-golden-overview');
    const img=fig?.querySelector('img'),r=fig?.getBoundingClientRect();
    return {visible:!!fig&&getComputedStyle(fig).display!=='none',
      width:r?.width,left:r?.left,viewport:window.innerWidth,
      src:img?.getAttribute('src'),ratio:img?.getAttribute('width')/img?.getAttribute('height')};
  });
  if(!mural.visible||!mural.width||mural.width>mural.viewport+2||
     mural.left < -2 || mural.left+mural.width>mural.viewport+2||
     Math.abs(mural.ratio-9/16)>.015||!mural.src)
    fail(v.name+':overview','mosaic overflow or invalid 9:16 composition '+JSON.stringify(mural));
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
  if(summary.categories!==5||summary.panoramas.length!==9)
    fail(v.name+':count','current-layout counts '+JSON.stringify({
      categories:summary.categories,deeds:summary.deeds,panoramas:summary.panoramas.length,
    }));
  summary.panoramas.forEach((im,i)=>{
    if(!im.src||im.src!==im.link||!im.width||!im.height||Math.abs(im.width/im.height-3)>.015)
      fail(v.name+':panorama:'+String(i+1),'invalid 3:1 source/link '+JSON.stringify(im));
  });
  if(summary.failed.length)fail(v.name+':images','broken '+JSON.stringify(summary.failed));
  records.push({viewport:v.name,type:'content',...summary});
  // Verify the current approved artwork, not the superseded peripheral plate.
  await page.goto(HOST+'/index.html#codex-v07-h-4-9',{waitUntil:'domcontentloaded',timeout:30000});
  const v07Plate=await page.evaluate(()=>{
    const dw=document.getElementById('codex-v07-h-4-8')?.nextElementSibling;
    const gk=document.getElementById('codex-v07-h-4-9')?.nextElementSibling;
    const src=el=>el?.tagName==='FIGURE'?el.querySelector('img')?.getAttribute('src'):null;
    return {deathwatch:src(dw),greyKnights:src(gk),obsolete:!!document.querySelector('#codex-v07 img[src*="v07-unnamed-peripheral-record-20261116.webp"]')};
  });
  if(!v07Plate.deathwatch?.includes('deathwatch-boarding.webp')||!v07Plate.greyKnights?.includes('v07-agris-rift-20261116.webp')||v07Plate.obsolete)
    fail(v.name+':v07-placement','approved Deathwatch/Grey Knights artwork not aligned '+JSON.stringify(v07Plate));
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
      logoWidth:document.querySelector('.site-header .brand img')?.getBoundingClientRect().width,
      images:[...document.images].filter(im=>im.complete&&im.naturalWidth===0).map(im=>im.getAttribute('src'))}));
    if(ch==='07-other-histories'){
      const plate=await page.evaluate(()=>{
        const dw=document.getElementById('h-4-8')?.nextElementSibling;
        const gk=document.getElementById('h-4-9')?.nextElementSibling;
        const src=el=>el?.tagName==='FIGURE'?el.querySelector('img')?.getAttribute('src'):null;
        return {deathwatch:src(dw),greyKnights:src(gk),obsolete:!!document.querySelector('img[src*="v07-unnamed-peripheral-record-20261116.webp"]')};
      });
      if(!plate.deathwatch?.includes('deathwatch-boarding.webp')||!plate.greyKnights?.includes('v07-agris-rift-20261116.webp')||plate.obsolete)
        fail(v.name+':chapter-v07-placement','approved Deathwatch/Grey Knights artwork not aligned '+JSON.stringify(plate));
    }
    if(response.status()!==200)fail(v.name+':chapter:'+ch,'HTTP '+response.status());
    if(vres.doc>vres.win+2)fail(v.name+':chapter:'+ch,'horizontal overflow '+vres.doc+' > '+vres.win);
    if(vres.images.length)fail(v.name+':chapter:'+ch,'broken image '+vres.images.join(','));
    if(!vres.heading)fail(v.name+':chapter:'+ch,'missing heading');
    if(v.width<=900&&ch==='01-overview'){
      const quick=page.locator('#reader-nav-quick');
      if(!await quick.isVisible())fail(v.name+':chapter-menu','mobile reader directory trigger missing');
      else{
        await quick.click();
        const opened=await page.evaluate(()=>document.getElementById('mobile-drawer')?.classList.contains('open'));
        if(!opened)fail(v.name+':chapter-menu','mobile reader drawer failed to open');
        await page.evaluate(()=>document.getElementById('drawer-shade')?.click());
        const closed=await page.evaluate(()=>!document.getElementById('mobile-drawer')?.classList.contains('open'));
        if(!closed)fail(v.name+':chapter-menu','mobile reader drawer failed to close');
      }
    }
    const expectedChapterLogo=v.width<=800?24:34.5;
    if(!vres.logoWidth||Math.abs(vres.logoWidth-expectedChapterLogo)>1)
      fail(v.name+':chapter:'+ch,'header logo incorrect size '+vres.logoWidth);
    records.push({viewport:v.name,chapter:ch,...vres});
    if(ch==='05-campaigns'&&['desktop','iphone'].includes(v.name))
      await page.screenshot({path:path.join(OUT,v.name+'-chapter-05.png'),fullPage:false});
  }
  if(v.name==='desktop'){
    const samples=[
      ['/assets/portraits/approved-20261115/v09-04-severin-20261115.webp','人物志：塞维林'],
      ['/assets/portraits/approved-20261115/v09-03-reginald-industrial-halfphase-20261115.webp','人物志：雷金纳德'],
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
 // Verify a high-DPR phone requests the compressed mobile artwork, not desktop originals.
 const retina=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await retina.goto(HOST+'/index.html#home',{waitUntil:'domcontentloaded',timeout:30000});
 // This thumbnail is lazy; wait for the image request before inspecting currentSrc.
 await retina.evaluate(async()=>{
   const image=document.querySelector('#view-home .menu-grid img');
   if(image){image.loading='eager';await image.decode().catch(()=>undefined)}
 });
 const mobileChoice=await retina.evaluate(()=>{
   const images=[...document.querySelectorAll('#view-home .menu-grid img')];
   return {count:images.length,first:images[0]?.currentSrc,
     responsiveCount:document.querySelectorAll('img[srcset]').length};
 });
 // Rules art now lives in a fragment and should not count toward the first paint.
 if(mobileChoice.responsiveCount<85)
   fail('iphone-retina:srcset','missing responsive images '+JSON.stringify(mobileChoice));
 if(!mobileChoice.first?.includes('01-organization-mobile.webp'))
   fail('iphone-retina:selection','large image selected for menu thumbnail '+JSON.stringify(mobileChoice));
 records.push({viewport:'iphone-retina',type:'responsive',...mobileChoice});
 await retina.close();
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
