"use client";

import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export type Project = { id: string; name: string };

const STORAGE_KEY_PROJECTS = "utilitix_projects";
const STORAGE_KEY_ACTIVE_PROJECT = "utilitix_activeProjectId";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage<Project[]>(STORAGE_KEY_PROJECTS, []),
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEY_ACTIVE_PROJECT, null),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY_PROJECTS, projects);
  }, [projects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_ACTIVE_PROJECT, activeProjectId);
  }, [activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  function createProject(name: string): string {
    const id = crypto.randomUUID();
    setProjects((prev) => [...prev, { id, name }]);
    setActiveProjectId(id);
    return id;
  }

  function renameProject(id: string, name: string) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveProjectId((prev) => (prev === id ? null : prev));
  }

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProject: setActiveProjectId,
    createProject,
    renameProject,
    deleteProject,
  };
}
