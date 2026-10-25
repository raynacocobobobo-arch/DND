import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { CirclePlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useCreateTask } from "../hooks/useTasks";

interface QuickAddProps {
  contextId?: string;
  dueToday?: boolean;
  onEmpty?(): void;
}

function todayDueAt(): string {
  const date = formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy-MM-dd");
  return fromZonedTime(`${date}T23:59:00`, "Asia/Shanghai").toISOString();
}

export function QuickAdd({ contextId, dueToday = false, onEmpty }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();
  const label = dueToday ? "快速添加今日任务" : "快速添加情境任务";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      onEmpty?.();
      return;
    }
    await createTask.mutateAsync({
      title: trimmed,
      contextId: contextId ?? null,
      dueAt: dueToday ? todayDueAt() : null
    });
    setTitle("");
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <label className="sr-only" htmlFor={`quick-add-${contextId ?? "home"}`}>{label}</label>
      <input
        id={`quick-add-${contextId ?? "home"}`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={dueToday ? "今天要完成什么？" : "在这个情境里加一件事…"}
      />
      <button type="submit" aria-label="添加" disabled={createTask.isPending || (!title.trim() && !onEmpty)}><CirclePlus aria-hidden="true" size={25} /></button>
    </form>
  );
}
