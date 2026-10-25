import type { ContextRecord } from "../hooks/useContexts";
import type { TaskRecord } from "../hooks/useTasks";
import { TaskRow } from "./TaskRow";

export function TaskList({
  tasks,
  contexts,
  onOpen
}: {
  tasks: TaskRecord[];
  contexts: ContextRecord[];
  onOpen?: (task: TaskRecord) => void;
}) {
  const open = tasks.filter((task) => !task.isCompleted);
  const completed = tasks.filter((task) => task.isCompleted);
  if (tasks.length === 0) return <p className="empty-state">还没有待办，先写下一件小事。</p>;
  return (
    <div className="task-list-groups">
      {open.length ? <ul className="task-list" aria-label="未完成任务">{open.map((task) => <TaskRow key={task.id} task={task} contexts={contexts} onOpen={onOpen} />)}</ul> : null}
      {completed.length ? (
        <details className="completed-tasks">
          <summary>已完成 {completed.length}</summary>
          <ul className="task-list" aria-label="已完成任务">{completed.map((task) => <TaskRow key={task.id} task={task} contexts={contexts} onOpen={onOpen} />)}</ul>
        </details>
      ) : null}
    </div>
  );
}
