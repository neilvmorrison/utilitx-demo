import type { Node, DrawnPath } from "@/hooks/usePaths";

/**
 * Returns true if the two nodes form an edge in the path — i.e. they are
 * consecutive in the nodes array, or (for closed paths) one is the first node
 * and the other is the last.
 */
export function areNodesAdjacent(
  path: DrawnPath,
  nodeId1: string,
  nodeId2: string,
): boolean {
  const indexA = path.nodes.findIndex((n) => n.id === nodeId1);
  const indexB = path.nodes.findIndex((n) => n.id === nodeId2);
  if (indexA === -1 || indexB === -1 || indexA === indexB) return false;
  const diff = Math.abs(indexA - indexB);
  if (diff === 1) return true;
  if (path.isClosed && diff === path.nodes.length - 1) return true;
  return false;
}

/**
 * Computes the geographic midpoint between two nodes. Returns a new Node with
 * a fresh id; the caller is responsible for inserting it into a path.
 */
export function computeMidpointNode(node1: Node, node2: Node): Node {
  return {
    id: crypto.randomUUID(),
    name: "",
    coords: [
      (node1.coords[0] + node2.coords[0]) / 2,
      (node1.coords[1] + node2.coords[1]) / 2,
    ],
    z: (node1.z + node2.z) / 2,
  };
}

/**
 * Returns a new DrawnPath with a midpoint node inserted between nodeId1 and
 * nodeId2. The two nodes must be adjacent (share an edge). If they are not
 * adjacent the original path is returned unchanged.
 */
export function insertSubdivisionNode(
  path: DrawnPath,
  nodeId1: string,
  nodeId2: string,
): DrawnPath {
  const indexA = path.nodes.findIndex((n) => n.id === nodeId1);
  const indexB = path.nodes.findIndex((n) => n.id === nodeId2);
  if (indexA === -1 || indexB === -1 || indexA === indexB) return path;

  const diff = Math.abs(indexA - indexB);
  const isSequential = diff === 1;
  const isWraparound = path.isClosed && diff === path.nodes.length - 1;

  if (!isSequential && !isWraparound) return path;

  const midpoint = computeMidpointNode(path.nodes[indexA], path.nodes[indexB]);
  const newNodes = [...path.nodes];

  if (isWraparound) {
    // Edge between last node and first node — append midpoint at end so it
    // sits geometrically between last and first in the closed ring.
    newNodes.push(midpoint);
  } else {
    // Sequential edge — insert after the earlier of the two indices.
    const insertAt = Math.min(indexA, indexB) + 1;
    newNodes.splice(insertAt, 0, midpoint);
  }

  return { ...path, nodes: newNodes };
}
