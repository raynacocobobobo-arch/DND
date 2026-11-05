import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { zhCN } from "date-fns/locale";

import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { TaskDetail } from "../components/TaskDetail";
import { useContexts } from "../hooks/useContexts";
import { useTasks, useToggleTask, type TaskRecord } from "../hooks/useTasks";

type Filter = "active" | "all" | "done";
const zone = "Asia/Shanghai";
const repeatLabels: Record<string, string> = {
  none: "不循环",
  daily: "每天",
  weekly: "每周",
  monthly: "每月",
  yearly: "每年",
  custom: "自定义"
};
function dayKey(date: string) {
  return formatInTimeZone(date, zone, "yyyy-MM-dd");
}
function eventDate(task: TaskRecord) {
  return task.isCompleted
    ? task.completedAt ?? task.updatedAt
    : task.dueAt ?? task.createdAt;
}

export function TimelinePage() {
  const tasks = useTasks({ sort: "createdAt" });
  const contexts = useContexts();
  const toggle = useToggleTask();
  const [filter, setFilter] = useState<Filter>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const all = tasks.data ?? [];
  const selected = all.find((task) => task.id === selectedId);
  const grouped = useMemo(() => {
    const rows = all.filter((task) =>
      filter === "all" || (filter === "active" ? !task.isCompleted : task.isCompleted)
    );
    const dates = new Map<string, TaskRecord[]>();
    for (const task of rows) {
      const day = dayKey(eventDate(task));
      const current = dates.get(day) ?? [];
      current.push(task);
      dates.set(day, current);
    }
    return [...dates.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, records]) => ({
        date,
        label: formatInTimeZone(date + "T12:00:00+08:00", zone, "M月d日 EEEE · yyyy", { locale: zhCN }),
        records: records.sort((a, b) => eventDate(b).localeCompare(eventDate(a)))
      }));
  }, [all, filter]);

  async function toggleTask(id: string) {
    setError("");
    try { await toggle.mutateAsync(id); }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : "更新任务失败");
    }
  }

  return (
    <section className="ht-timeline">
      <header className="ht-heading">
        <div className="ht-overline">✦ HERMES · CHRONICLE</div>
        <h1>待办记录时间线</h1>
        <p>在时间里记录行动。每一次完成，都留下痕迹。</p>
        <div className="ht-counts">
          <span>待完成 <strong>{all.filter((task) => !task.isCompleted).length}</strong></span>
          <span>已完成 <strong>{all.filter((task) => task.isCompleted).length}</strong></span>
          <button type="button" onClick={() => setCreateOpen(true)}>＋ 新建任务</button>
        </div>
      </header>
      <div className="ht-filters" role="group" aria-label="记录筛选">
        {([["active", "未完成"], ["all", "全部记录"], ["done", "已完成"]] as const).map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? "ht-selected" : ""}
            aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>
      {error ? <p className="ht-error" role="alert">{error}</p> : null}
      {tasks.isError ? <p className="ht-error" role="alert">读取记录失败。<button type="button" onClick={() => void tasks.refetch()}>重试</button></p> : null}
      {tasks.isLoading ? <p className="ht-empty">正在读取任务时间线…</p> : null}
      {!tasks.isLoading && !grouped.length ? <p className="ht-empty">暂无相关记录。点击「新建任务」，从今天开始记录。</p> : null}
      <div className="ht-history">
        {grouped.map(({ date, label, records }) => (
          <section key={date} className="ht-day" aria-label={label}>
            <header className="ht-date-line"><span className="ht-date-mark" aria-hidden="true">✥</span><h2>{label}</h2><span className="ht-date-total">{records.length} 项</span></header>
            <ol className="ht-day-records">
              {records.map((task) => {
                const at = eventDate(task);
                return (
                  <li key={task.id} className={"ht-record" + (task.isCompleted ? " ht-completed" : "")}>
                    <time className="ht-record-clock" dateTime={at}>{formatInTimeZone(at, zone, "HH:mm")}</time>
                    <span className="ht-record-dot" aria-hidden="true" />
                    <article className="ht-record-card">
                      <div className="ht-record-title-row">
                        <button type="button" className="ht-checkbox" disabled={toggle.isPending}
                          aria-label={(task.isCompleted ? "重新打开 " : "完成 ") + task.title}
                          aria-pressed={task.isCompleted}
                          onClick={() => void toggleTask(task.id)}>{task.isCompleted ? "✓" : ""}</button>
                        <button type="button" className="ht-record-title" onClick={() => setSelectedId(task.id)}>{task.title}</button>
                        <button type="button" className="ht-record-edit" aria-label={"编辑 " + task.title} onClick={() => setSelectedId(task.id)}>编辑</button>
                      </div>
                      {task.notes ? <p className="ht-notes">{task.notes}</p> : null}
                      <div className="ht-record-meta">
                        <span>{task.isCompleted ? "✓ 已完成" : task.dueAt ? "计划执行" : "已记录"}</span>
                        {task.dueAt ? <span>计划 {formatInTimeZone(task.dueAt, zone, "yyyy-MM-dd HH:mm")}</span> : null}
                        {task.repeatInterval !== "none" ? <span className="ht-repeat">↻ {task.repeatInterval === "custom" ? task.repeatRule : repeatLabels[task.repeatInterval]}</span> : null}
                        <span>{task.contextId ? "已分类" : "未分类"}</span>
                      </div>
                      {task.completedAt && task.isCompleted ? <p className="ht-completion-time">完成于 {formatInTimeZone(task.completedAt, zone, "yyyy-MM-dd HH:mm")}</p> : null}
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
      {createOpen ? <TaskCreateDialog contexts={contexts.data ?? []} onClose={() => setCreateOpen(false)} /> : null}
      {selected ? <TaskDetail task={selected} contexts={contexts.data ?? []} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
}
