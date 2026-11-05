import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useUpdateTask, type TaskRecord } from "../hooks/useTasks";

const DAYS=[
  {label:"周一",word:"一"},{label:"周二",word:"二"},{label:"周三",word:"三"},
  {label:"周四",word:"四"},{label:"周五",word:"五"},{label:"周六",word:"六"},
  {label:"周日",word:"日"}
];
const ZONE="Asia/Shanghai";
type Rule={repeatInterval:"none"|"weekly"|"monthly"|"custom";repeatRule:string};

function selectedRule(task:TaskRecord) {
  if(task.repeatInterval==="custom"){
    const match=/^每周([一二三四五六日])$/.exec(task.repeatRule);
    if(match)return "day-"+match[1];
  }
  if(task.repeatInterval==="weekly") return "weekly";
  if(task.repeatInterval==="monthly" || /^每月\d{1,2}日$/.test(task.repeatRule))return "monthly";
  return "";
}
function ruleFor(value:string,task:TaskRecord):Rule {
  if(value.startsWith("day-"))return {repeatInterval:"custom",repeatRule:"每周"+value.slice(4)};
  if(value==="weekly")return {repeatInterval:"weekly",repeatRule:""};
  if(value==="monthly"){
    // Preserve an existing monthly-N rule if it was already selected.
    if(/^每月\d{1,2}日$/.test(task.repeatRule))return {repeatInterval:"custom",repeatRule:task.repeatRule};
    return {repeatInterval:"monthly",repeatRule:""};
  }
  return {repeatInterval:"none",repeatRule:""};
}

/** Screenshot-matched compact 3x3 recurrence sheet.
 * Choosing a cell saves immediately, rather than requiring a second Save action.
 */
export function ProjectRepeatDialog({task,onClose}:{task:TaskRecord;onClose():void}) {
  const update=useUpdateTask();
  const [selected,setSelected]=useState(selectedRule(task));
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  const active=task.repeatInterval!=="none";
  async function choose(value:string){
    if(pending)return;
    setPending(true);setError("");
    setSelected(value);
    try{
      const rule=ruleFor(value,task);
      await update.mutateAsync({id:task.id,...rule,
        // Anchor the first check-in from creation time unless the user already scheduled it.
        dueAt:task.dueAt ?? task.createdAt});
      onClose();
    }catch(reason){
      setError(reason instanceof Error?reason.message:"设置循环失败");
      setSelected(selectedRule(task));
    }finally{setPending(false);}
  }
  async function pause(){
    if(pending)return;
    setPending(true);setError("");
    try{await update.mutateAsync({id:task.id,repeatInterval:"none",repeatRule:""});onClose();}
    catch(reason){setError(reason instanceof Error?reason.message:"暂停循环失败");}
    finally{setPending(false);}
  }
  const times=task.scheduledCount??0;
  const completed=task.subtasks.length
    ? task.subtasks.reduce((sum,child)=>sum+(child.checkinCount??(child.isCompleted?1:0)),0)
    : task.checkinCount??0;
  const totalItems=task.subtasks.length ? times*task.subtasks.length : times;
  return <div className="tp-repeat-overlay" role="presentation" onMouseDown={e=>{
    if(e.target===e.currentTarget&&!pending)onClose();
  }}>
    <section className="tp-repeat-dialog tp-repeat-compact" role="dialog" aria-modal="true" aria-label="循环设置">
      <header className="tp-repeat-reference-head">
        <p>建立日期{formatInTimeZone(task.createdAt,ZONE,"M/d EEE")} · 重复了{times}次</p>
        <p>完成了{completed} / {totalItems}项</p>
      </header>
      <div className="tp-repeat-reference-grid" role="group" aria-label="循环周期">
        {DAYS.map(day=><button key={day.word} type="button"
          disabled={pending} aria-pressed={selected==="day-"+day.word}
          className={selected==="day-"+day.word?"tp-repeat-active":""}
          onClick={()=>void choose("day-"+day.word)}>{day.label}</button>)}
        <button type="button" disabled={pending} aria-pressed={selected==="weekly"}
          className={selected==="weekly"?"tp-repeat-active":""}
          onClick={()=>void choose("weekly")}>每周</button>
        <button type="button" disabled={pending} aria-pressed={selected==="monthly"}
          className={selected==="monthly"?"tp-repeat-active":""}
          onClick={()=>void choose("monthly")}>每月</button>
      </div>
      <p className="tp-repeat-rule-description">
        {selected==="monthly"?"按月度计划重复打卡。":selected==="weekly"?"每周按原定星期重复打卡。":
          selected.startsWith("day-")?"每"+selected.slice(4)+"重复打卡。":"选择一个循环规则开始记录。"}
        {" "}按周期记录完成情况，不复制任务。
      </p>
      {error?<p className="tp-error" role="alert">{error}</p>:null}
      <div className="tp-repeat-reference-actions">
        <button type="button" disabled={pending} onClick={onClose}>取消</button>
        <button type="button" disabled={pending||!active} onClick={()=>void pause()}>暂停</button>
      </div>
    </section>
  </div>;
}
