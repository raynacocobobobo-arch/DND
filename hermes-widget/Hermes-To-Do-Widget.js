// Hermes To Do · iPhone Scriptable Widget v3.0 · 原版 Logo 哥特徽章
// 适配：Scriptable 小、中、大尺寸；优先使用中尺寸。
// 安全：不在源代码中保存令牌，只存于 iPhone Keychain。
// 先由服务器部署 GET /api/widget/v1/summary，再在 Scriptable 首次运行时输入令牌。

const API_URL = 'https://deepgpt2077.duckdns.org:8443/api/widget/v1/summary';
const APP_URL = 'https://deepgpt2077.duckdns.org:8443/';
const TOKEN_KEY = 'hermes.widget.v1.readonly.token';
const CACHE_KEY = 'hermes.widget.v1.last.valid.summary';
const REQUEST_TIMEOUT_SECONDS = 12;
const REFRESH_MINUTES = 30; // iOS 决定实际刷新时间，此设置仅是建议。

const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const validInt = v => Number.isSafeInteger(v) && v >= 0 && v <= 1000000;

function parseSummary(input) {
  if (!input || typeof input !== 'object' ||
      !validInt(input.incompleteCount) || !validInt(input.completedToday) ||
      !Array.isArray(input.upcoming)) throw new Error('服务器返回的数据格式不符合约定');
  const upcoming = input.upcoming.slice(0, 3).map(t => ({
    title: String(t && t.title || '').trim().slice(0, 80) || '未命名任务',
    priority: t && ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
    dueAt: t && typeof t.dueAt === 'string' ? t.dueAt : null
  }));
  return {
    incompleteCount: input.incompleteCount,
    completedToday: input.completedToday,
    upcoming,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : null
  };
}

function readCache() {
  try {
    if (!Keychain.contains(CACHE_KEY)) return null;
    const obj = JSON.parse(Keychain.get(CACHE_KEY));
    if (!obj || !Number.isFinite(obj.receivedAt)) return null;
    return {receivedAt: obj.receivedAt, data: parseSummary(obj.data)};
  } catch (_) { return null; }
}
function clearCache() {
  try { if (Keychain.contains(CACHE_KEY)) Keychain.remove(CACHE_KEY); } catch (_) {}
}

async function askForToken() {
  const a = new Alert();
  a.title = '连接 Hermes To Do';
  a.message = '请粘贴腾讯云 Agent 为小组件生成的只读令牌。令牌仅保存在本机 Keychain，不会写入脚本。';
  a.addSecureTextField('只读访问令牌', '');
  a.addAction('保存并连接');
  a.addCancelAction('取消');
  if (await a.presentAlert() !== 0) return false;
  const token = String(a.textFieldValue(0) || '').trim();
  if (token.length < 32 || token.length > 512 || /\s/.test(token)) {
    const warn = new Alert();
    warn.title = '令牌格式不正确';
    warn.message = '请确认复制的是只读小组件访问令牌，不是账户密码。';
    warn.addAction('知道了');
    await warn.presentAlert();
    return false;
  }
  Keychain.set(TOKEN_KEY, token);
  clearCache();
  return true;
}

async function handleConfiguration() {
  if (config.runsInWidget) return;
  if (!Keychain.contains(TOKEN_KEY)) {
    await askForToken();
    return;
  }
  const a = new Alert();
  a.title = 'Hermes 小组件';
  a.message = '选择预览，或重新配置只读访问令牌。';
  a.addAction('预览组件');
  a.addAction('更换访问令牌');
  a.addDestructiveAction('解除配对');
  const choice = await a.presentAlert();
  if (choice === 1) await askForToken();
  if (choice === 2) {
    Keychain.remove(TOKEN_KEY);
    clearCache();
  }
}

async function fetchSummary(token) {
  const req = new Request(API_URL);
  req.method = 'GET';
  req.headers = {Authorization: 'Bearer ' + token, Accept: 'application/json'};
  req.timeoutInterval = REQUEST_TIMEOUT_SECONDS;
  // 保留 Scriptable 默认 TLS 安全检查，不允许不安全证书。
  const body = await req.loadString();
  const status = req.response && req.response.statusCode;
  if (status === 401 || status === 403) {
    clearCache();
    throw new Error('访问令牌失效，请打开 Scriptable 重新配对');
  }
  if (status !== 200) throw new Error('接口暂不可用（HTTP ' + String(status || '?') + '）');
  return parseSummary(JSON.parse(body));
}

/* V3 · HERMES ORIGINAL LOGO EDITION.
   The existing icon is the design authority: ivory hood, ornate gold halo,
   blackened armour, fleur-de-lis and dark crimson sealing wax.
   Draw the ENTIRE uncropped logo in its original square aspect ratio.
   All numbers, text and dates remain real data from the existing API. */
const ARTWORK_URL = 'https://raynacocobobobo-arch.github.io/DND/hermestodo/icons/icon-512.webp?v=3';
const ARTWORK_FALLBACK_URL = 'https://raynacocobobobo-arch.github.io/DND/hermestodo/icons/icon-192.png?v=20261110';
const ARTWORK_CACHE_FILE = 'hermes-widget-v3-official-logo.png';

const theme = {
  charcoal:'#0d1012', ink:'#0b151c', navy:'#101e28', bone:'#f0dfc3',
  brass:'#c8a46a', gold:'#e2c18a', muted:'#b5a38b', seal:'#8c3430',
  shadow:'#15110e', line:'#745a36'
};
const paint = (hex, alpha=1) => new Color(hex,alpha);

async function loadArt() {
  const fm=FileManager.local();
  const path=fm.joinPath(fm.documentsDirectory(),ARTWORK_CACHE_FILE);
  if (fm.fileExists(path)) {
    try { return fm.readImage(path); } catch (_) {}
  }
  for (const url of [ARTWORK_URL, ARTWORK_FALLBACK_URL]) {
    try {
      const req=new Request(url);
      req.timeoutInterval=9;
      const img=await req.loadImage();
      if(img){
        try { fm.writeImage(path,img); } catch (_) {}
        return img;
      }
    } catch (_) {}
  }
  return null;
}

function drawGothicFrame(ctx,W,H,small) {
  // Understated gilded frame rather than decorative stickers or gradients.
  ctx.setStrokeColor(paint(theme.line,.62));
  ctx.setLineWidth(3);
  ctx.strokeRect(new Rect(15,15,W-30,H-30));
  ctx.setStrokeColor(paint(theme.brass,.27));
  ctx.setLineWidth(2);
  ctx.strokeRect(new Rect(24,24,W-48,H-48));
  // Short copper marks from the original app's Gothic identity.
  ctx.setFillColor(paint(theme.seal,.84));
  ctx.fillRect(new Rect(16,H-27,small?125:183,8));
  ctx.setFillColor(paint(theme.gold,.72));
  ctx.fillRect(new Rect(40,58,small?93:150,3));
  ctx.fillRect(new Rect(40,H-62,small?105:155,2));
}

function heraldicBackground(small, art) {
  const W=small?620:1280,H=620;
  const ctx=new DrawContext();
  ctx.size=new Size(W,H);
  ctx.opaque=true;
  ctx.respectScreenScale=true;
  ctx.setFillColor(paint(theme.ink));
  ctx.fillRect(new Rect(0,0,W,H));
  // A broad, opaque text field protects the contrast; never darken the logo.
  ctx.setFillColor(paint(theme.charcoal));
  ctx.fillRect(new Rect(0,0,small?278:725,H));
  if (art) {
    // Fit the full native app icon. No off-canvas placement and no scrim over it.
    const rect=small?new Rect(296,121,290,290):new Rect(752,53,494,494);
    ctx.drawImageInRect(art,rect);
    ctx.setStrokeColor(paint(theme.brass,.55));
    ctx.setLineWidth(2);
    ctx.strokeRect(new Rect(rect.x-2,rect.y-2,rect.width+4,rect.height+4));
  } else {
    // Only a subdued empty frame when the icon cannot be loaded.
    const r=small?new Rect(297,122,290,290):new Rect(753,54,494,494);
    ctx.setStrokeColor(paint(theme.brass,.5));
    ctx.setLineWidth(3);
    ctx.strokeRect(r);
  }
  drawGothicFrame(ctx,W,H,small);
  return ctx.getImage();
}

function hermesFont(size,serif=false) {
  if(serif){
    try { return Font.custom('STSongti-SC-Bold',size); } catch(_) {}
  }
  return Font.boldSystemFont(size);
}
function addText(stack,value,size,hex,bold=false,serif=false) {
  const t=stack.addText(String(value));
  t.font=bold?hermesFont(size,serif):Font.mediumSystemFont(size);
  t.textColor=paint(hex);
  t.lineLimit=1;
  t.minimumScaleFactor=.58;
  return t;
}
function dateLabel(iso){
  if(!iso)return '';
  const d=new Date(iso);
  return Number.isFinite(d.getTime())?(d.getMonth()+1)+'/'+d.getDate():'';
}
function timeLabel(ts){
  if(!Number.isFinite(ts))return '尚未同步';
  const d=new Date(ts);
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function addHeader(w,small) {
  const h=w.addStack();h.layoutHorizontally();h.centerAlignContent();
  addText(h,'⚜',small?15:17,theme.gold,true);
  h.addSpacer(5);
  addText(h,'HERMES TO DO',small?9:11,theme.bone,true,true);
  h.addSpacer();
}
function addRule(w) {
  const row=w.addStack();row.size=new Size(0,1);
  row.backgroundColor=paint(theme.line,.58);
}
function renderSmall(w,data,snapshot,stale) {
  addHeader(w,true);
  w.addSpacer(19);
  const panel=w.addStack(); panel.layoutVertically();
  panel.size=new Size(79,0);
  addText(panel,'未完成',10,theme.gold,true);
  addText(panel,fmt(data.incompleteCount),47,theme.bone,true,true);
  w.addSpacer();
  addRule(w);
  w.addSpacer(7);
  const done=w.addStack();done.layoutHorizontally();done.centerAlignContent();
  addText(done,'今日完成',10,theme.muted);
  done.addSpacer(7);
  addText(done,fmt(data.completedToday),17,theme.gold,true,true);
  w.addSpacer(6);
  addText(w,stale?'离线数据':('更新 '+timeLabel(snapshot?.receivedAt)),9,theme.muted);
}
function renderMedium(w,data,snapshot,stale) {
  addHeader(w,false);
  w.addSpacer(12);
  // Strict column width keeps titles and numbers clear of the authentic logo.
  const info=w.addStack();info.layoutVertically();info.size=new Size(181,0);
  const main=info.addStack();main.layoutHorizontally();main.centerAlignContent();
  const left=main.addStack();left.layoutVertically();
  addText(left,'未完成',10,theme.gold,true);
  addText(left,fmt(data.incompleteCount),39,theme.bone,true,true);
  main.addSpacer(17);
  const right=main.addStack();right.layoutVertically();
  addText(right,'今日完成',10,theme.muted);
  addText(right,fmt(data.completedToday),26,theme.gold,true,true);
  info.addSpacer(7);
  addRule(info);
  info.addSpacer(8);
  if(data.upcoming.length){
    addText(info,'近期任务',10,theme.gold,true,true);
    info.addSpacer(4);
    for(const task of data.upcoming.slice(0,2)){
      const row=info.addStack();row.layoutHorizontally();row.centerAlignContent();
      addText(row,'◆',8,task.priority==='high'?theme.seal:theme.brass,true);
      row.addSpacer(5);
      addText(row,task.title,11,theme.bone).lineLimit=1;
      row.addSpacer();
      const d=dateLabel(task.dueAt);
      if(d)addText(row,d,9,theme.muted);
      info.addSpacer(3);
    }
  }else{
    addText(info,'暂无近期任务',11,theme.muted);
  }
  w.addSpacer();
  const foot=w.addStack();foot.layoutHorizontally();
  addText(foot,stale?'离线数据':'更新 '+timeLabel(snapshot?.receivedAt),9,theme.muted);
}
function renderPlaceholder(w,issue,small){
  addHeader(w,small);
  w.addSpacer(18);
  addText(w,'尚未连接',small?24:30,theme.bone,true,true);
  w.addSpacer(7);
  addText(w,'请在 Scriptable 中完成配对',10,theme.muted).lineLimit=2;
  w.addSpacer();
  addText(w,issue||'等待数据',9,theme.gold);
}
function renderWidget(snapshot,issue,art){
  const w=new ListWidget();
  const small=config.widgetFamily==='small';
  w.backgroundColor=paint(theme.ink);
  try{w.backgroundImage=heraldicBackground(small,art);}catch(_){}
  w.setPadding(small?15:16,small?17:20,small?15:14,small?17:20);
  w.url=APP_URL;
  w.refreshAfterDate=new Date(Date.now()+REFRESH_MINUTES*60*1000);
  if(!snapshot)renderPlaceholder(w,issue,small);
  else if(small)renderSmall(w,snapshot.data,snapshot,!!issue);
  else renderMedium(w,snapshot.data,snapshot,!!issue);
  return w;
}

async function main() {
  await handleConfiguration();
  let snapshot = null;
  let issue = '';
  const token = Keychain.contains(TOKEN_KEY) ? Keychain.get(TOKEN_KEY) : '';
  if (token) {
    try {
      const data = await fetchSummary(token);
      snapshot = {data, receivedAt: Date.now()};
      Keychain.set(CACHE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      issue = String(e && e.message || '网络不可用');
      const unauthorized = /令牌失效|\b401\b|\b403\b/.test(issue);
      snapshot = unauthorized ? null : readCache();
    }
  } else {
    issue = '未配对';
  }
  const art = await loadArt();
  const w = renderWidget(snapshot, issue, art);
  Script.setWidget(w);
  if (!config.runsInWidget) {
    if (config.widgetFamily === 'small') await w.presentSmall();
    else await w.presentMedium();
  }
  Script.complete();
}

await main();