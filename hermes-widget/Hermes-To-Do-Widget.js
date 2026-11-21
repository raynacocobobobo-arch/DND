// Hermes To Do · iPhone Scriptable Widget v1.0
// 适配：Scriptable 小、中、大尺寸；优先使用中尺寸。
// 安全：不在源代码中保存令牌，只存于 iPhone Keychain。
// 先由服务器部署 GET /api/widget/v1/summary，再在 Scriptable 首次运行时输入令牌。

const API_URL = 'https://deepgpt2077.duckdns.org:8443/api/widget/v1/summary';
const APP_URL = 'https://deepgpt2077.duckdns.org:8443/';
const TOKEN_KEY = 'hermes.widget.v1.readonly.token';
const CACHE_KEY = 'hermes.widget.v1.last.valid.summary';
const REQUEST_TIMEOUT_SECONDS = 12;
const REFRESH_MINUTES = 30; // iOS 决定实际刷新时间，此设置仅是建议。

const palette = {
  bg: '#201B18', surface: '#332921', border: '#594734',
  gold: '#EAC18A', ivory: '#FAE7C9', muted: '#BAA58B',
  red: '#D66F58', green: '#B4CBA0', track: '#66513B'
};
const color = hex => new Color(hex);
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

function addText(stack, value, size, hex, bold) {
  const t = stack.addText(String(value));
  t.font = bold ? Font.boldSystemFont(size) : Font.mediumSystemFont(size);
  t.textColor = color(hex);
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.72;
  return t;
}
function timeLabel(ts) {
  if (!Number.isFinite(ts)) return '尚未同步';
  const date = new Date(ts);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return '最近同步 ' + hours + ':' + minutes;
}
function dateLabel(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return mm + '/' + dd;
}
function addHeader(widget) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  addText(row, '✦', 14, palette.gold, true);
  row.addSpacer(6);
  addText(row, 'HERMES TO DO', 10, palette.gold, true);
  row.addSpacer();
  addText(row, '今日', 10, palette.muted, false);
}
function addStatistic(widget, data, isSmall) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.bottomAlignContent();
  const left = row.addStack(); left.layoutVertically();
  addText(left, fmt(data.incompleteCount), isSmall ? 39 : 37, palette.ivory, true);
  addText(left, '未完成任务', isSmall ? 10 : 11, palette.muted, false);
  row.addSpacer();
  const right = row.addStack(); right.layoutVertically();
  addText(right, fmt(data.completedToday), isSmall ? 28 : 32, palette.green, true);
  addText(right, '今日完成', isSmall ? 10 : 11, palette.muted, false);
}
function addTaskList(widget, upcoming, limit) {
  const divider = widget.addStack(); divider.size = new Size(0, 1);
  divider.backgroundColor = color(palette.border);
  widget.addSpacer(8);
  addText(widget, '近期截止', 11, palette.gold, true);
  widget.addSpacer(5);
  if (!upcoming.length) {
    addText(widget, '暂无有截止日期的未完成任务', 11, palette.muted, false);
    return;
  }
  for (const item of upcoming.slice(0, limit)) {
    const row = widget.addStack(); row.layoutHorizontally(); row.centerAlignContent();
    addText(row, '•', 14, item.priority === 'high' ? palette.red : palette.gold, true);
    row.addSpacer(5);
    const label = addText(row, item.title, 11, palette.ivory, false);
    label.lineLimit = 1;
    row.addSpacer(5);
    const date = dateLabel(item.dueAt);
    if (date) addText(row, date, 10, palette.muted, false);
    widget.addSpacer(4);
  }
}
function renderWidget(snapshot, stateText) {
  const w = new ListWidget();
  w.backgroundColor = color(palette.bg);
  w.setPadding(13, 15, 12, 15);
  w.url = APP_URL;
  w.refreshAfterDate = new Date(Date.now() + REFRESH_MINUTES * 60 * 1000);
  const small = config.widgetFamily === 'small';
  addHeader(w);
  w.addSpacer(small ? 8 : 10);
  if (!snapshot) {
    addText(w, '尚未连接', 22, palette.ivory, true);
    w.addSpacer(7);
    addText(w, '在 Scriptable 打开脚本，输入只读令牌', 11, palette.muted, false).lineLimit = 2;
    w.addSpacer();
    addText(w, stateText || '等待服务器配置', 9, palette.red, false).lineLimit = 2;
    return w;
  }
  addStatistic(w, snapshot.data, small);
  if (!small) {
    w.addSpacer(8);
    addTaskList(w, snapshot.data.upcoming, config.widgetFamily === 'large' ? 3 : 2);
  }
  w.addSpacer();
  const foot = w.addStack(); foot.layoutHorizontally();
  addText(foot, timeLabel(snapshot.receivedAt), 9, palette.muted, false);
  foot.addSpacer();
  if (stateText) addText(foot, '离线缓存', 9, palette.red, false);
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
  const w = renderWidget(snapshot, issue);
  Script.setWidget(w);
  if (!config.runsInWidget) {
    if (config.widgetFamily === 'small') await w.presentSmall();
    else await w.presentMedium();
  }
  Script.complete();
}

await main();