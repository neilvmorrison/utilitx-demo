"use client";

import { useRef, useMemo } from "react";
import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { ApiPath, ApiPathNode } from "@/lib/api-types";
import api from "@/lib/api";
import { insertSubdivisionNode } from "@/lib/geometry-operations/subdivide-path";

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
  layerId: string;
  isHidden: boolean;
};

function apiNodeToNode(n: ApiPathNode): Node {
  return {
    id: n.id,
    name: n.name,
    coords: [n.point.lng, n.point.lat],
    z: n.point.z,
  };
}

function isValidApiNodePoint(point: ApiPathNode["point"] | undefined): point is ApiPathNode["point"] {
  if (!point) return false;
  return (
    Number.isFinite(point.lng) &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.z)
  );
}

function mergePaths(
  rawPaths: ApiPath[],
  nodeQueries: { data?: ApiPathNode[] }[],
): DrawnPath[] {
  return rawPaths.map((p, i) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    width: p.width,
    isClosed: p.isClosed,
    isHidden: p.isHidden,
    layerId: p.layerId,
    nodes: (nodeQueries[i]?.data ?? [])
      .filter((n) => isValidApiNodePoint(n.point))
      .sort((a, b) => a.position - b.position)
      .map(apiNodeToNode),
  }));
}

export function usePaths(activeProjectId: string | null) {
  const { data: rawPaths = [] } = useQuery<ApiPath[]>({
    queryKey: queryKeys.paths(activeProjectId ?? ""),
    queryFn: async () => {
      const res = await api.get<ApiPath[]>(
        `/paths?projectId=${activeProjectId}`,
      );
      return res.data;
    },
    enabled: !!activeProjectId,
  });

  const nodeQueries = useQueries({
    queries: rawPaths.map((p) => ({
      queryKey: queryKeys.pathNodes(p.id),
      queryFn: async () => {
        const res = await api.get<ApiPathNode[]>(`/path-nodes?pathId=${p.id}`);
        return res.data;
      },
    })),
  });

  const nodeQueriesKey = nodeQueries.map((q) => q.dataUpdatedAt).join("-");
  const paths = useMemo(
    () => mergePaths(rawPaths, nodeQueries),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawPaths, nodeQueriesKey],
  );

  const pathsRef = useRef<DrawnPath[]>([]);
  pathsRef.current = paths;

  // Path count for default naming (e.g. "Path 3")
  const pathCount = paths.length + 1;

  function invalidatePaths() {
    if (activeProjectId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.paths(activeProjectId),
      });
    }
  }

  function getNodePoint(pathId: string, nodeId: string) {
    const cached =
      queryClient.getQueryData<ApiPathNode[]>(queryKeys.pathNodes(pathId)) ??
      [];
    return (
      cached.find((n) => n.id === nodeId)?.point ?? { lng: 0, lat: 0, z: 0 }
    );
  }

  // ---------------------------------------------------------------------------
  // Path-level mutations
  // ---------------------------------------------------------------------------

  const batchUpdateNodesMutation = useMutation({
    mutationFn: (
      nodes: { id: string; point: { lng: number; lat: number; z: number } }[],
    ) => api.patch("/path-nodes/batch", { nodes }).then((r) => r.data),
  });

  const updatePathMutation = useMutation<
    ApiPath,
    Error,
    { id: string } & Partial<ApiPath>
  >({
    mutationFn: ({ id, ...patch }) =>
      api.patch<ApiPath>(`/paths/${id}`, patch).then((r) => r.data),
    onMutate: async ({ id, ...patch }) => {
      if (!activeProjectId) return;
      const key = queryKeys.paths(activeProjectId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<ApiPath[]>(key);
      queryClient.setQueryData<ApiPath[]>(key, (old = []) =>
        old.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      const snap = (ctx as { snapshot?: ApiPath[] } | undefined)?.snapshot;
      if (snap && activeProjectId) {
        queryClient.setQueryData(queryKeys.paths(activeProjectId), snap);
      }
    },
    onSettled: () => invalidatePaths(),
  });

  const updateNodeMutation = useMutation<
    ApiPathNode,
    Error,
    { id: string; pathId: string } & Partial<ApiPathNode>
  >({
    mutationFn: ({ id, pathId: _pathId, ...patch }) =>
      api.patch<ApiPathNode>(`/path-nodes/${id}`, patch).then((r) => r.data),
    onMutate: async ({ id, pathId, ...patch }) => {
      const key = queryKeys.pathNodes(pathId);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<ApiPathNode[]>(key);
      queryClient.setQueryData<ApiPathNode[]>(key, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      );
      return { snapshot, pathId };
    },
    onError: (_, vars, ctx) => {
      const snap = (ctx as { snapshot?: ApiPathNode[] } | undefined)?.snapshot;
      if (snap) {
        queryClient.setQueryData(queryKeys.pathNodes(vars.pathId), snap);
      }
    },
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pathNodes(vars.pathId),
      });
    },
  });

  // ---------------------------------------------------------------------------
  // Public API — same shape as the old localStorage hook
  // ---------------------------------------------------------------------------

  async function createPath(
    nodes: Node[],
    opts: {
      name: string;
      color: string;
      width: number;
      isClosed: boolean;
      layerId: string;
    },
  ) {
    const tempId = crypto.randomUUID();

    // Optimistic: add path + empty nodes immediately
    if (activeProjectId) {
      const now = new Date().toISOString();
      queryClient.setQueryData<ApiPath[]>(
        queryKeys.paths(activeProjectId),
        (old = []) => [
          ...old,
          {
            id: tempId,
            ...opts,
            isHidden: false,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          },
        ],
      );
      queryClient.setQueryData<ApiPathNode[]>(queryKeys.pathNodes(tempId), []);
    }

    try {
      const created = await api
        .post<ApiPath>("/paths", {
          name: opts.name,
          layerId: opts.layerId,
          color: opts.color,
          width: opts.width,
          isClosed: opts.isClosed,
        })
        .then((r) => r.data);

      const apiNodes = nodes.map((n, i) => ({
        name: n.name,
        position: i,
        pathId: created.id,
        point: { lng: n.coords[0], lat: n.coords[1], z: n.z },
      }));

      const createdNodes = await api
        .post<ApiPathNode[]>("/path-nodes/batch", { nodes: apiNodes })
        .then((r) => r.data);

      // Replace optimistic entry with confirmed server data
      if (activeProjectId) {
        queryClient.setQueryData<ApiPath[]>(
          queryKeys.paths(activeProjectId),
          (old = []) =>
            old.map((p) => (p.id === tempId ? created : p)),
        );
        queryClient.setQueryData<ApiPathNode[]>(
          queryKeys.pathNodes(created.id),
          createdNodes,
        );
        // Clean up the temp-id node cache
        if (tempId !== created.id) {
          queryClient.removeQueries({
            queryKey: queryKeys.pathNodes(tempId),
          });
        }
      }
    } catch {
      // Roll back optimistic update on failure
      if (activeProjectId) {
        queryClient.setQueryData<ApiPath[]>(
          queryKeys.paths(activeProjectId),
          (old = []) => old.filter((p) => p.id !== tempId),
        );
        queryClient.removeQueries({ queryKey: queryKeys.pathNodes(tempId) });
      }
    }
  }

  async function extendPath(
    pathId: string,
    newNodes: Node[],
    isClosed: boolean,
  ) {
    const existingNodes =
      queryClient.getQueryData<ApiPathNode[]>(queryKeys.pathNodes(pathId)) ??
      [];
    const startPosition = existingNodes.length;
    const now = new Date().toISOString();

    const apiNodes = newNodes.map((n, i) => ({
      name: n.name,
      position: startPosition + i,
      pathId,
      point: { lng: n.coords[0], lat: n.coords[1], z: n.z },
    }));

    // Optimistic: append nodes with temp IDs
    const tempNodes: ApiPathNode[] = apiNodes.map((n) => ({
      ...n,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    queryClient.setQueryData<ApiPathNode[]>(
      queryKeys.pathNodes(pathId),
      (old = []) => [...old, ...tempNodes],
    );

    if (isClosed && activeProjectId) {
      queryClient.setQueryData<ApiPath[]>(
        queryKeys.paths(activeProjectId),
        (old = []) =>
          old.map((p) => (p.id === pathId ? { ...p, isClosed: true } : p)),
      );
    }

    try {
      const created = await api
        .post<ApiPathNode[]>("/path-nodes/batch", { nodes: apiNodes })
        .then((r) => r.data);

      // Replace temp nodes with server-confirmed ones
      queryClient.setQueryData<ApiPathNode[]>(
        queryKeys.pathNodes(pathId),
        (old = []) => [
          ...old.filter((n) => !tempNodes.some((t) => t.id === n.id)),
          ...created,
        ],
      );

      if (isClosed) {
        await api.patch(`/paths/${pathId}`, { isClosed: true });
        invalidatePaths();
      }
    } catch {
      queryClient.invalidateQueries({ queryKey: queryKeys.pathNodes(pathId) });
    }
  }

  function updatePathName(id: string, name: string) {
    updatePathMutation.mutate({ id, name } as Parameters<
      typeof updatePathMutation.mutate
    >[0]);
  }

  function updatePathColor(id: string, color: string) {
    updatePathMutation.mutate({ id, color } as Parameters<
      typeof updatePathMutation.mutate
    >[0]);
  }

  function updatePathWidth(id: string, width: number) {
    const clamped = Math.max(1, Math.min(20, width));
    updatePathMutation.mutate({ id, width: clamped } as Parameters<
      typeof updatePathMutation.mutate
    >[0]);
  }

  function togglePathVisibility(id: string) {
    const path = pathsRef.current.find((p) => p.id === id);
    if (!path) return;
    updatePathMutation.mutate({ id, isHidden: !path.isHidden } as Parameters<
      typeof updatePathMutation.mutate
    >[0]);
  }

  function updateNodeName(pathId: string, nodeId: string, name: string) {
    updateNodeMutation.mutate({ id: nodeId, pathId, name } as Parameters<
      typeof updateNodeMutation.mutate
    >[0]);
  }

  function updateNodeZ(pathId: string, nodeId: string, z: number) {
    const point = { ...getNodePoint(pathId, nodeId), z };
    updateNodeMutation.mutate({ id: nodeId, pathId, point } as Parameters<
      typeof updateNodeMutation.mutate
    >[0]);
  }

  function deletePath(id: string) {
    if (activeProjectId) {
      queryClient.setQueryData<ApiPath[]>(
        queryKeys.paths(activeProjectId),
        (old = []) => old.filter((p) => p.id !== id),
      );
    }
    api.delete(`/paths/${id}`).catch(() => invalidatePaths());
  }

  function removeNodes(pathId: string, nodeIds: Set<string>) {
    const nodes =
      queryClient.getQueryData<ApiPathNode[]>(queryKeys.pathNodes(pathId)) ??
      [];
    const remaining = nodes.filter((n) => !nodeIds.has(n.id));

    if (remaining.length < 2) {
      deletePath(pathId);
      return;
    }

    // Optimistic
    queryClient.setQueryData<ApiPathNode[]>(
      queryKeys.pathNodes(pathId),
      remaining,
    );
    if (activeProjectId) {
      queryClient.setQueryData<ApiPath[]>(
        queryKeys.paths(activeProjectId),
        (old = []) =>
          old.map((p) =>
            p.id === pathId
              ? { ...p, isClosed: p.isClosed && remaining.length >= 3 }
              : p,
          ),
      );
    }

    Promise.all([...nodeIds].map((nid) => api.delete(`/path-nodes/${nid}`))).catch(
      () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pathNodes(pathId),
        });
      },
    );
  }

  // Called on every onDrag frame — updates React Query cache only, no API call.
  function dragNodes(
    pathId: string,
    startCoords: Map<string, [number, number]>,
    dx: number,
    dy: number,
  ) {
    queryClient.setQueryData<ApiPathNode[]>(
      queryKeys.pathNodes(pathId),
      (old = []) =>
        old.map((n) => {
          const start = startCoords.get(n.id);
          if (!start) return n;
          return {
            ...n,
            point: { ...n.point, lng: start[0] + dx, lat: start[1] + dy },
          };
        }),
    );
  }

  // Call from onDragEnd to persist the final node positions to the server.
  function persistDraggedNodes(pathId: string) {
    const nodes =
      queryClient.getQueryData<ApiPathNode[]>(queryKeys.pathNodes(pathId)) ??
      [];
    if (nodes.length === 0) return;
    batchUpdateNodesMutation.mutate(
      nodes.map((n) => ({ id: n.id, point: n.point })),
    );
  }

  async function subdivideEdge(
    pathId: string,
    nodeId1: string,
    nodeId2: string,
  ) {
    const path = pathsRef.current.find((p) => p.id === pathId);
    if (!path) return;

    const updated = insertSubdivisionNode(path, nodeId1, nodeId2);
    const serverNodes =
      queryClient.getQueryData<ApiPathNode[]>(queryKeys.pathNodes(pathId)) ??
      [];
    const now = new Date().toISOString();

    // Optimistic: show updated node order immediately
    queryClient.setQueryData<ApiPathNode[]>(
      queryKeys.pathNodes(pathId),
      updated.nodes.map((n, i) => {
        const existing = serverNodes.find((s) => s.id === n.id);
        return existing
          ? { ...existing, position: i }
          : {
              id: n.id,
              name: n.name,
              position: i,
              pathId,
              point: { lng: n.coords[0], lat: n.coords[1], z: n.z },
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            };
      }),
    );

    try {
      // Delete all existing server nodes, then re-create in correct order
      // (avoids unique constraint issues with position reordering)
      await Promise.all(serverNodes.map((n) => api.delete(`/path-nodes/${n.id}`)));
      await api.post("/path-nodes/batch", {
        nodes: updated.nodes.map((n, i) => ({
          name: n.name,
          position: i,
          pathId,
          point: { lng: n.coords[0], lat: n.coords[1], z: n.z },
        })),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.pathNodes(pathId) });
    } catch {
      queryClient.invalidateQueries({ queryKey: queryKeys.pathNodes(pathId) });
    }
  }

  function movePathsToLayer(fromLayerId: string, toLayerId: string) {
    if (!activeProjectId) return;
    const toMove = pathsRef.current.filter((p) => p.layerId === fromLayerId);

    queryClient.setQueryData<ApiPath[]>(
      queryKeys.paths(activeProjectId),
      (old = []) =>
        old.map((p) =>
          p.layerId === fromLayerId ? { ...p, layerId: toLayerId } : p,
        ),
    );

    Promise.all(
      toMove.map((p) => api.patch(`/paths/${p.id}`, { layerId: toLayerId })),
    ).catch(() => invalidatePaths());
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
    persistDraggedNodes,
    subdivideEdge,
    togglePathVisibility,
    movePathsToLayer,
  };
}
