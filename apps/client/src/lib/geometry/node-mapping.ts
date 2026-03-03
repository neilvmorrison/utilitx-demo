import type { ApiPath, ApiPathNode } from "@/lib/api-types";
import type { Node, DrawnPath } from "./types";

export interface ApiNodeToNodeFn {
  (n: ApiPathNode): Node;
}

export interface IsValidApiNodePointFn {
  (point: ApiPathNode["point"] | undefined): point is ApiPathNode["point"];
}

export interface MergePathsFn {
  (rawPaths: ApiPath[], nodeQueries: { data?: ApiPathNode[] }[]): DrawnPath[];
}

export const apiNodeToNode: ApiNodeToNodeFn = (n) => ({
  id: n.id,
  name: n.name,
  coords: [n.point.lng, n.point.lat],
  z: n.point.z,
});

export const isValidApiNodePoint: IsValidApiNodePointFn = (
  point,
): point is ApiPathNode["point"] => {
  if (!point) return false;
  return (
    Number.isFinite(point.lng) &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.z)
  );
};

export const mergePaths: MergePathsFn = (rawPaths, nodeQueries) =>
  rawPaths.map((p, i) => ({
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
