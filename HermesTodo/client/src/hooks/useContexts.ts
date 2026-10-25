import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Context } from "../../../shared/contracts";
import { apiRequest } from "../api/client";

export type ContextRecord = Context & { incompleteCount: number };

export function useContexts() {
  return useQuery({
    queryKey: ["contexts"],
    queryFn: () => apiRequest<ContextRecord[]>("/api/contexts")
  });
}

export function useCreateContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon?: string; color?: string }) =>
      apiRequest<ContextRecord>("/api/contexts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contexts"] })
  });
}

export function useUpdateContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; name?: string; icon?: string; color?: string }) =>
      apiRequest<ContextRecord>(`/api/contexts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contexts"] })
  });
}

export function useDeleteContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<void>(`/api/contexts/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["contexts"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
      ]);
    }
  });
}
