
'use strict';
const SEED_RECORDS = [];
const STORAGE_KEY = 'hermes_fitness_journal_v1';
const DEFAULT_SETTINGS={weight:65,age:36,weeklyGoal:1500};

const CATEGORIES=[['strength','力量'],['cardio','有氧'],['running','跑步'],['swimming','游泳'],['walking','步行'],['hold','静态']];
const DAY_NAMES=['周日','周一','周二','周三','周四','周五','周六'];
const WEEK_SHORT=['一','二','三','四','五','六','日'];
const PLANS={
  1:{place:'游泳馆',label:'蛙泳训练',items:[{type:'swimming',exercise:'蛙泳',distanceM:1000,laps:20,caption:'20圈 × 50米 · 约50分钟'}]},
  2:{place:'健身房',label:'有氧 + 器械力量',items:[{type:'cardio',exercise:'椭圆机',durationMin:20},{type:'strength',exercise:'推胸',sets:4,repsPerSet:20,loadKg:12},{type:'strength',exercise:'拉背',sets:4,repsPerSet:20,loadKg:25},{type:'strength',exercise:'引体向上',sets:4,repsPerSet:20,loadKg:65}]},
  3:{place:'居家',label:'居家力量训练',items:[{type:'strength',exercise:'杠铃弯举',sets:4,repsPerSet:20,loadKg:3},{type:'strength',exercise:'杠铃推举',sets:4,repsPerSet:20,loadKg:3},{type:'strength',exercise:'臀桥',sets:4,repsPerSet:20},{type:'hold',exercise:'平板支撑',sets:4,secondsPerSet:45},{type:'strength',exercise:'仰卧起坐',sets:4,repsPerSet:20}]},
  4:{place:'游泳馆',label:'蛙泳训练',items:[{type:'swimming',exercise:'蛙泳',distanceM:1000,laps:20,caption:'20圈 × 50米 · 约50分钟'}]},
  5:{place:'健身房',label:'有氧 + 器械力量',items:[{type:'cardio',exercise:'椭圆机',durationMin:20},{type:'strength',exercise:'推胸',sets:4,repsPerSet:20,loadKg:12},{type:'strength',exercise:'拉背',sets:4,repsPerSet:20,loadKg:25},{type:'strength',exercise:'引体向上',sets:4,repsPerSet:20,loadKg:65}]},
  6:{place:'居家',label:'居家力量训练',items:[{type:'strength',exercise:'杠铃弯举',sets:4,repsPerSet:20,loadKg:3},{type:'strength',exercise:'杠铃推举',sets:4,repsPerSet:20,loadKg:3},{type:'strength',exercise:'臀桥',sets:4,repsPerSet:20},{type:'hold',exercise:'平板支撑',sets:4,secondsPerSet:45},{type:'strength',exercise:'仰卧起坐',sets:4,repsPerSet:20}]},
  0:{place:'休息',label:'恢复日',items:[]}
};
const icons={followalong:'<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="m10 8 6 4-6 4z"/><path d="M7 2v2M17 2v2"/>',journal:'<path d="M12 6c-2.5-2-5-2-9-1v14c4-1 6.5-1 9 1 2.5-2 5-2 9-1V5c-4-1-6.5-1-9 1Z"/><path d="M12 6v14"/>',overview:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',training:'<path d="M6.5 6.5 17.5 17.5M5 9l4-4M15 19l4-4M3 7l4-4M17 21l4-4"/>',history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15l2 2 5-5"/>',steps:'<path d="M3 17h4l3-4 4 5 7-10M16 8h5v5"/>',settings:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',activity:'<path d="M3 12h4l3-6 4 12 3-6h4"/>',swimming:'<path d="M3 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M8 13l4-4 4 4M9 5h.01"/>',walking:'<circle cx="13" cy="4" r="2"/><path d="m7 21 3-7-2-3 3-3 4 3 2 4M15 21l-3-5"/>',running:'<circle cx="14" cy="4" r="2"/><path d="m12 8-3 4 3 2 3-3 3 1M11 8l-3 3-3 1m7 2-3 7m3-7 5 7"/>',hold:'<path d="M3 18h18M6 14h12M9 10h6M12 4v6"/>'};
function icon(name,size=18){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.activity}</svg>`}
const clone=o=>JSON.parse(JSON.stringify(o));
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'record-'+Date.now()+'-'+Math.random().toString(36).slice(2)}
function localDate(d=new Date()){let y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function dateFromISO(s){const a=String(s).split('-').map(Number);return new Date(a[0],a[1]-1,a[2],12)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function monday(d=new Date()){return addDays(d,-((d.getDay()+6)%7))}
function formatDate(s){const d=dateFromISO(s);return `${d.getMonth()+1}月${d.getDate()}日`}
function getWeekDates(){let m=monday(new Date());return Array.from({length:7},(_,i)=>localDate(addDays(m,i)))}
function initialState(){return {version:1,settings:{...DEFAULT_SETTINGS},records:SEED_RECORDS.map((r,i)=>({...r,id:'original-'+i,createdAt:r.date+'T09:00:00',original:true})),stepDiary:{},weightHistory:{},eatingWindows:{}}}

const RECOVERY_KEY='hermes_fitness_journal_recovery_v1';
let storageReadIssue='';
function parsedFitnessState(raw){
 if(typeof raw!=='string'||!raw)return null;
 try{const v=JSON.parse(raw);return v&&typeof v==='object'&&!Array.isArray(v)&&
  Array.isArray(v.records)&&v.settings&&typeof v.settings==='object'?v:null}catch(e){return null}
}
function archivePriorFitnessData(raw){
 if(!raw)return true;
 try{
  const old=parsedFitnessState(raw),existing=parsedFitnessState(localStorage.getItem(RECOVERY_KEY));
  if(!old){
   // Preserve malformed original bytes separately before an explicitly approved import.
   localStorage.setItem('hermes_fitness_unreadable_original_v1',raw);return true;
  }
  if(old.records.length>(existing?.records.length||0))
   localStorage.setItem(RECOVERY_KEY,raw);
  return true;
 }catch(e){return false}
}
function cleanWeightHistory(value){
 const result={};
 if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const [date,weight] of Object.entries(value)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||localDate(dateFromISO(date))!==date)continue;
  const n=Number(weight);if(Number.isFinite(n)&&n>0&&n<=500)result[date]=n;
 }
 return result;
}
function cleanEatingWindows(v){
 const out={};
 if(!v||typeof v!=='object'||Array.isArray(v))return out;
 for(const [day,w] of Object.entries(v)){
  const ms=Number(w?.startAt);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isSafeInteger(ms)||ms<Date.UTC(2000,0,1)||ms>Date.UTC(2100,0,1))continue;
  if(localDate(new Date(ms))===day)out[day]={startAt:ms};
 }
 return out;
}
function readState(){
 let raw;
 try{raw=localStorage.getItem(STORAGE_KEY)}
 catch(e){storageReadIssue='浏览器存储不可读取';return initialState()}
 if(raw===null)return initialState();
 const v=parsedFitnessState(raw);
 if(!v){storageReadIssue='检测到无法解析的原有记录，已禁止自动覆盖';return initialState()}
 return {version:1,records:v.records,settings:{...DEFAULT_SETTINGS,...v.settings},stepDiary:cleanStepDiary(v.stepDiary),weightHistory:cleanWeightHistory(v.weightHistory),eatingWindows:cleanEatingWindows(v.eatingWindows)};
}
let state=readState(),view='overview',historyFilter='week',historySelectedDate=null,draft=emptyDraft('strength');
/* Preserve old raw step inputs while retiring interval subtraction.
   Existing deduplicated walking records are transformed once, retaining their dates.
   Full raw localStorage is backed up before any conversion. */
const OLD_STEPS_BACKUP='fitness_before_step_dedup_removal_v3_6';
/* Walking is DAILY steps, not dedicated exercise time. Estimate net additional
   activity energy (not gross/resting-inclusive kcal): approx 0.5 kcal/kg/km,
   assuming ~0.7 m average step length, conservatively 0.025 kcal/step at 70 kg.
   This is an approximation; height, cadence, grade and terrain are unknown. */
function walkingActiveCalories(steps,weight){
 const n=Number(steps),w=Number(weight);
 if(!Number.isFinite(n)||n<0||!Number.isFinite(w)||w<=0)return 0;
 return Math.round(n*0.025*w/70);
}

function normalizeLegacyWalking(source){
 if(!source||!Array.isArray(source.records))return source;
 let changed=false;
 const weight=Number(source.settings?.weight)||65;
 const records=source.records.map(r=>{
  if(r?.type!=='walking'||r.stepMode!=='daily-net-v1')return r;
  const raw=stepInt(r.dailyTotalSteps);
  const steps=raw??(stepInt(r.steps)??0);
  const {stepMode,gymExcludedSteps,dailyTotalSteps,...clean}=r;
  changed=true;
  return {...clean,steps,calories:walkingActiveCalories(steps,Number(r.weightAtRecord)||weight),note:'步数 '+steps+' 步'};
 });
 return changed?{...source,records}:source;
}

/* V5.27 保留旧热量与旧日期，不自动修订历史记录。 */
function recalibratedFitnessState(source){return source;}
const CALIBRATION_BACKUP='fitness_before_elliptical_recalibration_v3_4';
const CALORIES_V39_BACKUP='fitness_before_calorie_sync_v3_9';
const CALORIES_V41_BACKUP='fitness_before_walking_active_calories_v4_1';
function persist(){
 if(storageReadIssue){toast('旧数据读取异常，已禁止自动覆盖');return false}
 try{
  const prior=localStorage.getItem(STORAGE_KEY),next=JSON.stringify(state);
  if(prior!==next&&prior!==null&&!archivePriorFitnessData(prior)){toast('旧记录备份失败，已停止写入');return false}
  localStorage.setItem(STORAGE_KEY,next);return true;
 }catch(e){toast('本地保存失败，原数据未更改');return false}
}
/* One-time correction of dates, based on the confirmed 18/19 Nov 2026 logs.
   V3.2 had removed wrongly-dated 18 Nov entries from the visible journal
   after the Nov 19 correction, but preserved them in CORRECT_BACKUP. */
const DATE_FIX_MARK='fitness_20261118_19_reassigned_v1';
const DATE_FIX_BACKUP='fitness_before_20261118_19_reassignment_v1';
const LEGACY_NOV19_BACKUP='fitness_backup_nov19_pre_correction_v1';
function legacyNov19CorrectionBackup(){
 try{
  const raw=localStorage.getItem(LEGACY_NOV19_BACKUP);
  if(!raw)return null;
  const value=JSON.parse(raw);
  return value?.date==='2026-11-19'&&Array.isArray(value.records)?value:null;
 }catch(e){return null}
}
function isConfirmedNov19Entry(r){
 return r&&r.type==='cardio'&&(r.exercise==='椭圆机'||r.presetKey==='elliptical')&&
  Number(r.duration_min)===20;
}
function applyConfirmedNovemberDates(){
 if(storageReadIssue)return false;
 const NOV18='2026-11-18',NOV19='2026-11-19';
 try{
  if(localStorage.getItem(DATE_FIX_MARK)==='done')return false;
  const archived=legacyNov19CorrectionBackup();
  const current19=state.records.filter(r=>r.date===NOV19);
  const current18=state.records.filter(r=>r.date===NOV18);
  const originalEntries=archived?.records||[];
  // If this is a fresh install with no data or archival evidence, do not invent data.
  if(!current19.length&&!current18.length&&!originalEntries.length)return false;
  const matching19=current19.filter(isConfirmedNov19Entry)
   .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const matchingBackup=originalEntries.filter(isConfirmedNov19Entry)
   .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const primary=matching19[0]||matchingBackup[0]||null;
  // The user confirmed the only 19 Nov workout: exactly one elliptical 20 min = 50 kcal.
  const confirmed=primary?{
    ...primary,date:NOV19,type:'cardio',exercise:'椭圆机',duration_min:20,
    calories:50,note:'椭圆机 20分钟'
  }:{
    id:uid(),date:NOV19,type:'cardio',exercise:'椭圆机',duration_min:20,
    calories:50,presetKey:'elliptical',weightAtRecord:state.settings.weight,
    createdAt:new Date().toISOString(),note:'椭圆机 20分钟'
  };
  const preserved=state.records.filter(r=>r.date!==NOV19);
  const seen=new Set(preserved.map(r=>String(r.id||'')).filter(Boolean));
  const candidateYesterday=[
   ...current19.filter(r=>r.id!==confirmed.id),
   ...originalEntries.filter(r=>r.id!==confirmed.id)
  ];
  const recovered=[];
  for(const r of candidateYesterday){
   if(!r||typeof r!=='object')continue;
   const id=typeof r.id==='string'&&r.id?r.id:uid();
   if(seen.has(id)||recovered.some(x=>x.id===id))continue;
   // Restore original exercise identity, duration, calories and timestamps.
   recovered.push({...r,id,date:NOV18});
   seen.add(id);
  }
  const diary={...(state.stepDiary||{})};
  const archivedDiary=archived?.stepDiary&&typeof archived.stepDiary==='object'?archived.stepDiary:null;
  const wrong19Diary=diary[NOV19]||archivedDiary;
  if(wrong19Diary){
   const old=diary[NOV18];
   if(!old)diary[NOV18]=wrong19Diary;
   else{
    const ids=new Set((old.sessions||[]).map(x=>x.id));
    const extraSessions=(wrong19Diary.sessions||[]).filter(x=>!ids.has(x.id));
    diary[NOV18]={...old,total:Math.max(Number(old.total)||0,Number(wrong19Diary.total)||0),
     sessions:[...(old.sessions||[]),...extraSessions]};
   }
  }
  delete diary[NOV19];
  // Keep every record outside 18/19 exactly as it was.
  const updated={...state,records:[...preserved,...recovered,confirmed],stepDiary:diary};
  // Backup must be durable BEFORE changing anything on the device.
  if(!localStorage.getItem(DATE_FIX_BACKUP)){
   const snapshot={state,legacyNov19Backup:archived,createdAt:new Date().toISOString()};
   localStorage.setItem(DATE_FIX_BACKUP,JSON.stringify(snapshot));
   const verified=JSON.parse(localStorage.getItem(DATE_FIX_BACKUP)||'null');
   if(!verified?.state?.records||!Array.isArray(verified.state.records))
    throw new Error('无法验证日期修复前备份');
  }
  const previous=state;
  state=updated;
  if(!persist()){state=previous;return false}
  localStorage.setItem(DATE_FIX_MARK,'done');
  return {restored:recovered.length,nov18:state.records.filter(r=>r.date===NOV18).length,nov19:1};
 }catch(e){
  try{console.warn('健身记录日期校正未完成，已保留原记录',e)}catch(_){}
  return false;
 }
}

function recoveryState(){
 try{return parsedFitnessState(localStorage.getItem(RECOVERY_KEY))}catch(e){return null}
}
function restoreFitnessSnapshot(){
 const saved=recoveryState();
 if(!saved||!saved.records.length){toast('当前浏览器没有可恢复的记录快照');return false}
 if(!confirm('找到 '+saved.records.length+' 条本地保护快照，确定用它替换当前 '+state.records.length+' 条训练记录吗？'))return false;
 const prior=state,wasBlocked=storageReadIssue;
 if(wasBlocked){
  try{if(!archivePriorFitnessData(localStorage.getItem(STORAGE_KEY))){toast('无法保护原始内容，已取消恢复');return false}}
  catch(e){toast('原始内容备份失败，已取消恢复');return false}
 }
 storageReadIssue='';
 state={version:1,records:saved.records,settings:{...DEFAULT_SETTINGS,...saved.settings},stepDiary:cleanStepDiary(saved.stepDiary),weightHistory:cleanWeightHistory(saved.weightHistory),eatingWindows:cleanEatingWindows(saved.eatingWindows)};
 if(!persist()){state=prior;storageReadIssue=wasBlocked;return false}
 view='history';historySelectedDate=null;render();toast('已恢复本地快照：'+saved.records.length+' 条记录');return true;
}

function emptyDraft(type='strength'){return {id:null,date:localDate(),type,exercise:type==='running'?'跑步':type==='cardio'?'椭圆机':type==='swimming'?'蛙泳':type==='hold'?'平板支撑':'拉背',sets:4,repsPerSet:20,durationMin:type==='cardio'||type==='running'?20:'',laps:20,distanceM:'',legacySwimming:false,loadKg:'',secondsPerSet:45,steps:0,distanceKm:0,legacyRunning:false,legacyRunningRate:0,restMin:0,speedKmh:6.25,gait:'walk'}}
function prettyType(type){return ({strength:'力量',cardio:'有氧',running:'跑步',swimming:'游泳',walking:'步行',hold:'静态保持'})[type]||'训练'}
function describePlanItem(item){if(item.caption)return item.caption;if(item.type==='strength')return `${item.sets} 组 × ${item.repsPerSet} 次${item.loadKg?` · ${item.loadKg} kg`:''}`;if(item.type==='swimming')return `${item.laps||0} 来回 · ${(Number(item.laps)||0)*50} 米`;if(item.type==='cardio')return `${item.durationMin} 分钟`;if(item.type==='hold')return `${item.sets} 组 × ${item.secondsPerSet} 秒`;return '自行填写'}
/* 2024成人MET模型:额外活动热量=(MET-1)*3.5*kg/200*分钟 */
const CALORIE_MODEL_VERSION='2024-met-net-v2';
function netEnergy(w,met,min){return Math.max(0,(met-1)*3.5*w/200*min)}
function runningMet(d){
 const speed=Number(d.speedKmh)||6.25;
 if(speed<3||speed>7.1)return null;
 if(d.gait==='jog')return speed<=6?3.3:6.5;
 return speed<5.6?3.8:speed<6.4?4.8:5.5;
}
function calcMeta(d){
 const w=Number(d.weightAtRecord)>0?Number(d.weightAtRecord):Number(state.settings.weight)||65;
 const ex=String(d.exercise||'').trim();
 const q=QUICK_ITEMS.find(q=>q.key===d.presetKey)||QUICK_ITEMS.find(q=>q.exercise===ex&&q.type===d.type);
 let met=null,min=null,basis='duration',confidence='reference',assumption='';
 if(d.type==='strength'){
  const reps=d.repsCount!==undefined?Number(d.repsCount):Number(d.sets)*Number(d.repsPerSet);
  if(!Number.isInteger(reps)||reps<=0||reps>6000)return null;
  min=reps*3/60;met=q?.key==='situps'||ex==='仰卧起坐'?2.8:(q?.key==='back'||/臀桥|俯卧撑/.test(ex)?3.0:3.5);
  basis='reps-3s';confidence='low';assumption='每次3秒假设，不含休息';
 }else if(d.type==='hold'){
  const sets=Number(d.sets),sec=Number(d.secondsPerSet);
  if(!(sets>0&&sec>0))return null;
   min=sets*sec/60;
   if(['靠墙静蹲','平板支撑','靠墙及平板'].includes(ex)){
    // User-defined calorie bookkeeping, not a physiological energy measurement.
    // Unified bookkeeping: 4 sets of 30 seconds = 8 kcal.
    // Previously saved records are never migrated or recomputed.
    const rate30=2;
    return {net:sets*sec/30*rate30,gross:null,met:null,min,
      basis:'custom-30s-set-v1',confidence:'user-defined',
      assumption:'每组30秒的用户指定记账标准，不是实测热量'};
   }
   met=2.8;
 }else if(d.type==='swimming'){
  const laps=Number(d.laps),total=Number(d.durationMin),rest=Number(d.restMin)||0;
  if(!d.legacySwimming&&(!Number.isInteger(laps)||laps<1||laps>300))return null;
  if(d.durationMin!==''&&d.durationMin!==null&&d.durationMin!==undefined&&total>0){
   if(rest<0||rest>=total)return null;
   min=total-rest;basis='swim-minutes';
  }else if(!d.legacySwimming){
   min=laps*2.5;basis='laps-pace-assumption';confidence='low';assumption='按50米2.5分钟推算';
  }else return null;
  met=5.3;
 }else if(d.type==='running'||d.type==='cardio'&&ex==='跑步'){
  if(d.legacyRunning){
   const km=Number(d.distanceKm),rate=Number(d.legacyRunningRate);
   return km>0&&rate>=0?{net:km*rate,gross:null,met:null,min:null,basis:'legacy-distance',confidence:'legacy',assumption:'原里程系数'}:null;
  }
  min=Number(d.durationMin);met=runningMet(d);basis='treadmill-speed';assumption='坡度0%，默认6.25km/h，按快走';
 }else if(d.type==='cardio'){
  min=Number(d.durationMin);met=ex==='椭圆机'?4:ex==='自行车'?3.5:4;
  basis='light-effort-assumption';confidence='low';assumption='轻量强度MET为工程假设';
 }else if(d.type==='walking'){
  const steps=Number(d.steps);if(!Number.isInteger(steps)||steps<=0)return null;
  const net=steps*0.0007*w*0.5;
  return {net,gross:null,met:null,min:null,basis:'step-distance-assumption',confidence:'low',assumption:'假设0.7米/步，额外0.5kcal/kg/km'};
 }else return null;
 if(!Number.isFinite(w)||w<=0||!Number.isFinite(min)||min<=0||min>2400||met===null)return null;
 return {net:netEnergy(w,met,min),gross:met*3.5*w/200*min,met,min,basis,confidence,assumption};
}
function calc(d){const m=calcMeta(d);return m?(m.basis==='custom-30s-set-v1'?Math.round(m.net*100)/100:Math.round(m.net)):null}
function newRecord(d){const meta=calcMeta(d),c=meta?(meta.basis==='custom-30s-set-v1'?Math.round(meta.net*100)/100:Math.round(meta.net)):null;if(c===null||!Number.isFinite(c))throw new Error('请填写有效训练数量');const date=d.date, type=d.type,ex=(d.exercise||'').trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(dateFromISO(date).getTime()))throw new Error('日期格式不正确');if(['strength','cardio','running','swimming','hold'].includes(type)&&!ex)throw new Error('请输入运动名称');const r={id:d.id||uid(),date,type,calories:c,createdAt:d.id?state.records.find(x=>x.id===d.id)?.createdAt||new Date().toISOString():new Date().toISOString(),weightAtRecord:Number(d.weightAtRecord)>0?Number(d.weightAtRecord):state.settings.weight,calorieVersion:CALORIE_MODEL_VERSION,calorieBasis:meta.basis,calorieConfidence:meta.confidence,calorieAssumption:meta.assumption,metUsed:meta.met,computedMinutes:meta.min,grossCalories:meta.gross===null?null:Math.round(meta.gross)};if(type==='strength'){
 if(d.repsCount!==undefined){
  const reps=Number(d.repsCount);
  if(!Number.isInteger(reps)||reps<=0||reps>6000)throw new Error('请输入有效次数');
  r.exercise=ex;r.reps=reps;r.note=`${ex} ${reps}次`;
 }else{
  const sets=Number(d.sets),p=Number(d.repsPerSet);
  if(!Number.isInteger(sets)||!Number.isInteger(p)||sets<1||p<1)throw new Error('组数和次数需要是正整数');
  r.exercise=ex;r.sets=sets;r.repsPerSet=p;r.reps=sets*p;
  if(d.loadKg!==''&&Number(d.loadKg)>=0)r.loadKg=Number(d.loadKg);
  r.note=`${ex} ${sets}组×${p}次`;
 }
}
else if(type==='cardio'){r.exercise=ex;r.duration_min=Number(d.durationMin);r.note=`${ex} ${r.duration_min}分钟`}
else if(type==='running'){
 r.exercise=ex;
 if(d.legacyRunning){
  const km=Number(d.distanceKm);if(!Number.isFinite(km)||km<=0||km>200||Math.round(km*100)/100!==km)throw new Error('旧记录公里数无效');
  r.distance_km=km;r.distance_m=Math.round(km*1000);r.note=`${ex} ${km}km（旧里程记录）`;
 }else{
  const minutes=Number(d.durationMin);if(!Number.isInteger(minutes)||minutes<=0||minutes>480)throw new Error('跑步时长需要为有效分钟数');
  r.duration_min=minutes;r.speedKmh=Number(d.speedKmh)||6.25;r.gait=d.gait==='jog'?'jog':'walk';r.note=`${ex} ${minutes}分钟，${r.speedKmh}km/h`;
 }
}
else if(type==='swimming'){r.stroke=ex;if(d.legacySwimming){const m=Number(d.durationMin);if(!(m>0))throw new Error('旧游泳记录需有效时长');r.duration_min=m;r.distance_m=Number(d.distanceM)||null;r.note=ex+' '+m+'分钟（旧记录编辑）'}else{const laps=Number(d.laps);if(!Number.isInteger(laps)||laps<1||laps>300)throw new Error('圈数需为正整数');r.laps=laps;r.distance_m=laps*50;const actual=d.durationMin!==''&&d.durationMin!==null&&d.durationMin!==undefined&&Number(d.durationMin)>0;r.duration_min=actual?Number(d.durationMin):null;r.rest_min=actual?(Number(d.restMin)||0):0;r.estimated_duration_min=actual?null:laps*2.5;r.note=ex+' '+laps+'圈 · '+r.distance_m+'米 · '+(actual?'按实际时长':'按圈数推算时长')}}
else if(type==='walking'){r.steps=Number(d.steps);if(!Number.isInteger(r.steps)||r.steps<1)throw new Error('步数需要是正整数');r.note=`步行${r.steps}步`}
else if(type==='hold'){r.exercise=ex;r.sets=Number(d.sets);r.secondsPerSet=Number(d.secondsPerSet);if(!Number.isInteger(r.sets)||r.sets<1||!(r.secondsPerSet>0))throw new Error('请填写有效组数与秒数');r.duration_sec=r.sets*r.secondsPerSet;r.note=`${ex} ${r.sets}组×${r.secondsPerSet}秒`}
if(d.presetKey)r.presetKey=d.presetKey;return r}
function totalRecs(list){return list.reduce((n,r)=>n+(Number(r.calories)||0),0)}
function recordsOfDate(date){return state.records.filter(r=>r.date===date)}
function viewTitle(){return {overview:['外勤日志',''],followalong:['仪式训练',''],calendar:['行动日历','运动自动打卡，休息日可手动标记。'],training:[draft.id?'编辑训练记录':'记录运动','输入实际完成量，即时估算热量消耗。'],history:['调查档案','按日期查看和修改每一条记录。'],settings:['装备整备','体重、目标和备份，都由你控制。']}[view]}
function navHTML(){return [['overview','打卡'],['followalong','仪式'],['calendar','日历'],['history','档案'],['settings','整备']].map(([k,t])=>`<button type="button" aria-label="${t}" class="nav-btn ${view===k?'active':''}" data-view="${k}" ${view===k?'aria-current="page"':''}>${icon(k==='overview'?'training':k==='history'?'journal':k)}<span>${t}</span></button>`).join('')}
function render(){/* V2历史记录不自动重算。 */document.body.dataset.screen=view;document.getElementById('desktopNav').innerHTML=navHTML();document.getElementById('mobileNav').innerHTML=navHTML();const [heading,sub]=viewTitle();const top=(view==='overview'||view==='followalong')?'':`<header class="topline"><div><div class="eyebrow">FITNESS RECORD · V5.40.0</div><h1 class="page-title" ${view==='calendar'?'aria-label="行动日历"':''}>${safe(heading)}</h1><div class="page-sub">${safe(sub)}</div></div><span class="date-chip">${safe(formatDate(localDate()))} · ${DAY_NAMES[new Date().getDay()]}</span></header>`;document.getElementById('content').innerHTML=top+({overview:renderQuickHome,followalong:renderFollowalong,calendar:renderCalendar,training:renderTraining,history:renderHistory,settings:renderSettings}[view]());if(view==='followalong')hydrateFollowVideo();}
function renderOverview(){const today=localDate(),wk=getWeekDates(),byDay=wk.map(day=>totalRecs(recordsOfDate(day))),wTotal=byDay.reduce((a,b)=>a+b,0),dTotal=totalRecs(recordsOfDate(today)),goal=Number(state.settings.weeklyGoal)||1500,pct=Math.round(wTotal/goal*100),highest=Math.max(...byDay,goal/7,1),plan=PLANS[new Date().getDay()],tomorrow=PLANS[(new Date().getDay()+1)%7];return `
 <div class="overview-grid"><section class="card hero"><div><div class="hero-label">今日已记录消耗</div><div class="big-number">${dTotal}<small>千卡 kcal</small></div></div><div class="hero-bottom"><div class="hero-hint">${recordsOfDate(today).length?`今天已记 ${recordsOfDate(today).length} 项运动，继续完成下一组。`:'今天还没有记录，开始添加第一项训练。'}</div><button type="button" class="hero-btn" data-view="training">＋ 记录运动</button></div></section><div class="hero-stats"><section class="card stat"><span class="label">本周累计</span><div class="num">${wTotal}<small>kcal</small></div><span class="note">周目标 ${goal.toLocaleString('zh-CN')} kcal</span></section><section class="card stat"><span class="label">本周已记录</span><div class="num">${state.records.filter(r=>wk.includes(r.date)).length}<small>条</small></div><span class="note">实际训练记录</span></section></div></div>
 <div class="overview-grid section-block"><section class="card"><div class="section-title"><div><h2>本周运动消耗</h2><p>${formatDate(wk[0])} — ${formatDate(wk[6])}</p></div><span class="date-chip">${pct}% 目标</span></div><div class="week-chart">${byDay.map((v,i)=>`<div class="bar-col ${wk[i]===today?'today':''}" title="${safe(wk[i])}：${v} 千卡"><div class="bar-rail"><div class="bar-fill" style="height:${v?Math.max(v/highest*100,4):0}%"></div></div><span class="bar-label">周${WEEK_SHORT[i]}</span></div>`).join('')}</div><div class="week-total"><span>已完成 <strong>${wTotal}</strong> / ${goal} kcal</span><strong>${pct}%</strong></div><div class="progress-track" role="progressbar" aria-label="每周目标进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pct,100)}"><div class="progress-bar" style="width:${Math.min(pct,100)}%"></div></div></section>
 <section class="card"><div class="section-title"><div><h2>训练记录总览</h2><p>本地保存 · 支持导入历史</p></div><button type="button" class="link-btn" data-view="history">查看历史</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:17px;padding:20px 0"><div class="stat"><span class="label">累计估算消耗</span><div class="num" style="font-size:29px">${totalRecs(state.records).toLocaleString('zh-CN')}<small>kcal</small></div></div><div class="stat"><span class="label">累计记录</span><div class="num" style="font-size:29px">${state.records.length}<small>条</small></div></div></div><p class="micro-note">仅在当前浏览器保存训练记录。可在“设置”导入原有历史 JSON，所有新增记录仅在本设备保存。</p></section></div>
 <div class="plan-grid section-block"><section class="card"><div class="section-title"><div><h2>今日训练计划 · ${DAY_NAMES[new Date().getDay()]}</h2><p>${plan.place} / ${plan.label}</p></div><button class="link-btn" data-view="training">自由记录</button></div>${plan.items.length?plan.items.map((item,i)=>`<div class="plan-item"><div><div class="plan-name">${safe(item.exercise)}</div><div class="plan-description">${safe(describePlanItem(item))}</div></div><button type="button" class="mini-btn" data-plan="${new Date().getDay()}-${i}">填写</button></div>`).join(''):`<div class="empty-state"><strong>今天是恢复日</strong><p>不安排固定训练，也可以自由记录散步或其他活动。</p></div>`}</section><section class="card"><div class="section-title"><div><h2>按自己的节奏记录</h2><p>计划仅供参考，实际完成多少就填多少。</p></div></div><p style="font-size:13px;color:var(--sub);margin:0">力量训练输入组数、每组次数；有氧和游泳输入时长；步行输入步数。点击保存后，今日和本周数据立刻更新。</p><div class="next-day-card"><div class="smallcap">明日计划 · ${DAY_NAMES[(new Date().getDay()+1)%7]}</div><strong>${tomorrow.label}</strong><p>${tomorrow.place}${tomorrow.items.length?` · ${tomorrow.items.length} 项动作`:' · 休息'}</p></div><button type="button" class="secondary-btn" style="width:100%;margin-top:17px" data-view="training">新建一条训练记录</button></section></div>`}
function field({key,label,value,type='number',step='1',unit='',full=false,placeholder='',min='0',hint=''}){const input=`<input class="input" id="f-${key}" name="${key}" type="${type}" ${type==='number'?`inputmode="decimal" step="${step}" min="${min}"`:''} value="${safe(value??'')}" placeholder="${safe(placeholder)}" autocomplete="off" />`;return `<div class="field ${full?'full':''}"><label for="f-${key}">${safe(label)}</label>${unit?`<div class="unitbox">${input}<span>${safe(unit)}</span></div>`:input}${hint?`<p class="hint">${safe(hint)}</p>`:''}</div>`}
function renderTypeFields(){
 let s='';
 if(draft.type==='strength')s=field({key:'exercise',label:'动作名称',value:draft.exercise,type:'text',full:true})+
  field({key:'sets',label:'完成组数',value:draft.sets,unit:'组',min:1})+
  field({key:'repsPerSet',label:'每组次数',value:draft.repsPerSet,unit:'次',min:1,hint:'默认20次/组；按每次3秒粗略估算动作时间'})+
  field({key:'loadKg',label:'器械重量（可选）',value:draft.loadKg,unit:'kg',step:0.5,hint:'只作为训练量记录，不直接计算热量'});
 else if(draft.type==='cardio')s=field({key:'exercise',label:'有氧项目',value:draft.exercise,type:'text',full:true})+
  field({key:'durationMin',label:'实际时长',value:draft.durationMin,unit:'分钟',step:0.5,min:.5,hint:'椭圆机轻量4.0 MET为工程假设'});
 else if(draft.type==='running')s=field({key:'exercise',label:'运动名称',value:'跑步',type:'text',full:true})+
  (draft.legacyRunning?field({key:'distanceKm',label:'旧记录原始距离',value:draft.distanceKm,unit:'km',step:0.01,min:0.01,hint:'沿用旧里程系数，非新版MET'}):
   field({key:'durationMin',label:'实际时长',value:draft.durationMin,unit:'分钟',step:1,min:1})+
   field({key:'speedKmh',label:'跑步机速度',value:draft.speedKmh,unit:'km/h',step:0.05,min:3,hint:'默认6.25km/h；6.0–6.3为4.8MET，6.4–6.5为5.5MET'})+
   '<div class="field full"><label for="f-gait">实际步态</label><select class="select" id="f-gait" name="gait"><option value="walk"'+(draft.gait!=='jog'?' selected':'')+'>快走（默认）</option><option value="jog"'+(draft.gait==='jog'?' selected':'')+'>慢跑（近似）</option></select></div>');
 else if(draft.type==='swimming')s=field({key:'exercise',label:'泳姿',value:draft.exercise,type:'text',full:true})+
  (draft.legacySwimming?field({key:'durationMin',label:'原记录时长',value:draft.durationMin,unit:'分钟',step:0.5,min:.5})+
   field({key:'distanceM',label:'原记录距离',value:draft.distanceM,unit:'米',step:1}):
   field({key:'laps',label:'圈数（每圈50米）',value:draft.laps,unit:'圈',min:1,hint:'默认20圈=1000米'})+
   field({key:'durationMin',label:'总时长（选填，含休息）',value:draft.durationMin,unit:'分钟',step:0.5,min:0,hint:'不填按每圈2.5分钟估算'})+
   field({key:'restMin',label:'其中休息分钟数（选填）',value:draft.restMin,unit:'分钟',step:0.5,min:0,hint:'填写后只算实际游动时间'}));
 else if(draft.type==='walking')s=field({key:'steps',label:'当天实际步数',value:draft.steps,unit:'步',min:1,hint:'没有实际距离和时长，按步幅假设粗略估算'});
 else if(draft.type==='hold')s=field({key:'exercise',label:'静态动作',value:draft.exercise,type:'text',full:true})+
  field({key:'sets',label:'完成组数',value:draft.sets,unit:'组',min:1})+
  field({key:'secondsPerSet',label:'每组保持时间',value:draft.secondsPerSet,unit:'秒',min:1});
 return s;
}
function renderTraining(){const plan=PLANS[new Date().getDay()];return `<div class="form-grid"><section class="card"><div class="section-title"><div><h2>${draft.id?'修改已保存记录':'添加训练'}</h2><p>所有计算均在当前设备中完成</p></div>${draft.id?'<button type="button" class="link-btn" data-action="reset-draft">取消编辑</button>':''}</div><div class="segmented" role="group" aria-label="选择运动类型">${CATEGORIES.map(([key,label])=>`<button type="button" class="segment ${draft.type===key?'active':''}" data-category="${key}" aria-pressed="${draft.type===key}">${label}</button>`).join('')}</div><form id="recordForm"><div class="fields">${renderTypeFields()}${field({key:'date',label:'训练日期',value:draft.date,type:'date',full:true})}</div><div class="form-actions"><button type="submit" class="primary-btn">${draft.id?'保存修改':'保存这条训练'}</button><button type="button" class="secondary-btn" data-action="reset-draft">清空</button></div></form></section>
 <div><section class="card preview-card"><span class="hero-label" style="color:#5d8b72">本次预计额外消耗</span><div class="preview-kcal" id="previewKcal">${calc(draft)??'—'}<small>kcal</small></div><p class="preview-line" id="previewLine">${safe(previewDescription(draft))}</p><div class="rule-list" id="previewRule">${safe(previewRule(draft))}</div></section><section class="card assist-card section-block"><div class="section-title"><div><h3>今天的计划</h3><p>${plan.label}</p></div></div>${plan.items.length?plan.items.map((item,i)=>`<div class="compact-plan"><div><div class="compact-plan-name">${safe(item.exercise)}</div><div class="compact-plan-sub">${safe(describePlanItem(item))}</div></div><button type="button" class="mini-btn" data-plan="${new Date().getDay()}-${i}">填入</button></div>`).join(''):'<p class="micro-note">今天是休息日，可以记录实际完成的其他活动。</p>'}</section></div></div>`}
function previewDescription(d){if(d.type==='strength')return (d.repsCount!==undefined?d.repsCount:(Number(d.sets)||0)*(Number(d.repsPerSet)||0))+'次 · 按3秒/次推算';if(d.type==='swimming')return d.legacySwimming?d.durationMin+'分钟（旧记录）':(Number(d.laps)||0)+'圈 · '+((Number(d.laps)||0)*50)+'米 · '+(Number(d.durationMin)>0?'按实际时长':'按50m/2.5min推算');if(d.type==='cardio')return (d.exercise||'有氧')+' · '+(d.durationMin||0)+'分钟';if(d.type==='running')return d.legacyRunning?(d.distanceKm||0)+'km（旧）':(d.durationMin||0)+'分钟 · '+(d.speedKmh||6.25)+'km/h';if(d.type==='walking')return (d.steps||0)+'步';if(d.type==='hold')return (d.sets||0)+'组 × '+(d.secondsPerSet||0)+'秒';return '';}
function previewRule(d){const m=calcMeta(d);if(!m)return '基于2024年成人MET标准估算额外活动热量';return '额外活动热量（净消耗） · '+(m.met===null?'步幅估算':m.met+' MET')+' · '+(m.confidence==='low'?'粗略估算':'标准估算')+(m.assumption?'；'+m.assumption:'')+'。非个体实测结果';}
function recordDescription(r){if(r.type==='walking')return (r.steps||0)+'步';if(r.type==='cardio')return (r.duration_min||0)+'分钟';if(r.type==='running')return Number(r.duration_min)>0?r.duration_min+'分钟'+(r.speedKmh?' · '+r.speedKmh+'km/h':''):(r.distance_km||0)+'km（旧记录）';if(r.type==='swimming')return Number(r.laps)>0?r.laps+'圈 · '+(r.distance_m||r.laps*50)+'米'+(r.duration_min?' · '+r.duration_min+'分钟':' · 时长推算'):(r.duration_min||0)+'分钟（旧记录）';if(r.type==='hold')return (r.sets||0)+'组 × '+(r.secondsPerSet||0)+'秒';if(r.type==='strength')return r.sets&&r.repsPerSet?r.sets+'组 × '+r.repsPerSet+'次 = '+r.reps+'次':(r.reps||0)+'次';return r.note||'运动记录';}
function recordName(r){return r.type==='walking'?'走路':(r.presetKey==='back'||r.exercise==='背部运动')?'臀桥及背部':r.exercise||r.stroke||r.note||prettyType(r.type)}

function historyRecordTime(r){
 if(!r.createdAt||r.original)return '';
 const d=new Date(r.createdAt);
 if(!Number.isFinite(d.getTime()))return '';
 const clock=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 return '<time class="record-time" datetime="'+safe(d.toISOString())+'" title="'+safe(localDate(d)+' '+clock+' · 打卡记录时间')+'">'+clock+'</time>';
}
function historyRecordCard(r){
 const isSet=r.type==='strength'||r.type==='hold';
 const qty=isSet&&Number.isFinite(Number(r.sets))&&Number(r.sets)>0
  ?{main:String(r.sets),unit:'组'}:
  isSet&&Number(r.reps)>0
   ?{main:String(r.reps),unit:'次'}:
  r.type==='walking'?{main:String(r.steps||0),unit:'步'}:
  r.type==='running'?(Number(r.duration_min)>0?{main:String(r.duration_min),unit:'分钟'}:{main:String(r.distance_km||0),unit:'km（旧）'}):
  r.type==='swimming'&&Number(r.laps)>0?{main:String(r.laps),unit:'来回'}:
  (r.type==='cardio'||r.type==='swimming')?{main:String(r.duration_min||0),unit:'分钟'}:{main:'—',unit:''};
 const detail=isSet&&r.sets?
  (r.type==='strength'
   ?(Number(r.repsPerSet)>0?'每组 '+Number(r.repsPerSet)+' 次':'组数已记录')
   :(Number(r.secondsPerSet)>0?'每组 '+Number(r.secondsPerSet)+' 秒':'组数已记录'))
  :recordDescription(r);
 return '<div class="record-card"><div class="record-icon">'+icon(r.type==='strength'?'training':r.type==='hold'?'hold':r.type==='walking'?'walking':r.type==='swimming'?'swimming':'activity',18)+'</div>'+
 '<div class="record-meta"><strong>'+safe(recordName(r))+'</strong><small>'+safe(detail)+'</small></div>'+
 '<div class="record-metric"><div><strong>'+safe(qty.main)+'</strong><span>'+safe(qty.unit)+'</span></div>'+
 '<small class="record-energy">'+(Number(r.calories)||0)+' kcal · '+(r.calorieVersion===CALORIE_MODEL_VERSION?'新版额外热量估算':'旧算法记录')+'</small></div>'+
 historyRecordTime(r)+
 '<button type="button" class="record-action" data-edit="'+safe(r.id)+'" aria-label="编辑 '+safe(recordName(r))+'">编辑</button>'+
 '<button type="button" class="record-action danger" data-delete="'+safe(r.id)+'" aria-label="删除 '+safe(recordName(r))+'">删除</button></div>';
}

function renderHistorySection(title,items){
 if(!items.length)return '';
 const sorted=[...items].sort((a,b)=>b.date.localeCompare(a.date)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const dates=[...new Set(sorted.map(r=>r.date))];
 return '<section class="history-slice"><div class="history-slice-head"><strong>'+safe(title)+'</strong><span>'+items.length+' 项</span></div>'+
 dates.map(date=>'<div class="history-date-group">'+(title==='今日'?'':'<div class="history-date-label">'+safe(formatDate(date))+'</div>')+
 sorted.filter(r=>r.date===date).map(historyRecordCard).join('')+'</div>').join('')+'</section>';
}

function renderHistoryQuickAmount(q){
 const unit=q.unit==='分钟'?'分':q.unit==='组'?'组':q.unit==='来回'?'来回':q.unit==='km'?'km':'步';
 return '<select id="historyQuickAmount" name="historyQuickAmount" aria-label="训练数量">'+
 '<option value="0" selected>选择数量</option>'+quickOptions(q).map(n=>'<option value="'+n+'">'+n+unit+'</option>').join('')+
 '<option value="custom">其他</option></select>'+
 '<input id="historyQuickCustom" name="historyQuickCustom" type="number" inputmode="numeric" min="1" max="'+q.max+
 '" step="'+q.step+'" value="'+q.value+'" aria-label="自定义训练数量">';
}
function renderHistoryQuickForm(date){
 const q=QUICK_ITEMS[0];
 return '<form id="historyQuickForm" class="history-quick-form" data-history-date="'+date+'">'+
 '<select id="historyQuickExercise" name="historyQuickExercise" aria-label="选择运动">'+
 QUICK_ITEMS.map(x=>'<option value="'+x.key+'">'+safe(x.name)+'</option>').join('')+'</select>'+
 '<span class="history-qty-wrap" id="historyQuickAmountWrap">'+renderHistoryQuickAmount(q)+'</span>'+
 '<button type="submit" class="history-quick-save">＋ 记录</button></form>';
}
function saveHistoryQuickForm(form){
 const date=historySelectedDate;
 if(!date||date!==form?.dataset.historyDate||date>localDate()||!/^\d{4}-\d{2}-\d{2}$/.test(date)){
  toast('训练日期无效');return false;
 }
 const q=QUICK_ITEMS.find(x=>x.key===form.querySelector('#historyQuickExercise')?.value);
 const selector=form.querySelector('#historyQuickAmount');
 const raw=selector?.value==='custom'?form.querySelector('#historyQuickCustom')?.value:selector?.value;
 const n=Number(raw);
 if(!q||raw===undefined||raw===''||!Number.isFinite(n)||n<=0||n>q.max||
   !Number.isInteger(n)){
  toast('请选择有效的运动数量');return false;
 }
 // One total for that calendar day, never append extra walking sessions.
 if(q.key==='steps')return saveDailySteps(n,date);
 const previous=state.records.slice();
 try{
  const draft=quickDraft(q,n);draft.date=date;
  const record=newRecord(draft);
  state.records.push(record);
  if(!persist()){state.records=previous;return false}
  render();toast('已记录 '+q.name+' · '+n+q.unit);return true;
 }catch(e){state.records=previous;toast(e.message||'保存失败');return false}
}


function renderHistory(){
 const today=localDate(),week=getWeekDates(),recs=state.records;
 if(historySelectedDate){
  const day=historySelectedDate,items=recs.filter(r=>r.date===day);
  return '<div class="history-compact"><div class="history-focus-head"><strong>'+safe(formatDate(day))+'</strong>'+
   '<div class="history-focus-actions"><button type="button" class="link-btn" data-view="calendar">返回日历</button>'+
   '<button type="button" class="link-btn" data-history-all>全部记录</button></div></div>'+
   renderHistoryQuickForm(day)+
   (items.length?'<section class="card history-unified">'+items.map(historyRecordCard).join('')+'</section>':
    '<div class="history-inline-empty">'+(dayKind(day)==='rest'?'休息日':'暂无记录')+'</div>')+'</div>';
 }
 const todayItems=recs.filter(r=>r.date===today);
 const weekItems=recs.filter(r=>r.date!==today&&week.includes(r.date));
 const older=recs.filter(r=>!week.includes(r.date));
 return '<div class="history-compact">'+
  (todayItems.length||weekItems.length?'<section class="card history-unified">'+
    renderHistorySection('今日',todayItems)+
    renderHistorySection('本周',weekItems)+'</section>':
   '<div class="history-inline-empty">本周暂无训练记录</div>')+
  (older.length?'<button type="button" class="history-expand" data-filter="'+(historyFilter==='all'?'week':'all')+'">'+
   (historyFilter==='all'?'收起更早记录':'更早记录 · '+older.length+' 项')+'</button>'+
   (historyFilter==='all'?'<section class="card history-unified">'+renderHistorySection('更早记录',older)+'</section>':''):'')+
  '</div>';
}


/* V5.11.0: Human-readable calorie setting basis. Never change the workout formulas. */
function ftRuleFixed(q){return ['steps','elliptical','running','wall-sit'].includes(q.key)}
function ftRuleBasis(q){return q.key==='steps'?1000:q.key==='swim'?1:q.key==='wall-sit'?1:q.type==='strength'?60:20}
function ftRuleExample(q){return q.key==='steps'?5000:q.key==='swim'?10:q.key==='wall-sit'?2:q.type==='strength'?120:40}
function ftRuleName(q,n,p){
 if(q.key==='wall-sit')return n+' 组 × '+p.perSet+' 秒';
 if(q.key==='swim')return n+' 来回（'+n*50+' 米）';
 return n.toLocaleString('zh-CN')+' '+q.unit;
}
function ftRuleRawKcal(q,p){
 const basis=ftRuleBasis(q);
 return q.type==='hold'?basis*p.perSet/60*p.rate:q.type==='walking'?basis/1000*p.rate:basis*p.rate;
}
function ftRuleNumber(n){return String(Number(Number(n).toPrecision(12)))}
function ftRuleRate(q,kcal,perSet){
 const denominator=q.type==='hold'?perSet/60:q.type==='walking'?ftRuleBasis(q)/1000:ftRuleBasis(q);
 return kcal/denominator;
}
function ftRuleRow(q){
 if(q.key==='wall-sit')return '<div class="ft-rule-row" data-exercise-config="wall-sit">'+
   '<div class="ft-rule-header"><div class="ft-rule-ident"><strong>靠墙及平板</strong><span>两种动作均按30秒/组记录</span></div><span class="ft-rule-kind">自定义固定标准</span></div>'+
   '<div class="ft-rule-equation"><span>靠墙及平板 4 组 × 30秒</span><div class="ft-rule-result"><strong>8</strong><span>kcal</span></div></div>'+
   '<div class="ft-rule-example">自定义记账标准，不代表实测热量；历史记录不重算</div></div>';
 const p=exerciseProfile(q),fixed=ftRuleFixed(q),kcal=ftRuleRawKcal(q,p),amount=ftRuleBasis(q);
 const note=q.key==='steps'?'按当前体重 '+Number(state.settings.weight||65)+' kg 估算':
   q.key==='elliptical'||q.key==='running'?'已确认的固定热量标准':
   q.key==='swim'?'每来回按 50 米计算':
   q.key==='wall-sit'?'单组热量随每组秒数变化':
   q.type==='strength'?'60 次相当于 4 组 × 15 次（仅为换算示例）':'时长越长，热量按比例计算';
 const standard=ftRuleName(q,amount,p);
 const display=ftRuleNumber(kcal);
 const main=fixed
   ?'<div class="ft-rule-result"><strong>'+profileCalories(q,amount,p)+'</strong><span>kcal</span></div>'
   :'<label class="ft-rule-edit" for="ec-'+q.key+'-kcal"><input type="number" id="ec-'+q.key+'-kcal" data-rule-kcal data-original-kcal="'+display+'" min="0" max="1000000" step="any" inputmode="decimal" value="'+display+'" aria-label="'+safe(q.name)+'完成'+safe(standard)+'消耗的千卡"><span>kcal</span></label>';
 const time=q.type==='hold'
  ?'<label class="ft-rule-time" for="ec-'+q.key+'-perSet">每组时长<input type="number" id="ec-'+q.key+'-perSet" min="1" max="600" step="1" inputmode="numeric" value="'+p.perSet+'"><span>秒</span></label>'
  :'';
 return '<div class="ft-rule-row" data-exercise-config="'+q.key+'">'+
   '<div class="ft-rule-header"><div class="ft-rule-ident"><strong>'+safe(q.name)+'</strong><span>'+safe(note)+'</span></div>'+
   '<span class="ft-rule-kind">'+(fixed?'固定标准':'可修改')+'</span></div>'+
   time+
   '<div class="ft-rule-equation"><span>完成 <strong>'+safe(standard)+'</strong> 预计消耗</span>'+main+'</div>'+
   '<div class="ft-rule-example" data-exercise-est="'+q.key+'">举例：'+safe(ftRuleName(q,ftRuleExample(q),p))+
   ' ≈ '+profileCalories(q,ftRuleExample(q),p)+' kcal</div>'+
   '</div>';
}
function renderExerciseSettings(){
 const w=Number(state.settings.weight)||65;
 const examples=[
  ['蛙泳','20圈×50米，实际游动50分钟',Math.round(netEnergy(w,5.3,50))+' kcal','2024标准 5.3 MET'],
  ['跑步机快走','20分钟，速度6.25km/h，0%坡度',Math.round(netEnergy(w,4.8,20))+' kcal','2024标准 4.8 MET'],
  ['椭圆机轻量','20分钟',Math.round(netEnergy(w,4,20))+' kcal','4.0 MET 工程假设'],
  ['器械力量','20次，按3秒/次推算',Math.round(netEnergy(w,3.5,1))+' kcal','次数推算可信度低'],
  ['靠墙静蹲 / 平板支撑','每组30秒：静蹲4组=6kcal，平板4组=8kcal','自定义标准','网站记账值，并非实测热量'],
  ['步行','示例5000步',Math.round(5000*0.0007*w*0.5)+' kcal','假设步长0.7m（粗略）']
 ];
 return '<section class="card section-block ft-rules-panel"><div class="ft-rules-title"><h2>运动热量估算标准 · MET V2</h2>'+
  '<p>主统计为额外活动热量，公式：(MET−1) × 3.5 × 体重kg ÷ 200 × 运动分钟。</p></div>'+
  '<div class="ft-rule-groups">'+examples.map(r=>'<div class="ft-rule-row"><div class="ft-rule-header"><div class="ft-rule-ident"><strong>'+safe(r[0])+'</strong><span>'+safe(r[1])+'</span></div><span class="ft-rule-kind">'+safe(r[2])+'</span></div><div class="ft-rule-example">'+safe(r[3])+'</div></div>').join('')+'</div>'+
  '<div class="ft-rules-footer"><p>默认36岁、65kg。靠墙及平板使用用户指定的4组6/8kcal规则；其他项目参考MET及工程假设，不是实测。历史记录和原有卡路里不重算。</p>'+
  '<p>参考：2024 Adult Compendium of Physical Activities · pacompendium.com</p></div></section>';
}
function renderSettings(){
 return '<div class="ft-settings-layout">'+
 '<section class="card settings-card ft-settings-profile"><h2>个人参数</h2><div class="fields">'+
 field({key:'weight',label:'当前体重',value:state.settings.weight,unit:'kg',step:.1,min:1})+field({key:'age',label:'年龄',value:state.settings.age||36,unit:'岁',min:19})+
 field({key:'weeklyGoal',label:'每周消耗目标',value:state.settings.weeklyGoal,unit:'kcal',min:1})+
 '</div><button type="button" class="primary-btn" data-action="save-settings" style="margin-top:16px">保存个人参数</button></section>'+
 renderExerciseSettings()+
 '<section class="card settings-card ft-settings-backup"><h2>数据备份</h2>'+
 '<div class="data-safety-status">'+
 (storageReadIssue?'<strong class="data-safety-alert">'+safe(storageReadIssue)+'</strong>':
 state.records.length?'<span>本机已读取 '+state.records.length+' 条训练记录</span>':
 '<span>暂无历史记录。找回旧数据请检查原桌面图标或 Safari，勿清理网站数据。</span>')+
 (recoveryState()?.records.length?'<button type="button" class="secondary-btn" data-action="restore-snapshot">恢复本机快照（'+recoveryState().records.length+' 条）</button>':'')+
 (storageReadIssue?'<button type="button" class="secondary-btn" data-action="export-raw">导出原始内容</button>':'')+
 '</div><div class="settings-actions"><button type="button" class="primary-btn" data-action="export-json">导出 JSON</button>'+
 '<button type="button" class="secondary-btn" data-action="export-csv">导出 CSV</button>'+
 '<button type="button" class="secondary-btn" data-action="import-json">导入 JSON</button></div>'+
 '<div class="alert">仅保存在本机浏览器或桌面应用，不会上传服务器。清除网站数据或移除桌面应用可能丢失记录，请定期导出 JSON 备份。导入备份会覆盖当前记录。</div>'+
 '</section></div>';
}


function saveExerciseProfiles(){
 const next={...(state.settings.exerciseProfiles||{})};
 let changed=0;
 for(const q of QUICK_ITEMS){
  if(ftRuleFixed(q))continue;
  const card=document.querySelector('[data-exercise-config="'+q.key+'"]');
  const input=card?.querySelector('[data-rule-kcal]');
  if(!card||!input||input.value.trim()===''){toast('请填写「'+q.name+'」的预计消耗');return false}
  const kcal=Number(input.value),original=Number(input.dataset.originalKcal);
  const perSetInput=card.querySelector('[id$="-perSet"]');
  const p=exerciseProfile(q);
  const perSet=perSetInput?Number(perSetInput.value):p.perSet;
  if(!Number.isFinite(kcal)||kcal<0||kcal>1000000||
   (perSetInput&&(!Number.isInteger(perSet)||perSet<1||perSet>600))){
   toast('请检查「'+q.name+'」的数值');return false;
  }
  const caloriesChanged=kcal!==original;
  const timeChanged=!!perSetInput&&perSet!==p.perSet;
  if(!caloriesChanged&&!timeChanged)continue;
  const rate=caloriesChanged?ftRuleRate(q,kcal,perSet):p.rate;
  if(!Number.isFinite(rate)||rate<0||rate>10000){
   toast('「'+q.name+'」的热量超出可设置范围');return false;
  }
  if(q.key==='swim')next[q.key]={...(next[q.key]||{}),lapRate:rate};
  else if(perSetInput)next[q.key]={...(next[q.key]||{}),perSet,rate};
  else next[q.key]={...(next[q.key]||{}),rate};
  changed++;
 }
 if(!changed){toast('热量标准没有变化');return true}
 const previous=state.settings;
 state.settings={...previous,exerciseProfiles:next};
 if(!persist()){state.settings=previous;return false}
 render();toast('已保存 '+changed+' 项热量标准，之后新增的运动按新标准计算');return true;
}
function updateExercisePreview(card,source){
 const q=QUICK_ITEMS.find(item=>item.key===card?.dataset.exerciseConfig);
 if(!q||ftRuleFixed(q))return;
 const p=exerciseProfile(q);
 const input=card.querySelector('[data-rule-kcal]');
 const perSetInput=card.querySelector('[id$="-perSet"]');
 if(!input)return;
 const perSet=perSetInput?Number(perSetInput.value):p.perSet;
 if(perSetInput&&source===perSetInput&&Number.isInteger(perSet)&&perSet>=1&&perSet<=600){
  const lastAuto=input.dataset.lastAuto||input.dataset.originalKcal;
  if(Number(input.value)===Number(lastAuto)){
   const fresh=ftRuleNumber(ftRuleRawKcal(q,{...p,perSet}));
   input.value=fresh;
   input.dataset.lastAuto=fresh;
  }
 }
 const kcal=input.value.trim()===''?NaN:Number(input.value);
 const rate=ftRuleRate(q,kcal,perSet);
 const target=card.querySelector('[data-exercise-est]');
 if(!target)return;
 if(!Number.isFinite(kcal)||kcal<0||kcal>1000000||
  (perSetInput&&(!Number.isInteger(perSet)||perSet<1||perSet>600))||
  !Number.isFinite(rate)||rate<0||rate>10000){
  target.textContent='请填写有效的热量或时长';
  return;
 }
 const live={...p,perSet,rate};
 const basisLabel=card.querySelector('.ft-rule-equation>span strong');
 if(basisLabel)basisLabel.textContent=ftRuleName(q,ftRuleBasis(q),live);
 target.textContent='举例：'+ftRuleName(q,ftRuleExample(q),live)+' ≈ '+profileCalories(q,ftRuleExample(q),live)+' kcal';
}


/* V5.43 — two actual H264 films, custom landscape viewer and 35s rest clock.
   The former twelve chapter buttons and split-video fallback were removed. */
const FOLLOW_MEDIA_CACHE='fitness-follow-user-v536';
const followLocalUrls={1:null,2:null};
let followWakeLock=null,followWakePending=false;
let followLandNum=0;
const RITUAL_REST_MS=35000;
let ritualDeadline=0,ritualTimerHandle=null,ritualTimerDone=false;

function formatFilmTime(seconds){
 const s=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));
 return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}
function renderFollowalong(){
 function section(num,name,length){
  return '<div class="fa-video-block" data-follow-block="'+num+'">'+
   '<div class="fa-video-head"><h2>'+name+'</h2><small>'+length+'</small></div>'+
   '<div class="fa-player"><video id="fa-video-'+num+'" playsinline webkit-playsinline preload="metadata"'+
   ' poster="'+(num===1?'./art/follow-poster-v543.webp?v=5.43.0':'./art/follow-poster-crunch-v537.webp?v=5.37.0')+
   '" aria-label="'+name+'"></video>'+
   '<div class="fa-video-state" id="fa-video-state-'+num+'" role="status" aria-live="polite">视频检查中…</div></div>'+
   '<div class="fa-video-controls" aria-label="'+name+'播放控制">'+
     '<button type="button" class="fa-play-btn" data-ritual-play="'+num+'" aria-label="播放 '+name+'">播放</button>'+
     '<span class="fa-elapsed" data-ritual-elapsed="'+num+'">00:00</span>'+
     '<input class="fa-seek" type="range" min="0" max="100" step=".1" value="0" data-ritual-seek="'+num+'" aria-label="'+name+'播放进度">'+
     '<span class="fa-duration" data-ritual-duration="'+num+'">'+length.split(' ')[0]+'</span>'+
     '<button type="button" class="fa-land-btn" data-ritual-landscape="'+num+'" aria-label="横屏全屏播放 '+name+'">横屏全屏</button>'+
   '</div>'+
   '<div class="fa-local-video-tools" id="fa-local-tools-'+num+'" hidden>'+
    '<button type="button" data-follow-import="'+num+'">选择本机 '+num+'.mp4</button>'+
    '<input type="file" hidden accept="video/mp4,.mp4" data-follow-file="'+num+'" aria-label="从本机选择视频"/>'+
   '</div></div>';
 }
 return '<div class="fa-page">'+
  '<header class="fa-hero"><h1 class="fa-hero-heading" aria-label="仪式训练">仪式训练</h1></header>'+
  '<section class="fa-player-sheet">'+
   section(1,'第一段 · 肩臂舒展','06:16')+
   '<section class="fa-rest" aria-label="35秒倒计时">'+
    '<div class="fa-rest-title"><h2>组间倒计时</h2><span>固定 35 秒</span></div>'+
    '<div class="fa-rest-main">'+
     '<button type="button" class="fa-rest-trigger" data-ritual-timer-start aria-label="点击开始35秒倒计时">'+
      '<span class="fa-rest-ring"><span class="fa-rest-display" data-ritual-timer-clock>00:35</span></span>'+
      '<span class="fa-rest-caption" data-ritual-timer-label>点击开始</span>'+
     '</button>'+
     '<div class="fa-rest-side"><strong>组间休息</strong><p>点一次，开始倒数 35 秒</p>'+
      '<button type="button" class="fa-rest-reset" data-ritual-timer-reset>重置 35 秒</button>'+
     '</div>'+
    '</div>'+
   '</section>'+
   section(2,'第二段 · 卷腹示范','03:08')+
  '</section></div>';
}
function followVideoStatus(num,msg){
 const node=document.getElementById('fa-video-state-'+num);
 if(node){node.hidden=!msg;if(msg)node.textContent=msg}
}
function followShowImport(num,show){
 const el=document.getElementById('fa-local-tools-'+num);
 if(el)el.hidden=!show;
}
function followUpdateMedia(num){
 const v=document.getElementById('fa-video-'+num);
 if(!v)return;
 const elapsed=document.querySelector('[data-ritual-elapsed="'+num+'"]');
 const duration=document.querySelector('[data-ritual-duration="'+num+'"]');
 const seek=document.querySelector('[data-ritual-seek="'+num+'"]');
 const play=document.querySelector('[data-ritual-play="'+num+'"]');
 if(elapsed)elapsed.textContent=formatFilmTime(v.currentTime);
 if(duration&&Number.isFinite(v.duration))duration.textContent=formatFilmTime(v.duration);
 if(seek&&Number.isFinite(v.duration)&&v.duration>0)seek.value=String(Math.max(0,Math.min(100,v.currentTime/v.duration*100)));
 if(play){
  play.textContent=v.paused?'播放':'暂停';
  play.setAttribute('aria-label',v.paused?'播放视频':'暂停视频');
 }
}
function followUseUrl(num,url){
 const video=document.getElementById('fa-video-'+num);
 if(!video)return;
 video.src=url;video.preload='metadata';video.load();
 followVideoStatus(num,'');followShowImport(num,false);
 followUpdateMedia(num);
}
async function followMediaCheck(num){
 if(view!=='followalong'||!document.getElementById('fa-video-'+num))return;
 const path='./media/'+num+'.mp4?v=5.43.0';
 // Always prefer the currently deployed film; old imported caches must not
 // override the user's new 1_优化.mp4 with the retired first film.
 try{
  const head=await fetch(path,{method:'HEAD',cache:'no-store'});
  const type=head.headers.get('content-type')||'';
  if(head.ok&&(type.includes('video/')||type.includes('application/octet-stream'))){
   if(document.getElementById('fa-video-'+num)&&view==='followalong')followUseUrl(num,path);
   return;
  }
 }catch(e){/* no network or unsupported HEAD */}
 if(followLocalUrls[num]){
  followUseUrl(num,followLocalUrls[num]);return;
 }
 if(num===2){
  // Optional local-import fallback for a video that could not be downloaded.
  try{
   if('caches' in window){
    const cache=await caches.open(FOLLOW_MEDIA_CACHE);
    const stored=await cache.match('./media/2.mp4',{ignoreSearch:true});
    if(stored?.ok){
     const blob=await stored.blob();
     if(blob.size){followLocalUrls[2]=URL.createObjectURL(blob);followUseUrl(2,followLocalUrls[2]);return}
    }
   }
  }catch(e){}
 }
 followVideoStatus(num,'视频暂时无法加载，可从本机选择 MP4');
 followShowImport(num,true);
}
function hydrateFollowVideo(){
 if(view!=='followalong')return;
 followMediaCheck(1);followMediaCheck(2);
 ritualUpdateVisual();
}
function followHasPlayingVideo(){
 return view==='followalong'&&[1,2].some(i=>{
  const v=document.getElementById('fa-video-'+i);
  return v&&!v.paused&&!v.ended;
 });
}
function followWakeNeeded(){
 return view==='followalong'&&(followHasPlayingVideo()||ritualDeadline>0);
}
async function followAcquireWake(){
 if(!followWakeNeeded()||document.hidden||followWakePending)return;
 if(!navigator.wakeLock||typeof navigator.wakeLock.request!=='function')return;
 if(followWakeLock&&!followWakeLock.released)return;
 followWakePending=true;
 try{
  const lock=await navigator.wakeLock.request('screen');
  if(!followWakeNeeded()||document.hidden){await lock.release();return;}
  followWakeLock=lock;
  lock.addEventListener('release',()=>{
   if(followWakeLock===lock)followWakeLock=null;
   if(followWakeNeeded()&&!document.hidden)followAcquireWake();
  });
 }catch(e){/* iOS low-power mode or Safari may deny wake lock */}
 finally{followWakePending=false;}
}
function followReleaseWake(){
 const current=followWakeLock;followWakeLock=null;
 if(current&&!current.released)current.release().catch(()=>{});
}
function ritualUpdateVisual(){
 const button=document.querySelector('[data-ritual-timer-start]');
 const text=document.querySelector('[data-ritual-timer-clock]');
 const label=document.querySelector('[data-ritual-timer-label]');
 const ring=document.querySelector('.fa-rest-ring');
 const active=ritualDeadline>0;
 const left=active?Math.max(0,Math.ceil((ritualDeadline-Date.now())/1000)):(ritualTimerDone?0:35);
 if(text)text.textContent='00:'+String(left).padStart(2,'0');
 if(label)label.textContent=active?'倒计时中':ritualTimerDone?'完成 · 点击再来':'点击开始';
 if(button){
  button.classList.toggle('is-running',active);
  button.classList.toggle('is-complete',!active&&ritualTimerDone);
  button.setAttribute('aria-label',active?'倒计时剩余'+left+'秒':ritualTimerDone?'再来一次35秒倒计时':'开始35秒倒计时');
 }
 if(ring)ring.style.setProperty('--timer-pct',String((35-left)/35*100)+'%');
 return left;
}
function ritualTimerStop(reset=true){
 if(ritualTimerHandle){clearInterval(ritualTimerHandle);ritualTimerHandle=null}
 ritualDeadline=0;ritualTimerDone=!reset;
 ritualUpdateVisual();
 if(!followHasPlayingVideo())followReleaseWake();
}
function ritualTimerTick(){
 if(!ritualDeadline)return;
 if(Date.now()>=ritualDeadline){
  ritualTimerStop(false);
  if('vibrate' in navigator)try{navigator.vibrate([120,80,120])}catch(e){}
  return;
 }
 ritualUpdateVisual();
}
function ritualTimerStart(){
 if(view!=='followalong'||ritualDeadline)return;
 if(ritualTimerHandle)clearInterval(ritualTimerHandle);
 ritualTimerDone=false;ritualDeadline=Date.now()+RITUAL_REST_MS;
 ritualTimerHandle=setInterval(ritualTimerTick,160);
 ritualUpdateVisual();
 followAcquireWake();
}
function followEnterLandscape(num){
 if(view!=='followalong'||![1,2].includes(num))return;
 if(followLandNum&&followLandNum!==num)followExitLandscape();
 const block=document.querySelector('[data-follow-block="'+num+'"]');if(!block)return;
 followLandNum=num;
 document.body.classList.add('ritual-landscape');
 block.classList.add('is-landscape-fullscreen');
 const button=block.querySelector('[data-ritual-landscape]');
 if(button){button.textContent='退出全屏';button.setAttribute('aria-label','退出横屏全屏')}
 const v=document.getElementById('fa-video-'+num);
 if(v&&v.paused&&v.readyState>=1)v.play().catch(()=>{});
}
function followExitLandscape(){
 if(!followLandNum)return;
 const block=document.querySelector('[data-follow-block="'+followLandNum+'"]');
 if(block){
  block.classList.remove('is-landscape-fullscreen');
  const button=block.querySelector('[data-ritual-landscape]');
  if(button){button.textContent='横屏全屏';button.setAttribute('aria-label','横屏全屏播放视频')}
 }
 document.body.classList.remove('ritual-landscape');
 followLandNum=0;
}
function followTogglePlayback(num){
 const video=document.getElementById('fa-video-'+num);
 if(!video||!video.src){toast('视频尚未加载');return}
 if(video.paused){
  const result=video.play();
  if(result?.catch)result.catch(()=>toast('播放失败，请重试'));
 }else video.pause();
}
document.addEventListener('click',e=>{
 const play=e.target.closest('[data-ritual-play]');
 if(play){followTogglePlayback(Number(play.dataset.ritualPlay));return}
 const full=e.target.closest('[data-ritual-landscape]');
 if(full){
  const num=Number(full.dataset.ritualLandscape);
  if(followLandNum===num)followExitLandscape();
  else followEnterLandscape(num);
  return;
 }
 if(e.target.closest('[data-ritual-timer-start]')){ritualTimerStart();return}
 if(e.target.closest('[data-ritual-timer-reset]')){ritualTimerStop(true);return}
 const importButton=e.target.closest('[data-follow-import]');
 if(importButton){
  document.querySelector('[data-follow-file="'+importButton.dataset.followImport+'"]')?.click();
 }
});
document.addEventListener('input',e=>{
 const seek=e.target.closest('[data-ritual-seek]');if(!seek)return;
 const v=document.getElementById('fa-video-'+seek.dataset.ritualSeek);
 if(v&&Number.isFinite(v.duration)&&v.duration>0)
  try{v.currentTime=Number(seek.value)*v.duration/100}catch(err){}
});
document.addEventListener('change',async e=>{
 const input=e.target.closest('[data-follow-file]');if(!input)return;
 const num=Number(input.dataset.followFile),file=input.files?.[0];
 if(!file||![1,2].includes(num))return;
 if(!(/\.mp4$/i.test(file.name)||file.type==='video/mp4')){toast('请选 MP4 视频');return}
 if(followLocalUrls[num])URL.revokeObjectURL(followLocalUrls[num]);
 followLocalUrls[num]=URL.createObjectURL(file);followUseUrl(num,followLocalUrls[num]);
 if(num===2)try{
  if('caches' in window){
   const cache=await caches.open(FOLLOW_MEDIA_CACHE);
   await cache.put('./media/2.mp4',new Response(file,{headers:{'content-type':'video/mp4'}}));
  }
 }catch(err){}
 input.value='';
});
document.addEventListener('play',e=>{
 if(!e.target.matches?.('.fa-player video'))return;
 const current=e.target;
 document.querySelectorAll('.fa-player video').forEach(v=>{if(v!==current&&!v.paused)v.pause()});
 followUpdateMedia(Number(current.id.slice(-1)));
 followAcquireWake();
},true);
document.addEventListener('pause',e=>{
 if(!e.target.matches?.('.fa-player video'))return;
 followUpdateMedia(Number(e.target.id.slice(-1)));
 if(!followWakeNeeded())followReleaseWake();
},true);
document.addEventListener('ended',e=>{
 if(!e.target.matches?.('.fa-player video'))return;
 followUpdateMedia(Number(e.target.id.slice(-1)));
 if(!followWakeNeeded())followReleaseWake();
},true);
document.addEventListener('loadedmetadata',e=>{
 if(e.target.matches?.('.fa-player video'))followUpdateMedia(Number(e.target.id.slice(-1)));
},true);
document.addEventListener('timeupdate',e=>{
 if(e.target.matches?.('.fa-player video'))followUpdateMedia(Number(e.target.id.slice(-1)));
},true);
document.addEventListener('click',e=>{
 if(e.target.matches?.('.fa-player video'))followTogglePlayback(Number(e.target.id.slice(-1)));
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&followLandNum){e.preventDefault();followExitLandscape()}
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)followReleaseWake();
 else{
  if(ritualDeadline)ritualTimerTick();
  if(followWakeNeeded())followAcquireWake();
 }
});
function switchView(v){if(view==='followalong'&&v!=='followalong'){followExitLandscape();ritualTimerStop(true);followReleaseWake();}if(v==='steps')v='overview';if(!['overview','followalong','calendar','training','history','settings'].includes(v))return;wbOpenKey=null;wbCalorieDetailOpen=false;view=v;render();window.scrollTo({top:0,behavior:'instant'})}
function toast(message){let el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2400)}
function pullForm(){const f=document.getElementById('recordForm');if(!f)return;for(const input of f.querySelectorAll('[name]'))draft[input.name]=input.value}
function updatePreview(){const k=document.getElementById('previewKcal'),desc=document.getElementById('previewLine'),rule=document.getElementById('previewRule');if(k)k.innerHTML=`${calc(draft)??'—'}<small>kcal</small>`;if(desc)desc.textContent=previewDescription(draft);if(rule)rule.textContent=previewRule(draft)}
function startPlan(day,index){const p=PLANS[day]?.items[index];if(!p)return;draft={...emptyDraft(p.type),...clone(p),id:null,date:localDate()};switchView('training');toast('已填入计划，核对实际完成量后保存')}
function startEdit(id){const r=state.records.find(x=>x.id===id);if(!r)return;const legacySwimming=r.type==='swimming'&&!(Number(r.laps)>0);draft={...emptyDraft(r.type),id:r.id,date:r.date,type:r.type,exercise:r.exercise||r.stroke||'拉背',sets:r.sets||1,repsPerSet:r.repsPerSet||(r.reps||20),durationMin:r.duration_min??'',restMin:r.rest_min||0,speedKmh:r.speedKmh||6.25,gait:r.gait||'walk',distanceKm:r.distance_km||0,legacyRunning:r.type==='running'&&Number(r.distance_km)>0&&!Number(r.duration_min),legacyRunningRate:r.type==='running'&&Number(r.distance_km)>0?(Number(r.calories)||0)/Number(r.distance_km):0,weightAtRecord:r.weightAtRecord||state.settings.weight,laps:legacySwimming?'':r.laps||20,legacySwimming,distanceM:r.distance_m??'',steps:r.steps||0,loadKg:r.loadKg??'',secondsPerSet:r.secondsPerSet||45};switchView('training')}
function saveSettings(){const w=Number(document.getElementById('f-weight')?.value),g=Number(document.getElementById('f-weeklyGoal')?.value),age=Number(document.getElementById('f-age')?.value);if(!Number.isFinite(w)||w<=0||w>500||!Number.isFinite(g)||g<1||g>1e7||!Number.isInteger(age)||age<19||age>59){toast('请填写有效体重、年龄和目标');return}const prior=state.settings;state.settings={...prior,weight:w,age,weeklyGoal:Math.round(g)};if(!persist()){state.settings=prior;return}render();toast('已保存；历史记录不重算')}
function exportFile(textContent,fileName,mime){const a=document.createElement('a'),blob=new Blob([textContent],{type:mime});const url=URL.createObjectURL(blob);a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportRawFitnessData(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw){toast('没有原始内容可导出');return}exportFile(raw,`健身记录-原始保护-${localDate()}.txt`,'text/plain;charset=utf-8');toast('原始内容已导出')}catch(e){toast('原始内容读取失败')}}
function exportJSON(){exportFile(JSON.stringify({...state,restDays:[...restDays].sort(),exportedAt:new Date().toISOString()},null,2),`运动手账-备份-${localDate()}.json`,'application/json;charset=utf-8');toast('JSON 备份已导出')}
function exportCSV(){const headers=['日期','类型','项目','组数','每组次数','总次数','时长(分钟)','每组秒数','步数','距离(米)','重量(kg)','估算千卡','游泳来回数','跑步距离(km)'];const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const lines=state.records.map(r=>[r.date,prettyType(r.type),recordName(r),r.sets,r.repsPerSet,r.reps,r.duration_min,r.secondsPerSet,r.steps,r.distance_m,r.loadKg,r.calories,r.laps,r.distance_km].map(cell).join(','));exportFile('\ufeff'+headers.map(cell).join(',')+'\r\n'+lines.join('\r\n'),`运动手账-记录-${localDate()}.csv`,'text/csv;charset=utf-8');toast('CSV 已导出')}
function importJSONFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const v=JSON.parse(String(reader.result));const records=Array.isArray(v)?v:v.records;if(!Array.isArray(records))throw new Error('JSON 中找不到记录数组');const clean=records.map((r,i)=>{if(typeof r!=='object'||!r||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!['walking','cardio','running','swimming','strength','situps','hold'].includes(r.type)||!Number.isFinite(Number(r.calories))||Number(r.calories)<0)throw new Error(`第 ${i+1} 条记录无效`);let type=r.type==='situps'?'strength':r.type;return {...r,type,exercise:r.type==='situps'?'仰卧起坐':r.exercise,id:typeof r.id==='string'&&r.id?r.id:uid(),calories:Number(r.calories),createdAt:r.createdAt||r.date+'T09:00:00'}});if(!confirm(`这份文件包含 ${clean.length} 条记录。确定覆盖当前 ${state.records.length} 条记录吗？`))return;const settings=v.settings&&typeof v.settings==='object'?{...state.settings,...v.settings,weight:Number(v.settings.weight)||state.settings.weight,weeklyGoal:Number(v.settings.weeklyGoal)||state.settings.weeklyGoal}:state.settings;const beforeImport=state,readBlock=storageReadIssue; if(readBlock&&!archivePriorFitnessData(localStorage.getItem(STORAGE_KEY))){throw new Error('原始内容无法保护，已取消导入')};storageReadIssue='';state={version:1,records:clean,settings,stepDiary:Object.prototype.hasOwnProperty.call(v,'stepDiary')?cleanStepDiary(v.stepDiary):state.stepDiary,weightHistory:Object.prototype.hasOwnProperty.call(v,'weightHistory')?cleanWeightHistory(v.weightHistory):state.weightHistory,eatingWindows:Object.prototype.hasOwnProperty.call(v,'eatingWindows')?cleanEatingWindows(v.eatingWindows):state.eatingWindows};if(!persist()){state=beforeImport;storageReadIssue=readBlock;throw new Error('记录未写入，请勿删除原始备份')};if(Array.isArray(v.restDays)){const loadedRestDays=new Set(v.restDays.filter(validRestDate));if(persistRestDays(loadedRestDays))restDays=loadedRestDays;}view='overview';render();toast(`成功导入 ${clean.length} 条记录`)}catch(e){alert('导入失败：'+e.message)}};reader.readAsText(file,'utf-8')}

const QUICK_ITEMS=[
 {key:'elliptical',name:'椭圆机',unit:'分钟',value:20,step:20,max:480,type:'cardio',exercise:'椭圆机',note:'轻量·每次20分钟',iconName:'activity'},
 {key:'lat',name:'拉背',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'拉背',note:'默认4组×15次',iconName:'training'},
 {key:'row',name:'划船',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'划船',note:'默认4组×15次',iconName:'training'},
 {key:'fly',name:'飞鸟及引体',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'飞鸟及引体',note:'默认4组×15次',iconName:'training'},
 {key:'wall-sit',name:'靠墙及平板',unit:'组',value:4,step:1,max:100,type:'hold',exercise:'靠墙及平板',note:'30秒/组 · 4组8kcal',iconName:'hold'},
 {key:'situps',name:'仰卧起坐',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'仰卧起坐',note:'默认4组×15次',iconName:'training'},
 {key:'dumbbell',name:'哑铃',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'哑铃',note:'默认4组×15次',iconName:'training'},
 {key:'back',name:'臀桥及背部',unit:'次',value:60,step:20,max:6000,type:'strength',exercise:'背部运动',note:'默认4组×15次',iconName:'training'},
 {key:'bike',name:'自行车',unit:'分钟',value:20,step:20,max:480,type:'cardio',exercise:'自行车',note:'休闲骑行',iconName:'activity'},
 {key:'running',name:'跑步',unit:'分钟',value:20,step:20,max:480,type:'running',exercise:'跑步',note:'默认6.25km/h，按快走',iconName:'running'},
 {key:'steps',name:'走路',unit:'步',value:0,step:1000,max:100000,type:'walking',exercise:'走路',note:'记录当天总步数',iconName:'walking'},
 {key:'swim',name:'蛙泳',unit:'圈',value:20,step:1,max:300,type:'swimming',exercise:'蛙泳',note:'每圈50m，20圈约50分钟',iconName:'swimming'}
];
function defaultExerciseProfile(q){
 const w=Number(state.settings.weight)||65,min=met=>netEnergy(w,met,1);
 if(q.type==='strength')return {perSet:20,rate:min(q.key==='situps'?2.8:q.key==='back'?3.0:3.5)*3/60};
 if(q.type==='hold')return {perSet:30,rate:4};
 if(q.key==='elliptical')return {rate:min(4)};
 if(q.key==='running')return {rate:min(4.8)};
 if(q.key==='swim')return {rate:min(5.3)*2.5};
 if(q.type==='walking')return {rate:0.0007*w*0.5*1000};
 return {rate:min(3.5)};
}
function exerciseProfile(q){return defaultExerciseProfile(q)}
function profileCalories(q,n,p=exerciseProfile(q)){
 if(q.type==='hold')return Math.round(n*p.perSet/60*p.rate);
 if(q.type==='walking')return Math.round(n/1000*p.rate);
 return Math.round(n*p.rate);
}
function readQuickValues(){
 // Only the card defaults change. Do not touch existing workout records, settings,
 // or old quick-entry preferences in the user's browser storage.
 return Object.fromEntries(QUICK_ITEMS.map(q=>[q.key,q.value]));
}
const quickValues=readQuickValues();
function quickDraft(q,n){
 const d=emptyDraft(q.type),p=exerciseProfile(q);
 d.date=localDate();d.type=q.type;d.exercise=q.exercise;d.presetKey=q.key;
 if(q.type==='strength'){d.repsCount=n;d.sets='';d.repsPerSet=p.perSet;d.loadKg=''}
 else if(q.type==='swimming'){d.laps=n;d.durationMin='';d.distanceM=n*50;d.legacySwimming=false;}
 else if(q.type==='cardio')d.durationMin=n;
 else if(q.type==='running')d.durationMin=n;
 else if(q.type==='walking')d.steps=n;
 else if(q.type==='hold'){d.sets=n;d.secondsPerSet=p.perSet}
 return d;
}
function quickCalories(q,n,extra){return calc({...quickDraft(q,n),...(extra||{})})??0}


function stepInt(v){const n=Number(v);return Number.isInteger(n)&&n>=0&&n<=1000000?n:null}
function cleanStepDiary(raw){
 // Preserve numeric daily totals only. Interval deductions are discontinued.
 const out={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 for(const [date,entry] of Object.entries(raw)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!entry||typeof entry!=='object')continue;
  const total=stepInt(entry.total);
  if(total!==null)out[date]={total};
 }
 return out;
}
function saveDailySteps(total,date=localDate()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>localDate()||
   !Number.isInteger(total)||total<=0||total>1000000){
  toast('请输入有效的当天总步数');return false;
 }
 const prior=state;
 try{
  const existingRecords=state.records.filter(r=>r.date===date&&r.type==='walking');
  const latest=existingRecords.slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];
  const q=QUICK_ITEMS.find(x=>x.key==='steps');
  const rec=newRecord({...quickDraft(q,total),id:latest?.id||null,date});
  rec.note='步数 '+total+' 步';
  if(existingRecords.length>1){
   const key='fitness_step_records_before_total_v3_6_'+date;
   if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({
     date,records:existingRecords,stepDiary:state.stepDiary?.[date]||null,savedAt:new Date().toISOString()
   }));
  }
  state={...state,
   records:state.records.filter(r=>!(r.date===date&&r.type==='walking')).concat([rec]),
   stepDiary:{...(state.stepDiary||{}),[date]:{total}}};
  if(!persist()){state=prior;return false}
  wbOpenKey=null;render();
  toast(date+' 步数已更新：'+total.toLocaleString('zh-CN')+' 步');
  return true;
 }catch(e){state=prior;toast(e.message||'步数保存失败');return false}
}
const REST_DAYS_KEY='hermes_fitness_rest_days_v1';
function validRestDate(v){
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const d=dateFromISO(v);
 return !Number.isNaN(d.getTime())&&localDate(d)===v&&v<=localDate();
}
function readRestDays(){
 try{const a=JSON.parse(localStorage.getItem(REST_DAYS_KEY)||'[]');if(Array.isArray(a))return new Set(a.filter(validRestDate))}catch(e){}
 return new Set();
}
let restDays=readRestDays();
let calendarWindowEnd=localDate();
let calendarSelected=localDate();
function persistRestDays(next){
 try{localStorage.setItem(REST_DAYS_KEY,JSON.stringify([...next].sort()));return true}
 catch(e){toast('休息打卡保存失败：请检查浏览器存储');return false}
}
function dayKind(date){return recordsOfDate(date).length?'workout':restDays.has(date)?'rest':'none'}
function streakCount(){
 let d=dateFromISO(localDate());
 if(dayKind(localDate(d))==='none')d=addDays(d,-1);
 let count=0;
 while(count<3650&&dayKind(localDate(d))!=='none'){count++;d=addDays(d,-1)}
 return count;
}
function toggleRestDay(){
 const today=localDate();
 if(recordsOfDate(today).length){toast('今天已有训练记录，已自动打卡');return}
 const next=new Set(restDays),existing=next.has(today);
 if(existing)next.delete(today);else next.add(today);
 if(persistRestDays(next)){restDays=next;render();toast(existing?'已撤销今日休息打卡':'今日休息打卡成功（0 kcal）')}
}
function renderRestButton(){
 const today=localDate(),type=dayKind(today);
 if(type==='workout')return '<button type="button" class="rest-check-button" disabled>今日训练已打卡 ✓</button>';
 return '<button type="button" class="rest-check-button" data-rest-toggle="today">'+(type==='rest'?'撤销休息打卡':'今日休息打卡')+'</button>';
}
function renderCheckinStrip(){
 const week=getWeekDates(),streak=streakCount(),today=localDate();
 const active=week.filter(d=>dayKind(d)!=='none').length;
 return '<section class="checkin-strip" aria-label="本周打卡状态"><div class="checkin-strip-header"><strong>本周打卡 · '+active+'/7 天</strong><span class="checkin-calendar-label">本周</span></div>'+
 '<div class="checkin-week">'+week.map(d=>{
  const type=dayKind(d),num=Number(d.slice(-2)),day=dateFromISO(d);
  return '<div class="checkin-day '+type+(d===today?' today':'')+'"><span class="weekday">周'+['日','一','二','三','四','五','六'][day.getDay()]+'</span><span class="day-circle">'+num+'</span><span class="day-signal">'+(type==='workout'?'训练':type==='rest'?'休息':'—')+'</span></div>';
 }).join('')+'</div><div class="checkin-footer"><span>连续打卡 '+streak+' 天 · 运动自动计入打卡</span>'+renderRestButton()+'</div></section>';
}



function windowStreak(days){
 let i=days.length-1;if(i>=0&&dayKind(days[i])==='none')i--;
 let count=0;while(i>=0&&dayKind(days[i])!=='none'){count++;i--}return count;
}
function renderWeightTracker(){
  const today=localDate(),history=state.weightHistory||{},todayWeight=history[today];
  const hasTodayWeight=Number.isFinite(Number(todayWeight))&&Number(todayWeight)>0;
  const all=Object.entries(history).filter(([d,w])=>d<=today&&Number.isFinite(Number(w))&&Number(w)>0).sort((a,b)=>a[0].localeCompare(b[0]));
  const latest=all[all.length-1],recentStart=localDate(addDays(dateFromISO(today),-6));
  const recent=all.filter(([d])=>d>=recentStart);
  const recentDates=Array.from({length:7},(_,i)=>localDate(addDays(dateFromISO(today),i-6)));
  const hasFullWeek=recentDates.every(d=>Number.isFinite(Number(history[d]))&&Number(history[d])>0);
  const average=hasFullWeek?recentDates.reduce((n,d)=>n+Number(history[d]),0)/7:null;
  let chart='<p class="weight-empty">记录体重后，这里会显示最近7天的真实波动。</p>';
  if(recent.length){
    const values=recent.map(([,w])=>Number(w)),low=Math.min(...values),high=Math.max(...values);
    const pad=Math.max(.20,(high-low)*.2),min=low-pad,max=high+pad;
    const first=dateFromISO(recent[0][0]),last=dateFromISO(recent[recent.length-1][0]);
    const span=Math.max(1,Math.round((last-first)/86400000));
    const pts=recent.map(([d,w])=>{
      const dx=Math.round((dateFromISO(d)-first)/86400000);
      return {date:d,weight:Number(w),x:recent.length===1?150:26+dx/span*248,y:17+(max-Number(w))/(max-min)*40};
    });
    const coordinates=pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
    const shape=pts.length>1?'<polyline points="'+coordinates+'" fill="none" stroke="#a42e21" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>':'';
    const dots=pts.map(p=>'<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3.8" fill="'+(p.date===today?'#557a4b':'#a42e21')+'" stroke="#fff0c5" stroke-width="1.6"><title>'+p.date+' '+p.weight.toFixed(1)+' kg</title></circle>').join('');
    const valuesText=pts.map(p=>'<span aria-hidden="true" style="position:absolute;left:'+(p.x/300*100).toFixed(3)+'%;top:'+(Math.max(11,p.y-8)/68*100).toFixed(3)+'%;transform:translate(-50%,-85%);font-size:12px;line-height:1;font-weight:850;font-variant-numeric:tabular-nums;color:#78251d;white-space:nowrap;pointer-events:none">'+p.weight.toFixed(1)+'</span>').join('');
    chart='<div class="weight-chart"><div style="position:relative"><svg viewBox="0 0 300 68" preserveAspectRatio="none" role="img" aria-label="最近7天真实体重记录，共'+recent.length+'天">'+
      '<path d="M16 28H284 M16 55H284" stroke="#bb9260" stroke-width=".7" stroke-dasharray="3 4" opacity=".6"/>'+shape+dots+'</svg>'+valuesText+'</div>'+
      '<div class="weight-chart-labels"><span>'+formatDate(recent[0][0])+'</span><span>'+formatDate(recent[recent.length-1][0])+'</span></div></div>';
  }
  const status=hasFullWeek?'最近7日平均 '+average.toFixed(2)+' kg':'已记录 '+recent.length+'/7 天';
  const trend='<div class="weight-trend-top"><strong>最近7天体重</strong><span>'+status+'</span></div>';
  return '<section class="weight-board" aria-label="体重跟踪"><div class="weight-header"><h2>体重跟踪</h2><span>'+
    (hasTodayWeight?'今日已记录 '+Number(todayWeight).toFixed(1)+' kg':latest?'最近 '+Number(latest[1]).toFixed(1)+' kg · '+formatDate(latest[0]):'尚无记录')+'</span></div>'+
    (hasTodayWeight?'':'<form id="weightForm" class="weight-form"><label for="weightInput">今日体重</label>'+
    '<div class="weight-input"><input id="weightInput" name="weight" type="number" min="1" max="500" step="0.1" inputmode="decimal" placeholder="输入体重" value="'+(todayWeight??'')+'" required><span>kg</span></div>'+
    '<button type="submit">记录</button></form>')+
    trend+chart+'</section>';
}
function saveTodayWeight(form){
 const value=Number(form.elements.weight.value);
 if(!Number.isFinite(value)||value<=0||value>500){toast('请填写有效体重');return false}
 const prior=state;state={...state,settings:{...state.settings,weight:value},weightHistory:{...state.weightHistory,[localDate()]:value}};
 if(!persist()){state=prior;return false}render();toast('今日体重已保存');return true;
}
/* V5.11.0: Thirty consecutive dates, no padding blanks, clear month boundaries. */
function isGymTrainingRecord(r){
 const type=String(r.type||'');
 const exercise=String(r.exercise||r.stroke||'').trim();
 const preset=String(r.presetKey||'');
 if(type==='running'||type==='swimming')return true;
 if(type==='cardio')return !/^(自行车|骑行|户外骑行)$/.test(exercise);
 if(type==='strength'){
  if(['lat','row','fly'].includes(preset))return true;
  return /推胸|拉背|高位下拉|坐姿划船|器械划船|飞鸟及引体|引体向上|腿举|腿屈伸|蝴蝶机|夹胸/.test(exercise);
 }
 return false;
}
// Weekly totals: actual repetitions, static sets, minutes, distance and steps.
// No training advice or rolling targets. Do not modify any saved records.
function weeklyTrainingStats(records,stepDiary,end){
 const start=localDate(addDays(dateFromISO(end),-6));
 const rows=records.filter(r=>r.date>=start&&r.date<=end);
 const p=v=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):0;
 const name=r=>String(r.exercise||r.stroke||'');
 const key=r=>String(r.presetKey||'');
 const sum=(rs,f)=>rs.reduce((n,r)=>n+f(r),0);
 const fmt=n=>Number(n.toFixed(1)).toLocaleString('zh-CN');
 const match=(k,rx,r)=>key(r)===k||rx.test(name(r));
 const strength=(label,k,rx)=>{
  const rs=rows.filter(r=>r.type==='strength'&&match(k,rx,r));
  const count=sum(rs,r=>p(r.reps)||p(r.sets)*p(r.repsPerSet));
  const unknown=rs.some(r=>!p(r.reps)&&!(p(r.sets)&&p(r.repsPerSet)));
  return {label,value:fmt(count)+'次',detail:'',unknown};
 };
 const hold=rows.filter(r=>r.type==='hold'&&match('wall-sit',/靠墙|静蹲|平板/,r));
 const cardio=(label,k,rx)=>{
  const rs=rows.filter(r=>(r.type==='cardio'||r.type==='running')&&(match(k,rx,r)||(k==='running'&&r.type==='running'&&!name(r))));
  const min=sum(rs,r=>p(r.duration_min));
  const km=sum(rs,r=>!p(r.duration_min)?p(r.distance_km)||p(r.distance_m)/1000:0);
  return {label,value:fmt(min)+'分钟',detail:km?'另有旧里程 '+fmt(km)+'km':'',unknown:rs.some(r=>!p(r.duration_min)&&!p(r.distance_km)&&!p(r.distance_m))};
 };
 const swim=rows.filter(r=>r.type==='swimming');
 const meters=sum(swim,r=>p(r.distance_m)||p(r.laps)*50);
 const oldSwimMinutes=sum(swim,r=>!p(r.distance_m)&&!p(r.laps)?p(r.duration_min):0);
 let steps=0;
 for(let i=0;i<7;i++){
  const date=localDate(addDays(dateFromISO(start),i));
  const latest=rows.filter(r=>r.date===date&&r.type==='walking').sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];
  const saved=stepDiary?.[date]?.total;
  steps+=Number.isFinite(Number(saved))&&saved!==null&&saved!==undefined&&Number(saved)>=0?Number(saved):p(latest?.steps);
 }
 const items=[
  strength('拉背','lat',/拉背|高位下拉/),
  strength('划船','row',/划船/),
  strength('飞鸟及引体','fly',/飞鸟|引体/),
  strength('仰卧起坐','situps',/仰卧起坐|卷腹/),
  strength('臀桥及背部','back',/臀桥|背部运动/),
  strength('哑铃','dumbbell',/哑铃/),
  {label:'靠墙及平板',value:fmt(sum(hold,r=>p(r.sets)))+'组',detail:'',unknown:hold.some(r=>!p(r.sets))},
  cardio('跑步机','running',/跑步/),
  cardio('椭圆机','elliptical',/椭圆机/),
  {label:'游泳',value:fmt(meters)+'米',detail:oldSwimMinutes?'另有旧时长 '+fmt(oldSwimMinutes)+'分钟':'',unknown:swim.some(r=>!p(r.distance_m)&&!p(r.laps)&&!p(r.duration_min))},
  cardio('自行车','bike',/自行车|骑行/),
  {label:'走路',value:fmt(steps)+'步',detail:''}
 ];
 return {start,end,items,partial:items.some(x=>x.unknown||x.detail.startsWith('另有'))};
}
function renderWeeklyTrainingStats(end){
 const w=weeklyTrainingStats(state.records,state.stepDiary,end);
 const short=d=>Number(d.slice(5,7))+'.'+Number(d.slice(8));
 return '<section class="weight-board week-training" aria-label="最近7天训练统计"><div class="weight-header"><h2>7天训练统计</h2><span>'+short(w.start)+'—'+short(w.end)+'</span></div>'+
 '<div class="week-training-grid">'+w.items.map(x=>'<div class="week-training-item" title="'+safe(x.label+' '+x.value+(x.detail?' · '+x.detail:'')+(x.unknown?' · 部分记录无数量':''))+'"><span>'+safe(x.label)+'</span><strong>'+safe(x.value)+(x.unknown||x.detail?'*':'')+'</strong></div>').join('')+'</div>'+
 (w.partial?'<p class="week-training-note">* 部分旧记录缺少对应单位</p>':'')+'</section>';
}
function renderCalendar(){
 const today=localDate();
 const end=calendarWindowEnd>today?today:calendarWindowEnd;
 const start=localDate(addDays(dateFromISO(end),-20));
 const days=Array.from({length:21},(_,i)=>localDate(addDays(dateFromISO(start),i)));
 const recordsByDate=new Map();
 for(const r of state.records){
  if(r.date<start||r.date>end)continue;
  const entry=recordsByDate.get(r.date)||{count:0,kcal:0};
  entry.count++;
  entry.kcal+=Number(r.calories)||0;
  recordsByDate.set(r.date,entry);
 }
 const monthGroups=[];
 for(const date of days){
  const key=date.slice(0,7);
  const last=monthGroups[monthGroups.length-1];
  if(last&&last.key===key)last.count++;
  else monthGroups.push({key,month:Number(key.slice(5,7)),count:1});
 }
 const monthByKey=new Map(monthGroups.map((group,i)=>[group.key,i]));
 const checkins=days.filter(date=>recordsByDate.has(date)||restDays.has(date)).length;
 const workouts=days.filter(date=>recordsByDate.has(date)).length;
 const energy=days.reduce((sum,date)=>sum+(recordsByDate.get(date)?.kcal||0),0);
 const latest=end===today;
 const monthlyGuide=monthGroups.map((group,index)=>
  '<div class="cal30-month-segment '+(index%2?'even':'odd')+'" style="flex:'+group.count+
  '" title="'+group.month+'月 · '+group.count+'天"><strong>'+group.month+'月</strong>'+
  '<small>'+group.count+'天</small></div>'
 ).join('');
 const weekdays=['日','一','二','三','四','五','六'];
 const cells=days.map((date,i)=>{
  const record=recordsByDate.get(date),kcal=Math.round(record?.kcal||0);
  const isRest=!record&&restDays.has(date);
  const monthKey=date.slice(0,7),monthNum=Number(monthKey.slice(5,7));
  const isBoundary=i>0&&date.slice(0,7)!==days[i-1].slice(0,7);
  const num=Number(date.slice(8)),dayName=weekdays[dateFromISO(date).getDay()];
  const display=isBoundary?monthNum+'/'+num:String(num);
  const status=record?'workout '+(recordsOfDate(date).some(isGymTrainingRecord)?'gym-workout':'non-gym') :isRest?'rest':'empty';
  const level=kcal>=300?'high':kcal>=100?'medium':kcal>0?'light':'';
  const metric=record?kcal.toLocaleString('zh-CN')+'<small>kcal</small>':isRest?'休息':'—';
  const label=date+' 周'+dayName+'，'+(record?'消耗'+kcal+'千卡':isRest?'休息打卡':'无运动记录');
  return '<button type="button" class="cal30-day '+status+' '+level+
   ' month-'+(monthByKey.get(monthKey)%2?'even':'odd')+
   (isBoundary?' month-switch':'')+(date===today?' today':'')+
   (date===calendarSelected?' selected':'')+
   '" data-cal-date="'+date+'" aria-label="'+label+'">'+
   '<span class="cal30-date"><strong>'+display+'</strong><small>'+dayName+'</small></span>'+
   '<span class="cal30-kcal">'+metric+'</span></button>';
 }).join('');
 return '<div class="cal30-shell">'+
 '<section class="cal30-board" aria-label="最近21天连续运动记录">'+
 '<header class="cal30-header"><div class="cal30-heading"><h2>'+(latest?'最近21天':'连续21天')+
 '</h2><span>'+formatDate(start)+' — '+formatDate(end)+'</span></div>'+
 '<div class="cal30-actions"><button type="button" data-cal-shift="-7" aria-label="向前七天">‹</button>'+
 '<button type="button" data-cal-shift="7" aria-label="向后七天" '+(latest?'disabled':'')+'>›</button></div></header>'+
 '<div class="cal30-months" aria-label="月份分隔">'+monthlyGuide+'</div>'+
 '<div class="cal30-grid" role="group" aria-label="连续21天每日运动消耗">'+cells+'</div>'+
 '<footer class="cal30-footer" style="grid-template-columns:repeat(5,minmax(0,1fr))">'+
 '<div class="cal30-stat"><span>总消耗</span><strong>'+energy.toLocaleString('zh-CN')+'</strong><small>kcal</small></div>'+
 '<div class="cal30-stat"><span>运动</span><strong>'+workouts+'</strong><small>天</small></div>'+
 '<div class="cal30-stat"><span>打卡</span><strong>'+checkins+'</strong><small>天</small></div>'+
 '<div class="cal30-stat"><span>连续</span><strong>'+windowStreak(days)+'</strong><small>天</small></div>'+
 '<div class="cal30-stat" title="按当前日历总消耗 ÷ 7700 × 50% 估算，不代表实际减重"><span>等效消耗</span><strong>'+(energy/15400).toFixed(2)+'</strong><small>kg</small></div>'+
 '</footer>'+
 (!latest?'<button type="button" class="cal30-back" data-cal-today>回到最近21天</button>':'')+
 (latest&&dayKind(today)!=='workout'?'<div class="cal30-rest">'+renderRestButton()+'</div>':'')+
 '</section>'+renderWeightTracker()+renderWeeklyTrainingStats(end)+'</div>';
}


function quickOptions(q){
 if(q.key==='running')return [10,20,30,40,50,60,80,100,120];
 if(q.key==='elliptical')return [20,40,60];
 if(q.key==='swim')return [1,2,4,6,8,10,12,14,16,18,20,24,30,40,50,60,80,100];
 if(q.unit==='次')return [20,40,60,80,100,120,140,160,180,200,240,300];
 if(q.unit==='组')return Array.from({length:20},(_,i)=>i+1);
 if(q.key==='steps')return [1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,12000,15000,20000,25000,30000,40000];
 if(q.unit==='分钟')return [...Array.from({length:12},(_,i)=>(i+1)*10),150,180,240,300];
 return [];
}
/* V3.1: minimal home, correct local calendar date and day-by-day accounting. */
const WB_GROUPS=[
 {key:'daily',title:'日常',keys:['steps','situps','wall-sit']},
 {key:'cardio',title:'有氧',keys:['elliptical','bike','running']},
 {key:'strength',title:'力量',keys:['lat','row','fly','dumbbell','back']},
 {key:'swimming',title:'游泳',keys:['swim']}
];
let wbOpenKey=null;
let wbCalorieDetailOpen=false;
let wbBusy=false;
function wbMatches(q,r){
 if(q.key==='wall-sit')return r.type==='hold'&&(r.presetKey==='wall-sit'||['靠墙静蹲','平板支撑','靠墙及平板'].includes(r.exercise));
 if(q.key==='situps')return r.type==='strength'&&r.exercise==='仰卧起坐';
 if(q.key==='steps')return r.type==='walking';
 if(q.key==='running')return (r.type==='running'&&(r.exercise||'跑步')==='跑步')||(r.type==='cardio'&&r.exercise==='跑步');
 if(q.key==='swim')return r.type==='swimming'&&(r.stroke||r.exercise)==='蛙泳';
 return r.type===q.type&&(r.exercise||r.stroke)===q.exercise;
}
function wbToday(q,records){
 const list=records.filter(r=>wbMatches(q,r));
 if(!list.length)return {count:0,value:0,label:'0 '+q.unit,list};
 if(q.key==='steps'){
  const latest=list.slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];
  const total=stepInt(state.stepDiary?.[localDate()]?.total)??(Number(latest?.steps)||0);
  return {count:list.length,value:total,label:total.toLocaleString('zh-CN')+' 步',list};
 }
 const oldTimedSwims=q.key==='swim'?list.filter(r=>!(Number(r.laps)>0)).length:0;
 const oldDistanceRuns=q.key==='running'?list.filter(r=>!(Number(r.duration_min)>0)&&Number(r.distance_km)>0).length:0;
 const amount=list.reduce((sum,r)=>sum+(q.key==='swim'?(Number(r.laps)||0):
  q.type==='cardio'||q.type==='running'?(Number(r.duration_min)||0):
  q.type==='strength'?(Number(r.reps)||((Number(r.sets)||0)*(Number(r.repsPerSet)||15))):
  (Number(r.sets)||0)),0);
 const value=amount;
 const label=q.key==='swim'
  ?(value?value+' 来回 · '+(value*50).toLocaleString('zh-CN')+' 米':'0 来回')+(oldTimedSwims?' · '+oldTimedSwims+' 笔旧记录':'')
  :q.key==='running'?(value+' 分钟'+(oldDistanceRuns?' · '+oldDistanceRuns+' 笔旧里程':''))
  :value?value.toLocaleString('zh-CN')+' '+q.unit:list.length+' 笔';
 return {count:list.length,value,label,list};
}
function wbDelta(q,dir){
 if(q.key==='wall-sit')return 1;
 if(q.key==='swim'&&dir<0)return 5;
 if(q.type==='strength')return dir>0?60:20;
 if(q.key==='running'||q.key==='elliptical')return dir>0?20:10;
 return q.step;
}

function wbEditor(q){
 // Defaults are proposed values, saved only after user confirmation.
 const unit=q.unit;
 const info=wbToday(q,recordsOfDate(localDate()));
 const v=q.key==='steps'?(info.count?info.value:''):q.value;
 const completedCalories=info.list.reduce((n,r)=>n+(Number(r.calories)||0),0);
 const header=q.key==='steps'?'今日已有 '+info.label+' · '+completedCalories+' kcal · 输入当天总步数':
  '今日已累计 '+info.label+' · '+completedCalories+' kcal · 以下只记录本次新增';
 const extra=q.key==='swim'?'<div style="display:grid;gap:8px;margin:10px 0"><label>本次总分钟（选填）<input class="input" type="number" name="wb-minutes" min="0" step="0.5" placeholder="不填按每圈2.5分钟推算"></label><label>其中休息分钟<input class="input" type="number" name="wb-rest" min="0" step="0.5" value="0"></label></div>':
  q.key==='running'?'<div style="margin:10px 0"><label>跑步机速度 km/h（坡度0%，按快走）<input class="input" type="number" name="wb-speed" min="3" max="7.1" step="0.05" value="6.25"></label></div>':'';
 return '<form class="wb-editor" data-wb-form="'+q.key+'" novalidate>'+
  '<div class="wb-editor-title"><strong>'+safe(q.name)+'</strong>'+
  '<button type="button" class="wb-editor-close" data-wb-close aria-label="关闭">×</button></div>'+
  '<div class="wb-editor-meta">'+safe(header)+'</div>'+
  '<label class="wb-editor-entry-label" for="wb-count-'+q.key+'">'+(q.key==='steps'?'今日总步数':'本次新增')+'</label>'+
  '<div class="wb-editor-controls"><button type="button" data-wb-step="-1" aria-label="减少'+wbDelta(q,-1)+unit+'">−</button>'+
  '<div class="wb-editor-number"><input id="wb-count-'+q.key+'" type="number" name="wb-count" inputmode="numeric" step="'+q.step+'" min="0" max="'+q.max+'" value="'+v+'" aria-label="'+safe(q.name)+'本次数量"><span data-wb-quantity-unit>'+unit+'</span></div>'+
  '<button type="button" data-wb-step="1" aria-label="增加'+wbDelta(q,1)+unit+'">＋</button></div>'+
  extra+'<div class="wb-editor-help" data-wb-preview>'+safe(wbPreviewText(q,v))+'</div>'+
  '<button type="submit" class="wb-save">'+(q.key==='steps'?'更新今日累计步数':'保存本次新增')+'</button></form>';
}
function wbRow(q,recs){
 const info=wbToday(q,recs);
 const amount=info.count?info.label:'0 '+q.unit;
 // Sum the exact stored per-session kcal, rather than rounding the combined quantity.
 // This keeps each row consistent with Today's total and historical records.
 const calories=info.list.reduce((n,r)=>n+(Number(r.calories)||0),0);
 return '<div class="wb-row" data-wb-row="'+q.key+'">'+
  '<button type="button" class="wb-entry" data-wb-open="'+q.key+'" aria-label="'+safe(q.name+' 今日 '+amount+'，'+calories+' kcal')+'">'+
   '<span class="wb-entry-icon">'+icon(q.iconName,17)+'</span>'+
   '<span class="wb-entry-name">'+safe(q.name)+'</span>'+
   '<span class="wb-entry-value'+(info.count?' is-done':'')+'">'+
    '<span class="wb-entry-amount">'+(info.count?'✓ ':'')+safe(amount)+'</span>'+
    '<span class="wb-entry-kcal">'+calories.toLocaleString('zh-CN')+' kcal</span></span>'+
   '<span class="wb-entry-action">›</span></button></div>';
}

function wbTodayDetailPanel(recs){
 const ordered=[...recs].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const total=totalRecs(recs);
 const rows=ordered.map(r=>
  '<div class="wb-calorie-item">'+
  '<span class="wb-calorie-activity"><strong>'+safe(recordName(r))+'</strong>'+
  '<small>'+safe(recordDescription(r))+'</small></span>'+
  '<span class="wb-calorie-number">'+(Number(r.calories)||0).toLocaleString('zh-CN')+' kcal</span>'+
  '</div>'
 ).join('');
 return '<div class="wb-modal wb-calorie-modal"><button type="button" class="wb-modal-backdrop" data-wb-cal-close aria-label="关闭热量明细"></button>'+
 '<section class="wb-modal-sheet wb-calorie-sheet" role="dialog" aria-modal="true" aria-label="今日热量明细">'+
 '<div class="wb-calorie-head"><strong>今日热量明细</strong>'+
 '<button type="button" data-wb-cal-close aria-label="关闭">×</button></div>'+
 (ordered.length?'<div class="wb-calorie-rows">'+rows+'</div>':'<p class="wb-calorie-empty">今天暂无运动记录</p>')+
 '<div class="wb-calorie-total"><span>今日合计</span><strong>'+total.toLocaleString('zh-CN')+' kcal</strong></div>'+
 '</section></div>';
}
function wbToggleCalorieDetail(open){
 const main=document.querySelector('.main'),scroll=main?.scrollTop||0,windowScroll=window.scrollY;
 wbCalorieDetailOpen=!!open;
 if(open)wbOpenKey=null;
 render();
 if(main)main.scrollTop=scroll;
 window.scrollTo(0,windowScroll);
}




/* V5.5: the approved no-soldiers, black-and-gold gothic one-screen composition. */
const IF6_ORDER=['steps','situps','wall-sit','elliptical','bike','running','lat','row','fly','dumbbell','back','swim'];

/* V5.10 — Astra Militarum trained personnel icons from approved banner artwork.
   Single optimized 4x3 WebP sprite; keys correspond to existing exercises.
   Data and actions remain DOM-driven, image is purely decorative. */
/* V5.18: explicit image loading allows broken-image detection and avoids CSS pseudo-content conflicts. */
const IF18_IMAGES={"steps":"exercise-steps.webp","situps":"exercise-situps-fixed.webp","wall-sit":"exercise-wall-sit.webp","elliptical":"exercise-elliptical.webp","bike":"exercise-bike.webp","running":"exercise-running.webp","lat":"exercise-lat.webp","row":"exercise-row-fixed.webp","fly":"exercise-fly.webp","dumbbell":"exercise-dumbbell.webp","back":"exercise-back.webp","swim":"exercise-swim.webp"};
function if6ExerciseIcon(q){
 const key=IF6_ORDER.includes(q.key)?q.key:'steps';
 return '<img class="if18-figure" src="./art/'+IF18_IMAGES[key]+'?v=5.18.0" alt="" loading="eager" decoding="async" />';
}

const IF6_FLAME='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.4 1.5c1.7 4.8-2.1 5.9.9 9.3 2.4-1.8 2.6-4.5 2.6-4.5 2.6 3.7 5 8.1 3.5 13.2-1 4.5-4.4 7.4-9.3 7.4-5.4 0-9-3.3-9-8.4 0-4.4 2-7.4 5.3-10.5-.5 3.1.9 5.6 2 6.2C12 8.9 10.7 4.4 12.4 1.5Z"/></svg>';
const IF6_CREST='<svg viewBox="0 0 114 26" aria-hidden="true"><g><path d="M3 6h41l9 9H20zM111 6H70l-9 9h33zM13 16h38l4 6H31zM101 16H63l-4 6h24z"/><circle cx="57" cy="12" r="10"/><path d="M52 18v5h10v-5" fill="#a77a36"/><circle cx="53.5" cy="11" r="2" fill="#191714" stroke="none"/><circle cx="60.5" cy="11" r="2" fill="#191714" stroke="none"/><path d="m57 13-2 3h4z" fill="#191714" stroke="none"/></g></svg>';
function if6Tile(q,info,calories){
 const amount=Number(info.value)||0;
 const kcalText=calories.toLocaleString('zh-CN');
 const kcalDensity=kcalText.length>7?' kcal-very-long':kcalText.length>5?' kcal-long':'';
 const label=amount.toLocaleString('zh-CN');
 const displayUnit=q.unit;
 const wide=label.length>=5;
 return '<button type="button" class="if6-card'+(info.count?' is-done':'')+'" data-wb-open="'+q.key+
 '" aria-label="'+safe(q.name)+'，今日 '+label+' '+safe(displayUnit)+'，消耗'+calories.toLocaleString('zh-CN')+'千卡">'+
 '<span class="if6-icon">'+if6ExerciseIcon(q)+'</span>'+
 '<span class="if6-card-name">'+safe(q.name)+'</span>'+
 '<span class="if6-quantity'+(wide?' long':'')+'"><strong>'+label+'</strong><small>'+safe(displayUnit)+'</small></span>'+
 '<span class="if6-energy'+kcalDensity+'"><span class="if6-energy-content">'+IF6_FLAME+'<strong>'+kcalText+'</strong><em>kcal</em></span></span></button>';
}

/* V5.38 — daily eating-window log. End = planned 8h window, never an assertion of a finished fast. */
const EAT_MS=8*60*60*1000;
let eatEditOpen=false;
function eatClock(ms){const d=new Date(ms);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function eatEnd(w,day){
 const end=w.startAt+EAT_MS;
 return (localDate(new Date(end))===day?'':'次日')+eatClock(end);
}
/* The red phase represents a planned eating-window boundary, not proof of fasting. */
function eatDisplayPoint(ms,referenceDay){
 const d=localDate(new Date(ms));
 const yesterday=localDate(addDays(dateFromISO(referenceDay),-1));
 const prefix=d===referenceDay?'':d===yesterday?'昨':d.slice(5).replace('-','/')+' ';
 return prefix+eatClock(ms);
}
function eatPhaseData(now=Date.now()){
 const day=localDate(new Date(now)),entries=state.eatingWindows||{};
 const own=entries[day];
 // A completed 8-hour window remains in its red phase until the NEXT actual
 // first-meal tap, regardless of midnight, 24 hours, or longer gaps.
 // Pick the most recently recorded first meal, including records older than yesterday.
 const record=Object.values(entries).filter(w=>w&&Number.isSafeInteger(w.startAt)&&w.startAt<=now)
   .sort((a,b)=>b.startAt-a.startAt)[0];
 if(!record)return {day,kind:'idle',own:!!own};
 const end=record.startAt+EAT_MS;
 if(now<end)return {day,kind:'eating',own:!!own,from:record.startAt,to:end};
 return {day,kind:'fasting',own:!!own,from:end};
}
function renderEatStrip(){
 const phase=eatPhaseData(),day=phase.day;
 const own=state.eatingWindows?.[day];
 const label='进食窗口';
 const time=phase.kind==='idle'?'':'<span class="if6-eat-time">'+eatDisplayPoint(phase.from,day)+
  '<i>—</i>'+(phase.kind==='fasting'?'现在':eatDisplayPoint(phase.to,day))+'</span>';
 const status=phase.kind==='fasting'?'禁食时段':'进食中';
 const button=own?'<button class="if6-eat-action subtle" type="button" data-eating-edit>调整</button>':
  '<button class="if6-eat-action" type="button" data-eating-start>开始进食</button>';
 const details=phase.kind==='idle'?
  '<span class="if6-eat-placeholder">第一餐时记录时间</span>'+button:
  time+'<span class="if6-eat-status" data-eating-status>'+status+'</span>'+button;
 return '<section class="if6-eat'+(phase.kind==='fasting'?' is-fasting':'')+
  '" data-eating-phase="'+phase.kind+'" data-eating-day="'+day+
  '" aria-label="16比8进食时间记录，'+(phase.kind==='fasting'?'计划禁食时段':phase.kind==='eating'?'进食窗口内':'尚未开始')+'">'+
  '<span class="if6-eat-title"><strong>'+label+'</strong><small>16:8</small></span>'+
  '<div class="if6-eat-details">'+details+'</div></section>';
}
function renderEatDialog(){
 if(!eatEditOpen)return '';
 const day=localDate(),today=state.eatingWindows?.[day];
 const recent=Object.entries(state.eatingWindows||{}).filter(([d])=>d<=day).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7);
 const history=recent.length?recent.map(([d,w])=>'<div class="if6-eat-history-row"><span>'+formatDate(d)+'</span><strong>'+eatClock(w.startAt)+'—'+eatEnd(w,d)+'</strong></div>').join(''):'<p>暂无历史记录</p>';
 return '<div class="if6-eat-overlay">'+
  '<button class="if6-eat-backdrop" type="button" data-eating-close aria-label="关闭调整面板"></button>'+
  '<div class="if6-eat-sheet" role="dialog" aria-modal="true" aria-labelledby="eat-title">'+
   '<h2 id="eat-title">进食时间</h2>'+
   '<p>只记录第一口食物的实际时间；结束时间自动按 8 小时计算。</p>'+
   '<form id="eatingTimeForm"><label for="eatingStartTime">今日开始时间</label>'+
    '<input id="eatingStartTime" type="time" required value="'+eatClock(today?.startAt??Date.now())+'">'+
    '<div class="if6-eat-form-actions"><button type="button" data-eating-close>取消</button><button type="submit">保存</button></div>'+
   '</form>'+
   (today?'<button type="button" data-eating-remove class="if6-eat-remove">撤销今日打卡</button>':'')+
   '<div class="if6-eat-history"><h3>最近 7 次记录</h3>'+history+'</div>'+
   '<p class="if6-eat-footnote">时间是计划窗口，不是禁食完成证明；窗口外可以正常喝水。</p>'+
  '</div></div>';
}
function saveEatTime(time){
 const day=localDate(),ms=Math.trunc(time);
 if(!Number.isSafeInteger(ms)||localDate(new Date(ms))!==day||ms>Date.now()+60000){
  toast('只能记录今天已经发生的进食时间');return false;
 }
 const old=state.eatingWindows||{};
 state.eatingWindows={...old,[day]:{startAt:ms}};
 if(!persist()){state.eatingWindows=old;return false}
 eatEditOpen=false;render();toast('进食开始时间已保存');return true;
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-eating-start]')){saveEatTime(Date.now());return}
 if(e.target.closest('[data-eating-edit]')){eatEditOpen=true;render();document.getElementById('eatingStartTime')?.focus();return}
 if(e.target.closest('[data-eating-close]')){eatEditOpen=false;render();return}
 if(e.target.closest('[data-eating-remove]')){
  if(!confirm('确定撤销今天的进食打卡吗？'))return;
  const old=state.eatingWindows||{},next={...old};delete next[localDate()];
  state.eatingWindows=next;
  if(!persist()){state.eatingWindows=old;return}
  eatEditOpen=false;render();toast('今日记录已撤销');
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='eatingTimeForm')return;
 e.preventDefault();
 const value=e.target.querySelector('#eatingStartTime')?.value;
 if(!/^\d{2}:\d{2}$/.test(value||'')){toast('请输入有效的时间');return}
 const [hours,minutes]=value.split(':').map(Number);
 if(hours>23||minutes>59){toast('时间格式有误');return}
 const dt=new Date();dt.setHours(hours,minutes,0,0);
 saveEatTime(dt.getTime());
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&eatEditOpen){eatEditOpen=false;render()}});
function refreshEatingPhase(){
 if(document.hidden||view!=='overview')return;
 // Keep the global day-guard in sync with the visible dashboard. Otherwise a
 // new-day first-meal tap can be silently cancelled as a "yesterday" action.
 if(refreshLocalCalendarDay())return;
 const element=document.querySelector('.if6-eat');if(!element)return;
 const next=eatPhaseData();
 if(element.dataset.eatingPhase!==next.kind||element.dataset.eatingDay!==next.day)
  element.outerHTML=renderEatStrip();
}
setInterval(refreshEatingPhase,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshEatingPhase()});

function renderQuickHome(){
 const today=localDate(),records=recordsOfDate(today);
 const dayTotal=totalRecs(records);
 const tiles=IF6_ORDER.map(key=>{
  const item=QUICK_ITEMS.find(q=>q.key===key);
  const info=wbToday(item,records);
  const calories=totalRecs(info.list);
  return {item,info,calories};
 }).sort((a,b)=>b.calories-a.calories);
 const weeklyDays=new Set(getWeekDates()),weekly=totalRecs(state.records.filter(r=>weeklyDays.has(r.date)));
 const target=Number(state.settings.weeklyGoal)>0?Number(state.settings.weeklyGoal):1500;
 const percentage=Math.round(100*weekly/target);
 const fill=Math.max(0,Math.min(100,100*weekly/target));
 // Layout-only numeric sizing: preserves actual calorie totals and calculations.
 const todayText=dayTotal.toLocaleString('zh-CN');
 const totalChars=todayText.length;
 const todayFont=totalChars<=2?36:totalChars===3?31:totalChars<=5?25:totalChars<=7?19:15;
 const percentText=String(percentage)+'%';
 const percentFont=percentText.length<=3?25:percentText.length===4?21:percentText.length===5?18:15;
 return '<div class="if6-home">'+
 '<header class="if6-head">'+
 '<span class="if6-banner" aria-hidden="true"></span>'+
 '<div class="if6-brand"><h1>外勤日志</h1><span class="if6-brand-date">'+safe(formatDate(today).replace(/-/g,'.'))+'</span>'+
 '<span class="if6-legion" lang="la">PRO IMPERATORE</span></div></header>'+
 '<section class="if6-stats" aria-label="今日消耗与本周进度"><span class="if6-stat-crest">'+IF6_CREST+'</span>'+
 '<button type="button" class="if6-stat-today" data-wb-cal-open aria-label="今日消耗 '+dayTotal+' 千卡，查看明细">'+
 '<span class="if6-stat-label">今日消耗</span><span class="if6-stat-amount" style="--today-fit:'+todayFont+'px"><strong>'+todayText+'</strong><small>kcal</small></span></button>'+
 '<span class="if6-stat-divider" aria-hidden="true"></span>'+
 '<div class="if6-stat-week"><div class="if6-week-upper"><span class="if6-stat-label">本周进度</span><strong class="if6-week-percent" style="--week-fit:'+percentFont+'px">'+percentText+'</strong></div>'+
 '<span class="if6-week-cal">'+weekly.toLocaleString('zh-CN')+' / '+target.toLocaleString('zh-CN')+' kcal</span>'+
 '<div class="if6-track" role="progressbar" aria-label="本周热量目标完成进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.min(100,Math.max(0,percentage))+'"><span class="if6-track-fill" style="width:'+fill.toFixed(1)+'%"></span></div></div></section>'+
 renderEatStrip()+
 '<section class="if6-grid" aria-label="今日十二项运动">'+tiles.map(({item,info,calories})=>if6Tile(item,info,calories)).join('')+'</section></div>'+
 renderEatDialog()+
 (wbCalorieDetailOpen?wbTodayDetailPanel(records):wbOpenKey?
 '<div class="wb-modal"><button type="button" class="wb-modal-backdrop" data-wb-close aria-label="关闭操作面板"></button>'+
 '<div class="wb-modal-sheet" role="dialog" aria-modal="true" aria-label="记录运动">'+wbEditor(QUICK_ITEMS.find(q=>q.key===wbOpenKey))+'</div></div>':'');
}

function wbQuantityValid(q,n){
 if(!q||!Number.isFinite(n)||n<=0||n>q.max)return false;
 return Number.isInteger(n);
}
function wbPreviewText(q,n,extra){
 const info=wbToday(q,recordsOfDate(localDate()));
 if(!wbQuantityValid(q,n))return '本次 0 '+q.unit+' · 请填写实际完成量';
 if(q.key==='steps')return '今日步数：'+n.toLocaleString('zh-CN')+' 步';
 const next=info.value+n;
 const km=q.key==='swim'?' · 本次 '+(n*50)+' 米':'';
 if(q.key==='wall-sit')return '本次靠墙及平板'+' '+n+'组 × 30秒 · 记账热量 '+quickCalories(q,n,extra)+' kcal（自定义估算）；保存后该类累计 '+next+'组';
 return '本次新增 '+n+' '+q.unit+km+' · 额外热量约 '+quickCalories(q,n,extra)+' kcal（估算）；保存后今日累计 '+next+' '+q.unit;
}
function wbSave(q,n,extra){
 if(wbBusy)return false;
 if(!wbQuantityValid(q,n)){toast('请填写大于0的有效本次运动量');return false}
 if(q.key==='steps'){wbOpenKey=null;return saveDailySteps(n)}
 wbBusy=true;
 try{
  const record=newRecord({...quickDraft(q,n),...(extra||{})});
  state.records.push(record);
  if(!persist()){state.records.pop();return false}
  const cumulative=wbToday(q,recordsOfDate(record.date));
  wbOpenKey=null;render();
  const actualName=q.name;
  const actualUnit=q.unit;
  toast('本次新增 '+actualName+' '+n+actualUnit+'；今日该类累计 '+cumulative.label);
  return true;
 }catch(err){toast(err.message||'保存失败');return false}
 finally{wbBusy=false}
}
function wbExtra(form){
 const extra={},read=n=>form.querySelector('[name="'+n+'"]')?.value;
 if(form.dataset.wbForm==='swim'){
  const min=read('wb-minutes'),rest=read('wb-rest');
  if(min!==undefined&&min!=='')extra.durationMin=Number(min);
  if(rest!==undefined&&rest!=='')extra.restMin=Number(rest);
 }
 if(form.dataset.wbForm==='running'){
  const speed=read('wb-speed');if(speed!==undefined&&speed!=='')extra.speedKmh=Number(speed);
 }
 if(form.dataset.wbForm==='wall-sit'){
  extra.exercise='靠墙及平板';
  extra.secondsPerSet=30;
 }
 return extra;
}
function wbPreview(form){
 const q=QUICK_ITEMS.find(x=>x.key===form?.dataset.wbForm);
 const input=form?.querySelector('[name="wb-count"]'),el=form?.querySelector('[data-wb-preview]');
 if(!q||!input||!el)return;
 el.textContent=wbPreviewText(q,input.value===''?0:Number(input.value),wbExtra(form));
}
function wbSetModalKey(key){
 const main=document.querySelector('.main'),mainScroll=main?.scrollTop||0,windowScroll=window.scrollY;
 wbCalorieDetailOpen=false;wbOpenKey=key;render();
 if(main)main.scrollTop=mainScroll;
 window.scrollTo(0,windowScroll);
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(wbCalorieDetailOpen)wbToggleCalorieDetail(false);else if(wbOpenKey)wbSetModalKey(null)}});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-wb-cal-open]')){wbToggleCalorieDetail(true);return}
 if(e.target.closest('[data-wb-cal-close]')){wbToggleCalorieDetail(false);return}
 const open=e.target.closest('[data-wb-open]');
 if(open){wbSetModalKey(wbOpenKey===open.dataset.wbOpen?null:open.dataset.wbOpen);return}
 if(e.target.closest('[data-wb-close]')){wbSetModalKey(null);return}
 const step=e.target.closest('[data-wb-step]');
 if(step){
  const form=step.closest('[data-wb-form]'),q=QUICK_ITEMS.find(x=>x.key===form?.dataset.wbForm),input=form?.querySelector('[name="wb-count"]');
  if(!q||!input)return;
  const n=Number(input.value),current=input.value!==''&&Number.isFinite(n)?n:0;
  const dir=Number(step.dataset.wbStep);
  const newValue=Math.max(0,Math.min(q.max,current+dir*wbDelta(q,dir)));
  input.value=String(newValue);
  wbPreview(form);return;
 }
 const undo=e.target.closest('[data-wb-undo]');
 if(undo){
  const rec=state.records.find(x=>x.id===undo.dataset.wbUndo&&x.date===localDate());
  if(!rec||!confirm('撤销「'+recordName(rec)+'」'+recordDescription(rec)+'？'))return;
  const old=state.records;
  state.records=old.filter(r=>r.id!==rec.id);
  if(!persist()){state.records=old;return}
  render();toast('已撤销该笔记录');
 }
});
document.addEventListener('input',e=>{
 const input=e.target.closest('[data-wb-form] [name="wb-count"], [data-wb-form] [name="wb-minutes"], [data-wb-form] [name="wb-rest"], [data-wb-form] [name="wb-speed"]');
 if(input)wbPreview(input.closest('[data-wb-form]'));
});
document.addEventListener('submit',e=>{
 const form=e.target.closest('[data-wb-form]');if(!form)return;
 e.preventDefault();
 const q=QUICK_ITEMS.find(x=>x.key===form.dataset.wbForm);
 const input=form.querySelector('[name="wb-count"]');
 wbSave(q,input?.value===''?NaN:Number(input?.value),wbExtra(form));
});

function quickUpdateEstimate(form){
 const q=QUICK_ITEMS.find(item=>item.key===form?.dataset.qForm);if(!q)return;
 const input=form.querySelector('[name="q-value"]');
 const val=Number(input?.value);const el=form.querySelector('[data-q-est]');
 if(el){const net=val;el.textContent=Number.isInteger(val)&&val>0&&val<=q.max?quickCalories(q,net):'—'}
 const distance=form.querySelector('[data-q-distance]');
 if(distance)distance.textContent=input?.value!==''&&Number.isInteger(val)&&val>0?'共 '+val*50+' 米':'— 米';
}
function syncQuickChoice(form,value,keepCustom=false){
 const q=QUICK_ITEMS.find(x=>x.key===form?.dataset.qForm);if(!q)return;
 const input=form.querySelector('[name="q-value"]'),picker=form.querySelector('[data-q-select]');
 if(!input)return;
 input.value=String(value);
 if(picker){const preset=quickOptions(q).includes(value);form.classList.toggle('is-custom',keepCustom||!preset);picker.value=preset&&!keepCustom?String(value):'custom';}
 quickUpdateEstimate(form);
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-q-step]');if(!btn)return;
 const q=QUICK_ITEMS.find(x=>x.key===btn.dataset.qStep),form=btn.closest('[data-q-form]');if(!q||!form)return;
 const input=form.querySelector('[name="q-value"]');
 const parsed=Number(input.value);
 const current=input.value!==''&&Number.isFinite(parsed)?parsed:q.value;
 const step=q.unit==='分钟'?10:q.step;
 // Card buttons and the numeric input spinner advance durations in 10-minute steps.
 syncQuickChoice(form,Math.max(q.unit==='分钟'?10:1,Math.min(q.max,current+Number(btn.dataset.direction)*step)));
});
document.addEventListener('change',e=>{
 if(e.target.id==='historyQuickExercise'){
  const q=QUICK_ITEMS.find(x=>x.key===e.target.value);if(!q)return;
  const wrap=document.getElementById('historyQuickAmountWrap');
  wrap.classList.remove('is-custom');wrap.innerHTML=renderHistoryQuickAmount(q);
  return;
 }
 if(e.target.id==='historyQuickAmount'){
  const wrap=document.getElementById('historyQuickAmountWrap');
  wrap.classList.toggle('is-custom',e.target.value==='custom');
  if(e.target.value==='custom')document.getElementById('historyQuickCustom')?.focus();
  return;
 }
 const picker=e.target.closest('[data-q-select]');if(!picker)return;
 const form=picker.closest('[data-q-form]');if(!form)return;
 if(picker.value==='custom'){
  const input=form.querySelector('[name="q-value"]');
  form.classList.add('is-custom');
  input?.focus();input?.select();return;
 }
 syncQuickChoice(form,Number(picker.value));
});
document.addEventListener('input',e=>{
 const input=e.target.closest('[data-q-form] [name="q-value"]');
 if(input){quickUpdateEstimate(input.closest('[data-q-form]'));}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='historyQuickForm'){e.preventDefault();saveHistoryQuickForm(e.target);return}
 if(e.target.id==='weightForm'){e.preventDefault();saveTodayWeight(e.target);return}
 

 const form=e.target.closest('[data-q-form]');if(!form)return;
 e.preventDefault();
 const q=QUICK_ITEMS.find(x=>x.key===form.dataset.qForm),n=Number(form.querySelector('[name="q-value"]').value);
 if(!q||!Number.isInteger(n)||n<1||n>q.max){toast('请填写有效的'+(q?.unit||'训练数量'));return}
 if(q.key==='steps'){saveDailySteps(n);return}
 try{
   const record=newRecord(quickDraft(q,n));
   state.records.push(record);
   if(!persist()){state.records.pop();return}
   // Return to fixed defaults after saving; the recorded workout remains stored.
   render();
   toast('已记录 '+q.name+' · '+record.calories+' kcal');
 }catch(err){toast(err.message||'保存失败')}
});

document.addEventListener('click',e=>{
 const allHistory=e.target.closest('[data-history-all]');if(allHistory){historySelectedDate=null;render();return}

 const day=e.target.closest('[data-cal-date]');
 if(day){historySelectedDate=day.dataset.calDate;view='history';render();window.scrollTo({top:0,behavior:'instant'});return}
 const shift=e.target.closest('[data-cal-shift]');
 if(shift){
  const direction=Number(shift.dataset.calShift);
  if(direction!==7&&direction!==-7)return;
  const next=localDate(addDays(dateFromISO(calendarWindowEnd),direction));
  calendarWindowEnd=next>localDate()?localDate():next;
  calendarSelected=calendarWindowEnd;
  render();return;
 }
 if(e.target.closest('[data-cal-today]')){
  calendarWindowEnd=localDate();calendarSelected=calendarWindowEnd;render();return;
 }
 if(e.target.closest('[data-rest-toggle]')){toggleRestDay();return}
});
document.addEventListener('click',e=>{const viewBtn=e.target.closest('[data-view]');if(viewBtn){if(viewBtn.dataset.view==='history')historySelectedDate=null;switchView(viewBtn.dataset.view);return}const categoryBtn=e.target.closest('[data-category]');if(categoryBtn){const next=categoryBtn.dataset.category;if(next===draft.type)return;draft={...emptyDraft(next),id:draft.id,date:draft.date};render();return}const planBtn=e.target.closest('[data-plan]');if(planBtn){const [day,index]=planBtn.dataset.plan.split('-').map(Number);startPlan(day,index);return}const filterBtn=e.target.closest('[data-filter]');if(filterBtn){historyFilter=filterBtn.dataset.filter;render();return}const editBtn=e.target.closest('[data-edit]');if(editBtn){startEdit(editBtn.dataset.edit);return}const delBtn=e.target.closest('[data-delete]');if(delBtn){const item=state.records.find(r=>r.id===delBtn.dataset.delete);if(!item)return;if(confirm(`删除 ${item.date} 的「${recordName(item)}」记录？`)){const previous=state.records;state.records=state.records.filter(r=>r.id!==item.id);if(!persist()){state.records=previous;return}render();toast('记录已删除')}return}const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;switch(action){case 'reset-draft':draft=emptyDraft();render();break;case 'save-settings':saveSettings();break;case 'save-exercise-config':saveExerciseProfiles();break;case 'export-json':exportJSON();break;case 'export-csv':exportCSV();break;case 'import-json':document.getElementById('importFile').click();break;case 'restore-snapshot':restoreFitnessSnapshot();break;case 'export-raw':exportRawFitnessData();break}});
document.addEventListener('input',e=>{const card=e.target.closest('[data-exercise-config]');if(card)updateExercisePreview(card,e.target);});
document.addEventListener('input',e=>{if(e.target.closest('#recordForm')){pullForm();updatePreview()}});
document.addEventListener('submit',e=>{if(e.target.id!=='recordForm')return;e.preventDefault();pullForm();try{const rec=newRecord(draft);const index=state.records.findIndex(r=>r.id===rec.id);const previous=state.records.slice();if(index>=0)state.records[index]=rec;else state.records.push(rec);if(!persist()){state.records=previous;return}draft=emptyDraft('strength');switchView('overview');toast(index>=0?'记录修改已保存':'训练已记录，统计已更新')}catch(err){toast(err.message)}});
document.getElementById('importFile').addEventListener('change',e=>{importJSONFile(e.target.files[0]);e.target.value=''});
/* The current day changes at the device's LOCAL 00:00, not at UTC midnight.
   Keep historical records as-is; only refresh the current-day view. */
let displayedLocalDay=localDate();
let localMidnightTimer=null;
function refreshLocalCalendarDay(){
 const today=localDate();
 if(today===displayedLocalDay)return false;
 const wasAtLatest=calendarWindowEnd===displayedLocalDay;
 displayedLocalDay=today;
 if(wasAtLatest||calendarWindowEnd>today)calendarWindowEnd=today;
 wbOpenKey=null;wbCalorieDetailOpen=false;
 if(!draft.id)draft={...emptyDraft(draft.type),date:today};
 
 render();
 return true;
}
function scheduleLocalMidnightRefresh(){
 if(localMidnightTimer!==null)clearTimeout(localMidnightTimer);
 const now=new Date();
 const next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1,0);
 localMidnightTimer=setTimeout(()=>{
  refreshLocalCalendarDay();
  scheduleLocalMidnightRefresh();
 },Math.max(1000,next.getTime()-now.getTime()));
}
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden){refreshLocalCalendarDay();scheduleLocalMidnightRefresh();}
});
window.addEventListener('pageshow',()=>{refreshLocalCalendarDay();scheduleLocalMidnightRefresh();});
window.addEventListener('focus',()=>{refreshLocalCalendarDay();scheduleLocalMidnightRefresh();});
// iOS PWA suspension can delay timers, so also poll while the page is active.
setInterval(()=>{if(!document.hidden)refreshLocalCalendarDay();},30000);
// Reject an action from a still-visible YESTERDAY screen before it can save on the wrong day.
function guardOldDayAction(e){
 if(refreshLocalCalendarDay()){e.preventDefault();e.stopImmediatePropagation();}
}
document.addEventListener('click',guardOldDayAction,true);
document.addEventListener('submit',guardOldDayAction,true);
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  // A claimed worker does not replace already-running JS; reload once when no form is being edited.
  if(document.activeElement?.closest('form')||wbOpenKey){toast('新版本已就绪，请完成本次输入后重新打开');return}
  try{
   const key='fitness_sw_reloaded_v5.37.0_inline';
   if(sessionStorage.getItem(key)!=='1'){sessionStorage.setItem(key,'1');location.reload()}
  }catch(e){location.reload()}
 });
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
 navigator.serviceWorker.addEventListener('message',e=>{
  if(e.data?.type!=='FITNESS_RELEASE_READY'||!e.data?.version)return;
  if(document.activeElement?.closest('form')||wbOpenKey){toast('新版已下载，请保存输入后重新打开');return}
  try{
   const key='fitness_sw_reload_'+e.data.version;
   if(sessionStorage.getItem(key)!=='1'){sessionStorage.setItem(key,'1');location.reload()}
  }catch(err){location.reload()}
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});});
}
render();
scheduleLocalMidnightRefresh();
