"use client";

import { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export type Layer = {
  id: string;
  name: string;
  isVisible: boolean;
  projectId: string;
};

// Kept for backward compatibility with paths stored before the project model
export const DEFAULT_LAYER_ID = "default";

const STORAGE_KEY_LAYERS = "utilitix_layers";

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>(() =>
    loadFromStorage<Layer[]>(STORAGE_KEY_LAYERS, []),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY_LAYERS, layers);
  }, [layers]);

  function getProjectLayers(projectId: string): Layer[] {
    return layers.filter((l) => l.projectId === projectId);
  }

  function createLayer(name: string, projectId: string): string {
    const id = crypto.randomUUID();
    setLayers((prev) => [...prev, { id, name, isVisible: true, projectId }]);
    return id;
  }

  function updateLayerName(id: string, name: string) {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name } : l)),
    );
  }

  function toggleLayerVisibility(id: string) {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l)),
    );
  }

  function deleteLayer(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }

  function deleteProjectLayers(projectId: string) {
    setLayers((prev) => prev.filter((l) => l.projectId !== projectId));
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
