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
  await page.goto(HOST+'/index.html#home',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{for(const im of document.images)im.loading='eager'});
  await page.waitForTimeout(1000);
  const summary=await page.evaluate(()=>({
    categories:document.querySelectorAll('#view-home .menu-grid .category').length,
    deeds:document.querySelectorAll('#view-home .deed-card').length,
    campaigns:document.querySelectorAll('#campaign-grid .dossier-tile').length,
    portraits:document.querySelectorAll('#people-grid .person-dossier').length,
    organization:document.querySelectorAll('#view-organization .org-card').length,
    failed:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.getAttribute('src')),
  }));
  if([summary.categories,summary.deeds,summary.campaigns,summary.portraits,summary.organization].join(',')!=='5,4,11,9,5')
    fail(v.name+':count','counts '+JSON.stringify(summary));
  if(summary.failed.length)fail(v.name+':images','broken '+JSON.stringify(summary.failed));
  records.push({viewport:v.name,type:'content',...summary});
  for(const ch of chapters){
    let response=await page.goto(HOST+'/chapters/'+ch+'.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.evaluate(()=>{for(const im of document.images)im.loading='eager'});
    await page.waitForTimeout(60);
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
