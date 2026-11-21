// Hermes To Do · iPhone Scriptable Widget v2.0 · 鸢尾圣女美术版
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

/* V2 · HERMES VISUAL SYSTEM — ivory × antique gold × navy × burgundy.
   The heroine/iris artwork is the official Hermes To Do app icon, not a substitute illustration.
   Every label remains live Scriptable text, not hard-coded into the background art. */
const ARTWORK_URL = 'https://raynacocobobobo-arch.github.io/DND/hermestodo/icons/icon-192.png?v=20261110';
const ARTWORK_CACHE_FILE = 'hermes-widget-v2-icon-192.png';

const theme = {
  navy: '#101e28', deep: '#0a1118', gold: '#c8a46a', goldLight: '#ebca91',
  ivory: '#f3e3c9', muted: '#c6b398', burgundy: '#882e31', sage: '#b2c0a3'
};
const paint = (hex, alpha=1) => new Color(hex, alpha);

async function loadArt() {
  const fm = FileManager.local();
  const file = fm.joinPath(fm.documentsDirectory(), ARTWORK_CACHE_FILE);
  if (fm.fileExists(file)) {
    try { return fm.readImage(file); } catch (_) {}
  }
  try {
    const req = new Request(ARTWORK_URL);
    req.timeoutInterval = 7;
    const img = await req.loadImage();
    if (img) { try { fm.writeImage(file, img); } catch (_) {} }
    return img;
  } catch (_) { return null; }
}

function heraldicBackground(small, art) {
  const W = small ? 620 : 1280, H = 620;
  const ctx = new DrawContext();
  ctx.size = new Size(W, H);
  ctx.opaque = true;
  ctx.respectScreenScale = true;
  ctx.setFillColor(paint(theme.deep));
  ctx.fillRect(new Rect(0, 0, W, H));
  // Official illustration occupies the right side, like the website's illustrated hero.
  if (art) {
    const side = small ? 545 : 640;
    const left = small ? 155 : 800;
    const top = small ? 26 : -10;
    ctx.drawImageInRect(art, new Rect(left, top, side, side));
  }
  // Dark translucent scrim keeps dynamic text legible over the painting.
  for (let x = 0; x < W; x += 24) {
    const relative = x / W;
    const opacity = small ? Math.max(.10, .93 - relative * 1.00)
                          : Math.max(.09, .97 - relative * 1.10);
    ctx.setFillColor(paint(theme.deep, opacity));
    ctx.fillRect(new Rect(x, 0, 25, H));
  }
  ctx.setFillColor(paint(theme.navy, .24));
  ctx.fillRect(new Rect(0, H * .72, W, H * .28));
  // Museum-label / Gothic manuscript double hairlines.
  ctx.setStrokeColor(paint(theme.gold, .80));
  ctx.setLineWidth(3);
  ctx.strokeRect(new Rect(19, 19, W - 38, H - 38));
  ctx.setStrokeColor(paint(theme.goldLight, .23));
  ctx.setLineWidth(2);
  ctx.strokeRect(new Rect(28, 28, W - 56, H - 56));
  // Narrow red heraldic ribbon anchors the composition to the red-and-gold website art.
  ctx.setFillColor(paint(theme.burgundy, .95));
  ctx.fillRect(new Rect(0, 95, 13, H - 190));
  ctx.setFillColor(paint(theme.gold, .75));
  ctx.fillRect(new Rect(35, 68, small ? 74 : 112, 3));
  ctx.fillRect(new Rect(35, H - 72, small ? 92 : 128, 3));
  return ctx.getImage();
}

function fancyFont(size, latin=false) {
  try { return Font.custom(latin ? 'Georgia-Bold' : 'STSongti-SC-Bold', size); }
  catch (_) { return Font.boldSystemFont(size); }
}
function addText(stack, value, size, hex, bold=false, serif=false) {
  const t = stack.addText(String(value));
  t.font = serif ? fancyFont(size, /^[\x00-\x7F]+$/.test(String(value))) :
           bold ? Font.boldSystemFont(size) : Font.mediumSystemFont(size);
  t.textColor = paint(hex);
  t.lineLimit = 1;
  t.minimumScaleFactor = .64;
  return t;
}
function dateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? (d.getMonth()+1)+'/'+d.getDate() : '';
}
function timeLabel(ts) {
  if (!Number.isFinite(ts)) return '等待首次同步';
  const d = new Date(ts);
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' 同步';
}
function line(widget) {
  const sep = widget.addStack();
  sep.size = new Size(0, 1);
  sep.backgroundColor = paint(theme.gold,.48);
}
function addHeader(widget, isSmall) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  addText(row, '⚜', isSmall?15:18, theme.goldLight, true);
  row.addSpacer(isSmall?5:8);
  addText(row, 'HERMES', isSmall?11:13, theme.goldLight, true, true);
  row.addSpacer(4);
  addText(row, 'TO DO', isSmall?7:9, theme.muted, false);
  row.addSpacer();
  if (!isSmall) addText(row, '今日纪事', 11, theme.muted, true, true);
}
function addFooter(widget, snapshot, stale) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  addText(row, '✦', 9, theme.gold, true);
  row.addSpacer(5);
  addText(row, stale ? '离线数据' : timeLabel(snapshot?.receivedAt), 9, theme.muted);
  row.addSpacer();
  if (stale) addText(row, '未连接', 9, '#e8a994', false);
}
function renderSmall(widget, data, snapshot, stale) {
  addHeader(widget,true);
  widget.addSpacer(11);
  addText(widget, '未完成任务', 11, theme.goldLight, true);
  widget.addSpacer(0);
  addText(widget, fmt(data.incompleteCount), 50, theme.ivory, true, true);
  widget.addSpacer();
  line(widget);
  widget.addSpacer(6);
  const done = widget.addStack(); done.layoutHorizontally(); done.centerAlignContent();
  addText(done, '今日完成', 10, theme.muted, false);
  done.addSpacer(7);
  addText(done, fmt(data.completedToday), 15, theme.sage, true, true);
  widget.addSpacer(6);
  addFooter(widget,snapshot,stale);
}
function addTasks(widget, items) {
  widget.addSpacer(5);
  if (!items.length) {
    addText(widget, '暂无近期任务 · 从容安排今天', 10, theme.muted);
    return;
  }
  for (const task of items.slice(0,2)) {
    const row = widget.addStack(); row.layoutHorizontally(); row.centerAlignContent();
    addText(row, '◆', 8, task.priority==='high'?'#cf8b72':theme.gold, true);
    row.addSpacer(5);
    const label = addText(row, task.title, 10.5, theme.ivory);
    label.lineLimit = 1;
    row.addSpacer(5);
    const date = dateLabel(task.dueAt);
    if (date) addText(row,date,9,theme.muted);
    widget.addSpacer(3);
  }
}
function renderMedium(widget, data, snapshot, stale) {
  addHeader(widget,false);
  widget.addSpacer(8);
  const stats = widget.addStack(); stats.layoutHorizontally(); stats.centerAlignContent();
  const left = stats.addStack(); left.layoutVertically();
  addText(left,'未完成任务',10,theme.goldLight,true);
  addText(left,fmt(data.incompleteCount),41,theme.ivory,true,true);
  stats.addSpacer(18);
  const right = stats.addStack(); right.layoutVertically();
  addText(right,'今日完成',10,theme.muted);
  addText(right,fmt(data.completedToday),29,theme.sage,true,true);
  stats.addSpacer();
  widget.addSpacer(5);
  line(widget);
  addTasks(widget,data.upcoming);
  widget.addSpacer();
  addFooter(widget,snapshot,stale);
}
function renderPlaceholder(widget, issue, small) {
  addHeader(widget,small);
  widget.addSpacer(13);
  addText(widget,'尚未连接',small?26:31,theme.ivory,true,true);
  widget.addSpacer(4);
  addText(widget,'请打开 Scriptable 配对',11,theme.muted);
  widget.addSpacer();
  line(widget);
  widget.addSpacer(6);
  addText(widget,issue==='未配对'?'等待令牌':(issue||'检查网络与服务器'),9,theme.goldLight);
}
function renderWidget(snapshot, issue, art) {
  const w = new ListWidget();
  const small = config.widgetFamily==='small';
  w.backgroundColor = paint(theme.navy);
  try { w.backgroundImage = heraldicBackground(small,art); } catch (_) {}
  w.setPadding(small?16:17,small?18:22,small?16:14,small?18:22);
  w.url = APP_URL;
  w.refreshAfterDate = new Date(Date.now()+REFRESH_MINUTES*60*1000);
  if (!snapshot) renderPlaceholder(w,issue,small);
  else if (small) renderSmall(w,snapshot.data,snapshot,!!issue);
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