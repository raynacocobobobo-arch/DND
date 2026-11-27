"use strict";
function buildRelease(data, groups, index) {
  const cards=data.cards, ids=new Set(cards.map(c=>c.id)), rows=Object.values(groups).flat(), keys=new Set(), hashes=new Set(), paths=new Set(), published=[];
  if(ids.size!==cards.length)throw Error("动作卡编号重复");
  for(const r of rows){
    if(keys.has(r.source_key)||hashes.has(r.sha256))throw Error("图片编号或 SHA-256 重复："+r.source_key);
    keys.add(r.source_key);hashes.add(r.sha256);
    if(!/^[WR]\d{1,4}$|^U[a-f0-9]{24}$/.test(r.source_key)||!/^[a-f0-9]{64}$/.test(r.sha256))throw Error("原图编号或哈希无效");
    if(!["approved","excluded","pending"].includes(r.review_status)||!r.visual_description||!r.match_reason)throw Error("缺少审核依据："+r.source_key);
    if(r.review_status==="excluded"&&r.assigned_card_id!==null)throw Error("排除图仍有归属："+r.source_key);
    if(r.review_status!=="approved")continue;
    if(!ids.has(r.assigned_card_id)||!new RegExp("^assets/references/reviewed/"+r.source_key+"\\.(jpeg|png|webp|gif)$").test(r.path)||!/^[a-f0-9]{40}$/.test(r.git_blob||"")||paths.has(r.path))throw Error("已发布图片记录无效："+r.source_key);
    paths.add(r.path);
    published.push({source_key:r.source_key,sha256:r.sha256,file_size:r.file_size,assigned_card_id:r.assigned_card_id,visual_description:r.visual_description,match_reason:r.match_reason,match_type:r.match_type,path:r.path,git_blob:r.git_blob});
  }
  published.sort((a,b)=>a.source_key.localeCompare(b.source_key,undefined,{numeric:true}));
  for(const c of cards){const order=new Map((c.images||[]).map((p,i)=>[p,i]));const m=published.filter(r=>r.assigned_card_id===c.id).sort((a,b)=>(order.get(a.path)??Infinity)-(order.get(b.path)??Infinity));c.images=m.map(r=>r.path);c.image_notes=m.map(r=>({source:r.source_key,reason:r.match_reason}));c.reference_note=m.length?"已逐图审核的动作参考；影视或广告画面仅作为调度示范。":"";}
  const original=rows.filter(r=>/^[WR]\d+$/.test(r.source_key)), approved=original.filter(r=>r.review_status==="approved").length, excluded=original.filter(r=>r.review_status==="excluded").length,pending=original.filter(r=>r.review_status==="pending").length;
  index.files=Object.keys(groups).sort();index.counts={reviewed:original.length,approved,excluded,pending,unreviewed:1482-original.length,user_uploads:rows.length-original.length};data.reviewed_release={images:published.length,core_cards:cards.filter(c=>c.is_core).length,additional_cards:cards.filter(c=>!c.is_core).length};
  return published;
}
(function admin(){
  "use strict";
  const ROOT="wedding/shotlist/", SUPABASE="https://arnrlepjuqdmvbipswci.supabase.co", PUBLIC_KEY="sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt", SESSION_KEY="enwan-admin-session-v1",CATS=["环境与场布","晨间准备","单人肖像","新人双人互动","家庭与亲友","接亲与转场","婚礼仪式","宴会与庆祝"], LEVELS=["纪实优先","轻引导","条件选拍"];
  const $=id=>document.getElementById(id), node=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n}, button=(txt,fn)=>{const b=node("button",txt);b.type="button";b.onclick=fn;return b}, opt=(v,t)=>{const o=node("option",t);o.value=v;return o};
  let token="",head="",baseTree="",data=null,index=null,groups={},published=[],dirty=false,staged=new Map(),busy=false,selectedCard="",page=0,selectedImage="",draftNew=false,requestedCard=/^#card-(A\d+)$/.exec(location.hash)?.[1]||"",pendingDelete=null,lastRemoved=null;
  const rows=()=>Object.values(groups).flat();
  const uploadQueue=[],localPreviews=new Map();let uploading=false,uploadSeq=0;
  let libraryMode="live",liveVisible=[],trashPage=[],trashVisible=[],lastBatch=null;const liveSelected=new Map(),trashSelected=new Map();
  const status=t=>{$("status").textContent=t};
  function syncUndo(){$("quick-undo").hidden=(!lastRemoved&&!lastBatch)||!token||!data;$("quick-undo").disabled=busy;}
  const b64=bytes=>{let s="";for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s)};
  const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),c=>c.charCodeAt(0)));
  let session=null,deviceAccess="";const DEVICE_KEY="enwan-admin-device-v1";
  function rememberDevice(v){deviceAccess=/^[A-Za-z0-9_-]{43}$/.test(v||"")?v:"";token=deviceAccess?"device":session?.access_token||"";try{if(deviceAccess)localStorage.setItem(DEVICE_KEY,deviceAccess);else localStorage.removeItem(DEVICE_KEY)}catch{}}
  function restoreDevice(){try{rememberDevice(localStorage.getItem(DEVICE_KEY)||"")}catch{}}
  function clearAccess(){rememberDevice("");remember(null)}
  function remember(s){session=s;token=deviceAccess?"device":s?.access_token||"";try{if(s)localStorage.setItem(SESSION_KEY,JSON.stringify({access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)}));else localStorage.removeItem(SESSION_KEY)}catch{}}
  function restore(){try{const v=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");if(v?.access_token&&v?.refresh_token){session=v;token=v.access_token}}catch{}}
  async function authCall(path,body){const r=await fetch(SUPABASE+"/auth/v1/"+path,{method:"POST",headers:{apikey:PUBLIC_KEY,"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.msg||d.message||d.error_description||"登录失败，请核对账户");return d}
  async function refresh(){if(!session?.refresh_token)throw Error("请先登录管理员账户");try{remember(await authCall("token?grant_type=refresh_token",{refresh_token:session.refresh_token}))}catch(e){remember(null);$("auth").hidden=false;$("auth").open=true;throw Error("登录已失效，请重新登录")}}
  async function server(action,payload={},retried=false){if(!deviceAccess&&!session)throw Error("请使用专用管理链接或备用登录");if(!deviceAccess&&session.expires_at&&session.expires_at<Math.floor(Date.now()/1000)+60)await refresh();const headers={apikey:PUBLIC_KEY,"Content-Type":"application/json",...(deviceAccess?{"x-enwan-access":deviceAccess}:{Authorization:"Bearer "+session.access_token})};const r=await fetch(SUPABASE+"/functions/v1/enwan-admin",{method:"POST",headers,body:JSON.stringify({action,...payload})});const v=await r.json().catch(()=>({}));if(r.status===401&&!retried&&!deviceAccess){await refresh();return server(action,payload,true)}if(!r.ok)throw Error(v.error||"服务端请求失败："+r.status);return v}
  function applySnapshot(v){if(!/^[a-f0-9]{40}$/.test(v?.head||"")||!v.data?.cards||!v.index?.counts||!v.groups||!Array.isArray(v.published))throw Error("服务器未返回完整保存结果，请重新读取核对");head=v.head;baseTree=v.baseTree;data=v.data;index=v.index;groups=v.groups;published=v.published;for(const s of staged.values())URL.revokeObjectURL(s.url);staged.clear();dirty=false;selectedCard=data.cards.some(c=>c.id===selectedCard)?selectedCard:data.cards[0]?.id||"";$("editor").hidden=false;$("writebar").hidden=false;$("auth").hidden=true;$("connect-retry").hidden=true;render();updateTargetOptions();syncUndo()}
  async function load(){status("正在读取正式照片，可先点击要删除的照片…");applySnapshot(await server("load"));status("已连接 · 勾选照片即可批量操作。");focusRequested()}
  async function loginComplete(){await load();if(pendingDelete){const target=pendingDelete;pendingDelete=null;await deletePhoto(target)}}
  function locked(on){busy=on;$("publish").disabled=on||!dirty;$("reload").disabled=on;$("logout").disabled=on;$("login").disabled=on;$("email-link").disabled=on;$("connect-retry").disabled=on;$("editor").inert=on;$("visual").inert=on&&!!data&&!uploading;$("task-admin").inert=on;syncUndo();syncBulk()}
  async function run(fn){if(busy)return;locked(true);try{await fn()}catch(e){status((dirty?"尚未保存：":"")+(e.message||"操作失败"));if(dirty)$("publish").hidden=false}finally{locked(false)}}
  function cardOptions(select, includeBlank=false){let prev=select.value;select.replaceChildren();if(includeBlank)select.append(opt("","请选择动作卡"));for(const c of data.cards)select.append(opt(c.id,c.category+" · "+c.title+" ("+c.id+")"));if([...select.options].some(o=>o.value===prev))select.value=prev;}
  function mark(){dirty=true;published=buildRelease(data,groups,index);render();status("正在自动保存到 GitHub…");if(busy)return publishChanges();return run(publishChanges)}
  function render(){
    const c=index.counts;$("counts").textContent=`原稿已审 ${c.reviewed}/1482 · 已发布 ${published.length} · 原稿排除 ${c.excluded} · 待发布 ${c.pending} · 补充及新增 ${c.user_uploads||0} · 动作卡 ${data.cards.length}`;
    $("publish").hidden=!dirty;$("publish").disabled=busy||!dirty;$("dirty").textContent=dirty?"有未保存的修改 · 自动保存失败时可重试":"已与 GitHub 同步";cardOptions($("upload-card"),true);cardOptions($("card-select"));
    $("card-select").value=selectedCard;renderCard();renderImages();renderVisual();renderTasks();syncBulk()
  }
  function imageUrl(r){if(localPreviews.has(r.source_key))return localPreviews.get(r.source_key);if(staged.has(r.source_key))return staged.get(r.source_key).url;if(r.path&&new RegExp("^assets/references/reviewed/"+r.source_key+"\\.(jpeg|png|webp|gif)$").test(r.path))return new URL(r.path,location.href).href;return null}

  function selectionRecord(r,trash=false){return {source:r.source_key,card:(trash?r.last_card_id:r.assigned_card_id)||null,path:r.path}}
  function selectedMap(){return libraryMode==="trash"?trashSelected:liveSelected}
  function attachCheck(tile,record,map){
    const label=node("label",undefined,"photo-select"),input=node("input");input.type="checkbox";input.checked=map.has(record.source);input.setAttribute("aria-label","选择照片 "+record.source);label.append(input);tile.append(label);tile.classList.toggle("selected-photo",input.checked);
    input.onchange=()=>{if(!token||!data){input.checked=false;canEdit(record.card);return}if(busy||dirty){input.checked=map.has(record.source);return}if(input.checked)map.set(record.source,record);else map.delete(record.source);tile.classList.toggle("selected-photo",input.checked);syncBulk()};
  }
  function updateTargetOptions(){const s=$("bulk-target"),prev=s.value;s.replaceChildren(opt("",libraryMode==="trash"?"恢复到原动作卡":"选择目标动作卡"));if(data)for(const cat of CATS){const group=node("optgroup");group.label=cat;for(const c of data.cards.filter(c=>c.category===cat))group.append(opt(c.id,c.title));if(group.children.length)s.append(group)}if([...s.options].some(x=>x.value===prev))s.value=prev}
  function syncBulk(){
    const map=selectedMap(),n=map.size,trash=libraryMode==="trash",unavailable=busy||dirty||!data||!token;
    $("bulk-bar").hidden=!n;$("bulk-count").textContent="已选 "+n+" 张";$("bulk-move").hidden=trash;$("bulk-delete").hidden=trash;$("bulk-restore").hidden=!trash;$("bulk-purge").hidden=!trash;
    $("bulk-move").disabled=unavailable||!$("bulk-target").value;$("bulk-delete").disabled=unavailable;$("bulk-restore").disabled=unavailable;$("bulk-purge").disabled=unavailable;$("bulk-target").disabled=unavailable;$("bulk-clear").disabled=busy;
    $("select-live").disabled=unavailable||!liveVisible.length;$("select-trash-page").disabled=unavailable||!trashPage.length;$("select-trash-all").disabled=unavailable||!trashVisible.length;
  }
  function selectRecords(records,map){if(busy||dirty||!data)return;const all=records.every(r=>map.has(r.source));for(const r of records)if(all)map.delete(r.source);else map.set(r.source,r);if(map===liveSelected)renderVisual();else renderImages();syncBulk()}
  function switchLibrary(mode){if(mode==="trash"&&!data){canEdit();return}libraryMode=mode;$("tab-live").classList.toggle("active",mode==="live");$("tab-trash").classList.toggle("active",mode==="trash");$("tab-live").setAttribute("aria-pressed",String(mode==="live"));$("tab-trash").setAttribute("aria-pressed",String(mode==="trash"));$("visual").hidden=mode!=="live";$("task-admin").hidden=mode!=="live";$("trash-panel").hidden=mode!=="trash";$("bulk-target").value="";updateTargetOptions();if(mode==="trash")renderImages();else renderVisual();syncBulk();window.scrollTo(0,0)}
  async function executeBatch(operation,items,target=null,undo=false){
    if(!items.length)return;
    status("正在"+({delete:"删除",move:"移动",restore:"恢复"}[operation])+" "+items.length+" 张照片 · 一次保存…");
    const v=await server("batch_photos",{operation,items,target});
    if(!Array.isArray(v.results)||v.results.length!==items.length||!Array.isArray(v.published))throw Error("服务器未返回完整结果，请重新读取核对");
    const map=new Map(v.published.map(r=>[r.source_key,r]));
    for(const item of items){const r=map.get(item.source);if(operation==="delete"?!!r:(!r||r.assigned_card_id!==(target||item.card)))throw Error("操作结果未确认，请重新读取核对")}
    if(operation==="delete"){lastBatch=items.map(x=>({...x}));lastRemoved=null}
    else if(undo)lastBatch=null;
    for(const x of items){liveSelected.delete(x.source);trashSelected.delete(x.source)}
    applySnapshot(v);updateTargetOptions();$("actions").hidden=false;syncBulk();syncUndo();status("已"+({delete:"删除",move:"移动",restore:"恢复"}[operation])+" "+items.length+" 张 · 已保存 "+head.slice(0,8)+(operation==="delete"?" · 可撤销或在回收站恢复":""));
  }
  function requestBatch(operation){if(busy||dirty||!data)return;const items=[...selectedMap().values()],target=operation==="delete"?null:$("bulk-target").value||null;if(!items.length)return;if(operation==="move"&&!target)return;if(operation==="restore"&&!target&&items.some(x=>!data.cards.some(c=>c.id===x.card))){status("部分照片原动作卡不存在，请选择新的目标动作卡");$("bulk-target").focus();return}if(operation==="delete"&&!confirm("删除选中的 "+items.length+" 张照片？原图保留在回收站。"))return;run(()=>executeBatch(operation,items,target))}

  async function purgeSelected(items){
    status("正在彻底删除 "+items.length+" 张原图 · 一次保存…");
    const v=await server("purge_photos",{items});
    if(!Array.isArray(v.results)||v.results.length!==items.length||!v.groups||!Array.isArray(v.published))throw Error("删除结果未确认，请重新读取核对");
    const ledger=new Map(Object.values(v.groups).flat().map(r=>[r.source_key,r])),pub=new Set(v.published.map(r=>r.source_key)),ids=new Set(items.map(x=>x.source));
    for(const item of items){const r=ledger.get(item.source);if(!r?.purged_at||r.path||r.git_blob||pub.has(item.source))throw Error("原图删除结果未确认："+item.source)}
    for(const x of items){liveSelected.delete(x.source);trashSelected.delete(x.source);const url=localPreviews.get(x.source);if(url)URL.revokeObjectURL(url);localPreviews.delete(x.source)}
    if(lastBatch){lastBatch=lastBatch.filter(x=>!ids.has(x.source));if(!lastBatch.length)lastBatch=null}if(lastRemoved&&ids.has(lastRemoved.source))lastRemoved=null;
    applySnapshot(v);updateTargetOptions();$("actions").hidden=false;syncBulk();syncUndo();status("已彻底删除 "+items.length+" 张原图 · 已保存 "+head.slice(0,8)+" · 无法从后台恢复");
    try{if("caches" in window){const paths=new Set(items.map(x=>new URL(x.path,location.href).pathname));for(const name of await caches.keys()){if(!name.startsWith("enwan-shotlist-"))continue;const c=await caches.open(name);for(const req of await c.keys())if(paths.has(new URL(req.url).pathname))await c.delete(req)}}}catch{}
  }
  function requestPurge(){if(libraryMode!=="trash"||busy||dirty||!data||!token)return;const items=[...trashSelected.values()];if(!items.length)return;if(!confirm("彻底删除选中的 "+items.length+" 张照片？\n将从 GitHub 正式分支删除原图文件，无法在后台撤销或恢复。\nGit 历史版本不在此次删除范围内。"))return;run(()=>purgeSelected(items))}


  async function readZipMedia(file,visit){
    const tail=new Uint8Array(await file.slice(Math.max(0,file.size-65557)).arrayBuffer()),d=new DataView(tail.buffer);
    let end=-1;for(let p=tail.length-22;p>=0;p--)if(d.getUint32(p,true)===0x06054b50&&p+22+d.getUint16(p+20,true)===tail.length){end=p;break}
    if(end<0)throw Error("不能识别 Word 文件："+file.name);
    const count=d.getUint16(end+10,true),size=d.getUint32(end+12,true),offset=d.getUint32(end+16,true);
    if(d.getUint16(end+4,true)||d.getUint16(end+6,true)||count===65535||offset+size>file.size||size>32*1024*1024)throw Error("不支持此压缩包结构："+file.name);
    const central=new Uint8Array(await file.slice(offset,offset+size).arrayBuffer()),v=new DataView(central.buffer),decoder=new TextDecoder();let pos=0;
    for(let n=0;n<count;n++){
      if(pos+46>central.length||v.getUint32(pos,true)!==0x02014b50)throw Error("Word 图片目录损坏");
      const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),compressed=v.getUint32(pos+20,true),plain=v.getUint32(pos+24,true),nameLen=v.getUint16(pos+28,true),extraLen=v.getUint16(pos+30,true),commentLen=v.getUint16(pos+32,true),local=v.getUint32(pos+42,true),name=decoder.decode(central.slice(pos+46,pos+46+nameLen));
      pos+=46+nameLen+extraLen+commentLen;
      if(!/^word\/media\/[^/]+\.(?:jpe?g|png|webp|gif)$/i.test(name)||!plain||plain>15*1024*1024)continue;
      if(flags&1||![0,8].includes(method)||local+30>file.size)throw Error("不支持的图片编码："+name);
      const header=new DataView(await file.slice(local,local+30).arrayBuffer());if(header.getUint32(0,true)!==0x04034b50)throw Error("图片数据损坏："+name);
      const begin=local+30+header.getUint16(26,true)+header.getUint16(28,true);if(begin+compressed>file.size)throw Error("图片数据越界");
      const raw=file.slice(begin,begin+compressed);
      const bytes=method===0?new Uint8Array(await raw.arrayBuffer()):new Uint8Array(await new Response(raw.stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
      if(bytes.length!==plain)throw Error("原图解压长度不符："+name);
      await visit(bytes,name);
    }
  }
  async function importOriginalDocs(files){
    if(!files.length)return;
    const eligible=new Map(rows().filter(r=>!r.purged_at&&r.review_status==="excluded"&&/^[WR]\d+$/.test(r.source_key)&&!(r.path&&r.git_blob)).map(r=>[r.sha256,r.source_key]));
    if(!eligible.size){status("原稿排除图已全部补录");return}
    let batch=[],size=0,saved=0,scanned=0,matched=0,initial=eligible.size;
    async function flush(){
      if(!batch.length)return;
      status("正在补录原稿 · 已保存 "+saved+" / "+initial+" 张；请保持页面打开");
      const result=await server("import_trash",{files:batch});
      if(!Array.isArray(result.results)||result.results.length!==batch.length)throw Error("补录结果未确认");
      const ledger=new Map(Object.values(result.groups||{}).flat().map(r=>[r.source_key,r]));
      for(const item of result.results){const r=ledger.get(item.source);if(item.status==="imported"||item.status==="already"){if(!r||r.purged_at||r.review_status!=="excluded"||!r.path||!r.git_blob)throw Error("补录结果校验失败："+item.source);if(item.status==="imported")saved++}else if(item.status!=="skipped")throw Error("未知补录结果")}
      applySnapshot(result);batch=[];size=0;
    }
    for(const file of files){
      status("正在读取 "+file.name+" · 已保存 "+saved+" 张");
      await readZipMedia(file,async(bytes)=>{
        scanned++;const sha=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join(""),source=eligible.get(sha);
        if(!source)return;eligible.delete(sha);matched++;
        if(batch.length>=32||size+bytes.length>12*1024*1024)await flush();
        batch.push({source,content:b64(bytes)});size+=bytes.length;
      });
      await flush();
    }
    status("原稿补录完成 · 扫描 "+scanned+" 张 · 匹配 "+matched+" 张 · 实际新增 "+saved+" 张 · 尚缺 "+rows().filter(r=>!r.purged_at&&r.review_status==="excluded"&&/^[WR]\d+$/.test(r.source_key)&&!(r.path&&r.git_blob)).length+" 张");
  }

  function renderImages(){
    const q=$("search").value.trim().toLowerCase(), filter=$("filter").value;const list=rows().filter(r=>!r.purged_at&&(filter==="all"||(filter==="removed"?r.review_status==="excluded":filter==="ready"?r.review_status==="excluded"&&r.path&&r.git_blob:filter==="missing"?r.review_status==="excluded"&&!(r.path&&r.git_blob):r.review_status===filter))&&(!q||[r.source_key,r.source_group,r.visual_description,r.match_reason,r.assigned_card_id,data.cards.find(c=>c.id===r.assigned_card_id)?.title].join(" ").toLowerCase().includes(q))).sort((a,b)=>a.source_key.localeCompare(b.source_key,undefined,{numeric:true}));
    const missing=rows().filter(r=>!r.purged_at&&r.review_status==="excluded"&&/^[WR]\d+$/.test(r.source_key)&&!(r.path&&r.git_blob)).length;$("trash-import-panel").hidden=!missing;$("trash-import-count").textContent="原图待补录 "+missing+" 张";$("trash-import").disabled=busy||dirty;const limit=20;page=Math.max(0,Math.min(page,Math.ceil(list.length/limit)-1));$("page").textContent=`${list.length} 条 · 第 ${page+1}/${Math.max(1,Math.ceil(list.length/limit))} 页`;$("prev").disabled=page===0;$("next").disabled=(page+1)*limit>=list.length;
    trashVisible=list.filter(r=>r.review_status==="excluded"&&r.path&&r.git_blob).map(r=>selectionRecord(r,true));trashPage=list.slice(page*limit,(page+1)*limit).filter(r=>r.review_status==="excluded"&&r.path&&r.git_blob).map(r=>selectionRecord(r,true));const g=$("images");g.replaceChildren();
    for(const r of list.slice(page*limit,(page+1)*limit)){
      const a=node("article",undefined,"item");const url=imageUrl(r);if(url){const link=node("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";const im=node("img");im.src=url;im.loading="lazy";im.alt=r.source_key+" "+r.visual_description;link.append(im);a.append(link)}else a.append(node("div",r.review_status==="excluded"?"原图待补录":"未发布原图","noimage"));
      const former=data.cards.find(c=>c.id===r.last_card_id);a.append(node("strong",r.source_key),node("small",former?"原位置："+former.title:r.last_card_id?"原动作卡已删除":"无原位置"));const details=node("details",undefined,"archive-meta");details.append(node("summary","审核记录"),node("p",r.visual_description),node("small",r.match_reason));a.append(details);if(r.review_status==="excluded"&&r.path&&r.git_blob)attachCheck(a,selectionRecord(r,true),trashSelected);
      g.append(a);
    }
    syncBulk();
  }
  function renderCard(){if(draftNew)return;
    const c=data.cards.find(x=>x.id===selectedCard);$("card-form").hidden=!c;if(!c)return;
    $("card-id").textContent=c.id+(c.is_core?" · 核心动作卡":" · 补充动作卡");
    $("ctitle").value=c.title;$("ccat").value=c.category;$("clevel").value=c.action_level||LEVELS[1];$("cwhen").value=c.applicable_when||"";$("cprompt").value=c.prompt||"";$("ccamera").value=c.camera||"";$("ccheck").value=c.delivery_check||"";
    $("card-images").textContent="已采用 "+c.images.length+" 张图片";
  }
  $("login").onclick=()=>run(async()=>{const email=$("admin-email").value.trim(),password=$("admin-password").value;$("admin-password").value="";if(!email||!password)throw Error("请填写管理员邮箱和密码");rememberDevice("");remember(await authCall("token?grant_type=password",{email,password}));try{await loginComplete()}catch(e){remember(null);throw e}});
  $("email-link").onclick=()=>run(async()=>{const email=$("admin-email").value.trim();if(!email)throw Error("请输入管理员邮箱");const redirect=location.origin+location.pathname;await authCall("otp?redirect_to="+encodeURIComponent(redirect),{email,create_user:false});status("如账户有效，登录链接已发送，请查收邮件并返回后台。")});
  $("reload").onclick=()=>{if(dirty&&!confirm("放弃未提交修改并重新读取 GitHub？"))return;lastRemoved=null;lastBatch=null;liveSelected.clear();trashSelected.clear();run(load)};
  $("logout").onclick=()=>{if(dirty&&!confirm("放弃未提交修改并退出？"))return;clearAccess();location.reload()};
  $("search").oninput=()=>{page=0;renderImages()};$("filter").onchange=()=>{page=0;renderImages()};$("prev").onclick=()=>{page--;renderImages()};$("next").onclick=()=>{page++;renderImages()};
  for(const x of CATS)$("ccat").append(opt(x,x));for(const x of LEVELS)$("clevel").append(opt(x,x));
  $("card-select").onchange=()=>{selectedCard=$("card-select").value;renderCard()};
  function openCard(id){
    if(!canEdit(id))return;draftNew=false;selectedCard=id;renderCard();$("delete-card").hidden=false;$("card-dialog").showModal();
  }
  function openNew(){
    if(!canEdit())return;draftNew=true;const chosen=$("visual-cat").value;
    $("card-form").hidden=false;$("card-id").textContent="新建动作卡";$("card-images").textContent="保存后可直接添加照片";$("ctitle").value="";$("ccat").value=chosen||CATS[0];$("clevel").value=LEVELS[2];for(const id of ["cwhen","cprompt","ccamera","ccheck"])$(id).value="";$("delete-card").hidden=true;$("card-dialog").showModal();$("ctitle").focus();
  }
  $("close-card").onclick=()=>{$("card-dialog").close();draftNew=false};
  $("card-dialog").addEventListener("close",()=>{draftNew=false});
  $("save-card").onclick=()=>{
    const title=$("ctitle").value.trim(),promptText=$("cprompt").value.trim(),camera=$("ccamera").value.trim();
    if(!title||!promptText||!camera){alert("名称、现场口令、摄影机位必填");return}
    let c=data.cards.find(x=>x.id===selectedCard);
    if(draftNew){const used=new Set([...data.cards.map(x=>x.id),...rows().map(r=>r.last_card_id)]);let i=34;while(used.has("A"+String(i).padStart(2,"0")))i++;c={id:"A"+String(i).padStart(2,"0"),is_core:false,images:[],image_notes:[]};data.cards.push(c);selectedCard=c.id}
    if(!c)return;Object.assign(c,{title,category:$("ccat").value,action_level:$("clevel").value,applicable_when:$("cwhen").value.trim(),prompt:promptText,camera,delivery_check:$("ccheck").value.trim()});draftNew=false;$("card-dialog").close();mark();requestedCard=c.id;focusRequested();
  };
  $("new-card").onclick=openNew;
  $("delete-card").onclick=()=>{const c=data.cards.find(x=>x.id===selectedCard);if(!c)return;if(busy||uploading||dirty){status("请先完成当前保存");return}const photos=rows().filter(r=>r.assigned_card_id===c.id);if(!confirm("删除「"+c.title+"」？"+(photos.length?"其中 "+photos.length+" 张照片将移入回收站，原图保留。":"")))return;for(const r of photos)exclude(r,"用户删除动作卡 "+c.title);for(const t of data.stages.flatMap(s=>s.items))t.reference_ids=[];data.cards=data.cards.filter(x=>x.id!==c.id);selectedCard=data.cards[0]?.id||"";$("card-dialog").close();mark()};
  async function stageImage(f,card,desc,reason){
    const exts={"image/jpeg":"jpeg","image/png":"png","image/webp":"webp","image/gif":"gif"};
    if(!exts[f.type]||f.size>15*1024*1024||!f.size)throw Error("仅支持不超过15MB的 JPG、PNG、WebP、GIF");
    if(!data.cards.some(c=>c.id===card))throw Error("动作卡不存在");
    const bitmap=await createImageBitmap(f),width=bitmap.width,height=bitmap.height;bitmap.close();
    const bytes=new Uint8Array(await f.arrayBuffer()),hex=buffer=>Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,"0")).join(""),hash=hex(await crypto.subtle.digest("SHA-256",bytes));
    if(rows().some(r=>r.sha256===hash))throw Error("相同原图已存在，请移动或恢复已有图片");
    const prefix=new TextEncoder().encode("blob "+bytes.length+"\0"),gitBytes=new Uint8Array(prefix.length+bytes.length);gitBytes.set(prefix);gitBytes.set(bytes,prefix.length);const expected=hex(await crypto.subtle.digest("SHA-1",gitBytes));
    const id="U"+hash.slice(0,24),path="assets/references/reviewed/"+id+"."+exts[f.type];
    const b=await server("upload",{content:b64(bytes)});if(b.sha!==expected)throw Error("GitHub 原图哈希校验失败");
    const r={source_key:id,source_refs:[],source_document:"后台新增",source_group:"人工选择",source_order:0,sha256:hash,mime_type:f.type,file_size:f.size,width,height,path,git_blob:b.sha,storage_path:new URL(path,location.href).href,visual_description:desc||("用户手动选择："+f.name),match_reason:reason||("用户手动添加至 "+data.cards.find(c=>c.id===card).title),match_type:"reference",assigned_card_id:card,review_status:"approved",review_notes:"后台人工审核 "+new Date().toISOString(),sort_order:0};
    (groups["reviews/uploads.json"]??=[]).push(r);staged.set(id,{path,sha:b.sha,url:URL.createObjectURL(f)});return r;
  }
  function canEdit(card){
    if(uploading){status("照片正在保存，可以继续添加照片或浏览，其他编辑请在保存结束后操作。");return false}if(token&&data)return true;requestedCard=card||requestedCard;$("auth").open=true;$("auth").scrollIntoView({behavior:"smooth",block:"start"});$("admin-email").focus();status("普通链接需要登录；使用专用管理链接可直接编辑。");return false;
  }
  function focusRequested(){if(!requestedCard)return;const id=requestedCard;requestedCard="";const c=document.getElementById("card-"+id);if(c)c.scrollIntoView({behavior:"smooth",block:"start"})}
  function exclude(r,why){r.last_card_id=r.assigned_card_id;r.assigned_card_id=null;r.review_status="excluded";r.review_notes=(r.review_notes||"")+"；原采用依据："+r.match_reason+"；用户移除 "+new Date().toISOString();r.match_reason=why;}
  function requestDelete(target){if(busy){if(!data){pendingDelete=target;status("正在读取照片，读取成功后将删除 "+target.source)}else status("正在保存，请稍后再操作");return}if(dirty){status("上一项修改尚未保存，请先重试保存或重新读取");return}if(!token||!data){pendingDelete=target;canEdit(target.card);status("登录管理员后继续删除 "+target.source);return}run(()=>deletePhoto(target))}
  async function deletePhoto(target){if(dirty)throw Error("上一项修改尚未保存");const r=rows().find(r=>r.source_key===target.source&&r.path===target.path&&r.assigned_card_id===target.card&&r.review_status==="approved");if(!r){status("这张照片已移除或归属变化，请重新读取确认");return}status("正在删除 "+target.source+" · 保存至正式仓库…");const v=await server("delete_photo",{source:target.source,card:target.card,path:target.path});if(v.published?.some(x=>x.source_key===target.source))throw Error("删除尚未生效，请重新读取核对");applySnapshot(v);lastRemoved={source:target.source,card:target.card,path:target.path};$("actions").hidden=false;status("已删除 "+target.source+" · "+head.slice(0,8)+" · 可撤销；公开网站部署后生效");syncUndo()}
  $("quick-undo").onclick=()=>run(async()=>{if(lastBatch){await executeBatch("restore",lastBatch,null,true);return}if(dirty)throw Error("请先处理尚未保存的修改");const u=lastRemoved;if(!u)return;status("正在恢复 "+u.source+"…");const v=await server("restore_photo",{source:u.source,card:u.card,path:u.path});if(!v.published?.some(x=>x.source_key===u.source&&x.assigned_card_id===u.card))throw Error("恢复尚未生效，请重新读取核对");applySnapshot(v);lastRemoved=null;status("已恢复 "+u.source+" · "+head.slice(0,8));syncUndo()});
  function pickReplacement(card,old){
    if(!canEdit(card))return;const inp=node("input");inp.type="file";inp.accept="image/jpeg,image/png,image/webp,image/gif";inp.multiple=!old;inp.onchange=()=>run(async()=>{
      const files=[...inp.files];if(!files.length)return;
      if(old){if(!confirm("用所选照片替换 "+old.source_key+"？旧图将移入可恢复档案。"))return;const added=await stageImage(files[0],card,"用户手动替换："+files[0].name,"用户手动替换 "+old.source_key);exclude(old,"用户手动替换为 "+added.source_key);await mark();return}
      let n=0;const errors=[];for(const f of files){try{await stageImage(f,card);n++}catch(e){errors.push(f.name+"："+e.message)}}if(n)await mark();status("已保存 "+n+" 张新照片"+(errors.length?"；未添加："+errors.join("；"):"。GitHub Pages 部署后生效。"));
    });inp.click();
  }

  async function prepareUpload(item){
    const f=item.file,exts={"image/jpeg":"jpeg","image/png":"png","image/webp":"webp","image/gif":"gif"};
    if(!f.size||f.size>15*1024*1024||!exts[f.type])throw Error("仅支持不超过15MB的 JPG、PNG、WebP、GIF");
    let width,height;
    try{if(typeof createImageBitmap!=="function")throw Error("fallback");const b=await createImageBitmap(f);width=b.width;height=b.height;b.close()}
    catch{const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error("无法读取图片"));im.src=item.url});width=im.naturalWidth;height=im.naturalHeight}
    return {name:f.name,width,height,content:b64(new Uint8Array(await f.arrayBuffer()))}
  }
  function discardUpload(item,keepUrl=false){const i=uploadQueue.indexOf(item);if(i>=0)uploadQueue.splice(i,1);if(!keepUrl)URL.revokeObjectURL(item.url)}
  function retryUpload(item){if(item.state!=="failed")return;item.state="queued";item.error="";renderVisual();void drainUploads()}
  function queuePhotos(card,files){
    for(const file of files)uploadQueue.push({id:++uploadSeq,card,file,url:URL.createObjectURL(file),state:"queued",error:""});
    renderVisual();status("已加入上传队列 · "+uploadQueue.filter(x=>x.state!=="failed").length+" 张");void drainUploads()
  }
  async function drainUploads(){
    if(uploading||busy||dirty||!uploadQueue.some(x=>x.state==="queued"))return;
    uploading=true;locked(true);
    let saved=0,duplicates=0,failed=0;
    try{
      while(uploadQueue.some(x=>x.state==="queued")){
        const first=uploadQueue.find(x=>x.state==="queued"),batch=[];let bytes=0;
        for(const item of uploadQueue){if(item.state!=="queued"||item.card!==first.card)continue;if(batch.length>=12||batch.length&&bytes+item.file.size>15*1024*1024)break;batch.push(item);bytes+=item.file.size}
        for(const item of batch)item.state="uploading";renderVisual();status("正在上传 "+batch.length+" 张 · 已保存 "+saved+" 张；可继续添加");
        const valid=[],payload=[];
        for(const item of batch){try{payload.push(await prepareUpload(item));valid.push(item)}catch(e){item.state="failed";item.error=e.message||"无法读取";failed++}}
        if(!valid.length){renderVisual();continue}
        try{
          const v=await server("add_photos",{card:first.card,files:payload});
          if(!Array.isArray(v.results)||v.results.length!==valid.length||!Array.isArray(v.published))throw Error("上传返回结果不完整，请重试核对");
          for(let i=0;i<valid.length;i++){const r=v.results[i],item=valid[i];if(r.status==="added"||r.status==="already"){const m=v.published.find(x=>x.source_key===r.source_key&&x.assigned_card_id===item.card);if(!m)throw Error("服务器未确认照片归属");const old=localPreviews.get(r.source_key);if(old)URL.revokeObjectURL(old);localPreviews.set(r.source_key,item.url);discardUpload(item,true);saved++}else{discardUpload(item);duplicates++}}
          applySnapshot(v);$("actions").hidden=false;
        }catch(e){for(const item of valid){if(uploadQueue.includes(item)){item.state="failed";item.error=e.message||"网络错误";failed++}}renderVisual()}
      }
    }finally{uploading=false;locked(false);renderVisual();status("本轮上传完成：已保存 "+saved+" 张"+(duplicates?" · 重复跳过 "+duplicates+" 张":"")+(failed?" · 失败 "+failed+" 张，可在照片上重试":"")+(saved?" · 公开网站部署后生效":""))}
  }
  function pickFiles(card,old){
    if(old)return pickReplacement(card,old);
    if(!token||!data){canEdit(card);return}if((busy&&!uploading)||dirty){status("请先处理当前修改，再添加照片");return}
    const inp=node("input");inp.type="file";inp.accept="image/jpeg,image/png,image/webp,image/gif";inp.multiple=true;inp.onchange=()=>{const files=[...inp.files];if(files.length)queuePhotos(card,files)};inp.click()
  }
  function renderVisual(){
    const view=data||window.ENWAN_DATA;if(!view){$("visual-summary").textContent="未能读取网站数据，请刷新。";return}
    const editable=!!(token&&data),cat=$("visual-cat").value,q=$("visual-search").value.trim().toLowerCase(),only=$("visual-filled").checked;
    const visible=view.cards.filter(c=>(!cat||c.category===cat)&&(!only||c.images.length||uploadQueue.some(x=>x.card===c.id))&&(!q||[c.id,c.title,c.category,...(c.image_notes||[]).map(n=>n.source)].join(" ").toLowerCase().includes(q)));
    $("visual-summary").textContent=(editable?"已登录 · 操作后自动保存":"预览模式 · 请使用专用管理链接")+" · "+view.cards.length+" 张动作卡 / "+view.cards.reduce((n,c)=>n+c.images.length,0)+" 张照片";
    const g=$("visual-cards");g.replaceChildren();liveVisible=[];let last="";
    for(const c of visible){
      if(c.category!==last){g.append(node("h3",c.category,"category-heading"));last=c.category}
      const card=node("article",undefined,"visual-card");card.id="card-"+c.id;
      const h=node("div",undefined,"visual-head"),label=node("div");label.append(node("small",c.id+" · "+c.images.length+" 张照片"),node("h3",c.title));const controls=node("div",undefined,"row");controls.append(button("编辑卡片",()=>openCard(c.id)),button("＋ 添加照片",()=>pickFiles(c.id)));if(c.images.length&&editable){const select=button("全选本组",()=>selectRecords(rows().filter(r=>r.assigned_card_id===c.id&&r.review_status==="approved").map(r=>selectionRecord(r)),liveSelected));select.className="group-select";controls.append(select)}h.append(label,controls);card.append(h);
      if(c.prompt)card.append(node("p",c.prompt,"card-prompt"));
      const photos=node("div",undefined,"photo-grid");
      for(const [i,path] of c.images.entries()){
        const record=editable?rows().find(r=>r.path===path&&r.assigned_card_id===c.id&&r.review_status==="approved"):null;
        const source=record?.source_key||c.image_notes?.[i]?.source||path.split("/").pop(),tile=node("figure",undefined,"photo-tile"),url=record?imageUrl(record):new URL(path,location.href).href;
        if(url){const a=node("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";const img=node("img");img.src=url;img.alt=c.title+" · "+source;img.loading="lazy";img.onerror=()=>{img.alt="照片加载失败："+source};a.append(img);tile.append(a)}
        const cap=node("figcaption",source);tile.append(cap);
        if(record){const item=selectionRecord(record);liveVisible.push(item);attachCheck(tile,item,liveSelected)}else if(!editable){const label=node("label",undefined,"photo-select"),check=node("input");check.type="checkbox";check.setAttribute("aria-label","选择照片 "+source);check.onchange=()=>{check.checked=false;canEdit(c.id)};label.append(check);tile.append(label)}
        const actions=node("div",undefined,"photo-actions");const replace=button("替换",()=>{if(canEdit(c.id)&&record)pickFiles(c.id,record)});replace.className="photo-replace";actions.append(replace);tile.append(actions);photos.append(tile);
      }
      for(const item of uploadQueue.filter(x=>x.card===c.id)){const tile=node("figure",undefined,"photo-tile pending-photo"),im=node("img");im.src=item.url;im.alt=item.file.name;tile.append(im,node("figcaption",item.file.name),node("div",item.state==="failed"?"上传失败："+item.error:item.state==="uploading"?"正在上传…":"等待上传","upload-state "+item.state));if(item.state==="failed"){tile.append(button("重试",()=>retryUpload(item)),button("移除",()=>{discardUpload(item);renderVisual()}))}photos.append(tile)}
      const add=button("＋ 添加照片",()=>pickFiles(c.id));add.className="photo-add";photos.append(add);card.append(photos);g.append(card);
    }
    if(!visible.length)g.append(node("p","没有匹配的动作卡"));syncBulk();
  }
  for(const cat of CATS)$("visual-cat").append(opt(cat,cat));
  $("visual-cat").onchange=renderVisual;$("visual-search").oninput=renderVisual;$("visual-filled").onchange=renderVisual;$("visual-new").onclick=openNew;
  $("add-image").onclick=()=>run(async()=>{const f=$("upload").files[0],card=$("upload-card").value;if(!f||!card)throw Error("请选择图片和动作卡");await stageImage(f,card,$("description").value.trim(),$("reason").value.trim());$("upload").value="";await mark()});
  async function publishChanges(){if(!dirty)return;for(const t of data.stages.flatMap(s=>s.items))t.reference_ids=[];validateTasks(data);if(data.cards.some(c=>!c.title?.trim()||!c.prompt?.trim()||!c.camera?.trim()||!CATS.includes(c.category)))throw Error("请填写完整的动作卡");const v=await server("save",{head,data,groups});head=v.head;baseTree=v.baseTree;for(const x of staged.values())URL.revokeObjectURL(x.url);staged.clear();dirty=false;render();status("已自动保存 · "+head.slice(0,8)+" · 网站部署后生效。");$("actions").hidden=false;syncUndo();}
  $("publish").onclick=()=>run(publishChanges);

  let taskDraft=false,taskSelected="";
  const phases=v=>v.stages.filter(s=>/^S\d+$/.test(s.id)), flatTasks=v=>v.stages.flatMap(s=>s.items.map(t=>({t,s}))), viewData=()=>data||window.ENWAN_DATA;
  function validateTasks(v){const all=flatTasks(v),ids=new Set(all.map(x=>x.t.id));if(ids.size!==all.length)throw Error("拍摄任务编号重复");for(const {t,s} of all){if(!t.title?.trim()||!["必拍","选拍"].includes(t.priority)||!["all","bride","groom"].includes(t.side))throw Error("无效拍摄任务："+t.id);if(!/^S\d+$/.test(s.id)){if(!phases(v).some(p=>p.id===t.phase_id)||t.parent_id&&!phases(v).some(p=>p.id===t.phase_id&&p.items.some(x=>x.id===t.parent_id)))throw Error("详细拍摄点归属无效："+t.id)}}}
  function parentOptions(v,phase,current){const sel=$("tparent");sel.replaceChildren(opt("","不指定主任务（阶段内独立详细点）"));for(const t of phases(v).find(s=>s.id===phase)?.items||[])sel.append(opt(t.id,t.title+" · "+t.id));sel.value=current||"";}
  function renderTasks(){const v=viewData();if(!v)return;const all=flatTasks(v),q=$("task-search").value.trim().toLowerCase(),sel=$("task-select");sel.replaceChildren();for(const {t,s} of all.filter(({t,s})=>!q||(t.id+" "+t.title+" "+s.title).toLowerCase().includes(q)))sel.append(opt(t.id,t.title+" · "+t.id));if(!taskDraft){if(![...sel.options].some(o=>o.value===taskSelected))taskSelected=sel.options[0]?.value||"";sel.value=taskSelected;}const item=all.find(x=>x.t.id===taskSelected),t=taskDraft?null:item?.t;$("task-form").hidden=!taskDraft&&!t;if(!taskDraft&&!t)return;const isDetail=!!item&&!taskDraft&&!/^S\d+$/.test(item.s.id);$("tphase").replaceChildren(...(isDetail?[item.s]:phases(v)).map(s=>opt(s.id,s.title)));$("tphase").value=t?(item.s.id):phases(v)[0]?.id;$("ttitle").value=t?.title||"";$("tpriority").value=t?.priority||"选拍";$("tside").value=t?.side||"all";parentOptions(v,$("tphase").value,t?.parent_id);$("tparent").disabled=true;$("tphase").disabled=isDetail;$("tside").disabled=isDetail;$("task-info").textContent=taskDraft?"新主任务（将生成新 ID）":t.id+" · "+(isDetail?"原版详细拍摄点":"主任务");for(const id of ["task-up","task-down","task-delete"])$(id).disabled=taskDraft}
  $("task-search").oninput=()=>{taskDraft=false;renderTasks()};$("task-select").onchange=()=>{taskDraft=false;taskSelected=$("task-select").value;renderTasks()};$("tphase").onchange=()=>parentOptions(viewData(),$("tphase").value,"");
  $("task-new").onclick=()=>{if(!canEdit())return;taskDraft=true;taskSelected="";renderTasks();$("ttitle").focus()};
  $("task-save").onclick=()=>{if(!canEdit())return;const title=$("ttitle").value.trim(),phase=$("tphase").value,stage=data.stages.find(s=>s.id===phase);if(!title||!stage)return alert("请填写任务名称和阶段");let item=flatTasks(data).find(x=>x.t.id===taskSelected),t=item?.t;if(taskDraft){t={id:"T-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),title,priority:"选拍",side:"all",reference_ids:[]};stage.items.push(t)}else if(!t)return;const isDetail=!taskDraft&&!/^S\d+$/.test(item.s.id);if(isDetail){/* preserve original grouping metadata */}else if(!taskDraft&&item.s.id!==phase){item.s.items=item.s.items.filter(x=>x!==t);stage.items.push(t);for(const {t:x} of flatTasks(data))if(x.parent_id===t.id)x.phase_id=phase}Object.assign(t,{title,priority:$("tpriority").value,side:$("tside").value,reference_ids:[]});taskDraft=false;taskSelected=t.id;$("task-search").value="";validateTasks(data);mark()};
  function moveTask(delta){if(!canEdit()||taskDraft)return;const item=flatTasks(data).find(x=>x.t.id===taskSelected);if(!item)return;const arr=item.s.items,i=arr.indexOf(item.t),n=i+delta;if(n<0||n>=arr.length)return;if(!/^S\d+$/.test(item.s.id)&&arr[n].id.replace(/-\d+$/,"")!==item.t.id.replace(/-\d+$/,""))return alert("原版顺序保持不变，仅可调整同组内要点");[arr[i],arr[n]]=[arr[n],arr[i]];mark()}
  $("task-up").onclick=()=>moveTask(-1);$("task-down").onclick=()=>moveTask(1);
  $("task-delete").onclick=()=>{if(!canEdit()||taskDraft)return;const item=flatTasks(data).find(x=>x.t.id===taskSelected);if(!item)return;if(flatTasks(data).some(x=>x.t.parent_id===item.t.id))return alert("先移动此任务的详细拍摄点");if(!confirm("删除任务："+item.t.title+"？本机项目中此任务的历史完成状态会失效。"))return;item.s.items=item.s.items.filter(x=>x!==item.t);taskSelected="";mark()};
  $("tab-live").onclick=()=>switchLibrary("live");$("tab-trash").onclick=()=>switchLibrary("trash");$("bulk-target").onchange=syncBulk;$("bulk-clear").onclick=()=>{selectedMap().clear();libraryMode==="trash"?renderImages():renderVisual()};$("select-live").onclick=()=>selectRecords(liveVisible,liveSelected);$("select-trash-page").onclick=()=>selectRecords(trashPage,trashSelected);$("select-trash-all").onclick=()=>selectRecords(trashVisible,trashSelected);$("bulk-delete").onclick=()=>requestBatch("delete");$("bulk-move").onclick=()=>requestBatch("move");$("bulk-restore").onclick=()=>requestBatch("restore");$("bulk-purge").onclick=requestPurge;$("trash-import").onclick=()=>{if(!busy&&!dirty&&data&&token)$("trash-docs").click()};$("trash-docs").onchange=()=>{const files=[...$("trash-docs").files];$("trash-docs").value="";if(files.length)run(()=>importOriginalDocs(files))};updateTargetOptions();renderTasks();renderVisual();if(window.ENWAN_DATA)status("已加载照片。勾选照片后批量操作；专用管理链接可直接编辑。");focusRequested();
  const authHash=new URLSearchParams(location.hash.slice(1));const access=authHash.get("access");if(access){rememberDevice(access);history.replaceState(null,"",location.pathname+location.search)}else if(authHash.get("access_token")&&authHash.get("refresh_token")){rememberDevice("");remember({access_token:authHash.get("access_token"),refresh_token:authHash.get("refresh_token"),expires_in:Number(authHash.get("expires_in")||3600)});history.replaceState(null,"",location.pathname+location.search)}else{restore();restoreDevice()}
  async function connect(){try{await loginComplete()}catch(e){if(!data){$("auth").hidden=false;$("connect-retry").hidden=false;if(!deviceAccess)$("auth").open=true;}throw e}}
  $("connect-retry").onclick=()=>run(connect);if(deviceAccess||session){$("auth").hidden=true;run(connect)}
  window.addEventListener("beforeunload",e=>{if(dirty||uploadQueue.length){e.preventDefault();e.returnValue=""}});
})();
