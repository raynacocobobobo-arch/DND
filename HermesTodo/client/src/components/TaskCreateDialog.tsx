import { useState } from "react";

import type { ContextRecord } from "../hooks/useContexts";
import { useCreateTask, type TaskInput } from "../hooks/useTasks";
import { TaskForm } from "./TaskForm";

export function TaskCreateDialog({
  contexts,
  initialContextId,
  initialDueAt,
  onClose
}: {
  contexts: ContextRecord[];
  initialContextId?: string | null;
  initialDueAt?: string | null;
  onClose(): void;
}) {
  const create = useCreateTask();
  const [error, setError] = useState("");

  function save(input: TaskInput) {
    setError("");
    void create.mutateAsync(input).then(onClose).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "创建失败，请重试");
    });
  }

  return (
    <div className="dialog-backdrop task-detail-backdrop" role="presentation">
      <section className="form-dialog task-detail" role="dialog" aria-modal="true" aria-labelledby="task-create-title">
        <div className="dialog-heading"><h2 id="task-create-title">新建任务</h2><button type="button" aria-label="关闭" onClick={onClose}>×</button></div>
        <TaskForm contexts={contexts} pending={create.isPending} onSave={save} initialContextId={initialContextId} initialDueAt={initialDueAt} />
        {error ? <p className="form-error action-error" role="alert">{error}</p> : null}
      </section>
    </div>
  );
}
