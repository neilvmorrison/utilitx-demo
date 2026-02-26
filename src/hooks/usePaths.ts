import { useState, useRef, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export type Node = {
  id: string;
  name: string;
  coords: [number, number];
  z: number;
};

export type DrawnPath = {
  id: string;
  name: string;
  nodes: Node[];
  color: string;
  width: number;
  isClosed: boolean;
};

const STORAGE_KEY_PATHS = "utilitix_paths";
const STORAGE_KEY_PATH_COUNT = "utilitix_pathCount";

export function usePaths() {
  const [paths, setPaths] = useState<DrawnPath[]>(() =>
    loadFromStorage<DrawnPath[]>(STORAGE_KEY_PATHS, []),
  );
  const [pathCount, setPathCount] = useState<number>(() =>
    loadFromStorage<number>(STORAGE_KEY_PATH_COUNT, 1),
  );
  // Ref kept in sync so drag/keyboard callbacks can read the latest paths
  // without capturing stale closures
  const pathsRef = useRef<DrawnPath[]>([]);
  pathsRef.current = paths;

  useEffect(() => {
    saveToStorage(STORAGE_KEY_PATHS, paths);
  }, [paths]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_PATH_COUNT, pathCount);
  }, [pathCount]);

  function createPath(
    nodes: Node[],
    opts: { name: string; color: string; width: number; isClosed: boolean },
  ) {
    setPaths((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...opts, nodes },
    ]);
    setPathCount((n) => n + 1);
  }

  // Append newNodes to an existing path, optionally marking it closed.
  // Pass extraCoord to snap-append a final node before finishing.
  function extendPath(pathId: string, newNodes: Node[], isClosed: boolean) {
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id !== pathId) return p;
        const allNodes = [...p.nodes, ...newNodes];
        return {
          ...p,
          nodes: allNodes,
          isClosed: isClosed && allNodes.length >= 3,
        };
      }),
    );
  }

  function updatePathName(id: string, name: string) {
    setPaths((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function updatePathColor(id: string, color: string) {
    setPaths((prev) => prev.map((p) => (p.id === id ? { ...p, color } : p)));
  }

  function updatePathWidth(id: string, width: number) {
    const clamped = Math.max(1, Math.min(20, width));
    setPaths((prev) =>
      prev.map((p) => (p.id === id ? { ...p, width: clamped } : p)),
    );
  }

  function updateNodeName(pathId: string, nodeId: string, name: string) {
    setPaths((prev) =>
      prev.map((p) =>
        p.id !== pathId
          ? p
          : {
              ...p,
              nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, name } : n)),
            },
      ),
    );
  }

  function updateNodeZ(pathId: string, nodeId: string, z: number) {
    setPaths((prev) =>
      prev.map((p) =>
        p.id !== pathId
          ? p
          : {
              ...p,
              nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, z } : n)),
            },
      ),
    );
  }

  function deletePath(id: string) {
    setPaths((prev) => prev.filter((p) => p.id !== id));
  }

  // Remove the given nodeIds from a path; deletes the path entirely if fewer
  // than 2 nodes would remain.
  function removeNodes(pathId: string, nodeIds: Set<string>) {
    setPaths((prev) => {
      const path = prev.find((p) => p.id === pathId);
      if (!path) return prev;
      const newNodes = path.nodes.filter((n) => !nodeIds.has(n.id));
      if (newNodes.length < 2) return prev.filter((p) => p.id !== pathId);
      const isClosed = path.isClosed && newNodes.length >= 3;
      return prev.map((p) =>
        p.id === pathId ? { ...p, nodes: newNodes, isClosed } : p,
      );
    });
  }

  // Move nodes by applying startCoords + (dx, dy). Called on every onDrag
  // frame; startCoords is snapshotted at drag start to avoid drift.
  function dragNodes(
    pathId: string,
    startCoords: Map<string, [number, number]>,
    dx: number,
    dy: number,
  ) {
    setPaths((prev) =>
      prev.map((p) => {
        if (p.id !== pathId) return p;
        return {
          ...p,
          nodes: p.nodes.map((n) => {
            const start = startCoords.get(n.id);
            if (!start) return n;
            return {
              ...n,
              coords: [start[0] + dx, start[1] + dy] as [number, number],
            };
          }),
        };
      }),
    );
  }

  return {
    paths,
    pathsRef,
    pathCount,
    createPath,
    extendPath,
    updatePathName,
    updatePathColor,
    updatePathWidth,
    updateNodeName,
    updateNodeZ,
    deletePath,
    removeNodes,
    dragNodes,
  };
}
