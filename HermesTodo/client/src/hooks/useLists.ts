import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface ListRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  sceneCount: number;
  incompleteCount: number;
}

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: () => apiRequest<ListRecord[]>("/api/lists")
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string; color?: string }) =>
      apiRequest<ListRecord>("/api/lists", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] })
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; name?: string; icon?: string; color?: string }) =>
      apiRequest<ListRecord>(`/api/lists/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] })
  });
}

export function useReorderLists() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiRequest<{ ok: true }>("/api/lists/reorder", { method: "POST", body: JSON.stringify({ orderedIds }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lists"] })
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/api/lists/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lists"] }),
        queryClient.invalidateQueries({ queryKey: ["contexts"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
      ]);
    }
  });
}

export function useCompleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ updatedCount: number }>(`/api/lists/${id}/complete`, { method: "POST" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lists"] }),
        queryClient.invalidateQueries({ queryKey: ["contexts"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
      ]);
    }
  });
}
