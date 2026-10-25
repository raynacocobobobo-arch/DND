import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { useState, type FormEvent } from "react";

import type { Priority, RepeatInterval } from "../../../shared/contracts";
import type { ContextRecord } from "../hooks/useContexts";
import type { TaskInput, TaskRecord } from "../hooks/useTasks";

const customRepeatPattern = /^(?:每周[一二三四五六日天]|每月(?:[1-9]|[12]\d|3[01])日)$/u;

export function TaskForm({
  task,
  contexts,
  pending,
  onSave,
  initialContextId = null,
  initialDueAt = null
}: {
  task?: TaskRecord;
  contexts: ContextRecord[];
  pending?: boolean;
  onSave(input: TaskInput): void;
  initialContextId?: string | null;
  initialDueAt?: string | null;
}) {
  const dueAt = task?.dueAt ?? initialDueAt;
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [contextId, setContextId] = useState(task?.contextId ?? initialContextId ?? "");
  const [dueDate, setDueDate] = useState(dueAt ? formatInTimeZone(dueAt, "Asia/Shanghai", "yyyy-MM-dd") : "");
  const [dueTime, setDueTime] = useState(dueAt ? formatInTimeZone(dueAt, "Asia/Shanghai", "HH:mm") : "09:00");
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>(task?.repeatInterval ?? "none");
  const [repeatRule, setRepeatRule] = useState(task?.repeatRule ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (repeatInterval === "custom" && !customRepeatPattern.test(repeatRule.trim())) {
      setError("自定义重复只支持“每周X”或“每月N日”");
      return;
    }
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      contextId: contextId || null,
      dueAt: dueDate ? fromZonedTime(`${dueDate}T${dueTime || "09:00"}:00`, "Asia/Shanghai").toISOString() : null,
      repeatInterval,
      repeatRule: repeatInterval === "custom" ? repeatRule.trim() : ""
    });
  }

  return (
    <form className="stacked-form task-form" onSubmit={submit}>
      <label>任务标题<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required /></label>
      <label>备注<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} rows={3} /></label>
      <div className="form-grid">
        <label>优先级<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}><option value="high">高</option><option value="medium">中</option><option value="low">低</option></select></label>
        <label>所属情境<select value={contextId} onChange={(event) => setContextId(event.target.value)}><option value="">无情境</option>{contexts.map((context) => <option key={context.id} value={context.id}>{context.name}</option>)}</select></label>
        <label>截止日期<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        <label>截止时间<input type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} disabled={!dueDate} /></label>
        <label>重复<select value={repeatInterval} onChange={(event) => setRepeatInterval(event.target.value as RepeatInterval)}><option value="none">不重复</option><option value="daily">每天</option><option value="weekly">每周</option><option value="monthly">每月</option><option value="yearly">每年</option><option value="custom">自定义</option></select></label>
        {repeatInterval === "custom" ? <label>自定义重复<input value={repeatRule} onChange={(event) => setRepeatRule(event.target.value)} placeholder="每周一 / 每月15日" /></label> : null}
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button type="submit" className="primary-button" disabled={pending || !title.trim()}>保存任务</button>
    </form>
  );
}
