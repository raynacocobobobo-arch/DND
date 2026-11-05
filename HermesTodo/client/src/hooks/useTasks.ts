import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Priority, RepeatInterval, Task } from "../../../shared/contracts";
import { apiRequest } from "../api/client";

export type TaskRecord = Task & { subtasks: TaskRecord[]; checkinCount?:number; scheduledCount?:number; completionRate?:number;cycleAt?:string|null };
export type TaskSort = "priority" | "dueDate" | "createdAt";

export interface TaskInput {
  title: string;
  notes?: string;
  priority?: Priority;
  dueAt?: string | null;
  contextId?: string | null;
  parentTaskId?: string | null;
  repeatInterval?: RepeatInterval;
  repeatRule?: string;
}

export function useTasks(filters: { search?: string; contextId?: string; scope?: "inbox"; sort?: TaskSort } = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.contextId) query.set("contextId", filters.contextId);
  if (filters.scope === "inbox") query.set("scope", "inbox");
  query.set("sort", filters.sort ?? "createdAt");
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => apiRequest<TaskRecord[]>(`/api/tasks?${query.toString()}`)
  });
}

function useTaskMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["contexts"] })
      ]);
    }
  });
}

export function useCreateTask() {
  return useTaskMutation((input: TaskInput) =>
    apiRequest<TaskRecord>("/api/tasks", { method: "POST", body: JSON.stringify(input) })
  );
}

export function useUpdateTask() {
  return useTaskMutation(({ id, ...input }: Partial<TaskInput> & { id: string }) =>
    apiRequest<TaskRecord>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) })
  );
}

// Coalesce repeated taps on the same task while the first request is in flight.
// This works across the timeline and project-detail components.
const pendingTaskToggles = new Map<string, Promise<TaskRecord>>();

export function useToggleTask() {
  return useTaskMutation((id: string) => {
    const existing = pendingTaskToggles.get(id);
    if (existing) return existing;
    const request = apiRequest<TaskRecord>(`/api/tasks/${id}/toggle`, { method: "POST" });
    pendingTaskToggles.set(id, request);
    // Register both outcomes so a failed write can be retried without a page reload.
    const clear = () => {
      if (pendingTaskToggles.get(id) === request) pendingTaskToggles.delete(id);
    };
    void request.then(clear, clear);
    return request;
  });
}

export function useDeleteTask() {
  return useTaskMutation((id: string) => apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" }));
}
