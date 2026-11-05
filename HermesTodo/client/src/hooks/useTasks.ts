import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

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

// A checkbox must respond immediately, even over a slow mobile data connection.
// Keep one in-flight write per ID and optimistically update every cached task list.
const pendingTaskToggles = new Map<string, Promise<TaskRecord>>();
const activeOptimisticToggles = new Set<string>();
let reconcileTimer: ReturnType<typeof setTimeout> | null = null;
function reconcileAfterQuietPeriod(client: ReturnType<typeof useQueryClient>) {
  if(reconcileTimer!==null)clearTimeout(reconcileTimer);
  reconcileTimer=setTimeout(()=>{
    reconcileTimer=null;
    if(activeOptimisticToggles.size || pendingTaskToggles.size) {
      reconcileAfterQuietPeriod(client);
      return;
    }
    // One server refresh per burst, instead of two full REST queries per tick.
    void client.invalidateQueries({queryKey:["tasks"]});
    void client.invalidateQueries({queryKey:["contexts"]});
  },1200);
}

type CompletionState = Pick<TaskRecord, "isCompleted" | "completedAt" | "checkinCount" | "completionRate">;
type ToggleContext = {
  duplicate: boolean;
  snapshots: Array<{ key: QueryKey; state: CompletionState }>;
};
function visitTask(task: TaskRecord, id: string, change: (record: TaskRecord) => TaskRecord): TaskRecord {
  if (task.id === id) return change(task);
  if (!task.subtasks?.length) return task;
  const subtasks = task.subtasks.map(child => visitTask(child, id, change));
  return subtasks.every((child,index) => child === task.subtasks[index])
    ? task : {...task, subtasks};
}
function findTask(task: TaskRecord, id: string): TaskRecord | undefined {
  if (task.id === id) return task;
  for (const child of task.subtasks ?? []) {
    const found = findTask(child,id);
    if (found) return found;
  }
  return undefined;
}
function isRepeating(task: TaskRecord) {
  return task.repeatInterval !== "none" || (task.scheduledCount ?? 0) > 0;
}
function optimisticCompletion(task: TaskRecord): TaskRecord {
  const isCompleted = !task.isCompleted;
  const next: TaskRecord = {...task,isCompleted,
    completedAt:isCompleted?new Date().toISOString():null};
  if (isRepeating(task)) {
    next.checkinCount = Math.max(0,(task.checkinCount??0)+(isCompleted?1:-1));
    if ((task.scheduledCount??0)>0) {
      next.completionRate = Math.round(next.checkinCount/task.scheduledCount!*100);
    }
  }
  return next;
}
function mergeServerCompletion(task:TaskRecord, server:TaskRecord):TaskRecord {
  return {...task,isCompleted:server.isCompleted,completedAt:server.completedAt,
    checkinCount:server.checkinCount??task.checkinCount,
    completionRate:server.completionRate??task.completionRate,
    scheduledCount:server.scheduledCount??task.scheduledCount,
    cycleAt:server.cycleAt??task.cycleAt};
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation<TaskRecord,Error,string,ToggleContext>({
    mutationFn: id => {
      const existing = pendingTaskToggles.get(id);
      if (existing) return existing;
      const request=apiRequest<TaskRecord>("/api/tasks/"+id+"/toggle",{method:"POST"});
      pendingTaskToggles.set(id,request);
      const clear=()=>{
        if(pendingTaskToggles.get(id)===request)pendingTaskToggles.delete(id);
      };
      void request.then(clear,clear);
      return request;
    },
    onMutate:id=>{
      if(activeOptimisticToggles.has(id))return {duplicate:true,snapshots:[]};
      activeOptimisticToggles.add(id);
      // Cancel existing refreshes without awaiting the network before painting.
      // cancelQueries immediately notifies observers; the cache change below is
      // synchronous within the click handler.
      void queryClient.cancelQueries({queryKey:["tasks"]});
      const snapshots:ToggleContext["snapshots"]=[];
      for(const [key,items] of queryClient.getQueriesData<TaskRecord[]>({queryKey:["tasks"]})){
        if(!items)continue;
        const record=items.map(x=>findTask(x,id)).find(Boolean);
        if(!record)continue;
        snapshots.push({key,state:{
          isCompleted:record.isCompleted,completedAt:record.completedAt,
          checkinCount:record.checkinCount,completionRate:record.completionRate
        }});
        queryClient.setQueryData<TaskRecord[]>(key,current=>
          current?.map(item=>visitTask(item,id,optimisticCompletion)));
      }
      return {duplicate:false,snapshots};
    },
    onError:(_error,id,context)=>{
      if(!context || context.duplicate)return;
      // Roll back only this checkbox, preserving other concurrent task edits.
      for(const {key,state} of context.snapshots){
        queryClient.setQueryData<TaskRecord[]>(key,items=>
          items?.map(task=>visitTask(task,id,record=>({...record,...state}))));
      }
    },
    onSuccess:(server,id,context)=>{
      if(context?.duplicate)return;
      for(const [key,items] of queryClient.getQueriesData<TaskRecord[]>({queryKey:["tasks"]})){
        if(!items?.some(item=>findTask(item,id)))continue;
        queryClient.setQueryData<TaskRecord[]>(key,current=>
          current?.map(item=>visitTask(item,id,task=>mergeServerCompletion(task,server))));
      }
    },
    onSettled:(_data,_error,id,context)=>{
      if(context?.duplicate)return;
      activeOptimisticToggles.delete(id);
      // The returned server row already reconciles this checkbox. Mark cached
      // lists stale now; refresh once after rapid check-ins have finished.
      void queryClient.invalidateQueries({queryKey:["tasks"],refetchType:"none"});
      void queryClient.invalidateQueries({queryKey:["contexts"],refetchType:"none"});
      reconcileAfterQuietPeriod(queryClient);
    }
  });
}

export function useDeleteTask() {
  return useTaskMutation((id: string) => apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" }));
}
