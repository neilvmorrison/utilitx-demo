"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiLayer } from "@/lib/api-types";
import api from "@/lib/api";

export type Layer = {
  id: string;
  name: string;
  isVisible: boolean;
  projectId: string;
};

// Kept for backward compatibility with paths stored before the project model
export const DEFAULT_LAYER_ID = "default";

export function useLayers(activeProjectId: string | null) {
  const { data: layers = [] } = useQuery<Layer[]>({
    queryKey: queryKeys.layers(activeProjectId ?? ""),
    queryFn: async () => {
      const res = await api.get<ApiLayer[]>(
        `/layers?projectId=${activeProjectId}`,
      );
      return res.data.map((l) => ({
        id: l.id,
        name: l.name,
        isVisible: l.isVisible,
        projectId: l.projectId,
      }));
    },
    enabled: !!activeProjectId,
  });

  function getProjectLayers(projectId: string): Layer[] {
    return layers.filter((l) => l.projectId === projectId);
  }

  const createLayerMutation = useMutation({
    mutationFn: ({
      name,
      projectId,
    }: {
      name: string;
      projectId: string;
    }) =>
      api
        .post<ApiLayer>("/layers", { name, projectId, isVisible: true })
        .then((r) => r.data),
    onMutate: async ({ name, projectId }) => {
      const key = queryKeys.layers(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<Layer[]>(key);
      const optimistic: Layer = {
        id: crypto.randomUUID(),
        name,
        isVisible: true,
        projectId,
      };
      queryClient.setQueryData<Layer[]>(key, (old = []) => [
        ...old,
        optimistic,
      ]);
      return { snapshot, optimisticId: optimistic.id, projectId };
    },
    onSuccess: (data, vars, ctx) => {
      // Replace the optimistic entry with the real server-confirmed layer immediately,
      // so any activeLayerId sync that runs on the next render uses the real UUID.
      queryClient.setQueryData<Layer[]>(
        queryKeys.layers(vars.projectId),
        (old = []) =>
          old.map((l) =>
            l.id === ctx?.optimisticId
              ? { id: data.id, name: data.name, isVisible: data.isVisible, projectId: data.projectId }
              : l,
          ),
      );
    },
    onError: (_, vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.layers(vars.projectId), ctx.snapshot);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.layers(vars.projectId),
      });
    },
  });

  const updateLayerNameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string; projectId: string }) =>
      api.patch<ApiLayer>(`/layers/${id}`, { name }).then((r) => r.data),
    onMutate: async ({ id, name, projectId }) => {
      const key = queryKeys.layers(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<Layer[]>(key);
      queryClient.setQueryData<Layer[]>(key, (old = []) =>
        old.map((l) => (l.id === id ? { ...l, name } : l)),
      );
      return { snapshot, projectId };
    },
    onError: (_, vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.layers(vars.projectId), ctx.snapshot);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers(vars.projectId) });
    },
  });

  const toggleLayerVisibilityMutation = useMutation({
    mutationFn: ({
      id,
      isVisible,
    }: {
      id: string;
      isVisible: boolean;
      projectId: string;
    }) =>
      api.patch<ApiLayer>(`/layers/${id}`, { isVisible }).then((r) => r.data),
    onMutate: async ({ id, projectId }) => {
      const key = queryKeys.layers(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<Layer[]>(key);
      queryClient.setQueryData<Layer[]>(key, (old = []) =>
        old.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l)),
      );
      return { snapshot, projectId };
    },
    onError: (_, vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.layers(vars.projectId), ctx.snapshot);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers(vars.projectId) });
    },
  });

  const deleteLayerMutation = useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      api.delete(`/layers/${id}`),
    onMutate: async ({ id, projectId }) => {
      const key = queryKeys.layers(projectId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<Layer[]>(key);
      queryClient.setQueryData<Layer[]>(key, (old = []) =>
        old.filter((l) => l.id !== id),
      );
      return { snapshot, projectId };
    },
    onError: (_, vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.layers(vars.projectId), ctx.snapshot);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.layers(vars.projectId) });
    },
  });

  function createLayer(name: string, projectId: string, onCreated?: (id: string) => void): string {
    const tempId = crypto.randomUUID();
    createLayerMutation.mutate({ name, projectId }, {
      onSuccess: (created) => onCreated?.(created.id),
    });
    return tempId;
  }

  function updateLayerName(id: string, name: string) {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    updateLayerNameMutation.mutate({ id, name, projectId: layer.projectId });
  }

  function toggleLayerVisibility(id: string) {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    toggleLayerVisibilityMutation.mutate({
      id,
      isVisible: !layer.isVisible,
      projectId: layer.projectId,
    });
  }

  function deleteLayer(id: string) {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    deleteLayerMutation.mutate({ id, projectId: layer.projectId });
  }

  function deleteProjectLayers(projectId: string) {
    // Invalidate the layer cache for this project; server cascades on project delete
    queryClient.removeQueries({ queryKey: queryKeys.layers(projectId) });
  }

  return {
    layers,
    getProjectLayers,
    createLayer,
    updateLayerName,
    toggleLayerVisibility,
    deleteLayer,
    deleteProjectLayers,
  };
}
