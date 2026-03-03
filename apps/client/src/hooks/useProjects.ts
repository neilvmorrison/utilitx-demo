"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import type { ApiProject } from "@/lib/api-types";
import api from "@/lib/api";

export type Project = { id: string; name: string };

const STORAGE_KEY_ACTIVE_PROJECT = "utilitix_activeProjectId";

export function useProjects() {
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    () => loadFromStorage<string | null>(STORAGE_KEY_ACTIVE_PROJECT, null),
  );

  function setActiveProject(id: string | null) {
    setActiveProjectIdState(id);
    saveToStorage(STORAGE_KEY_ACTIVE_PROJECT, id);
  }

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: queryKeys.projects(),
    queryFn: async () => {
      const res = await api.get<ApiProject[]>("/projects");
      return res.data.map((p) => ({ id: p.id, name: p.name }));
    },
  });

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const createProjectMutation = useMutation({
    mutationFn: (name: string) =>
      api.post<ApiProject>("/projects", { name }).then((r) => r.data),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() });
      const snapshot = queryClient.getQueryData<Project[]>(queryKeys.projects());
      const optimistic: Project = { id: crypto.randomUUID(), name };
      queryClient.setQueryData<Project[]>(queryKeys.projects(), (old = []) => [
        ...old,
        optimistic,
      ]);
      return { snapshot, optimisticId: optimistic.id };
    },
    onSuccess: (created, _, ctx) => {
      // Replace optimistic record with server-confirmed one and update active project
      queryClient.setQueryData<Project[]>(queryKeys.projects(), (old = []) =>
        old.map((p) =>
          p.id === ctx?.optimisticId ? { id: created.id, name: created.name } : p,
        ),
      );
      // If we were tracking the optimistic id, switch to real id
      if (activeProjectId === ctx?.optimisticId) {
        setActiveProject(created.id);
      }
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.projects(), ctx.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });

  const renameProjectMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch<ApiProject>(`/projects/${id}`, { name }).then((r) => r.data),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() });
      const snapshot = queryClient.getQueryData<Project[]>(queryKeys.projects());
      queryClient.setQueryData<Project[]>(queryKeys.projects(), (old = []) =>
        old.map((p) => (p.id === id ? { ...p, name } : p)),
      );
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.projects(), ctx.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() });
      const snapshot = queryClient.getQueryData<Project[]>(queryKeys.projects());
      queryClient.setQueryData<Project[]>(queryKeys.projects(), (old = []) =>
        old.filter((p) => p.id !== id),
      );
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.projects(), ctx.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
    },
  });

  function createProject(name: string, onCreated?: (id: string) => void): string {
    const tempId = crypto.randomUUID();
    // Set active project optimistically before mutation resolves
    setActiveProject(tempId);
    createProjectMutation.mutate(name, {
      onSuccess: (created) => {
        setActiveProject(created.id);
        onCreated?.(created.id);
      },
    });
    return tempId;
  }

  function renameProject(id: string, name: string) {
    renameProjectMutation.mutate({ id, name });
  }

  function deleteProject(id: string) {
    if (activeProjectId === id) setActiveProject(null);
    deleteProjectMutation.mutate(id);
  }

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProject,
    createProject,
    renameProject,
    deleteProject,
  };
}
