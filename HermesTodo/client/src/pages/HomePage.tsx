import { zhCN } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { CircleAlert, CircleCheck, ChevronRight, Sparkles, Sun, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { ContextIcon } from "../components/ContextIcon";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
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
  const upcomingTasks = allTasks.filter((task) => !task.isCompleted && (!task.dueAt || dueDate(task.dueAt)! > today));
  const todayDueAt = fromZonedTime(`${today}T09:00:00`, "Asia/Shanghai").toISOString();

  return (
    <section className="page-stack ios-dashboard">
      <section className="dashboard-hero">
        <img className="dashboard-hero-art" src={`${import.meta.env.BASE_URL}art/hero-standard-bearer.webp`} alt="" loading="eager" decoding="async"/>
        <div className="hero-content">
          <header className="ios-page-header">
            <span className="hero-overline"><FleurDeLis size={19}/> YOUR DAILY CHAPTER</span>
            <h1>首页</h1>
            <p className="page-date">{formatInTimeZone(new Date(), "Asia/Shanghai", "M月d日 EEEE", { locale: zhCN })}</p>
          </header>
          <div className="dashboard-greeting">
            <h2>{greeting}</h2>
            <p>重要的事，值得全心以赴。</p>
            <HeraldicDivider className="hero-divider"/>
          </div>
        </div>
      </section>
      <section className="summary-grid" aria-label="任务概览">
        <article className="summary-card"><span className="summary-symbol"><Sun className="stat-mustard" aria-hidden="true" size={22}/></span><span>今日待办</span><strong>{counts.today}<small> 件待完成</small></strong></article>
        <article className="summary-card"><span className="summary-symbol"><CircleCheck className="stat-sage" aria-hidden="true" size={22}/></span><span>已完成</span><strong>{counts.done}<small> 件任务</small></strong></article>
        <article className="summary-card"><span className="summary-symbol"><CircleAlert className="stat-coral" aria-hidden="true" size={22}/></span><span>逾期</span><strong>{counts.overdue}<small> 件待处理</small></strong></article>
      </section>
      <div className="dashboard-layout">
        <div className="dashboard-main-column">
          <section className="parchment-panel dashboard-task-board">
            <div className="board-heading">
              <div><span className="board-eyebrow"><FleurDeLis size={15}/> THE QUEST LIST</span><h2>我的任务</h2></div>
              <span className="board-today">{formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy.MM.dd")}</span>
            </div>
            <div className="dashboard-quick-add"><QuickAdd dueToday onEmpty={() => setCreateTaskOpen(true)} /></div>
            {overdueTasks.length ? (
              <section className="dashboard-section dashboard-overdue" aria-label="逾期待处理">
                <div className="dashboard-section-heading"><h2>逾期待处理</h2><span>{counts.overdue} 件</span></div>
                <TaskList tasks={overdueTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
              </section>
            ) : null}
            <section className="dashboard-section dashboard-focus">
              <div className="dashboard-section-heading"><h2>今日重点</h2><span className="section-count">{todayTasks.length} 项</span></div>
              {tasks.isError ? (
                <div className="dashboard-empty" role="alert">任务加载失败。<button type="button" className="text-retry-button" onClick={() => void tasks.refetch()}>重试</button></div>
              ) : tasks.isLoading || contexts.isLoading ? <p>正在读取待办…</p> : todayTasks.length ? (
                <TaskList tasks={todayTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
              ) : <p className="dashboard-empty">今天尚未安排任务。添加一件最重要的事，开启今天。</p>}
            </section>
            {upcomingTasks.length ? (
              <section className="dashboard-section dashboard-upcoming">
                <div className="dashboard-section-heading"><h2>接下来</h2><span className="section-count">{upcomingTasks.length} 项</span></div>
                <TaskList tasks={upcomingTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
              </section>
            ) : null}
          </section>
        </div>
        <aside className="dashboard-side-column">
          <section className="progress-card">
            <div className="progress-heading"><h2>今日进度</h2><strong>{progress}%</strong></div>
            <progress max="100" value={progress}>{progress}%</progress>
            <p>{tip}</p>
            <div className="progress-ornament" aria-hidden="true"><FleurDeLis size={30}/></div>
          </section>
          <section className="parchment-panel dashboard-section contexts-entry-section">
            <div className="dashboard-section-heading"><h2><FleurDeLis size={18}/> 情境入口</h2><Link to="/contexts">全部 <ChevronRight aria-hidden="true" size={15}/></Link></div>
            <div className="context-strip">
              {(contexts.data ?? []).slice(0, 8).map((context) => (
                <Link key={context.id} className="context-entry" to={`/contexts/${context.id}`}>
                  <span className="context-entry-icon" style={{ color: context.color }}><ContextIcon name={context.icon} size={21}/></span>
                  <strong>{context.name}</strong>
                  <small>{context.incompleteCount} 个未完成</small>
                  <ChevronRight aria-hidden="true" size={16}/>
                </Link>
              ))}
              {!contexts.isLoading && !contexts.data?.length ? <Link className="context-entry context-entry-empty" to="/contexts">创建第一个情境 <ChevronRight size={16}/></Link> : null}
            </div>
          </section>
          <Link className="ai-teaser" to="/ai">
            <div className="ai-teaser-top"><Sparkles size={20}/><span>HERMES INTELLIGENCE</span><ArrowUpRight size={18}/></div>
            <h2>AI 任务规划器</h2>
            <p>将一个目标，拆成可以执行的每一步。</p>
            <span className="ai-teaser-action">开启规划 <ArrowUpRight size={16}/></span>
          </Link>
        </aside>
      </div>
      {selectedTask ? <TaskDetail task={selectedTask} contexts={contexts.data ?? []} onClose={() => setSelectedTaskId(undefined)}/> : null}
      {createTaskOpen ? <TaskCreateDialog contexts={contexts.data ?? []} initialDueAt={todayDueAt} onClose={() => setCreateTaskOpen(false)}/> : null}
    </section>
  );
}
