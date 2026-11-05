import { useState, type FormEvent } from "react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { useUpdateTask, type TaskRecord } from "../hooks/useTasks";

const zone = "Asia/Shanghai";
const weekdays = [
  { label:"周一", word:"一" }, {label:"周二",word:"二"}, {label:"周三",word:"三"},
  { label:"周四",word:"四" }, {label:"周五",word:"五"}, {label:"周六",word:"六"},
  { label:"周日",word:"日" }
];
const choices = [
  { key:"daily",name:"每天" },{key:"weekly",name:"每周"},
  { key:"monthly",name:"每月" },{key:"yearly",name:"每年"}
] as const;

type Choice = "daily" | "weekly" | "monthly" | "yearly" | "none" | "weekday";

function initialChoice(task: TaskRecord): Choice | string {
  if (task.repeatInterval === "custom" && /^每周[一二三四五六日天]$/.test(task.repeatRule)) {
    return "week-" + task.repeatRule.replace("每周", "").replace("天", "日");
  }
  if (task.repeatInterval === "custom" && /^每月\d{1,2}日$/.test(task.repeatRule)) return "monthly";
  return task.repeatInterval;
}

export function ProjectRepeatDialog({ task, onClose }: { task: TaskRecord; onClose():void }) {
  const update = useUpdateTask();
  const starting = task.dueAt ? new Date(task.dueAt) : new Date();
  const [choice,setChoice] = useState<string>(initialChoice(task));
  const [startDate,setStartDate] = useState(formatInTimeZone(starting,zone,"yyyy-MM-dd"));
  const [startTime,setStartTime] = useState(task.dueAt ? formatInTimeZone(starting,zone,"HH:mm") : "09:00");
  const [error,setError] = useState("");

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const repeatInterval = choice.startsWith("week-") ? "custom" : choice as "none" | "daily" | "weekly" | "monthly" | "yearly";
    const repeatRule = choice.startsWith("week-") ? "每周" + choice.replace("week-","") : "";
    const dueAt = fromZonedTime(startDate + "T" + startTime + ":00",zone);
    if (!Number.isFinite(dueAt.getTime())) { setError("执行日期或时间无效"); return; }
    try {
      await update.mutateAsync({id:task.id,repeatInterval,repeatRule,dueAt:dueAt.toISOString()});
      onClose();
    } catch(reason) {
      setError(reason instanceof Error ? reason.message : "循环设置保存失败");
    }
  }

  async function pause() {
    setError("");
    try {
      await update.mutateAsync({id:task.id,repeatInterval:"none",repeatRule:""});
      onClose();
    } catch(reason) {
      setError(reason instanceof Error ? reason.message : "暂停循环失败");
    }
  }

  return (
    <div className="tp-repeat-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !update.isPending) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-label="循环设置" className="tp-repeat-dialog">
        <header className="tp-repeat-dialog-head">
          <span className="tp-repeat-mark" aria-hidden="true">↻</span>
          <div><span className="tp-kicker">HERMES · RECURRENCE</span><h2>按时间循环</h2></div>
          <button type="button" aria-label="关闭循环设置" onClick={onClose} disabled={update.isPending}>×</button>
        </header>
        <p className="tp-repeat-project-name">{task.title}</p>
        <form onSubmit={(event) => void save(event)}>
          <div className="tp-repeat-fields">
            <label>首次执行日期
              <input type="date" aria-label="首次执行日期" required value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
            </label>
            <label>执行时间
              <input type="time" aria-label="执行时间" required value={startTime} onChange={(e)=>setStartTime(e.target.value)}/>
            </label>
          </div>
          <div className="tp-repeat-caption">选择固定星期</div>
          <div className="tp-repeat-weekdays" role="group" aria-label="每周固定日期">
            {weekdays.map(day => <button key={day.word} type="button"
              aria-pressed={choice === "week-" + day.word}
              className={choice === "week-" + day.word ? "tp-repeat-active" : ""}
              onClick={()=>setChoice("week-" + day.word)}>{day.label}</button>)}
          </div>
          <div className="tp-repeat-caption">选择循环周期</div>
          <div className="tp-repeat-periods" role="group" aria-label="循环周期">
            {choices.map(option => <button key={option.key} type="button"
              aria-pressed={choice === option.key}
              className={choice === option.key ? "tp-repeat-active" : ""}
              onClick={()=>setChoice(option.key)}>{option.name}</button>)}
          </div>
          <p className="tp-repeat-explanation">
            {choice.startsWith("week-") ? "每周" + choice.slice(5) + "执行，完成本轮后建立下一轮。"
            : choice === "monthly" ? "每月同一天执行；月末不足该日期时按当月最后一天执行。"
            : choice === "weekly" ? "按首次执行日期的星期，每隔一周循环。"
            : choice === "daily" ? "每天循环一次。"
            : choice === "yearly" ? "每年同一日期循环。"
            : "当前未启用循环。"}
            {" "}本轮完成记录会保留，下一轮子待办重新变为未完成。
          </p>
          {error ? <p className="tp-error" role="alert">{error}</p> : null}
          <div className="tp-repeat-dialog-actions">
            <button type="button" className="tp-repeat-pause" onClick={() => void pause()}
              disabled={update.isPending || task.repeatInterval === "none"}>暂停循环</button>
            <button type="button" className="tp-repeat-cancel" onClick={onClose} disabled={update.isPending}>取消</button>
            <button type="submit" className="tp-repeat-save" disabled={update.isPending}>{update.isPending ? "保存中…" : "保存设置"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
