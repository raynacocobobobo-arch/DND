import { zhCN } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { CircleAlert, CircleCheck, ChevronRight, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { ContextIcon } from "../components/ContextIcon";
import { QuickAdd } from "../components/QuickAdd";
import { TaskList } from "../components/TaskList";
import { TaskDetail } from "../components/TaskDetail";
import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { useState } from "react";
import { useContexts } from "../hooks/useContexts";
import { useTasks } from "../hooks/useTasks";

export function HomePage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const contexts = useContexts();
  const tasks = useTasks({ sort: "priority" });
  const allTasks = tasks.data ?? [];
  const selectedTask = allTasks.find((task) => task.id === selectedTaskId);
  const today = formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy-MM-dd");
  const dueDate = (value: string | null) => value ? formatInTimeZone(value, "Asia/Shanghai", "yyyy-MM-dd") : null;
  const todayAllTasks = allTasks.filter((task) => dueDate(task.dueAt) === today);
  const todayTasks = todayAllTasks.filter((task) => !task.isCompleted);
  const todayCompletedCount = todayAllTasks.length - todayTasks.length;
  const overdueTasks = allTasks
    .filter((task) => !task.isCompleted && task.dueAt && dueDate(task.dueAt)! < today)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const doneTasks = allTasks.filter((task) => task.isCompleted);
  const counts = {
    today: todayTasks.length,
    overdue: overdueTasks.length,
    done: doneTasks.length
  };
  const progress = todayAllTasks.length ? Math.round((todayCompletedCount / todayAllTasks.length) * 100) : 0;
  const hour = Number(formatInTimeZone(new Date(), "Asia/Shanghai", "H"));
  const greeting = hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const tip = todayAllTasks.length
    ? `今日已完成 ${todayCompletedCount} / ${todayAllTasks.length} 件到期任务。`
    : "今天还没有安排到期任务。";
  const todayDueAt = fromZonedTime(`${today}T09:00:00`, "Asia/Shanghai").toISOString();

  return (
    <section className="page-stack ios-dashboard">
      <header className="ios-page-header">
        <span aria-hidden="true" />
        <h1>首页</h1>
        <p className="page-date">{formatInTimeZone(new Date(), "Asia/Shanghai", "M月d日 EEEE", { locale: zhCN })}</p>
      </header>
      <div className="dashboard-greeting">
        <h2>{greeting}</h2>
        <p>今天咱就抓重点，别被小事拽跑。</p>
      </div>
      <section className="summary-grid" aria-label="任务概览">
        <article className="summary-card"><Sun className="stat-mustard" aria-hidden="true" size={19} /><strong>{counts.today}</strong><span>今日待办</span></article>
        <article className="summary-card"><CircleCheck className="stat-sage" aria-hidden="true" size={19} /><strong>{counts.done}</strong><span>已完成</span></article>
        <article className="summary-card"><CircleAlert className="stat-coral" aria-hidden="true" size={19} /><strong>{counts.overdue}</strong><span>逾期</span></article>
      </section>
      <section className="progress-card">
        <div className="progress-heading"><h2>今日进度</h2><strong>{progress}%</strong></div>
        <progress max="100" value={progress}>{progress}%</progress>
        <p>{tip}</p>
      </section>
      {overdueTasks.length ? (
        <section className="dashboard-section dashboard-overdue" aria-label="逾期待处理">
          <div className="dashboard-section-heading"><h2>逾期待处理</h2><span>{counts.overdue} 件</span></div>
          <TaskList tasks={overdueTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)} />
        </section>
      ) : null}
      <section className="dashboard-section">
        <h2>今日重点</h2>
        {tasks.isError ? (
          <div className="dashboard-empty" role="alert">任务加载失败。<button type="button" className="text-retry-button" onClick={() => void tasks.refetch()}>重试</button></div>
        ) : tasks.isLoading || contexts.isLoading ? <p>正在读取待办…</p> : todayTasks.length ? (
          <TaskList tasks={todayTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)} />
        ) : <p className="dashboard-empty">今天还没排事儿，可以在下方快速添加。</p>}
      </section>
      <section className="dashboard-section contexts-entry-section">
        <div className="dashboard-section-heading"><h2>情境入口</h2><Link to="/contexts">全部</Link></div>
        <div className="context-strip">
          {(contexts.data ?? []).slice(0, 8).map((context) => (
            <Link key={context.id} className="context-entry" to={`/contexts/${context.id}`}>
              <span style={{ color: context.color }}><ContextIcon name={context.icon} size={20} /></span>
              <strong>{context.name}</strong>
              <small>{context.incompleteCount} 个未完成</small>
              <ChevronRight aria-hidden="true" size={14} />
            </Link>
          ))}
          {!contexts.isLoading && !contexts.data?.length ? <Link className="context-entry context-entry-empty" to="/contexts">创建第一个情境</Link> : null}
        </div>
      </section>
      <QuickAdd dueToday onEmpty={() => setCreateTaskOpen(true)} />
      {selectedTask ? <TaskDetail task={selectedTask} contexts={contexts.data ?? []} onClose={() => setSelectedTaskId(undefined)} /> : null}
      {createTaskOpen ? <TaskCreateDialog contexts={contexts.data ?? []} initialDueAt={todayDueAt} onClose={() => setCreateTaskOpen(false)} /> : null}
    </section>
  );
}
