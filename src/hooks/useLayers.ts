"use client";

import { useState, useRef, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export type Layer = {
  id: string;
  name: string;
  isVisible: boolean;
};

export const DEFAULT_LAYER_ID = "default";

const STORAGE_KEY_LAYERS = "utilitix_layers";

const DEFAULT_LAYER: Layer = {
  id: DEFAULT_LAYER_ID,
  name: "Default",
  isVisible: true,
};

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>(() => {
    const stored = loadFromStorage<Layer[]>(STORAGE_KEY_LAYERS, [DEFAULT_LAYER]);
    if (!stored.find((l) => l.id === DEFAULT_LAYER_ID)) {
      return [DEFAULT_LAYER, ...stored];
    }
    return stored;
  });

  const layersRef = useRef<Layer[]>([]);
  layersRef.current = layers;

  useEffect(() => {
    saveToStorage(STORAGE_KEY_LAYERS, layers);
  }, [layers]);

  function createLayer(name: string): string {
    const id = crypto.randomUUID();
    setLayers((prev) => [...prev, { id, name, isVisible: true }]);
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
    if (id === DEFAULT_LAYER_ID) return;
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }

  return {
    layers,
    layersRef,
    createLayer,
    updateLayerName,
    toggleLayerVisibility,
    deleteLayer,
  };
}
