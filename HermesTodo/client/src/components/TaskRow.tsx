import { formatInTimeZone } from "date-fns-tz";
import { Link } from "react-router-dom";

import type { ContextRecord } from "../hooks/useContexts";
import { useToggleTask, type TaskRecord } from "../hooks/useTasks";

interface TaskRowProps {
  task: TaskRecord;
  contexts: ContextRecord[];
  onOpen?: (task: TaskRecord) => void;
}

const priorityLabels = { high: "高", medium: "中", low: "低" };

export function TaskRow({ task, contexts, onOpen }: TaskRowProps) {
  const toggle = useToggleTask();
  const context = contexts.find((item) => item.id === task.contextId);
  return (
    <li className={`task-row${task.isCompleted ? " task-row-completed" : ""}`}>
      <button
        type="button"
        className="task-check"
        aria-label={`${task.isCompleted ? "重新打开" : "完成"} ${task.title}`}
        aria-pressed={task.isCompleted}
        onClick={() => toggle.mutate(task.id)}
      >
        <span aria-hidden="true">{task.isCompleted ? "✓" : ""}</span>
      </button>
      <div className="task-row-main">
        <button type="button" className="task-title-button" onClick={() => onOpen?.(task)}>{task.title}</button>
        <div className="task-meta">
          <span className={`priority-badge priority-${task.priority}`}>{priorityLabels[task.priority]}优先级</span>
          {task.dueAt ? <time dateTime={task.dueAt}>{formatInTimeZone(task.dueAt, "Asia/Shanghai", "M月d日 HH:mm")}</time> : null}
          {context ? <Link to={`/contexts/${context.id}`}>{context.name}</Link> : null}
        </div>
      </div>
    </li>
  );
}
